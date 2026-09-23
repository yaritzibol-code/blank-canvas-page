import type { ReactNode } from "react";
import { PlaneField } from "@/components/shared/PlaneField";

/**
 * Cabecera editorial de módulo.
 *
 * Es el mismo gesto que abre Inicio, Análisis y Mi perfil: antetítulo en
 * monoespaciada, titular en serif itálica con una palabra en vino, bajada y
 * filete. Vive aquí para que todos los módulos del dashboard abran igual en
 * vez de repetir cada uno su propio encabezado.
 */
export function ModuleHeader({
  eyebrow,
  title,
  accent,
  tail,
  subtitle,
  aside,
  planes = 8,
}: {
  /** Antetítulo corto, tipo "Recursos · Biblioteca". */
  eyebrow: string;
  /** Parte del titular antes de la palabra acentuada. */
  title: string;
  /** Palabra acentuada en vino (opcional). */
  accent?: string;
  /** Resto del titular tras la palabra acentuada. */
  tail?: string;
  subtitle?: ReactNode;
  /** Contenido alineado a la derecha (acciones, chips). */
  aside?: ReactNode;
  /** Aviones de fondo; 0 los desactiva. */
  planes?: number;
}) {
  return (
    <div className="fp-module-header" style={{ position: "relative", isolation: "isolate", marginBottom: 26 }}>
      {planes > 0 && (
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: "-24px -24px -12px -24px", zIndex: 0, pointerEvents: "none", opacity: 0.5 }}
        >
          <PlaneField count={planes} />
        </div>
      )}
      <header style={{ position: "relative", zIndex: 1, paddingTop: 8, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.68rem",
              letterSpacing: "0.22em",
              color: "var(--fd-muted, #4A5872)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              lineHeight: 1.05,
              color: "var(--fd-text, #081A35)",
              margin: 0,
            }}
          >
            {title}
            {accent && <em style={{ color: "var(--fd-gold, #7A5C1E)" }}> {accent}</em>}
            {tail}
          </h1>
          {subtitle && (
            <div style={{ marginTop: 10, maxWidth: 560, fontSize: "0.92rem", color: "var(--fd-muted, #4A5872)", lineHeight: 1.55 }}>
              {subtitle}
            </div>
          )}
        </div>
        {aside && <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>{aside}</div>}
      </header>
      <div
        aria-hidden="true"
        style={{ position: "relative", zIndex: 1, marginTop: 14, height: 1, background: "linear-gradient(90deg, #081A35 0%, transparent 70%)" }}
      />
    </div>
  );
}
