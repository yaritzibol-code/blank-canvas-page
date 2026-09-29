import type { AtpLearningPathDocument } from "./atp-types";

const chapter1 = "linea-aerea/atp/chapter-1-regulations";
const chapter2 = "linea-aerea/atp/chapter-2-equipment-navigation-and-facilities";

export const ATP_2026_NEW_IDS = {
  safety: `${chapter1}/safety-reporting-programs-16`,
  gnss: `${chapter2}/gnss-disruption-and-vor-mon-11`,
  adsb: `${chapter2}/ads-b-12`,
} as const;

export const ATP_2026_NEW_PATHS: Record<string, AtpLearningPathDocument> = {
  [ATP_2026_NEW_IDS.safety]: {
    meta: {
      chapter_number: 1, chapter_name: "Regulations", topic_number: 16,
      topic_name: "Safety Reporting Programs", html_file: "16_Safety_Reporting_Programs.html",
      folder: "01_Regulations", source_start: 58, source_end: 73,
      relative_path: "01_Regulations/16_Safety_Reporting_Programs.html",
    },
    content: {
      subtitle: "Elige el canal, protege el aprendizaje y cumple los reportes exigidos.",
      intro: "Una desviación puede revelar una amenaza para muchos vuelos. Aprender de ella exige saber quién reporta, qué información aporta y qué obligaciones siguen vigentes. VDRP, FOQA, ASAP y ASRS cubren necesidades distintas.",
      introExplore: [
        { title: "Una persona", body: "Un piloto descubre una confusión de clearance. Su relato puede explicar factores humanos que una grabación no muestra." },
        { title: "Una organización", body: "El operador descubre un incumplimiento en su proceso. Corregir un vuelo no basta si la causa sigue afectando a la flota." },
        { title: "Muchos vuelos", body: "Los datos de operación pueden mostrar una tendencia antes de que una tripulación la reconozca como un patrón." },
      ],
      steps: [
        {
          name: "Cuatro fuentes", title: "Empieza por quién aporta la información.",
          lead: "Safety reporting transforma datos y experiencias en medidas preventivas. No todos los programas reciben la misma clase de reporte.",
          cards: [{ title: "Una finalidad común", body: "<p>La información debe ayudar a identificar amenazas, entender causas y comprobar si las correcciones funcionan. Contar reportes sin analizar el riesgo no completa ese ciclo.</p>", dark: true }],
          table: { headers: ["Programa", "Información principal"], rows: [
            ["VDRP · Voluntary Disclosure Reporting Program", "Divulgación de un incumplimiento por una entidad elegible y su plan de corrección."],
            ["FOQA · Flight Operational Quality Assurance", "Datos registrados de vuelos para identificar tendencias operacionales."],
            ["ASAP · Aviation Safety Action Program", "Reportes voluntarios de empleados dentro del programa acordado de su organización."],
            ["ASRS · Aviation Safety Reporting System", "Relatos voluntarios enviados a NASA para analizar problemas del sistema de aviación."],
          ] },
          questions: [{ prompt: "La flota muestra una tendencia de aproximaciones inestables en datos registrados. ¿Qué programa se centra en esa clase de información?", options: ["FOQA", "VDRP", "Una notificación NTSB por sí sola"], answer: 0, explanation: "FOQA permite estudiar tendencias de los vuelos. Un reporte individual puede complementarlas explicando el contexto." }],
        },
        {
          name: "VDRP y FOQA", title: "Corregir un incumplimiento y detectar una tendencia son trabajos distintos.",
          cards: [
            { title: "VDRP · La entidad actúa", body: "<p>El programa está dirigido a entidades elegibles. La divulgación voluntaria se acompaña de medidas para terminar el incumplimiento y evitar que se repita; está sujeta a los criterios y revisión FAA aplicables.</p><p>Un piloto no convierte su reporte personal en una divulgación del operador simplemente escribiendo VDRP en el asunto.</p>" },
            { title: "FOQA · Del evento al patrón", body: "<p>Un programa aprobado analiza datos de vuelo, como desviaciones de parámetros o perfiles, para orientar acciones de seguridad. Un parámetro excedido es una señal para investigar; no explica por sí solo la causa ni la intención de la tripulación.</p><p>Combina tendencias con contexto: procedimiento, meteorología, carga de trabajo y feedback de las tripulaciones.</p>" },
          ],
          explore: [
            { title: "Caso · Revisión de la flota", body: "Un evento aislado puede parecer excepcional. Si aparece repetidamente en una misma llegada, compara el procedimiento, las condiciones y las barreras disponibles antes de atribuirlo únicamente al piloto." },
            { title: "Caso · Proceso incorrecto", body: "La organización detecta que un procedimiento incumple una exigencia. Debe detener el incumplimiento, evaluar la divulgación aplicable y establecer una corrección verificable." },
          ],
          questions: [{ prompt: "¿Detectar una tendencia FOQA demuestra automáticamente por qué ocurrió cada evento?", options: ["Sí, el dato contiene toda la explicación", "No, hace falta analizar el contexto"], answer: 1, explanation: "Los datos muestran qué ocurrió dentro de lo registrado. El análisis y otros reportes ayudan a explicar por qué." }],
          note: "Referencias: FAA VDRP (https://vdrp.faa.gov/Help/VDRPHlp/Welcome.htm) y AC 120-82 · FOQA (https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-82.pdf).",
        },
        {
          name: "ASAP", title: "La experiencia del empleado aporta contexto.",
          lead: "ASAP fomenta el reporte voluntario de información de seguridad por empleados de organizaciones participantes.",
          cards: [
            { title: "Dentro de un acuerdo", body: "<p>El Memorandum of Understanding (MOU) establece alcance, plazos y criterios. El Event Review Committee (ERC) revisa los reportes conforme al acuerdo y desarrolla medidas correctivas.</p><p>Comprueba el programa de tu organización. Participar, cumplir el plazo y que un reporte sea aceptado son condiciones diferentes.</p>", dark: true },
            { title: "Sin prometer inmunidad", body: "<p>Las protecciones y exclusiones dependen de los criterios del programa. No presupongas que una conducta deliberada, actividad criminal o una actuación excluida será aceptada por haber enviado un reporte.</p>" },
          ],
          questions: [{ prompt: "Tu empresa tiene ASAP. ¿Basta con enviar cualquier reporte para asegurar su aceptación?", options: ["Sí", "No, debe evaluarse conforme al MOU y sus criterios"], answer: 1, explanation: "El programa tiene condiciones de participación y aceptación. La existencia de ASAP no convierte todos los hechos en casos protegidos." }],
          explore: [{ title: "Del relato a una barrera", body: "Dos pilotos describen una clearance fácil de confundir. Una acción útil puede ser mejorar el briefing y el cross-check, además de revisar la fraseología o el procedimiento que generó la confusión." }],
          note: "Referencia: FAA · Aviation Safety Action Program (https://www.faa.gov/about/initiatives/asap).",
        },
        {
          name: "ASRS", title: "Confidencialidad y alivio de sanción tienen condiciones diferentes.",
          cards: [
            { title: "NASA recibe y analiza", body: "<p>ASRS recibe relatos voluntarios y elimina datos identificadores antes del análisis y difusión correspondientes. Accidentes y delitos son excepciones: no se tratan como los reportes ordinarios desidentificados.</p>" },
            { title: "Una protección condicionada", body: "<p>La restricción de uso del reporte no impide que FAA conozca un hecho por otra fuente. La política de alivio de sanción exige, entre otras condiciones, una infracción inadvertida, ausencia de accidente, delito o falta de competencia excluida, ningún hallazgo previo de infracción en los cinco años anteriores y reporte dentro de diez días del hecho o de conocerlo, o deber conocerlo.</p><p>Puede existir un hallazgo de infracción aunque no se imponga la sanción cubierta por esa política. Conserva la constancia del envío.</p>", dark: true },
          ],
          questions: [{ prompt: "Enviarte un recibo ASRS significa que FAA ya decidió no investigar el hecho. ¿Es correcto?", options: ["Sí", "No"], answer: 1, explanation: "El recibo acredita el envío. No determina los hechos, las condiciones de la política ni lo que FAA pueda conocer por otras fuentes." }],
          note: "Referencias: NASA ASRS · AC 00-46F (https://asrs.arc.nasa.gov/overview/immunity.html) y 14 CFR §91.25.",
        },
        {
          name: "Ponlo a prueba", title: "Pueden corresponder varios canales al mismo hecho.",
          cards: [{ title: "Primero la operación segura", body: "<p>Controla la situación y realiza las comunicaciones urgentes. Después identifica los reportes obligatorios a FAA o NTSB y los canales voluntarios aplicables. Un reporte de aprendizaje no reemplaza una notificación exigida.</p>" }],
          explore: [
            { title: "1 · Tripulación", body: "Después de resolver una desviación, documenta los hechos, la secuencia y los factores que facilitaron el error. Evalúa ASAP y ASRS según las condiciones aplicables." },
            { title: "2 · Operador", body: "La organización revisa si existe un incumplimiento propio elegible para VDRP y si los datos FOQA muestran repetición. Las decisiones del operador y las del empleado no son intercambiables." },
            { title: "3 · Obligaciones", body: "Si el hecho exige notificación NTSB o un reporte por desviación de emergencia, cumple esos requisitos. Los plazos y destinatarios se desarrollan en sus recorridos respectivos." },
          ],
          questions: [
            { prompt: "Un suceso requiere notificación inmediata NTSB. Ya enviaste ASRS. ¿Se cumplió la notificación NTSB?", options: ["Sí, NASA sustituye todos los canales", "No, la obligación NTSB sigue vigente"], answer: 1, explanation: "Los programas voluntarios no eliminan los reportes exigidos por otras reglas." },
            { prompt: "Un relato ASAP y una tendencia FOQA apuntan a la misma amenaza. ¿Qué enfoque ayuda más?", options: ["Elegir uno y descartar el otro", "Combinar datos y contexto para diseñar y comprobar una corrección"], answer: 1, explanation: "Las fuentes se complementan. La meta es reducir la repetición, no escoger un único origen de información." },
          ],
        },
      ],
      takeaways: ["Distinguir VDRP, FOQA, ASAP y ASRS por participante y clase de información.", "Reconocer que aceptación, confidencialidad y alivio de sanción tienen criterios propios.", "Cumplir los reportes obligatorios y usar la información voluntaria para prevenir repetición."],
      source: "ASA · Airline Transport Pilot Test Prep 2025–2026 · pp. 1-58, 1-59 y 1-73 · temas 9388-1 a 9388-3 y 9836-1. FAA VDRP; AC 120-82; FAA ASAP; NASA ASRS / AC 00-46F; 14 CFR §91.25. Verificación: 28 septiembre 2026.",
      excluded: "La clasificación y notificación NTSB se desarrollan en su recorrido. Los reportes obligatorios de emergencia se desarrollan en Emergency Equipment and Operations.",
      depth: "Participantes, datos, revisión, correcciones, límites de protección y selección de canales mediante casos.",
    },
    figures: {},
  },
  [ATP_2026_NEW_IDS.gnss]: {
    meta: {
      chapter_number: 2, chapter_name: "Equipment, Navigation, and Facilities", topic_number: 11,
      topic_name: "GNSS Disruption and VOR MON", html_file: "11_GNSS_Disruption_and_VOR_MON.html",
      folder: "02_Equipment_Navigation_and_Facilities", source_start: 41, source_end: 42,
      relative_path: "02_Equipment_Navigation_and_Facilities/11_GNSS_Disruption_and_VOR_MON.html",
    },
    content: {
      subtitle: "Dejar de confiar en GNSS exige una alternativa que puedas volar.",
      intro: "GPS es una constelación dentro de GNSS, Global Navigation Satellite System. Ya conoces la integridad del receptor: ahora practica qué hacer si su posición deja de ser fiable y cómo la VOR Minimum Operational Network puede apoyar la continuación del vuelo.",
      introExplore: [
        { title: "Disponibilidad", body: "Que el receptor muestre una posición no demuestra que esa posición sea fiable. Interferencia, pérdida de señal o información engañosa pueden afectar varias funciones que usan la misma fuente." },
        { title: "Respaldo", body: "Dos pantallas que reciben la misma fuente GNSS no son dos medios independientes de navegación. Identifica qué sensores y procedimientos siguen disponibles." },
      ],
      steps: [
        {
          name: "Detectar y verificar", title: "Compara fuentes antes de seguir una indicación dudosa.",
          cards: [
            { title: "Señales que exigen atención", body: "<p>Una alerta de integridad, pérdida de navegación, saltos de posición o discrepancias con ayudas convencionales requieren evaluación. Una indicación aparentemente estable también puede ser incorrecta.</p><p>Cross-check con VOR/DME, instrumentos, posición conocida y los recursos disponibles según el equipo. Distingue sensores independientes de pantallas repetidas.</p>", dark: true },
            { title: "Mantén el control", body: "<p>Conserva una trayectoria segura, verifica cómo responde la automatización y aplica los procedimientos del avión. No prolongues un modo dependiente de una fuente que ya no puedes aceptar como fiable.</p>" },
          ],
          questions: [{ prompt: "Ambos displays coinciden, pero usan el mismo receptor GNSS y contradicen VOR/DME. ¿La coincidencia confirma su integridad?", options: ["Sí, son dos displays", "No, comparten la fuente dudosa"], answer: 1, explanation: "La independencia pertenece a la fuente de navegación, no al número de pantallas." }],
        },
        {
          name: "Reorganizar el vuelo", title: "Comunica la capacidad que realmente permanece.",
          lead: "ATC necesita saber qué servicio o procedimiento puedes utilizar después de la pérdida.",
          cards: [
            { title: "Describe la limitación", body: "<p>Informa la pérdida o sospecha de navegación GNSS y qué capacidad permanece. Solicita una ruta, vectores o un procedimiento compatible con ella. La clearance anterior puede haber dependido de una capacidad que ya no tienes.</p>" },
            { title: "Un respaldo no es universal", body: "<p>Un sistema aprobado con DME/DME puede conservar capacidad RNAV donde exista cobertura suficiente. Un avión con VOR solamente necesita rutas y procedimientos compatibles; no asumas que puede continuar cualquier RNP o RNAV.</p><p>Incluye missed approach y las ayudas que requiere, no solo el tramo final.</p>" },
          ],
          table: { headers: ["Pregunta", "Qué verificar"], rows: [
            ["¿Qué fuente falló?", "GNSS y las funciones que dependen de sus datos."],
            ["¿Qué sigue aprobado y disponible?", "Sensores, radioayudas, modos y capacidad publicada del avión."],
            ["¿Qué puedes volar?", "Ruta, approach y missed approach con sus requisitos completos."],
            ["¿Qué necesita cambiar?", "Coordinar con ATC la clearance y evaluar destino o desvío."],
          ] },
          questions: [{ prompt: "Tienes VOR operativo y GNSS no fiable. ¿Eso garantiza poder continuar cualquier approach RNAV?", options: ["Sí", "No, debes verificar la capacidad y cambiar de procedimiento si corresponde"], answer: 1, explanation: "La radioayuda disponible y los requisitos del procedimiento deben coincidir. Disponer de algún respaldo no equivale a disponer de todo respaldo." }],
        },
        {
          name: "La red MON", title: "Es una red de respaldo, no una segunda constelación.",
          cards: [{ title: "VOR Minimum Operational Network", body: "<p>VOR MON conserva una red de navegación convencional para apoyar una transición segura cuando GNSS no está disponible. Está concebida para llegar a un aeropuerto con una aproximación ILS o VOR utilizable sin GPS.</p><p>Consulta la identificación MON en Chart Supplement y comprueba las ayudas, NOTAMs y equipo que exige el procedimiento específico.</p>", dark: true }],
          table: { headers: ["Característica de la red", "Lectura correcta"], rows: [
            ["Cobertura VOR casi continua a 5,000 ft AGL", "Objetivo fuera del Western U.S. Mountainous Area. No es una autorización de altitud IFR ni garantía a menor altura."],
            ["MON airport dentro de 100 NM", "Objetivo de cobertura en CONUS. Proporciona una opción convencional; no garantiza meteorología ni disponibilidad adecuada para tu vuelo."],
            ["Approach ILS o VOR", "Comprueba que pueda realizarse sin GPS y sin depender de equipo que no tienes."],
          ] },
          questions: [{ prompt: "La referencia de cobertura MON es 5,000 ft AGL. ¿Puedes descender a esa altura sin atender la clearance y las altitudes mínimas?", options: ["Sí, la red garantiza separación de terreno", "No, es una referencia de cobertura"], answer: 1, explanation: "Cobertura de una señal y autorización de altitud son asuntos distintos. Mantén clearance y protección de terreno aplicables." }],
          note: "Referencias: AIM 1-1-3 · VOR MON (https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap1_section_1.html) y FAA VOR MON (https://www.faa.gov/about/office_org/headquarters_offices/ato/service_units/techops/navservices/gbng/vormon).",
        },
        {
          name: "Planificar el respaldo", title: "Encontrar un aeropuerto no demuestra que sea adecuado.",
          cards: [
            { title: "Antes de salir", body: "<p>Estudia avisos de interferencia GNSS, radioayudas y aeropuertos de respaldo. Mantén competencia con los equipos convencionales disponibles. Un receptor instalado que no sabes configurar no ofrece una alternativa práctica.</p>" },
            { title: "Antes de elegir el desvío", body: "<p>Evalúa meteorología, combustible disponible, pista, NOTAMs, ayudas y autorizaciones operacionales. La etiqueta MON no convierte un aeropuerto en un alternate adecuado bajo todas las condiciones.</p><p>La FAA recomienda familiaridad con MON; no exige presentar un MON airport como alternate solo por volar con GPS/WAAS. Las reglas habituales de alternate siguen aplicando.</p>" },
          ],
          explore: [{ title: "Caso · Cerca pero inutilizable", body: "Hay un MON airport a 70 NM, pero la aproximación convencional está fuera de servicio. Busca otra opción utilizable y coordina con ATC; la distancia por sí sola no resuelve la contingencia." }],
          questions: [{ prompt: "¿Volar con GPS obliga por sí solo a presentar un MON airport como alternate en todos los planes?", options: ["Sí", "No, la planificación de alternate mantiene sus requisitos aplicables"], answer: 1, explanation: "MON apoya la contingencia. No crea una obligación universal de incluir uno como alternate." }],
        },
        {
          name: "Ponlo a prueba", title: "Construye una alternativa completa.",
          cards: [],
          explore: [
            { title: "1 · En ruta", body: "La posición GNSS se vuelve sospechosa. Mantén el control, aplica los procedimientos y verifica fuentes independientes. No uses la misma posición repetida como confirmación." },
            { title: "2 · Con ATC", body: "Informa la capacidad restante y solicita una solución compatible. Con VOR/ILS disponibles, estudia opciones convencionales; con DME/DME aprobado, evalúa dónde puede mantenerse RNAV." },
            { title: "3 · Hasta el aterrizaje", body: "Comprueba aproximación, frustrada, condiciones del aeropuerto y combustible. Un plan de respaldo termina en una operación viable, no en la selección de un punto del mapa." },
          ],
          questions: [
            { prompt: "El destino tiene ILS, pero el missed approach requiere una capacidad que ya perdiste. ¿Está completa la alternativa?", options: ["Sí, basta con poder volar el final", "No, debes resolver también la frustrada con ATC y un procedimiento adecuado"], answer: 1, explanation: "Toda la operación debe ser compatible con las capacidades disponibles, incluida una posible frustrada." },
            { prompt: "Un MON airport está dentro de 100 NM. ¿Qué debes verificar antes de seleccionarlo?", options: ["Solo su distancia", "Meteorología, ayudas, NOTAMs, equipo, combustible y aptitud del aeropuerto"], answer: 1, explanation: "La cobertura de la red ofrece opciones. La tripulación debe evaluar si la opción concreta es utilizable." },
          ],
        },
      ],
      takeaways: ["Verificar fuentes independientes y comunicar la capacidad de navegación restante.", "Explicar las referencias de 5,000 ft AGL y 100 NM sin confundirlas con autorizaciones.", "Planificar una alternativa convencional completa y compatible con las condiciones reales."],
      source: "ASA · Airline Transport Pilot Test Prep 2025–2026 · pp. 2-41 a 2-42 · temas 9310, 8837 y 8839. FAA AIM 1-1-3 y 1-1-17; FAA VOR MON. Verificación: 28 septiembre 2026.",
      excluded: "Integridad y uso básico del receptor se desarrollan en GPS. Reglas de alternate y ejecución de clearances permanecen en sus recorridos.",
      depth: "Detección, cross-check, coordinación ATC, capacidad convencional, cobertura MON y escenarios de contingencia.",
    },
    figures: {},
  },
  [ATP_2026_NEW_IDS.adsb]: {
    meta: {
      chapter_number: 2, chapter_name: "Equipment, Navigation, and Facilities", topic_number: 12,
      topic_name: "ADS-B", html_file: "12_ADS_B.html", folder: "02_Equipment_Navigation_and_Facilities",
      source_start: 42, source_end: 42, relative_path: "02_Equipment_Navigation_and_Facilities/12_ADS_B.html",
    },
    content: {
      subtitle: "Transmitir tu posición y recibir información son capacidades diferentes.",
      intro: "Automatic Dependent Surveillance–Broadcast permite transmitir información del avión usando datos de su sistema de posición. Distingue la función exigida para ciertos espacios aéreos, las ayudas que puedes recibir y sus límites operacionales.",
      introExplore: [
        { title: "Automatic", body: "El equipo transmite de forma automática: no depende de que el piloto anuncie continuamente su posición." },
        { title: "Dependent", body: "La vigilancia depende de datos del avión, incluida una fuente de posición con la precisión e integridad requeridas." },
        { title: "Broadcast", body: "La transmisión puede ser recibida por estaciones y equipos compatibles. No es una autorización de ATC." },
      ],
      steps: [
        {
          name: "Out e In", title: "La dirección del dato define la función.",
          cards: [
            { title: "ADS-B Out", body: "<p>Transmite posición, altitud, identificación y otros datos. Es la función requerida en el espacio aéreo definido por §91.225, con el desempeño de §91.227.</p><p>La aprobación de la instalación incluye la fuente de posición y el enlace: tener una antena o una pantalla no demuestra cumplimiento.</p>", dark: true },
            { title: "ADS-B In", body: "<p>Recibe información compatible para presentarla a la tripulación. Puede incluir tráfico y, según el enlace, productos meteorológicos. La regla general de equipamiento ADS-B Out no exige ADS-B In.</p>" },
          ],
          table: { headers: ["Función", "Pregunta que responde"], rows: [["Out", "¿El avión transmite información adecuada para vigilancia?"], ["In", "¿Qué información recibe y muestra el equipo?"], ["Fuente de posición", "¿Los datos cumplen precisión, integridad y disponibilidad requeridas?"]] },
          questions: [{ prompt: "La cabina recibe tráfico ADS-B en una pantalla portátil. ¿Eso acredita ADS-B Out aprobado?", options: ["Sí, ya muestra tráfico", "No, recepción y transmisión aprobada son funciones distintas"], answer: 1, explanation: "Una pantalla In no demuestra que exista una instalación Out que cumpla los requisitos." }],
        },
        {
          name: "Enlaces y espacio aéreo", title: "La altitud cambia qué enlace admite la operación.",
          cards: [{ title: "1090ES y UAT", body: "<p>1090 MHz Extended Squitter (1090ES) es el enlace requerido para ADS-B Out en Class A. Bajo 18,000 ft pueden utilizarse 1090ES o 978 MHz Universal Access Transceiver (UAT) según los requisitos aplicables.</p><p>La recepción de productos depende del equipo: FIS-B se difunde en 978 MHz UAT.</p>" }],
          table: { headers: ["Espacio indicado por §91.225", "Qué comprobar"], rows: [
            ["Class A", "ADS-B Out 1090ES que cumpla el estándar aplicable."],
            ["Class B y C; Mode C veil de 30 NM donde corresponde", "Out requerido, salvo excepción o desviación autorizada aplicable."],
            ["Sobre B/C hasta 10,000 ft MSL", "Incluye el espacio sobre su techo dentro de los límites laterales."],
            ["Class E en los 48 estados contiguos y DC, desde 10,000 ft MSL", "Se excluye el espacio a 2,500 ft o menos sobre la superficie."],
            ["Class E sobre el Golfo de México desde 3,000 ft MSL", "Desde la costa hasta 12 NM mar adentro."],
          ] },
          questions: [{ prompt: "Un avión tiene ADS-B Out UAT 978 MHz únicamente. ¿Satisface el requisito de enlace para Class A?", options: ["Sí", "No, Class A requiere 1090ES"], answer: 1, explanation: "La regla distingue Class A del espacio donde se admite cualquiera de los dos enlaces." }],
          note: "Referencias: 14 CFR §91.225 (https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-C/section-91.225), §91.227 y FAA ADS-B FAQ (https://www.faa.gov/air_traffic/technology/equipadsb/resources/faq).",
        },
        {
          name: "Información recibida", title: "Comprende de dónde viene cada producto.",
          cards: [{ title: "Una imagen puede ser incompleta", body: "<p>No todo avión aparece: influyen equipamiento, cobertura, enlace y servicios disponibles. Una pantalla vacía no demuestra ausencia de tráfico.</p><p>Un reporte “traffic in sight” exige adquisición visual del avión, no solo verlo en el display. ADS-B In complementa vigilancia visual y procedimientos; no sustituye una clearance ni las acciones correspondientes a TCAS.</p>", dark: true }],
          table: { headers: ["Producto", "Función y límite"], rows: [
            ["ADS-B directo", "Información emitida por aeronaves con enlace compatible."],
            ["ADS-R", "Retransmisión terrestre entre enlaces ADS-B distintos."],
            ["TIS-B", "Información de tráfico derivada de vigilancia terrestre; depende del servicio y su cobertura."],
            ["FIS-B", "Productos meteorológicos y aeronáuticos por UAT; tienen tiempos de generación y actualización."],
          ] },
          explore: [{ title: "Caso · Tormenta en el display", body: "El producto meteorológico recibido puede representar condiciones de minutos antes. Úsalo para decisiones estratégicas con otras fuentes; no para navegar entre células a corta distancia suponiendo una imagen instantánea." }],
          questions: [{ prompt: "El display no muestra un avión que ATC te informa. ¿Qué conclusión es válida?", options: ["ATC debe estar equivocado", "La imagen ADS-B In puede ser incompleta; mantén la vigilancia y coordinación"], answer: 1, explanation: "El servicio y el equipamiento tienen límites. No descartes un tráfico por no verlo en pantalla." }],
          note: "Referencia: AIM 4-5-7 y 4-5-8 · ADS-B y TIS-B (https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_5.html).",
        },
        {
          name: "Uso y desviaciones", title: "Una falla no se gestiona igual que un avión sin equipar.",
          cards: [
            { title: "Mantén Out transmitiendo", body: "<p>Con ADS-B Out instalado, la regla exige modo de transmisión en todo momento, salvo las excepciones FAA o instrucciones ATC previstas. Estar fuera del espacio que exige instalación no autoriza apagarlo por elección propia.</p>" },
            { title: "Verifica y comunica", body: "<p>Comprueba indicaciones del equipo y configuración de identificación. Ante una falla, comunica la condición, aplica los procedimientos del avión y coordina la operación permitida. Un fallo de posición puede afectar tanto navegación como vigilancia ADS-B.</p>" },
          ],
          table: { headers: ["Situación", "Solicitud de desviación"], rows: [
            ["ADS-B Out inoperativo", "§91.225(g)(1): se puede solicitar a ATC en cualquier momento para ir al destino final, con escalas, o donde puedan repararlo, o ambos."],
            ["Avión sin ADS-B Out", "§91.225(g)(2): solicitar al menos una hora antes. El proceso FAA ADAPT admite solicitudes entre 1 y 24 horas antes; no equivale a autorización automática."],
          ] },
          questions: [{ prompt: "Out falla durante el vuelo. ¿Debes tratarlo siempre como una solicitud ADAPT de avión sin equipar presentada una hora antes?", options: ["Sí, son el mismo caso", "No, §91.225(g)(1) permite solicitar a ATC en cualquier momento para las operaciones indicadas"], answer: 1, explanation: "La regla separa equipo inoperativo de avión sin equipar. La autorización y coordinación siguen siendo necesarias." }],
          explore: [{ title: "Caso · Desviación solicitada", body: "Presentaste una solicitud para entrar sin Out. Hasta recibir la autorización aplicable, planifica mantenerte fuera del espacio afectado. Solicitar no equivale a recibir permiso." }],
        },
        {
          name: "Ponlo a prueba", title: "Relaciona instalación, servicio y decisión.",
          cards: [],
          explore: [
            { title: "1 · Planificación", body: "La ruta entra en Class A: verifica Out 1090ES, desempeño de la instalación y estado del equipo. La disponibilidad de TIS-B en cabina no es el requisito de entrada." },
            { title: "2 · En vuelo", body: "Una alerta afecta la fuente GNSS que alimenta navegación y Out. Evalúa ambas funciones, informa las limitaciones y utiliza el respaldo apropiado." },
            { title: "3 · Tráfico", body: "ATC señala un tráfico no mostrado. Mantén búsqueda visual y comunicaciones; no construyas una maniobra de separación suponiendo que el display contiene todo el tráfico." },
          ],
          questions: [
            { prompt: "¿TIS-B recibido en cabina sustituye ADS-B Out requerido para Class A?", options: ["Sí", "No"], answer: 1, explanation: "TIS-B es información de tráfico recibida. La obligación de vigilancia para Class A corresponde a ADS-B Out 1090ES." },
            { prompt: "Sales del espacio que exige Out y el equipo está instalado y operativo. ¿Puedes apagarlo solo por estar fuera?", options: ["Sí", "No, debe seguir transmitiendo salvo excepción o instrucción prevista"], answer: 1, explanation: "La obligación de uso del equipo instalado tiene alcance distinto de los espacios que exigen instalarlo." },
          ],
        },
      ],
      takeaways: ["Distinguir ADS-B Out, ADS-B In y la fuente de posición aprobada.", "Relacionar 1090ES/UAT y los servicios recibidos con sus requisitos y límites.", "Coordinar fallas y desviaciones sin confundir equipo inoperativo con avión sin equipar."],
      source: "ASA · Airline Transport Pilot Test Prep 2025–2026 · p. 2-42 · temas 9944, 9945, 9946 y 9946-1. FAA: 14 CFR §§91.225 y 91.227; AIM 4-5-7/4-5-8; ADS-B FAQ. Verificación: 28 septiembre 2026.",
      excluded: "No reemplaza formación en TCAS, separación ATC ni contingencia de navegación GNSS. Esos temas se desarrollan en sus recorridos.",
      depth: "Funciones, enlaces, espacios, productos, límites, uso del equipo y gestión de fallas mediante casos.",
    },
    figures: {},
  },
};
