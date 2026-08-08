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
import { EMPTY_REALTIME_USAGE, type RealtimeUsage } from "@/lib/ai-cost";
import { RTARI_MAX_MINUTOS, type RtariNivel, type RtariVoice } from "@/modules/rtari/config";

/** Cuánto se espera la transcripción del alumno antes de seguir sin ella. */
const ESPERA_TRANSCRIPCION_MS = 12_000;

export type RtariEstado =
  "inactiva" | "conectando" | "en_curso" | "terminando" | "terminada" | "error";

export interface RtariTurn {
  role: "examiner" | "candidate";
  text: string;
  /** ms desde el inicio de la entrevista. */
  at: number;
}

export type RtariErrorCode =
  "sin_sesion" | "requiere_pro" | "sin_minutos" | "sin_configurar" | "micro" | "red" | "openai";

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

/**
 * La entrevista en curso en esta pestaña, si la hay.
 *
 * Vive en el módulo y no en la clase porque lo que se quiere impedir es que
 * dos INSTANCIAS distintas estén sonando a la vez.
 */
let sesionViva: RtariRealtimeSession | null = null;

/** Deja a `sesion` como la única entrevista viva, cerrando la anterior. */
function tomarElTurno(sesion: RtariRealtimeSession) {
  if (sesionViva && sesionViva !== sesion) sesionViva.stop();
  sesionViva = sesion;
}

function soltarElTurno(sesion: RtariRealtimeSession) {
  if (sesionViva === sesion) sesionViva = null;
}

interface SessionResponse {
  value: string;
  expiresAt: number | null;
  model: string;
  /** Id con el que el servidor reservó los minutos; vuelve en la liquidación. */
  sessionId: string;
  /** Cuánto puede durar ESTA entrevista según el saldo del alumno. */
  maxMinutos: number;
}

/** Lo que hay que liquidar al colgar: duración real y consumo reportado. */
export interface RtariCierre {
  sessionId: string;
  model: string;
  durationSec: number;
  usage: RealtimeUsage;
}

export class RtariRealtimeSession {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private mic: MediaStream | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private rafId: number | null = null;
  /* ── Grabación de la entrevista (para auditoría) ── */
  private recCtx: AudioContext | null = null;
  private recorder: MediaRecorder | null = null;
  private recChunks: Blob[] = [];
  private recDone: Promise<Blob | null> | null = null;
  private cutoffTimer: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  private estado: RtariEstado = "inactiva";
  private parciales = new Map<string, string>();
  private cb: RtariCallbacks;
  private levelListener: LevelListener | null = null;
  /** Consumo acumulado que reporta la API en cada `response.done`. */
  private usage: RealtimeUsage = { ...EMPTY_REALTIME_USAGE };
  private sessionId = "";
  private model = "";
  /** Ya se entregó el cierre a quien va a liquidar esta sesión. */
  private liquidada = false;
  /**
   * El sinodal tiene una respuesta en curso.
   *
   * La API Realtime no serializa las respuestas: si se le pide una segunda
   * mientras la primera sigue, genera las dos y el alumno oye dos voces
   * encimadas. Esta bandera es lo que garantiza que sólo haya una.
   */
  private respuestaEnCurso = false;
  /**
   * Cola de turnos para que la transcripción salga en el orden real.
   *
   * Lo que dice el sinodal llega casi al instante, pero lo que dijo el alumno
   * tarda: Whisper transcribe cuando el turno ya se cerró. Si cada turno se
   * pinta al llegar, la pantalla muestra "sinodal, sinodal, alumno" y parece
   * que el examinador habló dos veces. Aquí se aparta el lugar del alumno en
   * cuanto se corta su audio y los turnos posteriores esperan a que llegue su
   * texto (o a que se agote la espera).
   */
  private cola: Array<{ itemId?: string; turn: RtariTurn | null; desde: number }> = [];
  private colaTimer: ReturnType<typeof setTimeout> | null = null;
  /** Se pidió repetir mientras hablaba: se dispara al confirmarse el corte. */
  private repeticionPendiente = false;
  /**
   * Entró un `stop()` mientras `start()` seguía trabajando.
   *
   * `start()` tiene cuatro esperas (credencial, micrófono, oferta, respuesta
   * SDP) y cerrar la sesión durante cualquiera de ellas no detenía nada: al
   * volver de la espera seguía conectándose. Así es como acababan dos
   * sinodales hablando encima, cada uno con su propia transcripción.
   */
  private cancelada = false;
  /** Minutos que el servidor reservó para esta entrevista. */
  maxMinutos = 0;

