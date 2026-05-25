import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/bitacora")({
  component: BitacoraPage,
});

type Screen = "hoy" | "historial" | "resultado";
type Emotion = "🤩" | "😊" | "😐" | "😤" | "😴" | "😰" | null;

const EMOTIONS: { icon: Emotion & string; label: string }[] = [
  { icon: "🤩", label: "¡Increíble!" },
  { icon: "😊", label: "Bien" },
  { icon: "😐", label: "Más o menos" },
  { icon: "😤", label: "Frustrada" },
  { icon: "😴", label: "Cansada" },
  { icon: "😰", label: "Ansiosa" },
];

const MATERIAS = [
  { icon: "✅", label: "Todo estuvo bien", isNone: true },
  { icon: "✈️", label: "Aerodinámica" },
  { icon: "⚙️", label: "Aeronaves" },
  { icon: "⚖️", label: "Legislación" },
  { icon: "🏥", label: "Medicina" },
  { icon: "🌤️", label: "Meteorología" },
  { icon: "🗺️", label: "Navegación" },
  { icon: "🗼", label: "Tránsito Aéreo" },
  { icon: "📻", label: "Comunicaciones" },
  { icon: "📋", label: "Manuales AIP" },
  { icon: "🧠", label: "Factores Humanos" },
  { icon: "🛡️", label: "Seguridad Aérea" },
  { icon: "🛫", label: "Operaciones" },
];

const PATHY_MESSAGES: Record<string, { msg: string; bad: boolean }> = {
  "🤩": {
    msg: "¡Wow, hoy fue un gran día! 🎉 Esa energía y concentración que tuviste es exactamente lo que te va a llevar al CIAAC aprobado. Cada día así te acerca más a tu meta. ¡Sigue así, aviadora! ✈️",
    bad: false,
  },
  "😊": {
    msg: "¡Muy bien! Un día sólido de estudio es exactamente lo que necesitas. La consistencia es más poderosa que la perfección — y tú lo estás haciendo. 💙",
    bad: false,
  },
  "😐": {
    msg: "Los días \"más o menos\" también cuentan. El hecho de que hayas abierto FlightPath ya es una victoria. Mañana puede ser diferente — y si no, también está bien. 🌤️",
    bad: false,
  },
  "😤": {
    msg: "Entiendo tu frustración, y quiero que sepas que es completamente válida. El CIAAC es difícil — si fuera fácil, todos lo aprobarían. El hecho de que te frustres significa que te importa, y eso es hermoso. ¿Quieres que hablemos de lo que te está costando? Yaris puede ayudarte. 💙",
    bad: true,
  },
  "😴": {
    msg: "Estudiar cansada ya es un logro en sí mismo. Tu cerebro absorbe más de lo que crees, incluso cuando está cansado. Descansa bien esta noche — mañana tu mente va a estar más fresca y todo va a fluir mejor. 🌙",
    bad: false,
  },
  "😰": {
    msg: "La ansiedad antes del CIAAC es más común de lo que crees — casi todos los estudiantes la sienten. Pero quiero que sepas que estás más preparada de lo que piensas. ¿Quieres hablar con Yaris sobre lo que te preocupa? A veces nombrar el miedo lo hace más pequeño. 💙",
    bad: true,
  },
};

const YARIS_REPLIES = [
  "Entiendo cómo te sientes y está completamente bien sentirlo. El camino al CIAAC tiene sus momentos difíciles — lo importante es que sigues aquí. ¿Qué es lo que más te preocupa ahorita?",
  "Eso que describes es más común de lo que crees entre estudiantes de aviación. La presión del examen puede ser mucha. Recuerda: no tienes que ser perfecta, solo consistente. 💙",
  "¿Sabes qué? El hecho de que estés usando tu bitácora y reflexionando sobre tu proceso ya te pone por delante de muchos. La autoconciencia es una habilidad enorme. ✈️",
];

