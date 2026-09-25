/**
 * Modo revisión de un intento ya terminado.
 *
 * Es SOLO LECTURA: no vuelve a calificar, no guarda intento, no toca XP,
 * racha ni estadísticas. Únicamente pinta lo que la estudiante contestó en
 * esa sesión, marca acierto/error, muestra la respuesta correcta y la
 * explicación, y deja disponible "Reportar pregunta" (el reporte lo abre la
 * pantalla que use este componente, con su modal de siempre).
 *
 * Es genérico a propósito: cualquier cuestionario de FlightPath puede
 * alimentarlo con sus preguntas del intento.
 */
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { QuestionImages } from "@/components/banco/QuestionImages";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export interface QuizReviewItem {
  /** Identificador del reactivo (para el reporte y como key). */
  id: string;
  text: string;
  /** Capítulo o bloque; se pinta en el ojillo sobre la pregunta. */
  eyebrow?: string;
  options: string[];
  correctIndex: number;
  /** Opción elegida en el intento; null o -1 si no la respondió. */
  selectedIndex: number | null;
  /** Pregunta de respuesta escrita (abreviaturas Jeppesen). */
  abierta?: boolean;
  /** Lo que escribió, en preguntas abiertas. */
  respuestaEscrita?: string | null;
  /** Acierto del intento; si no se pasa, se deduce de la opción elegida. */
  correcta?: boolean | null;
  explicacion?: string;
  cita?: string;
  imagenes?: string[];
  fuente?: string;
  fallbackImage?: string;
}

