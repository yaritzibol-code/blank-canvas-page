/**
 * Resultado de la entrevista: la escala OACI, el veredicto y las correcciones.
 *
 * La calificación global es la MÁS BAJA de las seis áreas (así se califica en
 * la escala real, no por promedio), así que la tarjeta grande muestra ese
 * número y la barra de cada área deja ver cuál es la que está jalando abajo.
 */
import { useState } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { ICAO_NIVEL_OPERACIONAL, ICAO_SKILLS, icaoLevel, icaoOverall } from "@/modules/rtari/icao";
import type { RtariDebrief } from "@/modules/rtari/debrief";
import type { RtariTurnRecord } from "@/lib/store/rtari";

const NAVY = "#22375C";
const CORAL = "#6C0820";
const CREAM = "#FBFAF7";
const HAZE = "#647DA0";
const SALMON = "#F2DCDB";
const SERIF = "'Instrument Serif', serif";
const MONO = "'JetBrains Mono', monospace";

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

/** Barra de un área de la escala, del 1 al 6. */
function SkillBar({ id, nivel }: { id: string; nivel: number | undefined }) {
  const skill = ICAO_SKILLS.find((s) => s.id === id)!;
  const def = nivel ? icaoLevel(nivel) : null;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "flex", color: def?.color ?? `${NAVY}44` }}>
          <Icon n={skill.icon as FPIconName} size={15} />
        </span>
        <span style={{ fontSize: "0.86rem", fontWeight: 700, color: NAVY, flex: 1 }}>
          {skill.nombre}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.7rem",
            fontWeight: 800,
            color: def?.color ?? `${NAVY}55`,
          }}
        >
          {nivel ? `NIVEL ${nivel}` : "—"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span
            key={n}
            title={`Nivel ${n} — ${icaoLevel(n).nombre}`}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: nivel && n <= nivel ? (def?.color ?? NAVY) : `${NAVY}12`,
              // El 4 es el corte operacional: se marca siempre.
              outline: n === ICAO_NIVEL_OPERACIONAL ? `1px dashed ${NAVY}55` : "none",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: "0.74rem", color: HAZE, lineHeight: 1.4 }}>{skill.descripcion}</div>
    </div>
  );
}

