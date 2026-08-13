/**
 * Bitácora del Pilot Aptitude Trainer para los perfiles (estudiante y admin).
 *
 * Muestra el perfil de aptitudes (radar + score por módulo con tendencia) y el
 * log de sesiones guardadas en `compass_sessions`. Es de solo lectura: los
 * datos nacen en /dashboard/compass vía `saveCompassSession`.
 */
import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { RadarChart } from "./RadarChart";
import { COMPASS_MODULE_MAP, COMPASS_MODULES } from "@/modules/compass/config";
import type { CompassMode } from "@/modules/compass/types";
import {
  compassModuleStats,
  compassProfile,
  getCompassSessions,
  useStore,
  type CompassSessionRecord,
} from "@/lib/store";

const LOG_PAGE = 8;

const MODE_LABEL: Record<CompassMode, string> = {
  practica: "Práctica",
  examen: "Examen",
  simulacro: "Simulacro",
};

const MODE_STYLE: Record<CompassMode, { bg: string; color: string }> = {
  practica: { bg: "rgba(61,93,145,.09)", color: "#3D5D91" },
  examen: { bg: "rgba(108,8,32,.09)", color: "#6C0820" },
  simulacro: { bg: "rgba(243,156,18,.12)", color: "#8a6000" },
};

const scoreColor = (s: number) => (s >= 75 ? "#2ecc71" : s >= 50 ? "#f39c12" : "#e74c3c");

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" }) +
  " · " +
  new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

const fmtDur = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
};

/**
 * Card completa de aptitudes para un perfil. `verHub` agrega el CTA que lleva
 * al módulo (solo tiene sentido en el dashboard del propio estudiante).
 */
