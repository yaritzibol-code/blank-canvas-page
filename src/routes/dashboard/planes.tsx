/**
 * Página de planes con checkout embebido de Stripe.
 * Básica $0 MXN — ya activa por defecto. El precio de Pro se lee de Stripe
 * (fuente de verdad del cobro); `@/lib/pricing` sólo aporta el respaldo.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { useEffect, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import {
  createCheckoutSession,
  createPortalSession,
  syncMyPlan,
  getPublicPricing,
  getPublicSetupPricing,
  getPublicAnnualPricing,
} from "@/lib/payments.functions";
import {
  PRO_ANNUAL_FALLBACK,
  PRO_ANNUAL_LOOKUP_KEY,
  PRO_MONTHLY_LOOKUP_KEY,
  PRO_MONTHLY_FALLBACK,
  PRO_SETUP_FALLBACK,
  PRO_SETUP_LIST_PRICE,
  mesesAhorrados,
  type PlanPrice,
} from "@/lib/pricing";
import { refreshCloudProfile } from "@/lib/store/auth";
import { useRequireAuth } from "@/lib/store/hooks";
import { supa } from "@/lib/store/cloud";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/dashboard/planes")({
  component: PlanesPage,
  // `?checkout=1` abre el checkout de Stripe en cuanto la página está lista
  // (lo usa la landing de la convocatoria para llevar directo al pago).
  validateSearch: (search: Record<string, unknown>): { checkout?: 1 } =>
    search.checkout === "1" || search.checkout === 1 || search.checkout === true ? { checkout: 1 } : {},
});

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";
const BRAND = "#6C0820";

interface SubRow {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  price_id: string;
}

function PlanesPage() {
  const { user, ready } = useRequireAuth();
  const navigate = useNavigate();
  const { checkout } = Route.useSearch();
  const [sub, setSub] = useState<SubRow | null>(null);
  const [subChecked, setSubChecked] = useState(false);
  const [autoLaunched, setAutoLaunched] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proPrice, setProPrice] = useState<PlanPrice>(PRO_MONTHLY_FALLBACK);
  const [setupPrice, setSetupPrice] = useState<PlanPrice>(PRO_SETUP_FALLBACK);
  const [annualPrice, setAnnualPrice] = useState<PlanPrice>(PRO_ANNUAL_FALLBACK);
  /** Periodicidad elegida para el cobro recurrente de Pro. */
  const [ciclo, setCiclo] = useState<"mensual" | "anual">("mensual");
  const ahorro = mesesAhorrados(proPrice, annualPrice);
  const configured = isPaymentsConfigured();

  // El precio mostrado sale de Stripe, no de una constante en la vista: es el
  // mismo `lookup_key` que resuelve el checkout, así que no pueden divergir.
  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    (async () => {
      try {
        const env = getStripeEnvironment();
        const [live, setup, annual] = await Promise.all([
          getPublicPricing({ data: { environment: env } }),
          getPublicSetupPricing({ data: { environment: env } }),
          getPublicAnnualPricing({ data: { environment: env } }),
        ]);
        if (cancelled) return;
        if (live) setProPrice(live);
        if (setup) setSetupPrice(setup);
        if (annual) setAnnualPrice(annual);
      } catch {
        /* se queda el respaldo de @/lib/pricing */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [configured]);

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
      if (!cancelled) {
        setSub((data as SubRow | null) ?? null);
        setSubChecked(true);
      }
      if (configured) {
        try {
          await syncMyPlan({ data: { environment: env } });
          await refreshCloudProfile();
        } catch {
          /* noop */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, configured]);

  const isProActive =
    !!sub &&
    (["active", "trialing"].includes(sub.status) ||
      (sub.status === "canceled" && sub.current_period_end && new Date(sub.current_period_end) > new Date()));

  // Con ?checkout=1, abre el pago de Stripe una sola vez en cuanto sabemos
  // que el usuario todavía no es Pro.
  useEffect(() => {
    if (checkout !== 1 || autoLaunched || !ready || !configured || !subChecked) return;
    if (isProActive || clientSecret || loading) return;
    setAutoLaunched(true);
    void handleUpgrade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, autoLaunched, ready, configured, subChecked, isProActive]);

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
          priceId: ciclo === "anual" ? PRO_ANNUAL_LOOKUP_KEY : PRO_MONTHLY_LOOKUP_KEY,
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

        <ModuleHeader
          eyebrow="Cuenta · Planes"
          title="Elige tu"
          accent="plan"
          tail="."
          subtitle={
            <>
              Empieza gratis con FlightPath Básica y sube a Pro cuando quieras acceso ilimitado, IA y
              todos los módulos. Pro se activa con un <strong>pago único de inscripción</strong> y, de
              ahí, eliges cómo continuar: mensual o anual.
            </>
          }
          planes={6}
        />

        {/* Cómo funciona el cobro de Pro */}
        <div
          style={{
            background: "#fff", border: "1px solid #E3EAF5", borderRadius: 16,
            padding: "18px 22px", marginBottom: 28, display: "grid", gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: BRAND, marginBottom: 6 }}>
              1 · Inscripción (pago único)
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: "1.6rem", fontWeight: 800, color: INK }}>
                ${setupPrice.amount.toLocaleString("es-MX")}
              </span>
              {setupPrice.amount < PRO_SETUP_LIST_PRICE && (
                <span style={{ fontSize: 14, color: "#98A8C0", textDecoration: "line-through" }}>
                  ${PRO_SETUP_LIST_PRICE.toLocaleString("es-MX")}
                </span>
              )}
              <span style={{ fontSize: 13, color: "#647DA0" }}>{setupPrice.currency}</span>
            </div>
            {setupPrice.amount < PRO_SETUP_LIST_PRICE && (
              <div style={{ fontSize: 12, color: "#6C0820", fontWeight: 700, marginTop: 4 }}>
                Promoción por la convocatoria
              </div>
            )}
            <div style={{ fontSize: 12.5, color: "#647DA0", marginTop: 4 }}>
              Se cobra una sola vez, junto con tu primer periodo.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: BRAND, marginBottom: 6 }}>
              2 · Elige cómo continuar
            </div>
            <div style={{ fontSize: 13.5, color: "#4A5F80", lineHeight: 1.7 }}>
              <div>
                <strong>${proPrice.amount.toLocaleString("es-MX")} {proPrice.currency}</strong> al mes, o
              </div>
              <div>
                <strong>${annualPrice.amount.toLocaleString("es-MX")} {annualPrice.currency}</strong> al año
                {ahorro > 0 && (
                  <span style={{ color: "#2E9E63", fontWeight: 700 }}> — te ahorras {ahorro} {ahorro === 1 ? "mes" : "meses"}</span>
                )}
              </div>
            </div>
          </div>
        </div>

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

            {/* Mensual o anual */}
            <div style={{ display: "flex", gap: 6, background: "#F4F7FB", borderRadius: 12, padding: 4, margin: "12px 0 14px", border: "1px solid #E3EAF5" }}>
              {([
                { key: "mensual" as const, label: "Mensual" },
                { key: "anual" as const, label: ahorro > 0 ? `Anual · −${ahorro} meses` : "Anual" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setCiclo(opt.key)}
                  style={{
                    flex: 1, padding: "9px 8px", borderRadius: 9, border: "none", cursor: "pointer",
                    fontSize: 12.5, fontWeight: 700, fontFamily: FONT,
                    background: ciclo === opt.key ? "#fff" : "transparent",
                    color: ciclo === opt.key ? INK : "#8DA1BE",
                    boxShadow: ciclo === opt.key ? "0 2px 8px rgba(61,93,145,0.15)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ fontFamily: DISPLAY, fontSize: "2.4rem", fontWeight: 800, color: INK, margin: "0 0 4px" }}>
              ${(ciclo === "anual" ? annualPrice : proPrice).amount.toLocaleString("es-MX")}{" "}
              <span style={{ fontSize: 15, color: "#647DA0", fontWeight: 500 }}>
                {(ciclo === "anual" ? annualPrice : proPrice).currency}{ciclo === "anual" ? "/año" : "/mes"}
              </span>
            </div>
            <div style={{ color: "#647DA0", fontSize: 13, marginBottom: 4 }}>
              + ${setupPrice.amount.toLocaleString("es-MX")} {setupPrice.currency} de inscripción (pago único, sólo la primera vez)
            </div>
            <div style={{ color: "#647DA0", fontSize: 13, marginBottom: 20 }}>Cancela cuando quieras</div>
            <ul style={{ padding: 0, listStyle: "none", color: "#4A5F80", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
              <li>✅ Cuestionario y simulador ilimitados</li>
              <li>✅ Todo el banco de preguntas</li>
              <li>✅ Yaris con IA, con el contexto del curso</li>
              <li>✅ Recordatorios por WhatsApp</li>
              <li>✅ Análisis completo por materia</li>
            </ul>
            {isProActive ? (
              <button onClick={handlePortal} disabled={loading} style={{ width: "100%", background: INK, color: "#fff", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {loading ? "Abriendo..." : "Gestionar suscripción →"}
              </button>
            ) : (
              <button onClick={() => handleUpgrade()} disabled={loading} style={{ width: "100%", background: BRAND, color: "#fff", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {loading ? "Preparando pago..." : ciclo === "anual" ? "Actualizar a Pro anual →" : "Actualizar a Pro mensual →"}
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
