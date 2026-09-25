/**
 * Controles del panel admin para las transmisiones: chips de opción, el punto
 * de color de cada tipo y el selector de cuánto tiempo aparece.
 */
import type { CSSProperties, ReactNode } from "react";
import { inputStyle } from "@/components/admin/AdminShell";
import { ahoraLocalInput, DURACIONES, type DuracionId } from "./opciones";

/** Botón tipo chip con estado (aria-pressed). */
export function Chip({
  activo,
  onClick,
  color = "#C7A052",
  children,
  disabled,
  style,
}: {
  activo: boolean;
  onClick: () => void;
  color?: string;
  children: ReactNode;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        minHeight: 38,
        padding: "7px 14px",
        borderRadius: 999,
        border: `1.5px solid ${activo ? color : "rgba(199,160,82,.24)"}`,
        background: activo ? `${color}22` : "#0A1B33",
        color: activo ? "#FFFFFF" : "#B8C5DA",
        fontFamily: "'Manrope', sans-serif",
        fontSize: ".8rem",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all .15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Punto({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        flexShrink: 0,
      }}
    />
  );
}

/** Selector de cuánto tiempo aparece la transmisión. */
export function DuracionPicker({
  valor,
  fecha,
  onValor,
  onFecha,
  compacto = false,
}: {
  valor: DuracionId;
  fecha: string;
  onValor: (v: DuracionId) => void;
  onFecha: (f: string) => void;
  compacto?: boolean;
}) {
  const opciones = compacto ? DURACIONES.filter((d) => d.id !== "1m") : DURACIONES;
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opciones.map((d) => (
          <Chip key={d.id} activo={valor === d.id} onClick={() => onValor(d.id)}>
            {d.label}
          </Chip>
        ))}
      </div>
      {valor === "fecha" && (
        <input
          type="datetime-local"
          aria-label="Aparece hasta"
          value={fecha}
          min={ahoraLocalInput()}
          onChange={(e) => onFecha(e.target.value)}
          style={{ ...inputStyle, marginTop: 10, maxWidth: 260 }}
        />
      )}
    </div>
  );
}
