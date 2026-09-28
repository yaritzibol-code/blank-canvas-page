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
de origen, preguntas que los usan, tamaño y SHA-256. Todas las imágenes se
descargaron directamente del libro abierto en
[ASA Reader](https://library.asa2fly.com/reader/#/reader). El apartado final
«FAA-CT-8080-7D Figures» contiene las 75 figuras y leyendas necesarias en 65
páginas distintas, incluidas las siete figuras de Regulations. El manifiesto
registra también la página del lector y la huella de cada SVG original.

Cada SVG muestra una sola figura o leyenda completa, recortada con un margen
de protección alrededor del gráfico, sus notas y su rótulo. Las figuras que
comparten una página se separan por número. Los paneles de una misma figura
permanecen juntos. Se conservan trazos vectoriales y la resolución nativa
de cada imagen. El recorte cambia solo el marco visible del SVG; conserva
las imágenes y los elementos vectoriales originales, sin comprimirlos ni
reconstruirlos. Se renderizaron los SVG completos antes de delimitar cada
recorte para conservar también los rótulos vectoriales. Se revisaron los 75
recortes: rótulos, notas y bordes completos. La carta de Tucson Figure 361
se revisó también ampliada al doble, incluida toda la descripción de salida.
La vista del cuestionario utiliza `object-fit: contain` y abre el original
desde el enlace de la figura.

Tres diagramas están dentro del libro: 8206, 9751 y 9737. En 9737 se conserva
el gráfico de ASA con los puntos 1-12, pistas, calles, West Ramp y Control
Tower; sus etiquetas vectoriales permanecen nítidas al ampliar.

8206 y 9751 también conservan exclusivamente sus imágenes del libro ASA,
páginas del lector 122 y 135. La cinta muestra 64 KT y sus marcas G/Y/X/R;
el mapa conserva el marco, los controles y el aviso Nav Source Not
Communicating. El original ASA de 9751 tiene poca resolución: al ampliar
se ve borroso. Esta limitación se comunicó al usuario. El formato SVG
conserva el contenido original, pero no convierte sus mapas de bits en vectores.
No se usan los archivos de otras fuentes que se habían preparado anteriormente.

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
- El manifiesto contiene 75 recortes `atp_2026_asa_…-unit.svg` y tres
  diagramas originales `atp_2026_question-….svg`. Todos son `image/svg+xml`.
- Producción, 28 de septiembre de 2026: los 78 archivos coinciden en tamaño,
  tipo y MD5 con los archivos locales; total 19,593,872 bytes.
- Publicación verificada: 1,226 preguntas de la edición nueva, todas con tres
  opciones, clave válida y explicación. 1,170 disponibles sin helicópteros.
- Reemplazo verificado: 863 nuevas publicadas, 879 anteriores ocultas,
  ninguna pregunta anterior activa y ningún borrador de esta carga pendiente.
- Enlaces activos verificados: 78 archivos distintos; ninguno faltante o de
  una fuente distinta de ASA. Los otros 8,193 registros conservan la misma
  huella MD5 antes y después.

La carga se realizó en 22 grupos como borradores para evitar la limitación de
tamaño del editor web. Cada grupo comprobó igualdad de todo su JSON con los
datos preparados. La transacción final comprobó las huellas de las 863 filas,
los archivos y los conteos antes de publicar y ocultar las preguntas antiguas.
El resultado coincide con la migración completa incluida en el repositorio.

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

La migración de datos está aplicada y verificada en producción. Integrar los
archivos en GitHub por sí solo no ejecuta la migración de datos.
