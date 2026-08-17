/**
 * Radar de aptitudes: un eje por módulo con su score de perfil (mediana de
 * las últimas sesiones comparables). Los módulos sin datos se dibujan en el
 * anillo mínimo con etiqueta atenuada.
 */
import { COMPASS_MODULES } from "@/modules/compass/config";
import type { CompassModuleId } from "@/modules/compass/types";
import { CORAL, HAZE, MONO, NAVY, SALMON } from "./ui";

export function RadarChart({
  scores,
  size = 300,
}: {
  scores: Record<CompassModuleId, number | null>;
  size?: number;
}) {
  const c = size / 2;
  const R = size * 0.34;
  const n = COMPASS_MODULES.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, frac: number) => ({
    x: c + Math.cos(angle(i)) * R * frac,
    y: c + Math.sin(angle(i)) * R * frac,
  });

  const rings = [0.25, 0.5, 0.75, 1];
  const poly = COMPASS_MODULES.map((m, i) => {
    const v = scores[m.id];
    const frac = v === null ? 0.08 : Math.max(0.08, v / 100);
    const { x, y } = pt(i, frac);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Radar de aptitudes por módulo"
    >
      {rings.map((r) => (
        <polygon
          key={r}
          points={COMPASS_MODULES.map((_, i) => {
            const { x, y } = pt(i, r);
            return `${x},${y}`;
          }).join(" ")}
          fill="none"
          stroke={r === 1 ? `${NAVY}33` : `${NAVY}14`}
          strokeWidth={1}
        />
      ))}
      {COMPASS_MODULES.map((_, i) => {
        const { x, y } = pt(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke={`${NAVY}14`} strokeWidth={1} />;
      })}
      <polygon
        points={poly}
        fill={`${CORAL}22`}
        stroke={CORAL}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {COMPASS_MODULES.map((m, i) => {
        const v = scores[m.id];
        if (v === null) return null;
        const { x, y } = pt(i, Math.max(0.08, v / 100));
        return (
          <circle key={m.id} cx={x} cy={y} r={3.5} fill={CORAL} stroke="white" strokeWidth={1.5} />
        );
      })}
      {COMPASS_MODULES.map((m, i) => {
        const v = scores[m.id];
        const { x, y } = pt(i, 1.22);
        return (
          <text
            key={m.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={MONO}
            fontSize={10.5}
            fontWeight={700}
            fill={v === null ? `${HAZE}88` : NAVY}
            style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            {m.nombre}
            <tspan x={x} dy={12} fontSize={10} fill={v === null ? `${HAZE}66` : CORAL}>
              {v === null ? "—" : v}
            </tspan>
          </text>
        );
      })}
      <circle cx={c} cy={c} r={2.4} fill={SALMON} stroke={NAVY} strokeWidth={1} />
    </svg>
  );
}
