import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/materias/$subjectId")({
  component: SubjectDetail,
});

type TopicStatus = "completed" | "active" | "locked";

interface TopicEntry {
  id: number;
  name: string;
  status: TopicStatus;
}

interface MCQOption {
  letter: string;
  text: string;
  isCorrect: boolean;
}

interface SubjectData {
  icon: string;
  name: string;
  topics: TopicEntry[];
  activeTopicId: number;
  activeTopicTitle: string;
  explanationTitle: string;
  explanationP1: string;
  explanationP2: string;
  showDiagram: boolean;
  highlightHtml: string;
  nemotecnia: string;
  activityQuestion: string;
  options: MCQOption[];
  correctFeedback: string;
  incorrectFeedback: string;
  flashcardFront: string;
  flashcardBack: string;
  nextTopicName: string;
}

const SUBJECTS: Record<string, SubjectData> = {
  aerodinamica: {
    icon: "✈️",
    name: "Aerodinámica",
    topics: [
      { id: 1, name: "Introducción a la aerodinámica", status: "completed" },
      { id: 2, name: "Propiedades del aire", status: "completed" },
      { id: 3, name: "Flujo laminar y turbulento", status: "completed" },
      { id: 4, name: "Principio de Bernoulli", status: "completed" },
      { id: 5, name: "Sustentación", status: "active" },
      { id: 6, name: "Resistencia al avance", status: "locked" },
      { id: 7, name: "Las 4 fuerzas del vuelo", status: "locked" },
      { id: 8, name: "Ángulo de ataque", status: "locked" },
      { id: 9, name: "Perfil alar", status: "locked" },
      { id: 10, name: "Superficies de control", status: "locked" },
      { id: 11, name: "Estabilidad y control", status: "locked" },
    ],
    activeTopicId: 5,
    activeTopicTitle: "Sustentación",
    explanationTitle: "Tema 5: Sustentación",
    explanationP1:
      "La sustentación es la fuerza aerodinámica que actúa perpendicularmente a la dirección del movimiento de la aeronave, permitiéndole volar. Es generada principalmente por las alas del avión.",
    explanationP2:
      "Para que el avión vuele recto y nivelado, la sustentación debe ser igual al peso, y el empuje debe ser igual a la resistencia al avance.",
    showDiagram: true,
    highlightHtml:
      "<strong>Fórmula de sustentación:</strong><br/>L = ½ × ρ × V² × S × C<sub>L</sub><br/>Donde: ρ = densidad del aire, V = velocidad, S = superficie alar, C<sub>L</sub> = coeficiente de sustentación",
    nemotecnia:
      '¿Recuerdas cuando Buzz Lightyear "cae con estilo"? Eso es exactamente la diferencia entre peso y sustentación — Buzz no vuela, solo cae lentamente porque no genera sustentación real. ¡Un avión sí la genera! 🚀',
    activityQuestion:
      "¿Qué sucede con la sustentación si duplicamos la velocidad del avión, manteniendo todo lo demás constante?",
    options: [
      { letter: "A", text: "La sustentación se duplica", isCorrect: false },
      { letter: "B", text: "La sustentación se mantiene igual", isCorrect: false },
      { letter: "C", text: "La sustentación se cuadruplica", isCorrect: true },
      { letter: "D", text: "La sustentación disminuye a la mitad", isCorrect: false },
    ],
    correctFeedback:
      "Como la velocidad está elevada al cuadrado en la fórmula (V²), si duplicas la velocidad, la sustentación se multiplica por 4. Es decir, 2² = 4. ¡La fórmula no miente!",
    incorrectFeedback:
      "Recuerda que en la fórmula la velocidad está al cuadrado (V²). Si duplicas V, el resultado es 2² = 4. ¡La sustentación se cuadruplica!",
    flashcardFront: "¿Qué es la sustentación y qué fuerza la equilibra en vuelo nivelado?",
    flashcardBack:
      "La sustentación es la fuerza aerodinámica perpendicular al movimiento que permite volar. En vuelo recto y nivelado, la equilibra el peso de la aeronave.",
    nextTopicName: "Resistencia al avance",
  },
  meteorologia: {
    icon: "🌤️",
    name: "Meteorología",
    topics: [
      { id: 1, name: "La atmósfera terrestre", status: "active" },
      { id: 2, name: "Presión y temperatura", status: "locked" },
      { id: 3, name: "Nubes y precipitación", status: "locked" },
      { id: 4, name: "Vientos y turbulencia", status: "locked" },
      { id: 5, name: "Fenómenos peligrosos", status: "locked" },
    ],
    activeTopicId: 1,
    activeTopicTitle: "La atmósfera terrestre",
    explanationTitle: "Tema 1: La atmósfera terrestre",
    explanationP1:
      "La atmósfera es la capa gaseosa que rodea la Tierra. Está compuesta principalmente por nitrógeno (78%), oxígeno (21%) y otros gases. Se divide en capas: tropósfera, estratósfera, mesósfera y termósfera.",
    explanationP2:
      "La tropósfera es donde ocurre casi todo el tiempo meteorológico y donde vuelan la mayoría de las aeronaves comerciales. Su altura varía entre 8 km en los polos y 16 km en el ecuador.",
    showDiagram: false,
    highlightHtml:
      "<strong>ISA (Atmósfera Estándar Internacional):</strong><br/>Temperatura: 15°C al nivel del mar — Presión: 1013.25 hPa — Densidad: 1.225 kg/m³",
    nemotecnia:
      'Recuerda las capas con "Tú Siempre Me Traes": Tropósfera, Estratósfera, Mesósfera, Termósfera. ¡De abajo hacia arriba! 🌍',
    activityQuestion: "¿En qué capa de la atmósfera vuelan la mayoría de las aeronaves comerciales?",
    options: [
      { letter: "A", text: "Estratósfera", isCorrect: false },
      { letter: "B", text: "Tropósfera", isCorrect: true },
      { letter: "C", text: "Mesósfera", isCorrect: false },
      { letter: "D", text: "Termósfera", isCorrect: false },
    ],
    correctFeedback:
      "La tropósfera es la capa más baja, donde se producen los fenómenos meteorológicos. Las aeronaves comerciales vuelan entre 8,000 y 12,000 metros, dentro de esta capa.",
    incorrectFeedback:
      "La tropósfera es la capa más cercana a la superficie terrestre, donde ocurre el tiempo meteorológico. Es donde vuelan las aeronaves comerciales.",
    flashcardFront: "¿Cuál es la composición principal de la atmósfera terrestre?",
    flashcardBack: "La atmósfera está compuesta por Nitrógeno (78%), Oxígeno (21%) y otros gases como Argón y CO₂ (1%).",
    nextTopicName: "Presión y temperatura",
  },
};

