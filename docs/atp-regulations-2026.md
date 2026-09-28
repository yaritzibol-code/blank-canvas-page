# ATP Regulations — ASA 2025–2026

## Alcance

Actualiza exclusivamente las preguntas de ATP, capítulo 1 Regulations. La fuente
es el libro ASA Airline Transport Pilot Test Prep 2025–2026 abierto por la autora
en ASA Library, ISBN 978-1-64425-427-1. Se conservan los enunciados y las tres
opciones en inglés, la clave impresa A/B/C y la explicación del reactivo. No se
importa la teoría del capítulo ni se editan los Learning Paths.

Se capturaron todas las páginas con preguntas, desde 1-4 hasta 1-92, mediante el
lector visible. Los números ASA, incluida cada variante con sufijo, se conservan
en `sourceQuestionId`; cada fila también registra edición, página y categorías.
Los saltos de línea de palabras y las continuaciones entre columnas se unen.
Las tablas explicativas se separan de las opciones de respuesta.

## Verificación

- 363 preguntas y 363 claves, sin números ASA duplicados.
- Las 363 preguntas tienen tres opciones y una respuesta válida.
- 14 preguntas pertenecen a Helicopter Regulations.
- El filtro real `esPreguntaHelicoptero` identifica 21 preguntas en total: las
  14 de esa sección y 7 con referencias a helicópteros fuera de ella. Al marcar
  «Quitar las preguntas de helicópteros» quedan 342. Se conserva el criterio
  existente, incluida su búsqueda en opciones, citas y explicaciones.
- Cuatro preguntas enlazan siete imágenes verificadas del suplemento FAA.
- Prueba: `node tests/atp-regulations-2026.mjs` (Node 24 o compatible con
  eliminación de tipos TypeScript). No hay cambios de dependencias.

El banco en producción no se ha leído ni modificado desde esta tarea. Se ha
comprobado su esquema en el repositorio: `public.content`, colección `questions`,
con `fuente`, `capitulo`, `seccion` e `imagenes` dentro de `data`. Los conteos de la
captura proporcionada por la autora son datos del banco anterior; los valores
estáticos del catálogo son solamente conteos de respaldo cuando la nube no
responde. Los demás capítulos mantienen esos valores previos.

## Corrección editorial identificada

La pregunta 8834 de la página 1-88 aparece incompleta incluso en la imagen del
libro: termina en «20 to». Se completa el umbral del enunciado como «20 or more
seats, must» a partir de su propia referencia, [14 CFR 135.178](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-C/section-135.178).
Se mantienen las opciones impresas y la respuesta B. La fila conserva el texto
original, la justificación de la corrección y el enlace de respaldo.

## Figuras

Fuente oficial: [FAA-CT-8080-7D](https://www.faa.gov/sites/faa.gov/files/training_testing/testing/supplements/atp_akts.pdf).
Se exportan las páginas completas a 200 dpi, con rótulo y contexto originales.
Son las figuras del suplemento de examen referidas por el libro, incluidas sus
fechas impresas. No se sustituyen por cartas operacionales actuales.

| Pregunta ASA | Archivos del bucket `atp-images` |
| --- | --- |
| 9618 | Figure 301 |
| 9636 | Legend 12 |
| 9668 | Legend 12 y Figure 185A |
| 9638 | Figures 186, 187, 188 y 188A |

Los siete PNG y un manifiesto de páginas del PDF están en
`supabase/storage/atp-images/`. `imagenes` conserva el formato de nombres de
archivo que ya consume `QuestionImages`; el bucket sigue siendo privado y se
usan las políticas existentes para usuarios autenticados.

## Aplicación

1. Desde el entorno de despliegue autorizado, subir las siete imágenes a
   `atp-images`. El script `scripts/upload-atp-regulations-images.mjs` usa
   `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` del entorno, verifica el proyecto
   configurado y comprueba el contenido de cada archivo después de subirlo.
   También pueden subirse los siete PNG desde el administrador del bucket.
2. Aplicar `supabase/migrations/20260928190000_atp_2026_regulations.sql` con el
   flujo normal de migraciones del proyecto o desde su editor SQL autorizado.
3. Comprobar que `get_bank_counts` devuelve 363 preguntas publicadas en ATP/1,
   que el cuestionario deja 342 al activar la exclusión de helicópteros y que
   se muestran todas las imágenes de 9618, 9636, 9668 y 9638.

La migración comprueba que las siete imágenes estén subidas **antes** de cambiar
el banco. Publica las 363 filas nuevas y oculta las filas anteriores de ATP/1
conservando sus IDs, datos y referencias históricas. No borra filas, no cambia
otros capítulos ni fuentes y puede repetirse sin duplicar preguntas. Si falta
una figura o falla el conteo final, la transacción no modifica el banco.

La aplicación remota y la publicación de la rama requieren acceso autorizado;
preparar estos archivos por sí solo no actualiza la plataforma en producción.
