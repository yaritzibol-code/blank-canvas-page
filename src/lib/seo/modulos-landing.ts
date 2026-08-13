/**
 * Contenido de las landings de producto /modulos/$slug.
 *
 * Son páginas de PRODUCTO ("cómo se ve y qué incluye el módulo"), no de
 * examen: la búsqueda de examen la capturan /ciaac, /examen-rtari,
 * /examen-compass, /linea-aerea y /estudiar-737-max — cada módulo enlaza a su
 * guía hermana en `guiaHref`. Reglas de COMPLIANCE.md: cifras propias
 * verificables, menciones nominativas con aviso donde aplique y ninguna
 * promesa de resultado.
 *
 * Las cifras y catálogos (materias, capítulos FCOM, ejercicios) se derivan de
 * las constantes del producto para que la landing nunca se desvíe de la app.
 */
import { MATERIAS_DEF } from "@/lib/store/materias";
import { B737MAX_CHAPTERS, B737MAX_TOTAL } from "@/lib/store/linea-aerea-meta";
import { COMPASS_MODULES } from "@/modules/compass/config";

const FMT_737 = B737MAX_TOTAL.toLocaleString("es-MX");

export interface DetalleItem {
  /** Nombre de la pieza (materia, capítulo, ejercicio, fuente…). */
  t: string;
  /** Descripción corta (opcional). */
  d?: string;
  /** Etiqueta mono a la derecha ("30 EN SIM", "CAP. 01"…). */
  k?: string;
}

export interface ModuloLanding {
  slug: string;
  /** Etiqueta corta (pill del hero y de las cards del home). */
  pill: string;
  /** Nombre del módulo como aparece en la app. */
  nombre: string;
  /** Título del hero (la parte coral va en `tituloCoral`). */
  titulo: string;
  tituloCoral: string;
  descripcion: string;
  keywords: string;
  /** Cifras del módulo para la banda del hero (con count-up si `n` es numérico). */
  stats: { n: string; label: string }[];
  /** Cómo se usa el módulo, en 3 pasos. */
  pasos: { t: string; d: string }[];
  /** Features del módulo (icono del set de la landing). */
  features: { icon: string; t: string; d: string }[];
  /** Sección "qué contiene": el catálogo del módulo pieza por pieza. */
  detalle: {
    eyebrow: string;
    titulo: string;
    tituloCoral: string;
    sub: string;
    items: DetalleItem[];
    /** Nota mono al pie del grid (opcional). */
    nota?: string;
  };
  /** Qué incluye, en chips. */
  incluye: string[];
  faqs: { q: string; a: string }[];
  /** Guía SEO hermana (intent de examen). */
  guiaHref: string;
  guiaLabel: string;
  /** Aviso de compliance específico (además del pie global). */
  aviso?: string;
}

