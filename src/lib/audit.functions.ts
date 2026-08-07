/**
 * Auditoría del panel admin.
 *
 * Dos vistas:
 *  1. Cuestionarios y simuladores respondidos (con detalle pregunta por
 *     pregunta), separados entre CIAAC —que se divide por materias— y Línea
 *     Aérea —que se divide por manual y capítulo—.
 *  2. Bitácora de conversaciones con Yaris para leer qué preguntó la
 *     estudiante y qué contestó la tutora.
 *
 * Todo valida `is_admin()` server-side antes de tocar `supabaseAdmin`.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Res<T> = T | { error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(supabase: any): Promise<string | null> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return `No se pudo validar rol admin: ${error.message}`;
  if (!data) return "Requiere rol admin.";
  return null;
}

export interface AuditAnswer {
  questionId: string;
  materia: string;
  fuente?: string;
  capitulo?: number;
  capituloTitulo?: string;
  seccion?: string;
  selectedIndex: number;
  correctIndex: number;
}

export interface AuditAttempt {
  id: string;
  kind: "quiz" | "sim";
  userId: string;
  email: string | null;
  nombre: string | null;
  date: string;
  titulo: string | null;
  track: "ciaac" | "la" | "mixto";
  total: number;
  correct: number;
  pct: number;
  durationMin: number;
  answers: AuditAnswer[];
}

interface RawAttempt {
  id?: string;
  userId?: string;
  date?: string;
  titulo?: string;
  total?: number;
  correct?: number;
  durationMin?: number;
  durationSecs?: number;
  answers?: AuditAnswer[];
}

function trackOf(answers: AuditAnswer[]): "ciaac" | "la" | "mixto" {
  let la = 0;
  let ciaac = 0;
  for (const a of answers) {
    if (a?.fuente) la++;
    else ciaac++;
  }
  if (la > 0 && ciaac > 0) return "mixto";
  return la > 0 ? "la" : "ciaac";
}

export const adminAttemptsAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days?: number; userId?: string; track?: string; limit?: number }) => ({
    days: Math.min(Math.max(Math.round(data?.days ?? 30), 1), 365),
    userId: typeof data?.userId === "string" && data.userId ? data.userId : null,
    track: data?.track ?? "todos",
    limit: Math.min(Math.max(Math.round(data?.limit ?? 300), 10), 1000),
  }))
  .handler(async ({ data, context }): Promise<Res<{ rows: AuditAttempt[] }>> => {
    const guard = await assertAdmin(context.supabase);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("user_state")
      .select("user_id,collection,data")
      .in("collection", ["quiz_attempts", "sim_attempts"]);
    if (data.userId) q = q.eq("user_id", data.userId);
    const { data: states, error } = await q;
    if (error) return { error: error.message };

    const ids = Array.from(new Set((states ?? []).map((s) => s.user_id as string)));
    const perfil = new Map<string, { email: string | null; nombre: string | null }>();
    if (ids.length > 0) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id,email,data").in("id", ids);
      for (const p of profs ?? []) {
        const d = (p.data ?? {}) as { nombre?: string };
        perfil.set(p.id as string, { email: (p.email as string) ?? null, nombre: d.nombre ?? null });
      }
    }

    const since = Date.now() - data.days * 86400000;
    const rows: AuditAttempt[] = [];

    for (const s of states ?? []) {
      const kind: "quiz" | "sim" = s.collection === "sim_attempts" ? "sim" : "quiz";
      const list = Array.isArray(s.data) ? (s.data as RawAttempt[]) : [];
      for (const a of list) {
        const date = String(a?.date ?? "");
        if (!date || new Date(date).getTime() < since) continue;
        const answers = Array.isArray(a.answers) ? a.answers : [];
        const total = Number(a.total ?? answers.length ?? 0);
        const correct = Number(a.correct ?? 0);
        const who = perfil.get(s.user_id as string);
        rows.push({
          id: String(a.id ?? `${s.user_id}-${date}`),
          kind,
          userId: s.user_id as string,
          email: who?.email ?? null,
          nombre: who?.nombre ?? null,
          date,
          titulo: a.titulo ?? null,
          track: trackOf(answers),
          total,
          correct,
          pct: total > 0 ? Math.round((correct * 100) / total) : 0,
          durationMin: Math.round(a.durationMin ?? (a.durationSecs ? a.durationSecs / 60 : 0)),
          answers,
        });
      }
    }

    const filtered =
      data.track === "todos"
        ? rows
        : rows.filter((r) => r.track === data.track || r.track === "mixto");

    filtered.sort((a, b) => b.date.localeCompare(a.date));
    return { rows: filtered.slice(0, data.limit) };
  });

export interface AuditQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  materia: string;
  fuente?: string;
  capitulo?: number;
  capituloTitulo?: string;
  explanation?: string;
}

/** Texto real de los reactivos de un intento (para auditar respuesta por respuesta). */
export const adminAttemptQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ids: string[] }) => ({
    ids: Array.isArray(data?.ids) ? data.ids.filter((i) => typeof i === "string").slice(0, 400) : [],
  }))
  .handler(async ({ data, context }): Promise<Res<{ questions: AuditQuestion[] }>> => {
    const guard = await assertAdmin(context.supabase);
    if (guard) return { error: guard };
    if (data.ids.length === 0) return { questions: [] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("content")
      .select("id,data")
      .eq("collection", "questions")
      .in("id", data.ids);
    if (error) return { error: error.message };
    const questions = (rows ?? []).map((r) => {
      const d = (r.data ?? {}) as Record<string, unknown>;
      return {
        id: String(r.id),
        text: String(d.text ?? ""),
        options: Array.isArray(d.options) ? (d.options as string[]) : [],
        correctIndex: Number(d.correctIndex ?? -1),
        materia: String(d.materia ?? ""),
        fuente: d.fuente ? String(d.fuente) : undefined,
        capitulo: d.capitulo !== undefined && d.capitulo !== "" ? Number(d.capitulo) : undefined,
        capituloTitulo: d.capituloTitulo ? String(d.capituloTitulo) : undefined,
        explanation: d.explanation ? String(d.explanation) : undefined,
      } as AuditQuestion;
    });
    return { questions };
  });

/* ─────────────────────── Conversaciones con Yaris ─────────────────────── */

export interface YarisLogRow {
  id: string;
  user_id: string | null;
  email: string | null;
  nombre: string | null;
  seccion: string | null;
  materia: string | null;
  tono: string | null;
  fuente: string;
  pre_answer: boolean;
  question_text: string | null;
  pregunta: string;
  respuesta: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export const adminYarisLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days?: number; userId?: string; query?: string; limit?: number }) => ({
    days: Math.min(Math.max(Math.round(data?.days ?? 30), 1), 365),
    userId: typeof data?.userId === "string" && data.userId ? data.userId : null,
    query: typeof data?.query === "string" ? data.query.trim().slice(0, 120) : "",
    limit: Math.min(Math.max(Math.round(data?.limit ?? 200), 10), 1000),
  }))
  .handler(async ({ data, context }): Promise<Res<{ rows: YarisLogRow[] }>> => {
    const guard = await assertAdmin(context.supabase);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - data.days * 86400000).toISOString();
    let q = supabaseAdmin
      .from("yaris_messages")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.userId) q = q.eq("user_id", data.userId);
    if (data.query) q = q.or(`pregunta.ilike.%${data.query}%,respuesta.ilike.%${data.query}%`);
    const { data: rows, error } = await q;
    if (error) return { error: error.message };

    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id).filter(Boolean))) as string[];
    const perfil = new Map<string, { email: string | null; nombre: string | null }>();
    if (ids.length > 0) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id,email,data").in("id", ids);
      for (const p of profs ?? []) {
        const d = (p.data ?? {}) as { nombre?: string };
        perfil.set(p.id as string, { email: (p.email as string) ?? null, nombre: d.nombre ?? null });
      }
    }

    return {
      rows: (rows ?? []).map((r) => ({
        ...(r as unknown as Omit<YarisLogRow, "email" | "nombre">),
        email: r.user_id ? (perfil.get(r.user_id)?.email ?? null) : null,
        nombre: r.user_id ? (perfil.get(r.user_id)?.nombre ?? null) : null,
      })),
    };
  });
