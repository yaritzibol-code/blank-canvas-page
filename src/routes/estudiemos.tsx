import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/estudiemos")({
  component: EstudemosJuntosPage,
});

/* ── CONSTANTS ── */
const TECH_DATA = [
  { work: 25, brk: 5, cycles: 4, name: "🍅 Pomodoro", icon: "🍅", title: "Pomodoro", desc: "25 min de enfoque + 5 de descanso. Clásico y comprobado para retención.", badge: "25+5 min · 4 ciclos", bg: "#e8eef7", fg: "#2a4068", accent: "#3D5D91" },
  { work: 52, brk: 17, cycles: 3, name: "⚡ 52/17", icon: "⚡", title: "52/17", desc: "52 min de trabajo profundo + 17 de pausa activa. Para materias densas.", badge: "52+17 min · 3 ciclos", bg: "#e8f0fb", fg: "#1a4a8a", accent: "#5A86CB" },
  { work: 90, brk: 20, cycles: 2, name: "🎯 Ultradian", icon: "🎯", title: "Bloque Ultradian", desc: "90 min siguiendo tu ritmo biológico. Para simulacros completos del CIAAC.", badge: "90+20 min · 2 ciclos", bg: "#fceef0", fg: "#6C0820", accent: "#6C0820" },
  { work: 15, brk: 5, cycles: 6, name: "🃏 Flashcards", icon: "🃏", title: "Sprint Flashcards", desc: "15 min de repaso rápido. Perfecto la noche antes del examen.", badge: "15 min · 6 rondas", bg: "#fdf0f3", fg: "#8a2040", accent: "#F2AEBC" },
  { work: 45, brk: 10, cycles: 3, name: "📖 Lectura Activa", icon: "📖", title: "Lectura Activa", desc: "45 min de lectura + pausa para resumir. Para reglamentos y manuales.", badge: "45+10 min · 3 ciclos", bg: "#eafaf3", fg: "#145a3e", accent: "#22a06b" },
  { work: 30, brk: 10, cycles: 4, name: "✍️ Escritura Libre", icon: "✍️", title: "Escritura Libre", desc: "30 min escribiendo sin parar todo lo que sabes. Volcado mental.", badge: "30+10 min · 4 ciclos", bg: "#fdf3ea", fg: "#8a4a10", accent: "#e07b39" },
];

const PATHY_MSGS = {
  meteo: "¡Llevas <strong>4 días</strong> sin repasar <strong>Meteorología</strong> — tu cerebro ya está borrando esas nubes. ¿Arrancamos con 25 minutos hoy?",
  fh: "<strong>Factores Humanos</strong> lleva <strong>2 días</strong> sin repaso. Tu cerebro está borrando IMSAFE. ¡Es buen momento para un sprint de 25 min!",
  nav: "<strong>Navegación</strong> está al día, ¡piloto impecable! Aprovecha para reforzar con un Sprint de Flashcards de 15 min.",
};

const YARIS_REPLIES = [
  "Buena pregunta. En Meteorología CIAAC, esto es fundamental. Los frentes meteorológicos determinan las condiciones de vuelo. Estudia el diagrama de capítulo 4 del Jeppesen.\n\n📖 Meteorología Aeronáutica · Cap. 4, p. 82",
  "Exacto, eso entra bastante en el examen. Recuerda la regla mnemónica y practica con las cartas sinópticas del simulador.\n\n📖 Manual OACI · Doc. 8896",
  "¡Muy buena pregunta! Ese concepto apareció en el examen de 2024. Te recomiendo repasar los manuales AIP MX también.\n\n📖 AIP México · ENR 1.1",
];

const INIT_YARIS = [
  { text: "¡Hola, piloto! Pathy me dijo que hoy toca Meteorología. ¿Empezamos por frentes o por cartas sinópticas?", isYaris: true },
  { text: "Explícame frente frío vs frente ocluido", isYaris: false },
  { text: "El frente frío es como un jugador que entra de golpe al campo — rápido, tormentas cortas e intensas. El ocluido es el veterano cansado: el aire frío alcanzó al cálido, todo se levantó y da lluvia prolongada y suave.\n\n📖 Jeppesen Meteorología · Cap. 4, p. 82", isYaris: true },
];

