/**
 * FlightPoints — funciones de servidor.
 *
 * Todo lo que otorga, consulta o corrige puntos pasa por aquí. El navegador
 * sólo puede pedir "revisa mi actividad": los montos salen de `fp_rules` y la
 * actividad se lee del estado ya sincronizado del propio usuario.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { derivarEventos, rachasDe, type FpEstado, type FpRule, type RuleMap } from "./fp.server";
import { generarCallsign } from "./callsign";
import { FP_TOP_N, type FpNuevo, type FpRankingRow, type FpReglaPublica, type FpResumen, type FpTx } from "./shared";

type Row = Record<string, unknown>;

function folioDe(userId: string): string {
  let h = 0;
  for (const ch of userId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  let n = h;
  for (let i = 0; i < 5; i++) {
    s += abc[n % abc.length];
    n = Math.floor(n / abc.length) + 7;
  }
  return `FP-${s}`;
}

/**
 * Garantiza que el alumno tenga su indicativo (callsign) y lo devuelve.
 *
 * Se genera una sola vez y nunca cambia: si ya existe se respeta tal cual. La
 * unicidad la garantiza el índice de la base; si la combinación ya está tomada
 * (violación 23505) se prueba otra derivada de la misma semilla.
 */
export async function asegurarCallsign(admin: { from: (t: string) => any }, userId: string): Promise<string> {
  const { data: perfil } = await admin
    .from("fp_community_profiles")
    .select("user_id,callsign")
    .eq("user_id", userId)
    .maybeSingle();
  if (perfil?.callsign) return String(perfil.callsign);

  for (let salt = 0; salt < 24; salt++) {
    const callsign = generarCallsign(userId, salt);
    const ahora = new Date().toISOString();
    const res = perfil
      ? await admin
          .from("fp_community_profiles")
          .update({ callsign, updated_at: ahora })
          .eq("user_id", userId)
          .is("callsign", null)
          .select("callsign")
      : await admin
          .from("fp_community_profiles")
          .insert({ user_id: userId, folio: folioDe(userId), callsign, updated_at: ahora })
          .select("callsign");
    if (!res.error) {
      const fila = (res.data ?? [])[0] as { callsign?: string } | undefined;
      if (fila?.callsign) return String(fila.callsign);
      // Otra petición concurrente ya lo asignó: se lee y se respeta.
      const { data: otra } = await admin
        .from("fp_community_profiles")
        .select("callsign")
        .eq("user_id", userId)
        .maybeSingle();
      if (otra?.callsign) return String(otra.callsign);
      continue;
    }
    const code = String((res.error as { code?: string }).code ?? "");
    if (code !== "23505") throw new Error(String((res.error as { message?: string }).message ?? "callsign"));
  }
  throw new Error("No se pudo asignar un indicativo único");
}

async function cargarReglas(admin: { from: (t: string) => any }): Promise<RuleMap> {
  const { data } = await admin.from("fp_rules").select("key,label,categoria,value,enabled");
  const map: RuleMap = new Map();
  ((data ?? []) as FpRule[]).forEach((r) => map.set(r.key, r));
  return map;
}

async function cargarEstado(
  admin: { from: (t: string) => any },
  userId: string,
): Promise<FpEstado> {
  const { data } = await admin
    .from("user_state")
    .select("collection,data")
    .eq("user_id", userId);
  const get = (c: string): Row[] => {
    const row = (data ?? []).find((r: Row) => r["collection"] === c);
    const val = row?.["data"];
    return Array.isArray(val) ? (val as Row[]) : [];
  };
  const daysRow = (data ?? []).find((r: Row) => r["collection"] === "study_days");
  return {
    activity: get("activity"),
    quizzes: get("quiz_attempts"),
    sims: get("sim_attempts"),
    temas: get("tema_progress"),
    flash: get("flash_sessions"),
    logros: get("logros"),
    studyDays: (daysRow?.["data"] as Record<string, number>) ?? {},
  };
}

