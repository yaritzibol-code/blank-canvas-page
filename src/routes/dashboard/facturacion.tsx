/**
 * Facturación — el estado de la suscripción y cómo cambiarlo.
 *
 * Muestra el plan vigente con su fecha real de renovación (leída de Stripe),
 * permite darse de baja desde la propia app (la baja surte efecto al final del
 * periodo ya pagado, no corta el acceso a media mensualidad), reactivar una
 * baja programada y abrir el portal de Stripe para facturas y tarjetas.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useSessionUser, isPaid } from "@/lib/store";
import {
  cancelMySubscription,
  createPortalSession,
  getMyBilling,
  getMyInvoices,
  resumeMySubscription,
  switchMyPlan,
  type BillingState,
  type InvoiceRow,
} from "@/lib/payments.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import {
  PRO_ANNUAL_FALLBACK,
  PRO_MONTHLY_FALLBACK,
  PRO_SETUP_FALLBACK,
  formatPrice,
  formatPriceWithInterval,
} from "@/lib/pricing";

export const Route = createFileRoute("/dashboard/facturacion")({
  component: FacturacionPage,
});

const INK = "#22375C";
const HAZE = "#647DA0";
const MIST = "#8DA1BE";
const WINE = "#6C0820";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #E8EEF6",
  borderRadius: 16,
  padding: 20,
};

const fmtFecha = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
    : "—";

/** Nombre legible del plan a partir del precio contratado en Stripe. */
function planLabel(b: BillingState | null, planNombre: string): string {
  if (!b?.priceId) return planNombre;
  return /annual|anual|year/i.test(b.priceId) ? "Pro Anual" : "Pro Mensual";
}

/** Ciclo vigente deducido del precio: define hacia dónde puede cambiarse. */
function cicloActual(b: BillingState | null): "month" | "year" | null {
  if (!b?.priceId) return null;
  return /annual|anual|year/i.test(b.priceId) ? "year" : "month";
}

type EstadoVisible = { texto: string; fondo: string; borde: string; color: string };

/**
 * Traduce el estado de Stripe a algo que una estudiante entienda: "activa",
 * "cancelada", "vencida" o "pago pendiente". Un `past_due` no es una baja —
 * Stripe reintenta el cobro — y mostrarlo como cancelada asustaría de más.
 */
function estadoVisible(b: BillingState | null, pro: boolean): EstadoVisible {
  const verde = { fondo: "#EAF6EE", borde: "#BFE7CE", color: "#1A7A4A" };
  const ambar = { fondo: "#FDF3D6", borde: "#F0DFAE", color: "#856404" };
  const rojo = { fondo: "#FEE2E2", borde: "#F3C7C2", color: "#B3261E" };
  const gris = { fondo: "#F2F6FB", borde: "#E3EAF5", color: "#647DA0" };
  const s = b?.status;
  if (b?.cancelAtPeriodEnd && b.active) return { texto: "Cancelada (activa hasta el corte)", ...ambar };
  if (s === "past_due" || s === "unpaid") return { texto: "Pago pendiente", ...ambar };
  if (s === "trialing") return { texto: "Prueba activa", ...verde };
  if (b?.active || (pro && !s)) return { texto: "Activa", ...verde };
  if (s === "canceled") return { texto: "Cancelada", ...rojo };
  if (s) return { texto: "Vencida", ...rojo };
  return { texto: "Sin suscripción", ...gris };
}

