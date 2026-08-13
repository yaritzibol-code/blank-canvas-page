# SEO.md — Playbook operativo de posicionamiento

Reglas de operación para SEO clásico, AEO (motores de respuesta) y GEO
(motores generativos). Complementa a `COMPLIANCE.md` (qué se puede afirmar);
este documento define **cómo se mantiene** la visibilidad. Auditoría de
origen: 2026-08-09.

## Reglas al tocar código

1. **Página pública nueva** → en el MISMO PR: entrada en
   `src/routes/sitemap[.]xml.ts` (con `lastmod`), línea en `public/llms.txt`,
   y al menos un enlace contextual desde una página existente relacionada.
   Footer solo si es un vertical durable.
2. **Edición sustantiva de una página** → actualizar su `PUBLICADO`/
   `dateModified` y el `lastmod` del sitemap (constantes `V1`/`V2`… en el
   sitemap). La fecha visible "ACTUALIZADO · …" debe decir la verdad.
3. **Cifras** → siempre importadas de las constantes del producto
   (`SIM_TOTAL_QS`, `B737MAX_TOTAL`, `RTARI_TOTAL`, precios de
   `lib/pricing`…). Nunca números a mano en páginas públicas.
4. **Formato AEO** → toda "Respuesta rápida" abre con una primera oración
   autónoma de ≤50 palabras; toda pregunta de FAQ va envuelta en `<h3>`
   dentro del `<summary>`; el contenido debe existir completo en el HTML del
   SSR (nada de respuestas que solo aparecen tras un click con JS).
5. **Marcas de terceros** (Boeing, COMPASS/EPST, AFAC, aerolíneas) → mención
   nominativa + aviso de no afiliación en la misma página (ver COMPLIANCE.md).

## Reglas de velocidad (audit 2026-08-13)

6. **El seed jamás se descarga en páginas públicas.** `initOnce` (hooks.ts)
   solo siembra si el navegador ya estaba sembrado o la ruta está en
   `RUTAS_APP` (/dashboard, /admin, /login, /register, /reset-password,
   /checkout). Una superficie nueva que use el banco local debe agregarse a
   esa regex; sus formularios deben `await ensureSeededAsync()` antes de
   operar (patrón de handleLogin/handleRegister).
7. **Datos de landings fuera del entry.** El `loader`/`head` de una ruta
   viven en el route-tree, que viaja en el chunk de entrada de TODAS las
   páginas: los archivos de contenido (p. ej. `modulos-landing.ts`) se traen
   con `await import()` dentro del loader, nunca con import estático.
8. **Constantes chicas nunca dentro de archivos de datos grandes.** Importar
   un string desde un archivo de 200 KB arrastra el archivo entero al grafo
   (caso `LA_OFICIAL_FUENTE`, que vive en `linea-aerea-meta.ts`). Antes de
   importar algo en una ruta, revisar cuánto pesa el módulo que lo exporta.
9. **Imágenes públicas** → comprimidas (sharp con paleta, `quality` ~82) y
   servidas desde `/img/` con caché immutable (`public/_headers`): para
   cambiar una imagen se RENOMBRA (sufijo `-v2`), nunca se reemplaza en el
   mismo path. `og-image.png` es la excepción: mismo path, caché de 1 día.
   Preload manual solo para la imagen del hero (`fetchPriority: "high"` en
   camelCase — en minúsculas React lo descarta).
10. **Verificar el entry tras cambios estructurales**: `npm run build` y
    revisar que `index-*.js` no gane peso ni referencie chunks de datos
    (`grep -c 'seed-linea\|texto de un landing' .output/public/assets/index-*.js`).
    Línea base 2026-08-13: 263 KB gzip.

## Protocolo de convocatoria CIAAC

La fecha vive en `src/lib/convocatoria.ts` (única fuente; la portada, la
página de convocatoria y la calculadora la leen de ahí). Las páginas cambian
solas a modo "aplicación pasada" cuando la fecha vence (`ciaacYaPaso()`), así
que nada queda caduco — pero el modo "pasada" es un paracaídas, no un estado
deseable:

- **El día que la AFAC publique el siguiente periodo**: actualizar
  `PROXIMO_CIAAC`, `PROXIMO_CIAAC_TEXTO` y `PROXIMO_CIAAC_CORTO`, subir el
  `lastmod` del sitemap y verificar el render de `/convocatoria-ciaac-2026`.
- Si el año cambia (2027), crear la ruta nueva
  `/convocatoria-ciaac-2027` y redirigir/enlazar la anterior.

## Pendientes operativos (no son de código — requieren cuentas)

- [ ] **Google Search Console**: verificar propiedad de flightpath.mx,
      enviar `https://flightpath.mx/sitemap.xml`, revisar "Páginas" tras
      cada despliegue grande.
- [ ] **Bing Webmaster Tools**: alta del sitio + sitemap (ChatGPT/Copilot
      beben del índice de Bing). La llave IndexNow ya está hosteada en
      `public/4cf8c192308fce550b28642710f8825e.txt`; para avisar de URLs
      nuevas: `https://api.indexnow.org/indexnow?url=<URL>&key=4cf8c192308fce550b28642710f8825e`.
- [ ] **Perfiles sociales** (YouTube, Instagram, TikTok, LinkedIn): crearlos
      y añadirlos como `sameAs` al schema Organization de
      `src/routes/__root.tsx` — hoy la entidad no tiene corroboración
      externa. No añadir sameAs de perfiles que no existan.
- [ ] **YouTube**: demos reales del simulador y del entrenador de aptitudes
      (los LLM citan YouTube; el material ya existe en el producto).
- [ ] **Comprimir `public/og-image.png`** (455 KB → <200 KB) y generar una
      imagen OG por vertical (RTARI/COMPASS/737). Sin herramientas de imagen
      en el entorno de agente — hacerlo en local.
- [ ] **Verificación de producción** (desde cualquier máquina):
      redirects www→apex y http→https (301), status 404 real en rutas
      inexistentes, `curl -A "GPTBot"` devuelve 200 (el CDN no bloquea bots
      de IA), Lighthouse móvil del home y una landing.

## Medición (15 minutos al mes)

1. **GSC**: registrar posición/impresiones de las ~20 queries objetivo por
   vertical (examen rtari, examen compass pilotos, estudiar 737 max,
   convocatoria ciaac, banco de preguntas ciaac, cómo ser piloto en
   México…). Meta 90 días: top 10 en las long-tail nuevas; 180 días: top 3.
2. **Citas en LLM**: preguntar a ChatGPT, Perplexity y Claude "¿cuál es la
   mejor plataforma para estudiar el CIAAC?", "¿cómo practico la entrevista
   RTARI?", "¿dónde practico el examen COMPASS en español?" y registrar si
   FlightPath aparece y con qué fuente.
3. **Core Web Vitals**: PageSpeed Insights (móvil) del home y una landing.
   Línea base tras la optimización de 2026-08-09: entrada de 243 KB gzip
   (antes 738), fuentes self-hosteadas, seeds fuera del camino crítico.
