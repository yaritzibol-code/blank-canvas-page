/**
 * La entrevista en vivo.
 *
 * Aquí sólo hay conversación: el alumno habla y el sinodal responde por voz.
 * La pantalla existe para que sepa dónde está parado —qué pregunta va, cuánto
 * lleva, si su micrófono está entrando— y para que pueda salir cuando quiera.
 * Nada de esto corrige ni ayuda: la retroalimentación llega hasta el debrief,
 * como en el examen real.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  RtariRealtimeSession,
  type RtariError,
  type RtariEstado,
  type RtariTurn,
} from "@/lib/rtari-realtime";
import { RTARI_MAX_MINUTOS, type RtariNivel, type RtariVoice } from "@/modules/rtari/config";
import type { RtariQuestion } from "@/modules/rtari/questions";

const NAVY = "#22375C";
const CORAL = "#6C0820";
const CREAM = "#FBFAF7";
const HAZE = "#647DA0";
const ROSE = "#F2AEBC";
const SERIF = "'Instrument Serif', serif";
const MONO = "'JetBrains Mono', monospace";

/** Palabras vacías que no ayudan a reconocer de qué pregunta se trata. */
const STOP = new Set([
  "the",
  "a",
  "an",
  "of",
  "to",
  "in",
  "on",
  "for",
  "and",
  "or",
  "is",
  "are",
  "was",
  "were",
  "do",
  "did",
  "does",
  "you",
  "your",
  "me",
  "my",
  "i",
  "it",
  "that",
  "this",
  "what",
  "how",
  "tell",
  "about",
  "have",
  "has",
  "would",
  "can",
  "be",
  "as",
  "at",
  "with",
  "when",
  "where",
]);

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/**
 * ¿A qué pregunta del guion corresponde lo que acaba de decir el sinodal?
 *
 * Se compara por palabras clave: el sinodal tiene instrucción de usar la
 * redacción del guion, así que con la mitad de coincidencia basta. Si no
 * alcanza, devuelve -1 y la pantalla simplemente no marca nada.
 */
function matchQuestion(texto: string, questions: RtariQuestion[]): number {
  const dichas = new Set(keywords(texto));
  let mejor = -1;
  let mejorScore = 0;
  questions.forEach((q, i) => {
    const claves = keywords(q.en);
    if (claves.length === 0) return;
    const hits = claves.filter((k) => dichas.has(k)).length;
    const score = hits / claves.length;
    if (score > mejorScore) {
      mejorScore = score;
      mejor = i;
    }
  });
  return mejorScore >= 0.5 ? mejor : -1;
}

