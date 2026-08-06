# Auditoría del flujo de pago — hallazgos y correcciones

Revisé el recorrido completo: `/precios` → login → `/dashboard/planes` → checkout embebido → `/checkout/return` → `/gracias` → `/dashboard/facturacion`, más el webhook y la reconciliación con Stripe. Lo que sigue está verificado contra el código y contra la bitácora real de facturación en la base.

## Lo que está roto de verdad (evidencia en datos)

**1. El plan "parpadea": Pro se degrada solo a Básica.**
En la bitácora hay **7,516 eventos `plan_changed` de `basica` → `paga` para solo 2 usuarios**, todos con la suscripción en `active`. Ahora mismo la cuenta `roberto.daniel@hotmail.com` tiene suscripción **activa en Stripe** y su perfil dice **`plan: basica`**.

Causa: hay tres escritores del mismo campo y el último que gana es el equivocado. El servidor (`syncMyPlan` y el webhook) escribe `plan: paga` en `profiles.data`, pero el espejo local del navegador (`pushProfiles` en `src/lib/store/sync.ts`) vuelve a subir el perfil completo con el `plan` viejo que traía en localStorage. En el siguiente arranque el servidor vuelve a "cambiarlo" a paga, y así en bucle.
Efecto para el usuario: pierde acceso Pro al azar y ve candados aunque esté pagando.

**2. Reconciliación fallando contra Stripe.**
`plan_reconciliation_failed` aparece 363 veces con mensajes `byMetadata.data is not iterable`, `customers.data is not iterable`, `list.data is not iterable` e `Invalid JSON received from the Stripe API`. Son respuestas rotas/limitadas del API, consecuencia directa del punto 3.

**3. Se llama a Stripe muchísimo más de lo necesario.**
`syncMyPlan` corre en **cada montaje del dashboard**, en cada visita a Planes, y en bucle en la pantalla de retorno. Cada llamada dispara hasta 6 peticiones a Stripe (search de suscripciones, search de clientes, list por cliente, retrieve de sesión). Resultado: 3,500 `plan_sync` en producción, rate limits y las fallas del punto 2.

**4. Abrir el checkout hace hasta 21 llamadas a Stripe antes de mostrar nada.**
Para saber si ya se pagó la inscripción, `createCheckoutSession` lista las últimas 20 sesiones y pide los line items de cada una. De ahí la pantalla larga de "Preparando tu pago seguro". Además es frágil: si el usuario ya tiene más de 20 sesiones, **se le puede volver a cobrar la inscripción**.

**5. `getMyInvoices` crea clientes de Stripe fantasma.**
La pantalla de facturación llama a `resolveOrCreateCustomer`, que **crea un Customer en Stripe** aunque el usuario nunca haya pagado. Solo por abrir Facturación se ensucia el catálogo de clientes.

## Fricciones y "giveaways" de UX

- **Retorno del pago ambiguo:** si el sondeo de 21 s no alcanza, la pantalla muestra un avión y "Recibimos tu pago… refresca el dashboard". Al usuario que acaba de pagar eso le suena a error.
- **Errores crudos de Stripe en inglés** llegan tal cual a la interfaz (el caso real registrado: "Automatic tax calculation in Checkout requires a valid address on the Customer…"). Es la señal más clara de algo mal codeado.
- **El cupón vive en dos lugares distintos:** hay campo de cupón en Planes, pero cuando el checkout llega desde `/precios` con `?checkout=1` se salta esa pantalla y el campo nunca se ve.
- **El portal de Stripe abre en pestaña nueva** desde un `await`, así que los bloqueadores de pop-ups lo cancelan sin mensaje.
- **Sin sesión, comprar manda a `/login`**, no a registro, aunque quien compra por primera vez casi siempre es cuenta nueva.
- **`past_due` no cuenta como Pro** en la vista de Planes pero sí en el servidor: un usuario con cobro reintentándose ve la tabla de precios como si no tuviera nada.
- **Ambiente cruzado:** el preview usa sandbox y producción usa live; en la vista previa un suscriptor real siempre aparece sin plan. No es un bug, pero hoy no se avisa en ningún lado.

## Correcciones propuestas

1. **Un solo dueño del plan.** Quitar `plan`, `planNombre`, `accessStatus`, `accessEnd` y `accessStart` del payload que sube `pushProfiles`, y hacer que el cliente siempre lea esos campos del perfil de la nube. Con eso desaparece el parpadeo.
2. **Sincronizar con criterio.** `syncMyPlan` solo cuando hay razón: retorno de checkout, pantalla de facturación/planes, o si pasaron más de N minutos desde la última sincronización (marca en `localStorage`). Fuera del montaje del dashboard.
3. **Reconciliación más barata y tolerante.** Usar el `stripe_customer_id` ya guardado antes de recurrir a búsquedas, envolver cada llamada de Stripe y no dar por perdido todo el proceso si una falla.
4. **Inscripción sin barrido.** Guardar en el perfil/base una marca de "inscripción pagada" (la escribe el webhook al liquidarse) en lugar de recorrer 20 sesiones; eso quita el riesgo de recobro y acelera la apertura del checkout.
5. **Facturación sin efectos secundarios.** `getMyInvoices` usa el `stripe_customer_id` guardado o busca; si no existe, devuelve lista vacía. Nunca crea clientes.
6. **Mensajería honesta en el retorno:** estado "pago recibido, activando acceso" con botón para ir al dashboard, y traducción de los errores conocidos de Stripe a español claro.
7. **Detalles de conversión:** cupón visible también en el flujo directo desde `/precios`, botón de compra sin sesión hacia registro conservando el destino, portal abierto con la pestaña preabierta para no morir en el bloqueador, y `past_due` tratado como Pro en la UI.

## Nota técnica

Archivos que se tocan: `src/lib/store/sync.ts` (payload de perfil), `src/lib/payments.functions.ts` (reconciliación, inscripción, facturas), `src/routes/dashboard.tsx` (quitar sync en cada montaje), `src/routes/checkout.return.tsx` (mensajes/estados), `src/routes/dashboard/planes.tsx` y `src/routes/dashboard/facturacion.tsx` (cupón, portal, `past_due`), `src/routes/precios.tsx` (destino sin sesión). Sin cambios de esquema salvo, opcionalmente, la marca de inscripción pagada.
