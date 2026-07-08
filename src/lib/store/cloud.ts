/**
 * Cliente de Lovable Cloud (Supabase administrado).
 *
 * Las credenciales públicas las inyecta Lovable Cloud al construir el proyecto
 * (VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY).
 * Si no están presentes (desarrollo local sin .env), la app funciona en modo
 * local puro con localStorage — exactamente igual que antes de la migración.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

const CLOUD_URL = env.VITE_SUPABASE_URL ?? "";
const CLOUD_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? "";

let client: SupabaseClient | null = null;

/** true cuando el build tiene credenciales de Lovable Cloud y corre en navegador. */
export function cloudEnabled(): boolean {
  return typeof window !== "undefined" && !!CLOUD_URL && !!CLOUD_KEY;
}

/** Cliente Supabase (null en SSR o sin credenciales). */
export function supa(): SupabaseClient | null {
  if (!cloudEnabled()) return null;
  if (!client) {
    client = createClient(CLOUD_URL, CLOUD_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "fp_cloud_auth",
      },
    });
  }
  return client;
}
