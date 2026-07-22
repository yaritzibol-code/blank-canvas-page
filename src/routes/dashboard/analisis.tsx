import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { PlaneField } from "@/components/shared/PlaneField";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import {
  getQuizAttempts,
  getSimAttempts,
  getStudyDays,
  isPaid,
  materiaPerformance,
  pathyAnalysisMessage,
  recentActivity,
  studentStats,
  todayKey,
  useSessionUser,
  useStore,
} from "@/lib/store";

export const Route = createFileRoute("/dashboard/analisis")({
  component: AnalisisPage,
});

type Period = "semana" | "mes" | "todo";

const TODAY_IDX = 34;
const WEEK_LETTERS = ["D", "L", "M", "M", "J", "V", "S"];

function heatColor(level: number) {
  if (level === 0) return "#F2DCDB";
  if (level === 1) return "rgba(61,93,145,.2)";
  if (level === 2) return "rgba(61,93,145,.4)";
  if (level === 3) return "rgba(61,93,145,.6)";
  return "#3D5D91";
}

function heatTitle(level: number) {
  if (level === 0) return "Sin actividad";
  if (level === 1) return "Menos de 20 min";
  if (level === 2) return "20–40 min";
  if (level === 3) return "40–70 min";
  return "70+ min";
}

function scoreColor(score: number) {
  if (score >= 75) return "#2ecc71";
  if (score >= 60) return "#f39c12";
  return "#e74c3c";
}

function materiaColor(avg: number) {
  if (avg >= 70) return "#2ecc71";
  if (avg >= 50) return "#f39c12";
  return "#e74c3c";
}

/** Preguntas respondidas y promedio en una ventana de tiempo [from, to). */
function answeredBetween(userId: string, from: number, to: number) {
  let c = 0;
  let t = 0;
  const inRange = (iso: string) => {
    const ts = new Date(iso).getTime();
    return ts >= from && ts < to;
  };
  getQuizAttempts(userId).filter((a) => inRange(a.date)).forEach((a) => { c += a.correct; t += a.total; });
  getSimAttempts(userId).filter((a) => inRange(a.date)).forEach((a) => { c += a.correct; t += a.total; });
  return { answered: t, avg: t > 0 ? Math.round((c / t) * 100) : null };
}

function relTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Ayer" : `hace ${days} días`;
}

const ACT_ICON: Record<string, string> = {
  quiz: "doc", simulador: "sim", flashcards: "cards", clase: "play", tema: "book",
  bitacora: "pencil", biblioteca: "library", pathy_session: "users", yaris: "chat",
};
const ACT_BG: Record<string, string> = {
  quiz: "rgba(61,93,145,.08)", simulador: "rgba(108,8,32,.08)", flashcards: "rgba(90,134,203,.1)",
  clase: "rgba(46,204,113,.08)", tema: "rgba(61,93,145,.08)", bitacora: "rgba(242,174,188,.2)",
  biblioteca: "rgba(243,156,18,.1)", pathy_session: "rgba(90,134,203,.1)", yaris: "rgba(61,93,145,.08)",
};
const ACT_KIND: Record<string, string> = {
  quiz: "Cuestionario", simulador: "Simulador", flashcards: "Flashcards", clase: "Clase grabada",
  tema: "Learning Path", bitacora: "Mi Bitácora", biblioteca: "Biblioteca",
  pathy_session: "Sesión con Pathy", yaris: "Yaris",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Overlay de candado para secciones bloqueadas (plan básico). */
function LockOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 5, borderRadius: 16,
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
        Desbloquear análisis completo
      </button>
    </div>
  );
}

