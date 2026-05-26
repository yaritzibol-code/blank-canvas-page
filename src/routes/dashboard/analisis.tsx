import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/analisis")({
  component: AnalisisPage,
});

type Period = "semana" | "mes" | "todo";

const HEAT_LEVELS = [0,0,1,2,1,0,0, 0,1,2,3,2,1,0, 1,2,3,4,3,2,1, 2,3,4,4,3,2,0, 3,4,4,4,4,0,0];
const TODAY_IDX = 32;

const BAR_DAYS = ["L","M","M","J","V","S","D"];
const BAR_VALS = [45, 80, 30, 120, 95, 60, 0];
const BAR_MAX = 120;

const MATERIAS_DATA = [
  { name: "✈️ Aerodinámica",      pct: 84, color: "#2ecc71" },
  { name: "⚙️ Aeronaves",         pct: 78, color: "#3D5D91" },
  { name: "⚖️ Legislación",       pct: 70, color: "#f39c12" },
  { name: "🏥 Medicina",          pct: 85, color: "#2ecc71" },
  { name: "🌤️ Meteorología",      pct: 52, color: "#e74c3c" },
  { name: "🗺️ Navegación",        pct: 65, color: "#f39c12" },
  { name: "🗼 Tránsito Aéreo",    pct: 72, color: "#3D5D91" },
  { name: "🧠 Factores Humanos",  pct: 88, color: "#2ecc71" },
];

const EXAM_HISTORY = [
  { day: 22, month: "Mayo", title: "Simulador CIAAC", sub: "310 preguntas · 4h 32min", score: 68 },
  { day: 15, month: "Mayo", title: "Simulador CIAAC", sub: "310 preguntas · 4h 18min", score: 65 },
  { day: 8,  month: "Mayo", title: "Simulador CIAAC", sub: "310 preguntas · 3h 55min", score: 58 },
];

const ACTIVITY = [
  { icon: "❓", bg: "rgba(61,93,145,.08)",  title: "Cuestionario — Meteorología",            sub: "50 preguntas · Modo Aprendiendo",  score: 82, scoreColor: "#2ecc71",  time: "Hoy, 10:24" },
  { icon: "🃏", bg: "rgba(90,134,203,.1)",  title: "Flashcards — Fuerzas en vuelo",          sub: "8 tarjetas · 6 dominadas",         score: 75, scoreColor: "#2ecc71",  time: "Hoy, 09:10" },
  { icon: "🎬", bg: "rgba(46,204,113,.08)", title: "Clase — Nubes: Clasificación y Formación", sub: "Meteorología · 22:15 min",        score: 35, scoreColor: "#3D5D91",  time: "Ayer, 20:45" },
  { icon: "📝", bg: "rgba(108,8,32,.08)",   title: "Simulador CIAAC completo",                sub: "310 preguntas · 4h 32min",         score: 68, scoreColor: "#f39c12",  time: "Hace 2 días" },
  { icon: "❓", bg: "rgba(61,93,145,.08)",  title: "Cuestionario — Todas las materias",       sub: "30 preguntas · Modo Aprendiendo",  score: 90, scoreColor: "#2ecc71",  time: "Hace 3 días" },
];

function heatColor(level: number) {
  if (level === 0) return "#F2DCDB";
  if (level === 1) return "rgba(61,93,145,.2)";
  if (level === 2) return "rgba(61,93,145,.4)";
  if (level === 3) return "rgba(61,93,145,.6)";
  return "#3D5D91";
}

function heatTitle(level: number) {
  if (level === 0) return "Sin actividad";
  if (level === 1) return "1–10 preguntas";
  if (level === 2) return "11–30 preguntas";
  if (level === 3) return "31–60 preguntas";
  return "60+ preguntas";
}

function scoreColor(score: number) {
  if (score >= 75) return "#2ecc71";
  if (score >= 60) return "#f39c12";
  return "#e74c3c";
}

