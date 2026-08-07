/**
 * Revisiones de salud programadas — server-only.
 *
 * Valida que (a) Stripe live responda y tenga cobros habilitados y (b) las
 * consultas críticas del panel admin devuelvan datos. Cada fallo se escribe en
 * `public.health_checks`, visible únicamente para administradores.
 */
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "@/lib/stripe.server";

export interface HealthResult {
  check_key: string;
  ok: boolean;
  environment: StripeEnv;
  message: string | null;
  detail: Record<string, unknown>;
  duration_ms: number;
}

async function medir(
  check_key: string,
  environment: StripeEnv,
  fn: () => Promise<{ ok: boolean; message?: string | null; detail?: Record<string, unknown> }>,
): Promise<HealthResult> {
  const t0 = Date.now();
  try {
    const r = await fn();
    return {
      check_key,
      environment,
      ok: r.ok,
      message: r.message ?? null,
      detail: r.detail ?? {},
      duration_ms: Date.now() - t0,
    };
  } catch (error) {
    return {
      check_key,
      environment,
      ok: false,
      message: getStripeErrorMessage(error),
      detail: {},
      duration_ms: Date.now() - t0,
    };
  }
}

/** Stripe live: la cuenta responde, acepta cargos y tiene precios publicados. */
async function revisarStripe(environment: StripeEnv): Promise<HealthResult> {
  return medir("stripe_live", environment, async () => {
    const stripe = createStripeClient(environment);
    const account = await stripe.accounts.retrieve(undefined as never);
    const prices = await stripe.prices.list({ active: true, limit: 3 });
    const chargesEnabled = Boolean((account as { charges_enabled?: boolean }).charges_enabled);
    const problemas: string[] = [];
    if (!chargesEnabled) problemas.push("la cuenta no tiene cobros habilitados");
    if (prices.data.length === 0) problemas.push("no hay precios activos");
    return {
      ok: problemas.length === 0,
      message: problemas.length === 0 ? null : `Stripe ${environment}: ${problemas.join(" y ")}.`,
      detail: {
        account_id: account.id,
        charges_enabled: chargesEnabled,
        payouts_enabled: Boolean((account as { payouts_enabled?: boolean }).payouts_enabled),
        active_prices: prices.data.length,
      },
    };
  });
}

type Rpc = { name: string; args: Record<string, unknown>; vacioEsFallo?: boolean };

const RPCS_CRITICOS: Rpc[] = [
  { name: "admin_resumen", args: {} },
  { name: "admin_platform_stats", args: {} },
  { name: "admin_pro_stats", args: { check_env: "live" } },
  { name: "admin_mrr", args: { check_env: "live" } },
  { name: "admin_mrr_daily", args: { check_env: "live", days_back: 7 }, vacioEsFallo: true },
  { name: "admin_ai_stats", args: { hours_back: 24 } },
  { name: "admin_stripe_event_stats", args: { hours_back: 24 } },
  { name: "admin_activity_overview", args: { days_back: 7 } },
];

/** Ejecuta las revisiones y las bitacoriza. Devuelve el resultado completo. */
export async function ejecutarHealthChecks(environment: StripeEnv = "live"): Promise<HealthResult[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const resultados: HealthResult[] = [];
  resultados.push(await revisarStripe(environment));

  for (const rpc of RPCS_CRITICOS) {
    resultados.push(
      await medir(`rpc:${rpc.name}`, environment, async () => {
        const { data, error } = await supabaseAdmin.rpc(rpc.name as never, rpc.args as never);
        if (error) return { ok: false, message: error.message, detail: { rpc: rpc.name } };
        const payload = data as unknown;
        const vacio =
          payload === null ||
          payload === undefined ||
          (Array.isArray(payload) && payload.length === 0 && rpc.vacioEsFallo);
        if (vacio) {
          return {
            ok: false,
            message: `La consulta ${rpc.name} devolvió vacío (posible bloqueo de permisos).`,
            detail: { rpc: rpc.name },
          };
        }
        return { ok: true, detail: { rpc: rpc.name } };
      }),
    );
  }

  // Solo se bitacoriza lo que falla, más un resumen por corrida.
  const fallos = resultados.filter((r) => !r.ok);
  const filas = fallos.map((r) => ({
    check_key: r.check_key,
    ok: false,
    environment: r.environment,
    message: r.message,
    detail: r.detail,
    duration_ms: r.duration_ms,
  }));
  filas.push({
    check_key: "run_summary",
    ok: fallos.length === 0,
    environment,
    message:
      fallos.length === 0
        ? `${resultados.length} revisiones sin incidencias.`
        : `${fallos.length} de ${resultados.length} revisiones fallaron: ${fallos.map((f) => f.check_key).join(", ")}.`,
    detail: { total: resultados.length, fallos: fallos.length },
    duration_ms: resultados.reduce((n, r) => n + r.duration_ms, 0),
  });

  try {
    await supabaseAdmin.from("health_checks").insert(filas as never);
  } catch {
    /* la bitácora nunca debe tumbar la revisión */
  }

  return resultados;
}
