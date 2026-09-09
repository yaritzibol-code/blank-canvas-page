/** Pantalla con candado para cuentas sin suscripción de paga. */
import { Icon } from "@/components/ui/fp-icon";
import { PathyMark } from "@/components/shared/PathyMark";

export function LockedState({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: "30px 24px",
        textAlign: "center",
        boxShadow: "0 2px 16px rgba(61,93,145,0.08)",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <PathyMark size={54} float />
      </div>
      <div
        style={{
          width: 44, height: 44, borderRadius: "50%", margin: "0 auto 14px",
          background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon n="lock" size={20} color="#fff" />
      </div>
      <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", color: "#22375C", margin: "0 0 8px" }}>
        Estudiemos Juntos es de FlightPath Pro
      </h2>
      <p style={{ fontSize: "0.88rem", color: "#647DA0", margin: "0 auto 18px", maxWidth: 420, lineHeight: 1.6 }}>
        Tú eliges cómo llegas: Pathy revisa tu progreso real y arma la sesión de hoy con los
        recursos que más te sirven, con tiempos y breaks incluidos.
      </p>
      <button
        onClick={onUpgrade}
        style={{
          minHeight: 48, padding: "12px 22px", borderRadius: 12, border: "none",
          background: "#6C0820", color: "white", fontWeight: 800, fontSize: "0.9rem",
          cursor: "pointer", fontFamily: "'Manrope', sans-serif",
        }}
      >
        Desbloquear Estudiemos Juntos
      </button>
    </div>
  );
}
