/**
 * Cliente de Lovable Cloud (Supabase administrado).
 *
 * Las credenciales públicas las inyecta Lovable Cloud al construir el proyecto
 * (VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY).
 * Si no están presentes (desarrollo local sin .env), la app funciona en modo
 * local puro con localStorage — exactamente igual que antes de la migración.
 *
 * IMPORTANTE: toda la app comparte UN solo cliente — el auto-generado en
 * `@/integrations/supabase/client` — que es el mismo que usa el flujo OAuth de
 * Lovable (`lovable.auth.signInWithOAuth`). Tener dos clientes con storage
 * distinto hacía que la sesión de Google se guardara donde la app no la leía.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
// El cliente compartido es un Proxy lazy: importarlo no lo instancia; solo se
// crea (y valida credenciales) en el primer acceso, siempre tras cloudEnabled().
import { supabase } from "@/integrations/supabase/client";

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

const CLOUD_URL = env.VITE_SUPABASE_URL ?? "";
const CLOUD_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? "";

/** true cuando el build tiene credenciales de Lovable Cloud y corre en navegador. */
export function cloudEnabled(): boolean {
  return typeof window !== "undefined" && !!CLOUD_URL && !!CLOUD_KEY;
}

/**
 * Migración única: versiones previas guardaban la sesión bajo la clave
 * personalizada "fp_cloud_auth". El cliente compartido usa la clave por defecto
 * de supabase-js (`sb-<ref>-auth-token`); copiamos la sesión vieja para no
 * cerrar la sesión de nadie con el cambio.
 */
let migrated = false;
function migrateLegacyAuthStorage() {
  if (migrated || typeof window === "undefined") return;
  migrated = true;
  try {
    const legacy = localStorage.getItem("fp_cloud_auth");
    if (!legacy) return;
    const ref = new URL(CLOUD_URL).hostname.split(".")[0];
    const key = `sb-${ref}-auth-token`;
    if (!localStorage.getItem(key)) localStorage.setItem(key, legacy);
    localStorage.removeItem("fp_cloud_auth");
  } catch {
    /* sin migración: en el peor caso pide iniciar sesión de nuevo */
  }
}

/** Cliente Supabase compartido (null en SSR o sin credenciales). */
export function supa(): SupabaseClient | null {
  if (!cloudEnabled()) return null;
  migrateLegacyAuthStorage();
  // El tipado Database generado no cubre todas las tablas que usa sync.ts;
  // la capa de datos trabaja con el cliente sin genéricos.
  return supabase as unknown as SupabaseClient;
}