const MOOD_DATA = [
  { day: "L", emoji: "🤩", val: 100, color: "#2ecc71" },
  { day: "M", emoji: "😴", val: 40, color: "#888" },
  { day: "M", emoji: "🤩", val: 100, color: "#2ecc71" },
  { day: "J", emoji: "😤", val: 30, color: "#e74c3c" },
  { day: "V", emoji: "😊", val: 70, color: "#5A86CB" },
  { day: "S", emoji: "😐", val: 50, color: "#f39c12" },
  { day: "D", emoji: "—", val: 0, color: "#F2DCDB" },
];

const SAMPLE_ENTRIES = [
  {
    emotion: "😊", mood: "Me sentí bien hoy", borderColor: "#5A86CB",
    motiv: 5, conc: 4, conf: 4,
    tags: ["🌤️ Meteorología costó", "✅ Flashcards"],
    text: "Estudié 45 minutos de Meteorología pero los METAR me siguen costando. Lo demás estuvo bien, hice muchas flashcards de Aerodinámica y ya las siento más claras.",
    date: "Hoy", sub: "22 mayo",
  },
  {
    emotion: "😤", mood: "Me sentí frustrada", borderColor: "#e74c3c",
    motiv: 2, conc: 2, conf: 3,
    tags: ["🌤️ Meteorología costó", "📝 Simulador"],
    text: "Hice el simulador y saqué 68%. Me frustré mucho con las preguntas de Meteorología y Legislación. Siento que no avanzo lo suficiente...",
    date: "Ayer", sub: "21 mayo",
  },
  {
    emotion: "🤩", mood: "¡Me sentí increíble!", borderColor: "#2ecc71",
    motiv: 5, conc: 5, conf: 4,
    tags: ["✅ Todo bien", "🃏 Flashcards"],
    text: "¡Hoy todo fluyó! Hice 90 flashcards de Aerodinámica y las domino todas. Siento que si sigo así voy a estar lista para el CIAAC.",
    date: "20 mayo", sub: "Miércoles",
  },
  {
    emotion: "😴", mood: "Llegué muy cansada", borderColor: "#888",
    motiv: 2, conc: 2, conf: 3,
    tags: ["🗺️ Navegación costó"],
    text: "Llegué muy cansada de la escuela. Estudié solo 20 minutos pero al menos no rompí la racha. Mañana me recupero.",
    date: "19 mayo", sub: "Martes",
  },
  {
    emotion: "😐", mood: "Más o menos", borderColor: "#f39c12",
    motiv: 3, conc: 3, conf: 3,
    tags: ["⚖️ Legislación costó", "📖 Biblioteca"],
    text: "Día normal. Leí el manual de Legislación y entendí más cosas del Convenio de Chicago. Poco a poco.",
    date: "18 mayo", sub: "Lunes",
  },
];

