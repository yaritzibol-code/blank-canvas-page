/**
 * Contenido del centro de respuestas /respuestas (cluster AEO/GEO).
 *
 * Cada entrada es una página que responde UNA pregunta conversacional con el
 * patrón answer-first: `respuestaCorta` es el bloque citable (40–60 palabras)
 * que los motores de respuesta extraen; el resto desarrolla con párrafos
 * cortos y H2 en formato pregunta.
 *
 * Reglas (ver COMPLIANCE.md):
 * - Solo hechos que el sitio ya afirma o conocimiento aeronáutico público.
 * - Cifras del examen siempre con el marco honesto ("el formato que
 *   reproduce el simulador de FlightPath", "estándar de referencia").
 * - Nada de reglas oficiales inventadas: lo administrativo remite a la AFAC.
 */

export interface RespuestaSeccion {
  h2: string;
  parrafos: string[];
}

export interface RespuestaSeo {
  slug: string;
  /** La pregunta exacta: H1 y base del title. */
  pregunta: string;
  keywords: string;
  /** Respuesta directa citable (40–60 palabras) — el bloque AEO/GEO. */
  respuestaCorta: string;
  secciones: RespuestaSeccion[];
  /** Dato puntual destacable (stat box). */
  dato?: { valor: string; etiqueta: string; fuente: string };
  faqs: { q: string; a: string }[];
  /** Slugs de otras respuestas relacionadas. */
  relacionadas: string[];
  /** Páginas del sitio para profundizar. */
  paginas: { label: string; href: string }[];
  categoria:
    | "Examen CIAAC"
    | "Convocatoria de línea aérea"
    | "Preparación"
    | "Inglés y RTARI"
    | "Selección y aptitudes";
  /** Fecha de publicación propia (si difiere de RESPUESTAS_PUBLICADO). */
  publicado?: string;
}

/** Fechas de publicación/actualización para el schema Article (freshness). */
export const RESPUESTAS_PUBLICADO = "2026-08-06";

