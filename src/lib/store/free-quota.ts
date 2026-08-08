/**
 * Cuotas del plan gratuito (Básica).
 *
 * Un usuario sin suscripción puede:
 *  - responder 50 preguntas de los manuales ATP y Handbook (PHAK),
 *  - pedirle 10 respuestas a Yaris,
 *  - recibir 2 análisis de Pathy.
 *
 * El conteo vive en `localStorage` por usuario para que la UI pueda mostrar
 * el restante al instante; Yaris y Pathy además lo verifican en el servidor
 * (`profiles.data.freeUso`), que es la fuente de verdad de esas dos.
 */
import { useEffect, useState } from "react";
import type { User } from "./types";
import { isPaid } from "./gating";

export const FREE_LIMITS = {
  preguntas: 50,
  yaris: 10,
  pathy: 2,
} as const;

/**
 * Tope de preguntas por sesión CIAAC (cuestionario y simulador) para el plan
 * gratuito: ve el formato completo, pero sólo 25 reactivos.
 */
export const FREE_CIAAC_MAX = 25;


export type FreeKind = keyof typeof FREE_LIMITS;

/** Manuales cuyo banco está abierto al plan gratuito. */
export const FREE_SOURCES = ["ATP", "PHAK", "B737MAX"] as const;

export function isFreeSource(fuente?: string | null): boolean {
  return !!fuente && (FREE_SOURCES as readonly string[]).includes(fuente);
}

export interface FreeUsage {
  preguntas: number;
  yaris: number;
  pathy: number;
}

const EMPTY: FreeUsage = { preguntas: 0, yaris: 0, pathy: 0 };
const KEY = (userId: string) => `fp_free_uso_${userId}`;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getFreeUsage(userId: string | null | undefined): FreeUsage {
  if (!userId || typeof localStorage === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<FreeUsage>;
    return {
      preguntas: Number(parsed.preguntas) || 0,
      yaris: Number(parsed.yaris) || 0,
      pathy: Number(parsed.pathy) || 0,
    };
  } catch {
    return { ...EMPTY };
  }
}

function write(userId: string, usage: FreeUsage) {
  try {
    localStorage.setItem(KEY(userId), JSON.stringify(usage));
  } catch {
    /* almacenamiento lleno o bloqueado: la cuota del servidor sigue mandando */
  }
  emit();
}

/** Alinea el contador local con el que reporta el servidor. */
export function setFreeUsed(userId: string, kind: FreeKind, used: number) {
  const usage = getFreeUsage(userId);
  if (usage[kind] === used) return;
  write(userId, { ...usage, [kind]: used });
}

/** Cuántos usos le quedan (Infinity si es Pro/admin). */
export function freeRemaining(user: User | null, kind: FreeKind): number {
  if (!user) return 0;
  if (isPaid(user)) return Infinity;
  return Math.max(0, FREE_LIMITS[kind] - getFreeUsage(user.id)[kind]);
}

export function hasFreeLeft(user: User | null, kind: FreeKind): boolean {
  return freeRemaining(user, kind) > 0;
}

/** Descuenta `n` usos. Devuelve `true` si alcanzó la cuota. */
export function consumeFree(user: User | null, kind: FreeKind, n = 1): boolean {
  if (!user) return false;
  if (isPaid(user)) return true;
  const usage = getFreeUsage(user.id);
  const next = Math.min(FREE_LIMITS[kind], usage[kind] + n);
  const allowed = usage[kind] < FREE_LIMITS[kind];
  write(user.id, { ...usage, [kind]: next });
  return allowed;
}

/** Suscribe la UI a los cambios de cuota. */
export function useFreeQuota(user: User | null, kind: FreeKind): {
  remaining: number;
  limit: number;
  used: number;
  unlimited: boolean;
} {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const unlimited = isPaid(user);
  const used = user ? getFreeUsage(user.id)[kind] : 0;
  return {
    remaining: unlimited ? Infinity : Math.max(0, FREE_LIMITS[kind] - used),
    limit: FREE_LIMITS[kind],
    used,
    unlimited,
  };
}
