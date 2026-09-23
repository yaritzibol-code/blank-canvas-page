/**
 * Módulo "Línea Aérea": tablero de estudio para la convocatoria de Primer
 * Oficial (Embraer 190 — Aeroméxico Connect / ASPA de México).
 *
 * Cada tarjeta es un cuestionario en modo aprendiendo: la guía oficial del
 * proceso y un manual del curso por tarjeta. Debajo, el historial permite
 * reanudar lo que quedó a medias.
 */
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { useRequireAuth, type BankCount } from "@/lib/store";
import {
  LINEA_AEREA_OFICIAL,
  LINEA_AEREA_OFICIAL_TOTAL,
  LINEA_AEREA_QUIZZES,
  LA_CHAPTERS_BY_FUENTE,
  LEG_PDFS,
  capLabel,
  capPalabra,
  chaptersConConteo,
  type AtpChapter,
} from "@/lib/store/linea-aerea-meta";
import { useBankCounts } from "@/hooks/use-bank-counts";
import { LA_CONVOCATORIA_COPY as CONVOCATORIA } from "@/lib/convocatoria";
import { BancoScreen } from "@/components/banco/BancoScreen";
import { QuizModalPortal } from "@/components/shared/QuizModalPortal";

export const Route = createFileRoute("/dashboard/linea-aerea")({
  component: LineaAereaPage,
});

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Instrument Serif', serif";
const INK = "#081A35";

function LineaAereaPage() {
  const { ready } = useRequireAuth();
  if (!ready) return <div style={{ minHeight: "60vh" }} />;

  return (
    <BancoScreen
      la
      modes={false}
      extras={false}
      header={
        <>
          <LineaAereaHero />
          <QuizCards />
        </>
      }
    />
  );
}

/* ─── Hero: convocatoria ─────────────────────────────── */

function LineaAereaHero() {
  return (
    <div
      className="fd-la-overview"
      style={{
        background: "linear-gradient(145deg, #081A35, #2a2a4e)",
        borderRadius: "var(--fd-radius, 20px)",
        padding: "30px 28px",
        marginBottom: 32,
        maxWidth: 820,
        width: "100%",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(199,160,82,0.2)",
          color: "#C7A052",
          padding: "5px 12px",
          borderRadius: "var(--fd-radius, 20px)",
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 14,
        }}
      >
        <Icon n="plane" size={14} /> {CONVOCATORIA.estado}
      </div>
      <h1
        style={{
          fontFamily: DISPLAY,
          fontSize: "1.7rem",
          color: "white",
          marginBottom: 8,
          lineHeight: 1.2,
        }}
      >
        Primer Oficial — Embraer 190
      </h1>
      <p
        style={{
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.6,
          maxWidth: 620,
        }}
      >
        {CONVOCATORIA.aviso} {CONVOCATORIA.tableroParrafo}
      </p>
    </div>
  );
}

/* ─── Tarjetas de cuestionarios ──────────────────────── */

const quizCardsCss = `
  .fp-la-card { transition: transform .25s cubic-bezier(.3,1,.4,1), box-shadow .25s ease; }
  .fp-question-picker-backdrop { backdrop-filter: blur(6px); }
  .fp-question-picker-option, .fp-question-picker-qty { transition: border-color .18s ease, background-color .18s ease, box-shadow .18s ease, transform .18s ease; }
  .fp-question-picker-option:not(:disabled):hover, .fp-question-picker-qty:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(8,26,53,.08); }
  .fp-question-picker-option:focus-visible, .fp-question-picker-qty:focus-visible, .fp-question-picker-action:focus-visible { outline: 3px solid rgba(90,134,203,.32); outline-offset: 2px; }
  @media (hover: hover) {
    .fp-la-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(26,26,46,0.18); }
    .fp-la-card.fp-la-dark:hover { box-shadow: 0 20px 48px rgba(26,26,46,0.4); }
  }
  .fp-la-card:active { transform: scale(.99); }
  @media (max-width: 540px) {
    .fp-question-picker-backdrop { padding: 10px !important; align-items: center !important; }
    .fp-question-picker-panel { width: 100% !important; max-height: calc(100dvh - 20px) !important; border-radius: 18px !important; }
    .fp-question-picker-scroll { padding: 22px 18px 10px !important; }
    .fp-question-picker-footer { padding: 12px 18px max(16px, env(safe-area-inset-bottom)) !important; }
  }
`;

