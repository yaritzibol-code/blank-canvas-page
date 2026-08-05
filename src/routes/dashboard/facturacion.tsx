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
  const estado = estadoVisible(billing, pro);
  const ciclo = cicloActual(billing);
  const puedeCambiar = Boolean(billing?.active) && ciclo !== null && !esAdmin;

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
          {!esAdmin && (
            <span style={{ padding: "3px 10px", borderRadius: 20, background: estado.fondo, color: estado.color, border: `1px solid ${estado.borde}`, fontSize: ".68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>
              {estado.texto}
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
        {!esAdmin && billing?.status && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #EEF3F9" }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".16em", textTransform: "uppercase", color: MIST }}>
                {billing.cancelAtPeriodEnd ? "Acceso hasta" : "Próximo cobro"}
              </div>
              <div style={{ fontSize: ".95rem", fontWeight: 800, color: INK, marginTop: 4 }}>
                {fmtFecha(billing.currentPeriodEnd)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".16em", textTransform: "uppercase", color: MIST }}>
                Periodicidad
              </div>
              <div style={{ fontSize: ".95rem", fontWeight: 800, color: INK, marginTop: 4 }}>
                {ciclo === "year" ? "Anual" : ciclo === "month" ? "Mensual" : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".16em", textTransform: "uppercase", color: MIST }}>
                Importe
              </div>
              <div style={{ fontSize: ".95rem", fontWeight: 800, color: INK, marginTop: 4 }}>
                {formatPriceWithInterval(ciclo === "year" ? PRO_ANNUAL_FALLBACK : PRO_MONTHLY_FALLBACK)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cambio de periodicidad con prorrateo */}
      {puedeCambiar && (
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase", color: MIST, marginBottom: 10 }}>
            Cambiar periodicidad
          </div>
          <p style={{ fontSize: ".86rem", color: HAZE, lineHeight: 1.6, margin: "0 0 14px" }}>
            {ciclo === "month"
              ? `Pasa al plan anual (${formatPriceWithInterval(PRO_ANNUAL_FALLBACK)}) y paga menos por mes. Stripe descuenta lo que ya pagaste de este mes.`
              : `Vuelve al plan mensual (${formatPriceWithInterval(PRO_MONTHLY_FALLBACK)}). Stripe te acredita el tiempo del año que no usaste.`}
          </p>
          <button
            onClick={() => setSwitchTo(ciclo === "month" ? "year" : "month")}
            disabled={busy}
            style={{
              padding: "11px 18px", borderRadius: 10, cursor: busy ? "wait" : "pointer",
              background: INK, color: "white", border: "none",
              fontSize: ".86rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif",
            }}
          >
            {ciclo === "month" ? "Cambiar a plan anual" : "Cambiar a plan mensual"}
          </button>
        </div>
      )}

      {/* Historial de pagos */}
      {!esAdmin && (
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".18em", textTransform: "uppercase", color: MIST, marginBottom: 12 }}>
            Historial de pagos
          </div>
          {loading ? (
            <div style={{ fontSize: ".86rem", color: HAZE }}>Consultando tus cobros…</div>
          ) : invoices.length === 0 ? (
            <div style={{ fontSize: ".86rem", color: HAZE }}>
              Todavía no hay cobros a tu nombre. Cuando pagues, aquí aparecerá cada recibo con su PDF.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".84rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: MIST }}>
                    <th style={{ padding: "6px 8px", fontWeight: 700 }}>Fecha</th>
                    <th style={{ padding: "6px 8px", fontWeight: 700 }}>Concepto</th>
                    <th style={{ padding: "6px 8px", fontWeight: 700 }}>Importe</th>
                    <th style={{ padding: "6px 8px", fontWeight: 700 }}>Estado</th>
                    <th style={{ padding: "6px 8px", fontWeight: 700 }}>Recibo</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderTop: "1px solid #EEF3F9", color: INK }}>
                      <td style={{ padding: "8px" }}>{fmtFecha(inv.date)}</td>
                      <td style={{ padding: "8px", color: HAZE }}>{inv.concepto}</td>
                      <td style={{ padding: "8px", fontWeight: 700 }}>
                        ${inv.amount.toLocaleString("es-MX")} {inv.currency}
                      </td>
                      <td style={{ padding: "8px", color: inv.status === "paid" ? "#1A7A4A" : "#856404", fontWeight: 700 }}>
                        {inv.status === "paid" ? "Pagado" : inv.status === "open" ? "Pendiente" : (inv.status ?? "—")}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {inv.pdfUrl || inv.hostedUrl ? (
                          <a
                            href={(inv.pdfUrl ?? inv.hostedUrl) as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: WINE, fontWeight: 700, textDecoration: "none" }}
                          >
                            Ver PDF
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Planes */}
      {!pro && !esAdmin ? (
        <PlanesGratis />
      ) : (
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
      )}


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

      {/* Confirmación del cambio de periodicidad */}
      {switchTo && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSwitchTo(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,.6)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div style={{ background: "white", borderRadius: 18, padding: 24, maxWidth: 460, width: "100%" }}>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 800, color: INK, marginBottom: 8 }}>
              {switchTo === "year" ? "¿Pasar al plan anual?" : "¿Volver al plan mensual?"}
            </h2>
            <p style={{ fontSize: ".88rem", color: HAZE, lineHeight: 1.6, marginBottom: 18 }}>
              El cambio es inmediato. Stripe calcula el prorrateo: te acredita lo que ya pagaste de
              este periodo y sólo cobra la diferencia
              {switchTo === "year"
                ? ` para dejarte en ${formatPriceWithInterval(PRO_ANNUAL_FALLBACK)}.`
                : ` para dejarte en ${formatPriceWithInterval(PRO_MONTHLY_FALLBACK)}.`}{" "}
              El recibo te llega por correo y queda en tu historial de pagos.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSwitchTo(null)}
                style={{ flex: 1, padding: 11, borderRadius: 10, background: "white", color: HAZE, border: "2px solid #E8EEF6", fontSize: ".86rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                Mejor no
              </button>
              <button
                onClick={() => doSwitch(switchTo)}
                disabled={busy}
                style={{ flex: 1, padding: 11, borderRadius: 10, background: INK, color: "white", border: "none", fontSize: ".86rem", fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                {busy ? "Cambiando…" : "Sí, cambiar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tarjetas de precio para cuentas gratis, con el mismo lenguaje visual de la
 * landing: interruptor mensual/anual que arranca en **anual** (el plan que
 * recomendamos) y muestra el porcentaje que se ahorra frente a pagar mes a
 * mes. El cobro real siempre sale de Stripe; aquí sólo se muestra.
 */
function PlanesGratis() {
  const [ciclo, setCiclo] = useState<"mensual" | "anual">("anual");
  const anual = ciclo === "anual";
  const precio = anual ? PRO_ANNUAL_FALLBACK : PRO_MONTHLY_FALLBACK;
  const totalMensualAnualizado = PRO_MONTHLY_FALLBACK.amount * 12;
  const ahorroPct = Math.max(
    0,
    Math.round(((totalMensualAnualizado - PRO_ANNUAL_FALLBACK.amount) / totalMensualAnualizado) * 100),
  );

  const pill = (activo: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "9px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: activo ? "white" : "transparent",
    color: activo ? INK : HAZE,
    fontFamily: "'Manrope', sans-serif",
    fontSize: ".82rem",
    fontWeight: 800,
    boxShadow: activo ? "0 1px 4px rgba(34,55,92,.14)" : "none",
    minHeight: 44,
  });

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Interruptor de periodicidad */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div
          role="group"
          aria-label="Periodicidad del plan"
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            borderRadius: 999,
            background: "#EEF3F9",
            border: "1px solid #E8EEF6",
            width: "100%",
            maxWidth: 360,
          }}
        >
          <button
            type="button"
            onClick={() => setCiclo("mensual")}
            aria-pressed={!anual}
            style={pill(!anual)}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setCiclo("anual")}
            aria-pressed={anual}
            style={pill(anual)}
          >
            Anual · −{ahorroPct}%
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {/* Básica */}
        <div style={card}>
          <div style={{ fontSize: ".95rem", fontWeight: 800, color: INK, marginBottom: 4 }}>Básica</div>
          <div style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 900, color: INK, lineHeight: 1 }}>
            Gratis
          </div>
          <div style={{ fontSize: ".8rem", color: MIST, margin: "6px 0 12px" }}>Tu plan actual</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: ".84rem", color: HAZE, lineHeight: 1.9 }}>
            <li>Parte del banco de preguntas</li>
            <li>Un simulador al mes</li>
            <li>Bitácora y recordatorios básicos</li>
          </ul>
        </div>

        {/* Pro */}
        <div style={{ ...card, borderColor: "#F2AEBC", borderWidth: 2, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: ".95rem", fontWeight: 800, color: INK }}>
              Pro {anual ? "Anual" : "Mensual"}
            </span>
            <span style={{ padding: "2px 9px", borderRadius: 20, background: "#F2AEBC", color: WINE, fontSize: ".64rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>
              Recomendado
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 900, color: INK, lineHeight: 1 }}>
              {formatPriceWithInterval(precio)}
            </span>
            {anual && (
              <span style={{ fontSize: ".8rem", fontWeight: 800, color: "#1A7A4A" }}>
                ahorras {ahorroPct}%
              </span>
            )}
          </div>
          <div style={{ fontSize: ".8rem", color: MIST, margin: "8px 0 12px", lineHeight: 1.55 }}>
            {anual
              ? `Equivale a ${formatPrice({ ...PRO_MONTHLY_FALLBACK, amount: Math.round(PRO_ANNUAL_FALLBACK.amount / 12) })} al mes.`
              : `Con el anual pagarías ${formatPriceWithInterval(PRO_ANNUAL_FALLBACK)} y ahorrarías ${ahorroPct}%.`}{" "}
            Más {formatPrice(PRO_SETUP_FALLBACK)} de inscripción por única vez.
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
              width: "100%", padding: "12px 16px", borderRadius: 10, minHeight: 46,
              background: WINE, color: "white", fontSize: ".88rem", fontWeight: 800, textDecoration: "none",
            }}
          >
            Hacerme Pro {anual ? "Anual" : "Mensual"} <Icon n="arrow" size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

