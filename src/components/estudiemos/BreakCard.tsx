/** Break entre actividades: nunca corta una actividad en curso. */
import { PathyMark } from "@/components/shared/PathyMark";

export function BreakCard({ minutes, onDone }: { minutes: number; onDone: () => void }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#F2DCDB,#fce4ec)",
        borderRadius: 18,
        padding: "20px 22px",
        marginBottom: 16,
        display: "flex",
        gap: 14,
        alignItems: "center",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <PathyMark size={44} float />
      <div style={{ flex: 1 }}>
        <strong style={{ color: "#6C0820", display: "block", marginBottom: 3 }}>
          Break de {minutes} minutos
        </strong>
        <span style={{ fontSize: "0.85rem", color: "#4a4a4a", lineHeight: 1.5 }}>
          Estírate, toma agua y respira. Cuando vuelvas seguimos justo donde nos quedamos.
        </span>
      </div>
      <button
        onClick={onDone}
        style={{
          minHeight: 44, padding: "10px 16px", borderRadius: 10, border: "none",
          background: "#6C0820", color: "white", fontWeight: 700, fontSize: "0.82rem",
          cursor: "pointer", fontFamily: "'Manrope', sans-serif", flexShrink: 0,
        }}
      >
        Ya volví
      </button>
    </div>
  );
}
