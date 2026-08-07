/**
 * Banco de práctica RTARI — sección de preguntas personales.
 *
 * Son las 45 preguntas de conversación con las que se practica la entrevista
 * personal en inglés: banco propio de FlightPath, redactado de forma
 * independiente sobre los temas habituales de este tipo de entrevista. No es
 * el cuestionario de ninguna autoridad ni de ninguna empresa, y FlightPath no
 * está afiliado a la AFAC (ver `COMPLIANCE.md`).
 *
 * Cada reactivo trae:
 *  - `en`: la pregunta tal como la hace el sinodal (la entrevista es en inglés);
 *  - `es`: traducción, para que el alumno entienda qué le están pidiendo;
 *  - `tips`: qué debe contener una buena respuesta;
 *  - `bloque`: para armar entrevistas temáticas;
 *  - `grupo`: variantes de la misma pregunta (ver `pickQuestions`).
 */

export type RtariBloque =
  "trayectoria" | "experiencia" | "operacion" | "tecnico" | "formacion" | "futuro";

export interface RtariBloqueDef {
  id: RtariBloque;
  nombre: string;
  descripcion: string;
  icon: string;
}

export const RTARI_BLOQUES: RtariBloqueDef[] = [
  {
    id: "trayectoria",
    nombre: "Trayectoria y motivación",
    descripcion: "Por qué eres piloto, cuánto llevas y de dónde vienes.",
    icon: "compass",
  },
  {
    id: "experiencia",
    nombre: "Experiencia de vuelo",
    descripcion: "Equipos volados, primer vuelo, el peor vuelo, tu favorito.",
    icon: "plane",
  },
  {
    id: "operacion",
    nombre: "Operación y seguridad",
    descripcion: "Preparación del vuelo, responsabilidades, meteorología, peso y balance.",
    icon: "shield",
  },
  {
    id: "tecnico",
    nombre: "Situaciones y conocimiento",
    descripcion: "Fuego de San Telmo, incursión en pista, problemas con ATC.",
    icon: "tower",
  },
  {
    id: "formacion",
    nombre: "Formación e instrucción",
    descripcion: "Dónde aprendiste, tus instructores, tus exámenes, tu inglés.",
    icon: "graduation",
  },
  {
    id: "futuro",
    nombre: "Vida personal y futuro",
    descripcion: "Qué te gusta del oficio, tus metas y qué harás después.",
    icon: "target",
  },
];

export interface RtariQuestion {
  id: string;
  /** Número dentro del banco (1-45). */
  n: number;
  /** La pregunta, en inglés. */
  en: string;
  /** Traducción de apoyo. */
  es: string;
  bloque: RtariBloque;
  /**
   * Variantes de la misma pregunta. Una entrevista nunca hace dos preguntas
   * del mismo grupo: "Why did you become a pilot?" y "How did you decide to
   * become a pilot?" son la misma respuesta con otras palabras.
   */
  grupo: string;
  /** Qué debe contener una buena respuesta. */
  tips: string[];
}

