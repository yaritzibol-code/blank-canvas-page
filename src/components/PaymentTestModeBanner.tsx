/** Banner que avisa cuando el checkout corre en modo prueba. */
const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) return null;
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FDE68A", padding: "8px 16px", textAlign: "center", fontSize: 13, color: "#92400E", fontWeight: 600 }}>
        Estás en modo de prueba — usa tarjeta 4242 4242 4242 4242 para simular el pago.
      </div>
    );
  }
  return null;
}
