# Edge functions — pagos con Stripe

Terreno preparado para la app de paga. El flujo queda operativo al configurar
dos secretos en Lovable Cloud (o `supabase secrets set` si usas la CLI):

| Secreto | Qué es | Dónde obtenerlo |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_test_…` para pruebas) | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_PRICE_ID` | Precio recurrente por defecto (`price_…`) del plan completo | Stripe → Products → tu plan → Pricing |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta
Lovable Cloud automáticamente.

## Funciones

- **create-checkout** — crea la sesión de Stripe Checkout (suscripción) para el
  usuario autenticado y devuelve la URL de pago. Acepta `{ priceId }` opcional
  en el body para ofrecer varios planes.
- **check-subscription** — consulta Stripe, actualiza la tabla `subscribers`
  (service role) y devuelve `{ subscribed, subscription_tier, subscription_end }`.
  La app la llama al entrar al dashboard; así el plan local (`basica`/`paga`)
  refleja Stripe sin necesidad de webhooks.
- **customer-portal** — abre el portal de facturación de Stripe (gestionar
  tarjeta, cancelar). En modo test hay que activar el portal una vez en
  Stripe → Settings → Billing → Customer portal.

## Cliente

El helper `src/lib/store/billing.ts` expone `startCheckout()`,
`openCustomerPortal()` y `refreshSubscription()`. El botón "Desbloquear acceso
completo" del `UpgradeModal` ya intenta el checkout y, si Stripe aún no está
configurado, cae a la sección de precios de la landing.

## Pendiente al activar pagos (fase 2)

- Decidir precios reales y crearlos en Stripe (mensual/anual).
- Webhook `customer.subscription.deleted/updated` para bajas inmediatas
  (hoy las bajas no degradan el plan automáticamente; ver `billing.ts`).
- Página de planes dentro del dashboard que llame a `startCheckout(priceId)`.
