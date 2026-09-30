/**
 * Upsell al anual: aparece justo después de elegir el mensual y antes de abrir
 * Stripe. Si lo acepta, el checkout abre el anual; si lo rechaza (o cierra),
 * sigue el flujo normal con el mensual.
 */
import { useEffect, useState } from "react";
import type { PlanPrice } from "@/lib/pricing";

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const GOLD = "#C7A052";

export function AnnualUpsellModal({
  monthly,
  annual,
  setup,
  onAccept,
  onDecline,
}: {
  monthly: PlanPrice;
  annual: PlanPrice;
  setup: PlanPrice;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDecline();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDecline]);

  const mxn = (n: number) => `$${n.toLocaleString("es-MX")}`;
  const ahorro = Math.max(0, monthly.amount * 12 - annual.amount);
  const mesesGratis = monthly.amount ? Math.round(ahorro / monthly.amount) : 0;
  const equivalente = Math.round(annual.amount / 12);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Oferta del plan anual"
      onClick={onDecline}
      style={{
        position: "fixed", inset: 0, zIndex: 9990, display: "grid", placeItems: "center",
        padding: 16, fontFamily: FONT, overflowY: "auto",
        background: shown ? "rgba(3,8,15,0.78)" : "rgba(3,8,15,0)",
        backdropFilter: shown ? "blur(6px)" : "blur(0px)",
        transition: "background .35s ease, backdrop-filter .35s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(460px, 100%)", maxHeight: "92vh", overflowY: "auto",
          background: "linear-gradient(180deg,#071326 0%,#050F22 100%)",
          border: "1px solid rgba(199,160,82,0.35)", borderRadius: 18,
          padding: "28px 22px 20px", color: "#fff",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0) scale(1)" : "translateY(24px) scale(.96)",
          transition: "opacity .4s ease, transform .5s cubic-bezier(.2,.9,.25,1.15)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "1.4px", color: GOLD, textTransform: "uppercase" }}>
            Antes de pagar
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "1.6rem", margin: "10px 0 6px", lineHeight: 1.15 }}>
            {mesesGratis > 0 ? `Llévate ${mesesGratis} meses gratis con el anual` : "Cámbiate al plan anual"}
          </h2>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.62)", fontSize: "0.9rem" }}>
            Mismo acceso completo, un solo pago al año y sin preocuparte por renovar cada mes.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
          <div style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", padding: 14, background: "rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "1px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Mensual</div>
            <div style={{ fontFamily: DISPLAY, fontSize: "1.5rem", fontWeight: 700, marginTop: 6 }}>{mxn(monthly.amount)}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{mxn(monthly.amount * 12)} al año</div>
          </div>
          <div style={{ borderRadius: 12, border: `1.5px solid ${GOLD}`, padding: 14, background: "rgba(199,160,82,0.10)", position: "relative" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "1px", color: GOLD, textTransform: "uppercase" }}>Anual</div>
            <div style={{ fontFamily: DISPLAY, fontSize: "1.5rem", fontWeight: 700, marginTop: 6 }}>{mxn(annual.amount)}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)" }}>≈ {mxn(equivalente)} al mes</div>
          </div>
        </div>

        {ahorro > 0 && (
          <div style={{ textAlign: "center", marginTop: 14, fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>
            Ahorras <b style={{ color: GOLD }}>{mxn(ahorro)} {annual.currency}</b> en el año
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 4, fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>
          La inscripción de {mxn(setup.amount)} es igual en ambos planes.
        </div>

        <button
          onClick={onAccept}
          style={{
            width: "100%", minHeight: 52, marginTop: 18, borderRadius: 12, border: "none",
            background: `linear-gradient(90deg, #7A5C1E, ${GOLD})`, color: "#fff",
            fontWeight: 800, fontSize: "1rem", cursor: "pointer",
          }}
        >
          Sí, quiero el anual →
        </button>
        <button
          onClick={onDecline}
          style={{
            width: "100%", minHeight: 44, marginTop: 8, background: "none", border: "none",
            color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", cursor: "pointer", fontFamily: FONT,
          }}
        >
          No, gracias, sigo con el mensual
        </button>
      </div>
    </div>
  );
}
