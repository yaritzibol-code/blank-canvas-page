import { createFileRoute, Link } from "@tanstack/react-router";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { useState, useRef, useEffect } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import {
  useRequireAuth,
  isPaid,
  canStartQuiz,
  getPublishedQuestions,
  useQuestionBank,
  ensureQuestionsByIds,
  getFreeQuestions,
  saveQuizAttempt,
  logYarisUse,
  materiaBySlug,
  MATERIAS_DEF,
  BASICA_SESSION_PER_MATERIA,
  sessionKey,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
} from "@/lib/store";
import type { BankQuestion, BankScope, YarisContext } from "@/lib/store";
import { useYarisAsk, useYarisStream, toHistory } from "@/lib/yaris-ask";
import { yarisToHtml, sanitizeHtml } from "@/lib/yaris-format";
import { PathyMark } from "@/components/shared/PathyMark";
import { ReportProblemModal } from "@/components/shared/ReportProblemModal";
import { QuestionImages } from "@/components/banco/QuestionImages";
import { PlanLimitNotice } from "@/components/shared/PlanLimitNotice";
import { UpgradeModal } from "@/components/shared/UpgradeModal";

import { LA_OFICIAL_FUENTE } from "@/lib/store/seed-linea-aerea-oficial";
import { LINEA_AEREA_OFICIAL, LINEA_AEREA_QUIZZES } from "@/lib/store/linea-aerea-meta";

export const Route = createFileRoute("/cuestionario")({
  component: CuestionarioPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { materias?: string; qty?: number; fuente?: string; banco?: "la"; fuentes?: string; modo?: "oficial" | "potenciado"; caps?: string } => {
    const out: { materias?: string; qty?: number; fuente?: string; banco?: "la"; fuentes?: string; modo?: "oficial" | "potenciado"; caps?: string } = {};
    if (typeof search.materias === "string" && search.materias) out.materias = search.materias;
    // `fuente` acota el pool a un manual del curso de Línea Aérea (ATP, PHAK…).
    if (typeof search.fuente === "string" && search.fuente) out.fuente = search.fuente.toUpperCase();
    // `banco=la` usa el banco de Línea Aérea; `fuentes` lo acota a varios manuales.
    if (search.banco === "la") out.banco = "la";
    if (typeof search.fuentes === "string" && search.fuentes) out.fuentes = search.fuentes.toUpperCase();
    // `caps` acota el banco ATP a ciertos capítulos ("1,3,8"); vacío = todos.
    if (typeof search.caps === "string" && search.caps) out.caps = search.caps;
    // `modo=oficial` limita el banco de Línea Aérea al cuestionario oficial (LAOF).
    if (search.modo === "oficial" || search.modo === "potenciado") out.modo = search.modo;
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
  /** Láminas del manual (bucket `jeppesen-images`), si el reactivo las trae. */
  imagenes?: string[];
}

interface YarisMsg {
  role: "bot" | "user";
  text: string;
  cite?: string;
  /** true mientras el modelo sigue escribiendo este mensaje. */
  streaming?: boolean;
}

const LETTERS = ["A", "B", "C", "D"];

/**
 * Red de seguridad del modo "te ayudo a pensar".
 *
 * Aunque el prompt del servidor prohíbe revelar la respuesta antes de que la
 * estudiante elija, aquí se tapa cualquier fuga: el texto literal de la opción
 * correcta y las frases del tipo "la respuesta correcta es …" se sustituyen
 * antes de pintarse en el chat.
 */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function maskAnswer(text: string, correct: string): string {
  let out = text;
  const c = correct.trim();
  if (c.length >= 4) out = out.replace(new RegExp(escapeRe(c), "gi"), "▮▮▮");
  out = out.replace(
    /\b(la\s+)?(respuesta|opci[oó]n|alternativa)\s+correcta\s+(es|ser[ií]a)[^.\n]*/gi,
    "la respuesta correcta te toca deducirla a ti",
  );
  return out;
}

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
    imagenes: q.imagenes,
    options: q.options.map((text, i) => ({ text, correct: i === q.correctIndex })),
    feedback: {
      correct: `¡Correcto! ${q.explanation}`,
      incorrect: q.explanation,
      cite: q.cite,
    },
  };
}

