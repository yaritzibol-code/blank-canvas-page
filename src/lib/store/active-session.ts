/**
 * Sesiones activas (simulador y modo Aprendiendo).
 *
 * Guardamos un snapshot ligero en `localStorage` para que salir de la pantalla,
 * recargar o navegar a otro módulo NO pierda el avance. La sesión sólo se borra
 * cuando el usuario pulsa "Finalizar" / entrega el examen, o cuando expira.
 */

const PREFIX = "fp.session";
/** 48 horas: suficiente para retomar, sin resucitar sesiones viejísimas. */
const TTL_MS = 48 * 60 * 60 * 1000;

export type ActiveSessionKind = "simulador" | "aprendiendo";

interface Envelope<T> {
  v: 1;
  savedAt: number;
  data: T;
}

export function sessionKey(kind: ActiveSessionKind, userId: string, variant = ""): string {
  return `${PREFIX}.${kind}.${userId}${variant ? `.${variant}` : ""}`;
}

export function saveActiveSession<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const env: Envelope<T> = { v: 1, savedAt: Date.now(), data };
    window.localStorage.setItem(key, JSON.stringify(env));
  } catch {
    /* cuota llena o storage bloqueado: la sesión sigue en memoria */
  }
}

export function loadActiveSession<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    if (!env || env.v !== 1 || typeof env.savedAt !== "number") return null;
    if (Date.now() - env.savedAt > TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return env.data;
  } catch {
    return null;
  }
}

export function clearActiveSession(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

/** Una sesión sin terminar encontrada en el navegador. */
export interface ActiveSessionInfo<T = unknown> {
  kind: ActiveSessionKind;
  /** Configuración con la que se abrió (la parte variable de la llave). */
  variant: string;
  savedAt: number;
  data: T;
}

/**
 * Lista las sesiones a medio terminar del usuario, de la más reciente a la más
 * vieja. Las usa el historial para ofrecer "Reanudar"; las expiradas se
 * limpian de paso.
 */
export function listActiveSessions<T = unknown>(userId: string): ActiveSessionInfo<T>[] {
  if (typeof window === "undefined" || !userId) return [];
  const out: ActiveSessionInfo<T>[] = [];
  try {
    const expired: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(`${PREFIX}.`)) continue;

      // `fp.session.<kind>.<userId>[.<variant>]`
      const rest = key.slice(PREFIX.length + 1);
      const dot = rest.indexOf(".");
      if (dot < 0) continue;
      const kind = rest.slice(0, dot) as ActiveSessionKind;
      if (kind !== "simulador" && kind !== "aprendiendo") continue;
      const tail = rest.slice(dot + 1);
      if (tail !== userId && !tail.startsWith(`${userId}.`)) continue;
      const variant = tail === userId ? "" : tail.slice(userId.length + 1);

      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const env = JSON.parse(raw) as Envelope<T>;
      if (!env || env.v !== 1 || typeof env.savedAt !== "number") continue;
      if (Date.now() - env.savedAt > TTL_MS) {
        expired.push(key);
        continue;
      }
      out.push({ kind, variant, savedAt: env.savedAt, data: env.data });
    }
    expired.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    return out;
  }
  return out.sort((a, b) => b.savedAt - a.savedAt);
}
