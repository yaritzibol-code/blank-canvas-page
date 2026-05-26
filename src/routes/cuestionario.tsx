import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/cuestionario")({
  component: CuestionarioPage,
});

interface Question {
  materia: string;
  text: string;
  options: { text: string; correct: boolean }[];
  feedback: { correct: string; incorrect: string; cite: string };
}

interface YarisMsg {
  role: "bot" | "user";
  text: string;
  cite?: string;
}

const QUESTIONS: Question[] = [
  {
    materia: "🌤️ Meteorología",
    text: "¿Cuál de los siguientes grupos en un METAR indica la visibilidad predominante en metros?",
    options: [
      { text: "El grupo de temperatura y punto de rocío", correct: false },
      { text: "El grupo de 4 dígitos que sigue al viento, expresado en metros", correct: true },
      { text: "El grupo de presión altimétrica QNH", correct: false },
    ],
    feedback: {
      correct: "¡Correcto! En un METAR, la visibilidad se expresa en metros con 4 dígitos y aparece justo después del grupo de viento. Por ejemplo: 9999 significa visibilidad de 10 km o más.",
      incorrect: "La visibilidad en un METAR se expresa en metros con 4 dígitos y aparece justo después del grupo de viento. Ejemplo: 9999 = 10 km o más de visibilidad.",
      cite: "Manual de Meteorología CIAAC, Cap. 21, p. 180",
    },
  },
  {
    materia: "🌤️ Meteorología",
    text: "¿Qué fenómeno atmosférico describe la inversión de temperatura?",
    options: [
      { text: "Un aumento de temperatura con la altitud, contrario a la condición normal", correct: true },
      { text: "Una disminución brusca de temperatura en superficie", correct: false },
      { text: "El enfriamiento adiabático del aire ascendente", correct: false },
    ],
    feedback: {
      correct: "¡Exacto! Normalmente la temperatura disminuye con la altitud. En una inversión ocurre lo contrario: la temperatura aumenta con la altura, lo que puede atrapar contaminantes y afectar la visibilidad.",
      incorrect: "La inversión de temperatura es cuando la temperatura AUMENTA con la altitud, contrario a lo normal. Esto puede causar niebla y reducir la visibilidad.",
      cite: "Meteorología Básica CIAAC, Cap. 1, p. 8",
    },
  },
  {
    materia: "🌤️ Meteorología",
    text: "¿Cuál de las siguientes nubes pertenece al género de nubes altas?",
    options: [
      { text: "Cumulonimbus", correct: false },
      { text: "Altocumulus", correct: false },
      { text: "Cirrostratus", correct: true },
    ],
    feedback: {
      correct: "¡Correcto! Las nubes altas incluyen Cirrus, Cirrocumulus y Cirrostratus. Se forman entre 6,000 y 12,000 metros y están compuestas principalmente de cristales de hielo.",
      incorrect: "Las nubes ALTAS son: Cirrus, Cirrocumulus y Cirrostratus. El Altocumulus es una nube MEDIA, y el Cumulonimbus es de desarrollo vertical.",
      cite: "Meteorología Básica CIAAC, Cap. 10, p. 95",
    },
  },
  {
    materia: "✈️ Aerodinámica",
    text: "¿Qué sucede con la sustentación si duplicamos la velocidad del avión, manteniendo todo lo demás constante?",
    options: [
      { text: "La sustentación se duplica", correct: false },
      { text: "La sustentación se mantiene igual", correct: false },
      { text: "La sustentación se cuadruplica", correct: true },
      { text: "La sustentación disminuye a la mitad", correct: false },
    ],
    feedback: {
      correct: "¡Exacto! La fórmula de sustentación L = ½ρV²SCL muestra que la sustentación es proporcional al cuadrado de la velocidad. Si V se duplica, V² se cuadruplica.",
      incorrect: "La sustentación es proporcional al cuadrado de la velocidad (L = ½ρV²SCL). Si la velocidad se duplica, la sustentación se cuadruplica (2² = 4).",
      cite: "Aerodinámica CIAAC, Cap. 5, p. 48",
    },
  },
  {
    materia: "✈️ Aerodinámica",
    text: "¿Cuál es el efecto de un ángulo de ataque excesivo en un ala?",
    options: [
      { text: "La resistencia disminuye al máximo", correct: false },
      { text: "El flujo de aire se separa del ala y se produce entrada en pérdida (stall)", correct: true },
      { text: "La sustentación aumenta indefinidamente", correct: false },
    ],
    feedback: {
      correct: "¡Correcto! Al superar el ángulo de ataque crítico, el flujo de aire se separa de la superficie superior del ala, provocando una pérdida repentina de sustentación conocida como 'stall'.",
      incorrect: "Al superar el ángulo de ataque crítico (aprox. 15-20°), el flujo se separa del extradós del ala y se produce la entrada en pérdida (stall), con pérdida repentina de sustentación.",
      cite: "Aerodinámica CIAAC, Cap. 8, p. 74",
    },
  },
];

