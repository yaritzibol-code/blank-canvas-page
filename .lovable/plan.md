# Por qué faltan las láminas en varias preguntas

## Lo que encontré (verificado en la base y en el almacenamiento)

El código está bien: las preguntas sí traen el nombre de su lámina y la pantalla la pide al almacén correcto. El problema es que **las imágenes del módulo de aviones (737) nunca se subieron**.

Conteo real de preguntas que referencian una lámina y si esa lámina existe:

| Módulo | Preguntas con lámina | Láminas distintas | Láminas realmente guardadas |
|---|---|---|---|
| Aeronaves 737 MAX | 1,800 | 1,295 | **0** |
| ATP | 168 | 69 | 69 |
| Jeppesen | 286 | 57 | 57 |

El almacén del 737 está completamente vacío (los demás módulos sí tienen sus archivos). Por eso justo esas 1,800 preguntas muestran "No se pudo cargar la lámina".

Dos datos más:
- Embraer 190 tiene 23 imágenes guardadas, pero **ninguna** de sus 377 preguntas apunta a una lámina.
- Los módulos PHAK, Legislación, Anexo 10 y el banco del CIAAC no tienen láminas en ninguna pregunta (nunca se cargaron con imagen).

## Qué propongo hacer

1. **Subir las 1,295 láminas del 737.** Las preguntas ya esperan nombres como `fcom_p0410_fig02.png`. En cuanto me pases el paquete de imágenes con esos nombres, las cargo y las 1,800 preguntas quedan completas de inmediato — no hay que tocar código.
2. **Mensaje más honesto mientras tanto.** Hoy dice "No se pudo cargar la lámina" con un botón de reintentar que no puede funcionar si el archivo no existe. Lo cambio para que, cuando la lámina simplemente no esté disponible, avise con calma y no invite a reintentar en vano.
3. **Revisar el Embraer 190.** Confirmar contigo si esas 377 preguntas debían llevar lámina; si sí, las ligo a las 23 imágenes existentes o me pasas las que falten.
4. **Una vista de control en el panel de administración.** Un resumen por módulo de cuántas preguntas piden lámina y cuántas de esas láminas existen realmente, para que este hueco se vea a simple vista sin tener que consultarme.

## Detalle técnico

- `QuestionImages` firma URLs contra `atp-images`, `e190-images`, `737-images` y `jeppesen-images` según `fuente`; la lógica de reintento es correcta.
- El bucket `737-images` no tiene objetos: las URLs firmadas se generan pero devuelven 404 al cargar la imagen.
- Cruce hecho entre `content` (colección `questions`, campo `imagenes`) y `storage.objects`.
- La subida del 737 se haría por lotes con la clave de servicio, igual que las cargas previas de ATP y Jeppesen.