export const RTARI_QUESTIONS: RtariQuestion[] = [
  {
    id: "rtari-01",
    n: 1,
    en: "Tell me the reasons that you had to become a pilot.",
    es: "Cuéntame las razones que tuviste para volverte piloto.",
    bloque: "trayectoria",
    grupo: "motivo",
    tips: [
      "Mention motivation and responsibility",
      "Avoid childish reasons",
      "Focus on discipline and safety",
    ],
  },
  {
    id: "rtari-02",
    n: 2,
    en: "How long have you been a pilot?",
    es: "¿Cuánto tiempo llevas siendo piloto?",
    bloque: "trayectoria",
    grupo: "antiguedad",
    tips: ["Use present perfect", "Approximate time is acceptable"],
  },
  {
    id: "rtari-03",
    n: 3,
    en: "Did you do a different job before becoming a pilot?",
    es: "¿Tuviste otro trabajo antes de ser piloto?",
    bloque: "trayectoria",
    grupo: "trabajo-previo",
    tips: ["Use simple past", "If not, state it clearly"],
  },
  {
    id: "rtari-04",
    n: 4,
    en: "What does a person have to do to become a pilot?",
    es: "¿Qué tiene que hacer una persona para convertirse en piloto?",
    bloque: "trayectoria",
    grupo: "requisitos",
    tips: ["Mention training, licenses, and medical certificate", "Keep it general"],
  },
  {
    id: "rtari-05",
    n: 5,
    en: "What aircraft have you flown?",
    es: "¿Qué aeronaves has volado?",
    bloque: "experiencia",
    grupo: "equipos",
    tips: ["List aircraft types only", "Avoid technical explanations"],
  },
  {
    id: "rtari-06",
    n: 6,
    en: "Tell me about your favorite aircraft.",
    es: "Háblame de tu aeronave favorita.",
    bloque: "experiencia",
    grupo: "favorita",
    tips: ["Explain why you like it", "Focus on handling or safety"],
  },
  {
    id: "rtari-07",
    n: 7,
    en: "How would you describe your career as a pilot?",
    es: "¿Cómo describirías tu carrera como piloto?",
    bloque: "trayectoria",
    grupo: "carrera",
    tips: ["Use professional adjectives", "Be realistic"],
  },
  {
    id: "rtari-08",
    n: 8,
    en: "What can you tell me about your responsibilities as a pilot?",
    es: "¿Qué me puedes decir de tus responsabilidades como piloto?",
    bloque: "operacion",
    grupo: "responsabilidades",
    tips: ["Safety first", "Mention crew, passengers, and procedures"],
  },
  {
    id: "rtari-09",
    n: 9,
    en: "Where and when did you learn to fly?",
    es: "¿Dónde y cuándo aprendiste a volar?",
    bloque: "formacion",
    grupo: "camino",
    tips: ["Mention place and approximate time"],
  },
  {
    id: "rtari-10",
    n: 10,
    en: "How do you prepare for a flight?",
    es: "¿Cómo te preparas para un vuelo?",
    bloque: "operacion",
    grupo: "preparacion",
    tips: ["Weather review", "Preflight inspection", "Flight planning"],
  },
  {
    id: "rtari-11",
    n: 11,
    en: "Why do you have to be cautious when you fly in bad weather?",
    es: "¿Por qué hay que ser cauteloso al volar con mal tiempo?",
    bloque: "operacion",
    grupo: "cautela-meteo",
    tips: ["Mention risks and safety", "Avoid technical weather theory"],
  },
  {
    id: "rtari-12",
    n: 12,
    en: "How does your current airplane compare to the one you used to fly before?",
    es: "¿Cómo se compara tu avión actual con el que volabas antes?",
    bloque: "experiencia",
    grupo: "comparacion",
    tips: ["Use simple comparisons", "Mention complexity or technology"],
  },
  {
    id: "rtari-13",
    n: 13,
    en: "Describe your first flight.",
    es: "Describe tu primer vuelo.",
    bloque: "experiencia",
    grupo: "primer-vuelo",
    tips: ["Use past tense", "Focus on learning experience"],
  },
  {
    id: "rtari-14",
    n: 14,
    en: "Tell me about the worst flight you have had.",
    es: "Háblame del peor vuelo que has tenido.",
    bloque: "experiencia",
    grupo: "peor-vuelo",
    tips: ["Explain how you handled it", "Emphasize safety outcome"],
  },
  {
    id: "rtari-15",
    n: 15,
    en: "Describe your first solo flight.",
    es: "Describe tu primer vuelo solo.",
    bloque: "experiencia",
    grupo: "solo",
    tips: ["Mention responsibility and confidence"],
  },
  {
    id: "rtari-16",
    n: 16,
    en: "Describe the best flight instructor you have had.",
    es: "Describe al mejor instructor de vuelo que has tenido.",
    bloque: "formacion",
    grupo: "instructor",
    tips: ["Focus on professionalism and teaching style"],
  },
  {
    id: "rtari-17",
    n: 17,
    en: "What do you do before a flight to check your aircraft is in good flying condition?",
    es: "¿Qué haces antes de un vuelo para revisar que la aeronave está en condiciones?",
    bloque: "operacion",
    grupo: "prevuelo",
    tips: ["Mention preflight inspection and checklist"],
  },
  {
    id: "rtari-18",
    n: 18,
    en: "Is one flight ever the same as another flight? Why?",
    es: "¿Un vuelo es alguna vez igual a otro? ¿Por qué?",
    bloque: "operacion",
    grupo: "vuelos-distintos",
    tips: ["Answer no", "Mention weather and operational differences"],
  },
  {
    id: "rtari-19",
    n: 19,
    en: "What would you like to be doing in five years' time?",
    es: "¿Qué te gustaría estar haciendo en cinco años?",
    bloque: "futuro",
    grupo: "futuro",
    tips: ["Professional growth", "Realistic goals"],
  },
  {
    id: "rtari-20",
    n: 20,
    en: "Where and when did you learn to speak English?",
    es: "¿Dónde y cuándo aprendiste a hablar inglés?",
    bloque: "formacion",
    grupo: "ingles",
    tips: ["Simple answer", "Aviation-related learning is a plus"],
  },
  {
    id: "rtari-21",
    n: 21,
    en: "Describe the selection process when you got your current job.",
    es: "Describe el proceso de selección cuando obtuviste tu trabajo actual.",
    bloque: "formacion",
    grupo: "seleccion",
    tips: ["Adapt answer if still in training", "Keep it general"],
  },
  {
    id: "rtari-22",
    n: 22,
    en: "What are you going to do after this interview?",
    es: "¿Qué vas a hacer después de esta entrevista?",
    bloque: "futuro",
    grupo: "post-entrevista",
    tips: ["Use simple future", "Calm, professional answer"],
  },
  {
    id: "rtari-23",
    n: 23,
    en: "What is different between flying at night and flying in daylight?",
    es: "¿Qué diferencia hay entre volar de noche y volar de día?",
    bloque: "operacion",
    grupo: "noche",
    tips: ["Visibility differences", "Workload and instruments"],
  },
  {
    id: "rtari-24",
    n: 24,
    en: "What do you do for fun?",
    es: "¿Qué haces para divertirte?",
    bloque: "futuro",
    grupo: "diversion",
    tips: ["Mention normal, low-risk activities"],
  },
  {
    id: "rtari-25",
    n: 25,
    en: "Explain in your own words what Saint Elmo's fire is.",
    es: "Explica con tus palabras qué es el fuego de San Telmo.",
    bloque: "tecnico",
    grupo: "san-telmo",
    tips: ["Simple explanation", "Avoid technical detail"],
  },
  {
    id: "rtari-26",
    n: 26,
    en: "Tell me about a common problem at airports you have flown to.",
    es: "Háblame de un problema común en los aeropuertos a los que has volado.",
    bloque: "tecnico",
    grupo: "aeropuertos",
    tips: ["Traffic, delays, or weather", "No complaining"],
  },
  {
    id: "rtari-27",
    n: 27,
    en: "Tell me about a problem pilots may have in communications with ATC.",
    es: "Háblame de un problema que los pilotos pueden tener al comunicarse con ATC.",
    bloque: "tecnico",
    grupo: "atc",
    tips: ["Language or congestion", "Stress readback and clarification"],
  },
  {
    id: "rtari-28",
    n: 28,
    en: "What is runway incursion?",
    es: "¿Qué es una incursión en pista?",
    bloque: "tecnico",
    grupo: "incursion",
    tips: ["Short definition", "Safety focus"],
  },
  {
    id: "rtari-29",
    n: 29,
    en: "Tell me about a problem in aviation related to bad weather.",
    es: "Háblame de un problema en la aviación relacionado con el mal tiempo.",
    bloque: "tecnico",
    grupo: "meteo-problema",
    tips: ["Delays, diversions, safety impact"],
  },
  {
    id: "rtari-30",
    n: 30,
    en: "What do you like the most about being a pilot?",
    es: "¿Qué es lo que más te gusta de ser piloto?",
    bloque: "futuro",
    grupo: "gusto",
    tips: ["Responsibility and professionalism"],
  },
  {
    id: "rtari-31",
    n: 31,
    en: "Tell me about the most difficult test you had in flight school.",
    es: "Háblame del examen más difícil que tuviste en la escuela de vuelo.",
    bloque: "formacion",
    grupo: "examen-dificil",
    tips: ["Learning experience", "Improvement"],
  },
  {
    id: "rtari-32",
    n: 32,
    en: "Tell me about the longest flight you have ever done as a passenger.",
    es: "Háblame del vuelo más largo que has hecho como pasajero.",
    bloque: "experiencia",
    grupo: "vuelo-largo",
    tips: ["Duration and destination"],
  },
  {
    id: "rtari-33",
    n: 33,
    en: "Why is it important to know the weight of passengers and cargo?",
    es: "¿Por qué es importante conocer el peso de pasajeros y carga?",
    bloque: "operacion",
    grupo: "peso-balance",
    tips: ["Weight and balance", "Performance"],
  },
  {
    id: "rtari-34",
    n: 34,
    en: "What is a go-around?",
    es: "¿Qué es un motor y al aire (go-around)?",
    bloque: "operacion",
    grupo: "go-around",
    tips: ["Normal safety procedure"],
  },
  {
    id: "rtari-35",
    n: 35,
    en: "Tell me all you can about your latest flight.",
    es: "Cuéntame todo lo que puedas sobre tu vuelo más reciente.",
    bloque: "experiencia",
    grupo: "ultimo-vuelo",
    tips: ["Route, conditions, normal operation"],
  },
  {
    id: "rtari-36",
    n: 36,
    en: "How did you become a pilot?",
    es: "¿Cómo te convertiste en piloto?",
    bloque: "formacion",
    grupo: "camino",
    tips: ["Briefly explain your training path", "Mention discipline and commitment"],
  },
  {
    id: "rtari-37",
    n: 37,
    en: "When did you become a pilot?",
    es: "¿Cuándo te convertiste en piloto?",
    bloque: "trayectoria",
    grupo: "antiguedad",
    tips: ["Use past tense", "Approximate dates are acceptable"],
  },
  {
    id: "rtari-38",
    n: 38,
    en: "What would you suggest to someone who wants to become a pilot?",
    es: "¿Qué le sugerirías a alguien que quiere ser piloto?",
    bloque: "formacion",
    grupo: "consejo",
    tips: ["Emphasize discipline, study, and safety", "Keep it realistic"],
  },
  {
    id: "rtari-39",
    n: 39,
    en: "Tell me about an anecdote you experienced during a flight.",
    es: "Cuéntame una anécdota que hayas vivido durante un vuelo.",
    bloque: "futuro",
    grupo: "anecdota",
    tips: ["Use a simple story structure", "Focus on actions and outcome"],
  },
  {
    id: "rtari-40",
    n: 40,
    en: "How did you decide to become a pilot?",
    es: "¿Cómo decidiste ser piloto?",
    bloque: "trayectoria",
    grupo: "motivo",
    tips: ["Mention motivation and responsibility", "Avoid emotional exaggeration"],
  },
  {
    id: "rtari-41",
    n: 41,
    en: "Describe your first flight as a pilot.",
    es: "Describe tu primer vuelo como piloto.",
    bloque: "experiencia",
    grupo: "primer-vuelo",
    tips: ["Use past tense", "Focus on learning and procedures"],
  },
  {
    id: "rtari-42",
    n: 42,
    en: "As a pilot, where do you see yourself in five years?",
    es: "Como piloto, ¿dónde te ves en cinco años?",
    bloque: "futuro",
    grupo: "futuro",
    tips: ["Professional growth", "Avoid unrealistic goals"],
  },
  {
    id: "rtari-43",
    n: 43,
    en: "What do you like most about being a pilot?",
    es: "¿Qué es lo que más te gusta de ser piloto?",
    bloque: "futuro",
    grupo: "gusto",
    tips: ["Mention responsibility and professionalism", "Avoid lifestyle perks"],
  },
  {
    id: "rtari-44",
    n: 44,
    en: "Why did you become a pilot?",
    es: "¿Por qué te volviste piloto?",
    bloque: "trayectoria",
    grupo: "motivo",
    tips: ["Connect passion with safety and discipline"],
  },
  {
    id: "rtari-45",
    n: 45,
    en: "What are your dreams or goals as a pilot?",
    es: "¿Cuáles son tus sueños o metas como piloto?",
    bloque: "futuro",
    grupo: "metas",
    tips: ["Long-term development", "Continuous learning and experience"],
  },
];

