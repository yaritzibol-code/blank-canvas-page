/**
 * Cuotas gratis en el servidor (fuente de verdad de Yaris y Pathy).
 *
 * El contador vive en `profiles.data.freeUso`. Se consume sólo cuando el
 * usuario NO es Pro: así una cuenta gratuita tiene 10 respuestas de Yaris y
 * 2 análisis de Pathy antes de ver el popup de mejora.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_SERVER_LIMITS = { yaris: 10, pathy: 2 } as const;
export type FreeServerKind = keyof typeof FREE_SERVER_LIMITS;

export interface FreeConsumeResult {
  allowed: boolean;
  used: number;
  limit: number;
}

/**
 * Descuenta un uso gratuito. `profileData` es el `data` que la llamada ya
 * leyó del perfil, para no repetir la consulta.
 */
export async function consumeServerFreeQuota(
  supabase: SupabaseClient,
  userId: string,
  kind: FreeServerKind,
  profileData: Record<string, unknown>,
): Promise<FreeConsumeResult> {
  const limit = FREE_SERVER_LIMITS[kind];
  const uso = (profileData['freeUso'] ?? {}) as Record<string, unknown>;
  const used = Number(uso[kind]) || 0;
  if (used >= limit) return { allowed: false, used, limit };

  const next = { ...uso, [kind]: used + 1 };
  try {
    await supabase
      .from("profiles")
      .update({ data: { ...profileData, freeUso: next } as never })
      .eq("id", userId);
  } catch {
    /* si falla la escritura preferimos dar el uso que bloquear al estudiante */
  }
  return { allowed: true, used: used + 1, limit };
}
