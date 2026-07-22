/** Página de retorno del checkout embebido de Stripe. */
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FC", fontFamily: FONT, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ background: "#fff", border: "1px solid #E3EAF5", borderRadius: 20, padding: "40px 32px", maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✈️</div>
        <h1 style={{ fontFamily: DISPLAY, color: INK, fontSize: "1.6rem", fontWeight: 800, margin: "0 0 12px" }}>
          {session_id ? "¡Bienvenido a FlightPath Pro!" : "Sin información de pago"}
        </h1>
        <p style={{ color: "#647DA0", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          {session_id
            ? "Tu pago se procesó correctamente. En unos segundos activamos tu acceso Pro."
            : "No encontramos la sesión de pago. Si crees que es un error, escríbenos."}
        </p>
        <Link to="/dashboard" style={{ display: "inline-block", background: "#6C0820", color: "#fff", textDecoration: "none", fontWeight: 700, padding: "12px 24px", borderRadius: 12 }}>
          Ir al dashboard →
        </Link>
      </div>
    </div>
  );
}
