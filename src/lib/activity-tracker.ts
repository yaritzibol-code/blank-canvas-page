/**
 * Activity Ratio — tracker de comportamiento en el navegador.
 *
 * Mide, por sesión de navegación: pantallas vistas, tiempo real de atención
 * (descontando la pestaña en segundo plano), pantalla de entrada y de salida,
 * si la visita fue un rebote, y los hitos de onboarding/abandono que los
 * módulos reportan con `trackMilestone` / `trackAbandon`.
 *
 * Todo es fire-and-forget: si la nube no responde, la app sigue igual.
 */
import { nombrePantalla } from "@/lib/presence";
import type { ActivityEventInput, ActivitySessionPatch } from "@/lib/activity.server";

const SESSION_KEY_STORAGE = "fp_activity_session";
const SESSION_META_STORAGE = "fp_activity_meta";
/** Sin actividad por más de esto, la siguiente vista abre sesión nueva. */
const SESSION_GAP_MS = 30 * 60 * 1000;
/** Debajo de esto, con una sola pantalla, cuenta como rebote. */
const BOUNCE_MS = 15_000;
const FLUSH_MS = 15_000;

interface Meta {
  key: string;
  startedAt: number;
  lastAt: number;
  entryPath: string;
  entryLabel: string;
  screens: number;
  engagedMs: number;
  referrer: string | null;
  utm: Record<string, string>;
  onboardingStep: string | null;
  onboardingDone: boolean;
}

let meta: Meta | null = null;
let queue: ActivityEventInput[] = [];
let currentPath: string | null = null;
let currentLabel = "";
let viewStart = 0;
let visibleSince = 0;
let flushTimer: number | null = null;
let plan: string | null = null;

function device(): string {
  if (typeof window === "undefined") return "desconocido";
  const w = window.innerWidth;
  if (w < 768) return "movil";
  if (w < 1180) return "tablet";
  return "escritorio";
}

function readUtm(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const p = new URLSearchParams(window.location.search);
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "gclid"]) {
      const v = p.get(k);
      if (v) out[k] = v.slice(0, 120);
    }
  } catch {
    /* noop */
  }
  return out;
}

function newKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function loadMeta(path: string, label: string): Meta {
  try {
    const raw = sessionStorage.getItem(SESSION_META_STORAGE);
    if (raw) {
      const m = JSON.parse(raw) as Meta;
      if (m?.key && Date.now() - m.lastAt < SESSION_GAP_MS) return m;
    }
  } catch {
    /* noop */
  }
  const fresh: Meta = {
    key: newKey(),
    startedAt: Date.now(),
    lastAt: Date.now(),
    entryPath: path,
    entryLabel: label,
    screens: 0,
    engagedMs: 0,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    utm: readUtm(),
    onboardingStep: null,
    onboardingDone: false,
  };
  try {
    sessionStorage.setItem(SESSION_KEY_STORAGE, fresh.key);
    sessionStorage.setItem(SESSION_META_STORAGE, JSON.stringify(fresh));
  } catch {
    /* noop */
  }
  return fresh;
}

function saveMeta() {
  if (!meta) return;
  meta.lastAt = Date.now();
  try {
    sessionStorage.setItem(SESSION_META_STORAGE, JSON.stringify(meta));
  } catch {
    /* noop */
  }
}

function sessionPatch(ended: boolean): ActivitySessionPatch {
  const m = meta!;
  return {
    entryPath: m.entryPath,
    entryLabel: m.entryLabel,
    exitPath: currentPath ?? m.entryPath,
    exitLabel: currentLabel || m.entryLabel,
    screenCount: Math.max(1, m.screens),
    engagedMs: Math.round(m.engagedMs),
    isBounce: m.screens <= 1 && m.engagedMs < BOUNCE_MS,
    device: device(),
    referrer: m.referrer,
    utm: m.utm,
    plan,
    onboardingStep: m.onboardingStep,
    onboardingDone: m.onboardingDone,
    ended,
  };
}

let sending = false;

async function flush(ended = false): Promise<void> {
  if (!meta || sending) return;
  const events = queue;
  queue = [];
  sending = true;
  try {
    const { trackActivity } = await import("@/lib/activity.functions");
    await trackActivity({
      data: { sessionKey: meta.key, session: sessionPatch(ended), events },
    });
  } catch {
    /* el tracker nunca rompe el producto */
  } finally {
    sending = false;
  }
}

function accumulate() {
  if (!meta || !visibleSince) return;
  meta.engagedMs += Date.now() - visibleSince;
  visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
  saveMeta();
}

/** Cierra la vista actual registrando cuánto duró. */
function closeView() {
  if (!meta || !currentPath) return;
  accumulate();
  queue.push({
    type: "view",
    path: currentPath,
    label: currentLabel,
    durationMs: Math.max(0, Date.now() - viewStart),
    at: new Date(viewStart).toISOString(),
  });
}

/** Registra el cambio a una nueva pantalla. */
export function trackView(path: string): void {
  if (typeof window === "undefined") return;
  const label = nombrePantalla(path);
  if (!meta) meta = loadMeta(path, label);
  if (currentPath === path) return;
  closeView();
  currentPath = path;
  currentLabel = label;
  viewStart = Date.now();
  visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
  meta.screens += 1;
  saveMeta();
  void flush();
}

/** Hito alcanzado (paso de onboarding, perfil completado, pago abierto…). */
export function trackMilestone(step: string, metadata?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !meta) return;
  meta.onboardingStep = step;
  if (step === "onboarding_completado" || step === "perfil_completo") meta.onboardingDone = true;
  saveMeta();
  queue.push({
    type: "milestone",
    step,
    path: currentPath,
    label: currentLabel,
    metadata,
    at: new Date().toISOString(),
  });
  void flush();
}

/** Algo se abrió y se dejó a medias (cuestionario, simulador, pago…). */
export function trackAbandon(step: string, metadata?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !meta) return;
  queue.push({
    type: "abandon",
    step,
    path: currentPath,
    label: currentLabel,
    metadata,
    at: new Date().toISOString(),
  });
  void flush();
}

/** El plan del usuario se adjunta a la sesión para segmentar los reportes. */
export function setActivityPlan(value: string | null): void {
  plan = value;
}

/** Arranca los listeners globales. Devuelve la función de limpieza. */
export function startActivityTracker(): () => void {
  if (typeof window === "undefined") return () => {};

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      visibleSince = Date.now();
    } else {
      accumulate();
      visibleSince = 0;
      void flush();
    }
  };
  const onHide = () => {
    closeView();
    currentPath = null;
    void flush(true);
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onHide);
  flushTimer = window.setInterval(() => {
    accumulate();
    void flush();
  }, FLUSH_MS);

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onHide);
    if (flushTimer) window.clearInterval(flushTimer);
    flushTimer = null;
  };
}