export function CompassLogCard({
  userId,
  verHub = false,
  style,
}: {
  userId: string;
  verHub?: boolean;
  style?: CSSProperties;
}) {
  const perfil = useStore(() => compassProfile(userId));
  const stats = useStore(() => COMPASS_MODULES.map((m) => compassModuleStats(userId, m.id)));
  const sesiones = useStore(() => getCompassSessions(userId));
  const [verTodas, setVerTodas] = useState(false);

  const visibles = verTodas ? sesiones.slice(0, 40) : sesiones.slice(0, LOG_PAGE);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 2px 10px rgba(61,93,145,.06)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontSize: ".78rem",
            fontWeight: 700,
            color: "#647DA0",
            textTransform: "uppercase",
            letterSpacing: ".5px",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Icon n="compass" size={15} /> Aptitudes — Pilot Aptitude Trainer
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={pillStyle}>
            {perfil.sesionesTotales} {perfil.sesionesTotales === 1 ? "sesión" : "sesiones"}
          </span>
          <span style={pillStyle}>{perfil.minutosTotales} min entrenados</span>
          {verHub && (
            <a
              href="/dashboard/compass"
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: ".72rem",
                fontWeight: 700,
                background: "#3D5D91",
                color: "white",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              Abrir módulo <Icon n="arrow" size={12} />
            </a>
          )}
        </div>
      </div>

      {perfil.sesionesTotales === 0 ? (
        <p style={{ fontSize: ".82rem", color: "#8DA1BE", marginTop: 10, lineHeight: 1.55 }}>
          Sin sesiones del Pilot Aptitude Trainer todavía. Cada práctica, examen o simulacro queda
          registrado aquí con su score, nivel y duración.
        </p>
      ) : (
        <>
          {/* Radar + score por módulo */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <div style={{ maxWidth: 260, margin: "0 auto", width: "100%" }}>
              <RadarChart scores={perfil.porModulo} size={260} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {stats.map((s) => {
                const def = COMPASS_MODULE_MAP[s.moduleId];
                const score = perfil.porModulo[s.moduleId];
                return (
                  <div key={s.moduleId} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span
                      style={{
                        fontSize: ".78rem",
                        color: "#22375C",
                        width: 108,
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Icon n={def.icon} size={14} color="#647DA0" /> {def.nombre}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 7,
                        background: "#F2DCDB",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 10,
                          background: score === null ? "#C9D6E8" : scoreColor(score),
                          width: `${score ?? 0}%`,
                          transition: "width .6s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: ".74rem",
                        fontWeight: 700,
                        width: 30,
                        textAlign: "right",
                        flexShrink: 0,
                        color: score === null ? "#8DA1BE" : scoreColor(score),
                      }}
                    >
                      {score === null ? "—" : score}
                    </span>
                    <span
                      title={
                        s.tendencia === null
                          ? "Tendencia: se calcula a partir de 3 sesiones comparables"
                          : `Último score vs mediana de las 3 previas: ${s.tendencia > 0 ? "+" : ""}${s.tendencia}`
                      }
                      style={{
                        fontSize: ".7rem",
                        fontWeight: 700,
                        width: 34,
                        flexShrink: 0,
                        color:
                          s.tendencia === null
                            ? "#C9D6E8"
                            : s.tendencia >= 0
                              ? "#2ecc71"
                              : "#e74c3c",
                      }}
                    >
                      {s.tendencia === null ? "·" : `${s.tendencia > 0 ? "+" : ""}${s.tendencia}`}
                    </span>
                  </div>
                );
              })}
              {perfil.debil && (
                <div style={{ fontSize: ".74rem", color: "#647DA0", marginTop: 2 }}>
                  Punto débil actual:{" "}
                  <strong style={{ color: "#6C0820" }}>
                    {COMPASS_MODULE_MAP[perfil.debil].nombre}
                  </strong>{" "}
                  — nivel sugerido{" "}
                  {stats.find((s) => s.moduleId === perfil.debil)?.nivelSugerido ?? 1}.
                </div>
              )}
            </div>
          </div>

          {/* Log de sesiones */}
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: ".7rem",
                fontWeight: 800,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "#8DA1BE",
                marginBottom: 8,
              }}
            >
              Bitácora de sesiones
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                <thead>
                  <tr>
                    {["Fecha", "Módulo", "Modo", "Nivel", "Score", "Duración"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "6px 8px",
                          fontSize: ".64rem",
                          fontWeight: 700,
                          color: "#8DA1BE",
                          textTransform: "uppercase",
                          letterSpacing: ".5px",
                          textAlign: h === "Score" || h === "Duración" ? "right" : "left",
                          borderBottom: "1px solid rgba(61,93,145,.1)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((s) => (
                    <SessionRow key={s.id} s={s} />
                  ))}
                </tbody>
              </table>
            </div>
            {sesiones.length > LOG_PAGE && (
              <button
                onClick={() => setVerTodas((v) => !v)}
                style={{
                  marginTop: 10,
                  padding: "7px 14px",
                  background: "white",
                  color: "#3D5D91",
                  border: "2px solid #F2DCDB",
                  borderRadius: 8,
                  fontSize: ".74rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                {verTodas
                  ? "Ver menos"
                  : `Ver más sesiones (${Math.min(sesiones.length, 40) - LOG_PAGE})`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const pillStyle: CSSProperties = {
  padding: "5px 12px",
  borderRadius: 20,
  fontSize: ".72rem",
  fontWeight: 700,
  background: "rgba(61,93,145,.07)",
  color: "#3D5D91",
};

function SessionRow({ s }: { s: CompassSessionRecord }) {
  const def = COMPASS_MODULE_MAP[s.moduleId];
  const mode = MODE_STYLE[s.mode];
  const td: CSSProperties = {
    padding: "8px 8px",
    fontSize: ".78rem",
    color: "#22375C",
    borderBottom: "1px solid rgba(61,93,145,.05)",
    whiteSpace: "nowrap",
  };
  return (
    <tr>
      <td style={{ ...td, color: "#647DA0", fontSize: ".72rem" }}>{fmtFecha(s.date)}</td>
      <td style={td}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <Icon n={def.icon} size={14} color="#647DA0" /> {def.nombre}
        </span>
      </td>
      <td style={td}>
        <span
          style={{
            padding: "2px 9px",
            borderRadius: 20,
            fontSize: ".68rem",
            fontWeight: 700,
            background: mode.bg,
            color: mode.color,
          }}
        >
          {MODE_LABEL[s.mode]}
        </span>
      </td>
      <td style={td}>N{s.level}</td>
      <td style={{ ...td, textAlign: "right" }}>
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 900,
            color: scoreColor(s.score),
          }}
        >
          {s.score}
        </span>
      </td>
      <td style={{ ...td, textAlign: "right", color: "#647DA0", fontSize: ".74rem" }}>
        {fmtDur(s.durationSec)}
      </td>
    </tr>
  );
}
