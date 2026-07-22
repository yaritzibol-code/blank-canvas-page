/**
 * Chequeo de sincronización de datos para el usuario en sesión.
 * Compara: plan del perfil ↔ estado real de la suscripción,
 * y verifica que existan eventos de estudio + progreso sincronizados en la nube.
 * Devuelve un mensaje amigable si detecta desfase.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { StripeEnv } from "@/lib/stripe.server";

export interface UserSyncStatus {
  authenticated: boolean;
  profilePlan: string | null;
  accessStatus: string | null;
  subStatus: string | null;
  subEnd: string | null;
  hasEvents: boolean;
  hasProgress: boolean;
  drift: string | null;
  /** Mensaje humano si hay algo que reportar; null si todo bien. */
  message: string | null;
  severity: "ok" | "info" | "warning";
}

export const getUserSyncStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<UserSyncStatus> => {
    const { data: row, error } = await context.supabase.rpc("user_data_sync_status", {
      check_env: data.environment,
    });
    if (error || !row) {
      return {
        authenticated: true,
        profilePlan: null,
        accessStatus: null,
        subStatus: null,
        subEnd: null,
        hasEvents: false,
        hasProgress: false,
        drift: null,
        message: null,
        severity: "ok",
      };
    }
    const r = row as Record<string, unknown>;
    const drift = (r.drift as string | null) ?? null;
    const hasEvents = Boolean(r.has_events);
    const hasProgress = Boolean(r.has_progress);
    const profilePlan = (r.profile_plan as string | null) ?? null;
    const subStatus = (r.sub_status as string | null) ?? null;

    let message: string | null = null;
    let severity: UserSyncStatus["severity"] = "ok";

    if (drift === "sub_active_but_profile_basica") {
      message = "Detectamos un pago activo en Stripe pero tu perfil aún figura como Básica. Vuelve a cargar la página para sincronizar.";
      severity = "warning";
    } else if (drift === "profile_pro_but_no_active_sub") {
      message = "Tu perfil aparece como Pro pero no encontramos una suscripción activa en Stripe.";
      severity = "warning";
    } else if (!hasEvents && !hasProgress) {
      message = "Aún no vemos actividad tuya sincronizada con la nube. Empieza un cuestionario o marca un tema para poblar tus métricas.";
      severity = "info";
    }

    return {
      authenticated: true,
      profilePlan,
      accessStatus: (r.access_status as string | null) ?? null,
      subStatus,
      subEnd: (r.sub_end as string | null) ?? null,
      hasEvents,
      hasProgress,
      drift,
      message,
      severity,
    };
  });