export const RESPUESTAS_SEO: RespuestaSeo[] = [
  {
    slug: "que-es-el-examen-ciaac",
    pregunta: "¿Qué es el examen CIAAC?",
    keywords:
      "que es el examen ciaac, examen ciaac significado, ciaac afac, examen teorico piloto comercial mexico",
    respuestaCorta:
      "El examen CIAAC es la evaluación teórica que se presenta en el Centro Internacional de Adiestramiento de Aviación Civil, de la AFAC, para obtener la licencia de Piloto Aviador Comercial en México. Evalúa las 12 materias del temario oficial en una sola aplicación y es requisito para ejercer como piloto comercial.",
    secciones: [
      {
        h2: "¿Para qué sirve el examen CIAAC?",
        parrafos: [
          "Es el filtro teórico de la licencia de Piloto Aviador Comercial (PAC): sin aprobarlo, no hay licencia. Lo administra el CIAAC, el centro de evaluación de la Agencia Federal de Aviación Civil (AFAC).",
          "A diferencia de los exámenes por materia de una escuela, el CIAAC concentra todo el temario en una sola evaluación. Por eso la preparación se parece más a un maratón que a una serie de sprints.",
        ],
      },
      {
        h2: "¿Qué evalúa exactamente?",
        parrafos: [
          "Las 12 materias del temario oficial: de Aerodinámica y Meteorología a Legislación Aeronáutica y Factores Humanos. Cada materia aporta un bloque de preguntas con peso propio.",
          "El estándar de referencia para aprobar es 80% de aciertos, así que el margen de error es corto: alrededor de una de cada cinco preguntas.",
        ],
      },
      {
        h2: "¿Cómo se prepara?",
        parrafos: [
          "Con práctica medida, no solo lectura: responder bancos de preguntas por materia, hacer simulacros completos cronometrados y atacar las materias débiles hasta cerrarlas.",
          "En FlightPath practicas con un banco propio de más de 2,800 preguntas con explicación y un simulador que reproduce el formato del examen: 310 preguntas, 5 horas y el mismo reparto por materia. Puedes empezar gratis.",
        ],
      },
    ],
    dato: {
      valor: "12",
      etiqueta: "materias en una sola evaluación",
      fuente: "Temario oficial del CIAAC (AFAC)",
    },
    faqs: [
      {
        q: "¿CIAAC es lo mismo que AFAC?",
        a: "No. La AFAC es la autoridad aeronáutica de México; el CIAAC (Centro Internacional de Adiestramiento de Aviación Civil) es su centro donde se aplica, entre otros, el examen teórico de Piloto Aviador Comercial.",
      },
      {
        q: "¿El CIAAC es solo para piloto comercial?",
        a: "El CIAAC aplica evaluaciones para distintas licencias y capacidades del personal aeronáutico. En FlightPath nos enfocamos en la preparación del examen teórico de Piloto Aviador Comercial.",
      },
      {
        q: "¿Dónde se consulta la información oficial?",
        a: "En los canales de la AFAC (gob.mx/afac) y del propio CIAAC. Fechas, sedes, requisitos administrativos y costos oficiales siempre deben verificarse ahí.",
      },
    ],
    relacionadas: [
      "que-materias-tiene-el-examen-ciaac",
      "con-cuanto-se-aprueba-el-ciaac",
      "como-estudiar-para-el-ciaac",
    ],
    paginas: [
      { label: "Guía completa del examen CIAAC", href: "/ciaac" },
      { label: "Las 12 materias, una por una", href: "/ciaac" },
      { label: "Calculadora de horas de estudio", href: "/calculadora-ciaac" },
    ],
    categoria: "Examen CIAAC",
  },

  {
    slug: "con-cuanto-se-aprueba-el-ciaac",
    pregunta: "¿Con cuánto se aprueba el examen CIAAC?",
    keywords:
      "con cuanto se aprueba el ciaac, calificacion minima ciaac, cuanto necesito para pasar el ciaac, porcentaje aprobar ciaac",
    respuestaCorta:
      "El estándar de referencia para aprobar el examen CIAAC es 80% de aciertos. Es un umbral alto: permite fallar aproximadamente una de cada cinco preguntas. Por eso la preparación efectiva se mide por materia — una sola materia floja puede arrastrar el promedio por debajo de la línea.",
    secciones: [
      {
        h2: "¿Por qué el 80% cambia cómo debes estudiar?",
        parrafos: [
          "Con un umbral de 80%, 'más o menos saberlo' no alcanza. Si en tus simulacros rondas el 70%, no estás a 10 puntos: estás a cientos de preguntas de práctica dirigida de distancia.",
          "La estrategia correcta es medir tu porcentaje por materia, no solo el global. Dos materias en 60% pueden costarte el examen aunque el resto esté en 85%.",
        ],
      },
      {
        h2: "¿Cómo saber si ya estás en zona de aprobar?",
        parrafos: [
          "Simulacros completos en condiciones reales: cronometrados, sin pausas y con el reparto de preguntas por materia del examen. Un buen resultado aislado no es señal; tres simulacros seguidos arriba de 80% sí.",
          "El simulador de FlightPath usa ese mismo umbral de referencia para decirte si habrías aprobado, y te desglosa el resultado por materia para que sepas exactamente dónde recuperar puntos. Las preguntas sin responder cuentan como error, igual que en el examen.",
        ],
      },
    ],
    dato: {
      valor: "80%",
      etiqueta: "estándar de referencia para aprobar",
      fuente: "Umbral usado por el simulador de FlightPath",
    },
    faqs: [
      {
        q: "¿El 80% es por materia o global?",
        a: "La referencia con la que trabajamos es la calificación global del examen. Aun así, entrenar cada materia arriba de 80% es la única forma segura de que el promedio no dependa de la suerte del reparto.",
      },
      {
        q: "¿Las preguntas sin contestar restan?",
        a: "Cuentan como error: una pregunta en blanco pesa igual que una incorrecta. Administrar el tiempo para responder todo es parte del entrenamiento.",
      },
      {
        q: "¿Dónde confirmo el criterio oficial vigente?",
        a: "Con la AFAC y el CIAAC al registrar tu trámite. Nuestro 80% es el estándar de referencia con el que calibramos la práctica y los simulacros.",
      },
    ],
    relacionadas: [
      "cuantas-preguntas-tiene-el-examen-ciaac",
      "cual-es-la-materia-mas-dificil-del-ciaac",
      "cuanto-tiempo-estudiar-para-el-ciaac",
    ],
    paginas: [
      { label: "Simulador CIAAC de FlightPath", href: "/simulador-ciaac" },
      { label: "Guía del examen CIAAC", href: "/ciaac" },
    ],
    categoria: "Examen CIAAC",
  },

  {
    slug: "cuantas-preguntas-tiene-el-examen-ciaac",
    pregunta: "¿Cuántas preguntas tiene el examen CIAAC y cuánto dura?",
    keywords:
      "cuantas preguntas tiene el examen ciaac, duracion examen ciaac, formato examen ciaac, cuanto dura el ciaac",
    respuestaCorta:
      "El simulador de FlightPath reproduce el formato del examen CIAAC con 310 preguntas de opción múltiple, un límite de 5 horas y un reparto fijo por materia: las 12 materias del temario aportan entre 20 y 30 preguntas cada una. Las preguntas dejadas en blanco cuentan como error.",
    secciones: [
      {
        h2: "¿Cómo se reparten las preguntas por materia?",
        parrafos: [
          "No todas las materias pesan igual. Materias como Aerodinámica, Meteorología, Navegación o Legislación aportan 30 preguntas; otras, como Medicina de Aviación o Comunicaciones, aportan 20.",
          "Ese reparto es la razón de priorizar por peso: un punto porcentual ganado en una materia de 30 preguntas vale más que en una de 20. La guía de cada materia detalla su peso exacto.",
        ],
      },
      {
        h2: "¿Qué implica el límite de 5 horas?",
        parrafos: [
          "Con 310 preguntas en 300 minutos, tienes menos de un minuto por pregunta. La resistencia y la administración del tiempo son parte del examen tanto como el conocimiento.",
          "Por eso los simulacros completos importan: entrenan el ritmo, la fatiga de la hora cuatro y la disciplina de no atorarte en una pregunta. Practicar solo por bloques cortos deja ese músculo sin entrenar.",
        ],
      },
    ],
    dato: {
      valor: "310",
      etiqueta: "preguntas · 5 horas · 12 materias",
      fuente: "Formato del simulador de FlightPath",
    },
    faqs: [
      {
        q: "¿Todas las preguntas son de opción múltiple?",
        a: "En el simulador de FlightPath, sí: reactivos de opción múltiple con una respuesta correcta, como se estila en las evaluaciones teóricas aeronáuticas.",
      },
      {
        q: "¿Puedo saltarme preguntas y regresar?",
        a: "En el simulador puedes marcar preguntas para revisarlas antes de entregar — y conviene, porque cualquier pregunta sin responder cuenta como error.",
      },
      {
        q: "¿El formato oficial puede cambiar?",
        a: "La autoridad puede ajustar sus evaluaciones; confirma los detalles vigentes con la AFAC/CIAAC al registrarte. FlightPath mantiene su simulador alineado al formato con el que entrena a su generación.",
      },
    ],
    relacionadas: [
      "con-cuanto-se-aprueba-el-ciaac",
      "que-materias-tiene-el-examen-ciaac",
      "cuanto-tiempo-estudiar-para-el-ciaac",
    ],
    paginas: [
      { label: "Simulador CIAAC: cómo funciona", href: "/simulador-ciaac" },
      { label: "Peso de cada materia en el examen", href: "/ciaac" },
    ],
    categoria: "Examen CIAAC",
  },

  {
    slug: "cuanto-tiempo-estudiar-para-el-ciaac",
    pregunta: "¿Cuánto tiempo se necesita para estudiar el CIAAC?",
    keywords:
      "cuanto tiempo estudiar para el ciaac, horas de estudio ciaac, plan de estudio ciaac, en cuanto tiempo me preparo para el ciaac",
    respuestaCorta:
      "Como referencia de planeación: unas 150 horas de estudio si empiezas desde cero, 100 si ya llevas avance y 60 para un repaso final — repartidas entre las 12 materias según su peso en el examen. A 2–3 horas diarias, eso significa empezar entre 8 y 10 semanas antes.",
    secciones: [
      {
        h2: "¿De dónde salen esas horas?",
        parrafos: [
          "Son los valores de referencia de la calculadora de estudio de FlightPath, pensados para un umbral de aprobación de 80%. No son una regla oficial: son un punto de partida realista que luego ajustas con tus resultados.",
          "El reparto importa tanto como el total: las materias de 30 preguntas (Aerodinámica, Meteorología, Navegación, Legislación, entre otras) merecen más horas que las de 20.",
        ],
      },
      {
        h2: "¿Constancia o maratones?",
        parrafos: [
          "Constancia. Dos o tres horas diarias durante dos meses rinden más que desvelos concentrados en las últimas dos semanas: la memoria de largo plazo se construye con repetición espaciada.",
          "La forma más rápida de saber si vas a tiempo es meter tu fecha de examen y tu disponibilidad real en la calculadora: te dice cuántas horas tendrás, cuántas necesitas y cómo repartirlas materia por materia.",
        ],
      },
    ],
    dato: {
      valor: "150 h",
      etiqueta: "referencia si empiezas desde cero",
      fuente: "Calculadora de estudio de FlightPath",
    },
    faqs: [
      {
        q: "¿Puedo prepararme en un mes?",
        a: "Depende de tu punto de partida y tus horas libres. Para 100–150 horas en 30 días necesitas 3.5–5 horas diarias sostenidas — posible, pero exigente. La calculadora te dice el ritmo exacto que requiere tu fecha.",
      },
      {
        q: "¿Cómo reparto las horas entre materias?",
        a: "Proporcionalmente al peso de cada materia en el examen, y con un extra a tus materias débiles. La calculadora hace el reparto por peso automáticamente.",
      },
    ],
    relacionadas: [
      "como-estudiar-para-el-ciaac",
      "cuando-es-el-proximo-examen-ciaac",
      "cuantas-preguntas-tiene-el-examen-ciaac",
    ],
    paginas: [
      { label: "Calculadora de horas de estudio", href: "/calculadora-ciaac" },
      { label: "Guías por materia", href: "/ciaac" },
    ],
    categoria: "Preparación",
  },

  {
    slug: "que-materias-tiene-el-examen-ciaac",
    pregunta: "¿Qué materias tiene el examen CIAAC?",
    keywords:
      "materias del ciaac, temario ciaac, que materias entran en el examen ciaac, 12 materias piloto comercial",
    respuestaCorta:
      "El examen CIAAC evalúa 12 materias: Aerodinámica, Aeronaves y Motores, Legislación Aeronáutica, Medicina de Aviación, Meteorología, Navegación Aérea, Servicios de Tránsito Aéreo, Comunicaciones Aeronáuticas, Manuales de Información Aeronáutica, Factores Humanos, Seguridad Aérea y Operaciones Aeronáuticas — todas en una sola aplicación.",
    secciones: [
      {
        h2: "¿Cuáles materias pesan más?",
        parrafos: [
          "En el formato que reproduce el simulador de FlightPath, siete materias aportan 30 preguntas cada una: Aerodinámica, Aeronaves y Motores, Legislación, Meteorología, Navegación, Servicios de Tránsito y Operaciones. Las otras cinco aportan 20.",
          "Ese peso debería ordenar tu plan: las materias de 30 preguntas concentran el 68% del examen.",
        ],
      },
      {
        h2: "¿Por dónde empezar?",
        parrafos: [
          "Por un diagnóstico, no por una materia 'fácil': responde un bloque de preguntas de cada materia y deja que los datos te digan dónde estás débil.",
          "Cada materia tiene su propia guía en FlightPath — qué evalúa, sus temas más frecuentes y preguntas de muestra con explicación — para que el arranque no sea a ciegas.",
        ],
      },
    ],
    dato: {
      valor: "7 de 12",
      etiqueta: "materias concentran el 68% de las preguntas",
      fuente: "Reparto del simulador de FlightPath (310 preguntas)",
    },
    faqs: [
      {
        q: "¿Se pueden presentar las materias por separado?",
        a: "El examen teórico del CIAAC evalúa el temario completo en una sola aplicación; los detalles administrativos vigentes se confirman con la AFAC. Lo que sí puedes separar es tu práctica: en FlightPath estudias y mides cada materia de forma independiente.",
      },
      {
        q: "¿Qué materia es la más difícil?",
        a: "Depende de tu perfil: a quienes vienen de escuela les suele costar Legislación; a quienes dominan la teoría, la resistencia del examen completo. Lo que importa es detectar TU materia difícil con datos y atacarla primero.",
      },
    ],
    relacionadas: [
      "cual-es-la-materia-mas-dificil-del-ciaac",
      "cuantas-preguntas-tiene-el-examen-ciaac",
      "como-estudiar-para-el-ciaac",
    ],
    paginas: [
      { label: "Las 12 materias con su guía completa", href: "/ciaac" },
      { label: "Aerodinámica para el CIAAC", href: "/ciaac/aerodinamica" },
      { label: "Meteorología para el CIAAC", href: "/ciaac/meteorologia" },
    ],
    categoria: "Examen CIAAC",
  },

  {
    slug: "cual-es-la-materia-mas-dificil-del-ciaac",
    pregunta: "¿Cuál es la materia más difícil del CIAAC?",
    keywords:
      "materia mas dificil del ciaac, materias dificiles piloto comercial, que materia reprueba mas gente ciaac",
    respuestaCorta:
      "No existe una materia universalmente más difícil del CIAAC: depende de tu formación. Las candidatas más frecuentes son Legislación Aeronáutica (pura memoria normativa), Meteorología (teoría densa más interpretación de reportes) y Navegación (cálculo bajo presión). La materia más peligrosa es la que no has medido.",
    secciones: [
      {
        h2: "¿Por qué 'difícil' depende de tu perfil?",
        parrafos: [
          "Quien viene de horas de vuelo suele dominar lo operacional y sufrir la memorización normativa; quien viene fresco de la escuela, al revés. La dificultad es personal, y tratarla como universal lleva a estudiar lo que no te hace falta.",
          "La única forma objetiva de encontrar tu materia difícil es responder preguntas de las 12 y comparar tus porcentajes. Veinte preguntas por materia bastan para un primer diagnóstico.",
        ],
      },
      {
        h2: "¿Qué hacer con tu materia más débil?",
        parrafos: [
          "Dale prioridad de calendario (más sesiones, no sesiones más largas), practica por tema hasta ubicar el hueco exacto y vuelve a medir en simulacro. Repite hasta que deje de ser la peor.",
          "En FlightPath el análisis por materia hace ese ciclo por ti: detecta dónde fallas, te dirige el repaso y te muestra la mejora en datos.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cuáles materias pesan más en el examen?",
        a: "Siete materias aportan 30 preguntas cada una en el formato del simulador: Aerodinámica, Aeronaves y Motores, Legislación, Meteorología, Navegación, Servicios de Tránsito Aéreo y Operaciones. Una debilidad ahí cuesta el doble que en una materia de 20 preguntas.",
      },
      {
        q: "¿Conviene empezar por la materia más difícil?",
        a: "Conviene empezar por el diagnóstico. Después sí: ataca primero la materia débil de mayor peso, porque es donde cada hora de estudio recupera más puntos.",
      },
    ],
    relacionadas: [
      "que-materias-tiene-el-examen-ciaac",
      "como-estudiar-para-el-ciaac",
      "con-cuanto-se-aprueba-el-ciaac",
    ],
    paginas: [
      { label: "Guías de las 12 materias", href: "/ciaac" },
      { label: "Legislación Aeronáutica para el CIAAC", href: "/ciaac/legislacion" },
      { label: "Navegación Aérea para el CIAAC", href: "/ciaac/navegacion" },
    ],
    categoria: "Examen CIAAC",
  },

  {
    slug: "como-estudiar-para-el-ciaac",
    pregunta: "¿Cómo estudiar para el examen CIAAC?",
    keywords:
      "como estudiar para el ciaac, metodo de estudio ciaac, como prepararse para el examen ciaac, plan de estudio piloto comercial",
    respuestaCorta:
      "El método que funciona para el CIAAC es practicar midiendo: diagnostica tu nivel por materia con bancos de preguntas, estudia dirigido a tus huecos, y valida con simulacros completos cronometrados hasta sostener 80% o más. Leer manuales de corrido, sin responder preguntas, es la forma más lenta de preparar este examen.",
    secciones: [
      {
        h2: "El ciclo: practicar, medir, corregir",
        parrafos: [
          "Primero un diagnóstico honesto: preguntas de las 12 materias para saber dónde estás. Después, sesiones cortas y frecuentes dirigidas a los temas donde fallas, con la explicación de cada error como material de estudio.",
          "Cada dos o tres semanas, un simulacro completo en condiciones reales. El resultado por materia redefine tu plan de la siguiente etapa. Tres simulacros seguidos arriba de 80% son tu señal de estar listo.",
        ],
      },
      {
        h2: "Los errores clásicos que alargan la preparación",
        parrafos: [
          "Leer sin practicar (la comprensión no sobrevive al formato de opción múltiple sin entrenamiento), estudiar solo la materia favorita, y dejar los simulacros completos para el final — cuando ya no hay tiempo de corregir lo que revelan.",
          "También subestimar la logística: sin un plan de horas por materia y una fecha objetivo, el temario de 12 materias se vuelve un mar sin orillas. Empieza por calcular tus horas reales.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cuántas preguntas de práctica debería responder?",
        a: "Las suficientes para sostener 80% en simulacro — para la mayoría son varios miles a lo largo de la preparación. El banco de FlightPath tiene más de 2,800 preguntas propias con explicación y fuente para cubrir ese volumen sin repetir de memoria.",
      },
      {
        q: "¿Sirve estudiar en grupo?",
        a: "Sirve para constancia y para explicar en voz alta (excelente prueba de dominio). Lo que no sustituye es tu práctica individual medida: el examen lo respondes tú.",
      },
      {
        q: "¿Con qué frecuencia hacer simulacros completos?",
        a: "Cada dos o tres semanas durante la preparación, y uno semanal en el último mes. Más frecuente desgasta sin aportar; menos, te deja sin datos para corregir.",
      },
    ],
    relacionadas: [
      "cuanto-tiempo-estudiar-para-el-ciaac",
      "con-cuanto-se-aprueba-el-ciaac",
      "cual-es-la-materia-mas-dificil-del-ciaac",
    ],
    paginas: [
      { label: "Empieza gratis en FlightPath", href: "/ciaac" },
      { label: "Calculadora de horas de estudio", href: "/calculadora-ciaac" },
      { label: "Simulador CIAAC", href: "/simulador-ciaac" },
    ],
    categoria: "Preparación",
  },

  {
    slug: "que-pasa-si-repruebo-el-ciaac",
    pregunta: "¿Qué pasa si repruebo el examen CIAAC?",
    keywords:
      "reprobar el ciaac, que pasa si no paso el ciaac, segunda oportunidad ciaac, volver a presentar examen ciaac",
    respuestaCorta:
      "Reprobar el CIAAC no cierra tu carrera: el examen puede volver a presentarse conforme a los tiempos y trámites que fije la AFAC — confírmalos directamente con la autoridad, porque son administrativos y pueden cambiar. Lo decisivo es usar el intento fallido como diagnóstico: identificar qué materias te costaron y reconstruir la preparación con práctica medida.",
    secciones: [
      {
        h2: "Lo primero: confirmar lo administrativo con la AFAC",
        parrafos: [
          "Plazos de espera, costos y requisitos para reprogramar son competencia de la AFAC y del CIAAC. No te guíes por lo que 'dicen los grupos': verifica en los canales oficiales antes de planear tu siguiente intento.",
          "Con la fecha nueva en mano, el resto es un problema de preparación — y ese sí está completamente bajo tu control.",
        ],
      },
      {
        h2: "Cómo convertir el intento fallido en ventaja",
        parrafos: [
          "Reconstruye qué materias te fallaron mientras la memoria está fresca. Esa lista vale oro: es el diagnóstico que la mayoría no tiene al empezar.",
          "Después, prepara distinto, no igual pero más tiempo: práctica dirigida a esas materias, simulacros completos desde el inicio y un umbral de salida claro (sostener 80%+ en tres simulacros seguidos antes de volver a presentar).",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cuánto tiempo debo esperar para volver a presentar?",
        a: "Es un dato administrativo de la autoridad: confírmalo con la AFAC/CIAAC para tu caso. Usa ese tiempo con un plan de horas concreto en lugar de improvisar.",
      },
      {
        q: "¿Cuánto debería prepararme para el segundo intento?",
        a: "Depende de qué tan cerca quedaste. Como referencia, la calculadora de FlightPath sugiere ~100 horas para quien ya lleva avance, con reparto por peso de materia y refuerzo en tus débiles.",
      },
    ],
    relacionadas: [
      "como-estudiar-para-el-ciaac",
      "con-cuanto-se-aprueba-el-ciaac",
      "cuando-es-el-proximo-examen-ciaac",
    ],
    paginas: [
      { label: "Calculadora: arma tu plan de segundo intento", href: "/calculadora-ciaac" },
      { label: "Análisis por materia en FlightPath", href: "/ciaac" },
    ],
    categoria: "Examen CIAAC",
  },

  {
    slug: "cuando-es-el-proximo-examen-ciaac",
    pregunta: "¿Cuándo es el próximo examen CIAAC?",
    keywords:
      "proximo examen ciaac, fecha examen ciaac 2026, convocatoria ciaac 2026 fecha, cuando aplica el ciaac",
    respuestaCorta:
      "La próxima fecha de examen CIAAC registrada en FlightPath es el 17 de agosto de 2026. Las fechas oficiales las publica la AFAC a través de sus canales y del propio CIAAC, así que confirma siempre ahí tu convocatoria y su trámite antes de planear.",
    secciones: [
      {
        h2: "¿Cómo enterarse a tiempo de cada convocatoria?",
        parrafos: [
          "La fuente es la AFAC (gob.mx/afac) y el CIAAC; las escuelas de aviación suelen replicar el aviso a sus alumnos. Desconfía de fechas sin fuente que circulan en grupos.",
          "En FlightPath mantenemos la fecha de la siguiente aplicación visible en la portada, con cuenta regresiva, y la actualizamos cuando la autoridad publica un nuevo periodo.",
        ],
      },
      {
        h2: "¿Cuándo empezar a estudiar respecto a la fecha?",
        parrafos: [
          "Entre 8 y 10 semanas antes si partes de cero (unas 150 horas de estudio a ritmo sostenible); 5–6 semanas si ya llevas avance. Después de la fecha límite realista, cada semana perdida se paga en horas diarias extra.",
          "Mete tu fecha en la calculadora: te dice si tu disponibilidad alcanza y cómo repartir las horas entre las 12 materias.",
        ],
      },
    ],
    dato: {
      valor: "17 ago 2026",
      etiqueta: "próxima fecha registrada en FlightPath",
      fuente: "Verifícala con la AFAC/CIAAC",
    },
    faqs: [
      {
        q: "¿Cada cuánto hay examen CIAAC?",
        a: "La periodicidad la define la autoridad y puede variar; por eso conviene seguir los canales de la AFAC y preparar con anticipación en lugar de esperar el aviso para empezar.",
      },
      {
        q: "¿Qué necesito para registrarme?",
        a: "El trámite, requisitos y costos oficiales se consultan y gestionan con la AFAC/CIAAC. FlightPath te prepara para el examen; el registro es directamente con la autoridad.",
      },
    ],
    relacionadas: [
      "cuanto-tiempo-estudiar-para-el-ciaac",
      "que-es-el-examen-ciaac",
      "como-estudiar-para-el-ciaac",
    ],
    paginas: [
      { label: "Convocatoria CIAAC 2026: guía completa", href: "/convocatoria-ciaac-2026" },
      { label: "Calculadora de horas de estudio", href: "/calculadora-ciaac" },
    ],
    categoria: "Examen CIAAC",
  },

  {
    slug: "que-es-la-licencia-de-piloto-aviador-comercial",
    pregunta: "¿Qué es la licencia de Piloto Aviador Comercial en México?",
    keywords:
      "licencia piloto aviador comercial mexico, licencia PAC, como ser piloto comercial en mexico, requisitos piloto comercial",
    respuestaCorta:
      "La licencia de Piloto Aviador Comercial (PAC) es la que permite volar profesionalmente y recibir remuneración como piloto en México. La expide la AFAC y exige, entre otros requisitos, formación en una escuela autorizada, horas de vuelo y aprobar el examen teórico del CIAAC sobre las 12 materias del temario.",
    secciones: [
      {
        h2: "¿Qué diferencia hay entre piloto privado y comercial?",
        parrafos: [
          "La licencia privada permite volar sin remuneración; la comercial habilita el ejercicio profesional — y por eso su estándar teórico y práctico es más alto.",
          "Para quien aspira a línea aérea, la PAC es el escalón previo: las convocatorias de primer oficial parten de pilotos ya licenciados con horas acumuladas.",
        ],
      },
      {
        h2: "¿Dónde encaja el CIAAC en el camino?",
        parrafos: [
          "El CIAAC es el examen teórico de la licencia: el punto donde la formación de escuela se valida ante la autoridad. Es un filtro real — 12 materias, estándar de referencia de 80% — y la razón de que la preparación teórica merezca método propio.",
          "Los requisitos completos y vigentes de la licencia (médicos, de horas y documentales) se consultan con la AFAC; tu escuela de aviación normalmente guía ese expediente.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Necesito la PAC para la convocatoria de Aeroméxico?",
        a: "Las convocatorias de primer oficial están dirigidas a pilotos formados; la convocatoria ASPA · Aeroméxico Connect, por ejemplo, pide 250 horas de vuelo certificadas. La licencia y las horas son la base sobre la que compites.",
      },
      {
        q: "¿Cuánto se tarda en obtener la licencia?",
        a: "Depende de tu escuela, tu ritmo de vuelo y tu preparación teórica. Lo que sí acelera el tramo final es llegar al CIAAC con la teoría dominada en lugar de improvisarla.",
      },
    ],
    relacionadas: [
      "que-es-el-examen-ciaac",
      "que-es-la-convocatoria-aspa-aeromexico",
      "como-estudiar-para-el-ciaac",
    ],
    paginas: [
      { label: "Preparación para el examen CIAAC", href: "/ciaac" },
      { label: "Convocatoria Aeroméxico · Primer Oficial", href: "/convocatoria-aeromexico" },
    ],
    categoria: "Examen CIAAC",
  },

  {
    slug: "cuanto-cuesta-prepararse-para-el-ciaac",
    pregunta: "¿Cuánto cuesta prepararse para el examen CIAAC?",
    keywords:
      "cuanto cuesta prepararse para el ciaac, precio curso ciaac, cuanto cuesta un curso para el examen ciaac, preparacion ciaac precio",
    respuestaCorta:
      "Prepararte para el CIAAC puede costar desde cero (manuales públicos y estudio autodidacta) hasta decenas de miles de pesos en cursos presenciales. En el punto medio están las plataformas en línea: FlightPath, por ejemplo, tiene un plan gratuito para empezar y un plan Pro de $500 MXN al mes más una inscripción única de $3,000 MXN.",
    secciones: [
      {
        h2: "Las tres rutas y su costo real",
        parrafos: [
          "Autodidacta: gratis en dinero, cara en tiempo — sin banco de práctica ni medición, es la ruta con más riesgo de llegar al examen sin saber cuánto sabes. El costo de reprobar (tiempo, trámites, otra ronda de preparación) rara vez se contabiliza.",
          "Cursos presenciales: útiles para disciplina y dudas en vivo, con precios y horarios de curso tradicional. Plataformas en línea: práctica ilimitada, medición por materia y precio mensual — el punto fuerte es estudiar con datos a tu ritmo.",
        ],
      },
      {
        h2: "¿Qué incluye cada peso en FlightPath?",
        parrafos: [
          "El plan Básico es gratis para siempre: una muestra del banco por materia, un simulacro al mes y parte de la biblioteca — suficiente para conocer el método antes de pagar.",
          "Pro ($500 MXN/mes + $3,000 MXN de inscripción única) abre el banco completo de más de 2,800 preguntas con explicación, simulacros ilimitados de 310 preguntas, la tutora con IA y el análisis por materia. Sin plazos forzosos: cancelas cuando quieras.",
        ],
      },
    ],
    dato: {
      valor: "$0",
      etiqueta: "cuesta empezar: el plan Básico es gratis",
      fuente: "Precios publicados de FlightPath",
    },
    faqs: [
      {
        q: "¿El costo del examen oficial está incluido en algún curso?",
        a: "No. Los derechos y trámites del examen se pagan directamente con la autoridad (AFAC/CIAAC) y son independientes de cualquier preparación. Consulta los costos oficiales vigentes en sus canales.",
      },
      {
        q: "¿Qué sale más barato al final?",
        a: "La preparación que te hace aprobar a la primera. Un curso barato que termina en segundo intento cuesta más — en tiempo y en trámites — que una preparación medida que te lleva al 80% con evidencia.",
      },
    ],
    relacionadas: [
      "como-estudiar-para-el-ciaac",
      "simulador-ciaac-gratis",
      "cuanto-tiempo-estudiar-para-el-ciaac",
    ],
    paginas: [
      { label: "Precios de FlightPath", href: "/precios" },
      { label: "Comparativa: opciones para preparar el CIAAC", href: "/mejor-plataforma-ciaac" },
    ],
    categoria: "Preparación",
  },

  {
    slug: "simulador-ciaac-gratis",
    pregunta: "¿Dónde puedo hacer un simulador del examen CIAAC gratis?",
    keywords:
      "simulador ciaac gratis, examen de practica ciaac gratis, simulacro ciaac online, test ciaac gratis",
    respuestaCorta:
      "En FlightPath puedes hacer un simulacro completo del examen CIAAC gratis cada mes con la cuenta Básica: 310 preguntas, 5 horas de límite, el reparto por materia del formato del examen y calificación con desglose al terminar. No pide tarjeta; solo crear la cuenta.",
    secciones: [
      {
        h2: "¿Qué incluye el simulacro gratuito?",
        parrafos: [
          "El formato completo: 310 preguntas de las 12 materias con su ponderación, cronómetro de 5 horas, preguntas en blanco contadas como error y calificación final contra el estándar de referencia de 80%.",
          "Al terminar ves tu desglose por materia — el dato que convierte un simulacro en un plan de estudio. Un intento al mes alcanza para medirte; la práctica diaria entre simulacros es la que mueve el resultado.",
        ],
      },
      {
        h2: "¿Cuándo conviene pasar a simulacros ilimitados?",
        parrafos: [
          "Cuando entras al último tramo (4–6 semanas antes del examen) y necesitas validar semana a semana, o cuando tu primer simulacro salió lejos del 80% y quieres medir cada corrección.",
          "El plan Pro quita el límite y suma el banco completo con explicaciones y el análisis por materia — la combinación con la que el simulacro deja de ser termómetro y se vuelve entrenamiento.",
        ],
      },
    ],
    dato: {
      valor: "1/mes",
      etiqueta: "simulacro completo gratis con la cuenta Básica",
      fuente: "Planes publicados de FlightPath",
    },
    faqs: [
      {
        q: "¿El simulador gratis es una versión recortada?",
        a: "No: es el mismo simulador de 310 preguntas y 5 horas del plan Pro. Lo que limita la cuenta Básica es la frecuencia (uno al mes) y el tamaño del banco de práctica fuera del simulacro.",
      },
      {
        q: "¿Necesito tarjeta para la cuenta gratis?",
        a: "No. La cuenta Básica es gratuita para siempre y no pide método de pago; pasas a Pro solo si tú lo decides.",
      },
    ],
    relacionadas: [
      "cuantas-preguntas-tiene-el-examen-ciaac",
      "con-cuanto-se-aprueba-el-ciaac",
      "cuanto-cuesta-prepararse-para-el-ciaac",
    ],
    paginas: [
      { label: "Cómo funciona el simulador CIAAC", href: "/simulador-ciaac" },
      { label: "Crear cuenta gratis", href: "/register" },
    ],
    categoria: "Preparación",
  },

  {
    slug: "banco-de-preguntas-ciaac-pdf",
    pregunta: "¿Existe un banco de preguntas del CIAAC en PDF?",
    keywords:
      "banco de preguntas ciaac pdf, guia ciaac pdf, preguntas del examen ciaac pdf descargar, cuestionario ciaac pdf",
    respuestaCorta:
      "Circulan PDFs informales con preguntas 'del CIAAC', pero suelen estar desactualizados, sin explicaciones y sin fuente verificable. La alternativa seria es un banco interactivo: FlightPath mantiene más de 2,800 preguntas propias con explicación y fuente por reactivo, organizadas por materia y tema, con estadísticas de tus aciertos.",
    secciones: [
      {
        h2: "El problema de estudiar con un PDF suelto",
        parrafos: [
          "Un PDF no te dice por qué la respuesta correcta es correcta, no se actualiza cuando cambia el temario y no lleva registro de qué ya dominas. Memorizar respuestas sin explicación se castiga en cuanto el examen reformula la pregunta.",
          "Además, muchos PDFs que circulan reproducen material de origen dudoso. Un banco propio con fuente citada por pregunta es defendible y estudiable; un archivo anónimo no es ninguna de las dos.",
        ],
      },
      {
        h2: "Qué buscar en un banco de preguntas serio",
        parrafos: [
          "Explicación por reactivo (el porqué es el material de estudio real), fuente citada, organización por materia y tema del temario, volumen suficiente para no memorizar el orden, y medición de tu desempeño.",
          "Con ese estándar evalúa cualquier opción — incluida la nuestra. El banco de FlightPath se puede probar gratis: la cuenta Básica incluye una muestra por materia para revisar la calidad antes de decidir.",
        ],
      },
    ],
    dato: {
      valor: "2,800+",
      etiqueta: "preguntas propias con explicación y fuente",
      fuente: "Banco de FlightPath",
    },
    faqs: [
      {
        q: "¿Puedo descargar las preguntas de FlightPath en PDF?",
        a: "El banco vive en la plataforma: ahí las preguntas se actualizan, se mezclan en simulacros y alimentan tu análisis por materia. Ese es justo el valor que un PDF estático no puede dar.",
      },
      {
        q: "¿Las preguntas de FlightPath son las del examen oficial?",
        a: "No. Son un banco propio, desarrollado de forma independiente y mapeado al temario oficial publicado. Ningún proveedor serio puede ofrecerte legítimamente 'las preguntas del examen'.",
      },
    ],
    relacionadas: [
      "como-estudiar-para-el-ciaac",
      "simulador-ciaac-gratis",
      "que-materias-tiene-el-examen-ciaac",
    ],
    paginas: [
      { label: "El banco de preguntas de FlightPath", href: "/banco-de-preguntas-ciaac" },
      { label: "Preguntas de muestra por materia", href: "/ciaac" },
    ],
    categoria: "Preparación",
  },

  {
    slug: "que-es-la-convocatoria-aspa-aeromexico",
    pregunta: "¿Qué es la convocatoria de ASPA y Aeroméxico Connect?",
    keywords:
      "convocatoria aspa aeromexico, que es la convocatoria de aeromexico, convocatoria primer oficial embraer 190, aspa de mexico convocatoria",
    respuestaCorta:
      "Es el proceso mediante el cual ASPA de México invita a pilotos a integrarse como Primer Oficial de la flota Embraer 190 de Aeroméxico Connect. Consta de cuatro evaluaciones: un examen teórico sobre el temario oficial, la batería AON Aviation Suite (incluye inglés), una evaluación en simulador y una entrevista con panel.",
    secciones: [
      {
        h2: "¿Cómo funciona el proceso?",
        parrafos: [
          "El examen teórico es la primera puerta: evalúa cinco fuentes publicadas (ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10). Después vienen la evaluación psicométrica AON, el simulador y el panel.",
          "Cada etapa filtra. Llegar con el temario dominado no solo pasa la primera: te quita presión para las tres siguientes.",
        ],
      },
      {
        h2: "¿Quién puede participar?",
        parrafos: [
          "La convocatoria pide, entre otros requisitos: edad de 18 a 50 años con 11 meses, nacionalidad mexicana por nacimiento, 250 horas de vuelo certificadas (mínimo 180 de vuelo real), carta de presentación de ASPA y expediente actualizado en el sindicato.",
          "Los requisitos y vigencia exactos los define la convocatoria oficial de ASPA; verifica ahí tu elegibilidad antes de planear la preparación.",
        ],
      },
    ],
    dato: {
      valor: "4",
      etiqueta: "evaluaciones: teórico, AON, simulador y panel",
      fuente: "Proceso publicado de la convocatoria",
    },
    faqs: [
      {
        q: "¿FlightPath está afiliada a ASPA o Aeroméxico?",
        a: "No. FlightPath es una plataforma independiente de preparación: su banco de práctica es propio y está mapeado al temario público de la convocatoria. La información oficial es siempre la de ASPA y la empresa.",
      },
      {
        q: "¿Qué tan seguido abre la convocatoria?",
        a: "Depende de las necesidades de contratación de la aerolínea; no hay calendario fijo público. Por eso conviene preparar el temario antes de que abra: cuando se publica, el tiempo corre.",
      },
    ],
    relacionadas: [
      "requisitos-convocatoria-aeromexico",
      "que-es-el-examen-teorico-de-aeromexico",
      "que-es-aon-aviation-suite",
    ],
    paginas: [
      { label: "Guía completa de la convocatoria", href: "/convocatoria-aeromexico" },
      { label: "Las 5 fuentes del temario", href: "/linea-aerea" },
    ],
    categoria: "Convocatoria de línea aérea",
  },

  {
    slug: "requisitos-convocatoria-aeromexico",
    pregunta: "¿Cuáles son los requisitos de la convocatoria de Aeroméxico?",
    keywords:
      "requisitos convocatoria aeromexico, requisitos primer oficial aeromexico connect, requisitos aspa embraer 190, horas de vuelo aeromexico",
    respuestaCorta:
      "La convocatoria ASPA · Aeroméxico Connect para Primer Oficial Embraer 190 pide: edad de 18 a 50 años con 11 meses, nacionalidad mexicana por nacimiento, 250 horas de vuelo certificadas en bitácora (mínimo 180 de vuelo real y hasta 70 de simulador), carta de presentación de ASPA y expediente completo en el archivo del sindicato.",
    secciones: [
      {
        h2: "El requisito que más gente subestima",
        parrafos: [
          "El expediente. Las horas se acumulan volando, pero la carta de ASPA y el archivo sindical actualizado son trámites con tiempos propios — y sin ellos no entras al proceso aunque cumplas todo lo demás.",
          "Si la convocatoria te interesa para el siguiente periodo, ordena el expediente ahora y estudia el temario en paralelo: son las dos líneas de tiempo que no se pueden comprimir al final.",
        ],
      },
      {
        h2: "Cumplir requisitos no es estar listo",
        parrafos: [
          "Los requisitos te dan el boleto de entrada; las cuatro evaluaciones deciden el resultado. La primera es un examen teórico sobre cinco fuentes (ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10) que exige semanas de preparación seria.",
          "La ventaja competitiva real es llegar con el temario ya dominado cuando la convocatoria abra — no empezar a estudiar cuando se publique.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Las 70 horas de simulador cuentan para las 250?",
        a: "La convocatoria acepta hasta 70 horas de simulador dentro de las 250 totales; el mínimo de vuelo real es 180. La evidencia es tu bitácora certificada.",
      },
      {
        q: "¿Dónde verifico los requisitos vigentes?",
        a: "En la convocatoria oficial publicada por ASPA de México. Los requisitos pueden ajustarse entre periodos; la versión oficial vigente siempre manda.",
      },
    ],
    relacionadas: [
      "que-es-la-convocatoria-aspa-aeromexico",
      "que-es-el-examen-teorico-de-aeromexico",
      "que-es-aon-aviation-suite",
    ],
    paginas: [
      { label: "La convocatoria explicada completa", href: "/convocatoria-aeromexico" },
      { label: "Prepara el temario de las 5 fuentes", href: "/linea-aerea" },
    ],
    categoria: "Convocatoria de línea aérea",
  },

  {
    slug: "que-es-el-examen-teorico-de-aeromexico",
    pregunta: "¿Cómo es el examen teórico de la convocatoria de Aeroméxico?",
    keywords:
      "examen teorico aeromexico connect, examen convocatoria aeromexico, que estudiar para el examen de aeromexico, temario examen primer oficial",
    respuestaCorta:
      "El examen teórico de la convocatoria ASPA · Aeroméxico Connect evalúa cinco fuentes publicadas: el ATP (sin los capítulos de Performance y Weight & Balance), el PHAK (sin el capítulo 1), la sección Introduction del Jeppesen General Airway Manual, el CPAM de legislación nacional y el Anexo 10 de la OACI, Volumen II.",
    secciones: [
      {
        h2: "¿Por qué este temario es distinto al del CIAAC?",
        parrafos: [
          "El CIAAC evalúa 12 materias del temario mexicano de licencia; el teórico de la convocatoria evalúa cinco fuentes documentales — tres de ellas en inglés (ATP, PHAK, Jeppesen) — con el nivel que una línea aérea espera de su primer oficial.",
          "Si vienes de preparar el CIAAC llevas buena base conceptual, pero el enfoque por fuente y el inglés técnico requieren preparación específica.",
        ],
      },
      {
        h2: "¿Cómo se prepara en la práctica?",
        parrafos: [
          "Por fuente, no de corrido: cada una tiene su lógica (el ATP es regulación y operaciones; el Jeppesen es simbología de cartas; el CPAM es ley mexicana). Practicar con preguntas por capítulo revela qué fuente te está costando.",
          "En FlightPath cada fuente tiene su guía y su práctica con preguntas propias explicadas en español, más simulacros cronometrados para validar el conjunto.",
        ],
      },
    ],
    dato: {
      valor: "5",
      etiqueta: "fuentes documentales, 3 de ellas en inglés",
      fuente: "Temario publicado de la convocatoria",
    },
    faqs: [
      {
        q: "¿El examen es en inglés o en español?",
        a: "Tres de las cinco fuentes del temario son documentos en inglés (ATP, PHAK y Jeppesen), así que el inglés técnico aeronáutico es parte implícita de la preparación. En FlightPath practicas su contenido con explicaciones en español para que el idioma no te frene el estudio.",
      },
      {
        q: "¿Cuántas preguntas de práctica hay disponibles?",
        a: "FlightPath tiene un banco propio de más de 2,800 preguntas desarrollado de forma independiente y mapeado al temario publicado, practicable por fuente o mezclado en simulacros.",
      },
    ],
    relacionadas: [
      "que-es-la-convocatoria-aspa-aeromexico",
      "requisitos-convocatoria-aeromexico",
      "que-es-aon-aviation-suite",
    ],
    paginas: [
      { label: "Las 5 fuentes explicadas una por una", href: "/linea-aerea" },
      { label: "Guía del ATP", href: "/linea-aerea/atp" },
      { label: "Guía del CPAM", href: "/linea-aerea/cpam" },
    ],
    categoria: "Convocatoria de línea aérea",
  },

  {
    slug: "que-es-aon-aviation-suite",
    pregunta: "¿Qué es AON Aviation Suite?",
    keywords:
      "que es aon aviation suite, aon aviation suite aeromexico, evaluacion aon pilotos, prueba psicometrica aon aviacion",
    respuestaCorta:
      "AON Aviation Suite es la batería psicométrica y de aptitudes que aplica Aeroméxico Connect en su proceso de selección de pilotos: mide atención dividida, memoria de trabajo, razonamiento y coordinación, e incluye una prueba de inglés. Es la segunda evaluación de la convocatoria, después del examen teórico.",
    secciones: [
      {
        h2: "¿Qué mide exactamente y por qué?",
        parrafos: [
          "Las aerolíneas usan baterías como AON para medir capacidades cognitivas difíciles de fingir: mantener varias tareas a la vez, retener información bajo presión, razonar rápido con datos nuevos. Son las aptitudes del día a día en cabina.",
          "A diferencia del teórico, aquí no hay temario que memorizar — pero sí hay familiaridad que entrenar: el formato cronometrado, el tipo de ejercicios y el manejo del estrés mejoran con exposición.",
        ],
      },
      {
        h2: "¿Se puede 'estudiar' para AON?",
        parrafos: [
          "Directamente, no: no hay banco de respuestas. Indirectamente, sí — práctica cronometrada regular (que entrena velocidad y tolerancia al reloj), buen descanso y llegar sin la presión del teórico encima.",
          "Por eso el orden de preparación importa: dominar el temario teórico con anticipación te deja llegar a AON descansado y con el proceso mental ya acostumbrado a evaluaciones con cronómetro.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿AON reprueba a mucha gente?",
        a: "Es un filtro real del proceso, como el simulador y el panel. No publicamos tasas porque no hay cifras oficiales públicas; lo controlable es llegar entrenado en formato cronometrado y descansado.",
      },
      {
        q: "¿El inglés de AON qué nivel exige?",
        a: "La prueba de inglés forma parte de la batería; como referencia del sector, el estándar OACI de inglés operacional es el nivel 4. Si tu inglés técnico está oxidado, trabájalo en paralelo al temario.",
      },
    ],
    relacionadas: [
      "como-prepararse-para-aon-aviation-suite",
      "que-es-el-ingles-oaci",
      "que-es-la-convocatoria-aspa-aeromexico",
    ],
    paginas: [
      { label: "El proceso completo de la convocatoria", href: "/convocatoria-aeromexico" },
      { label: "Simulacros cronometrados en FlightPath", href: "/simulador-ciaac" },
    ],
    categoria: "Convocatoria de línea aérea",
  },

  {
    slug: "como-prepararse-para-aon-aviation-suite",
    pregunta: "¿Cómo prepararse para la evaluación AON Aviation Suite?",
    keywords:
      "como prepararse para aon aviation suite, practicar aon aviation, tips evaluacion aon pilotos, aon aviation suite preparacion",
    respuestaCorta:
      "Para AON Aviation Suite se entrena la forma, no el contenido: práctica regular con ejercicios cronometrados (cálculo mental, memoria de trabajo, atención dividida), inglés técnico activo, y una logística impecable el día de la prueba — dormir bien, llegar sin prisa y sin el examen teórico pendiente en la cabeza.",
    secciones: [
      {
        h2: "Las tres palancas que sí controlas",
        parrafos: [
          "Familiaridad con el reloj: semanas de práctica cronometrada — la que sea: simulacros teóricos, ejercicios de cálculo mental, apps de memoria — bajan el costo cognitivo de trabajar contra tiempo.",
          "Inglés activo: lee y escucha material técnico aeronáutico a diario las semanas previas. Y energía: la batería castiga el cansancio más que la falta de talento; el descanso es parte del entrenamiento.",
        ],
      },
      {
        h2: "El error común: llegar con el teórico a cuestas",
        parrafos: [
          "Quien deja el temario para el final llega a AON con estrés acumulado y sueño perdido — exactamente lo que la batería penaliza. La preparación del teórico con semanas de anticipación es, indirectamente, preparación para AON.",
          "Planea hacia atrás desde la convocatoria: temario dominado primero, y la última semana libre de estudio pesado para llegar fresco a las evaluaciones.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Existen simuladores oficiales de AON?",
        a: "AON es una evaluación propietaria y no publica sus reactivos. Desconfía de quien venda 'las preguntas de AON'; lo entrenable es el tipo de habilidad y el formato cronometrado.",
      },
      {
        q: "¿Cuánto tiempo antes debo empezar a entrenar?",
        a: "Tres a cuatro semanas de práctica cronometrada regular es un buen estándar, empalmadas con el cierre de tu preparación teórica — nunca encimadas con maratones de estudio de última hora.",
      },
    ],
    relacionadas: [
      "que-es-aon-aviation-suite",
      "que-es-el-ingles-oaci",
      "que-es-el-examen-teorico-de-aeromexico",
    ],
    paginas: [
      { label: "La convocatoria y sus 4 evaluaciones", href: "/convocatoria-aeromexico" },
      { label: "Practica con reloj en FlightPath", href: "/simulador-ciaac" },
    ],
    categoria: "Convocatoria de línea aérea",
  },

  {
    slug: "que-es-el-ingles-oaci",
    pregunta: "¿Qué es el inglés OACI y qué nivel necesito?",
    keywords:
      "ingles oaci niveles, nivel 4 oaci, ingles aeronautico oaci, que es el ingles oaci pilotos, examen ingles oaci",
    respuestaCorta:
      "El inglés OACI es la escala con la que la aviación civil internacional certifica la competencia lingüística de pilotos y controladores: seis niveles, del 1 (pre-elemental) al 6 (experto). El nivel 4, 'operacional', es el mínimo estándar para operaciones internacionales y debe revalidarse periódicamente; los niveles 5 y 6 amplían esa vigencia.",
    secciones: [
      {
        h2: "¿Qué evalúa la escala OACI?",
        parrafos: [
          "Seis destrezas: pronunciación, estructura, vocabulario, fluidez, comprensión e interacción. La calificación global es la del área más débil — un perfil desbalanceado no compensa con sus fortalezas.",
          "No es un examen de inglés general: evalúa comunicación aeronáutica real, incluida la capacidad de resolver situaciones no rutinarias por radio.",
        ],
      },
      {
        h2: "¿Cómo se relaciona con el CIAAC y las convocatorias?",
        parrafos: [
          "Para línea aérea el inglés pesa doble: tres de las cinco fuentes del temario teórico de la convocatoria están en inglés (ATP, PHAK, Jeppesen) y la batería AON incluye prueba de inglés.",
          "Autoevalúate honesto: si leer un capítulo del PHAK te cuesta el doble que en español, tu preparación necesita una línea de inglés técnico en paralelo — no una semana antes del proceso.",
        ],
      },
    ],
    dato: {
      valor: "Nivel 4",
      etiqueta: "mínimo operacional del estándar OACI",
      fuente: "Escala de competencia lingüística OACI",
    },
    faqs: [
      {
        q: "¿Dónde se certifica el nivel OACI en México?",
        a: "En centros evaluadores autorizados por la autoridad aeronáutica; tu escuela o la AFAC pueden orientarte sobre los vigentes. La certificación y su revalidación son trámites oficiales.",
      },
      {
        q: "¿Cómo subo de nivel 3 a nivel 4?",
        a: "Con exposición diaria a inglés aeronáutico real: fraseología, audios de radio, lectura técnica (el PHAK es excelente material), y práctica hablada de situaciones no rutinarias. La constancia gana a los cursos intensivos de última hora.",
      },
    ],
    relacionadas: [
      "que-es-aon-aviation-suite",
      "que-es-el-examen-teorico-de-aeromexico",
      "como-prepararse-para-aon-aviation-suite",
    ],
    paginas: [
      { label: "Guía del PHAK (fuente en inglés)", href: "/linea-aerea/phak" },
      { label: "Guía del ATP (fuente en inglés)", href: "/linea-aerea/atp" },
    ],
    categoria: "Convocatoria de línea aérea",
  },

  /* ─── Inglés y RTARI (spokes de /examen-rtari) ─── */
  {
    slug: "que-es-el-examen-rtari",
    pregunta: "¿Qué es el examen RTARI?",
    keywords:
      "que es el examen rtari, rtari significado, radiotelefonista aeronautico restringido internacional, examen rtari afac",
    respuestaCorta:
      "El RTARI es el certificado de capacidad de Radiotelefonista Aeronáutico Restringido Internacional: acredita ante la autoridad aeronáutica mexicana tu competencia lingüística en inglés con la escala OACI. El mínimo para operar internacionalmente es el nivel 4 de 6, y la parte decisiva de la evaluación es una entrevista oral en inglés.",
    secciones: [
      {
        h2: "¿Para qué sirve el RTARI?",
        parrafos: [
          "Habilita las radiocomunicaciones aeronáuticas en inglés: sin él no hay operaciones donde el inglés es el idioma de la frecuencia — que en la práctica significa rutas internacionales y cualquier aerolínea con ambiciones fuera del espacio doméstico.",
          "Las aerolíneas lo dan por sentado en sus procesos de selección: llegar sin nivel 4 vigente descarta candidatos antes de la primera entrevista.",
        ],
      },
      {
        h2: "¿Cómo se evalúa?",
        parrafos: [
          "Con la escala de competencia lingüística de la OACI: seis áreas (pronunciación, estructura, vocabulario, fluidez, comprensión e interacción) calificadas por separado, y una regla que sorprende: tu nivel global es el más bajo de las seis, no el promedio.",
          "El trámite y los centros donde se presenta los define la autoridad — verifica los requisitos vigentes con la AFAC antes de agendar.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿El RTARI es una licencia?",
        a: "No: es un certificado de capacidad, complementario a tus licencias de piloto. Acredita una habilidad específica — comunicarte en inglés aeronáutico — y tiene su propia vigencia y renovación.",
      },
      {
        q: "¿Cómo se practica la entrevista del RTARI?",
        a: "Hablando: es una evaluación oral. En FlightPath la practicas con un sinodal de IA por voz que te entrevista en inglés, te repregunta y te entrega un debrief por las seis áreas OACI — las veces que quieras, sin agendar.",
      },
    ],
    relacionadas: ["que-nivel-de-ingles-necesito-para-ser-piloto", "que-es-el-ingles-oaci"],
    paginas: [
      { label: "Examen RTARI: guía completa y práctica", href: "/examen-rtari" },
    ],
    categoria: "Inglés y RTARI",
    publicado: "2026-08-09",
  },
  {
    slug: "que-nivel-de-ingles-necesito-para-ser-piloto",
    pregunta: "¿Qué nivel de inglés necesito para ser piloto?",
    keywords:
      "que nivel de ingles necesito para ser piloto, nivel 4 oaci, ingles para pilotos, nivel de ingles aerolinea",
    respuestaCorta:
      "El estándar es el nivel 4 OACI (operacional), en una escala de 1 a 6: comunicarte con eficacia en inglés aeronáutico, aunque con acento y errores ocasionales que no impidan entenderte. En México se acredita con el certificado RTARI, y las aerolíneas lo exigen como requisito de entrada en sus convocatorias.",
    secciones: [
      {
        h2: "La escala OACI en corto",
        parrafos: [
          "Del 1 (pre-elemental) al 6 (experto). El 4 es el mínimo operacional aceptado; el 5 (extendido) da vigencias más largas y el 6 no vence. La evaluación no es un examen de gramática escolar: mide si puedes escuchar, entender y responder en contexto aeronáutico, incluida una entrevista oral.",
        ],
      },
      {
        h2: "¿Inglés general o inglés aeronáutico?",
        parrafos: [
          "Los dos. La base es inglés general sólido; encima va el vocabulario y los patrones del inglés de cabina: fraseología, situaciones operacionales, describir problemas técnicos. El error típico es prepararlo leyendo: la evaluación es oral y se entrena hablando.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Con nivel 3 OACI puedo volar?",
        a: "El nivel 3 (pre-operacional) está por debajo del mínimo aceptado para operaciones internacionales en inglés. El objetivo realista de cualquier aspirante a aerolínea es el 4 — y si puedes certificar 5, mejor: renovaciones más espaciadas y mejor carta de presentación.",
      },
      {
        q: "¿Cómo subo de nivel si no tengo con quién practicar?",
        a: "Con práctica oral estructurada y frecuente: entrevistas simuladas, describir situaciones en voz alta, escuchar comunicaciones reales. El módulo RTARI de FlightPath te da un sinodal de voz disponible 24/7 con debrief por las seis áreas OACI, para dirigir el esfuerzo al área que te fija el nivel.",
      },
    ],
    relacionadas: ["que-es-el-examen-rtari", "que-es-el-ingles-oaci"],
    paginas: [{ label: "Practica la entrevista RTARI por voz", href: "/examen-rtari" }],
    categoria: "Inglés y RTARI",
    publicado: "2026-08-09",
  },
  {
    slug: "cada-cuanto-se-renueva-el-rtari",
    pregunta: "¿Cada cuánto se renueva el RTARI?",
    keywords:
      "cada cuanto se renueva el rtari, vigencia rtari, renovacion rtari nivel 4, cuanto dura el rtari",
    respuestaCorta:
      "La vigencia del RTARI depende del nivel OACI que certifiques: el esquema clásico renueva el nivel 4 periódicamente (tradicionalmente cada 3 años), da plazos más largos al nivel 5 y no vence con el nivel 6. La autoridad ha anunciado ajustes al esquema de certificación lingüística, así que confirma el plazo vigente con la AFAC antes de programar tu renovación.",
    secciones: [
      {
        h2: "Por qué renovar no debería asustarte",
        parrafos: [
          "La renovación evalúa lo mismo que la certificación inicial: tu inglés operacional real. Quien mantiene el idioma vivo — vuela en inglés, practica entrevistas, consume material técnico — llega a renovar sin drama. Quien lo congela tres años, vuelve a empezar.",
          "La estrategia barata: práctica oral corta pero constante entre renovaciones, en lugar de un curso de pánico cada vencimiento. Y si puedes subir a nivel 5, cada renovación se espacia.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué pasa si se me vence el RTARI?",
        a: "Sin certificado vigente no puedes ejercer las atribuciones que ampara — las comunicaciones internacionales en inglés. Los detalles del trámite de renovación y sus tiempos los publica la AFAC; no dejes el vencimiento para el mes del trámite.",
      },
    ],
    relacionadas: ["que-es-el-examen-rtari", "que-nivel-de-ingles-necesito-para-ser-piloto"],
    paginas: [{ label: "Examen RTARI: guía y práctica de entrevista", href: "/examen-rtari" }],
    categoria: "Inglés y RTARI",
    publicado: "2026-08-09",
  },

  /* ─── Selección y aptitudes (spokes de /examen-compass y /estudiar-737-max) ─── */
  {
    slug: "que-es-el-examen-compass-de-seleccion",
    pregunta: "¿Qué es el examen COMPASS de selección de pilotos?",
    keywords:
      "que es el examen compass, compass test pilotos, prueba compass seleccion, compass epst que evalua",
    respuestaCorta:
      "El COMPASS (Computerised Pilot Aptitude Screening System) es una batería computarizada de pruebas de aptitud desarrollada por la firma europea EPST, usada por escuelas de vuelo, programas de cadetes y aerolíneas para evaluar candidatos a piloto. Sus módulos típicos miden coordinación mano-ojo, memoria de corto plazo, cálculo mental, orientación espacial y capacidad de multitarea.",
    secciones: [
      {
        h2: "¿Dónde te lo vas a encontrar?",
        parrafos: [
          "Al inicio de procesos de selección: escuelas que filtran aspirantes antes de invertir horas de vuelo en ellos, programas de cadetes y aerolíneas que criban candidatos. Cada institución decide qué versión aplica, qué módulos pesa más y dónde pone el corte — el formato exacto lo define tu convocatoria.",
        ],
      },
      {
        h2: "¿Se puede preparar?",
        parrafos: [
          "La aptitud base es estable, pero el desempeño del día depende también de familiaridad: quien nunca ha hecho tracking compensatorio ni multitarea cronometrada pierde puntos por sorpresa, no por falta de capacidad. Esa parte sí se entrena — con ejercicios de las mismas familias de aptitud, práctica medida y descanso antes de la prueba.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿FlightPath ofrece el COMPASS?",
        a: "No: COMPASS es un producto de EPST, con quien FlightPath no tiene afiliación. Lo que FlightPath ofrece es un entrenador con seis ejercicios originales de esas mismas familias de aptitud — control biaxial, slalom, memoria, cálculo, orientación y multitarea — jugables con teclado, mouse o touch.",
      },
      {
        q: "¿Cuánto dura una prueba de aptitud tipo COMPASS?",
        a: "Depende de la versión y la institución; las baterías suelen tomar del orden de una a dos horas con todos sus módulos. El dato exacto viene en tu convocatoria. Para entrenar la resistencia, el simulacro compacto de FlightPath encadena los seis ejercicios en una sola sesión.",
      },
    ],
    relacionadas: ["como-practicar-para-el-examen-compass", "que-es-aon-aviation-suite"],
    paginas: [{ label: "Entrena las 6 aptitudes tipo COMPASS", href: "/examen-compass" }],
    categoria: "Selección y aptitudes",
    publicado: "2026-08-09",
  },
  {
    slug: "como-practicar-para-el-examen-compass",
    pregunta: "¿Cómo practicar para el examen COMPASS?",
    keywords:
      "como practicar para el examen compass, practicar compass test, ejercicios compass online, entrenar aptitudes piloto",
    respuestaCorta:
      "Practica las familias de aptitud que evalúa la prueba — tracking compensatorio de dos ejes, seguimiento tipo slalom, memoria de corto plazo, cálculo mental aeronáutico, orientación espacial y multitarea — con ejercicios cronometrados y puntuación comparable entre sesiones, y cierra con simulacros que encadenen todos los módulos. La regla de oro: el día de la prueba no debería ser tu primera vez haciendo ninguna de esas tareas.",
    secciones: [
      {
        h2: "Un plan de práctica que funciona",
        parrafos: [
          "Semana 1: prueba los seis tipos de ejercicio y encuentra tu módulo débil (el radar de aptitudes de FlightPath te lo dice con datos). Semanas siguientes: sesiones cortas y frecuentes — 15 a 20 minutos diarios rinden más que un maratón semanal — con el módulo débil primero. Última semana: simulacros completos y descanso real; las pruebas de aptitud miden vigilancia casi tanto como habilidad.",
        ],
      },
      {
        h2: "Qué medir para saber que mejoras",
        parrafos: [
          "Tu tendencia contra tu propia línea base, con reglas de puntuación fijas: si el sistema cambia la calificación entre versiones, tu 'mejora' puede ser inflación. En FlightPath la puntuación es determinista y versionada — la tendencia solo compara sesiones calificadas con las mismas reglas — y el debrief te dice qué métrica concreta te está costando puntos.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Necesito joystick para practicar?",
        a: "Para las pruebas reales depende del centro; para entrenar las aptitudes, no: los ejercicios de FlightPath están diseñados para teclado, mouse y touch — el hardware que sí tienes. Lo que entrenas es la aptitud (anticipación, coordinación, reparto de atención), que transfiere entre dispositivos.",
      },
      {
        q: "¿Cuánto tiempo antes debo empezar a practicar?",
        a: "Idealmente 3–4 semanas antes, con sesiones cortas y constantes. Practicar la noche anterior solo te quita sueño — y el descanso pesa en estas pruebas tanto como la práctica.",
      },
    ],
    relacionadas: ["que-es-el-examen-compass-de-seleccion", "como-prepararse-para-aon-aviation-suite"],
    paginas: [{ label: "Empieza a entrenar aptitudes gratis", href: "/examen-compass" }],
    categoria: "Selección y aptitudes",
    publicado: "2026-08-09",
  },
  {
    slug: "que-evalua-un-examen-psicometrico-para-pilotos",
    pregunta: "¿Qué evalúa un examen psicométrico para pilotos?",
    keywords:
      "examen psicometrico para pilotos, prueba psicometrica aviacion, test psicometrico aerolinea que evalua",
    respuestaCorta:
      "Los exámenes psicométricos de aviación evalúan dos planos: aptitudes cognitivas y psicomotoras — coordinación, memoria de trabajo, cálculo mental, orientación espacial, atención dividida y multitarea — y rasgos de personalidad y comportamiento relevantes para cabina, como manejo de estrés, toma de decisiones y trabajo en equipo. Cada institución arma su propia batería y define sus cortes.",
    secciones: [
      {
        h2: "La parte de aptitudes: entrenable en su familiaridad",
        parrafos: [
          "Tracking compensatorio, seguimiento de trayectorias, retención de parámetros, aritmética bajo presión, orientación con instrumentos y tareas simultáneas con alertas. El formato exacto varía (COMPASS de EPST y las suites de evaluación de aerolíneas son ejemplos conocidos), pero las familias de aptitud se repiten — y la familiaridad con ellas es la parte que depende de ti.",
        ],
      },
      {
        h2: "La parte de personalidad: sin trucos",
        parrafos: [
          "Los cuestionarios de personalidad buscan consistencia, no respuestas 'correctas': detectan perfiles inflados y contradicciones. El único consejo honesto es responder con verdad y descansado. Donde sí puedes trabajar es en la evidencia conductual: cómo cuentas tus decisiones difíciles en la entrevista.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Se puede reprobar un psicométrico?",
        a: "Cada institución define cortes y perfiles; más que 'reprobar', quedas dentro o fuera del perfil que busca esa convocatoria en ese momento. Lo que sí está en tus manos: llegar entrenado en las aptitudes, descansado, y sin que el formato te sorprenda.",
      },
    ],
    relacionadas: ["que-es-el-examen-compass-de-seleccion", "como-practicar-para-el-examen-compass"],
    paginas: [
      { label: "Entrenador de aptitudes de FlightPath", href: "/examen-compass" },
      { label: "Practica la entrevista en inglés", href: "/examen-rtari" },
    ],
    categoria: "Selección y aptitudes",
    publicado: "2026-08-09",
  },
  {
    slug: "que-estudiar-para-la-entrevista-tecnica-de-una-aerolinea",
    pregunta: "¿Qué estudiar para la entrevista técnica de una aerolínea?",
    keywords:
      "entrevista tecnica aerolinea que estudiar, preguntas entrevista tecnica piloto, entrevista tecnica 737 airbus",
    respuestaCorta:
      "Las entrevistas técnicas de aerolínea giran alrededor de tres bloques: limitaciones y memory items del equipo al que aplicas (o del que has volado), sistemas del avión explicados con claridad, y conocimiento aeronáutico general — rendimiento, meteorología, normativa. Se preparan con reactivos de práctica hasta que la recuperación sea inmediata: en la mesa no hay tiempo de 'déjame pensarlo'.",
    secciones: [
      {
        h2: "El método: preguntas, no relectura",
        parrafos: [
          "Releer el FCOM completo es el plan que se siente productivo y rinde poco. Lo que la entrevista exige es recuperación rápida: que el límite, el flujo o el sistema salgan al primer intento. Eso se construye respondiendo cientos de reactivos con explicación, capítulo por capítulo, y reabriendo justo donde fallas.",
          "Si tu convocatoria es de equipo Boeing, el banco del 737 MAX por capítulos del FCOM de FlightPath sigue exactamente esa lógica; para el conocimiento general, el banco CIAAC y las fuentes de línea aérea (ATP, PHAK, Jeppesen) cubren la base.",
        ],
      },
      {
        h2: "Lo que la técnica no cubre",
        parrafos: [
          "La misma convocatoria suele incluir inglés OACI, pruebas de aptitud y entrevista de competencias. Prepararlas por separado — y con la misma seriedad — es lo que distingue a los candidatos que avanzan de los que 'casi'.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué preguntan en una entrevista técnica de piloto?",
        a: "Típicamente: limitaciones del equipo (velocidades, pesos, altitudes), memory items, funcionamiento de sistemas (hidráulico, eléctrico, neumático, combustible), rendimiento y escenarios operacionales ('¿qué harías si…?'). El nivel de detalle depende de tu experiencia y del puesto.",
      },
      {
        q: "¿Cuánto tiempo antes debo empezar a estudiar el avión?",
        a: "Semanas, no días: la retención de cientos de números y flujos exige repaso espaciado. Un banco por capítulos te deja avanzar 20–30 reactivos diarios y llegar a la entrevista con el material fresco en lugar de recién leído.",
      },
    ],
    relacionadas: ["que-es-el-examen-compass-de-seleccion", "requisitos-convocatoria-aeromexico"],
    paginas: [
      { label: "Estudiar el 737 MAX por capítulos del FCOM", href: "/estudiar-737-max" },
      { label: "Fuentes del temario de línea aérea", href: "/linea-aerea" },
    ],
    categoria: "Selección y aptitudes",
    publicado: "2026-08-09",
  },
];

export function respuestaBySlug(slug: string): RespuestaSeo | undefined {
  return RESPUESTAS_SEO.find((r) => r.slug === slug);
}

export const RESPUESTAS_CATEGORIAS: RespuestaSeo["categoria"][] = [
  "Examen CIAAC",
  "Convocatoria de línea aérea",
  "Preparación",
  "Inglés y RTARI",
  "Selección y aptitudes",
];
