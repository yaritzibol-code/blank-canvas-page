/**
 * Autenticación de las rutas `/api/*` que reciben el Bearer del navegador.
 *
 * Devuelve un cliente de Supabase que opera CON las políticas RLS del propio
 * usuario (no el de servicio): lo que la ruta pueda leer es exactamente lo que
 * ese usuario podría leer por su cuenta.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface RouteAuth {
  supabase: SupabaseClient;
  userId: string;
}

/** Verifica el Bearer del navegador y devuelve el cliente con RLS del usuario. */
export async function authenticateRequest(request: Request): Promise<RouteAuth | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  if (token.split(".").length !== 3) return null;

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase, userId: String(data.claims.sub) };
}

export interface RouteProfile {
  /** Datos libres del perfil (`profiles.data`). */
  data: Record<string, unknown>;
  /** Pro real: admin, suscripción activa en Stripe o plan de pago vigente. */
  isPro: boolean;
  /** Nombre del estudiante, "" si no lo capturó. */
  nombre: string;
}

/** Plan y datos del usuario en una sola ida a la base. */
export async function loadRouteProfile(auth: RouteAuth): Promise<RouteProfile> {
  const [{ data: isAdmin }, { data: profileRow }, { data: hasSub }] = await Promise.all([
    auth.supabase.rpc("is_admin"),
    auth.supabase.from("profiles").select("data").eq("id", auth.userId).maybeSingle(),
    auth.supabase.rpc("has_active_subscription", { user_uuid: auth.userId, check_env: "live" }),
  ]);

  const data = (profileRow?.data ?? {}) as Record<string, unknown>;
  const plan = String(data.plan ?? "");
  const accessStatus = String(data.accessStatus ?? "activo");
  const isPro =
    Boolean(isAdmin) ||
    Boolean(hasSub) ||
    (plan === "paga" && ["activo", "extendido", "prueba"].includes(accessStatus));

  return { data, isPro, nombre: String(data.nombre ?? "").trim() };
}