const YARIS_REPLIES = [
  { t: "En un METAR, la visibilidad aparece después del viento y se expresa en metros con 4 dígitos. 9999 significa 10 km o más de visibilidad. 🌤️", c: "Manual Meteorología CIAAC, Cap. 21, p. 180" },
  { t: "Piénsalo así: el METAR tiene un orden fijo: Tipo · Estación · Hora · Viento · <strong>Visibilidad</strong> · Fenómenos · Nubosidad · Temperatura/Rocío · Presión. ¡Apréndetelo en ese orden! 📋", c: "Meteorología Básica CIAAC, Cap. 21, p. 178" },
  { t: "¿Recuerdas el clima en el aeropuerto? Exactamente eso describe el METAR — una foto del tiempo en un momento específico. 📸", c: null },
  { t: "La sustentación es proporcional al cuadrado de la velocidad. Cuando duplicas la velocidad, multiplicas la sustentación por 4. ¡Recuerda V²! ✈️", c: "Aerodinámica CIAAC, Cap. 5, p. 48" },
  { t: "El ángulo de ataque crítico es el punto de no retorno — una vez que lo superas, el flujo se separa y pierdes sustentación abruptamente. 🚀", c: "Aerodinámica CIAAC, Cap. 8, p. 74" },
];

const LETTERS = ["A", "B", "C", "D"];

function CuestionarioPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<(boolean | null)[]>(new Array(QUESTIONS.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [yarisOpen, setYarisOpen] = useState(false);
  const [yarisMsgs, setYarisMsgs] = useState<YarisMsg[]>([]);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisTyping, setYarisTyping] = useState(false);
  const [yarisReplyIdx, setYarisReplyIdx] = useState(0);
  const [yarisInitialized, setYarisInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [elapsedMin, setElapsedMin] = useState(0);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const total = QUESTIONS.length;
  const answeredCount = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  const progressPct = Math.round((answeredCount / total) * 100);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMin(Math.round((Date.now() - startTime) / 60000));
    }, 10000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [yarisMsgs, yarisTyping]);

  function handleOptionClick(optIdx: number) {
    if (answered) return;
    const isCorrect = QUESTIONS[currentIdx].options[optIdx].correct;
    setSelectedIdx(optIdx);
    setAnswered(true);
    const newResults = [...results];
    newResults[currentIdx] = isCorrect;
    setResults(newResults);
  }

  function handleNext() {
    if (currentIdx + 1 >= total) {
      setShowResult(true);
      return;
    }
    setCurrentIdx(currentIdx + 1);
    setSelectedIdx(null);
    setAnswered(false);
  }

  function handleRestart() {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswered(false);
    setResults(new Array(QUESTIONS.length).fill(null));
    setShowResult(false);
  }

  function openYaris() {
    setYarisOpen(true);
    if (!yarisInitialized) {
      setYarisInitialized(true);
      setYarisTyping(true);
      setTimeout(() => {
        setYarisTyping(false);
        setYarisMsgs([
          { role: "bot", text: "¡Hola! Soy Yaris 🤖 Veo que tienes una duda sobre <strong>Meteorología</strong>. ¡Te explico!", cite: "Manual Meteorología CIAAC, Cap. 21, p. 180" },
        ]);
        setTimeout(() => {
          setYarisTyping(true);
          setTimeout(() => {
            setYarisTyping(false);
            setYarisMsgs((prev) => [
              ...prev,
              { role: "bot", text: "El METAR tiene un orden fijo: Tipo · Estación · Hora · Viento · <strong>Visibilidad</strong> · Fenómenos · Nubosidad · Temperatura/Rocío · Presión. La visibilidad siempre va después del viento, en metros con 4 dígitos. 📋", cite: "Meteorología Básica CIAAC, Cap. 21, p. 178" },
            ]);
          }, 900);
        }, 200);
      }, 700);
    }
  }

  function sendYarisMsg() {
    const text = yarisInput.trim();
    if (!text) return;
    setYarisMsgs((prev) => [...prev, { role: "user", text }]);
    setYarisInput("");
    setYarisTyping(true);
    const replyIdx = yarisReplyIdx % YARIS_REPLIES.length;
    setYarisReplyIdx(yarisReplyIdx + 1);
    setTimeout(() => {
      setYarisTyping(false);
      const r = YARIS_REPLIES[replyIdx];
      setYarisMsgs((prev) => [...prev, { role: "bot", text: r.t, cite: r.c ?? undefined }]);
    }, 900);
  }

  function getOptionStyle(optIdx: number): React.CSSProperties {
    const opt = QUESTIONS[currentIdx].options[optIdx];
    if (!answered) {
      return {
        border: "2px solid #F2DCDB",
        background: "#f8f9ff",
        cursor: "pointer",
      };
    }
    if (optIdx === selectedIdx) {
      return opt.correct
        ? { border: "2px solid #2ecc71", background: "rgba(46,204,113,0.07)", cursor: "default" }
        : { border: "2px solid #e74c3c", background: "rgba(231,76,60,0.06)", cursor: "default" };
    }
    if (opt.correct) {
      return { border: "2px solid #2ecc71", background: "rgba(46,204,113,0.07)", cursor: "default" };
    }
    return { border: "2px solid #F2DCDB", background: "#f8f9ff", cursor: "default", opacity: 0.6 };
  }

  function getLetterStyle(optIdx: number): React.CSSProperties {
    const opt = QUESTIONS[currentIdx].options[optIdx];
    if (!answered) return { background: "#F2DCDB", color: "#888" };
    if (optIdx === selectedIdx) {
      return opt.correct
        ? { background: "#2ecc71", color: "white" }
        : { background: "#e74c3c", color: "white" };
    }
    if (opt.correct) return { background: "#2ecc71", color: "white" };
    return { background: "#F2DCDB", color: "#888" };
  }

  const currentQ = QUESTIONS[currentIdx];
  const answeredCorrectly = answered && selectedIdx !== null && currentQ.options[selectedIdx].correct;
  const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const scoreColor = scorePercent >= 70 ? "#2ecc71" : scorePercent >= 50 ? "#f39c12" : "#e74c3c";

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f5f7fc",
        color: "#1a1a2e",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── TOPBAR ── */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid rgba(61,93,145,0.08)",
          padding: "0 24px",
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            to="/dashboard/banco"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              color: "#888", fontSize: "0.8rem", textDecoration: "none",
              padding: "5px 10px", borderRadius: 6, border: "1px solid #F2DCDB",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#3D5D91"; e.currentTarget.style.borderColor = "#3D5D91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#F2DCDB"; }}
          >
            ← Salir
          </Link>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1a2e" }}>
              🌱 Modo Aprendiendo
            </span>
            <span style={{ fontSize: "0.72rem", color: "#888" }} className="hidden sm:block">
              Meteorología · {total} preguntas
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              background: "#F2DCDB", color: "#6C0820",
              padding: "5px 14px", borderRadius: 20,
              fontSize: "0.82rem", fontWeight: 700,
            }}
          >
            Pregunta {currentIdx + 1} de {total}
          </div>
          <button
            onClick={openYaris}
            style={{
              padding: "7px 14px",
              background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
              color: "white", border: "none", borderRadius: 7,
              fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            🤖 <span className="hidden sm:inline">Explícamelo Yaris</span>
          </button>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div
        style={{
          background: "white",
          padding: "0 24px 12px",
          borderBottom: "1px solid rgba(61,93,145,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: "0.75rem", color: "#888", marginBottom: 6,
          }}
        >
          <span>Progreso de la sesión</span>
          <strong style={{ color: "#3D5D91" }}>{answeredCount}/{total} respondidas</strong>
        </div>
        <div style={{ height: 6, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg,#3D5D91,#5A86CB)",
              borderRadius: 10,
              width: `${progressPct}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── QUESTION AREA ── */}
        <div
          style={{
            flex: 1,
            padding: "32px",
            display: showResult ? "none" : "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
          }}
          className="sm:p-8 p-4"
        >
          {/* Question card */}
          <div
            style={{
              background: "white", borderRadius: 18, padding: 32,
              maxWidth: 680, width: "100%",
              boxShadow: "0 2px 16px rgba(61,93,145,0.07)",
              marginBottom: 16,
            }}
            className="sm:p-8 p-5"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(61,93,145,0.07)", color: "#3D5D91",
                  padding: "4px 12px", borderRadius: 20,
                  fontSize: "0.72rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.4px",
                }}
              >
                {currentQ.materia}
              </div>
              <span style={{ fontSize: "0.78rem", color: "#aaa", fontWeight: 600 }}>
                {currentIdx + 1} / {total}
              </span>
            </div>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.25rem",
                color: "#1a1a2e",
                lineHeight: 1.5,
                marginBottom: 28,
              }}
            >
              {currentQ.text}
            </p>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {currentQ.options.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", borderRadius: 12,
                    transition: "all 0.2s",
                    userSelect: "none",
                    ...getOptionStyle(i),
                  }}
                  onMouseEnter={(e) => {
                    if (!answered) {
                      e.currentTarget.style.borderColor = "#3D5D91";
                      e.currentTarget.style.background = "rgba(61,93,145,0.04)";
                      e.currentTarget.style.transform = "translateX(3px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!answered) {
                      e.currentTarget.style.borderColor = "#F2DCDB";
                      e.currentTarget.style.background = "#f8f9ff";
                      e.currentTarget.style.transform = "none";
                    }
                  }}
                >
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
                      transition: "all 0.2s",
                      ...getLetterStyle(i),
                    }}
                  >
                    {LETTERS[i]}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#1a1a2e", lineHeight: 1.4, flex: 1 }}>
                    {opt.text}
                  </div>
                  {answered && (
                    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                      {opt.correct ? "✅" : (i === selectedIdx ? "❌" : "")}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback card */}
            {answered && (
              <div
                style={{
                  borderRadius: 12, padding: "16px 20px", marginBottom: 16,
                  animation: "slideUp 0.3s ease",
                  background: answeredCorrectly ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.06)",
                  border: answeredCorrectly ? "1px solid rgba(46,204,113,0.3)" : "1px solid rgba(231,76,60,0.2)",
                }}
              >
                <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: "1.2rem" }}>{answeredCorrectly ? "✅" : "❌"}</span>
                  <span
                    style={{
                      fontSize: "0.9rem", fontWeight: 700,
                      color: answeredCorrectly ? "#1a7a4a" : "#c0392b",
                    }}
                  >
                    {answeredCorrectly ? "¡Correcto!" : "Incorrecto"}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#555" }}>
                  {answeredCorrectly ? currentQ.feedback.correct : currentQ.feedback.incorrect}
                </p>
                <span
                  style={{
                    display: "inline-block", marginTop: 8, padding: "4px 10px",
                    background: "rgba(61,93,145,0.07)", borderLeft: "3px solid #3D5D91",
                    borderRadius: 3, fontSize: "0.74rem", color: "#3D5D91", fontWeight: 600,
                  }}
                >
                  📖 {currentQ.feedback.cite}
                </span>
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={openYaris}
                    style={{
                      padding: "8px 14px",
                      background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
                      color: "white", border: "none", borderRadius: 7,
                      fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    🤖 Explícamelo Yaris
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Nav button */}
          <div style={{ maxWidth: 680, width: "100%", marginBottom: 16 }}>
            <button
              onClick={handleNext}
              disabled={!answered}
              style={{
                width: "100%", padding: 13,
                background: answered ? "#6C0820" : "#ddd",
                color: answered ? "white" : "#aaa",
                border: "none", borderRadius: 11,
                fontSize: "0.92rem", fontWeight: 700,
                cursor: answered ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={(e) => {
                if (answered) {
                  e.currentTarget.style.background = "#8a0a28";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 7px 20px rgba(108,8,32,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (answered) {
                  e.currentTarget.style.background = "#6C0820";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {currentIdx + 1 >= total ? "Ver resultados →" : "Siguiente pregunta →"}
            </button>
          </div>

          {/* Mini tracker */}
          <div style={{ maxWidth: 680, width: "100%", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {QUESTIONS.map((_, i) => {
              const res = results[i];
              const isCurrent = i === currentIdx && !showResult;
              let bg = "#F2DCDB";
              let boxShadow = "none";
              if (isCurrent) {
                bg = "#5A86CB";
                boxShadow = "0 0 0 2px white, 0 0 0 4px #5A86CB";
              } else if (res === true) {
                bg = "#2ecc71";
              } else if (res === false) {
                bg = "#e74c3c";
              } else if (res === null && i < currentIdx) {
                bg = "#3D5D91";
              }
              return (
                <div
                  key={i}
                  style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: bg, boxShadow, transition: "all 0.2s",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── RESULT SCREEN ── */}
        {showResult && (
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "40px 24px", overflowY: "auto",
            }}
          >
            <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
            <div style={{ fontSize: "5rem", marginBottom: 8, animation: "float 3s ease-in-out infinite" }}>
              ☁️
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem", color: "#1a1a2e",
                marginBottom: 6, textAlign: "center",
              }}
            >
              ¡Sesión <span style={{ color: "#6C0820" }}>completada!</span>
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: 28, textAlign: "center" }}>
              Aquí está tu análisis de Pathy ✈️
            </p>

            {/* Score card */}
            <div
              style={{
                background: "white", borderRadius: 20, padding: 28,
                width: "100%", maxWidth: 580,
                boxShadow: "0 4px 20px rgba(61,93,145,0.1)",
                marginBottom: 20, textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "4rem", fontWeight: 900,
                  color: scoreColor, lineHeight: 1, marginBottom: 4,
                }}
              >
                {scorePercent}%
              </div>
              <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: 20 }}>
                Aciertos en esta sesión
              </div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { num: correctCount, label: "Correctas" },
                  { num: answeredCount - correctCount, label: "Incorrectas" },
                  { num: total, label: "Total" },
                  { num: `${elapsedMin} min`, label: "Tiempo" },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 900, color: "#1a1a2e" }}>
                      {s.num}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#aaa" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weakness/strength */}
            <div
              style={{
                background: "white", borderRadius: 16, padding: 20,
                width: "100%", maxWidth: 580,
                boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 12 }}>
                ⚠️ Temas que necesitas reforzar
              </div>
              {[
                { label: "📋 Lectura de METAR y TAF", score: 52, color: "#e74c3c", bg: "rgba(231,76,60,0.06)" },
                { label: "🌡️ Sistemas de presión", score: 65, color: "#f39c12", bg: "rgba(243,156,18,0.06)" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                    fontSize: "0.84rem", background: item.bg,
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.score}%</span>
                </div>
              ))}
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 12, marginTop: 14 }}>
                ✅ Lo que dominaste
              </div>
              {[
                { label: "🌊 Fuerza de Coriolis", score: 90, color: "#2ecc71", bg: "rgba(46,204,113,0.06)" },
                { label: "☁️ Clasificación de nubes", score: 88, color: "#2ecc71", bg: "rgba(46,204,113,0.06)" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                    fontSize: "0.84rem", background: item.bg,
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.score}%</span>
                </div>
              ))}
            </div>

            {/* Pathy tip */}
            <div
              style={{
                background: "linear-gradient(135deg,#F2DCDB,#fce4ec)",
                borderRadius: 14, padding: "16px 18px",
                width: "100%", maxWidth: 580,
                marginBottom: 20,
                display: "flex", alignItems: "flex-start", gap: 10,
                fontSize: "0.85rem", color: "#555", lineHeight: 1.6,
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>☁️</span>
              <div>
                <strong style={{ color: "#6C0820" }}>Pathy recomienda:</strong>{" "}
                ¡Buen trabajo! Tu punto más débil es la lectura de METAR/TAF. Te recomiendo hacer una sesión de 20 preguntas solo de ese tema. ¡En 2 días más lo dominarás! 💪
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 580, flexWrap: "wrap" }}>
              <button
                onClick={handleRestart}
                style={{
                  flex: 1, padding: 13,
                  background: "white", color: "#3D5D91",
                  border: "2px solid #3D5D91", borderRadius: 11,
                  fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                🔄 Repetir sesión
              </button>
              <Link
                to="/dashboard"
                style={{
                  flex: 1, padding: 13,
                  background: "#6C0820", color: "white",
                  border: "none", borderRadius: 11,
                  fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                🏠 Ir al inicio
              </Link>
            </div>
          </div>
        )}

        {/* ── YARIS PANEL ── */}
        <div
          style={
            isMobile && yarisOpen
              ? {
                  position: "fixed", inset: 0, zIndex: 200,
                  width: "100%", display: "flex", flexDirection: "column",
                  background: "white",
                }
              : {
                  width: yarisOpen ? 340 : 0,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "white",
                  borderLeft: yarisOpen ? "1px solid rgba(61,93,145,0.1)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  transition: "width 0.35s ease",
                }
          }
        >
          {/* Yaris header */}
          <div
            style={{
              padding: "14px 18px", flexShrink: 0,
              background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 32, height: 32, background: "white", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "white" }}>Yaris IA</div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.8)" }}>Tutora de aviación 24/7</div>
              </div>
            </div>
            <button
              onClick={() => setYarisOpen(false)}
              style={{
                background: "rgba(255,255,255,0.2)", border: "none", color: "white",
                borderRadius: 6, padding: "4px 8px", cursor: "pointer",
                fontSize: "0.76rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1, overflowY: "auto", padding: 14,
              display: "flex", flexDirection: "column", gap: 10,
            }}
          >
            {yarisMsgs.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: 7, alignItems: "flex-start",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                <div
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: msg.role === "bot" ? "0.78rem" : "0.6rem",
                    fontWeight: msg.role === "user" ? 700 : undefined,
                    background: msg.role === "bot" ? "#F2DCDB" : "#3D5D91",
                    color: msg.role === "user" ? "white" : undefined,
                    flexShrink: 0,
                  }}
                >
                  {msg.role === "bot" ? "🤖" : "MG"}
                </div>
                <div
                  style={{
                    maxWidth: "84%", padding: "9px 12px",
                    borderRadius: msg.role === "bot" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                    fontSize: "0.81rem", lineHeight: 1.55,
                    background: msg.role === "bot" ? "#f0f4ff" : "#3D5D91",
                    color: msg.role === "bot" ? "#1a1a2e" : "white",
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  {msg.cite && (
                    <span
                      style={{
                        display: "block", marginTop: 6, padding: "4px 8px",
                        background: "rgba(61,93,145,0.08)",
                        borderLeft: "3px solid #3D5D91", borderRadius: 3,
                        fontSize: "0.7rem", color: "#3D5D91", fontWeight: 600,
                      }}
                    >
                      📖 {msg.cite}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {yarisTyping && (
              <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "#F2DCDB", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "0.78rem", flexShrink: 0,
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    padding: "9px 12px", background: "#f0f4ff",
                    borderRadius: "4px 12px 12px 12px",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <style>{`@keyframes yb{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}.yd{width:5px;height:5px;background:#5A86CB;border-radius:50%;animation:yb .8s infinite}.yd:nth-child(2){animation-delay:.15s}.yd:nth-child(3){animation-delay:.3s}`}</style>
                  <div className="yd" />
                  <div className="yd" />
                  <div className="yd" />
                </div>
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid #F2DCDB",
              display: "flex", gap: 7, flexShrink: 0,
            }}
          >
            <input
              value={yarisInput}
              onChange={(e) => setYarisInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendYarisMsg(); }}
              placeholder="Escribe tu duda..."
              style={{
                flex: 1, border: "2px solid #F2DCDB", borderRadius: 18,
                padding: "7px 12px", fontSize: "0.81rem",
                fontFamily: "'DM Sans', sans-serif", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; }}
            />
            <button
              onClick={sendYarisMsg}
              style={{
                width: 32, height: 32, background: "#3D5D91", border: "none",
                borderRadius: "50%", color: "white", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.82rem", flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
