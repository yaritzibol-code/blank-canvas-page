/**
 * Contenido editorial de las páginas públicas /linea-aerea/$fuente (cluster
 * SEO de las 5 fuentes del temario de la convocatoria de línea aérea).
 *
 * Los desgloses de capítulos salen de `linea-aerea-meta` (los mismos que usa
 * el módulo Línea Aérea de la app). Las preguntas de muestra son originales,
 * escritas para estas guías — ver COMPLIANCE.md: se describe el temario
 * publicado (uso informativo), nunca se reproduce material de examen ajeno.
 */

import { ATP_CHAPTERS, JEPP_CHAPTERS, PHAK_CHAPTERS } from "@/lib/store/linea-aerea-meta";
import type { PreguntaMuestra } from "./materias-seo";

export interface FuenteSeo {
  slug: string;
  /** Nombre completo de la fuente. */
  nombre: string;
  /** Etiqueta corta (chips, breadcrumb). */
  corto: string;
  /** Icono del set de la landing (`IconName`). */
  icon: string;
  /** Subtítulo del héroe. */
  intro: string;
  /** Qué es la fuente (2–3 frases). */
  queEs: string;
  /** Qué parte entra en el examen teórico de la convocatoria. */
  enConvocatoria: string;
  /** Título de la lista de bloques ("Capítulos", "Qué contiene"…). */
  bloquesTitulo: string;
  bloques: { titulo: string; detalle?: string }[];
  /** Materias de FlightPath con las que se practica (enlazan a /ciaac/$slug). */
  materias: { name: string; slug: string }[];
  /** Cómo se practica en FlightPath. */
  comoPractica: string;
  muestra: PreguntaMuestra[];
  faqs: { q: string; a: string }[];
}

