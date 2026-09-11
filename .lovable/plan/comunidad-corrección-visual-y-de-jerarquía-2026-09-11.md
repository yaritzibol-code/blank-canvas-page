# Comunidad — corrección visual y de jerarquía

Se conserva todo el motor de FlightPoints ya funcionando (transacciones, reglas, exclusión de B737, exclusión de admin, periodos, Top 5, vecinos). El trabajo es de presentación, nombres y organización.

## 1. Encabezado

Reemplazar el bloque actual (que muestra el total de FlightPoints en grande) por:

- Título: **Comunidad**
- "Aquí reconocemos a quienes están dando lo mejor de sí."
- "Conoce a los alumnos que están destacando en FlightPath y descubre hasta dónde puedes llegar."

Se elimina del encabezado la cifra de FlightPoints y la frase "Tus FlightPoints salen de tu actividad real" (esa explicación queda solo en el tutorial). El total propio se sigue viendo en la pestaña **Yo**.

## 2. Rankings

- Debajo del encabezado, título destacado: **Los Tops de esta semana** (el texto cambia a "de este mes" / "histórico" según el periodo elegido).
- Los cinco rankings se muestran como tarjetas/opciones dentro de la misma sección, no como pestañas. Nombres exactos:
  1. Top General
  2. Top CIAAC
  3. Top Línea Aérea
  4. Racha más larga
  5. Más logros
- Un solo selector de periodo: **Esta semana | Este mes | Histórico**, por defecto "Esta semana", visible solo cuando el ranking usa FlightPoints. Racha y Logros siguen siendo históricos por naturaleza.
- Cada ranking muestra públicamente solo el Top 5, con unidad correcta (FP, días, logros).

## 3. Tu posición cuando estás fuera del Top 5

Se amplía el bloque privado a dos posiciones arriba y dos abajo (#28 a #32, con la tuya marcada), en lugar de una. No se muestra "#183 de 183" ni la lista completa.

En Top General, Top CIAAC y Top Línea Aérea se añade la referencia: "Te faltan 80 FP para alcanzar al #29." No aplica a Racha ni a Logros.

## 4. Pestaña "Yo"

Se mantienen solo dos pestañas: Rankings | Yo. Dentro de "Yo":

- Tu posición y tus FlightPoints, y el próximo objetivo (cuántos FP para subir un lugar).
- Tu posición en los cinco rankings: General, CIAAC, Línea Aérea, Racha y Logros.
- Desglose de FlightPoints: Learning Paths, Cuestionarios, Flashcards, Material, Estudia con Pathy, Rachas, Logros y Total.
- Se conserva el control de privacidad (nombre o folio).

## 5. Diseño

Estética premium, aspiracional y aeronáutica; sin apariencia de videojuego.

- Fondo suave con un degradado sutil en el encabezado y detalle aeronáutico discreto.
- Tarjetas con profundidad real y buena separación.
- Cada ranking con su propio acento de color para distinguirlos; estado activo claro.
- Top 1 con presencia ligeramente mayor; Top 2 y 3 con diferenciación sutil. Sin medallas grandes, trofeos, confeti ni exceso de dorado.
- Tu fila resaltada con el color de marca.
- Responsive para teléfono y tablet.

## 6. Administrador y planes

- Comunidad sigue visible para todos, incluido el administrador, con acceso completo a rankings, periodos y Top 5.
- El administrador no participa: ya está excluido por rol en la consulta de rankings; se verifica y se añade una nota discreta "Tu cuenta administrativa no participa en los rankings" solo para admin.
- Básica y Pro participan igual; no se agregan multiplicadores.

## Detalles técnicos

- `src/lib/fp/shared.ts`: renombrar etiquetas de `FP_RANKINGS` a los nombres exactos y ajustar textos de ayuda.
- `src/lib/fp/fp.functions.ts` — `getComunidad`: devolver ventana de vecinos ±2, la posición propia, el valor del alumno inmediatamente arriba (para el "te faltan X FP") y una bandera `esAdmin`. Añadir una función que devuelva la posición del usuario en los cinco rankings para la pestaña "Yo" (reutilizando `fp_leaderboard`, sin nueva SQL).
- `src/routes/dashboard/comunidad.tsx`: rediseño de la vista con los nuevos textos, selector de rankings tipo tarjetas, selector único de periodo y pestaña "Yo" ampliada. Extraer subcomponentes de presentación a `src/components/comunidad/`.
- Sin migraciones nuevas: `fp_leaderboard` ya excluye admin, aplica periodos y ordena con desempates.
- Actualizar el `head()` de la ruta con título y descripción alineados al nuevo mensaje.
