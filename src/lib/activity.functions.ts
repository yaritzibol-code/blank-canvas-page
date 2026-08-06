/**
 * Activity Ratio — server functions.
 *
 * `trackActivity` recibe los lotes del navegador (público: los visitantes sin
 * cuenta también cuentan para el bounce rate) y los reportes admin consultan
 * las RPC `admin_activity_*`, que verifican rol admin dentro de la base.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ActivityEventInput, ActivitySessionPatch } from "@/lib/activity.server";

export interface ActivityBatch {
  sessionKey: string;
  session: ActivitySessionPatch;
  events: ActivityEventInput[];
}

export const trackActivity = createServerFn({ method: "POST" })
  .inputValidator((data: ActivityBatch) => {
    if (!data || typeof data.sessionKey !== "string" || data.sessionKey.length < 6) {
      throw new Error("sessionKey inválida");
    }
    return {
      sessionKey: data.sessionKey.slice(0, 64),
      session: data.session ?? {},
      events: Array.isArray(data.events) ? data.events.slice(0, 60) : [],
    };
  })
  .handler(async ({ data }) => {
    const { bearerFrom, persistActivity } = await import("@/lib/activity.server");
    const request = getRequest();
    const token = bearerFrom(request?.headers?.get("authorization"));
    try {
      return await persistActivity({ ...data, token });
    } catch {
      return { ok: false };
    }
  });

/* ───────────────────────────── Reportes admin ───────────────────────────── */

export interface ActivityOverview {
  sessions: number;
  users: number;
  anon_sessions: number;
  bounces: number;
  bounce_rate: number;
  avg_engaged_ms: number;
  avg_screens: number;
  onboarding_done: number;
  onboarding_started: number;
}

export interface ActivityScreenRow {
  path: string;
  label: string;
  entries: number;
  bounces: number;
  bounce_rate: number;
  exits: number;
  views: number;
  avg_ms: number;
}

export interface ActivityFunnelRow {
  step: string;
  people: number;
  sessions: number;
}

export interface ActivityUserRow {
  user_id: string;
  email: string | null;
  nombre: string | null;
  plan: string | null;
  sessions: number;
  engaged_ms: number;
  screens: number;
  bounces: number;
  onboarding_done: boolean;
  last_seen: string;
  last_path: string | null;
  last_label: string | null;
}

export type Jsonish = string | number | boolean | null | Jsonish[] | { [k: string]: Jsonish };

export interface ActivityTimelineRow {
  created_at: string;
  type: string;
  path: string | null;
  label: string | null;
  step: string | null;
  duration_ms: number;
  metadata: Jsonish;
}

export const adminActivityReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days: number }) => ({
    days: Math.min(Math.max(Math.round(data?.days ?? 7), 1), 90),
  }))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const [overview, screens, funnel, users] = await Promise.all([
      supabase.rpc("admin_activity_overview", { days_back: data.days }),
      supabase.rpc("admin_activity_by_screen", { days_back: data.days }),
      supabase.rpc("admin_activity_funnel", { days_back: data.days }),
      supabase.rpc("admin_activity_users", { days_back: data.days, max_rows: 200 }),
    ]);

    const err =
      overview.error?.message ||
      screens.error?.message ||
      funnel.error?.message ||
      users.error?.message;
    if (err) return { error: err };

    return {
      overview: (overview.data as unknown as ActivityOverview | null),
      screens: (screens.data ?? []) as unknown as ActivityScreenRow[],
      funnel: (funnel.data ?? []) as unknown as ActivityFunnelRow[],
      users: (users.data ?? []) as unknown as ActivityUserRow[],
    };
  });

export const adminActivityTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => ({ userId: String(data?.userId ?? "") }))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("admin_activity_user_timeline", {
      target_user: data.userId,
      max_rows: 300,
    });
    if (error) return { error: error.message };
    return { rows: (rows ?? []) as unknown as ActivityTimelineRow[] };
  });
