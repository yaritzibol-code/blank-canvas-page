import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PathySVG, useTimer } from "../../contexts/StudyTimerContext";
import { Icon } from "@/components/ui/fp-icon";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import {
  MATERIAS_DEF,
  getActivity,
  getClaseProgress,
  getClases,
  getFlashStates,
  getFlashcards,
  getQuizAttempts,
  getSimAttempts,
  isPaid,
  logActivity,
  logYarisUse,
  materiaPerformance,
  materiaProgressPct,
  pickPracticeQuestion,
  updateUser,
  useSessionUser,
  useStore,
  yarisReply,
  type BankQuestion,
  type User,
} from "@/lib/store";

export const Route = createFileRoute("/dashboard/estudiemos")({
  component: EstudiemosJuntosPage,
});

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
type TiempoDisponible = "30min" | "1h" | "2h" | "custom";
type ExamPhase = "fase1" | "fase2" | "fase3" | "fase4" | "fase5";
type RecoType =
  | "materia" | "cuestionario" | "flashcards"
  | "sim_parcial" | "sim_completo"
  | "recuperacion" | "repaso_final" | "resistencia";

interface MateriaData {
  slug: string; name: string; icon: string;
  pct: number; avg: number; lastStudied: Date | null;
}
interface SimuladorData {
  fecha: Date; score: number; completed: boolean;
}
interface StudentProfile {
  name: string;
  materias: MateriaData[];
  clases: { vistas: number; total: number };
  flashcards: { done: number; total: number };
  cuestionarios: { done: number; avgScore: number };
  simuladores: SimuladorData[];
}
interface Recommendation {
  type: RecoType;
  subject?: MateriaData;
  title: string;
  pathyMessage: string;
  urgency: "alta" | "media" | "baja";
}
interface PlanItem {
  icon: string;
  titulo: string;
  descripcion: string;
  duracion_min: number;
  link: string;
  badge?: string;
  prioridad: 1 | 2 | 3;
}

/* ══════════════════════════════════════════════════════════
   PERFIL REAL — construido desde el store
══════════════════════════════════════════════════════════ */
function buildProfile(user: User): StudentProfile {
  const perf = materiaPerformance(user.id, "todo");
  const quizAttempts = getQuizAttempts(user.id);
  const activity = getActivity(user.id);

  const materias: MateriaData[] = MATERIAS_DEF.map((def) => {
    const p = perf.find((x) => x.slug === def.slug);
    let last: Date | null = null;
    const consider = (iso: string) => {
      const d = new Date(iso);
      if (!last || d.getTime() > last.getTime()) last = d;
    };
    activity.forEach((a) => {
      if (a.label.toLowerCase().includes(def.name.toLowerCase())) consider(a.date);
    });
    quizAttempts.forEach((a) => {
      if (a.materias.includes(def.slug)) consider(a.date);
    });
    return {
      slug: def.slug,
      name: def.name,
      icon: def.icon,
      pct: materiaProgressPct(user.id, def.slug),
      avg: p?.avg ?? 0,
      lastStudied: last,
    };
  });

  const clasesTotal = getClases().filter((c) => c.status === "publicada").length;
  const clasesVistas = getClaseProgress(user.id).filter((p) => p.completada).length;
  const flashTotal = getFlashcards().filter((c) => c.status === "publicada").length;
  const flashDone = getFlashStates(user.id).filter((s) => s.state === "dominada").length;
  const scores = quizAttempts.filter((a) => a.total > 0).map((a) => (a.correct / a.total) * 100);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
  const simuladores: SimuladorData[] = getSimAttempts(user.id).map((s) => ({
    fecha: new Date(s.date),
    score: s.scorePct,
    completed: true,
  }));

  return {
    name: user.nombre.split(" ")[0],
    materias,
    clases: { vistas: clasesVistas, total: clasesTotal },
    flashcards: { done: flashDone, total: flashTotal },
    cuestionarios: { done: quizAttempts.length, avgScore },
    simuladores,
  };
}

/* ══════════════════════════════════════════════════════════
   ENGINE — pure functions
══════════════════════════════════════════════════════════ */
function daysSince(date: Date | null): number {
  if (!date) return 999;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}
function eAvgPct(p: StudentProfile)    { return p.materias.length ? p.materias.reduce((s, m) => s + m.pct, 0) / p.materias.length : 0; }
function eAvgScore(p: StudentProfile)  { const a = p.materias.filter(m => m.avg > 0); return a.length ? a.reduce((s, m) => s + m.avg, 0) / a.length : 0; }
function eClasesPct(p: StudentProfile) { return p.clases.total > 0 ? (p.clases.vistas / p.clases.total) * 100 : 0; }
function eFlashPct(p: StudentProfile)  { return p.flashcards.total > 0 ? (p.flashcards.done / p.flashcards.total) * 100 : 0; }
function eSimFactor(p: StudentProfile) { return Math.min(100, p.simuladores.filter(s => s.completed).length * 25); }

