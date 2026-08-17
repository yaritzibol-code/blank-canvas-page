-- El compendio CPAM deja de ser un cuestionario aparte de Línea Aérea y pasa a
-- ser el capítulo 9 del banco de Legislación (fuente LEG).
--
-- Las preguntas conservan su id (q_la_CPAM_NNN) para no romper el historial de
-- respuestas ni la analítica ya registrada; sólo cambian de fuente y reciben
-- el capítulo que les corresponde dentro de Legislación.
update content
set data = jsonb_set(
  jsonb_set(data, '{fuente}', '"LEG"'::jsonb, true),
  '{capitulo}', '9'::jsonb, true
)
where collection = 'questions'
  and data->>'fuente' = 'CPAM';
