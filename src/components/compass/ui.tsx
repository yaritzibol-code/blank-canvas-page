/**
 * Piezas visuales compartidas del Pilot Aptitude Trainer.
 * Mismo lenguaje editorial del dashboard: serif itálica, mono en mayúsculas,
 * paleta navy/vino/rosa.
 */
import { useEffect, useState, type ReactNode } from "react";
import type { CompassMetric } from "@/modules/compass/types";

export const NAVY = "#22375C";
export const CORAL = "#6C0820";
export const CREAM = "#FBFAF7";
export const HAZE = "#647DA0";
export const ROSE = "#F2AEBC";
export const SALMON = "#F2DCDB";
export const SERIF = "'Instrument Serif', serif";
export const SANS = "'Manrope', sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export function CCard({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${NAVY}14`,
        borderRadius: 22,
        padding: "22px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: "0.6rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        fontWeight: 700,
        color: `${NAVY}66`,
        marginBottom: 10,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Anillo de score 0-100 con número en serif. */
export function ScoreRing({
  score,
  size = 148,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(100, score)) / 100;
  const color = score >= 75 ? "#12B26B" : score >= 45 ? CORAL : "#C24545";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SALMON} strokeWidth={7} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: size * 0.3,
            lineHeight: 1,
            color: NAVY,
          }}
        >
          {Math.round(score)}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.56rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: HAZE,
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          {label ?? "Score"}
        </span>
      </div>
    </div>
  );
}

/** Chip de sub-métrica del debrief. */
export function MetricChip({ m }: { m: CompassMetric }) {
  return (
    <div
      title={m.hint}
      style={{
        background: CREAM,
        border: `1px solid ${NAVY}12`,
        borderRadius: 14,
        padding: "12px 14px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.56rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: HAZE,
          marginBottom: 4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {m.label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "1.35rem",
          color: NAVY,
          lineHeight: 1,
        }}
      >
        {m.value}
      </div>
      {m.hint && (
        <div style={{ fontSize: "0.68rem", color: HAZE, marginTop: 5, lineHeight: 1.35 }}>
          {m.hint}
        </div>
      )}
    </div>
  );
}

/** Botón principal (vino) y secundario (borde). */
export function CButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const primary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 22px",
        borderRadius: 12,
        border: primary ? "none" : `1px solid ${NAVY}22`,
        background: primary ? CORAL : "transparent",
        color: primary ? "white" : NAVY,
        fontFamily: SANS,
        fontSize: "0.88rem",
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.12s, background 0.12s",
        minHeight: 44,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && primary) e.currentTarget.style.background = "#4A0517";
      }}
      onMouseLeave={(e) => {
        if (primary) e.currentTarget.style.background = CORAL;
      }}
    >
      {children}
    </button>
  );
}

/** Cuenta regresiva 3-2-1 antes de arrancar una tarea. */
export function CountdownIntro({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setN((v) => v - 1), 800);
    return () => clearTimeout(t);
    // onDone estable por diseño (setFase del runner)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(34,55,92,0.88)",
        borderRadius: 18,
        zIndex: 5,
      }}
    >
      <span
        key={n}
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "5rem",
          color: "white",
          animation: "fp-fadeIn 0.4s ease",
        }}
      >
        {n}
      </span>
    </div>
  );
}

/** Overlay de pausa (práctica) al perder visibilidad o pedirla el usuario. */
export function PauseOverlay({ onResume, texto }: { onResume: () => void; texto?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(34,55,92,0.92)",
        borderRadius: 18,
        zIndex: 6,
        padding: 20,
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "1.7rem",
          color: "white",
          textAlign: "center",
        }}
      >
        {texto ?? "Pausa"}
      </div>
      <CButton onClick={onResume}>Reanudar</CButton>
    </div>
  );
}

/** Barra superior de una tarea en curso: nombre, reloj y salida. */
export function GameTopBar({
  nombre,
  remainingSec,
  progressLabel,
  onQuit,
}: {
  nombre: string;
  /** Segundos restantes (null = tarea sin reloj global). */
  remainingSec: number | null;
  /** "4/10" en tareas por ítems. */
  progressLabel?: string;
  onQuit: () => void;
}) {
  const mm = remainingSec !== null ? Math.floor(remainingSec / 60) : 0;
  const ss = remainingSec !== null ? Math.max(0, Math.floor(remainingSec % 60)) : 0;
  const low = remainingSec !== null && remainingSec <= 15;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: "0.62rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: `${NAVY}88`,
        }}
      >
        {nombre}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {progressLabel && (
          <span style={{ fontFamily: MONO, fontSize: "0.72rem", color: HAZE, fontWeight: 700 }}>
            {progressLabel}
          </span>
        )}
        {remainingSec !== null && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.86rem",
              fontWeight: 700,
              color: low ? CORAL : NAVY,
              background: low ? `${ROSE}44` : CREAM,
              border: `1px solid ${NAVY}14`,
              padding: "4px 10px",
              borderRadius: 10,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {mm}:{String(ss).padStart(2, "0")}
          </span>
        )}
        <button
          onClick={onQuit}
          title="Abandonar la sesión"
          style={{
            border: `1px solid ${NAVY}22`,
            background: "transparent",
            color: HAZE,
            borderRadius: 10,
            padding: "6px 12px",
            fontFamily: MONO,
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Salir
        </button>
      </div>
    </div>
  );
}