function FacturacionPage() {
  const user = useSessionUser();
  const configured = isPaymentsConfigured();
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [switchTo, setSwitchTo] = useState<"month" | "year" | null>(null);

  const refresh = async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const env = getStripeEnvironment();
    try {
      setBilling(await getMyBilling({ data: { environment: env } }));
    } catch {
      setBilling(null);
    }
    try {
      const res = await getMyInvoices({ data: { environment: env } });
      setInvoices(res.invoices);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  if (!user) return null;

  const pro = isPaid(user);
  const esAdmin = user.role === "admin";

  const doCancel = async () => {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await cancelMySubscription({ data: { environment: getStripeEnvironment() } });
      if (res.error) setError(res.error);
      else {
        setMsg(
          res.endsAt
            ? `Listo. Tu acceso Pro sigue activo hasta el ${fmtFecha(res.endsAt)} y no se te volverá a cobrar.`
            : "Listo. No se te volverá a cobrar.",
        );
        await refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos cancelar la suscripción.");
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const doResume = async () => {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await resumeMySubscription({ data: { environment: getStripeEnvironment() } });
      if (res.error) setError(res.error);
      else {
        setMsg("Suscripción reactivada. Se renovará normalmente.");
        await refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos reactivar la suscripción.");
    } finally {
      setBusy(false);
    }
  };

  const doPortal = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await createPortalSession({
        data: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/dashboard/facturacion`,
        },
      });
      if ("error" in res) setError(res.error);
      else window.open(res.url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos abrir el portal de Stripe.");
    } finally {
      setBusy(false);
    }
  };

  /** Cambio mensual ⇄ anual: Stripe prorratea y cobra sólo la diferencia. */
  const doSwitch = async (interval: "month" | "year") => {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await switchMyPlan({ data: { environment: getStripeEnvironment(), interval } });
      if (res.error) setError(res.error);
      else {
        setMsg(
          `Listo, ahora estás en el plan ${interval === "year" ? "anual" : "mensual"}. Stripe ajustó el cobro por lo que ya habías pagado${res.renewsAt ? ` y tu próxima renovación es el ${fmtFecha(res.renewsAt)}` : ""}.`,
        );
        await refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos cambiar tu plan.");
    } finally {
      setBusy(false);
      setSwitchTo(null);
    }
  };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", maxWidth: 860 }}>
      <PaymentTestModeBanner />
      <ModuleHeader
        eyebrow="Cuenta · Facturación"
        title="Tu suscripción,"
        accent="clara"
        tail="."
        subtitle="Qué plan tienes, cuándo se renueva y cómo darte de baja. Sin letras chiquitas."
        planes={6}
      />

      {(msg || error) && (
        <div
          style={{
            ...card,
            marginBottom: 16,
            borderColor: error ? "#F3C7C2" : "#BFE7CE",
            background: error ? "#FEE2E2" : "#EAF6EE",
            color: error ? "#B3261E" : "#1A7A4A",
            fontSize: ".86rem",
            fontWeight: 600,
          }}
        >
          {error ?? msg}
        </div>
      )}

      {/* Estado actual */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase", color: MIST, marginBottom: 10 }}>
          Plan actual
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: DISPLAY, fontSize: "1.7rem", fontWeight: 900, color: INK, lineHeight: 1 }}>
            {esAdmin ? "Administradora" : pro ? planLabel(billing, user.planNombre) : "Básica (gratis)"}
          </span>
          {billing?.cancelAtPeriodEnd && (
            <span style={{ padding: "3px 10px", borderRadius: 20, background: "#FDF3D6", color: "#856404", border: "1px solid #F0DFAE", fontSize: ".68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>
              Baja programada
            </span>
          )}
        </div>
        <div style={{ fontSize: ".86rem", color: HAZE, marginTop: 8, lineHeight: 1.55 }}>
          {esAdmin
            ? "Como administradora tienes acceso completo sin pago."
            : loading
              ? "Consultando tu suscripción…"
              : billing?.active
                ? billing.cancelAtPeriodEnd
                  ? `Tu acceso Pro termina el ${fmtFecha(billing.currentPeriodEnd)}. No habrá más cobros.`
                  : `Se renueva el ${fmtFecha(billing.currentPeriodEnd)}.`
                : pro
                  ? `Acceso Pro vigente${user.accessEnd ? ` hasta el ${fmtFecha(user.accessEnd)}` : ""}.`
                  : "No tienes una suscripción activa. Con la Básica puedes practicar con una parte del banco."}
        </div>
      </div>

      {/* Planes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>
        <div style={card}>
          <div style={{ fontSize: ".95rem", fontWeight: 800, color: INK, marginBottom: 4 }}>Básica</div>
          <div style={{ fontFamily: DISPLAY, fontSize: "1.6rem", fontWeight: 900, color: INK, marginBottom: 8 }}>Gratis</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: ".84rem", color: HAZE, lineHeight: 1.9 }}>
            <li>Parte del banco de preguntas</li>
            <li>Un simulador al mes</li>
            <li>Bitácora y recordatorios básicos</li>
          </ul>
        </div>
        <div style={{ ...card, borderColor: "#F2AEBC", borderWidth: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: ".95rem", fontWeight: 800, color: INK }}>Pro</span>
            <span style={{ padding: "2px 9px", borderRadius: 20, background: "#F2AEBC", color: WINE, fontSize: ".64rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>
              Recomendado
            </span>
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: "1.6rem", fontWeight: 900, color: INK, marginBottom: 2 }}>
            {formatPriceWithInterval(PRO_MONTHLY_FALLBACK)}
          </div>
          <div style={{ fontSize: ".8rem", color: MIST, marginBottom: 8 }}>
            o {formatPriceWithInterval(PRO_ANNUAL_FALLBACK)} · {formatPrice(PRO_SETUP_FALLBACK)} de inscripción por única vez
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", fontSize: ".84rem", color: HAZE, lineHeight: 1.9 }}>
            <li>Banco completo y simulador ilimitado</li>
            <li>Yaris con IA y el contexto del curso</li>
            <li>Análisis completo por materia</li>
          </ul>
          <Link
            to="/dashboard/planes"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              width: "100%", padding: "11px 16px", borderRadius: 10,
              background: WINE, color: "white", fontSize: ".86rem", fontWeight: 700, textDecoration: "none",
            }}
          >
            {pro ? "Cambiar de plan" : "Hacerme Pro"} <Icon n="arrow" size={15} />
          </Link>
        </div>
      </div>

      {/* Gestión */}
      {!esAdmin && (
        <div style={card}>
          <div style={{ fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase", color: MIST, marginBottom: 12 }}>
            Gestionar
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={doPortal}
              disabled={busy || !configured || !billing?.status}
              style={{
                padding: "11px 18px", borderRadius: 10, cursor: busy ? "wait" : "pointer",
                background: "white", color: INK, border: "2px solid #E8EEF6",
                fontSize: ".86rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                opacity: !configured || !billing?.status ? 0.5 : 1,
              }}
            >
              Facturas y método de pago
            </button>
            {billing?.cancelAtPeriodEnd ? (
              <button
                onClick={doResume}
                disabled={busy}
                style={{
                  padding: "11px 18px", borderRadius: 10, cursor: busy ? "wait" : "pointer",
                  background: "#1A7A4A", color: "white", border: "none",
                  fontSize: ".86rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                }}
              >
                Reactivar suscripción
              </button>
            ) : (
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={busy || !billing?.active}
                style={{
                  padding: "11px 18px", borderRadius: 10,
                  cursor: busy || !billing?.active ? "not-allowed" : "pointer",
                  background: "white", color: "#B3261E", border: "2px solid #F3C7C2",
                  fontSize: ".86rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                  opacity: !billing?.active ? 0.5 : 1,
                }}
              >
                Cancelar suscripción
              </button>
            )}
          </div>
          <p style={{ fontSize: ".78rem", color: MIST, marginTop: 12, lineHeight: 1.55 }}>
            Al cancelar conservas el acceso Pro hasta el final del periodo que ya pagaste. La
            inscripción es un pago único y no se cobra otra vez si vuelves.
          </p>
        </div>
      )}

      {/* Confirmación de baja */}
      {confirmOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,.6)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div style={{ background: "white", borderRadius: 18, padding: 24, maxWidth: 460, width: "100%" }}>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 800, color: INK, marginBottom: 8 }}>
              ¿Cancelar tu suscripción?
            </h2>
            <p style={{ fontSize: ".88rem", color: HAZE, lineHeight: 1.6, marginBottom: 18 }}>
              No se te volverá a cobrar. Conservas todo el acceso Pro hasta el{" "}
              <strong>{fmtFecha(billing?.currentPeriodEnd ?? null)}</strong> y tu progreso se queda
              guardado por si vuelves.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ flex: 1, padding: 11, borderRadius: 10, background: "white", color: HAZE, border: "2px solid #E8EEF6", fontSize: ".86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                Mejor no
              </button>
              <button
                onClick={doCancel}
                disabled={busy}
                style={{ flex: 1, padding: 11, borderRadius: 10, background: "#B3261E", color: "white", border: "none", fontSize: ".86rem", fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                {busy ? "Cancelando…" : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
