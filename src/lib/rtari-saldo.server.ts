/**
 * Saldo de minutos de la entrevista RTARI.
 *
 * Cómo se cobra, y por qué así: el audio va directo del navegador a OpenAI, así
 * que nuestro servidor no puede medir la sesión mientras ocurre. Para no
 * depender de que el cliente diga la verdad, se cobra **por adelantado** el
 * máximo que puede durar la entrevista y al colgar se **devuelve** lo que no se
 * usó. El peor caso —un alumno que cierra la pestaña y nunca liquida— es que
 * pague la sesión completa que ya tenía reservada; nunca que consuma de más.
 *
 * Los minutos incluidos del plan Pro son del ciclo mensual y no se acumulan;
 * los comprados no vencen. Al consumir se gastan primero los incluidos, para
 * que lo que el alumno pagó aparte le dure.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  RTARI_MAX_MINUTOS,
  RTARI_MINUTOS_INCLUIDOS_PRO,
  RTARI_MINUTOS_MINIMOS,
} from "@/modules/rtari/config";

export interface RtariSaldo {
  /** Segundos incluidos que quedan en el ciclo. */
  incluidosRestantes: number;
  incluidosTotales: number;
  /** Segundos comprados disponibles. */
  comprados: number;
  /** Suma de los dos, que es lo que puede gastar hoy. */
  disponible: number;
  ciclo: string;
  /**
   * Sin límite de minutos: el equipo administrador.
   *
   * El módulo es su herramienta para revisar contenido y probar cambios; si
   * gastara cuota, revisar el producto competiría con usarlo. Su consumo SÍ se
   * bitacoriza en `ai_usage`, así que sigue apareciendo en el costo del panel.
   */
  ilimitado: boolean;
}

const VACIO: RtariSaldo = {
  incluidosRestantes: 0,
  incluidosTotales: 0,
  comprados: 0,
  disponible: 0,
  ciclo: "",
  ilimitado: false,
};

