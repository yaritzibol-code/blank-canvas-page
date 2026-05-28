import type { HighlightNoteBlockData, HighlightType } from "../types";

const CONFIG: Record<
  HighlightType,
  { icon: string; label: string; borderColor: string; bg: string; labelColor: string; textColor: string }
> = {
  definicion: {
    icon: "📘",
    label: "Definición oficial",
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
};

export function HighlightNoteBlock({ tipo, titulo, contenido, fuente }: HighlightNoteBlockData) {
  const cfg = CONFIG[tipo];

  return (
    <div
      style={{
        borderRadius: 12,
        padding: "18px 20px",
        marginBottom: 20,
        borderLeft: `4px solid ${cfg.borderColor}`,
        background: cfg.bg,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>{cfg.icon}</span>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: cfg.labelColor,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {titulo ?? cfg.label}
        </span>
      </div>

      <p
        style={{
          fontSize: "0.9rem",
          color: cfg.textColor,
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {contenido}
      </p>

      {fuente && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "#aaa",
            marginTop: 10,
            fontStyle: "italic",
          }}
        >
          Fuente: {fuente}
        </p>
      )}
    </div>
  );
}
