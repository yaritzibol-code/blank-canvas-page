import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  useSessionUser,
  studentStats,
  getSimAttempts,
  getQuizAttempts,
  canStartSimulator,
  isPaid,
  materiaBySlug,
} from "@/lib/store";
import type { QuizAttempt, SimAttempt } from "@/lib/store";
import { UpgradeModal } from "@/components/shared/UpgradeModal";

export const Route = createFileRoute("/dashboard/banco")({
  component: BancoPage,
});

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

const MATERIAS: { label: string; slug: string }[] = [
  { label: "Aerodinámica", slug: "aerodinamica" },
  { label: "Aeronaves y Motores", slug: "aeronaves-motores" },
  { label: "Legislación", slug: "legislacion" },
  { label: "Medicina", slug: "medicina" },
  { label: "Meteorología", slug: "meteorologia" },
  { label: "Navegación", slug: "navegacion" },
  { label: "Operaciones", slug: "operaciones" },
  { label: "Comunicaciones", slug: "comunicaciones" },
  { label: "Manuales de Información Aeronáutica", slug: "manuales-ais" },
  { label: "Tránsito Aéreo", slug: "servicios-transito" },
  { label: "Factores Humanos", slug: "factores-humanos" },
  { label: "Seguridad Aérea", slug: "seguridad-aerea" },
];

/* ─── Helpers ────────────────────────────────────────── */

function scoreColor(score: number): string {
  if (score >= 80) return "#2ecc71";
  if (score >= 60) return "#f39c12";
  return "#e74c3c";
}

