# Embraer 190 (Aeroméxico Connect): las láminas no están ligadas

## Lo que encontré (verificado en la base y en el almacén de imágenes)

El código está bien. El problema es de datos: **ninguna de las 377 preguntas del Embraer 190 tiene una lámina asignada**, aunque las imágenes sí están guardadas.

- En el almacén del E190 hay 23 imágenes: `e190_fig_197.png` … `e190_fig_219.png`.
- En la base, ninguna pregunta del módulo tiene el campo de imágenes (0 de 377). Al importar el cuestionario se perdió esa liga.
- Las preguntas que piden ver una figura son exactamente las numeradas 197 a 219 ("¿A qué corresponde el siguiente símbolo?", "¿Qué significa la siguiente figura?", "¿De qué lado de la siguiente marca debe detenerse una aeronave?"…): 23 preguntas, el mismo número que imágenes hay.

La correspondencia es uno a uno y por número:

```text
q_laof_2_197  ->  e190_fig_197.png
q_laof_2_198  ->  e190_fig_198.png
...
q_laof_2_219  ->  e190_fig_219.png
```

## Qué propongo hacer

1. **Ligar las 23 preguntas con su imagen** siguiendo la numeración de arriba, así el alumno vuelve a ver la figura al contestar.
2. **Verificar una por una** que la figura mostrada corresponde a lo que pregunta el reactivo, y avisarte si alguna no cuadra para que la corrijamos antes de publicarla.
3. **Revisar el resto del módulo**: hay preguntas del 1 al 196 y del 220 en adelante; confirmar contigo si alguna de ellas también debía llevar figura (por ejemplo placas o esquemas de la guía) y, si falta material, decirte exactamente qué imágenes hay que subir y con qué nombre.
4. **Mensaje más honesto cuando falte una lámina.** Hoy aparece "No se pudo cargar la lámina" con un botón de reintentar que no sirve si el archivo no existe; lo cambio para que avise con claridad.
5. **Un tablero de control en administración**: por módulo, cuántas preguntas piden lámina y cuántas de esas láminas existen realmente, para que un hueco así se vea de inmediato.

## Nota sobre el módulo de aviones (737 MAX)

Aprovechando la revisión: ese módulo sí tiene 1,800 preguntas con lámina asignada, pero su almacén está **vacío** (faltan 1,295 archivos como `fcom_p0410_fig02.png`). En cuanto me pases ese paquete de imágenes las subo; no requiere cambios de código.

## Detalle técnico

- Cruce hecho entre `content` (colección `questions`) y `storage.objects`.
- `QuestionImages` resuelve el bucket por `fuente`: `LAOF` → `e190-images`; la firma de URLs y el reintento funcionan correctamente.
- La liga se aplica con una actualización de datos sobre el campo `imagenes` de esas 23 filas; sin migración de esquema.
- Cobertura actual de láminas: ATP 69/69 y Jeppesen 57/57 correctas; 737 MAX 0/1295; E190 0 referencias con 23 archivos disponibles.