async function recalcularSaldo(admin: { from: (t: string) => any }, userId: string): Promise<number> {
  const { data } = await admin
    .from("fp_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("status", "procesada");
  const total = ((data ?? []) as { amount: number }[]).reduce((s, t) => s + Number(t.amount ?? 0), 0);
  await admin
    .from("fp_balances")
    .upsert({ user_id: userId, total, updated_at: new Date().toISOString() });
  return total;
}

/* ───────────────────────── Otorgar / backfill ───────────────────────── */

/**
 * Procesa la actividad real de UN usuario y crea las transacciones que falten.
 * Es idempotente: sirve igual al terminar un cuestionario que como backfill
 * masivo de toda la plataforma.
 */
export async function procesarUsuarioFP(
  admin: { from: (t: string) => any },
  rules: RuleMap,
  userId: string,
): Promise<{ nuevos: FpNuevo[]; total: number }> {
  {
    const estado = await cargarEstado(admin, userId);
    const eventos = derivarEventos(estado, rules);

    const { data: previas } = await admin
      .from("fp_transactions")
      .select("event_key")
      .eq("user_id", userId);
    const yaEstan = new Set(((previas ?? []) as { event_key: string }[]).map((t) => t.event_key));

    const nuevas = eventos.filter((e) => !yaEstan.has(e.eventKey));
    const nuevos: FpNuevo[] = [];

    if (nuevas.length > 0) {
      const filas = nuevas.map((e) => ({
        user_id: userId,
        event_key: e.eventKey,
        rule_key: e.ruleKey,
        kind: e.kind,
        amount: e.sospecha ? 0 : e.amount,
        program: e.program,
        activity_type: e.activityType,
        activity_id: e.activityId,
        activity_label: e.activityLabel,
        detail: e.detail,
        status: e.sospecha ? "rechazada" : "procesada",
        rule_snapshot: (rules.get(e.ruleKey)?.value ?? {}) as Record<string, number>,
        occurred_at: e.occurredAt,
      }));
      for (let i = 0; i < filas.length; i += 400) {
        await admin
          .from("fp_transactions")
          .upsert(filas.slice(i, i + 400), { onConflict: "user_id,event_key", ignoreDuplicates: true });
      }
      const sospechosas = nuevas.filter((e) => e.sospecha);
      if (sospechosas.length > 0) {
        await admin.from("fp_alerts").insert(
          sospechosas.slice(0, 20).map((e) => ({
            user_id: userId,
            tipo: "actividad_sospechosa",
            mensaje: e.sospecha!,
            detalle: { evento: e.eventKey, actividad: e.activityLabel },
          })),
        );
      }
      nuevas
        .filter((e) => !e.sospecha)
        .forEach((e) =>
          nuevos.push({
            amount: e.amount,
            activity_label: e.activityLabel,
            detail: e.detail,
            activity_type: e.activityType,
          }),
        );
    }

    const total = await recalcularSaldo(admin, userId);

    // Perfil de Comunidad: folio estable + métricas publicadas por el servidor.
    const rachas = rachasDe(estado);
    await admin.from("fp_community_profiles").upsert(
      {
        user_id: userId,
        folio: folioDe(userId),
        racha_actual: rachas.actual,
        racha_max: rachas.max,
        logros: estado.logros.length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    await asegurarCallsign(admin, userId).catch(() => undefined);

    return { nuevos, total };
  }
}

/** El propio alumno pide "revisa mi actividad". */
export const claimFlightPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ nuevos: FpNuevo[]; total: number }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const admin = supabaseAdmin as unknown as { from: (t: string) => any };
      const rules = await cargarReglas(admin);
      return await procesarUsuarioFP(admin, rules, context.userId);
    } catch (error) {
      // FlightPoints is supplemental: a temporarily unavailable privileged
      // client must never turn the authenticated dashboard into a 500 page.
      // The scheduled sync will process the same idempotent events later.
      console.error("[FlightPoints] No se pudo procesar la actividad", error);
      const { data } = await context.supabase
        .from("fp_balances")
        .select("total")
        .eq("user_id", context.userId)
        .maybeSingle();
      return { nuevos: [], total: Number(data?.total ?? 0) };
    }
  });

