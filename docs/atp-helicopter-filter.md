# Conteo del selector ATP sin helicópteros

El cuestionario ya excluía las preguntas mediante `esPreguntaHelicoptero`, pero
el selector conservaba el total de todas las preguntas al activar la casilla.
Ahora pide únicamente conteos agregados de ATP sin helicópteros y actualiza las
filas de capítulos, el total seleccionado, los límites de cantidad y “Todas”.

La consulta reproduce las señales del filtro del cuestionario, incluida la
sección Helicopter Regulations y las referencias fuera de esa sección. “Rotor
clouds” permanece disponible. Solo cuenta preguntas publicadas y requiere una
sesión autenticada; no entrega contenido del banco.

Mientras se calcula el conteo no se permite iniciar una sesión. Si la consulta
falla, se informa el error sin mostrar un total sin filtrar como si fuera correcto.
Un resultado vacío equivale a cero preguntas, sin recurrir al catálogo.

## Verificación

- `node tests/atp-fixed-wing-counts.mjs`: reglas SQL y cliente coinciden en 372
  casos; resultados vacíos permanecen en cero.
- `node tests/atp-regulations-2026.mjs`: 363 preguntas de Regulations; 21 se
  excluyen y quedan 342.
- Migración aplicada en Cloud: la consulta de Regulations devuelve total 363,
  sin helicópteros 342; reconoce Helicopter Regulations y conserva rotor clouds.

Esta corrección no modifica ni añade preguntas. El capítulo 2 permanece pendiente.