  constructor(cb: RtariCallbacks) {
    this.cb = cb;
  }

  /**
   * Datos para liquidar la sesión: cuánto duró y cuánto consumió.
   *
   * El consumo lo reporta la propia API por el canal de datos, así que sirve
   * para saber el costo real —no para cobrar—: quien cobra es el servidor, con
   * los minutos que reservó por adelantado.
   */
  cierre(): RtariCierre {
    return {
      sessionId: this.sessionId,
      model: this.model,
      durationSec: Math.round(this.elapsed() / 1000),
      usage: { ...this.usage },
    };
  }

  /**
   * Igual que `cierre()`, pero sólo la PRIMERA vez; después devuelve `null`.
   *
   * La entrevista puede terminar por dos caminos —el botón de terminar y la
   * limpieza al desmontar— y ambos quieren liquidar. Que el permiso lo dé la
   * sesión, y una sola vez, evita que el mismo consumo se bitacorice dos veces
   * y que se devuelvan minutos por duplicado.
   */
  tomarCierre(): RtariCierre | null {
    if (this.liquidada || !this.sessionId) return null;
    this.liquidada = true;
    return this.cierre();
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
    this.cancelada = false;
    this.setEstado("conectando");

    // Sólo puede haber una entrevista a la vez. Si quedó una viva —una pestaña
    // que no terminó de limpiar, un montaje repetido del componente— se cierra
    // aquí: dos sesiones abiertas significan dos sinodales hablando encima y el
    // doble de minutos consumidos.
    tomarElTurno(this);

    const secret = await this.mintSecret(opts);
    this.sessionId = secret.sessionId;
    this.model = secret.model;
    this.maxMinutos = secret.maxMinutos;
    // A partir de aquí ya hay minutos reservados: si la sesión se canceló
    // durante la espera hay que soltarlos, no sólo dejar de conectarse.
    if (this.cancelada) return this.abortar();

    // El micrófono se pide después de la credencial: si el usuario no es Pro o
    // se quedó sin minutos, no tiene sentido molestarlo con el permiso.
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
    if (this.cancelada) {
      mic.getTracks().forEach((t) => t.stop());
      return this.abortar();
    }
    this.mic = mic;
    this.watchLevel(mic);

    const pc = new RTCPeerConnection();
    this.pc = pc;

    // Voz del sinodal.
    //
    // El elemento va colgado del DOM, aunque no se vea: un `<audio>` suelto
    // reproduce, pero queda fuera de lo que el navegador considera su salida
    // de audio, y la cancelación de eco del micrófono deja de reconocer esa
    // voz como propia. Resultado: el micro se oye a sí mismo y el detector de
    // silencios cree que el alumno habló.
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    audioEl.setAttribute("playsinline", "");
    audioEl.style.display = "none";
    document.body.appendChild(audioEl);
    this.audioEl = audioEl;
    pc.ontrack = (e) => {
      const remoto = e.streams[0] ?? null;
      audioEl.srcObject = remoto;
      // Se graba la mezcla (alumno + sinodal) para que la entrevista pueda
      // escucharse después en la auditoría del panel.
      if (remoto) this.startRecording(mic, remoto);
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
      const answer = await res.text();
      // Última oportunidad de no conectar: pasado este punto ya hay audio.
      if (this.cancelada) return this.abortar();
      await pc.setRemoteDescription({ type: "answer", sdp: answer });
    } catch (err) {
      if (err instanceof RtariError) throw err;
      this.fail(new RtariError("red", "No pude abrir la sesión de voz. Revisa tu conexión."));
    }

    if (this.cancelada) return this.abortar();

    this.startedAt = Date.now();
    this.setEstado("en_curso");

    // Corte duro a los minutos que el servidor reservó: pasado ese punto el
    // alumno ya no tiene saldo y la sesión sólo seguiría generando costo.
    const tope = Math.min(this.maxMinutos || RTARI_MAX_MINUTOS, RTARI_MAX_MINUTOS);
    this.cutoffTimer = setTimeout(() => {
      if (this.estado === "en_curso") this.finish();
    }, tope * 60_000);

    // El sinodal abre la entrevista en cuanto el canal está listo.
    if (dc.readyState === "open") this.pedirRespuesta();
    else dc.addEventListener("open", () => this.pedirRespuesta(), { once: true });
  }

