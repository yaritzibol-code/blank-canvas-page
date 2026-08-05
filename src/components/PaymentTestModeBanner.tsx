/**
 * Aviso de que el checkout corre contra la cuenta de pruebas de Stripe.
 *
 * Sólo lo ve la administradora: para una estudiante, ver "usa la tarjeta
 * 4242…" convierte una compra real en algo que parece un simulacro. Si el
 * aviso aparece en producción es señal de que falta poner la llave `pk_live_`.
 */
import { useSessionUser } from "@/lib/store";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

/** true cuando los cobros van contra la cuenta de pruebas. */
export function isStripeTestMode(): boolean {
  return clientToken?.startsWith("pk_test_") === true;
}

export function PaymentTestModeBanner() {
  const user = useSessionUser();
  if (!isStripeTestMode() || user?.role !== "admin") return null;
  return (
    <div
      style={{
        background: "#FEF3C7",
        borderBottom: "1px solid #FDE68A",
        padding: "8px 16px",
        textAlign: "center",
        fontSize: 13,
        color: "#92400E",
        fontWeight: 600,
      }}
    >
      Cuenta de pruebas de Stripe — los cobros no son reales (tarjeta 4242 4242 4242 4242). Sólo tú
      ves este aviso.
    </div>
  );
}
