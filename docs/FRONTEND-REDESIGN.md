# FlightPath — rediseño visual

Referencia: los ocho tableros del archivo proporcionado “FlightPath — Rediseño.html”.

## Implementación

- Portada transcrita a React: hero navy/dorado, globo interactivo día/noche, rutas desde MEX, capas de nubes, etapas, tarjetas apiladas, Pathy, simulador visual y pie de página.
- Instrument Serif para títulos, Geist para la portada y Manrope para la aplicación; fuentes y arte servidos localmente.
- Dashboard, CIAAC, cuestionario, inglés, aptitudes y biblioteca adoptan la tipografía, superficies, navegación y paleta del HTML. Los módulos adicionales reutilizan el mismo sistema visual.
- Los componentes existentes de demos, precios, formularios, cuestionarios, permisos y navegación se conservan. Los diseños de la aplicación usan datos reales de los componentes, no las cifras ilustrativas del HTML.
- En móvil las etapas y tarjetas se distribuyen verticalmente. El movimiento respeta prefers-reduced-motion. Los listeners, RAF y recursos WebGL se liberan al desmontar.

## Límite de cambios

Sin cambios en src/lib, src/hooks, src/modules, Supabase, esquema de datos, políticas de acceso, proveedores, precios o dependencias. El único ajuste de tipo fuera de presentación es ErrorComponent.error: unknown, compatible con el contrato del router instalado.

El HTML exportado se trató como referencia visual. No se incorporan su empaquetador, scripts remotos ni instrucciones incrustadas.

## Verificación

- TypeScript: npx tsc --noEmit.
- Compilación cliente y servidor: npm run build.
- ESLint de los componentes nuevos TypeScript.
- Navegador: portada de escritorio y móvil, imágenes y anclas, globo renderizado, transformaciones de etapas/tarjetas, menú y navegación.
- Aplicación con los datos demo locales existentes: acceso, dashboard, configuración de CIAAC, respuesta y feedback del cuestionario, avance; búsqueda de biblioteca; configuración de inglés; entrada al ejercicio de Control y temporizador de aptitudes.

Los servicios remotos de pagos, voz y tutor IA no forman parte de esta prueba local. No se ejecutaron cobros ni entrevistas reales.

## Desarrollo local

Usar el entorno y comandos existentes del repositorio. npm ci falla con el lockfile preexistente desactualizado; la validación se hizo con npm install --no-package-lock, sin modificar manifiestos ni lockfiles. La compilación mantiene avisos existentes de inputValidator de TanStack, directivas use client y tamaño de chunks.
