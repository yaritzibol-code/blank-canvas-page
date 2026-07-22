/**
 * Banner que aparece una sola vez por sesión si detectamos desincronización
 * entre el perfil, la suscripción y los eventos de estudio del usuario.
 */
import { useEffect, useState } from "react";
import { getUserSyncStatus, type UserSyncStatus } from "@/lib/sync-status.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { refreshCloudProfile } from "@/lib/store";

const DISMISS_KEY = "fp:sync-banner-dismissed";

export function DataSyncBanner() {
  const [status, setStatus] = useState<UserSyncStatus | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  });

  useEffect(() => {
    let cancel = false;
    const env = isPaymentsConfigured() ? getStripeEnvironment() : "sandbox";
    (async () => {
      try {
        const res = await getUserSyncStatus({ data: { environment: env } });
        if (!cancel) setStatus(res);
      } catch {
        /* silencioso: la app sigue con caché local */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (dismissed || !status || !status.message) return null;

  const tone = status.severity === "warning"
    ? { bg: "#FEF3C7", fg: "#92400E", border: "#F59E0B" }
    : { bg: "#EFF6FF", fg: "#1E3A8A", border: "#93C5FD" };

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  };

  const handleSync = async () => {
    await refreshCloudProfile();
    handleDismiss();
  };

  return (
    <div style={{
      background: tone.bg,
      color: tone.fg,
      border: `1px solid ${tone.border}`,
      padding: "10px 16px",
      borderRadius: 12,
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      fontSize: ".88rem",
    }}>
      <span>⚠️ {status.message}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {status.severity === "warning" && (
          <button
            onClick={handleSync}
            style={{ background: tone.fg, color: "white", border: "none", padding: "6px 12px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
          >
            Sincronizar ahora
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{ background: "transparent", color: tone.fg, border: `1px solid ${tone.fg}`, padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
