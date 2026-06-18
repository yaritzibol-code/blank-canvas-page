import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";

export const Route = createFileRoute("/simulador")({
  component: SimuladorPage,
});

/* ─── Data ───────────────────────────────────────────────── */

const MATERIAS = [
  { icon: "plane" as FPIconName, name: "Aerodinámica", total: 30 },
  { icon: "settings" as FPIconName, name: "Aeronaves y Motores", total: 30 },
  { icon: "scale" as FPIconName, name: "Legislación Aeronáutica", total: 30 },
  { icon: "stethoscope" as FPIconName, name: "Medicina de Aviación", total: 20 },
  { icon: "cloud" as FPIconName, name: "Meteorología", total: 30 },
  { icon: "map" as FPIconName, name: "Navegación Aérea", total: 30 },
  { icon: "tower" as FPIconName, name: "Servicios de Tránsito Aéreo", total: 30 },
  { icon: "radio" as FPIconName, name: "Comunicaciones Aeronáuticas", total: 20 },
  { icon: "doc" as FPIconName, name: "Manuales de Información Aeronáutica", total: 20 },
  { icon: "brain" as FPIconName, name: "Factores Humanos", total: 20 },
  { icon: "shield" as FPIconName, name: "Seguridad Aérea", total: 20 },
  { icon: "plane" as FPIconName, name: "Operaciones Aeronáuticas", total: 30 },
];

const TOTAL_QS = MATERIAS.reduce((s, m) => s + m.total, 0); // 310

interface SampleQ {
  text: string;
  opts: string[];
  correct: number;
  feedback: string;
  cite: string;
}

const SAMPLE_QS: SampleQ[] = [
  {
    text: "¿Cuál es la fuerza aerodinámica que actúa perpendicularmente a la dirección del movimiento y permite el vuelo?",
    opts: ["Resistencia aerodinámica", "Sustentación", "Empuje"],
    correct: 1,
    feedback: "La sustentación es la fuerza perpendicular al movimiento que permite volar, generada principalmente por las alas gracias al principio de Bernoulli.",
    cite: "Aerodinámica Básica CIAAC, p. 12",
  },
  {
    text: "¿Qué describe el principio de Bernoulli en relación con la sustentación?",
    opts: ["La velocidad aumenta la presión", "La presión disminuye al aumentar la velocidad", "El flujo laminar genera más resistencia"],
    correct: 1,
    feedback: "Bernoulli establece que en un fluido en movimiento, al aumentar la velocidad disminuye la presión. Esto explica la diferencia de presión entre extradós e intradós.",
    cite: "Aerodinámica Básica CIAAC, p. 18",
  },
  {
    text: "¿Qué es el ángulo de ataque de un perfil alar?",
    opts: ["El ángulo entre el eje longitudinal y la horizontal", "El ángulo entre la cuerda del ala y el viento relativo", "El ángulo de inclinación de la aeronave"],
    correct: 1,
    feedback: "El ángulo de ataque es el ángulo formado entre la cuerda del ala y la dirección del viento relativo. Es fundamental para entender la generación de sustentación.",
    cite: "Aerodinámica Básica CIAAC, p. 22",
  },
];

const DEMO_PCTS = [80, 80, 70, 85, 70, 73, 70, 90, 80, 60, 75, 56];

const YARIS_REPLIES = [
  { t: "¡Claro! Te explico este concepto con más detalle. La sustentación se genera porque el aire fluye más rápido por el extradós que por el intradós del ala, creando una diferencia de presión.", c: "Aerodinámica Básica CIAAC, p. 18" },
  { t: "Piénsalo como Bernoulli en acción: más velocidad = menos presión. Arriba del ala hay menos presión que abajo, y esa diferencia 'jala' el avión hacia arriba.", c: "Aerodinámica Básica CIAAC, p. 15" },
  { t: "¿Recuerdas a Buzz Lightyear 'cayendo con estilo'? Eso es exactamente lo que NO es sustentación. Un avión SÍ la genera gracias a la forma de sus alas.", c: null },
];

/* ─── Question state ─────────────────────────────────────── */

interface QState {
  materia: number;
  num: number;
  answered: boolean;
  flagged: boolean;
  selectedOpt: number;
}

function buildQuestions(): QState[] {
  const qs: QState[] = [];
  MATERIAS.forEach((m, mi) => {
    for (let i = 0; i < m.total; i++) {
      qs.push({ materia: mi, num: i + 1, answered: false, flagged: false, selectedOpt: -1 });
    }
  });
  return qs;
}

/* ─── Calculator state ───────────────────────────────────── */

interface CalcState {
  display: string;
  expr: string;
  prev: string;
  op: string;
  newNum: boolean;
}

const CALC_INIT: CalcState = { display: "0", expr: "", prev: "", op: "", newNum: true };