export function QuizReview({
  titulo,
  items,
  onExit,
  onReport,
  exitLabel = "Volver a resultados",
}: {
  /** "APRENDIENDO · JEPPESEN": de dónde salió el intento. */
  titulo: string;
  items: QuizReviewItem[];
  /** Vuelve a la pantalla de "Sesión completada". */
  onExit: () => void;
  /** Abre el modal de reporte existente para esa pregunta. */
  onReport: (index: number) => void;
  exitLabel?: string;
}) {
  const [idx, setIdx] = useState(0);
  const total = items.length;
  const item = items[Math.min(idx, Math.max(0, total - 1))];

  const estados = useMemo(
    () =>
      items.map((it) => {
        if (typeof it.correcta === "boolean") return it.correcta;
        if (it.selectedIndex === null || it.selectedIndex < 0) return null;
        return it.selectedIndex === it.correctIndex;
      }),
    [items],
  );

  const aciertos = estados.filter((e) => e === true).length;
  const fallos = estados.filter((e) => e === false).length;
  const sinResponder = estados.filter((e) => e === null).length;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, total - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, onExit]);

  if (!item) return null;

  const estado = estados[idx] ?? null;
  const elegida = item.selectedIndex !== null && item.selectedIndex >= 0 ? item.selectedIndex : null;

  return (
    <div
      className="fp-quiz-shell fp-quiz-review"
      style={{
        fontFamily: "'Manrope', sans-serif",
        background: "var(--fd-panel, #f5f7fc)",
        color: "var(--fd-text, #081A35)",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        .fp-quiz-review .fp-review-area { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
        .fp-quiz-review .fp-review-primary { width: 100%; max-width: 900px; margin: 0 auto; min-width: 0; }
        .fp-quiz-review .fp-review-card { padding: 20px; }
        .fp-quiz-review .fp-progress-segments { display: grid; grid-template-columns: repeat(var(--question-count,20), minmax(5px,1fr)); gap: 4px; }
        .fp-quiz-review .fp-progress-segments button { height: 6px; min-width: 0; padding: 0; border: 0; border-radius: 4px; background: #ffffff24; cursor: pointer; }
        .fp-quiz-review .fp-progress-segments button.is-correct { background: #7fd6a4; }
        .fp-quiz-review .fp-progress-segments button.is-wrong { background: #f0a08c; }
        .fp-quiz-review .fp-progress-segments button.is-current { outline: 2px solid #c7a052; outline-offset: 2px; }
        @media (min-width: 768px) {
          .fp-quiz-review .fp-review-area { padding: 20px 24px; }
          .fp-quiz-review .fp-review-card { padding: 24px 28px; }
        }
        @media (min-width: 1200px) {
          .fp-quiz-review .fp-review-primary { max-width: 1120px; }
          .fp-quiz-review .fp-review-card { padding: 24px 32px; }
        }
      `}</style>

      {/* ── TOPBAR ── */}
      <div
        className="fp-question-topbar px-3 sm:px-6"
        style={{
          background: "var(--fd-panel, white)",
          borderBottom: "1px solid var(--fd-border, rgba(22,61,112,0.08))",
          minHeight: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          position: "sticky",
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onExit}
          aria-label={exitLabel}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            minHeight: 44, padding: "0 12px", borderRadius: 8,
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--fd-text, #163D70)", fontSize: "0.82rem", fontWeight: 600,
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          <Icon n="chevL" size={16} /> <span>{exitLabel}</span>
        </button>
        <span
          style={{
            background: "#C7A052", color: "#0B1220", padding: "4px 12px",
            borderRadius: "var(--fd-radius, 20px)", fontSize: "0.75rem", fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
          }}
        >
          <Icon n="doc" size={14} /> Modo revisión
        </span>
      </div>

      {/* ── RESUMEN ── */}
      <div
        className="px-3 sm:px-6"
        style={{
          background: "var(--fd-panel, white)",
          borderBottom: "1px solid var(--fd-border, rgba(22,61,112,0.06))",
          paddingTop: 10, paddingBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, flexWrap: "wrap", flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "0.76rem", color: "var(--fd-muted, #5A6F92)", fontWeight: 700, letterSpacing: ".04em" }}>
          {titulo}
        </span>
        <span style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", fontSize: "0.76rem", fontWeight: 700 }}>
          <span style={{ color: "#1a7a4a" }}>◆ {aciertos} correctas</span>
          <span style={{ color: "#c0392b" }}>◆ {fallos} incorrectas</span>
          {sinResponder > 0 && (
            <span style={{ color: "var(--fd-muted, #5A6F92)" }}>◆ {sinResponder} sin responder</span>
          )}
        </span>
      </div>

      {/* ── PREGUNTA ── */}
      <div className="fp-review-area" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <div className="fp-review-primary">
          <div
            className="fp-review-card"
            style={{
              background: "var(--fd-panel, white)",
              borderRadius: "var(--fd-radius, 18px)",
              boxShadow: "0 2px 16px rgba(22,61,112,0.07)",
            }}
          >
            {/*
              Salto rápido entre preguntas: misma tira de segmentos que usa la
              sesión, coloreada con el resultado de cada reactivo.
            */}
            <div
              className="fp-progress-segments"
              style={{ ["--question-count" as string]: total, marginBottom: 14 }}
              role="tablist"
              aria-label="Preguntas del intento"
            >
              {estados.map((estado, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={`Pregunta ${i + 1}${estado === true ? ", correcta" : estado === false ? ", incorrecta" : ", sin responder"}`}
                  className={[
                    i === idx ? "is-current" : "",
                    estado === true ? "is-correct" : estado === false ? "is-wrong" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>

            {!!item.imagenes?.length && (
              <figure className="fp-question-featured-figure">
                <QuestionImages
                  files={item.imagenes}
                  {...(item.fuente ? { fuente: item.fuente } : {})}
                  {...(item.fallbackImage ? { fallbackSrc: item.fallbackImage } : {})}
                />
                <figcaption>FIGURA 1 · MATERIAL DE ESTUDIO</figcaption>
              </figure>
            )}

            <div className="fp-question-eyebrow">
              PREGUNTA {idx + 1} <span>·</span> {(item.eyebrow || "CONOCIMIENTOS AERONÁUTICOS").toUpperCase()}
            </div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(1.4rem, 2.3vw, 1.9rem)",
                color: "var(--fd-text, #081A35)",
                lineHeight: 1.25,
                marginBottom: 22,
              }}
            >
              {item.text}
            </h1>

            {item.abierta ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <ReadOnlyRow
                  label="Tu respuesta"
                  value={item.respuestaEscrita?.trim() || "Sin responder"}
                  tone={estado === true ? "ok" : "err"}
                />
                <ReadOnlyRow
                  label="Respuesta correcta"
                  value={item.options[item.correctIndex] ?? "—"}
                  tone="ok"
                />
              </div>
            ) : (
              <div role="list" aria-label="Respuestas del intento" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                {item.options.map((opt, i) => {
                  const esCorrecta = i === item.correctIndex;
                  const esElegida = i === elegida;
                  const esError = esElegida && !esCorrecta;
                  return (
                    <div
                      key={i}
                      role="listitem"
                      className={`fp-quiz-option${esCorrecta ? " is-correct" : ""}${esError ? " is-wrong" : ""}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 18px", borderRadius: "var(--fd-radius, 12px)",
                        minHeight: 56, width: "100%", textAlign: "left",
                        background: esCorrecta
                          ? "rgba(46,204,113,0.10)"
                          : esError
                            ? "rgba(231,76,60,0.08)"
                            : "var(--fd-panel-alt, rgba(22,61,112,0.03))",
                        border: esCorrecta
                          ? "1.5px solid rgba(46,204,113,0.55)"
                          : esError
                            ? "1.5px solid rgba(231,76,60,0.45)"
                            : "1px solid var(--fd-border, rgba(22,61,112,0.10))",
                        opacity: esCorrecta || esElegida ? 1 : 0.88,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.82rem", fontWeight: 700,
                          background: esCorrecta ? "#1a7a4a" : esError ? "#c0392b" : "var(--fd-panel, rgba(22,61,112,0.08))",
                          color: esCorrecta || esError ? "#FFFFFF" : "var(--fd-text, #163D70)",
                        }}
                      >
                        {LETTERS[i]}
                      </span>
                      <span style={{ fontSize: "0.95rem", color: "var(--fd-text, #081A35)", lineHeight: 1.45, flex: 1 }}>
                        {opt}
                      </span>
                      <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        {esElegida && (
                          <em
                            style={{
                              fontStyle: "normal", fontSize: "0.68rem", fontWeight: 800, letterSpacing: ".05em",
                              padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap",
                              background: esCorrecta ? "rgba(26,122,74,.14)" : "rgba(192,57,43,.12)",
                              color: esCorrecta ? "#1a7a4a" : "#c0392b",
                            }}
                          >
                            TU RESPUESTA
                          </em>
                        )}
                        {esCorrecta ? (
                          <Icon n="checkCircle" size={20} color="#1a7a4a" />
                        ) : esError ? (
                          <Icon n="close" size={20} color="#c0392b" />
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Veredicto + explicación */}
            <div
              style={{
                borderRadius: "var(--fd-radius, 12px)", padding: "16px 20px", marginBottom: 4,
                background:
                  estado === true ? "rgba(46,204,113,0.08)" : estado === false ? "rgba(231,76,60,0.06)" : "var(--fd-panel-alt, rgba(22,61,112,0.04))",
                border:
                  estado === true
                    ? "1px solid rgba(46,204,113,0.3)"
                    : estado === false
                      ? "1px solid rgba(231,76,60,0.2)"
                      : "1px solid var(--fd-border, rgba(22,61,112,0.10))",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  {estado === true ? (
                    <Icon n="checkCircle" size={22} color="#1a7a4a" />
                  ) : estado === false ? (
                    <Icon n="close" size={22} color="#c0392b" />
                  ) : (
                    <Icon n="alert" size={22} color="#7E90AD" />
                  )}
                </span>
                <span
                  style={{
                    fontSize: "0.9rem", fontWeight: 700,
                    color: estado === true ? "#1a7a4a" : estado === false ? "#c0392b" : "var(--fd-muted, #5A6F92)",
                  }}
                >
                  {estado === true ? "La contestaste bien" : estado === false ? "La contestaste mal" : "No la respondiste"}
                </span>
              </div>
              {item.explicacion && (
                <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--fd-muted, #555)" }}>{item.explicacion}</p>
              )}
              {item.cita && (
                <span
                  style={{
                    marginTop: 8, padding: "4px 10px",
                    background: "var(--fd-panel-alt, rgba(22,61,112,0.07))", borderLeft: "3px solid #163D70",
                    borderRadius: 3, fontSize: "0.74rem", color: "var(--fd-text, #163D70)", fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}
                >
                  <Icon n="book" size={13} /> {item.cita}
                </span>
              )}
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => onReport(idx)}
                  style={{
                    minHeight: 44, padding: "0 14px",
                    background: "transparent",
                    color: "var(--fd-text, #163D70)", border: "1px solid var(--fd-border, #C9D4E5)", borderRadius: 9,
                    fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}
                >
                  <Icon n="alert" size={14} /> Reportar pregunta
                </button>
              </div>
            </div>
          </div>

          {/* ── NAVEGACIÓN ── */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 10, flexWrap: "wrap", marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              style={navBtn(idx === 0)}
            >
              <Icon n="chevL" size={16} /> Anterior
            </button>
            <span style={{ fontSize: "0.78rem", color: "var(--fd-muted, #5A6F92)", fontWeight: 700 }}>
              {idx + 1} / {total}
            </span>
            {idx + 1 < total ? (
              <button type="button" onClick={() => setIdx((i) => Math.min(total - 1, i + 1))} style={navBtn(false)}>
                Siguiente <Icon n="chevR" size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onExit}
                style={{
                  ...navBtn(false),
                  background: "#7A5C1E", color: "#FFFFFF", border: "none",
                }}
              >
                {exitLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function navBtn(disabled: boolean): React.CSSProperties {
  return {
    minHeight: 44, padding: "0 16px", borderRadius: 9,
    background: "var(--fd-panel, white)",
    color: "var(--fd-text, #163D70)",
    border: "1px solid var(--fd-border, #C9D4E5)",
    fontSize: "0.85rem", fontWeight: 700,
    fontFamily: "'Manrope', sans-serif",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.45 : 1,
    display: "inline-flex", alignItems: "center", gap: 6,
  };
}

function ReadOnlyRow({ label, value, tone }: { label: string; value: string; tone: "ok" | "err" }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 3,
        padding: "12px 16px", borderRadius: "var(--fd-radius, 12px)",
        background: tone === "ok" ? "rgba(46,204,113,0.10)" : "rgba(231,76,60,0.08)",
        border: tone === "ok" ? "1.5px solid rgba(46,204,113,0.5)" : "1.5px solid rgba(231,76,60,0.4)",
      }}
    >
      <small style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: ".05em", color: tone === "ok" ? "#1a7a4a" : "#c0392b" }}>
        {label.toUpperCase()}
      </small>
      <strong style={{ fontSize: "0.95rem", color: "var(--fd-text, #081A35)", fontWeight: 600 }}>{value}</strong>
    </div>
  );
}
