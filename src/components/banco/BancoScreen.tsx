import { ASSETS } from "@/components/flightdeck/destinations";
import { LaunchButton, isTyping } from "@/components/flightdeck/FlightDeck";
import { CheckCircle, AirplaneTakeoff, BookOpen } from "@phosphor-icons/react";
/**
 * Pantalla de banco de preguntas (Simulador + Aprendiendo + historial).
 * La usan `/dashboard/banco` (CIAAC) y `/dashboard/linea-aerea` (banco LA),
 * para que ambas experiencias sean idénticas 1:1.
 */
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { PathyMark } from "@/components/shared/PathyMark";
import {
  useSessionUser,
  useStore,
  materiaPerformance,
  studentStats,
  getSimAttempts,
  getQuizAttempts,
  canStartSimulator,
  isPaid,
  listActiveSessions,
  materiaBySlug,
  MATERIAS_DEF,
} from "@/lib/store";
import type { QuizAttempt, SimAttempt } from "@/lib/store";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { QuizModalPortal } from "@/components/shared/QuizModalPortal";
import {
  LINEA_AEREA_OFICIAL,
  LINEA_AEREA_QUIZZES as LINEA_AEREA_QUIZZES_LA,
} from "@/lib/store/linea-aerea-meta";
import { ExtrasPanel } from "@/components/banco/ExtrasPanel";

/* ─── Types ─────────────────────────────────────────── */

interface WeaknessItem {
  icon: string;
  name: string;
  detail: string;
  score: number;
}

interface StrengthItem {
  name: string;
  score: number;
}

interface HistEntry {
  id: string;
  type: "exam" | "learn";
  title: string;
  meta: string;
  score: number;
  tag: string;
  result: { correct: number; total: number };
  weaknesses: WeaknessItem[];
  strengths: StrengthItem[];
  pathyPrefix: string;
  pathyTip: string;
}

/* ─── Static data ────────────────────────────────────── */

/** Derivado de MATERIAS_DEF: el registro canónico es la única fuente. */
const SECTOR_CODES: Record<string, string> = {
  aerodinamica: "AER",
  "aeronaves-motores": "MOT",
  legislacion: "LEG",
  medicina: "MED",
  meteorologia: "MET",
  navegacion: "NAV",
  "servicios-transito": "ATS",
  comunicaciones: "COM",
  "manuales-ais": "AIP",
  "factores-humanos": "FH",
  "seguridad-aerea": "SEG",
  operaciones: "OPS",
};
const MATERIAS: { label: string; slug: string }[] = MATERIAS_DEF.map((m) => ({
  label: m.name,
  slug: m.slug,
}));

/* ─── Helpers ────────────────────────────────────────── */

function scoreColor(score: number): string {
  if (score >= 80) return "#2ecc71";
  if (score >= 60) return "#f39c12";
  return "#e74c3c";
}