function calcReducer(s: CalcState, action: { type: string; payload?: string }): CalcState {
  switch (action.type) {
    case "NUM": {
      const n = action.payload!;
      if (s.newNum) return { ...s, display: n === "." ? "0." : n, newNum: false };
      if (n === "." && s.display.includes(".")) return s;
      return { ...s, display: s.display + n };
    }
    case "OP": {
      const op = action.payload!;
      let next = s;
      if (s.op && !s.newNum) next = calcReducer(s, { type: "EQ", payload: "chain" });
      return { ...next, prev: next.display, op, expr: next.display + " " + op, newNum: true };
    }
    case "EQ": {
      if (!s.op || !s.prev) return s;
      const a = parseFloat(s.prev), b = parseFloat(s.display);
      let r: number | string;
      if (s.op === "+") r = a + b;
      else if (s.op === "-") r = a - b;
      else if (s.op === "×") r = a * b;
      else if (s.op === "÷") r = b !== 0 ? a / b : "Error";
      else r = a * b / 100;
      const res = typeof r === "number" ? parseFloat(r.toFixed(8)).toString() : r;
      if (action.payload === "chain") return { ...s, display: res, newNum: true };
      return { display: res, expr: s.prev + " " + s.op + " " + s.display + " =", prev: "", op: "", newNum: true };
    }
    case "CLEAR": return CALC_INIT;
    default: return s;
  }
}

