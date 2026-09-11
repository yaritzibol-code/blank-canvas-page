/**
 * Pantalla "En mantenimiento".
 *
 * No es un error: es una función que se está mejorando. Se muestra en lugar
 * del contenido cuando su interruptor en `@/lib/feature-flags` está activo.
 * No toca datos, progreso ni componentes del módulo.
 */
import type { CSSProperties, FC, ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSessionUser } from "@/lib/store";

interface Props {
  titulo: string;
  intro: string;
  cuerpo: string;
  cierre: string;
}

const card: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  maxWidth: 560,
  width: "100%",
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 24,
  padding: "44px 34px 38px",
  textAlign: "center",
  boxShadow: "0 18px 60px rgba(15, 30, 60, 0.10)",
};

/** Horizonte + trayectoria de ascenso: guiño aeronáutico discreto. */
function Insignia() {
  return (
    <div
      style={{
        width: 92,
        height: 92,
        margin: "0 auto 22px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(140deg, hsl(var(--primary) / 0.16), hsl(var(--primary) / 0.04))",
        border: "1px solid hsl(var(--primary) / 0.18)",
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <circle cx="22" cy="22" r="17" stroke="hsl(var(--primary) / 0.35)" strokeWidth="1.4" />
        <path d="M6 27h32" stroke="hsl(var(--primary) / 0.28)" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M10 31c7-1.5 12.5-6 16-13"
          stroke="hsl(var(--primary))"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="3 4"
        />
        <path
          d="M25 19.5l7.5-3.2-3.2 7.5-1.9-2.4-2.4-1.9z"
          fill="hsl(var(--primary))"
        />
      </svg>
    </div>
  );
}

export function Maintenance({ titulo, intro, cuerpo, cierre }: Props) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={card}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-40% -30% auto -30%",
            height: 220,
            background: "radial-gradient(60% 100% at 50% 0%, hsl(var(--primary) / 0.10), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <Insignia />
          <span
            style={{
              display: "inline-block",
              marginBottom: 14,
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: "0.68rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 800,
              color: "hsl(var(--primary))",
              background: "hsl(var(--primary) / 0.10)",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            En mantenimiento
          </span>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            {titulo}
          </h1>
          <p style={{ fontSize: "1.02rem", fontWeight: 700, margin: "0 0 12px", color: "hsl(var(--foreground))" }}>
            {intro}
          </p>
          <p style={{ fontSize: "0.95rem", color: "hsl(var(--muted-foreground))", margin: "0 0 8px", lineHeight: 1.65 }}>
            {cuerpo}
          </p>
          <p style={{ fontSize: "0.95rem", color: "hsl(var(--muted-foreground))", margin: "0 0 26px", lineHeight: 1.65 }}>
            {cierre}
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            style={{
              padding: "12px 30px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              fontWeight: 700,
              fontSize: "0.95rem",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Envuelve una pantalla: si el interruptor está activo, la estudiante ve el
 * aviso de mantenimiento. Las cuentas de administración pasan de largo.
 */
export function maintenanceGate<P extends object>(
  Component: FC<P>,
  activo: boolean,
  textos: Props,
): FC<P> {
  const Wrapped: FC<P> = (props) => {
    const user = useSessionUser();
    if (activo && user?.role !== "admin") return <Maintenance {...textos} /> as ReactNode as never;
    return <Component {...props} />;
  };
  Wrapped.displayName = `Maintenance(${textos.titulo})`;
  return Wrapped;
}