  /**
   * Deshace un arranque que se canceló a media conexión.
   *
   * Cierra lo que se haya alcanzado a abrir y, sobre todo, devuelve los
   * minutos que el servidor ya había reservado: la sesión nunca llegó a sonar,
   * así que no debe costarle nada al alumno.
   */
  private async abortar(): Promise<void> {
    const sessionId = this.sessionId;
    const model = this.model;
    this.stop();
    this.setEstado("terminada");
    if (!sessionId || this.liquidada) return;
    this.liquidada = true;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await fetch("/api/rtari/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sessionId,
          model,
          durationSec: 0,
          usage: {},
        }),
      });
    } catch {
      // Si no se pudo avisar, los minutos quedan apartados hasta que el alumno
      // vuelva a entrar: preferible eso a dejar la sesión conectada.
    }
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
      if (res.status === 429 || code === "sin_minutos") {
        this.fail(
          new RtariError(
            "sin_minutos",
            "Te quedaste sin minutos de entrevista. Compra más o espera a tu siguiente ciclo.",
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

    return (await res.json()) as SessionResponse;
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

    // Si el sinodal está hablando hay que CORTARLO antes de pedirle otra cosa.
    // La API acepta respuestas concurrentes: pedir una segunda sin cancelar la
    // primera no la reemplaza, la encima, y se oyen las dos voces a la vez.
    if (this.respuestaEnCurso) {
      this.repeticionPendiente = true;
      this.send({ type: "response.cancel" });
      return;
    }
    this.pedirRespuesta();
  }

  /**
   * Pide una respuesta al sinodal, y sólo si no hay otra en curso.
   *
   * Es el único lugar del que sale un `response.create`. La bandera se levanta
   * aquí mismo, sin esperar la confirmación del servidor, porque dos clics
   * seguidos son más rápidos que el viaje de ida y vuelta.
   */
  private pedirRespuesta() {
    if (this.respuestaEnCurso) return;
    this.respuestaEnCurso = true;
    this.send({ type: "response.create" });
  }

  /** Silencia o reactiva el micrófono sin cerrar la sesión. */
  setMuted(muted: boolean) {
    this.mic?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }

  /* ── Orden de la transcripción ── */

  /**
   * Entrega los turnos que ya están listos, sin adelantarse a los que faltan.
   *
   * Si el primero de la fila es un hueco del alumno todavía sin texto, todo
   * espera: así nunca se ven dos turnos del sinodal seguidos con la respuesta
   * del alumno colada después. Pasada la espera máxima el hueco se descarta y
   * la conversación sigue.
   */
  private vaciarCola(forzar = false) {
    while (this.cola.length > 0) {
      const primero = this.cola[0]!;
      if (primero.turn) {
        this.cola.shift();
        this.cb.onTurn(primero.turn);
        continue;
      }
      if (forzar || Date.now() - primero.desde > ESPERA_TRANSCRIPCION_MS) {
        this.cola.shift();
        continue;
      }
      break;
    }
    if (this.cola.length > 0 && !forzar) this.programarVaciado();
    else if (this.colaTimer) {
      clearTimeout(this.colaTimer);
      this.colaTimer = null;
    }
  }

  private programarVaciado() {
    if (this.colaTimer) return;
    this.colaTimer = setTimeout(() => {
      this.colaTimer = null;
      this.vaciarCola();
    }, 400);
  }

  /** Cierra la entrevista de forma ordenada (el debrief lo pide la UI). */
  finish() {
    if (this.estado !== "en_curso") return;
    this.setEstado("terminando");
    // Lo que quedó en la fila se entrega antes de colgar: si no, el último
    // turno del sinodal nunca llegaría a la transcripción que se evalúa.
    this.vaciarCola(true);
    this.stop();
    this.setEstado("terminada");
  }

  /** Libera micrófono, conexión y temporizadores. Es idempotente. */
  stop() {
    soltarElTurno(this);
    this.cancelada = true;
    this.respuestaEnCurso = false;
    this.repeticionPendiente = false;
    if (this.cutoffTimer) {
      clearTimeout(this.cutoffTimer);
      this.cutoffTimer = null;
    }
    if (this.colaTimer) {
      clearTimeout(this.colaTimer);
      this.colaTimer = null;
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
    this.stopRecorder();
    this.mic?.getTracks().forEach((t) => t.stop());
    this.mic = null;
    if (this.audioEl) {
      // Pausar antes de soltar la fuente: si no, el elemento puede seguir
      // sonando con lo que ya tenía en el búfer.
      this.audioEl.pause();
      this.audioEl.srcObject = null;
      this.audioEl.remove();
      this.audioEl = null;
    }
    void this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
  }

  /* ── Eventos del canal de datos ── */

  private onEvent(raw: string) {
    // Una sesión cancelada ya no aporta a la transcripción: si dos llegaran a
    // convivir un instante, sólo la vigente escribe.
    if (this.cancelada) return;

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
      if (text) {
        this.cola.push({
          turn: { role: "examiner", text, at: this.elapsed() },
          desde: Date.now(),
        });
        this.vaciarCola();
      }
      this.cb.onExaminerPartial?.("");
      return;
    }

    // El servidor confirma que empezó una respuesta. Puede nacer de nuestro
    // `response.create` o del detector de silencios cuando el alumno termina
    // de hablar; en los dos casos ocupa el turno del sinodal.
    if (type === "response.created") {
      this.respuestaEnCurso = true;
      return;
    }

    if (type === "response.done" || type === "output_audio_buffer.stopped") {
      this.cb.onSpeaking?.(false);
      if (type === "response.done") {
        this.respuestaEnCurso = false;
        this.acumulaUso((evt.response as { usage?: unknown } | undefined)?.usage);
        // La repetición esperaba a que se cortara la respuesta anterior.
        if (this.repeticionPendiente) {
          this.repeticionPendiente = false;
          this.pedirRespuesta();
        }
      }
      return;
    }

    // El alumno terminó de hablar: se le aparta su lugar en la transcripción
    // aunque el texto tarde en llegar.
    if (type === "input_audio_buffer.committed" || type === "input_audio_buffer.speech_stopped") {
      const id = String(evt.item_id ?? "");
      if (id && !this.cola.some((e) => e.itemId === id)) {
        this.cola.push({ itemId: id, turn: null, desde: Date.now() });
        this.programarVaciado();
      }
      return;
    }

    // Lo que dijo el alumno, ya transcrito.
    if (type === "conversation.item.input_audio_transcription.completed") {
      const text = String(evt.transcript ?? "").trim();
      const id = String(evt.item_id ?? "");
      const turn: RtariTurn | null = text
        ? { role: "candidate", text, at: this.elapsed() }
        : null;
      const hueco = this.cola.find((e) => e.itemId === id && e.turn === null);
      if (hueco) {
        if (turn) hueco.turn = turn;
        else this.cola.splice(this.cola.indexOf(hueco), 1);
      } else if (turn) {
        this.cola.push({ itemId: id, turn, desde: Date.now() });
      }
      this.vaciarCola();
      return;
    }


    if (type === "error") {
      // Si la respuesta murió a medias, soltar la bandera: si no, el sinodal
      // se quedaría mudo el resto de la entrevista esperando un `response.done`
      // que ya no va a llegar.
      this.respuestaEnCurso = false;
      this.repeticionPendiente = false;
      const err = (evt.error ?? {}) as { message?: string };
      this.cb.onError?.(
        new RtariError("openai", err.message ?? "El sinodal reportó un error de sesión."),
      );
    }
  }

  /**
   * Suma el consumo que la API reporta al cerrar cada respuesta.
   *
   * Es la única forma de saber lo que costó de verdad una entrevista: el audio
   * no pasa por nuestro servidor, así que sin estos eventos sólo tendríamos la
   * duración en el reloj. Se lee a la defensiva porque el desglose por tipo de
   * token es opcional en la respuesta.
   */
  private acumulaUso(raw: unknown) {
    if (!raw || typeof raw !== "object") return;
    const u = raw as {
      input_tokens?: number;
      output_tokens?: number;
      input_token_details?: {
        audio_tokens?: number;
        text_tokens?: number;
        cached_tokens?: number;
        cached_tokens_details?: { audio_tokens?: number; text_tokens?: number };
      };
      output_token_details?: { audio_tokens?: number; text_tokens?: number };
    };

    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);
    const inDet = u.input_token_details ?? {};
    const outDet = u.output_token_details ?? {};

    const cacheAudio = num(inDet.cached_tokens_details?.audio_tokens);
    const cacheText = num(inDet.cached_tokens_details?.text_tokens);
    // Sin desglose de la caché, se reparte todo a audio: es la tarifa más
    // cara de las dos y preferimos sobrestimar el costo, no esconderlo.
    const cacheTotal = num(inDet.cached_tokens);
    const cachedAudio = cacheAudio || (cacheText ? 0 : cacheTotal);
    const cachedText = cacheText;

    // Los `*_token_details` ya incluyen lo servido por caché, así que se resta
    // para no cobrar dos veces el mismo token.
    const audioIn = Math.max(0, num(inDet.audio_tokens) - cachedAudio);
    const textIn = Math.max(0, num(inDet.text_tokens) - cachedText);

    this.usage = {
      audioIn: this.usage.audioIn + audioIn,
      audioCached: this.usage.audioCached + cachedAudio,
      audioOut: this.usage.audioOut + num(outDet.audio_tokens),
      textIn: this.usage.textIn + textIn,
      textCached: this.usage.textCached + cachedText,
      textOut: this.usage.textOut + num(outDet.text_tokens),
    };
  }

  /* ── Grabación ── */

  /**
   * Mezcla el micrófono y la voz del sinodal en una sola pista y la graba.
   *
   * Es para auditoría: la administradora necesita poder escuchar la entrevista
   * completa, no sólo leer la transcripción. Si el navegador no soporta
   * `MediaRecorder`, la entrevista sigue igual y simplemente no hay audio.
   */
  private startRecording(mic: MediaStream, remoto: MediaStream) {
    if (this.recorder || typeof MediaRecorder === "undefined") return;
    try {
      const Ctx: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      this.recCtx = ctx;
      const dest = ctx.createMediaStreamDestination();
      ctx.createMediaStreamSource(mic).connect(dest);
      ctx.createMediaStreamSource(remoto).connect(dest);

      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      const rec = new MediaRecorder(dest.stream, mime ? { mimeType: mime } : undefined);
      this.recChunks = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.recChunks.push(e.data);
      };
      this.recDone = new Promise<Blob | null>((resolve) => {
        rec.onstop = () => {
          const blob =
            this.recChunks.length > 0
              ? new Blob(this.recChunks, { type: rec.mimeType || "audio/webm" })
              : null;
          resolve(blob);
        };
      });
      rec.start(2000);
      this.recorder = rec;
    } catch {
      /* sin grabación: la entrevista funciona igual */
    }
  }

  private stopRecorder() {
    const rec = this.recorder;
    this.recorder = null;
    try {
      if (rec && rec.state !== "inactive") rec.stop();
    } catch {
      /* ya estaba detenido */
    }
    // El contexto se cierra hasta que el grabador entregó su último trozo:
    // cerrarlo antes corta el final de la entrevista.
    const ctx = this.recCtx;
    this.recCtx = null;
    void (this.recDone ?? Promise.resolve()).finally(() => {
      void ctx?.close().catch(() => {});
    });
  }

  /** Audio de la entrevista, una vez colgada. `null` si no se pudo grabar. */
  async takeRecording(): Promise<Blob | null> {
    if (!this.recDone) return null;
    const blob = await Promise.race([
      this.recDone,
      new Promise<null>((r) => setTimeout(() => r(null), 8000)),
    ]);
    this.recDone = null;
    return blob;
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
