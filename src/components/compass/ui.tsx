/**
 * Piezas visuales compartidas del Pilot Aptitude Trainer.
 * Mismo lenguaje editorial del dashboard (serif itálica, mono en mayúsculas)
 * sobre la cabina oscura de FlightDeck: navy profundo, oro y luces de estado.
 */
import { useEffect, useState, type ReactNode } from "react";
import type { CompassMetric } from "@/modules/compass/types";
import "./compass-game.css";

export const NAVY = "#081A35";
export const CORAL = "#7A5C1E";
export const CREAM = "#F5F5F7";
export const HAZE = "#4A5872";
export const ROSE = "#C7A052";
export const SALMON = "#EEE1C5";
export const SERIF = "'Instrument Serif', serif";
export const SANS = "'Manrope', sans-serif";
export const MONO = "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace";

/* Tinta y luces sobre fondo oscuro: lo que se dibuja encima de los paneles. */
export const INK = "#F4F6FA";
export const INK2 = "#B8C5DA";
export const INK3 = "#8FA3C2";
export const GOLD = "#E3C98A";
export const GOLD2 = "#C7A052";
export const GREEN = "#7FD6A4";
export const AMBER = "#F3C969";
export const RED = "#F0826E";
export const SKY = "#8FD3F4";
export const VIOLET = "#B9A6F5";
/** Filete dorado tenue para bordes sobre paneles oscuros. */
export const LINE = "rgba(227,201,138,.16)";

/**
 * Escenario de una prueba: marco de cabina con esquinas HUD y, si existe, el
 * arte de la prueba de fondo. Su presencia pone el espacio de trabajo en modo
 * inmersivo (ver compass-game.css).
 */
export function GameStage({ art, children }: { art?: string; children: ReactNode }) {
  return (
    <section
      className="cx-stage"
      data-art={art ? "" : undefined}
      style={art ? ({ "--cx-art": `url("${art}")` } as React.CSSProperties) : undefined}
    >
      <div className="cx-corners" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      {children}
    </section>
  );
}

export function CCard({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="cx-screen" style={{ padding: "22px 24px", ...style }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: "0.62rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        fontWeight: 700,
        color: "var(--cx-ink-3, var(--fd-muted, #8FA3C2))",
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
  const color = score >= 75 ? GREEN : score >= 45 ? GOLD : RED;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 10px ${color}55)` }}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,.09)"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - 11}
          fill="none"
          stroke={LINE}
          strokeWidth={1}
          strokeDasharray="2 6"
        />
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
            color: INK,
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
            color: INK3,
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
        background: "linear-gradient(180deg, rgba(22,61,112,.26), rgba(3,10,24,.5))",
        border: `1px solid ${LINE}`,
        borderRadius: 12,
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
          color: INK3,
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
          color: INK,
          lineHeight: 1,
        }}
      >
        {m.value}
      </div>
      {m.hint && (
        <div style={{ fontSize: "0.68rem", color: INK2, marginTop: 5, lineHeight: 1.35 }}>
          {m.hint}
        </div>
      )}
    </div>
  );
}

/** Botón principal (oro) y secundario (filete). */
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
        borderRadius: 10,
        border: primary ? "none" : `1px solid rgba(227,201,138,.3)`,
        background: primary ? `linear-gradient(180deg, ${GOLD}, ${GOLD2})` : "rgba(3,10,24,.35)",
        color: primary ? NAVY : INK,
        fontFamily: SANS,
        fontSize: "0.88rem",
        fontWeight: 800,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: primary ? "0 10px 24px -14px rgba(199,160,82,.9)" : "none",
        transition: "transform 0.12s, filter 0.12s, border-color 0.12s",
        minHeight: 44,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (primary) e.currentTarget.style.filter = "brightness(1.07)";
        else e.currentTarget.style.borderColor = "rgba(227,201,138,.55)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "";
        if (!primary) e.currentTarget.style.borderColor = "rgba(227,201,138,.3)";
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
    <div className="cx-overlay" role="status" aria-live="assertive">
      <div className="cx-count">
        <span key={n}>{n}</span>
      </div>
      <div className="cx-count-label">Prepárate</div>
    </div>
  );
}

/** Overlay de pausa (práctica) al perder visibilidad o pedirla el usuario. */
export function PauseOverlay({ onResume, texto }: { onResume: () => void; texto?: string }) {
  return (
    <div className="cx-overlay" role="dialog" aria-label="Pausa">
      {texto && <div className="cx-count-label">Pausa</div>}
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "1.7rem",
          color: INK,
          maxWidth: 420,
          lineHeight: 1.25,
        }}
      >
        {texto ?? "Pausa"}
      </div>
      <CButton onClick={onResume}>Reanudar</CButton>
    </div>
  );
}

/** HUD superior de una tarea en curso: nombre, reloj, avance y salida. */
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
    <div className="cx-hud">
      <span className="cx-hud-name">{nombre}</span>
      <div className="cx-hud-right">
        {progressLabel && <span className="cx-chip">{progressLabel}</span>}
        {remainingSec !== null && (
          <span className={`cx-chip is-clock${low ? " is-low" : ""}`} aria-label="Tiempo restante">
            {mm}:{String(ss).padStart(2, "0")}
          </span>
        )}
        <button type="button" className="cx-exit" onClick={onQuit} title="Abandonar la sesión">
          Salir
        </button>
      </div>
    </div>
  );
}

/** Pie de controles de una tarea ("← → / A D o arrastra"). */
export function GameHint({ children }: { children: ReactNode }) {
  return <p className="cx-hint">{children}</p>;
}
