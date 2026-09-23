import { QuestionFrame } from "@/components/flightdeck/QuestionFrame";
import { setPresenceActivity } from "@/lib/presence";
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
  sessionKey,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
} from "@/lib/store";
import type { AttemptAnswer, BankQuestion, BankScope, YarisContext } from "@/lib/store";
import { PathyDebrief } from "@/components/shared/PathyDebrief";
import { useYarisAsk, useYarisStream, toHistory } from "@/lib/yaris-ask";
import { yarisToHtml, sanitizeHtml } from "@/lib/yaris-format";
import { PathyMark } from "@/components/shared/PathyMark";
import { ReportProblemModal } from "@/components/shared/ReportProblemModal";
import { QuestionImages } from "@/components/banco/QuestionImages";
import { QuizQuestionNavigator } from "@/components/banco/QuizQuestionNavigator";
import { PlanLimitNotice } from "@/components/shared/PlanLimitNotice";
import knowledgeQuestionImage from "@/assets/question-knowledge-default.jpg";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import {
  FREE_CIAAC_MAX,
  FREE_LIMITS,
  consumeFree,
  hasFreeLeft,
  isFreeSource,
  useFreeQuota,
} from "@/lib/store/free-quota";

import {
  LA_OFICIAL_FUENTE,
  LINEA_AEREA_OFICIAL,
  LINEA_AEREA_QUIZZES,
  esPreguntaHelicoptero,
} from "@/lib/store/linea-aerea-meta";

