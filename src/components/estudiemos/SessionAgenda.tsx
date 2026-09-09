/** Agenda simple de la sesión: recurso real, icono y tiempo aproximado. */
import { Icon } from "@/components/ui/fp-icon";
import type { PlanActivity } from "@/lib/estudiemos/types";

export function SessionAgenda({
  activities,
  currentIndex,
  completedIds,
  onOpen,
}: {
  activities: PlanActivity[];
  currentIndex: number;
  completedIds: string[];
  onOpen: (index: number) => void;
}) {
  return (
    <div>
      <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
        Tu sesión de hoy
      </p>

      {activities.map((a, i) => {
        const hecha = completedIds.includes(a.id);
        const actual = i === currentIndex;
        const esBreak = a.kind === "break";
        return (
          <div
            key={a.id}
            style={{
              background: esBreak ? "rgba(61,93,145,.05)" : "white",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 10,
              border: actual ? "2px solid #3D5D91" : "1.5px solid #F2DCDB",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: hecha ? 0.6 : 1,
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <span
              style={{
                width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                background: actual ? "linear-gradient(135deg,#3D5D91,#5A86CB)" : "rgba(61,93,145,.1)",
                color: actual ? "white" : "#22375C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon n={hecha ? "check" : a.icon} size={18} color={actual ? "#fff" : "currentColor"} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: "#22375C", fontSize: "0.9rem" }}>
                {a.titulo}
                {actual && (
                  <span style={{ marginLeft: 8, fontSize: "0.62rem", fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", background: "#FDF3D6", color: "#856404", borderRadius: 20, padding: "2px 8px" }}>
                    Ahora
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#647DA0" }}>
                {a.detalle} · ~{a.minutes} min
              </div>
            </div>
            {!hecha && (
              <button
                onClick={() => onOpen(i)}
                style={{
                  flexShrink: 0, minHeight: 40, padding: "8px 14px", borderRadius: 10,
                  border: actual ? "none" : "1.5px solid #3D5D91",
                  background: actual ? "#22375C" : "white",
                  color: actual ? "white" : "#3D5D91",
                  fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
                }}
              >
                {esBreak ? "Tomar break" : actual ? "Empezar →" : "Abrir"}
              </button>
            )}
          </div>
        );
      })}

      <p style={{ fontSize: "0.76rem", color: "#647DA0", marginTop: 6 }}>
        Los tiempos son aproximados. Estudia a tu ritmo.
      </p>
    </div>
  );
}
