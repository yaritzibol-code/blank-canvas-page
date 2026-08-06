/**
 * Oferta relámpago por pago abandonado.
 *
 * Cuando alguien abre el checkout y se sale sin pagar, se arranca (una única
 * vez) una ventana de 30 minutos con la inscripción a $1,500. Aquí vive la
 * parte visible: un popup grande la primera vez y, después, un contador fijo
 * que acompaña al usuario por toda la app y regresa al pago con un toque.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  FLASH_SETUP_PRICE,
  formatLeft,
  markFlashSeen,
  useFlashOffer,
} from "@/lib/flash-offer";
import { isPaid, useSessionUser } from "@/lib/store";

const BRAND = "#6C0820";
const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Playfair Display', serif";

export function FlashOfferWatch() {
  const navigate = useNavigate();
  const user = useSessionUser();
  const { state, left, active } = useFlashOffer();
  const [popup, setPopup] = useState(false);

  // El popup grande sólo la primera vez que arranca la oferta.
  useEffect(() => {
    if (active && state && !state.seen) setPopup(true);
  }, [active, state]);

  if (!active || (user && isPaid(user))) return null;

  const irAlPago = () => {
    markFlashSeen();
    setPopup(false);
    void navigate({ to: "/dashboard/planes", search: { checkout: 1, flash: 1 } as never });
  };

  const cerrarPopup = () => {
    markFlashSeen();
    setPopup(false);
  };

  return (
    <>
      {/* Contador siempre visible mientras corre la oferta */}
      <button
        onClick={irAlPago}
        aria-label={`Oferta especial: inscripción a $${FLASH_SETUP_PRICE}. Quedan ${formatLeft(left)}. Retomar el pago.`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
          minHeight: 44,
          padding: "8px 14px",
          border: "none",
          cursor: "pointer",
          background: `linear-gradient(90deg, ${BRAND}, #A31637)`,
          color: "#fff",
          fontFamily: FONT,
          fontSize: "0.82rem",
          fontWeight: 800,
          letterSpacing: "0.2px",
          boxShadow: "0 6px 20px rgba(108,8,32,0.35)",
        }}
      >
        <span aria-hidden="true">⏳</span>
        <span>
          Oferta especial: inscripción ${FLASH_SETUP_PRICE.toLocaleString("es-MX")} MXN
        </span>
        <span
          style={{
            background: "rgba(255,255,255,0.18)",
            borderRadius: 8,
            padding: "3px 9px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatLeft(left)}
        </span>
        <span style={{ textDecoration: "underline" }}>Retomar pago</span>
      </button>
      <div style={{ height: 44 }} aria-hidden="true" />

      {popup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Oferta especial por tiempo limitado"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(12,10,14,0.72)",
            display: "grid",
            placeItems: "center",
            padding: 18,
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              width: "min(460px, 100%)",
              background: "#fff",
              borderRadius: 20,
              padding: "26px 22px",
              textAlign: "center",
              boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "1px", color: BRAND, textTransform: "uppercase" }}>
              Sólo por 30 minutos
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "1.6rem", color: "#1B1B1F", margin: "8px 0 6px", lineHeight: 1.15 }}>
              Tu inscripción baja a ${FLASH_SETUP_PRICE.toLocaleString("es-MX")}
            </h2>
            <p style={{ margin: "0 0 16px", color: "#5B6B86", fontSize: "0.92rem" }}>
              Vimos que dejaste tu pago a medias. Te apartamos el precio de inscripción
              más bajo que damos. Cuando el reloj llegue a cero, vuelve a su precio normal
              y esta oferta no se repite.
            </p>
            <div
              aria-live="polite"
              style={{
                fontFamily: DISPLAY,
                fontSize: "2.4rem",
                fontWeight: 700,
                color: BRAND,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 16,
              }}
            >
              {formatLeft(left)}
            </div>
            <button
              onClick={irAlPago}
              style={{
                width: "100%",
                minHeight: 56,
                borderRadius: 14,
                border: "none",
                background: BRAND,
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Aprovechar la oferta ahora
            </button>
            <button
              onClick={cerrarPopup}
              style={{
                marginTop: 10,
                minHeight: 44,
                width: "100%",
                background: "none",
                border: "none",
                color: "#7a6a70",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Ahora no (el contador sigue arriba)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