/**
 * Procesa a todos los alumnos con actividad guardada. Lo usa el backfill del
 * panel admin y la tarea programada, para que los rankings reflejen la
 * actividad real de la plataforma aunque el alumno no haya abierto Comunidad.
 */
export async function procesarTodosFP(
  admin: { from: (t: string) => any },
  opciones: { desde?: string; limite?: number } = {},
): Promise<{ usuarios: number; fpNuevo: number }> {
  const rules = await cargarReglas(admin);
  let q = admin.from("user_state").select("user_id,updated_at").limit(opciones.limite ?? 5000);
  if (opciones.desde) q = q.gte("updated_at", opciones.desde);
  const { data } = await q;
  const ids = [...new Set(((data ?? []) as { user_id: string }[]).map((r) => r.user_id).filter(Boolean))];

  let fpNuevo = 0;
  for (const id of ids) {
    try {
      const r = await procesarUsuarioFP(admin, rules, id);
      fpNuevo += r.nuevos.reduce((s, n) => s + n.amount, 0);
    } catch {
      // Un alumno con estado corrupto no debe detener el resto del backfill.
    }
  }
  return { usuarios: ids.length, fpNuevo };
}

/* ───────────────────────── Consulta del usuario ───────────────────────── */

export const getFlightPoints = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FpResumen> => {
    const { supabase, userId } = context;
    const { data: txs } = await supabase
      .from("fp_transactions")
      .select("id,event_key,rule_key,kind,amount,program,activity_type,activity_label,detail,status,occurred_at")
      .eq("user_id", userId)
      .eq("status", "procesada")
      .order("occurred_at", { ascending: false })
      .limit(2000);
    const lista = (txs ?? []) as unknown as FpTx[];

    const ahora = new Date();
    const inicioSemana = new Date(ahora);
    inicioSemana.setDate(ahora.getDate() - ((ahora.getDay() + 6) % 7));
    inicioSemana.setHours(0, 0, 0, 0);
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const suma = (f: (t: FpTx) => boolean) =>
      lista.filter(f).reduce((s, t) => s + Number(t.amount ?? 0), 0);

    const agrupar = <K extends string>(key: (t: FpTx) => K) => {
      const m = new Map<K, { fp: number; n: number }>();
      lista.forEach((t) => {
        const k = key(t);
        const cur = m.get(k) ?? { fp: 0, n: 0 };
        m.set(k, { fp: cur.fp + Number(t.amount ?? 0), n: cur.n + 1 });
      });
      return [...m.entries()].sort((a, b) => b[1].fp - a[1].fp);
    };

    const { data: perfil } = await supabase
      .from("fp_community_profiles")
      .select("folio,callsign,privacidad,privacidad_elegida,tutorial_visto,tutorial_oculto,racha_actual,racha_max,logros")
      .eq("user_id", userId)
      .maybeSingle();

    let callsign = (perfil?.callsign as string | null) ?? null;
    if (!callsign) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      callsign = await asegurarCallsign(supabaseAdmin as unknown as { from: (t: string) => any }, userId).catch(
        () => generarCallsign(userId),
      );
    }

    return {
      total: suma(() => true),
      semana: suma((t) => new Date(t.occurred_at) >= inicioSemana),
      mes: suma((t) => new Date(t.occurred_at) >= inicioMes),
      porActividad: agrupar((t) => t.activity_type).map(([tipo, v]) => ({ tipo, ...v })),
      porPrograma: agrupar((t) => (t.program ?? "GENERAL")).map(([programa, v]) => ({ programa, ...v })),
      recientes: lista.slice(0, 10),
      folio: (perfil?.folio as string) ?? folioDe(userId),
      callsign,
      privacidad: ((perfil?.privacidad as string) ?? "folio") === "nombre" ? "nombre" : "folio",
      privacidadElegida: Boolean(perfil?.privacidad_elegida),
      tutorialVisto: Boolean(perfil?.tutorial_visto),
      tutorialOculto: Boolean(perfil?.tutorial_oculto),
      rachaActual: Number(perfil?.racha_actual ?? 0),
      rachaMax: Number(perfil?.racha_max ?? 0),
      logros: Number(perfil?.logros ?? 0),
    };
  });