/* ─── Helpers ────────────────────────────────────────────── */

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function secToHM(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

/* ─── Component ──────────────────────────────────────────── */

type Phase = "warning" | "exam" | "result" | "review";

function SimuladorPage() {
  const [phase, setPhase] = useState<Phase>("warning");
  const [agreed, setAgreed] = useState(false);
  const [questions, setQuestions] = useState<QState[]>(buildQuestions);
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(5 * 3600);
  const [expandedMaterias, setExpandedMaterias] = useState<Set<number>>(new Set([0]));
  const [calcOpen, setCalcOpen] = useState(false);
  const [calc, setCalc] = useState<CalcState>(CALC_INIT);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  // Review
  const [reviewCurrent, setReviewCurrent] = useState(0);
  const [yarisOpen, setYarisOpen] = useState(false);
  const [yarisMsgs, setYarisMsgs] = useState<{ role: "bot" | "user"; text: string; cite?: string }[]>([]);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisTyping, setYarisTyping] = useState(false);
  const [yarisReplyIdx, setYarisReplyIdx] = useState(0);
  const [yarisInit, setYarisInit] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [yarisMsgs, yarisTyping]);

  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setPhase("result");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "exam") return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  // Scroll active question into view in left panel
  useEffect(() => {
    const el = document.getElementById(`qi-${current}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [current]);

  /* Materia offset helpers */
  function materiaOffset(mi: number): number {
    return MATERIAS.slice(0, mi).reduce((s, m) => s + m.total, 0);
  }

  /* Select option */
  function selectOpt(qIdx: number, optIdx: number) {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIdx] };
      q.selectedOpt = optIdx;
      if (!q.answered) q.answered = true;
      next[qIdx] = q;
      return next;
    });
  }

  /* Flag */
  function toggleFlag() {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[current] };
      q.flagged = !q.flagged;
      next[current] = q;
      return next;
    });
  }

  /* Submit */
  function submitExam() {
    if (timerRef.current) clearInterval(timerRef.current);
    setConfirmOpen(false);
    setPhase("result");
  }

  /* Calc */
  function dispatch(type: string, payload?: string) {
    setCalc((s) => calcReducer(s, { type, payload }));
  }

  /* Yaris */
  function openYaris() {
    setYarisOpen(true);
    if (!yarisInit) {
      setYarisInit(true);
      setYarisTyping(true);
      setTimeout(() => {
        setYarisTyping(false);
        setYarisMsgs([{ role: "bot", text: "¡Hola! Soy Yaris. Veo que tienes una duda sobre esta pregunta. ¡Te explico!", cite: "Aerodinámica Básica CIAAC, p. 12" }]);
        setTimeout(() => {
          setYarisTyping(true);
          setTimeout(() => {
            setYarisTyping(false);
            setYarisMsgs((p) => [...p, { role: "bot", text: YARIS_REPLIES[0].t, cite: YARIS_REPLIES[0].c ?? undefined }]);
          }, 900);
        }, 300);
      }, 700);
    }
  }

  function sendYaris() {
    const text = yarisInput.trim();
    if (!text) return;
    setYarisMsgs((p) => [...p, { role: "user", text }]);
    setYarisInput("");
    setYarisTyping(true);
    const ri = yarisReplyIdx % YARIS_REPLIES.length;
    setYarisReplyIdx((r) => r + 1);
    setTimeout(() => {
      setYarisTyping(false);
      const r = YARIS_REPLIES[ri];
      setYarisMsgs((p) => [...p, { role: "bot", text: r.t, cite: r.c ?? undefined }]);
    }, 900);
  }

  /* Derived */
  const answeredCount = questions.filter((q) => q.answered).length;
  const flaggedCount = questions.filter((q) => q.flagged).length;
  const progressPct = (answeredCount / TOTAL_QS) * 100;
  const timerWarning = secondsLeft <= 1800 && secondsLeft > 300;
  const timerDanger = secondsLeft <= 300;
  const currentQ = questions[current];
  const sampleQ = SAMPLE_QS[currentQ.num % SAMPLE_QS.length];
  const isLast = current === TOTAL_QS - 1;

  /* Result data */
  const timeUsed = 5 * 3600 - secondsLeft;
  const totalCorrect = Math.floor(TOTAL_QS * 0.7355);
  const scorePct = ((totalCorrect / TOTAL_QS) * 100).toFixed(2);
  const passed = parseFloat(scorePct) >= 80;

  /* ─── PHASE: WARNING ─── */
  if (phase === "warning") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto", fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 560, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)", margin: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ display: "flex", alignItems: "center" }}><Icon n="target" size={40} color="#6C0820" /></span>
            <div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", color: "#22375C" }}>Simulador CIAAC</h2>
              <p style={{ fontSize: "0.8rem", color: "#647DA0" }}>Lee esto antes de comenzar</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              { color: "red", icon: "alert", text: "Si <strong>sales de la página</strong> durante el examen perderás todo tu progreso y tendrás que comenzar de nuevo." },
              { color: "yellow", icon: "audio", text: "Busca un <strong>lugar tranquilo sin interrupciones</strong>. Apaga notificaciones y ponlo en modo no molestar." },
              { color: "yellow", icon: "info", text: "Ten a la mano <strong>agua y algo de comer</strong>. El examen dura hasta 5 horas." },
              { color: "blue", icon: "pencil", text: "Ten <strong>lápiz y papel</strong> para cálculos. La calculadora básica está disponible dentro del simulador." },
              { color: "blue", icon: "eyeOff", text: "Para que la simulación sea <strong>lo más realista posible</strong>, no consultes apuntes ni el internet durante el examen." },
            ].map((item, i) => {
              const styles: Record<string, React.CSSProperties> = {
                red: { background: "rgba(231,76,60,0.06)", border: "1px solid rgba(231,76,60,0.15)", color: "#c0392b" },
                yellow: { background: "rgba(243,156,18,0.06)", border: "1px solid rgba(243,156,18,0.2)", color: "#8a6000" },
                blue: { background: "rgba(61,93,145,0.06)", border: "1px solid rgba(61,93,145,0.12)", color: "#3D5D91" },
              };
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 10, fontSize: "0.85rem", lineHeight: 1.5, ...styles[item.color] }}>
                  <span style={{ flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center" }}><Icon n={item.icon as FPIconName} size={17} /></span>
                  <span dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              );
            })}
          </div>

          <div style={{ background: "#f8f9ff", borderRadius: 12, padding: 16, marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "310 preguntas totales" },
              { label: "5 horas límite" },
              { label: "12 materias" },
              { label: "80% mínimo para aprobar" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3D5D91", flexShrink: 0 }} />
                <span dangerouslySetInnerHTML={{ __html: item.label.replace(/\d+[^\s]*/g, (m) => `<strong>${m}</strong>`) }} />
              </div>
            ))}
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, cursor: "pointer", fontSize: "0.84rem", color: "#555", lineHeight: 1.5 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: "#3D5D91", width: 16, height: 16, flexShrink: 0 }} />
            Entiendo las condiciones y estoy listo para comenzar el simulador.
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/dashboard/banco" style={{ flex: 1, padding: 12, background: "white", color: "#647DA0", border: "2px solid #F2DCDB", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ← Volver
            </Link>
            <button
              disabled={!agreed}
              onClick={() => setPhase("exam")}
              style={{ flex: 2, padding: 12, background: agreed ? "#6C0820" : "#ccc", color: "white", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: agreed ? "pointer" : "not-allowed", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
            >
              <Icon n="target" size={16} /> Comenzar simulador
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── PHASE: RESULT ─── */
  if (phase === "result") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#f5f7fc", zIndex: 700, overflowY: "auto", padding: "28px 20px", fontFamily: "'Manrope', sans-serif" }}>
        <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ animation: "float 3s ease-in-out infinite", display: "inline-block" }}><Icon n="cloud" size={64} color="#5A86CB" /></div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.8rem", color: "#22375C", margin: "8px 0 4px" }}>
              Examen <span style={{ color: passed ? "#2ecc71" : "#6C0820" }}>{passed ? "¡Aprobado!" : "entregado"}</span>
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#647DA0" }}>Aquí está tu análisis completo de Pathy</p>
          </div>

          {/* Score card */}
          <div style={{ background: "white", borderRadius: 18, padding: 24, boxShadow: "0 2px 14px rgba(61,93,145,0.08)", marginBottom: 18, textAlign: "center" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "3.5rem", fontWeight: 900, lineHeight: 1, marginBottom: 4, color: passed ? "#2ecc71" : "#e74c3c" }}>
              {scorePct}%
            </div>
            <div style={{ fontSize: "0.85rem", color: "#647DA0", marginBottom: 20 }}>Calificación total del simulador</div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { num: totalCorrect, label: "Correctas", color: "#2ecc71" },
                { num: TOTAL_QS - totalCorrect, label: "Incorrectas", color: "#e74c3c" },
                { num: TOTAL_QS, label: "Total", color: "#22375C" },
                { num: secToHM(timeUsed), label: "Tiempo usado", color: "#3D5D91" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.5rem", fontWeight: 900, color: s.color }}>{s.num}</div>
                  <div style={{ fontSize: "0.72rem", color: "#8DA1BE" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pathy */}
          <div style={{ background: "linear-gradient(135deg,#F2DCDB,#fce4ec)", borderRadius: 14, padding: 18, marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}><Icon n="cloud" size={29} color="#6C0820" /></span>
            <div style={{ fontSize: "0.87rem", color: "#555", lineHeight: 1.6 }}>
              {passed
                ? <><strong style={{ color: "#6C0820" }}>Pathy dice:</strong> ¡FELICIDADES! Aprobaste el simulador con <strong>{scorePct}%</strong>. Tu dedicación y constancia están dando frutos. Sigue practicando para llegar al examen real con aún más confianza. ¡Tú puedes, aviador!</>
                : <><strong style={{ color: "#6C0820" }}>Pathy dice:</strong> No te desanimes, cada simulador es un paso más hacia tu objetivo. Tu calificación fue <strong>{scorePct}%</strong> y necesitas <strong>80%</strong> para aprobar. Las materias en rojo son las que más necesitas reforzar. ¡Con más práctica lo lograrás!</>
              }
            </div>
          </div>

          {/* Por materia */}
          <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,0.06)", marginBottom: 18 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="chart" size={15} /> Resultado por materia</div>
            {MATERIAS.map((m, i) => {
              const p = DEMO_PCTS[i];
              const color = p >= 80 ? "#2ecc71" : p >= 70 ? "#f39c12" : "#e74c3c";
              const bg = p >= 80 ? "rgba(46,204,113,0.06)" : p >= 70 ? "rgba(243,156,18,0.06)" : "rgba(231,76,60,0.06)";
              const border = p >= 80 ? "rgba(46,204,113,0.2)" : p >= 70 ? "rgba(243,156,18,0.2)" : "rgba(231,76,60,0.2)";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: bg, border: `1px solid ${border}`, borderRadius: 10, marginBottom: 7, gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#22375C", display: "flex", alignItems: "center", gap: 7 }}><Icon n={m.icon} size={15} color="#647DA0" /> {m.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#8DA1BE" }}>{m.total} preguntas</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 100, height: 6, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 10 }} />
                    </div>
                    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", fontWeight: 900, color }}>{p}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Review Q sample */}
          <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,0.06)", marginBottom: 24 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="sim" size={15} /> Preguntas corregidas</div>
            {SAMPLE_QS.map((q, i) => {
              const userAns = i % 2 === 0 ? q.correct : (q.correct === 0 ? 1 : 0);
              const isCorrect = userAns === q.correct;
              return (
                <div key={i} style={{ background: isCorrect ? "rgba(46,204,113,0.06)" : "rgba(231,76,60,0.05)", border: `1px solid ${isCorrect ? "rgba(46,204,113,0.2)" : "rgba(231,76,60,0.15)"}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                    <span style={{ flexShrink: 0, display: "flex", alignItems: "center", marginTop: 1 }}>{isCorrect ? <Icon n="checkCircle" size={17} color="#2ecc71" /> : <Icon n="close" size={17} color="#e74c3c" />}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#22375C", lineHeight: 1.5 }}>{i + 1}. {q.text}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, paddingLeft: 24 }}>
                    {q.opts.map((o, oi) => {
                      const isRight = oi === q.correct;
                      const isUser = oi === userAns;
                      return (
                        <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: isRight ? "rgba(46,204,113,0.1)" : isUser && !isRight ? "rgba(231,76,60,0.08)" : "transparent", border: `1px solid ${isRight ? "#2ecc71" : isUser && !isRight ? "#e74c3c" : "#F2DCDB"}`, borderRadius: 8, fontSize: "0.82rem", color: "#22375C" }}>
                          <span>{["A", "B", "C"][oi]}</span>
                          <span style={{ flex: 1 }}>{o}</span>
                          <span style={{ display: "flex", alignItems: "center" }}>{isRight ? <Icon n="checkCircle" size={15} color="#2ecc71" /> : isUser && !isRight ? <Icon n="close" size={15} color="#e74c3c" /> : null}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: "10px 12px", background: "rgba(61,93,145,0.06)", borderLeft: "3px solid #3D5D91", borderRadius: "0 7px 7px 0", fontSize: "0.8rem", color: "#555", lineHeight: 1.5 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n="lightbulb" size={14} color="#f39c12" /> {q.feedback}</span>
                    <div style={{ marginTop: 5, fontSize: "0.72rem", color: "#3D5D91", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Icon n="book" size={13} /> {q.cite}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginBottom: 18 }}>
            <button onClick={() => setPhase("review")} style={{ width: "100%", padding: 14, background: "#3D5D91", color: "white", border: "none", borderRadius: 12, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Icon n="doc" size={17} /> Revisar examen completo
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingBottom: 40 }}>
            <button onClick={() => { setPhase("warning"); setQuestions(buildQuestions()); setSecondsLeft(5 * 3600); setCurrent(0); setAgreed(false); }} style={{ flex: 1, padding: 13, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 11, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
              🔄 Repetir simulador
            </button>
            <Link to="/dashboard" style={{ flex: 1, padding: 13, background: "#6C0820", color: "white", border: "none", borderRadius: 11, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              🏠 Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── PHASE: REVIEW ─── */
  if (phase === "review") {
    const reviewQ = SAMPLE_QS[reviewCurrent % SAMPLE_QS.length];
    const isCorrect = reviewCurrent % 3 !== 2;
    const userAns = isCorrect ? reviewQ.correct : (reviewQ.correct === 0 ? 1 : 0);
    const mi = questions[reviewCurrent]?.materia ?? 0;

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 800, background: "#f5f7fc", display: "flex", flexDirection: "column", fontFamily: "'Manrope', sans-serif" }}>
        {/* Review topbar */}
        <div style={{ height: 56, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setPhase("result")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "5px 12px", borderRadius: 7, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
              ← Volver
            </button>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1rem", color: "white", fontWeight: 700 }}>Revisión del examen</span>
          </div>
          <span style={{ background: "#F2AEBC", color: "#6C0820", padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700 }}>📋 Modo revisión</span>
        </div>

        {/* Review body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left list */}
          <div style={{ width: 200, flexShrink: 0, background: "white", borderRight: "1px solid rgba(61,93,145,0.08)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #F2DCDB", background: "#f8f9ff" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Preguntas del examen</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.62rem", color: "#888" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ecc71" }} />Correcta</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.62rem", color: "#888" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e74c3c" }} />Incorrecta</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {MATERIAS.map((m, mi) => {
                const offset = materiaOffset(mi);
                return (
                  <div key={mi}>
                    <div style={{ padding: "6px 12px", background: "#f8f9ff", borderBottom: "1px solid rgba(61,93,145,0.06)", fontSize: "0.68rem", fontWeight: 700, color: "#3D5D91", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      {m.name}
                    </div>
                    {Array.from({ length: m.total }, (_, i) => {
                      const idx = offset + i;
                      const correct = idx % 3 !== 2;
                      const active = idx === reviewCurrent;
                      return (
                        <div
                          key={idx}
                          onClick={() => setReviewCurrent(idx)}
                          style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px 5px 16px", cursor: "pointer", background: active ? "rgba(61,93,145,0.06)" : "transparent", borderLeft: `3px solid ${correct ? "#2ecc71" : "#e74c3c"}`, transition: "background 0.2s" }}
                        >
                          <div style={{ width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 700, flexShrink: 0, background: correct ? "#2ecc71" : "#e74c3c", color: "white" }}>
                            {correct ? "✓" : "✗"}
                          </div>
                          <span style={{ fontSize: "0.73rem", color: "#555" }}>Pregunta {i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ maxWidth: 680, width: "100%" }}>
              <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 14px rgba(61,93,145,0.07)", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>{isCorrect ? "✅" : "❌"}</span>
                    <span style={{ background: "rgba(61,93,145,0.07)", color: "#3D5D91", padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>{MATERIAS[mi].name}</span>
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "#aaa" }}>Pregunta {reviewCurrent + 1} / {TOTAL_QS}</span>
                </div>

                <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.95rem", color: "#1a1a2e", lineHeight: 1.5, marginBottom: 18 }}>{reviewQ.text}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
                  {reviewQ.opts.map((o, oi) => {
                    const isRight = oi === reviewQ.correct;
                    const isUser = oi === userAns;
                    return (
                      <div key={oi} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: isRight ? "rgba(46,204,113,0.08)" : isUser && !isRight ? "rgba(231,76,60,0.06)" : "#f8f9ff", border: `2px solid ${isRight ? "#2ecc71" : isUser && !isRight ? "#e74c3c" : "#F2DCDB"}`, borderRadius: 11 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: isRight ? "#2ecc71" : isUser && !isRight ? "#e74c3c" : "#F2DCDB", color: isRight || (isUser && !isRight) ? "white" : "#888", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                          {["A", "B", "C"][oi]}
                        </div>
                        <span style={{ fontSize: "0.88rem", color: "#1a1a2e", flex: 1 }}>{o}</span>
                        {isRight && <span style={{ fontSize: "0.72rem", color: "#2ecc71", fontWeight: 700 }}>✓ Correcta</span>}
                        {isUser && !isRight && <span style={{ fontSize: "0.72rem", color: "#e74c3c", fontWeight: 700 }}>✗ Tu respuesta</span>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: "14px 16px", background: "rgba(61,93,145,0.06)", borderLeft: "4px solid #3D5D91", borderRadius: "0 10px 10px 0", fontSize: "0.85rem", color: "#555", lineHeight: 1.6, marginBottom: 14 }}>
                  💡 {reviewQ.feedback}
                  <div style={{ marginTop: 6, fontSize: "0.74rem", color: "#3D5D91", fontWeight: 600 }}>📖 {reviewQ.cite}</div>
                </div>

                <button onClick={openYaris} style={{ width: "100%", padding: 11, background: "linear-gradient(135deg,#3D5D91,#5A86CB)", color: "white", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
                  🤖 Explícamelo Yaris
                </button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setReviewCurrent((r) => Math.max(0, r - 1))} style={{ flex: 1, padding: 11, background: "white", color: "#888", border: "2px solid #F2DCDB", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>← Anterior</button>
                <button onClick={() => setReviewCurrent((r) => Math.min(TOTAL_QS - 1, r + 1))} style={{ flex: 1, padding: 11, background: "#3D5D91", color: "white", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Siguiente →</button>
              </div>
            </div>
          </div>

          {/* Yaris panel */}
          <div style={isMobile && yarisOpen ? { position: "fixed", inset: 0, zIndex: 200, width: "100%", display: "flex", flexDirection: "column", background: "white" } : { width: yarisOpen ? 340 : 0, overflow: "hidden", flexShrink: 0, background: "white", borderLeft: yarisOpen ? "1px solid rgba(61,93,145,0.1)" : "none", display: "flex", flexDirection: "column", transition: "width 0.35s ease" }}>
            <YarisPanel
              msgs={yarisMsgs}
              typing={yarisTyping}
              input={yarisInput}
              onInput={setYarisInput}
              onSend={sendYaris}
              onClose={() => setYarisOpen(false)}
              msgsEndRef={msgsEndRef}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ─── PHASE: EXAM ─── */
  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: "#f5f7fc", color: "#1a1a2e", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Topbar */}
      <div style={{ height: 56, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setLeftPanelOpen((o) => !o)} className="md:hidden" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "5px 10px", borderRadius: 7, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
            ☰ Preguntas
          </button>
          <span style={{ background: "#6C0820", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>🎯 Simulador</span>
          <span className="hidden md:block" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1rem", color: "white", fontWeight: 700 }}>Examen General de Egreso — Piloto Comercial</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 14px" }}>
            <div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tiempo restante</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", fontWeight: 900, letterSpacing: 1, color: timerDanger ? "#e74c3c" : timerWarning ? "#f39c12" : "white" }}>
                {fmtTime(secondsLeft)}
              </div>
            </div>
          </div>
          <button onClick={() => setCalcOpen((o) => !o)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
            🧮 Calculadora
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "rgba(255,255,255,0.08)", height: 4, flexShrink: 0 }}>
        <div style={{ height: "100%", background: "#F2AEBC", width: `${progressPct}%`, transition: "width 0.3s ease" }} />
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left panel (desktop) */}
        <div
          className="hidden md:flex flex-col"
          style={{ width: 260, flexShrink: 0, background: "white", borderRight: "1px solid rgba(61,93,145,0.08)", overflow: "hidden" }}
        >
          <LeftPanel questions={questions} current={current} expandedMaterias={expandedMaterias} onToggleMateria={(mi) => setExpandedMaterias((s) => { const n = new Set(s); n.has(mi) ? n.delete(mi) : n.add(mi); return n; })} onSelectQ={setCurrent} answeredCount={answeredCount} />
        </div>

        {/* Left panel (mobile overlay) */}
        {leftPanelOpen && (
          <div className="md:hidden" style={{ position: "fixed", top: 60, left: 0, bottom: 0, zIndex: 80, width: 260, background: "white", boxShadow: "4px 0 20px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
            <LeftPanel questions={questions} current={current} expandedMaterias={expandedMaterias} onToggleMateria={(mi) => setExpandedMaterias((s) => { const n = new Set(s); n.has(mi) ? n.delete(mi) : n.add(mi); return n; })} onSelectQ={(i) => { setCurrent(i); setLeftPanelOpen(false); }} answeredCount={answeredCount} />
          </div>
        )}
        {leftPanelOpen && <div className="md:hidden" style={{ position: "fixed", inset: 0, zIndex: 79, background: "rgba(0,0,0,0.3)" }} onClick={() => setLeftPanelOpen(false)} />}

        {/* Right panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 28, display: "flex", flexDirection: "column", alignItems: "center" }} className="sm:p-7 p-4">

            <div style={{ background: "white", borderRadius: 16, padding: 28, maxWidth: 700, width: "100%", boxShadow: "0 2px 14px rgba(61,93,145,0.07)" }} className="sm:p-7 p-5">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ background: "rgba(61,93,145,0.07)", color: "#3D5D91", padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                  {MATERIAS[currentQ.materia].name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={toggleFlag}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", border: `1px solid ${currentQ.flagged ? "#f39c12" : "#F2DCDB"}`, borderRadius: 7, background: currentQ.flagged ? "rgba(243,156,18,0.08)" : "white", fontSize: "0.76rem", fontWeight: 600, color: currentQ.flagged ? "#f39c12" : "#888", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.2s" }}
                  >
                    ⚑ {currentQ.flagged ? "Marcada" : "Marcar para revisar"}
                  </button>
                  <span style={{ fontSize: "0.76rem", color: "#aaa" }}>{current + 1} / {TOTAL_QS}</span>
                </div>
              </div>

              <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", color: "#1a1a2e", lineHeight: 1.5, marginBottom: 24 }}>
                {sampleQ.text}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sampleQ.opts.map((opt, oi) => (
                  <div
                    key={oi}
                    onClick={() => selectOpt(current, oi)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: currentQ.selectedOpt === oi ? "rgba(61,93,145,0.07)" : "#f8f9ff", border: `2px solid ${currentQ.selectedOpt === oi ? "#3D5D91" : "#F2DCDB"}`, borderRadius: 12, cursor: "pointer", transition: "all 0.2s", userSelect: "none" }}
                    onMouseEnter={(e) => { if (currentQ.selectedOpt !== oi) { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.background = "rgba(61,93,145,0.04)"; e.currentTarget.style.transform = "translateX(3px)"; } }}
                    onMouseLeave={(e) => { if (currentQ.selectedOpt !== oi) { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.background = "#f8f9ff"; e.currentTarget.style.transform = "none"; } }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0, background: currentQ.selectedOpt === oi ? "#3D5D91" : "#F2DCDB", color: currentQ.selectedOpt === oi ? "white" : "#888", transition: "all 0.2s" }}>
                      {["A", "B", "C", "D"][oi]}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#1a1a2e", lineHeight: 1.4, flex: 1 }}>{opt}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: "0.75rem", color: "#aaa" }}>
                <span>💡</span>
                <span>Puedes cambiar tu respuesta en cualquier momento antes de entregar.</span>
              </div>
            </div>

            {/* Nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 700, width: "100%", marginTop: 16, gap: 10 }}>
              <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} style={{ padding: "11px 20px", background: "white", color: current === 0 ? "#ccc" : "#888", border: "2px solid #F2DCDB", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: current === 0 ? "not-allowed" : "pointer", fontFamily: "'Manrope', sans-serif", opacity: current === 0 ? 0.4 : 1 }}>
                ← Anterior
              </button>
              <div style={{ fontSize: "0.8rem", color: "#aaa", textAlign: "center" }}>Pregunta {current + 1} de {TOTAL_QS}</div>
              {!isLast ? (
                <button onClick={() => setCurrent((c) => Math.min(TOTAL_QS - 1, c + 1))} style={{ padding: "11px 20px", background: "#3D5D91", color: "white", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
                  Siguiente →
                </button>
              ) : (
                <button onClick={() => setConfirmOpen(true)} style={{ padding: "11px 24px", background: "#6C0820", color: "white", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
                  Entregar examen ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calculator modal */}
      {calcOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "80px 20px 20px" }} onClick={(e) => { if (e.target === e.currentTarget) setCalcOpen(false); }}>
          <div style={{ background: "#1a1a2e", borderRadius: 16, padding: 16, width: 220, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", minHeight: 16, marginBottom: 2 }}>{calc.expr}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "white", wordBreak: "break-all" }}>{calc.display}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {[
                { label: "C", action: () => dispatch("CLEAR"), style: { background: "rgba(231,76,60,0.6)", color: "white" } },
                { label: "%", action: () => dispatch("OP", "%"), style: { background: "#5A86CB", color: "white" } },
                { label: "÷", action: () => dispatch("OP", "÷"), style: { background: "#5A86CB", color: "white" } },
                { label: "7", action: () => dispatch("NUM", "7"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "8", action: () => dispatch("NUM", "8"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "9", action: () => dispatch("NUM", "9"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "×", action: () => dispatch("OP", "×"), style: { background: "#5A86CB", color: "white" } },
                { label: "4", action: () => dispatch("NUM", "4"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "5", action: () => dispatch("NUM", "5"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "6", action: () => dispatch("NUM", "6"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "−", action: () => dispatch("OP", "-"), style: { background: "#5A86CB", color: "white" } },
                { label: "1", action: () => dispatch("NUM", "1"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "2", action: () => dispatch("NUM", "2"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "3", action: () => dispatch("NUM", "3"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "+", action: () => dispatch("OP", "+"), style: { background: "#5A86CB", color: "white" } },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} style={{ padding: "12px 0", border: "none", borderRadius: 8, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", ...btn.style }}>
                  {btn.label}
                </button>
              ))}
              <button onClick={() => dispatch("NUM", "0")} style={{ padding: "12px 0", border: "none", borderRadius: 8, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", background: "rgba(255,255,255,0.1)", color: "white", gridColumn: "span 2" }}>0</button>
              <button onClick={() => dispatch("NUM", ".")} style={{ padding: "12px 0", border: "none", borderRadius: 8, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", background: "rgba(255,255,255,0.1)", color: "white" }}>.</button>
              <button onClick={() => dispatch("EQ")} style={{ padding: "12px 0", border: "none", borderRadius: 8, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", background: "#6C0820", color: "white", gridColumn: "span 1" }}>=</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm finish modal */}
      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 18, padding: 32, maxWidth: 440, width: "100%" }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", marginBottom: 8 }}>¿Entregar el examen?</h3>
            <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.6, marginBottom: 20 }}>Una vez que entregues no podrás modificar tus respuestas. Revisa que hayas respondido todas las preguntas que puedas.</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { num: answeredCount, label: "Respondidas" },
                { num: TOTAL_QS - answeredCount, label: "Sin responder" },
                { num: flaggedCount, label: "Marcadas" },
              ].map((s) => (
                <div key={s.label} style={{ flex: 1, background: "#f8f9ff", borderRadius: 10, padding: 12, textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "#3D5D91" }}>{s.num}</div>
                  <div style={{ fontSize: "0.7rem", color: "#aaa" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ flex: 1, padding: 12, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>← Seguir revisando</button>
              <button onClick={submitExam} style={{ flex: 2, padding: 12, background: "#6C0820", color: "white", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Entregar examen ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Left Panel ──────────────────────────────────────────── */

function LeftPanel({ questions, current, expandedMaterias, onToggleMateria, onSelectQ, answeredCount }: {
  questions: QState[];
  current: number;
  expandedMaterias: Set<number>;
  onToggleMateria: (mi: number) => void;
  onSelectQ: (i: number) => void;
  answeredCount: number;
}) {
  function materiaOffset(mi: number): number {
    return MATERIAS.slice(0, mi).reduce((s, m) => s + m.total, 0);
  }

  return (
    <>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #F2DCDB", background: "#f8f9ff" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>Preguntas del examen</div>
        <div style={{ fontSize: "0.7rem", color: "#888" }}>{answeredCount} / {TOTAL_QS} respondidas</div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "8px 16px", borderBottom: "1px solid #F2DCDB", flexWrap: "wrap" }}>
        {[
          { dot: "#F2DCDB", label: "Sin responder" },
          { dot: "#3D5D91", label: "Respondida" },
          { dot: "#f39c12", label: "Marcada" },
          { dot: "#5A86CB", label: "Actual" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", color: "#888" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.dot, flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {MATERIAS.map((m, mi) => {
          const offset = materiaOffset(mi);
          const open = expandedMaterias.has(mi);
          const answeredInM = questions.slice(offset, offset + m.total).filter((q) => q.answered).length;
          return (
            <div key={mi} style={{ borderBottom: "1px solid rgba(61,93,145,0.06)" }}>
              <div onClick={() => onToggleMateria(mi)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", cursor: "pointer", background: "#f8f9ff" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3D5D91" }}>{m.name}</span>
                <span style={{ fontSize: "0.65rem", color: "#aaa" }}>{answeredInM}/{m.total} <span style={{ fontSize: "0.6rem", color: "#bbb", display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>▼</span></span>
              </div>
              {open && (
                <div>
                  {Array.from({ length: m.total }, (_, i) => {
                    const idx = offset + i;
                    const q = questions[idx];
                    const isActive = idx === current;
                    const dotBg = isActive ? "#5A86CB" : q.flagged ? "#f39c12" : q.answered ? "#3D5D91" : "#F2DCDB";
                    const dotColor = isActive || q.answered || q.flagged ? "white" : "#888";
                    return (
                      <div
                        key={idx}
                        id={`qi-${idx}`}
                        onClick={() => onSelectQ(idx)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 24px", cursor: "pointer", background: isActive ? "rgba(61,93,145,0.08)" : "transparent", transition: "background 0.2s", fontSize: "0.76rem" }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, flexShrink: 0, background: dotBg, color: dotColor, boxShadow: isActive ? "0 0 0 2px white, 0 0 0 4px #5A86CB" : "none", transition: "all 0.2s" }}>
                          {i + 1}
                        </div>
                        <span style={{ color: isActive ? "#3D5D91" : "#666", fontWeight: isActive ? 700 : undefined }}>Pregunta {i + 1}</span>
                        {q.flagged && <span style={{ fontSize: "0.7rem", marginLeft: "auto" }}>⚑</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── Yaris Panel ─────────────────────────────────────────── */

function YarisPanel({ msgs, typing, input, onInput, onSend, onClose, msgsEndRef }: {
  msgs: { role: "bot" | "user"; text: string; cite?: string }[];
  typing: boolean;
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
  msgsEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <style>{`@keyframes yb{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}.yds{width:5px;height:5px;background:#5A86CB;border-radius:50%;animation:yb .8s infinite}.yds:nth-child(2){animation-delay:.15s}.yds:nth-child(3){animation-delay:.3s}`}</style>
      <div style={{ padding: "14px 18px", flexShrink: 0, background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🤖</div>
          <div>
            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "white" }}>Yaris IA</div>
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.8)" }}>Tutora de aviación 24/7</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.role === "bot" ? "0.78rem" : "0.6rem", fontWeight: msg.role === "user" ? 700 : undefined, background: msg.role === "bot" ? "#F2DCDB" : "#3D5D91", color: msg.role === "user" ? "white" : undefined, flexShrink: 0 }}>
              {msg.role === "bot" ? "🤖" : "MG"}
            </div>
            <div style={{ maxWidth: "84%", padding: "9px 12px", borderRadius: msg.role === "bot" ? "4px 12px 12px 12px" : "12px 4px 12px 12px", fontSize: "0.81rem", lineHeight: 1.55, background: msg.role === "bot" ? "#f0f4ff" : "#3D5D91", color: msg.role === "bot" ? "#1a1a2e" : "white" }}>
              <span dangerouslySetInnerHTML={{ __html: msg.text }} />
              {msg.cite && <div style={{ marginTop: 6, padding: "4px 8px", background: "rgba(61,93,145,0.08)", borderLeft: "3px solid #3D5D91", borderRadius: 3, fontSize: "0.7rem", color: "#3D5D91", fontWeight: 600 }}>📖 {msg.cite}</div>}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", flexShrink: 0 }}>🤖</div>
            <div style={{ padding: "9px 12px", background: "#f0f4ff", borderRadius: "4px 12px 12px 12px", display: "flex", alignItems: "center", gap: 4 }}>
              <div className="yds" /><div className="yds" /><div className="yds" />
            </div>
          </div>
        )}
        <div ref={msgsEndRef} />
      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid #F2DCDB", display: "flex", gap: 7, flexShrink: 0 }}>
        <input value={input} onChange={(e) => onInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onSend(); }} placeholder="Escribe tu duda..." style={{ flex: 1, border: "2px solid #F2DCDB", borderRadius: 18, padding: "7px 12px", fontSize: "0.81rem", fontFamily: "'Manrope', sans-serif", outline: "none" }} onFocus={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; }} />
        <button onClick={onSend} style={{ width: 32, height: 32, background: "#3D5D91", border: "none", borderRadius: "50%", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", flexShrink: 0 }}>➤</button>
      </div>
    </>
  );
}
