# Blog con contenido real de ASPA Trabajo

Hoy cada artículo tiene entre 1,500 y 2,200 caracteres: son notas cortas, por eso el blog se siente vacío. El documento de ASPA y su sitio oficial dan material concreto (requisitos por equipo, fases de evaluación, temario AON, flujo de 6 pasos, fechas y contacto) para convertirlos en guías completas.

## Qué se hace

### 1. Artículos ampliados (los 6 de Aerolíneas y Convocatorias)
Cada uno pasa a ser una guía de 6,000–9,000 caracteres, con datos verificables:

- **Requisitos por equipo**: B737 NG/MAX (18 a 56 años 11 meses, 1,800 horas) y E190 (18 a 50 años 11 meses, 250 horas); nacionalidad mexicana por nacimiento, licencia comercial vigente, aptitud psicofísica, pasaporte y visa, y carta de presentación de ASPA.
- **Las 5 fases de evaluación**: examen teórico aeronáutico, AON (antes cut-e), prueba de inglés dentro de AON, simulador full-flight y entrevista de panel — cada una con qué evalúa y cómo prepararse.
- **Flujo de 6 pasos** en la plataforma de ASPA: explora, regístrate, envía solicitud, revisión, carta, exámenes.
- **Aviso oficial**: la Secretaría de Trabajo de ASPA no recomienda contratar cursos de terceros para las fases teórica y de simulador; FlightPath se presenta como práctica personal, nunca como acreditación.
- **Contacto oficial** de la Secretaría de Trabajo y liga a aspatrabajo.org.mx en cada artículo.

### 2. Tres artículos nuevos
- **AON / cut-e: qué es y cómo se evalúa** (aptitudes cognitivas, carga de trabajo, perfil psicométrico) — enlaza al módulo COMPASS.
- **B737 NG/MAX vs Embraer 190: cuál convocatoria me toca** (comparativa de edad, horas y documentación).
- **Inglés aeronáutico en el proceso de selección** (OACI, vocabulario técnico) — enlaza a RTARI.

### 3. Presentación
- El lector de artículos aprende a mostrar **tablas** y **avisos destacados**, para requisitos comparados y para el aviso de ASPA.
- Índice de contenidos automático en artículos largos, con anclas en los títulos.
- Se marca fecha de actualización y una nota de vigencia en los artículos ligados a convocatorias.

### 4. Fechas y vigencia
Las convocatorias de septiembre 2026 (registro del 7 al 12) se describen como ejemplo del ciclo, no como información permanente, para que el contenido no caduque.

## Detalles técnicos

- Migración que actualiza `content`, `excerpt`, `reading_time`, `tags` y `updated_at` de los 6 artículos existentes e inserta los 3 nuevos en `blog_posts` (status `published`), reutilizando las portadas por categoría.
- `src/components/blog/prose.tsx`: soporte para tablas markdown, bloques de aviso (`> [!aviso]`) e IDs en encabezados.
- `src/routes/blog_.$slug.tsx`: índice de contenidos lateral/superior a partir de los encabezados H2 del artículo.
- Sin cambios de paleta ni de estructura del listado; el sitemap ya toma los artículos de la base de datos.

## Fuera de alcance
- Panel de administración del blog.
- Copiar textos literales del sitio de ASPA: se redacta contenido propio citando la fuente oficial.