export const getFlightPointsHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tipo?: string }) => d ?? {})
  .handler(async ({ data, context }): Promise<FpTx[]> => {
    let q = context.supabase
      .from("fp_transactions")
      .select("id,event_key,rule_key,kind,amount,program,activity_type,activity_label,detail,status,occurred_at")
      .eq("user_id", context.userId)
      .order("occurred_at", { ascending: false })
      .limit(500);
    if (data.tipo && data.tipo !== "todos") q = q.eq("activity_type", data.tipo);
    const { data: txs } = await q;
    return (txs ?? []) as unknown as FpTx[];
  });

export const setCommunityPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { privacidad?: "nombre" | "folio"; tutorialVisto?: boolean; tutorialOculto?: boolean }) => d ?? {})
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {
      user_id: context.userId,
      folio: folioDe(context.userId),
      updated_at: new Date().toISOString(),
    };
    if (data.privacidad) {
      patch["privacidad"] = data.privacidad;
      patch["privacidad_elegida"] = true;
    }
    if (data.tutorialVisto !== undefined) patch["tutorial_visto"] = data.tutorialVisto;
    if (data.tutorialOculto !== undefined) patch["tutorial_oculto"] = data.tutorialOculto;
    const admin = supabaseAdmin as unknown as { from: (t: string) => any };
    await admin.from("fp_community_profiles").upsert(patch, { onConflict: "user_id" });
    const callsign = await asegurarCallsign(admin, context.userId).catch(() => generarCallsign(context.userId));
    return { ok: true, callsign };
  });

/** Reglas vigentes de FlightPoints, tal como las explica el tutorial (sin montos inventados). */
export const getFpRulesPublic = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FpReglaPublica[]> => {
    const { data } = await context.supabase
      .from("fp_rules")
      .select("key,label,categoria,value,enabled,orden")
      .eq("enabled", true)
      .order("orden");
    return ((data ?? []) as Row[])
      .map((r) => ({
        key: String(r["key"]),
        label: String(r["label"]),
        categoria: String(r["categoria"]),
        fp: Number((r["value"] as Record<string, number> | null)?.["fp"] ?? 0),
      }))
      .filter((r) => r.fp > 0);
  });

/* ───────────────────────── Comunidad ───────────────────────── */

type LbRow = {
  user_id: string;
  nombre: string;
  folio: string;
  callsign: string | null;
  privacidad: string;
  avatar: string | null;
  valor: number;
  posicion: number;
};

/**
 * Firma las fotos de quienes SÍ muestran su nombre. El bucket `avatars` es
 * privado por carpeta, así que un alumno no podría leer la foto de otro; el
 * servidor firma sólo las que la propia persona decidió publicar.
 */
async function firmarAvatares(rows: LbRow[]): Promise<Map<string, string>> {
  const rutas = [...new Set(rows.filter((r) => r.privacidad === "nombre" && r.avatar).map((r) => r.avatar!))];
  const firmadas = new Map<string, string>();
  if (rutas.length === 0) return firmadas;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await (supabaseAdmin as unknown as {
      storage: { from: (b: string) => { createSignedUrls: (p: string[], ttl: number) => Promise<{ data: { path: string | null; signedUrl: string }[] | null }> } };
    }).storage
      .from("avatars")
      .createSignedUrls(rutas, 60 * 60);
    (data ?? []).forEach((d) => {
      if (d.path && d.signedUrl) firmadas.set(d.path, d.signedUrl);
    });
  } catch {
    // Sin foto firmada la fila cae a iniciales: nunca se rompe el ranking.
  }
  return firmadas;
}

