import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/dashboard/flashcards")({
  component: FlashcardsPage,
});

/* ─── Data ───────────────────────────────────────────────── */

interface TemaEntry { name: string; cards: number; done: boolean; }
interface MateriaEntry {
  name: string; icon: string; iconBg: string;
  total: number; mastered: number; progress: number;
  temas: TemaEntry[];
}

const MATERIAS: MateriaEntry[] = [
  { name: "Aerodinámica", icon: "✈️", iconBg: "rgba(102,126,234,.12)", total: 64, mastered: 45, progress: 70, temas: [
    { name: "Definiciones y clasificación", cards: 8, done: true },
    { name: "Leyes de Newton y Bernoulli", cards: 10, done: true },
    { name: "Fuerzas en vuelo", cards: 8, done: false },
    { name: "Perfiles aerodinámicos", cards: 7, done: false },
    { name: "Mandos de la aeronave", cards: 9, done: false },
    { name: "Estabilidad y control", cards: 8, done: false },
    { name: "Maniobras y factor de carga", cards: 7, done: false },
    { name: "Motor crítico", cards: 7, done: false },
  ]},
  { name: "Aeronaves y Motores", icon: "⚙️", iconBg: "rgba(240,147,251,.12)", total: 72, mastered: 29, progress: 40, temas: [
    { name: "Clasificación de aeronaves", cards: 8, done: false },
    { name: "Estructuras", cards: 9, done: false },
    { name: "Superficies de control", cards: 7, done: false },
    { name: "Motor alternativo", cards: 10, done: false },
    { name: "Motor a reacción", cards: 10, done: false },
    { name: "Sistemas de la aeronave", cards: 9, done: false },
    { name: "Tren de aterrizaje", cards: 8, done: false },
    { name: "Protección contra fuego", cards: 6, done: false },
    { name: "Instrumentos", cards: 5, done: false },
  ]},
  { name: "Legislación Aeronáutica", icon: "⚖️", iconBg: "rgba(79,172,254,.12)", total: 112, mastered: 62, progress: 55, temas: [
    { name: "Jerarquía de normas", cards: 7, done: false },
    { name: "Convenios internacionales", cards: 9, done: false },
    { name: "Organismos aeronáuticos", cards: 8, done: false },
    { name: "Ley de Aviación Civil", cards: 10, done: false },
    { name: "Reglamento de Tránsito Aéreo", cards: 9, done: false },
  ]},
  { name: "Medicina de Aviación", icon: "🏥", iconBg: "rgba(250,112,154,.12)", total: 104, mastered: 83, progress: 80, temas: [
    { name: "Leyes de los gases", cards: 8, done: true },
    { name: "Hipoxia", cards: 9, done: true },
    { name: "Barotraumas", cards: 7, done: true },
    { name: "Fatiga", cards: 8, done: false },
    { name: "Desorientación espacial", cards: 9, done: false },
  ]},
  { name: "Meteorología", icon: "🌤️", iconBg: "rgba(67,233,123,.12)", total: 176, mastered: 53, progress: 30, temas: [
    { name: "La atmósfera", cards: 8, done: false },
    { name: "Temperatura y presión", cards: 9, done: false },
    { name: "Vientos", cards: 8, done: false },
    { name: "Nubes", cards: 10, done: false },
    { name: "METAR y TAF", cards: 12, done: false },
    { name: "Tormentas", cards: 8, done: false },
  ]},
  { name: "Navegación Aérea", icon: "🗺️", iconBg: "rgba(161,140,209,.12)", total: 176, mastered: 35, progress: 20, temas: [
    { name: "Coordenadas geográficas", cards: 8, done: false },
    { name: "Cartas aeronáuticas", cards: 9, done: false },
    { name: "Radionavegación", cards: 10, done: false },
    { name: "CR-3 y cálculos", cards: 8, done: false },
  ]},
  { name: "Servicios de Tránsito Aéreo", icon: "🗼", iconBg: "rgba(255,236,210,.5)", total: 144, mastered: 86, progress: 60, temas: [
    { name: "Espacio aéreo OACI", cards: 9, done: false },
    { name: "Reglaje altimétrico", cards: 7, done: false },
    { name: "Separación del tránsito", cards: 8, done: false },
    { name: "Fases de emergencia", cards: 6, done: false },
  ]},
  { name: "Comunicaciones Aeronáuticas", icon: "📻", iconBg: "rgba(42,245,152,.12)", total: 160, mastered: 72, progress: 45, temas: [
    { name: "Procedimientos radiotelefónicos", cards: 10, done: false },
    { name: "Espectro radioeléctrico", cards: 8, done: false },
    { name: "Emergencias y fallas", cards: 9, done: false },
  ]},
];

