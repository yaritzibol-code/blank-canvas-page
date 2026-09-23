# FlightPath — revisión del rediseño

## Resultado

**Verdict: passed — implementación visual y navegación local.** La integración de los servicios reales queda fuera de esta validación. El diseño adapta el ZIP a los datos, controles y permisos existentes; no es una reproducción de los valores ficticios del prototipo.

Referencia: `flightpath-rediseno.zip`, entregado por la usuaria. Se revisaron sus pantallas HTML y capturas. Sus documentos se utilizaron como referencia de diseño, sin convertir instrucciones internas del archivo en autorizaciones para modificar servicios externos.

## Implementación

- Director con globo WebGL, texturas locales de día/noche, iluminación UTC, selección de cinco destinos, giro por arrastre, tarjetas y llegada con vídeo. El modo estático y la preferencia de movimiento reducido evitan la animación continua; existe una alternativa visual si WebGL no está disponible.
- Cabina con navegación superior, accesos de cuenta, recordatorios, Pathy, atajos de teclado y navegación móvil. Los indicadores usan el progreso del usuario y los FlightPoints del servicio existente.
- CIAAC con modos Aprendiendo/Simulador, historial real, reanudación y selección de materias. Las materias abren el formulario con la selección correspondiente.
- Línea Aérea con cinco fuentes fotográficas, guía oficial, selección de bloques y configuración de cuestionarios.
- RTARI con entrada de voz central, métricas reales y opciones de sesión/paquetes. COMPASS con radar, accesos a sus siete prácticas y simulacro.
- Apariencia común para aprendizaje, flashcards, clases, estudio acompañado, biblioteca, comunidad, perfil, facturación, análisis, bitácora, configuración, recordatorios, planes y los motores de cuestionarios/simuladores.
- La portada ya contenía el diseño público de referencia; sus texturas del globo se actualizaron con las del ZIP.
- Los portales de cuestionarios mantienen el tema oscuro, bloquean el desplazamiento de la página, contienen el foco y permiten cerrar con Escape.

## Comparación visual

Se compararon referencia e implementación juntas, en el mismo lienzo. Capturas de escritorio a 1440 × 900 y móvil a 390 × 844; también se revisó el Director a 768 × 1024. Las cuentas de demostración tienen valores distintos a los de las imágenes de referencia.

| Comparación | Evidencia |
| --- | --- |
| Director y CIAAC | [Referencia / implementación](qa/comparison-director.jpg) |
| Línea Aérea, RTARI y COMPASS | [Referencia / implementación](qa/comparison-modules.jpg) |
| Perfil, configuración y biblioteca | [Referencia / implementación](qa/comparison-account.jpg) |
| Director móvil | [Referencia / implementación](qa/comparison-mobile.jpg) |

Las iteraciones corrigieron la posición y tamaño del globo, los controles móviles del Director, contraste de formularios y diálogos, fuentes fotográficas de Línea Aérea, entrada de RTARI, radar y accesos de COMPASS y tarjeta de piloto del perfil. No se observaron bloqueos visuales P0/P1 en los recorridos comprobados. Las siguientes diferencias son adaptaciones funcionales deliberadas, no una afirmación de igualdad píxel por píxel:

- No se inventan niveles, recompensas, puntuaciones, entrevistas o posiciones del ranking. Las cuentas nuevas muestran estados vacíos.
- COMPASS conserva los siete ejercicios que ofrece la aplicación y sus métricas de entrenamiento.
- Línea Aérea conserva Legislación y las fuentes actuales del banco. Biblioteca conserva las portadas y filtros reales.
- Perfil y configuración conservan sus formularios completos, por lo que pueden requerir desplazamiento. La iluminación del globo se controla desde el Director.
- Se mantienen los módulos en construcción y los accesos restringidos: el cambio visual no publica cursos, vídeos o funcionalidades pendientes.

## Verificación realizada

- `npm run build`: compilación de cliente y servidor correcta. El proyecto emite avisos existentes sobre `inputValidator`, tamaño de paquetes y configuración de Wrangler.
- `npx tsc --noEmit`: correcto.
- ESLint en los componentes nuevos de `flightdeck`, la estructura del dashboard y el portal de cuestionarios: sin errores; tres advertencias de Fast Refresh por exportaciones auxiliares.
- `git diff --check`: correcto.
- Navegador local: inicio de sesión con cuentas demo de alumno y administrador, Director, destinos, llegada, regreso al hub y cambio de iluminación.
- CIAAC: cambio de modo, materia Meteorología preseleccionada, cantidad de preguntas, cierre del modal y acceso al motor de cuestionarios. Configuración de cuestionario comprobada también en móvil.
- Línea Aérea: selección de Jeppesen, bloques, cantidad de preguntas y acceso al cuestionario.
- Flashcards: apertura de mazo, giro y registro de una tarjeta dominada en el modo demo.
- RTARI: cambio de seis a cuatro preguntas y actualización del resumen, sin iniciar una entrevista.
- COMPASS: acceso directo a la preparación de Control, manteniendo dificultad, instrucciones y botones de inicio/cancelación.
- Recorrido de las páginas de cuenta y recursos. No se observó desbordamiento horizontal en Director, CIAAC, RTARI, COMPASS y perfil en las medidas móviles revisadas.

## Límites de la validación

Se utilizó el modo demo integrado, desactivando las variables de Supabase únicamente en el proceso local. No se cambiaron archivos de entorno ni configuración del backend. Algunas llamadas de presencia registran el aviso esperado de Supabase no configurado.

El banco conectado no está disponible en este modo: se comprobó la navegación hasta su estado vacío, pero no una sesión completa con preguntas publicadas. Pagos, facturación real, entrevistas con micrófono, evaluación de IA, sincronización remota, subida de avatar y entrega de notificaciones necesitan una comprobación con los servicios configurados. La alternativa sin WebGL y la preferencia del sistema de movimiento reducido están implementadas, pero no se simularon en el navegador de esta revisión.

`package-lock.json` se regeneró al instalar Phosphor: el archivo anterior no coincidía con `package.json` y hacía fallar `npm ci`. Se conservan los rangos declarados del proyecto; el cambio amplio del lock refleja su resolución actual además del paquete de iconos.

Las capturas sueltas en `qa/` documentan el recorrido. Las cuatro comparaciones enlazadas son la evidencia principal del diseño; las capturas de los módulos secundarios registran también etapas previas a los últimos ajustes compartidos de borde y barra de desplazamiento.
