/**
 * Server functions de la escalera de conversión del plan gratis (reglas en
 * `@/lib/oferta-pro`). El servidor decide qué popup toca y lo deja anotado en
 * `profiles.data.ofertaPro`, para que no se repita al recargar ni en otro
 * dispositivo y para que el checkout pueda revalidar el 20%.
 */
import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { loadRouteProfile } from "@/lib/route-auth.server";
import {
  OFERTA_PRO_VIGENCIA_MS,
  contarDiasActivos,
  diaLocal,
  esMotivoRechazo,
  siguienteIntento,
  type IntentoOferta,
  type MotivoRechazo,
  type OfertaProEstado,
} from "@/lib/oferta-pro";

export type RevisionOfertaPro = { intento: IntentoOferta; venceEn: number } | { intento: null };

/**
 * ¿Toca mostrar hoy el popup del 20%? Si sí, lo marca como mostrado antes de
 * responder: cada intento sale una sola vez aunque recargue la página.
 */
export const revisarOfertaPro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RevisionOfertaPro> => {
    const { supabase, userId } = context;
    const perfil = await loadRouteProfile({ supabase, userId });
    if (perfil.isPro || perfil.isAdmin) return { intento: null };

    // Sólo alumnos que nunca han pagado: quien ya tuvo una suscripción no
    // vuelve a pagar inscripción, así que el 20% no tendría a qué aplicarse.
    const [{ data: subs }, { data: sesiones }] = await Promise.all([
      supabase.from("subscriptions").select("id").eq("user_id", userId).limit(1),
      supabase
        .from("activity_sessions")
        .select("started_at")
        .eq("user_id", userId)
        .order("started_at", { ascending: true })
        .limit(1000),
    ]);
    if (subs?.length || perfil.data.inscripcionPagada === true) return { intento: null };

    const ahora = Date.now();
    const estado = (perfil.data.ofertaPro ?? {}) as OfertaProEstado;
    const dias = contarDiasActivos(
      (sesiones ?? []).map((s) => s.started_at),
      ahora,
    );
    const intento = siguienteIntento(estado, dias, ahora);
    if (!intento) return { intento: null };

    const intentos = [...(estado.intentos ?? []), { dia: diaLocal(ahora), en: ahora }];
    const { error } = await supabase
      .from("profiles")
      .update({ data: { ...perfil.data, ofertaPro: { ...estado, intentos } } as never })
      .eq("id", userId);
    // Sin la marca guardada el popup se repetiría en cada visita: mejor no mostrarlo.
    if (error) return { intento: null };
    return { intento, venceEn: ahora + OFERTA_PRO_VIGENCIA_MS };
  });

async function actualizarOfertaPro(
  context: { supabase: SupabaseClient<Database>; userId: string },
  cambiar: (estado: OfertaProEstado) => OfertaProEstado | null,
): Promise<{ ok: boolean }> {
  const { supabase, userId } = context;
  const { data: row } = await supabase
    .from("profiles")
    .select("data")
    .eq("id", userId)
    .maybeSingle();
  const perfil = (row?.data ?? {}) as Record<string, unknown>;
  const siguiente = cambiar((perfil.ofertaPro ?? {}) as OfertaProEstado);
  if (!siguiente) return { ok: false };
  const { error } = await supabase
    .from("profiles")
    .update({ data: { ...perfil, ofertaPro: siguiente } as never })
    .eq("id", userId);
  return { ok: !error };
}

/** Respuesta al popup del 20%: la primera que llegue es la que cuenta. */
export const responderOfertaPro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { intento: IntentoOferta; respuesta: "acepto" | "rechazo" }) => {
    if (data.intento !== 1 && data.intento !== 2) throw new Error("Invalid intento");
    if (data.respuesta !== "acepto" && data.respuesta !== "rechazo")
      throw new Error("Invalid respuesta");
    return { intento: data.intento, respuesta: data.respuesta };
  })
  .handler(async ({ data, context }) =>
    actualizarOfertaPro(context, (estado) => {
      const intentos = [...(estado.intentos ?? [])];
      const actual = intentos[data.intento - 1];
      if (!actual || actual.respuesta) return null;
      intentos[data.intento - 1] = { ...actual, respuesta: data.respuesta };
      return { ...estado, intentos };
    }),
  );

/** Por qué no quiso Pro tras el segundo popup (una sola vez por cuenta). */
export const guardarMotivoOfertaPro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { motivo: MotivoRechazo; detalle?: string }) => {
    if (!esMotivoRechazo(data.motivo)) throw new Error("Invalid motivo");
    const detalle = typeof data.detalle === "string" ? data.detalle.trim().slice(0, 280) : "";
    return { motivo: data.motivo, ...(detalle ? { detalle } : {}) };
  })
  .handler(async ({ data, context }) =>
    actualizarOfertaPro(context, (estado) =>
      estado.motivo || (estado.intentos?.length ?? 0) < 2
        ? null
        : {
            ...estado,
            motivo: {
              valor: data.motivo,
              ...(data.detalle ? { detalle: data.detalle } : {}),
              en: Date.now(),
            },
          },
    ),
  );
