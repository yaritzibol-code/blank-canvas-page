/**
 * Activity Ratio — capa servidor del tracker de comportamiento.
 *
 * Recibe lotes de eventos del navegador (vistas de pantalla, hitos de
 * onboarding, abandonos) y los sella en `activity_sessions` /
 * `activity_events`. Funciona con o sin sesión: si el request trae bearer
 * token, las filas quedan ligadas al usuario; si no, se guardan como
 * anónimas. RLS sigue mandando en ambos casos.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function isNewKey(v: string): boolean {
  return v.startsWith("sb_publishable_") || v.startsWith("sb_secret_");
}

/** Cliente con la llave publicable y, si existe, el token del usuario. */
export function activityClient(token: string | null): SupabaseClient<Database> {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );
        if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
        if (isNewKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        if (token) headers.set("Authorization", `Bearer ${token}`);
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Saca el bearer del header sin fallar cuando no hay sesión. */
export function bearerFrom(header: string | null | undefined): string | null {
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token && token.split(".").length === 3 ? token : null;
}

export async function userIdFromToken(
  supabase: SupabaseClient<Database>,
  token: string | null,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    return String(data.claims.sub);
  } catch {
    return null;
  }
}

export interface ActivitySessionPatch {
  entryPath?: string;
  entryLabel?: string;
  exitPath?: string;
  exitLabel?: string;
  screenCount?: number;
  engagedMs?: number;
  isBounce?: boolean;
  device?: string;
  referrer?: string | null;
  utm?: Record<string, string>;
  plan?: string | null;
  onboardingStep?: string | null;
  onboardingDone?: boolean;
  ended?: boolean;
}

export interface ActivityEventInput {
  type: "view" | "milestone" | "abandon";
  path?: string | null;
  label?: string | null;
  step?: string | null;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  at?: string;
}

/** Crea/actualiza la sesión y guarda el lote de eventos. */
export async function persistActivity(params: {
  token: string | null;
  sessionKey: string;
  session: ActivitySessionPatch;
  events: ActivityEventInput[];
}): Promise<{ ok: boolean }> {
  const supabase = activityClient(params.token);
  const userId = await userIdFromToken(supabase, params.token);
  const s = params.session;

  const row = {
    session_key: params.sessionKey,
    user_id: userId,
    last_seen_at: new Date().toISOString(),
    ended_at: s.ended ? new Date().toISOString() : null,
    entry_path: s.entryPath ?? "/",
    entry_label: s.entryLabel ?? null,
    exit_path: s.exitPath ?? null,
    exit_label: s.exitLabel ?? null,
    screen_count: Math.max(1, Math.round(s.screenCount ?? 1)),
    engaged_ms: Math.max(0, Math.round(s.engagedMs ?? 0)),
    is_bounce: s.isBounce ?? true,
    device: s.device ?? "desconocido",
    referrer: s.referrer ?? null,
    utm: s.utm ?? {},
    plan: s.plan ?? null,
    onboarding_step: s.onboardingStep ?? null,
    onboarding_done: s.onboardingDone ?? false,
  };

  const { data: saved, error } = await supabase
    .from("activity_sessions")
    .upsert(row, { onConflict: "session_key" })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false };

  if (params.events.length) {
    await supabase.from("activity_events").insert(
      params.events.slice(0, 60).map((e) => ({
        session_id: saved?.id ?? null,
        session_key: params.sessionKey,
        user_id: userId,
        type: e.type,
        path: e.path ?? null,
        label: e.label ?? null,
        step: e.step ?? null,
        duration_ms: Math.max(0, Math.round(e.durationMs ?? 0)),
        metadata: (e.metadata ?? {}) as never,
        created_at: e.at ?? new Date().toISOString(),
      })),
    );
  }

  return { ok: true };
}
