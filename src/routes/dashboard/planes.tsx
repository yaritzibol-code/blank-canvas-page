/**
 * Página de planes con checkout embebido de Stripe.
 * Básica $0 MXN — ya activa por defecto. Pro $500 MXN/mes — desbloquea todo.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { createCheckoutSession, createPortalSession, syncMyPlan } from "@/lib/payments.functions";
import { refreshCloudProfile } from "@/lib/store/auth";
import { useRequireAuth } from "@/lib/store/hooks";
import { supa } from "@/lib/store/cloud";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/dashboard/planes")({ component: PlanesPage });

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";
const BRAND = "#6C0820";
const PRO_PRICE_ID = "flightpath_pro_monthly";

interface SubRow {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  price_id: string;
}

function PlanesPage() {
  const { user, ready } = useRequireAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState<SubRow | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isPaymentsConfigured();

  useEffect(() => {
    if (!user) return;
    const s = supa();
    if (!s) return;
    let cancelled = false;
    (async () => {
      const env = configured ? getStripeEnvironment() : "sandbox";
      const { data } = await s
        .from("subscriptions")
        .select("status,current_period_end,cancel_at_period_end,price_id")
        .eq("user_id", user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) setSub((data as SubRow | null) ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, configured]);

  const isProActive =
    !!sub &&
    (["active", "trialing"].includes(sub.status) ||
      (sub.status === "canceled" && sub.current_period_end && new Date(sub.current_period_end) > new Date()));

  async function handleUpgrade() {
    if (!configured) {
      setError("Los pagos aún no están habilitados en este ambiente.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const env = getStripeEnvironment();
      const result = await createCheckoutSession({
        data: {
          priceId: PRO_PRICE_ID,
          returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
          environment: env,
        },
      });
      if ("error" in result) throw new Error(result.error);
      setClientSecret(result.clientSecret);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos iniciar el pago.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    if (!configured) return;
    setLoading(true);
    try {
      const env = getStripeEnvironment();
      const result = await createPortalSession({
        data: { returnUrl: `${window.location.origin}/dashboard/planes`, environment: env },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos abrir el portal.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  if (clientSecret) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F9FC", fontFamily: FONT }}>
        <PaymentTestModeBanner />
        <div style={{ padding: "16px clamp(16px,4vw,32px)" }}>
          <button
            onClick={() => setClientSecret(null)}
            style={{ background: "none", border: "none", color: "#3D5D91", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
          >
            ← Cancelar y volver
          </button>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 60px" }}>
          <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FC", fontFamily: FONT }}>
      <PaymentTestModeBanner />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(24px,5vw,48px) 20px 80px" }}>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          style={{ background: "none", border: "none", color: "#3D5D91", fontWeight: 700, cursor: "pointer", fontSize: 14, marginBottom: 20 }}
        >
          ← Volver al dashboard
        </button>

        <h1 style={{ fontFamily: DISPLAY, color: INK, fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, margin: "0 0 8px" }}>
          Elige tu plan
        </h1>
        <p style={{ color: "#647DA0", fontSize: 15, marginBottom: 32, maxWidth: 620 }}>
          Empieza gratis con FlightPath Básica y sube a Pro cuando quieras acceso ilimitado, IA y todos los módulos.
        </p>

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div style={{ background: "#fff", border: "1px solid #E3EAF5", borderRadius: 20, padding: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", color: "#647DA0", textTransform: "uppercase" }}>Básica</div>
            <div style={{ fontFamily: DISPLAY, fontSize: "2.4rem", fontWeight: 800, color: INK, margin: "8px 0 4px" }}>$0 <span style={{ fontSize: 15, color: "#647DA0", fontWeight: 500 }}>MXN/mes</span></div>
            <div style={{ color: "#647DA0", fontSize: 13, marginBottom: 20 }}>Gratis para siempre</div>
            <ul style={{ padding: 0, listStyle: "none", color: "#4A5F80", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
              <li>✅ 10 preguntas por materia</li>
              <li>✅ Máximo 2 intentos totales</li>
              <li>✅ Cuestionario y simulador limitados</li>
              <li>❌ Sin Yaris IA</li>
              <li>❌ Sin módulos avanzados</li>
            </ul>
            <button disabled style={{ width: "100%", background: "#F3F4F6", color: "#647DA0", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
              {isProActive ? "Plan gratuito" : "Plan actual"}
            </button>
          </div>

          <div style={{ background: "#fff", border: `2px solid ${BRAND}`, borderRadius: 20, padding: 28, position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: 20, background: BRAND, color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999 }}>Recomendado</div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", color: BRAND, textTransform: "uppercase" }}>Pro</div>
            <div style={{ fontFamily: DISPLAY, fontSize: "2.4rem", fontWeight: 800, color: INK, margin: "8px 0 4px" }}>$500 <span style={{ fontSize: 15, color: "#647DA0", fontWeight: 500 }}>MXN/mes</span></div>
            <div style={{ color: "#647DA0", fontSize: 13, marginBottom: 20 }}>Cancela cuando quieras</div>
            <ul style={{ padding: 0, listStyle: "none", color: "#4A5F80", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
              <li>✅ Cuestionario y simulador ilimitados</li>
              <li>✅ Todo el banco de preguntas</li>
              <li>✅ Yaris con IA (RAG del curso)</li>
              <li>✅ Recordatorios por WhatsApp</li>
              <li>✅ Análisis completo por materia</li>
            </ul>
            {isProActive ? (
              <button onClick={handlePortal} disabled={loading} style={{ width: "100%", background: INK, color: "#fff", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {loading ? "Abriendo..." : "Gestionar suscripción →"}
              </button>
            ) : (
              <button onClick={handleUpgrade} disabled={loading} style={{ width: "100%", background: BRAND, color: "#fff", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {loading ? "Preparando pago..." : "Actualizar a Pro →"}
              </button>
            )}
          </div>
        </div>

        <p style={{ marginTop: 32, textAlign: "center", color: "#647DA0", fontSize: 13 }}>
          Pago procesado por Stripe · Los admins tienen acceso completo sin pago
        </p>
      </div>
    </div>
  );
}
