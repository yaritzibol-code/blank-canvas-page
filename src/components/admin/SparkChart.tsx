/**
 * Gráfico de línea/área SVG minimalista, sin dependencias.
 * Ideal para series diarias cortas del panel admin.
 */
import { useMemo, useState } from "react";

export interface SparkPoint { label: string; value: number }

export function SparkChart({
  points,
  height = 140,
  color = "#3D5D91",
  fill = "rgba(61,93,145,0.14)",
  formatValue = (n: number) => n.toLocaleString("es-MX"),
  formatLabel = (l: string) => l,
}: {
  points: SparkPoint[];
  height?: number;
  color?: string;
  fill?: string;
  formatValue?: (n: number) => string;
  formatLabel?: (l: string) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const { path, area, max, min, coords } = useMemo(() => {
    if (points.length === 0) return { path: "", area: "", max: 0, min: 0, coords: [] as Array<{ x: number; y: number }> };
    const values = points.map((p) => p.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const w = 100;
    const h = 100;
    const range = max - min || 1;
    const coords = points.map((p, i) => ({
      x: points.length === 1 ? w / 2 : (i / (points.length - 1)) * w,
      y: h - ((p.value - min) / range) * h,
    }));
    const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ");
    const area = `${path} L${coords[coords.length - 1].x.toFixed(2)},100 L${coords[0].x.toFixed(2)},100 Z`;
    return { path, area, max, min, coords };
  }, [points]);

  if (points.length === 0) {
    return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#647DA0", fontSize: ".85rem" }}>Sin datos suficientes</div>;
  }

  return (
    <div style={{ position: "relative", height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block" }}>
        <path d={area} fill={fill} />
        <path d={path} fill="none" stroke={color} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={hover === i ? 1.6 : 0.9}
            fill={color}
            vectorEffect="non-scaling-stroke"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: ".68rem", color: "#647DA0" }}>
        <span>max {formatValue(max)}</span>
        <span>min {formatValue(min)}</span>
      </div>
      {hover !== null && (
        <div style={{
          position: "absolute", bottom: 4, left: `${(hover / Math.max(1, points.length - 1)) * 100}%`,
          transform: "translateX(-50%)", background: "#22375C", color: "white",
          padding: "3px 8px", borderRadius: 6, fontSize: ".72rem", whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          {formatLabel(points[hover].label)}: <strong>{formatValue(points[hover].value)}</strong>
        </div>
      )}
    </div>
  );
}
