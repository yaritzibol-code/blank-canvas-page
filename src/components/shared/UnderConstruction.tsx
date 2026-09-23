import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { useSessionUser } from "@/lib/store";
import type { FC } from "react";

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
    <div className="fd-unavailable" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "linear-gradient(180deg,#071326 0%,#050F22 100%)",
          border: "1px solid rgba(199,160,82,.35)",
          fontFamily: "'Manrope', sans-serif",
          color: "#FFFFFF",
          borderRadius: 8,
          padding: 40,
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,.45)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(199,160,82,.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "#C7A052",
          }}
        >
          <Icon n="wrench" size={30} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>{moduleName}</h2>
        <p style={{ fontSize: 15, color: "#93A4BF", margin: "0 0 24px", lineHeight: 1.6 }}>
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
            borderRadius: 6,
            background: "linear-gradient(180deg,#C7A052,#8A6A25)",
            color: "#0B1220",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <Icon n="chevL" size={16} />
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
  Component: FC<P>,
  moduleName: string,
  description?: string,
): FC<P> {
  const Wrapped: FC<P> = (props) => {
    const user = useSessionUser();
    if (user?.role !== "admin") {
      return <UnderConstruction moduleName={moduleName} description={description} />;
    }
    return <Component {...props} />;
  };
  Wrapped.displayName = `AdminOnly(${moduleName})`;
  return Wrapped;
}