function filaPublica(r: LbRow, miId: string, fotos: Map<string, string>): FpRankingRow {
  const anonimo = r.privacidad !== "nombre";
  const callsign = r.callsign ?? r.folio;
  return {
    userId: r.user_id,
    display: anonimo ? callsign : r.nombre,
    callsign,
    anonimo,
    avatarUrl: !anonimo && r.avatar ? (fotos.get(r.avatar) ?? null) : null,
    esYo: r.user_id === miId,
    valor: Number(r.valor ?? 0),
    posicion: Number(r.posicion ?? 0),
  };
}

/** Lee el ranking completo desde la RPC (ya excluye cuentas admin). */
async function leerRanking(
  supabase: { rpc: (n: string, a: Record<string, string>) => Promise<{ data: unknown; error: unknown }> },
  metric: string,
  periodo: string,
): Promise<LbRow[]> {
  const { data: filas, error } = await supabase.rpc("fp_leaderboard", {
    p_metric: metric,
    p_period: metric === "racha" || metric === "logros" ? "historico" : periodo,
  });
  if (error) return [];
  return (filas ?? []) as LbRow[];
}

async function esCuentaAdmin(context: { supabase: any; userId: string }): Promise<boolean> {
  const { data } = await context.supabase.from("profiles").select("role").eq("id", context.userId).maybeSingle();
  return data?.role === "admin";
}

export const getComunidad = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { metric: string; periodo: string }) => d)
  .handler(
    async ({
      data,
      context,
    }): Promise<{
      top: FpRankingRow[];
      yo: FpRankingRow[];
      total: number;
      miPosicion: number | null;
      miValor: number | null;
      faltan: number | null;
      posicionArriba: number | null;
      esAdmin: boolean;
    }> => {
      const [rows, esAdmin] = await Promise.all([
        leerRanking(context.supabase as any, data.metric, data.periodo),
        esCuentaAdmin(context),
      ]);
      const idx = rows.findIndex((r) => r.user_id === context.userId);
      // Ventana privada: dos arriba y dos abajo de mi posición.
      const vecinos = idx >= 0 ? rows.slice(Math.max(0, idx - 2), idx + 3) : [];
      const arriba = idx > 0 ? rows[idx - 1] : null;
      const usaFp = data.metric !== "racha" && data.metric !== "logros";
      const top = rows.slice(0, FP_TOP_N);
      const yo = idx >= FP_TOP_N ? vecinos : [];
      const fotos = await firmarAvatares([...top, ...yo]);
      const map = (r: LbRow) => filaPublica(r, context.userId, fotos);
      return {
        top: top.map(map),
        yo: yo.map(map),
        total: rows.length,
        miPosicion: idx >= 0 ? Number(rows[idx]!.posicion ?? idx + 1) : null,
        miValor: idx >= 0 ? Number(rows[idx]!.valor ?? 0) : null,
        faltan:
          usaFp && idx > 0 && arriba
            ? Math.max(0, Number(arriba.valor ?? 0) - Number(rows[idx]!.valor ?? 0))
            : null,
        posicionArriba: idx > 0 && arriba ? Number(arriba.posicion ?? idx) : null,
      esAdmin,
      };
    },
  );

