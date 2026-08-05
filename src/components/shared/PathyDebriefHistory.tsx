/**
 * "Lectura de Pathy" en /dashboard/analisis: el último informe guardado tras
 * una sesión, más el historial para ver si el punto débil se repite.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PathyMark } from "@/components/shared/PathyMark";
import type { PathyReportEntry } from "@/lib/store";

function fecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Puntos({ r }: { r: PathyReportEntry }) {
  if (r.puntos.length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      {r.puntos.map((p) => (
        <div
          key={`${p.tipo}-${p.label}`}
          style={{
            display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,.7)",
            marginBottom: 6, fontSize: ".82rem", color: "#22375C", minHeight: 44,
          }}
        >
          <span>
            {p.label}
            {p.muestraCorta && <span style={{ color: "#8a6d3b", fontSize: ".72rem" }}> · muestra corta</span>}
          </span>
          <strong style={{ color: p.pct < 60 ? "#c0392b" : p.pct < 80 ? "#b9770e" : "#1a7a4a", whiteSpace: "nowrap" }}>
            {p.pct}% ({p.correct}/{p.total})
          </strong>
        </div>
      ))}
    </div>
  );
}

export function PathyDebriefHistory({ reports }: { reports: PathyReportEntry[] }) {
  const [open, setOpen] = useState(false);
  if (reports.length === 0) return null;
  const last = reports[0];
  const rest = reports.slice(1, 8);

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#F2DCDB,#fce4ec)",
        borderRadius: 16, padding: "18px 20px", marginBottom: 14,
        fontSize: ".88rem", color: "#4a4a4a", lineHeight: 1.65,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
        <PathyMark size={30} />
        <div style={{ flex: 1 }}>
          <strong style={{ color: "#6C0820" }}>Lectura de Pathy</strong>
          <div style={{ fontSize: ".75rem", color: "#8a6a70" }}>
            {last.titulo} · {fecha(last.date)} · {last.scorePct}% ({last.wrong} errores)
          </div>
        </div>
      </div>

      {last.diagnostico ? (
        <>
          <p style={{ margin: "0 0 8px" }}>{last.diagnostico}</p>
          {last.confusiones.length > 0 && (
            <ul style={{ margin: "0 0 8px", paddingLeft: 18 }}>
              {last.confusiones.map((c) => <li key={c} style={{ marginBottom: 4 }}>{c}</li>)}
            </ul>
          )}
          {last.acciones.length > 0 && (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {last.acciones.map((a) => <li key={a} style={{ marginBottom: 4 }}>{a}</li>)}
            </ol>
          )}
        </>
      ) : last.motivo === "sin_errores" ? (
        <p style={{ margin: 0 }}>Tu última sesión salió perfecta. Sube la dificultad para seguir avanzando.</p>
      ) : (
        <p style={{ margin: 0, color: "#7a6a70" }}>
          Aquí está tu marcador real de la última sesión.{" "}
          {last.motivo === "sin_pro" && (
            <Link to="/precios" style={{ color: "#6C0820", fontWeight: 700 }}>Desbloquea el análisis con IA</Link>
          )}
        </p>
      )}

      <Puntos r={last} />

      {rest.length > 0 && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              marginTop: 10, background: "transparent", border: "none", cursor: "pointer",
              color: "#6C0820", fontWeight: 700, fontSize: ".8rem", padding: "10px 0",
              fontFamily: "'Manrope', sans-serif", minHeight: 44,
            }}
            aria-expanded={open}
          >
            {open ? "Ocultar sesiones anteriores" : `Ver ${rest.length} sesiones anteriores`}
          </button>
          {open &&
            rest.map((r) => (
              <div key={r.id} style={{ borderTop: "1px solid rgba(108,8,32,.12)", paddingTop: 10, marginTop: 6 }}>
                <div style={{ fontSize: ".75rem", color: "#8a6a70", marginBottom: 4 }}>
                  {r.titulo} · {fecha(r.date)} · {r.scorePct}%
                </div>
                {r.diagnostico && <p style={{ margin: 0 }}>{r.diagnostico}</p>}
                <Puntos r={r} />
              </div>
            ))}
        </>
      )}
    </div>
  );
}
