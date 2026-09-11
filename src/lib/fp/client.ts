/**
 * FlightPoints — puente del navegador.
 *
 * El cliente nunca calcula ni propone puntos: sube la actividad pendiente a la
 * nube y le pide al servidor que revise. Lo que vuelve son las transacciones
 * que el servidor confirmó, y sólo eso se celebra.
 */
import { flushCloudWrites, cloudSessionActive } from "@/lib/store";
import { claimFlightPoints } from "./fp.functions";
import type { FpNuevo } from "./shared";

let corriendo: Promise<FpNuevo[]> | null = null;
let ultimo = 0;

/** Pide al servidor que otorgue lo que falte. Devuelve sólo lo confirmado. */
export async function sincronizarFP(force = false): Promise<FpNuevo[]> {
  if (!cloudSessionActive()) return [];
  const ahora = Date.now();
  if (!force && ahora - ultimo < 15000) return [];
  if (corriendo) return corriendo;
  ultimo = ahora;
  corriendo = (async () => {
    try {
      await flushCloudWrites();
      const res = await claimFlightPoints();
      return res.nuevos ?? [];
    } catch {
      return [];
    } finally {
      corriendo = null;
    }
  })();
  return corriendo;
}
