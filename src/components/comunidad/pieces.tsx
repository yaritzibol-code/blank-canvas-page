/**
 * Piezas de presentación de Comunidad.
 *
 * Aquí no hay lógica de FlightPoints: los valores y posiciones llegan ya
 * calculados desde el servidor. Este archivo sólo decide cómo se ven: podio,
 * filas, HUD, avatares e insignias, control de periodo y anillos de progreso.
 * Los estilos con animación viven en styles.css bajo el prefijo `.cm-`.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { insigniaCallsign, partesCallsign } from "@/lib/fp/callsign";
import {
  FP_PERIODOS,
  FP_RANKINGS,
  fpFormat,
  type FpPeriodo,
  type FpRankingId,
  type FpRankingRow,
} from "@/lib/fp/shared";

/* ───────────────────────── Utilidades ───────────────────────── */

export function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Cuenta de 0 al valor con easing; respeta prefers-reduced-motion. */
export function useCountUp(value: number, duration = 900, delay = 0): number {
  const [shown, setShown] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (reducedMotion()) {
      setShown(value);
      prev.current = value;
      return;
    }
    const from = prev.current;
    let raf = 0;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, Math.max(0, (t - t0 - delay) / duration));
      const e = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (value - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);
  return shown;
}

export function Numero({
  valor,
  className,
  style,
}: {
  valor: number;
  className?: string;
  style?: CSSProperties;
}) {
  const n = useCountUp(valor);
  return (
    <span className={className} style={style}>
      {fpFormat(n)}
    </span>
  );
}

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "FP";
}

export function rankingDe(id: FpRankingId) {
  return FP_RANKINGS.find((r) => r.id === id) ?? FP_RANKINGS[0]!;
}

/* ───────────────────────── Avatar e insignia ───────────────────────── */

/** Insignia del indicativo: gradiente estable + glifo (nube, aeronave o estrella). */
export function Insignia({ callsign, size = 40 }: { callsign: string; size?: number }) {
  const { hue, icono } = insigniaCallsign(callsign);
  return (
    <span
      className="cm-avatar cm-insignia"
      style={{ width: size, height: size, ["--h" as string]: hue }}
      aria-hidden="true"
    >
      <Icon n={icono} size={Math.round(size * 0.5)} sw={1.8} color="rgba(255,255,255,.95)" />
    </span>
  );
}

