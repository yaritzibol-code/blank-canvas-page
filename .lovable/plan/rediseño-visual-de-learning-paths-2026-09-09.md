# Rediseño visual de Learning Paths

El recorrido y las reglas de avance se quedan exactamente igual. Solo cambia el aspecto: pasa de una lista de filas grises a tarjetas grandes, con color, iconos y sensación más amable.

## Qué va a cambiar

**Pantalla "¿Qué quieres estudiar hoy?"**
- Las tres áreas (CIAAC, Línea Aérea, Aeronaves 737) se muestran como tarjetas grandes en cuadrícula (una por fila en teléfono, dos o tres en pantallas amplias).
- Cada tarjeta lleva su propio acento de color, un icono de aviación, el número de materias y de learning paths, y un anillo o barra con el avance.
- La franja "Continuar estudiando" se convierte en una tarjeta destacada arriba, con el nombre del tema, la materia y un botón claro para retomar.

**Pantallas de materias y contenedores**
- Cuadrícula de tarjetas en vez de lista: título, cantidad de temas, barra de avance con porcentaje y una etiqueta de estado (No iniciado / En progreso / Completado).
- Las materias bloqueadas se ven claramente bloqueadas: candado, tono apagado y un texto corto que explica qué hay que terminar antes.

**Lista de learning paths**
- Cada tema aparece como tarjeta compacta numerada, con círculo de estado (vacío, en curso, palomita) y etiqueta.
- Una línea vertical suave conecta las tarjetas para que se lea la secuencia del temario.

**Pantalla de un learning path**
- Encabezado con la posición dentro de la secuencia ("Tema 3 de 12") y barra de avance de la materia.
- El aviso de "contenido en preparación" se presenta como tarjeta amable con ilustración simple en vez de texto suelto.
- Botones de anterior / marcar como completado / siguiente en una barra de acciones bien separada, con el siguiente atenuado hasta completar.

**General**
- Se conserva la paleta actual; se usan sus tonos suaves para fondos, bordes y acentos.
- Transiciones ligeras al pasar el cursor y al tocar, respetando la preferencia de menos movimiento.
- Todo se mantiene dentro del mismo panel, sin cambiar direcciones ni la lógica de desbloqueo.

## Detalles técnicos

- Reescribir `src/components/lp/nav.tsx`: `LpCard` con variantes (`categoria`, `materia`, `contenedor`, `lp`), soporte de icono, acento, estado, candado y porcentaje; `LpGrid` con `repeat(auto-fill, minmax(260px, 1fr))` y prop para columna única; nuevos `LpContinueCard`, `LpEmptyState` y `LpActionBar`.
- Migrar los estilos en línea a tokens semánticos existentes (`--card`, `--primary`, `--muted`, `--border`) más `color-mix` para acentos por categoría; sin colores fijos nuevos.
- Actualizar las cinco rutas de `src/routes/dashboard/rutas/` para consumir los componentes nuevos; no se toca `src/lib/lp/taxonomy.ts` ni `src/lib/store/lp-nav.ts`.
- Verificación: `bunx tsgo --noEmit`, revisión del build y captura con Playwright en 390 px y 1280 px.
