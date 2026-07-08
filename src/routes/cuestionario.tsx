import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import {
  useRequireAuth,
  isPaid,
  getPublishedQuestions,
  getFreeQuestions,
  saveQuizAttempt,
  yarisReply,
  logYarisUse,
  materiaBySlug,
  MATERIAS_DEF,
} from "@/lib/store";
import type { BankQuestion, YarisContext } from "@/lib/store";
import { ReportProblemModal } from "@/components/shared/ReportProblemModal";

export const Route = createFileRoute("/cuestionario")({
  component: CuestionarioPage,
  validateSearch: (search: Record<string, unknown>): { materias?: string; qty?: number } => {
    const out: { materias?: string; qty?: number } = {};
    if (typeof search.materias === "string" && search.materias) out.materias = search.materias;
    const q = Number(search.qty);
    if (Number.isFinite(q) && q > 0) out.qty = Math.floor(q);
    return out;
  },
});

interface Question {
  icon: FPIconName;
  materia: string;
  slug: string;
  questionId: string;
  correctIndex: number;
  explanation: string;
  text: string;
  options: { text: string; correct: boolean }[];
  feedback: { correct: string; incorrect: string; cite: string };
}

interface YarisMsg {
  role: "bot" | "user";
  text: string;
  cite?: string;
}

const LETTERS = ["A", "B", "C", "D"];

