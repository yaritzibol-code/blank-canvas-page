import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PathySVG, pad } from "../../contexts/StudyTimerContext";

export const Route = createFileRoute("/dashboard/estudiemos")({
  component: EstudemosJuntosPage,
});

/* ── Types ── */
type ActivityType = "calentamiento" | "vuelo" | "descanso" | "debriefing";
type ActivitySubtype = "contenido" | "flashcards" | "ciaac" | "explicaselo" | "descarga";

interface PlanActivity {
  id: string;
  type: ActivityType;
  subtype?: ActivitySubtype;
  duration: number;
  title: string;
  desc: string;
  icon: string;
  pathyMsg: string;
}

type FlowStep = "bienvenida" | "plan" | "sesion" | "completado";

/* ── Mock Data ── */
const FLASHCARDS = [
  { q: "¿Cuál es la clasificación de nubes altas según la OACI?", a: "Cirrus (Ci), Cirrocumulus (Cc) y Cirrostratus (Cs). Se forman por encima de los 6,000 m en latitudes medias." },
  { q: "¿Qué es un METAR y con qué frecuencia se emite?", a: "Mensaje de Observación Meteorológica de Aeródromo. Se emite cada 30 minutos (en horarios :20 y :50 UTC en México)." },
  { q: "¿Qué fenómeno indica TS en un TAF?", a: "Tormenta eléctrica (Thunderstorm). Implica condiciones IMC severas: turbulencia, granizo, cizalladura y visibilidad reducida." },
  { q: "¿Qué es la inversión de temperatura?", a: "Condición en la que la temperatura aumenta con la altitud. Favorece niebla, smog y acumulación de contaminantes. Peligrosa en despegue." },
  { q: "Define CAVOK y sus condiciones.", a: "Ceiling And Visibility OK. Visibilidad ≥10 km, sin nubes por debajo de 5,000 ft, sin CB en ninguna capa y sin fenómenos significativos." },
];

const CIAAC_QUESTIONS = [
  { q: "Un piloto observa cumulonimbus con cimas que superan los 40,000 ft. ¿Cuál es la acción MÁS SEGURA?", opts: ["Sobrevolar el CB a 1,000 ft por encima de la cima", "Rodear el CB a una distancia mínima de 20 NM", "Atravesar la base del CB a velocidad reducida", "Descender bajo la base del CB para evitar granizo"], correct: 1, exp: "Los cumulonimbus deben rodearse a mínimo 20 NM. Sobrevolarlos es imposible para la mayoría de aeronaves de aviación general y exponerse a turbulencia severa, granizo y cizalladura." },
  { q: "¿Qué condiciones meteorológicas favorecen la formación de niebla por radiación?", opts: ["Viento fuerte, cielo despejado y alta humedad relativa", "Viento en calma, cielo despejado, alta humedad y superficie fría", "Frente cálido activo con lluvias moderadas", "Inversión de temperatura en los niveles medios"], correct: 1, exp: "La niebla por radiación se forma con cielo despejado (enfriamiento radiativo máximo), viento en calma, alta humedad y superficie fría. El viento disipa la niebla." },
  { q: "¿Qué indica una presión QNH de 1013 hPa en el altímetro?", opts: ["El avión está en la altitud de presión estándar", "La presión al nivel del aeródromo es estándar ISA", "La presión al nivel del mar en el aeródromo coincide con ISA", "El QNH es siempre igual al QFE"], correct: 2, exp: "QNH es la presión ajustada al nivel del mar en las condiciones actuales del aeródromo. Cuando es 1013 hPa coincide con la atmósfera estándar ISA. Con QNH el altímetro indica altitud sobre el nivel del mar." },
];

const PATHY_QUESTIONS = [
  "Bien, empecemos. ¿Qué es exactamente un frente frío? Descríbelo con tus propias palabras, como si yo no supiera nada.",
  "Interesante. ¿Qué nubes y fenómenos meteorológicos PRECEDEN al paso de un frente frío?",
  "Muy bien. ¿Qué pasa DESPUÉS de que el frente cruzó el aeródromo? ¿Cómo cambian el viento, la temperatura y la visibilidad?",
  "Último reto: si ves en un TAF la sigla 'BECMG FM1200 VRB05KT TSRA BKN015CB', ¿qué le dirías al comandante?",
];

/* ── Plan Generator ── */
function makeAct(type: ActivityType, subtype: ActivitySubtype | undefined, duration: number, title: string, desc: string, icon: string, pathyMsg: string): PlanActivity {
  return { id: `${type}-${subtype ?? "none"}-${Math.random()}`, type, subtype, duration, title, desc, icon, pathyMsg };
}

