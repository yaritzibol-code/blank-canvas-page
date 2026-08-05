# Página de gracias `/gracias` + conversión de Google Ads

## Respuesta corta

Hoy el usuario aterriza en `https://flightpath.mx/checkout/return?session_id=...`, una pantalla sobria que confirma el pago y salta al dashboard a los ~1.8 s. Sirve, pero no es una buena URL de conversión: lleva parámetros variables y desaparece rápido. Vamos a crear una URL fija y bonita:

**URL de conversión: `https://flightpath.mx/gracias`**

## Qué se construye

### 1. Nueva página `/gracias`
Landing de agradecimiento con el mismo lenguaje visual de la homepage (paleta actual intacta: vino `#6C0820`, azul tinta `#22375C`, fondo `#F7F9FC`, Bricolage Grotesque + Manrope):

- Fondo con el mismo campo de aviones (`PlaneField`) y grano suave de la landing.
- Héroe: "Bienvenido a bordo" con badge "Pago confirmado", y **Yaris y Pathy** apareciendo juntas con la animación de rebote/meneo que ya existe en la homepage.
- Tarjeta de resumen: plan contratado (mensual o anual) y estado de activación, en vivo mientras se confirma con el proveedor de pagos.
- Tres pasos siguientes en tarjetas tipo cabina: "Completa tu perfil", "Haz tu primer cuestionario", "Pregúntale a Yaris".
- CTA principal "Entrar a mi dashboard" y secundario a Línea Aérea.
- Mobile-first, con tipografía fluida y áreas de toque de 44px+.

### 2. Redirección del checkout
El retorno de Stripe seguirá llegando a `/checkout/return?session_id=...` (ahí vive la lógica de verificación). En cuanto la suscripción queda activa, en lugar de mandar al dashboard, redirige a `/gracias` con el ciclo del plan. Así Google Ads siempre ve la misma URL limpia tras una compra real y no ante un pago fallido.

### 3. Disparo de la conversión
- Se añade el snippet global de Google Ads (gtag) en el head del sitio, activo sólo en producción.
- En `/gracias` se dispara el evento de conversión una sola vez por sesión de pago (guardado por `session_id` para no duplicar si el usuario recarga), con valor y moneda MXN del plan comprado.
- El ID de conversión y la etiqueta quedan como variables de configuración: mientras no las tengas, el snippet queda inerte y no rompe nada. Cuando me pases `AW-XXXXXXXXX` y la etiqueta, sólo se rellenan.

### 4. SEO
`/gracias` se marca `noindex` y se excluye del sitemap: es una página de post-conversión, no debe aparecer en búsqueda.

## Detalles técnicos

- Nueva ruta `src/routes/gracias.tsx` con `validateSearch` para `plan` y `session_id`, `head()` con `robots: noindex`.
- `src/routes/checkout.return.tsx`: cambia el `navigate({ to: "/dashboard" })` del estado activo por `navigate({ to: "/gracias", search: { ... } })`.
- gtag base en `src/routes/__root.tsx` (scripts en `head`), sólo si el ID está configurado.
- Helper `src/lib/ads.ts` con `trackPurchase({ value, currency, transactionId })` y de-duplicación vía `sessionStorage`.
- Reutiliza `PlaneField`, `YarisAvatar` y el asset de Pathy ya existentes; sin dependencias nuevas.
- `src/routes/sitemap[.]xml.ts` sin cambios (no se agrega `/gracias`).

## Lo que necesito de ti después

El ID de conversión `AW-XXXXXXXXX` y la etiqueta (`send_to`) para activar el disparo real. Todo lo demás queda listo desde ya.