function reloj(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export interface InterviewResult {
  turns: RtariTurn[];
  durationSec: number;
}

export function InterviewStage({
  questions,
  voice,
  nivel,
  onFinish,
  onError,
  onCancel,
}: {
  questions: RtariQuestion[];
  voice: RtariVoice;
  nivel: RtariNivel;
  onFinish: (r: InterviewResult) => void;
  onError: (err: RtariError) => void;
  onCancel: () => void;
}) {
  const [estado, setEstado] = useState<RtariEstado>("conectando");
  const [turns, setTurns] = useState<RtariTurn[]>([]);
  const [parcial, setParcial] = useState("");
  const [hablando, setHablando] = useState(false);
  const [muted, setMuted] = useState(false);
  const [nivelMic, setNivelMic] = useState(0);
  const [transcurrido, setTranscurrido] = useState(0);
  const [actual, setActual] = useState(-1);

  const sesionRef = useRef<RtariRealtimeSession | null>(null);
  const turnsRef = useRef<RtariTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Las props llegan del padre y no cambian durante la entrevista; se guardan
  // en refs para que el efecto de arranque corra UNA sola vez.
  const cfg = useRef({ questions, voice, nivel, onFinish, onError });
  cfg.current = { questions, voice, nivel, onFinish, onError };

  useEffect(() => {
    const sesion = new RtariRealtimeSession({
      onEstado: setEstado,
      onSpeaking: setHablando,
      onExaminerPartial: setParcial,
      onError: (err) => cfg.current.onError(err),
      onTurn: (t) => {
        turnsRef.current = [...turnsRef.current, t];
        setTurns(turnsRef.current);
        if (t.role === "examiner") {
          const idx = matchQuestion(t.text, cfg.current.questions);
          if (idx !== -1) setActual(idx);
        }
      },
    });
    sesion.onLevel(setNivelMic);
    sesionRef.current = sesion;

    void sesion
      .start({
        questionIds: cfg.current.questions.map((q) => q.id),
        voice: cfg.current.voice,
        nivel: cfg.current.nivel,
      })
      .catch(() => {
        // `onError` ya avisó al padre; aquí sólo evitamos el rechazo suelto.
      });

    return () => sesion.stop();
  }, []);

  // Cronómetro de la entrevista.
  useEffect(() => {
    if (estado !== "en_curso") return;
    const t = setInterval(() => setTranscurrido(sesionRef.current?.elapsed() ?? 0), 500);
    return () => clearInterval(t);
  }, [estado]);

  // La transcripción sigue creciendo: la vista se queda abajo.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, parcial]);

  const terminar = useCallback(() => {
    const sesion = sesionRef.current;
    const durationSec = Math.round((sesion?.elapsed() ?? transcurrido) / 1000);
    sesion?.finish();
    cfg.current.onFinish({ turns: turnsRef.current, durationSec });
  }, [transcurrido]);

  const respuestas = turns.filter((t) => t.role === "candidate").length;
  const conectando = estado === "conectando";
  const restanteMin = Math.max(0, RTARI_MAX_MINUTOS - Math.floor(transcurrido / 60000));

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)", gap: 20 }}
      className="fp-rtari-stage"
    >
      {/* Conversación */}
      <div
        style={{
          background: NAVY,
          borderRadius: 22,
          padding: "22px 24px",
          color: "white",
          display: "flex",
          flexDirection: "column",
          minHeight: 460,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: conectando ? "#E7C27D" : hablando ? ROSE : "#4ade80",
              boxShadow: hablando ? `0 0 0 6px ${ROSE}33` : "none",
              transition: "box-shadow .2s",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {conectando
              ? "Conectando con el sinodal…"
              : hablando
                ? "El sinodal está hablando"
                : "Tu turno — habla en inglés"}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: MONO,
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "white",
            }}
          >
            {reloj(transcurrido)}
          </span>
        </div>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            display: "grid",
            gap: 14,
            alignContent: "start",
            paddingRight: 6,
            maxHeight: 420,
          }}
        >
          {turns.length === 0 && !parcial && (
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "1.05rem",
                color: "rgba(255,255,255,0.5)",
                textAlign: "center",
                padding: "60px 20px",
                lineHeight: 1.6,
              }}
            >
              {conectando
                ? "Dale permiso al micrófono y espera unos segundos."
                : "El sinodal está por saludarte. Responde en voz alta, en inglés."}
            </div>
          )}

          {turns.map((t, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.54rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: t.role === "examiner" ? ROSE : "rgba(255,255,255,0.45)",
                }}
              >
                {t.role === "examiner" ? "Sinodal" : "Tú"}
              </span>
              <span
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.55,
                  color: t.role === "examiner" ? "white" : "rgba(255,255,255,0.78)",
                }}
              >
                {t.text}
              </span>
            </div>
          ))}

          {parcial && (
            <div style={{ display: "flex", flexDirection: "column", gap: 3, opacity: 0.75 }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.54rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: ROSE,
                }}
              >
                Sinodal
              </span>
              <span style={{ fontSize: "0.95rem", lineHeight: 1.55, color: "white" }}>
                {parcial}
              </span>
            </div>
          )}
        </div>

        {/* Controles */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            flexWrap: "wrap",
          }}
        >
          {/* Nivel de micrófono */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
            <span style={{ display: "flex", color: muted ? "rgba(255,255,255,0.35)" : ROSE }}>
              <Icon n={muted ? "eyeOff" : "audio"} size={16} />
            </span>
            <span style={{ display: "flex", gap: 2 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: !muted && nivelMic * 6 > i ? "#4ade80" : "rgba(255,255,255,0.16)",
                    transition: "background .1s",
                  }}
                />
              ))}
            </span>
          </div>

          <button
            onClick={() => sesionRef.current?.repetir()}
            disabled={estado !== "en_curso"}
            style={ctrlBtn(estado !== "en_curso")}
          >
            <Icon n="refresh" size={14} /> Repetir pregunta
          </button>
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              sesionRef.current?.setMuted(next);
            }}
            disabled={estado !== "en_curso"}
            style={ctrlBtn(estado !== "en_curso")}
          >
            <Icon n={muted ? "audio" : "pause"} size={14} />{" "}
            {muted ? "Reactivar micro" : "Silenciar"}
          </button>

          <button
            onClick={conectando ? onCancel : terminar}
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: CORAL,
              color: "white",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Icon n={conectando ? "close" : "checkCircle"} size={15} />
            {conectando ? "Cancelar" : "Terminar y evaluar"}
          </button>
        </div>
      </div>

      {/* Guion */}
      <div
        style={{
          background: "white",
          border: `1px solid ${NAVY}14`,
          borderRadius: 22,
          padding: "20px 22px",
          alignSelf: "start",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.58rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: `${NAVY}66`,
            marginBottom: 4,
          }}
        >
          Guion de hoy
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "1.3rem",
            color: NAVY,
            marginBottom: 14,
          }}
        >
          {respuestas} de {questions.length} contestadas
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {questions.map((q, i) => {
            const esActual = i === actual;
            const pasada = actual > i;
            return (
              <div
                key={q.id}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: esActual ? CREAM : "transparent",
                  border: `1px solid ${esActual ? `${NAVY}1A` : "transparent"}`,
                  opacity: pasada ? 0.5 : 1,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    color: esActual ? CORAL : `${NAVY}44`,
                    paddingTop: 2,
                    minWidth: 16,
                  }}
                >
                  {pasada ? "✓" : i + 1}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    lineHeight: 1.4,
                    color: esActual ? NAVY : HAZE,
                    fontWeight: esActual ? 600 : 400,
                  }}
                >
                  {q.en}
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${NAVY}12`,
            fontSize: "0.74rem",
            color: HAZE,
            lineHeight: 1.5,
          }}
        >
          La sesión se corta sola a los {RTARI_MAX_MINUTOS} min
          {estado === "en_curso" && restanteMin < RTARI_MAX_MINUTOS
            ? ` (te quedan ~${restanteMin}).`
            : "."}{" "}
          El sinodal no te corrige durante la entrevista: la retroalimentación llega al final.
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .fp-rtari-stage { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function ctrlBtn(disabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "transparent",
    color: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
  };
}