function fmtFecha(iso: string): string {
  const d = new Date(iso);
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
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
  return { icon: m.icon, name: m.name, detail: `${m.correct} de ${m.total} correctas`, score: m.pct };
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
    a.materias.length === 1
      ? materiaBySlug(a.materias[0])?.name ?? a.materias[0]
      : "Varias materias";
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

/* ─── HistItem ───────────────────────────────────────── */

function HistItem({ entry }: { entry: HistEntry }) {
  const [open, setOpen] = useState(false);
  const color = scoreColor(entry.score);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(61,93,145,0.05)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        fontFamily: "'Manrope', sans-serif",
      }}
      onClick={() => setOpen(!open)}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(61,93,145,0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 8px rgba(61,93,145,0.05)")
      }
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
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              flexShrink: 0,
              color: entry.type === "exam" ? "#22375C" : "#3D5D91",
              background:
                entry.type === "exam"
                  ? "rgba(26,26,46,0.08)"
                  : "rgba(61,93,145,0.08)",
            }}
          >
            {entry.type === "exam" ? <Icon n="sim" size={18} /> : <Icon n="book" size={18} />}
          </div>
          <div>
            <h4
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#22375C",
                marginBottom: 2,
              }}
            >
              {entry.title}
            </h4>
            <p style={{ fontSize: "0.75rem", color: "#647DA0" }}>{entry.meta}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
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
              borderRadius: 20,
              fontSize: "0.72rem",
              fontWeight: 700,
              background:
                entry.type === "exam"
                  ? "rgba(26,26,46,0.06)"
                  : "rgba(61,93,145,0.08)",
              color: entry.type === "exam" ? "#22375C" : "#3D5D91",
            }}
          >
            {entry.tag}
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
            borderTop: "1px solid #F2DCDB",
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
                color: "#647DA0",
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
                color: "#666",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: "#F2DCDB",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 10,
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
                  color: "#647DA0",
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
                        borderRadius: 10,
                        gap: 10,
                        background: isBad
                          ? "rgba(231,76,60,0.05)"
                          : "rgba(243,156,18,0.05)",
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
                              color: "#22375C",
                              marginBottom: 2,
                            }}
                          >
                            {w.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.76rem",
                              color: "#647DA0",
                              lineHeight: 1.4,
                            }}
                          >
                            {w.detail}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
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
                  color: "#647DA0",
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
                      color: "#22375C",
                    }}
                  >
                    <span>{s.name}</span>
                    <span
                      style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
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
              background: "linear-gradient(135deg, #F2DCDB, #fce4ec)",
              borderRadius: 10,
              padding: "12px 14px",
              marginTop: 14,
              fontSize: "0.82rem",
              color: "#555",
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontSize: "1.4rem", flexShrink: 0, display: "flex", color: "#6C0820" }}><Icon n="cloud" size={24} /></span>
            <div>
              <strong style={{ color: "#6C0820" }}>{entry.pathyPrefix}</strong>{" "}
              {entry.pathyTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Modal: Simulador CIAAC ─────────────────────────── */

function ModalExamen({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  const infoRows = [
    {
      icon: "help",
      bg: "rgba(61,93,145,0.1)",
      html: "<strong>310 preguntas</strong> — igual que el examen real del CIAAC",
    },
    {
      icon: "timer",
      bg: "rgba(108,8,32,0.08)",
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
    <div
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
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 36,
          maxWidth: 520,
          width: "100%",
        }}
      >
        <h2
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "1.5rem",
            color: "#22375C",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon n="target" size={26} /> Simulador CIAAC
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#647DA0", marginBottom: 24 }}>
          Lee las instrucciones antes de comenzar
        </p>

        {/* Info */}
        <div
          style={{
            background: "#f8f9ff",
            borderRadius: 12,
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
                color: "#22375C",
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
                  color: "#22375C",
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
            borderRadius: 10,
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
          <span style={{ display: "flex", flexShrink: 0 }}><Icon n="alert" size={16} /></span>
          <span>
            Si sales de la página durante el examen{" "}
            <strong>perderás tu progreso</strong>. Asegúrate de tener tiempo
            suficiente y buena conexión antes de comenzar.
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              background: "white",
              color: "#647DA0",
              border: "2px solid #F2DCDB",
              borderRadius: 10,
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onStart}
            style={{
              flex: 2,
              padding: 12,
              background: "#6C0820",
              color: "white",
              border: "none",
              borderRadius: 10,
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#8a0a28")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#6C0820")
            }
          >
            <Icon n="target" size={18} /> Aceptar y comenzar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: Aprendiendo ─────────────────────────────── */

function ModalAprendiendo({
  onClose,
  onStart,
  paid,
  onLocked,
}: {
  onClose: () => void;
  onStart: (slugs: string[], qty: number) => void;
  paid: boolean;
  onLocked: () => void;
}) {
  const [allSelected, setAllSelected] = useState(true);
  const [selectedMaterias, setSelectedMaterias] = useState<Set<string>>(
    new Set()
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
    const slugs =
      allSelected || selectedMaterias.size === 0
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
    onStart(slugs, qtyNum);
  }

  function handleCustomInput(val: string) {
    setCustomValue(val);
    const n = parseInt(val);
    setShowWarning(!isNaN(n) && n > 500);
  }

  const chipBase = {
    padding: "6px 13px",
    borderRadius: 20,
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Manrope', sans-serif",
  } as const;

  const qtyBase = {
    padding: "7px 18px",
    borderRadius: 10,
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Manrope', sans-serif",
  } as const;

  return (
    <div
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
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 36,
          maxWidth: 520,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "1.5rem",
            color: "#22375C",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon n="lightbulb" size={26} /> Configura tu sesión
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#647DA0", marginBottom: 24 }}>
          Elige las materias y cuántas preguntas quieres practicar
        </p>

        {/* Materias */}
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#22375C",
              marginBottom: 10,
            }}
          >
            ¿Qué materias?
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            <button
              onClick={handleAllClick}
              style={{
                ...chipBase,
                border: `2px solid ${allSelected ? "#3D5D91" : "#F2DCDB"}`,
                background: allSelected ? "#3D5D91" : "#f8f9ff",
                color: allSelected ? "white" : "#22375C",
              }}
            >
              Todas las materias
            </button>
            {MATERIAS.map((m) => {
              const sel = selectedMaterias.has(m.label);
              return (
                <button
                  key={m.slug}
                  onClick={() => handleMateriaClick(m.label)}
                  style={{
                    ...chipBase,
                    border: `2px solid ${sel ? "#3D5D91" : "#F2DCDB"}`,
                    background: sel ? "rgba(61,93,145,0.08)" : "#f8f9ff",
                    color: sel ? "#3D5D91" : "#22375C",
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity */}
        <div style={{ marginBottom: 24 }}>
          <h4
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#22375C",
              marginBottom: 10,
            }}
          >
            ¿Cuántas preguntas?
          </h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["10", "50", "100"] as const).map((v) => (
              <button
                key={v}
                onClick={() => handleQtyClick(v)}
                style={{
                  ...qtyBase,
                  border: `2px solid ${qty === v ? "#3D5D91" : "#F2DCDB"}`,
                  background:
                    qty === v ? "rgba(61,93,145,0.08)" : "#f8f9ff",
                  color: qty === v ? "#3D5D91" : "#22375C",
                }}
              >
                {v}
              </button>
            ))}
            <button
              onClick={handleCustomClick}
              style={{
                ...qtyBase,
                border: `2px solid ${
                  qty === "custom" ? "#3D5D91" : "#F2DCDB"
                }`,
                background:
                  qty === "custom" ? "rgba(61,93,145,0.08)" : "#f8f9ff",
                color: qty === "custom" ? "#3D5D91" : "#22375C",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon n="pencil" size={15} /> Personalizar</span>
            </button>
          </div>

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
                      showWarning
                        ? "#f39c12"
                        : customValue
                        ? "#2ecc71"
                        : "#F2DCDB"
                    }`,
                    borderRadius: 8,
                    fontSize: "0.88rem",
                    fontFamily: "'Manrope', sans-serif",
                    width: 120,
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "0.8rem", color: "#647DA0" }}>
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
                  <span>El máximo disponible es <strong>500</strong> preguntas
                  para las materias seleccionadas.</span>
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
              background: "white",
              color: "#647DA0",
              border: "2px solid #F2DCDB",
              borderRadius: 10,
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
              background: "#6C0820",
              color: "white",
              border: "none",
              borderRadius: 10,
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#8a0a28")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#6C0820")
            }
          >
            <Icon n="lightbulb" size={18} /> Comenzar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────── */

function BancoPage() {
  const user = useSessionUser();
  const navigate = useNavigate();
  const [modal, setModal] = useState<"examen" | "aprendiendo" | null>(null);
  const [upgrade, setUpgrade] = useState<{ feature: string; benefit?: string } | null>(null);
  const [examHover, setExamHover] = useState(false);
  const [learnHover, setLearnHover] = useState(false);

  const stats = user ? studentStats(user.id) : null;

  const history: HistEntry[] = user
    ? [
        ...getSimAttempts(user.id).map((a) => ({ date: a.date, entry: simToEntry(a) })),
        ...getQuizAttempts(user.id).map((a) => ({ date: a.date, entry: quizToEntry(a) })),
      ]
        .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())
        .slice(0, 10)
        .map((x) => x.entry)
    : [];

  function handleStartSim() {
    const gate = canStartSimulator(user);
    setModal(null);
    if (gate.allowed) {
      navigate({ to: "/simulador" });
    } else {
      setUpgrade({ feature: "Simulador CIAAC", benefit: gate.reason });
    }
  }

  function handleStartLearn(slugs: string[], qty: number) {
    setModal(null);
    navigate({ to: "/cuestionario", search: { materias: slugs.join(","), qty } });
  }

  function handleLearnLocked() {
    setUpgrade({
      feature: "Banco completo de preguntas",
      benefit:
        "Con el acceso completo eliges cuántas preguntas practicar y desbloqueas todo el banco de las 12 materias del CIAAC.",
    });
  }

  const EXAM_FEATURES = [
    "310 preguntas oficiales",
    "5 horas límite de tiempo",
    "Calificación al terminar",
    "Análisis de áreas de oportunidad",
    "Ilimitado — repítelo las veces que quieras",
  ];

  const LEARN_FEATURES = [
    "Elige materia o mezcla todas",
    "Tú decides cuántas preguntas",
    "Feedback inmediato por respuesta",
    'Botón "Explícamelo Yaris" siempre visible',
    "Sin límite de tiempo",
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "2rem",
              color: "#22375C",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            ¿Cómo quieres{" "}
            <span style={{ color: "#6C0820" }}>estudiar hoy?</span>
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#647DA0",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Elige el modo que mejor se adapte a tu momento. Puedes cambiar
            cuando quieras.
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 48,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            {
              icon: "help",
              label: "Preguntas respondidas:",
              value: (stats?.answered ?? 0).toLocaleString(),
            },
            {
              icon: "check",
              label: "Aciertos promedio:",
              value: stats && stats.avgScore !== null ? `${stats.avgScore}%` : "—",
            },
            { icon: "sim", label: "Simulacros hechos:", value: String(stats?.simCount ?? 0) },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "white",
                borderRadius: 12,
                padding: "10px 18px",
                boxShadow: "0 2px 10px rgba(61,93,145,0.06)",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ fontSize: "1.1rem", display: "flex", color: "#3D5D91" }}><Icon n={s.icon as never} size={18} /></span>
              <span>
                {s.label}{" "}
                <strong style={{ color: "#3D5D91" }}>{s.value}</strong>
              </span>
            </div>
          ))}
        </div>

        {/* Mode cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2"
          style={{ gap: 24, maxWidth: 820, width: "100%", marginBottom: 48 }}
        >
          {/* Simulador CIAAC card */}
          <div
            onClick={() => setModal("examen")}
            onMouseEnter={() => setExamHover(true)}
            onMouseLeave={() => setExamHover(false)}
            style={{
              borderRadius: 20,
              padding: "32px 28px",
              cursor: "pointer",
              transition: "all 0.25s",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(145deg, #22375C, #2a2a4e)",
              border: "3px solid transparent",
              transform: examHover ? "translateY(-6px)" : "none",
              boxShadow: examHover
                ? "0 20px 48px rgba(26,26,46,0.4)"
                : "none",
            }}
          >
            {/* Recomendado badge */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "#F2AEBC",
                color: "#6C0820",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Icon n="star" size={12} /> Recomendado
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 20,
                width: "fit-content",
                background: "rgba(242,174,188,0.2)",
                color: "#F2AEBC",
              }}
            >
              <Icon n="sim" size={14} /> Simulador CIAAC
            </div>

            <div style={{ fontSize: "3rem", marginBottom: 16, display: "flex", color: "#F2AEBC" }}><Icon n="target" size={42} /></div>

            <h2
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: "1.5rem",
                color: "white",
                marginBottom: 6,
              }}
            >
              Simulador CIAAC
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                marginBottom: 20,
                opacity: 0.75,
                lineHeight: 1.5,
                color: "white",
              }}
            >
              Pon a prueba todo lo que has aprendido en un examen completo con
              las condiciones reales del CIAAC.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {EXAM_FEATURES.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#F2AEBC",
                      flexShrink: 0,
                    }}
                  />
                  {f}
                </div>
              ))}
            </div>

            <button
              style={{
                width: "100%",
                padding: 13,
                border: "none",
                borderRadius: 12,
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: "auto",
                background: "#F2AEBC",
                color: "#6C0820",
                transition: "all 0.2s",
              }}
            >
              Iniciar simulador →
            </button>
          </div>

          {/* Aprendiendo card */}
          <div
            onClick={() => setModal("aprendiendo")}
            onMouseEnter={() => setLearnHover(true)}
            onMouseLeave={() => setLearnHover(false)}
            style={{
              borderRadius: 20,
              padding: "32px 28px",
              cursor: "pointer",
              transition: "all 0.25s",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              background: "white",
              border: `3px solid ${learnHover ? "#3D5D91" : "#F2DCDB"}`,
              transform: learnHover ? "translateY(-6px)" : "none",
              boxShadow: learnHover
                ? "0 20px 48px rgba(61,93,145,0.12)"
                : "none",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 20,
                width: "fit-content",
                background: "rgba(61,93,145,0.08)",
                color: "#3D5D91",
              }}
            >
              <Icon n="book" size={14} /> Modo estudio
            </div>

            <div style={{ fontSize: "3rem", marginBottom: 16, display: "flex", color: "#3D5D91" }}><Icon n="lightbulb" size={42} /></div>

            <h2
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: "1.5rem",
                color: "#22375C",
                marginBottom: 6,
              }}
            >
              Aprendiendo
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                marginBottom: 20,
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              Practica a tu ritmo con feedback inmediato en cada pregunta.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {LEARN_FEATURES.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.82rem",
                    color: "#555",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#3D5D91",
                      flexShrink: 0,
                    }}
                  />
                  {f}
                </div>
              ))}
            </div>

            <button
              style={{
                width: "100%",
                padding: 13,
                border: "none",
                borderRadius: 12,
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: "auto",
                background: "#3D5D91",
                color: "white",
                transition: "all 0.2s",
              }}
            >
              Configurar sesión →
            </button>
          </div>
        </div>

        {/* Historial */}
        <div style={{ maxWidth: 820, width: "100%" }}>
          <h3
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "1.1rem",
              marginBottom: 16,
              color: "#22375C",
            }}
          >
            Historial y análisis de sesiones
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(61,93,145,0.05)",
                  padding: "22px 18px",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "#647DA0",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                Aún no tienes sesiones. ¡Haz tu primer cuestionario!
              </div>
            ) : (
              history.map((entry) => <HistItem key={entry.id} entry={entry} />)
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === "examen" && (
        <ModalExamen onClose={() => setModal(null)} onStart={handleStartSim} />
      )}
      {modal === "aprendiendo" && (
        <ModalAprendiendo
          onClose={() => setModal(null)}
          onStart={handleStartLearn}
          paid={isPaid(user)}
          onLocked={handleLearnLocked}
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