function AnalisisPage() {
  const [period, setPeriod] = useState<Period>("semana");
  const [hoverHeat, setHoverHeat] = useState<number | null>(null);

  const periods: { key: Period; label: string }[] = [
    { key: "semana", label: "Esta semana" },
    { key: "mes",    label: "Este mes" },
    { key: "todo",   label: "Todo el tiempo" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* Period tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: "6px 16px",
              border: `2px solid ${period === p.key ? "#3D5D91" : "#F2DCDB"}`,
              borderRadius: 20, fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
              background: period === p.key ? "#3D5D91" : "white",
              color: period === p.key ? "white" : "#888",
              transition: "all .2s", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Pathy card */}
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2a2a4e)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ fontSize: "3.5rem", animation: "float 3s ease-in-out infinite", flexShrink: 0 }}>☁️</div>
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "white", marginBottom: 4 }}>¡Vas muy bien, María! 🎯</h3>
          <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>
            Esta semana estudiaste <strong style={{ color: "#F2AEBC" }}>4 días seguidos</strong> y tu promedio en cuestionarios subió un{" "}
            <strong style={{ color: "#F2AEBC" }}>12%</strong> respecto a la semana pasada. Tu punto más débil sigue siendo{" "}
            <strong style={{ color: "#F2AEBC" }}>Meteorología</strong> — te recomiendo 2 sesiones esta semana. ¡Tú puedes! ✈️
          </p>
        </div>
      </div>

      {/* Hero stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { icon: "🔥", val: "14",    label: "Días de racha",          delta: "↑ Récord personal",          up: true },
          { icon: "❓", val: "1,240", label: "Preguntas respondidas",  delta: "↑ +180 esta semana",         up: true },
          { icon: "✅", val: "74%",   label: "Promedio de aciertos",   delta: "↑ +12% vs semana pasada",    up: true },
          { icon: "⏱️", val: "18h",   label: "Tiempo de estudio",      delta: "↑ +3h vs semana pasada",     up: true },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900, color: "#1a1a2e", lineHeight: 1 }}>{s.val}</span>
            <span style={{ fontSize: ".74rem", color: "#888" }}>{s.label}</span>
            <span style={{ fontSize: ".72rem", fontWeight: 700, color: s.up ? "#2ecc71" : "#e74c3c" }}>{s.delta}</span>
          </div>
        ))}
      </div>

      {/* Streak + Heatmap */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>🔥 Racha de estudio</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", fontWeight: 900, color: "#6C0820", lineHeight: 1 }}>14</span>
            <div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#1a1a2e" }}>días seguidos 🔥</div>
              <div style={{ fontSize: ".75rem", color: "#888" }}>Empezaste el 8 de mayo · ¡Sigue así!</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 900, color: "#3D5D91" }}>14</div>
            <div style={{ fontSize: ".72rem", color: "#aaa" }}>Récord personal</div>
          </div>
        </div>

        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Últimas 5 semanas</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {HEAT_LEVELS.map((level, i) => (
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
          <span style={{ fontSize: ".65rem", color: "#aaa" }}>Menos</span>
          {[0, 1, 2, 4].map((l) => (
            <div key={l} style={{ width: 10, height: 10, borderRadius: 2, background: heatColor(l) }} />
          ))}
          <span style={{ fontSize: ".65rem", color: "#aaa" }}>Más</span>
        </div>
      </div>

      {/* Two col: bar chart + materias */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18, marginBottom: 24 }}>

        {/* Bar chart */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>📅 Preguntas por día esta semana</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
            {BAR_DAYS.map((day, i) => {
              const pct = BAR_MAX > 0 ? (BAR_VALS[i] / BAR_MAX) * 100 : 0;
              const isHighlight = i === 3;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  {BAR_VALS[i] > 0 && (
                    <span style={{ fontSize: ".68rem", fontWeight: 700, color: isHighlight ? "#6C0820" : "#3D5D91" }}>{BAR_VALS[i]}</span>
                  )}
                  <div style={{
                    width: "100%", minHeight: 4, borderRadius: "6px 6px 0 0",
                    height: `${pct}%`,
                    background: isHighlight
                      ? "linear-gradient(180deg,#F2AEBC,#6C0820)"
                      : "linear-gradient(180deg,#5A86CB,#3D5D91)",
                    transition: "height .4s ease",
                  }} />
                  <span style={{ fontSize: ".65rem", color: "#aaa" }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Materias chart */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)" }}>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>📚 Promedio por materia</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MATERIAS_DATA.map((m) => (
              <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: ".78rem", color: "#1a1a2e", width: 120, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                <div style={{ flex: 1, height: 8, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 10, background: m.color, width: `${m.pct}%`, transition: "width .6s ease" }} />
                </div>
                <span style={{ fontSize: ".74rem", fontWeight: 700, width: 36, textAlign: "right", flexShrink: 0, color: m.color }}>{m.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exam history */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>📝 Historial de simuladores</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXAM_HISTORY.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#f8f9ff" }}>
              <div style={{ width: 60, flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 900, color: "#1a1a2e" }}>{e.day}</div>
                <div style={{ fontSize: ".72rem", color: "#aaa" }}>{e.month}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: ".84rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{e.title}</h4>
                <p style={{ fontSize: ".73rem", color: "#888" }}>{e.sub}</p>
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900, flexShrink: 0, color: scoreColor(e.score) }}>{e.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity log */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 24 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>🕐 Actividad reciente</div>
        <div>
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < ACTIVITY.length - 1 ? "1px solid rgba(61,93,145,.05)" : undefined }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, background: a.bg }}>{a.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: ".85rem", fontWeight: 600, color: "#1a1a2e", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                <div style={{ fontSize: ".74rem", color: "#888" }}>{a.sub}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 900, color: a.scoreColor }}>{a.score}%</div>
                <div style={{ fontSize: ".7rem", color: "#aaa" }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
