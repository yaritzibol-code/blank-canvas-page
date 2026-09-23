/** Página de retorno del checkout embebido de Stripe. */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { syncMyPlan } from "@/lib/payments.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { refreshCloudProfile } from "@/lib/store/auth";
import { invalidarPlanSync } from "@/lib/plan-sync";
import { Icon } from "@/components/ui/fp-icon";


export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#FFFFFF";

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "active" | "failed">(session_id ? "pending" : "failed");

  useEffect(() => {
    if (!session_id || !isPaymentsConfigured()) return;
    let cancelled = false;
    (async () => {
      const env = getStripeEnvironment();
      // El webhook puede tardar un par de segundos. Poll cada 1.5s hasta 20s.
      for (let i = 0; i < 14 && !cancelled; i++) {
        try {
          const plan = await syncMyPlan({ data: { environment: env, sessionId: session_id } });
          if (plan.subscribed) {
            await refreshCloudProfile();
            if (!cancelled) setStatus("active");
            return;
          }
        } catch {
          // ignora y reintenta
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (!cancelled) {
        await refreshCloudProfile().catch(() => {});
        // Que el dashboard vuelva a consultar a Stripe apenas entre.
        invalidarPlanSync();
        setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session_id]);

  useEffect(() => {
    if (status !== "active") return;
    const t = setTimeout(
      () => navigate({ to: "/gracias", search: session_id ? { session_id } : {} }),
      900,
    );
    return () => clearTimeout(t);
  }, [status, navigate, session_id]);


  const title =
    status === "active"
      ? "¡Bienvenido a FlightPath Pro!"
      : status === "pending"
        ? "Confirmando tu pago…"
        : session_id
          ? "Pago recibido, activando tu acceso"
          : "Sin información de pago";
  const body =
    status === "active"
      ? "Tu acceso Pro está activo. Te damos la bienvenida…"
      : status === "pending"
        ? "Estamos validando tu suscripción con Stripe. Esto tarda unos segundos."

        : session_id
          ? "Tu pago quedó registrado correctamente. La activación puede tardar un par de minutos; entra a tu dashboard y aparecerá solo. Si no, escríbenos y lo activamos al instante."
          : "No encontramos la sesión de pago. Si crees que es un error, escríbenos.";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 50% -10%, rgba(199,160,82,0.10) 0%, transparent 60%), linear-gradient(180deg,#050F22 0%,#03080F 100%)",
        fontFamily: FONT,
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "rgba(5,15,34,0.88)",
          border: "1px solid rgba(199,160,82,0.35)",
          borderRadius: 6,
          padding: "40px 32px",
          maxWidth: 480,
          textAlign: "center",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            margin: "0 auto 14px",
            display: "grid",
            placeItems: "center",
            background: "rgba(199,160,82,0.14)",
            border: "1px solid rgba(199,160,82,0.35)",
            color: "#C7A052",
          }}
        >
          <Icon n={status === "active" ? "checkCircle" : status === "pending" ? "clock" : session_id ? "check" : "plane"} size={34} />
        </div>
        <h1 style={{ fontFamily: DISPLAY, color: INK, fontSize: "1.6rem", fontWeight: 800, margin: "0 0 12px" }}>{title}</h1>
        <p style={{ color: "#B8C5DA", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>{body}</p>
        <Link
          to="/dashboard"
          style={{
            display: "inline-block",
            background: "linear-gradient(180deg,#C7A052,#8A6A25)",
            color: "#0B1220",
            textDecoration: "none",
            fontWeight: 800,
            padding: "12px 24px",
            borderRadius: 6,
          }}
        >
          Ir al dashboard →
        </Link>
      </div>
    </div>
  );
}