interface Flashcard { q: string; a: string; }

const CARDS: Flashcard[] = [
  { q: "¿Cuáles son las 4 fuerzas que actúan sobre una aeronave en vuelo?", a: "Sustentación ⬆, Peso ⬇, Empuje ➡ y Resistencia ⬅. En vuelo recto y nivelado estas fuerzas están en equilibrio." },
  { q: "¿Qué establece el Principio de Bernoulli?", a: "En un fluido en movimiento, al aumentar la velocidad disminuye la presión estática. Esto explica cómo el ala genera sustentación." },
  { q: "¿Qué es el ángulo de ataque?", a: "El ángulo formado entre la cuerda del ala y la dirección del viento relativo. Es fundamental para la generación de sustentación." },
  { q: "¿Qué es el ángulo crítico de ataque?", a: "El ángulo máximo de ataque antes del desplome (stall). Al superarlo, el flujo se desprende del ala y se pierde la sustentación." },
  { q: "¿Qué es el factor de carga?", a: "La relación entre la sustentación total y el peso de la aeronave (n = L/W). En vuelo recto y nivelado es igual a 1." },
  { q: "¿Qué es la resistencia inducida?", a: "Resistencia generada como consecuencia de la producción de sustentación. Aumenta cuando aumenta el ángulo de ataque." },
  { q: "¿Cuál es la diferencia entre estabilidad estática y dinámica?", a: "La estabilidad estática es la tendencia inicial a regresar al equilibrio. La dinámica describe el comportamiento a lo largo del tiempo después de una perturbación." },
  { q: "¿Qué es el motor crítico en una aeronave multimotor?", a: "El motor cuya falla produce el mayor efecto adverso sobre el control y rendimiento de la aeronave. En aviones con hélices girando en el mismo sentido es el izquierdo." },
];

type Screen = "materias" | "temas" | "flashcard" | "result";
type SwipeDir = "left" | "right" | null;

/* ─── Main component ─────────────────────────────────────── */

