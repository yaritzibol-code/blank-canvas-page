/**
 * Sincronización del plan con Stripe, con freno.
 *
 * `syncMyPlan` cuesta varias llamadas al API de Stripe. Antes se ejecutaba en
 * cada montaje del dashboard, lo que provocaba miles de reconciliaciones al
 * día, límites de tasa y respuestas rotas del API. Aquí se centraliza: sólo
 * corre cuando hay una razón real (retorno de checkout, pantalla de planes o
 * facturación) o cuando la última sincronización ya está vieja.
 */
import { syncMyPlan } from "@/lib/payments.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { refreshCloudProfile } from "@/lib/store/auth";

const CLAVE = "fp_last_plan_sync";
/** Ventana mínima entre sincronizaciones automáticas. */
const FRESCURA_MS = 15 * 60 * 1000;

function ultimaSync(): number {
  try {
    return Number(localStorage.getItem(CLAVE) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function marcarSync() {
  try {
    localStorage.setItem(CLAVE, String(Date.now()));
  } catch {
    /* almacenamiento bloqueado: sólo perdemos el freno */
  }
}

/** Invalida el freno para forzar la próxima sincronización (tras un pago). */
export function invalidarPlanSync() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* noop */
  }
}

/**
 * Sincroniza el plan si hace falta. Devuelve `true` si llegó a llamar a Stripe.
 * Con `force` ignora el freno (retorno de checkout, botón de refrescar).
 */
export async function syncPlanIfStale(options?: { force?: boolean; sessionId?: string }): Promise<boolean> {
  if (!isPaymentsConfigured()) return false;
  if (!options?.force && Date.now() - ultimaSync() < FRESCURA_MS) return false;
  try {
    const environment = getStripeEnvironment();
    await syncMyPlan({
      data: { environment, ...(options?.sessionId ? { sessionId: options.sessionId } : {}) },
    });
    marcarSync();
    await refreshCloudProfile();
    return true;
  } catch {
    return false;
  }
}
