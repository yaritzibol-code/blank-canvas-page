/**
 * Sesión de voz de la entrevista RTARI (WebRTC contra la API Realtime).
 *
 * Cómo funciona:
 *  1. `/api/rtari/session` acuña una credencial efímera con las instrucciones
 *     del sinodal ya dentro (el navegador nunca ve la llave del proyecto);
 *  2. se pide el micrófono y se abre una conexión WebRTC directa con OpenAI:
 *     el audio va y viene por el canal de medios, sin pasar por el servidor;
 *  3. los eventos (transcripciones, turnos, errores) viajan por el canal de
 *     datos `oai-events`, y de ahí sale la transcripción que después se evalúa.
 *
 * La transcripción se arma con dos fuentes distintas: lo que dice el sinodal
 * llega como texto del propio modelo, y lo que dice el alumno lo transcribe el
 * reconocimiento de voz configurado en la sesión.
 */
import { supabase } from "@/integrations/supabase/client";
import { RTARI_MAX_MINUTOS, type RtariNivel, type RtariVoice } from "@/modules/rtari/config";

export type RtariEstado =
  "inactiva" | "conectando" | "en_curso" | "terminando" | "terminada" | "error";

export interface RtariTurn {
  role: "examiner" | "candidate";
  text: string;
  /** ms desde el inicio de la entrevista. */
  at: number;
}

export type RtariErrorCode =
  "sin_sesion" | "requiere_pro" | "limite_diario" | "sin_configurar" | "micro" | "red" | "openai";

export class RtariError extends Error {
  code: RtariErrorCode;
  /** Datos extra del servidor (p. ej. cuántas sesiones lleva hoy). */
  detail?: Record<string, unknown>;

  constructor(code: RtariErrorCode, message: string, detail?: Record<string, unknown>) {
    super(message);
    this.name = "RtariError";
    this.code = code;
    if (detail) this.detail = detail;
  }
}

export interface RtariCallbacks {
  /** Un turno completo (del sinodal o del alumno) entró a la transcripción. */
  onTurn: (turn: RtariTurn) => void;
  /** Texto parcial del sinodal, para que la UI muestre lo que va diciendo. */
  onExaminerPartial?: (text: string) => void;
  /** El sinodal empezó o dejó de hablar. */
  onSpeaking?: (speaking: boolean) => void;
  onEstado?: (estado: RtariEstado) => void;
  onError?: (err: RtariError) => void;
}

export interface RtariStartOptions {
  questionIds: string[];
  voice: RtariVoice;
  nivel: RtariNivel;
}

/** Nivel de voz del micrófono (0-1) para pintar el indicador. */
export type LevelListener = (level: number) => void;

interface SessionResponse {
  value: string;
  expiresAt: number | null;
  model: string;
  restantes: number;
}

export class RtariRealtimeSession {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private mic: MediaStream | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private rafId: number | null = null;
  private cutoffTimer: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  private estado: RtariEstado = "inactiva";
  private parciales = new Map<string, string>();
  private cb: RtariCallbacks;
  private levelListener: LevelListener | null = null;
  /** Sesiones que le quedan hoy, según el servidor. */
  restantes: number | null = null;

  constructor(cb: RtariCallbacks) {
    this.cb = cb;
  }

  getEstado(): RtariEstado {
    return this.estado;
  }

  /** ms transcurridos desde que arrancó la entrevista. */
  elapsed(): number {
    return this.startedAt === 0 ? 0 : Date.now() - this.startedAt;
  }

  onLevel(fn: LevelListener | null) {
    this.levelListener = fn;
    // Si la UI se suscribe con la entrevista ya andando, el medidor arranca
    // aquí: así el orden de las llamadas deja de importar.
    if (fn && this.mic && this.rafId === null) this.watchLevel(this.mic);
  }

  private setEstado(e: RtariEstado) {
    if (this.estado === e) return;
    this.estado = e;
    this.cb.onEstado?.(e);
  }

  private fail(err: RtariError): never {
    this.setEstado("error");
    this.cb.onError?.(err);
    this.stop();
    throw err;
  }

