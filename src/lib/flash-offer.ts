/**
 * Oferta relámpago por checkout abandonado.
 *
 * Si alguien abre el pago y se sale sin completarlo, se dispara **una sola
 * vez** una oferta de 30 minutos que baja la inscripción a $1,500. Mientras
 * corre, un contador fijo acompaña al usuario por toda la app; al vencer, la
 * oferta se marca como consumida y no vuelve a aparecer.
 */
import { useEffect, useState } from "react";

export const FLASH_SETUP_PRICE = 1500;
export const FLASH_DURATION_MIN = 30;

const KEY = "fp_flash_offer";

export interface FlashOfferState {
  startedAt: number;
  expiresAt: number;
  /** Ya se mostró el popup grande (el contador del navbar sigue). */
  seen?: boolean;
  /** La oferta ya terminó (vencida o usada): no vuelve a ofrecerse. */
  done?: boolean;
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): FlashOfferState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FlashOfferState;
  } catch {
    return null;
  }
}

function write(state: FlashOfferState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
  emit();
}

export function getFlashOffer(): FlashOfferState | null {
  const s = read();
  if (!s) return null;
  if (!s.done && Date.now() >= s.expiresAt) {
    const closed = { ...s, done: true };
    write(closed);
    return closed;
  }
  return s;
}

/** ¿La oferta está corriendo ahora mismo? */
export function flashOfferActive(): boolean {
  const s = getFlashOffer();
  return !!s && !s.done && Date.now() < s.expiresAt;
}

/** Nunca se ofreció y todavía puede ofrecerse. */
export function flashOfferAvailable(): boolean {
  return read() === null;
}

/** Arranca la oferta (idempotente: sólo la primera vez en la vida de la cuenta). */
export function startFlashOffer(): FlashOfferState | null {
  if (!flashOfferAvailable()) return null;
  const startedAt = Date.now();
  const state: FlashOfferState = {
    startedAt,
    expiresAt: startedAt + FLASH_DURATION_MIN * 60_000,
  };
  write(state);
  return state;
}

/** Marca el popup grande como visto (el contador del navbar permanece). */
export function markFlashSeen() {
  const s = read();
  if (s && !s.seen) write({ ...s, seen: true });
}

/** Cierra la oferta: se pagó o venció. */
export function closeFlashOffer() {
  const s = read();
  write({ startedAt: s?.startedAt ?? Date.now(), expiresAt: Date.now(), done: true });
}

export function msLeft(): number {
  const s = getFlashOffer();
  if (!s || s.done) return 0;
  return Math.max(0, s.expiresAt - Date.now());
}

export function formatLeft(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Estado reactivo de la oferta con tic de un segundo. */
export function useFlashOffer(): { state: FlashOfferState | null; left: number; active: boolean } {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    const id = setInterval(l, 1000);
    return () => {
      listeners.delete(l);
      clearInterval(id);
    };
  }, []);
  const state = getFlashOffer();
  const left = state && !state.done ? Math.max(0, state.expiresAt - Date.now()) : 0;
  return { state, left, active: !!state && !state.done && left > 0 };
}