/* ─── Helpers de datos reales ───────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseSlugs(materias?: string): string[] {
  const all = MATERIAS_DEF.map((m) => m.slug);
  if (!materias) return all;
  const slugs = materias
    .split(",")
    .map((s) => s.trim())
    .filter((s) => !!materiaBySlug(s));
  return slugs.length > 0 ? slugs : all;
}

function toLocalQ(q: BankQuestion): Question {
  const def = materiaBySlug(q.materia);
  return {
    icon: (def?.icon ?? "help") as FPIconName,
    materia: def?.name ?? "General",
    slug: q.materia,
    questionId: q.id,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    text: q.text,
    options: q.options.map((text, i) => ({ text, correct: i === q.correctIndex })),
    feedback: {
      correct: `¡Correcto! ${q.explanation}`,
      incorrect: q.explanation,
      cite: q.cite,
    },
  };
}

function CuestionarioPage() {
  const { user, ready } = useRequireAuth();
  const search = Route.useSearch();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pool, setPool] = useState<BankQuestion[]>([]);
  const [sessionSlugs, setSessionSlugs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [yarisOpen, setYarisOpen] = useState(false);
  const [yarisMsgs, setYarisMsgs] = useState<YarisMsg[]>([]);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisTyping, setYarisTyping] = useState(false);
  const [yarisReplyIdx, setYarisReplyIdx] = useState(0);
  const [yarisInitialized, setYarisInitialized] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsedMin, setElapsedMin] = useState(0);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(false);
  const lastAnsweredRef = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /** Cuántas preguntas de la sesión según plan y qty solicitado. */
  function sessionCount(poolLen: number): number {
    return isPaid(user) ? Math.min(search.qty ?? 10, poolLen) : Math.min(10, poolLen);
  }

  // Construye el pool real de preguntas al montar (una sola vez).
  useEffect(() => {
    if (!ready || loaded || !user) return;
    const slugs = parseSlugs(search.materias);
    const paid = isPaid(user);
    let fullPool: BankQuestion[] = [];
    slugs.forEach((s) => {
      fullPool = fullPool.concat(paid ? getPublishedQuestions(s) : getFreeQuestions(s));
    });
    if (!paid) fullPool = fullPool.slice(0, 10);
    const picked = shuffle(fullPool)
      .slice(0, paid ? Math.min(search.qty ?? 10, fullPool.length) : Math.min(10, fullPool.length))
      .map(toLocalQ);
    setPool(fullPool);
    setSessionSlugs(slugs);
    setQuestions(picked);
    setResults(new Array(picked.length).fill(null));
    setLoaded(true);
  }, [ready, loaded, user, search.materias, search.qty]);

  const total = questions.length;
  const answeredCount = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  const progressPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMin(Math.round((Date.now() - startTime) / 60000));
    }, 10000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [yarisMsgs, yarisTyping]);

  /** Desglose por materia de las respuestas de ESTA sesión. */
  function computePorMateria(): Record<string, { correct: number; total: number }> {
    const map: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      const r = results[i];
      if (r === null || r === undefined) return;
      const e = map[q.slug] ?? { correct: 0, total: 0 };
      e.total++;
      if (r) e.correct++;
      map[q.slug] = e;
    });
    return map;
  }

  // Guarda el intento una sola vez al terminar la sesión.
  useEffect(() => {
    if (!showResult || savedRef.current || !user) return;
    savedRef.current = true;
    saveQuizAttempt({
      userId: user.id,
      materias: sessionSlugs,
      total: answeredCount,
      correct: correctCount,
      durationMin: Math.max(0, Math.round((Date.now() - startTime) / 60000)),
      porMateria: computePorMateria(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, user]);

  function handleOptionClick(optIdx: number) {
    if (answered) return;
    const isCorrect = questions[currentIdx].options[optIdx].correct;
    setSelectedIdx(optIdx);
    setAnswered(true);
    lastAnsweredRef.current = currentIdx;
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
    const fresh = shuffle(pool).slice(0, sessionCount(pool.length)).map(toLocalQ);
    setQuestions(fresh);
    setResults(new Array(fresh.length).fill(null));
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswered(false);
    setShowResult(false);
    setStartTime(Date.now());
    setElapsedMin(0);
    savedRef.current = false;
    lastAnsweredRef.current = null;
  }

  /** Contexto de Yaris: la pregunta actual (la última respondida). */
  function yarisCtx(): YarisContext {
    const idx = lastAnsweredRef.current ?? currentIdx;
    const q = questions[idx] ?? questions[currentIdx];
    if (!q) return {};
    return {
      question: {
        text: q.text,
        options: q.options.map((o) => o.text),
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        cite: q.feedback.cite,
      },
      materiaName: q.materia,
    };
  }

  function openYaris() {
    if (!yarisOpen && user) logYarisUse(user.id, "Cuestionarios");
    setYarisOpen(true);
    if (!yarisInitialized) {
      setYarisInitialized(true);
      setYarisTyping(true);
      const ctx = yarisCtx();
      const materiaName = ctx.materiaName ?? "esta materia";
      setTimeout(() => {
        setYarisTyping(false);
        setYarisMsgs([
          { role: "bot", text: `¡Hola! Soy Yaris. Veo que tienes una duda sobre <strong>${materiaName}</strong>. ¡Te explico!` },
        ]);
        setTimeout(() => {
          setYarisTyping(true);
          setTimeout(() => {
            setYarisTyping(false);
            const r = yarisReply(0, ctx);
            setYarisMsgs((prev) => [...prev, { role: "bot", text: r.t, cite: r.c ?? undefined }]);
            setYarisReplyIdx(1);
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
    const turn = yarisReplyIdx;
    setYarisReplyIdx(turn + 1);
    const r = yarisReply(turn, yarisCtx(), text);
    setTimeout(() => {
      setYarisTyping(false);
      setYarisMsgs((prev) => [...prev, { role: "bot", text: r.t, cite: r.c ?? undefined }]);
    }, 900);
  }

  function getOptionStyle(optIdx: number): React.CSSProperties {
    const opt = questions[currentIdx].options[optIdx];
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
    const opt = questions[currentIdx].options[optIdx];
    if (!answered) return { background: "#F2DCDB", color: "#647DA0" };
    if (optIdx === selectedIdx) {
      return opt.correct
        ? { background: "#2ecc71", color: "white" }
        : { background: "#e74c3c", color: "white" };
    }
    if (opt.correct) return { background: "#2ecc71", color: "white" };
    return { background: "#F2DCDB", color: "#647DA0" };
  }

  // Guard de sesión: nada que renderizar hasta estar autenticado y cargado.
  if (!ready || !loaded) {
    return <div style={{ minHeight: "100vh", background: "#f5f7fc" }} />;
  }

  const materiaLabel =
    sessionSlugs.length === 1
      ? materiaBySlug(sessionSlugs[0])?.name ?? sessionSlugs[0]
      : sessionSlugs.length === MATERIAS_DEF.length
        ? "Todas las materias"
        : "Varias materias";

  // Estado vacío: materia sin preguntas publicadas (mantiene el topbar).
  if (questions.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'Manrope', sans-serif",
          background: "#f5f7fc",
          color: "#22375C",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
                color: "#647DA0", fontSize: "0.8rem", textDecoration: "none",
                padding: "5px 10px", borderRadius: 6, border: "1px solid #F2DCDB",
                transition: "all 0.2s",
              }}
            >
              ← Salir
            </Link>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#22375C", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon n="spark" size={15} color="#3D5D91" /> Modo Aprendiendo
              </span>
              <span style={{ fontSize: "0.72rem", color: "#647DA0" }} className="hidden sm:block">
                {materiaLabel}
              </span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div
            style={{
              background: "white", borderRadius: 18, padding: 32,
              maxWidth: 480, width: "100%", textAlign: "center",
              boxShadow: "0 2px 16px rgba(61,93,145,0.07)",
            }}
          >
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
              <Icon n="help" size={40} color="#8DA1BE" />
            </div>
            <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#22375C", marginBottom: 8 }}>
              Esta materia aún no tiene preguntas publicadas
            </p>
            <p style={{ fontSize: "0.82rem", color: "#647DA0", marginBottom: 20 }}>
              Elige otra materia para practicar mientras agregamos más contenido.
            </p>
            <Link
              to="/dashboard/banco"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "12px 20px", background: "#6C0820", color: "white",
                borderRadius: 11, fontSize: "0.88rem", fontWeight: 700,
                textDecoration: "none", fontFamily: "'Manrope', sans-serif",
              }}
            >
              ← Volver al banco de preguntas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCorrectly = answered && selectedIdx !== null && currentQ.options[selectedIdx].correct;
  const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const scoreColor = scorePercent >= 70 ? "#2ecc71" : scorePercent >= 50 ? "#f39c12" : "#e74c3c";

  // Materias reales de ESTA sesión (para la pantalla de resultados).
  const sessionMaterias = Object.entries(computePorMateria()).map(([slug, v]) => {
    const def = materiaBySlug(slug);
    return {
      slug,
      name: def?.name ?? slug,
      icon: (def?.icon ?? "help") as FPIconName,
      pct: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    };
  });
  const reforzar = sessionMaterias.filter((m) => m.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, 2);
  const dominado = sessionMaterias.filter((m) => m.pct >= 70).sort((a, b) => b.pct - a.pct).slice(0, 2);
  const weakestSession = [...sessionMaterias].sort((a, b) => a.pct - b.pct)[0];

  const initials =
    (user?.nombre ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "TÚ";

  return (
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        background: "#f5f7fc",
        color: "#22375C",
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
              color: "#647DA0", fontSize: "0.8rem", textDecoration: "none",
              padding: "5px 10px", borderRadius: 6, border: "1px solid #F2DCDB",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#3D5D91"; e.currentTarget.style.borderColor = "#3D5D91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#647DA0"; e.currentTarget.style.borderColor = "#F2DCDB"; }}
          >
            ← Salir
          </Link>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#22375C", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon n="spark" size={15} color="#3D5D91" /> Modo Aprendiendo
            </span>
            <span style={{ fontSize: "0.72rem", color: "#647DA0" }} className="hidden sm:block">
              {materiaLabel} · {total} preguntas
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
              fontFamily: "'Manrope', sans-serif",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <Icon n="spark" size={16} /> <span className="hidden sm:inline">Explícamelo Yaris</span>
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
            fontSize: "0.75rem", color: "#647DA0", marginBottom: 6,
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
                <Icon n={currentQ.icon} size={14} /> {currentQ.materia}
              </div>
              <span style={{ fontSize: "0.78rem", color: "#8DA1BE", fontWeight: 600 }}>
                {currentIdx + 1} / {total}
              </span>
            </div>

            <p
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: "1.25rem",
                color: "#22375C",
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
                  <div style={{ fontSize: "0.9rem", color: "#22375C", lineHeight: 1.4, flex: 1 }}>
                    {opt.text}
                  </div>
                  {answered && (
                    <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                      {opt.correct ? <Icon n="checkCircle" size={20} color="#2ecc71" /> : (i === selectedIdx ? <Icon n="close" size={20} color="#e74c3c" /> : null)}
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
                  <span style={{ display: "flex", alignItems: "center" }}>{answeredCorrectly ? <Icon n="checkCircle" size={22} color="#1a7a4a" /> : <Icon n="close" size={22} color="#c0392b" />}</span>
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
                    marginTop: 8, padding: "4px 10px",
                    background: "rgba(61,93,145,0.07)", borderLeft: "3px solid #3D5D91",
                    borderRadius: 3, fontSize: "0.74rem", color: "#3D5D91", fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}
                >
                  <Icon n="book" size={13} /> {currentQ.feedback.cite}
                </span>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={openYaris}
                    style={{
                      padding: "8px 14px",
                      background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
                      color: "white", border: "none", borderRadius: 7,
                      fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Manrope', sans-serif",
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <Icon n="spark" size={15} /> Explícamelo Yaris
                  </button>
                  <button
                    onClick={() => setReportOpen(true)}
                    style={{
                      padding: "8px 12px",
                      background: "transparent",
                      color: "#647DA0", border: "1px solid #F2DCDB", borderRadius: 7,
                      fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Manrope', sans-serif",
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <Icon n="alert" size={14} /> Reportar
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
                color: answered ? "white" : "#8DA1BE",
                border: "none", borderRadius: 11,
                fontSize: "0.92rem", fontWeight: 700,
                cursor: answered ? "pointer" : "not-allowed",
                fontFamily: "'Manrope', sans-serif",
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
            {questions.map((_, i) => {
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
            <div style={{ marginBottom: 8, animation: "float 3s ease-in-out infinite" }}>
              <Icon n="cloud" size={72} color="#5A86CB" />
            </div>
            <h1
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: "2rem", color: "#22375C",
                marginBottom: 6, textAlign: "center",
              }}
            >
              ¡Sesión <span style={{ color: "#6C0820" }}>completada!</span>
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#647DA0", marginBottom: 28, textAlign: "center" }}>
              Aquí está tu análisis de Pathy
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
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: "4rem", fontWeight: 900,
                  color: scoreColor, lineHeight: 1, marginBottom: 4,
                }}
              >
                {scorePercent}%
              </div>
              <div style={{ fontSize: "0.85rem", color: "#647DA0", marginBottom: 20 }}>
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
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "#22375C" }}>
                      {s.num}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#8DA1BE" }}>{s.label}</div>
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
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon n="alert" size={15} /> Temas que necesitas reforzar
              </div>
              {reforzar.length === 0 ? (
                <div
                  style={{
                    padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                    fontSize: "0.84rem", background: "rgba(46,204,113,0.06)",
                    color: "#1a7a4a", fontWeight: 600,
                  }}
                >
                  ¡Nada por reforzar hoy!
                </div>
              ) : (
                reforzar.map((item) => {
                  const color = item.pct < 60 ? "#e74c3c" : "#f39c12";
                  const bg = item.pct < 60 ? "rgba(231,76,60,0.06)" : "rgba(243,156,18,0.06)";
                  return (
                    <div
                      key={item.slug}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                        fontSize: "0.84rem", background: bg,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon n={item.icon} size={15} color="#22375C" /> {item.name}</span>
                      <span style={{ color, fontWeight: 700 }}>{item.pct}%</span>
                    </div>
                  );
                })
              )}
              {dominado.length > 0 && (
                <>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 12, marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon n="check" size={15} /> Lo que dominaste
                  </div>
                  {dominado.map((item) => (
                    <div
                      key={item.slug}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                        fontSize: "0.84rem", background: "rgba(46,204,113,0.06)",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon n={item.icon} size={15} color="#22375C" /> {item.name}</span>
                      <span style={{ color: "#2ecc71", fontWeight: 700 }}>{item.pct}%</span>
                    </div>
                  ))}
                </>
              )}
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
              <span style={{ display: "flex", alignItems: "center" }}><Icon n="cloud" size={24} color="#6C0820" /></span>
              <div>
                <strong style={{ color: "#6C0820" }}>Pathy recomienda:</strong>{" "}
                {weakestSession && weakestSession.pct < 70 ? (
                  <>
                    ¡Buen trabajo! Tu punto más débil de esta sesión fue{" "}
                    <strong>{weakestSession.name}</strong> ({weakestSession.pct}% de aciertos).
                    Te recomiendo hacer una sesión de preguntas solo de esa materia. ¡Pronto la dominarás!
                  </>
                ) : (
                  <>¡Excelente sesión! Dominaste todas las materias que practicaste hoy. Sigue con este ritmo de estudio.</>
                )}
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
                  fontFamily: "'Manrope', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
              >
                <Icon n="refresh" size={16} /> Repetir sesión
              </button>
              <Link
                to="/dashboard"
                style={{
                  flex: 1, padding: 13,
                  background: "#6C0820", color: "white",
                  border: "none", borderRadius: 11,
                  fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Manrope', sans-serif",
                  textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
              >
                <Icon n="home" size={16} /> Ir al inicio
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
                <Icon n="spark" size={18} color="#3D5D91" />
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
                fontSize: "0.76rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon n="close" size={15} />
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
                  {msg.role === "bot" ? <Icon n="spark" size={15} color="#6C0820" /> : initials}
                </div>
                <div
                  style={{
                    maxWidth: "84%", padding: "9px 12px",
                    borderRadius: msg.role === "bot" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                    fontSize: "0.81rem", lineHeight: 1.55,
                    background: msg.role === "bot" ? "#f0f4ff" : "#3D5D91",
                    color: msg.role === "bot" ? "#22375C" : "white",
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
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="book" size={12} /> {msg.cite}</span>
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
                  <Icon n="spark" size={15} color="#6C0820" />
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
                fontFamily: "'Manrope', sans-serif", outline: "none",
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
              <Icon n="send" size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Reportar problema */}
      <ReportProblemModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        user={user}
        seccion="Cuestionarios"
        recurso={currentQ.questionId}
        tipoInicial="Pregunta mal redactada"
      />
    </div>
  );
}