/** Mi posición en los cinco rankings, para la pestaña "Yo". */
export const getMisPosiciones = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { periodo: string }) => d ?? { periodo: "semana" })
  .handler(
    async ({
      data,
      context,
    }): Promise<{
      esAdmin: boolean;
      posiciones: { metric: string; posicion: number | null; valor: number; total: number; faltan: number | null }[];
    }> => {
      const metrics = ["general", "ciaac", "linea_aerea", "racha", "logros"];
      const esAdmin = await esCuentaAdmin(context);
      const resultados = await Promise.all(
        metrics.map(async (m) => {
          const rows = await leerRanking(context.supabase as any, m, data.periodo);
          const idx = rows.findIndex((r) => r.user_id === context.userId);
          const arriba = idx > 0 ? rows[idx - 1] : null;
          const usaFp = m !== "racha" && m !== "logros";
          return {
            metric: m,
            posicion: idx >= 0 ? Number(rows[idx]!.posicion ?? idx + 1) : null,
            valor: idx >= 0 ? Number(rows[idx]!.valor ?? 0) : 0,
            total: rows.length,
            faltan:
              usaFp && idx > 0 && arriba
                ? Math.max(0, Number(arriba.valor ?? 0) - Number(rows[idx]!.valor ?? 0))
                : null,
          };
        }),
      );
      return { esAdmin, posiciones: resultados };
    },
  );

/* ───────────────────────── Admin ───────────────────────── */

async function exigirAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase
    .from("profiles")
    .select("role")
    .eq("id", context.userId)
    .maybeSingle();
  if (data?.role !== "admin") throw new Error("No autorizado");
}

/** Recalcula FlightPoints de todos los alumnos desde su actividad real. */
export const adminFpBackfill = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ usuarios: number; fpNuevo: number }> => {
    await exigirAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return procesarTodosFP(supabaseAdmin as unknown as { from: (t: string) => any });
  });

export const adminFpPanel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as { from: (t: string) => any; rpc: (n: string) => any };
    const [reglas, historial, alertas, economia, top] = await Promise.all([
      admin.from("fp_rules").select("*").order("orden"),
      admin.from("fp_rules_history").select("*").order("created_at", { ascending: false }).limit(50),
      admin.from("fp_alerts").select("*").order("created_at", { ascending: false }).limit(50),
      context.supabase.rpc("fp_economy"),
      admin.from("fp_balances").select("user_id,total").order("total", { ascending: false }).limit(20),
    ]);
    // Se devuelve JSON plano: el canal de las funciones de servidor sólo
    // acepta datos serializables, no filas con campos de tipo desconocido.
    return {
      reglas: ((reglas.data ?? []) as FpRule[]).map((r) => ({
        key: String(r.key),
        label: String(r.label),
        categoria: String(r.categoria),
        fp: Number((r.value as Record<string, number>)?.["fp"] ?? 0),
        enabled: Boolean(r.enabled),
      })),
      historial: ((historial.data ?? []) as Row[]).map((h) => ({
        id: String(h["id"]),
        key: String(h["key"]),
        antes: JSON.stringify(h["old_value"] ?? {}),
        despues: JSON.stringify(h["new_value"] ?? {}),
        createdAt: String(h["created_at"]),
      })),
      alertas: ((alertas.data ?? []) as Row[]).map((a) => ({
        id: String(a["id"]),
        userId: String(a["user_id"] ?? ""),
        mensaje: String(a["mensaje"] ?? ""),
        createdAt: String(a["created_at"]),
      })),
      economia: JSON.stringify(economia.data ?? {}),
      top: ((top.data ?? []) as { user_id: string; total: number }[]).map((t) => ({
        userId: String(t.user_id),
        total: Number(t.total ?? 0),
      })),
    };
  });

export const adminSaveFpRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; fp: number; enabled: boolean }) => d)
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data: actual } = await admin.from("fp_rules").select("value,enabled").eq("key", data.key).maybeSingle();
    const nuevo = { ...((actual?.value ?? {}) as Record<string, number>), fp: Math.max(0, Math.round(data.fp)) };
    await admin
      .from("fp_rules")
      .update({ value: nuevo, enabled: data.enabled, updated_by: context.userId, updated_at: new Date().toISOString() })
      .eq("key", data.key);
    await admin.from("fp_rules_history").insert({
      key: data.key,
      old_value: { ...(actual?.value ?? {}), enabled: actual?.enabled },
      new_value: { ...nuevo, enabled: data.enabled },
      updated_by: context.userId,
    });
    return { ok: true };
  });