function makePlan(totalMin: number): PlanActivity[] {
  if (totalMin <= 30) return [
    makeAct("calentamiento", "descarga", 5, "Descarga de Cabina", "Escribe todo lo que sabes de Meteorología en 5 minutos sin parar.", "🧠", "Antes de estudiar, activa lo que ya sabes. Escribe sin filtro — todo lo que te venga a la mente sobre Meteorología."),
    makeAct("vuelo", "contenido", 20, "Vuelo de Contenido", "Estudia el material: nubes, frentes y METAR.", "📖", "Enfócate en leer activamente. Subraya, anota dudas. En 20 minutos puedes cubrir 2-3 conceptos clave del CIAAC."),
    makeAct("debriefing", undefined, 5, "Debriefing", "3 preguntas rápidas para cerrar el vuelo y guardar en tu bitácora.", "📋", "¡Lo lograste! Antes de irte, revisemos qué llevamos en el equipaje de hoy."),
  ];

  if (totalMin <= 60) return [
    makeAct("calentamiento", "descarga", 10, "Descarga de Cabina", "Activa tu memoria: escribe todo lo que sabes de Meteorología.", "🧠", "El calentamiento cognitivo mejora la retención un 35%. ¡Escribe sin pensar, solo vuela!"),
    makeAct("vuelo", "contenido", 25, "Vuelo 1 — Contenido", "Estudia frentes y nubes: lee el material, anota conceptos clave.", "📖", "Primer vuelo del día. Lectura activa — cuando leas algo importante, pausa y escríbelo en tus propias palabras."),
    makeAct("descanso", undefined, 5, "Escala Técnica", "Levántate, toma agua, respira. Tu cerebro lo necesita.", "✈️", "Las escalas no son perder el tiempo — son cuando tu cerebro consolida lo que aprendió. ¡Levántate y camina 2 minutos!"),
    makeAct("vuelo", "flashcards", 15, "Vuelo 2 — Flashcards", "Repasa con tarjetas: METAR, CAVOK, tipos de niebla y nubes.", "🃏", "Las flashcards activan la recuperación activa — la herramienta más poderosa para el CIAAC. ¡Sin trampa!"),
    makeAct("debriefing", undefined, 5, "Debriefing", "3 preguntas de cierre para tu bitácora de vuelo.", "📋", "Aterrizaje suave. Tres preguntas rápidas y guardamos el vuelo de hoy."),
  ];

  if (totalMin <= 120) return [
    makeAct("calentamiento", "descarga", 10, "Descarga de Cabina", "Activa todo tu conocimiento previo de Meteorología.", "🧠", "Arrancamos con un volcado mental. Escribe sin filtro por 10 minutos — activa todas las conexiones neuronales."),
    makeAct("vuelo", "contenido", 25, "Vuelo 1 — Contenido", "Estudio profundo: frentes, masas de aire, nubes y fenómenos.", "📖", "Primer bloque de vuelo. Pausa cada 10 minutos para resumir en 2 frases. Lectura sin resumen no consolida."),
    makeAct("descanso", undefined, 5, "Escala 1", "Levántate, estira, hidratate.", "✈️", "Primera escala. Tu cerebro está procesando — no desperdicies este tiempo con el celular."),
    makeAct("vuelo", "flashcards", 20, "Vuelo 2 — Flashcards", "Recuperación activa con tarjetas de Meteorología CIAAC.", "🃏", "El secreto del CIAAC es la recuperación activa. ¿Cuántas puedes acertar sin ver la respuesta?"),
    makeAct("descanso", undefined, 5, "Escala 2", "Pausa activa — camina o haz respiración diafragmática.", "✈️", "Segunda escala. Esta pausa vale más que 5 minutos extra de estudio. Confía en el proceso."),
    makeAct("vuelo", "ciaac", 20, "Vuelo 3 — Alerta CIAAC", "Preguntas tipo examen real. Condiciones de simulacro.", "✈️", "Modo examen activado. Condiciones reales: tiempo límite, una sola oportunidad por pregunta. ¡Confía en lo que estudiaste!"),
    makeAct("descanso", undefined, 5, "Escala 3", "Última pausa antes del aterrizaje.", "✈️", "Queda poco. Respira y piensa en una cosa que aprendiste hoy."),
    makeAct("debriefing", undefined, 10, "Debriefing de vuelo", "Cierre reflexivo: ¿qué aprendí, qué fue difícil, qué repaso mañana?", "📋", "Aterrizaje. Este es el momento más importante — reflexionar consolida el aprendizaje."),
  ];

  if (totalMin <= 180) return [
    makeAct("calentamiento", "descarga", 15, "Descarga de Cabina", "Activa todo tu conocimiento previo de Meteorología.", "🧠", "Sesión larga hoy, piloto. El calentamiento es crucial — volcar lo que ya sabes prepara el terreno para lo nuevo."),
    makeAct("vuelo", "contenido", 30, "Vuelo 1 — Contenido profundo", "Lectura activa de frentes, nubes y METAR/TAF.", "📖", "Primer bloque largo. Pausa cada 15 minutos para resumir en 2 frases. Lectura sin resumen no consolida."),
    makeAct("descanso", undefined, 10, "Escala 1", "Pausa activa: camina, estira, toma agua.", "✈️", "Escala de 10 minutos — sal a caminar si puedes. El movimiento físico consolida la memoria a largo plazo."),
    makeAct("vuelo", "flashcards", 25, "Vuelo 2 — Flashcards intensivo", "Recuperación activa: METAR, nubes, frentes, CAVOK, vientos.", "🃏", "Bloque de flashcards. Si no sabes la respuesta, la tensión es buena — el esfuerzo crea la memoria."),
    makeAct("descanso", undefined, 10, "Escala 2", "Descansa — hidratate y ventila el espacio.", "✈️", "Segunda escala. Cierra los ojos 2 minutos y deja que tu cerebro procese."),
    makeAct("vuelo", "ciaac", 25, "Vuelo 3 — Simulacro CIAAC", "Preguntas de examen real. Tiempo límite. Sin ayudas.", "✈️", "Modo examen activado. Condiciones reales: tiempo límite, una sola oportunidad por pregunta."),
    makeAct("descanso", undefined, 10, "Escala 3", "Penúltima pausa.", "✈️", "Tu cerebro está al límite. Dale el descanso que merece."),
    makeAct("vuelo", "explicaselo", 25, "Vuelo 4 — Explícaselo a Pathy", "Enséñame lo que aprendiste. Yo hago las preguntas difíciles.", "🤖", "El método de enseñanza es el más efectivo para detectar vacíos. Si puedes explicarlo, lo sabes."),
    makeAct("descanso", undefined, 5, "Última escala", "Un minuto de respiración profunda.", "✈️", "Casi en casa. Respira antes del debriefing final."),
    makeAct("debriefing", undefined, 15, "Debriefing completo", "Reflexión profunda de la sesión. Guardamos en tu bitácora.", "📋", "Aterrizaje completo. Con una sesión tan larga, el debriefing es clave para consolidar todo lo que viviste."),
  ];

  // Modo CIAAC — 5 horas
  return [
    makeAct("calentamiento", "descarga", 20, "Descarga de Cabina CIAAC", "Activa todo tu conocimiento previo durante 20 minutos.", "🧠", "Modo CIAAC activado. Esta es la simulación más cercana al examen real. El calentamiento prepara tu mente para un vuelo largo."),
    makeAct("vuelo", "contenido", 45, "Bloque 1 — Revisión de contenido", "Repasa manuales, apuntes y conceptos clave de Meteorología.", "📖", "Primer bloque largo. Lectura activa con pausas cada 15 minutos. Hoy cubrimos el temario completo."),
    makeAct("descanso", undefined, 15, "Escala 1 — 15 min", "Sal a caminar. Hidratate. No toques el celular.", "✈️", "15 minutos reales — sal a caminar al menos 5 minutos."),
    makeAct("vuelo", "flashcards", 40, "Bloque 2 — Flashcards exhaustivas", "Todos los conceptos METAR, TAF, nubes, frentes, vientos.", "🃏", "Bloque de recuperación activa intensivo. El CIAAC tiene 120 preguntas — entrenamos velocidad y precisión."),
    makeAct("descanso", undefined, 15, "Escala 2", "Pausa activa. Come algo ligero si es necesario.", "✈️", "Tu glucosa cerebral necesita reponerse. Un snack ligero aquí es válido."),
    makeAct("vuelo", "ciaac", 50, "Bloque 3 — Simulacro CIAAC completo", "Modo examen real: preguntas con tiempo límite.", "✈️", "Simulacro de máxima intensidad. Condiciones 100% reales. Confianza en lo que estudiaste."),
    makeAct("descanso", undefined, 20, "Escala 3 — Descanso largo", "20 minutos completos. Sal, camina, desconéctate.", "✈️", "Después del simulacro tu cerebro necesita procesar. No estudies — descansa de verdad."),
    makeAct("vuelo", "explicaselo", 45, "Bloque 4 — Explícaselo a Pathy", "Enseña todo lo que sabes. Yo defiendo, pregunto y evalúo.", "🤖", "El bloque más poderoso del día. Enseñar es la prueba final del conocimiento. Aquí detectamos los últimos vacíos."),
    makeAct("descanso", undefined, 15, "Escala 4", "Descansa antes del debriefing final.", "✈️", "Cuarta y penúltima escala. Estás muy cerca de completar el Modo CIAAC. Respira."),
    makeAct("debriefing", undefined, 25, "Debriefing CIAAC completo", "Análisis profundo: fortalezas, debilidades, plan de mañana.", "📋", "Aterrizaje del Modo CIAAC. Este debriefing es tan importante como el vuelo. Sé honesto contigo mismo."),
  ];
}

