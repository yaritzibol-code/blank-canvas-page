# Módulo "Manuales de Aeronave" — 737 MAX FCOM (2,500 preguntas)

Nuevo módulo en el sidebar del dashboard, hermano de CIAAC y Línea Aérea, pensado para crecer con más equipos (E190, A320) sin rehacer nada.

## Contenido que se sube

9 capítulos del *737 MAX Flight Crew Operations Manual* (D6-27370-MAX-AMX Rev.16), 2,500 preguntas en total:

| Cap. | Título | Preguntas |
|---|---|---|
| 1 | Limitaciones y procedimientos normales | 250 |
| 2 | Procedimientos suplementarios | 250 |
| 3 | Rendimiento para despacho | 250 |
| 4 | Rendimiento en vuelo | 250 |
| 5 | Célula, sistemas de aire, antihielo y protección contra incendio | 300 |
| 6 | Vuelo automático, controles de vuelo, comunicaciones y eléctrico | 400 |
| 7 | Motores, APU, combustible, hidráulicos y tren | 250 |
| 8 | Instrumentos de vuelo y pantallas | 250 |
| 9 | Gestión de vuelo, navegación y sistemas de advertencia | 300 |

Cada pregunta trae 3 opciones, respuesta correcta, referencia al manual (página PDF y ref. FCOM), cita textual y rationale completo (por qué correcta, por qué cada distractor, regla clave, trampa del examen). Todo eso se convierte al mismo formato de explicación que ya usan ATP, Handbook y Legislación, para que Yaris y el análisis de Pathy lo puedan leer igual.

## Cómo funciona el módulo

- **Sidebar:** entrada nueva "Manuales de Aeronave".
- **Pantalla del módulo:** tarjeta del equipo (Boeing 737 MAX — FCOM) y, al entrar, los 9 capítulos como tarjetas con su conteo, más un modo "repaso general" mezclado.
- **Cuestionario y simulador:** exactamente el mismo motor que Línea Aérea (selección de cantidad de preguntas, Yaris modo socrático, "Explícamelo Yaris", extras, debrief final de Pathy).
- **Progreso y analítica:** el avance por capítulo aparece en Análisis, en el perfil del estudiante y en el audit del panel admin, como bloque propio separado de CIAAC y Línea Aérea.

## Acceso

- Usuarios gratis: hasta 50 preguntas de este módulo en total; al agotarlas sale el popup de mejora (y el flujo de oferta flash que ya existe).
- Usuarios de pago: acceso completo.

## Protección del contenido

Igual que el resto del banco: las preguntas no se exponen públicamente; se leen solo por el RPC protegido que ya usa la app, sin acceso anónimo.

## Detalles técnicos

- Importación a `content` (collection `questions`) con `fuente = "B737MAX"`, `capitulo` 1–9, `seccion` y `materia` mapeada a las materias existentes (sistemas, operaciones, navegación, rendimiento…), IDs estables `B737MAX-FCOM-CHxx-nnnn` para que reimportar sea idempotente.
- Metadata nueva en `src/lib/store/aeronave-meta.ts` (equipos + capítulos + totales), en la misma línea que `linea-aerea-meta.ts`.
- Ruta `src/routes/dashboard/manuales.tsx` reusando `BancoScreen` con un track nuevo (`banco=ac`), sin duplicar el motor de cuestionario.
- Filtros del panel admin y de Pathy actualizados para incluir la nueva fuente y sus capítulos.
- Cuota gratis integrada en `free-quota.server.ts` con su propio contador.