export function DebriefPanel({
  debrief,
  durationSec,
  turns,
  onRepetir,
}: {
  debrief: RtariDebrief;
  durationSec: number;
  turns: RtariTurnRecord[];
  onRepetir: () => void;
}) {
  const [verTranscripcion, setVerTranscripcion] = useState(false);
  const global = icaoOverall(debrief.niveles);
  const def = global ? icaoLevel(global) : null;
  const aprueba = global !== null && global >= ICAO_NIVEL_OPERACIONAL;
  const min = `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, "0")}`;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {debrief.muestraCorta && (
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            background: "#FFF6E6",
            border: "1px solid #E7C27D",
            borderRadius: 14,
            padding: "12px 16px",
            color: "#7A5310",
            fontSize: "0.86rem",
            lineHeight: 1.5,
          }}
        >
          <span style={{ display: "flex", paddingTop: 2 }}>
            <Icon n="alert" size={16} />
          </span>
          <span>
            Hablaste muy poco en esta entrevista, así que la calificación es sólo una referencia.
            Repítela contestando cada pregunta con al menos tres o cuatro oraciones.
          </span>
        </div>
      )}

      {/* Veredicto */}
      <div
        style={{
          background: NAVY,
          color: "white",
          borderRadius: 22,
          padding: "26px 28px",
          display: "grid",
          gridTemplateColumns: "auto minmax(0, 1fr)",
          gap: 24,
          alignItems: "center",
        }}
        className="fp-rtari-verdict"
      >
        <div style={{ textAlign: "center", minWidth: 130 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.56rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 700,
            }}
          >
            Nivel OACI
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "4.2rem",
              lineHeight: 1,
              color: aprueba ? "#8FE3B0" : "#F2AEBC",
            }}
          >
            {global ?? "—"}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {def?.nombre ?? "sin evaluar"}
          </div>
        </div>

        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 999,
              background: aprueba ? "rgba(143,227,176,0.16)" : "rgba(242,174,188,0.16)",
              color: aprueba ? "#8FE3B0" : "#F2AEBC",
              fontFamily: MONO,
              fontSize: "0.6rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            <Icon n={aprueba ? "checkCircle" : "alert"} size={13} />
            {aprueba ? "Alcanza el nivel operacional" : "Aún no llega al nivel 4"}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {debrief.veredicto}
          </p>
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              fontFamily: MONO,
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span>Duración · {min}</span>
            <span>Turnos tuyos · {turns.filter((t) => t.role === "candidate").length}</span>
            <span>La calificación global es la más baja de las seis áreas</span>
          </div>
        </div>
      </div>

      {/* Escala */}
      <Card>
        <Eyebrow>Escala OACI · las seis áreas</Eyebrow>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {ICAO_SKILLS.map((s) => (
            <SkillBar key={s.id} id={s.id} nivel={debrief.niveles[s.id]} />
          ))}
        </div>
      </Card>

      {/* Fortalezas y áreas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
        }}
      >
        {debrief.fortalezas.length > 0 && (
          <Card>
            <Eyebrow>Lo que sí hiciste bien</Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
              {debrief.fortalezas.map((f) => (
                <li key={f} style={{ fontSize: "0.9rem", color: NAVY, lineHeight: 1.55 }}>
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {debrief.areas.length > 0 && (
          <Card>
            <Eyebrow>Lo que te está costando</Eyebrow>
            <div style={{ display: "grid", gap: 14 }}>
              {debrief.areas.map((a, i) => {
                const skill = ICAO_SKILLS.find((s) => s.id === a.skill);
                return (
                  <div key={`${a.skill}-${i}`}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: MONO,
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: CORAL,
                        marginBottom: 4,
                      }}
                    >
                      <Icon n={(skill?.icon ?? "alert") as FPIconName} size={12} />
                      {skill?.nombre ?? a.skill}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: NAVY, lineHeight: 1.55 }}>
                      {a.comentario}
                    </div>
                    {a.ejemplo && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "8px 12px",
                          background: CREAM,
                          borderLeft: `3px solid ${SALMON}`,
                          borderRadius: 6,
                          fontFamily: SERIF,
                          fontStyle: "italic",
                          fontSize: "0.86rem",
                          color: HAZE,
                        }}
                      >
                        “{a.ejemplo}”
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Correcciones */}
      {debrief.correcciones.length > 0 && (
        <Card>
          <Eyebrow>Cómo se dice bien</Eyebrow>
          <div style={{ display: "grid", gap: 12 }}>
            {debrief.correcciones.map((c, i) => (
              <div
                key={`${c.dijiste}-${i}`}
                style={{
                  border: `1px solid ${NAVY}12`,
                  borderRadius: 14,
                  padding: "12px 16px",
                  background: CREAM,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    fontSize: "0.9rem",
                    color: HAZE,
                    textDecoration: "line-through",
                    textDecorationColor: `${CORAL}66`,
                  }}
                >
                  <span
                    style={{ display: "flex", color: CORAL, paddingTop: 3, textDecoration: "none" }}
                  >
                    <Icon n="close" size={13} />
                  </span>
                  {c.dijiste}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    fontSize: "0.95rem",
                    color: NAVY,
                    fontWeight: 600,
                    marginTop: 6,
                  }}
                >
                  <span style={{ display: "flex", color: "#2F7D4F", paddingTop: 3 }}>
                    <Icon n="check" size={13} />
                  </span>
                  {c.mejor}
                </div>
                {c.porque && (
                  <div style={{ fontSize: "0.8rem", color: HAZE, marginTop: 6, paddingLeft: 21 }}>
                    {c.porque}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Vocabulario y siguientes pasos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
        }}
      >
        {debrief.vocabulario.length > 0 && (
          <Card>
            <Eyebrow>Vocabulario para la próxima</Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              {debrief.vocabulario.map((v) => (
                <div key={v.en}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>
                    {v.en}
                    <span style={{ fontWeight: 400, color: HAZE }}> — {v.es}</span>
                  </div>
                  {v.uso && (
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontSize: "0.85rem",
                        color: HAZE,
                        marginTop: 2,
                      }}
                    >
                      “{v.uso}”
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {debrief.siguientes.length > 0 && (
          <Card>
            <Eyebrow>Tu siguiente práctica</Eyebrow>
            <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
              {debrief.siguientes.map((s) => (
                <li key={s} style={{ fontSize: "0.9rem", color: NAVY, lineHeight: 1.55 }}>
                  {s}
                </li>
              ))}
            </ol>
          </Card>
        )}
      </div>

      {/* Transcripción */}
      <Card style={{ padding: verTranscripcion ? "22px 24px" : "16px 24px" }}>
        <button
          onClick={() => setVerTranscripcion((v) => !v)}
          aria-expanded={verTranscripcion}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            font: "inherit",
            padding: 0,
            color: NAVY,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <Icon n="doc" size={16} />
            {verTranscripcion ? "Ocultar" : "Ver"} la transcripción completa
          </span>
          <Icon n={verTranscripcion ? "chevU" : "chevD"} size={16} />
        </button>
        {verTranscripcion && (
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {turns.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.56rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: t.role === "examiner" ? CORAL : HAZE,
                    minWidth: 66,
                    paddingTop: 4,
                  }}
                >
                  {t.role === "examiner" ? "Sinodal" : "Tú"}
                </span>
                <span style={{ fontSize: "0.9rem", color: NAVY, lineHeight: 1.55 }}>{t.text}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
        <button
          onClick={onRepetir}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 22px",
            borderRadius: 12,
            border: "none",
            background: CORAL,
            color: "white",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Icon n="refresh" size={16} /> Hacer otra entrevista
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .fp-rtari-verdict { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