function getDefaultSubject(id: string): SubjectData {
  const names: Record<string, { icon: string; name: string }> = {
    navegacion: { icon: "🧭", name: "Navegación" },
    reglamentos: { icon: "📋", name: "Reglamentos" },
    performance: { icon: "⚡", name: "Performance" },
    electrica: { icon: "🔌", name: "Eléctrica" },
    motores: { icon: "🔧", name: "Motores" },
    instrumentos: { icon: "🎛️", name: "Instrumentos" },
    comunicaciones: { icon: "📡", name: "Comunicaciones" },
    factores: { icon: "🧠", name: "Factores Humanos" },
    aerodromes: { icon: "🏗️", name: "Aeródromos" },
    operaciones: { icon: "🗺️", name: "Operaciones" },
  };
  const meta = names[id] ?? { icon: "📚", name: id };
  return {
    ...meta,
    topics: [{ id: 1, name: "Tema 1: Introducción", status: "active" }],
    activeTopicId: 1,
    activeTopicTitle: "Introducción",
    explanationTitle: `Tema 1: ${meta.name}`,
    explanationP1: "Contenido próximamente disponible para esta materia.",
    explanationP2: "",
    showDiagram: false,
    highlightHtml: "",
    nemotecnia: "",
    activityQuestion: "¿Cuál es la primera regla de la aviación?",
    options: [
      { letter: "A", text: "Volar siempre con seguridad", isCorrect: true },
      { letter: "B", text: "Volar siempre rápido", isCorrect: false },
      { letter: "C", text: "Volar siempre alto", isCorrect: false },
      { letter: "D", text: "Volar siempre lejos", isCorrect: false },
    ],
    correctFeedback: "¡La seguridad siempre es la prioridad número uno en aviación!",
    incorrectFeedback: "La seguridad es siempre la prioridad número uno en aviación.",
    flashcardFront: "¿Cuál es la regla de oro en aviación?",
    flashcardBack: "La seguridad siempre va primero. Ningún vuelo vale una vida.",
    nextTopicName: "",
  };
}