/** Ciclo mensual en el mismo formato que usa la base ('YYYY-MM'). */
export function cicloActual(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

interface SaldoRow {
  ciclo: string;
  segundos_incluidos: number;
  segundos_incluidos_usados: number;
  segundos_comprados: number;
}

function toSaldo(row: SaldoRow | null): RtariSaldo {
  if (!row) return { ...VACIO };
  const incluidosRestantes = Math.max(
    0,
    (row.segundos_incluidos ?? 0) - (row.segundos_incluidos_usados ?? 0),
  );
  const comprados = Math.max(0, row.segundos_comprados ?? 0);
  return {
    incluidosRestantes,
    incluidosTotales: Math.max(0, row.segundos_incluidos ?? 0),
    comprados,
    disponible: incluidosRestantes + comprados,
    ciclo: row.ciclo ?? "",
    ilimitado: false,
  };
}

/** Saldo de quien no gasta minutos. */
function saldoIlimitado(): RtariSaldo {
  return { ...VACIO, ciclo: cicloActual(), ilimitado: true };
}

/**
 * Saldo del usuario, ya con los minutos del ciclo otorgados.
 *
 * `esPro` decide la cuota mensual: quien no tiene suscripción activa queda con
 * cero incluidos, pero conserva lo que haya comprado. A la administradora ni
 * se le abre renglón en el ledger: no gasta minutos.
 */
export async function asegurarSaldo(
  userId: string,
  esPro: boolean,
  esAdmin = false,
): Promise<RtariSaldo> {
  if (esAdmin) return saldoIlimitado();
  const ciclo = cicloActual();
  const segundosIncluidos = esPro ? RTARI_MINUTOS_INCLUIDOS_PRO * 60 : 0;

  const { data, error } = await supabaseAdmin.rpc("rtari_asegurar_ciclo", {
    p_user: userId,
    p_ciclo: ciclo,
    p_segundos_incluidos: segundosIncluidos,
  });
  if (error) return { ...VACIO, ciclo };

  // La función devuelve el renglón completo de `rtari_saldo`.
  const row = (Array.isArray(data) ? data[0] : data) as SaldoRow | null;
  return toSaldo(row);
}

/** Sólo lectura, sin tocar el ciclo (para pintar el saldo en pantalla). */
export async function leerSaldo(userId: string): Promise<RtariSaldo> {
  const { data, error } = await supabaseAdmin
    .from("rtari_saldo")
    .select("ciclo,segundos_incluidos,segundos_incluidos_usados,segundos_comprados")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { ...VACIO };
  return toSaldo((data ?? null) as SaldoRow | null);
}

export interface Reserva {
  /** Segundos efectivamente apartados (0 = no alcanzó). */
  segundos: number;
  /** De dónde salieron, para devolverlos al mismo bolsillo. */
  deIncluidos: number;
  deComprados: number;
  /** No salieron de ningún saldo: no hay nada que devolver al colgar. */
  sinCargo?: boolean;
}

/**
 * Aparta por adelantado los minutos de una entrevista.
 *
 * Si al alumno le quedan menos de los que dura una sesión completa, se le
 * aparta lo que tenga y la entrevista se corta ahí: es preferible una
 * entrevista de siete minutos a un "no tienes saldo" con siete minutos en la
 * cuenta.
 */
export async function reservarMinutos(
  userId: string,
  esPro: boolean,
  sessionId: string,
  esAdmin = false,
): Promise<Reserva> {
  // La administradora arranca siempre con la sesión completa y sin tocar el
  // ledger. Lo que sí queda registrado es el costo, en `ai_usage`.
  if (esAdmin) {
    return {
      segundos: RTARI_MAX_MINUTOS * 60,
      deIncluidos: 0,
      deComprados: 0,
      sinCargo: true,
    };
  }

  const saldo = await asegurarSaldo(userId, esPro);
  if (saldo.disponible < RTARI_MINUTOS_MINIMOS * 60) {
    return { segundos: 0, deIncluidos: 0, deComprados: 0 };
  }

  const pedir = Math.min(saldo.disponible, RTARI_MAX_MINUTOS * 60);
  const { data, error } = await supabaseAdmin.rpc("rtari_consumir", {
    p_user: userId,
    p_segundos: pedir,
    p_ref: sessionId,
    p_detalle: { motivo: "reserva" },
  });
  if (error) return { segundos: 0, deIncluidos: 0, deComprados: 0 };

  const tomados = Number(data) || 0;
  // Se gastan primero los incluidos: así sabemos a qué bolsillo devolver.
  const deIncluidos = Math.min(tomados, saldo.incluidosRestantes);
  return { segundos: tomados, deIncluidos, deComprados: tomados - deIncluidos };
}

/**
 * Cierra la cuenta de una entrevista: devuelve los minutos reservados que no
 * se usaron. `usadosSec` viene del cliente y por eso se acota entre 0 y lo
 * reservado — reportar de menos sólo puede devolverle al alumno lo que él
 * mismo ya había pagado.
 */
export async function liquidarMinutos(
  userId: string,
  reserva: Reserva,
  usadosSec: number,
  sessionId: string,
): Promise<number> {
  // Una sesión sin cargo (administración) no tomó nada del ledger.
  if (reserva.sinCargo) return 0;

  const usados = Math.min(Math.max(0, Math.round(usadosSec)), reserva.segundos);
  const sobrante = reserva.segundos - usados;
  if (sobrante <= 0) return 0;

  // Se devuelve en orden INVERSO al que se cobró: primero lo comprado.
  //
  // La reserva gasta primero los minutos incluidos del ciclo, así que si la
  // devolución también empezara por ahí, lo que acabaría consumido sería el
  // saldo comprado —el que no vence— dejándole al alumno minutos que se le
  // caducan a fin de mes. Devolviendo al revés, lo que se gasta de verdad es
  // siempre lo que estaba por vencer.
  const devComprados = Math.min(sobrante, reserva.deComprados);
  const devIncluidos = sobrante - devComprados;

  const { data, error } = await supabaseAdmin.rpc("rtari_devolver", {
    p_user: userId,
    p_segundos_incluidos: devIncluidos,
    p_segundos_comprados: devComprados,
    p_ref: sessionId,
    p_detalle: { motivo: "liquidación", usados },
  });
  if (error) return 0;
  return Number(data) || 0;
}

/**
 * Reserva pendiente de una sesión, reconstruida desde la bitácora.
 *
 * La liquidación llega en una petición distinta a la que reservó, así que hay
 * que volver a leer cuánto se había apartado. Devuelve `null` si esa sesión no
 * existe o si ya se liquidó.
 *
 * Esto es sólo para poder responderle algo sensato al cliente: quien de verdad
 * impide devolver dos veces la misma entrevista es el índice único de
 * `rtari_movimientos`, porque dos liquidaciones simultáneas pasarían por aquí
 * antes de que ninguna hubiera escrito su reembolso.
 */
export async function reservaPendiente(userId: string, sessionId: string): Promise<Reserva | null> {
  const { data, error } = await supabaseAdmin
    .from("rtari_movimientos")
    .select("segundos,tipo,detalle")
    .eq("user_id", userId)
    .eq("ref", sessionId);
  if (error || !data || data.length === 0) return null;

  const rows = data as Array<{ segundos: number; tipo: string; detalle: Record<string, unknown> }>;
  if (rows.some((r) => r.tipo === "reembolso")) return null;

  const consumo = rows.find((r) => r.tipo === "consumo");
  if (!consumo) return null;

  const deIncluidos = Number(consumo.detalle?.incluidos) || 0;
  const deComprados = Number(consumo.detalle?.comprados) || 0;
  return { segundos: Math.abs(consumo.segundos), deIncluidos, deComprados };
}
