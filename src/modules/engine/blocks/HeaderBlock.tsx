import type { HeaderBlockData } from "../types";

export function HeaderBlock({
  title,
  subtitle,
  materia,
  bloque,
  tema,
  duracion_min,
  progreso,
}: HeaderBlockData) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #3D5D91, #5A86CB)",
        borderRadius: 16,
        padding: 28,
        color: "white",
        marginBottom: 20,
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          fontSize: "0.75rem",
          opacity: 0.8,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <span>{materia}</span>
        <span style={{ opacity: 0.5 }}>›</span>
        <span>Bloque {bloque}</span>
        <span style={{ opacity: 0.5 }}>›</span>
        <span>Tema {tema}</span>
      </div>

      <h1
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: 8,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h1>

      <p style={{ fontSize: "0.9rem", opacity: 0.85, marginBottom: 20, lineHeight: 1.5 }}>
        {subtitle}
      </p>

      {/* Meta chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: "0.78rem",
            fontWeight: 600,
          }}
        >
          ⏱ {duracion_min} min
        </span>
        <span
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: "0.78rem",
            fontWeight: 600,
          }}
        >
          📖 Bloque {bloque} · Tema {tema}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            opacity: 0.8,
            marginBottom: 6,
          }}
        >
          <span>Progreso en {materia}</span>
          <span style={{ fontWeight: 700 }}>{progreso}%</span>
        </div>
        <div
          style={{
            height: 6,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.max(0, Math.min(100, progreso))}%`,
              background: "white",
              borderRadius: 10,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
