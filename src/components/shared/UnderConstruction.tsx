import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { useSessionUser } from "@/lib/store";
import type { ComponentType } from "react";

interface Props {
  moduleName: string;
  description?: string;
}

/**
 * Pantalla "en construcción" para módulos que aún no están habilitados para
 * estudiantes. Sólo admins pueden entrar al módulo real; el resto ve esto.
 */
export function UnderConstruction({ moduleName, description }: Props) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 20,
          padding: 40,
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "hsl(var(--primary) / 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 32,
          }}
        >
          🚧
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>{moduleName}</h1>
        <p style={{ fontSize: 15, color: "hsl(var(--muted-foreground))", margin: "0 0 24px", lineHeight: 1.6 }}>
          {description ??
            "Este módulo está en construcción. Estamos afinando la experiencia y estará disponible muy pronto."}
        </p>
        <Link
          to="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 12,
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <Icon name="ArrowLeft" size={16} />
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}

/**
 * HOC que muestra `<UnderConstruction />` a todo el mundo excepto admins.
 * Se usa para envolver la ruta de módulos temporalmente bloqueados.
 */
export function adminOnly<P extends object>(
  Component: ComponentType<P>,
  moduleName: string,
  description?: string,
): ComponentType<P> {
  const Wrapped = (props: P) => {
    const user = useSessionUser();
    if (user?.role !== "admin") {
      return <UnderConstruction moduleName={moduleName} description={description} />;
    }
    return <Component {...props} />;
  };
  Wrapped.displayName = `AdminOnly(${moduleName})`;
  return Wrapped;
}
