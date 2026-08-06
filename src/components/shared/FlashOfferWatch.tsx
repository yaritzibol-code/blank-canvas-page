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
import { Confetti } from "@/components/shared/Confetti";

const BRAND = "#6C0820";
const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Playfair Display', serif";
const SETUP_LIST = 3000;

/** Todo lo que se desbloquea con Pro (mismo listado que la card de precios). */
const BENEFICIOS = [
  "Banco completo: CIAAC, ATP, Jeppesen y Handbook",
  "Cuestionarios y simuladores ilimitados",
  "Yaris con IA: te explica y te acompaña",
  "Análisis de desempeño por materia con Pathy",
  "Biblioteca y manuales completos",
  "Recordatorios de estudio por WhatsApp",
  "Módulos nuevos conforme se liberan",
];

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
        <>
          <Confetti />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Oferta especial por tiempo limitado"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(12,10,14,0.78)",
              display: "grid",
              placeItems: "center",
              padding: 16,
              fontFamily: FONT,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                width: "min(520px, 100%)",
                maxHeight: "92vh",
                overflowY: "auto",
                background: "#12141C",
                borderRadius: 24,
                padding: "26px 22px",
                boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#fff",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "1.4px", color: "#F2AEBC", textTransform: "uppercase" }}>
                  Oferta Especial solo para ti
                </div>
                <h2 style={{ fontFamily: DISPLAY, fontSize: "1.7rem", margin: "10px 0 6px", lineHeight: 1.15 }}>
                  No queremos que te vayas sin estar preparado
                </h2>
                <p style={{ margin: "0 0 14px", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
                  Te apartamos la inscripción a mitad de precio. Cuando el reloj llegue a
                  cero vuelve a su precio normal y esta oferta no se repite.
                </p>
              </div>

              {/* Card de precio, igual a la de la página de precios */}
              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  padding: 16,
                }}
              >
                <div style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "1.2px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                  FlightPath Pro · Inscripción pago único
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.45)", textDecoration: "line-through" }}>
                    ${SETUP_LIST.toLocaleString("es-MX")}
                  </span>
                  <span style={{ fontFamily: DISPLAY, fontSize: "2.6rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                    ${FLASH_SETUP_PRICE.toLocaleString("es-MX")}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>MXN</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#A31637",
                      borderRadius: 999,
                      padding: "4px 10px",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    50% menos
                  </span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 9 }}>
                  {BENEFICIOS.map((b) => (
                    <li key={b} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span aria-hidden="true" style={{ color: "#F2AEBC", fontWeight: 900, lineHeight: 1.35 }}>✓</span>
                      <span style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.35 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                aria-live="polite"
                style={{
                  textAlign: "center",
                  fontFamily: DISPLAY,
                  fontSize: "2.2rem",
                  fontWeight: 700,
                  color: "#F2AEBC",
                  fontVariantNumeric: "tabular-nums",
                  margin: "16px 0 4px",
                }}
              >
                {formatLeft(left)}
              </div>
              <div style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
                para aprovechar tu precio
              </div>

              <button
                onClick={irAlPago}
                style={{
                  width: "100%",
                  minHeight: 56,
                  borderRadius: 14,
                  border: "none",
                  background: `linear-gradient(90deg, ${BRAND}, #A31637)`,
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
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Ahora no (el contador sigue arriba)
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
