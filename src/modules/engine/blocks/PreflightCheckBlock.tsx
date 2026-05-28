import { useState } from "react";
import type { PreflightCheckBlockData } from "../types";

export function PreflightCheckBlock({
  pregunta,
  opciones,
  respuesta_correcta,
  explicacion,
}: PreflightCheckBlockData) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = answered && selected === respuesta_correcta;

  function getLetterBg(i: number) {
    if (!answered) return "#F2DCDB";
    if (i === respuesta_correcta) return "#2ecc71";
    if (i === selected) return "#e74c3c";
    return "#F2DCDB";
  }

  function getLetterColor(i: number) {
    if (!answered) return "#888";
    if (i === respuesta_correcta || i === selected) return "white";
    return "#888";
  }

  function getOptionBorder(i: number) {
    if (!answered) return "#F2DCDB";
    if (i === respuesta_correcta) return "#2ecc71";
    if (i === selected) return "#e74c3c";
    return "#F2DCDB";
  }

  function getOptionBg(i: number) {
    if (!answered) return "white";
    if (i === respuesta_correcta) return "rgba(46,204,113,0.07)";
    if (i === selected) return "rgba(231,76,60,0.06)";
    return "white";
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 28,
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
        border: "2px solid #F2DCDB",
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#1a1a2e",
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
        ✈️ Chequeo Pre-Vuelo
      </div>

      <p style={{ fontSize: "0.83rem", color: "#999", marginBottom: 14, lineHeight: 1.4 }}>
        Activa lo que ya sabes. Sin penalización — solo para calentar motores.
      </p>

      <p
        style={{
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "#1a1a2e",
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        {pregunta}
      </p>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {opciones.map((opcion, i) => (
          <button
            key={i}
            disabled={answered}
            onClick={() => setSelected(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              border: `2px solid ${getOptionBorder(i)}`,
              borderRadius: 10,
              background: getOptionBg(i),
              cursor: answered ? "default" : "pointer",
              textAlign: "left",
              width: "100%",
              fontSize: "0.88rem",
              fontFamily: "'DM Sans', sans-serif",
              color: "#1a1a2e",
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: getLetterBg(i),
                color: getLetterColor(i),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {String.fromCharCode(65 + i)}
            </span>
            {opcion}
          </button>
        ))}
      </div>

      {/* Result */}
      {answered && (
        <div
          style={{
            borderRadius: 10,
            padding: "14px 18px",
            background: correct ? "rgba(46,204,113,0.1)" : "rgba(61,93,145,0.06)",
            border: `1px solid ${correct ? "#2ecc71" : "#5A86CB"}`,
            fontSize: "0.88rem",
            lineHeight: 1.5,
            color: correct ? "#1a7a4a" : "#3D5D91",
          }}
        >
          <strong style={{ display: "block", marginBottom: 6 }}>
            {correct
              ? "✅ ¡Ya sabías esto! Refuerza el concepto."
              : "💡 Perfecto, esto es lo que vas a aprender hoy."}
          </strong>
          {explicacion}
        </div>
      )}
    </div>
  );
}