function fmtFecha(iso: string): string {
  const d = new Date(iso);
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diffDays <= 0) return "hoy";
  if (diffDays === 1) return "ayer";
  if (diffDays < 30) return `hace ${diffDays} días`;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDurMin(min: number): string {
  if (min >= 60) return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}min`;
  return `${min} min`;
}

interface MateriaBreak {
  slug: string;
  name: string;
  icon: string;
  correct: number;
  total: number;
  pct: number;
}

function materiaBreakdown(
  porMateria: Record<string, { correct: number; total: number }>,
): MateriaBreak[] {
  return Object.entries(porMateria)
    .filter(([, v]) => v.total > 0)
    .map(([slug, v]) => {
      const def = materiaBySlug(slug);
      return {
        slug,
        name: def?.name ?? slug,
        icon: def?.icon ?? "help",
        correct: v.correct,
        total: v.total,
        pct: Math.round((v.correct / v.total) * 100),
      };
    });
}

function toWeakness(m: MateriaBreak): WeaknessItem {
  return {
    icon: m.icon,
    name: m.name,
    detail: `${m.correct} de ${m.total} correctas`,
    score: m.pct,
  };
}

function simToEntry(a: SimAttempt): HistEntry {
  const score = Math.round(a.scorePct);
  const items = materiaBreakdown(a.porMateria);
  const asc = [...items].sort((x, y) => x.pct - y.pct);
  const desc = [...items].sort((x, y) => y.pct - x.pct);
  const weakest = asc[0];
  const pathyPrefix = score >= 80 ? "Pathy dice:" : "Pathy recomienda:";
  const pathyTip =
    score >= 80
      ? `¡Felicidades! Aprobaste el simulador con ${score}%. Mantén tu ritmo de estudio para llegar al examen real con la misma confianza.`
      : weakest
        ? `Refuerza ${weakest.name} esta semana — obtuviste ${weakest.pct}% ahí. Una sesión de estudio enfocada en esa materia te acercará al 80% que necesitas.`
        : "Sigue practicando: cada simulador es un paso más hacia el 80% que necesitas para aprobar.";
  return {
    id: a.id,
    type: "exam",
    title: "Simulador CIAAC",
    meta: `${a.total} preguntas · ${fmtDurMin(Math.round(a.durationSecs / 60))} · ${fmtFecha(a.date)}`,
    score,
    tag: "Simulador",
    result: { correct: a.correct, total: a.total },
    weaknesses: asc.slice(0, 3).map(toWeakness),
    strengths: desc.slice(0, 3).map((m) => ({ name: m.name, score: m.pct })),
    pathyPrefix,
    pathyTip,
  };
}

function quizToEntry(a: QuizAttempt): HistEntry {
  const score = a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0;
  const materiaTitle =
    a.titulo ??
    (a.materias.length === 1
      ? (materiaBySlug(a.materias[0])?.name ?? a.materias[0])
      : "Varias materias");
  const items = materiaBreakdown(a.porMateria);
  const asc = [...items].sort((x, y) => x.pct - y.pct);
  const weak = asc.filter((m) => m.pct < 70).slice(0, 3);
  const weakest = weak[0];
  const pathyPrefix = score >= 80 ? "Pathy dice:" : "Pathy recomienda:";
  const pathyTip =
    score >= 80
      ? `¡Excelente sesión! Lograste ${score}% de aciertos. Sigue con este ritmo de estudio.`
      : weakest
        ? `Tu punto más débil fue ${weakest.name} (${weakest.pct}% de aciertos). Te recomiendo una sesión de preguntas solo de esa materia. ¡Pronto la dominarás!`
        : `Vas por buen camino con ${score}% de aciertos. Repite la sesión para afianzar lo aprendido.`;
  return {
    id: a.id,
    type: "learn",
    title: `Aprendiendo — ${materiaTitle}`,
    meta: `${a.total} preguntas · ${fmtDurMin(a.durationMin)} · ${fmtFecha(a.date)}`,
    score,
    tag: "Estudio",
    result: { correct: a.correct, total: a.total },
    weaknesses: weak.map(toWeakness),
    strengths: [],
    pathyPrefix,
    pathyTip,
  };
}

/* ─── Sesiones a medias ──────────────────────────────── */

const VERDE = "#2E9E63";
const AMBAR = "#E0A800";

const LA_QUIZ_BY_CODE = new Map(LINEA_AEREA_QUIZZES_LA.map((q) => [q.code, q]));

/** Módulo al que pertenece cada pantalla del banco. */
export type BancoTrack = "ciaac" | "la";

/** Una sesión sin terminar, lista para reanudarse desde el historial. */
interface ResumeEntry {
  key: string;
  title: string;
  when: string;
  done: number;
  total: number;
  to: "/cuestionario" | "/simulador";
  search: Record<string, unknown>;
}

function relTime(ts: number): string {
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d <= 1 ? "ayer" : `hace ${d} días`;
}

/**
 * Traduce las sesiones guardadas del navegador a filas del historial. Solo
 * devuelve las de esta pantalla (CIAAC o Línea Aérea) y con avance real.
 */
function buildResumables(userId: string, track: BancoTrack): ResumeEntry[] {
  return listActiveSessions(userId)
    .map((s): ResumeEntry | null => {
      if (s.kind === "simulador") {
        const esLa = s.variant === "la";
        if (esLa !== (track === "la")) return null;
        const qs = (s.data as { questions?: { answered: boolean }[] } | null)?.questions ?? [];
        const done = qs.filter((q) => q.answered).length;
        if (qs.length === 0 || done === 0 || done >= qs.length) return null;
        return {
          key: `sim|${s.variant}`,
          title: esLa ? "Simulador Línea Aérea" : "Simulador CIAAC",
          when: relTime(s.savedAt),
          done,
          total: qs.length,
          to: "/simulador",
          search: esLa ? { banco: "la" } : {},
        };
      }

      // Modo aprendiendo: la llave guarda la configuración de la sesión.
      // El orden debe coincidir EXACTO con `sessionVariant` de /cuestionario:
      // materias|fuente|banco|fuentes|modo|caps|qty. Al faltar `caps` aquí,
      // `qty` recibía la lista de capítulos ("1,2" → NaN) y el cuestionario
      // reanudado se quedaba sin preguntas.
      const [materias = "", fuente = "", banco = "", fuentes = "", modo = "", caps = "", qty = ""] =
        s.variant.split("|");

      const sesionTrack: BancoTrack =
        banco === "la" || LA_QUIZ_BY_CODE.has(fuente) ? "la" : "ciaac";
      if (sesionTrack !== track) return null;

      const data = s.data as { results?: (boolean | null)[]; qIds?: string[] } | null;
      const total = data?.qIds?.length ?? 0;
      const done = (data?.results ?? []).filter((r) => r !== null).length;
      if (total === 0 || done === 0 || done >= total) return null;

      const manual = fuente ? LA_QUIZ_BY_CODE.get(fuente) : undefined;
      const title = manual
        ? `Cuestionario — ${manual.titulo}`
        : banco === "la" && modo === "oficial"
          ? LINEA_AEREA_OFICIAL.titulo
          : banco === "la"
            ? "Cuestionario — Línea Aérea"
            : !materias || materias === "all"
              ? "Cuestionario — todas las materias"
              : `Cuestionario — ${materias
                  .split(",")
                  .map((slug) => materiaBySlug(slug)?.name ?? slug)
                  .join(", ")}`;

      const search: Record<string, unknown> = {};
      if (fuente) search.fuente = fuente;
      if (banco === "la") search.banco = "la";
      if (fuentes) search.fuentes = fuentes;
      if (modo === "oficial" || modo === "potenciado") search.modo = modo;
      if (materias && materias !== "all") search.materias = materias;
      if (caps) search.caps = caps;
      if (qty && Number.isFinite(Number(qty))) search.qty = Number(qty);

      return {
        key: `apr|${s.variant}`,
        title,
        when: relTime(s.savedAt),
        done,
        total,
        to: "/cuestionario",
        search,
      };
    })
    .filter((x): x is ResumeEntry => x !== null);
}

/** Fila ámbar del historial: cuestionario incompleto, con botón de reanudar. */
function ResumeItem({ entry }: { entry: ResumeEntry }) {
  const pct = Math.round((entry.done / entry.total) * 100);
  return (
    <div
      style={{
        background: "var(--fd-panel, white)",
        borderRadius: "var(--fd-radius, 12px)",
        borderLeft: `4px solid ${AMBAR}`,
        boxShadow: "0 2px 8px rgba(22,61,112,0.05)",
        overflow: "hidden",
        fontFamily: "'Manrope', sans-serif",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 220 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--fd-radius, 10px)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(224,168,0,0.12)",
            color: AMBAR,
          }}
        >
          <Icon n="clock" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 3,
            }}
          >
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fd-text, #081A35)" }}>
              {entry.title}
            </h4>
            <span
              style={{
                padding: "2px 9px",
                borderRadius: "var(--fd-radius, 20px)",
                fontSize: "0.68rem",
                fontWeight: 800,
                background: "rgba(224,168,0,0.14)",
                color: "#8a6000",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Incompleto
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--fd-muted, #4A5872)", marginBottom: 7 }}>
            {entry.done} de {entry.total} respondidas · {entry.when}
          </p>
          <div
            style={{
              height: 5,
              borderRadius: 4,
              background: "rgba(224,168,0,0.16)",
              overflow: "hidden",
              maxWidth: 260,
            }}
          >
            <div style={{ width: `${pct}%`, height: "100%", background: AMBAR, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      <Link
        to={entry.to}
        search={entry.search as never}
        style={{
          padding: "10px 18px",
          borderRadius: "var(--fd-radius, 11px)",
          background: AMBAR,
          color: "#3d2c00",
          fontSize: "0.82rem",
          fontWeight: 800,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          whiteSpace: "nowrap",
        }}
      >
        <Icon n="play" size={14} /> Reanudar
      </Link>
    </div>
  );
}

/* ─── HistItem ───────────────────────────────────────── */

function HistItem({ entry }: { entry: HistEntry }) {
  const [open, setOpen] = useState(false);
  const color = scoreColor(entry.score);

  return (
    <div
      style={{
        background: "var(--fd-panel, white)",
        borderRadius: "var(--fd-radius, 12px)",
        borderLeft: `4px solid ${VERDE}`,
        boxShadow: "0 2px 8px rgba(22,61,112,0.05)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        fontFamily: "'Manrope', sans-serif",
      }}
      onClick={() => setOpen(!open)}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(22,61,112,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(22,61,112,0.05)")}
    >
      {/* Top row */}
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--fd-radius, 10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              flexShrink: 0,
              color: entry.type === "exam" ? "var(--fd-text, #081A35)" : "var(--fd-text, #163D70)",
              background:
                entry.type === "exam"
                  ? "var(--fd-panel-alt, rgba(26,26,46,0.08))"
                  : "var(--fd-panel-alt, rgba(22,61,112,0.08))",
            }}
          >
            {entry.type === "exam" ? <Icon n="sim" size={18} /> : <Icon n="book" size={18} />}
          </div>
          <div>
            <h4
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--fd-text, #081A35)",
                marginBottom: 2,
              }}
            >
              {entry.title}
            </h4>
            <p style={{ fontSize: "0.75rem", color: "var(--fd-muted, #4A5872)" }}>{entry.meta}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "1.2rem",
              fontWeight: 900,
              color,
            }}
          >
            {entry.score}%
          </span>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "var(--fd-radius, 20px)",
              fontSize: "0.72rem",
              fontWeight: 700,
              background:
                entry.type === "exam"
                  ? "var(--fd-panel-alt, rgba(26,26,46,0.06))"
                  : "var(--fd-panel-alt, rgba(22,61,112,0.08))",
              color: entry.type === "exam" ? "var(--fd-text, #081A35)" : "var(--fd-text, #163D70)",
            }}
          >
            {entry.tag}
          </span>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "var(--fd-radius, 20px)",
              fontSize: "0.68rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              background: "rgba(46,158,99,0.12)",
              color: VERDE,
            }}
          >
            Completado
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "#bbb",
              transition: "transform 0.3s",
              display: "inline-flex",
              transform: open ? "rotate(180deg)" : "none",
            }}
          >
            <Icon n="chevD" size={14} />
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--fd-border, #EEE1C5)",
            padding: "16px 18px 18px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Result bar */}
          <div style={{ marginBottom: 14 }}>
            <h5
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--fd-muted, #4A5872)",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Icon n="chart" size={16} /> Resultado general
            </h5>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: "0.82rem",
                color: "var(--fd-muted, #666)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: "var(--fd-panel, #EEE1C5)",
                  borderRadius: "var(--fd-radius, 10px)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "var(--fd-radius, 10px)",
                    background: color,
                    width: `${entry.score}%`,
                  }}
                />
              </div>
              <span>
                {entry.result.correct}/{entry.result.total} correctas
              </span>
            </div>
          </div>

          {/* Weaknesses */}
          {entry.weaknesses.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <h5
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--fd-muted, #4A5872)",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Icon n="alert" size={16} /> Áreas de oportunidad — lo que más te falló
              </h5>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entry.weaknesses.map((w, i) => {
                  const isBad = w.score < 60;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "var(--fd-radius, 10px)",
                        gap: 10,
                        background: isBad ? "rgba(231,76,60,0.05)" : "rgba(243,156,18,0.05)",
                        border: isBad
                          ? "1px solid rgba(231,76,60,0.15)"
                          : "1px solid rgba(243,156,18,0.15)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.1rem",
                            flexShrink: 0,
                            marginTop: 2,
                            display: "flex",
                            color: isBad ? "#e74c3c" : "#f39c12",
                          }}
                        >
                          <Icon n={w.icon as never} size={18} />
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: "0.83rem",
                              fontWeight: 700,
                              color: "var(--fd-text, #081A35)",
                              marginBottom: 2,
                            }}
                          >
                            {w.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.76rem",
                              color: "var(--fd-muted, #4A5872)",
                              lineHeight: 1.4,
                            }}
                          >
                            {w.detail}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Instrument Serif', serif",
                          fontSize: "1rem",
                          fontWeight: 900,
                          flexShrink: 0,
                          color: scoreColor(w.score),
                        }}
                      >
                        {w.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths */}
          {entry.strengths.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <h5
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--fd-muted, #4A5872)",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Icon n="check" size={16} /> Lo que dominaste bien
              </h5>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {entry.strengths.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(46,204,113,0.06)",
                      border: "1px solid rgba(46,204,113,0.2)",
                      borderRadius: 8,
                      fontSize: "0.83rem",
                      fontWeight: 600,
                      color: "var(--fd-text, #081A35)",
                    }}
                  >
                    <span>{s.name}</span>
                    <span
                      style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: "1rem",
                        fontWeight: 900,
                        color: "#2ecc71",
                      }}
                    >
                      {s.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pathy tip */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              background: "linear-gradient(135deg, #EEE1C5, #fce4ec)",
              borderRadius: "var(--fd-radius, 10px)",
              padding: "12px 14px",
              marginTop: 14,
              fontSize: "0.82rem",
              color: "var(--fd-muted, #555)",
              lineHeight: 1.5,
            }}
          >
            <PathyMark size={28} />
            <div>
              <strong style={{ color: "var(--fd-gold, #7A5C1E)" }}>{entry.pathyPrefix}</strong>{" "}
              {entry.pathyTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Modal: Simulador CIAAC ─────────────────────────── */

function ModalExamen({
  onClose,
  onStart,
  la = false,
}: {
  onClose: () => void;
  onStart: (modo: "oficial" | "potenciado") => void;
  la?: boolean;
}) {
  const [modo, setModo] = useState<"oficial" | "potenciado">("oficial");
  const infoRows = la
    ? [
        {
          icon: "help",
          bg: "var(--fd-panel-alt, rgba(22,61,112,0.1))",
          html: "<strong>Preguntas oficiales</strong> — reactivos del proceso de Línea Aérea",
        },
        {
          icon: "timer",
          bg: "rgba(122,92,30,0.08)",
          html: "<strong>Tiempo límite</strong> — el reloj corre desde que aceptas",
        },
        {
          icon: "refresh",
          bg: "rgba(243,156,18,0.1)",
          html: "<strong>Potenciado</strong> — intercala las demás preguntas del banco",
        },
        {
          icon: "chart",
          bg: "rgba(46,204,113,0.1)",
          html: "<strong>Análisis al terminar</strong> — calificación y áreas de oportunidad con Pathy",
        },
      ]
    : [
        {
          icon: "help",
          bg: "var(--fd-panel-alt, rgba(22,61,112,0.1))",
          html: "<strong>310 preguntas</strong> — igual que el examen real del CIAAC",
        },
        {
          icon: "timer",
          bg: "rgba(122,92,30,0.08)",
          html: "<strong>5 horas límite</strong> — el tiempo corre desde que aceptas",
        },
        {
          icon: "refresh",
          bg: "rgba(243,156,18,0.1)",
          html: "<strong>Preguntas aleatorias</strong> — de las 12 materias del CIAAC",
        },
        {
          icon: "chart",
          bg: "rgba(46,204,113,0.1)",
          html: "<strong>Análisis al terminar</strong> — calificación y áreas de oportunidad con Pathy",
        },
      ];

  return (
    <QuizModalPortal onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={la ? "Configurar simulador Línea Aérea" : "Configurar simulador CIAAC"}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "'Manrope', sans-serif",
          overflow: "hidden",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            background: "var(--fd-panel, white)",
            borderRadius: "var(--fd-radius, 20px)",
            padding: 36,
            maxWidth: 520,
            width: "100%",
            maxHeight: "calc(100dvh - 40px)",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "1.5rem",
              color: "var(--fd-text, #081A35)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon n="target" size={26} /> {la ? "Simulador Línea Aérea" : "Simulador CIAAC"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 24 }}>
            Lee las instrucciones antes de comenzar
          </p>

          {/* Info */}
          <div
            style={{
              background: "var(--fd-panel, #f8f9ff)",
              borderRadius: "var(--fd-radius, 12px)",
              padding: 18,
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {infoRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: "0.88rem",
                  color: "var(--fd-text, #081A35)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    flexShrink: 0,
                    background: row.bg,
                    color: "var(--fd-text, #081A35)",
                  }}
                >
                  <Icon n={row.icon as never} size={18} />
                </div>
                <span dangerouslySetInnerHTML={{ __html: row.html }} />
              </div>
            ))}
          </div>

          {/* Warning */}
          <div
            style={{
              background: "rgba(243,156,18,0.1)",
              border: "1px solid #f39c12",
              borderRadius: "var(--fd-radius, 10px)",
              padding: "12px 16px",
              fontSize: "0.83rem",
              color: "#8a6000",
              marginBottom: 24,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              lineHeight: 1.5,
            }}
          >
            <span style={{ display: "flex", flexShrink: 0 }}>
              <Icon n="alert" size={16} />
            </span>
            <span>
              Si sales de la página durante el examen <strong>perderás tu progreso</strong>.
              Asegúrate de tener tiempo suficiente y buena conexión antes de comenzar.
            </span>
          </div>

          {/* Selector de tipo de simulador (Línea Aérea) */}
          {la && (
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--fd-text, #081A35)",
                  marginBottom: 10,
                }}
              >
                ¿Qué tipo de simulador?
              </h4>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  {
                    id: "oficial" as const,
                    title: "Preguntas oficiales",
                    desc: "Solo el examen oficial del proceso de Línea Aérea.",
                  },
                  {
                    id: "potenciado" as const,
                    title: "Simulador potenciado",
                    desc: "Oficiales + las demás preguntas del banco, intercaladas.",
                  },
                ].map((o) => {
                  const active = modo === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setModo(o.id)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: "var(--fd-radius, 12px)",
                        cursor: "pointer",
                        fontFamily: "'Manrope', sans-serif",
                        border: `2px solid ${active ? "#163D70" : "#EEE1C5"}`,
                        background: active
                          ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                          : "var(--fd-panel, #f8f9ff)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "var(--fd-text, #081A35)",
                        }}
                      >
                        {o.title}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--fd-muted, #4A5872)" }}>
                        {o.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: 12,
                background: "var(--fd-panel, white)",
                color: "var(--fd-muted, #4A5872)",
                border: "1px solid var(--fd-border, #EEE1C5)",
                borderRadius: "var(--fd-radius, 10px)",
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => onStart(modo)}
              style={{
                flex: 2,
                padding: 12,
                background: "#7A5C1E",
                color: "white",
                border: "none",
                borderRadius: "var(--fd-radius, 10px)",
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#977431")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#7A5C1E")}
            >
              <Icon n="target" size={18} /> Aceptar y comenzar
            </button>
          </div>
        </div>
      </div>
    </QuizModalPortal>
  );
}

/* ─── Modal: Aprendiendo ─────────────────────────────── */

function ModalAprendiendo({
  onClose,
  onStart,
  paid,
  onLocked,
  la = false,
  initialMateria,
}: {
  onClose: () => void;
  onStart: (keys: string[], qty: number, modo: "oficial" | "potenciado") => void;
  paid: boolean;
  onLocked: () => void;
  la?: boolean;
  initialMateria?: string;
}) {
  const [modo, setModo] = useState<"oficial" | "potenciado">("oficial");
  const [allSelected, setAllSelected] = useState(!initialMateria);
  const [selectedMaterias, setSelectedMaterias] = useState<Set<string>>(
    new Set(initialMateria ? [initialMateria] : []),
  );
  const [qty, setQty] = useState(paid ? "50" : "10");
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  function handleAllClick() {
    if (allSelected) {
      setAllSelected(false);
    } else {
      setAllSelected(true);
      setSelectedMaterias(new Set());
    }
  }

  function handleMateriaClick(m: string) {
    setAllSelected(false);
    const next = new Set(selectedMaterias);
    if (next.has(m)) next.delete(m);
    else next.add(m);
    setSelectedMaterias(next);
  }

  function handleQtyClick(val: string) {
    if (!paid && val !== "10") {
      onLocked();
      return;
    }
    setQty(val);
    setShowCustom(false);
    setCustomValue("");
    setShowWarning(false);
  }

  function handleCustomClick() {
    if (!paid) {
      onLocked();
      return;
    }
    setQty("custom");
    setShowCustom(true);
  }

  function handleStart() {
    const keys = la
      ? allSelected || selectedMaterias.size === 0
        ? LINEA_AEREA_QUIZZES_LA.map((q) => q.code)
        : LINEA_AEREA_QUIZZES_LA.filter((q) => selectedMaterias.has(q.code)).map((q) => q.code)
      : allSelected || selectedMaterias.size === 0
        ? MATERIAS.map((m) => m.slug)
        : MATERIAS.filter((m) => selectedMaterias.has(m.label)).map((m) => m.slug);
    let qtyNum = 10;
    if (paid) {
      if (qty === "custom") {
        const n = parseInt(customValue);
        qtyNum = !isNaN(n) && n > 0 ? Math.min(n, 500) : 10;
      } else {
        qtyNum = parseInt(qty) || 10;
      }
    }
    onStart(keys, qtyNum, modo);
  }

  function handleCustomInput(val: string) {
    setCustomValue(val);
    const n = parseInt(val);
    setShowWarning(!isNaN(n) && n > 500);
  }

  const chipBase = {
    padding: "6px 13px",
    borderRadius: "var(--fd-radius, 20px)",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Manrope', sans-serif",
  } as const;

  const qtyBase = {
    padding: "7px 18px",
    borderRadius: "var(--fd-radius, 10px)",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Manrope', sans-serif",
  } as const;

  return (
    <QuizModalPortal onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Configurar cuestionario"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "'Manrope', sans-serif",
          overflow: "hidden",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            background: "var(--fd-panel, white)",
            borderRadius: "var(--fd-radius, 20px)",
            padding: 36,
            maxWidth: 520,
            width: "100%",
            maxHeight: "calc(100dvh - 40px)",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "1.5rem",
              color: "var(--fd-text, #081A35)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon n="lightbulb" size={26} /> Configura tu sesión
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 24 }}>
            {la
              ? "Elige los manuales del curso y cuántas preguntas quieres practicar"
              : "Elige las materias y cuántas preguntas quieres practicar"}
          </p>

          {/* Tipo de banco (Línea Aérea) */}
          {la && (
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--fd-text, #081A35)",
                  marginBottom: 10,
                }}
              >
                ¿Qué preguntas?
              </h4>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  {
                    id: "oficial" as const,
                    title: "Preguntas oficiales",
                    desc: "Solo el cuestionario oficial del proceso de Línea Aérea.",
                  },
                  {
                    id: "potenciado" as const,
                    title: "Oficiales + potenciadas",
                    desc: "El oficial más las preguntas de los manuales del curso en FlightPath.",
                  },
                ].map((o) => {
                  const active = modo === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setModo(o.id)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: "var(--fd-radius, 12px)",
                        cursor: "pointer",
                        fontFamily: "'Manrope', sans-serif",
                        border: `2px solid ${active ? "#163D70" : "#EEE1C5"}`,
                        background: active
                          ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                          : "var(--fd-panel, #f8f9ff)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "var(--fd-text, #081A35)",
                        }}
                      >
                        {o.title}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--fd-muted, #4A5872)" }}>
                        {o.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Materias / Manuales */}
          {!(la && modo === "oficial") && (
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--fd-text, #081A35)",
                  marginBottom: 10,
                }}
              >
                {la ? "¿Qué manuales?" : "¿Qué materias?"}
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                <button
                  onClick={handleAllClick}
                  aria-pressed={allSelected}
                  style={{
                    ...chipBase,
                    border: `2px solid ${allSelected ? "#163D70" : "#EEE1C5"}`,
                    background: allSelected ? "#163D70" : "var(--fd-panel, #f8f9ff)",
                    color: allSelected ? "white" : "var(--fd-text, #081A35)",
                  }}
                >
                  {la ? "Todos los manuales" : "Todas las materias"}
                </button>
                {la
                  ? LINEA_AEREA_QUIZZES_LA.map((q) => {
                      const sel = selectedMaterias.has(q.code);
                      return (
                        <button
                          key={q.code}
                          onClick={() => handleMateriaClick(q.code)}
                          aria-pressed={sel}
                          title={q.titulo}
                          style={{
                            ...chipBase,
                            border: `2px solid ${sel ? "#163D70" : "#EEE1C5"}`,
                            background: sel
                              ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                              : "var(--fd-panel, #f8f9ff)",
                            color: sel ? "var(--fd-text, #163D70)" : "var(--fd-text, #081A35)",
                          }}
                        >
                          {q.code}
                        </button>
                      );
                    })
                  : MATERIAS.map((m) => {
                      const sel = selectedMaterias.has(m.label);
                      return (
                        <button
                          key={m.slug}
                          onClick={() => handleMateriaClick(m.label)}
                          aria-pressed={sel}
                          style={{
                            ...chipBase,
                            border: `2px solid ${sel ? "#163D70" : "#EEE1C5"}`,
                            background: sel
                              ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                              : "var(--fd-panel, #f8f9ff)",
                            color: sel ? "var(--fd-text, #163D70)" : "var(--fd-text, #081A35)",
                          }}
                        >
                          {m.label}
                        </button>
                      );
                    })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginBottom: 24 }}>
            <h4
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--fd-text, #081A35)",
                marginBottom: 10,
              }}
            >
              ¿Cuántas preguntas?
            </h4>
            {!paid && (
              <div
                style={{
                  background: "var(--fd-panel, #f8f9ff)",
                  border: "1px solid #E8ECF2",
                  borderRadius: "var(--fd-radius, 10px)",
                  padding: "10px 14px",
                  fontSize: "0.8rem",
                  color: "var(--fd-muted, #4A5872)",
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              >
                Tu plan gratis incluye{" "}
                <strong style={{ color: "var(--fd-text, #081A35)" }}>
                  2 preguntas de cada materia
                </strong>{" "}
                que elijas, de su pool de 10.{" "}
                <button
                  onClick={onLocked}
                  style={{
                    color: "var(--fd-text, #163D70)",
                    fontWeight: 700,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "inherit",
                    fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  Hazte Pro para elegir cuántas
                </button>
              </div>
            )}
            {paid && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["10", "50", "100"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => handleQtyClick(v)}
                    aria-pressed={qty === v}
                    style={{
                      ...qtyBase,
                      border: `2px solid ${qty === v ? "#163D70" : "#EEE1C5"}`,
                      background:
                        qty === v
                          ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                          : "var(--fd-panel, #f8f9ff)",
                      color: qty === v ? "var(--fd-text, #163D70)" : "var(--fd-text, #081A35)",
                    }}
                  >
                    {v}
                  </button>
                ))}
                <button
                  onClick={handleCustomClick}
                  style={{
                    ...qtyBase,
                    border: `2px solid ${qty === "custom" ? "#163D70" : "#EEE1C5"}`,
                    background:
                      qty === "custom"
                        ? "var(--fd-panel-alt, rgba(22,61,112,0.08))"
                        : "var(--fd-panel, #f8f9ff)",
                    color: qty === "custom" ? "var(--fd-text, #163D70)" : "var(--fd-text, #081A35)",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Icon n="pencil" size={15} /> Personalizar
                  </span>
                </button>
              </div>
            )}

            {showCustom && (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="number"
                    value={customValue}
                    onChange={(e) => handleCustomInput(e.target.value)}
                    min={1}
                    placeholder="Ej. 75"
                    autoFocus
                    style={{
                      padding: "8px 14px",
                      border: `2px solid ${
                        showWarning ? "#f39c12" : customValue ? "#2ecc71" : "#EEE1C5"
                      }`,
                      borderRadius: 8,
                      fontSize: "0.88rem",
                      fontFamily: "'Manrope', sans-serif",
                      width: 120,
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--fd-muted, #4A5872)" }}>
                    preguntas
                  </span>
                </div>
                {showWarning && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 12px",
                      background: "rgba(243,156,18,0.1)",
                      border: "1px solid #f39c12",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      color: "#8a6000",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                    }}
                  >
                    <Icon n="alert" size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>
                      El máximo disponible es <strong>500</strong> preguntas para las materias
                      seleccionadas.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: 12,
                background: "var(--fd-panel, white)",
                color: "var(--fd-muted, #4A5872)",
                border: "1px solid var(--fd-border, #EEE1C5)",
                borderRadius: "var(--fd-radius, 10px)",
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleStart}
              style={{
                flex: 2,
                padding: 12,
                background: "#7A5C1E",
                color: "white",
                border: "none",
                borderRadius: "var(--fd-radius, 10px)",
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#977431")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#7A5C1E")}
            >
              <Icon n="lightbulb" size={18} /> Comenzar sesión
            </button>
          </div>
        </div>
      </div>
    </QuizModalPortal>
  );
}

/* ─── Main page ──────────────────────────────────────── */

export function BancoScreen({
  la = false,
  initialModal = null,
  modes = true,
  extras = true,
  header,
  footer,
}: {
  la?: boolean;
  initialModal?: "examen" | "aprendiendo" | null;
  /**
   * Muestra las tarjetas de modo (Simulador / Aprendiendo) y su encabezado.
   * Línea Aérea las apaga: ahí cada manual del curso es su propio cuestionario
   * en modo aprendiendo, así que las tarjetas genéricas sobran.
   */
  modes?: boolean;
  /** Panel de flashcards, audio, presentaciones y Yaris con el material. */
  extras?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const user = useSessionUser();
  const userId = user?.id;
  const navigate = useNavigate();
  const [modal, setModal] = useState<"examen" | "aprendiendo" | null>(initialModal);
  const [upgrade, setUpgrade] = useState<{ feature: string; benefit?: string } | null>(null);
  const [selectedMode, setSelectedMode] = useState<"examen" | "aprendiendo">("examen");
  const [initialMateria, setInitialMateria] = useState<string>();
  const sectors = useStore(() => (user ? materiaPerformance(user.id, "todo") : []));

  const stats = user ? studentStats(user.id) : null;

  // Las sesiones a medias viven en el navegador: se leen tras montar para no
  // desincronizar el HTML del servidor.
  const [resumables, setResumables] = useState<ResumeEntry[]>([]);
  useEffect(() => {
    if (!userId) return;
    setResumables(buildResumables(userId, la ? "la" : "ciaac"));
  }, [userId, la]);

  const history: HistEntry[] = user
    ? [
        ...getSimAttempts(user.id).map((a) => ({ date: a.date, entry: simToEntry(a) })),
        ...getQuizAttempts(user.id).map((a) => ({ date: a.date, entry: quizToEntry(a) })),
      ]
        .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())
        .slice(0, 10)
        .map((x) => x.entry)
    : [];

  function handleStartSim(modo: "oficial" | "potenciado" = "oficial") {
    const gate = canStartSimulator(user);
    setModal(null);
    if (gate.allowed) {
      navigate({
        to: "/simulador",
        search: la ? { modo, banco: "la" as const } : { modo },
      });
    } else {
      setUpgrade({
        feature: la ? "Simulador Línea Aérea" : "Simulador CIAAC",
        benefit: gate.reason,
      });
    }
  }

  function handleStartLearn(
    keys: string[],
    qty: number,
    modo: "oficial" | "potenciado" = "oficial",
  ) {
    setModal(null);
    if (la) {
      navigate({
        to: "/cuestionario",
        search:
          modo === "oficial"
            ? { banco: "la" as const, modo, qty }
            : { banco: "la" as const, modo, fuentes: keys.join(","), qty },
      });
      return;
    }
    navigate({ to: "/cuestionario", search: { materias: keys.join(","), qty } });
  }

  function handleLearnLocked() {
    setUpgrade({
      feature: la ? "Banco completo de Línea Aérea" : "Banco completo de preguntas",
      benefit: la
        ? "Con el acceso completo practicas las preguntas de los cinco manuales del curso de Línea Aérea sin límite."
        : "Con el acceso completo eliges cuántas preguntas practicar y desbloqueas todo el banco de las 12 materias del CIAAC.",
    });
  }

  const EXAM_FEATURES = la
    ? [
        "Elige preguntas oficiales o simulador potenciado",
        "Condiciones de examen con tiempo límite",
        "Calificación al terminar",
        "Análisis de áreas de oportunidad",
        "Pro: ilimitado · Básica: 1 al mes",
      ]
    : [
        "310 preguntas oficiales",
        "5 horas límite de tiempo",
        "Calificación al terminar",
        "Análisis de áreas de oportunidad",
        "Pro: ilimitado · Básica: 1 al mes",
      ];

  const LEARN_FEATURES = la
    ? [
        "Elige uno o varios manuales del curso",
        "Tú decides cuántas preguntas",
        "Feedback inmediato por respuesta",
        'Botón "Explícamelo Yaris" siempre visible',
        "Sin límite de tiempo",
      ]
    : [
        "Elige materia o mezcla todas",
        "Tú decides cuántas preguntas",
        "Feedback inmediato por respuesta",
        'Botón "Explícamelo Yaris" siempre visible',
        "Sin límite de tiempo",
      ];

  return (
    <>
      {header}
      {modes ? (
        <div
          className="fd-bank-layout"
          tabIndex={0}
          aria-label="Preparar una sesión"
          onKeyDown={(event) => {
            if (isTyping(event.target) || event.ctrlKey || event.metaKey || modal) return;
            if (event.key === "1") setSelectedMode("aprendiendo");
            if (event.key === "2") setSelectedMode("examen");
            if (event.key === "Enter" && event.target === event.currentTarget) {
              event.preventDefault();
              setModal(selectedMode);
            }
          }}
        >
          <section className="fd-bank-intro">
            <p className="fd-eyebrow">EXAMEN TEÓRICO · {la ? "LÍNEA AÉREA" : "LICENCIA"}</p>
            <h1>{la ? "Línea Aérea" : "CIAAC"}</h1>
            <p>
              El filtro de tu {la ? "próximo vuelo" : "licencia comercial"}:{" "}
              {la
                ? "los manuales del curso, preguntas explicadas y práctica"
                : "12 materias, banco explicado y un simulacro en formato real"}
              .
            </p>
            <div className="fd-bank-score">
              <div
                className="fd-score-ring"
                style={{ "--score": (stats?.readiness ?? 0) + "%" } as React.CSSProperties}
              >
                <strong>{stats?.readiness ?? "—"}</strong>
                <small>DE 80</small>
              </div>
              <div>
                <small className="fd-eyebrow">PREPARACIÓN ESTIMADA</small>
                <h2>
                  {stats?.readiness === null || !stats
                    ? "Tu primer vuelo"
                    : stats.readiness >= 80
                      ? "Listo para seguir"
                      : "A " + (80 - stats.readiness) + " pts del corte"}
                </h2>
              </div>
            </div>
            <div className="fd-bank-resume">
              {resumables.length ? (
                resumables.map((r) => <ResumeItem key={r.key} entry={r} />)
              ) : (
                <div className="fd-panel">
                  <p className="fd-eyebrow">TU BITÁCORA</p>
                  <strong>{stats?.answered ?? 0} preguntas respondidas</strong>
                  <p>
                    {stats?.quizCount ?? 0} cuestionarios · {stats?.simCount ?? 0} simulacros
                  </p>
                </div>
              )}
            </div>
          </section>
          <section className="fd-bank-center" aria-label="Modos de estudio">
            <div className="fd-mode-cards" role="group" aria-label="Seleccionar modo">
              {(["aprendiendo", "examen"] as const).map((mode, index) => (
                <button
                  key={mode}
                  className={"fd-mode-card" + (selectedMode === mode ? " is-selected" : "")}
                  aria-pressed={selectedMode === mode}
                  onClick={() => setSelectedMode(mode)}
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg,rgba(2,7,15,.12),rgba(2,7,15,.96) 63%),url(" +
                      ASSETS +
                      (mode === "examen"
                        ? "foto-simulador-laptop.jpg"
                        : "foto-ruta-aprendizaje.jpg") +
                      ")",
                  }}
                >
                  <span className="fd-mode-number">
                    <kbd>{index + 1}</kbd>
                    {mode === "examen" ? "INCURSIÓN" : "PATRULLA"}
                  </span>
                  <span className="fd-mode-copy">
                    <small className="fd-eyebrow">MODO</small>
                    <strong>{mode === "examen" ? "Simulador" : "Aprendiendo"}</strong>
                    <span>
                      {mode === "examen"
                        ? "El examen completo con las condiciones reales."
                        : "Practica por materia, sin reloj, con cada respuesta explicada."}
                    </span>
                    <span className="fd-mode-features">
                      {(mode === "examen" ? EXAM_FEATURES : LEARN_FEATURES).slice(0, 3).map((f) => (
                        <span key={f}>
                          <CheckCircle size={14} weight="duotone" />
                          {f}
                        </span>
                      ))}
                    </span>
                    <span className="fd-mode-bottom">
                      {mode === "examen" ? <AirplaneTakeoff size={17} /> : <BookOpen size={17} />}{" "}
                      {mode === "examen" ? "PREPARACIÓN INTENSIVA" : "A TU RITMO"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {!la && (
              <div className="fd-sectors">
                <p className="fd-eyebrow">SECTORES · 12 MATERIAS</p>
                <div>
                  {sectors.map((m) => (
                    <button
                      key={m.slug}
                      title={m.name}
                      aria-label={"Practicar " + m.name}
                      onClick={() => {
                        setInitialMateria(m.name);
                        setModal("aprendiendo");
                      }}
                    >
                      <small>{SECTOR_CODES[m.slug] ?? m.name.slice(0, 3).toUpperCase()}</small>
                      <strong
                        style={{
                          color:
                            m.avg === null
                              ? "#8fa3c2"
                              : m.avg < 60
                                ? "#f0a08c"
                                : m.avg >= 80
                                  ? "#7fd6a4"
                                  : "#e3c98a",
                        }}
                      >
                        {m.avg ?? "—"}
                      </strong>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
          <aside className="fd-bank-log">
            <section className="fd-panel">
              <p className="fd-eyebrow">BITÁCORA DE VUELOS</p>
              {history.length ? (
                history.slice(0, 3).map((entry) => (
                  <div className="fd-log-summary" key={entry.id}>
                    <div>
                      <strong>{entry.title}</strong>
                      <small>{entry.meta}</small>
                    </div>
                    <span>{entry.score}%</span>
                  </div>
                ))
              ) : (
                <p>Tu historial aparecerá al completar tu primera sesión.</p>
              )}
            </section>
            <LaunchButton
              onClick={() => {
                setInitialMateria(undefined);
                setModal(selectedMode);
              }}
              subtitle={
                selectedMode === "examen" ? "INCURSIÓN · EXAMEN COMPLETO" : "PATRULLA · A TU RITMO"
              }
            >
              {selectedMode === "examen" ? "Lanzar simulador" : "Iniciar práctica"}
            </LaunchButton>
          </aside>
        </div>
      ) : null}
      {extras && <ExtrasPanel la={la} />}
      {history.length > 0 && (
        <details className="fd-history">
          <summary>Historial y análisis de sesiones · {history.length}</summary>
          <div>
            {history.map((entry) => (
              <HistItem key={entry.id} entry={entry} />
            ))}
          </div>
        </details>
      )}
      {!modes && resumables.map((r) => <ResumeItem key={r.key} entry={r} />)}
      {footer}

      {/* Modals */}
      {modal === "examen" && (
        <ModalExamen onClose={() => setModal(null)} onStart={handleStartSim} la={la} />
      )}
      {modal === "aprendiendo" && (
        <ModalAprendiendo
          onClose={() => setModal(null)}
          onStart={handleStartLearn}
          paid={isPaid(user)}
          onLocked={handleLearnLocked}
          la={la}
          initialMateria={initialMateria}
        />
      )}
      {upgrade && (
        <UpgradeModal
          open
          onClose={() => setUpgrade(null)}
          feature={upgrade.feature}
          benefit={upgrade.benefit}
          userId={user?.id}
        />
      )}
    </>
  );
}