function pad(n: number) { return String(n).padStart(2, "0"); }

/* ── PATHY SVG ── */
function PathySVG({ size = 64, overlay = false, smiling = true }: { size?: number; overlay?: boolean; smiling?: boolean }) {
  const cloud = overlay ? "rgba(255,255,255,.2)" : "#e8eef7";
  const hat = overlay ? "rgba(255,255,255,.9)" : "#3D5D91";
  const brim = overlay ? "rgba(255,255,255,.5)" : "#5A86CB";
  const mouth = smiling ? "M25 41 Q30 45 35 41" : "M25 44 Q30 40 35 44";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ display: "block" }}>
      <ellipse cx="30" cy="42" rx="22" ry="13" fill={cloud} />
      <circle cx="18" cy="40" r="10" fill={cloud} />
      <circle cx="30" cy="36" r="12" fill={cloud} />
      <circle cx="42" cy="39" r="9" fill={cloud} />
      <rect x="14" y="17" width="32" height="8" rx="4" fill={hat} />
      <rect x="20" y="15" width="20" height="5" rx="2.5" fill={brim} />
      {!overlay && <rect x="16" y="24" width="28" height="3" rx="1.5" fill="#6C0820" opacity=".6" />}
      <circle cx="24" cy="35" r="3.5" fill="white" />
      <circle cx="36" cy="35" r="3.5" fill="white" />
      <circle cx="25" cy="35" r="2" fill="#2a4068" />
      <circle cx="37" cy="35" r="2" fill="#2a4068" />
      <path d={mouth} stroke="#2a4068" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {!overlay && <><circle cx="18" cy="40" r="3" fill="#F2AEBC" opacity=".5" /><circle cx="42" cy="40" r="3" fill="#F2AEBC" opacity=".5" /></>}
    </svg>
  );
}

