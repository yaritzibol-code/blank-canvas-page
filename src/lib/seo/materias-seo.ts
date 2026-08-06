/**
 * Contenido editorial de las páginas públicas /ciaac/$materia (cluster SEO).
 *
 * Las cifras (preguntas por materia, total del simulador) NO viven aquí:
 * salen de `MATERIAS_DEF` para que la landing nunca prometa un número
 * distinto del que hay dentro de la app.
 *
 * Regla de compliance (ver COMPLIANCE.md): las preguntas de muestra son
 * originales, escritas para estas guías sobre conocimiento aeronáutico de
 * dominio público. Nunca se reproducen reactivos de exámenes de terceros ni
 * se afirman cifras internas de exámenes oficiales.
 */

export interface PreguntaMuestra {
  q: string;
  opts: string[];
  /** Índice de la opción correcta dentro de `opts`. */
  correct: number;
  exp: string;
}

export interface MateriaSeo {
  slug: string;
  /** Subtítulo del héroe: por qué importa esta materia. */
  gancho: string;
  /** Qué evalúa la materia en el examen (2–3 frases). */
  queEvalua: string;
  /** Los temas que más se preguntan. */
  temas: string[];
  /** Cómo conviene estudiarla (alimenta el FAQ de la página). */
  comoEstudiar: string;
  /** Preguntas de muestra originales, estilo del banco. */
  muestra: PreguntaMuestra[];
}

