import { Icon } from "@/components/ui/fp-icon";
import { liveLabel, type LiveDataState } from "@/hooks/use-live-data";

/**
 * Chip de "datos en vivo": dice cuándo se leyó la nube por última vez y
 * permite forzar una lectura. No se pinta en modo local, donde el store ya
 * notifica cada escritura en el momento.
 */
export function LiveIndicator({ state, compact = false }: { state: LiveDataState; compact?: boolean }) {
  if (!state.enabled) return null;
  return (
    <button
      onClick={state.refresh}
      title="Actualizar datos"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: compact ? "5px 9px" : "6px 11px",
        borderRadius: 20,
        cursor: "pointer",
        border: "1px solid #E8EEF6",
        background: "white",
        fontSize: compact ? ".68rem" : ".72rem",
        fontWeight: 700,
        color: "#647DA0",
        fontFamily: "'Manrope', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          flexShrink: 0,
          background: state.busy ? "#f39c12" : "#2ecc71",
        }}
      />
      {liveLabel(state)}
      <Icon n="refresh" size={12} />
    </button>
  );
}
