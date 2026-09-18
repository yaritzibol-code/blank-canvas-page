# Actualizar popup y banco Anexo 10

## Cambios
- Ajustar el popup existente para que use la misma jerarquía visual, superficies, bordes y controles de Línea Aérea, sin cambiar la identidad actual.
- Mantener el comportamiento adaptable: contenido desplazable, acciones siempre visibles y prioridad sobre el menú lateral.
- Convertir y validar los ocho archivos del Anexo 10 al formato actual del banco.
- Sustituir las preguntas anteriores por las nuevas, conservando capítulos, respuestas, explicaciones y filtros.
- Actualizar los conteos del catálogo con los totales reales por capítulo.
- Probar el selector, el inicio del cuestionario y la carga aleatoria sin repeticiones en escritorio y teléfono.

## Datos
- La sustitución será idempotente: solo afectará preguntas cuya fuente sea `ANX10`.
- Antes de cargar se validará que cada respuesta correcta coincida con una opción y que no haya preguntas duplicadas.