/* ── MAIN COMPONENT ── */
function EstudemosJuntosPage() {
  const [tab, setTab] = useState<"tecnicas" | "yaris">("tecnicas");
  const [techIdx, setTechIdx] = useState(0);

  // Timer display state
  const [rem, setRem] = useState(25 * 60);
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [curCycle, setCurCycle] = useState(0);
  const [smiling, setSmiling] = useState(true);
  const [timerLabel, setTimerLabel] = useState("🍅 Pomodoro seleccionado · ¡Dale play para arrancar!");

  // Float timer
  const [floatVisible, setFloatVisible] = useState(false);
  const [floatRem, setFloatRem] = useState(25 * 60);
  const [floatRunning, setFloatRunning] = useState(false);
  const [floatTechName, setFloatTechName] = useState("Meteorología · Pomodoro");

  // UI
  const [modalOpen, setModalOpen] = useState(false);
  const [music, setMusic] = useState("silencio");
  const [toast, setToast] = useState<string | null>(null);
  const [radarN, setRadarN] = useState(47);
  const [pathyKey, setPathyKey] = useState<"meteo" | "fh" | "nav">("meteo");

  // Yaris
  const [yarisMessages, setYarisMessages] = useState(INIT_YARIS);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisIdx, setYarisIdx] = useState(0);
  const [yarisTyping, setYarisTyping] = useState(false);
  const yarisEndRef = useRef<HTMLDivElement>(null);

  // Timer live state (ref to avoid stale closures in interval)
  const T = useRef({
    rem: 25 * 60, floatRem: 25 * 60,
    isWork: true, curCycle: 0,
    running: false, floatRunning: false,
    workSecs: 25 * 60, breakSecs: 5 * 60, totalCycles: 4, techIdx: 0,
  });
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<() => void>(() => {});

  /* ── UTILS ── */
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function startIv() {
    clearInterval(ivRef.current!);
    ivRef.current = setInterval(() => tickRef.current(), 1000);
  }

  /* ── TICK ── */
  function tick() {
    const t = T.current;
    if (t.rem <= 0) {
      clearInterval(ivRef.current!); ivRef.current = null;
      if (t.isWork) {
        t.isWork = false; t.rem = t.breakSecs;
        setIsWork(false); setRem(t.breakSecs); setSmiling(false);
        setTimerLabel("💚 Descanso activo");
        showToast("¡Buen trabajo! Descansa ☕");
      } else {
        t.isWork = true;
        t.curCycle = Math.min(t.curCycle + 1, t.totalCycles - 1);
        t.rem = t.workSecs;
        setIsWork(true); setRem(t.workSecs); setCurCycle(t.curCycle); setSmiling(true);
        setTimerLabel("🔴 Sesión activa");
        showToast("¡De vuelta al trabajo! 💪");
      }
      if (t.running) startIv();
      return;
    }
    t.rem--; setRem(t.rem);
    if (t.floatRunning && t.floatRem > 0) { t.floatRem--; setFloatRem(t.floatRem); }
  }
  tickRef.current = tick;

  /* ── TIMER CONTROLS ── */
  function onPlay() {
    const t = T.current;
    if (!floatVisible && t.rem === t.workSecs && !t.running) { setModalOpen(true); return; }
    t.running = !t.running; setRunning(t.running);
    if (t.running) { startIv(); setTimerLabel("🔴 Sesión activa"); }
    else { clearInterval(ivRef.current!); ivRef.current = null; setTimerLabel("⏸ En pausa"); }
  }

  function resetTimer() {
    const t = T.current;
    clearInterval(ivRef.current!); ivRef.current = null;
    t.running = false; t.isWork = true; t.curCycle = 0; t.rem = t.workSecs;
    setRunning(false); setIsWork(true); setCurCycle(0); setRem(t.workSecs); setSmiling(true);
    setTimerLabel(TECH_DATA[t.techIdx].name + " seleccionado · ¡Dale play!");
  }

  function skipPhase() {
    const t = T.current;
    clearInterval(ivRef.current!); ivRef.current = null;
    if (t.isWork) {
      t.isWork = false; t.rem = t.breakSecs;
      setIsWork(false); setRem(t.breakSecs); setSmiling(false);
      setTimerLabel("💚 Descanso activo");
      showToast("¡Buen trabajo! Descansa ☕");
    } else {
      t.isWork = true; t.curCycle = Math.min(t.curCycle + 1, t.totalCycles - 1); t.rem = t.workSecs;
      setIsWork(true); setRem(t.workSecs); setCurCycle(t.curCycle); setSmiling(true);
      setTimerLabel("🔴 Sesión activa");
      showToast("¡De vuelta al trabajo! 💪");
    }
    if (t.running) startIv();
  }

  function selectTech(idx: number) {
    const d = TECH_DATA[idx];
    const t = T.current;
    clearInterval(ivRef.current!); ivRef.current = null;
    t.running = false; t.isWork = true; t.curCycle = 0;
    t.workSecs = d.work * 60; t.breakSecs = d.brk * 60;
    t.totalCycles = d.cycles; t.techIdx = idx; t.rem = t.workSecs;
    setTechIdx(idx); setRunning(false); setIsWork(true);
    setCurCycle(0); setRem(t.workSecs); setSmiling(true);
    setTimerLabel(d.name + " seleccionado · ¡Dale play para arrancar!");
    showToast(d.name + " seleccionada ✓");
  }

  function irA(dest: string) {
    setModalOpen(false);
    const t = T.current;
    t.floatRem = t.workSecs; t.floatRunning = true; t.running = true;
    setFloatRem(t.workSecs); setFloatVisible(true); setFloatRunning(true);
    setRunning(true); t.rem = t.workSecs; setRem(t.workSecs);
    setTimerLabel("🔴 Sesión activa"); setSmiling(true);
    const techShort = TECH_DATA[t.techIdx].title;
    setFloatTechName("Meteorología · " + techShort);
    startIv();
    const msgs: Record<string, string> = {
      materia: "📖 Yendo al tema activo — el timer corre mientras estudias",
      flashcards: "🃏 Abriendo flashcards — el timer flotante te acompaña",
      cuestionario: "❓ Abriendo cuestionario — responde con el timer encima",
      elegir: "🗺️ Elige tu materia — Pathy te sigue a donde vayas",
    };
    showToast(msgs[dest] ?? "✈️ ¡Arrancamos!");
  }

  function toggleFloat() {
    const t = T.current;
    t.floatRunning = !t.floatRunning; t.running = t.floatRunning;
    setFloatRunning(t.floatRunning); setRunning(t.running);
    if (t.running) startIv();
    else { clearInterval(ivRef.current!); ivRef.current = null; }
  }

  function closeFloat() {
    clearInterval(ivRef.current!); ivRef.current = null;
    T.current.running = false; T.current.floatRunning = false;
    setRunning(false); setFloatRunning(false); setFloatVisible(false);
    setTimerLabel("⏸ Timer cerrado");
    showToast("Timer cerrado · Tu progreso se guardó 💾");
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

  /* ── EFFECTS ── */
  useEffect(() => {
    const iv = setInterval(() => setRadarN(n => Math.max(30, Math.min(80, n + Math.floor(Math.random() * 5) - 2))), 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => () => { clearInterval(ivRef.current!); }, []);

  useEffect(() => {
    yarisEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [yarisMessages, yarisTyping]);

  /* ── RENDER HELPERS ── */
  const tech = TECH_DATA[techIdx];
  const totalCycles = T.current.totalCycles;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8f7f4", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes slideInR{from{transform:translateX(28px);opacity:0}to{transform:translateX(0);opacity:1}}
        .pathy-float{animation:float 2.5s ease-in-out infinite}
        .pathy-run{animation:float 1s ease-in-out infinite}
        .radar-dot{animation:pulse 1.5s ease infinite}
        .back-btn:hover{border-color:#3D5D91!important;color:#3D5D91!important;background:#e8eef7!important}
        .tech-card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(61,93,145,.1)!important;border-color:rgba(61,93,145,.3)!important}
        .btn-circle-btn:hover{border-color:#3D5D91!important;color:#3D5D91!important;background:#e8eef7!important}
        .music-btn-item:hover{border-color:#3D5D91!important;color:#3D5D91!important}
        .dest-card-hover:hover{border-color:#3D5D91!important;background:#e8eef7!important;transform:translateX(3px)}
        .sc-pill-btn:hover{border-color:#3D5D91!important;color:#3D5D91!important;background:#e8eef7!important}
        .ft-btn-item:hover{background:rgba(255,255,255,.28)!important}
        .pathy-cta-btn:hover{background:#2a4068!important}
      `}</style>

      {/* ── RADAR BAR ── */}
      <div style={{ background: "#3D5D91", color: "white", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, fontWeight: 500, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="radar-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }}>{radarN}</span>
          <span>pilotos estudiando ahora mismo</span>
        </div>
        <span style={{ fontSize: 11.5, opacity: .75 }}>Materia más activa: Meteorología</span>
      </div>

      {/* ── TOP NAV ── */}
      <nav style={{ background: "white", borderBottom: "1px solid rgba(61,93,145,.12)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="back-btn" onClick={() => window.history.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(61,93,145,.12)", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Inicio
          </button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>Estudiemos Juntos ✈️</div>
            <div style={{ fontSize: 11.5, color: "#888", marginTop: 1 }}>Sesión personalizada con Pathy</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#e8eef7", borderRadius: 99, padding: "5px 12px", fontSize: 13, fontWeight: 600, color: "#2a4068" }}>
          🔥 14 días
        </div>
      </nav>

      {/* ── TAB BAR ── */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(61,93,145,.12)", padding: "0 24px", display: "flex" }}>
        {[
          { id: "tecnicas" as const, label: "Técnicas + Timer" },
          { id: "yaris" as const, label: "Modo Yaris" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "12px 20px", fontSize: 13.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", color: tab === t.id ? "#3D5D91" : "#888", background: "none", border: "none", borderBottom: `2.5px solid ${tab === t.id ? "#3D5D91" : "transparent"}`, cursor: "pointer", transition: "all .2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ PANEL TÉCNICAS ══ */}
      {tab === "tecnicas" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 24px 120px", width: "100%" }}>

          {/* PATHY CARD */}
          <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderLeft: "4px solid #3D5D91", borderRadius: 14, padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
            <div className="pathy-float" style={{ flexShrink: 0 }}><PathySVG size={64} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#3D5D91", textTransform: "uppercase" as const, letterSpacing: ".08em", marginBottom: 5 }}>Pathy recomienda hoy</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#1a1a2e", marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: PATHY_MSGS[pathyKey] }} />
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 12 }}>
                {[
                  { key: "meteo" as const, label: "🌤 Meteorología · 4 días", type: "urgent" },
                  { key: "fh" as const, label: "🧠 Factores Humanos · 2 días", type: "warn" },
                  { key: "nav" as const, label: "✅ Navegación · al día", type: "ok" },
                ].map(p => (
                  <span key={p.key} onClick={() => setPathyKey(p.key)}
                    style={{ fontSize: 11.5, padding: "4px 11px", borderRadius: 99, fontWeight: 500, cursor: "pointer", transition: "all .15s",
                      background: p.type === "urgent" ? "#fef2f2" : p.type === "warn" ? "#fffbeb" : "#f0fdf4",
                      border: `1px solid ${p.type === "urgent" ? "#fca5a5" : p.type === "warn" ? "#fcd34d" : "#86efac"}`,
                      color: p.type === "urgent" ? "#991b1b" : p.type === "warn" ? "#92400e" : "#166534" }}>
                    {p.label}
                  </span>
                ))}
              </div>
              <button className="pathy-cta-btn" onClick={() => setModalOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#3D5D91", color: "white", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background .2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Estudiar Meteorología ahora
              </button>
            </div>
          </div>

          {/* TÉCNICAS GRID */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".08em", color: "#888", marginBottom: 12 }}>Elige tu técnica de estudio</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
            {TECH_DATA.map((t, i) => (
              <div key={i} className="tech-card-hover" onClick={() => selectTech(i)}
                style={{ background: techIdx === i ? "#e8eef7" : "white", border: `${techIdx === i ? 2 : 1.5}px solid ${techIdx === i ? "#3D5D91" : "rgba(61,93,145,.12)"}`, borderRadius: 14, padding: 15, cursor: "pointer", position: "relative", overflow: "hidden", transition: "all .2s", boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: t.accent, borderRadius: "12px 0 0 12px" }} />
                <span style={{ fontSize: 22, marginBottom: 8, display: "block" }}>{t.icon}</span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 11.5, color: "#888", lineHeight: 1.5 }}>{t.desc}</div>
                <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, marginTop: 8, background: t.bg, color: t.fg }}>{t.badge}</span>
              </div>
            ))}
          </div>

          {/* TIMER BOX */}
          <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 14, padding: 22, textAlign: "center" as const, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 18 }}>
              <div className={running ? "pathy-run" : ""}><PathySVG size={64} smiling={smiling} /></div>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{timerLabel}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, color: "#3D5D91", letterSpacing: -2, lineHeight: 1, minWidth: 160 }}>
                  {pad(Math.floor(rem / 60))}:{pad(rem % 60)}
                </div>
                <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99, marginTop: 6, background: isWork ? tech.bg : "#eafaf3", color: isWork ? tech.fg : "#145a3e" }}>
                  {isWork ? "Trabajo" : "Descanso"}
                </span>
              </div>
            </div>

            {/* Cycle dots */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#888", marginRight: 4 }}>Ciclos:</span>
              {Array.from({ length: Math.min(totalCycles, 6) }).map((_, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < curCycle ? "#3D5D91" : i === curCycle ? "#6C0820" : "rgba(61,93,145,.12)", transition: "background .3s" }} />
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 18 }}>
              <button className="btn-circle-btn" onClick={resetTimer}
                style={{ width: 42, height: 42, borderRadius: "50%", border: "1.5px solid rgba(61,93,145,.12)", background: "#f8f7f4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", transition: "all .2s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>
              </button>
              <button onClick={onPlay}
                style={{ width: 58, height: 58, borderRadius: "50%", background: "#3D5D91", border: "none", color: "white", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s", boxShadow: "0 4px 16px rgba(61,93,145,.3)" }}>
                {running
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
              </button>
              <button className="btn-circle-btn" onClick={skipPhase}
                style={{ width: 42, height: 42, borderRadius: "50%", border: "1.5px solid rgba(61,93,145,.12)", background: "#f8f7f4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", transition: "all .2s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              </button>
            </div>

            {/* Music */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", flexWrap: "wrap" as const, paddingTop: 16, borderTop: "1px solid rgba(61,93,145,.12)" }}>
              <span style={{ fontSize: 12, color: "#888" }}>🎵 Ambiente:</span>
              {["🔇 Silencio", "☕ Lo-fi", "🌧 Lluvia", "🚀 Space"].map(m => (
                <button key={m} className="music-btn-item" onClick={() => setMusic(m)}
                  style={{ border: `1px solid ${music === m ? "#3D5D91" : "rgba(61,93,145,.12)"}`, borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 500, cursor: "pointer", background: music === m ? "#3D5D91" : "none", color: music === m ? "white" : "#888", fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ PANEL YARIS ══ */}
      {tab === "yaris" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 24px 80px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* CHAT */}
            <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 14, display: "flex", flexDirection: "column" as const, height: 460, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(61,93,145,.12)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#3D5D91", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🧑‍✈️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a2e" }}>Yaris — Tutora IA</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div className="radar-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ fontSize: 11, color: "#888" }}>En línea · FlightPath</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#888" }}>Meteorología activa</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {yarisMessages.map((msg, i) => (
                  <div key={i} style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" as const,
                    alignSelf: msg.isYaris ? "flex-start" : "flex-end",
                    borderBottomLeftRadius: msg.isYaris ? 4 : 14,
                    borderBottomRightRadius: msg.isYaris ? 14 : 4,
                    background: msg.isYaris ? "#e8eef7" : "#3D5D91",
                    color: msg.isYaris ? "#2a4068" : "white" }}>
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
              <div style={{ padding: 10, borderTop: "1px solid rgba(61,93,145,.12)", display: "flex", gap: 6, alignItems: "flex-end" }}>
                <textarea
                  value={yarisInput}
                  onChange={e => setYarisInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendYaris(); } }}
                  rows={2}
                  placeholder="Pregúntale a Yaris sobre cualquier tema CIAAC…"
                  style={{ flex: 1, border: "1px solid rgba(61,93,145,.12)", borderRadius: 8, padding: "9px 13px", fontSize: 13, resize: "none" as const, background: "#f8f7f4", color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = "#3D5D91")}
                  onBlur={e => (e.target.style.borderColor = "rgba(61,93,145,.12)")}
                />
                <button onClick={sendYaris}
                  style={{ background: "#3D5D91", border: "none", borderRadius: 8, width: 38, height: 38, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>

            {/* SIDEBAR */}
            <div>
              {/* Quick questions */}
              <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D5D91" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Preguntas rápidas
                </div>
                {[
                  { emoji: "🌤", label: "METAR vs TAF", q: "¿Cuál es la diferencia entre METAR y TAF?" },
                  { emoji: "🌫", label: "Tipos de niebla", q: "Explícame los tipos de niebla para el CIAAC" },
                  { emoji: "💨", label: "Cizalladura de viento", q: "¿Qué es la cizalladura de viento y por qué es peligrosa?" },
                  { emoji: "☁️", label: "Mnemónico nubes", q: "Dame un mnemónico para los tipos de nubes" },
                  { emoji: "📋", label: "Top preguntas CIAAC", q: "¿Qué preguntas de Meteorología caen más en el CIAAC?" },
                ].map(p => (
                  <div key={p.label} className="sc-pill-btn" onClick={() => { setYarisInput(p.q); setTab("yaris"); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", border: "1px solid rgba(61,93,145,.12)", borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 12.5, color: "#888", background: "#f8f7f4", transition: "all .2s" }}>
                    {p.emoji} {p.label}
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D5D91" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  Tu progreso CIAAC
                </div>
                {[
                  { label: "Meteorología", pct: 78, color: "#dc2626", note: "urgente" },
                  { label: "Factores Humanos", pct: 52, color: "#d97706", note: "" },
                  { label: "Navegación", pct: 91, color: "#16a34a", note: "" },
                  { label: "Reglamentos", pct: 65, color: "#3D5D91", note: "" },
                ].map(p => (
                  <div key={p.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, padding: "4px 0" }}>
                      <span style={{ color: "#888" }}>{p.label}</span>
                      <span style={{ fontWeight: 700, color: p.color }}>{p.pct}%{p.note ? ` · ${p.note}` : ""}</span>
                    </div>
                    <div style={{ height: 5, background: "#f8f7f4", borderRadius: 99, margin: "4px 0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Intercalado */}
              <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderLeft: "3px solid #3D5D91", borderRadius: 14, padding: 14, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D5D91" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Intercalado sugerido
                </div>
                <p style={{ fontSize: 12.5, color: "#888", lineHeight: 1.6 }}>
                  Después de Meteorología, Yaris sugiere cambiar a <strong style={{ color: "#1a1a2e" }}>Factores Humanos</strong> — así entrenas el intercalado que usa el CIAAC real.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ══ */}
      {modalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, backdropFilter: "blur(3px)", animation: "fadeIn .2s ease" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 440, overflow: "hidden", animation: "slideUp .25s ease", boxShadow: "0 20px 60px rgba(61,93,145,.2)" }}>
            <div style={{ background: "linear-gradient(135deg, #3D5D91, #5A86CB)", padding: "20px 22px", color: "white", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ animation: "float 2s ease infinite" }}><PathySVG size={52} overlay /></div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>¿Qué vas a estudiar hoy? 🛩️</div>
                <div style={{ fontSize: 12, opacity: .8, lineHeight: 1.4 }}>Pathy sugiere Meteorología — ¿dónde quieres trabajarla?</div>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {[
                { dest: "materia", icon: "📖", iconBg: "#e8eef7", name: "Tema activo de Meteorología", desc: "Continúa donde lo dejaste · Tema 5: Tipos de nubes" },
                { dest: "flashcards", icon: "🃏", iconBg: "#fdf0f3", name: "Flashcards de Meteorología", desc: "12 tarjetas pendientes en tu hangar" },
                { dest: "cuestionario", icon: "❓", iconBg: "#fffbeb", name: "Cuestionario de Meteorología", desc: "20 preguntas · Modo práctica" },
              ].map(d => (
                <div key={d.dest} className="dest-card-hover" onClick={() => irA(d.dest)}
                  style={{ border: "1.5px solid rgba(61,93,145,.12)", borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 10, background: "#f8f7f4", transition: "all .2s" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 8, background: d.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{d.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{d.desc}</div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
              <hr style={{ border: "none", borderTop: "1px solid rgba(61,93,145,.12)", margin: "12px 0" }} />
              <div className="dest-card-hover" onClick={() => irA("elegir")}
                style={{ border: "1.5px solid rgba(61,93,145,.12)", borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: "none", transition: "all .2s" }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🗺️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "#888", marginBottom: 2 }}>Estudiar otra materia</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Ver las 12 materias disponibles</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TIMER FLOTANTE ══ */}
      {floatVisible && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#3D5D91", borderRadius: 18, padding: "12px 18px", display: "flex", alignItems: "center", gap: 14, zIndex: 150, minWidth: 240, boxShadow: "0 8px 32px rgba(61,93,145,.35)", animation: "slideInR .3s ease" }}>
          <div style={{ animation: "float 2s ease infinite" }}><PathySVG size={38} overlay /></div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: "white", letterSpacing: -.5, lineHeight: 1 }}>
              {pad(Math.floor(floatRem / 60))}:{pad(floatRem % 60)}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
              <div className="radar-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
              {floatTechName}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button className="ft-btn-item" onClick={toggleFloat}
              style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 9, width: 30, height: 30, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}>
              {floatRunning
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
            </button>
            <button className="ft-btn-item" onClick={closeFloat}
              style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 9, width: 30, height: 30, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#1a1a2e", color: "white", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500, pointerEvents: "none", whiteSpace: "nowrap" as const, zIndex: 300, animation: "fadeIn .3s ease" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
