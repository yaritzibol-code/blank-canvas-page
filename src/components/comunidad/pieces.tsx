/**
 * Piezas de presentación de Comunidad.
 *
 * Aquí no hay lógica de FlightPoints: los valores y posiciones llegan ya
 * calculados desde el servidor. Este archivo sólo decide cómo se ven.
 */
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { fpFormat, type FpRankingRow } from "@/lib/fp/shared";

export const CARD: CSSProperties = {
  background: "white",
  border: "1px solid rgba(61,93,145,.12)",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 10px 28px rgba(15,30,60,.07)",
};

/** Tono suave derivado del acento del ranking. */
export function tinte(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function Fila({
  r,
  unidad,
  acento,
  destacar,
}: {
  r: FpRankingRow;
  unidad: string;
  acento: string;
  destacar?: boolean;
}) {
  const podio = r.posicion <= 3 && destacar;
  const primero = r.posicion === 1 && destacar;
  const anillo = ["#C9A227", "#8E9AA8", "#B07A4B"][r.posicion - 1];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: primero ? "14px 14px" : podio ? "12px 14px" : "10px 14px",
        borderRadius: 14,
        background: r.esYo
          ? tinte(acento, 0.12)
          : primero
            ? "linear-gradient(120deg, rgba(201,162,39,.12), rgba(255,255,255,0))"
            : podio
              ? "rgba(15,30,60,.03)"
              : "transparent",
        border: r.esYo
          ? `1px solid ${tinte(acento, 0.4)}`
          : primero
            ? "1px solid rgba(201,162,39,.32)"
            : "1px solid transparent",
      }}
    >
      <span
        style={{
          width: primero ? 36 : 30,
          height: primero ? 36 : 30,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: podio ? tinte(anillo ?? acento, 0.16) : "rgba(61,93,145,.09)",
          border: podio ? `1.5px solid ${anillo}` : "1.5px solid transparent",
          color: podio ? (anillo ?? acento) : "#3D5D91",
          fontWeight: 800,
          fontSize: primero ? ".95rem" : ".8rem",
          flexShrink: 0,
        }}
      >
        {r.posicion}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontWeight: r.esYo || primero ? 800 : 600,
          fontSize: primero ? "1rem" : ".92rem",
          color: "#22375C",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {r.display}
      </span>
      <span style={{ fontWeight: 800, color: acento, fontSize: primero ? "1rem" : ".92rem", whiteSpace: "nowrap" }}>
        {fpFormat(r.valor)} <small style={{ opacity: 0.6, fontWeight: 600 }}>{unidad}</small>
      </span>
    </div>
  );
}

export function TarjetaRanking({
  label,
  ayuda,
  icono,
  acento,
  activo,
  onClick,
}: {
  label: string;
  ayuda: string;
  icono: string;
  acento: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      style={{
        textAlign: "left",
        cursor: "pointer",
        borderRadius: 14,
        padding: "12px 14px",
        display: "grid",
        gap: 4,
        background: activo ? tinte(acento, 0.1) : "white",
        border: activo ? `1.5px solid ${acento}` : "1px solid rgba(61,93,145,.14)",
        boxShadow: activo ? `0 8px 20px ${tinte(acento, 0.18)}` : "0 3px 10px rgba(15,30,60,.05)",
        transition: "transform .15s ease, box-shadow .15s ease",
        transform: activo ? "translateY(-1px)" : "none",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon n={icono as never} size={17} color={acento} />
        <span style={{ fontWeight: 800, fontSize: ".86rem", color: activo ? acento : "#22375C" }}>{label}</span>
      </span>
      <span style={{ fontSize: ".72rem", color: "#6b7a90", lineHeight: 1.35 }}>{ayuda}</span>
    </button>
  );
}