function computeRuta(p: StudentProfile): number {
  return (
    eAvgPct(p)   * 0.35 +
    eClasesPct(p)* 0.20 +
    p.cuestionarios.avgScore * 0.20 +
    eFlashPct(p) * 0.15 +
    eSimFactor(p)* 0.10
  );
}

function lastSim(p: StudentProfile): SimuladorData | null {
  if (!p.simuladores.length) return null;
  return [...p.simuladores].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0];
}

function getExamPhaseFromDate(examDateStr: string | null): { phase: ExamPhase; daysLeft: number } {
  if (!examDateStr || examDateStr === "sin_fecha") return { phase: "fase2", daysLeft: 90 };
  const diff = Math.ceil((new Date(examDateStr).getTime() - Date.now()) / 86400000);
  const daysLeft = Math.max(0, diff);
  if (daysLeft > 60)  return { phase: "fase1", daysLeft };
  if (daysLeft > 30)  return { phase: "fase2", daysLeft };
  if (daysLeft > 14)  return { phase: "fase3", daysLeft };
  if (daysLeft > 7)   return { phase: "fase4", daysLeft };
  return { phase: "fase5", daysLeft };
}

function getRecommendation(p: StudentProfile, phase: ExamPhase): Recommendation {
  const ls = lastSim(p);

  if (phase === "fase5") return {
    type: "repaso_final", title: "Repaso Final Pre-Examen",
    pathyMessage: "Piloto, faltan menos de 7 días para tu CIAAC. Sin aprendizaje nuevo — solo consolidamos lo que ya tienes y descansamos bien.",
    urgency: "alta",
  };

  if (ls && daysSince(ls.fecha) < 3) {
    const weak = [...p.materias].filter(m => m.pct > 0).sort((a, b) => a.avg - b.avg)[0];
    return {
      type: "recuperacion", subject: weak,
      title: `Recuperación — ${weak?.name ?? "Materias débiles"}`,
      pathyMessage: `Piloto, completaste tu simulador con ${ls.score}%. Antes de otro simulador, revisemos los errores — detecté debilidad en ${weak?.name ?? "varias materias"}.`,
      urgency: "alta",
    };
  }

  const abandoned = p.materias
    .filter(m => m.pct > 0 && daysSince(m.lastStudied) >= 7)
    .sort((a, b) => daysSince(b.lastStudied) - daysSince(a.lastStudied))[0];
  if (abandoned) return {
    type: "materia", subject: abandoned,
    title: `Retomar ${abandoned.name}`,
    pathyMessage: `Piloto, llevas ${daysSince(abandoned.lastStudied)} días sin estudiar ${abandoned.name}. La memoria se desvanece sin repaso. Hoy volvemos.`,
    urgency: "alta",
  };

  const weakM = p.materias.filter(m => m.pct < 50).sort((a, b) => a.pct - b.pct)[0];
  if (weakM) return {
    type: "materia", subject: weakM,
    title: weakM.pct === 0 ? `Comenzar ${weakM.name}` : `Avanzar en ${weakM.name}`,
    pathyMessage: weakM.pct === 0
      ? `Piloto, todavía no has iniciado ${weakM.name}. Esta materia tiene peso real en el CIAAC. Hoy damos el primer vuelo.`
      : `Piloto, ${weakM.name} está al ${weakM.pct}% — necesita más atención antes del examen.`,
    urgency: weakM.pct === 0 ? "alta" : "media",
  };

  if (phase === "fase4") {
    if (eAvgScore(p) >= 65 && eAvgPct(p) >= 55) return {
      type: "sim_completo", title: "Simulador CIAAC Completo",
      pathyMessage: "Piloto, ya estás listo para un simulador completo. 310 preguntas, 5 horas — lo más parecido al examen real.",
      urgency: "alta",
    };
    return {
      type: "cuestionario", title: "Cuestionario Intensivo Mixto",
      pathyMessage: "Piloto, en estas últimas semanas cada pregunta cuenta. Hoy hacemos un cuestionario mixto enfocado en tus áreas más débiles.",
      urgency: "media",
    };
  }

  if (phase === "fase3") {
    if (!p.simuladores.length && eAvgScore(p) >= 65) return {
      type: "sim_parcial", title: "Primer Simulador Parcial",
      pathyMessage: "Piloto, ya estás listo para tu primer simulador parcial. Es momento de medirte.",
      urgency: "media",
    };
    return {
      type: "cuestionario", title: "Cuestionario de Consolidación",
      pathyMessage: "Piloto, en esta fase consolidamos con cuestionarios mixtos para identificar tus áreas de mejora.",
      urgency: "media",
    };
  }

  if (eAvgScore(p) >= 70 && eAvgPct(p) >= 55) {
    const toConsolidate = p.materias.find(m => m.pct > 50 && m.avg < 75);
    if (toConsolidate) return {
      type: "flashcards", subject: toConsolidate,
      title: `Consolidar ${toConsolidate.name}`,
      pathyMessage: `Piloto, ${toConsolidate.name} tiene buen avance pero el promedio de ${Math.round(toConsolidate.avg)}% puede mejorar. Las flashcards son la herramienta ideal ahora.`,
      urgency: "media",
    };
  }

  if (eAvgPct(p) >= 60 && eAvgScore(p) >= 65) return {
    type: "resistencia", title: "Sesión de Resistencia Mental",
    pathyMessage: "Piloto, tu base académica va bien. Hoy entrenamos resistencia: mantener foco durante horas es tan importante como el conocimiento.",
    urgency: "baja",
  };

  const next = [...p.materias].sort((a, b) => a.pct - b.pct)[0];
  return {
    type: "materia", subject: next,
    title: `Estudiar ${next.name}`,
    pathyMessage: next.pct === 0
      ? `Piloto, ${next.name} todavía no ha sido iniciada. Aprendamos juntos.`
      : `Piloto, ${next.name} necesita más progreso. Aprendamos juntos.`,
    urgency: next.pct === 0 ? "alta" : "media",
  };
}

