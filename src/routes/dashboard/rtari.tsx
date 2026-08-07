/**
 * Módulo RTARI — entrevista personal en inglés.
 *
 * Tres pantallas en una ruta: la preparación (con qué sinodal y qué guion),
 * la entrevista por voz y el debrief con la escala OACI. Abajo vive siempre el
 * banco de práctica y el historial, que se pueden estudiar sin gastar minutos
 * de voz.
 *
 * Aviso permanente (ver `COMPLIANCE.md`): esto es práctica independiente. Ni
 * el banco ni la calificación provienen de ninguna autoridad, y FlightPath no
 * está afiliada a la AFAC.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { InterviewStage, type InterviewResult } from "@/components/rtari/InterviewStage";
import { DebriefPanel } from "@/components/rtari/DebriefPanel";
import { QuestionBank } from "@/components/rtari/QuestionBank";
import {
  getRtariSessions,
  isPaid,
  logActivity,
  rtariStats,
  saveRtariSession,
  setRtariDebrief,
  useSessionUser,
  useStore,
  type RtariSessionRecord,
} from "@/lib/store";
import { requestDebrief } from "@/lib/rtari-client";
import { soportaEntrevista, type RtariError } from "@/lib/rtari-realtime";
import {
  RTARI_MAX_MINUTOS,
  RTARI_NIVEL_DEFS,
  RTARI_PRESETS_PREGUNTAS,
  RTARI_SESIONES_POR_DIA,
  RTARI_VOICE_DEFS,
  type RtariNivel,
  type RtariVoice,
} from "@/modules/rtari/config";
import { ICAO_NIVEL_OPERACIONAL, icaoLevel } from "@/modules/rtari/icao";
import {
  RTARI_BLOQUES,
  RTARI_TOTAL,
  pickQuestions,
  type RtariBloque,
  type RtariQuestion,
} from "@/modules/rtari/questions";

export const Route = createFileRoute("/dashboard/rtari")({
  component: RtariPage,
});

const NAVY = "#22375C";
const CORAL = "#6C0820";
const CREAM = "#FBFAF7";
const HAZE = "#647DA0";
const ROSE = "#F2AEBC";
const SALMON = "#F2DCDB";
const SERIF = "'Instrument Serif', serif";
const MONO = "'JetBrains Mono', monospace";

type Fase = "setup" | "entrevista" | "evaluando" | "debrief";

/* ── Piezas de UI ── */

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${NAVY}14`,
        borderRadius: 22,
        padding: "22px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: "0.6rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        fontWeight: 700,
        color: `${NAVY}66`,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card style={{ padding: "18px 20px" }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.58rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: `${NAVY}80`,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "2.4rem",
          lineHeight: 1.1,
          color: NAVY,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: "0.76rem", color: HAZE, marginTop: 2 }}>{sub}</div>}
    </Card>
  );
}

/** Grupo de opciones tipo "pastilla". */
function Opciones<T extends string | number>({
  titulo,
  valor,
  opciones,
  onChange,
}: {
  titulo: string;
  valor: T;
  opciones: Array<{ key: T; label: string; sub?: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <Eyebrow>{titulo}</Eyebrow>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {opciones.map((o) => {
          const activo = o.key === valor;
          return (
            <button
              key={String(o.key)}
              onClick={() => onChange(o.key)}
              style={{
                textAlign: "left",
                padding: o.sub ? "10px 14px" : "8px 16px",
                borderRadius: 12,
                border: `1px solid ${activo ? "transparent" : `${NAVY}18`}`,
                background: activo ? NAVY : "transparent",
                color: activo ? "white" : NAVY,
                cursor: "pointer",
                fontFamily: "inherit",
                minWidth: o.sub ? 190 : 0,
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{o.label}</div>
              {o.sub && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    marginTop: 2,
                    lineHeight: 1.35,
                    color: activo ? "rgba(255,255,255,0.7)" : HAZE,
                  }}
                >
                  {o.sub}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Fila del historial de entrevistas. */
function HistorialRow({ s, onVer }: { s: RtariSessionRecord; onVer: () => void }) {
  const def = s.nivelGlobal ? icaoLevel(s.nivelGlobal) : null;
  const fecha = new Date(s.date).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const dur = `${Math.floor(s.durationSec / 60)}:${String(s.durationSec % 60).padStart(2, "0")}`;

  return (
    <button
      onClick={onVer}
      disabled={!s.debrief}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 4px",
        borderTop: `1px solid ${NAVY}12`,
        background: "none",
        border: "none",
        borderTopStyle: "solid",
        cursor: s.debrief ? "pointer" : "default",
        font: "inherit",
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: def ? `${def.color}18` : CREAM,
          color: def?.color ?? `${NAVY}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: "0.95rem",
          flexShrink: 0,
        }}
      >
        {s.nivelGlobal ?? "—"}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: NAVY }}>
          {def ? `Nivel ${s.nivelGlobal} · ${def.nombre}` : "Entrevista sin evaluar"}
        </span>
        <span style={{ display: "block", fontSize: "0.76rem", color: HAZE, marginTop: 1 }}>
          {fecha} · {dur} · {s.questionIds.length} preguntas · sinodal {s.nivel}
        </span>
      </span>
      {s.debrief && (
        <span style={{ color: `${NAVY}44`, display: "flex" }}>
          <Icon n="chevR" size={16} />
        </span>
      )}
    </button>
  );
}

