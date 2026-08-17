# Reglas permanentes de compliance — FlightPath

Estas reglas aplican a **todo** el contenido público del sitio (landing, SEO, blog, metadata,
anuncios) y a cualquier cambio futuro, lo haga una persona o una IA. Si un cambio las rompe,
no se publica.

## 1. Marcas de terceros

- **Nunca** usar logotipos, isotipos ni identidad visual de Aeroméxico, Aeroméxico Connect,
  ASPA de México, Volaris, AFAC/CIAAC ni de ninguna aerolínea, sindicato o autoridad.
- Sus nombres solo se mencionan en texto y con **uso informativo** (nominativo): describir la
  convocatoria, el examen o el temario publicado. Jamás de forma que sugiera afiliación,
  patrocinio o aval ("Confiado por…", testimonios corporativos, sellos, "partner de…").
- Toda página que mencione esas marcas debe mostrar el **aviso de no afiliación** (existe en el
  Footer global y en los avisos de `/ciaac` y `/convocatoria-aeromexico` — no quitarlos).

## 2. Material de examen y propiedad intelectual

- **Nunca** afirmar que FlightPath "replica", "copia", "contiene" o "reproduce" el cuestionario,
  la guía o el material de examen de una empresa o autoridad. Mencionar el **temario publicado**
  es uso legítimo informativo; afirmar que se replicó su examen, no.
- El discurso público es siempre: *"banco propio de más de 2,800 preguntas, desarrollado de
  forma independiente y mapeado al temario oficial publicado"*.
- No publicar cifras internas de exámenes de terceros (p. ej. "377 preguntas oficiales") en
  ninguna página, meta tag ni schema.

## 3. Datos y pruebas sociales

- Solo cifras **propias y verificables** (banco, simulador, materias, manuales). Ver
  `AUDITORIA-DATOS.md` para el respaldo de cada número.
- Cero testimonios inventados y cero logos de "clientes" no autorizados. La barra del home usa
  datos propios; los testimonios reales llegarán con la primera generación y con permiso escrito.
- No vender como incluido lo que está "Próximamente" (flashcards, audios, presentaciones,
  clases): se marca igual que en el home o se quita de la lista de venta.

## 4. Identidad

- Contacto público: **contacto@flightpath.mx** (no usar dominios de terceros ni de otras
  empresas del grupo en el sitio).
- Metadata OG/Twitter propia: imagen `public/og-image.png` (1200×630) y sin `twitter:site`
  de herramientas externas (p. ej. `@Lovable`).

## 5. Pilot Aptitude Trainer (módulo "Compass")

- El módulo entrena **familias de aptitud** (coordinación, tracking, memoria, cálculo,
  orientación, multitarea, razonamiento inductivo) con **ejercicios 100% originales**
  generados proceduralmente. Nunca afirmar que replica, contiene o equivale a la batería
  COMPASS/EPST, a CUT-E/AON ni a ninguna prueba oficial de aerolínea.
- "COMPASS" y "CUT-E / AON" solo se mencionan en texto con uso informativo ("screenings de
  tipo COMPASS o CUT-E/AON") y siempre acompañados del aviso de no afiliación que vive en el
  hub del módulo (`/dashboard/compass`) — no quitarlo.
- Al añadir un ejercicio inspirado en una familia que evalúan esas baterías, lo que se toma es
  **la aptitud, nunca el reactivo**: el estímulo se genera desde cero con reglas propias y
  documentadas (ver `modules/compass/logica.ts`). Prohibido reproducir sus ítems, sus
  ilustraciones o sus baremos, y prohibido nombrar el módulo como la prueba de un tercero.
- Una familia sin módulo propio se marca "Próximamente" y no se presenta como cubierta —
  misma regla que §3.
- Los scores del módulo son métricas de entrenamiento sobre el historial del propio alumno:
  prohibido presentarlos como porcentaje de aprobación, percentil oficial o predicción de
  contratación. No publicar percentiles de comunidad sin muestra suficiente y revisión.
- El scoring es determinista y versionado (`COMPASS_SCORING_VERSION`); la IA no interviene
  en generación de estímulos ni en calificación de modos evaluados.

> Nota interna (no publicar): el módulo Línea Aérea contiene un banco marcado como "oficial"
> (`seed-linea-aerea-oficial.ts`, guía de estudio de la convocatoria). Su permanencia dentro
> del producto es una decisión de negocio pendiente — ver PR "Limpieza legal + SEO" para el
> contexto. Estas reglas cubren el contenido público; ese banco no debe exponerse públicamente
> ni mencionarse en marketing.
