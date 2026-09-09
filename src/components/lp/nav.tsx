/**
 * Piezas visuales compartidas por la navegación académica de Learning Paths.
 * Todo vive dentro del Dashboard Shell: sólo cambia el contenido central.
 * Estética: tarjetas amables, acentos por categoría y estados legibles.
 */
import { Link } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import type { CSSProperties, ReactNode } from "react";

const DISPLAY = "'Bricolage Grotesque', sans-serif";

const mix = (color: string, pct: number, base = "transparent") =>
  `color-mix(in oklab, ${color} ${pct}%, ${base})`;

export type LpStatus = "no_iniciado" | "en_progreso" | "completado";

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
          color: "var(--muted-foreground)",
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
              <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{c.label}</span>
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
              color: "var(--primary)",
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
              color: "var(--muted-foreground)",
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

export function LpProgressBar({ percent, accent }: { percent: number; accent?: string }) {
  const color = accent ?? "var(--primary)";
  return (
    <div
      style={{
        height: 8,
        borderRadius: 999,
        background: mix("var(--foreground)", 8, "var(--card)"),
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.max(percent, percent > 0 ? 4 : 0)}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${mix(color, 75, "white")}, ${color})`,
          transition: "width .35s ease",
        }}
      />
    </div>
  );
}

/** Anillo circular de avance para las tarjetas grandes. */
export function LpProgressRing({
  percent,
  accent = "var(--primary)",
  size = 52,
}: {
  percent: number;
  accent?: string;
  size?: number;
}) {
  return (
    <div
      role="img"
      aria-label={`${percent}% completado`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `conic-gradient(${accent} ${percent * 3.6}deg, ${mix("var(--foreground)", 10, "var(--card)")} 0deg)`,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: size - 12,
          height: size - 12,
          borderRadius: "50%",
          background: "var(--card)",
          display: "grid",
          placeItems: "center",
          fontSize: 11.5,
          fontWeight: 800,
          color: percent > 0 ? accent : "var(--muted-foreground)",
        }}
      >
        {percent}%
      </div>
    </div>
  );
}

export function LpStatusPill({ status }: { status: LpStatus }) {
  const map = {
    completado: {
      label: "Completado",
      bg: mix("var(--primary)", 14),
      fg: "var(--primary)",
      border: "transparent",
    },
    en_progreso: {
      label: "En progreso",
      bg: mix("var(--accent)", 40),
      fg: "var(--accent-foreground)",
      border: "transparent",
    },
    no_iniciado: {
      label: "No iniciado",
      bg: "transparent",
      fg: "var(--muted-foreground)",
      border: "var(--border)",
    },
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
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

/** Círculo de estado usado en la secuencia de learning paths. */
function StatusDot({ status, locked, n }: { status: LpStatus; locked: boolean; n: number }) {
  const done = status === "completado";
  const active = status === "en_progreso";
  return (
    <div
      aria-hidden
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        fontSize: 12.5,
        fontWeight: 800,
        background: done
          ? "var(--primary)"
          : active
            ? mix("var(--accent)", 55, "var(--card)")
            : mix("var(--foreground)", 5, "var(--card)"),
        color: done
          ? "var(--primary-foreground)"
          : active
            ? "var(--accent-foreground)"
            : "var(--muted-foreground)",
        border: done ? "none" : `1px solid ${mix("var(--foreground)", 12, "transparent")}`,
      }}
    >
      {done ? (
        <Icon n="check" size={16} />
      ) : locked ? (
        <Icon n="lock" size={14} />
      ) : (
        String(n).padStart(2, "0")
      )}
    </div>
  );
}

const cardBase: CSSProperties = {
  position: "relative",
  display: "block",
  width: "100%",
  textAlign: "left",
  borderRadius: 20,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "inherit",
  textDecoration: "none",
  boxShadow: `0 1px 2px ${mix("var(--foreground)", 6)}`,
  transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
};

function Interactive({
  to,
  params,
  onClick,
  disabled,
  style,
  children,
  label,
}: {
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
  disabled?: boolean;
  style: CSSProperties;
  children: ReactNode;
  label?: string;
}) {
  const hoverProps = disabled
    ? {}
    : {
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `0 10px 24px ${mix("var(--foreground)", 10)}`;
          e.currentTarget.style.borderColor = mix("var(--primary)", 35, "var(--border)");
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = cardBase.boxShadow as string;
          e.currentTarget.style.borderColor = "var(--border)";
        },
      };

  if (!to || disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-disabled={disabled}
        aria-label={label}
        style={{ ...style, cursor: onClick ? "pointer" : "not-allowed", font: "inherit" }}
        {...hoverProps}
      >
        {children}
      </button>
    );
  }
  return (
    <Link to={to} params={params} aria-label={label} style={style} {...hoverProps}>
      {children}
    </Link>
  );
}

/** Tarjeta grande de categoría: icono, acento y avance. */
export function LpCategoryCard({
  to,
  params,
  title,
  meta,
  descripcion,
  icon = "book" as FPIconName,
  accent = "var(--primary)",
  percent,
}: {
  to: string;
  params?: Record<string, string>;
  title: string;
  meta?: string;
  descripcion?: string;
  icon?: FPIconName;
  accent?: string;
  percent?: number;
}) {
  return (
    <Interactive
      to={to}
      params={params}
      style={{ ...cardBase, padding: 22, overflow: "hidden" }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(160deg, ${mix(accent, 12, "transparent")}, transparent 62%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: mix(accent, 16, "var(--card)"),
              color: accent,
            }}
          >
            <Icon n={icon} size={22} />
          </div>
          {typeof percent === "number" && <LpProgressRing percent={percent} accent={accent} />}
        </div>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </div>
          {descripcion && (
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--muted-foreground)" }}>
              {descripcion}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            fontSize: 12.5,
            color: "var(--muted-foreground)",
            fontWeight: 600,
          }}
        >
          <span>{meta}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: accent }}>
            Entrar <Icon n="chevR" size={14} />
          </span>
        </div>
      </div>
    </Interactive>
  );
}

/** Tarjeta de materia o contenedor con barra de avance y estado. */
export function LpCard({
  to,
  params,
  title,
  meta,
  right,
  percent,
  disabled,
  onClick,
  icon,
  accent = "var(--primary)",
  status,
  lockReason,
}: {
  to?: string;
  params?: Record<string, string>;
  title: string;
  meta?: string;
  right?: ReactNode;
  percent?: number;
  disabled?: boolean;
  onClick?: () => void;
  icon?: FPIconName;
  accent?: string;
  status?: LpStatus;
  lockReason?: string;
}) {
  return (
    <Interactive
      to={to}
      params={params}
      onClick={onClick}
      disabled={disabled}
      label={title}
      style={{
        ...cardBase,
        padding: 18,
        opacity: disabled ? 0.75 : 1,
        background: disabled ? mix("var(--foreground)", 4, "var(--card)") : "var(--card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {icon && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              background: mix(disabled ? "var(--muted-foreground)" : accent, 14, "var(--card)"),
              color: disabled ? "var(--muted-foreground)" : accent,
            }}
          >
            <Icon n={disabled ? "lock" : icon} size={18} />
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.35 }}>{title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {right ?? (status ? <LpStatusPill status={status} /> : null)}
              {!disabled && <Icon n="chevR" size={15} />}
            </div>
          </div>
          {(meta || lockReason) && (
            <div style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 5 }}>
              {disabled && lockReason ? lockReason : meta}
            </div>
          )}
          {typeof percent === "number" && !disabled && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <LpProgressBar percent={percent} accent={accent} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--muted-foreground)" }}>
                {percent}%
              </span>
            </div>
          )}
        </div>
      </div>
    </Interactive>
  );
}

/** Tarjeta compacta y numerada dentro de la secuencia del temario. */
export function LpStepCard({
  to,
  params,
  n,
  title,
  meta,
  status = "no_iniciado",
  locked,
  onClick,
  connector,
}: {
  to?: string;
  params?: Record<string, string>;
  n: number;
  title: string;
  meta?: string;
  status?: LpStatus;
  locked?: boolean;
  onClick?: () => void;
  connector?: boolean;
}) {
  return (
    <div style={{ position: "relative", paddingLeft: 0 }}>
      {connector && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 35,
            top: -12,
            width: 2,
            height: 12,
            background: mix("var(--foreground)", 12, "transparent"),
          }}
        />
      )}
      <Interactive
        to={locked ? undefined : to}
        params={params}
        onClick={onClick}
        disabled={locked && !onClick}
        label={title}
        style={{
          ...cardBase,
          padding: "14px 16px",
          opacity: locked ? 0.8 : 1,
          background: locked ? mix("var(--foreground)", 4, "var(--card)") : "var(--card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <StatusDot status={status} locked={!!locked} n={n} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.35 }}>{title}</div>
            {meta && (
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 3 }}>{meta}</div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {!locked && <LpStatusPill status={status} />}
            {locked ? <Icon n="lock" size={14} /> : <Icon n="chevR" size={15} />}
          </div>
        </div>
      </Interactive>
    </div>
  );
}

/** Tarjeta destacada para retomar el estudio. */
export function LpContinueCard({
  to,
  params,
  titulo,
  contexto,
}: {
  to: string;
  params: Record<string, string>;
  titulo: string;
  contexto?: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 22,
        padding: "18px 20px",
        borderRadius: 20,
        textDecoration: "none",
        color: "inherit",
        border: `1px solid ${mix("var(--primary)", 30, "var(--border)")}`,
        background: `linear-gradient(135deg, ${mix("var(--primary)", 12, "var(--card)")}, ${mix("var(--accent)", 25, "var(--card)")})`,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        <Icon n="play" size={20} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--primary)" }}>
          Continuar estudiando
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>{titulo}</div>
        {contexto && (
          <div style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 2 }}>{contexto}</div>
        )}
      </div>
      <Icon n="chevR" size={18} />
    </Link>
  );
}

/** Estado vacío amable (contenido en preparación, bloqueos). */
export function LpEmptyState({
  icon = "spark" as FPIconName,
  title,
  description,
  action,
}: {
  icon?: FPIconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: 30,
        borderRadius: 20,
        border: `1px dashed ${mix("var(--primary)", 28, "var(--border)")}`,
        background: `linear-gradient(160deg, ${mix("var(--accent)", 16, "var(--card)")}, var(--card) 65%)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          margin: "0 auto 14px",
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background: mix("var(--primary)", 14, "var(--card)"),
          color: "var(--primary)",
        }}
      >
        <Icon n={icon} size={24} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700 }}>{title}</div>
      {description && (
        <p
          style={{
            margin: "8px auto 0",
            maxWidth: 460,
            fontSize: 14,
            color: "var(--muted-foreground)",
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

/** Barra de acciones anterior / completar / siguiente. */
export function LpActionBar({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        borderRadius: 18,
        border: "1px solid var(--border)",
        background: mix("var(--foreground)", 3, "var(--card)"),
      }}
    >
      {children}
    </div>
  );
}

export function lpButtonStyle(kind: "primary" | "ghost" | "disabled"): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 18px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13.5,
    font: undefined,
    cursor: kind === "disabled" ? "not-allowed" : "pointer",
    border: kind === "primary" ? "1px solid transparent" : "1px solid var(--border)",
    background: kind === "primary" ? "var(--primary)" : "var(--card)",
    color: kind === "primary" ? "var(--primary-foreground)" : "inherit",
    opacity: kind === "disabled" ? 0.55 : 1,
  };
}

export function LpGrid({ children, single }: { children: ReactNode; single?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 14,
        gridTemplateColumns: single ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}
