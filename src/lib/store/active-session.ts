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
