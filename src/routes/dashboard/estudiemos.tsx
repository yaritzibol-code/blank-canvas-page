import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useTimer, TECH_DATA, PathySVG, pad } from "../../contexts/StudyTimerContext";

export const Route = createFileRoute("/dashboard/estudiemos")({
  component: EstudemosJuntosPage,
});

/* ── SUBJECT DATA ── */
const SUBJECT_DATA = {
  meteo: {
    name: "Meteorología", emoji: "🌤", topic: "Tema 5: Tipos de nubes", score: 62, daysSince: 4,
    reasons: [
      "Llevas 4 días sin repasarla — tu cerebro ya está borrando las nubes.",
      "Es tu segunda materia con menor promedio (62%).",
      "Tienes 8 preguntas pendientes en el cuestionario.",
      "El CIAAC destina un 25 % de sus preguntas a Meteorología.",
    ],
  },
  fh: {
    name: "Factores Humanos", emoji: "🧠", topic: "Cap. 3: Modelo IMSAFE", score: 52, daysSince: 2,
    reasons: [
      "Es tu materia con menor promedio del momento (52 %).",
      "Llevas 2 días sin repasar — el modelo IMSAFE se olvida rápido.",
      "3 preguntas de examen reciente vinieron de este capítulo.",
      "Solo 30 min hoy pueden subirte 8 puntos en el simulador.",
    ],
  },
  nav: {
    name: "Navegación", emoji: "🗺️", topic: "Navegación instrumental básica", score: 91, daysSince: 0,
    reasons: [
      "Estás al día — ¡piloto impecable en Navegación!",
      "Reforzar ahora consolida tu promedio de 91 %.",
      "Algunos conceptos de VOR / NDB merecen un repaso rápido.",
      "El intercalado entre materias mejora la retención un 35 %.",
    ],
  },
} as const;

type SubjectKey = keyof typeof SUBJECT_DATA;

/* ── QUICK OPTIONS ── */
type QuickOpt =
  | { icon: string; label: string; path: string }
  | { icon: string; label: string; subjectKey: SubjectKey }
  | { icon: string; label: string; surprise: true };

const QUICK_OPTIONS: QuickOpt[] = [
  { icon: "📚", label: "Ver todas las materias",     path: "/dashboard/materias" },
  { icon: "🎯", label: "Materia más débil",           subjectKey: "fh" },
  { icon: "🔥", label: "Reforzar errores recientes",  path: "/dashboard/banco" },
  { icon: "📝", label: "Resolver cuestionario",       path: "/dashboard/banco" },
  { icon: "🃏", label: "Repasar flashcards",          path: "/dashboard/flashcards" },
  { icon: "📖", label: "Leer biblioteca",              path: "/dashboard/biblioteca" },
  { icon: "⏳", label: "Continuar donde me quedé",    path: "/dashboard/materias" },
  { icon: "🎲", label: "Sorpréndeme Pathy",           surprise: true },
  { icon: "✍️", label: "Elegir libremente",            path: "/dashboard/materias" },
];