export const MODULOS_LANDING: ModuloLanding[] = [
  {
    slug: "ciaac",
    pill: "Banco + Simulador",
    nombre: "Preparación CIAAC",
    titulo: "El CIAAC se gana",
    tituloCoral: "practicando, no releyendo.",
    descripcion:
      "Banco de más de 2,800 preguntas con explicación y fuente, simulador de 310 preguntas en formato real y análisis por materia: sabes exactamente qué estudiar cada día y si ya estás listo.",
    keywords:
      "modulo ciaac flightpath, banco de preguntas ciaac como funciona, simulador ciaac plataforma, practicar ciaac online",
    stats: [
      { n: "2,800+", label: "reactivos con explicación y fuente" },
      { n: "310", label: "preguntas por simulacro, como el real" },
      { n: "12", label: "materias del temario completas" },
    ],
    pasos: [
      {
        t: "Diagnostica tu línea base",
        d: "Responde un bloque por materia y descubre tu porcentaje real — la materia débil deja de ser una sensación.",
      },
      {
        t: "Practica con explicación",
        d: "Cada reactivo te dice por qué la correcta es correcta. El error de hoy es el acierto del examen.",
      },
      {
        t: "Valida en el simulador",
        d: "310 preguntas, 5 horas y reparto real por materia. Sales con un veredicto, no con una corazonada.",
      },
    ],
    features: [
      {
        icon: "cards",
        t: "Banco con explicación por reactivo",
        d: "Cada pregunta te dice por qué la correcta es correcta y por qué las otras no — el error se convierte en material de estudio.",
      },
      {
        icon: "sim",
        t: "Simulador en formato real",
        d: "310 preguntas, 5 horas y el reparto por materia del examen. Entrenas el reloj y la resistencia, no solo el temario.",
      },
      {
        icon: "chart",
        t: "Análisis por materia y tema",
        d: "Tu porcentaje real contra el estándar de referencia de 80%: la materia débil deja de ser una sensación y se vuelve un número.",
      },
      {
        icon: "spark",
        t: "Yaris, tu tutora IA",
        d: "Conoce la pregunta que tienes enfrente: explica, da nemotecnias y no te da la razón por complacerte.",
      },
    ],
    detalle: {
      eyebrow: "El temario",
      titulo: "Las 12 materias,",
      tituloCoral: "con el reparto real del simulador.",
      sub: "El simulador reparte sus 310 preguntas igual que el examen: estas son las materias y cuántas preguntas aporta cada una.",
      items: MATERIAS_DEF.map((m) => ({ t: m.name, k: `${m.simTotal} EN SIM` })),
      nota: "REPARTO DEL SIMULACRO · 310 PREGUNTAS · 5 HORAS",
    },
    incluye: [
      "2,800+ preguntas con explicación",
      "Simulador de 310 preguntas",
      "12 materias completas",
      "Análisis por materia",
      "Tutora IA",
      "Empieza gratis",
    ],
    faqs: [
      {
        q: "¿Cómo funciona el módulo CIAAC de FlightPath?",
        a: "Eliges materia (o mezclas varias), respondes preguntas con retroalimentación inmediata y explicación por reactivo, y validas con simulacros completos de 310 preguntas en 5 horas. El análisis por materia te dice dónde recuperar puntos antes del examen real.",
      },
      {
        q: "¿Qué incluye la cuenta gratis?",
        a: "Una muestra del banco por materia, un simulador completo al mes y parte de la biblioteca — suficiente para auditar la calidad de las preguntas antes de pagar. Pro abre el banco completo y los simulacros ilimitados.",
      },
      {
        q: "¿El módulo es el examen oficial?",
        a: "No: es preparación independiente con reactivos propios. El examen oficial lo aplica únicamente el CIAAC de la AFAC, y ninguna preparación puede garantizarte el resultado.",
      },
    ],
    guiaHref: "/ciaac",
    guiaLabel: "Leer la guía del examen CIAAC",
  },
  {
    slug: "rtari",
    pill: "Inglés por voz",
    nombre: "Entrevista RTARI",
    titulo: "Tu inglés de cabina",
    tituloCoral: "se entrena hablando.",
    descripcion:
      "Un sinodal de IA te entrevista por voz en inglés, te repregunta como en el examen real y te entrega un debrief por las seis áreas OACI. Disponible 24/7 — sin agendar y sin pena.",
    keywords:
      "modulo rtari flightpath, practicar entrevista rtari online, ingles aeronautico por voz, sinodal ia entrevista piloto",
    stats: [
      { n: "6", label: "áreas OACI evaluadas en el debrief" },
      { n: "45", label: "preguntas reales con guía de respuesta" },
      { n: "3", label: "sinodales de voz, dos exigencias" },
    ],
    pasos: [
      {
        t: "Configura la mesa",
        d: "Eliges sinodal, exigencia (estándar o exigente) y de 4 a 15 preguntas. Sin agendar: la mesa siempre está libre.",
      },
      {
        t: "Habla en inglés",
        d: "El sinodal entiende lo que dijiste y repregunta sobre tu respuesta — la parte que no puedes ensayar con flashcards.",
      },
      {
        t: "Recibe tu debrief",
        d: "Nivel estimado por área OACI, correcciones sobre frases tuyas y la transcripción completa en tu historial.",
      },
    ],
    features: [
      {
        icon: "audio",
        t: "Entrevista real, por voz",
        d: "Hablas y el sinodal entiende lo que dijiste: repregunta sobre tu respuesta, como en la mesa del examen. De 4 a 15 preguntas por sesión.",
      },
      {
        icon: "user",
        t: "Tres sinodales, dos exigencias",
        d: "Voces distintas y modos estándar o exigente: del ritmo amable para arrancar al ritmo real de examen que casi no repite.",
      },
      {
        icon: "chart",
        t: "Debrief por las 6 áreas OACI",
        d: "Pronunciación, estructura, vocabulario, fluidez, comprensión e interacción — con nivel estimado por área y correcciones sobre frases que dijiste.",
      },
      {
        icon: "book",
        t: "Banco de 45 preguntas con guía",
        d: "Los temas reales de la entrevista personal, cada uno con traducción y tips de qué debe contener una buena respuesta.",
      },
    ],
    detalle: {
      eyebrow: "El debrief",
      titulo: "Las 6 áreas OACI,",
      tituloCoral: "una por una.",
      sub: "El marco de descriptores OACI evalúa la competencia lingüística en seis áreas. Tu debrief estima el nivel de cada una y te dice qué corregir.",
      items: [
        {
          t: "Pronunciación",
          d: "Qué tan interferido está tu acento y si obliga a re-escuchar.",
          k: "ÁREA 1",
        },
        {
          t: "Estructura",
          d: "Gramática y construcciones: tiempos, condicionales, orden.",
          k: "ÁREA 2",
        },
        {
          t: "Vocabulario",
          d: "Rango y precisión, incluida la fraseología aeronáutica.",
          k: "ÁREA 3",
        },
        { t: "Fluidez", d: "Ritmo, pausas y muletillas al hilar ideas largas.", k: "ÁREA 4" },
        {
          t: "Comprensión",
          d: "Qué tanto entiendes a la primera, incluso con repreguntas.",
          k: "ÁREA 5",
        },
        {
          t: "Interacción",
          d: "Cómo respondes, pides aclarar y mantienes la conversación viva.",
          k: "ÁREA 6",
        },
      ],
      nota: "MARCO DE DESCRIPTORES OACI · NIVEL OPERACIONAL = 4+",
    },
    incluye: [
      "Sinodal de voz con IA",
      "45 preguntas en 6 bloques",
      "Debrief por área OACI",
      "Transcripción e historial",
      "60 min/mes con Pro",
    ],
    faqs: [
      {
        q: "¿Cómo es una sesión del módulo RTARI?",
        a: "Eliges sinodal, exigencia y número de preguntas; la entrevista corre por voz y en inglés (hasta 20 minutos); al terminar recibes tu debrief por las seis áreas OACI, correcciones concretas y la transcripción completa. Todo queda en tu historial.",
      },
      {
        q: "¿Necesito pagar para probarlo?",
        a: "La cuenta gratis te deja explorar el banco de 45 preguntas con su guía de respuesta. Las entrevistas por voz usan minutos incluidos en Pro (60 al mes, unas seis entrevistas de 10 minutos) con paquetes adicionales disponibles.",
      },
      {
        q: "¿El nivel del debrief es una certificación?",
        a: "No: es una referencia de entrenamiento para dirigir tu práctica. El certificado RTARI lo emite únicamente la autoridad — FlightPath no está afiliada a la AFAC.",
      },
    ],
    guiaHref: "/examen-rtari",
    guiaLabel: "Leer la guía del examen RTARI",
    aviso:
      "FlightPath no está afiliada a la AFAC ni aplica el examen RTARI; el nivel del debrief es una métrica de entrenamiento, no una certificación.",
  },
  {
    slug: "compass",
    pill: "Aptitudes",
    nombre: "Pilot Aptitude Trainer",
    titulo: "Las aptitudes de selección",
    tituloCoral: "también se entrenan.",
    descripcion:
      "Seis ejercicios originales de las familias que evalúan las pruebas tipo COMPASS — control biaxial, slalom, memoria, cálculo mental, orientación y multitarea — con 5 niveles, puntuación comparable y radar de progreso.",
    keywords:
      "modulo compass flightpath, entrenador de aptitudes piloto, ejercicios tipo compass online, pilot aptitude trainer español",
    stats: [
      { n: "6", label: "ejercicios de familias reales de aptitud" },
      { n: "5", label: "niveles de dificultad con física" },
      { n: "20", label: "minutos dura el simulacro completo" },
    ],
    pasos: [
      {
        t: "Briefing del ejercicio",
        d: "Controles, física de la tarea y los errores comunes que cuestan puntos — antes de tocar el mando.",
      },
      {
        t: "Vuela la sesión medida",
        d: "Práctica por nivel o examen de módulo: cada corrida queda registrada con seed, nivel y métricas.",
      },
      {
        t: "Lee tu debrief",
        d: "Score 0–100, métricas de la sesión, consejo concreto y tu radar de seis aptitudes actualizado.",
      },
    ],
    features: [
      {
        icon: "target",
        t: "Física de verdad, no minijuegos",
        d: "Inercia del mando, acoplamiento entre ejes, viento cruzado y chicanes: la dificultad sube como en una prueba real, no solo 'más rápido'.",
      },
      {
        icon: "chart",
        t: "Puntuación honesta y comparable",
        d: "0–100 con reglas deterministas y versionadas: tu tendencia solo compara sesiones medidas igual. Sin inflación que te haga sentir listo sin estarlo.",
      },
      {
        icon: "compass",
        t: "Radar de aptitudes",
        d: "Tus seis aptitudes en un vistazo, con tu módulo débil señalado y consejos concretos según tus métricas de cada sesión.",
      },
      {
        icon: "clock",
        t: "Simulacro compacto",
        d: "Los seis ejercicios encadenados en ~20 minutos, como un día de selección en miniatura. Teclado, mouse o touch — sin joystick.",
      },
    ],
    detalle: {
      eyebrow: "Los ejercicios",
      titulo: "Seis aptitudes,",
      tituloCoral: "seis ejercicios medidos.",
      sub: "Cada ejercicio entrena una familia de aptitud de las baterías de selección, con práctica por nivel y modo examen.",
      items: COMPASS_MODULES.map((m, i) => ({
        t: m.nombre,
        d: m.aptitud,
        k: `EJERCICIO ${String(i + 1).padStart(2, "0")}`,
      })),
      nota: "PRÁCTICA POR NIVEL 1–5 · EXAMEN DE MÓDULO · SIMULACRO ENCADENADO",
    },
    incluye: [
      "6 ejercicios de aptitud",
      "5 niveles de dificultad",
      "Simulacro de ~20 min",
      "Radar y bitácora",
      "Incluido con tu cuenta",
    ],
    faqs: [
      {
        q: "¿Qué ejercicios trae el entrenador de aptitudes?",
        a: "Control compensatorio de dos ejes, slalom con viento cruzado, memoria de parámetros (rumbos, niveles, frecuencias), cálculo mental aeronáutico, orientación espacial con QDM/QDR y multitarea con alertas. Cada uno con práctica libre por nivel y modo examen.",
      },
      {
        q: "¿Sirve para el examen COMPASS de una escuela o aerolínea?",
        a: "Entrena las mismas familias de aptitud que evalúan esas baterías y elimina la sorpresa del formato — la parte que sí depende de ti. Los ejercicios son originales de FlightPath: no replican ninguna prueba y ningún entrenamiento puede garantizar una selección.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "Hoy está incluido con tu cuenta de FlightPath — y la cuenta se crea gratis, sin tarjeta. Entras, eliges ejercicio y en dos minutos tienes tu primera puntuación.",
      },
    ],
    guiaHref: "/examen-compass",
    guiaLabel: "Leer la guía del examen COMPASS",
    aviso:
      "COMPASS es un producto de EPST, con quien FlightPath no tiene afiliación. Los ejercicios son originales y los puntajes son métricas de entrenamiento, no pronósticos de selección.",
  },
  {
    slug: "linea-aerea",
    pill: "Convocatorias",
    nombre: "Línea Aérea",
    titulo: "El temario de tu convocatoria,",
    tituloCoral: "fuente por fuente.",
    descripcion:
      "Las 5 fuentes del examen teórico de línea aérea — ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10 — convertidas en bancos por capítulos con explicación en español y simulacros cronometrados.",
    keywords:
      "modulo linea aerea flightpath, banco atp espanol, jeppesen preguntas practica, examen teorico convocatoria aerolinea",
    stats: [
      { n: "5", label: "fuentes del temario publicado" },
      { n: "ES", label: "explicación en tu idioma, término en inglés" },
      { n: "24/7", label: "simulacros cuando tú puedas" },
    ],
    pasos: [
      {
        t: "Elige la fuente",
        d: "ATP, PHAK, Jeppesen, CPAM o Anexo 10 — cada una con su banco propio y su guía pública.",
      },
      {
        t: "Estudia por capítulos",
        d: "Reactivos con explicación en español que conservan la terminología del manual — como te lo van a preguntar.",
      },
      {
        t: "Valida con simulacro",
        d: "Cronómetro corriendo y historial por fuente: sabes qué dominas antes de que la convocatoria lo pregunte.",
      },
    ],
    features: [
      {
        icon: "book",
        t: "Las 5 fuentes por capítulos",
        d: "Estudias exactamente el capítulo que toca — Cap. 3 del ATP, mínimos Jeppesen — sin perderte en PDFs de mil páginas.",
      },
      {
        icon: "cards",
        t: "Explicación en español",
        d: "Reactivos propios explicados en tu idioma, conservando la terminología en inglés del material original — como te lo van a preguntar.",
      },
      {
        icon: "clock",
        t: "Simulacros cronometrados",
        d: "Valida con formato de examen y reloj corriendo antes de que la convocatoria te lo pregunte en serio.",
      },
      {
        icon: "chart",
        t: "Avance por fuente y capítulo",
        d: "Sabes qué fuente dominas y cuál te está costando puntos — y el historial te dice exactamente dónde reabrir.",
      },
    ],
    detalle: {
      eyebrow: "Las fuentes",
      titulo: "El temario publicado,",
      tituloCoral: "fuente por fuente.",
      sub: "Las cinco fuentes del examen teórico de convocatoria, cada una convertida en banco por capítulos con su guía pública.",
      items: [
        {
          t: "ATP — Airline Transport Pilot Test Prep",
          d: "La fuente más pesada: aerodinámica, motores, meteorología, navegación y operaciones.",
          k: "FUENTE 01",
        },
        {
          t: "PHAK — Pilot's Handbook",
          d: "El manual de la FAA: aerodinámica, meteorología, medicina y factores humanos.",
          k: "FUENTE 02",
        },
        {
          t: "Jeppesen General Airway Manual",
          d: "Cartas, mínimos y manuales de información aeronáutica — el lenguaje de la navegación.",
          k: "FUENTE 03",
        },
        {
          t: "CPAM — Legislación nacional",
          d: "El compendio de legislación aeronáutica mexicana que sí o sí cae.",
          k: "FUENTE 04",
        },
        {
          t: "OACI Anexo 10 — Telecomunicaciones",
          d: "Volumen II: procedimientos de comunicación palabra por palabra.",
          k: "FUENTE 05",
        },
      ],
      nota: "TEMARIO PUBLICADO DE CONVOCATORIA · UNA GUÍA PÚBLICA POR FUENTE",
    },
    incluye: [
      "ATP · PHAK · Jeppesen · CPAM · Anexo 10",
      "Bancos por capítulos",
      "Explicaciones en español",
      "Simulacros",
      "Guías públicas por fuente",
    ],
    faqs: [
      {
        q: "¿Qué fuentes cubre el módulo de Línea Aérea?",
        a: "Las cinco del temario publicado de convocatoria: ATP (Airline Transport Pilot Test Prep), PHAK (Pilot's Handbook), Jeppesen General Airway Manual, CPAM y OACI Anexo 10 — cada una con su banco por capítulos y su guía pública.",
      },
      {
        q: "¿Las preguntas son las del examen de la aerolínea?",
        a: "No: son reactivos propios de FlightPath escritos sobre el temario publicado. Ninguna plataforma honesta tiene 'las preguntas del examen' — lo que sí puedes entrenar es el temario completo hasta dominarlo.",
      },
      {
        q: "¿Sirve si aún no hay convocatoria abierta?",
        a: "Es el mejor momento: el temario es amplio y quienes esperan a la convocatoria llegan tarde. El módulo te deja avanzar por capítulos a tu ritmo y llegar con el material fresco cuando se abra.",
      },
    ],
    guiaHref: "/linea-aerea",
    guiaLabel: "Ver las guías del temario",
    aviso:
      "FlightPath no está afiliada a ASPA, Aeroméxico ni ninguna aerolínea; los manuales citados pertenecen a sus titulares y se mencionan para describir el temario publicado.",
  },
  {
    slug: "manuales",
    pill: "Aeronaves",
    nombre: "Manuales de Aeronave",
    titulo: "El avión que vas a volar,",
    tituloCoral: "a base de preguntas.",
    descripcion: `El Boeing 737 MAX por los 9 capítulos del FCOM: limitaciones, procedimientos, rendimiento y sistemas en ${FMT_737} reactivos con explicación — para type rating, entrevista técnica o recurrent.`,
    keywords:
      "modulo manuales aeronave flightpath, banco 737 max fcom, preguntas type rating 737, estudiar sistemas boeing",
    stats: [
      { n: "9", label: "capítulos, en el orden del FCOM" },
      { n: FMT_737, label: "reactivos con explicación" },
      { n: "3", label: "momentos: type rating, entrevista, recurrent" },
    ],
    pasos: [
      {
        t: "Abre el capítulo que toca",
        d: "La estructura es la del manual: limitaciones primero, sistemas por bloques, rendimiento al final.",
      },
      {
        t: "Practica hasta que salga solo",
        d: "Velocidades, pesos y altitudes a base de repetición medida — fallar aquí es barato.",
      },
      {
        t: "Revisa tu historial",
        d: "El porcentaje por capítulo te dice exactamente qué reabrir antes del examen o la entrevista.",
      },
    ],
    features: [
      {
        icon: "doc",
        t: "La estructura del FCOM",
        d: "9 capítulos en el orden del manual: limitaciones primero, sistemas por bloques, rendimiento al final. Estudias como se estudia un avión.",
      },
      {
        icon: "shield",
        t: "Limitaciones que salen solas",
        d: "Velocidades, pesos y altitudes a base de repetición medida — la recuperación instantánea que exigen exámenes y entrevistas.",
      },
      {
        icon: "cards",
        t: "Explicación por reactivo",
        d: "En español, conservando la terminología en inglés del manual. Fallar aquí es barato; el historial te dice qué capítulo reabrir.",
      },
      {
        icon: "bolt",
        t: "Abierto para empezar gratis",
        d: "El banco del 737 MAX es de los abiertos al plan gratuito: auditas la calidad de las preguntas antes de pagar un peso.",
      },
    ],
    detalle: {
      eyebrow: "El banco",
      titulo: "Los 9 capítulos,",
      tituloCoral: "como en el FCOM.",
      sub: `${FMT_737} reactivos organizados con la estructura del manual del 737 MAX, para estudiar bloque por bloque.`,
      items: B737MAX_CHAPTERS.map((c) => ({
        t: c.titulo,
        d: c.tituloEn,
        k: `CAP. ${String(c.num).padStart(2, "0")} · ${c.total.toLocaleString("es-MX")}`,
      })),
      nota: `FCOM · ${FMT_737} REACTIVOS · MISMA ESTRUCTURA QUE EL MANUAL`,
    },
    incluye: [
      "737 MAX · 9 capítulos FCOM",
      `${FMT_737} reactivos`,
      "Explicaciones en español",
      "Historial por capítulo",
      "Muestra gratis",
    ],
    faqs: [
      {
        q: "¿Qué aeronaves cubre el módulo?",
        a: "Hoy, el Boeing 737 MAX completo por los 9 capítulos de su FCOM. La arquitectura del módulo está hecha para sumar más equipos — el catálogo crece con la plataforma.",
      },
      {
        q: "¿Para qué momento de la carrera sirve?",
        a: "Tres momentos: preparar el curso teórico del type rating, entrenar la recuperación rápida que piden las entrevistas técnicas, y el repaso recurrente de quien ya vuela la línea.",
      },
      {
        q: "¿Sustituye al FCOM oficial?",
        a: "No, y desconfía de lo que lo prometa: entrena la retención de lo que estudias, pero la única fuente normativa para operar es la documentación vigente de tu operador.",
      },
    ],
    guiaHref: "/estudiar-737-max",
    guiaLabel: "Leer la guía para estudiar el 737 MAX",
    aviso:
      "Boeing, 737 y 737 MAX son marcas de The Boeing Company, que no patrocina este material. Los reactivos son propios y no reproducen el FCOM.",
  },
  {
    slug: "biblioteca",
    pill: "Transversal",
    nombre: "Biblioteca y Análisis",
    titulo: "Todo tu estudio,",
    tituloCoral: "medido y en un lugar.",
    descripcion:
      "Más de 100 manuales de consulta organizados, tu avance por materia contra el 80% de referencia, el radar de aptitudes y dos copilotos IA — Yaris para dudas y Pathy para constancia.",
    keywords:
      "biblioteca aeronautica digital, analisis de estudio piloto, manuales de aviacion consulta, tutor ia aviacion",
    stats: [
      { n: "104", label: "manuales de consulta organizados" },
      { n: "12", label: "materias medidas contra el 80%" },
      { n: "2", label: "copilotos IA: Yaris y Pathy" },
    ],
    pasos: [
      {
        t: "Estudia en cualquier módulo",
        d: "CIAAC, línea aérea, aptitudes o manuales: todo lo que haces alimenta el mismo tablero.",
      },
      {
        t: "Consulta la fuente",
        d: "La biblioteca te da el manual organizado por materia cuando la explicación te sabe a poco.",
      },
      {
        t: "Lee tu análisis",
        d: "Avance por materia, radar de aptitudes y racha: sabes qué toca mañana sin pensarlo.",
      },
    ],
    features: [
      {
        icon: "library",
        t: "100+ manuales organizados",
        d: "El material de consulta del curso en un solo lugar, buscable y ligado a las materias que estás practicando.",
      },
      {
        icon: "chart",
        t: "Análisis que conecta todo",
        d: "Aciertos por materia y tema, tendencia contra tu propia línea base y el radar de tus seis aptitudes. Estudias con evidencia, no con sensaciones.",
      },
      {
        icon: "spark",
        t: "Yaris responde al instante",
        d: "La tutora IA con el contexto de cada pregunta: por qué es correcta, por qué las otras no y un tip para recordarlo.",
      },
      {
        icon: "heart",
        t: "Pathy sostiene la constancia",
        d: "Rachas, recordatorios y tu misión del día — porque la carrera se gana en las semanas aburridas, no en las inspiradas.",
      },
    ],
    detalle: {
      eyebrow: "El tablero",
      titulo: "Un solo tablero",
      tituloCoral: "para toda tu preparación.",
      sub: "Seis piezas conectadas: lo que practicas en un módulo cambia lo que el análisis te recomienda en los demás.",
      items: [
        {
          t: "Biblioteca por materia",
          d: "104 manuales y documentos de consulta, buscables y ligados a lo que practicas.",
          k: "CONSULTA",
        },
        {
          t: "Avance por materia y tema",
          d: "Tu porcentaje real contra el estándar de referencia de 80%.",
          k: "ANÁLISIS",
        },
        {
          t: "Radar de aptitudes",
          d: "Las seis aptitudes del Pilot Aptitude Trainer en un vistazo.",
          k: "ANÁLISIS",
        },
        {
          t: "Bitácora de estudio",
          d: "Sesiones, rachas y tiempo — tu constancia también se mide.",
          k: "REGISTRO",
        },
        {
          t: "Yaris",
          d: "La tutora académica: explica la pregunta que tienes enfrente.",
          k: "COPILOTO IA",
        },
        {
          t: "Pathy",
          d: "El copiloto de constancia: rachas, recordatorios y tu misión del día.",
          k: "COPILOTO IA",
        },
      ],
      nota: "TODO ALIMENTA EL MISMO TABLERO · ESTUDIAS CON EVIDENCIA",
    },
    incluye: [
      "100+ manuales",
      "Análisis por materia",
      "Radar de aptitudes",
      "Yaris · tutora IA",
      "Pathy · constancia",
    ],
    faqs: [
      {
        q: "¿Qué hay en la biblioteca?",
        a: "Más de 100 manuales y documentos de consulta del curso, organizados por materia. La cuenta gratis incluye una muestra; Pro abre la biblioteca completa.",
      },
      {
        q: "¿Qué mide exactamente el análisis?",
        a: "Tu porcentaje de aciertos por materia y por tema contra el estándar de referencia de 80%, tu constancia (rachas y sesiones) y tus aptitudes del entrenador tipo COMPASS en un radar. Cada módulo alimenta el mismo tablero.",
      },
      {
        q: "¿Yaris y Pathy son lo mismo?",
        a: "No: Yaris es la tutora académica — explica preguntas y resuelve dudas con IA. Pathy es tu copiloto de constancia: rachas, recordatorios y motivación. Uno te enseña; el otro se asegura de que llegues a la sesión.",
      },
    ],
    guiaHref: "/sobre-flightpath",
    guiaLabel: "Conocer FlightPath a fondo",
  },
];

export function moduloBySlug(slug: string): ModuloLanding | undefined {
  return MODULOS_LANDING.find((m) => m.slug === slug);
}