/**
 * Tarjeta con la anatomía de los modos del CIAAC: distintivo, ícono, título,
 * descripción, lista de lo que incluye y botón de ancho completo.
 */
export function QuizCard({
  dark = false,
  cover,
  badge,
  icon,
  titulo,
  descripcion,
  features,
  to,
  search,
  pdfUrl,
  pdfs,
  onStart,
  ctaLabel = "Iniciar cuestionario →",
}: {
  dark?: boolean;
  cover?: string;
  badge?: string;
  icon: FPIconName;
  titulo: string;
  descripcion: string;
  features: string[];
  to?: string;
  search?: Record<string, unknown>;
  pdfUrl?: string;
  /** Varios PDFs (ej. leyes y reglamentos de Legislación): se muestran en un selector. */
  pdfs?: readonly { label: string; url: string }[];
  /** Si se define, la tarjeta abre un selector en vez de navegar. */
  onStart?: () => void;
  ctaLabel?: string;
}) {
  return (
    <div
      className={`fp-la-card${dark ? " fp-la-dark" : ""}`}
      style={{
        borderRadius: "var(--fd-radius, 20px)",
        padding: "28px 26px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT,
        background: dark ? "linear-gradient(145deg, #081A35, #2a2a4e)" : "var(--fd-panel, white)",
        border: dark ? "3px solid transparent" : "1px solid var(--fd-border, #EEE1C5)",
        boxShadow: dark ? "none" : "0 2px 16px rgba(22,61,112,0.07)",
      }}
    >
      {/* Distintivo (opcional) */}
      {cover && <img src={cover} className="fd-la-cover" alt="" loading="lazy" />}
      {badge ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            alignSelf: "flex-start",
            background: dark
              ? "rgba(199,160,82,0.16)"
              : "var(--fd-panel-alt, rgba(22,61,112,0.08))",
            color: dark ? "#C7A052" : "var(--fd-text, #163D70)",
            padding: "5px 12px",
            borderRadius: "var(--fd-radius, 20px)",
            marginBottom: 18,
            fontSize: "0.68rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <Icon n={icon} size={13} /> {badge}
        </div>
      ) : null}

      <div
        style={{
          color: dark ? "#C7A052" : "var(--fd-gold, #7A5C1E)",
          marginBottom: 12,
          display: "flex",
        }}
      >
        <Icon n={icon} size={26} />
      </div>

      <h3
        style={{
          fontFamily: DISPLAY,
          fontSize: "1.3rem",
          lineHeight: 1.2,
          color: dark ? "white" : "var(--fd-text, #081A35)",
          marginBottom: 8,
        }}
      >
        {titulo}
      </h3>
      <p
        style={{
          fontSize: "0.85rem",
          lineHeight: 1.55,
          color: dark ? "rgba(255,255,255,0.72)" : "var(--fd-muted, #4A5872)",
          marginBottom: 16,
        }}
      >
        {descripcion}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        {features.map((f) => (
          <div
            key={f}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
              fontSize: "0.8rem",
              lineHeight: 1.45,
              color: dark ? "rgba(255,255,255,0.85)" : "var(--fd-text, #123360)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                flexShrink: 0,
                marginTop: 7,
                background: dark ? "#C7A052" : "#7A5C1E",
              }}
            />
            {f}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {onStart ? (
          <button
            type="button"
            onClick={onStart}
            style={{
              padding: "13px 20px",
              borderRadius: "var(--fd-radius, 12px)",
              fontSize: "0.9rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: dark ? "#C7A052" : "#163D70",
              color: dark ? "var(--fd-gold, #7A5C1E)" : "white",
            }}
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            to={to!}
            search={(search ?? {}) as never}
            style={{
              padding: "13px 20px",
              borderRadius: "var(--fd-radius, 12px)",
              fontSize: "0.9rem",
              fontWeight: 700,
              textDecoration: "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: dark ? "#C7A052" : "#163D70",
              color: dark ? "var(--fd-gold, #7A5C1E)" : "white",
            }}
          >
            {ctaLabel}
          </Link>
        )}

        {pdfs && pdfs.length > 0 && (
          <details className="fp-la-pdfs">
            <summary
              style={{
                padding: "10px 20px",
                borderRadius: "var(--fd-radius, 12px)",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                listStyle: "none",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                background: "var(--fd-panel-alt, rgba(22,61,112,0.08))",
                color: "var(--fd-text, #163D70)",
                minHeight: 44,
              }}
            >
              <Icon n="book" size={14} /> Ver PDFs ({pdfs.length})
            </summary>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {pdfs.map((d) => (
                <a
                  key={d.url}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minHeight: 44,
                    padding: "10px 12px",
                    borderRadius: "var(--fd-radius, 10px)",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    lineHeight: 1.35,
                    color: "var(--fd-text, #123360)",
                    background: "var(--fd-panel, #F7FAFF)",
                    border: "1px solid #E4ECF7",
                  }}
                >
                  <Icon n="book" size={13} color="var(--fd-gold, #7A5C1E)" /> {d.label}
                </a>
              ))}
            </div>
          </details>
        )}

        {pdfUrl && !pdfs && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 20px",
              borderRadius: "var(--fd-radius, 12px)",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: "var(--fd-panel-alt, rgba(22,61,112,0.08))",
              color: "var(--fd-text, #163D70)",
            }}
          >
            <Icon n="book" size={14} /> Ver PDF
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── Selector de capítulos (manuales que se estudian por capítulo) ── */

