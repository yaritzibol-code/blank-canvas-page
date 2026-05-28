import { useState } from "react";
import type { ThinkLikePilotBlockData } from "../types";

export function ThinkLikePilotBlock({ pregunta, pista, respuesta_sugerida }: ThinkLikePilotBlockData) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 28,
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
        border: "2px solid rgba(108,8,32,0.12)",
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#6C0820",
          color: "white",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 14,
        }}
      >
        🧑‍✈️ Piensa Como Piloto
      </div>

      <p
        style={{
          fontSize: "0.82rem",
          color: "#999",
          marginBottom: 16,
          lineHeight: 1.4,
        }}
      >
        No hay respuesta correcta o incorrecta — reflexiona antes de ver el razonamiento del piloto.
      </p>

      {/* Question */}
      <div
        style={{
          background: "rgba(108,8,32,0.05)",
          borderRadius: 12,
          padding: "20px 22px",
          marginBottom: 18,
        }}
      >
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#1a1a2e",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {pregunta}
        </p>
      </div>

      {/* Hint */}
      {pista && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "rgba(242,220,219,0.5)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>💭</span>
          <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5, margin: 0 }}>
            <strong style={{ color: "#6C0820" }}>Pista: </strong>
            {pista}
          </p>
        </div>
      )}

      {/* Reveal button */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          style={{
            width: "100%",
            padding: "12px 20px",
            background: "transparent",
            border: "2px solid #6C0820",
            borderRadius: 10,
            color: "#6C0820",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#6C0820";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#6C0820";
          }}
        >
          Ver razonamiento del piloto →
        </button>
      ) : (
        <div
          style={{
            background: "linear-gradient(135deg, #6C0820, #9a0c2e)",
            borderRadius: 12,
            padding: "20px 22px",
            color: "white",
          }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              opacity: 0.7,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 10,
            }}
          >
            ✈️ Razonamiento del piloto
          </p>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{respuesta_sugerida}</p>
        </div>
      )}
    </div>
  );
}