export const FUENTES_SEO: FuenteSeo[] = [
  {
    slug: "atp",
    nombre: "ATP — Airline Transport Pilot Test Prep",
    corto: "ATP",
    icon: "book",
    intro:
      "La fuente más extensa del temario: el banco de preparación de la licencia de transporte de línea aérea de la FAA. Regulaciones, operaciones, meteorología y aerodinámica de alto rendimiento.",
    queEs:
      "El ATP (Airline Transport Pilot) es el material de preparación del examen teórico de la licencia ATP de la FAA, organizado por capítulos temáticos. Es la referencia estándar en la industria para conocimientos de nivel de línea aérea y está escrito en inglés.",
    enConvocatoria:
      "Para el examen teórico de la convocatoria entra el ATP completo, excepto los capítulos de Performance y de Weight & Balance.",
    bloquesTitulo: "Capítulos que entran en la convocatoria",
    bloques: ATP_CHAPTERS.map((c) => ({
      titulo: `Cap. ${c.num} — ${c.titulo}`,
      detalle: c.tituloEn,
    })),
    materias: [
      { name: "Aerodinámica", slug: "aerodinamica" },
      { name: "Aeronaves y Motores", slug: "aeronaves-motores" },
      { name: "Meteorología", slug: "meteorologia" },
      { name: "Navegación Aérea", slug: "navegacion" },
      { name: "Operaciones Aeronáuticas", slug: "operaciones" },
    ],
    comoPractica:
      "En FlightPath practicas los temas del ATP por capítulo, con preguntas propias explicadas en español y la opción de mezclarlos en simulacros cronometrados. El análisis por tema te dice qué capítulo te está costando más.",
    muestra: [
      {
        q: "La regla de 'cabina estéril' (sterile cockpit) establece que:",
        opts: [
          "La cabina debe desinfectarse antes de cada vuelo",
          "Por debajo de 10,000 ft solo se permiten actividades y conversaciones esenciales para la operación",
          "No puede entrar ningún pasajero a la cabina en todo el vuelo",
          "Las comunicaciones con ATC se suspenden en ascenso",
        ],
        correct: 1,
        exp: "En las fases críticas (rodaje, despegue, aproximación y todo vuelo por debajo de 10,000 ft) la tripulación debe limitarse a tareas esenciales: nada de conversación ajena, comidas ni trámites. Nació de accidentes causados por distracción.",
      },
      {
        q: "La turbulencia de estela de una aeronave pesada es más intensa cuando ésta vuela:",
        opts: [
          "Rápida, con flaps extendidos y ligera",
          "Lenta, limpia (sin flaps) y pesada",
          "En descenso con motores en ralentí",
          "Con viento cruzado fuerte",
        ],
        correct: 1,
        exp: "Los vórtices de punta de ala son producto de la generación de sustentación: máxima intensidad con mucho peso, poca velocidad y configuración limpia (alto ángulo de ataque). De ahí las separaciones por estela en despegue y aterrizaje.",
      },
    ],
    faqs: [
      {
        q: "¿Qué es el ATP en la convocatoria de línea aérea?",
        a: "Es el material de preparación de la licencia Airline Transport Pilot de la FAA, y la fuente con más peso del temario del examen teórico. Se estudia completo, excepto los capítulos de Performance y Weight & Balance.",
      },
      {
        q: "¿El ATP está en inglés?",
        a: "Sí, el material original está en inglés. En FlightPath practicas sus temas con preguntas propias y explicaciones en español, para que el idioma no te frene mientras dominas el contenido.",
      },
      {
        q: "¿Cómo estudiar el ATP para el examen teórico?",
        a: "Por capítulos y con práctica intercalada: un bloque de estudio y de inmediato sus preguntas. Regulaciones y Operaciones son los capítulos más densos — empieza por ellos y deja registrado qué temas te fallan para repasarlos en simulacro.",
      },
    ],
  },

  {
    slug: "phak",
    nombre: "Pilot's Handbook of Aeronautical Knowledge (PHAK)",
    corto: "PHAK",
    icon: "library",
    intro:
      "El manual madre de conocimientos aeronáuticos de la FAA: aerodinámica, sistemas, instrumentos, meteorología, performance y factores aeromédicos, todo en un solo volumen.",
    queEs:
      "El PHAK (FAA-H-8083-25) es el manual oficial de conocimientos aeronáuticos de la FAA. Cubre desde los principios de vuelo hasta la toma de decisiones aeronáuticas, y es lectura base de prácticamente cualquier formación de piloto en el continente.",
    enConvocatoria:
      "Para el examen teórico de la convocatoria entra el PHAK completo, excepto el capítulo 1 (introducción al vuelo).",
    bloquesTitulo: "Capítulos que entran en la convocatoria",
    bloques: PHAK_CHAPTERS.map((c) => ({
      titulo: `Cap. ${c.num} — ${c.titulo}`,
      detalle: c.tituloEn,
    })),
    materias: [
      { name: "Aerodinámica", slug: "aerodinamica" },
      { name: "Meteorología", slug: "meteorologia" },
      { name: "Medicina de Aviación", slug: "medicina" },
      { name: "Factores Humanos", slug: "factores-humanos" },
    ],
    comoPractica:
      "En FlightPath el PHAK se practica capítulo por capítulo con preguntas propias explicadas en español. Los capítulos de aerodinámica, sistemas e instrumentos concentran la mayor parte de las fallas — el análisis por tema te lo muestra en datos.",
    muestra: [
      {
        q: "En vuelo recto, nivelado y a velocidad constante, las cuatro fuerzas del vuelo están:",
        opts: [
          "La sustentación supera al peso y el empuje a la resistencia",
          "En equilibrio: sustentación = peso y empuje = resistencia",
          "El empuje siempre supera a la resistencia",
          "La sustentación depende solo de la potencia aplicada",
        ],
        correct: 1,
        exp: "Vuelo no acelerado = fuerzas en equilibrio (suma de fuerzas cero). Para ascender, descender o acelerar se rompe deliberadamente ese equilibrio. Es el punto de partida de toda la aerodinámica del PHAK.",
      },
      {
        q: "Con el reglaje QNH ajustado en el altímetro, el instrumento indica:",
        opts: [
          "Altura sobre la pista",
          "Altitud sobre el nivel medio del mar",
          "Altitud de presión sobre la isobara estándar",
          "Altitud densimétrica",
        ],
        correct: 1,
        exp: "QNH es la presión reducida al nivel del mar del lugar: con él, en el aeródromo el altímetro marca la elevación del campo y en vuelo la altitud sobre el nivel medio del mar. Con 1013.25 hPa (estándar) se leen niveles de vuelo.",
      },
    ],
    faqs: [
      {
        q: "¿Qué es el PHAK y por qué está en el temario?",
        a: "Es el Pilot's Handbook of Aeronautical Knowledge de la FAA, el manual base de conocimientos aeronáuticos. La convocatoria lo usa como fuente troncal del examen teórico: entra completo, excepto el capítulo 1.",
      },
      {
        q: "¿El PHAK está en español?",
        a: "El manual oficial de la FAA está en inglés (y es de acceso público en el sitio de la FAA). En FlightPath practicas sus capítulos con preguntas y explicaciones en español, mapeadas a las materias del curso.",
      },
      {
        q: "¿Qué capítulos del PHAK son más importantes?",
        a: "Aerodinámica del vuelo (cap. 5), sistemas (cap. 7), instrumentos (cap. 8), performance (cap. 11) y los capítulos de meteorología (12–13) concentran la mayor densidad de preguntas en la práctica. Empieza por ahí si el tiempo aprieta.",
      },
    ],
  },

  {
    slug: "jeppesen",
    nombre: "Jeppesen General Airway Manual — Introduction",
    corto: "Jeppesen",
    icon: "compass",
    intro:
      "Cartas, simbología y procedimientos: la sección Introduction del manual de Jeppesen es el lenguaje visual con el que vuela una línea aérea. Aquí se aprende a leerlo.",
    queEs:
      "El General Airway Manual de Jeppesen es la referencia de cartas y procedimientos que usan las aerolíneas en buena parte del mundo. Su sección Introduction explica la simbología, las leyendas y el formato de las cartas Jeppesen: el diccionario para leer cualquier carta de la casa.",
    enConvocatoria:
      "Para el examen teórico de la convocatoria se evalúa la sección Introduction del manual: definiciones, leyendas de cartas, formatos, letreros y marcas de aeródromo.",
    bloquesTitulo: "Bloques de la sección Introduction",
    bloques: JEPP_CHAPTERS.map((c) => ({
      titulo: c.titulo,
      detalle: c.tituloEn,
    })),
    materias: [
      { name: "Manuales de Información Aeronáutica", slug: "manuales-ais" },
      { name: "Navegación Aérea", slug: "navegacion" },
    ],
    comoPractica:
      "En FlightPath la simbología se practica a punta de preguntas: leyenda por leyenda, con explicación en español de cada símbolo y formato. Es la fuente donde más rinde practicar poco y seguido.",
    muestra: [
      {
        q: "En una carta de aproximación, la MSA (Minimum Safe/Sector Altitude) proporciona:",
        opts: [
          "Separación garantizada del tránsito IFR",
          "Al menos 1,000 ft de franqueamiento de obstáculos, normalmente dentro de 25 NM del fix de referencia",
          "La altitud mínima para recibir el ILS",
          "La altitud de circuito del aeródromo",
        ],
        correct: 1,
        exp: "La MSA es una altitud de referencia y emergencia: garantiza franqueamiento de obstáculos (≥1,000 ft) dentro del radio publicado, pero no cobertura de radioayudas ni separación de tránsito. Su lectura exacta es pregunta clásica de simbología.",
      },
      {
        q: "En la simbología de cartas de aeródromo, una pista marcada con tachas o cruces (X) indica:",
        opts: [
          "Pista de uso exclusivo militar",
          "Pista cerrada o inutilizable",
          "Pista sin iluminación nocturna",
          "Pista en construcción con uso restringido",
        ],
        correct: 1,
        exp: "Las cruces sobre una pista significan pista cerrada: no debe usarse para despegar ni aterrizar. Es de los símbolos más directos de la leyenda — y aún así se pregunta constantemente.",
      },
    ],
    faqs: [
      {
        q: "¿Qué es el Jeppesen General Airway Manual?",
        a: "Es el manual de referencia de Jeppesen sobre cartas, procedimientos y navegación. Para la convocatoria se evalúa su sección Introduction, que enseña a leer la simbología y los formatos de las cartas Jeppesen.",
      },
      {
        q: "¿El Jeppesen General Airway Manual está en español?",
        a: "El manual original está en inglés. En FlightPath practicas la sección Introduction con preguntas propias y explicaciones en español, bloque por bloque (definiciones, leyendas, formatos, letreros y marcas).",
      },
      {
        q: "¿Cómo se estudia la simbología de Jeppesen?",
        a: "Con exposición repetida: sesiones cortas de preguntas de leyenda hasta que cada símbolo se reconozca en automático. Estudiarla de corrido rinde poco; practicarla 15 minutos diarios, muchísimo.",
      },
    ],
  },

  {
    slug: "cpam",
    nombre: "CPAM — Compendio de legislación nacional",
    corto: "CPAM",
    icon: "doc",
    intro:
      "La parte mexicana del temario: el compendio de legislación nacional aplicable a las tripulaciones de vuelo. Leyes, reglamentos y circulares que rigen tu trabajo como piloto en México.",
    queEs:
      "El CPAM es el compendio de legislación nacional relacionada con las tripulaciones de vuelo: reúne las disposiciones de la normatividad mexicana que aplican al personal técnico aeronáutico, desde la Ley de Aviación Civil hasta las circulares obligatorias.",
    enConvocatoria:
      "Para el examen teórico de la convocatoria entra el compendio completo, con énfasis en las disposiciones que aplican directamente a las tripulaciones de vuelo.",
    bloquesTitulo: "Qué normatividad reúne",
    bloques: [
      { titulo: "Ley de Aviación Civil y su reglamento" },
      { titulo: "Reglamento de la Ley de Aeropuertos" },
      { titulo: "Reglamento de Medicina de Aviación Civil" },
      { titulo: "Ley Federal del Trabajo", detalle: "Disposiciones aplicables a tripulaciones" },
      {
        titulo: "Ley y Reglamento Aduaneros",
        detalle: "Disposiciones aplicables a la operación aérea",
      },
      { titulo: "Circulares obligatorias", detalle: "CO AV y CO SA vigentes" },
    ],
    materias: [{ name: "Legislación Aeronáutica", slug: "legislacion" }],
    comoPractica:
      "En FlightPath el CPAM se practica por ordenamiento, con preguntas propias que citan la disposición de la que salen. La repetición espaciada hace el trabajo que las lecturas maratónicas no logran.",
    muestra: [
      {
        q: "¿Qué ordenamiento regula de manera general la aviación civil en México?",
        opts: [
          "La Ley de Vías Generales de Comunicación únicamente",
          "La Ley de Aviación Civil",
          "El Convenio de Chicago",
          "La Ley Federal del Trabajo",
        ],
        correct: 1,
        exp: "La Ley de Aviación Civil (y su reglamento) es el ordenamiento marco de la aviación civil mexicana: regula la operación, las concesiones, el personal técnico y las facultades de la autoridad. El Convenio de Chicago es el marco internacional, no la ley nacional.",
      },
      {
        q: "Las relaciones laborales de las tripulaciones aeronáuticas en México se rigen principalmente por:",
        opts: [
          "El Código de Comercio",
          "La Ley Federal del Trabajo, incluido su capítulo especial para tripulaciones",
          "El reglamento interior de cada aerolínea únicamente",
          "La Ley General de Sociedades Mercantiles",
        ],
        correct: 1,
        exp: "La Ley Federal del Trabajo contiene un capítulo de trabajos especiales para tripulaciones aeronáuticas (jornadas, tiempos de vuelo, descansos). Por eso forma parte del compendio: al examen le importa lo que aplica a tu vida como tripulante.",
      },
    ],
    faqs: [
      {
        q: "¿Qué es el CPAM?",
        a: "El Compendio de legislación nacional relacionada a tripulaciones de vuelo: la recopilación de leyes, reglamentos y circulares mexicanas que aplican al personal técnico aeronáutico. Es la fuente 'mexicana' del temario de la convocatoria.",
      },
      {
        q: "¿Qué leyes incluye el CPAM?",
        a: "Entre otras: la Ley de Aviación Civil y su reglamento, el Reglamento de la Ley de Aeropuertos, el Reglamento de Medicina de Aviación Civil, disposiciones aplicables de la Ley Federal del Trabajo y de la legislación aduanera, y circulares obligatorias vigentes.",
      },
      {
        q: "¿Cómo se estudia el CPAM para el examen teórico?",
        a: "Por ordenamiento y con repetición espaciada: sesiones cortas de preguntas de una sola ley a la vez. Memorizar artículos de corrido no escala; responder preguntas que citan la disposición correcta, sí.",
      },
    ],
  },

  {
    slug: "oaci-anexo-10",
    nombre: "OACI Anexo 10, Volumen II — Telecomunicaciones",
    corto: "OACI A10",
    icon: "radio",
    intro:
      "Los procedimientos de comunicación de la aviación civil internacional: fraseología, prioridades, socorro y urgencia. Corto, preciso y de los que más puntos regalan si se estudia bien.",
    queEs:
      "El Anexo 10 al Convenio de Chicago norma las telecomunicaciones aeronáuticas de la OACI. Su Volumen II contiene los procedimientos de comunicación: uso de frecuencias, fraseología, categorías de mensajes, y los procedimientos de socorro y urgencia.",
    enConvocatoria:
      "Para el examen teórico de la convocatoria entra el Volumen II: procedimientos de comunicación, incluidos los de socorro, urgencia y las prioridades de mensajes.",
    bloquesTitulo: "Qué cubre el Volumen II",
    bloques: [
      { titulo: "Procedimientos generales de radiotelefonía" },
      { titulo: "Categorías y prioridad de los mensajes" },
      { titulo: "Fraseología y transmisión de números y letras" },
      { titulo: "Procedimientos de socorro (MAYDAY) y urgencia (PAN PAN)" },
      { titulo: "Fallas de comunicaciones y procedimientos asociados" },
    ],
    materias: [{ name: "Comunicaciones Aeronáuticas", slug: "comunicaciones" }],
    comoPractica:
      "En FlightPath el Anexo 10 se practica con preguntas propias de procedimiento y fraseología, explicadas en español. Es una fuente corta: dominarla completa es de las mejores inversiones de tiempo del temario.",
    muestra: [
      {
        q: "En las comunicaciones aeronáuticas, ¿qué categoría de mensaje tiene la máxima prioridad?",
        opts: [
          "Los mensajes meteorológicos",
          "Los mensajes de socorro (MAYDAY)",
          "Los mensajes de la administración",
          "Los reportes de posición rutinarios",
        ],
        correct: 1,
        exp: "El orden de prioridad inicia con socorro (MAYDAY), sigue urgencia (PAN PAN) y de ahí descienden las demás categorías (radiogoniometría, seguridad de vuelo, meteorológicos…). Un MAYDAY impone silencio al resto de las estaciones.",
      },
      {
        q: "En la escala de legibilidad de las radiocomunicaciones, 'legibilidad 5' significa:",
        opts: [
          "Ilegible",
          "Legible de vez en cuando",
          "Legible con dificultad",
          "Perfectamente legible",
        ],
        correct: 3,
        exp: "La escala va de 1 (ilegible) a 5 (perfectamente legible); 3 es 'legible con dificultad'. Se usa al responder una prueba de radio ('radio check'): estación, señal y legibilidad.",
      },
    ],
    faqs: [
      {
        q: "¿Qué es el Anexo 10 de la OACI?",
        a: "Es el anexo del Convenio de Chicago que norma las telecomunicaciones aeronáuticas. Se divide en volúmenes; el Volumen II — el que entra en la convocatoria — contiene los procedimientos de comunicación de voz: fraseología, prioridades, socorro y urgencia.",
      },
      {
        q: "¿Qué cae en el examen sobre el Anexo 10?",
        a: "Procedimientos: qué se colaciona, cómo se transmiten números y letras (alfabeto OACI), las categorías y prioridades de mensajes, y los procedimientos de socorro (MAYDAY) y urgencia (PAN PAN). Son reglas concretas y estables — puntos casi seguros.",
      },
      {
        q: "¿Cómo se estudia el Anexo 10, Volumen II?",
        a: "Leyendo las transmisiones en voz alta y practicando preguntas de procedimiento. La fraseología entra por el oído: simula la colación completa de cada autorización mientras estudias.",
      },
    ],
  },
];

export function fuenteSeoBySlug(slug: string): FuenteSeo | undefined {
  return FUENTES_SEO.find((f) => f.slug === slug);
}