export const Route = createFileRoute("/cuestionario")({
  component: () => <QuestionFrame><CuestionarioPage/></QuestionFrame>,
  validateSearch: (
    search: Record<string, unknown>,
  ): { materias?: string; qty?: number; fuente?: string; banco?: "la"; fuentes?: string; modo?: "oficial" | "potenciado"; caps?: string; parts?: string; sinHeli?: boolean } => {
    const out: { materias?: string; qty?: number; fuente?: string; banco?: "la"; fuentes?: string; modo?: "oficial" | "potenciado"; caps?: string; parts?: string; sinHeli?: boolean } = {};
    if (typeof search.materias === "string" && search.materias) out.materias = search.materias;
    // `fuente` acota el pool a un manual del curso de Línea Aérea (ATP, PHAK…).
    if (typeof search.fuente === "string" && search.fuente) out.fuente = search.fuente.toUpperCase();
    // `banco=la` usa el banco de Línea Aérea; `fuentes` lo acota a varios manuales.
    if (search.banco === "la") out.banco = "la";
    if (typeof search.fuentes === "string" && search.fuentes) out.fuentes = search.fuentes.toUpperCase();
    // `caps` acota el banco ATP a ciertos capítulos ("1,3,8"); vacío = todos.
    // Puede llegar como número ("caps=1") si el navegador lo interpreta así.
    if (typeof search.caps === "string" && search.caps) out.caps = search.caps;
    else if (typeof search.caps === "number" && Number.isFinite(search.caps)) out.caps = String(search.caps);
    if (typeof search.parts === "string" && search.parts) out.parts = search.parts;
    // `sinHeli` (ATP) deja fuera los reactivos de helicóptero; se acepta 1/"1"/"true".
    if (
      search.sinHeli === true ||
      search.sinHeli === 1 ||
      search.sinHeli === "1" ||
      search.sinHeli === "true"
    )
      out.sinHeli = true;
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
  /** Manual de origen: define el bucket de figuras (ATP / Jeppesen). */
  fuente?: string;
  capitulo?: number;
  capituloTitulo?: string;
  seccion?: string;
  /** La estudiante escribe la respuesta (abreviaturas Jeppesen). */
  abierta?: boolean;
  /** Variantes que se dan por buenas en una pregunta escrita. */
  aceptadas?: string[];
}

/** Normaliza una respuesta escrita: sin acentos, signos ni espacios de más. */
function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    fuente: q.fuente,
    capitulo: q.capitulo,
    capituloTitulo: q.capituloTitulo,
    seccion: q.seccion,
    abierta: q.tipo === "abierta",
    aceptadas: q.aceptadas,
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
  highestVisitedIdx?: number;
  picks?: (number | null)[];
  openResponses?: string[];
  selectedIdx: number | null;
  answered: boolean;
  startTime: number;
  sessionSlugs: string[];
}

function CuestionarioPage() {
  const { user, ready } = useRequireAuth();
  const search = Route.useSearch();
  // Presencia en vivo para el panel admin.
  useEffect(() => {
    const etiqueta = search.fuente
      ? `Cuestionario ${search.fuente}${search.caps ? ` · cap. ${search.caps}` : ""}${search.sinHeli ? " · sin helicópteros" : ""}`
      : search.banco === "la"
        ? "Cuestionario de línea aérea"
        : "Cuestionario CIAAC";
    setPresenceActivity(etiqueta);
    return () => setPresenceActivity(null);
  }, [search.fuente, search.caps, search.banco, search.sinHeli]);
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
        // El plan gratuito abre ATP y Handbook con su cuota de 50 preguntas.
        limit: paidUser ? 600 : isFreeSource(search.fuente) ? FREE_LIMITS.preguntas : 10,
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
    search.sinHeli ? "sinHeli" : "",
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
  /** Pregunta visible; puede estar detrás de la frontera sin reducir el avance. */
  const [currentIdx, setCurrentIdx] = useState(0);
  /** Índice máximo alcanzado mediante el avance normal de la sesión. */
  const [highestVisitedIdx, setHighestVisitedIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  /** Texto escrito en las preguntas de respuesta abierta. */
  const [openInput, setOpenInput] = useState("");
  const [results, setResults] = useState<(boolean | null)[]>([]);
  /** Opción elegida por pregunta (para el informe real de Pathy). */
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [openResponses, setOpenResponses] = useState<string[]>([]);
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
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(() => new Set());
  /** Popup de suscripción cuando el plan Básica toca una función Pro. */
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<"yaris" | "preguntas">("yaris");
  /** Cuota gratuita de preguntas (ATP / Handbook) del plan Básica. */
  const preguntasGratis = useFreeQuota(user, "preguntas");
  const fuenteGratis = isFreeSource(search.fuente);

  const [isMobile, setIsMobile] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsedMin, setElapsedMin] = useState(0);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  /** Caja de mensajes de Yaris: se desplaza sola, sin mover la página. */
  const msgsBoxRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(false);

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
    // Plan gratuito en CIAAC: sesión de 25 reactivos como máximo, repartidos
    // por turnos entre las materias elegidas para que ninguna quede fuera.
    const byMateria = new Map<string, BankQuestion[]>();
    fromPool.forEach((q) => {
      const list = byMateria.get(q.materia) ?? [];
      list.push(q);
      byMateria.set(q.materia, list);
    });
    const colas = [...byMateria.values()].map((qs) => shuffle(qs));
    const tope = Math.min(FREE_CIAAC_MAX, search.qty ?? FREE_CIAAC_MAX, fromPool.length);
    const picked: BankQuestion[] = [];
    let vuelta = 0;
    while (picked.length < tope && colas.some((c) => c.length > vuelta)) {
      for (const cola of colas) {
        if (picked.length >= tope) break;
        const q = cola[vuelta];
        if (q) picked.push(q);
      }
      vuelta += 1;
    }
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
      const parts = search.parts ? search.parts.split("|").filter(Boolean) : [];
      // `sinHeli` (casilla del selector ATP): fuera los reactivos de helicóptero.
      const all = getPublishedQuestions().filter(
        (q) =>
          q.fuente === search.fuente &&
          (parts.length > 0
            ? parts.some((part) => {
                const [cap, section] = part.split(":");
                return Number(cap) === Number(q.capitulo) && (!section || section === q.seccion);
              })
            : caps.length === 0 || caps.includes(Number(q.capitulo))) &&
          !(search.sinHeli && esPreguntaHelicoptero(q)),
      );
      fullPool = paid
        ? all
        : all.slice(0, isFreeSource(search.fuente) ? Math.max(0, preguntasGratis.remaining) : 10);
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
        const restoredResults = restored.map((_, i) => snap.results[i] ?? null);
        const savedIdx = Number.isInteger(snap.currentIdx) ? snap.currentIdx : 0;
        const restoredPicks = restored.map((_, i) =>
          snap.picks?.[i] ?? (i === savedIdx ? snap.selectedIdx : null));
        const firstUnanswered = restoredResults.findIndex((result) => result === null);
        const completedPrefix = firstUnanswered === -1 ? restored.length - 1 : firstUnanswered;
        const savedFrontier = Number.isInteger(snap.highestVisitedIdx)
          ? snap.highestVisitedIdx! : savedIdx;
        const frontier = Math.min(
          Math.max(0, savedFrontier), completedPrefix, restored.length - 1);
        const displayed = Math.min(Math.max(0, savedIdx), frontier);
        setResults(restoredResults);
        setPicks(restoredPicks);
        setOpenResponses(restored.map((_, i) => snap.openResponses?.[i] ?? ""));
        setHighestVisitedIdx(frontier);
        setCurrentIdx(displayed);
        setSelectedIdx(restoredPicks[displayed]);
        setAnswered(restoredResults[displayed] !== null);
        setOpenInput(snap.openResponses?.[displayed] ?? "");
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
    setPicks(new Array(picked.length).fill(null));
    setOpenResponses(new Array(picked.length).fill(""));
    setHighestVisitedIdx(0);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswered(false);
    setOpenInput("");
    setLoaded(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, bankReady, loaded, user, search.materias, search.qty, search.fuente, search.banco, search.fuentes, search.modo, search.caps, search.sinHeli]);

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
      highestVisitedIdx,
      picks,
      openResponses,
      selectedIdx,
      answered,
      startTime,
      sessionSlugs,
    });
  }, [loaded, storeKey, questions, results, currentIdx, highestVisitedIdx, picks, openResponses, selectedIdx, answered, startTime, sessionSlugs, showResult]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMin(Math.round((Date.now() - startTime) / 60000));
    }, 10000);
    return () => clearInterval(interval);
  }, [startTime]);

  // El chat baja SOLO su propio contenedor. Con `scrollIntoView` el navegador
  // arrastraba también la página y la pantalla se iba hasta abajo.
  // El chat NO persigue la respuesta en streaming: solo baja cuando el propio
  // estudiante manda un mensaje o pulsa "Explícamelo Yaris" / "Ayúdame a
  // pensar". Mientras Yaris escribe, la vista se queda donde está.
  /**
   * Deja el ÚLTIMO mensaje del estudiante arriba del todo (estilo ChatGPT):
   * así la respuesta de Yaris se lee de arriba hacia abajo en vez de tener que
   * perseguirla al fondo de la caja.
   */
  const scrollChat = () => {
    requestAnimationFrame(() => {
      const box = msgsBoxRef.current;
      if (!box) return;
      const mine = box.querySelectorAll<HTMLElement>('[data-msg-role="user"]');
      const last = mine[mine.length - 1];
      box.scrollTop = last ? Math.max(0, last.offsetTop - box.offsetTop - 8) : box.scrollHeight;
    });
  };
  useEffect(() => {
    if (yarisMsgs[yarisMsgs.length - 1]?.role !== "user") return;
    scrollChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yarisMsgs]);


  /** Detalle por pregunta de ESTA sesión (base del informe de Pathy). */
  function sessionAnswers(): AttemptAnswer[] {
    const out: AttemptAnswer[] = [];
    questions.forEach((q, i) => {
      const r = results[i];
      if (r === null || r === undefined) return;
      const picked = picks[i];
      out.push({
        questionId: q.questionId,
        materia: q.slug,
        ...(q.fuente ? { fuente: q.fuente } : {}),
        ...(q.capitulo !== undefined ? { capitulo: q.capitulo } : {}),
        ...(q.capituloTitulo ? { capituloTitulo: q.capituloTitulo } : {}),
        ...(q.seccion ? { seccion: q.seccion } : {}),
        selectedIndex: typeof picked === "number" ? picked : -1,
        correctIndex: q.correctIndex,
      });
    });
    return out;
  }

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
      answers: sessionAnswers(),
      // Los cuestionarios de Línea Aérea se identifican por manual o guía,
      // no por materia: el historial los muestra con su nombre real.
      ...(quizTitulo ? { titulo: quizTitulo } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, user]);

  function handleOptionClick(optIdx: number) {
    if (answered || results[currentIdx] != null || currentIdx > highestVisitedIdx) return;
    // Cada pregunta respondida descuenta de las 50 gratis de ATP / Handbook.
    if (fuenteGratis && user && !isPaid(user)) {
      if (!hasFreeLeft(user, "preguntas")) {
        setUpgradeFeature("preguntas");
        setUpgradeOpen(true);
        return;
      }
      consumeFree(user, "preguntas");
    }
    const isCorrect = questions[currentIdx].options[optIdx].correct;
    setSelectedIdx(optIdx);
    setAnswered(true);
    const newResults = [...results];
    newResults[currentIdx] = isCorrect;
    setResults(newResults);
    setPicks((prev) => {
      const next = [...prev];
      next[currentIdx] = optIdx;
      return next;
    });
  }

  /**
   * Respuesta escrita (abreviaturas Jeppesen): se compara sin acentos ni
   * signos contra la respuesta modelo y sus variantes aceptadas.
   */
  function handleOpenSubmit() {
    if (answered || results[currentIdx] != null || currentIdx > highestVisitedIdx) return;
    const q = questions[currentIdx];
    const escrito = normalizar(openInput);
    if (!escrito) return;
    if (fuenteGratis && user && !isPaid(user)) {
      if (!hasFreeLeft(user, "preguntas")) {
        setUpgradeFeature("preguntas");
        setUpgradeOpen(true);
        return;
      }
      consumeFree(user, "preguntas");
    }
    const validas = [...(q.aceptadas ?? []), ...q.options.map((o) => o.text)].map(normalizar);
    const isCorrect = validas.some((v) => v === escrito);
    setSelectedIdx(isCorrect ? q.correctIndex : -1);
    setAnswered(true);
    const newResults = [...results];
    newResults[currentIdx] = isCorrect;
    setResults(newResults);
    setOpenResponses((prev) => {
      const next = [...prev];
      next[currentIdx] = openInput;
      return next;
    });
    setPicks((prev) => {
      const next = [...prev];
      next[currentIdx] = isCorrect ? q.correctIndex : -1;
      return next;
    });
  }

  function showVisitedQuestion(idx: number) {
    if (!Number.isInteger(idx) || idx < 0 || idx > highestVisitedIdx || idx >= total) return;
    setCurrentIdx(idx);
    setSelectedIdx(picks[idx] ?? null);
    setAnswered(results[idx] != null);
    setOpenInput(openResponses[idx] ?? "");
  }

  function handleNext() {
    if (currentIdx < highestVisitedIdx) {
      showVisitedQuestion(currentIdx + 1);
      return;
    }
    if (currentIdx !== highestVisitedIdx || results[currentIdx] == null) return;
    if (currentIdx + 1 >= total) {
      setShowResult(true);
      return;
    }
    const nextIdx = currentIdx + 1;
    setHighestVisitedIdx(nextIdx);
    setCurrentIdx(nextIdx);
    setSelectedIdx(null);
    setAnswered(false);
    setOpenInput(openResponses[nextIdx] ?? "");
  }

  function handleRestart() {
    if (storeKey) clearActiveSession(storeKey);
    const fresh = pickSession(pool, isPaid(user)).map(toLocalQ);
    setQuestions(fresh);
    setResults(new Array(fresh.length).fill(null));
    setPicks(new Array(fresh.length).fill(null));
    setOpenResponses(new Array(fresh.length).fill(""));
    setHighestVisitedIdx(0);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswered(false);
    setOpenInput("");
    setShowResult(false);
    setStartTime(Date.now());
    setElapsedMin(0);
    savedRef.current = false;
  }

  /** Yaris siempre usa la pregunta visible, incluso al consultar una anterior. */
  function yarisIdx(): number {
    return currentIdx;
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
    // Yaris con IA es Pro: con plan Básica se abre el popup de suscripción en
    // vez de una respuesta a medias.
    // Cuenta gratis: hay 10 respuestas de cortesía; al agotarse se abre el
    // popup de mejora en lugar de una respuesta a medias.
    if (!isPaid(user) && !hasFreeLeft(user, "yaris")) {
      setUpgradeFeature("yaris");
      setUpgradeOpen(true);
      return;
    }
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
    // Un nuevo "Explícamelo Yaris" / "Ayúdame a pensar" sí lleva la vista al
    // final del chat; el streaming posterior ya no la mueve.
    scrollChat();
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

  async function sendYarisMsg(submittedText?: string) {
    const text = (submittedText ?? yarisInput).trim();
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
        border: "1px solid var(--fd-border, #EEE1C5)",
        background: "var(--fd-panel, #f8f9ff)",
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
    return { border: "1px solid var(--fd-border, #EEE1C5)", background: "var(--fd-panel, #f8f9ff)", cursor: "default", opacity: 0.88 };
  }

  function getLetterStyle(optIdx: number): React.CSSProperties {
    const opt = questions[currentIdx].options[optIdx];
    if (!answered) return { background: "var(--fd-panel, #EEE1C5)", color: "var(--fd-muted, #4A5872)" };
    if (optIdx === selectedIdx) {
      return opt.correct
        ? { background: "#2ecc71", color: "white" }
        : { background: "#e74c3c", color: "white" };
    }
    if (opt.correct) return { background: "#2ecc71", color: "white" };
    return { background: "var(--fd-panel, #EEE1C5)", color: "var(--fd-muted, #4A5872)" };
  }

  // Guard de sesión: nada que renderizar hasta estar autenticado y cargado.
  if (!ready || !loaded) {
    return <div style={{ minHeight: "100vh", background: "var(--fd-panel, #f5f7fc)" }} />;
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
          background: "var(--fd-panel, #f5f7fc)",
          color: "var(--fd-text, #081A35)",
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
            background: "var(--fd-panel, white)",
            borderBottom: "1px solid var(--fd-border, rgba(22,61,112,0.08))",
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
                color: "var(--fd-muted, #4A5872)", fontSize: "0.8rem", textDecoration: "none",
                padding: "5px 10px", borderRadius: 6, border: "1px solid var(--fd-border, #EEE1C5)",
                transition: "all 0.2s",
              }}
            >
              ← Salir
            </Link>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--fd-text, #081A35)", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon n="spark" size={15} color="var(--fd-text, #163D70)" /> Modo Aprendiendo
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--fd-muted, #4A5872)" }} className="hidden sm:block">
                {materiaLabel}
              </span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div
            style={{
              background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 18px)", padding: 32,
              maxWidth: 480, width: "100%", textAlign: "center",
              boxShadow: "0 2px 16px rgba(22,61,112,0.07)",
            }}
          >
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
              <Icon n="help" size={40} color="var(--fd-muted, #7E90AD)" />
            </div>
            <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--fd-text, #081A35)", marginBottom: 8 }}>
              Esta materia aún no tiene preguntas publicadas
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--fd-muted, #4A5872)", marginBottom: 20 }}>
              Elige otra materia para practicar mientras agregamos más contenido.
            </p>
            <Link
              to={exitTo}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "12px 20px", background: "#7A5C1E", color: "white",
                borderRadius: "var(--fd-radius, 11px)", fontSize: "0.88rem", fontWeight: 700,
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
  const answeredCorrectly = currentQ.abierta
    ? answered && results[currentIdx] === true
    : answered && selectedIdx !== null && !!currentQ.options[selectedIdx]?.correct;
  /** Yaris guía sin revelar mientras no haya respuesta elegida. */
  const thinkMode = !answered;
  const canGoNext = currentIdx < highestVisitedIdx || answered;
  const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const scoreColor = scorePercent >= 70 ? "#2ecc71" : scorePercent >= 50 ? "#f39c12" : "#e74c3c";
  const consecutiveCorrect = (() => {
    let count = 0;
    for (let i = currentIdx - 1; i >= 0 && results[i] === true; i -= 1) count += 1;
    return count;
  })();
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  const elapsedLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const currentMarked = markedQuestions.has(currentQ.questionId);

  function toggleMarked() {
    setMarkedQuestions((previous) => {
      const next = new Set(previous);
      if (next.has(currentQ.questionId)) next.delete(currentQ.questionId);
      else next.add(currentQ.questionId);
      return next;
    });
  }

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
        background: "var(--fd-panel, #f5f7fc)",
        color: "var(--fd-text, #081A35)",
        height: "100dvh",
        minHeight: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",

      }}
    >
      <style>{`
        .fp-quiz-area { padding: 16px; display: flex; flex-direction: column; align-items: stretch; gap: 16px; }
        .fp-quiz-primary { min-width: 0; width: 100%; max-width: 900px; }
        .fp-quiz-card { width: 100%; padding: 20px; }
        .fp-quiz-nav { width: 100%; }
        @media (min-width: 768px) {
          .fp-quiz-area { padding: 20px 24px; }
          .fp-quiz-card { padding: 24px 28px; }
        }
        @media (min-width: 1200px) {
          .fp-quiz-area { gap: 12px; padding: 16px clamp(24px, 3vw, 56px); }
          .fp-quiz-primary { max-width: 1120px; align-self: center; }
          .fp-quiz-card { padding: 24px 32px; }
        }
      `}</style>
      {/* ── TOPBAR ── */}
      <div
        className="fp-question-topbar px-3 sm:px-6"
        style={{
          background: "var(--fd-panel, white)",
          borderBottom: "1px solid var(--fd-border, rgba(22,61,112,0.08))",
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
              color: "var(--fd-text, #163D70)", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
              minHeight: 44, minWidth: 44, padding: "0 12px", borderRadius: 8,
              border: "1px solid var(--fd-border, #C9D4E5)", flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#081A35"; e.currentTarget.style.borderColor = "#163D70"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#163D70"; e.currentTarget.style.borderColor = "#C9D4E5"; }}
          >
            <span aria-hidden="true">←</span> Salir
          </Link>
          <div className="fp-question-module" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--fd-text, #081A35)", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon n="spark" size={15} color="var(--fd-text, #163D70)" /> <span className="truncate">Cuestionarios</span>
            </span>
            <span style={{ fontSize: "0.74rem", color: "var(--fd-muted, #5A6F92)" }} className="hidden md:block truncate">
              MEX · CIUDAD DE MÉXICO
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            className="fp-question-yaris-top"
            onClick={openYaris}
            aria-label={thinkMode ? "Abrir Yaris en modo te ayudo a pensar" : "Abrir Yaris para que explique la pregunta"}
            style={{
              minHeight: 44, minWidth: 44, padding: "0 12px",
              background: "linear-gradient(135deg,#163D70,#5A86CB)",
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
            className="fp-question-finish"
            onClick={() => {
              if (answeredCount === 0 || window.confirm("¿Finalizar la sesión? Se guardará tu resultado y no podrás retomarla.")) {
                setShowResult(true);
              }
            }}
            aria-label="Finalizar sesión de estudio"
            style={{
              minHeight: 44, minWidth: 44, padding: "0 14px",
              background: "#7A5C1E",
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
        className="fp-question-progress px-3 sm:px-6"
        style={{
          background: "var(--fd-panel, white)",
          paddingBottom: 12,
          borderBottom: "1px solid var(--fd-border, rgba(22,61,112,0.06))",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 8,
            fontSize: "0.76rem", color: "var(--fd-muted, #5A6F92)", marginBottom: 6,
          }}
        >
          <span className="fp-progress-title">APRENDIENDO · {materiaLabel.toUpperCase()}</span>
          <span className="fp-progress-segments" aria-label={`${answeredCount} de ${total} respondidas`}>
            {questions.map((question, index) => (
              <button
                key={question.questionId}
                type="button"
                aria-label={`Pregunta ${index + 1}`}
                disabled={index > highestVisitedIdx}
                className={
                  index === currentIdx
                    ? "is-current"
                    : results[index] === true
                      ? "is-correct"
                      : results[index] === false
                        ? "is-wrong"
                        : ""
                }
                onClick={() => showVisitedQuestion(index)}
              />
            ))}
          </span>
          <strong className="fp-progress-count">{currentIdx + 1} / {total}</strong>
          <span className="fp-progress-chip">◷ {elapsedLabel}</span>
          <span className="fp-progress-chip is-combo">◆ COMBO x{Math.max(1, consecutiveCorrect)}</span>
        </div>

        <div className="fp-progress-legacy" style={{ height: 6, background: "var(--fd-panel, #EEE1C5)", borderRadius: "var(--fd-radius, 10px)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg,#163D70,#5A86CB)",
              borderRadius: "var(--fd-radius, 10px)",
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
          className={"fp-quiz-area" + (yarisOpen ? " yaris-is-open" : "")}
          style={{ flex: 1, minWidth: 0, display: showResult ? "none" : undefined, overflowY: "auto" }}
        >
          <div className="fp-quiz-primary">
          <aside className="fp-question-rail">
            <div className="fp-question-figure">
              <img
                src={knowledgeQuestionImage}
                alt="Cabina de vuelo al amanecer"
                loading="lazy"
                width={1200}
                height={912}
              />
              <small>PREGUNTA DE CONOCIMIENTOS</small>
            </div>
            <button type="button" className={currentMarked ? "is-active" : ""} onClick={toggleMarked}>
              <Icon n="bookmark" size={16} /><span>{currentMarked ? "Marcada para revisar" : "Marcar para revisar"}</span><kbd>M</kbd>
            </button>
            <button type="button" onClick={openYaris}>
              <Icon n="lightbulb" size={16} /><span>Pista de Yaris</span><kbd>H</kbd>
            </button>
            <button type="button" onClick={() => setReportOpen(true)}>
              <Icon n="alert" size={16} /><span>Reportar pregunta</span><kbd>R</kbd>
            </button>
          </aside>
          {/* Question card */}
          <div
            className="fp-quiz-card"
            style={{
              background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 18px)",
              boxShadow: "0 2px 16px rgba(22,61,112,0.07)",
              marginBottom: 16,
            }}
          >
            {/* Sin etiqueta de materia: la pregunta no debe adelantar el tema. */}
            <div className="fp-question-navigator" style={{ marginBottom: 8 }}>
              <QuizQuestionNavigator
                total={total}
                currentIdx={currentIdx}
                highestVisitedIdx={highestVisitedIdx}
                results={results}
                onSelect={showVisitedQuestion}
              />
            </div>

            {!!currentQ.imagenes?.length && (
              <figure className="fp-question-featured-figure">
                <QuestionImages files={currentQ.imagenes} fuente={currentQ.fuente} />
                <figcaption>FIGURA 1 · MATERIAL DE ESTUDIO</figcaption>
              </figure>
            )}
            <div className="fp-question-eyebrow">PREGUNTA {currentIdx + 1} <span>·</span> {currentQ.capituloTitulo?.toUpperCase() || "CONOCIMIENTOS AERONÁUTICOS"}</div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
                color: "var(--fd-text, #081A35)",
                lineHeight: 1.25,
                marginBottom: 28,
              }}
            >
              {currentQ.text}
            </h1>

            {currentQ.abierta ? (
              /* Respuesta escrita: el glosario de abreviaturas se contesta a mano. */
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <label htmlFor="respuesta-abierta" style={{ fontSize: "0.82rem", color: "var(--fd-muted, #4A5872)", fontWeight: 600 }}>
                  Escribe tu respuesta
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <input
                    id="respuesta-abierta"
                    type="text"
                    value={openInput}
                    disabled={answered}
                    autoComplete="off"
                    onChange={(e) => {
                      setOpenInput(e.target.value);
                      setOpenResponses((prev) => {
                        const next = [...prev];
                        next[currentIdx] = e.target.value;
                        return next;
                      });
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleOpenSubmit(); }}
                    placeholder="Tu respuesta…"
                    style={{
                      flex: "1 1 240px", minHeight: 56, padding: "14px 18px",
                      borderRadius: "var(--fd-radius, 12px)", border: "1px solid var(--fd-border, #EEE1C5)", background: "var(--fd-panel, #f8f9ff)",
                      font: "inherit", fontSize: "0.95rem", color: "var(--fd-text, #081A35)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleOpenSubmit}
                    disabled={answered || openInput.trim().length === 0}
                    style={{
                      minHeight: 56, padding: "14px 22px", borderRadius: "var(--fd-radius, 12px)", border: "none",
                      background: answered || openInput.trim().length === 0 ? "#B9C6DA" : "#7A5C1E",
                      color: "white", fontWeight: 700, fontSize: "0.9rem",
                      cursor: answered || openInput.trim().length === 0 ? "default" : "pointer",
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    Revisar
                  </button>
                </div>
                {answered && (
                  <p style={{ fontSize: "0.88rem", color: "var(--fd-text, #081A35)", margin: 0 }}>
                    Respuesta correcta: <strong>{currentQ.options[currentQ.correctIndex]?.text}</strong>
                  </p>
                )}
              </div>
            ) : (
            /* Options — botones reales: foco por teclado y toque ≥48px */
            <div role="group" aria-label="Opciones de respuesta" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className={`fp-quiz-option${answered && opt.correct ? " is-correct" : ""}${answered && i === selectedIdx && !opt.correct ? " is-wrong" : ""}`}
                  onClick={() => handleOptionClick(i)}
                  disabled={answered}
                  aria-pressed={selectedIdx === i}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", borderRadius: "var(--fd-radius, 12px)",
                    minHeight: 56, width: "100%", textAlign: "left",
                    font: "inherit", cursor: answered ? "default" : "pointer",
                    transition: "all 0.2s",
                    userSelect: "none",
                    ...getOptionStyle(i),
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
                  <span style={{ fontSize: "0.95rem", color: "var(--fd-text, #081A35)", lineHeight: 1.45, flex: 1 }}>
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
            )}


            {/* Feedback card */}
            {answered && (
              <div
                style={{
                  borderRadius: "var(--fd-radius, 12px)", padding: "16px 20px", marginBottom: 16,
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
                <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--fd-muted, #555)" }}>
                  {answeredCorrectly ? currentQ.feedback.correct : currentQ.feedback.incorrect}
                </p>
                {currentQ.feedback.cite && (
                <span
                  style={{
                    marginTop: 8, padding: "4px 10px",
                    background: "var(--fd-panel-alt, rgba(22,61,112,0.07))", borderLeft: "3px solid #163D70",
                    borderRadius: 3, fontSize: "0.74rem", color: "var(--fd-text, #163D70)", fontWeight: 600,
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
                      background: "linear-gradient(135deg,#163D70,#5A86CB)",
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
                      color: "var(--fd-text, #163D70)", border: "1px solid var(--fd-border, #C9D4E5)", borderRadius: 9,
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
          <div className="fp-quiz-nav">
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              style={{
                width: "100%", padding: 13,
                background: canGoNext ? "#7A5C1E" : "#ddd",
                color: canGoNext ? "white" : "var(--fd-muted, #7E90AD)",
                border: "none", borderRadius: "var(--fd-radius, 11px)",
                fontSize: "0.92rem", fontWeight: 700,
                cursor: canGoNext ? "pointer" : "not-allowed",
                fontFamily: "'Manrope', sans-serif",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.background = "#977431";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 7px 20px rgba(122,92,30,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.background = "#7A5C1E";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {currentIdx < highestVisitedIdx
                ? "Siguiente pregunta consultada →"
                : currentIdx + 1 >= total ? "Ver resultados →" : "Siguiente pregunta →"}
            </button>
          </div>
          </div>
          <aside className={"fp-question-context" + (yarisOpen ? " is-chatting" : "")}>
            <section className="fp-question-yaris-card" aria-hidden={yarisOpen}>
              <span><YarisAvatar size={52} /></span>
              <h2>Yaris está contigo</h2>
              <p>{answered ? "Revisa tu respuesta y pídeme otra explicación cuando la necesites." : "Responde y te explico por qué. Si dudas, pide una pista: te guío sin darte la respuesta."}</p>
            </section>
            <section className="fp-question-session-stats">
              <p>ESTA SESIÓN</p>
              <div><span><small>ACIERTOS</small><strong>{correctCount}<em>/{answeredCount || 0}</em></strong></span><span><small>PRECISIÓN</small><strong>{scorePercent}<em>%</em></strong></span></div>
            </section>
          </aside>

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
                fontFamily: "'Instrument Serif', serif",
                fontSize: "2rem", color: "var(--fd-text, #081A35)",
                marginBottom: 6, textAlign: "center",
              }}
            >
              ¡Sesión <span style={{ color: "var(--fd-gold, #7A5C1E)" }}>completada!</span>
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--fd-muted, #4A5872)", marginBottom: 28, textAlign: "center" }}>
              Aquí está tu análisis de Pathy
            </p>

            {/* Score card */}
            <div
              style={{
                background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 20px)", padding: 28,
                width: "100%", maxWidth: 580,
                boxShadow: "0 4px 20px rgba(22,61,112,0.1)",
                marginBottom: 20, textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "4rem", fontWeight: 900,
                  color: scoreColor, lineHeight: 1, marginBottom: 4,
                }}
              >
                {scorePercent}%
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--fd-muted, #4A5872)", marginBottom: 20 }}>
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
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.4rem", fontWeight: 900, color: "var(--fd-text, #081A35)" }}>
                      {s.num}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--fd-muted, #7E90AD)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weakness/strength */}
            <div
              style={{
                background: "var(--fd-panel, white)", borderRadius: "var(--fd-radius, 16px)", padding: 20,
                width: "100%", maxWidth: 580,
                boxShadow: "0 2px 12px rgba(22,61,112,0.06)",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--fd-muted, #4A5872)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
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
                      <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon n={item.icon} size={15} color="var(--fd-text, #081A35)" /> {item.name}</span>
                      <span style={{ color, fontWeight: 700 }}>{item.pct}%</span>
                    </div>
                  );
                })
              )}
              {dominado.length > 0 && (
                <>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--fd-muted, #4A5872)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 12, marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
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
                      <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon n={item.icon} size={15} color="var(--fd-text, #081A35)" /> {item.name}</span>
                      <span style={{ color: "#2ecc71", fontWeight: 700 }}>{item.pct}%</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Informe real de Pathy */}
            {user && (
              <PathyDebrief
                userId={user.id}
                origen="cuestionario"
                titulo={quizTitulo ?? (sessionMaterias.length === 1 ? sessionMaterias[0].name : "Cuestionario")}
                scorePct={scorePercent}
                answers={sessionAnswers()}
              />
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 580, flexWrap: "wrap" }}>
              <button
                onClick={handleRestart}
                style={{
                  flex: 1, padding: 13,
                  background: "var(--fd-panel, white)", color: "var(--fd-text, #163D70)",
                  border: "2px solid #163D70", borderRadius: "var(--fd-radius, 11px)",
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
                  background: "#7A5C1E", color: "white",
                  border: "none", borderRadius: "var(--fd-radius, 11px)",
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
          className={"fp-yaris-panel" + (yarisOpen ? " is-open" : "")}
          style={
            isMobile && yarisOpen
              ? {
                  // Hoja inferior con altura acotada: a pantalla completa el
                  // chat tapaba la pregunta y había que cerrarlo para releerla.
                  position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 200,
                  height: "min(62dvh, 460px)",
                  width: "100%", display: "flex", flexDirection: "column",
                  background: "var(--fd-panel, white)",
                  borderTop: "1px solid var(--fd-border, rgba(22,61,112,0.12))",
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
                  background: "var(--fd-panel, white)",
                  borderLeft: yarisOpen ? "1px solid rgba(22,61,112,0.1)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  transition: "width 0.35s ease",
                }

          }
        >
          {/* Yaris header */}
          <div
            className="fp-yaris-header"
            style={{
              padding: "14px 18px", flexShrink: 0,
              background: "var(--fd-panel, #081A35)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 32, height: 32, background: "var(--fd-panel, white)", borderRadius: "50%",
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
                borderRadius: "var(--fd-radius, 10px)", minWidth: 44, minHeight: 44, cursor: "pointer",
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
              className="fp-yaris-mode"
              role="status"
              aria-live="polite"
              style={{
                flexShrink: 0,
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "10px 14px",
                // Fondo sólido y tinta oscura: sobre el degradado translúcido
                // anterior el texto no alcanzaba contraste AA.
                background: "var(--fd-panel, #FFF4DE)",
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
            className="fp-yaris-messages"
            ref={msgsBoxRef}
            style={{
              flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: 14,
              display: "flex", flexDirection: "column", gap: 10,
            }}
          >
            {yarisMsgs.map((msg, i) => (
              <div
                key={i}
                data-msg-role={msg.role}
                className="fp-yaris-message-row"
                style={{
                  display: "flex", gap: 7, alignItems: "flex-start",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >

                <div
                  className={"fp-yaris-message is-" + msg.role}
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: msg.role === "bot" ? "0.78rem" : "0.6rem",
                    fontWeight: msg.role === "user" ? 700 : undefined,
                    background: msg.role === "bot" ? "var(--fd-panel, #EEE1C5)" : "#163D70",
                    color: msg.role === "user" ? "white" : undefined,
                    flexShrink: 0,
                  }}
                >
                  {msg.role === "bot" ? <YarisAvatar size={24} /> : initials}
                </div>
                <div
                  className="fp-yaris-message-content"
                  style={{
                    maxWidth: "84%", padding: "9px 12px",
                    borderRadius: msg.role === "bot" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                    fontSize: "0.81rem", lineHeight: 1.55,
                    background: msg.role === "bot" ? "var(--fd-panel, #f0f4ff)" : "#163D70",
                    color: msg.role === "bot" ? "var(--fd-text, #081A35)" : "white",
                  }}
                >
                  <span className="yaris-md" dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
                  {msg.streaming && <span className="yaris-caret" aria-hidden="true" />}
                  {msg.cite && (
                    <span
                      style={{
                        display: "block", marginTop: 6, padding: "4px 8px",
                        background: "var(--fd-panel-alt, rgba(22,61,112,0.08))",
                        borderLeft: "3px solid #163D70", borderRadius: 3,
                        fontSize: "0.7rem", color: "var(--fd-text, #163D70)", fontWeight: 600,
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
                    background: "var(--fd-panel, #EEE1C5)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "0.78rem", flexShrink: 0,
                  }}
                >
                  <YarisAvatar size={24} />
                </div>
                <div
                  style={{
                    padding: "9px 12px", background: "var(--fd-panel, #f0f4ff)",
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
            {/* Colchón: permite que el mensaje del estudiante suba hasta arriba. */}
            {yarisMsgs.length > 1 && <div style={{ flexShrink: 0, minHeight: "45%" }} aria-hidden="true" />}
            <div ref={msgsEndRef} />

          </div>

          {/* Input */}
          <form
            className="fp-yaris-composer"
            onSubmit={(e) => {
              e.preventDefault();
              sendYarisMsg(yarisInput);
            }}
          >
            <textarea
              value={yarisInput}
              onChange={(e) => setYarisInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (yarisInput.trim() && !yarisTyping) sendYarisMsg(yarisInput);
                }
              }}
              aria-label="Escribe tu mensaje para Yaris"
              placeholder={thinkMode ? "Pregúntame conceptos, no la respuesta..." : "Escribe tu duda..."}
              disabled={yarisTyping}
              style={{
                // 16px evita el zoom automático de iOS al enfocar el campo.
                width: "100%", resize: "none", border: "none", background: "transparent",
                padding: "11px 14px", fontSize: "16px", minHeight: 64,
                color: "var(--fd-text, #081A35)",
                fontFamily: "'Manrope', sans-serif", outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 10px 10px" }}>
              <button
                type="submit"
                disabled={!yarisInput.trim() || yarisTyping}
                aria-label="Enviar mensaje a Yaris"
                style={{
                  width: 32, height: 32, borderRadius: "50%", border: "none",
                  background: "#163D70", color: "white", cursor: "pointer",
                  opacity: !yarisInput.trim() || yarisTyping ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem", lineHeight: 1,
                }}
              >
                ↑
              </button>
            </div>
          </form>
        </div>
      </div>

      {!showResult && (
        <footer className="fp-question-footer">
          <span><kbd>1–4</kbd> Responder <kbd>H</kbd> Pista <kbd>M</kbd> Marcar <kbd>ENTER</kbd> Siguiente <kbd>ESC</kbd> Pausa</span>
          <span className="fp-pathy-streak"><PathyMark size={25} /><b>PATHY</b> {consecutiveCorrect > 1 ? `Llevas ${consecutiveCorrect} seguidas. Sigue así.` : "Un paso a la vez. Tu próximo acierto empieza aquí."}</span>
        </footer>
      )}


      {/* Reportar problema */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={upgradeFeature === "preguntas" ? "Práctica ilimitada" : "Yaris con IA"}
        benefit={
          upgradeFeature === "preguntas"
            ? `Ya completaste tus ${FREE_LIMITS.preguntas} preguntas gratis de ATP y Handbook. Con Pro practicas sin límite en todos los manuales.`
            : "Con Pro te explica cada pregunta, te acompaña paso a paso y practicas sin límites."
        }
        {...(user ? { userId: user.id } : {})}
      />

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
