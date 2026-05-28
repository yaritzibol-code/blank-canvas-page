import type { ConceptExplanationBlockData, SvgDiagramSpec } from "../types";

const INLINE_HIGHLIGHT_CONFIG = {
  definicion: {
    icon: "📘",
    label: "Definición",
    borderColor: "#3D5D91",
    bg: "rgba(61,93,145,0.06)",
    labelColor: "#3D5D91",
    textColor: "#1a1a2e",
  },
  advertencia: {
    icon: "⚠️",
    label: "Atención",
    borderColor: "#6C0820",
    bg: "rgba(108,8,32,0.06)",
    labelColor: "#6C0820",
    textColor: "#1a1a2e",
  },
  dato_clave: {
    icon: "⭐",
    label: "Dato clave CIAAC",
    borderColor: "#c9930a",
    bg: "rgba(201,147,10,0.07)",
    labelColor: "#8a6500",
    textColor: "#1a1a2e",
  },
  yaris: {
    icon: "🧠",
    label: "Nemotecnia de Yaris",
    borderColor: "#F2AEBC",
    bg: "linear-gradient(135deg, #FFF5F7, #FDE8EC)",
    labelColor: "#6C0820",
    textColor: "#555",
  },
} as const;

export function ConceptExplanationBlock({
  titulo,
  texto,
  destacados,
  destacado,
  svg_diagram,
  nota_adicional,
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
          marginBottom: 14,
        }}
      >
        📖 Explicación
      </div>

      {titulo && (
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#1a1a2e",
            marginBottom: 12,
          }}
        >
          {titulo}
        </h3>
      )}

      <p style={{ fontSize: "0.92rem", lineHeight: 1.75, color: "#555" }}>{texto}</p>

      {/* SVG diagram — raw HTML string */}
      {svg_diagram && typeof svg_diagram === "string" && (
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

      {/* SVG diagram — descriptor object (placeholder) */}
      {svg_diagram && typeof svg_diagram === "object" && (
        <div
          style={{
            background: "linear-gradient(135deg, #f0f4ff, #e8f0fa)",
            border: "2px dashed rgba(61,93,145,0.25)",
            borderRadius: 12,
            padding: "24px 20px",
            margin: "20px 0",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}>📊</span>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#5A86CB",
              lineHeight: 1.5,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {(svg_diagram as SvgDiagramSpec).descripcion}
          </p>
        </div>
      )}

      {/* New: single typed inline highlight */}
      {destacado && (() => {
        const cfg = INLINE_HIGHLIGHT_CONFIG[destacado.tipo];
        return (
          <div
            style={{
              borderLeft: `4px solid ${cfg.borderColor}`,
              background: cfg.bg,
              borderRadius: "0 8px 8px 0",
              padding: "14px 18px",
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: "1rem" }}>{cfg.icon}</span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: cfg.labelColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {cfg.label}
              </span>
            </div>
            <p style={{ fontSize: "0.88rem", color: cfg.textColor, lineHeight: 1.6, margin: 0 }}>
              {destacado.contenido}
            </p>
          </div>
        );
      })()}

      {/* Old: plain string highlight array */}
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

      {/* Additional contextual note */}
      {nota_adicional && (
        <div
          style={{
            background: "rgba(61,93,145,0.04)",
            border: "1px solid rgba(61,93,145,0.12)",
            borderRadius: 10,
            padding: "12px 16px",
            marginTop: 16,
            fontSize: "0.84rem",
            color: "#555",
            lineHeight: 1.6,
          }}
        >
          💡 {nota_adicional}
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