function actColor(a: PlanActivity) {
  if (a.type === "calentamiento") return "#b45309";
  if (a.type === "debriefing") return "#7c3aed";
  if (a.type === "descanso") return "#059669";
  if (a.subtype === "ciaac") return "#d97706";
  if (a.subtype === "explicaselo") return "#3D5D91";
  if (a.subtype === "flashcards") return "#db2777";
  return "#3D5D91";
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
function EstudemosJuntosPage() {
  const [flowStep, setFlowStep] = useState<FlowStep>("bienvenida");
  const [selectedMin, setSelectedMin] = useState(60);
  const [customMin, setCustomMin] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [plan, setPlan] = useState<PlanActivity[]>([]);
  const [actIdx, setActIdx] = useState(0);
  const [actSecs, setActSecs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [dcText, setDcText] = useState("");
  const [fcIdx, setFcIdx] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [fcCorrect, setFcCorrect] = useState<boolean[]>([]);
  const [ciaacQ, setCiaacQ] = useState(0);
  const [ciaacAnswer, setCiaacAnswer] = useState<number | null>(null);
  const [ciaacResults, setCiaacResults] = useState<{ correct: boolean }[]>([]);
  const [pathyStep, setPathyStep] = useState(0);
  const [pathyInput, setPathyInput] = useState("");
  const [pathyResponses, setPathyResponses] = useState<string[]>([]);
  const [debriefing, setDebriefing] = useState({ aprendiste: "", dificil: "", repasar: "" });

  const actTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalElapsedRef = useRef(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flowStep !== "sesion" || isPaused) {
      clearInterval(actTimerRef.current!);
      actTimerRef.current = null;
      return;
    }
    actTimerRef.current = setInterval(() => {
      setActSecs(s => s + 1);
      totalElapsedRef.current += 1;
      setTotalElapsed(totalElapsedRef.current);
    }, 1000);
    return () => clearInterval(actTimerRef.current!);
  }, [flowStep, isPaused, actIdx]);

  useEffect(() => {
    setActSecs(0);
    setFcIdx(0); setFcFlipped(false);
    setCiaacQ(0); setCiaacAnswer(null);
    setPathyStep(0); setPathyInput(""); setPathyResponses([]);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [actIdx]);

  function startPlan() {
    const minutes = showCustom && customMin ? Math.max(10, parseInt(customMin) || 60) : selectedMin;
    setPlan(makePlan(minutes));
    setActIdx(0); setActSecs(0);
    setFlowStep("plan");
  }

  function startSession() {
    setIsPaused(false);
    setFlowStep("sesion");
  }

  function advanceActivity() {
    if (actIdx < plan.length - 1) setActIdx(i => i + 1);
    else setFlowStep("completado");
  }

  function endSession() {
    clearInterval(actTimerRef.current!);
    setFlowStep("completado");
  }

  const currentAct = plan[actIdx];
  const actPct = currentAct ? Math.min(100, (actSecs / (currentAct.duration * 60)) * 100) : 0;
  const actMinRem = currentAct ? Math.max(0, currentAct.duration * 60 - actSecs) : 0;

  if (flowStep === "bienvenida") return (
    <BienvenidaScreen
      selectedMin={selectedMin} setSelectedMin={setSelectedMin}
      showCustom={showCustom} setShowCustom={setShowCustom}
      customMin={customMin} setCustomMin={setCustomMin}
      onContinue={startPlan}
    />
  );

  if (flowStep === "plan") return (
    <PlanScreen
      plan={plan}
      onStart={startSession}
      onBack={() => setFlowStep("bienvenida")}
    />
  );

  if (flowStep === "sesion" && currentAct) return (
    <SesionScreen
      plan={plan} actIdx={actIdx} currentAct={currentAct}
      actSecs={actSecs} actPct={actPct} actMinRem={actMinRem}
      isPaused={isPaused} setIsPaused={setIsPaused}
      totalElapsed={totalElapsed}
      dcText={dcText} setDcText={setDcText}
      fcIdx={fcIdx} setFcIdx={setFcIdx}
      fcFlipped={fcFlipped} setFcFlipped={setFcFlipped}
      fcCorrect={fcCorrect} setFcCorrect={setFcCorrect}
      ciaacQ={ciaacQ} setCiaacQ={setCiaacQ}
      ciaacAnswer={ciaacAnswer} setCiaacAnswer={setCiaacAnswer}
      ciaacResults={ciaacResults} setCiaacResults={setCiaacResults}
      pathyStep={pathyStep} setPathyStep={setPathyStep}
      pathyInput={pathyInput} setPathyInput={setPathyInput}
      pathyResponses={pathyResponses} setPathyResponses={setPathyResponses}
      debriefing={debriefing} setDebriefing={setDebriefing}
      contentRef={contentRef}
      onNext={advanceActivity}
      onEnd={endSession}
    />
  );

  return (
    <CompletadoScreen
      plan={plan} totalElapsed={totalElapsed}
      debriefing={debriefing} setDebriefing={setDebriefing}
      ciaacResults={ciaacResults} fcCorrect={fcCorrect}
      onRestart={() => {
        setFlowStep("bienvenida"); setPlan([]); setActIdx(0); setActSecs(0);
        totalElapsedRef.current = 0; setTotalElapsed(0);
        setDcText(""); setFcCorrect([]); setCiaacResults([]);
        setDebriefing({ aprendiste: "", dificil: "", repasar: "" });
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   BIENVENIDA SCREEN
═══════════════════════════════════════════════════════════ */
function BienvenidaScreen({ selectedMin, setSelectedMin, showCustom, setShowCustom, customMin, setCustomMin, onContinue }: {
  selectedMin: number; setSelectedMin: (n: number) => void;
  showCustom: boolean; setShowCustom: (v: boolean) => void;
  customMin: string; setCustomMin: (v: string) => void;
  onContinue: () => void;
}) {
  const options = [
    { min: 30, label: "30 min", desc: "Sesión exprés", icon: "⚡", color: "#3D5D91" },
    { min: 60, label: "1 hora", desc: "Sesión estándar", icon: "📚", color: "#3D5D91", recommended: true },
    { min: 120, label: "2 horas", desc: "Sesión profunda", icon: "🎯", color: "#6C0820" },
    { min: 180, label: "3 horas", desc: "Maratón de estudio", icon: "🔥", color: "#b45309" },
    { min: 300, label: "Modo CIAAC", desc: "Simulación completa 5h", icon: "✈️", color: "#059669" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 700, margin: "0 auto" }}>
      {/* Pathy greeting */}
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 20, padding: "28px 28px 24px", marginBottom: 24, boxShadow: "0 4px 24px rgba(61,93,145,.08)" }}>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, animation: "fp-float 2.5s ease-in-out infinite" }}>
            <PathySVG size={72} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 10, lineHeight: 1.25 }}>
              ¡Listo para despegar, piloto! ✈️
            </div>
            <p style={{ fontSize: 14.5, color: "#444", lineHeight: 1.7, marginBottom: 14 }}>
              Soy <strong>Pathy</strong>, tu copiloto de estudio. Hoy me encargo de construir tu <strong>Plan de Vuelo</strong> completo — tú solo dime cuánto tiempo tienes y yo me encargo del resto.
            </p>
            <div style={{ background: "#f0f4fb", border: "1px solid rgba(61,93,145,.12)", borderRadius: 10, padding: "11px 15px", fontSize: 13.5, color: "#3D5D91", fontWeight: 500 }}>
              📌 Hoy Pathy recomienda: <strong>Meteorología — Frentes y nubes</strong> · Llevas 4 días sin repasarla
            </div>
          </div>
        </div>
      </div>

      {/* Time selector */}
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 18, padding: "24px 24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "#aaa", marginBottom: 16 }}>
          ¿Cuánto tiempo tienes hoy?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {options.map(opt => (
            <button key={opt.min}
              onClick={() => { setSelectedMin(opt.min); setShowCustom(false); }}
              style={{
                border: `${selectedMin === opt.min && !showCustom ? 2 : 1.5}px solid ${selectedMin === opt.min && !showCustom ? opt.color : "rgba(61,93,145,.12)"}`,
                borderRadius: 12, padding: "14px 16px",
                background: selectedMin === opt.min && !showCustom ? `${opt.color}0d` : "white",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                transition: "all .18s", position: "relative",
              }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: selectedMin === opt.min && !showCustom ? opt.color : "#1a1a2e" }}>{opt.label}</div>
                <div style={{ fontSize: 11.5, color: "#aaa", marginTop: 2 }}>{opt.desc}</div>
              </div>
              {opt.recommended && (
                <span style={{ fontSize: 9.5, fontWeight: 700, color: "#3D5D91", background: "#e8eef7", borderRadius: 99, padding: "3px 8px", flexShrink: 0 }}>★ Recomendado</span>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(v => !v)}
            style={{
              border: `${showCustom ? 2 : 1.5}px solid ${showCustom ? "#3D5D91" : "rgba(61,93,145,.12)"}`,
              borderRadius: 12, padding: "14px 16px",
              background: showCustom ? "#e8eef7" : "white",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 12, textAlign: "left",
              transition: "all .18s",
            }}>
            <span style={{ fontSize: 24 }}>⏱️</span>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: showCustom ? "#3D5D91" : "#1a1a2e" }}>Personalizado</div>
              <div style={{ fontSize: 11.5, color: "#aaa", marginTop: 2 }}>Elige tus minutos</div>
            </div>
          </button>
        </div>

        {showCustom && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#f8f9fc", borderRadius: 10, border: "1px solid rgba(61,93,145,.1)", marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: "#888", flexShrink: 0 }}>Duración:</span>
            <input
              type="number" min={10} max={480}
              value={customMin}
              onChange={e => setCustomMin(e.target.value)}
              placeholder="ej. 45"
              style={{ flex: 1, border: "1px solid rgba(61,93,145,.2)", borderRadius: 8, padding: "9px 12px", fontSize: 15, fontWeight: 700, color: "#1a1a2e", background: "white", fontFamily: "'DM Sans', sans-serif", outline: "none", maxWidth: 100 }}
            />
            <span style={{ fontSize: 13, color: "#888" }}>minutos</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        style={{ width: "100%", background: "linear-gradient(135deg, #3D5D91 0%, #5A86CB 100%)", color: "white", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 6px 24px rgba(61,93,145,.3)", transition: "opacity .2s" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >
        <PathySVG size={28} overlay />
        Ver mi Plan de Vuelo →
      </button>
      <div style={{ textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 10 }}>
        Pathy construirá tu plan cognitivo completo en segundos ✨
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLAN SCREEN
═══════════════════════════════════════════════════════════ */
function PlanScreen({ plan, onStart, onBack }: { plan: PlanActivity[]; onStart: () => void; onBack: () => void; }) {
  const totalMin = plan.reduce((s, a) => s + a.duration, 0);
  const vuelos = plan.filter(a => a.type === "vuelo").length;
  const escalas = plan.filter(a => a.type === "descanso").length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0d1f38 100%)", borderRadius: 18, padding: "24px 28px", marginBottom: 20, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ animation: "fp-float 2.5s ease-in-out infinite", flexShrink: 0 }}>
            <PathySVG size={60} overlay />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.45)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>✈️ Tu Plan de Vuelo está listo</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
              Sesión de Meteorología
            </div>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.65)", lineHeight: 1.6 }}>
              Preparé un plan con <strong style={{ color: "white" }}>{vuelos} vuelos de estudio</strong>, {escalas} escalas técnicas y debriefing. Duración total: <strong style={{ color: "white" }}>{totalMin} min</strong>.
            </p>
          </div>
        </div>
        {/* Stats strip */}
        <div style={{ display: "flex", gap: 16, marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.1)" }}>
          {[
            { label: "Actividades", value: plan.length, icon: "📋" },
            { label: "Vuelos", value: vuelos, icon: "✈️" },
            { label: "Escalas", value: escalas, icon: "⏸️" },
            { label: "Minutos totales", value: totalMin, icon: "⏱️" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "white" }}>{s.value}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 16, padding: "20px 24px", marginBottom: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "#aaa", marginBottom: 16 }}>Itinerario de vuelo</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {plan.map((act, i) => {
            const color = actColor(act);
            const isLast = i === plan.length - 1;
            return (
              <div key={act.id} style={{ display: "flex", gap: 16, paddingBottom: isLast ? 0 : 4 }}>
                {/* Timeline connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 32 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${color}15`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                    {act.icon}
                  </div>
                  {!isLast && <div style={{ width: 2, flex: 1, minHeight: 12, background: "rgba(61,93,145,.08)", margin: "4px 0" }} />}
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingBottom: isLast ? 0 : 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{act.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}12`, padding: "2px 8px", borderRadius: 99 }}>
                      {act.duration} min
                    </span>
                    {act.type === "descanso" && (
                      <span style={{ fontSize: 10.5, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Escala</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#888", marginTop: 3, lineHeight: 1.5 }}>{act.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack}
          style={{ padding: "14px 20px", background: "white", border: "1.5px solid rgba(61,93,145,.15)", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(61,93,145,.15)"; e.currentTarget.style.color = "#888"; }}>
          ← Cambiar duración
        </button>
        <button onClick={onStart}
          style={{ flex: 1, background: "linear-gradient(135deg, #3D5D91 0%, #5A86CB 100%)", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(61,93,145,.3)", transition: "opacity .2s" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Iniciar vuelo ✈️
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SESION SCREEN
═══════════════════════════════════════════════════════════ */
interface SesionProps {
  plan: PlanActivity[]; actIdx: number; currentAct: PlanActivity;
  actSecs: number; actPct: number; actMinRem: number;
  isPaused: boolean; setIsPaused: (v: boolean) => void;
  totalElapsed: number;
  dcText: string; setDcText: (v: string) => void;
  fcIdx: number; setFcIdx: (v: number) => void;
  fcFlipped: boolean; setFcFlipped: (v: boolean) => void;
  fcCorrect: boolean[]; setFcCorrect: (v: boolean[]) => void;
  ciaacQ: number; setCiaacQ: (v: number) => void;
  ciaacAnswer: number | null; setCiaacAnswer: (v: number | null) => void;
  ciaacResults: { correct: boolean }[]; setCiaacResults: (v: { correct: boolean }[]) => void;
  pathyStep: number; setPathyStep: (v: number) => void;
  pathyInput: string; setPathyInput: (v: string) => void;
  pathyResponses: string[]; setPathyResponses: (v: string[]) => void;
  debriefing: { aprendiste: string; dificil: string; repasar: string };
  setDebriefing: (v: { aprendiste: string; dificil: string; repasar: string }) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  onNext: () => void; onEnd: () => void;
}

function SesionScreen(props: SesionProps) {
  const { plan, actIdx, currentAct, actSecs, actPct, actMinRem, isPaused, setIsPaused, totalElapsed, contentRef, onNext, onEnd } = props;
  const color = actColor(currentAct);
  const isLast = actIdx === plan.length - 1;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

      {/* ── LEFT: Main content ── */}
      <div>
        {/* Activity header */}
        <div style={{ background: "white", border: `2px solid ${color}25`, borderTop: `4px solid ${color}`, borderRadius: 16, padding: "20px 22px", marginBottom: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 28 }}>{currentAct.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color, marginBottom: 3 }}>
                Actividad {actIdx + 1} de {plan.length}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#1a1a2e" }}>{currentAct.title}</div>
            </div>
            {/* Pause/resume */}
            <button onClick={() => setIsPaused(!isPaused)}
              style={{ border: `1px solid ${isPaused ? "#d97706" : "rgba(61,93,145,.2)"}`, borderRadius: 10, padding: "8px 14px", background: isPaused ? "#fffbeb" : "white", color: isPaused ? "#d97706" : "#888", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              {isPaused ? <>▶ Reanudar</> : <>⏸ Pausar</>}
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ height: 5, background: "rgba(61,93,145,.08)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", background: color, borderRadius: 99, width: `${actPct}%`, transition: "width 1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#aaa" }}>
            <span>{pad(Math.floor(actSecs / 60))}:{pad(actSecs % 60)} transcurridos</span>
            <span style={{ color: actMinRem < 60 ? "#d97706" : "#aaa", fontWeight: actMinRem < 60 ? 700 : 400 }}>
              {pad(Math.floor(actMinRem / 60))}:{pad(actMinRem % 60)} restantes
            </span>
          </div>
        </div>

        {/* Activity content */}
        <div ref={contentRef} style={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto" }}>
          <ActivityView {...props} />
        </div>

        {/* Next button */}
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button onClick={onEnd}
            style={{ padding: "13px 18px", background: "white", border: "1.5px solid rgba(220,38,38,.2)", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#ef4444", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Finalizar sesión
          </button>
          <button onClick={onNext}
            style={{ flex: 1, background: isLast ? "linear-gradient(135deg, #7c3aed, #a855f7)" : `linear-gradient(135deg, ${color}, ${color}cc)`, color: "white", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 16px ${color}35`, transition: "opacity .2s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            {isLast ? "Completar vuelo ✈️" : `Siguiente: ${plan[actIdx + 1]?.title} →`}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Sidebar ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Pathy message */}
        <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0d1f38)", borderRadius: 14, padding: "16px 18px", color: "white" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, animation: "fp-float 2.5s ease-in-out infinite" }}>
              <PathySVG size={38} overlay />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5 }}>Pathy dice</div>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", lineHeight: 1.65 }}>{currentAct.pathyMsg}</p>
            </div>
          </div>
        </div>

        {/* Session stats */}
        <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#aaa", marginBottom: 12 }}>Sesión de hoy</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, color: "#888" }}>Tiempo total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3D5D91" }}>{pad(Math.floor(totalElapsed / 60))}:{pad(totalElapsed % 60)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12.5, color: "#888" }}>Progreso del plan</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3D5D91" }}>{actIdx + 1}/{plan.length}</span>
          </div>
          <div style={{ height: 4, background: "rgba(61,93,145,.08)", borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#3D5D91", borderRadius: 99, width: `${((actIdx + 1) / plan.length) * 100}%`, transition: "width .4s ease" }} />
          </div>
        </div>

        {/* Plan timeline mini */}
        <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#aaa", marginBottom: 12 }}>Plan de vuelo</div>
          {plan.map((act, i) => {
            const c = actColor(act);
            const isDone = i < actIdx;
            const isCurrent = i === actIdx;
            return (
              <div key={act.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: i < plan.length - 1 ? "1px solid rgba(61,93,145,.05)" : "none", opacity: isDone ? 0.45 : 1 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isCurrent ? c : isDone ? "#4ade80" : "rgba(61,93,145,.15)"}`, background: isDone ? "#4ade8018" : isCurrent ? `${c}12` : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
                  {isDone ? "✓" : act.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? c : isDone ? "#aaa" : "#444", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{act.title}</div>
                </div>
                <span style={{ fontSize: 10.5, color: "#ccc", flexShrink: 0 }}>{act.duration}m</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Activity View router ── */
function ActivityView(props: SesionProps) {
  const { currentAct } = props;
  if (currentAct.subtype === "descarga" || currentAct.type === "calentamiento") return <CalentamientoView {...props} />;
  if (currentAct.subtype === "flashcards") return <FlashcardsView {...props} />;
  if (currentAct.subtype === "ciaac") return <CIAACView {...props} />;
  if (currentAct.subtype === "explicaselo") return <ExplicaseloView {...props} />;
  if (currentAct.type === "descanso") return <DescansoView {...props} />;
  if (currentAct.type === "debriefing") return <DebriefingView {...props} />;
  return <ContenidoView {...props} />;
}

/* ── Calentamiento (Descarga de Cabina) ── */
function CalentamientoView({ dcText, setDcText }: SesionProps) {
  return (
    <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>🧠 Descarga de Cabina</div>
        <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65 }}>
          Escribe <strong>todo lo que ya sabes</strong> sobre Meteorología. Sin filtros, sin orden, sin buscar — solo deja que fluya. El objetivo es activar tu memoria antes de estudiar.
        </p>
      </div>
      <textarea
        value={dcText}
        onChange={e => setDcText(e.target.value)}
        placeholder="Escribe aquí todo lo que recuerdas: nubes, frentes, METAR, vientos, presión... ¡todo vale!"
        style={{ width: "100%", minHeight: 220, border: "1.5px solid rgba(61,93,145,.15)", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", resize: "vertical", background: "#fafbfd", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }}
        onFocus={e => { e.target.style.borderColor = "#3D5D91"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(61,93,145,.15)"; }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#ccc" }}>
        <span>Sin límite — escribe todo</span>
        <span>{dcText.length} caracteres · {dcText.split(/\s+/).filter(Boolean).length} palabras</span>
      </div>
    </div>
  );
}

/* ── Contenido ── */
function ContenidoView({ currentAct }: SesionProps) {
  const topics = [
    { title: "Frentes atmosféricos", items: ["Frente frío: avance rápido, Cb, chubascos", "Frente cálido: avance lento, As/Ns, lluvia continua", "Frente ocluido: frío alcanza al cálido, lluvia prolongada"] },
    { title: "Tipos de nubes OACI", items: ["Altas (>6,000m): Ci, Cc, Cs", "Medias (2,000-6,000m): Ac, As", "Bajas (<2,000m): St, Sc, Ns", "Desarrollo vertical: Cu, Cb"] },
    { title: "METAR/TAF — Claves CIAAC", items: ["CAVOK: vis≥10km, sin nubes<5,000ft, sin Wx sig", "TSRA: Tormenta + lluvia (indicador crítico)", "BKN/OVC: >5 octas — condición IMC", "BECMG/TEMPO: cambios previstos en TAF"] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {topics.map((topic, i) => (
        <div key={i} style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#3D5D91", color: "white", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
            {topic.title}
          </div>
          {topic.items.map((item, j) => (
            <div key={j} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: j < topic.items.length - 1 ? "1px solid rgba(61,93,145,.06)" : "none" }}>
              <span style={{ color: "#3D5D91", fontWeight: 700, flexShrink: 0, fontSize: 13 }}>→</span>
              <span style={{ fontSize: 13.5, color: "#444", lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#92400e" }}>
        💡 <strong>Tip de Pathy:</strong> Después de cada sección, cierra los ojos y trata de recordar los 3 puntos más importantes. La recuperación activa triplica la retención.
      </div>
    </div>
  );
}

/* ── Flashcards ── */
function FlashcardsView({ fcIdx, setFcIdx, fcFlipped, setFcFlipped, fcCorrect, setFcCorrect, onNext }: SesionProps) {
  const card = FLASHCARDS[fcIdx];
  const remaining = FLASHCARDS.length - fcIdx;
  const correctCount = fcCorrect.filter(Boolean).length;

  function handleAnswer(correct: boolean) {
    setFcCorrect([...fcCorrect, correct]);
    if (fcIdx < FLASHCARDS.length - 1) {
      setFcIdx(fcIdx + 1);
      setFcFlipped(false);
    } else {
      onNext();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Score */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🃏</span>
          <div>
            <div style={{ fontSize: 11, color: "#aaa" }}>Tarjeta</div>
            <div style={{ fontWeight: 700, color: "#1a1a2e" }}>{fcIdx + 1} / {FLASHCARDS.length}</div>
          </div>
        </div>
        <div style={{ flex: 1, background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontSize: 11, color: "#aaa" }}>Correctas</div>
            <div style={{ fontWeight: 700, color: "#16a34a" }}>{correctCount}</div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setFcFlipped(!fcFlipped)}
        style={{ background: fcFlipped ? "linear-gradient(135deg, #1a1a2e, #0d1f38)" : "white", border: `2px solid ${fcFlipped ? "rgba(90,134,203,.3)" : "rgba(61,93,145,.12)"}`, borderRadius: 16, padding: "28px 24px", minHeight: 180, cursor: "pointer", boxShadow: "0 4px 20px rgba(61,93,145,.1)", transition: "all .3s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: fcFlipped ? "rgba(255,255,255,.35)" : "#aaa", marginBottom: 16 }}>
          {fcFlipped ? "✓ Respuesta" : "❓ Pregunta"} · toca para {fcFlipped ? "ocultar" : "revelar"}
        </div>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: fcFlipped ? "rgba(255,255,255,.85)" : "#1a1a2e", fontWeight: fcFlipped ? 400 : 600 }}>
          {fcFlipped ? card.a : card.q}
        </p>
      </div>

      {/* Answer buttons (only when flipped) */}
      {fcFlipped && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => handleAnswer(false)}
            style={{ flex: 1, border: "2px solid #fca5a5", borderRadius: 12, padding: "13px", background: "#fef2f2", color: "#dc2626", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            ✗ No lo sabía
          </button>
          <button onClick={() => handleAnswer(true)}
            style={{ flex: 1, border: "2px solid #86efac", borderRadius: 12, padding: "13px", background: "#f0fdf4", color: "#16a34a", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            ✓ Lo sabía
          </button>
        </div>
      )}

      {!fcFlipped && (
        <div style={{ textAlign: "center", fontSize: 12.5, color: "#ccc" }}>
          Toca la tarjeta para ver la respuesta
        </div>
      )}
    </div>
  );
}

/* ── CIAAC ── */
function CIAACView({ ciaacQ, setCiaacQ, ciaacAnswer, setCiaacAnswer, ciaacResults, setCiaacResults, onNext }: SesionProps) {
  const q = CIAAC_QUESTIONS[ciaacQ];
  const answered = ciaacAnswer !== null;
  const isCorrect = ciaacAnswer === q.correct;

  function handleSelect(idx: number) {
    if (answered) return;
    setCiaacAnswer(idx);
    setCiaacResults([...ciaacResults, { correct: idx === q.correct }]);
  }

  function handleNext() {
    if (ciaacQ < CIAAC_QUESTIONS.length - 1) {
      setCiaacQ(ciaacQ + 1);
      setCiaacAnswer(null);
    } else {
      onNext();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 6, background: "rgba(61,93,145,.08)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#d97706", borderRadius: 99, width: `${((ciaacQ + 1) / CIAAC_QUESTIONS.length) * 100}%`, transition: "width .4s ease" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706", flexShrink: 0 }}>{ciaacQ + 1}/{CIAAC_QUESTIONS.length}</span>
      </div>

      {/* Question */}
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#d97706", marginBottom: 10 }}>✈ Pregunta CIAAC</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.65 }}>{q.q}</p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.opts.map((opt, i) => {
          let bg = "white", border = "1.5px solid rgba(61,93,145,.12)", color = "#444";
          if (answered) {
            if (i === q.correct) { bg = "#f0fdf4"; border = "2px solid #4ade80"; color = "#166534"; }
            else if (i === ciaacAnswer && !isCorrect) { bg = "#fef2f2"; border = "2px solid #f87171"; color = "#dc2626"; }
          } else if (ciaacAnswer === i) {
            border = "2px solid #3D5D91"; bg = "#e8eef7";
          }
          return (
            <button key={i} onClick={() => handleSelect(i)}
              style={{ border, borderRadius: 12, padding: "13px 16px", background: bg, color, cursor: answered ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, textAlign: "left", transition: "all .2s", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 700, flexShrink: 0, width: 20 }}>{["A", "B", "C", "D"][i]}.</span>
              <span style={{ lineHeight: 1.5 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div style={{ background: isCorrect ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isCorrect ? "#86efac" : "#fca5a5"}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontWeight: 700, color: isCorrect ? "#166534" : "#dc2626", marginBottom: 6 }}>
            {isCorrect ? "✓ ¡Correcto!" : "✗ Incorrecto"}
          </div>
          <p style={{ fontSize: 13, color: isCorrect ? "#166534" : "#991b1b", lineHeight: 1.65 }}>{q.exp}</p>
        </div>
      )}

      {answered && (
        <button onClick={handleNext}
          style={{ background: "#d97706", color: "white", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          {ciaacQ < CIAAC_QUESTIONS.length - 1 ? "Siguiente pregunta →" : "Completar CIAAC ✓"}
        </button>
      )}
    </div>
  );
}

/* ── Explícaselo a Pathy ── */
function ExplicaseloView({ pathyStep, setPathyStep, pathyInput, setPathyInput, pathyResponses, setPathyResponses, onNext }: SesionProps) {
  const q = PATHY_QUESTIONS[pathyStep];
  const done = pathyStep >= PATHY_QUESTIONS.length;

  function submit() {
    const text = pathyInput.trim();
    if (!text) return;
    setPathyResponses([...pathyResponses, text]);
    setPathyInput("");
    if (pathyStep < PATHY_QUESTIONS.length - 1) setPathyStep(pathyStep + 1);
    else setPathyStep(PATHY_QUESTIONS.length);
  }

  if (done) return (
    <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "28px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
      <div style={{ animation: "fp-float 2.5s ease-in-out infinite", display: "inline-block", marginBottom: 16 }}>
        <PathySVG size={72} />
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>¡Excelente explicación, piloto!</div>
      <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65, marginBottom: 20 }}>
        Respondiste {pathyResponses.length} preguntas de Pathy. La capacidad de explicar un concepto es la prueba definitiva de que lo dominas para el CIAAC.
      </p>
      <button onClick={onNext}
        style={{ background: "linear-gradient(135deg, #3D5D91, #5A86CB)", color: "white", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
        Continuar →
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Progress */}
      <div style={{ display: "flex", gap: 6 }}>
        {PATHY_QUESTIONS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < pathyStep ? "#3D5D91" : i === pathyStep ? "#5A86CB" : "rgba(61,93,145,.1)" }} />
        ))}
      </div>

      {/* Pathy question */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0d1f38)", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0, animation: "fp-float 2.5s ease-in-out infinite" }}>
          <PathySVG size={48} overlay />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Pathy pregunta ({pathyStep + 1}/{PATHY_QUESTIONS.length})</div>
          <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.85)", lineHeight: 1.65 }}>{q}</p>
        </div>
      </div>

      {/* Previous responses */}
      {pathyResponses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pathyResponses.map((r, i) => (
            <div key={i} style={{ background: "#f8f9fc", border: "1px solid rgba(61,93,145,.1)", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, color: "#444", lineHeight: 1.6, opacity: 0.65 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginRight: 8 }}>Tu respuesta {i + 1}:</span>
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ background: "white", border: "1px solid rgba(61,93,145,.12)", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
        <textarea
          value={pathyInput}
          onChange={e => setPathyInput(e.target.value)}
          placeholder="Explícale a Pathy con tus propias palabras..."
          rows={5}
          style={{ width: "100%", border: "none", padding: "16px 18px", fontSize: 14, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", resize: "none", background: "transparent", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }}
        />
        <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(61,93,145,.08)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={submit}
            style={{ background: "#3D5D91", color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Enviar respuesta →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Descanso ── */
function DescansoView({ actMinRem }: SesionProps) {
  const tips = [
    "Levántate de la silla y camina 2 minutos — activa la circulación.",
    "Toma agua. La hidratación mejora la concentración hasta un 20%.",
    "Mira a 6 metros de distancia durante 30 segundos — descansa tus ojos.",
    "Respira profundo: 4 segundos inhala, 7 retienes, 8 exhalas.",
    "Estira cuello y hombros — la postura afecta tu concentración.",
  ];
  const tip = tips[Math.floor(Date.now() / 10000) % tips.length];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "white", border: "1px solid rgba(5,150,105,.2)", borderRadius: 16, padding: "28px 24px", textAlign: "center", boxShadow: "0 2px 12px rgba(5,150,105,.08)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.5rem", fontWeight: 700, color: "#059669", letterSpacing: -2, lineHeight: 1 }}>
          {pad(Math.floor(actMinRem / 60))}:{pad(actMinRem % 60)}
        </div>
        <div style={{ fontSize: 13, color: "#059669", opacity: .65, marginTop: 6, letterSpacing: ".08em" }}>ESCALA TÉCNICA — DESCANSA</div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #059669, #10b981)", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ animation: "fp-float 2.5s ease-in-out infinite", flexShrink: 0 }}>
          <PathySVG size={44} overlay />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Pathy recomienda</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.9)", lineHeight: 1.65, fontWeight: 500 }}>{tip}</p>
        </div>
      </div>

      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#166534", lineHeight: 1.65 }}>
        Las escalas técnicas no son tiempo perdido — son cuando tu cerebro consolida lo que acaba de aprender. Honra la pausa y el siguiente vuelo será más efectivo.
      </div>
    </div>
  );
}

/* ── Debriefing ── */
function DebriefingView({ debriefing, setDebriefing, onNext }: SesionProps) {
  const questions = [
    { key: "aprendiste" as const, label: "¿Qué aprendiste hoy?", placeholder: "Los conceptos, ideas o conexiones que se quedaron contigo..." },
    { key: "dificil" as const, label: "¿Qué fue difícil o quedó sin entender?", placeholder: "Lo que se me resistió, lo que me generó duda..." },
    { key: "repasar" as const, label: "¿Qué necesito repasar mañana?", placeholder: "Los temas específicos que debo reforzar en la próxima sesión..." },
  ];
  const allFilled = debriefing.aprendiste && debriefing.dificil && debriefing.repasar;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ animation: "fp-float 2.5s ease-in-out infinite", flexShrink: 0 }}>
          <PathySVG size={44} overlay />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Debriefing — Cierre de vuelo</div>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.85)", lineHeight: 1.65 }}>
            Este es el momento más importante de la sesión. La reflexión post-vuelo consolida lo que aprendiste y define tu próxima misión.
          </p>
        </div>
      </div>

      {questions.map(q => (
        <div key={q.key} style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(61,93,145,.05)" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>{q.label}</label>
          <textarea
            value={debriefing[q.key]}
            onChange={e => setDebriefing({ ...debriefing, [q.key]: e.target.value })}
            placeholder={q.placeholder}
            rows={3}
            style={{ width: "100%", border: "1.5px solid rgba(61,93,145,.12)", borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif", resize: "none", background: "#fafbfd", outline: "none", lineHeight: 1.65, boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#7c3aed"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(61,93,145,.12)"; }}
          />
        </div>
      ))}

      <button onClick={onNext} disabled={!allFilled}
        style={{ background: allFilled ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(61,93,145,.1)", color: allFilled ? "white" : "#aaa", border: "none", borderRadius: 12, padding: "14px", fontSize: 14.5, fontWeight: 700, cursor: allFilled ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}>
        {allFilled ? "Guardar en bitácora y aterrizar ✈️" : "Completa las 3 preguntas para continuar"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPLETADO SCREEN
═══════════════════════════════════════════════════════════ */
function CompletadoScreen({ plan, totalElapsed, debriefing, setDebriefing, ciaacResults, fcCorrect, onRestart }: {
  plan: PlanActivity[]; totalElapsed: number;
  debriefing: { aprendiste: string; dificil: string; repasar: string };
  setDebriefing: (v: { aprendiste: string; dificil: string; repasar: string }) => void;
  ciaacResults: { correct: boolean }[]; fcCorrect: boolean[];
  onRestart: () => void;
}) {
  const vuelos = plan.filter(a => a.type === "vuelo").length;
  const ciaacScore = ciaacResults.length > 0 ? Math.round((ciaacResults.filter(r => r.correct).length / ciaacResults.length) * 100) : null;
  const fcScore = fcCorrect.length > 0 ? Math.round((fcCorrect.filter(Boolean).length / fcCorrect.length) * 100) : null;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 700, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0d1f38 100%)", borderRadius: 20, padding: "32px 28px", marginBottom: 20, color: "white", textAlign: "center" }}>
        <div style={{ animation: "fp-float 2.5s ease-in-out infinite", display: "inline-block", marginBottom: 16 }}>
          <PathySVG size={80} overlay />
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
          ¡Aterrizaje exitoso! ✈️
        </div>
        <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.65)", lineHeight: 1.65 }}>
          Completaste {vuelos} vuelo{vuelos !== 1 ? "s" : ""} de estudio · {pad(Math.floor(totalElapsed / 60))}:{pad(totalElapsed % 60)} de sesión
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: 1, marginTop: 24, background: "rgba(255,255,255,.05)", borderRadius: 12, overflow: "hidden" }}>
          {[
            { label: "Minutos", value: `${Math.floor(totalElapsed / 60)}`, icon: "⏱️" },
            ciaacScore !== null ? { label: "CIAAC score", value: `${ciaacScore}%`, icon: "✈️" } : null,
            fcScore !== null ? { label: "Flashcards", value: `${fcScore}%`, icon: "🃏" } : null,
            { label: "Vuelos", value: String(vuelos), icon: "📚" },
          ].filter(Boolean).map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "16px 8px", borderRight: i < 3 ? "1px solid rgba(255,255,255,.07)" : "none", textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{s!.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "white", marginTop: 4 }}>{s!.value}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{s!.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Debriefing summary */}
      {(debriefing.aprendiste || debriefing.dificil || debriefing.repasar) && (
        <div style={{ background: "white", border: "1px solid rgba(61,93,145,.1)", borderRadius: 16, padding: "20px 22px", marginBottom: 16, boxShadow: "0 2px 12px rgba(61,93,145,.06)" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>📋 Tu bitácora de vuelo</div>
          {[
            { label: "Aprendiste", text: debriefing.aprendiste, color: "#3D5D91" },
            { label: "Fue difícil", text: debriefing.dificil, color: "#d97706" },
            { label: "Repasar mañana", text: debriefing.repasar, color: "#7c3aed" },
          ].filter(r => r.text).map(r => (
            <div key={r.label} style={{ padding: "12px 0", borderBottom: "1px solid rgba(61,93,145,.07)" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: r.color, marginBottom: 5 }}>{r.label}</div>
              <p style={{ fontSize: 13.5, color: "#444", lineHeight: 1.6 }}>{r.text}</p>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 12.5, color: "#166534", fontWeight: 500 }}>
            ✓ Guardado en tu Bitácora de vuelo
          </div>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onRestart}
          style={{ flex: 1, background: "white", border: "2px solid #3D5D91", borderRadius: 14, padding: "15px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#3D5D91", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e8eef7"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; }}>
          ✈️ Nueva sesión
        </button>
        <button onClick={() => { window.location.href = "/dashboard/banco"; }}
          style={{ flex: 1, background: "linear-gradient(135deg, #3D5D91 0%, #5A86CB 100%)", color: "white", border: "none", borderRadius: 14, padding: "15px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 6px 20px rgba(61,93,145,.3)", transition: "opacity .2s" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
          Ir al Cuestionario CIAAC →
        </button>
      </div>
    </div>
  );
}