export function Avatar({
  nombre,
  anonimo,
  callsign,
  avatarUrl,
  size = 40,
  className = "",
}: {
  nombre: string;
  anonimo: boolean;
  callsign: string;
  avatarUrl: string | null;
  size?: number;
  className?: string;
}) {
  if (anonimo) return <Insignia callsign={callsign} size={size} />;
  return (
    <span
      className={`cm-avatar ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {avatarUrl ? <img src={avatarUrl} alt="" loading="lazy" /> : iniciales(nombre)}
    </span>
  );
}

/** "Cirro Vega" + "#4821" en pequeño; si no es indicativo, el texto tal cual. */
export function Callsign({
  texto,
  className = "",
  numero = true,
}: {
  texto: string;
  className?: string;
  numero?: boolean;
}) {
  const p = partesCallsign(texto);
  return (
    <span className={className}>
      {p.nombre}
      {numero && p.numero && <span className="cm-callsign-num">{p.numero}</span>}
    </span>
  );
}

/* ───────────────────────── Selector de rankings ───────────────────────── */

export function RankingSelector({
  metric,
  onChange,
}: {
  metric: FpRankingId;
  onChange: (id: FpRankingId) => void;
}) {
  return (
    <div
      className="cm-stagger grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5"
      role="tablist"
      aria-label="Rankings"
    >
      {FP_RANKINGS.map((r, i) => (
        <button
          key={r.id}
          type="button"
          role="tab"
          aria-selected={metric === r.id}
          aria-pressed={metric === r.id}
          onClick={() => onChange(r.id)}
          className="cm-rank-card"
          style={{ ["--cm-acento" as string]: r.acento, ["--i" as string]: i }}
        >
          <span className="cm-rank-icon">
            <Icon n={r.icono as FPIconName} size={18} sw={1.8} />
          </span>
          <span className="cm-display text-[15px] leading-tight">{r.label}</span>
          <span className="cm-muted hidden text-[11.5px] leading-snug sm:block">{r.ayuda}</span>
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────── Control de periodo ───────────────────────── */

export function PeriodSwitch({
  periodo,
  onChange,
  disabled = false,
}: {
  periodo: FpPeriodo;
  onChange: (p: FpPeriodo) => void;
  disabled?: boolean;
}) {
  const idx = Math.max(
    0,
    FP_PERIODOS.findIndex((p) => p.id === periodo),
  );
  return (
    <div
      className="cm-seg"
      role="tablist"
      aria-label="Periodo"
      style={{
        ["--cm-n" as string]: FP_PERIODOS.length,
        ["--cm-i" as string]: idx,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <span className="cm-seg-thumb" aria-hidden="true" />
      {FP_PERIODOS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={periodo === p.id}
          disabled={disabled}
          onClick={() => onChange(p.id)}
          className="cm-seg-btn"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────── Podio ───────────────────────── */

const ORDEN_PODIO = [1, 0, 2] as const; // 2º, 1º, 3º
const AVATAR_PODIO = [76, 60, 60] as const;
const DELAY_PODIO = [260, 80, 420] as const;

export function Podium({
  filas,
  unidad,
  acento,
}: {
  filas: FpRankingRow[];
  unidad: string;
  acento: string;
}) {
  const top3 = filas.slice(0, 3);
  if (top3.length === 0) return null;
  return (
    <div className="cm-podium" style={{ ["--cm-acento" as string]: acento }}>
      {ORDEN_PODIO.map((idx) => {
        const r = top3[idx];
        if (!r) return <div key={`vacio-${idx}`} aria-hidden="true" />;
        const lugar = idx + 1;
        return (
          <div
            key={r.userId}
            className="cm-podium-col"
            style={{ ["--d" as string]: `${DELAY_PODIO[idx]}ms` }}
          >
            <div className={`cm-avatar-wrap ${lugar === 1 ? "cm-avatar-wrap-1" : ""}`}>
              <span className={`inline-block rounded-full cm-ring-${lugar}`}>
                <Avatar
                  nombre={r.display}
                  anonimo={r.anonimo}
                  callsign={r.callsign}
                  avatarUrl={r.avatarUrl}
                  size={AVATAR_PODIO[idx]}
                />
              </span>
              <span className={`cm-medal cm-medal-${lugar}`}>{lugar}</span>
            </div>
            <div className="grid w-full justify-items-center gap-0.5 px-1 text-center">
              <span
                className="cm-display max-w-full truncate text-[14px] sm:text-[15px]"
                title={r.display}
                style={{ fontWeight: 700 }}
              >
                <Callsign texto={r.display} />
              </span>
              {r.esYo && <span className="cm-you-tag">Tú</span>}
              <span
                className="cm-display text-[18px] sm:text-[20px]"
                style={{ color: acento, fontWeight: 700 }}
              >
                <Numero valor={r.valor} />{" "}
                <span className="cm-muted text-[11px] font-semibold">{unidad}</span>
              </span>
            </div>
            <div className={`cm-pedestal cm-pedestal-${lugar}`}>
              {lugar === 1 && <span className="cm-shine" aria-hidden="true" />}
              <span className="cm-pedestal-num" style={{ fontSize: lugar === 1 ? 44 : 32 }}>
                {lugar}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Fila ───────────────────────── */

export function Fila({
  r,
  unidad,
  acento,
  i = 0,
}: {
  r: FpRankingRow;
  unidad: string;
  acento: string;
  i?: number;
}) {
  return (
    <div
      className={`cm-row ${r.esYo ? "cm-row-you" : ""}`}
      style={{ ["--cm-acento" as string]: acento, ["--i" as string]: i }}
    >
      <span className="cm-pos">{r.posicion}</span>
      <Avatar
        nombre={r.display}
        anonimo={r.anonimo}
        callsign={r.callsign}
        avatarUrl={r.avatarUrl}
        size={40}
      />
      <span className="flex min-w-0 items-center gap-2">
        <span className="cm-ink truncate text-[14px] font-bold" title={r.display}>
          <Callsign texto={r.display} />
        </span>
        {r.esYo && <span className="cm-you-tag">Tú</span>}
      </span>
      <span
        className="cm-display whitespace-nowrap text-[16px]"
        style={{ color: acento, fontWeight: 700 }}
      >
        <Numero valor={r.valor} />{" "}
        <span className="cm-muted text-[11px] font-semibold">{unidad}</span>
      </span>
    </div>
  );
}

/* ───────────────────────── Anillo de progreso ───────────────────────── */

export function Ring({
  ratio,
  color,
  size = 84,
  stroke = 7,
  children,
}: {
  ratio: number;
  color: string;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);
  const p = Math.min(1, Math.max(0, ratio));
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="cm-ring-track"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="cm-ring-bar"
          strokeDasharray={c}
          strokeDashoffset={ready ? c * (1 - p) : c}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">{children}</span>
    </span>
  );
}

/* ───────────────────────── HUD ───────────────────────── */

export function HudTile({
  label,
  valor,
  sufijo,
  icono,
  i = 0,
  flama = false,
}: {
  label: string;
  valor: number | string;
  sufijo?: string;
  icono: FPIconName;
  i?: number;
  flama?: boolean;
}) {
  return (
    <div className="cm-hud-tile" style={{ ["--i" as string]: i }}>
      <div className="mb-2 flex items-center gap-2">
        <span className={flama ? "cm-flame" : ""} style={{ color: "#F2AEBC", display: "flex" }}>
          <Icon n={icono} size={15} sw={1.8} />
        </span>
        <span className="cm-hud-label truncate">{label}</span>
      </div>
      <div className="cm-hud-num flex items-baseline gap-1">
        {typeof valor === "number" ? <Numero valor={valor} /> : <span>{valor}</span>}
        {sufijo && <span className="text-[12px] font-semibold text-white/60">{sufijo}</span>}
      </div>
    </div>
  );
}

/* ───────────────────────── Esqueleto ───────────────────────── */

export function BoardSkeleton() {
  return (
    <div className="grid gap-3" aria-hidden="true">
      <div className="cm-podium">
        {[92, 128, 76].map((h, i) => (
          <div key={i} className="cm-podium-col">
            <span className="cm-skel" style={{ width: 60, height: 60, borderRadius: 999 }} />
            <span className="cm-skel" style={{ width: "70%", height: 12 }} />
            <span className="cm-skel" style={{ width: "100%", height: h, borderRadius: 16 }} />
          </div>
        ))}
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="cm-skel" style={{ height: 56 }} />
      ))}
    </div>
  );
}

/* ───────────────────────── Fondo ───────────────────────── */

export function Backdrop() {
  return (
    <div className="cm-backdrop" aria-hidden="true">
      <div className="aero-grid absolute inset-0" />
      <span
        className="cm-cloud cm-cloud-a"
        style={{ width: 380, height: 150, left: "-6%", top: 40 }}
      />
      <span
        className="cm-cloud cm-cloud-b"
        style={{ width: 300, height: 120, right: "-4%", top: 380 }}
      />
      <span
        className="cm-cloud cm-cloud-c"
        style={{ width: 460, height: 170, left: "30%", bottom: 120 }}
      />
    </div>
  );
}

export function Tarjeta({
  titulo,
  icono,
  aside,
  children,
  className = "",
  tour,
}: {
  titulo: ReactNode;
  icono?: FPIconName;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  tour?: string;
}) {
  return (
    <section className={`cm-card p-4 sm:p-5 ${className}`} data-tour={tour}>
      <div className="mb-3 flex items-center gap-2.5">
        {icono && (
          <span className="cm-ink-2 flex">
            <Icon n={icono} size={16} sw={1.8} />
          </span>
        )}
        <h2 className="cm-display cm-ink flex-1 text-[15px]">{titulo}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