export const adminFpAdjust = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; amount: number; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as { from: (t: string) => any };
    await admin.from("fp_transactions").insert({
      user_id: data.userId,
      event_key: `ajuste:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      rule_key: "ajuste_manual",
      kind: "ajuste",
      amount: Math.round(data.amount),
      program: null,
      activity_type: "ajuste",
      activity_label: "Ajuste manual del equipo",
      detail: data.motivo,
      metadata: { por: context.userId },
    });
    await recalcularSaldo(admin, data.userId);
    return { ok: true };
  });

export const adminFpRevert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { txId: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data: tx } = await admin.from("fp_transactions").select("*").eq("id", data.txId).maybeSingle();
    if (!tx) throw new Error("Transacción no encontrada");
    await admin.from("fp_transactions").insert({
      user_id: tx.user_id,
      event_key: `reversa:${tx.id}`,
      rule_key: tx.rule_key,
      kind: "reversa",
      amount: -Number(tx.amount ?? 0),
      program: tx.program,
      activity_type: "reversa",
      activity_label: `Reversión de: ${tx.activity_label}`,
      detail: data.motivo,
      reverses_id: tx.id,
      metadata: { por: context.userId },
    });
    await admin.from("fp_transactions").update({ status: "revertida" }).eq("id", tx.id);
    await recalcularSaldo(admin, tx.user_id);
    return { ok: true };
  });


/**
 * Directorio de Comunidad para el panel admin: liga cada indicativo con el
 * alumno real (nombre y correo) y sus métricas publicadas. Sólo admin.
 */
export interface AdminComunidadFila {
  userId: string;
  nombre: string;
  email: string;
  callsign: string;
  folio: string;
  privacidad: "nombre" | "folio";
  privacidadElegida: boolean;
  tutorialVisto: boolean;
  total: number;
  rachaActual: number;
  rachaMax: number;
  logros: number;
}

export const adminCommunityDirectory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminComunidadFila[]> => {
    await exigirAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as { from: (t: string) => any };
    const [perfiles, cuentas, saldos] = await Promise.all([
      admin
        .from("fp_community_profiles")
        .select("user_id,folio,callsign,privacidad,privacidad_elegida,tutorial_visto,racha_actual,racha_max,logros"),
      admin.from("profiles").select("id,email,data"),
      admin.from("fp_balances").select("user_id,total"),
    ]);
    const cuentaDe = new Map<string, { email: string; nombre: string }>();
    ((cuentas.data ?? []) as Row[]).forEach((c) => {
      const d = (c["data"] ?? {}) as Record<string, unknown>;
      cuentaDe.set(String(c["id"]), {
        email: String(c["email"] ?? ""),
        nombre: String(d["nombre"] ?? "") || String(c["email"] ?? "").split("@")[0] || "",
      });
    });
    const saldoDe = new Map<string, number>();
    ((saldos.data ?? []) as Row[]).forEach((b) => saldoDe.set(String(b["user_id"]), Number(b["total"] ?? 0)));

    return ((perfiles.data ?? []) as Row[]).map((p) => {
      const id = String(p["user_id"]);
      const cuenta = cuentaDe.get(id);
      return {
        userId: id,
        nombre: cuenta?.nombre ?? "",
        email: cuenta?.email ?? "",
        callsign: String(p["callsign"] ?? "") || String(p["folio"] ?? ""),
        folio: String(p["folio"] ?? ""),
        privacidad: p["privacidad"] === "nombre" ? "nombre" : "folio",
        privacidadElegida: Boolean(p["privacidad_elegida"]),
        tutorialVisto: Boolean(p["tutorial_visto"]),
        total: saldoDe.get(id) ?? 0,
        rachaActual: Number(p["racha_actual"] ?? 0),
        rachaMax: Number(p["racha_max"] ?? 0),
        logros: Number(p["logros"] ?? 0),
      };
    });
  });
