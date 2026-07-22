/** Página de retorno del checkout embebido de Stripe. */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { syncMyPlan } from "@/lib/payments.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { refreshCloudProfile } from "@/lib/store/auth";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";

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
          const plan = await syncMyPlan({ data: { environment: env } });
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
        setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session_id]);

  useEffect(() => {
    if (status !== "active") return;
    const t = setTimeout(() => navigate({ to: "/dashboard" }), 1800);
    return () => clearTimeout(t);
  }, [status, navigate]);

  const title =
    status === "active"
      ? "¡Bienvenido a FlightPath Pro!"
      : status === "pending"
        ? "Confirmando tu pago…"
        : session_id
          ? "Recibimos tu pago"
          : "Sin información de pago";
  const body =
    status === "active"
      ? "Tu acceso Pro está activo. Te llevamos a tu dashboard…"
      : status === "pending"
        ? "Estamos validando tu suscripción con Stripe. Esto tarda unos segundos."
        : session_id
          ? "Tu pago está en proceso. Si tu acceso Pro no aparece en un minuto, refresca el dashboard."
          : "No encontramos la sesión de pago. Si crees que es un error, escríbenos.";

  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FC", fontFamily: FONT, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ background: "#fff", border: "1px solid #E3EAF5", borderRadius: 20, padding: "40px 32px", maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{status === "active" ? "🎉" : status === "pending" ? "⏳" : "✈️"}</div>
        <h1 style={{ fontFamily: DISPLAY, color: INK, fontSize: "1.6rem", fontWeight: 800, margin: "0 0 12px" }}>{title}</h1>
        <p style={{ color: "#647DA0", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>{body}</p>
        <Link to="/dashboard" style={{ display: "inline-block", background: "#6C0820", color: "#fff", textDecoration: "none", fontWeight: 700, padding: "12px 24px", borderRadius: 12 }}>
          Ir al dashboard →
        </Link>
      </div>
    </div>
  );
}
