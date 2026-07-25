import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";

interface Props {
  title: string;
  description?: string;
}

/**
 * Aviso de tope del plan Básica.
 *
 * Existe porque estos casos se mostraban con `<UnderConstruction />`: el
 * usuario veía el cartel 🚧 de "módulo en construcción" cuando en realidad
 * había llegado al límite de su plan. Son cosas distintas y la salida también:
 * aquí el destino natural es la página de planes, no volver al dashboard.
 */
export function PlanLimitNotice({ title, description }: Props) {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
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
            color: "hsl(var(--primary))",
          }}
        >
          <Icon n="lock" size={30} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>{title}</h1>
        {description && (
          <p
            style={{
              fontSize: 15,
              color: "hsl(var(--muted-foreground))",
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/dashboard/planes"
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
            Ver planes
            <Icon n="chevR" size={16} />
          </Link>
          <Link
            to="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
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
    </div>
  );
}
