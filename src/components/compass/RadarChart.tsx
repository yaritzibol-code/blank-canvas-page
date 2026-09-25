/**
 * Radar de aptitudes: un eje por módulo con su score de perfil (mediana de
 * las últimas sesiones comparables). Los módulos sin datos se dibujan en el
 * anillo mínimo con etiqueta atenuada.
 */
import { useId } from "react";
import { COMPASS_MODULES } from "@/modules/compass/config";
import type { CompassModuleId } from "@/modules/compass/types";
import { CORAL, GOLD, HAZE, MONO, NAVY } from "./ui";

export function RadarChart({
  scores,
  size = 300,
}: {
  scores: Record<CompassModuleId, number | null>;
  size?: number;
}) {
  const uid = `cxr${useId().replace(/[^\w-]/g, "")}`;
  const c = size / 2;
  const R = size * 0.34;
  // Margen para que las etiquetas largas (MULTITAREA) no se corten.
  const padX = size * 0.13;
  const padY = size * 0.04;
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
      viewBox={`${-padX} ${-padY} ${size + padX * 2} ${size + padY * 2}`}
      role="img"
      aria-label="Radar de aptitudes por módulo"
      style={{ maxWidth: 440, display: "block", margin: "0 auto" }}
    >
      <defs>
        <radialGradient id={`${uid}-scope`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#143d70" stopOpacity={0.35} />
          <stop offset="1" stopColor="#143d70" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8FD3F4" stopOpacity={0} />
          <stop offset="1" stopColor="#8FD3F4" stopOpacity={0.22} />
        </linearGradient>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={GOLD} stopOpacity={0.34} />
          <stop offset="1" stopColor={GOLD} stopOpacity={0.1} />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Pantalla de radar con barrido */}
      <circle cx={c} cy={c} r={R * 1.08} fill={`url(#${uid}-scope)`} />
      <g className="cx-sweep">
        <circle cx={c} cy={c} r={R * 1.04} fill="none" stroke="none" />
        <path
          d={`M${c} ${c} L${c + R * 1.04} ${c} A${R * 1.04} ${R * 1.04} 0 0 0 ${
            c + Math.cos(-0.7) * R * 1.04
          } ${c + Math.sin(-0.7) * R * 1.04} Z`}
          fill={`url(#${uid}-sweep)`}
        />
      </g>
      {rings.map((r) => (
        <polygon
          key={r}
          points={COMPASS_MODULES.map((_, i) => {
            const { x, y } = pt(i, r);
            return `${x},${y}`;
          }).join(" ")}
          fill="none"
          stroke={r === 1 ? `var(--fd-faint, ${NAVY}33)` : `var(--fd-border, ${NAVY}14)`}
          strokeWidth={1}
        />
      ))}
      {COMPASS_MODULES.map((_, i) => {
        const { x, y } = pt(i, 1);
        return (
          <line
            key={i}
            x1={c}
            y1={c}
            x2={x}
            y2={y}
            stroke={`var(--fd-border, ${NAVY}14)`}
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={poly}
        fill={`url(#${uid}-area)`}
        stroke={`var(--fd-gold, ${CORAL})`}
        strokeWidth={2}
        strokeLinejoin="round"
        filter={`url(#${uid}-glow)`}
      />
      {COMPASS_MODULES.map((m, i) => {
        const v = scores[m.id];
        if (v === null) return null;
        const { x, y } = pt(i, Math.max(0.08, v / 100));
        return (
          <circle key={m.id} cx={x} cy={y} r={3.8} fill={GOLD} stroke="white" strokeWidth={1.5} />
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
            fill={v === null ? `var(--fd-faint, ${HAZE}88)` : `var(--fd-text, ${NAVY})`}
            style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            {m.nombre}
            <tspan
              x={x}
              dy={12}
              fontSize={10}
              fill={v === null ? `var(--fd-faint, ${HAZE}66)` : `var(--fd-gold, ${CORAL})`}
            >
              {v === null ? "—" : v}
            </tspan>
          </text>
        );
      })}
      <circle cx={c} cy={c} r={2.6} fill={GOLD} stroke={NAVY} strokeWidth={1} />
    </svg>
  );
}