/**
 * Los capítulos del temario que aún no tienen reactivos aparecen, pero no se
 * pueden elegir: así la alumna ve la estructura completa del examen sin
 * arrancar una sesión vacía. El conteo real viene de `useBankCounts`.
 */
export function ChapterPicker({
  code,
  nombre,
  chapters: catalogo,
  totalBanco: totalCatalogo,
  counts,
  searchBase,
  onClose,
}: {
  code: string;
  nombre: string;
  chapters: AtpChapter[];
  totalBanco: number;
  /** Conteo vivo (`useBankCounts`); sin él se usan los totales del catálogo. */
  counts?: BankCount[];
  /** Parámetros base de navegación (la guía oficial no usa `fuente`). */
  searchBase?: Record<string, string | number | boolean>;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  /** `capítulo:sección` permite separar subdivisiones que comparten capítulo. */
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [qty, setQty] = useState<string>("50");
  const [customQty, setCustomQty] = useState("");
  /** Sin capítulos (guía oficial) solo se elige la cantidad de preguntas. */
  const conCapitulos = catalogo.length > 0;
  const vivo = conCapitulos ? chaptersConConteo(code, catalogo, counts) : null;
  const chapters = vivo?.chapters ?? catalogo;
  const totalBanco = vivo?.total ?? totalCatalogo;
  const unidad = capLabel(code);
  /**
   * Solo el ATP mezcla helicóptero en capítulos de avión (Cap. 1 y 3): la
   * casilla deja esos reactivos fuera de la sesión. Desmarcada por defecto.
   */
  const ofreceSinHeli = code === "ATP";
  const [sinHeli, setSinHeli] = useState(false);
  const all = sel.size === 0;
  const disponibles = all
    ? totalBanco
    : chapters.reduce((s, c) => {
        if (c.subsections?.length) {
          return (
            s +
            c.subsections
              .filter((sub) => sel.has(`${c.num}:${sub.key}`))
              .reduce((subtotal, sub) => subtotal + sub.total, 0)
          );
        }
        return s + (sel.has(String(c.num)) ? c.total : 0);
      }, 0);

  /** Presets que caben en la selección actual (no ofrecer 50/100 si no hay). */
  const presets = ["10", "25", "50", "100"].filter((v) => parseInt(v, 10) <= disponibles);
  const opciones = [...presets, "todas", "custom"];
  const qtyActiva = opciones.includes(qty) ? qty : "todas";

  const qtyNum = (() => {
    if (qtyActiva === "todas") return disponibles;
    if (qtyActiva === "custom") {
      const n = parseInt(customQty, 10);
      return Number.isInteger(n) && n > 0 ? Math.min(n, disponibles) : 0;
    }
    return Math.min(parseInt(qtyActiva, 10), disponibles);
  })();

  function toggle(key: string) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function start() {
    const selected = [...sel];
    const caps = selected
      .map((key) => Number(key.split(":")[0]))
      .filter((num, index, nums) => Number.isFinite(num) && nums.indexOf(num) === index)
      .sort((a, b) => a - b)
      .join(",");
    const search: Record<string, string | number | boolean> = searchBase
      ? { ...searchBase }
      : { fuente: code };
    if (caps) search.caps = caps;
    if (selected.some((key) => key.includes(":"))) search.parts = selected.sort().join("|");
    if (ofreceSinHeli && sinHeli) search.sinHeli = true;
    if (qtyNum > 0 && (qtyNum < disponibles || searchBase)) search.qty = qtyNum;
    void navigate({ to: "/cuestionario", search: search as never });
  }

  return (
    <QuizModalPortal onClose={onClose}>
      <div
        className="fp-question-picker-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label={`Elegir preguntas de ${nombre}`}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          /* Por encima del sidebar fijo (z-index 200) para no quedar tapado. */
          zIndex: 300,
          background: "rgba(26,26,46,0.62)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          overflow: "hidden",
        }}
      >
        <div
          className="fp-question-picker-panel"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--fd-panel, white)",
            borderRadius: "var(--fd-radius, 20px)",
            width: "min(560px, calc(100vw - 32px))",
            maxWidth: "100%",
            maxHeight: "calc(100dvh - 32px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: FONT,
            color: "var(--fd-text, #081A35)",
            border: "1px solid rgba(242,220,219,0.92)",
            boxShadow: "0 30px 80px rgba(26,26,46,0.38), 0 2px 8px rgba(8,26,53,0.08)",
          }}
        >
          <div
            className="fp-question-picker-scroll"
            style={{ overflowY: "auto", padding: "26px 24px 8px", minHeight: 0 }}
          >
            <h3
              style={{
                fontFamily: DISPLAY,
                fontSize: "1.25rem",
                marginBottom: 6,
                lineHeight: 1.25,
              }}
            >
              {conCapitulos ? `${nombre} — elige ${capPalabra(code, 2)}` : nombre}
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--fd-muted, #4A5872)",
                marginBottom: 18,
                lineHeight: 1.5,
              }}
            >
              {conCapitulos
                ? `Sin selección, el cuestionario mezcla todo el banco ${nombre}. Marca uno o varios ${capPalabra(code, 2)} para enfocarte.`
                : "Elige cuántas preguntas quieres contestar en esta sesión."}
            </p>

            {conCapitulos && (
              <>
                <button
                  className="fp-question-picker-option"

                  type="button"
                  onClick={() => setSel(new Set())}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    marginBottom: 10,
                    cursor: "pointer",
                    padding: "12px 14px",
                    borderRadius: "var(--fd-radius, 12px)",
                    fontFamily: FONT,
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    border: all ? "2px solid #163D70" : "1px solid var(--fd-border, #EEE1C5)",
                    background: all
                      ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                      : "var(--fd-panel, white)",
                    color: "var(--fd-text, #081A35)",
                  }}
                >
                  Todo el banco {nombre} · {totalBanco} preguntas
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {chapters.flatMap((c) => {
                    const rows = c.subsections?.length
                      ? c.subsections.map((sub, index) => ({
                          key: `${c.num}:${sub.key}`,
                          label: `${unidad} ${c.num}${String.fromCharCode(65 + index)} · ${sub.titulo}`,
                          detail: sub.tituloEn,
                          total: sub.total,
                        }))
                      : [
                          {
                            key: String(c.num),
                            label: `${unidad} ${c.num} · ${c.titulo}`,
                            detail: c.detalle ?? c.tituloEn,
                            total: c.total,
                          },
                        ];
                    return rows.map((row) => {
                      const on = sel.has(row.key);
                      /* Capítulo del temario sin reactivos todavía: se ve, no se elige. */
                      const vacio = row.total === 0;
                      return (
                        <button
                          className="fp-question-picker-option"
                          key={row.key}
                          type="button"
                          aria-pressed={on}
                          disabled={vacio}
                          onClick={() => toggle(row.key)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            textAlign: "left",
                            cursor: vacio ? "not-allowed" : "pointer",
                            opacity: vacio ? 0.55 : 1,
                            padding: "12px 14px",
                            borderRadius: "var(--fd-radius, 12px)",
                            fontFamily: FONT,
                            fontSize: "0.85rem",
                            color: "var(--fd-text, #081A35)",
                            border: on
                              ? "2px solid #7A5C1E"
                              : "1px solid var(--fd-border, #EEE1C5)",
                            background: on ? "rgba(122,92,30,0.06)" : "var(--fd-panel, white)",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>
                            {row.label}
                            <span
                              style={{
                                display: "block",
                                fontWeight: 500,
                                color: "var(--fd-muted, #4A5872)",
                                fontSize: "0.76rem",
                              }}
                            >
                              {row.detail}
                            </span>
                          </span>
                          <span
                            style={{
                              color: "var(--fd-muted, #4A5872)",
                              fontSize: "0.78rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {vacio ? "Sin preguntas aún" : `${row.total} preg.`}
                          </span>
                        </button>
                      );
                    });
                  })}
                </div>
              </>
            )}

            {/* Solo ATP: dejar fuera los reactivos de helicóptero */}
            {ofreceSinHeli && (
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginTop: 14,
                  padding: "12px 14px",
                  borderRadius: "var(--fd-radius, 12px)",
                  cursor: "pointer",
                  border: sinHeli ? "2px solid #163D70" : "1px solid var(--fd-border, #EEE1C5)",
                  background: sinHeli
                    ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                    : "var(--fd-panel, white)",
                }}
              >
                <input
                  type="checkbox"
                  checked={sinHeli}
                  onChange={(e) => setSinHeli(e.target.checked)}
                  style={{
                    marginTop: 2,
                    accentColor: "#163D70",
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                  Quitar las preguntas de helicópteros
                  <span
                    style={{
                      display: "block",
                      fontWeight: 500,
                      color: "var(--fd-muted, #4A5872)",
                      fontSize: "0.76rem",
                      lineHeight: 1.45,
                    }}
                  >
                    Deja fuera Helicopter Regulations, Helicopter Aerodynamics y cualquier reactivo
                    que hable de helicópteros. La convocatoria es de ala fija.
                  </span>
                </span>
              </label>
            )}

            {/* ¿Cuántas preguntas? — mismo criterio que el CIAAC */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>
                ¿Cuántas preguntas?
              </div>
              <div
                style={{ fontSize: "0.78rem", color: "var(--fd-muted, #4A5872)", marginBottom: 10 }}
              >
                Hay {disponibles} disponibles con tu selección
                {ofreceSinHeli && sinHeli ? " (menos las de helicópteros)" : ""}.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {opciones.map((v) => {
                  const on = qtyActiva === v;
                  const label = v === "todas" ? "Todas" : v === "custom" ? "Personalizar" : v;
                  return (
                    <button
                      className="fp-question-picker-qty"
                      key={v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setQty(v)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "var(--fd-radius, 10px)",
                        cursor: "pointer",
                        minHeight: 44,
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        border: `2px solid ${on ? "#163D70" : "#EEE1C5"}`,
                        background: on
                          ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                          : "var(--fd-panel, #f8f9ff)",
                        color: on ? "var(--fd-text, #163D70)" : "var(--fd-text, #081A35)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {qtyActiva === "custom" && (
                <input
                  type="number"
                  min={1}
                  max={disponibles}
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                  placeholder={`Entre 1 y ${disponibles}`}
                  aria-label="Número de preguntas"
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "var(--fd-radius, 10px)",
                    border: "1px solid var(--fd-border, #EEE1C5)",
                    fontFamily: FONT,
                    fontSize: "0.9rem",
                    color: "var(--fd-text, #081A35)",
                    outline: "none",
                  }}
                />
              )}
            </div>

            {/* Leyenda de Pathy */}
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderRadius: "var(--fd-radius, 12px)",
                background: "rgba(122,92,30,0.05)",
                border: "1px solid rgba(122,92,30,0.12)",
                fontSize: "0.8rem",
                color: "var(--fd-gold, #7A5C1E)",
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            >
              Al terminar, Pathy analizará tu rendimiento personalmente: mira lo que tiene que
              decir.
            </div>
          </div>

          <div
            className="fp-question-picker-footer"
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              padding: "14px 24px 20px",
              borderTop: "1px solid var(--fd-border, #EEE1C5)",
              background: "var(--fd-panel, white)",
              flexShrink: 0,
            }}
          >
            <button
              className="fp-question-picker-action"
              type="button"
              onClick={onClose}
              style={{
                flex: "0 0 auto",
                padding: "12px 18px",
                borderRadius: "var(--fd-radius, 12px)",
                cursor: "pointer",
                border: "1px solid var(--fd-border, #EEE1C5)",
                background: "var(--fd-panel, white)",
                color: "var(--fd-text, #081A35)",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              Cancelar
            </button>
            <button
              className="fp-question-picker-action"
              type="button"
              onClick={start}
              disabled={qtyNum < 1}
              style={{
                flex: "1 1 190px",
                padding: "12px 18px",
                borderRadius: "var(--fd-radius, 12px)",
                cursor: qtyNum < 1 ? "not-allowed" : "pointer",
                border: "none",
                background: qtyNum < 1 ? "#C9D6E8" : "#163D70",
                color: "white",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              Iniciar con {qtyNum} preguntas →
            </button>
          </div>
        </div>
      </div>
    </QuizModalPortal>
  );
}

/**
 * Bancos que se estudian por capítulos: todos los manuales del temario
 * (ATP, Handbook, Jeppesen, Legislación y Anexo 10), con la misma tabla que
 * usan el cuestionario, Pathy y el panel admin.
 */
const CHAPTER_BANKS: Record<string, { chapters: AtpChapter[]; total: number }> = Object.fromEntries(
  Object.entries(LA_CHAPTERS_BY_FUENTE).map(([code, chapters]) => [
    code,
    { chapters, total: chapters.reduce((s, c) => s + c.total, 0) },
  ]),
);

function QuizCards() {
  const [selectedSource, setSelectedSource] = useState("ATP");
  const covers: Record<string, string> = {
    ATP: "fuente-ATP.jpg",
    PHAK: "fuente-PHAK.jpg",
    JEPP: "fuente-Jeppesen.jpg",
    ANX10: "fuente-Anexo10.jpg",
  };
  const [picker, setPicker] = useState<string | null>(null);
  const counts = useBankCounts();
  const pickerQuiz = picker ? LINEA_AEREA_QUIZZES.find((q) => q.code === picker) : null;
  const pickerBank = picker ? CHAPTER_BANKS[picker] : null;
  return (
    <div
      style={{
        maxWidth: 820,
        width: "100%",
        fontFamily: FONT,
        color: "var(--fd-text, #081A35)",
        marginBottom: 8,
      }}
    >
      <style>{quizCardsCss}</style>
      <h2
        style={{
          fontFamily: DISPLAY,
          fontSize: "1.15rem",
          color: "var(--fd-text, #081A35)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <Icon n="book" size={18} color="var(--fd-gold, #7A5C1E)" /> Cuestionarios
      </h2>

      {picker && (pickerBank || picker === "OFICIAL") && (
        <ChapterPicker
          code={picker === "OFICIAL" ? "OFICIAL" : picker}
          nombre={
            picker === "OFICIAL" ? LINEA_AEREA_OFICIAL.titulo : (pickerQuiz?.titulo ?? picker)
          }
          chapters={pickerBank ? pickerBank.chapters : []}
          totalBanco={pickerBank ? pickerBank.total : LINEA_AEREA_OFICIAL_TOTAL}
          counts={counts}
          searchBase={picker === "OFICIAL" ? { banco: "la", modo: "oficial" } : undefined}
          onClose={() => setPicker(null)}
        />
      )}

      <div className="fd-source-cards" role="group" aria-label="Elegir fuente de estudio">
        {LINEA_AEREA_QUIZZES.map((q) => (
          <button
            key={q.code}
            aria-pressed={selectedSource === q.code}
            onClick={() => setSelectedSource(q.code)}
            style={{
              backgroundImage: `linear-gradient(180deg,#02070f22,#02070feb 80%),url('/flightdeck/${covers[q.code] ?? "foto-biblioteca.jpg"}')`,
            }}
          >
            <small>{q.code}</small>
            <span>
              <strong>{q.titulo}</strong>
              <small>{q.total.toLocaleString("es-MX")} preguntas</small>
            </span>
          </button>
        ))}
      </div>
      <div className="fd-la-grid" style={{ gap: 20 }}>
        {/* Guía oficial del proceso */}
        <QuizCard
          dark
          cover="/flightdeck/foto-piloto-cabina.jpg"
          badge="Preguntas oficiales"
          icon="target"
          titulo={LINEA_AEREA_OFICIAL.titulo}
          descripcion={LINEA_AEREA_OFICIAL.descripcion}
          features={[
            `${LINEA_AEREA_OFICIAL_TOTAL} preguntas de la guía oficial`,
            "Elige cuántas preguntas quieres contestar",
            "Feedback inmediato por respuesta",
            'Botón "Explícamelo Yaris" siempre visible',
          ]}
          onStart={() => setPicker("OFICIAL")}
          ctaLabel="Elegir preguntas →"
        />

        {/* Un cuestionario por manual del curso */}
        {LINEA_AEREA_QUIZZES.filter((q) => q.code === selectedSource).map((q) => {
          const bank = CHAPTER_BANKS[q.code];
          const vivo = bank ? chaptersConConteo(q.code, bank.chapters, counts) : null;
          const total = vivo?.total ?? bank?.total ?? q.total;
          return bank ? (
            <QuizCard
              key={q.code}
              cover={"/flightdeck/" + (covers[q.code] ?? "foto-biblioteca.jpg")}

              icon={q.icon as FPIconName}
              titulo={q.titulo}
              descripcion={q.descripcion}
              features={[
                `${total} preguntas en ${bank.chapters.length} ${capPalabra(q.code, bank.chapters.length)}`,
                `Elige uno, varios o todos los ${capPalabra(q.code, 2)}`,
                "Feedback inmediato por respuesta",
                'Botón "Explícamelo Yaris" siempre visible',
              ]}
              onStart={() => setPicker(q.code)}
              ctaLabel={`Elegir ${capPalabra(q.code, 2)} →`}
              pdfUrl={q.fileUrl}
              pdfs={q.code === "LEG" ? LEG_PDFS : undefined}
            />
          ) : (
            <QuizCard
              key={q.code}
              badge="Manual del curso"
              cover={"/flightdeck/" + (covers[q.code] ?? "foto-biblioteca.jpg")}
              icon={q.icon as FPIconName}
              titulo={q.titulo}
              descripcion={q.descripcion}
              features={[
                `${q.total} preguntas del manual`,
                "Feedback inmediato por respuesta",
                'Botón "Explícamelo Yaris" siempre visible',
                "PDF del manual a la mano",
              ]}
              to="/cuestionario"
              search={{ fuente: q.code }}
              pdfUrl={q.fileUrl}
            />
          );
        })}
      </div>
    </div>
  );
}
