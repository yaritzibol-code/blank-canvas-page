/**
 * Hooks de React para consumir la capa de datos.
 * `useStore(selector)` re-ejecuta el selector cuando cualquier colección cambia
 * (incluidas otras pestañas). En SSR devuelve el resultado sobre datos vacíos.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import { subscribe, getVersion } from "./db";
import { ensureSeeded } from "./seed";
import { getSessionUser, purgeExpiredAccounts, restoreCloudSession, isAuthSettled } from "./auth";
import type { User } from "./types";

let initialized = false;
function initOnce() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  ensureSeeded();
  purgeExpiredAccounts();
  // Con Lovable Cloud activo, restaura la sesión de Supabase e hidrata en
  // segundo plano; la UI se actualiza sola conforme llegan los datos.
  void restoreCloudSession().catch(() => {});
}

/**
 * Arranque explícito de la capa de datos (lo llama el layout raíz).
 * Garantiza que el cliente de Supabase se cree en CUALQUIER página — necesario
 * para procesar los tokens que el OAuth de Google / la confirmación de correo /
 * el enlace de recuperación devuelven en el hash de la URL, aunque el usuario
 * aterrice en una página que no usa el store (p. ej. la landing).
 */
export function initAppStore() {
  initOnce();
}

export function useStoreVersion(): number {
  initOnce();
  return useSyncExternalStore(
    subscribe,
    getVersion,
    () => 0,
  );
}

/** Ejecuta un selector sobre el store; se actualiza con cada cambio. */
export function useStore<T>(selector: () => T): T {
  useStoreVersion();
  return selector();
}

/** Usuario en sesión (null en SSR o sin sesión). */
export function useSessionUser(): User | null {
  return useStore(() => (typeof window === "undefined" ? null : getSessionUser()));
}

/**
 * Guard de rutas privadas: redirige a /login si no hay sesión
 * (o a /dashboard si se requiere rol admin y no lo es).
 * Devuelve { user, ready } — renderiza el contenido solo cuando ready.
 *
 * Espera a que la restauración de la sesión de nube termine (isAuthSettled)
 * antes de decidir: si el usuario llega desde el retorno de Google OAuth o de
 * un enlace de correo, la sesión tarda un instante en espejarse y redirigir a
 * /login en ese lapso lo dejaba fuera aunque sí había iniciado sesión.
 *
 * Las rutas públicas (/, /login, /register, /blog, /faq, /legal y
 * /reset-password) simplemente no usan este guard.
 */
export function useRequireAuth(requiredRole?: "admin"): { user: User | null; ready: boolean } {
  const user = useSessionUser();
  const settled = useStore(() => isAuthSettled());
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !settled) return;
    if (!user) {
      navigate({ to: "/login" });
    } else if (requiredRole === "admin" && user.role !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [mounted, settled, user, requiredRole, navigate]);

  const ready = mounted && settled && !!user && (requiredRole !== "admin" || user.role === "admin");
  return { user, ready };
}

/** Fuerza una re-lectura manual (para acciones imperativas encadenadas). */
export function useRefresh(): () => void {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}