function buildPlan(rec: Recommendation, tiempo: TiempoDisponible, p: StudentProfile): PlanItem[] {
  const slug = rec.subject?.slug ?? "aerodinamica";
  const canSim = eAvgScore(p) >= 65 && eAvgPct(p) >= 55;

  const allItems: Record<RecoType, PlanItem[]> = {
    materia: [
      { icon: "book", titulo: "Ver módulo pendiente", descripcion: `Continúa donde lo dejaste en ${rec.subject?.name ?? "la materia"}`, duracion_min: 20, link: `/dashboard/materias/${slug}`, badge: "Pendiente", prioridad: 1 },
      { icon: "play", titulo: "Ver clase relacionada", descripcion: "Refuerza el tema con una clase en video", duracion_min: 15, link: "/dashboard/clases", prioridad: 2 },
      { icon: "plane", titulo: "10 preguntas de práctica", descripcion: `Banco de preguntas — ${rec.subject?.name ?? "la materia"}`, duracion_min: 10, link: "/dashboard/banco", prioridad: 3 },
    ],
    cuestionario: [
      { icon: "plane", titulo: "Cuestionario — 20 preguntas", descripcion: "Banco de preguntas tipo CIAAC", duracion_min: 20, link: "/dashboard/banco", badge: "Recomendado", prioridad: 1 },
      { icon: "search", titulo: "Revisar errores anteriores", descripcion: "Repasa las preguntas que fallaste", duracion_min: 10, link: "/dashboard/banco", prioridad: 2 },
      { icon: "cards", titulo: "Flashcards de refuerzo", descripcion: "Consolida los conceptos débiles", duracion_min: 15, link: "/dashboard/flashcards", prioridad: 3 },
    ],
    flashcards: [
      { icon: "cards", titulo: "Flashcards — materia débil", descripcion: `Repaso activo de ${rec.subject?.name ?? "la materia"}`, duracion_min: 20, link: "/dashboard/flashcards", badge: "Débil", prioridad: 1 },
      { icon: "plane", titulo: "Cuestionario corto", descripcion: "10 preguntas para verificar retención", duracion_min: 10, link: "/dashboard/banco", prioridad: 2 },
    ],
    sim_parcial: [
      { icon: "plane", titulo: "Repaso rápido previo", descripcion: "20 preguntas de calentamiento", duracion_min: 20, link: "/dashboard/banco", prioridad: 1 },
      { icon: "target", titulo: "Simulador parcial — 1 materia", descripcion: "Condiciones de examen real", duracion_min: 40, link: "/dashboard/simulador", prioridad: 2 },
      { icon: "search", titulo: "Revisar resultados", descripcion: "Analiza los errores del simulacro", duracion_min: 10, link: "/dashboard/banco", prioridad: 3 },
    ],
    sim_completo: canSim ? [
      { icon: "target", titulo: "Simulador CIAAC completo", descripcion: "310 preguntas · 5 horas · condiciones reales", duracion_min: 300, link: "/dashboard/simulador", badge: "CIAAC", prioridad: 1 },
      { icon: "search", titulo: "Revisión post-simulador", descripcion: "Analiza en profundidad los errores", duracion_min: 30, link: "/dashboard/banco", prioridad: 2 },
    ] : [
      { icon: "plane", titulo: "Cuestionario intensivo", descripcion: "Prepárate para el simulador con 30 preguntas", duracion_min: 30, link: "/dashboard/banco", badge: "Antes del sim", prioridad: 1 },
      { icon: "cards", titulo: "Flashcards de refuerzo", descripcion: "Consolida los conceptos clave", duracion_min: 20, link: "/dashboard/flashcards", prioridad: 2 },
    ],
    resistencia: [
      { icon: "plane", titulo: "30 preguntas mezcladas", descripcion: "Entrenamiento de resistencia mental", duracion_min: 30, link: "/dashboard/banco", prioridad: 1 },
      { icon: "play", titulo: "Ver clase nueva", descripcion: "Avanza en el contenido del curso", duracion_min: 20, link: "/dashboard/clases", prioridad: 2 },
    ],
    recuperacion: [
      { icon: "play", titulo: `Clase de ${rec.subject?.name ?? "materia"}`, descripcion: "Refuerza los conceptos que fallaron", duracion_min: 15, link: "/dashboard/clases", badge: "Débil", prioridad: 1 },
      { icon: "book", titulo: "Módulo específico", descripcion: "Repasa el contenido teórico", duracion_min: 20, link: `/dashboard/materias/${slug}`, prioridad: 2 },
      { icon: "plane", titulo: "10 preguntas de refuerzo", descripcion: "Practica los conceptos repasados", duracion_min: 10, link: "/dashboard/banco", prioridad: 3 },
    ],
    repaso_final: [
      { icon: "search", titulo: "Errores frecuentes", descripcion: "Solo preguntas que has fallado antes", duracion_min: 20, link: "/dashboard/banco", badge: "CIAAC", prioridad: 1 },
      { icon: "cards", titulo: "Flashcards esenciales", descripcion: "Repaso rápido de conceptos clave", duracion_min: 15, link: "/dashboard/flashcards", prioridad: 2 },
      { icon: "target", titulo: "Mini simulador", descripcion: "50 preguntas mixtas — condiciones de examen", duracion_min: 30, link: "/dashboard/simulador", prioridad: 3 },
    ],
  };

  const items = allItems[rec.type] ?? allItems.materia;

  if (tiempo === "30min") return items.filter(i => i.duracion_min <= 20).slice(0, 2);
  if (tiempo === "1h")    return items.slice(0, 3);
  if (tiempo === "custom") return items;
  return items;
}

