# Pagos con Stripe

El flujo de pagos **no** usa edge functions. Vive en el runtime de TanStack:

| Pieza | Dónde |
| --- | --- |
| Checkout embebido, portal y sincronización de plan | `src/lib/payments.functions.ts` |
| Cliente Stripe (gateway de Lovable) | `src/lib/stripe.server.ts` |
| Webhook de Stripe | `src/routes/api/public/payments/webhook.ts` |
| Página de planes (UI del checkout) | `src/routes/dashboard/planes.tsx` |
| Retorno del checkout | `src/routes/checkout.return.tsx` |

Precio Pro: `lookup_key = flightpath_pro_monthly` (ver `src/lib/pricing.ts`).
Las claves (`STRIPE_SANDBOX_API_KEY`, `STRIPE_LIVE_API_KEY`, secretos de
webhook) las inyecta Lovable automáticamente; no hay que configurar
`STRIPE_SECRET_KEY` a mano.
