# Popup de conversión del plan gratis (20% → 50% → encuesta)

Escalera para alumnos en plan gratis que **nunca han pagado** (sin suscripción
previa ni inscripción pagada). Los días se cuentan como días distintos con
actividad en `activity_sessions`, en hora de la Ciudad de México.

| Momento | Qué ve el alumno | Si rechaza (botón, × o Esc) |
| --- | --- | --- |
| 2.º día con actividad | Popup grande: 20% en la inscripción de Pro, válido 24 h | Oferta relámpago de siempre (inscripción a mitad de precio), sólo 10 minutos |
| 3.er día con actividad (otro día distinto) | El mismo popup del 20% | Mini encuesta: "¿Por qué no quieres FlightPath Pro por ahora?" |

- Cada popup sale **una sola vez**: el servidor lo anota en
  `profiles.data.ofertaPro` antes de mostrarlo.
- La relámpago sigue siendo de una sola vez por cuenta: si el alumno ya la
  usó (por ejemplo, abandonando el pago antes), el rechazo sólo cierra el popup.
- No interrumpe pagos, facturación, COMPASS ni la RTARI, y espera a que no
  haya otro diálogo abierto.

## Dónde ver los resultados

En el panel de actividad (embudo de hitos) aparecen estos pasos:

- `oferta_pro_1_vista`, `oferta_pro_1_aceptada`, `oferta_pro_1_rechazada`
- `oferta_pro_2_vista`, `oferta_pro_2_aceptada`, `oferta_pro_2_rechazada`
- `oferta_pro_motivo_<motivo>`: `caro`, `no_lo_necesito`, `examen_lejos`,
  `sigo_probando`, `no_convence`, `otro` (el texto libre de "otro" va en la
  metadata del evento y en `profiles.data.ofertaPro.motivo`).

En la bitácora de facturación, `checkout_session_created` registra
`discount_coupon` cuando el checkout salió con descuento.

## Ajustes

Todo vive en `src/lib/oferta-pro.ts`: porcentaje (`OFERTA_PRO_PCT`), vigencia
del 20% (`OFERTA_PRO_VIGENCIA_MS`), minutos de la relámpago tras el rechazo
(`FLASH_RECHAZO_MIN`) y las opciones de la encuesta (`MOTIVOS_RECHAZO`).
Las reglas se prueban con `node tests/oferta-pro.cjs`.