/* ══════════════════════════════════════════════════════════
   ONBOARDING MODAL
══════════════════════════════════════════════════════════ */
function OnboardingModal({ onDone, userId }: { onDone: () => void; userId?: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");

  function handleDateSelect(val: string) {
    setSelectedDate(val);
  }

  function goStep2() {
    if (!selectedDate) return;
    setStep(2);
  }

  function finish(tiempo: TiempoDisponible) {
    let dateStr: string;
    if (customDate) {
      dateStr = customDate;
    } else if (selectedDate === "sin_fecha") {
      dateStr = "sin_fecha";
    } else {
      const today = new Date();
      const days = selectedDate === "3m" ? 90 : selectedDate === "1-2m" ? 50 : selectedDate === "1m" ? 25 : 90;
      today.setDate(today.getDate() + days);
      dateStr = today.toISOString().split("T")[0];
    }
    localStorage.setItem("fp_exam_date", dateStr);
    // Sincroniza la fecha con el perfil del usuario cuando hay fecha concreta
    if (userId && dateStr !== "sin_fecha") updateUser(userId, { fechaCiaac: dateStr });
    localStorage.setItem("fp_tiempo_disponible", tiempo);
    localStorage.setItem("fp_onboarding_done", "true");
    onDone();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,26,46,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 32,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "center", color: "#22375C" }}><Icon n="plane" size={40} /></div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", color: "#22375C", margin: 0 }}>
            {step === 1 ? "¿Cuándo es tu CIAAC?" : "¿Cuánto tiempo tienes hoy?"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#647DA0", marginTop: 6 }}>
            {step === 1 ? "Paty personaliza tu plan según tu fecha objetivo." : "Esto define cuántas actividades incluye tu plan diario."}
          </p>
        </div>

        {step === 1 ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[
                { val: "3m",       label: "En los próximos 3 meses", desc: "Tiempo para aprender con calma" },
                { val: "1-2m",     label: "En 1–2 meses",            desc: "Consolidación acelerada" },
                { val: "1m",       label: "En menos de un mes",      desc: "Modo intensivo" },
                { val: "sin_fecha", label: "No tengo fecha aún",     desc: "Asumimos 3 meses" },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => handleDateSelect(opt.val)}
                  style={{
                    padding: "14px 18px",
                    border: `2px solid ${selectedDate === opt.val ? "#3D5D91" : "#F2DCDB"}`,
                    borderRadius: 12,
                    background: selectedDate === opt.val ? "rgba(61,93,145,0.07)" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "'Manrope', sans-serif",
                    transition: "all 0.15s",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600, color: "#22375C", fontSize: "0.9rem" }}>{opt.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#647DA0" }}>{opt.desc}</p>
                </button>
              ))}
            </div>
            <p style={{ fontSize: "0.78rem", color: "#8DA1BE", marginBottom: 8 }}>O ingresa la fecha exacta:</p>
            <input
              type="date"
              value={customDate}
              onChange={e => { setCustomDate(e.target.value); setSelectedDate(null); }}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "2px solid #F2DCDB",
                borderRadius: 10,
                fontSize: "0.88rem",
                fontFamily: "'Manrope', sans-serif",
                marginBottom: 20,
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={goStep2}
              disabled={!selectedDate && !customDate}
              style={{
                width: "100%",
                padding: 14,
                background: selectedDate || customDate ? "#22375C" : "#ddd",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: selectedDate || customDate ? "pointer" : "not-allowed",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Continuar →
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { val: "30min" as TiempoDisponible, label: "30 minutos", desc: "Plan rápido: 2 actividades enfocadas" },
              { val: "1h"    as TiempoDisponible, label: "1 hora",     desc: "Plan estándar: 3 actividades balanceadas" },
              { val: "2h"    as TiempoDisponible, label: "2+ horas",   desc: "Plan completo: sesión de fondo" },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => finish(opt.val)}
                style={{
                  padding: "18px 20px",
                  border: "2px solid #F2DCDB",
                  borderRadius: 12,
                  background: "white",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'Manrope', sans-serif",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.background = "rgba(61,93,145,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.background = "white"; }}
              >
                <p style={{ margin: 0, fontWeight: 700, color: "#22375C", fontSize: "1rem" }}>{opt.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#647DA0" }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUMMARY STRIP
══════════════════════════════════════════════════════════ */
function SummaryStrip({ daysLeft, phase, progreso }: { daysLeft: number; phase: ExamPhase; progreso: number }) {
  const dayColor = daysLeft > 30 ? "#2ecc71" : daysLeft > 14 ? "#f39c12" : "#e74c3c";
  const dayLabel = daysLeft >= 90 ? "90+ días" : `${daysLeft} días`;

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
      {[
        { icon: "timer", label: `${dayLabel} para el CIAAC`, color: dayColor },
        { icon: "chart", label: `${Math.round(progreso)}% progreso general`, color: "#5A86CB" },
        { icon: "target", label: `Fase ${phase.replace("fase", "")} de 5`, color: "#9B59B6" },
      ].map((chip, i) => (
        <div
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 20,
            background: "white",
            border: `1.5px solid ${chip.color}20`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: chip.color,
          }}
        >
          <Icon n={chip.icon as never} size={15} /> {chip.label}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PATHY CARD
══════════════════════════════════════════════════════════ */
function PathyCard({ rec, phase }: { rec: Recommendation; phase: ExamPhase }) {
  const urgencyConfig = {
    alta:  { badge: phase === "fase5" ? "URGENTE" : "COMENZAR", bg: "#6C0820", light: "rgba(108,8,32,0.08)" },
    media: { badge: "REFORZAR", bg: "#c9930a", light: "rgba(201,147,10,0.08)" },
    baja:  { badge: "AVANZAR",  bg: "#3D5D91", light: "rgba(61,93,145,0.08)" },
  };
  const cfg = urgencyConfig[rec.urgency];

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        boxShadow: "0 2px 16px rgba(61,93,145,0.08)",
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <PathySVG size={72} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span
            style={{
              background: cfg.bg,
              color: "white",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "1px",
            }}
          >
            {cfg.badge}
          </span>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#22375C" }}>{rec.title}</span>
        </div>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.6, margin: 0 }}>
          {rec.pathyMessage}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PLAN ITEM CARD
══════════════════════════════════════════════════════════ */
function PlanItemCard({ item, index, onStart }: { item: PlanItem; index: number; onStart: (item: PlanItem) => void }) {
  const isTop = item.prioridad === 1;
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 10,
        boxShadow: "0 1px 8px rgba(61,93,145,0.06)",
        border: isTop ? "2px solid rgba(61,93,145,0.2)" : "1.5px solid #F2DCDB",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: isTop ? "linear-gradient(135deg, #3D5D91, #5A86CB)" : "#F2DCDB",
          color: isTop ? "white" : "#647DA0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ display: "inline-flex", color: "#3D5D91" }}><Icon n={item.icon as never} size={17} /></span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#22375C" }}>{item.titulo}</span>
          {item.badge && (
            <span
              style={{
                background: "rgba(108,8,32,0.08)",
                color: "#6C0820",
                padding: "1px 8px",
                borderRadius: 10,
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#647DA0" }}>
          {item.descripcion} · {item.duracion_min} min
        </p>
      </div>
      <a
        href={item.link}
        onClick={(e) => { e.preventDefault(); onStart(item); }}
        style={{
          flexShrink: 0,
          padding: "8px 16px",
          background: isTop ? "#22375C" : "transparent",
          color: isTop ? "white" : "#3D5D91",
          border: isTop ? "none" : "1.5px solid #3D5D91",
          borderRadius: 8,
          fontSize: "0.8rem",
          fontWeight: 700,
          textDecoration: "none",
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        Iniciar sesión →
      </a>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   WEAKNESS CHIPS
══════════════════════════════════════════════════════════ */
function WeaknessChips({ materias }: { materias: MateriaData[] }) {
  const weak = materias.filter(m => m.pct > 0 && m.avg < 60);
  if (!weak.length) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
        Materias por reforzar
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {weak.map(m => (
          <a
            key={m.slug}
            href={`/dashboard/materias/${m.slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              background: "rgba(108,8,32,0.07)",
              border: "1px solid rgba(108,8,32,0.15)",
              borderRadius: 20,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#6C0820",
              textDecoration: "none",
            }}
          >
            <Icon n={m.icon as never} size={15} /> {m.name} · {Math.round(m.avg)}%
          </a>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PONME A PRUEBA (PRD 6.10) — Yaris comprueba lo aprendido
══════════════════════════════════════════════════════════ */
type PruebaMode = "preguntas" | "explica" | "nemo";

const PRUEBA_TITLES: Record<PruebaMode, string> = {
  preguntas: "Hazme preguntas",
  explica: "Explícamelo fácil",
  nemo: "Dame una nemotecnia",
};

function PruebaModal({ mode, onClose }: { mode: PruebaMode; onClose: (interactions: number) => void }) {
  const [question, setQuestion] = useState<BankQuestion | null>(() => (mode === "preguntas" ? pickPracticeQuestion() : null));
  const [answered, setAnswered] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [turn, setTurn] = useState(0);
  const [interactions, setInteractions] = useState(0);
  const [msgs, setMsgs] = useState<{ html: string; isUser: boolean }[]>(() => [
    {
      html: mode === "explica"
        ? "Dime el tema que quieres que te explique fácil (por ejemplo: METAR, fuerzas en vuelo, espacio aéreo…)."
        : "Dime el concepto que te cuesta y te ayudo a construir una nemotecnia para recordarlo.",
      isUser: false,
    },
  ]);

  function answer(idx: number) {
    if (answered !== null) return;
    setAnswered(idx);
    setInteractions((i) => i + 1);
  }

  function nextQuestion() {
    setQuestion(pickPracticeQuestion());
    setAnswered(null);
  }

  function send() {
    const t = input.trim();
    if (!t) return;
    const reply = yarisReply(turn, { materiaName: t }, t);
    setMsgs((m) => [...m, { html: t, isUser: true }, { html: reply.t, isUser: false }]);
    setInput("");
    setTurn((n) => n + 1);
    setInteractions((i) => i + 1);
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(interactions); }}
      style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
    >
      <div style={{ background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", fontFamily: "'Manrope', sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", color: "#22375C", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon n="spark" size={20} color="#3D5D91" /> {PRUEBA_TITLES[mode]}
          </h2>
          <button
            onClick={() => onClose(interactions)}
            style={{ background: "rgba(61,93,145,.08)", border: "none", color: "#3D5D91", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
          ><Icon n="close" size={15} /></button>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#647DA0", margin: "0 0 16px" }}>Yaris comprueba si realmente entendiste</p>

        {mode === "preguntas" ? (
          question === null ? (
            <p style={{ fontSize: "0.86rem", color: "#647DA0", lineHeight: 1.6 }}>
              Aún no hay preguntas publicadas para practicar. Vuelve más tarde.
            </p>
          ) : (
            <div>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#22375C", lineHeight: 1.55, marginBottom: 12 }}>{question.text}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {question.options.map((opt, idx) => {
                  const isCorrect = idx === question.correctIndex;
                  const isChosen = answered === idx;
                  const showState = answered !== null;
                  return (
                    <button
                      key={idx}
                      onClick={() => answer(idx)}
                      style={{
                        padding: "11px 14px",
                        borderRadius: 10,
                        textAlign: "left",
                        cursor: answered === null ? "pointer" : "default",
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: "0.84rem",
                        color: "#22375C",
                        border: `2px solid ${showState && isCorrect ? "#2ecc71" : showState && isChosen ? "#e74c3c" : "#F2DCDB"}`,
                        background: showState && isCorrect ? "rgba(46,204,113,.08)" : showState && isChosen ? "rgba(231,76,60,.06)" : "white",
                        transition: "all .15s",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered !== null && (
                <div style={{ background: "#f8f9ff", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: answered === question.correctIndex ? "#1a7a4a" : "#6C0820", marginBottom: 4 }}>
                    {answered === question.correctIndex ? "¡Correcto! ✈️" : `Casi. La respuesta correcta es: "${question.options[question.correctIndex]}"`}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#555", lineHeight: 1.6, margin: 0 }}>{question.explanation}</p>
                  {question.cite && <p style={{ fontSize: "0.72rem", color: "#8DA1BE", margin: "6px 0 0" }}>{question.cite}</p>}
                </div>
              )}
              {answered !== null && (
                <button
                  onClick={nextQuestion}
                  style={{ width: "100%", padding: 11, background: "#3D5D91", color: "white", border: "none", borderRadius: 10, fontSize: "0.86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                >
                  Otra pregunta
                </button>
              )}
            </div>
          )
        ) : (
          <div>
            <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: m.isUser ? "row-reverse" : "row" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: m.isUser ? "#3D5D91" : "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", color: m.isUser ? "white" : "#22375C", flexShrink: 0 }}>
                    {m.isUser ? <Icon n="user" size={13} /> : <Icon n="spark" size={13} />}
                  </div>
                  <div style={{ maxWidth: "84%", padding: "8px 12px", borderRadius: m.isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px", background: m.isUser ? "#3D5D91" : "#f0f4ff", color: m.isUser ? "white" : "#22375C", fontSize: "0.82rem", lineHeight: 1.55 }}>
                    {m.isUser ? m.html : <span dangerouslySetInnerHTML={{ __html: m.html }} />}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={mode === "explica" ? "Escribe el tema…" : "Escribe el concepto…"}
                style={{ flex: 1, border: "2px solid #F2DCDB", borderRadius: 18, padding: "8px 12px", fontSize: "0.82rem", fontFamily: "'Manrope', sans-serif", outline: "none" }}
              />
              <button
                onClick={send}
                style={{ width: 34, height: 34, background: "#3D5D91", border: "none", borderRadius: "50%", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              ><Icon n="send" size={15} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LOCK OVERLAY (plan básico — PRD 5.3)
══════════════════════════════════════════════════════════ */
function LockOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 60, borderRadius: 16,
      background: "rgba(245,247,252,.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, textAlign: "center", padding: 20,
    }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(61,93,145,.3)" }}>
        <Icon n="lock" size={22} color="#fff" />
      </div>
      <button
        onClick={onUnlock}
        style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#6C0820", color: "white", fontSize: ".84rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
      >
        Desbloquear Estudiemos Juntos
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
function EstudiemosJuntosPage() {
  const user = useSessionUser();
  const paid = isPaid(user);
  const timer = useTimer();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tiempo, setTiempo] = useState<TiempoDisponible>("1h");
  const [examDate, setExamDate] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customHours, setCustomHours] = useState("0");
  const [customMins, setCustomMins] = useState("45");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [pruebaMode, setPruebaMode] = useState<PruebaMode | null>(null);

  const profile = useStore(() => (user ? buildProfile(user) : null));

  useEffect(() => {
    if (!user) return;
    if (!paid) {
      // Estudiemos Juntos está bloqueado para suscripción básica (PRD 5.3)
      setShowOnboarding(false);
      setUpgradeOpen(true);
      return;
    }
    const done = localStorage.getItem("fp_onboarding_done");
    if (!done) {
      setShowOnboarding(true);
    } else {
      // user.fechaCiaac tiene prioridad sobre localStorage
      setExamDate(user.fechaCiaac ?? localStorage.getItem("fp_exam_date"));
      setTiempo((localStorage.getItem("fp_tiempo_disponible") as TiempoDisponible) || "1h");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, paid]);

  function handleOnboardingDone() {
    setExamDate(user?.fechaCiaac ?? localStorage.getItem("fp_exam_date"));
    setTiempo((localStorage.getItem("fp_tiempo_disponible") as TiempoDisponible) || "1h");
    setShowOnboarding(false);
  }

  function reopenOnboarding() {
    if (!paid) {
      setUpgradeOpen(true);
      return;
    }
    localStorage.removeItem("fp_onboarding_done");
    setShowOnboarding(true);
  }

  if (!user || !profile) {
    return <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 48px" }} />;
  }

  const { phase, daysLeft } = getExamPhaseFromDate(examDate);
  const rec = getRecommendation(profile, phase);
  const plan = buildPlan(rec, tiempo, profile);
  const progreso = computeRuta(profile);

  /** Arranca el timer flotante y navega a la actividad del plan. */
  function startPlanItem(item: PlanItem) {
    if (!user) return;
    const materiaName = rec.subject?.name ?? "FlightPath";
    timer.startSession(item.titulo, materiaName, item.descripcion, "Sesión con Pathy");
    logActivity({
      userId: user.id,
      kind: "pathy_session",
      label: `Estudia con Pathy — ${item.titulo}`,
      durationMin: 0,
    });
    navigate({ to: item.link as never });
  }

  function openPrueba(mode: PruebaMode) {
    if (!user) return;
    if (!paid) {
      setUpgradeOpen(true);
      return;
    }
    logYarisUse(user.id, "Ponme a prueba");
    setPruebaMode(mode);
  }

  function closePrueba(interactions: number) {
    if (user && interactions >= 1) {
      logActivity({ userId: user.id, kind: "pathy_session", label: "Ponme a prueba", durationMin: 5 });
    }
    setPruebaMode(null);
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 48px", position: "relative" }}>
      {paid && showOnboarding && <OnboardingModal onDone={handleOnboardingDone} userId={user.id} />}

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#22375C", margin: 0 }}>
            Estudiemos juntos
          </h1>
          <button
            onClick={reopenOnboarding}
            style={{
              padding: "6px 14px",
              border: "1.5px solid #F2DCDB",
              borderRadius: 8,
              background: "white",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#647DA0",
              cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            Cambiar <Icon n="settings" size={14} />
          </button>
        </div>
        <p style={{ fontSize: "0.88rem", color: "#647DA0", margin: 0 }}>
          Hola, {profile.name}. Paty revisó tu progreso y preparó tu plan de hoy.
        </p>
      </div>

      {/* Summary strip */}
      <SummaryStrip daysLeft={daysLeft} phase={phase} progreso={progreso} />

      {/* Pathy recommendation card */}
      <PathyCard rec={rec} phase={phase} />

      {/* Time selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Tiempo hoy:
          </span>
          {(["30min", "1h", "2h"] as TiempoDisponible[]).map(t => (
            <button
              key={t}
              onClick={() => {
                setTiempo(t);
                setShowCustom(false);
                localStorage.setItem("fp_tiempo_disponible", t);
              }}
              style={{
                padding: "6px 14px",
                border: `1.5px solid ${tiempo === t ? "#3D5D91" : "#F2DCDB"}`,
                borderRadius: 20,
                background: tiempo === t ? "rgba(61,93,145,0.08)" : "white",
                fontSize: "0.8rem",
                fontWeight: tiempo === t ? 700 : 500,
                color: tiempo === t ? "#3D5D91" : "#647DA0",
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {t === "30min" ? "30 min" : t === "1h" ? "1 hora" : "2+ horas"}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(v => !v)}
            style={{
              padding: "6px 14px",
              border: `1.5px solid ${tiempo === "custom" ? "#6C0820" : "#F2DCDB"}`,
              borderRadius: 20,
              background: tiempo === "custom" ? "rgba(108,8,32,0.07)" : "white",
              fontSize: "0.8rem",
              fontWeight: tiempo === "custom" ? 700 : 500,
              color: tiempo === "custom" ? "#6C0820" : "#647DA0",
              cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon n="pencil" size={14} /> {tiempo === "custom" ? `${customHours}h ${customMins}m` : "Personalizar"}
          </button>
        </div>

        {/* Custom time picker */}
        {showCustom && (
          <div style={{
            marginTop: 10,
            background: "white",
            border: "1.5px solid #F2DCDB",
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: 600 }}>¿Cuánto tiempo tienes?</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="number"
                min="0"
                max="23"
                value={customHours}
                onChange={e => setCustomHours(e.target.value)}
                style={{
                  width: 52,
                  padding: "5px 8px",
                  border: "1.5px solid #F2DCDB",
                  borderRadius: 8,
                  fontSize: "0.88rem",
                  fontFamily: "'Manrope', sans-serif",
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <span style={{ fontSize: "0.82rem", color: "#647DA0" }}>h</span>
              <input
                type="number"
                min="0"
                max="59"
                value={customMins}
                onChange={e => setCustomMins(e.target.value)}
                style={{
                  width: 52,
                  padding: "5px 8px",
                  border: "1.5px solid #F2DCDB",
                  borderRadius: 8,
                  fontSize: "0.88rem",
                  fontFamily: "'Manrope', sans-serif",
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <span style={{ fontSize: "0.82rem", color: "#647DA0" }}>min</span>
            </div>
            <button
              onClick={() => {
                setTiempo("custom");
                localStorage.setItem("fp_tiempo_disponible", "custom");
                localStorage.setItem("fp_tiempo_custom_h", customHours);
                localStorage.setItem("fp_tiempo_custom_m", customMins);
                setShowCustom(false);
              }}
              style={{
                padding: "6px 16px",
                background: "#3D5D91",
                color: "white",
                border: "none",
                borderRadius: 20,
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      {/* Plan items */}
      <div>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Tu plan para hoy — {plan.reduce((s, i) => s + i.duracion_min, 0)} min
        </p>
        {plan.map((item, i) => (
          <PlanItemCard key={i} item={item} index={i} onStart={startPlanItem} />
        ))}
      </div>

      {/* Weakness chips */}
      <WeaknessChips materias={profile.materias} />

      {/* Ponme a prueba (PRD 6.10) */}
      <div style={{ background: "white", borderRadius: 16, padding: 24, marginTop: 24, boxShadow: "0 2px 16px rgba(61,93,145,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ display: "inline-flex", color: "#3D5D91" }}><Icon n="spark" size={20} /></span>
          <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.05rem", color: "#22375C", margin: 0 }}>
            Ponme a prueba
          </h3>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#647DA0", margin: "0 0 14px" }}>Yaris comprueba si realmente entendiste</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([
            { mode: "preguntas" as PruebaMode, label: "Hazme preguntas", icon: "help" },
            { mode: "explica" as PruebaMode, label: "Explícamelo fácil", icon: "lightbulb" },
            { mode: "nemo" as PruebaMode, label: "Dame una nemotecnia", icon: "brain" },
          ]).map((b) => (
            <button
              key={b.mode}
              onClick={() => openPrueba(b.mode)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                border: "1.5px solid #F2DCDB",
                borderRadius: 20,
                background: "white",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#3D5D91",
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.background = "rgba(61,93,145,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.background = "white"; }}
            >
              <Icon n={b.icon as never} size={15} /> {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Candado de plan básico: la página se ve pero está bloqueada */}
      {!paid && <LockOverlay onUnlock={() => setUpgradeOpen(true)} />}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Estudiemos Juntos"
        benefit="Pathy arma tu plan diario según tu progreso real y te acompaña sesión por sesión."
        userId={user.id}
      />

      {pruebaMode && <PruebaModal mode={pruebaMode} onClose={closePrueba} />}
    </div>
  );
}
