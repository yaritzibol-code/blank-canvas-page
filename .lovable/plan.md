## Objetivo

Adaptar la app para que se vea correctamente en teléfono (~390px) y iPad (~768–1024px) sin tocar contenido, copy, colores ni lógica. Solo ajustes de layout/typography.

## Diagnóstico

El proyecto mezcla dos estilos:
1. **Landing (`src/routes/index.tsx`)** ya usa Tailwind con breakpoints `lg:`, pero varias secciones tienen rejillas fijas, paddings grandes y tipografía gigante que no caben en 390px.
2. **Dashboard y rutas internas** (`src/routes/dashboard.tsx`, `dashboard/index.tsx`, `simulador.tsx`, `cuestionario.tsx`, `dashboard/flashcards.tsx`, `dashboard/banco.tsx`, `dashboard/materias/*`, etc.) usan **inline styles** con `gridTemplateColumns: "repeat(3, 1fr)"` o `"repeat(4, 1fr)"` y `padding: 28/40` fijos. Las clases `className="grid-cols-2 md:grid-cols-4"` que ya existen **no aplican** porque el `style` inline gana.

## Cambios (solo presentación)

### 1. Landing `src/routes/index.tsx`
- Hero: bajar `text-[52px]` a `text-[34px] sm:text-[44px] lg:text-[52px]`; reducir paddings verticales en mobile.
- Convertir grids fijos (features, pricing, testimonials, footer) a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`.
- Nav: asegurar menú hamburguesa abre/cierra correctamente y CTAs no se desbordan (`flex-wrap`, `min-w-0`, `truncate`).
- `PathyBubble` y `PlaneField` con `max-w-full` y altura reducida en mobile.

### 2. Dashboard shell `src/routes/dashboard.tsx`
- Topbar: aplicar patrón `grid-cols-[minmax(0,1fr)_auto]` para que título + chips no se rompan; ocultar fecha larga en <sm.
- Reducir `height: 64` topbar y paddings en mobile (ya parcial, completar).
- Radar bar: stacking vertical en <sm.

### 3. Dashboard home `src/routes/dashboard/index.tsx`
- Reemplazar `gridTemplateColumns: "repeat(4, 1fr)"` y `"repeat(3, 1fr)"` por estilos responsivos: usar `style` con media queries via clase utility, o migrar esos contenedores a `className` Tailwind (`grid grid-cols-2 md:grid-cols-4 gap-4` / `grid-cols-1 md:grid-cols-3`) eliminando el `gridTemplateColumns` inline que lo pisa.
- Greeting + countdown: `flex-col sm:flex-row`, countdown chips más pequeños en mobile.
- Pathy widget: stacking vertical <sm, streak chip debajo.
- `MateriaCard`: en mobile los 3 botones (`Material/Preguntas/Flash`) se aprietan — pasar a `flex-wrap` con min-width.

### 4. Rutas internas con inline grids
Aplicar el mismo patrón (quitar `gridTemplateColumns` inline, usar clases Tailwind responsivas) en:
- `src/routes/simulador.tsx`
- `src/routes/cuestionario.tsx`
- `src/routes/dashboard/banco.tsx`
- `src/routes/dashboard/flashcards.tsx`
- `src/routes/dashboard/materias/index.tsx`
- `src/routes/dashboard/materias/$subjectId.tsx`
- `src/routes/dashboard/analisis.tsx`, `bitacora.tsx`, `biblioteca.tsx`, `clases.tsx`, `recordatorios.tsx`, `perfil.tsx`, `configuracion.tsx`, `estudiemos.tsx`
- `src/routes/admin/perfil.tsx`
- `src/routes/login.tsx`, `register.tsx`

Para cada uno:
- Grids fijas → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`.
- Paddings 28–40 → `p-4 sm:p-6 lg:p-8`.
- Headings inline `fontSize: "1.8rem"` → `clamp(1.3rem, 4vw, 1.8rem)`.
- Filas título+widget → patrón `grid grid-cols-[minmax(0,1fr)_auto]` con `min-w-0` y `truncate`.
- Botones/CTAs grandes → `w-full sm:w-auto` cuando aplica.

### 5. Engine blocks `src/modules/engine/blocks/*`
- HeaderBlock y demás: padding 28 → `clamp(16px, 4vw, 28px)`; títulos con `clamp()`; meta chips `flex-wrap`.

### 6. Verificación
- Levantar Playwright en headless a 390×844 (iPhone) y 820×1180 (iPad) y capturar screenshots de: `/`, `/login`, `/dashboard`, `/dashboard/materias`, `/dashboard/materias/aerodinamica`, `/dashboard/banco`, `/dashboard/flashcards`, `/simulador`, `/cuestionario`.
- Confirmar visualmente: sin scroll horizontal, sin texto cortado, sidebar móvil funciona, botones tappables (≥40px).

## Fuera de alcance
- Sin cambios de copy, colores, fuentes, animaciones, lógica, rutas o datos.
- Sin refactor estructural; solo ajustes de layout/typography responsivos.
