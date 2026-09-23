/**
 * Banner que aparece una sola vez por sesión si detectamos desincronización
 * entre el perfil, la suscripción y los eventos de estudio del usuario.
 */
import { useEffect, useState } from "react";
import { getUserSyncStatus, type UserSyncStatus } from "@/lib/sync-status.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { refreshCloudProfile } from "@/lib/store";
import { Icon } from "@/components/ui/fp-icon";

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
    ? { bg: "rgba(199,160,82,.12)", fg: "#F0DCAE", border: "rgba(199,160,82,.42)", btn: "linear-gradient(180deg,#C7A052,#8A6A25)" }
    : { bg: "rgba(255,255,255,.05)", fg: "#B8C5DA", border: "rgba(255,255,255,.14)", btn: "rgba(255,255,255,.10)" };


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
      borderRadius: 6,
      marginBottom: 16,
      fontFamily: "'Manrope', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      fontSize: ".88rem",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Icon n="alert" size={16} /> {status.message}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        {status.severity === "warning" && (
          <button
            onClick={handleSync}
            style={{ background: tone.btn, color: "#0B1220", border: "none", padding: "6px 12px", borderRadius: 6, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
          >
            Sincronizar ahora
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{ background: "transparent", color: tone.fg, border: `1px solid ${tone.border}`, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
