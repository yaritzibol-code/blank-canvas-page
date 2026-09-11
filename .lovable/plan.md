# Rediseño de la sección de Logros en el perfil

## Objetivo
Hacer que los 100 logros no abrumen la página de perfil. Se conservan los logros destacados y el progreso general en la vista principal, y el catálogo completo se mueve a un modal accesible desde un botón "Ver todos".

## Qué se va a construir

1. **Resumen compacto en `/dashboard/perfil`**
   - Sección "Logros" reducida: progreso general, contador `X / 100 desbloqueados` y barra de progreso.
   - Logros destacados (máx. 3) visibles tal cual, con un botón "Elegir destacados".
   - Lista de los últimos 3 a 6 logros desbloqueados recientemente con su fecha.
   - Botón principal "Ver todos los logros" que abre el modal.

2. **Modal de catálogo completo**
   - Se abre centrado, ocupando la mayor parte de la pantalla en escritorio y casi toda la pantalla en móvil.
   - Barra de búsqueda para filtrar logros por nombre o descripción.
   - Acordeones por categoría: por defecto colapsados, excepto las categorías que tengan logros recién desbloqueados.
   - Cada acordeón muestra su conteo `desbloqueados / total`.
   - Las tarjetas conservan su diseño actual (icono, nombre, descripción, fecha, estados bloqueado/desbloqueado, logro secreto `???` y logro máximo especial).
   - Dentro del modal se puede seguir seleccionando o quitando logros destacados (hasta 3).

3. **Comportamientos que se conservan**
   - El motor de logros (`src/lib/logros/engine.ts`) y el catálogo (`src/lib/logros/catalog.ts`) no cambian.
   - Los desbloqueos siguen siendo automáticos, permanentes y notificados por `LogroWatcher`.
   - La persistencia de destacados en `logros_destacados` sigue igual.

## Detalles técnicos

- Se modifica `src/components/logros/LogrosPanel.tsx` para renderizar el resumen compacto y el modal.
- Se crea un componente interno `LogroCatalogoModal` dentro del mismo archivo (o archivo adyacente) para no dispersar la lógica.
- Se reutilizan `listarLogros`, `getDestacados`, `setDestacados`, `MAX_DESTACADOS` y `LOGRO_CATEGORIAS`.
- Se usa `useStoreVersion` para que los cambios de destacados se reflejen inmediatamente.
- Se mantiene el soporte de teclado y los roles ARIA en las tarjetas seleccionables.
- El modal se cierra con clic fuera, tecla `Escape` y botón de cerrar.
- Se ajustan estilos para que el modal sea usable en móvil (padding reducido, grids adaptativos).

## Criterios de aceptación

- En `/dashboard/perfil` la sección de logros ocupa aproximadamente la mitad de altura que antes.
- El botón "Ver todos los logros" abre el modal con el catálogo completo.
- Las categorías dentro del modal están colapsadas por defecto.
- Se puede buscar un logro por nombre y la lista filtra en tiempo real.
- Se pueden seleccionar/quitar destacados desde el modal y se reflejan en el perfil.
- El logro secreto #100 sigue apareciendo como `???` hasta desbloquearse y con su estilo premium al desbloquearse.
- Typecheck y build pasan sin errores.
