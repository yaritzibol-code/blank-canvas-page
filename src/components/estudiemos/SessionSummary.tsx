/** Resumen de lo que la alumna realmente completó en la sesión. */
import { Icon } from "@/components/ui/fp-icon";
import { PathyMark } from "@/components/shared/PathyMark";
import type { StudySessionState } from "@/lib/estudiemos/types";

export function SessionSummary({
  session,
  minutos,
  onNueva,
}: {
  session: StudySessionState;
  minutos: number;
  onNueva: () => void;
}) {
  const hechas = session.activities.filter(
    (a) => a.kind !== "break" && session.completedIds.includes(a.id),
  );
  const pendientes = session.activities.filter(
    (a) => a.kind !== "break" && !session.completedIds.includes(a.id),
  );

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: "22px 20px",
        boxShadow: "0 2px 16px rgba(61,93,145,0.08)",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <PathyMark size={40} float />
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.15rem", color: "#22375C", margin: 0 }}>
            Cerramos la sesión
          </h2>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#647DA0" }}>
            Estudiaste {minutos} min y completaste {hechas.length} de{" "}
            {hechas.length + pendientes.length} actividades.
          </p>
        </div>
      </div>

      {hechas.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
            Lo que completaste
          </p>
          {hechas.map((a) => (
            <div key={a.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: "0.86rem", color: "#22375C" }}>
              <Icon n="checkCircle" size={16} color="#1a7a4a" /> {a.titulo}
            </div>
          ))}
        </div>
      )}

      {pendientes.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
            Lo que conviene reforzar
          </p>
          {pendientes.map((a) => (
            <div key={a.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: "0.86rem", color: "#647DA0" }}>
              <Icon n="target" size={16} /> {a.titulo}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onNueva}
        style={{
          width: "100%", minHeight: 48, borderRadius: 12, border: "none", background: "#22375C",
          color: "white", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
        }}
      >
        Armar otra sesión
      </button>
    </div>
  );
}