/* ── YARIS DATA ── */
const YARIS_REPLIES = [
  "Buena pregunta. En Meteorología CIAAC esto es fundamental. Los frentes determinan las condiciones de vuelo. Estudia el diagrama de Cap. 4 del Jeppesen.\n\n📖 Meteorología Aeronáutica · Cap. 4, p. 82",
  "Exacto, eso entra bastante en el examen. Recuerda la regla mnemónica y practica con las cartas sinópticas del simulador.\n\n📖 Manual OACI · Doc. 8896",
  "¡Muy buena pregunta! Ese concepto apareció en el examen de 2024. Te recomiendo repasar los manuales AIP MX también.\n\n📖 AIP México · ENR 1.1",
];
const INIT_YARIS = [
  { text: "¡Hola, piloto! Pathy me dijo que hoy toca Meteorología. ¿Empezamos por frentes o por cartas sinópticas?", isYaris: true },
  { text: "Explícame frente frío vs frente ocluido", isYaris: false },
  { text: "El frente frío es como un jugador que entra de golpe al campo — rápido, tormentas cortas e intensas. El ocluido es el veterano cansado: el aire frío alcanzó al cálido, todo se levantó y da lluvia prolongada y suave.\n\n📖 Jeppesen Meteorología · Cap. 4, p. 82", isYaris: true },
];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
function EstudemosJuntosPage() {
  const timer = useTimer();

  const [tab, setTab]         = useState<"estudiar" | "yaris">("estudiar");
  const [flowStep, setFlowStep] = useState<"tecnicas" | "pathy" | "active">(
    timer.visible ? "active" : "tecnicas"
  );
  const [pathyKey, setPathyKey] = useState<SubjectKey>("meteo");
  const [music, setMusic]       = useState("🔇 Silencio");

  /* yaris */
  const [yarisMessages, setYarisMessages] = useState(INIT_YARIS);
  const [yarisInput, setYarisInput]       = useState("");
  const [yarisIdx, setYarisIdx]           = useState(0);
  const [yarisTyping, setYarisTyping]     = useState(false);
  const yarisEndRef = useRef<HTMLDivElement>(null);

  /* sync flowStep when timer changes from outside */
  useEffect(() => {
    if (timer.visible && flowStep !== "active") setFlowStep("active");
    if (!timer.visible && flowStep === "active")  setFlowStep("tecnicas");
  }, [timer.visible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    yarisEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [yarisMessages, yarisTyping]);

  /* ── actions ── */
  function startSession(navTo?: string) {
    const subj     = SUBJECT_DATA[pathyKey];
    const techShort = TECH_DATA[timer.techIdx].title;
    timer.startSession(`${subj.emoji} ${subj.name} · ${techShort}`, subj.name, subj.topic);
    setFlowStep("active");
    if (navTo) setTimeout(() => { window.location.href = navTo; }, 500);
  }

  function handleQuick(opt: QuickOpt) {
    if ("subjectKey" in opt)  { setPathyKey(opt.subjectKey); return; }
    if ("surprise" in opt) {
      const keys = Object.keys(SUBJECT_DATA) as SubjectKey[];
      setPathyKey(keys[Math.floor(Math.random() * keys.length)]);
      return;
    }
    startSession(opt.path);
  }

  function sendYaris() {
    const txt = yarisInput.trim(); if (!txt) return;
    setYarisMessages(m => [...m, { text: txt, isYaris: false }]);
    setYarisInput(""); setYarisTyping(true);
    setTimeout(() => {
      setYarisTyping(false);
      setYarisMessages(m => [...m, { text: YARIS_REPLIES[yarisIdx % YARIS_REPLIES.length], isYaris: true }]);
      setYarisIdx(i => i + 1);
      setTimeout(() => yarisEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 1300);
  }

  const subj = SUBJECT_DATA[pathyKey];
  const tech = TECH_DATA[timer.techIdx];

  /* phase progress for active session bar */
  const phaseDur  = timer.isWork ? timer.workSecs : timer.breakSecs;
  const phaseElap = phaseDur - timer.rem;
  const phasePct  = phaseDur > 0 ? Math.min(100, (phaseElap / phaseDur) * 100) : 0;

  /* ─────────────────────────────────────────── RENDER ─── */
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes float-a{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes run-a{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes pulse-a{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes fadeIn-a{from{opacity:0}to{opacity:1}}
        @keyframes slideUp-a{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}
        .p-float{animation:float-a 2.5s ease-in-out infinite}
        .p-run{animation:run-a .7s ease-in-out infinite}
        .radar-dot{animation:pulse-a 1.5s ease infinite}
        .tech-hover:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(61,93,145,.14)!important}
        .quick-hover:hover{border-color:#3D5D91!important;color:#3D5D91!important;background:#e8eef7!important}
        .go-btn:hover{opacity:.88!important}
      `}</style>

      {/* ── TAB BAR ── */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(61,93,145,.1)", display: "flex", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
        {([
          { id: "estudiar" as const, label: "✈ Sesión de estudio" },
          { id: "yaris"    as const, label: "🧑‍✈️ Modo Yaris" },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "13px 22px", fontSize: 13.5, fontWeight: 500, color: tab === t.id ? "#3D5D91" : "#999", background: "none", border: "none", borderBottom: `2.5px solid ${tab === t.id ? "#3D5D91" : "transparent"}`, cursor: "pointer", transition: "all .2s", fontFamily: "'DM Sans', sans-serif" }}>
            {t.label}
          </button>
        ))}
        {/* Active session badge */}
        {timer.visible && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingRight: 16, gap: 6 }}>
            <div className="radar-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: timer.running ? "#4ade80" : "#fbbf24" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: timer.running ? "#166534" : "#92400e" }}>
              {timer.running ? "Sesión activa" : "En pausa"}
            </span>
          </div>
        )}
      </div>

      {/* ════════════════════════ ESTUDIAR TAB ════════════════════════ */}
      {tab === "estudiar" && (
        <div style={{ animation: "fadeIn-a .25s ease" }}>

          {/* ───────── PASO 1: ELEGIR TÉCNICA ───────── */}
          {flowStep === "tecnicas" && (
            <div style={{ paddingTop: 18 }}>

              {/* Pathy recommendation card */}
              <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderLeft: "4px solid #3D5D91", borderRadius: 14, padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div className="p-float" style={{ flexShrink: 0 }}><PathySVG size={64} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#3D5D91", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Pathy recomienda hoy</div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#1a1a2e", marginBottom: 12 }}>
                    Llevas <strong>4 días</strong> sin repasar <strong>Meteorología</strong> — tu cerebro ya está borrando esas nubes. ¿Arrancamos con {tech.work} minutos hoy?
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {([
                      { key: "meteo" as const, label: "🌤 Meteorología · 4 días", type: "urgent" },
                      { key: "fh"    as const, label: "🧠 Factores Humanos · 2 días", type: "warn" },
                      { key: "nav"   as const, label: "✅ Navegación · al día", type: "ok" },
                    ]).map(p => (
                      <span key={p.key} onClick={() => setPathyKey(p.key)}
                        style={{
                          fontSize: 11.5, padding: "4px 12px", borderRadius: 99, fontWeight: 500, cursor: "pointer",
                          background: p.type === "urgent" ? "#fef2f2" : p.type === "warn" ? "#fffbeb" : "#f0fdf4",
                          border: `1.5px solid ${p.type === "urgent" ? (pathyKey === p.key ? "#ef4444" : "#fca5a5") : p.type === "warn" ? (pathyKey === p.key ? "#f59e0b" : "#fcd34d") : (pathyKey === p.key ? "#22c55e" : "#86efac")}`,
                          color: p.type === "urgent" ? "#991b1b" : p.type === "warn" ? "#92400e" : "#166534",
                          fontWeight: pathyKey === p.key ? 700 : 500,
                        }}>
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technique grid */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#aaa", marginBottom: 12 }}>
                Elige tu técnica de estudio
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                {TECH_DATA.map((t, i) => (
                  <div key={i} className="tech-hover" onClick={() => timer.selectTech(i)}
                    style={{
                      background: timer.techIdx === i ? "#e8eef7" : "white",
                      border: `${timer.techIdx === i ? 2 : 1.5}px solid ${timer.techIdx === i ? "#3D5D91" : "rgba(61,93,145,.12)"}`,
                      borderRadius: 14, padding: 15, cursor: "pointer",
                      position: "relative", overflow: "hidden",
                      transition: "all .2s", boxShadow: "0 2px 12px rgba(61,93,145,.05)",
                    }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: t.accent, borderRadius: "12px 0 0 12px" }} />
                    <span style={{ fontSize: 22, marginBottom: 8, display: "block" }}>{t.icon}</span>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: 11.5, color: "#888", lineHeight: 1.5 }}>{t.desc}</div>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, marginTop: 8, background: t.bg, color: t.fg }}>{t.badge}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ textAlign: "center" }}>
                <button className="go-btn" onClick={() => setFlowStep("pathy")}
                  style={{ background: "linear-gradient(135deg, #3D5D91, #5A86CB)", color: "white", border: "none", borderRadius: 12, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(61,93,145,.28)", transition: "opacity .2s" }}>
                  Continuar con Pathy →
                </button>
                <div style={{ fontSize: 12, color: "#bbb", marginTop: 8 }}>
                  {tech.icon} {tech.title} seleccionado · {tech.badge}
                </div>
              </div>
            </div>
          )}

          {/* ───────── PASO 2: RECOMENDACIÓN DE PATHY ───────── */}
          {flowStep === "pathy" && (
            <div style={{ paddingTop: 18, animation: "slideUp-a .3s ease" }}>

              <button onClick={() => setFlowStep("tecnicas")}
                style={{ background: "none", border: "none", color: "#aaa", fontSize: 13, cursor: "pointer", padding: "0 0 14px", display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
                ← Cambiar técnica
              </button>

              {/* Main Pathy card */}
              <div style={{ background: "white", border: "2px solid rgba(61,93,145,.14)", borderRadius: 18, overflow: "hidden", marginBottom: 18, boxShadow: "0 4px 24px rgba(61,93,145,.1)" }}>
                {/* Gradient header */}
                <div style={{ background: "linear-gradient(135deg, #3D5D91 0%, #5A86CB 100%)", padding: "22px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div className="p-float"><PathySVG size={68} overlay /></div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.65)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>✈️ Recomendación de Pathy</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "white", fontWeight: 700, lineHeight: 1.2 }}>¿Qué estudiamos hoy?</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", marginTop: 5 }}>
                      Técnica: <strong style={{ color: "white" }}>{tech.icon} {tech.title}</strong> · {tech.badge}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "22px 24px" }}>
                  {/* Subject recommendation */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <div style={{ fontSize: 30, lineHeight: 1 }}>{subj.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>Te recomiendo estudiar</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>{subj.name}</div>
                    </div>
                    <div style={{
                      background: subj.score >= 80 ? "#f0fdf4" : subj.score >= 65 ? "#fffbeb" : "#fef2f2",
                      border: `1px solid ${subj.score >= 80 ? "#86efac" : subj.score >= 65 ? "#fcd34d" : "#fca5a5"}`,
                      borderRadius: 99, padding: "5px 13px", fontSize: 13, fontWeight: 700,
                      color: subj.score >= 80 ? "#166534" : subj.score >= 65 ? "#92400e" : "#991b1b",
                      flexShrink: 0,
                    }}>
                      {subj.score}% promedio
                    </div>
                  </div>

                  {/* Motivos */}
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Motivos</div>
                    {subj.reasons.map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < subj.reasons.length - 1 ? "1px solid rgba(61,93,145,.07)" : "none" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e8eef7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#3D5D91", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                        <div style={{ fontSize: 13.5, color: "#444", lineHeight: 1.55 }}>{r}</div>
                      </div>
                    ))}
                  </div>

                  {/* Primary CTA */}
                  <button className="go-btn" onClick={() => startSession()}
                    style={{ width: "100%", background: "linear-gradient(135deg, #3D5D91, #5A86CB)", color: "white", border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 20px rgba(61,93,145,.28)", marginBottom: 10, transition: "opacity .2s" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Iniciar sesión — {subj.emoji} {subj.name}
                  </button>
                  <div style={{ textAlign: "center", fontSize: 11.5, color: "#ccc" }}>
                    El timer seguirá activo aunque navegues a otra sección ✈️
                  </div>
                </div>
              </div>

              {/* Quick options */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
                O elige otra opción:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {QUICK_OPTIONS.map((opt, i) => (
                  <button key={i} className="quick-hover" onClick={() => handleQuick(opt)}
                    style={{ background: "white", border: "1.5px solid rgba(61,93,145,.1)", borderRadius: 10, padding: "11px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#666", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textAlign: "left", transition: "all .2s", boxShadow: "0 1px 4px rgba(61,93,145,.04)" }}>
                    <span style={{ fontSize: 17, flexShrink: 0 }}>{opt.icon}</span>
                    <span style={{ lineHeight: 1.3 }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ───────── PASO 3: SESIÓN ACTIVA ───────── */}
          {flowStep === "active" && (
            <div style={{ paddingTop: 18, animation: "slideUp-a .3s ease" }}>

              {/* Cockpit timer card */}
              <div style={{ background: "linear-gradient(160deg, #06101f 0%, #0d1f38 60%, #111d35 100%)", borderRadius: 18, padding: "22px 24px", marginBottom: 16, border: "1px solid rgba(90,134,203,.2)", boxShadow: "0 8px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04)" }}>

                {/* Phase label */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div className="radar-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: timer.running ? "#4ade80" : "#fbbf24" }} />
                    <span style={{ fontSize: 10.5, color: timer.running ? "#4ade80" : "#fbbf24", fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase" }}>
                      {timer.running ? "✈ Sesión activa" : "⏸ En pausa"}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>
                    {tech.icon} {tech.title} · C{timer.curCycle + 1}/{timer.totalCycles}
                  </span>
                </div>

                {/* Big timer + Pathy */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
                  <div className={timer.running ? "p-run" : "p-float"} style={{ flexShrink: 0 }}>
                    <PathySVG size={56} overlay smiling={timer.smiling} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 60, fontWeight: 900,
                      color: timer.isWork ? "#4ade80" : "#fbbf24",
                      letterSpacing: -2, lineHeight: 1,
                      textShadow: timer.isWork
                        ? "0 0 40px rgba(74,222,128,.4)"
                        : "0 0 40px rgba(251,191,36,.4)",
                    }}>
                      {pad(Math.floor(timer.rem / 60))}:{pad(timer.rem % 60)}
                    </div>
                    <div style={{ fontSize: 11, color: timer.isWork ? "rgba(74,222,128,.55)" : "rgba(251,191,36,.55)", marginTop: 4, letterSpacing: ".07em" }}>
                      {timer.isWork ? "FASE DE ENFOQUE" : "ESCALA TÉCNICA — DESCANSA"}
                    </div>
                  </div>
                </div>

                {/* Phase progress bar */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "rgba(255,255,255,.3)", marginBottom: 6, letterSpacing: ".05em" }}>
                    <span>INICIO</span>
                    <span>{timer.isWork ? "ENFOQUE" : "DESCANSO"} · {pad(Math.floor(timer.rem / 60))}:{pad(timer.rem % 60)} restantes</span>
                    <span>FIN</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${phasePct}%`, transition: "width 1s linear", background: timer.isWork ? "linear-gradient(90deg, #3D5D91, #5A86CB)" : "linear-gradient(90deg, #166534, #4ade80)" }} />
                    {/* plane on bar */}
                    <div style={{ position: "absolute", top: "50%", left: `calc(${Math.min(phasePct, 90)}% - 6px)`, transform: "translateY(-50%)", fontSize: 11, transition: "left 1s linear", filter: "drop-shadow(0 0 5px rgba(90,134,203,.8))" }}>✈</div>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={timer.toggleTimer}
                    style={{ flex: 1, border: `1px solid ${timer.running ? "rgba(74,222,128,.3)" : "rgba(90,134,203,.3)"}`, borderRadius: 10, background: timer.running ? "rgba(74,222,128,.1)" : "rgba(90,134,203,.1)", color: timer.running ? "#4ade80" : "#5A86CB", padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {timer.running
                      ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pausar</>
                      : <><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>Reanudar</>}
                  </button>
                  <button onClick={timer.skipPhase}
                    style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.45)", padding: "11px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                    Skip
                  </button>
                  <button onClick={() => { timer.closeFloat(); setFlowStep("tecnicas"); }}
                    style={{ border: "1px solid rgba(220,38,38,.25)", borderRadius: 10, background: "rgba(220,38,38,.08)", color: "#f87171", padding: "11px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
                    Finalizar
                  </button>
                </div>
              </div>

              {/* Session info grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {/* Materia */}
                <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderLeft: "4px solid #3D5D91", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
                  <div style={{ fontSize: 9.5, color: "#3D5D91", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Materia</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{SUBJECT_DATA[pathyKey].emoji} {timer.activeSubject}</div>
                  <div style={{ fontSize: 11.5, color: "#aaa", marginTop: 3 }}>{timer.activeTopic}</div>
                </div>
                {/* Tiempo hoy */}
                <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderLeft: "4px solid #22a06b", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
                  <div style={{ fontSize: 9.5, color: "#166534", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Enfoque hoy</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#166534" }}>
                    {pad(Math.floor(timer.todaySecs / 60))}:{pad(timer.todaySecs % 60)}
                  </div>
                </div>
                {/* Racha */}
                <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderLeft: "4px solid #d97706", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
                  <div style={{ fontSize: 9.5, color: "#92400e", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Racha activa</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#92400e" }}>🔥 14 días</div>
                </div>
                {/* Ciclos */}
                <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderLeft: "4px solid #6C0820", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
                  <div style={{ fontSize: 9.5, color: "#6C0820", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Ciclos</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {Array.from({ length: Math.min(timer.totalCycles, 6) }).map((_, i) => (
                      <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", transition: "background .3s", background: i < timer.curCycle ? "#3D5D91" : i === timer.curCycle ? "#6C0820" : "rgba(61,93,145,.1)" }} />
                    ))}
                    <span style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>{timer.curCycle}/{timer.totalCycles}</span>
                  </div>
                </div>
              </div>

              {/* Objetivo */}
              <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 12, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
                <div style={{ fontSize: 9.5, color: "#8a4a10", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Objetivo de la sesión</div>
                <div style={{ fontSize: 13.5, color: "#1a1a2e", fontWeight: 500 }}>{timer.sessionObjective}</div>
              </div>

              {/* Ir a estudiar */}
              <div style={{ fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Ir a estudiar</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 18 }}>
                {[
                  { icon: "📖", label: "Tema",        path: "/dashboard/materias" },
                  { icon: "🃏", label: "Flashcards",  path: "/dashboard/flashcards" },
                  { icon: "❓", label: "Cuestionario", path: "/dashboard/banco" },
                  { icon: "📝", label: "Notas",        path: "/dashboard/bitacora" },
                  { icon: "📚", label: "Biblioteca",   path: "/dashboard/biblioteca" },
                ].map(a => (
                  <button key={a.label} onClick={() => { window.location.href = a.path; }}
                    style={{ background: "white", border: "1.5px solid rgba(61,93,145,.1)", borderRadius: 10, padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontSize: 11, color: "#888", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all .2s", boxShadow: "0 2px 6px rgba(61,93,145,.04)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; e.currentTarget.style.background = "#e8eef7"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(61,93,145,.1)"; e.currentTarget.style.color = "#888"; e.currentTarget.style.background = "white"; }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Música */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid rgba(61,93,145,.07)" }}>
                <span style={{ fontSize: 12, color: "#ccc" }}>🎵 Ambiente:</span>
                {["🔇 Silencio", "☕ Lo-fi", "🌧 Lluvia", "🚀 Space"].map(m => (
                  <button key={m} onClick={() => setMusic(m)}
                    style={{ border: `1px solid ${music === m ? "#3D5D91" : "rgba(61,93,145,.1)"}`, borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 500, cursor: "pointer", background: music === m ? "#3D5D91" : "white", color: music === m ? "white" : "#888", fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════ YARIS TAB ════════════════════════ */}
      {tab === "yaris" && (
        <div style={{ paddingTop: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Chat */}
            <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, display: "flex", flexDirection: "column", height: 480, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(61,93,145,.1)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#3D5D91", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🧑‍✈️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a2e" }}>Yaris — Tutora IA</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div className="radar-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ fontSize: 11, color: "#aaa" }}>En línea · FlightPath</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#aaa" }}>Meteorología activa</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {yarisMessages.map((msg, i) => (
                  <div key={i} style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap", alignSelf: msg.isYaris ? "flex-start" : "flex-end", borderBottomLeftRadius: msg.isYaris ? 4 : 14, borderBottomRightRadius: msg.isYaris ? 14 : 4, background: msg.isYaris ? "#e8eef7" : "#3D5D91", color: msg.isYaris ? "#2a4068" : "white" }}>
                    {msg.text}
                  </div>
                ))}
                {yarisTyping && (
                  <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: "14px 14px 14px 4px", fontSize: 13, background: "#e8eef7", color: "#2a4068", alignSelf: "flex-start" }}>
                    ✍️ Yaris está escribiendo…
                  </div>
                )}
                <div ref={yarisEndRef} />
              </div>
              <div style={{ padding: 10, borderTop: "1px solid rgba(61,93,145,.1)", display: "flex", gap: 6, alignItems: "flex-end" }}>
                <textarea
                  value={yarisInput}
                  onChange={e => setYarisInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendYaris(); } }}
                  rows={2}
                  placeholder="Pregúntale a Yaris sobre cualquier tema CIAAC…"
                  style={{ flex: 1, border: "1px solid rgba(61,93,145,.12)", borderRadius: 8, padding: "9px 13px", fontSize: 13, resize: "none", background: "#f8f7f4", color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = "#3D5D91")}
                  onBlur={e => (e.target.style.borderColor = "rgba(61,93,145,.12)")}
                />
                <button onClick={sendYaris} style={{ background: "#3D5D91", border: "none", borderRadius: 8, width: 38, height: 38, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>

            {/* Yaris sidebar */}
            <div>
              {/* Quick questions */}
              <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D5D91" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Preguntas rápidas
                </div>
                {[
                  { emoji: "🌤", label: "METAR vs TAF", q: "¿Cuál es la diferencia entre METAR y TAF?" },
                  { emoji: "🌫", label: "Tipos de niebla", q: "Explícame los tipos de niebla para el CIAAC" },
                  { emoji: "💨", label: "Cizalladura de viento", q: "¿Qué es la cizalladura de viento y por qué es peligrosa?" },
                  { emoji: "☁️", label: "Mnemónico nubes", q: "Dame un mnemónico para los tipos de nubes" },
                  { emoji: "📋", label: "Top preguntas CIAAC", q: "¿Qué preguntas de Meteorología caen más en el CIAAC?" },
                ].map(p => (
                  <div key={p.label} className="quick-hover" onClick={() => { setYarisInput(p.q); setTab("yaris"); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", border: "1px solid rgba(61,93,145,.1)", borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 12.5, color: "#888", background: "#f8f7f4", transition: "all .2s" }}>
                    {p.emoji} {p.label}
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>Tu progreso CIAAC</div>
                {[
                  { label: "Meteorología", pct: 62, color: "#dc2626" },
                  { label: "Factores Humanos", pct: 52, color: "#d97706" },
                  { label: "Navegación", pct: 91, color: "#16a34a" },
                  { label: "Reglamentos", pct: 65, color: "#3D5D91" },
                ].map(p => (
                  <div key={p.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}>
                      <span style={{ color: "#888" }}>{p.label}</span>
                      <span style={{ fontWeight: 700, color: p.color }}>{p.pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "#f0f4f8", borderRadius: 99, margin: "4px 0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Intercalado */}
              <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderLeft: "3px solid #3D5D91", borderRadius: 14, padding: 14, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>⏱ Intercalado sugerido</div>
                <p style={{ fontSize: 12.5, color: "#888", lineHeight: 1.6 }}>
                  Después de Meteorología, Yaris sugiere cambiar a <strong style={{ color: "#1a1a2e" }}>Factores Humanos</strong> — así entrenas el intercalado que usa el CIAAC real.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
