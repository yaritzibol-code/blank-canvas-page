/** Enlace de retorno inteligente: al dashboard si hay sesión, si no al login. */
import { Link } from "@tanstack/react-router";
import { useSessionUser } from "@/lib/store/hooks";

export function BackLink({ style }: { style?: React.CSSProperties }) {
  const user = useSessionUser();
  const to = user ? "/dashboard" : "/login";
  const label = user ? "← Volver al dashboard" : "← Volver al login";
  return (
    <Link
      to={to}
      style={{
        color: "#3D5D91",
        fontWeight: 700,
        fontSize: 14,
        textDecoration: "none",
        ...style,
      }}
    >
      {label}
    </Link>
  );
}