/** Snapshot persistido del modo Aprendiendo (se borra al finalizar). */
interface AprendiendoSnapshot {
  qIds: string[];
  results: (boolean | null)[];
  currentIdx: number;
  selectedIdx: number | null;
  answered: boolean;
  startTime: number;
  sessionSlugs: string[];
}

function CuestionarioPage() {
  const { user, ready } = useRequireAuth();
  const search = Route.useSearch();
  /**
   * Lote del banco que necesita esta sesión. El banco completo nunca se baja
   * al navegador: se piden solo las preguntas del ámbito abierto.
   */
  const bankScope: BankScope = (() => {
    const paidUser = user ? isPaid(user) : false;
    const capsList = search.caps
      ? search.caps.split(",").map((c: string) => Number(c.trim())).filter((n: number) => Number.isFinite(n))
      : [];
    if (search.fuente) {
      return {
        scope: "la" as const,
        fuentes: [search.fuente],
        ...(capsList.length > 0 && { caps: capsList }),
        limit: paidUser ? 600 : 10,
        ordered: !paidUser,
      };
    }
    if (search.banco === "la") {
      const codes = search.fuentes ? search.fuentes.split(",").map((c: string) => c.trim()).filter(Boolean) : [];
      const materiasLa = search.materias
        ? search.materias.split(",").map((m: string) => m.trim()).filter(Boolean)
        : [];
      return {
        scope: "la" as const,
        ...(search.modo === "oficial"
          ? { fuentes: [LA_OFICIAL_FUENTE] }
          : codes.length > 0 && { fuentes: [LA_OFICIAL_FUENTE, ...codes] }),
        ...(materiasLa.length > 0 && { materias: materiasLa }),
        limit: paidUser ? Math.min(Math.max((search.qty ?? 50) * 4, 200), 600) : 10,
        ordered: !paidUser,
      };
    }
    const slugs = parseSlugs(search.materias);
    return {
      scope: "ciaac" as const,
      ...(slugs.length > 0 && { materias: slugs }),
      limit: paidUser ? 200 : 10,
      ordered: !paidUser,
    };
  })();
  const bankReady = useQuestionBank(bankScope);
  /** Clave de la sesión activa: distinta por usuario y por configuración. */
  const sessionVariant = [
    search.materias ?? "all",
    search.fuente ?? "",
    search.banco ?? "",
    search.fuentes ?? "",
    search.modo ?? "",
    search.caps ?? "",
    search.qty ?? "",
  ].join("|");
  const storeKey = user ? sessionKey("aprendiendo", user.id, sessionVariant) : "";
  /**
   * A dónde vuelve "Salir": al módulo del que salió la sesión. Antes siempre
   * caía en CIAAC, así que quien entraba desde Línea Aérea acababa en otro
   * módulo al cerrar.
   */
  const exitTo: "/dashboard/banco" | "/dashboard/linea-aerea" =
    search.banco === "la" || search.fuente ? "/dashboard/linea-aerea" : "/dashboard/banco";
  /** Nombre para el historial cuando la sesión es de Línea Aérea. */
  const quizTitulo = search.fuente
    ? LINEA_AEREA_QUIZZES.find((q) => q.code === search.fuente)?.titulo
    : search.banco === "la" && search.modo === "oficial"
      ? LINEA_AEREA_OFICIAL.titulo
      : undefined;
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
  const askYaris = useYarisAsk();
  const streamYaris = useYarisStream();
  /** Preguntas ya explicadas por Yaris (para pedir otro enfoque al repetir). */
  const yarisExplainedRef = useRef<Set<string>>(new Set());
  const yarisBusyRef = useRef(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsedMin, setElapsedMin] = useState(0);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  /** Caja de mensajes de Yaris: se desplaza sola, sin mover la página. */
  const msgsBoxRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(false);
  const lastAnsweredRef = useRef<number | null>(null);

  useEffect(() => {
    // <1024px (móvil + iPad vertical) usa hoja inferior: con el panel lateral
    // de 340px la pregunta quedaba amontonada en tablets.
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);


  /**
   * Arma la sesión desde el pool según el plan:
   *  - Pro: `qty` preguntas barajadas de todo el pool.
   *  - Básica: 2 preguntas de cada materia elegida, tomadas al azar de su
   *    pool fijo de 10 (la sesión mezcla materias en lugar de agotar una sola).
   */
  function pickSession(fromPool: BankQuestion[], paid: boolean): BankQuestion[] {
    // Con `fuente` la sesión es el manual completo (50 preguntas) salvo que se
    // pida otra cantidad explícita.
    if (search.fuente)
      return shuffle(fromPool).slice(0, Math.min(search.qty ?? fromPool.length, fromPool.length));
    if (search.banco === "la")
      return shuffle(fromPool).slice(0, Math.min(search.qty ?? (paid ? 50 : 10), fromPool.length));
    if (paid) return shuffle(fromPool).slice(0, Math.min(search.qty ?? 10, fromPool.length));
    const byMateria = new Map<string, BankQuestion[]>();
    fromPool.forEach((q) => {
      const list = byMateria.get(q.materia) ?? [];
      list.push(q);
      byMateria.set(q.materia, list);
    });
    const picked: BankQuestion[] = [];
    byMateria.forEach((qs) => {
      picked.push(...shuffle(qs).slice(0, BASICA_SESSION_PER_MATERIA));
    });
    return shuffle(picked);
  }

  // Construye el pool real de preguntas al montar (una sola vez).
  useEffect(() => {
    if (!ready || !bankReady || loaded || !user) return;
    let alive = true;
    void (async () => {
    const slugs = parseSlugs(search.materias);
    const paid = isPaid(user);
    let fullPool: BankQuestion[] = [];
    if (search.fuente) {
      // Cuestionario de un manual completo (curso de Línea Aérea): se toma el
      // lote publicado sin recortar por materia para no perder preguntas.
      const caps = search.caps
        ? search.caps.split(",").map((c: string) => Number(c.trim())).filter((n: number) => Number.isFinite(n))
        : [];
      const all = getPublishedQuestions().filter(
        (q) => q.fuente === search.fuente && (caps.length === 0 || caps.includes(Number(q.capitulo))),
      );
      fullPool = paid ? all : all.slice(0, 10);
    } else if (search.banco === "la") {
      // Banco de Línea Aérea (opcionalmente acotado a manuales y/o a materias:
      // las tarjetas del módulo abren el oficial por materia).
      const codes = search.fuentes ? search.fuentes.split(",").map((c: string) => c.trim()).filter(Boolean) : [];
      const materiasLa = search.materias
        ? search.materias.split(",").map((m: string) => m.trim()).filter(Boolean)
        : null;
      const all = getPublishedQuestions().filter((q) => {
        if (!q.fuente) return false; // nunca preguntas CIAAC en el banco de Línea Aérea
        if (materiasLa && !materiasLa.includes(q.materia)) return false;
        if (search.modo === "oficial") return q.fuente === LA_OFICIAL_FUENTE;
        return q.fuente === LA_OFICIAL_FUENTE || codes.length === 0 || codes.includes(q.fuente);
      });
      fullPool = paid ? all : all.slice(0, 10);
    } else {
      slugs.forEach((s) => {
        fullPool = fullPool.concat(paid ? getPublishedQuestions(s) : getFreeQuestions(s));
      });
    }
    // Sesión en curso: se retoma tal cual hasta que el usuario finalice. El
    // lote actual es aleatorio, así que se recuperan sus preguntas por id.
    const snap = storeKey ? loadActiveSession<AprendiendoSnapshot>(storeKey) : null;
    if (snap && snap.qIds.length > 0) {
      await ensureQuestionsByIds(snap.qIds);
      if (!alive) return;
      const byId = new Map(getPublishedQuestions().map((q) => [q.id, q]));
      const restored = snap.qIds.map((id) => byId.get(id)).filter((q): q is BankQuestion => !!q);
      if (restored.length === snap.qIds.length) {
        setPool(fullPool);
        setSessionSlugs(snap.sessionSlugs.length > 0 ? snap.sessionSlugs : slugs);
        setQuestions(restored.map(toLocalQ));
        setResults(snap.results);
        setCurrentIdx(Math.min(snap.currentIdx, restored.length - 1));
        setSelectedIdx(snap.selectedIdx);
        setAnswered(snap.answered);
        setStartTime(snap.startTime);
        setLoaded(true);
        return;
      }
      clearActiveSession(storeKey);
    }

    const picked = pickSession(fullPool, paid).map(toLocalQ);
    if (!alive) return;
    setPool(fullPool);
    setSessionSlugs(slugs);
    setQuestions(picked);
    setResults(new Array(picked.length).fill(null));
    setLoaded(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, bankReady, loaded, user, search.materias, search.qty, search.fuente, search.banco, search.fuentes, search.modo, search.caps]);

  const total = questions.length;
  const answeredCount = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  const progressPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  /** Persiste el avance en cada cambio; al finalizar se borra el snapshot. */
  useEffect(() => {
    if (!loaded || !storeKey || questions.length === 0) return;
    if (showResult) {
      clearActiveSession(storeKey);
      return;
    }
    saveActiveSession<AprendiendoSnapshot>(storeKey, {
      qIds: questions.map((q) => q.questionId),
      results,
      currentIdx,
      selectedIdx,
      answered,
      startTime,
      sessionSlugs,
    });
  }, [loaded, storeKey, questions, results, currentIdx, selectedIdx, answered, startTime, sessionSlugs, showResult]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMin(Math.round((Date.now() - startTime) / 60000));
    }, 10000);
    return () => clearInterval(interval);
  }, [startTime]);

  // El chat baja SOLO su propio contenedor. Con `scrollIntoView` el navegador
  // arrastraba también la página y la pantalla se iba hasta abajo.
  useEffect(() => {
    const box = msgsBoxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
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
      // Los cuestionarios de Línea Aérea se identifican por manual o guía,
      // no por materia: el historial los muestra con su nombre real.
      ...(quizTitulo ? { titulo: quizTitulo } : {}),
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
    if (storeKey) clearActiveSession(storeKey);
    const fresh = pickSession(pool, isPaid(user)).map(toLocalQ);
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

  /**
   * Índice de la pregunta sobre la que trabaja Yaris: siempre la que está en
   * pantalla. Sólo se usa la última respondida cuando ya se contestó, para
   * conservar el contexto tras el feedback.
   */
  function yarisIdx(): number {
    return answered ? (lastAnsweredRef.current ?? currentIdx) : currentIdx;
  }

  /** Contexto de Yaris: la pregunta en pantalla. */
  function yarisCtx(): YarisContext {
    const idx = yarisIdx();
    const q = questions[idx] ?? questions[currentIdx];
    if (!q) return {};
    // Si todavía no elige respuesta, Yaris entra en modo "te ayudo a pensar":
    // guía el razonamiento sin revelar la correcta.
    const preAnswer = idx === currentIdx && !answered;
    return {
      question: {
        text: q.text,
        options: q.options.map((o) => o.text),
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        cite: q.feedback.cite,
      },
      userSelectedIndex: preAnswer ? -1 : (selectedIdx ?? -1),
      ...(preAnswer && { preAnswer: true }),
      materiaName: q.materia,
    };
  }

  /**
   * Cada pulsación de "Explícamelo Yaris" pide una explicación de la pregunta
   * que está en pantalla. Antes sólo funcionaba la primera vez (un flag de
   * inicialización cortaba la llamada), así que al avanzar de pregunta el panel
   * seguía mostrando la explicación vieja.
   */
  async function openYaris() {
    if (!yarisOpen && user) logYarisUse(user.id, "Cuestionarios");
    setYarisOpen(true);
    if (yarisBusyRef.current) return;

    const idx = yarisIdx();
    const q = questions[idx] ?? questions[currentIdx];
    if (!q) return;
    const ctx = yarisCtx();
    const key = q.questionId || `idx-${idx}`;
    const again = yarisExplainedRef.current.has(key);
    if (!ctx.preAnswer) yarisExplainedRef.current.add(key);
    yarisBusyRef.current = true;

    const pensar = !!ctx.preAnswer;
    setYarisMsgs((prev) => [
      ...(prev.length === 0
        ? [{ role: "bot" as const, text: "¡Hola! Soy <b>Yaris</b>. Púlsame en cualquier pregunta las veces que necesites y te la explico." }]
        : []),
      ...prev,
      {
        role: "bot" as const,
        // Sin nombrar la materia: el chat tampoco debe adelantar el tema.
        text: pensar
          ? `Aún no respondes la <b>pregunta ${idx + 1}</b>, así que te ayudo a pensarla <i>sin darte la respuesta</i>:`
          : again
            ? `Va otra vez la <b>pregunta ${idx + 1}</b>, ahora con otro enfoque:`
            : `Vamos con la <b>pregunta ${idx + 1}</b>:`,
      },
    ]);
    setYarisTyping(true);
    const answer = await streamInto([
      {
        role: "user" as const,
        content: pensar
          ? "Todavía no respondo esta pregunta. NO me digas cuál es la correcta: explícame el concepto que se está evaluando, qué significan los términos clave y hazme preguntas guía para que yo razone y elija."
          : again
            ? "Explícame esta misma pregunta otra vez, pero de otra forma más sencilla, con otro ejemplo o analogía."
            : "Explícame esta pregunta: por qué la correcta es correcta, por qué las demás no, y un tip para recordarlo.",
      },
    ], ctx);
    yarisBusyRef.current = false;
    void answer;
  }

  /**
   * Pide la respuesta y la escribe en el chat conforme llega del modelo.
   *
   * Se reserva un mensaje vacío y cada fragmento lo va rellenando, así que la
   * estudiante ve generarse el texto en vez de esperar en blanco. Si el
   * streaming no está disponible, `streamYaris` cae a la petición normal y el
   * mensaje se completa de una sola vez.
   */
  async function streamInto(
    history: Array<{ role: "user" | "assistant"; content: string }>,
    ctx: ReturnType<typeof yarisCtx>,
  ) {
    // En modo "te ayudo a pensar" todo lo que escribe el modelo pasa por el
    // filtro: si intenta soltar la correcta, se tapa antes de verse.
    const guard = ctx.preAnswer ? (ctx.question?.options[ctx.question.correctIndex] ?? "") : "";
    const clean = (s: string) => (guard ? maskAnswer(s, guard) : s);
    let slot = -1;
    setYarisMsgs((prev) => {
      slot = prev.length;
      return [...prev, { role: "bot" as const, text: "", streaming: true }];
    });
    let plain = "";
    const answer = await streamYaris({
      history,
      ctx,
      onDelta: (chunk) => {
        plain += chunk;
        const html = yarisToHtml(clean(plain));
        setYarisMsgs((prev) => {
          const copy = [...prev];
          if (copy[slot]) copy[slot] = { ...copy[slot], text: html, streaming: true };
          return copy;
        });
      },
    });
    setYarisTyping(false);
    setYarisMsgs((prev) => {
      const copy = [...prev];
      if (copy[slot]) copy[slot] = { role: "bot", text: clean(answer.text), cite: answer.cite ?? undefined };
      return copy;
    });
    return answer;
  }

  async function sendYarisMsg() {
    const text = yarisInput.trim();
    if (!text || yarisTyping || yarisBusyRef.current) return;
    const next: YarisMsg[] = [...yarisMsgs, { role: "user", text }];
    setYarisMsgs(next);
    setYarisInput("");
    setYarisTyping(true);
    await streamInto(
      toHistory(next.map((m) => ({ text: m.text, fromUser: m.role === "user" }))),
      yarisCtx(),
    );
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
          // Alto fijo: la pantalla no crece con el chat, cada panel scrollea
          // por dentro y Yaris queda contenida en lo que se ve.
          height: "100dvh",
          minHeight: "100dvh",
          overflow: "hidden",
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
              to={exitTo}
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
              to={exitTo}
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
  /** Yaris guía sin revelar mientras no haya respuesta elegida. */
  const thinkMode = !answered;
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

  const quizGate = canStartQuiz(user);
  if (ready && user && !quizGate.allowed) {
    return (
      <PlanLimitNotice
        title="Límite del plan Básica alcanzado"
        description={quizGate.reason}
      />
    );
  }
  

  return (
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        background: "#f5f7fc",
        color: "#22375C",
        height: "100dvh",
        minHeight: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",

      }}
    >
      {/* ── TOPBAR ── */}
      <div
        className="px-3 sm:px-6"
        style={{
          background: "white",
          borderBottom: "1px solid rgba(61,93,145,0.08)",
          minHeight: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          position: "sticky",
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Link
            to={exitTo}
            aria-label="Salir del cuestionario"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              color: "#3D5D91", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
              minHeight: 44, minWidth: 44, padding: "0 12px", borderRadius: 8,
              border: "1px solid #C9D4E5", flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#22375C"; e.currentTarget.style.borderColor = "#3D5D91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#3D5D91"; e.currentTarget.style.borderColor = "#C9D4E5"; }}
          >
            <span aria-hidden="true">←</span> Salir
          </Link>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#22375C", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon n="spark" size={15} color="#3D5D91" /> <span className="truncate">Modo Aprendiendo</span>
            </span>
            <span style={{ fontSize: "0.74rem", color: "#5A6F92" }} className="hidden md:block truncate">
              {materiaLabel} · {total} preguntas
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div
            className="hidden sm:block"
            style={{
              background: "#F2DCDB", color: "#6C0820",
              padding: "6px 14px", borderRadius: 20,
              fontSize: "0.82rem", fontWeight: 700, whiteSpace: "nowrap",
            }}
          >
            Pregunta {currentIdx + 1} de {total}
          </div>
          <button
            onClick={openYaris}
            aria-label={thinkMode ? "Abrir Yaris en modo te ayudo a pensar" : "Abrir Yaris para que explique la pregunta"}
            style={{
              minHeight: 44, minWidth: 44, padding: "0 12px",
              background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
              color: "white", border: "none", borderRadius: 9,
              fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Icon n={thinkMode ? "lightbulb" : "spark"} size={17} />
            <span className="hidden lg:inline">{thinkMode ? "Ayúdame a pensar" : "Explícamelo Yaris"}</span>
          </button>
          <button
            onClick={() => {
              if (answeredCount === 0 || window.confirm("¿Finalizar la sesión? Se guardará tu resultado y no podrás retomarla.")) {
                setShowResult(true);
              }
            }}
            aria-label="Finalizar sesión de estudio"
            style={{
              minHeight: 44, minWidth: 44, padding: "0 14px",
              background: "#6C0820",
              color: "white", border: "none", borderRadius: 9,
              fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Finalizar
          </button>
        </div>
      </div>



      {/* ── PROGRESS BAR ── */}
      <div
        className="px-3 sm:px-6"
        style={{
          background: "white",
          paddingBottom: 12,
          borderBottom: "1px solid rgba(61,93,145,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 8,
            fontSize: "0.76rem", color: "#5A6F92", marginBottom: 6,
          }}
        >
          <span>Progreso de la sesión</span>
          <strong style={{ color: "#22375C", whiteSpace: "nowrap" }}>{answeredCount}/{total} respondidas</strong>
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
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

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
            {/* Sin etiqueta de materia: la pregunta no debe adelantar el tema. */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 20 }}>
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

            <QuestionImages files={currentQ.imagenes} />



            {/* Options — botones reales: foco por teclado y toque ≥48px */}
            <div role="group" aria-label="Opciones de respuesta" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleOptionClick(i)}
                  disabled={answered}
                  aria-pressed={selectedIdx === i}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", borderRadius: 12,
                    minHeight: 56, width: "100%", textAlign: "left",
                    font: "inherit", cursor: answered ? "default" : "pointer",
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
                  <span
                    aria-hidden="true"
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.82rem", fontWeight: 700, flexShrink: 0,
                      transition: "all 0.2s",
                      ...getLetterStyle(i),
                    }}
                  >
                    {LETTERS[i]}
                  </span>
                  <span style={{ fontSize: "0.95rem", color: "#22375C", lineHeight: 1.45, flex: 1 }}>
                    {opt.text}
                  </span>
                  {answered && (
                    <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                      {opt.correct ? <Icon n="checkCircle" size={20} color="#1a7a4a" /> : (i === selectedIdx ? <Icon n="close" size={20} color="#c0392b" /> : null)}
                    </span>
                  )}
                </button>
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
                {currentQ.feedback.cite && (
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
                )}
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={openYaris}
                    style={{
                      minHeight: 44, padding: "0 16px",
                      background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
                      color: "white", border: "none", borderRadius: 9,
                      fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Manrope', sans-serif",
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <YarisAvatar size={20} /> Explícamelo Yaris
                  </button>
                  <button
                    onClick={() => setReportOpen(true)}
                    style={{
                      minHeight: 44, padding: "0 14px",
                      background: "transparent",
                      color: "#3D5D91", border: "1px solid #C9D4E5", borderRadius: 9,
                      fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
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

          {/* Mini tracker — decorativo: el conteo real ya se anuncia arriba */}
          <div aria-hidden="true" style={{ maxWidth: 680, width: "100%", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {questions.map((_, i) => {
              const res = results[i];
              const isCurrent = i === currentIdx && !showResult;
              let bg = "#E2C9C8";
              let boxShadow = "none";
              if (isCurrent) {
                bg = "#3D5D91";
                boxShadow = "0 0 0 2px white, 0 0 0 4px #3D5D91";
              } else if (res === true) {
                bg = "#1a7a4a";
              } else if (res === false) {
                bg = "#c0392b";
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
            <div style={{ marginBottom: 8 }}>
              <PathyMark size={92} float />
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
              <PathyMark size={28} />
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
                  // Hoja inferior con altura acotada: a pantalla completa el
                  // chat tapaba la pregunta y había que cerrarlo para releerla.
                  position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 200,
                  height: "min(62dvh, 460px)",
                  width: "100%", display: "flex", flexDirection: "column",
                  background: "white",
                  borderTop: "1px solid rgba(61,93,145,0.12)",
                  borderRadius: "18px 18px 0 0",
                  boxShadow: "0 -18px 40px -16px rgba(15,26,51,0.35)",
                  overflow: "hidden",
                }
              : {
                  width: yarisOpen ? 340 : 0,
                  height: "100%",
                  minHeight: 0,
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
                <YarisAvatar size={30} />
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "white" }}>Yaris IA</div>
                <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>
                  {thinkMode ? "Modo guía · no revela la respuesta" : "Tutora de aviación 24/7"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setYarisOpen(false)}
              aria-label="Cerrar el chat de Yaris"
              style={{
                background: "rgba(255,255,255,0.22)", border: "none", color: "white",
                borderRadius: 10, minWidth: 44, minHeight: 44, cursor: "pointer",
                fontSize: "0.76rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon n="close" size={18} />
            </button>
          </div>

          {/* Indicador de modo "te ayudo a pensar" */}
          {thinkMode && (
            <div
              role="status"
              aria-live="polite"
              style={{
                flexShrink: 0,
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "10px 14px",
                // Fondo sólido y tinta oscura: sobre el degradado translúcido
                // anterior el texto no alcanzaba contraste AA.
                background: "#FFF4DE",
                borderBottom: "1px solid #E0A93C",
                color: "#6B4200",
                fontSize: "0.78rem", lineHeight: 1.5, fontWeight: 500,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"><Icon n="lightbulb" size={15} color="#8a5a00" /></span>
              <span>
                <b>Modo “te ayudo a pensar”.</b> Aún no eliges opción, así que Yaris te guía con
                conceptos y preguntas: no te dará la respuesta hasta que marques una.
              </span>
            </div>
          )}


          {/* Messages */}
          <div
            ref={msgsBoxRef}
            style={{
              flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: 14,
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
                  {msg.role === "bot" ? <YarisAvatar size={24} /> : initials}
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
                  <span className="yaris-md" dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
                  {msg.streaming && <span className="yaris-caret" aria-hidden="true" />}
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
                  <YarisAvatar size={24} />
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
              padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
              borderTop: "1px solid #F2DCDB",
              display: "flex", gap: 8, alignItems: "center", flexShrink: 0,
            }}
          >
            <input
              value={yarisInput}
              onChange={(e) => setYarisInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendYarisMsg(); }}
              aria-label="Escribe tu mensaje para Yaris"
              placeholder={thinkMode ? "Pregúntame conceptos, no la respuesta..." : "Escribe tu duda..."}
              style={{
                flex: 1, border: "2px solid #C9D4E5", borderRadius: 22,
                // 16px evita el zoom automático de iOS al enfocar el campo.
                padding: "11px 14px", fontSize: "16px", minHeight: 44,
                color: "#22375C",
                fontFamily: "'Manrope', sans-serif", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#C9D4E5"; }}
            />
            <button
              onClick={sendYarisMsg}
              aria-label="Enviar mensaje a Yaris"
              style={{
                width: 44, height: 44, background: "#3D5D91", border: "none",
                borderRadius: "50%", color: "white", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.82rem", flexShrink: 0,
              }}
            >
              <Icon n="send" size={17} />
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
        pregunta={{
          id: currentQ.questionId,
          text: currentQ.text,
          options: currentQ.options.map((o) => o.text),
          correctIndex: currentQ.correctIndex,
          explanation: currentQ.explanation,
          materia: currentQ.slug,
          selectedIndex: selectedIdx,
        }}
      />

    </div>
  );
}
