/**
 * Hooks de React para consumir la capa de datos.
 * `useStore(selector)` re-ejecuta el selector cuando cualquier colección cambia
 * (incluidas otras pestañas). En SSR devuelve el resultado sobre datos vacíos.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import { subscribe, getVersion } from "./db";
import { ensureSeeded } from "./seed";
import { getSessionUser, purgeExpiredAccounts } from "./auth";
import type { User } from "./types";

let initialized = false;
function initOnce() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  ensureSeeded();
  purgeExpiredAccounts();
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
 */
export function useRequireAuth(requiredRole?: "admin"): { user: User | null; ready: boolean } {
  const user = useSessionUser();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      navigate({ to: "/login" });
    } else if (requiredRole === "admin" && user.role !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [mounted, user, requiredRole, navigate]);

  const ready = mounted && !!user && (requiredRole !== "admin" || user.role === "admin");
  return { user, ready };
}

/** Fuerza una re-lectura manual (para acciones imperativas encadenadas). */
export function useRefresh(): () => void {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}
