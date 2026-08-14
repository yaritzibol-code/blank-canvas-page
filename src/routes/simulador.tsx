import { setPresenceActivity } from "@/lib/presence";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import {
  useRequireAuth,
  canStartSimulator,
  getPublishedQuestions,
  useQuestionBank,
  ensureQuestionsByIds,
  saveSimAttempt,
  logYarisUse,
  sessionKey,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
} from "@/lib/store";
import type { BankQuestion, SimAnswer } from "@/lib/store";
import { isPaid } from "@/lib/store/gating";
import { FREE_CIAAC_MAX } from "@/lib/store/free-quota";
import { yarisAiChat } from "@/lib/yaris-ai.functions";
import { yarisToHtml, sanitizeHtml } from "@/lib/yaris-format";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { PathyMark } from "@/components/shared/PathyMark";
import { PathyDebrief } from "@/components/shared/PathyDebrief";
import { QuestionImages } from "@/components/banco/QuestionImages";

export const Route = createFileRoute("/simulador")({
  component: SimuladorPage,
  validateSearch: (s: Record<string, unknown>): { modo?: SimMode; banco?: SimBank } => {
    const out: { modo?: SimMode; banco?: SimBank } = {};
    if (s["modo"] === "potenciado" || s["modo"] === "oficial") out.modo = s["modo"];
    if (s["banco"] === "la") out.banco = "la";
    return out;
  },
  head: () => ({
    meta: [
      { title: "Simulador CIAAC — FlightPath" },
      { name: "description", content: "Simulador del examen CIAAC con 310 preguntas, ponderación oficial y revisión guiada por Yaris IA." },
      { property: "og:title", content: "Simulador CIAAC — FlightPath" },
      { property: "og:description", content: "Practica el examen CIAAC en condiciones reales con FlightPath." },
      { property: "og:url", content: "https://flightpath.mx/simulador" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://flightpath.mx/simulador" }],
  }),
});

/* ─── Data ───────────────────────────────────────────────── */

const MATERIAS = [
  { icon: "plane" as FPIconName, name: "Aerodinámica", total: 30, slug: "aerodinamica" },
  { icon: "settings" as FPIconName, name: "Aeronaves y Motores", total: 30, slug: "aeronaves-motores" },
  { icon: "scale" as FPIconName, name: "Legislación Aeronáutica", total: 30, slug: "legislacion" },
  { icon: "stethoscope" as FPIconName, name: "Medicina de Aviación", total: 20, slug: "medicina" },
  { icon: "cloud" as FPIconName, name: "Meteorología", total: 30, slug: "meteorologia" },
  { icon: "map" as FPIconName, name: "Navegación Aérea", total: 30, slug: "navegacion" },
  { icon: "tower" as FPIconName, name: "Servicios de Tránsito Aéreo", total: 30, slug: "servicios-transito" },
  { icon: "radio" as FPIconName, name: "Comunicaciones Aeronáuticas", total: 20, slug: "comunicaciones" },
  { icon: "doc" as FPIconName, name: "Manuales de Información Aeronáutica", total: 20, slug: "manuales-ais" },
  { icon: "brain" as FPIconName, name: "Factores Humanos", total: 20, slug: "factores-humanos" },
  { icon: "shield" as FPIconName, name: "Seguridad Aérea", total: 20, slug: "seguridad-aerea" },
  { icon: "plane" as FPIconName, name: "Operaciones Aeronáuticas", total: 30, slug: "operaciones" },
];

const BASE_TOTALS = MATERIAS.map((m) => m.total);
let TOTAL_QS = BASE_TOTALS.reduce((s, n) => s + n, 0); // 310

/**
 * Reparto de reactivos según el plan. El plan gratuito hace el simulador
 * completo (mismas materias, mismo formato) pero recortado a 25 preguntas,
 * repartidas de forma proporcional al peso real de cada materia.
 */
function applyPlanTotals(free: boolean) {
  if (!free) {
    MATERIAS.forEach((m, i) => { m.total = BASE_TOTALS[i]; });
  } else {
    const base = BASE_TOTALS.reduce((s, n) => s + n, 0);
    const exact = BASE_TOTALS.map((n) => (n / base) * FREE_CIAAC_MAX);
    const alloc = exact.map(() => 1);
    let rest = Math.max(0, FREE_CIAAC_MAX - alloc.length);
    const order = exact
      .map((v, i) => ({ i, frac: v - 1 }))
      .sort((a, b) => b.frac - a.frac);
    let k = 0;
    while (rest > 0 && order.length > 0) {
      const idx = order[k % order.length].i;
      alloc[idx] += 1;
      rest -= 1;
      k += 1;
    }
    MATERIAS.forEach((m, i) => { m.total = alloc[i]; });
  }
  TOTAL_QS = MATERIAS.reduce((s, m) => s + m.total, 0);
}

const LETTERS = ["A", "B", "C", "D"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

/** Modo del simulador: oficial (solo banco base) o potenciado (banco base + el resto). */
export type SimMode = "oficial" | "potenciado";

/**
 * Banco base del simulador:
 * - `ciaac` (default): guía de estudio del examen de ingreso.
 * - `la`: cuestionarios oficiales del curso de Línea Aérea (ATP, PHAK, JEPP, ANX10, CPAM).
 */
export type SimBank = "ciaac" | "la";

/** Preguntas de la guía oficial de examen de ingreso: sin `fuente` externa. */
function isOficial(q: BankQuestion) {
  return !q.fuente;
}

/** Preguntas provenientes de los cuestionarios del curso de Línea Aérea. */
function isLineaAerea(q: BankQuestion) {
  return !!q.fuente;
}

export { LA_OFICIAL_FUENTE } from "@/lib/store/linea-aerea-meta";
import { LA_OFICIAL_FUENTE as LAOF } from "@/lib/store/linea-aerea-meta";

function isLineaAereaOficial(q: BankQuestion) {
  return q.fuente === LAOF;
}

/**
 * Universo del banco: `la` NUNCA incluye preguntas CIAAC, solo el examen
 * oficial de Línea Aérea y los cuestionarios de los manuales del curso.
 */
function universe(banco: SimBank, all: BankQuestion[]) {
  return banco === "la" ? all.filter(isLineaAerea) : all;
}

/**
 * Predicado del banco base. Para Línea Aérea se prefieren las preguntas
 * oficiales (`LAOF`); mientras no existan, se usan los cuestionarios del curso.
 */
function basePredicate(banco: SimBank, all: BankQuestion[]) {
  if (banco !== "la") return isOficial;
  return all.some(isLineaAereaOficial) ? isLineaAereaOficial : isLineaAerea;
}

/** Intercala dos listas: oficial, extra, oficial, extra… */
function interleave(a: BankQuestion[], b: BankQuestion[]): BankQuestion[] {
  const out: BankQuestion[] = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

/**
 * Banco real del simulador: por cada materia toma sus preguntas publicadas
 * barajadas y cicla hasta llenar su cuota.
 * - `oficial`: únicamente preguntas del banco base elegido.
 * - `potenciado`: intercala las preguntas restantes con las del banco base.
 */
function buildBank(mode: SimMode = "oficial", banco: SimBank = "ciaac"): BankQuestion[] {
  const all = universe(banco, getPublishedQuestions());
  const pred = basePredicate(banco, all);
  const globalBase = shuffle(all.filter(pred));
  const globalExtra = shuffle(all.filter((q) => !pred(q)));
  const globalPool = mode === "oficial" ? globalBase : interleave(globalBase, globalExtra);
  if (globalPool.length === 0) return [];
  const bank: BankQuestion[] = [];
  MATERIAS.forEach((m) => {
    const own = universe(banco, getPublishedQuestions(m.slug));
    const base = shuffle(own.filter(pred));
    const extra = shuffle(own.filter((q) => !pred(q)));
    const ownPool = mode === "oficial" ? base : interleave(base, extra);
    const pool = ownPool.length > 0 ? ownPool : globalPool;
    for (let i = 0; i < m.total; i++) {
      bank.push(pool[i % pool.length]);
    }
  });
  return bank;
}

/** Conteo disponible por modo, para mostrarlo en la pantalla de inicio. */
function bankCounts(banco: SimBank = "ciaac") {
  const all = universe(banco, getPublishedQuestions());
  const pred = basePredicate(banco, all);
  const oficial = all.filter(pred).length;
  return { oficial, extra: all.length - oficial, total: all.length };
}


interface SimResult {
  correct: number;
  scorePct: number;
  passed: boolean;
  timeUsed: number;
  porMateria: Record<string, { correct: number; total: number }>;
  answers: SimAnswer[];
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

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

/* ─── Component ──────────────────────────────────────────── */

type Phase = "warning" | "exam" | "result" | "review";

/** Snapshot del examen en curso: se borra sólo al entregar/finalizar. */
interface SimSnapshot {
  mode: SimMode;
  bankIds: string[];
  questions: QState[];
  current: number;
  secondsLeft: number;
  savedAt: number;
}

function SimuladorPage() {
  const { user, ready } = useRequireAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("warning");
  const search = Route.useSearch();
  const [mode, setMode] = useState<SimMode>(search.modo ?? "oficial");
  const banco: SimBank = search.banco ?? "ciaac";
  // Lote acotado del banco: el examen se arma con las preguntas que necesita,
  // nunca con una descarga completa del banco.
  const bankReady = useQuestionBank(
    banco === "la"
      ? { scope: "la", limit: 600 }
      : { scope: "ciaac", materias: MATERIAS.map((m) => m.slug), limit: 200 },
  );
  // Presencia en vivo para el panel admin.
  useEffect(() => {
    setPresenceActivity(
      `Simulador ${mode === "oficial" ? "oficial" : "potenciado"} · ${banco === "la" ? "Línea aérea" : "CIAAC"}`,
    );
    return () => setPresenceActivity(null);
  }, [mode, banco]);
  // El reparto por materia depende del plan (gratis = 25 reactivos).
  useEffect(() => {
    if (!ready) return;
    applyPlanTotals(!isPaid(user));
    setQuestions(buildQuestions());
  }, [ready, user]);

  /** "Salir" vuelve al módulo de origen, no siempre al de CIAAC. */
  const exitTo: "/dashboard/banco" | "/dashboard/linea-aerea" =
    banco === "la" ? "/dashboard/linea-aerea" : "/dashboard/banco";
  const [agreed, setAgreed] = useState(false);
  const [questions, setQuestions] = useState<QState[]>(buildQuestions);
  const [bankQs, setBankQs] = useState<BankQuestion[]>([]);
  const [result, setResult] = useState<SimResult | null>(null);
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
  const [isMobile, setIsMobile] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  /** Caja de mensajes: se desplaza sola, sin arrastrar la página. */
  const msgsBoxRef = useRef<HTMLDivElement>(null);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(false);
  const finishRef = useRef<() => void>(() => {});
  const phaseRef = useRef<Phase>("warning");
  // Preguntas ya explicadas por Yaris en esta revisión (para pedirle otro enfoque al repetir)
  const explainedRef = useRef<Set<number>>(new Set());
  // Serializa las llamadas a la IA (una a la vez)
  const aiBusyRef = useRef(false);
  const restoredRef = useRef(false);
  const storeKey = user ? sessionKey("simulador", user.id, banco) : "";

  /**
   * Retoma un examen en curso (recarga o navegación a otro módulo). El
   * cronómetro descuenta el tiempo transcurrido fuera de la pantalla.
   */
  useEffect(() => {
    if (!ready || !user || !storeKey || restoredRef.current) return;
    restoredRef.current = true;
    const snap = loadActiveSession<SimSnapshot>(storeKey);
    if (!snap || snap.bankIds.length === 0) return;
    void (async () => {
    await ensureQuestionsByIds(snap.bankIds);
    const byId = new Map(getPublishedQuestions().map((q) => [q.id, q]));
    const bank = snap.bankIds.map((id) => byId.get(id)).filter((q): q is BankQuestion => !!q);
    if (bank.length !== snap.bankIds.length) {
      clearActiveSession(storeKey);
      return;
    }
    const elapsed = Math.floor((Date.now() - snap.savedAt) / 1000);
    const left = Math.max(0, snap.secondsLeft - Math.max(0, elapsed));
    if (left <= 0) {
      clearActiveSession(storeKey);
      return;
    }
    setMode(snap.mode);
    setBankQs(bank);
    setQuestions(snap.questions);
    setCurrent(Math.min(snap.current, snap.questions.length - 1));
    setSecondsLeft(left);
    setAgreed(true);
    savedRef.current = false;
    setPhase("exam");
    })();
  }, [ready, user, storeKey]);
  const saveTick = Math.floor(secondsLeft / 10);
  useEffect(() => {
    if (!storeKey) return;
    if (phase !== "exam" || bankQs.length === 0) return;
    saveActiveSession<SimSnapshot>(storeKey, {
      mode,
      bankIds: bankQs.map((q) => q.id),
      questions,
      current,
      secondsLeft,
      savedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey, phase, bankQs, questions, current, saveTick, mode]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Solo baja cuando el estudiante manda su mensaje: la respuesta en streaming
  // no arrastra la vista.
  /**
   * Deja el último mensaje del estudiante arriba del todo (estilo ChatGPT):
   * la respuesta de Yaris se lee hacia abajo sin perseguir el fondo.
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


  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          // Tiempo agotado: califica y entrega automáticamente.
          setTimeout(() => finishRef.current(), 0);
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

  // Atajos de teclado durante el examen y la calculadora
  useEffect(() => {
    if (phase !== "exam") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      // Calculadora abierta: teclado numérico
      if (calcOpen) {
        if (/^[0-9]$/.test(e.key)) { setCalc((s) => calcReducer(s, { type: "NUM", payload: e.key })); e.preventDefault(); return; }
        if (e.key === ".") { setCalc((s) => calcReducer(s, { type: "NUM", payload: "." })); e.preventDefault(); return; }
        if (["+","-","*","/"].includes(e.key)) {
          const map: Record<string,string> = { "+":"+","-":"-","*":"×","/":"÷" };
          setCalc((s) => calcReducer(s, { type: "OP", payload: map[e.key] })); e.preventDefault(); return;
        }
        if (e.key === "Enter" || e.key === "=") { setCalc((s) => calcReducer(s, { type: "EQ" })); e.preventDefault(); return; }
        if (e.key === "Escape") { setCalcOpen(false); e.preventDefault(); return; }
        if (e.key === "Backspace" || e.key.toLowerCase() === "c") { setCalc((s) => calcReducer(s, { type: "CLEAR" })); e.preventDefault(); return; }
      }
      // Atajos globales de examen
      if (e.key === "ArrowRight") { setCurrent((c) => Math.min(TOTAL_QS - 1, c + 1)); e.preventDefault(); return; }
      if (e.key === "ArrowLeft") { setCurrent((c) => Math.max(0, c - 1)); e.preventDefault(); return; }
      if (["1","2","3","4"].includes(e.key)) {
        const oi = parseInt(e.key, 10) - 1;
        selectOpt(current, oi);
        e.preventDefault();
        return;
      }
      const letter = e.key.toLowerCase();
      if (["a","b","c","d"].includes(letter) && !calcOpen) {
        // 'c' abre la calculadora
        if (letter === "c") { setCalcOpen(true); e.preventDefault(); return; }
        const oi = { a: 0, b: 1, d: 3 }[letter as "a" | "b" | "d"] ?? 2;
        selectOpt(current, oi);
        e.preventDefault();
      }
      if (letter === "f") { toggleFlag(); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, calcOpen, current]);


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

  /* Entrega y calificación real (una sola vez por intento) */
  function finishExam() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (storeKey) clearActiveSession(storeKey);
    setConfirmOpen(false);
    if (savedRef.current) return;
    savedRef.current = true;

    let correct = 0;
    const porMateria: Record<string, { correct: number; total: number }> = {};
    const answers: SimAnswer[] = [];
    questions.forEach((q, i) => {
      const bq = bankQs[i];
      if (!bq) return;
      const slug = MATERIAS[q.materia].slug;
      const entry = porMateria[slug] ?? { correct: 0, total: 0 };
      entry.total++;
      const ok = q.selectedOpt === bq.correctIndex;
      if (ok) {
        correct++;
        entry.correct++;
      }
      porMateria[slug] = entry;
      answers.push({
        questionId: bq.id,
        materia: slug,
        ...(bq.fuente ? { fuente: bq.fuente } : {}),
        ...(bq.capitulo !== undefined ? { capitulo: bq.capitulo } : {}),
        ...(bq.capituloTitulo ? { capituloTitulo: bq.capituloTitulo } : {}),
        ...(bq.seccion ? { seccion: bq.seccion } : {}),
        selectedIndex: q.selectedOpt,
        correctIndex: bq.correctIndex,
      });
    });

    // Las que dejó en blanco cuentan mal para la calificación (como en el
    // examen real) pero no como "preguntas respondidas".
    const answeredCount = questions.filter((q) => q.selectedOpt >= 0).length;
    const scorePctNum = TOTAL_QS > 0 ? (correct / TOTAL_QS) * 100 : 0;
    const passedNow = scorePctNum >= 80;
    const timeUsedNow = Math.max(0, 5 * 3600 - secondsLeft);

    setResult({ correct, scorePct: scorePctNum, passed: passedNow, timeUsed: timeUsedNow, porMateria, answers });
    if (user) {
      saveSimAttempt({
        userId: user.id,
        total: TOTAL_QS,
        answered: answeredCount,
        correct,
        scorePct: scorePctNum,
        passed: passedNow,
        durationSecs: timeUsedNow,
        porMateria,
        answers,
      });
    }
    setPhase("result");
  }
  finishRef.current = finishExam;
  phaseRef.current = phase;

  /* Submit */
  function submitExam() {
    finishExam();
  }

  /* Comenzar: construye el banco real y arranca el examen */
  function startExam() {
    const gate = canStartSimulator(user);
    if (!gate.allowed) return;
    // Plan gratuito: examen recortado a 25 reactivos.
    applyPlanTotals(!isPaid(user));
    const bank = buildBank(mode, banco);
    if (bank.length === 0) return;
    setBankQs(bank);
    setQuestions(buildQuestions());
    setSecondsLeft(5 * 3600);
    setCurrent(0);
    setResult(null);
    savedRef.current = false;
    setPhase("exam");
  }

  /* Reiniciar todo para repetir el simulador (re-verifica el gating en warning) */
  function resetSimulator() {
    if (storeKey) clearActiveSession(storeKey);
    setPhase("warning");
    applyPlanTotals(!isPaid(user));
    setQuestions(buildQuestions());
    setBankQs([]);
    setSecondsLeft(5 * 3600);
    setCurrent(0);
    setAgreed(false);
    setResult(null);
    setReviewCurrent(0);
    setYarisOpen(false);
    setYarisMsgs([]);
    explainedRef.current = new Set();
    savedRef.current = false;
  }

  /* Calc */
  function dispatch(type: string, payload?: string) {
    setCalc((s) => calcReducer(s, { type, payload }));
  }

  /* Yaris IA — SOLO en fase review, con la pregunta seleccionada como contexto */
  const callYarisAi = useServerFn(yarisAiChat);

  const YARIS_EXPLAIN_PROMPT =
    "Explícame esta pregunta con tus propias palabras, por qué la correcta es la correcta y por qué las demás no. Al final dame un tip para recordarlo.";
  const YARIS_REEXPLAIN_PROMPT =
    "Explícame esta misma pregunta otra vez, pero de una forma distinta y más sencilla. Usa otro ejemplo o analogía para que me quede claro.";

  function aiContextPayload(idx: number) {
    const bq = bankQs[idx];
    if (!bq) return undefined;
    const mi = questions[idx]?.materia ?? 0;
    return {
      materia: MATERIAS[mi].name,
      questionText: bq.text,
      options: bq.options,
      correctIndex: bq.correctIndex,
      userSelectedIndex: questions[idx]?.selectedOpt ?? -1,
      explanation: bq.explanation,
      cite: bq.cite,
    };
  }

  function historyForAi(nextUserMsg?: string) {
    const hist: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of yarisMsgs) {
      const content = stripHtml(m.text);
      if (content) hist.push({ role: m.role === "bot" ? "assistant" : "user", content });
    }
    if (nextUserMsg) hist.push({ role: "user", content: nextUserMsg });
    // El backend acepta máximo 20 mensajes de 4000 caracteres.
    return hist.slice(-12).map((m) => ({ ...m, content: m.content.slice(0, 3900) }));
  }

  function ensureGreeting() {
    setYarisMsgs((p) =>
      p.length > 0
        ? p
        : [{
            role: "bot" as const,
            text: "¡Hola! Soy <b>Yaris</b>. Te explico las preguntas de tu simulador con base en su explicación oficial y en lo que sé de aeronáutica. Pulsa <b>Explícamelo Yaris</b> en cualquier pregunta, las veces que necesites.",
          }],
    );
  }

  /**
   * Pide a la IA la explicación de la pregunta. Funciona cada vez que se pulsa
   * el botón: la primera vez explica completo y, si se repite sobre la misma
   * pregunta, pide otro enfoque más sencillo.
   */
  async function explainQuestion(idx: number) {
    if (phaseRef.current !== "review" || aiBusyRef.current) return;
    const bq = bankQs[idx];
    if (!bq) return;
    const again = explainedRef.current.has(idx);
    aiBusyRef.current = true;
    explainedRef.current.add(idx);
    const mi = questions[idx]?.materia ?? 0;
    setYarisMsgs((p) => [...p, {
      role: "bot",
      text: again
        ? `Va otra vez la <b>pregunta ${idx + 1}</b> de <b>${MATERIAS[mi].name}</b>, ahora con otro enfoque:`
        : `Vamos con la <b>pregunta ${idx + 1}</b> de <b>${MATERIAS[mi].name}</b>:`,
    }]);
    setYarisTyping(true);
    try {
      const r = await callYarisAi({
        data: {
          history: [{ role: "user", content: again ? YARIS_REEXPLAIN_PROMPT : YARIS_EXPLAIN_PROMPT }],
          context: aiContextPayload(idx),
        },
      });
      if (phaseRef.current !== "review") return;
      setYarisMsgs((p) => [...p, { role: "bot", text: yarisToHtml(r.text), cite: r.cite ?? undefined }]);
    } catch (err) {
      console.error("Yaris IA error", err);
      if (!again) explainedRef.current.delete(idx); // el siguiente intento repite la explicación completa
      if (phaseRef.current === "review") {
        setYarisMsgs((p) => [...p, { role: "bot", text: "No pude conectarme con la IA. Vuelve a intentarlo en un momento." }]);
      }
    } finally {
      aiBusyRef.current = false;
      setYarisTyping(false);
    }
  }

  async function openYaris() {
    if (phase !== "review") return;
    if (!yarisOpen && user) logYarisUse(user.id, "Simulador (revisión)");
    setYarisOpen(true);
    ensureGreeting();
    // Sólo al pulsar el botón movemos la caja del chat.
    scrollChat();

    await explainQuestion(reviewCurrent);
  }

  async function sendYaris() {
    const text = yarisInput.trim();
    if (!text || yarisTyping || aiBusyRef.current) return;
    aiBusyRef.current = true;
    setYarisMsgs((p) => [...p, { role: "user", text }]);
    const history = historyForAi(text);
    setYarisInput("");
    setYarisTyping(true);
    try {
      const r = await callYarisAi({ data: { history, context: aiContextPayload(reviewCurrent) } });
      setYarisMsgs((p) => [...p, { role: "bot", text: yarisToHtml(r.text), cite: r.cite ?? undefined }]);
    } catch (err) {
      console.error("Yaris IA error", err);
      setYarisMsgs((p) => [...p, { role: "bot", text: "No pude conectarme con la IA. Vuelve a intentarlo." }]);
    } finally {
      aiBusyRef.current = false;
      setYarisTyping(false);
    }
  }

  /* Derived */
  const answeredCount = questions.filter((q) => q.answered).length;
  const flaggedCount = questions.filter((q) => q.flagged).length;
  const progressPct = (answeredCount / TOTAL_QS) * 100;
  const timerWarning = secondsLeft <= 1800 && secondsLeft > 300;
  const timerDanger = secondsLeft <= 300;
  const currentQ = questions[current];
  const examQ = bankQs[current];
  const isLast = current === TOTAL_QS - 1;

  /* Result data (calificación real) */
  const timeUsed = result?.timeUsed ?? Math.max(0, 5 * 3600 - secondsLeft);
  const totalCorrect = result?.correct ?? 0;
  const scorePct = (result?.scorePct ?? 0).toFixed(2);
  const passed = result?.passed ?? false;

  /* Gating y disponibilidad del banco (solo relevante en fase warning) */
  const gate = canStartSimulator(user);
  const bankEmpty = phase === "warning" && ready && bankReady ? getPublishedQuestions().length === 0 : false;
  const counts = phase === "warning" && ready && bankReady ? bankCounts(banco) : { oficial: 0, extra: 0, total: 0 };


  if (!ready) {
    return <div style={{ position: "fixed", inset: 0, background: "#f5f7fc" }} />;
  }

  /* ─── PHASE: WARNING ─── */
  if (phase === "warning") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto", fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 560, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)", margin: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ display: "flex", alignItems: "center" }}><Icon n="target" size={40} color="#6C0820" /></span>
            <div>
              <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", color: "#22375C", margin: 0 }}>Simulador del examen CIAAC</h1>
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

          {/* Selector de tipo de simulador */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#647DA0", marginBottom: 10 }}>Tipo de simulador</div>
            <div style={{ display: "grid", gap: 10 }}>
              {([
                {
                  id: "oficial" as SimMode,
                  title: "Simulador oficial",
                  desc: banco === "la"
                    ? "Solo preguntas de los cuestionarios oficiales del curso de Línea Aérea."
                    : "Solo preguntas de la guía de estudio del examen de ingreso.",
                  count: counts.oficial,
                  icon: "target" as FPIconName,
                },
                {
                  id: "potenciado" as SimMode,
                  title: "Simulador potenciado",
                  desc: banco === "la"
                    ? "Cuestionarios de Línea Aérea + preguntas CIAAC, intercaladas."
                    : "Guía oficial + preguntas de Línea Aérea y manuales, intercaladas.",
                  count: counts.total,
                  icon: "flame" as FPIconName,
                },
              ]).map((opt) => {
                const active = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    aria-pressed={active}
                    style={{
                      textAlign: "left", display: "flex", gap: 12, alignItems: "flex-start",
                      padding: "13px 15px", borderRadius: 12, cursor: "pointer",
                      background: active ? "rgba(108,8,32,0.05)" : "white",
                      border: active ? "2px solid #6C0820" : "2px solid #e6e9f5",
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    <span style={{ flexShrink: 0, marginTop: 2, display: "flex" }}><Icon n={opt.icon} size={18} color={active ? "#6C0820" : "#647DA0"} /></span>
                    <span style={{ display: "block" }}>
                      <span style={{ display: "block", fontWeight: 800, fontSize: "0.92rem", color: "#22375C" }}>{opt.title}</span>
                      <span style={{ display: "block", fontSize: "0.8rem", color: "#647DA0", lineHeight: 1.45, marginTop: 2 }}>{opt.desc}</span>
                      <span style={{ display: "block", fontSize: "0.74rem", color: "#8a94ab", marginTop: 4 }}>{opt.count.toLocaleString("es-MX")} preguntas disponibles</span>
                    </span>
                  </button>
                );
              })}
            </div>
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

          {bankEmpty && (
            <div style={{ background: "rgba(243,156,18,0.1)", border: "1px solid #f39c12", borderRadius: 10, padding: "12px 16px", fontSize: "0.83rem", color: "#8a6000", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 }}>
              <span style={{ display: "flex", flexShrink: 0 }}><Icon n="alert" size={16} /></span>
              <span>El banco de preguntas aún no tiene contenido publicado. Vuelve más tarde para hacer tu simulador.</span>
            </div>
          )}

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, cursor: "pointer", fontSize: "0.84rem", color: "#555", lineHeight: 1.5 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: "#3D5D91", width: 16, height: 16, flexShrink: 0 }} />
            Entiendo las condiciones y estoy listo para comenzar el simulador.
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <Link to={exitTo} style={{ flex: 1, padding: 12, background: "white", color: "#647DA0", border: "2px solid #F2DCDB", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ← Volver
            </Link>
            <button
              disabled={!agreed || !gate.allowed || bankEmpty}
              onClick={startExam}
              style={{ flex: 2, padding: 12, background: agreed && gate.allowed && !bankEmpty ? "#6C0820" : "#ccc", color: "white", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: agreed && gate.allowed && !bankEmpty ? "pointer" : "not-allowed", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
            >
              <Icon n="target" size={16} /> Comenzar simulador
            </button>
          </div>
        </div>

        {/* Gating: suscripción básica sin simuladores disponibles este mes */}
        {!gate.allowed && (
          <UpgradeModal
            open
            onClose={() => navigate({ to: exitTo })}
            feature="Simulador CIAAC"
            benefit={gate.reason}
            userId={user?.id}
          />
        )}
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
            <div style={{ display: "inline-block" }}><PathyMark size={84} float /></div>
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

          {/* Informe real de Pathy */}
          {user && result && (
            <PathyDebrief
              userId={user.id}
              origen="simulador"
              titulo={mode === "oficial" ? "Simulador oficial" : "Simulador potenciado"}
              scorePct={Math.round(result.scorePct)}
              answers={result.answers}
            />
          )}

          {/* Por materia */}
          <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,0.06)", marginBottom: 18 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="chart" size={15} /> Resultado por materia</div>
            {MATERIAS.map((m, i) => {
              const pm = result?.porMateria[m.slug];
              const p = pm && pm.total > 0 ? Math.round((pm.correct / pm.total) * 100) : 0;
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
            {bankQs.slice(0, 3).map((q, i) => {
              const userAns = questions[i]?.selectedOpt ?? -1;
              const isCorrect = userAns === q.correctIndex;
              return (
                <div key={i} style={{ background: isCorrect ? "rgba(46,204,113,0.06)" : "rgba(231,76,60,0.05)", border: `1px solid ${isCorrect ? "rgba(46,204,113,0.2)" : "rgba(231,76,60,0.15)"}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                    <span style={{ flexShrink: 0, display: "flex", alignItems: "center", marginTop: 1 }}>{isCorrect ? <Icon n="checkCircle" size={17} color="#2ecc71" /> : <Icon n="close" size={17} color="#e74c3c" />}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#22375C", lineHeight: 1.5 }}>{i + 1}. {q.text}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, paddingLeft: 24 }}>
                    {q.options.map((o, oi) => {
                      const isRight = oi === q.correctIndex;
                      const isUser = oi === userAns;
                      return (
                        <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: isRight ? "rgba(46,204,113,0.1)" : isUser && !isRight ? "rgba(231,76,60,0.08)" : "transparent", border: `1px solid ${isRight ? "#2ecc71" : isUser && !isRight ? "#e74c3c" : "#F2DCDB"}`, borderRadius: 8, fontSize: "0.82rem", color: "#22375C" }}>
                          <span>{LETTERS[oi]}</span>
                          <span style={{ flex: 1 }}>{o}</span>
                          {isUser && <span style={{ fontSize: "0.66rem", fontWeight: 700, color: isRight ? "#2ecc71" : "#e74c3c", whiteSpace: "nowrap" }}>Tu respuesta</span>}
                          <span style={{ display: "flex", alignItems: "center" }}>{isRight ? <Icon n="checkCircle" size={15} color="#2ecc71" /> : isUser && !isRight ? <Icon n="close" size={15} color="#e74c3c" /> : null}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: "10px 12px", background: "rgba(61,93,145,0.06)", borderLeft: "3px solid #3D5D91", borderRadius: "0 7px 7px 0", fontSize: "0.8rem", color: "#555", lineHeight: 1.5 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n="lightbulb" size={14} color="#f39c12" /> {q.explanation}</span>
                    {q.cite && <div style={{ marginTop: 5, fontSize: "0.72rem", color: "#3D5D91", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Icon n="book" size={13} /> {q.cite}</div>}
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
            <button onClick={resetSimulator} style={{ flex: 1, padding: 13, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 11, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Icon n="refresh" size={16} /> Repetir simulador
            </button>
            <Link to="/dashboard" style={{ flex: 1, padding: 13, background: "#6C0820", color: "white", border: "none", borderRadius: 11, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Icon n="home" size={16} /> Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── PHASE: REVIEW ─── */
  if (phase === "review") {
    const reviewQ = bankQs[reviewCurrent];
    if (!reviewQ) return null;
    const userAns = questions[reviewCurrent]?.selectedOpt ?? -1;
    const isCorrect = userAns === reviewQ.correctIndex;
    const mi = questions[reviewCurrent]?.materia ?? 0;

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 800, background: "#f5f7fc", display: "flex", flexDirection: "column", fontFamily: "'Manrope', sans-serif" }}>
        {/* Review topbar */}
        <div style={{ height: 56, background: "#22375C", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setPhase("result")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "5px 12px", borderRadius: 7, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
              ← Volver
            </button>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1rem", color: "white", fontWeight: 700 }}>Revisión del examen</span>
          </div>
          <span style={{ background: "#F2AEBC", color: "#6C0820", padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}><Icon n="doc" size={14} /> Modo revisión</span>
        </div>

        {/* Review body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left list */}
          <div style={{ width: 200, flexShrink: 0, background: "white", borderRight: "1px solid rgba(61,93,145,0.08)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #F2DCDB", background: "#f8f9ff" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#22375C", marginBottom: 4 }}>Preguntas del examen</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.62rem", color: "#647DA0" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ecc71" }} />Correcta</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.62rem", color: "#647DA0" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e74c3c" }} />Incorrecta</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {MATERIAS.map((m, mi) => {
                const offset = materiaOffset(mi);
                return (
                  <div key={mi}>
                    <div style={{ padding: "6px 12px", background: "#f8f9ff", borderBottom: "1px solid rgba(61,93,145,0.06)", fontSize: "0.68rem", fontWeight: 700, color: "#3D5D91", textTransform: "uppercase", letterSpacing: "0.4px", display: "flex", alignItems: "center", gap: 5 }}>
                      <Icon n={m.icon} size={12} /> {m.name}
                    </div>
                    {Array.from({ length: m.total }, (_, i) => {
                      const idx = offset + i;
                      const bqi = bankQs[idx];
                      const correct = !!bqi && questions[idx]?.selectedOpt === bqi.correctIndex;
                      const active = idx === reviewCurrent;
                      return (
                        <div
                          key={idx}
                          onClick={() => setReviewCurrent(idx)}
                          style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px 5px 16px", cursor: "pointer", background: active ? "rgba(61,93,145,0.06)" : "transparent", borderLeft: `3px solid ${correct ? "#2ecc71" : "#e74c3c"}`, transition: "background 0.2s" }}
                        >
                          <div style={{ width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: correct ? "#2ecc71" : "#e74c3c", color: "white" }}>
                            {correct ? <Icon n="check" size={11} sw={2.4} /> : <Icon n="close" size={11} sw={2.4} />}
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
                    <span style={{ display: "flex", alignItems: "center" }}>{isCorrect ? <Icon n="checkCircle" size={20} color="#2ecc71" /> : <Icon n="close" size={20} color="#e74c3c" />}</span>
                    <span style={{ background: "rgba(61,93,145,0.07)", color: "#3D5D91", padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n={MATERIAS[mi].icon} size={13} /> {MATERIAS[mi].name}</span>
                    {userAns === -1 && (
                      <span style={{ background: "rgba(243,156,18,0.1)", color: "#8a6000", padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>Sin responder</span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "#8DA1BE" }}>Pregunta {reviewCurrent + 1} / {TOTAL_QS}</span>
                </div>

                {/* Veredicto de la pregunta */}
                {userAns === -1 ? (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "11px 14px", background: "rgba(243,156,18,0.08)", border: "1px solid rgba(243,156,18,0.35)", borderRadius: 10, marginBottom: 16, fontSize: "0.84rem", color: "#555", lineHeight: 1.5 }}>
                    <span style={{ display: "flex", flexShrink: 0, marginTop: 1 }}><Icon n="alert" size={17} color="#f39c12" /></span>
                    <span><b style={{ color: "#8a6000" }}>Sin responder.</b> No marcaste ninguna opción; la respuesta correcta está resaltada en <b style={{ color: "#2ecc71" }}>verde</b>.</span>
                  </div>
                ) : isCorrect ? (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "11px 14px", background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.4)", borderRadius: 10, marginBottom: 16, fontSize: "0.84rem", color: "#555", lineHeight: 1.5 }}>
                    <span style={{ display: "flex", flexShrink: 0, marginTop: 1 }}><Icon n="checkCircle" size={17} color="#2ecc71" /></span>
                    <span><b style={{ color: "#2ecc71" }}>¡Correcto!</b> Seleccionaste la respuesta correcta. ¡Sigue así, aviador!</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "11px 14px", background: "rgba(231,76,60,0.07)", border: "1px solid rgba(231,76,60,0.35)", borderRadius: 10, marginBottom: 16, fontSize: "0.84rem", color: "#555", lineHeight: 1.5 }}>
                    <span style={{ display: "flex", flexShrink: 0, marginTop: 1 }}><Icon n="close" size={17} color="#e74c3c" /></span>
                    <span><b style={{ color: "#e74c3c" }}>Incorrecto.</b> Tu respuesta está marcada en <b style={{ color: "#e74c3c" }}>rojo</b> y la correcta en <b style={{ color: "#2ecc71" }}>verde</b>.</span>
                  </div>
                )}

                <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.95rem", color: "#22375C", lineHeight: 1.5, marginBottom: 18 }}>{reviewQ.text}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
                  {reviewQ.options.map((o, oi) => {
                    const isRight = oi === reviewQ.correctIndex;
                    const isUser = oi === userAns;
                    return (
                      <div key={oi} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: isRight ? "rgba(46,204,113,0.08)" : isUser ? "rgba(231,76,60,0.06)" : "#f8f9ff", border: `2px solid ${isRight ? "#2ecc71" : isUser ? "#e74c3c" : "#F2DCDB"}`, borderRadius: 11, boxShadow: isUser && isRight ? "0 4px 14px rgba(46,204,113,0.22)" : "none", flexWrap: "wrap" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: isRight ? "#2ecc71" : isUser ? "#e74c3c" : "#F2DCDB", color: isRight || isUser ? "white" : "#647DA0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, boxShadow: isUser ? `0 0 0 2px white, 0 0 0 4px ${isRight ? "#2ecc71" : "#e74c3c"}` : "none" }}>
                          {LETTERS[oi]}
                        </div>
                        <span style={{ fontSize: "0.88rem", color: "#22375C", flex: 1, minWidth: 160 }}>{o}</span>
                        {isUser && isRight && <span style={{ fontSize: "0.72rem", color: "white", background: "#2ecc71", padding: "3px 10px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="checkCircle" size={13} /> Tu respuesta · ¡Correcta!</span>}
                        {isRight && !isUser && <span style={{ fontSize: "0.72rem", color: "#2ecc71", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="check" size={13} /> Respuesta correcta</span>}
                        {isUser && !isRight && <span style={{ fontSize: "0.72rem", color: "white", background: "#e74c3c", padding: "3px 10px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="close" size={13} /> Tu respuesta</span>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: "14px 16px", background: "rgba(61,93,145,0.06)", borderLeft: "4px solid #3D5D91", borderRadius: "0 10px 10px 0", fontSize: "0.85rem", color: "#555", lineHeight: 1.6, marginBottom: 14 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n="lightbulb" size={15} color="#f39c12" /> {reviewQ.explanation}</span>
                  {reviewQ.cite && <div style={{ marginTop: 6, fontSize: "0.74rem", color: "#3D5D91", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Icon n="book" size={13} /> {reviewQ.cite}</div>}
                </div>

                <button onClick={openYaris} style={{ width: "100%", padding: 11, background: "linear-gradient(135deg,#3D5D91,#5A86CB)", color: "white", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <YarisAvatar size={20} /> Explícamelo Yaris
                </button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setReviewCurrent((r) => Math.max(0, r - 1))} style={{ flex: 1, padding: 11, background: "white", color: "#647DA0", border: "2px solid #F2DCDB", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>← Anterior</button>
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
              msgsBoxRef={msgsBoxRef}

            />
          </div>
        </div>
      </div>
    );
  }

  /* ─── PHASE: EXAM ─── */
  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: "#f5f7fc", color: "#22375C", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @keyframes sim-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes sim-pop { 0% { transform: scale(0.85); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes sim-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes sim-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        @keyframes sim-key-press { 0% { transform: scale(1); } 40% { transform: scale(0.92); } 100% { transform: scale(1); } }
        .sim-q-card { animation: sim-fade-in 0.32s ease-out both; }
        .sim-opt { position: relative; overflow: hidden; text-align: left; }
        .sim-opt:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(61,93,145,0.35); }
        .sim-opt-letter { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), background 0.2s, color 0.2s; }
        .sim-opt[data-selected="true"] .sim-opt-letter { animation: sim-pop 0.35s ease-out; }
        .sim-opt[data-selected="true"] { box-shadow: 0 6px 18px rgba(61,93,145,0.15); }
        .sim-opt:not([data-selected="true"]):hover { transform: translateX(3px); }
        .sim-progress-shimmer { position: relative; overflow: hidden; }
        .sim-progress-shimmer > .sim-shimmer-bar { position:absolute; inset:0; width:40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: sim-shimmer 2.4s linear infinite; pointer-events:none; }
        .sim-danger-dot { width: 8px; height: 8px; border-radius: 50%; background: #e74c3c; animation: sim-pulse 1s ease-in-out infinite; display:inline-block; }
        .sim-timer-ring { transition: stroke-dashoffset 0.9s linear, stroke 0.3s ease; }
        .sim-calc-btn { transition: transform 0.12s ease, filter 0.12s ease; }
        .sim-calc-btn:hover { filter: brightness(1.12); }
        .sim-calc-btn:active { animation: sim-key-press 0.18s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .sim-q-card, .sim-opt, .sim-opt-letter, .sim-danger-dot, .sim-shimmer-bar, .sim-timer-ring, .sim-calc-btn { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Topbar */}
      <div style={{ height: 56, background: "#22375C", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, zIndex: 50, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button onClick={() => setLeftPanelOpen((o) => !o)} aria-label="Ver lista de preguntas" className="md:hidden" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "6px 10px", borderRadius: 7, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif", minHeight: 40 }}>
            <Icon n="list" size={15} /> Preguntas
          </button>
          <span style={{ background: "#6C0820", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}><Icon n="target" size={13} /> Simulador</span>
          <span className="hidden md:block" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1rem", color: "white", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Examen General de Egreso — Piloto Comercial</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Timer con anillo */}
          <div
            role="timer"
            aria-label={`Tiempo restante ${fmtTime(secondsLeft)}`}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: timerDanger ? "rgba(231,76,60,0.18)" : timerWarning ? "rgba(243,156,18,0.15)" : "rgba(255,255,255,0.1)",
              border: `1px solid ${timerDanger ? "rgba(231,76,60,0.5)" : timerWarning ? "rgba(243,156,18,0.4)" : "rgba(255,255,255,0.15)"}`,
              borderRadius: 12, padding: "5px 12px 5px 8px", transition: "background 0.3s, border 0.3s",
            }}
          >
            <svg width={30} height={30} viewBox="0 0 36 36" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
              <circle
                className="sim-timer-ring"
                cx="18" cy="18" r="15" fill="none"
                stroke={timerDanger ? "#e74c3c" : timerWarning ? "#f39c12" : "#F2AEBC"}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 15}
                strokeDashoffset={2 * Math.PI * 15 * (1 - secondsLeft / (5 * 3600))}
                transform="rotate(-90 18 18)"
              />
            </svg>
            <div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 5, lineHeight: 1 }}>
                {timerDanger && <span aria-hidden="true" className="sim-danger-dot" />}
                Tiempo
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "1.05rem", fontWeight: 800, letterSpacing: 1, color: timerDanger ? "#ffb0a4" : timerWarning ? "#ffd58a" : "white", lineHeight: 1.15 }}>
                {fmtTime(secondsLeft)}
              </div>
            </div>
          </div>
          <button
            onClick={() => setCalcOpen((o) => !o)}
            aria-label="Abrir calculadora"
            aria-expanded={calcOpen}
            title="Calculadora (C)"
            style={{ background: calcOpen ? "#F2AEBC" : "rgba(255,255,255,0.1)", border: `1px solid ${calcOpen ? "#F2AEBC" : "rgba(255,255,255,0.2)"}`, color: calcOpen ? "#22375C" : "white", padding: "8px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 5, minHeight: 40, transition: "all 0.2s" }}
          >
            <Icon n="gauge" size={15} /> <span className="hidden sm:inline">Calculadora</span>
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            aria-label="Finalizar examen"
            title="Finalizar examen"
            style={{
              background: "#6C0820", border: "1px solid rgba(255,255,255,0.15)",
              color: "white", padding: "8px 14px", borderRadius: 8,
              fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
              display: "flex", alignItems: "center", gap: 6, minHeight: 40,
              boxShadow: "0 2px 8px rgba(108,8,32,0.35)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
          >
            <Icon n="check" size={15} /> <span className="hidden sm:inline">Finalizar</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="sim-progress-shimmer" style={{ background: "rgba(34,55,92,0.08)", height: 5, flexShrink: 0, position: "relative" }} role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del examen">
        <div style={{ height: "100%", background: "linear-gradient(90deg, #F2AEBC, #F2DCDB)", width: `${progressPct}%`, transition: "width 0.5s ease" }} />
        <div className="sim-shimmer-bar" />
      </div>


      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left panel (desktop) */}
        <div
          className="hidden md:flex flex-col"
          style={{ width: 260, flexShrink: 0, background: "white", borderRight: "1px solid rgba(61,93,145,0.08)", overflow: "hidden" }}
        >
          <LeftPanel questions={questions} current={current} expandedMaterias={expandedMaterias} onToggleMateria={(mi) => setExpandedMaterias((s) => { const n = new Set(s); if (n.has(mi)) { n.delete(mi); } else { n.add(mi); } return n; })} onSelectQ={setCurrent} answeredCount={answeredCount} />
        </div>

        {/* Left panel (mobile overlay) */}
        {leftPanelOpen && (
          <div className="md:hidden" style={{ position: "fixed", top: 60, left: 0, bottom: 0, zIndex: 80, width: 260, background: "white", boxShadow: "4px 0 20px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
            <LeftPanel questions={questions} current={current} expandedMaterias={expandedMaterias} onToggleMateria={(mi) => setExpandedMaterias((s) => { const n = new Set(s); if (n.has(mi)) { n.delete(mi); } else { n.add(mi); } return n; })} onSelectQ={(i) => { setCurrent(i); setLeftPanelOpen(false); }} answeredCount={answeredCount} />
          </div>
        )}
        {leftPanelOpen && <div className="md:hidden" style={{ position: "fixed", inset: 0, zIndex: 79, background: "rgba(0,0,0,0.3)" }} onClick={() => setLeftPanelOpen(false)} />}

        {/* Right panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 28, display: "flex", flexDirection: "column", alignItems: "center" }} className="sm:p-7 p-4">

            <div key={current} className="sim-q-card" style={{ background: "white", borderRadius: 16, padding: 28, maxWidth: 700, width: "100%", boxShadow: "0 2px 14px rgba(61,93,145,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(61,93,145,0.07)", color: "#3D5D91", padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Icon n={MATERIAS[currentQ.materia].icon} size={14} /> {MATERIAS[currentQ.materia].name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={toggleFlag}
                    aria-pressed={currentQ.flagged}
                    title="Marcar (F)"
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", border: `1px solid ${currentQ.flagged ? "#f39c12" : "#F2DCDB"}`, borderRadius: 7, background: currentQ.flagged ? "rgba(243,156,18,0.08)" : "white", fontSize: "0.76rem", fontWeight: 600, color: currentQ.flagged ? "#f39c12" : "#647DA0", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.2s", minHeight: 36 }}
                  >
                    <Icon n="flag" size={14} /> {currentQ.flagged ? "Marcada" : "Marcar para revisar"}
                  </button>
                  <span style={{ fontSize: "0.76rem", color: "#8DA1BE", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{current + 1} / {TOTAL_QS}</span>
                </div>
              </div>

              <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", color: "#22375C", lineHeight: 1.5, marginBottom: 24 }}>
                {examQ?.text ?? ""}
              </p>

              <QuestionImages files={examQ?.imagenes} fuente={examQ?.fuente} />


              <div role="radiogroup" aria-label="Opciones de respuesta" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(examQ?.options ?? []).map((opt, oi) => {
                  const selected = currentQ.selectedOpt === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      data-selected={selected}
                      onClick={() => selectOpt(current, oi)}
                      className="sim-opt"
                      style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                        background: selected ? "rgba(61,93,145,0.09)" : "#f8f9ff",
                        border: `2px solid ${selected ? "#3D5D91" : "#F2DCDB"}`,
                        borderRadius: 12, cursor: "pointer",
                        transition: "background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                        userSelect: "none", fontFamily: "'Manrope', sans-serif", minHeight: 56, width: "100%",
                      }}
                    >
                      <div
                        className="sim-opt-letter"
                        aria-hidden="true"
                        style={{
                          width: 30, height: 30, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
                          background: selected ? "#3D5D91" : "#F2DCDB",
                          color: selected ? "white" : "#647DA0",
                        }}
                      >
                        {selected ? <Icon n="check" size={16} /> : LETTERS[oi]}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#22375C", lineHeight: 1.4, flex: 1, textAlign: "left" }}>{opt}</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: "0.72rem", color: "#8DA1BE", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center" }}><Icon n="lightbulb" size={14} /></span>
                <span>Atajos: <kbd style={{ background: "#f2f4fa", padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "0.7rem" }}>1-4</kbd> respuesta · <kbd style={{ background: "#f2f4fa", padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "0.7rem" }}>←/→</kbd> navegar · <kbd style={{ background: "#f2f4fa", padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "0.7rem" }}>F</kbd> marcar</span>
              </div>
            </div>


            {/* Nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 700, width: "100%", marginTop: 16, gap: 10 }}>
              <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} style={{ padding: "11px 20px", background: "white", color: current === 0 ? "#ccc" : "#647DA0", border: "2px solid #F2DCDB", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: current === 0 ? "not-allowed" : "pointer", fontFamily: "'Manrope', sans-serif", opacity: current === 0 ? 0.4 : 1 }}>
                ← Anterior
              </button>
              <div style={{ fontSize: "0.8rem", color: "#8DA1BE", textAlign: "center" }}>Pregunta {current + 1} de {TOTAL_QS}</div>
              {!isLast ? (
                <button onClick={() => setCurrent((c) => Math.min(TOTAL_QS - 1, c + 1))} style={{ padding: "11px 20px", background: "#3D5D91", color: "white", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
                  Siguiente →
                </button>
              ) : (
                <button onClick={() => setConfirmOpen(true)} style={{ padding: "11px 24px", background: "#6C0820", color: "white", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  Entregar examen <Icon n="check" size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calculator modal */}
      {calcOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Calculadora"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "80px 20px 20px", animation: "sim-fade-in 0.2s ease-out" }}
          onClick={(e) => { if (e.target === e.currentTarget) setCalcOpen(false); }}
        >
          <div style={{ background: "linear-gradient(160deg, #22375C, #1a2b48)", borderRadius: 16, padding: 14, width: 240, boxShadow: "0 20px 40px rgba(0,0,0,0.4)", animation: "sim-pop 0.25s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "1px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon n="gauge" size={12} /> Calculadora
              </div>
              <button onClick={() => setCalcOpen(false)} aria-label="Cerrar calculadora" style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.7)", width: 26, height: 26, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon n="close" size={13} />
              </button>
            </div>
            <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", minHeight: 16, marginBottom: 2, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{calc.expr || "\u00A0"}</div>
              <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "1.75rem", fontWeight: 800, color: "white", wordBreak: "break-all", lineHeight: 1.1 }}>{calc.display}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {[
                { label: "C", action: () => dispatch("CLEAR"), style: { background: "rgba(231,76,60,0.65)", color: "white" } },
                { label: "%", action: () => dispatch("OP", "%"), style: { background: "#3D5D91", color: "white" } },
                { label: "÷", action: () => dispatch("OP", "÷"), style: { background: "#3D5D91", color: "white" } },
                { label: "×", action: () => dispatch("OP", "×"), style: { background: "#3D5D91", color: "white" } },
                { label: "7", action: () => dispatch("NUM", "7"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "8", action: () => dispatch("NUM", "8"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "9", action: () => dispatch("NUM", "9"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "−", action: () => dispatch("OP", "-"), style: { background: "#3D5D91", color: "white" } },
                { label: "4", action: () => dispatch("NUM", "4"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "5", action: () => dispatch("NUM", "5"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "6", action: () => dispatch("NUM", "6"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "+", action: () => dispatch("OP", "+"), style: { background: "#3D5D91", color: "white" } },
                { label: "1", action: () => dispatch("NUM", "1"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "2", action: () => dispatch("NUM", "2"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "3", action: () => dispatch("NUM", "3"), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
                { label: "=", action: () => dispatch("EQ"), style: { background: "#6C0820", color: "white", gridRow: "span 2" } },
                { label: "0", action: () => dispatch("NUM", "0"), style: { background: "rgba(255,255,255,0.1)", color: "white", gridColumn: "span 2" } },
                { label: ".", action: () => dispatch("NUM", "."), style: { background: "rgba(255,255,255,0.1)", color: "white" } },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  aria-label={btn.label === "C" ? "Limpiar" : btn.label}
                  className="sim-calc-btn"
                  style={{ padding: "14px 0", border: "none", borderRadius: 9, fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', ui-monospace, monospace", minHeight: 44, ...btn.style }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.4 }}>
              Usa el teclado · <kbd style={{ background: "rgba(255,255,255,0.08)", padding: "0 4px", borderRadius: 3 }}>Esc</kbd> cerrar
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
                  <div style={{ fontSize: "0.7rem", color: "#8DA1BE" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ flex: 1, padding: 12, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>← Seguir revisando</button>
              <button onClick={submitExam} style={{ flex: 2, padding: 12, background: "#6C0820", color: "white", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>Entregar examen <Icon n="check" size={15} /></button>
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
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>Preguntas del examen</div>
        <div style={{ fontSize: "0.7rem", color: "#647DA0" }}>{answeredCount} / {TOTAL_QS} respondidas</div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "8px 16px", borderBottom: "1px solid #F2DCDB", flexWrap: "wrap" }}>
        {[
          { dot: "#F2DCDB", label: "Sin responder" },
          { dot: "#3D5D91", label: "Respondida" },
          { dot: "#f39c12", label: "Marcada" },
          { dot: "#5A86CB", label: "Actual" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", color: "#647DA0" }}>
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
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3D5D91", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n={m.icon} size={13} /> {m.name}</span>
                <span style={{ fontSize: "0.65rem", color: "#8DA1BE", display: "inline-flex", alignItems: "center", gap: 3 }}>{answeredInM}/{m.total} <span style={{ color: "#bbb", display: "inline-flex", alignItems: "center", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}><Icon n="chevD" size={11} /></span></span>
              </div>
              {open && (
                <div>
                  {Array.from({ length: m.total }, (_, i) => {
                    const idx = offset + i;
                    const q = questions[idx];
                    const isActive = idx === current;
                    const dotBg = isActive ? "#5A86CB" : q.flagged ? "#f39c12" : q.answered ? "#3D5D91" : "#F2DCDB";
                    const dotColor = isActive || q.answered || q.flagged ? "white" : "#647DA0";
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
                        {q.flagged && <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", color: "#f39c12" }}><Icon n="flag" size={13} /></span>}
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

function YarisPanel({ msgs, typing, input, onInput, onSend, onClose, msgsEndRef, msgsBoxRef }: {
  msgs: { role: "bot" | "user"; text: string; cite?: string }[];
  typing: boolean;
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
  msgsEndRef: React.RefObject<HTMLDivElement | null>;
  msgsBoxRef: React.RefObject<HTMLDivElement | null>;
}) {

  return (
    <>
      <style>{`@keyframes yb{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}.yds{width:5px;height:5px;background:#5A86CB;border-radius:50%;animation:yb .8s infinite}.yds:nth-child(2){animation-delay:.15s}.yds:nth-child(3){animation-delay:.3s}`}</style>
      <div style={{ padding: "14px 18px", flexShrink: 0, background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}><YarisAvatar size={30} /></div>
          <div>
            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "white" }}>Yaris IA</div>
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.8)" }}>Tutora de aviación 24/7</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="close" size={15} /></button>
      </div>
      <div ref={msgsBoxRef} style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((msg, i) => (
          <div key={i} data-msg-role={msg.role} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>

            <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.role === "bot" ? "0.78rem" : "0.6rem", fontWeight: msg.role === "user" ? 700 : undefined, background: msg.role === "bot" ? "#F2DCDB" : "#3D5D91", color: msg.role === "user" ? "white" : undefined, flexShrink: 0 }}>
              {msg.role === "bot" ? <YarisAvatar size={24} /> : "MG"}
            </div>
            <div style={{ maxWidth: "84%", padding: "9px 12px", borderRadius: msg.role === "bot" ? "4px 12px 12px 12px" : "12px 4px 12px 12px", fontSize: "0.81rem", lineHeight: 1.55, background: msg.role === "bot" ? "#f0f4ff" : "#3D5D91", color: msg.role === "bot" ? "#22375C" : "white" }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
              {msg.cite && <div style={{ marginTop: 6, padding: "4px 8px", background: "rgba(61,93,145,0.08)", borderLeft: "3px solid #3D5D91", borderRadius: 3, fontSize: "0.7rem", color: "#3D5D91", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Icon n="book" size={12} /> {msg.cite}</div>}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", flexShrink: 0 }}><YarisAvatar size={24} /></div>
            <div style={{ padding: "9px 12px", background: "#f0f4ff", borderRadius: "4px 12px 12px 12px", display: "flex", alignItems: "center", gap: 4 }}>
              <div className="yds" /><div className="yds" /><div className="yds" />
            </div>
          </div>
        )}
        {msgs.length > 1 && <div style={{ flexShrink: 0, minHeight: "45%" }} aria-hidden="true" />}
        <div ref={msgsEndRef} />

      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid #F2DCDB", display: "flex", gap: 7, flexShrink: 0 }}>
        <input value={input} onChange={(e) => onInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onSend(); }} placeholder="Escribe tu duda..." style={{ flex: 1, border: "2px solid #F2DCDB", borderRadius: 18, padding: "7px 12px", fontSize: "0.81rem", fontFamily: "'Manrope', sans-serif", outline: "none" }} onFocus={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; }} />
        <button onClick={onSend} style={{ width: 32, height: 32, background: "#3D5D91", border: "none", borderRadius: "50%", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", flexShrink: 0 }}><Icon n="send" size={15} /></button>
      </div>
    </>
  );
}
