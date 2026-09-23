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
      <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--fd-muted, #4A5872)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
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
              background: esBreak ? "rgba(22,61,112,.05)" : "var(--fd-panel, white)",
              borderRadius: "var(--fd-radius, 14px)",
              padding: "14px 16px",
              marginBottom: 10,
              border: actual ? "2px solid #163D70" : "1.5px solid #EEE1C5",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: hecha ? 0.6 : 1,
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <span
              style={{
                width: 36, height: 36, borderRadius: "var(--fd-radius, 12px)", flexShrink: 0,
                background: actual ? "linear-gradient(135deg,#163D70,#5A86CB)" : "rgba(22,61,112,.1)",
                color: actual ? "white" : "var(--fd-text, #081A35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon n={hecha ? "check" : a.icon} size={18} color={actual ? "#fff" : "currentColor"} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: "var(--fd-text, #081A35)", fontSize: "0.9rem" }}>
                {a.titulo}
                {actual && (
                  <span style={{ marginLeft: 8, fontSize: "0.62rem", fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", background: "#FDF3D6", color: "#856404", borderRadius: "var(--fd-radius, 20px)", padding: "2px 8px" }}>
                    Ahora
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--fd-muted, #4A5872)" }}>
                {a.detalle} · ~{a.minutes} min
              </div>
            </div>
            {!hecha && (
              <button
                onClick={() => onOpen(i)}
                style={{
                  flexShrink: 0, minHeight: 40, padding: "8px 14px", borderRadius: "var(--fd-radius, 10px)",
                  border: actual ? "none" : "1.5px solid #163D70",
                  background: actual ? "#081A35" : "var(--fd-panel, white)",
                  color: actual ? "white" : "var(--fd-text, #163D70)",
                  fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
                }}
              >
                {esBreak ? "Tomar break" : actual ? "Empezar →" : "Abrir"}
              </button>
            )}
          </div>
        );
      })}

      <p style={{ fontSize: "0.76rem", color: "var(--fd-muted, #4A5872)", marginTop: 6 }}>
        Los tiempos son aproximados. Estudia a tu ritmo.
      </p>
    </div>
  );
}