function AnalisisPage() {
  const user = useSessionUser();
  const [period, setPeriod] = useState<Period>("semana");
  const [hoverHeat, setHoverHeat] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const data = useStore(() => {
    if (!user) return null;
    const stats = studentStats(user.id, period);
    const pathyMsg = pathyAnalysisMessage(user, period);
    const days = getStudyDays(user.id);

    // Heatmap: últimos 35 días, nivel 0-4 según minutos estudiados
    const heat: number[] = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const mins = Math.round((days[todayKey(d)] ?? 0) / 60);
      heat.push(mins <= 0 ? 0 : mins < 20 ? 1 : mins < 40 ? 2 : mins < 70 ? 3 : 4);
    }

    // Barras: minutos de estudio de los últimos 7 días, etiqueta según día real
    const barDays: string[] = [];
    const barVals: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      barDays.push(WEEK_LETTERS[d.getDay()]);
      barVals.push(Math.round((days[todayKey(d)] ?? 0) / 60));
    }

    const materias = materiaPerformance(user.id, period).filter((m) => m.avg !== null);

    const sims = getSimAttempts(user.id)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => {
        const d = new Date(s.date);
        const h = Math.floor(s.durationSecs / 3600);
        const m = Math.round((s.durationSecs % 3600) / 60);
        return {
          day: d.getDate(),
          month: capitalize(d.toLocaleDateString("es-MX", { month: "long" })),
          title: "Simulador CIAAC",
          sub: `${s.total} preguntas · ${h > 0 ? `${h}h ` : ""}${m}min`,
          score: Math.round(s.scorePct),
        };
      });

    const activity = recentActivity(user.id, 50)
      .filter((a) => ACT_ICON[a.kind])
      .slice(0, 5)
      .map((a) => ({
        icon: ACT_ICON[a.kind],
        bg: ACT_BG[a.kind] ?? "rgba(61,93,145,.08)",
        title: a.label,
        sub: a.durationMin > 0 ? `${ACT_KIND[a.kind]} · ${a.durationMin} min` : ACT_KIND[a.kind],
        score: a.score,
        time: relTime(a.date),
      }));

    // Deltas reales: periodo actual vs mismo número de días hacia atrás
    const nDays = period === "semana" ? 7 : period === "mes" ? 30 : null;
    let dAnswered: number | null = null;
    let dAvg: number | null = null;
    if (nDays) {
      const now = Date.now();
      const cur = answeredBetween(user.id, now - nDays * 86400000, now + 1);
      const prev = answeredBetween(user.id, now - 2 * nDays * 86400000, now - nDays * 86400000);
      dAnswered = cur.answered - prev.answered;
      dAvg = cur.avg !== null && prev.avg !== null ? cur.avg - prev.avg : null;
    }

    return { stats, pathyMsg, heat, barDays, barVals, materias, sims, activity, dAnswered, dAvg };
  });

  const periods: { key: Period; label: string }[] = [
    { key: "semana", label: "Esta semana" },
    { key: "mes",    label: "Este mes" },
    { key: "todo",   label: "Todo el tiempo" },
  ];

  if (!user || !data) return <div style={{ fontFamily: "'Manrope', sans-serif" }} />;

  const { stats, barVals, barDays } = data;
  const paid = isPaid(user);
  const firstName = user.nombre.split(" ")[0];
  const cmpLabel = period === "semana" ? "vs semana pasada" : "vs mes pasado";

  const deltaOf = (d: number | null, unit: string) => {
    if (d === null) return null;
    if (d === 0) return { color: "#8DA1BE", text: `Igual que el periodo anterior` };
    return d > 0
      ? { color: "#2ecc71", text: `↑ +${d}${unit} ${cmpLabel}` }
      : { color: "#e74c3c", text: `↓ ${d}${unit} ${cmpLabel}` };
  };

  const statCards: { icon: string; val: string; label: string; delta: { color: string; text: string } | null }[] = [
    { icon: "flame", val: String(stats.streak), label: "Días de racha", delta: null },
    { icon: "help",  val: stats.answered.toLocaleString("es-MX"), label: "Preguntas respondidas", delta: deltaOf(data.dAnswered, "") },
    { icon: "check", val: stats.avgScore !== null ? `${stats.avgScore}%` : "—", label: "Promedio de aciertos", delta: deltaOf(data.dAvg, " pts") },
    { icon: "timer", val: `${stats.studyHours}h`, label: "Tiempo de estudio", delta: null },
  ];

  const barMax = Math.max(...barVals, 1);
  const maxIdx = barVals.indexOf(Math.max(...barVals));
  const streakStart = new Date(Date.now() - Math.max(stats.streak - 1, 0) * 86400000);

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", position: "relative", isolation: "isolate" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: "-24px -24px auto -24px", height: 340, zIndex: 0, pointerEvents: "none", opacity: 0.5 }}>
        <PlaneField count={9} />
      </div>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* Editorial header */}
      <header style={{ position: "relative", zIndex: 1, marginBottom: 24, paddingTop: 8 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.22em", color: "#647DA0", textTransform: "uppercase", marginBottom: 10 }}>
          Cabina · Análisis de vuelo
        </div>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(2rem, 5vw, 3rem)",
          lineHeight: 1.05,
          color: "#22375C",
          margin: 0,
        }}>
          Lecturas de tu <em style={{ color: "#6C0820" }}>trayectoria</em>.
        </h1>
        <div style={{ marginTop: 10, maxWidth: 560, fontSize: "0.92rem", color: "#647DA0", lineHeight: 1.55 }}>
          Panel editorial con tu rendimiento por materia, calor de estudio y sugerencias de Pathy — todo con datos reales de tu bitácora.
        </div>
        <div aria-hidden="true" style={{ marginTop: 14, height: 1, background: "linear-gradient(90deg, #22375C 0%, transparent 70%)" }} />
      </header>

      {/* Period tabs */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: "6px 16px",
              border: `2px solid ${period === p.key ? "#3D5D91" : "#F2DCDB"}`,
              borderRadius: 20, fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
              background: period === p.key ? "#3D5D91" : "white",
              color: period === p.key ? "white" : "#647DA0",
              transition: "all .2s", fontFamily: "'Manrope', sans-serif",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Pathy card */}
      <div style={{ background: "linear-gradient(135deg,#22375C,#2a2a4e)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ animation: "float 3s ease-in-out infinite", flexShrink: 0, display: "flex", color: "white" }}><Icon n="cloud" size={56} /></div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", color: "white", marginBottom: 4 }}>¡Hola, {firstName}!</h3>
          <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>
            {data.pathyMsg}
          </p>
        </div>
      </div>

      {/* Tarjetas principales PRD: Avance del curso vs Preparación estimada */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14, marginBottom: 14 }}>
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ display: "flex", color: "#3D5D91" }}><Icon n="chart" size={24} /></span>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "#22375C", lineHeight: 1 }}>{stats.courseProgress}%</span>
          <span style={{ fontSize: ".74rem", color: "#647DA0" }}>Avance del curso</span>
          <span style={{ fontSize: ".72rem", color: "#8DA1BE" }}>Tu recorrido por temas, clases y flashcards.</span>
        </div>
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ display: "flex", color: "#6C0820" }}><Icon n="target" size={24} /></span>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "#22375C", lineHeight: 1 }}>{stats.readiness !== null ? `${stats.readiness}%` : "—"}</span>
          <span style={{ fontSize: ".74rem", color: "#647DA0" }}>Preparación estimada</span>
          <span style={{ fontSize: ".72rem", color: "#8DA1BE" }}>Basada solo en cuestionarios y simulador. No garantiza aprobación.</span>
        </div>
      </div>

      {/* Hero stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ display: "flex", color: "#3D5D91" }}><Icon n={s.icon as never} size={24} /></span>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "#22375C", lineHeight: 1 }}>{s.val}</span>
            <span style={{ fontSize: ".74rem", color: "#647DA0" }}>{s.label}</span>
            {s.delta && (
              <span style={{ fontSize: ".72rem", fontWeight: 700, color: s.delta.color }}>{s.delta.text}</span>
            )}
          </div>
        ))}
      </div>

      {/* Streak + Heatmap */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="flame" size={16} /> Racha de estudio</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "3rem", fontWeight: 900, color: "#6C0820", lineHeight: 1 }}>{stats.streak}</span>
            <div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#22375C", display: "flex", alignItems: "center", gap: 6 }}>días seguidos <Icon n="flame" size={15} /></div>
              <div style={{ fontSize: ".75rem", color: "#647DA0" }}>
                {stats.streak > 0
                  ? `Empezaste el ${streakStart.toLocaleDateString("es-MX", { day: "numeric", month: "long" })} · ¡Sigue así!`
                  : "Estudia hoy para comenzar una nueva racha."}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "#3D5D91" }}>{stats.streak}</div>
            <div style={{ fontSize: ".72rem", color: "#8DA1BE" }}>Récord personal</div>
          </div>
        </div>

        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Últimas 5 semanas</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {data.heat.map((level, i) => (
            <div
              key={i}
              title={heatTitle(level)}
              onMouseEnter={() => setHoverHeat(i)}
              onMouseLeave={() => setHoverHeat(null)}
              style={{
                aspectRatio: "1", borderRadius: 4,
                background: heatColor(level),
                outline: i === TODAY_IDX ? "2px solid #6C0820" : undefined,
                outlineOffset: i === TODAY_IDX ? 1 : undefined,
                transform: hoverHeat === i ? "scale(1.2)" : "none",
                transition: "transform .15s",
                cursor: "default",
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: ".65rem", color: "#8DA1BE" }}>Menos</span>
          {[0, 1, 2, 4].map((l) => (
            <div key={l} style={{ width: 10, height: 10, borderRadius: 2, background: heatColor(l) }} />
          ))}
          <span style={{ fontSize: ".65rem", color: "#8DA1BE" }}>Más</span>
        </div>
      </div>

      {/* Two col: bar chart + materias */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18, marginBottom: 24 }}>

        {/* Bar chart */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon n="calendar" size={16} /> Minutos de estudio por día</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
            {barDays.map((day, i) => {
              const pct = barMax > 0 ? (barVals[i] / barMax) * 100 : 0;
              const isHighlight = i === maxIdx && barVals[i] > 0;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  {barVals[i] > 0 && (
                    <span style={{ fontSize: ".68rem", fontWeight: 700, color: isHighlight ? "#6C0820" : "#3D5D91" }}>{barVals[i]}</span>
                  )}
                  <div style={{
                    width: "100%", minHeight: 4, borderRadius: "6px 6px 0 0",
                    height: `${pct}%`,
                    background: isHighlight
                      ? "linear-gradient(180deg,#F2AEBC,#6C0820)"
                      : "linear-gradient(180deg,#5A86CB,#3D5D91)",
                    transition: "height .4s ease",
                  }} />
                  <span style={{ fontSize: ".65rem", color: "#8DA1BE" }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Materias chart */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", position: "relative" }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon n="book" size={16} /> Promedio por materia</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.materias.length === 0 && (
              <p style={{ fontSize: ".8rem", color: "#8DA1BE" }}>Aún no hay datos de cuestionarios o simuladores en este periodo.</p>
            )}
            {data.materias.map((m) => (
              <div key={m.slug} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: ".78rem", color: "#22375C", width: 120, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 6 }}><Icon n={m.icon as never} size={15} /> {m.name}</span>
                <div style={{ flex: 1, height: 8, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 10, background: materiaColor(m.avg ?? 0), width: `${m.avg ?? 0}%`, transition: "width .6s ease" }} />
                </div>
                <span style={{ fontSize: ".74rem", fontWeight: 700, width: 36, textAlign: "right", flexShrink: 0, color: materiaColor(m.avg ?? 0) }}>{m.avg}%</span>
              </div>
            ))}
          </div>
          {!paid && <LockOverlay onUnlock={() => setUpgradeOpen(true)} />}
        </div>
      </div>

      {/* Exam history */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24, position: "relative" }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon n="sim" size={16} /> Historial de simuladores</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.sims.length === 0 && (
            <p style={{ fontSize: ".8rem", color: "#8DA1BE" }}>Aún no has hecho simuladores. Tu primer intento aparecerá aquí.</p>
          )}
          {data.sims.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#f8f9ff" }}>
              <div style={{ width: 60, flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", fontWeight: 900, color: "#22375C" }}>{e.day}</div>
                <div style={{ fontSize: ".72rem", color: "#8DA1BE" }}>{e.month}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: ".84rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{e.title}</h4>
                <p style={{ fontSize: ".73rem", color: "#647DA0" }}>{e.sub}</p>
              </div>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", fontWeight: 900, flexShrink: 0, color: scoreColor(e.score) }}>{e.score}%</span>
            </div>
          ))}
        </div>
        {!paid && <LockOverlay onUnlock={() => setUpgradeOpen(true)} />}
      </div>

      {/* Activity log */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24, position: "relative" }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Icon n="clock" size={16} /> Actividad reciente</div>
        <div>
          {data.activity.length === 0 && (
            <p style={{ fontSize: ".8rem", color: "#8DA1BE", padding: "12px 0" }}>Aún no hay actividad registrada.</p>
          )}
          {data.activity.map((a, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < data.activity.length - 1 ? "1px solid rgba(61,93,145,.05)" : undefined }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: a.bg, color: "#3D5D91" }}><Icon n={a.icon as never} size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: ".85rem", fontWeight: 600, color: "#22375C", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                <div style={{ fontSize: ".74rem", color: "#647DA0" }}>{a.sub}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {a.score !== null && (
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1rem", fontWeight: 900, color: scoreColor(a.score) }}>{a.score}%</div>
                )}
                <div style={{ fontSize: ".7rem", color: "#8DA1BE" }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
        {!paid && <LockOverlay onUnlock={() => setUpgradeOpen(true)} />}
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Análisis completo"
        benefit="Desempeño por materia, historial de simuladores y toda tu actividad para saber exactamente qué reforzar."
        userId={user.id}
      />
    </div>
  );
}
