/**
 * Piezas visuales compartidas por la navegación académica de Learning Paths.
 * Todo vive dentro del Dashboard Shell: sólo cambia el contenido central.
 */
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import type { ReactNode } from "react";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

export interface Crumb {
  label: string;
  to?: string;
  params?: Record<string, string>;
}

export function LpBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ruta de navegación" style={{ marginBottom: 18 }}>
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontSize: 13,
          color: "hsl(var(--muted-foreground))",
        }}
      >
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {c.to ? (
              <Link
                to={c.to}
                params={c.params}
                style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
              >
                {c.label}
              </Link>
            ) : (
              <span style={{ color: "hsl(var(--foreground))", fontWeight: 700 }}>{c.label}</span>
            )}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LpHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 22,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "hsl(var(--primary))",
              marginBottom: 8,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1 style={{ fontFamily: DISPLAY, fontSize: 30, lineHeight: 1.1, margin: 0 }}>{title}</h1>
        {subtitle && (
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 14.5,
              color: "hsl(var(--muted-foreground))",
              maxWidth: 640,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </header>
  );
}

export function LpProgressBar({ percent }: { percent: number }) {
  return (
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: "hsl(var(--muted))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${percent}%`,
          borderRadius: 999,
          background: "hsl(var(--primary))",
          transition: "width .3s ease",
        }}
      />
    </div>
  );
}

export function LpCard({
  to,
  params,
  title,
  meta,
  right,
  percent,
  disabled,
  onClick,
}: {
  to?: string;
  params?: Record<string, string>;
  title: string;
  meta?: string;
  right?: ReactNode;
  percent?: number;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.35 }}>{title}</div>
          {meta && (
            <div style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", marginTop: 4 }}>
              {meta}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {right}
          {!disabled && <Icon n="chevR" size={16} />}
        </div>
      </div>
      {typeof percent === "number" && (
        <div style={{ marginTop: 12 }}>
          <LpProgressBar percent={percent} />
        </div>
      )}
    </>
  );

  const style: React.CSSProperties = {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "16px 18px",
    borderRadius: 16,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    color: "inherit",
    textDecoration: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
  };

  if (disabled || !to) {
    return (
      <button type="button" style={style} disabled={disabled} onClick={onClick} aria-disabled={disabled}>
        {inner}
      </button>
    );
  }
  return (
    <Link to={to} params={params} style={style}>
      {inner}
    </Link>
  );
}

export function LpStatusPill({ status }: { status: "no_iniciado" | "en_progreso" | "completado" }) {
  const map = {
    completado: { label: "Completado", bg: "hsl(var(--primary) / 0.12)", fg: "hsl(var(--primary))" },
    en_progreso: { label: "En progreso", bg: "hsl(var(--muted))", fg: "hsl(var(--foreground))" },
    no_iniciado: { label: "No iniciado", bg: "transparent", fg: "hsl(var(--muted-foreground))" },
  } as const;
  const s = map[status];
  return (
    <span
      style={{
        fontSize: 11.5,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        border: status === "no_iniciado" ? "1px solid hsl(var(--border))" : "none",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

export function LpGrid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gap: 12 }}>{children}</div>;
}
