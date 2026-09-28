# ATP — ASA Test Prep 2025–2026, capítulos restantes

## Alcance

Reemplaza las preguntas publicadas de los capítulos 2, 3, 6, 7 y 8. Excluye
los capítulos 4 y 5. La fuente es el libro abierto en ASA Library,
ISBN 978-1-64425-427-1. Conserva en inglés enunciados, tres opciones, respuestas
y explicaciones. Registra número ASA, capítulo, sección, página, categorías y
edición. No importa los párrafos de teoría ni las tablas de enseñanza.

| Capítulo | Nuevas preguntas | Disponibles sin helicópteros |
| --- | ---: | ---: |
| 1 Regulations, conservado | 363 | 342 |
| 2 Equipment, Navigation, and Facilities | 213 | 207 |
| 3 Aerodynamics | 117 | 92 |
| 6 Flight Operations | 216 | 212 |
| 7 Emergencies, Hazards, and Flight Physiology | 87 | 87 |
| 8 Meteorology and Weather Services | 230 | 230 |
| Total de capítulos incluidos | 1,226 | 1,170 |

Las 863 preguntas nuevas tienen claves válidas y no duplican números ASA de
Regulations. El filtro actual también reconoce referencias fuera de las
secciones Helicopter Regulations y Helicopter Aerodynamics. No excluye la
referencia meteorológica a rotor clouds.

Las filas anteriores publicadas quedan `oculta`, con sus IDs y referencias
históricas. No se borran. Solo la edición nueva permanece en el banco activo.
Las cuatro preguntas de Regulations que tienen figuras reciben enlaces SVG;
sus enunciados, opciones, claves y explicaciones permanecen iguales.

## Figuras y revisión

`supabase/storage/atp-images/manifest-2026.json` registra 78 archivos, páginas
de origen, preguntas que los usan, tamaño y SHA-256. Las figuras numeradas y
leyendas provienen del suplemento de examen
[FAA-CT-8080-7D](https://www.faa.gov/sites/faa.gov/files/training_testing/testing/supplements/atp_akts.pdf),
con sus fechas originales. Son 75 enlaces a figuras/leyendas en 65 páginas
distintas, incluidas las siete figuras de Regulations.

Cada SVG muestra una sola figura o leyenda completa, recortada con un margen
de protección alrededor del gráfico, sus notas y su rótulo. Las figuras que
comparten una página se separan por número. Los paneles de una misma figura
permanecen juntos. Se conservan trazos vectoriales y la resolución nativa
de cada imagen. Las imágenes PNG internas se comprimen sin pérdida; se comprobó
que sus píxeles RGBA fueran idénticos antes y después. No se reconstruyen cartas,
no se sustituyen por cartas actuales y no se aumenta artificialmente la
resolución. Se revisaron los 75 recortes contra sus 65 páginas de origen: rótulos,
notas y bordes completos. La carta de Tucson Figure 361 se comprobó
también al 200% en el navegador, con texto y trazos nítidos.
La vista del cuestionario utiliza `object-fit: contain` y abre el original
desde el enlace de la figura.

Tres diagramas están dentro del libro: 8206, 9751 y 9737. En 9737 se conserva
el gráfico de ASA con los puntos 1-12, pistas, calles, West Ramp y Control
Tower; sus etiquetas vectoriales permanecen nítidas al ampliar.

Para 8206 y 9751 se localizaron los mismos instrumentos en el manual original
[FAA-H-8083-6](https://www.govinfo.gov/content/pkg/GOVPUB-TD4-PURL-gpo46261/pdf/GOVPUB-TD4-PURL-gpo46261.pdf),
Figures 2-2 y 5-9, páginas PDF 19 y 89. Conservan la indicación de 64 KT y el
mapa con pérdida de posición y el aviso Nav Source Not Communicating. La cinta
8206 conserva sus números y marcas G/Y/X/R como vectores; se retiraron solo
los globos didácticos externos del manual. El mapa 9751 conserva completo el
marco, botones, navegación y aviso. Ambos se revisaron a tamaño normal y al
200%. Algunos elementos internos del mapa son mapas de bits del original y
pueden suavizarse a ampliaciones grandes; SVG no inventa detalle inexistente.

## Correcciones registradas

- 9831, p. 3-30: el índice impreso dice `9381 [C]`; se vincula la C impresa a
  9831, el número real. La pregunta 9381 del capítulo 2 conserva su propia A.
- 8802, p. 6-56: la explicación dice 111 pies, mientras la carta Figure 257B
  y la opción correcta B dicen 115. Se corrige solo ese valor de la explicación.
- 9769, p. 2-10: se retiran los dígitos sueltos `870` anexados a `flight decks`.

Cada corrección conserva su texto/clave original y su justificación en la fila.

## Verificación y aplicación

- `node tests/atp-remaining-2026.mjs`: conteos, claves, clasificación de
  helicópteros, variantes ASA, separación de tablas y figuras, archivos y hashes.
- `node tests/atp-regulations-2026.mjs` y `node tests/atp-fixed-wing-counts.mjs`:
  importación original y correspondencia del filtro SQL/cliente.
- TypeScript y compilación completa de cliente/servidor: correctos.
- Carga inicial verificada en almacenamiento: 78 SVG, todos `image/svg+xml`,
  110,638,109 bytes. Después de esta comprobación se mejoraron las figuras
  8206 y 9751 con los originales FAA. Después se recortaron individualmente
  las 75 figuras/leyendas del suplemento y se versionaron como `-unit.svg`;
  esas 75 versiones y los dos archivos `-faa.svg` requieren carga antes de
  aplicar la migración. El manifiesto actualizado
  mantiene 78 archivos activos y sus SHA-256.

Para repetir la aplicación:

1. Subir los archivos del manifiesto al bucket privado existente `atp-images`.
   `scripts/upload-atp-2026-images.mjs` comprueba proyecto y SHA-256 de cada
   archivo local y remoto usando las credenciales del entorno autorizado.
2. Aplicar `supabase/migrations/20260928210000_atp_2026_remaining_chapters.sql`.
   La transacción comprueba las imágenes y los cuatro registros existentes
   de Regulations antes de reemplazar preguntas. Si falta una figura o falla
   un conteo, revierte la operación completa.
3. Verificar la tabla y los agregados del selector; confirmar que no quedan
   preguntas antiguas publicadas en los capítulos reemplazados.
4. Comparar los bancos fuera de ATP/1,2,3,6,7,8, incluidos ATP/4 y ATP/5.
   Antes de la aplicación: 8,193 filas; huella MD5
   `6d1aea1db9e27f31a75d033639153442`, calculada sobre IDs y JSON ordenados.

La carga inicial está terminada. La carga de los recortes individuales y
las dos figuras mejoradas,
la aplicación de la migración y su comprobación en producción están
pendientes de recuperar Chrome. Integrar
los archivos en GitHub por sí solo no ejecuta la migración de datos.