export const RTARI_TOTAL = RTARI_QUESTIONS.length;

const BY_ID = new Map(RTARI_QUESTIONS.map((q) => [q.id, q]));

export function getRtariQuestion(id: string): RtariQuestion | undefined {
  return BY_ID.get(id);
}

/** Sólo los ids que existen en el banco, sin repetir y en el orden recibido. */
export function sanitizeQuestionIds(ids: unknown, max: number): RtariQuestion[] {
  if (!Array.isArray(ids)) return [];
  const out: RtariQuestion[] = [];
  const seen = new Set<string>();
  for (const raw of ids) {
    if (typeof raw !== "string" || seen.has(raw)) continue;
    const q = BY_ID.get(raw);
    if (!q) continue;
    seen.add(raw);
    out.push(q);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Arma el guion de una entrevista.
 *
 * Baraja el banco (o el bloque elegido) y toma `count` preguntas sin repetir
 * grupo, para que el sinodal no pregunte dos veces lo mismo con otras
 * palabras. Al final ordena por bloque: la entrevista real empieza por la
 * trayectoria y termina en los planes a futuro.
 */
export function pickQuestions(count: number, bloque?: RtariBloque | "todos"): RtariQuestion[] {
  const pool =
    !bloque || bloque === "todos"
      ? [...RTARI_QUESTIONS]
      : RTARI_QUESTIONS.filter((q) => q.bloque === bloque);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }

  const elegidas: RtariQuestion[] = [];
  const grupos = new Set<string>();
  for (const q of pool) {
    if (grupos.has(q.grupo)) continue;
    grupos.add(q.grupo);
    elegidas.push(q);
    if (elegidas.length >= count) break;
  }
  // Si el bloque es pequeño y no alcanzan los grupos, se completa con el resto.
  if (elegidas.length < count) {
    for (const q of pool) {
      if (elegidas.includes(q)) continue;
      elegidas.push(q);
      if (elegidas.length >= count) break;
    }
  }

  const orden = RTARI_BLOQUES.map((b) => b.id);
  return elegidas.sort((a, b) => orden.indexOf(a.bloque) - orden.indexOf(b.bloque));
}