export const MATERIAS_SEO: Record<string, MateriaSeo> = {
  aerodinamica: {
    slug: "aerodinamica",
    gancho:
      "Es la materia que explica por qué vuela el avión — y una de las que más preguntas aporta al examen. Si dominas sustentación, pérdida y factor de carga, media materia ya es tuya.",
    queEvalua:
      "Evalúa los principios físicos del vuelo: propiedades del aire, generación de sustentación y resistencia, comportamiento del perfil alar, pérdida, estabilidad y los efectos del peso y el factor de carga sobre el desempeño.",
    temas: [
      "Las 4 fuerzas del vuelo y el vuelo recto y nivelado",
      "Sustentación: fórmula, coeficiente CL y ángulo de ataque",
      "Pérdida (stall): ángulo de ataque crítico y velocidad de pérdida",
      "Factor de carga en virajes y maniobras",
      "Densidad del aire y altitud densimétrica",
    ],
    comoEstudiar:
      "Primero entiende los conceptos (no memorices fórmulas sueltas): qué hace el ángulo de ataque, qué pasa en la pérdida y cómo el peso y el viraje cambian todo. Después martilla preguntas hasta que los escenarios se vuelvan reflejo.",
    muestra: [
      {
        q: "¿En qué condición entra en pérdida (stall) un ala?",
        opts: [
          "Siempre que la velocidad cae por debajo de la velocidad de pérdida publicada",
          "Al exceder su ángulo de ataque crítico, a cualquier velocidad y actitud",
          "Únicamente con actitud de nariz arriba",
          "Cuando se pierde potencia del motor",
        ],
        correct: 1,
        exp: "La pérdida es función del ángulo de ataque, no de la velocidad ni de la actitud: el flujo se desprende al exceder el ángulo crítico (típicamente 15°–20°). Por eso un avión puede entrar en pérdida a alta velocidad en una maniobra brusca.",
      },
      {
        q: "En un viraje nivelado con 60° de banqueo, ¿qué factor de carga soporta el avión?",
        opts: ["1.4 g", "1.15 g", "2.0 g", "3.0 g"],
        correct: 2,
        exp: "El factor de carga en viraje nivelado es 1/cos(banqueo). Con 60°: 1/cos 60° = 2. El peso aparente se duplica y la velocidad de pérdida crece con la raíz del factor de carga (≈ 41% más).",
      },
      {
        q: "Un aeropuerto alto y caluroso presenta una altitud densimétrica elevada. ¿Cuál es el efecto en el despegue?",
        opts: [
          "Carrera de despegue más corta por menor resistencia",
          "Carrera de despegue más larga y menor régimen de ascenso",
          "No hay efecto si se usa potencia máxima",
          "Mayor eficiencia de la hélice",
        ],
        correct: 1,
        exp: "Aire menos denso = menos sustentación por velocidad, menos empuje del motor y menos eficiencia de la hélice. Todo suma en contra: más pista para despegar y peor ascenso.",
      },
    ],
  },

  "aeronaves-motores": {
    slug: "aeronaves-motores",
    gancho:
      "Del carburador al turbofán: esta materia junta sistemas, motores e instrumentos. Es amplia, pero muy noble — casi todo se responde entendiendo cómo funciona la máquina.",
    queEvalua:
      "Evalúa el conocimiento de la aeronave como sistema: motores de pistón y turbina, hélices, sistemas de combustible, eléctrico e hidráulico, instrumentos y sus errores, y la operación correcta de cada uno.",
    temas: [
      "Motores de pistón: mezcla, sobrecalentamiento y detonación",
      "Hielo de carburador: condiciones, síntomas y corrección",
      "Motores de turbina: secciones y parámetros (N1, N2, EGT)",
      "Sistemas de la aeronave: combustible, eléctrico e hidráulico",
      "Instrumentos: sistema pitot-estática y giroscópicos",
    ],
    comoEstudiar:
      "Estúdiala por sistemas, no por páginas: un día mezcla y carburación, otro día turbina, otro instrumentos. Dibuja los diagramas de memoria y practica las preguntas del sistema que acabas de ver mientras está fresco.",
    muestra: [
      {
        q: "¿Por qué debe empobrecerse (lean) la mezcla al ganar altitud en un motor de pistón?",
        opts: [
          "Porque el combustible pesa menos en altura",
          "Porque la densidad del aire disminuye y la mezcla se enriquece demasiado",
          "Para aumentar la presión de admisión",
          "Para reducir la temperatura de los gases de escape en el despegue",
        ],
        correct: 1,
        exp: "Con menos densidad entra menos masa de aire por el mismo volumen, así que la relación combustible/aire se enriquece sola. Se empobrece para restaurar la proporción correcta y evitar pérdida de potencia y bujías carboneadas.",
      },
      {
        q: "En un avión con hélice de paso fijo, ¿cuál es el primer indicio típico de hielo en el carburador?",
        opts: [
          "Aumento de las RPM",
          "Caída gradual de las RPM",
          "Subida de la temperatura de aceite",
          "Vibración en el tren de aterrizaje",
        ],
        correct: 1,
        exp: "El hielo restringe el venturi del carburador y la potencia cae: con paso fijo eso se ve como pérdida gradual de RPM (con paso variable, como caída de presión de admisión). La corrección es aire caliente al carburador.",
      },
      {
        q: "En un motor a reacción, ¿qué sección sigue inmediatamente al compresor?",
        opts: ["La turbina", "La tobera de escape", "La cámara de combustión", "El fan"],
        correct: 2,
        exp: "El orden del ciclo es admisión → compresor → cámara de combustión → turbina → tobera. El aire comprimido se mezcla con combustible y se quema; la turbina extrae energía para mover el compresor.",
      },
    ],
  },

  legislacion: {
    slug: "legislacion",
    gancho:
      "La materia más 'de memoria' del CIAAC: leyes, reglamentos y facultades de la autoridad. Se gana con repetición espaciada y preguntas, no con lecturas maratónicas.",
    queEvalua:
      "Evalúa el marco jurídico de la aviación civil mexicana e internacional: la Ley de Aviación Civil y sus reglamentos, las facultades de la autoridad aeronáutica, licencias y capacidades del personal, y los convenios internacionales.",
    temas: [
      "Ley de Aviación Civil y su reglamento",
      "La autoridad aeronáutica en México y sus facultades",
      "Licencias, capacidades y certificados del personal de vuelo",
      "Convenio de Chicago y la OACI",
      "Documentos que deben llevarse a bordo",
    ],
    comoEstudiar:
      "Repetición espaciada: sesiones cortas y frecuentes de preguntas, agrupadas por ordenamiento (un día Ley de Aviación Civil, otro día reglamentos). Las explicaciones de cada reactivo te van fijando el artículo sin que tengas que leerlo diez veces.",
    muestra: [
      {
        q: "¿Qué organismo ejerce la autoridad aeronáutica en México?",
        opts: [
          "La OACI",
          "La AFAC (Agencia Federal de Aviación Civil)",
          "ASPA de México",
          "El Colegio de Pilotos Aviadores",
        ],
        correct: 1,
        exp: "La AFAC, órgano de la Secretaría de Infraestructura, Comunicaciones y Transportes, ejerce la autoridad aeronáutica: expide licencias, certifica aeronaves y vigila el cumplimiento de la normatividad. La OACI emite normas internacionales, pero no es autoridad nacional.",
      },
      {
        q: "¿Qué estableció el Convenio de Chicago de 1944?",
        opts: [
          "Las tarifas máximas del transporte aéreo internacional",
          "La creación de la OACI y los principios de la aviación civil internacional",
          "El primer reglamento de aviación de México",
          "La obligación de usar el idioma inglés en toda comunicación aérea",
        ],
        correct: 1,
        exp: "El Convenio de Chicago creó la Organización de Aviación Civil Internacional (OACI) y fijó los principios de soberanía del espacio aéreo y estandarización mediante los Anexos. México es Estado firmante.",
      },
      {
        q: "¿Cuál de los siguientes documentos debe llevarse a bordo de una aeronave civil?",
        opts: [
          "El certificado de aeronavegabilidad",
          "El contrato de compraventa de la aeronave",
          "El historial médico completo de la tripulación",
          "La declaración fiscal del operador",
        ],
        correct: 0,
        exp: "Entre los documentos exigibles a bordo están los certificados de matrícula y de aeronavegabilidad, las licencias de la tripulación y los documentos operacionales. Los contratos y documentos fiscales no son documentos de a bordo.",
      },
    ],
  },

  medicina: {
    slug: "medicina",
    gancho:
      "Hipoxia, ilusiones sensoriales y el cuerpo humano a 35,000 pies. Materia corta y muy rentable: los mismos conceptos se preguntan una y otra vez.",
    queEvalua:
      "Evalúa la fisiología de vuelo y sus límites: efectos de la altitud y la hipoxia, disbarismos, ilusiones sensoriales y desorientación espacial, visión y audición, fatiga, y los factores que incapacitan a un piloto.",
    temas: [
      "Hipoxia: tipos, síntomas y tiempo de conciencia útil",
      "Ilusiones sensoriales y desorientación espacial",
      "Visión diurna y nocturna",
      "Fatiga, estrés y automedicación",
      "Efectos de la presión: oídos, senos paranasales y gases atrapados",
    ],
    comoEstudiar:
      "Asocia cada síntoma con su causa y su corrección (hipoxia → oxígeno y descender; ilusión → instrumentos). Son escenarios más que teoría: practica preguntas situacionales hasta que la respuesta fisiológica sea automática.",
    muestra: [
      {
        q: "¿Cuál es la causa de la hipoxia hipóxica en altitud?",
        opts: [
          "La disminución de la presión parcial de oxígeno en el aire",
          "La reducción del porcentaje de oxígeno en la atmósfera",
          "El aumento del monóxido de carbono en cabina",
          "La incapacidad de la sangre para transportar oxígeno",
        ],
        correct: 0,
        exp: "El aire mantiene ~21% de oxígeno a cualquier altitud; lo que cae es la presión total y, con ella, la presión parcial de O₂ disponible para pasar a la sangre. Por eso la solución es oxígeno suplementario o descender.",
      },
      {
        q: "¿Cuál es uno de los primeros signos de hipoxia, y el más peligroso para la seguridad del vuelo?",
        opts: [
          "Dolor muscular intenso",
          "Euforia y juicio deteriorado",
          "Pérdida inmediata del conocimiento",
          "Visión doble permanente",
        ],
        correct: 1,
        exp: "La hipoxia inicia con síntomas engañosos: euforia, exceso de confianza y juicio deteriorado — la víctima no se da cuenta de que está hipóxica. De ahí la importancia de conocer tus propios síntomas y los tiempos de conciencia útil.",
      },
      {
        q: "Durante un despegue nocturno con fuerte aceleración, el piloto siente que el avión sube en exceso y quiere bajar la nariz. ¿Qué ilusión es?",
        opts: [
          "Ilusión somatogravítica",
          "Ilusión de Coriolis",
          "Falsos horizontes",
          "Ilusión autocinética",
        ],
        correct: 0,
        exp: "La aceleración lineal inclina el sistema otolítico hacia atrás y el cuerpo la interpreta como cabeceo hacia arriba. Reaccionar bajando la nariz cerca del suelo ha causado accidentes: la defensa es volar por instrumentos.",
      },
    ],
  },

  meteorologia: {
    slug: "meteorologia",
    gancho:
      "Una de las materias con más peso del examen — y de las más temidas. La clave: entender la atmósfera como sistema y leer METAR/TAF como segunda lengua.",
    queEvalua:
      "Evalúa la comprensión de la atmósfera y sus fenómenos: atmósfera estándar, estabilidad, nubes y precipitación, frentes y masas de aire, tormentas, engelamiento, viento y cortante, y la interpretación de informes y pronósticos aeronáuticos.",
    temas: [
      "Atmósfera estándar ISA y gradientes de temperatura",
      "Nubes: formación, tipos y qué peligro representa cada una",
      "Frentes, masas de aire y sistemas de presión",
      "Tormentas (cumulonimbus), turbulencia y engelamiento",
      "METAR, TAF e informes meteorológicos",
    ],
    comoEstudiar:
      "Divide en dos frentes: teoría (estabilidad, frentes, nubes) y lectura de reportes. Los METAR se aprenden decodificando uno diario; la teoría, ligando cada fenómeno con el peligro operacional que produce.",
    muestra: [
      {
        q: "Según la atmósfera estándar (ISA), ¿qué temperatura corresponde a 10,000 ft?",
        opts: ["0 °C", "−5 °C", "+5 °C", "−15 °C"],
        correct: 1,
        exp: "ISA parte de 15 °C al nivel del mar y pierde ~2 °C por cada 1,000 ft. A 10,000 ft: 15 − (2 × 10) = −5 °C. Este cálculo aparece constantemente, también en performance.",
      },
      {
        q: "¿Qué nube está asociada a tormentas eléctricas, turbulencia severa y granizo?",
        opts: ["Cirrostratus", "Estratos", "Cumulonimbus", "Altocúmulos"],
        correct: 2,
        exp: "El cumulonimbus (Cb) es la nube de desarrollo vertical por convección intensa: dentro y debajo hay corrientes violentas, engelamiento, granizo y cortante de viento. Se evita por margen amplio, nunca se atraviesa.",
      },
      {
        q: "En un METAR, la abreviatura BKN indica:",
        opts: [
          "Cielo despejado",
          "Nubosidad de 5 a 7 octas (cielo nublado)",
          "Visibilidad reducida por bruma",
          "Lluvia intermitente",
        ],
        correct: 1,
        exp: "La cobertura se reporta en octavos de cielo: FEW (1–2), SCT (3–4), BKN (5–7) y OVC (8). BKN ya constituye techo (ceiling) para efectos operacionales.",
      },
    ],
  },

  navegacion: {
    slug: "navegacion",
    gancho:
      "Cartas, rumbos, radioayudas y el eterno triángulo de viento. Materia de método: quien domina el procedimiento resuelve cualquier variante que le pongan.",
    queEvalua:
      "Evalúa la navegación aérea en todas sus formas: la Tierra y las cartas, rumbos y derrotas, variación y desviación magnética, velocidades, tiempo y combustible, radioayudas (VOR, ADF, DME) y fundamentos de navegación satelital.",
    temas: [
      "Rumbo verdadero, magnético y de brújula: variación y desviación",
      "El triángulo de viento: deriva, GS y corrección",
      "Radioayudas: VOR, radiales e interceptaciones",
      "Cartas aeronáuticas, latitud, longitud y distancias",
      "Tiempo, velocidades (IAS/TAS/GS) y cálculo de combustible",
    ],
    comoEstudiar:
      "Papel y lápiz: los cálculos de rumbos, viento y combustible se dominan haciéndolos, no leyéndolos. Resuelve series cortas cronometradas y revisa el procedimiento completo de cada error, no solo el resultado.",
    muestra: [
      {
        q: "La variación magnética es el ángulo entre:",
        opts: [
          "El rumbo de brújula y el rumbo magnético",
          "El norte verdadero y el norte magnético",
          "La derrota deseada y la derrota real",
          "El eje longitudinal del avión y el viento",
        ],
        correct: 1,
        exp: "Variación: diferencia entre norte verdadero y magnético (depende del lugar; viene en la carta). La desviación, en cambio, es el error propio de la brújula del avión. Verdadero ± variación = magnético; magnético ± desviación = brújula.",
      },
      {
        q: "Un radial de un VOR se define como:",
        opts: [
          "Una línea magnética que sale desde la estación",
          "Una línea verdadera que llega hacia la estación",
          "El rumbo que debe volar el avión para alejarse",
          "La distancia en millas náuticas a la estación",
        ],
        correct: 0,
        exp: "Los radiales son las 360 líneas magnéticas DESDE la estación. Estar 'en el radial 090' significa estar al este del VOR, sin importar hacia dónde apunte la nariz del avión.",
      },
      {
        q: "¿A cuánto equivale un minuto de latitud medido sobre un meridiano?",
        opts: ["1 kilómetro", "1 milla terrestre", "1 milla náutica", "10 millas náuticas"],
        correct: 2,
        exp: "Por definición, 1 minuto de arco de latitud = 1 NM (≈1,852 m). Por eso las distancias se miden en la escala de latitud de la carta — nunca en la de longitud, que se contrae hacia los polos.",
      },
    ],
  },

  "servicios-transito": {
    slug: "servicios-transito",
    gancho:
      "Quién te controla, en qué espacio aéreo vuelas y qué servicio te dan: la materia que ordena el cielo. Muy conceptual y con lógica clara — de las mejores para sumar puntos.",
    queEvalua:
      "Evalúa la organización del espacio aéreo y los servicios de tránsito aéreo: clasificación de espacios, servicios de control, información de vuelo y alerta, separaciones, autorizaciones ATC y los servicios en aeródromo, aproximación y área.",
    temas: [
      "Objetivos de los servicios de tránsito aéreo",
      "Clasificación del espacio aéreo (A a G) y sus requisitos",
      "Servicios de control: aeródromo, aproximación y área",
      "Servicio de información de vuelo (FIS) y servicio de alerta",
      "Autorizaciones ATC y separaciones",
    ],
    comoEstudiar:
      "Arma la tabla de espacios aéreos (quién entra, con qué reglas, qué servicio recibe) y apréndela hasta reproducirla de memoria; el resto de la materia se sostiene sobre esa tabla más los objetivos del ATS.",
    muestra: [
      {
        q: "¿Cuál de los siguientes es un objetivo de los servicios de tránsito aéreo?",
        opts: [
          "Garantizar la puntualidad comercial de las aerolíneas",
          "Prevenir colisiones entre aeronaves y ordenar y acelerar el tránsito aéreo",
          "Administrar la venta de combustible en aeródromos",
          "Sancionar infracciones de tránsito aéreo",
        ],
        correct: 1,
        exp: "Los objetivos del ATS incluyen prevenir colisiones (entre aeronaves y con obstáculos en el área de maniobras), mantener un flujo ordenado y expedito, y proporcionar información y alerta para la seguridad del vuelo.",
      },
      {
        q: "En la clasificación OACI, ¿qué vuelos se permiten en el espacio aéreo clase A?",
        opts: [
          "Solo vuelos VFR",
          "Solo vuelos IFR",
          "Vuelos IFR y VFR sin restricción",
          "Únicamente aeronaves militares",
        ],
        correct: 1,
        exp: "El espacio clase A es el más restrictivo: solo IFR, todos los vuelos reciben servicio de control y separación. El VFR queda excluido; conforme se baja de letra (B, C, D…) se relajan requisitos y servicios.",
      },
      {
        q: "El servicio de información de vuelo (FIS) se diferencia del servicio de control en que:",
        opts: [
          "Proporciona información útil para la seguridad, pero no separación entre aeronaves",
          "Solo opera en aeropuertos internacionales",
          "Emite autorizaciones obligatorias",
          "Está reservado a vuelos IFR",
        ],
        correct: 0,
        exp: "El FIS asesora e informa (meteorología, tránsito conocido, estado de aeródromos); no instruye ni separa. La separación es exclusiva del servicio de control dentro de espacio aéreo controlado.",
      },
    ],
  },

  comunicaciones: {
    slug: "comunicaciones",
    gancho:
      "Fraseología, colación y procedimientos radiotelefónicos: la materia donde hablar bien es volar seguro. Corta, práctica y con reglas muy concretas que caen seguido.",
    queEvalua:
      "Evalúa los procedimientos de comunicaciones aeronáuticas: fraseología estandarizada, alfabeto fonético OACI, colación de autorizaciones, frecuencias y su uso, procedimientos de socorro y urgencia, y fallas de comunicación.",
    temas: [
      "Alfabeto fonético OACI y transmisión de números",
      "Fraseología estándar y estructura de las llamadas",
      "Colación (readback) obligatoria de autorizaciones",
      "Socorro y urgencia: MAYDAY y PAN PAN",
      "Falla de comunicaciones: procedimientos y código transpondedor",
    ],
    comoEstudiar:
      "Se aprende hablando: lee las transmisiones en voz alta y simula la colación completa. Las reglas duras (qué se colaciona, frecuencias de emergencia, señales de socorro) son pocas — tenlas perfectas.",
    muestra: [
      {
        q: "La señal radiotelefónica de socorro, que indica peligro grave e inminente y requiere auxilio inmediato, es:",
        opts: ["PAN PAN (×3)", "MAYDAY (×3)", "SECURITÉ (×3)", "SOS (×3)"],
        correct: 1,
        exp: "MAYDAY, repetido tres veces, encabeza el mensaje de socorro y otorga prioridad absoluta sobre cualquier otra comunicación. PAN PAN (×3) es la señal de urgencia: situación seria que aún no requiere auxilio inmediato.",
      },
      {
        q: "¿Cuál es la frecuencia aeronáutica internacional de emergencia en VHF?",
        opts: ["118.10 MHz", "121.50 MHz", "123.45 MHz", "128.00 MHz"],
        correct: 1,
        exp: "121.5 MHz es la frecuencia internacional de emergencia en VHF; se recomienda mantenerla en escucha cuando el equipo lo permite. Su guarda militar en UHF es 243.0 MHz.",
      },
      {
        q: "¿Cuál de los siguientes elementos exige colación (readback) completa?",
        opts: [
          "La información de tránsito",
          "El QNH proporcionado en la autorización y la autorización de entrar a pista",
          "El reporte de posición de otra aeronave",
          "Los pronósticos meteorológicos",
        ],
        correct: 1,
        exp: "Se colacionan siempre los elementos críticos para la seguridad: autorizaciones de ruta y de pista (entrar, despegar, aterrizar, cruzar), niveles, rumbos, velocidades, códigos de transpondedor y reglaje altimétrico (QNH).",
      },
    ],
  },

  "manuales-ais": {
    slug: "manuales-ais",
    gancho:
      "AIP, NOTAM, cartas y simbología: la materia que te enseña a leer la información aeronáutica oficial. Pura interpretación — se domina practicando con las cartas enfrente.",
    queEvalua:
      "Evalúa el manejo de la información aeronáutica publicada: la estructura del AIP, los NOTAM y su vigencia, circulares de información, y la lectura de cartas y su simbología (aeródromos, radioayudas, altitudes mínimas).",
    temas: [
      "AIP: qué es y cómo está organizado (GEN, ENR, AD)",
      "NOTAM: tipos, formato y vigencia",
      "Simbología de cartas de aeródromo y de ruta",
      "Altitudes mínimas publicadas (MSA, MEA, MOCA)",
      "El servicio de información aeronáutica (AIS)",
    ],
    comoEstudiar:
      "Estudia con la carta abierta: cada símbolo que no reconozcas, búscalo y anótalo. Decodificar un NOTAM y un tramo de carta al día vale más que releer la teoría completa.",
    muestra: [
      {
        q: "¿Qué es la Publicación de Información Aeronáutica (AIP)?",
        opts: [
          "Un boletín comercial de las aerolíneas",
          "La publicación estatal con información aeronáutica esencial y de carácter permanente",
          "Un aviso urgente de cambios temporales",
          "El manual de vuelo de cada aeronave",
        ],
        correct: 1,
        exp: "El AIP es la publicación oficial de cada Estado con la información esencial y duradera para la navegación (secciones GEN, ENR y AD). Los cambios temporales o urgentes se difunden por NOTAM y suplementos.",
      },
      {
        q: "Un NOTAM se emite para notificar:",
        opts: [
          "Información permanente de aeródromos",
          "Condiciones temporales o urgentes que afectan instalaciones, servicios o peligros para la navegación",
          "Las tarifas de los servicios aeroportuarios",
          "Cambios de personal en la torre de control",
        ],
        correct: 1,
        exp: "El NOTAM avisa de condiciones de duración temporal o de aparición urgente: pistas cerradas, radioayudas fuera de servicio, obstáculos, peligros. Lo permanente va al AIP mediante enmiendas.",
      },
      {
        q: "La MSA (altitud mínima de sector) publicada en una carta garantiza:",
        opts: [
          "Separación de otras aeronaves en el sector",
          "Un margen mínimo de 1,000 ft sobre obstáculos, normalmente dentro de 25 NM del punto de referencia",
          "Cobertura de radar en todo el sector",
          "Recepción del ILS en cualquier punto",
        ],
        correct: 1,
        exp: "La MSA es una altitud de emergencia/orientación: da al menos 1,000 ft de franqueamiento de obstáculos dentro del radio publicado (típicamente 25 NM), pero no garantiza señal de radioayudas ni separación de tránsito.",
      },
    ],
  },

  "factores-humanos": {
    slug: "factores-humanos",
    gancho:
      "El 70–80% de los accidentes tienen origen humano: esta materia existe para que tú no seas estadística. Conceptos claros, modelos con nombre y escenarios de juicio.",
    queEvalua:
      "Evalúa el desempeño y las limitaciones humanas en el vuelo: percepción y toma de decisiones, conciencia situacional, manejo del error, comunicación y trabajo en cabina (CRM), actitudes peligrosas, estrés y fatiga.",
    temas: [
      "Modelo SHELL y la interfaz humano-sistema",
      "Toma de decisiones aeronáuticas (ADM) y actitudes peligrosas",
      "Conciencia situacional y gestión del error",
      "CRM: comunicación y trabajo en equipo en cabina",
      "Chequeo personal I'M SAFE, estrés y fatiga",
    ],
    comoEstudiar:
      "Apréndete los modelos con sus nombres (SHELL, I'M SAFE, las 5 actitudes peligrosas y sus antídotos) y luego practica escenarios: el examen pregunta '¿qué actitud es?' y '¿qué harías?' más que definiciones.",
    muestra: [
      {
        q: "En el modelo SHELL de factores humanos, la 'L' central representa:",
        opts: [
          "El software (procedimientos y manuales)",
          "El ser humano (liveware): el piloto como centro del sistema",
          "El hardware (la máquina)",
          "El entorno (environment)",
        ],
        correct: 1,
        exp: "SHELL: Software, Hardware, Environment, Liveware — con una L central que es la persona. El modelo analiza las interfaces del humano con procedimientos, máquina, entorno y otras personas; los problemas nacen en esas uniones.",
      },
      {
        q: "El chequeo personal I'M SAFE sirve para evaluar:",
        opts: [
          "El estado mecánico de la aeronave antes del vuelo",
          "La aptitud física y mental del piloto antes de volar",
          "La meteorología en ruta",
          "El plan de combustible",
        ],
        correct: 1,
        exp: "Illness, Medication, Stress, Alcohol, Fatigue, Emotion: seis chequeos sobre ti mismo antes de cada vuelo. Es la herramienta estándar de autoevaluación de aptitud del piloto.",
      },
      {
        q: "Un piloto piensa: 'esas reglas son para los demás, a mí no me va a pasar'. ¿Qué actitud peligrosa muestra?",
        opts: ["Impulsividad", "Resignación", "Invulnerabilidad y antiautoridad", "Machismo"],
        correct: 2,
        exp: "Combina invulnerabilidad ('a mí no me pasa') con antiautoridad ('las reglas no aplican'). Los antídotos: 'me puede pasar a mí' y 'las reglas casi siempre tienen razón'. Las cinco actitudes y sus antídotos son pregunta segura.",
      },
    ],
  },

  "seguridad-aerea": {
    slug: "seguridad-aerea",
    gancho:
      "SMS, gestión de riesgos y por qué los accidentes nunca tienen una sola causa. La materia más moderna del temario — y cada vez con más peso en la industria.",
    queEvalua:
      "Evalúa la gestión de la seguridad operacional: los sistemas SMS y sus componentes, identificación de peligros y evaluación de riesgos, modelos de causalidad de accidentes, cultura de reporte y la investigación de sucesos.",
    temas: [
      "SMS: los cuatro componentes de la gestión de seguridad operacional",
      "Peligro vs riesgo: identificación y matrices de evaluación",
      "Modelo de Reason (queso suizo) y causalidad de accidentes",
      "Cultura justa y sistemas de reporte",
      "Prevención: incidentes, accidentes y su investigación",
    ],
    comoEstudiar:
      "Domina el vocabulario exacto (peligro ≠ riesgo, incidente ≠ accidente) y los componentes del SMS. Son definiciones estables que el examen recicla; las preguntas de escenario se resuelven aplicando la matriz severidad × probabilidad.",
    muestra: [
      {
        q: "En gestión de seguridad operacional, ¿cuál es la diferencia entre peligro y riesgo?",
        opts: [
          "Son sinónimos",
          "El peligro es una condición con potencial de daño; el riesgo es la probabilidad y severidad de que ese daño ocurra",
          "El riesgo es siempre aceptable; el peligro nunca",
          "El peligro solo existe en vuelo y el riesgo solo en tierra",
        ],
        correct: 1,
        exp: "Peligro: condición u objeto con potencial de causar daño (viento cruzado, pista contaminada). Riesgo: la evaluación de ese peligro en probabilidad × severidad. El SMS identifica peligros y gestiona sus riesgos hasta un nivel aceptable.",
      },
      {
        q: "El modelo del 'queso suizo' de James Reason explica que un accidente ocurre cuando:",
        opts: [
          "Un piloto comete un error grave",
          "Las fallas latentes del sistema y las fallas activas se alinean atravesando todas las defensas",
          "La aeronave sufre una falla mecánica doble",
          "El clima supera los mínimos de operación",
        ],
        correct: 1,
        exp: "Cada capa de defensa (diseño, procedimientos, supervisión, tripulación) tiene 'agujeros' — fallas latentes y activas. El accidente ocurre cuando los agujeros se alinean. Por eso la investigación busca causas sistémicas, no culpables únicos.",
      },
      {
        q: "Una 'cultura justa' en una organización aérea significa que:",
        opts: [
          "Ningún error tiene consecuencias",
          "Se fomenta reportar errores y peligros sin castigo, distinguiéndolos de las violaciones deliberadas",
          "Todos los incidentes se sancionan por igual",
          "Los reportes de seguridad son anónimos y no se investigan",
        ],
        correct: 1,
        exp: "La cultura justa equilibra aprendizaje y responsabilidad: el error honesto se reporta y se estudia para mejorar el sistema; la negligencia y las violaciones deliberadas sí tienen consecuencias. Sin reportes no hay datos, y sin datos no hay prevención.",
      },
    ],
  },

  operaciones: {
    slug: "operaciones",
    gancho:
      "Peso y balance, performance, pista mojada y planeación de vuelo: la materia donde los números se vuelven decisiones. De las que más aportan al examen.",
    queEvalua:
      "Evalúa la operación práctica de la aeronave: peso y balance y sus efectos, performance de despegue, ascenso, crucero y aterrizaje, efectos del viento y la pista, planeación de combustible y procedimientos operacionales.",
    temas: [
      "Peso y balance: centro de gravedad y sus efectos en vuelo",
      "Performance de despegue y aterrizaje: densidad, viento y pendiente",
      "Pistas contaminadas e hidroplaneo",
      "Planeación de combustible y reservas",
      "Velocidades operacionales (V1, VR, V2, VREF)",
    ],
    comoEstudiar:
      "Trabaja los cálculos completos (peso y balance, longitudes de pista, combustible) con procedimiento escrito, y liga cada resultado con su efecto operacional: qué cambia si el CG va adelante, si hace calor, si la pista está mojada.",
    muestra: [
      {
        q: "Con el centro de gravedad cerca del límite delantero, la aeronave presenta:",
        opts: [
          "Menor estabilidad y menor velocidad de pérdida",
          "Mayor estabilidad longitudinal y mayor velocidad de pérdida",
          "Mayor rendimiento de crucero",
          "Mandos más ligeros en el aterrizaje",
        ],
        correct: 1,
        exp: "CG adelantado = más estable pero 'pesado de nariz': el estabilizador debe generar más carga hacia abajo, lo que equivale a más peso — sube la velocidad de pérdida y crece el consumo. CG atrasado da lo contrario: menos estable y potencialmente peligroso.",
      },
      {
        q: "¿Cómo afecta el viento de frente a la carrera de despegue?",
        opts: ["La alarga", "La acorta", "No la afecta", "Solo afecta el ascenso inicial"],
        correct: 1,
        exp: "Con viento de frente el ala alcanza su velocidad aerodinámica con menor velocidad respecto al suelo: menos pista para despegar y mejor gradiente sobre obstáculos. El viento de cola hace exactamente lo contrario y castiga fuerte las distancias.",
      },
      {
        q: "El hidroplaneo dinámico ocurre cuando:",
        opts: [
          "Los frenos se sobrecalientan en pista seca",
          "Una capa de agua separa los neumáticos de la pista y se pierde la fricción",
          "El tren de aterrizaje no baja por completo",
          "Se aterriza con viento cruzado fuerte",
        ],
        correct: 1,
        exp: "Sobre pista inundada, a partir de cierta velocidad el neumático 'navega' sobre el agua: sin contacto no hay frenado ni control direccional. Se combate con toque firme, aerofrenos y frenado progresivo por debajo de la velocidad crítica.",
      },
    ],
  },
};

/** Devuelve el contenido SEO de una materia o undefined si el slug no existe. */
export function materiaSeoBySlug(slug: string): MateriaSeo | undefined {
  return MATERIAS_SEO[slug];
}