  /** Abre la entrevista. Resuelve cuando el sinodal ya puede oír al alumno. */
  async start(opts: RtariStartOptions): Promise<void> {
    if (this.estado === "conectando" || this.estado === "en_curso") return;
    this.setEstado("conectando");

    const secret = await this.mintSecret(opts);

    // El micrófono se pide después de la credencial: si el usuario no es Pro o
    // ya agotó sus sesiones, no tiene sentido molestarlo con el permiso.
    let mic: MediaStream;
    try {
      mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      this.fail(
        new RtariError(
          "micro",
          "No pude usar tu micrófono. Revisa el permiso del navegador y vuelve a intentarlo.",
        ),
      );
    }
    this.mic = mic;
    this.watchLevel(mic);

    const pc = new RTCPeerConnection();
    this.pc = pc;

    // Voz del sinodal.
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    this.audioEl = audioEl;
    pc.ontrack = (e) => {
      audioEl.srcObject = e.streams[0] ?? null;
    };

    const track = mic.getAudioTracks()[0];
    if (track) pc.addTrack(track, mic);

    const dc = pc.createDataChannel("oai-events");
    this.dc = dc;
    dc.addEventListener("message", (e) => this.onEvent(e.data as string));

    pc.addEventListener("connectionstatechange", () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        if (this.estado === "en_curso") {
          this.cb.onError?.(new RtariError("red", "Se cortó la conexión con el sinodal."));
          this.setEstado("terminada");
          this.stop();
        }
      }
    });

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const res = await fetch(
        `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(secret.model)}`,
        {
          method: "POST",
          body: offer.sdp ?? "",
          headers: {
            Authorization: `Bearer ${secret.value}`,
            "Content-Type": "application/sdp",
          },
        },
      );
      if (!res.ok) {
        this.fail(new RtariError("openai", `OpenAI rechazó la conexión (${res.status}).`));
      }
      await pc.setRemoteDescription({ type: "answer", sdp: await res.text() });
    } catch (err) {
      if (err instanceof RtariError) throw err;
      this.fail(new RtariError("red", "No pude abrir la sesión de voz. Revisa tu conexión."));
    }

    this.startedAt = Date.now();
    this.setEstado("en_curso");

    // Corte duro: una sesión olvidada abierta sigue consumiendo audio.
    this.cutoffTimer = setTimeout(() => {
      if (this.estado === "en_curso") this.finish();
    }, RTARI_MAX_MINUTOS * 60_000);

    // El sinodal abre la entrevista en cuanto el canal está listo.
    if (dc.readyState === "open") this.send({ type: "response.create" });
    else dc.addEventListener("open", () => this.send({ type: "response.create" }), { once: true });
  }

  /** Pide la credencial efímera a nuestro servidor. */
  private async mintSecret(opts: RtariStartOptions): Promise<SessionResponse> {
    let token: string | undefined;
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    } catch {
      token = undefined;
    }
    if (!token) {
      this.fail(
        new RtariError("sin_sesion", "Vuelve a iniciar sesión para practicar la entrevista."),
      );
    }

    let res: Response;
    try {
      res = await fetch("/api/rtari/session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(opts),
      });
    } catch {
      this.fail(new RtariError("red", "No pude contactar al servidor. Revisa tu conexión."));
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      const code = String(body.error ?? "");
      if (res.status === 402 || code === "requiere_pro") {
        this.fail(
          new RtariError("requiere_pro", "La entrevista por voz es parte de FlightPath Pro."),
        );
      }
      if (res.status === 429 || code === "limite_diario") {
        this.fail(
          new RtariError(
            "limite_diario",
            `Ya hiciste tus ${body.limite ?? ""} entrevistas de hoy. Vuelve mañana con la cabeza fresca.`.replace(
              "  ",
              " ",
            ),
            body,
          ),
        );
      }
      if (res.status === 503 || code === "sin_configurar") {
        this.fail(
          new RtariError(
            "sin_configurar",
            "La entrevista por voz aún no está configurada en el servidor.",
          ),
        );
      }
      this.fail(new RtariError("openai", "No pude preparar la entrevista. Inténtalo de nuevo."));
    }

    const data = (await res.json()) as SessionResponse;
    this.restantes = typeof data.restantes === "number" ? data.restantes : null;
    return data;
  }

  private send(payload: Record<string, unknown>) {
    if (this.dc?.readyState === "open") this.dc.send(JSON.stringify(payload));
  }

  /** Pide al sinodal que repita la pregunta (sin sacarlo de su guion). */
  repetir() {
    if (this.estado !== "en_curso") return;
    this.send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "Could you repeat the question, please?" }],
      },
    });
    this.send({ type: "response.create" });
  }

  /** Silencia o reactiva el micrófono sin cerrar la sesión. */
  setMuted(muted: boolean) {
    this.mic?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }

  /** Cierra la entrevista de forma ordenada (el debrief lo pide la UI). */
  finish() {
    if (this.estado !== "en_curso") return;
    this.setEstado("terminando");
    this.stop();
    this.setEstado("terminada");
  }

  /** Libera micrófono, conexión y temporizadores. Es idempotente. */
  stop() {
    if (this.cutoffTimer) {
      clearTimeout(this.cutoffTimer);
      this.cutoffTimer = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.levelListener?.(0);
    try {
      this.dc?.close();
    } catch {
      /* el canal ya estaba cerrado */
    }
    this.dc = null;
    try {
      this.pc?.close();
    } catch {
      /* la conexión ya estaba cerrada */
    }
    this.pc = null;
    this.mic?.getTracks().forEach((t) => t.stop());
    this.mic = null;
    if (this.audioEl) {
      this.audioEl.srcObject = null;
      this.audioEl = null;
    }
    void this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
  }

  /* ── Eventos del canal de datos ── */

  private onEvent(raw: string) {
    let evt: Record<string, unknown>;
    try {
      evt = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }
    const type = String(evt.type ?? "");

    // Texto del sinodal, según se genera. El nombre del evento cambió entre
    // versiones de la API; se aceptan los dos para no depender de eso.
    if (
      type === "response.output_audio_transcript.delta" ||
      type === "response.audio_transcript.delta"
    ) {
      const id = String(evt.item_id ?? evt.response_id ?? "actual");
      const next = (this.parciales.get(id) ?? "") + String(evt.delta ?? "");
      this.parciales.set(id, next);
      this.cb.onExaminerPartial?.(next);
      this.cb.onSpeaking?.(true);
      return;
    }

    if (
      type === "response.output_audio_transcript.done" ||
      type === "response.audio_transcript.done"
    ) {
      const id = String(evt.item_id ?? evt.response_id ?? "actual");
      const text = String(evt.transcript ?? this.parciales.get(id) ?? "").trim();
      this.parciales.delete(id);
      if (text) this.cb.onTurn({ role: "examiner", text, at: this.elapsed() });
      this.cb.onExaminerPartial?.("");
      return;
    }

    if (type === "response.done" || type === "output_audio_buffer.stopped") {
      this.cb.onSpeaking?.(false);
      return;
    }

    // Lo que dijo el alumno, ya transcrito.
    if (type === "conversation.item.input_audio_transcription.completed") {
      const text = String(evt.transcript ?? "").trim();
      if (text) this.cb.onTurn({ role: "candidate", text, at: this.elapsed() });
      return;
    }

    if (type === "error") {
      const err = (evt.error ?? {}) as { message?: string };
      this.cb.onError?.(
        new RtariError("openai", err.message ?? "El sinodal reportó un error de sesión."),
      );
    }
  }

  /* ── Indicador de nivel de micrófono ── */

  private watchLevel(stream: MediaStream) {
    if (!this.levelListener) return;
    try {
      const Ctx: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      this.audioCtx = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const x = ((buf[i] ?? 128) - 128) / 128;
          sum += x * x;
        }
        // RMS escalado: con voz normal el indicador llega cerca del tope.
        this.levelListener?.(Math.min(1, Math.sqrt(sum / buf.length) * 4));
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    } catch {
      /* sin medidor: la entrevista funciona igual */
    }
  }
}

/** ¿El navegador puede sostener la entrevista por voz? */
export function soportaEntrevista(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof RTCPeerConnection !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
}
