/**
 * Nube flotante de Pathy: vive mientras dure la sesión, en cualquier ruta del
 * dashboard. Muestra el tiempo restante y, al tocarla, el panel con la
 * actividad actual, la siguiente y el botón para terminar.
 */
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { PathyMark } from "@/components/shared/PathyMark";
import { useStudySession } from "@/contexts/StudySessionContext";

function mmss(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function PathyCloud() {
  const { session, current, next, remainingMs, elapsedMin, totalMin, completeCurrent, end } =
    useStudySession();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const navigate = useNavigate();

  if (!session) return null;
  const enBreak = current?.kind === "break";

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 3000, fontFamily: "'Manrope', sans-serif" }}>
      {open && (
        <div
          style={{
            width: 288, background: "white", borderRadius: 18, padding: 16, marginBottom: 10,
            boxShadow: "0 18px 40px rgba(34,55,92,.22)", border: "1.5px solid #F2DCDB",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <strong style={{ color: "#22375C", fontSize: "0.9rem" }}>
              {enBreak ? "Break" : "Sesión con Pathy"}
            </strong>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#647DA0" }}>
              <Icon n="close" size={16} />
            </button>
          </div>

          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#3D5D91", lineHeight: 1 }}>{mmss(remainingMs)}</div>
          <div style={{ fontSize: "0.78rem", color: "#647DA0", marginBottom: 12 }}>
            {elapsedMin} / {totalMin} min
          </div>

          {current && (
            <div style={{ background: "rgba(61,93,145,.06)", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".05em" }}>
                Ahora
              </div>
              <div style={{ fontWeight: 700, color: "#22375C", fontSize: "0.86rem" }}>{current.titulo}</div>
            </div>
          )}
          {next && (
            <div style={{ fontSize: "0.78rem", color: "#647DA0", marginBottom: 12 }}>
              Sigue: <strong style={{ color: "#22375C" }}>{next.titulo}</strong>
            </div>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            <button
              onClick={completeCurrent}
              style={{
                minHeight: 42, borderRadius: 10, border: "none", background: "#3D5D91", color: "white",
                fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
              }}
            >
              {enBreak ? "Terminé el break" : "Marcar como hecha"}
            </button>
            <button
              onClick={() => navigate({ to: "/dashboard/estudiemos" })}
              style={{
                minHeight: 42, borderRadius: 10, border: "1.5px solid #F2DCDB", background: "white",
                color: "#3D5D91", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
              }}
            >
              Ver mi sesión
            </button>
            {confirm ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { end(); setOpen(false); setConfirm(false); navigate({ to: "/dashboard/estudiemos" }); }}
                  style={{ flex: 1, minHeight: 42, borderRadius: 10, border: "none", background: "#6C0820", color: "white", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                >
                  Sí, terminar
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  style={{ flex: 1, minHeight: 42, borderRadius: 10, border: "1.5px solid #F2DCDB", background: "white", color: "#647DA0", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                >
                  Seguir
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(true)}
                style={{ minHeight: 42, borderRadius: 10, border: "none", background: "transparent", color: "#6C0820", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                Terminar sesión
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Sesión con Pathy"
        style={{
          display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 16px 10px 10px",
          borderRadius: 999, border: "none", cursor: "pointer",
          background: enBreak ? "#FDF3D6" : "white",
          boxShadow: "0 12px 28px rgba(34,55,92,.22)", fontFamily: "'Manrope', sans-serif",
        }}
      >
        <PathyMark size={30} float />
        <span style={{ fontWeight: 800, color: enBreak ? "#856404" : "#22375C", fontSize: "0.84rem" }}>
          {enBreak ? `Break · ${mmss(remainingMs)}` : `quedan ${mmss(remainingMs)}`}
        </span>
      </button>
    </div>
  );
}