/* ── Página ── */

function RtariPage() {
  const user = useSessionUser();
  const pro = isPaid(user);
  const soportado = useMemo(() => soportaEntrevista(), []);

  const sesiones = useStore(() => (user ? getRtariSessions(user.id) : []));
  const stats = useStore(() =>
    user
      ? rtariStats(user.id)
      : { sesiones: 0, minutos: 0, mejorNivel: null, ultimoNivel: null, preguntasVistas: 0 },
  );
  const vistas = useMemo(() => {
    const set = new Set<string>();
    sesiones.forEach((s) => s.questionIds.forEach((q) => set.add(q)));
    return set;
  }, [sesiones]);

  const [fase, setFase] = useState<Fase>("setup");
  const [numPreguntas, setNumPreguntas] = useState<number>(RTARI_PRESETS_PREGUNTAS[1]);
  const [bloque, setBloque] = useState<RtariBloque | "todos">("todos");
  const [voice, setVoice] = useState<RtariVoice>("marin");
  const [nivel, setNivel] = useState<RtariNivel>("estandar");

  const [guion, setGuion] = useState<RtariQuestion[]>([]);
  const [resultado, setResultado] = useState<RtariSessionRecord | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);

  const comenzar = () => {
    if (!user) return;
    if (!pro) {
      setUpgrade(true);
      return;
    }
    setAviso(null);
    setResultado(null);
    setGuion(pickQuestions(numPreguntas, bloque));
    setFase("entrevista");
  };

  const onError = useCallback((err: RtariError) => {
    if (err.code === "requiere_pro") {
      setUpgrade(true);
      setFase("setup");
      return;
    }
    setAviso(err.message);
    // Los errores de sesión abortan la entrevista; los de la propia charla
    // (un evento suelto de OpenAI) sólo se avisan sin tirarla.
    if (err.code !== "openai") setFase("setup");
  }, []);

  /** Cierra la entrevista: guarda lo dicho y pide la evaluación. */
  const onFinish = useCallback(
    async ({ turns, durationSec }: InterviewResult) => {
      if (!user) return;
      setFase("evaluando");

      const questionIds = guion.map((q) => q.id);
      const registro = saveRtariSession({
        userId: user.id,
        durationSec,
        nivel,
        voice,
        questionIds,
        turns,
      });
      logActivity({
        userId: user.id,
        kind: "rtari",
        label: `Entrevista RTARI · ${guion.length} preguntas`,
        durationMin: Math.round(durationSec / 60),
      });
      setResultado(registro);

      const respuestas = turns.filter((t) => t.role === "candidate");
      if (respuestas.length === 0) {
        setAviso(
          "No quedó nada grabado de tu voz, así que no hay qué evaluar. Revisa el micrófono y vuelve a intentarlo.",
        );
        setFase("setup");
        return;
      }

      const res = await requestDebrief({
        questionIds,
        turns: turns.map((t) => ({ role: t.role, text: t.text })),
        durationSec,
      });

      if (res.ok && res.debrief) {
        setRtariDebrief(registro.id, res.debrief);
        setResultado({ ...registro, debrief: res.debrief });
        setFase("debrief");
        return;
      }

      setAviso(
        res.fallo === "requiere_pro"
          ? "La evaluación es parte de FlightPath Pro."
          : res.fallo === "limite"
            ? "Alcanzaste tu límite de consultas a la IA por ahora. Tu entrevista quedó guardada; vuelve a evaluarla más tarde."
            : "No pude generar tu evaluación en este momento. Tu entrevista quedó guardada en el historial.",
      );
      setFase("setup");
    },
    [user, guion, nivel, voice],
  );

  const bloqueSel = RTARI_BLOQUES.find((b) => b.id === bloque);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", fontFamily: "'Manrope', sans-serif" }}>
      <ModuleHeader
        eyebrow="Inglés aeronáutico · RTARI"
        title="Tu entrevista"
        accent="personal"
        tail=", en voz alta"
        subtitle={
          <>
            Un sinodal por voz te hace las preguntas en inglés, tú contestas hablando y al final
            recibes tu nivel en las seis áreas de la escala OACI con las correcciones de lo que
            dijiste. Práctica independiente de FlightPath: ni el banco ni la calificación provienen
            de una autoridad.
          </>
        }
        aside={
          fase === "setup" ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: SALMON,
                color: CORAL,
                padding: "6px 14px",
                borderRadius: 999,
                fontFamily: MONO,
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <Icon n="audio" size={13} /> {RTARI_TOTAL} preguntas
            </span>
          ) : undefined
        }
      />

      {aviso && (
        <div
          role="alert"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            background: "#FFF1F2",
            border: `1px solid ${ROSE}`,
            borderRadius: 14,
            padding: "12px 16px",
            color: CORAL,
            fontSize: "0.88rem",
            lineHeight: 1.5,
            marginBottom: 18,
          }}
        >
          <span style={{ display: "flex", paddingTop: 2 }}>
            <Icon n="alert" size={16} />
          </span>
          <span style={{ flex: 1 }}>{aviso}</span>
          <button
            onClick={() => setAviso(null)}
            aria-label="Cerrar aviso"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: CORAL,
              display: "flex",
            }}
          >
            <Icon n="close" size={15} />
          </button>
        </div>
      )}

      {fase === "entrevista" && (
        <InterviewStage
          questions={guion}
          voice={voice}
          nivel={nivel}
          onFinish={(r) => void onFinish(r)}
          onError={onError}
          onCancel={() => setFase("setup")}
        />
      )}

      {fase === "evaluando" && (
        <Card style={{ textAlign: "center", padding: "64px 24px" }}>
          <div
            style={{
              width: 46,
              height: 46,
              margin: "0 auto 18px",
              borderRadius: "50%",
              border: `3px solid ${SALMON}`,
              borderTopColor: CORAL,
              animation: "fp-rtari-spin 0.9s linear infinite",
            }}
          />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.5rem", color: NAVY }}>
            Calificando tu entrevista…
          </div>
          <div style={{ color: HAZE, fontSize: "0.9rem", marginTop: 6 }}>
            Se está revisando lo que dijiste contra las seis áreas de la escala OACI.
          </div>
          <style>{`@keyframes fp-rtari-spin { to { transform: rotate(360deg); } }`}</style>
        </Card>
      )}

      {fase === "debrief" && resultado?.debrief && (
        <DebriefPanel
          debrief={resultado.debrief}
          durationSec={resultado.durationSec}
          turns={resultado.turns}
          onRepetir={() => {
            setResultado(null);
            setFase("setup");
          }}
        />
      )}

      {fase === "setup" && (
        <div style={{ display: "grid", gap: 20 }}>
          {/* KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 14,
            }}
          >
            <Kpi
              label="Entrevistas"
              value={String(stats.sesiones)}
              sub={stats.sesiones === 0 ? "Aún no practicas" : `${stats.minutos} min hablando`}
            />
            <Kpi
              label="Último nivel"
              value={stats.ultimoNivel ? String(stats.ultimoNivel) : "—"}
              sub={
                stats.ultimoNivel
                  ? `${icaoLevel(stats.ultimoNivel).nombre}${stats.ultimoNivel >= ICAO_NIVEL_OPERACIONAL ? " · alcanza el 4" : " · falta para el 4"}`
                  : "Se calcula al terminar tu primera"
              }
            />
            <Kpi
              label="Mejor nivel"
              value={stats.mejorNivel ? String(stats.mejorNivel) : "—"}
              sub={stats.mejorNivel ? icaoLevel(stats.mejorNivel).nombre : "Sin evaluaciones"}
            />
            <Kpi
              label="Banco cubierto"
              value={`${stats.preguntasVistas}/${RTARI_TOTAL}`}
              sub="Preguntas que ya te tocaron"
            />
          </div>

          {/* Arranque */}
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <div>
                <Eyebrow>Nueva entrevista</Eyebrow>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: "1.8rem",
                    color: NAVY,
                    margin: 0,
                  }}
                >
                  Arma tu sesión de hoy
                </h2>
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.62rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: HAZE,
                  textAlign: "right",
                  lineHeight: 1.6,
                }}
              >
                Máx. {RTARI_MAX_MINUTOS} min por sesión
                <br />
                {RTARI_SESIONES_POR_DIA} entrevistas al día
              </div>
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              <Opciones
                titulo="Cuántas preguntas"
                valor={numPreguntas}
                onChange={setNumPreguntas}
                opciones={RTARI_PRESETS_PREGUNTAS.map((n) => ({
                  key: n as number,
                  label: `${n} preguntas`,
                  sub: n <= 5 ? "≈ 5 min" : n <= 8 ? "≈ 10 min" : "≈ 15 min",
                }))}
              />

              <div>
                <Eyebrow>Sobre qué te van a preguntar</Eyebrow>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { id: "todos" as const, nombre: "Todo el banco", icon: "list" },
                    ...RTARI_BLOQUES,
                  ].map((b) => {
                    const activo = bloque === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setBloque(b.id as RtariBloque | "todos")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          borderRadius: 999,
                          border: `1px solid ${activo ? "transparent" : `${NAVY}18`}`,
                          background: activo ? NAVY : "transparent",
                          color: activo ? "white" : NAVY,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Icon n={b.icon as FPIconName} size={13} />
                        {b.nombre}
                      </button>
                    );
                  })}
                </div>
                {bloqueSel && (
                  <div style={{ fontSize: "0.8rem", color: HAZE, marginTop: 8 }}>
                    {bloqueSel.descripcion}
                  </div>
                )}
              </div>

              <Opciones
                titulo="Tu sinodal"
                valor={voice}
                onChange={setVoice}
                opciones={RTARI_VOICE_DEFS.map((v) => ({
                  key: v.id,
                  label: v.nombre,
                  sub: v.descripcion,
                }))}
              />

              <Opciones
                titulo="Qué tan duro"
                valor={nivel}
                onChange={setNivel}
                opciones={RTARI_NIVEL_DEFS.map((n) => ({
                  key: n.id,
                  label: n.nombre,
                  sub: n.descripcion,
                }))}
              />
            </div>

            <div
              style={{
                marginTop: 22,
                paddingTop: 18,
                borderTop: `1px solid ${NAVY}12`,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={comenzar}
                disabled={!soportado}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 26px",
                  borderRadius: 12,
                  border: "none",
                  background: soportado ? CORAL : `${NAVY}22`,
                  color: soportado ? "white" : `${NAVY}88`,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: soportado ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}
              >
                <Icon n="audio" size={18} />
                {pro ? "Comenzar entrevista" : "Comenzar entrevista (Pro)"}
              </button>
              <div
                style={{ fontSize: "0.8rem", color: HAZE, lineHeight: 1.5, flex: 1, minWidth: 220 }}
              >
                {soportado ? (
                  <>
                    Te va a pedir permiso del micrófono. Usa audífonos si puedes y contesta{" "}
                    <strong style={{ color: NAVY }}>siempre en inglés</strong>: el sinodal no habla
                    español.
                  </>
                ) : (
                  <>
                    Este navegador no soporta la entrevista por voz. Ábrela desde Chrome, Edge o
                    Safari actualizados.
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Historial */}
          {sesiones.length > 0 && (
            <Card>
              <Eyebrow>Tus entrevistas</Eyebrow>
              <div style={{ marginTop: -4 }}>
                {sesiones.slice(0, 8).map((s) => (
                  <HistorialRow
                    key={s.id}
                    s={s}
                    onVer={() => {
                      if (!s.debrief) return;
                      setResultado(s);
                      setFase("debrief");
                    }}
                  />
                ))}
              </div>
            </Card>
          )}

          <QuestionBank vistas={vistas} />

          {/* Cómo se califica */}
          <Card style={{ background: CREAM }}>
            <Eyebrow>Cómo se califica</Eyebrow>
            <p style={{ margin: 0, fontSize: "0.9rem", color: NAVY, lineHeight: 1.65 }}>
              La escala de la OACI evalúa seis áreas —pronunciación, estructura, vocabulario,
              fluidez, comprensión e interacción— del nivel 1 al 6, y{" "}
              <strong>tu calificación es la más baja de las seis</strong>, no el promedio: el nivel
              4 (operacional) sólo se alcanza cuando ninguna área se queda atrás. El acento no baja
              la calificación mientras no estorbe que te entiendan.
            </p>
            <p style={{ margin: "10px 0 0", fontSize: "0.82rem", color: HAZE, lineHeight: 1.6 }}>
              Esta calificación es una estimación de práctica generada por IA para orientar tu
              estudio. No tiene validez oficial ni sustituye la evaluación de la autoridad
              aeronáutica.
            </p>
          </Card>
        </div>
      )}

      <UpgradeModal
        open={upgrade}
        onClose={() => setUpgrade(false)}
        feature="Entrevista RTARI por voz"
        benefit="Practica la entrevista en inglés con un sinodal por voz y recibe tu nivel OACI con correcciones concretas."
        userId={user?.id}
      />
    </div>
  );
}
