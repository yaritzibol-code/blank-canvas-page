import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useTimer, TECH_DATA, PathySVG, pad } from "../../contexts/StudyTimerContext";

export const Route = createFileRoute("/dashboard/estudiemos")({
  component: EstudemosJuntosPage,
});

/* ── CONSTANTS ── */
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

/* ── MAIN COMPONENT ── */
function EstudemosJuntosPage() {
  const timer = useTimer();

  const [tab, setTab] = useState<"tecnicas" | "yaris">("tecnicas");
  const [modalOpen, setModalOpen] = useState(false);
  const [music, setMusic] = useState("silencio");
  const [radarN, setRadarN] = useState(47);
  const [pathyKey, setPathyKey] = useState<"meteo" | "fh" | "nav">("meteo");

  // Yaris chat
  const [yarisMessages, setYarisMessages] = useState(INIT_YARIS);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisIdx, setYarisIdx] = useState(0);
  const [yarisTyping, setYarisTyping] = useState(false);
  const yarisEndRef = useRef<HTMLDivElement>(null);

  /* ── TIMER ACTIONS ── */
  function onPlay() {
    // Show modal for first-time start (not yet visible and at initial time)
    if (!timer.visible && timer.rem === timer.workSecs && !timer.running) {
      setModalOpen(true);
      return;
    }
    timer.toggleTimer();
  }

  function irA(dest: string) {
    setModalOpen(false);
    const techShort = TECH_DATA[timer.techIdx].title;
    timer.startSession("Meteorología · " + techShort);
    const msgs: Record<string, string> = {
      materia: "📖 Yendo al tema activo — el timer corre mientras estudias",
      flashcards: "🃏 Abriendo flashcards — el timer flotante te acompaña",
      cuestionario: "❓ Abriendo cuestionario — responde con el timer encima",
      elegir: "🗺️ Elige tu materia — Pathy te sigue a donde vayas",
    };
    // toast is shown by startSession internally; we just navigate
    const path: Record<string, string> = {
      materia: "/dashboard/materias",
      flashcards: "/dashboard/flashcards",
      cuestionario: "/dashboard/banco",
      elegir: "/dashboard/materias",
    };
    if (path[dest]) setTimeout(() => { window.location.href = path[dest]; }, 400);
    console.log(msgs[dest]);
  }

  /* ── YARIS ── */
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

  useEffect(() => {
    yarisEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [yarisMessages, yarisTyping]);

  /* ── RENDER ── */
  const tech = TECH_DATA[timer.techIdx];
  const totalCycles = timer.totalCycles;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes fp-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        .pathy-float{animation:float 2.5s ease-in-out infinite}
        .pathy-run{animation:float 1s ease-in-out infinite}
        .radar-dot{animation:pulse 1.5s ease infinite}
        .tech-card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(61,93,145,.1)!important;border-color:rgba(61,93,145,.3)!important}
        .btn-circle-btn:hover{border-color:#3D5D91!important;color:#3D5D91!important;background:#e8eef7!important}
        .music-btn-item:hover{border-color:#3D5D91!important;color:#3D5D91!important}
        .dest-card-hover:hover{border-color:#3D5D91!important;background:#e8eef7!important;transform:translateX(3px)}
        .sc-pill-btn:hover{border-color:#3D5D91!important;color:#3D5D91!important;background:#e8eef7!important}
        .pathy-cta-btn:hover{background:#2a4068!important}
      `}</style>

      {/* ── RADAR BAR ── */}
      <div style={{ background: "#3D5D91", color: "white", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, fontWeight: 500, borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="radar-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }}>{radarN}</span>
          <span>pilotos estudiando ahora mismo</span>
        </div>
        <span style={{ fontSize: 11.5, opacity: .75 }}>Materia más activa: Meteorología</span>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(61,93,145,.12)", display: "flex", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
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
        <div style={{ paddingTop: 18 }}>

          {/* PATHY CARD */}
          <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderLeft: "4px solid #3D5D91", borderRadius: 14, padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
            <div className="pathy-float" style={{ flexShrink: 0 }}><PathySVG size={64} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#3D5D91", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Pathy recomienda hoy</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#1a1a2e", marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: PATHY_MSGS[pathyKey] }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
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
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#888", marginBottom: 12 }}>Elige tu técnica de estudio</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
            {TECH_DATA.map((t, i) => (
              <div key={i} className="tech-card-hover" onClick={() => timer.selectTech(i)}
                style={{ background: timer.techIdx === i ? "#e8eef7" : "white", border: `${timer.techIdx === i ? 2 : 1.5}px solid ${timer.techIdx === i ? "#3D5D91" : "rgba(61,93,145,.12)"}`, borderRadius: 14, padding: 15, cursor: "pointer", position: "relative", overflow: "hidden", transition: "all .2s", boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: t.accent, borderRadius: "12px 0 0 12px" }} />
                <span style={{ fontSize: 22, marginBottom: 8, display: "block" }}>{t.icon}</span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 11.5, color: "#888", lineHeight: 1.5 }}>{t.desc}</div>
                <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, marginTop: 8, background: t.bg, color: t.fg }}>{t.badge}</span>
              </div>
            ))}
          </div>

          {/* TIMER BOX */}
          <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 14, padding: 22, textAlign: "center", boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 18 }}>
              <div className={timer.running ? "pathy-run" : ""}><PathySVG size={64} smiling={timer.smiling} /></div>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{timer.timerLabel}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, color: "#3D5D91", letterSpacing: -2, lineHeight: 1, minWidth: 160 }}>
                  {pad(Math.floor(timer.rem / 60))}:{pad(timer.rem % 60)}
                </div>
                <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99, marginTop: 6, background: timer.isWork ? tech.bg : "#eafaf3", color: timer.isWork ? tech.fg : "#145a3e" }}>
                  {timer.isWork ? "Trabajo" : "Descanso"}
                </span>
              </div>
            </div>

            {/* Cycle dots */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#888", marginRight: 4 }}>Ciclos:</span>
              {Array.from({ length: Math.min(totalCycles, 6) }).map((_, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < timer.curCycle ? "#3D5D91" : i === timer.curCycle ? "#6C0820" : "rgba(61,93,145,.12)", transition: "background .3s" }} />
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 18 }}>
              <button className="btn-circle-btn" onClick={timer.resetTimer}
                style={{ width: 42, height: 42, borderRadius: "50%", border: "1.5px solid rgba(61,93,145,.12)", background: "#f8f7f4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", transition: "all .2s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>
              </button>
              <button onClick={onPlay}
                style={{ width: 58, height: 58, borderRadius: "50%", background: "#3D5D91", border: "none", color: "white", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s", boxShadow: "0 4px 16px rgba(61,93,145,.3)" }}>
                {timer.running
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
              </button>
              <button className="btn-circle-btn" onClick={timer.skipPhase}
                style={{ width: 42, height: 42, borderRadius: "50%", border: "1.5px solid rgba(61,93,145,.12)", background: "#f8f7f4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", transition: "all .2s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              </button>
            </div>

            {/* Music */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid rgba(61,93,145,.12)" }}>
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
        <div style={{ paddingTop: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* CHAT */}
            <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 14, display: "flex", flexDirection: "column", height: 460, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
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
              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {yarisMessages.map((msg, i) => (
                  <div key={i} style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap",
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
                  style={{ flex: 1, border: "1px solid rgba(61,93,145,.12)", borderRadius: 8, padding: "9px 13px", fontSize: 13, resize: "none", background: "#f8f7f4", color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = "#3D5D91")}
                  onBlur={e => (e.target.style.borderColor = "rgba(61,93,145,.12)")}
                />
                <button onClick={sendYaris}
                  style={{ background: "#3D5D91", border: "none", borderRadius: 8, width: 38, height: 38, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
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
    </div>
  );
}
