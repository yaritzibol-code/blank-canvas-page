/**
 * Captura de evidencias desde el cliente — fire-and-forget.
 *
 * Reporta hitos del usuario (login, cuestionario terminado, términos
 * aceptados…) al ledger append-only del servidor, que los sella con la IP y
 * el user agent reales del request. Nunca bloquea la UX ni lanza: si la nube
 * no está configurada o la llamada falla, simplemente no se registra.
 */
import { cloudEnabled } from "@/lib/store/cloud";
import type { ClientEvidenceEvent } from "@/lib/evidence.server";

export function captureEvidence(event: ClientEvidenceEvent, metadata?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !cloudEnabled()) return;
  void (async () => {
    try {
      const { recordEvidence } = await import("@/lib/evidence.functions");
      await recordEvidence({
        data: {
          event,
          metadata,
          locale: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    } catch {
      /* la evidencia nunca rompe el producto */
    }
  })();
}
