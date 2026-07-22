/**
 * Mini comercial de conversión (PRD §5.4): aparece cuando un estudiante con
 * suscripción básica intenta abrir una función bloqueada.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { getConfig, logUpgradeClick, logUpgradePrompt, startCheckout } from "@/lib/store";

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";

const FLOATING = [
  { icon: "book", label: "Learning Paths" },
  { icon: "sim", label: "Simulador CIAAC" },
  { icon: "users", label: "Estudiemos Juntos" },
  { icon: "cards", label: "Flashcards" },
];

export interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** Qué función intentó abrir (ej. "Simulador CIAAC"). */
  feature: string;
  /** Por qué es útil / qué obtiene al desbloquear. */
  benefit?: string;
  userId?: string;
}

export function UpgradeModal({ open, onClose, feature, benefit, userId }: UpgradeModalProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      if (userId) logUpgradePrompt(userId, feature);
    } else {
      setVisible(false);
      setPaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  const config = getConfig();

  const goPlanes = (cta: string) => {
    if (userId) logUpgradeClick(userId, cta);
    navigate({ to: "/" });
    setTimeout(() => {
      document.getElementById("precios")?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  // Intenta Stripe Checkout; si los pagos aún no están configurados, cae a la
  // sección de precios de la landing (comportamiento previo).
  const goCheckout = async (cta: string) => {
    if (paying) return;
    if (userId) logUpgradeClick(userId, cta);
    setPaying(true);
    const res = await startCheckout();
    setPaying(false);
    if (res.ok && res.url) {
      // Nueva pestaña: Stripe no permite embederse en el iframe del preview.
      const win = window.open(res.url, "_blank");
      if (!win) window.location.href = res.url;
      return;
    }
    goPlanes(cta);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(34,55,92,.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: FONT,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(520px, 100%)",
          background: "#fff",
          borderRadius: 24,
          padding: "clamp(24px, 5vw, 40px)",
          textAlign: "center",
          boxShadow: "0 30px 80px rgba(34,55,92,.35)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(.97)",
          opacity: visible ? 1 : 0,
          transition: "all .35s cubic-bezier(.2,.9,.3,1.2)",
        }}
      >
        {/* Tarjetas flotantes de funciones desbloqueables */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          {FLOATING.map((f, i) => (
            <div
              key={f.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: "#F4F7FC",
                border: "1px solid #E3EAF5",
                fontSize: 12,
                fontWeight: 700,
                color: "#3D5D91",
                animation: `fpFloat ${2.6 + i * 0.3}s ease-in-out ${i * 0.2}s infinite alternate`,
              }}
            >
              <Icon n={f.icon as never} size={13} color="#5A86CB" />
              {f.label}
            </div>
          ))}
        </div>

        {/* Candado que se abre */}
        <div
          style={{
            width: 76,
            height: 76,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 30px rgba(61,93,145,.35)",
          }}
        >
          <Icon n="lock" size={34} color="#fff" />
        </div>

        <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.3rem, 4vw, 1.6rem)", color: INK, margin: "0 0 10px", fontWeight: 800 }}>
          ¿Listo para el siguiente nivel?
        </h2>
        <p style={{ color: "#647DA0", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 6px" }}>
          <b style={{ color: INK }}>{feature}</b> es parte de la experiencia completa de FlightPath.
          {benefit ? ` ${benefit}` : ""}
        </p>
        <p style={{ color: "#647DA0", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 22px" }}>
          {config.mensajeConversion}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => void goCheckout("Desbloquear acceso completo")}
            disabled={paying}
            style={{
              padding: "13px 20px",
              borderRadius: 12,
              border: "none",
              background: paying ? "#8DA1BE" : "#6C0820",
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              cursor: paying ? "default" : "pointer",
              fontFamily: FONT,
            }}
          >
            {paying ? "Un momento…" : "Desbloquear acceso completo"}
          </button>
          <button
            onClick={() => goPlanes("Ver planes")}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: "1.5px solid #3D5D91",
              background: "#fff",
              color: "#3D5D91",
              fontWeight: 700,
              fontSize: 14.5,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Ver planes
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              background: "transparent",
              color: "#647DA0",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Volver
          </button>
        </div>

        <style>{`@keyframes fpFloat { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
      </div>
    </div>
  );
}