/* ─── Topics sidebar panel ───────────────────────────────── */

function TopicsPanel({ subject }: { subject: SubjectData }) {
  const completedCount = subject.topics.filter((t) => t.status === "completed").length;

  return (
    <>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #F2DCDB",
          background: "#f8f9ff",
          flexShrink: 0,
        }}
      >
        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>
          Temas de {subject.name}
        </h3>
        <p style={{ fontSize: "0.75rem", color: "#888" }}>
          <span style={{ color: "#3D5D91", fontWeight: 700 }}>{completedCount}</span> de{" "}
          {subject.topics.length} temas completados
        </p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {subject.topics.map((topic) => (
          <TopicListItem key={topic.id} topic={topic} />
        ))}
      </div>
    </>
  );
}

function TopicListItem({ topic }: { topic: TopicEntry }) {
  const isLocked = topic.status === "locked";

  const borderColor =
    topic.status === "completed" ? "#2ecc71" : topic.status === "active" ? "#3D5D91" : "transparent";

  const numBg =
    topic.status === "completed" ? "#2ecc71" : topic.status === "active" ? "#3D5D91" : "#eee";

  const numColor = topic.status === "completed" || topic.status === "active" ? "white" : "#bbb";

  const nameColor =
    topic.status === "active" ? "#3D5D91" : topic.status === "locked" ? "#bbb" : "#1a1a2e";

  const tagColor =
    topic.status === "completed" ? "#2ecc71" : topic.status === "active" ? "#3D5D91" : "#bbb";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        cursor: isLocked ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        borderLeft: `3px solid ${borderColor}`,
        opacity: isLocked ? 0.45 : 1,
        background: topic.status === "active" ? "rgba(61,93,145,0.06)" : "transparent",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: 700,
          flexShrink: 0,
          background: numBg,
          color: numColor,
        }}
      >
        {topic.status === "completed" ? "✓" : topic.id}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.83rem",
            fontWeight: 600,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: nameColor,
          }}
        >
          {topic.name}
        </div>
        <div
          style={{
            fontSize: "0.68rem",
            marginTop: 2,
            color: tagColor,
            fontWeight: topic.status === "locked" ? 400 : 600,
          }}
        >
          {topic.status === "completed" && "✓ Completado"}
          {topic.status === "active" && "▶ En curso"}
          {topic.status === "locked" && "🔒 Bloqueado"}
        </div>
      </div>
      {topic.status === "locked" && (
        <span style={{ fontSize: "0.85rem", color: "#ccc", flexShrink: 0 }}>🔒</span>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

function SubjectDetail() {
  const { subjectId } = Route.useParams();
  const subject = SUBJECTS[subjectId] ?? getDefaultSubject(subjectId);

  const completedCount = subject.topics.filter((t) => t.status === "completed").length;
  const progressPct = Math.round((completedCount / subject.topics.length) * 100);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  function handleOptionClick(opt: MCQOption) {
    if (answered) return;
    setSelectedOption(opt.letter);
    setAnswered(true);
  }

  const answeredCorrectly =
    answered && subject.options.find((o) => o.letter === selectedOption)?.isCorrect;

  function getOptionBorderColor(opt: MCQOption): string {
    if (!answered || opt.letter !== selectedOption) return "#F2DCDB";
    return opt.isCorrect ? "#2ecc71" : "#e74c3c";
  }

  function getOptionBg(opt: MCQOption): string {
    if (!answered || opt.letter !== selectedOption) return "white";
    return opt.isCorrect ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)";
  }

  function getLetterBg(opt: MCQOption): string {
    if (!answered || opt.letter !== selectedOption) return "#F2DCDB";
    return opt.isCorrect ? "#2ecc71" : "#e74c3c";
  }

  function getLetterColor(opt: MCQOption): string {
    if (!answered || opt.letter !== selectedOption) return "#888";
    return "white";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── TOPBAR ── */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid rgba(61,93,145,0.08)",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            to="/dashboard/materias"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#888",
              fontSize: "0.82rem",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #F2DCDB",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#3D5D91";
              e.currentTarget.style.borderColor = "#3D5D91";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#888";
              e.currentTarget.style.borderColor = "#F2DCDB";
            }}
          >
            ← Mis materias
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                background: "#F2DCDB",
                color: "#6C0820",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.78rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {subject.icon} {subject.name}
            </span>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.1rem",
                color: "#1a1a2e",
                fontWeight: 700,
              }}
              className="hidden sm:block"
            >
              Tema {subject.activeTopicId}: {subject.activeTopicTitle}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#888" }}
            className="hidden md:flex"
          >
            <span>{progressPct}%</span>
            <div
              style={{
                width: 120,
                height: 6,
                background: "#F2DCDB",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #3D5D91, #5A86CB)",
                  borderRadius: 10,
                  width: `${progressPct}%`,
                }}
              />
            </div>
            <span>
              {completedCount}/{subject.topics.length} temas
            </span>
          </div>
          <button
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            🤖 Explícamelo Yaris
          </button>
        </div>
      </div>

      {/* ── MOBILE TOPICS TOGGLE ── */}
      <button
        onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
        className="flex md:hidden"
        style={{
          background: "white",
          borderBottom: "1px solid #F2DCDB",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          padding: "12px 16px",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.88rem",
          fontWeight: 600,
          color: "#1a1a2e",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}
      >
        <span>
          📋 Ver todos los temas ({completedCount}/{subject.topics.length} completados)
        </span>
        <span
          style={{
            transition: "transform 0.2s",
            transform: mobilePanelOpen ? "rotate(180deg)" : "none",
          }}
        >
          ▼
        </span>
      </button>

      {/* ── CONTENT AREA ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Mobile topics panel (overlay) */}
        {mobilePanelOpen && (
          <div
            className="md:hidden"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              background: "white",
              maxHeight: "60vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              borderBottom: "2px solid #F2DCDB",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            }}
          >
            <TopicsPanel subject={subject} />
          </div>
        )}

        {/* Desktop topics panel */}
        <div
          className="hidden md:flex"
          style={{
            width: 280,
            background: "white",
            borderRight: "1px solid rgba(61,93,145,0.08)",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <TopicsPanel subject={subject} />
        </div>

        {/* ── TEMA CONTENT ── */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: 32, background: "#f5f7fc" }}
          className="sm:p-8 p-4"
        >

          {/* 1. EXPLANATION CARD */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 28,
              marginBottom: 20,
              boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(61,93,145,0.08)",
                color: "#3D5D91",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 16,
              }}
            >
              📖 Explicación
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                color: "#1a1a2e",
                marginBottom: 16,
                fontWeight: 700,
              }}
            >
              {subject.explanationTitle}
            </h2>

            <p style={{ fontSize: "0.92rem", lineHeight: 1.7, color: "#555", marginBottom: 16 }}>
              {subject.explanationP1}
            </p>

            {/* 4-Forces Diagram */}
            {subject.showDiagram && (
              <div
                style={{
                  background: "linear-gradient(135deg, #f0f4ff, #e8f0fa)",
                  border: "2px solid rgba(61,93,145,0.1)",
                  borderRadius: 12,
                  padding: 24,
                  margin: "20px 0",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#3D5D91",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 16,
                  }}
                >
                  Las 4 fuerzas que actúan sobre el avión
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "3rem" }}>✈️</span>
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "white",
                      background: "#2ecc71",
                      padding: "4px 10px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⬆ Sustentación
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "white",
                      background: "#6C0820",
                      padding: "4px 10px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⬇ Peso
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "white",
                      background: "#5A86CB",
                      padding: "4px 10px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⬅ Empuje
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "white",
                      background: "#888",
                      padding: "4px 10px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Resistencia ➡
                  </span>
                </div>
              </div>
            )}

            {subject.explanationP2 && (
              <p style={{ fontSize: "0.92rem", lineHeight: 1.7, color: "#555", marginBottom: 16 }}>
                {subject.explanationP2}
              </p>
            )}

            {/* Highlight box */}
            {subject.highlightHtml && (
              <div
                style={{
                  background: "rgba(61,93,145,0.06)",
                  borderLeft: "4px solid #3D5D91",
                  borderRadius: "0 8px 8px 0",
                  padding: "14px 18px",
                  margin: "16px 0",
                  fontSize: "0.88rem",
                  color: "#1a1a2e",
                  lineHeight: 1.6,
                }}
                dangerouslySetInnerHTML={{ __html: subject.highlightHtml }}
              />
            )}

            {/* Nemotecnia */}
            {subject.nemotecnia && (
              <div
                style={{
                  background: "linear-gradient(135deg, #F2DCDB, #fce4ec)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  margin: "16px 0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>🧠</span>
                <div>
                  <h4
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "#6C0820",
                      marginBottom: 4,
                    }}
                  >
                    Nemotecnia de Yaris ✨
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.5 }}>
                    {subject.nemotecnia}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. ACTIVITY CARD */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 28,
              marginBottom: 20,
              boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#F2DCDB",
                color: "#6C0820",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 16,
              }}
            >
              ✏️ Actividad práctica
            </div>

            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#1a1a2e",
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              {subject.activityQuestion}
            </p>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {subject.options.map((opt) => (
                <button
                  key={opt.letter}
                  onClick={() => handleOptionClick(opt)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    border: `2px solid ${getOptionBorderColor(opt)}`,
                    borderRadius: 10,
                    cursor: answered ? "default" : "pointer",
                    transition: "all 0.2s",
                    fontSize: "0.88rem",
                    fontFamily: "'DM Sans', sans-serif",
                    background: getOptionBg(opt),
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      background: getLetterBg(opt),
                      color: getLetterColor(opt),
                    }}
                  >
                    {opt.letter}
                  </div>
                  <span style={{ color: "#1a1a2e" }}>{opt.text}</span>
                </button>
              ))}
            </div>

            {/* Correct feedback */}
            {answered && answeredCorrectly && (
              <div
                style={{
                  borderRadius: 10,
                  padding: "14px 18px",
                  fontSize: "0.88rem",
                  lineHeight: 1.5,
                  background: "rgba(46,204,113,0.1)",
                  border: "1px solid #2ecc71",
                  color: "#1a7a4a",
                }}
              >
                <span style={{ marginRight: 6 }}>✅</span>
                <strong>¡Correcto!</strong> {subject.correctFeedback}
                <br />
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: 10,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  🤖 Explícamelo más, Yaris
                </button>
              </div>
            )}

            {/* Incorrect feedback */}
            {answered && !answeredCorrectly && (
              <div
                style={{
                  borderRadius: 10,
                  padding: "14px 18px",
                  fontSize: "0.88rem",
                  lineHeight: 1.5,
                  background: "rgba(231,76,60,0.08)",
                  border: "1px solid #e74c3c",
                  color: "#c0392b",
                }}
              >
                <span style={{ marginRight: 6 }}>❌</span>
                <strong>Incorrecto.</strong> {subject.incorrectFeedback}
                <br />
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: 10,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  🤖 No entendí, explícame Yaris
                </button>
              </div>
            )}
          </div>

          {/* 3. FLASHCARD */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 28,
              marginBottom: 20,
              boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(90,134,203,0.1)",
                color: "#5A86CB",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 16,
              }}
            >
              🃏 Flashcard de repaso
            </div>

            <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: 12 }}>
              Toca la tarjeta para ver la respuesta
            </p>

            {/* 3D Flip Card */}
            <div
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              style={{ perspective: "1000px", height: 180, cursor: "pointer", marginBottom: 16 }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  transition: "transform 0.6s",
                  transformStyle: "preserve-3d",
                  transform: flashcardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    backfaceVisibility: "hidden",
                    textAlign: "center",
                    background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
                    color: "white",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      opacity: 0.7,
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                    }}
                  >
                    Pregunta
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      lineHeight: 1.4,
                    }}
                  >
                    {subject.flashcardFront}
                  </h3>
                </div>

                {/* Back */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    backfaceVisibility: "hidden",
                    textAlign: "center",
                    background: "linear-gradient(135deg, #6C0820, #a01030)",
                    color: "white",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      opacity: 0.7,
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                    }}
                  >
                    Respuesta
                  </span>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{subject.flashcardBack}</p>
                </div>
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#aaa" }}>
              👆 Toca para voltear
            </p>
          </div>

          {/* NEXT TOPIC BUTTON */}
          {subject.nextTopicName && (
            <button
              style={{
                width: "100%",
                padding: 14,
                background: "#6C0820",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontFamily: "'DM Sans', sans-serif",
                marginTop: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#8a0a28";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(108,8,32,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#6C0820";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Siguiente tema: {subject.nextTopicName} →
            </button>
          )}
          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#bbb", marginTop: 8, marginBottom: 16 }}>
            Completa la actividad para continuar
          </p>
        </div>
      </div>
    </div>
  );
}
