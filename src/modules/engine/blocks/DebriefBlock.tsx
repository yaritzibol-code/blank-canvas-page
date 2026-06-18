import { useState } from "react";
import type { DebriefBlockData } from "../types";

const DIFFICULTY_COLORS = ["#2ecc71", "#27ae60", "#f39c12", "#e67e22", "#e74c3c"];
const DIFFICULTY_EMOJIS = ["😄", "🙂", "😐", "😕", "😰"];

type Props = Omit<DebriefBlockData, "tema_id"> & {
  tema_id: string;
  onComplete?: (dificultad: number) => void;
};

export function DebriefBlock({
  puntos_clave,
  pregunta_metacognitiva,
  opciones_dificultad,
  onComplete,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSelect(index: number) {
    if (saved) return;
    setSelected(index);
  }

  async function handleSave() {
    if (selected === null || saved) return;
    setSaved(true);
    // dificultad_percibida is 1-indexed (1 = Muy fácil, 5 = Muy difícil)
    onComplete?.(selected + 1);
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 28,
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(61,93,145,0.06)",
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(46,204,113,0.1)",
          color: "#1a7a4a",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 16,
        }}
      >
        🛬 Debrief del Tema
      </div>

      {/* Key points */}
      <h3
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#1a1a2e",
          marginBottom: 14,
        }}
      >
        Lo esencial de este tema
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {puntos_clave.map((punto, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "10px 14px",
              background: "rgba(61,93,145,0.04)",
              borderRadius: 10,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i + 1}
            </span>
            <p style={{ fontSize: "0.88rem", color: "#333", lineHeight: 1.6, margin: 0 }}>{punto}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#F2DCDB", marginBottom: 20 }} />

      {/* Metacognitive question */}
      <p
        style={{
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "#1a1a2e",
          marginBottom: 14,
        }}
      >
        {pregunta_metacognitiva}
      </p>

      {/* Difficulty options — normalize both string[] and {valor, etiqueta}[] */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {opciones_dificultad.map((opcion, i) => {
          const label = typeof opcion === "string" ? opcion : (opcion as { etiqueta: string }).etiqueta;
          const isSelected = selected === i;
          return (
            <button
              key={i}
              disabled={saved}
              onClick={() => handleSelect(i)}
              style={{
                flex: 1,
                minWidth: 80,
                padding: "10px 8px",
                border: `2px solid ${isSelected ? DIFFICULTY_COLORS[i] : "#F2DCDB"}`,
                borderRadius: 10,
                background: isSelected ? `${DIFFICULTY_COLORS[i]}15` : "white",
                cursor: saved ? "default" : "pointer",
                fontFamily: "'Manrope', sans-serif",
                fontSize: "0.78rem",
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? DIFFICULTY_COLORS[i] : "#888",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{DIFFICULTY_EMOJIS[i]}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Save button */}
      {!saved ? (
        <button
          disabled={selected === null}
          onClick={handleSave}
          style={{
            width: "100%",
            padding: 14,
            background: selected !== null ? "#6C0820" : "#ddd",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: selected !== null ? "pointer" : "not-allowed",
            fontFamily: "'Manrope', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (selected !== null) e.currentTarget.style.background = "#8a0a28";
          }}
          onMouseLeave={(e) => {
            if (selected !== null) e.currentTarget.style.background = "#6C0820";
          }}
        >
          ✅ Marcar tema como completado
        </button>
      ) : (
        <div
          style={{
            background: "rgba(46,204,113,0.1)",
            border: "1px solid #2ecc71",
            borderRadius: 10,
            padding: "14px 20px",
            textAlign: "center",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#1a7a4a",
          }}
        >
          🎉 ¡Tema completado! Tu progreso quedó registrado.
        </div>
      )}
    </div>
  );
}
