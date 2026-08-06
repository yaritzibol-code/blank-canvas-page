# Importar preguntas de Legislación (Línea Aérea)

## Estado actual verificado

- La colección `questions` tiene 7,663 preguntas.
- `legislacion` sólo tiene **262 preguntas**, todas del lote original (`source: seed`, sin `fuente` ni `capitulo`) — pertenecen al track CIAAC.
- Los lotes importados con capítulos son: ATP (1,191 · operaciones · caps 1-8), Jeppesen (594 · navegación · caps 1-6), PHAK (2,400 · aerodinámica · caps 1-19).
- No existe ningún lote de Legislación en el track de Línea Aérea.

## Qué falta de tu lado

Necesito el material fuente (PDF, DOCX o CSV): LAC / RAC / Anexos OACI o el documento de legislación que quieras usar. Súbelo al chat y arranco la importación.

## Qué haré al recibirlo

1. **Parseo del documento** y segmentación por capítulos/títulos reales del material.
2. **Generación de preguntas** con el mismo formato que ATP/PHAK/Jeppesen:
   - `text`, `options` (3 opciones), `correctIndex`
   - `explanation` en el markdown estándar: párrafo de justificación, distractores en negrita (`**A.**`, `**C.**`), `**Regla clave:**` y `**Trampa del examen:**`
   - `cite` con formato `LEG Cap. N · Título — Sección — referencia legal`
   - `fuente: "LEG"`, `materia: "legislacion"`, `capitulo`, `capituloTitulo`, `seccion`, `source: "import"`, `status: "publicada"`
   - `id` con patrón `q_leg_chNN_XXXX`
3. **Carga a la base** en `content` (colección `questions`) por lotes.
4. **Aislamiento en Línea Aérea**: las preguntas nuevas se sirven sólo en el track de Línea Aérea vía `fuente = LEG`, sin mezclarse con las 262 de CIAAC (que se distinguen porque no tienen `fuente`).

## Cambios en la app

- Registrar `LEG` como fuente del track Línea Aérea junto a ATP / PHAK / JEPP: aparece como módulo seleccionable con su filtro de capítulos y su selector de cantidad de preguntas.
- Añadir `LEG` y sus capítulos a los filtros del Banco de Preguntas en el panel admin.
- Mismo flujo de extras, Yaris socrática y análisis final de Pathy que los demás módulos (sin cambios de lógica, sólo alta de la fuente).

## Detalle técnico

- Inserción con `supabase--insert` sobre `public.content` (`collection = 'questions'`), sin cambios de esquema.
- Los conteos por materia/fuente/capítulo ya salen de `get_bank_counts()`, y la lectura del banco de `get_bank_questions(...)`; ambos son dinámicos, así que no requieren migración — sólo verificar que los nuevos capítulos aparezcan en los filtros del front.