export default function FlashcardsPage() {
  const [screen, setScreen] = useState<Screen>("materias");
  const [materiaIdx, setMateriaIdx] = useState(0);
  const [temaIdx, setTemaIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [knew, setKnew] = useState(0);
  const [toReview, setToReview] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [swipe, setSwipe] = useState<SwipeDir>(null);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const materia = MATERIAS[materiaIdx];
  const tema = materia.temas[temaIdx];
  const sessionCards = CARDS.slice(0, tema.cards);
  const currentCard = sessionCards[cardIdx % sessionCards.length];
  const progressPct = sessionCards.length > 0 ? (cardIdx / sessionCards.length) * 100 : 0;

  function startSession(mi: number, ti: number) {
    setMateriaIdx(mi);
    setTemaIdx(ti);
    setCardIdx(0);
    setKnew(0);
    setToReview(0);
    setFlipped(false);
    setSwipe(null);
    setScreen("flashcard");
  }

  function flipCard() {
    setFlipped((f) => !f);
  }

  function answerCard(didKnow: boolean) {
    if (!flipped) { flipCard(); return; }
    const dir: SwipeDir = didKnow ? "right" : "left";
    setSwipe(dir);
    if (didKnow) setKnew((k) => k + 1);
    else setToReview((r) => r + 1);

    setTimeout(() => {
      setSwipe(null);
      setFlipped(false);
      const next = cardIdx + 1;
      if (next >= sessionCards.length) {
        const total = knew + toReview + 1;
        const knewFinal = knew + (didKnow ? 1 : 0);
        const pct = Math.round((knewFinal / total) * 100);
        let title: string, msg: string;
        if (pct === 100) {
          title = "¡Las dominas todas! 🎉";
          msg = "<strong>Pathy dice:</strong> ¡Increíble! Dominaste el 100% de las tarjetas de este tema. Pasa al siguiente tema cuando quieras. ✈️";
        } else if (pct >= 70) {
          title = "¡Muy bien! 💪";
          msg = `<strong>Pathy dice:</strong> Dominaste el ${pct}% de las tarjetas. Las que marcaste "a repasar" son las que más necesitas reforzar. ¡Otro repaso y las tendrás todas! 🎯`;
        } else {
          title = "Sigue practicando 📚";
          msg = `<strong>Pathy dice:</strong> Vas bien, pero aún necesitas repasar la mayoría. No te desanimes — la repetición es la clave del aprendizaje. ¡Inténtalo de nuevo! 💙`;
        }
        setResultTitle(title);
        setResultMsg(msg);
        setScreen("result");
      } else {
        setCardIdx(next);
      }
    }, 380);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (!flipped) { flipCard(); return; }
      answerCard(dx > 0);
    }
  }

  /* ── SCREEN: MATERIAS ── */
  if (screen === "materias") {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#1a1a2e", marginBottom: 6 }}>
            Estudia con <span style={{ color: "#6C0820" }}>Flashcards</span>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#888" }}>Elige una materia para repasar sus conceptos clave.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {MATERIAS.map((m, i) => (
            <MateriaCard key={i} materia={m} onClick={() => { setMateriaIdx(i); setScreen("temas"); }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── SCREEN: TEMAS ── */
  if (screen === "temas") {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => setScreen("materias")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "2px solid #F2DCDB", borderRadius: 8, padding: "7px 14px", fontSize: "0.82rem", fontWeight: 700, color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.color = "#888"; }}
          >
            ← Materias
          </button>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700 }}>
            {materia.icon} {materia.name}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {materia.temas.map((t, i) => (
            <TemaCard key={i} tema={t} num={i + 1} onStudy={() => startSession(materiaIdx, i)} />
          ))}
        </div>
      </div>
    );
  }

  /* ── SCREEN: FLASHCARD ── */
  if (screen === "flashcard") {
    const swipeStyle: React.CSSProperties = swipe === "right"
      ? { animation: "swipeRight 0.4s ease forwards" }
      : swipe === "left"
      ? { animation: "swipeLeft 0.4s ease forwards" }
      : {};

    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @keyframes swipeRight { to { transform: translateX(120%) rotate(15deg); opacity: 0; } }
          @keyframes swipeLeft  { to { transform: translateX(-120%) rotate(-15deg); opacity: 0; } }
          @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>

        {/* Centering wrapper */}
        <div style={{ minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>

          {/* FC Topbar */}
          <div style={{ width: "100%", maxWidth: 500, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <button
              onClick={() => setScreen("temas")}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "white", border: "2px solid #F2DCDB", borderRadius: 8, padding: "6px 12px", fontSize: "0.8rem", fontWeight: 700, color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              ← Temas
            </button>
            <span style={{ fontSize: "0.8rem", color: "#3D5D91", fontWeight: 700 }}>{tema.name}</span>
            <span style={{ fontSize: "0.85rem", color: "#888", fontWeight: 600 }}>{Math.min(cardIdx + 1, sessionCards.length)} / {sessionCards.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ width: "100%", maxWidth: 500, marginBottom: 20 }}>
            <div style={{ height: 5, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#3D5D91,#5A86CB)", borderRadius: 10, width: `${progressPct}%`, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
              <span style={{ color: "#2ecc71", fontWeight: 700 }}>✅ {knew} dominadas</span>
              <span style={{ color: "#e74c3c", fontWeight: 700 }}>🔄 {toReview} a repasar</span>
            </div>
          </div>

          {/* Swipe indicators */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "0.72rem", color: "#e74c3c", display: "flex", alignItems: "center", gap: 4 }}>← No la sé 🔄</span>
            <span style={{ fontSize: "0.72rem", color: "#2ecc71", display: "flex", alignItems: "center", gap: 4 }}>La sé ✅ →</span>
          </div>

          {/* The card */}
          <div
            onClick={flipCard}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ width: "100%", maxWidth: 500, perspective: 1200, marginBottom: 24, cursor: "pointer", ...swipeStyle }}
          >
            <div
              style={{
                position: "relative", width: "100%", height: 280,
                transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "none",
              }}
            >
              {/* Front */}
              <div
                style={{
                  position: "absolute", inset: 0, borderRadius: 20,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: 28, textAlign: "center",
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(145deg,#1a1a2e,#2a2a4e)",
                  boxShadow: "0 12px 40px rgba(26,26,46,0.3)",
                }}
              >
                <span style={{ fontSize: "0.68rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12, color: "white" }}>Pregunta</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", color: "white", lineHeight: 1.5 }}>{currentCard.q}</span>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 16 }}>Toca para ver la respuesta 👆</span>
              </div>

              {/* Back */}
              <div
                style={{
                  position: "absolute", inset: 0, borderRadius: 20,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: 28, textAlign: "center",
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(145deg,#6C0820,#a01030)",
                  boxShadow: "0 12px 40px rgba(108,8,32,0.3)",
                  transform: "rotateY(180deg)",
                }}
              >
                <span style={{ fontSize: "0.68rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12, color: "white" }}>Respuesta</span>
                <p style={{ fontSize: "0.92rem", color: "white", lineHeight: 1.6, opacity: 0.95 }}>{currentCard.a}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 14, width: "100%", maxWidth: 500 }}>
            <button
              onClick={() => answerCard(false)}
              style={{ flex: 1, padding: 14, background: "white", color: "#e74c3c", border: "2px solid #e74c3c", borderRadius: 14, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(231,76,60,0.06)"; e.currentTarget.style.transform = "translateX(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "none"; }}
            >
              🔄 A repasar
            </button>
            <button
              onClick={() => answerCard(true)}
              style={{ flex: 1, padding: 14, background: "#2ecc71", color: "white", border: "2px solid #2ecc71", borderRadius: 14, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#27ae60"; e.currentTarget.style.borderColor = "#27ae60"; e.currentTarget.style.transform = "translateX(3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#2ecc71"; e.currentTarget.style.borderColor = "#2ecc71"; e.currentTarget.style.transform = "none"; }}
            >
              ✅ Ya la sé
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── SCREEN: RESULT ── */
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <style>{`@keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
      <div style={{ fontSize: "5rem", animation: "float3 3s ease-in-out infinite", marginBottom: 12 }}>☁️</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", textAlign: "center", marginBottom: 6 }}>{resultTitle}</h1>
      <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: 28, textAlign: "center" }}>Así te fue en esta sesión</p>

      <div style={{ background: "white", borderRadius: 20, padding: 24, maxWidth: 440, width: "100%", boxShadow: "0 4px 20px rgba(61,93,145,0.1)", marginBottom: 20 }}>
        <div style={{ display: "flex", marginBottom: 20, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ flex: 1, padding: 16, textAlign: "center", background: "rgba(46,204,113,0.08)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 900, color: "#2ecc71" }}>{knew}</div>
            <div style={{ fontSize: "0.76rem", color: "#888", marginTop: 2 }}>Ya las sé ✅</div>
          </div>
          <div style={{ flex: 1, padding: 16, textAlign: "center", background: "rgba(231,76,60,0.06)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 900, color: "#e74c3c" }}>{toReview}</div>
            <div style={{ fontSize: "0.76rem", color: "#888", marginTop: 2 }}>A repasar 🔄</div>
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#F2DCDB,#fce4ec)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.85rem", color: "#555", lineHeight: 1.5, marginBottom: 16, maxWidth: 440, width: "100%" }}>
        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>☁️</span>
        <div dangerouslySetInnerHTML={{ __html: resultMsg }} />
      </div>

      <div style={{ display: "flex", gap: 10, maxWidth: 440, width: "100%" }}>
        <button
          onClick={() => startSession(materiaIdx, temaIdx)}
          style={{ flex: 1, padding: 12, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 11, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          🔄 Repetir tema
        </button>
        <button
          onClick={() => setScreen("temas")}
          style={{ flex: 1, padding: 12, background: "#6C0820", color: "white", border: "none", borderRadius: 11, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Otros temas
        </button>
      </div>
    </div>
  );
}

/* ─── Materia Card ───────────────────────────────────────── */

function MateriaCard({ materia, onClick }: { materia: MateriaEntry; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.25s", boxShadow: hover ? "0 8px 24px rgba(61,93,145,0.12)" : "0 2px 10px rgba(61,93,145,0.06)", border: hover ? "2px solid #5A86CB" : "2px solid transparent", transform: hover ? "translateY(-3px)" : "none", display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, background: materia.iconBg }}>
          {materia.icon}
        </div>
        <div>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{materia.name}</h3>
          <p style={{ fontSize: "0.75rem", color: "#888" }}>{materia.temas.length} temas · {materia.total} flashcards</p>
        </div>
      </div>
      <div>
        <div style={{ height: 5, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
          <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#3D5D91,#5A86CB)", width: `${materia.progress}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#aaa" }}>
          <span style={{ color: "#3D5D91", fontWeight: 700 }}>{materia.mastered} dominadas</span>
          <span>{materia.total - materia.mastered} por repasar</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Tema Card ──────────────────────────────────────────── */

function TemaCard({ tema, num, onStudy }: { tema: TemaEntry; num: number; onStudy: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onStudy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(61,93,145,0.05)", border: hover ? "2px solid #5A86CB" : "2px solid transparent", transform: hover ? "translateX(4px)" : "none", gap: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, color: "#3D5D91", flexShrink: 0 }}>
          {num}
        </div>
        <div>
          <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{tema.name}</h4>
          <p style={{ fontSize: "0.74rem", color: "#888" }}>{tema.cards} flashcards</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ background: "#F2DCDB", color: "#6C0820", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>🃏 {tema.cards}</span>
        {tema.done && <span style={{ fontSize: "1rem" }}>✅</span>}
        <button
          onClick={(e) => { e.stopPropagation(); onStudy(); }}
          style={{ padding: "8px 18px", background: "#3D5D91", color: "white", border: "none", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2d4a7a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3D5D91"; }}
        >
          Estudiar →
        </button>
      </div>
    </div>
  );
}
