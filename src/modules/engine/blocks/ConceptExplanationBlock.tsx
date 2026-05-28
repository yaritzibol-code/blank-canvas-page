import type { ConceptExplanationBlockData } from "../types";

export function ConceptExplanationBlock({
  texto,
  destacados,
  svg_diagram,
  fuente,
}: ConceptExplanationBlockData) {
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
          background: "rgba(61,93,145,0.08)",
          color: "#3D5D91",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 16,
        }}
      >
        📖 Explicación
      </div>

      <p style={{ fontSize: "0.92rem", lineHeight: 1.75, color: "#555" }}>{texto}</p>

      {/* SVG diagram — internal content only */}
      {svg_diagram && (
        <div
          style={{
            background: "linear-gradient(135deg, #f0f4ff, #e8f0fa)",
            border: "2px solid rgba(61,93,145,0.1)",
            borderRadius: 12,
            padding: 24,
            margin: "20px 0",
            textAlign: "center",
            overflowX: "auto",
          }}
          dangerouslySetInnerHTML={{ __html: svg_diagram }}
        />
      )}

      {/* Highlighted callouts */}
      {destacados && destacados.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {destacados.map((d, i) => (
            <div
              key={i}
              style={{
                background: "rgba(61,93,145,0.05)",
                borderLeft: "3px solid #5A86CB",
                borderRadius: "0 8px 8px 0",
                padding: "10px 16px",
                fontSize: "0.88rem",
                color: "#1a1a2e",
                lineHeight: 1.6,
              }}
            >
              {d}
            </div>
          ))}
        </div>
      )}

      {fuente && (
        <p
          style={{
            fontSize: "0.73rem",
            color: "#bbb",
            marginTop: 14,
            fontStyle: "italic",
          }}
        >
          Fuente: {fuente}
        </p>
      )}
    </div>
  );
}