function ScaleDots({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            border: `2px solid ${n <= value ? "#3D5D91" : "#F2DCDB"}`,
            background: n <= value ? "#3D5D91" : "white",
            color: n <= value ? "white" : "#aaa",
            fontSize: ".72rem", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .15s",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function BitacoraPage() {
  const [screen, setScreen] = useState<Screen>("hoy");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [scales, setScales] = useState({ s1: 0, s2: 0, s3: 0 });
  const [selectedMaterias, setSelectedMaterias] = useState<Set<string>>(new Set());
  const [noneSelected, setNoneSelected] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [result, setResult] = useState<{
    emoji: string; moodLabel: string; motiv: number; conc: number; conf: number;
    tema: string | null; text: string; analysis: string; bad: boolean;
  } | null>(null);
  const [yarisOpen, setYarisOpen] = useState(false);
  const [yarisMessages, setYarisMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisRi, setYarisRi] = useState(0);

  const toggleMateria = (label: string, isNone: boolean) => {
    if (isNone) {
      setSelectedMaterias(new Set());
      setNoneSelected(true);
    } else {
      setNoneSelected(false);
      const next = new Set(selectedMaterias);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      setSelectedMaterias(next);
    }
  };

  const handleSave = () => {
    if (!selectedEmotion) {
      alert("☁️ Pathy dice: ¡No olvides decirme cómo te sentiste hoy!");
      return;
    }
    const pathy = PATHY_MESSAGES[selectedEmotion] || PATHY_MESSAGES["😊"];
    const emotionObj = EMOTIONS.find((e) => e.icon === selectedEmotion)!;
    const tema = selectedMaterias.size > 0 ? [...selectedMaterias][0] : null;

    let fullMsg = pathy.msg;
    if (tema && !pathy.bad) {
      fullMsg += ` Por cierto, veo que ${tema} te costó hoy — es normal, es una de las más densas. Mañana podemos atacarla juntas. 🎯`;
    }

    setResult({
      emoji: selectedEmotion,
      moodLabel: emotionObj.label,
      motiv: scales.s1,
      conc: scales.s2,
      conf: scales.s3,
      tema,
      text: journalText,
      analysis: fullMsg,
      bad: pathy.bad,
    });
    setScreen("resultado");
  };

  const openYarisChat = () => {
    setYarisOpen(true);
    if (yarisMessages.length === 0) {
      setYarisMessages([{ text: "Hola 💙 Leí tu entrada de hoy y quiero que sepas que estoy aquí. ¿Quieres contarme más sobre cómo te sientes?", isUser: false }]);
    }
  };

  const sendYaris = () => {
    const t = yarisInput.trim();
    if (!t) return;
    const reply = YARIS_REPLIES[yarisRi % YARIS_REPLIES.length];
    setYarisMessages((prev) => [...prev, { text: t, isUser: true }]);
    setYarisInput("");
    setYarisRi((r) => r + 1);
    setTimeout(() => {
      setYarisMessages((prev) => [...prev, { text: reply, isUser: false }]);
    }, 800);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f5f7fc" }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .emo-btn:hover{border-color:#3D5D91!important;transform:translateY(-2px);}
        .save-btn:hover{background:#8a0a28!important;transform:translateY(-2px);box-shadow:0 8px 20px rgba(108,8,32,.3)!important;}
        .ec-card:hover{transform:translateX(3px);box-shadow:0 4px 16px rgba(61,93,145,.1)!important;}
        .mchip-btn:hover{border-color:#3D5D91!important;}
      `}</style>

      {/* TAB BAR */}
      <div style={{ padding: "16px 32px 0", background: "white", borderBottom: "1px solid rgba(61,93,145,.08)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 0 }}>
          {[
            { id: "hoy" as Screen, label: "✍️ Escribir hoy" },
            { id: "historial" as Screen, label: "📅 Mi historial" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setScreen(t.id)}
              style={{
                padding: "8px 20px", border: `2px solid ${screen === t.id ? "#3D5D91" : "#F2DCDB"}`,
                borderRadius: 20, fontSize: ".82rem", fontWeight: 600, cursor: "pointer",
                background: screen === t.id ? "#3D5D91" : "white",
                color: screen === t.id ? "white" : "#888",
                transition: "all .2s", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCREEN HOY ── */}
      {screen === "hoy" && (
        <div style={{ padding: "28px 0", maxWidth: 800 }}>

          {/* Pathy question */}
          <div style={{
            background: "linear-gradient(135deg, #1a1a2e, #2a2a4e)", borderRadius: 18,
            padding: "24px 28px", display: "flex", alignItems: "center", gap: 18,
            marginBottom: 24, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(242,174,188,.12) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ fontSize: "3rem", flexShrink: 0, animation: "float 3s ease-in-out infinite", zIndex: 1 }}>☁️</div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <div style={{ fontSize: ".7rem", color: "#F2AEBC", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>✍️ Entrada de hoy</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "white", marginBottom: 4 }}>¿Cómo estuvo tu sesión de estudio hoy, María? 💙</div>
              <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.5)" }}>Cuéntame todo, esto es solo tuyo</div>
            </div>
          </div>

          {/* Emoción */}
          <div style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 18 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>😊 ¿Cómo te sentiste estudiando hoy?</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
              {EMOTIONS.map((e) => (
                <button
                  key={e.icon}
                  className="emo-btn"
                  onClick={() => setSelectedEmotion(e.icon)}
                  style={{
                    display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 5,
                    padding: "12px 16px", border: `2px solid ${selectedEmotion === e.icon ? "#3D5D91" : "#F2DCDB"}`,
                    borderRadius: 14, cursor: "pointer", background: selectedEmotion === e.icon ? "rgba(61,93,145,.06)" : "white",
                    flex: 1, minWidth: 70, transition: "all .2s", fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>{e.icon}</span>
                  <span style={{ fontSize: ".72rem", fontWeight: 600, color: selectedEmotion === e.icon ? "#3D5D91" : "#888", textAlign: "center" }}>{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Escalas */}
          <div style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 18 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>📊 Cuéntame un poco más</div>
            {[
              { label: "¿Qué tan motivada llegaste?", key: "s1" as const },
              { label: "¿Qué tan concentrada estuviste?", key: "s2" as const },
              { label: "¿Cómo te sientes con el CIAAC?", key: "s3" as const },
            ].map((row) => (
              <div key={row.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: ".82rem", color: "#1a1a2e", fontWeight: 500, width: 200, flexShrink: 0 }}>{row.label}</span>
                <ScaleDots value={scales[row.key]} onChange={(v) => setScales((s) => ({ ...s, [row.key]: v }))} />
              </div>
            ))}
          </div>

          {/* Tema que costó */}
          <div style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 18 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>🌤️ ¿Qué tema te costó más hoy?</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
              {MATERIAS.map((m) => {
                const isActive = m.isNone ? noneSelected : selectedMaterias.has(m.label);
                return (
                  <button
                    key={m.label}
                    className="mchip-btn"
                    onClick={() => toggleMateria(m.label, !!m.isNone)}
                    style={{
                      padding: "6px 14px", background: isActive ? (m.isNone ? "rgba(46,204,113,.08)" : "rgba(61,93,145,.08)") : "#f8f9ff",
                      border: `2px solid ${isActive ? (m.isNone ? "#2ecc71" : "#3D5D91") : "#F2DCDB"}`,
                      borderRadius: 20, fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
                      color: isActive ? (m.isNone ? "#1a7a4a" : "#3D5D91") : "#1a1a2e",
                      transition: "all .2s", fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {m.icon} {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Texto libre */}
          <div style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 18 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>✍️ Cuéntame más — esto es solo tuyo</div>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value.slice(0, 500))}
              placeholder="¿Qué pasó hoy? ¿Algo que te haya costado mucho? ¿Algo que te haya gustado? ¿Cómo llegaste a estudiar? Escribe lo que quieras..."
              style={{
                width: "100%", minHeight: 120, border: "2px solid #F2DCDB", borderRadius: 12,
                padding: "14px 16px", fontSize: ".88rem", fontFamily: "'DM Sans', sans-serif",
                color: "#1a1a2e", outline: "none", resize: "vertical" as const, lineHeight: 1.7,
                background: "#fafbff", transition: "border-color .2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3D5D91")}
              onBlur={(e) => (e.target.style.borderColor = "#F2DCDB")}
            />
            <div style={{ fontSize: ".72rem", color: "#bbb", textAlign: "right" as const, marginTop: 6 }}>{journalText.length} / 500</div>
          </div>

          {/* Guardar */}
          <button
            className="save-btn"
            onClick={handleSave}
            style={{
              width: "100%", padding: 14, background: "#6C0820", color: "white", border: "none",
              borderRadius: 12, fontSize: ".95rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24,
            }}
          >
            ☁️ Guardar entrada de hoy
          </button>
        </div>
      )}

      {/* ── SCREEN RESULTADO ── */}
      {screen === "resultado" && result && (
        <div style={{ padding: "28px 0", maxWidth: 800 }}>

          {/* Pathy análisis */}
          <div style={{ textAlign: "center" as const, marginBottom: 28 }}>
            <div style={{ fontSize: "5rem", animation: "float 3s ease-in-out infinite", display: "inline-block", marginBottom: 10 }}>
              {result.bad ? "🤗" : "☁️"}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a1a2e", marginBottom: 6 }}>
              {result.bad ? "Pathy te manda un abrazo 🤗" : "Pathy analizó tu entrada 💙"}
            </h2>
          </div>

          {/* Mensaje Pathy */}
          <div style={{ background: "linear-gradient(135deg, #F2DCDB, #fce4ec)", borderRadius: 18, padding: "22px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle, rgba(242,174,188,.3) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6C0820", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 8, position: "relative", zIndex: 1 }}>☁️ Pathy dice</div>
            <p style={{ fontSize: ".92rem", color: "#444", lineHeight: 1.7, position: "relative", zIndex: 1 }}>{result.analysis}</p>
          </div>

          {/* Resumen */}
          <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
            <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#888", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 12 }}>📋 Resumen de tu entrada</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>{result.emoji}</span>
                <div>
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#1a1a2e" }}>{result.moodLabel}</div>
                  <div style={{ fontSize: ".74rem", color: "#888" }}>Cómo te sentiste</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const }}>
                {[
                  { label: "Motivación", val: result.motiv },
                  { label: "Concentración", val: result.conc },
                  { label: "Confianza CIAAC", val: result.conf },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 900, color: "#3D5D91" }}>{s.val > 0 ? `${s.val}/5` : "—"}</div>
                    <div style={{ fontSize: ".68rem", color: "#aaa" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {result.tema && (
                <div>
                  <div style={{ fontSize: ".74rem", color: "#888", marginBottom: 4 }}>Materia que te costó:</div>
                  <span style={{ padding: "3px 12px", background: "#F2DCDB", color: "#6C0820", borderRadius: 20, fontSize: ".76rem", fontWeight: 700 }}>{result.tema}</span>
                </div>
              )}
              {result.text && (
                <div>
                  <div style={{ fontSize: ".74rem", color: "#888", marginBottom: 4 }}>Lo que escribiste:</div>
                  <div style={{ fontSize: ".83rem", color: "#555", fontStyle: "italic" as const, lineHeight: 1.5, padding: "10px 12px", background: "#f8f9ff", borderRadius: 8 }}>{result.text}</div>
                </div>
              )}
            </div>
          </div>

          {/* Yaris card (si mal ánimo) */}
          {result.bad && (
            <div style={{ background: "linear-gradient(135deg, #3D5D91, #5A86CB)", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🤖</div>
                <div>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "white" }}>Yaris está aquí para ti</div>
                  <div style={{ fontSize: ".76rem", color: "rgba(255,255,255,.7)" }}>Puedes contarme más sobre cómo te sientes</div>
                </div>
              </div>
              <button
                onClick={openYarisChat}
                style={{ width: "100%", padding: 11, background: "white", color: "#3D5D91", border: "none", borderRadius: 9, fontSize: ".88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                🤖 Hablar con Yaris
              </button>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, marginBottom: 20 }}>
            <button
              onClick={() => setScreen("historial")}
              style={{ flex: 1, padding: 12, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 11, fontSize: ".88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              📅 Ver mi historial
            </button>
            <button
              onClick={() => setScreen("hoy")}
              style={{ flex: 1, padding: 12, background: "#6C0820", color: "white", border: "none", borderRadius: 11, fontSize: ".88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              ✈️ Ir a estudiar
            </button>
          </div>

          {/* Yaris chat */}
          {yarisOpen && (
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(61,93,145,.1)" }}>
              <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #3D5D91, #5A86CB)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 30, height: 30, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem" }}>🤖</div>
                  <div>
                    <div style={{ fontSize: ".86rem", fontWeight: 700, color: "white" }}>Yaris IA</div>
                    <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,.8)" }}>Aquí para escucharte 💙</div>
                  </div>
                </div>
                <button onClick={() => setYarisOpen(false)} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "white", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: ".76rem", fontWeight: 700 }}>✕</button>
              </div>
              <div style={{ height: 220, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {yarisMessages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: msg.isUser ? "row-reverse" : "row" as const }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: msg.isUser ? "#3D5D91" : "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.isUser ? ".6rem" : ".75rem", fontWeight: 700, color: msg.isUser ? "white" : "#1a1a2e", flexShrink: 0 }}>
                      {msg.isUser ? "MG" : "🤖"}
                    </div>
                    <div style={{ maxWidth: "82%", padding: "8px 12px", borderRadius: msg.isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px", background: msg.isUser ? "#3D5D91" : "#f0f4ff", color: msg.isUser ? "white" : "#1a1a2e", fontSize: ".81rem", lineHeight: 1.55 }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid #F2DCDB", display: "flex", gap: 7 }}>
                <input
                  value={yarisInput}
                  onChange={(e) => setYarisInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendYaris()}
                  placeholder="Cuéntame cómo te sientes..."
                  style={{ flex: 1, border: "2px solid #F2DCDB", borderRadius: 18, padding: "7px 12px", fontSize: ".82rem", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                />
                <button onClick={sendYaris} style={{ width: 32, height: 32, background: "#3D5D91", border: "none", borderRadius: "50%", color: "white", cursor: "pointer", fontSize: ".82rem" }}>➤</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SCREEN HISTORIAL ── */}
      {screen === "historial" && (
        <div style={{ padding: "28px 0", maxWidth: 800 }}>

          {/* Pathy insight */}
          <div style={{ background: "linear-gradient(135deg, #F2DCDB, #fce4ec)", borderRadius: 14, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>☁️</div>
            <div>
              <h4 style={{ fontSize: ".88rem", fontWeight: 700, color: "#6C0820", marginBottom: 4 }}>Pathy analizó tu bitácora 💙</h4>
              <p style={{ fontSize: ".83rem", color: "#666", lineHeight: 1.55 }}>
                Esta semana te sentiste <strong>frustrada con Meteorología 3 veces</strong>. Los lunes llegas con más energía que los viernes. Tu nivel de confianza con el CIAAC subió de 3 a 4 esta semana — ¡vas mejorando! 🎯
              </p>
            </div>
          </div>

          {/* Mood chart */}
          <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 12 }}>😊 Tu estado de ánimo esta semana</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {MOOD_DATA.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: ".9rem" }}>{m.val > 0 ? m.emoji : ""}</span>
                  <div style={{ width: "100%", borderRadius: "6px 6px 0 0", minHeight: 4, height: `${m.val}%`, background: m.color, transition: "height .4s" }} />
                  <span style={{ fontSize: ".62rem", color: "#aaa" }}>{m.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entry list */}
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#888", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 14 }}>📅 Entradas recientes</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {SAMPLE_ENTRIES.map((entry, i) => (
              <div
                key={i}
                className="ec-card"
                style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(61,93,145,.05)", cursor: "pointer", transition: "all .2s", borderLeft: `4px solid ${entry.borderColor}` }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.6rem" }}>{entry.emotion}</span>
                    <div>
                      <h4 style={{ fontSize: ".88rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{entry.mood}</h4>
                      <p style={{ fontSize: ".74rem", color: "#888" }}>Motivación {entry.motiv}/5 · Concentración {entry.conc}/5 · Confianza CIAAC {entry.conf}/5</p>
                    </div>
                  </div>
                  <div style={{ fontSize: ".74rem", color: "#aaa", textAlign: "right" as const }}>
                    {entry.date}<br /><span style={{ fontSize: ".65rem" }}>{entry.sub}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 8 }}>
                  {entry.tags.map((tag) => (
                    <span key={tag} style={{ padding: "3px 10px", borderRadius: 10, fontSize: ".68rem", fontWeight: 600, background: "#F2DCDB", color: "#6C0820" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ fontSize: ".83rem", color: "#666", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {entry.text}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(61,93,145,.05)" }}>
                  {[
                    { label: "Motivación", val: entry.motiv },
                    { label: "Concentración", val: entry.conc },
                    { label: "Confianza", val: entry.conf },
                  ].map((sc) => (
                    <div key={sc.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: ".74rem", color: "#888" }}>
                      {sc.label}
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: n <= sc.val ? "#3D5D91" : "#F2DCDB" }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
