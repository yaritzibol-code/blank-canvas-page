/**
 * Seed inicial: cuentas demo, historial realista y contenido administrable
 * (banco de preguntas, flashcards, clases en borrador, materiales, recordatorios).
 * Corre una sola vez por navegador (versionado).
 */
import { read, write, todayKey } from "./db";
import { hashPassword, defaultPrefs } from "./auth";
import { MATERIAS_DEF } from "./materias";
import { SEED_QUESTIONS } from "./seed-questions";
import { LIBROS_SEED } from "./seed-biblioteca";
import type {
  ActivityEvent,
  BankQuestion,
  BitacoraEntry,
  Clase,
  FlashCardItem,
  Material,
  QuizAttempt,
  Reminder,
  Report,
  SimAttempt,
  StudyDays,
  TemaProgress,
  User,
} from "./types";

const SEED_VERSION = 5;

const pad3 = (n: number) => String(n).padStart(3, "0");

function daysAgoISO(days: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

export const DEMO_STUDENT_ID = "usr_maria";
export const DEMO_ADMIN_ID = "usr_admin";
export const DEMO_BASIC_ID = "usr_carlos";
export const DEMO_PASSWORD = "flightpath2026";

function seedUsers(): User[] {
  const registeredAt = daysAgoISO(150, 10);
  return [
    {
      id: DEMO_STUDENT_ID,
      nombre: "María González Ramírez",
      email: "maria.gonzalez@email.com",
      passwordHash: hashPassword(DEMO_PASSWORD),
      whatsapp: "+52 55 1234 5678",
      whatsappEstado: "confirmado",
      escuela: "Escuela de Aviación del Pacífico",
      fechaCiaac: "2026-08-17",
      perfilCiaac: "Ala Fija — Piloto Aviador Comercial",
      role: "student",
      plan: "paga",
      planNombre: "Plan Anual",
      accessStatus: "activo",
      accessStart: "2026-02-05T10:00:00.000Z",
      accessEnd: "2027-02-05T10:00:00.000Z",
      createdAt: registeredAt,
      lastAccess: daysAgoISO(0, 9),
      marketingOptIn: true,
      onboardingDone: true,
      deactivatedAt: null,
      notasInternas:
        "Alumna constante. Pidió apoyo extra en Meteorología. Renovó plan anual en febrero.",
      prefs: defaultPrefs(),
    },
    {
      id: DEMO_BASIC_ID,
      nombre: "Carlos Mendoza Ruiz",
      email: "carlos.mendoza@email.com",
      passwordHash: hashPassword(DEMO_PASSWORD),
      whatsapp: "",
      whatsappEstado: "sin_numero",
      escuela: "Colegio del Aire de Guadalajara",
      fechaCiaac: null,
      perfilCiaac: "",
      role: "student",
      plan: "basica",
      planNombre: "Suscripción básica",
      accessStatus: "activo",
      accessStart: daysAgoISO(12, 10),
      accessEnd: null,
      createdAt: daysAgoISO(12, 10),
      lastAccess: daysAgoISO(2, 20),
      marketingOptIn: false,
      onboardingDone: false,
      deactivatedAt: null,
      notasInternas: "",
      prefs: defaultPrefs(),
    },
    {
      id: DEMO_ADMIN_ID,
      nombre: "Yaritzi Bolaños",
      email: "admin@flightpath.mx",
      passwordHash: hashPassword(DEMO_PASSWORD),
      whatsapp: "+52 55 9876 5432",
      whatsappEstado: "confirmado",
      escuela: "",
      fechaCiaac: null,
      perfilCiaac: "",
      role: "admin",
      plan: "paga",
      planNombre: "Administradora",
      accessStatus: "activo",
      accessStart: registeredAt,
      accessEnd: null,
      createdAt: registeredAt,
      lastAccess: daysAgoISO(0, 8),
      marketingOptIn: false,
      onboardingDone: true,
      deactivatedAt: null,
      notasInternas: "",
      prefs: defaultPrefs(),
    },
  ];
}

function seedQuestions(): BankQuestion[] {
  return SEED_QUESTIONS.map((q, i) => ({
    id: `q_seed_${pad3(i + 1)}`,
    materia: q.materia,
    text: q.text,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    cite: q.cite,
    status: "publicada" as const,
    source: "seed" as const,
    createdAt: daysAgoISO(120, 12),
    updatedAt: daysAgoISO(120, 12),
  }));
}

/** Flashcards: tarjetas escritas para Aerodinámica + derivadas del banco por materia. */
function seedFlashcards(questions: BankQuestion[]): FlashCardItem[] {
  const aeroCards: Array<[string, string]> = [
    ["¿Cuáles son las 4 fuerzas que actúan sobre una aeronave en vuelo?", "Sustentación, Peso, Empuje y Resistencia. En vuelo recto y nivelado estas fuerzas están en equilibrio."],
    ["¿Qué establece el Principio de Bernoulli?", "En un fluido en movimiento, al aumentar la velocidad disminuye la presión estática. Esto explica cómo el ala genera sustentación."],
    ["¿Qué es el ángulo de ataque?", "El ángulo formado entre la cuerda del ala y la dirección del viento relativo. Es fundamental para la generación de sustentación."],
    ["¿Qué es el ángulo crítico de ataque?", "El ángulo máximo de ataque antes del desplome (stall). Al superarlo, el flujo se desprende del ala y se pierde la sustentación."],
    ["¿Qué es el factor de carga?", "La relación entre la sustentación total y el peso de la aeronave (n = L/W). En vuelo recto y nivelado es igual a 1."],
    ["¿Qué es la resistencia inducida?", "Resistencia generada como consecuencia de la producción de sustentación. Aumenta cuando aumenta el ángulo de ataque."],
    ["¿Cuál es la diferencia entre estabilidad estática y dinámica?", "La estabilidad estática es la tendencia inicial a regresar al equilibrio. La dinámica describe el comportamiento a lo largo del tiempo después de una perturbación."],
    ["¿Qué es el motor crítico en una aeronave multimotor?", "El motor cuya falla produce el mayor efecto adverso sobre el control y rendimiento de la aeronave. En aviones con hélices girando en el mismo sentido es el izquierdo."],
  ];

  const cards: FlashCardItem[] = aeroCards.map(([q, a], i) => ({
    id: `fc_aero_${pad3(i + 1)}`,
    materia: "aerodinamica",
    tema: "Definiciones y clasificación",
    q,
    a,
    status: "publicada" as const,
  }));

  // Nombres de temas (2 por materia) para organizar los decks derivados del banco.
  const TEMAS_POR_MATERIA: Record<string, [string, string]> = {
    aerodinamica: ["Definiciones y clasificación", "Leyes de Newton y Bernoulli"],
    "aeronaves-motores": ["Motor alternativo", "Sistemas de la aeronave"],
    legislacion: ["Convenios y organismos", "Ley de Aviación Civil"],
    medicina: ["Hipoxia y fisiología", "Desorientación espacial"],
    meteorologia: ["La atmósfera y nubes", "METAR y TAF"],
    navegacion: ["Coordenadas y cartas", "Radionavegación"],
    "servicios-transito": ["Espacio aéreo OACI", "Control de aeródromo"],
    comunicaciones: ["Procedimientos radiotelefónicos", "Emergencias y fallas"],
    "manuales-ais": ["AIP y NOTAM", "Ciclo AIRAC"],
    "factores-humanos": ["Modelo SHELL y CRM", "Actitudes peligrosas"],
    "seguridad-aerea": ["SMS y cultura justa", "Investigación de accidentes"],
    operaciones: ["Velocidades y pesos", "Planificación de vuelo"],
  };

  MATERIAS_DEF.forEach((m) => {
    // Tope de 40 tarjetas por materia: decks estudiables y localStorage acotado.
    const qs = questions.filter((q) => q.materia === m.slug).slice(0, 40);
    const [tema1, tema2] = TEMAS_POR_MATERIA[m.slug] ?? ["Repaso general I", "Repaso general II"];
    qs.forEach((q, i) => {
      // Aerodinámica ya tiene el primer deck escrito a mano; sus derivadas van al deck 2.
      const tema = m.slug === "aerodinamica" ? tema2 : i < Math.ceil(qs.length / 2) ? tema1 : tema2;
      cards.push({
        id: `fc_${m.slug}_${pad3(i + 1)}`,
        materia: m.slug,
        tema,
        q: q.text,
        a: `${q.options[q.correctIndex]}. ${q.explanation}`,
        status: "publicada",
      });
    });
  });
  return cards;
}

/** Clases grabadas del plan de contenido, en borrador hasta que la admin las publique. */
function seedClases(): Clase[] {
  const catalog: Array<[string, string[]]> = [
    ["aerodinamica", [
      "Introducción a la Aerodinámica|14|Qué es la aerodinámica, su importancia en aviación y conceptos básicos de fluidos.",
      "Fuerzas que actúan en vuelo|19|Las 4 fuerzas fundamentales: sustentación, peso, empuje y resistencia.",
      "Principio de Bernoulli y sustentación|20|Cómo el principio de Bernoulli explica la generación de sustentación en el ala.",
      "Perfiles aerodinámicos|17|Tipos de perfiles alares y sus características aerodinámicas.",
      "Mandos de la aeronave|22|Superficies de control primarias y secundarias y cómo afectan el vuelo.",
      "Estabilidad y control|20|Tipos de estabilidad y cómo mantener la aeronave en equilibrio.",
      "Maniobras y factor de carga|18|Cálculo del factor de carga en virajes, ascensos y descensos.",
      "Motor crítico|15|Por qué en aeronaves multimotor existe un motor crítico y sus implicaciones.",
    ]],
    ["aeronaves-motores", [
      "Clasificación de aeronaves|13|Tipos de aeronaves según peso, alas, motores y tren de aterrizaje.",
      "Estructuras de la aeronave|19|Componentes estructurales: fuselaje, alas, empenaje y sus funciones.",
      "Motor alternativo — Ciclo Otto|22|Funcionamiento del motor de pistón, ciclo Otto y sistemas principales.",
      "Motor alternativo — Sistemas|20|Sistemas de combustible, lubricación, enfriamiento y escape.",
      "Motor alternativo — Hélices|17|Tipos de hélices, paso fijo y paso variable, eficiencia propulsiva.",
      "Motor a reacción|24|Ciclo Brayton, tipos de turbinas y sistemas del motor a reacción.",
      "Sistemas de la aeronave|21|Sistemas hidráulico, neumático, eléctrico y de presurización.",
      "Tren de aterrizaje|14|Tipos de tren, operación y sistemas de frenos.",
      "Instrumentos de vuelo|20|Six-pack, instrumentos de presión estática y giroscópicos.",
    ]],
    ["meteorologia", [
      "La atmósfera y sus capas|16|Composición de la atmósfera, capas y sus características.",
      "Temperatura y presión atmosférica|19|Escalas de temperatura, variaciones y sistemas de presión.",
      "Nubes — Clasificación y Formación|22|Tipos de nubes, cómo se forman y su impacto en la aviación.",
      "Vientos y fenómenos atmosféricos|20|Tipos de viento, Wind Shear, turbulencia y sus efectos en vuelo.",
      "METAR y TAF — Lectura e interpretación|25|Cómo leer e interpretar reportes meteorológicos aeronáuticos.",
      "Tormentas y formación de hielo|17|Tipos de tormentas, engelamiento y cómo afectan la seguridad del vuelo.",
    ]],
    ["navegacion", [
      "Coordenadas y carta aeronáutica|19|Sistema de coordenadas geográficas y uso de cartas aeronáuticas.",
      "Magnetismo y variación|16|Magnetismo terrestre, variación magnética y declinación.",
      "Radionavegación — VOR y ADF|22|Funcionamiento e interpretación del VOR, ADF y DME.",
      "ILS y aproximaciones|21|Sistema de aterrizaje por instrumentos y sus componentes.",
      "Computador CR-3|20|Uso del computador de navegación CR-3 para cálculos de vuelo.",
      "Planificación de vuelo y NavLog|21|Cómo planificar un vuelo y completar un NavLog correctamente.",
      "GPS y navegación moderna|24|Sistemas GPS, RNAV y su aplicación en aviación general.",
    ]],
    ["legislacion", [
      "Jerarquía de normas aeronáuticas|14|Estructura legal de la aviación civil en México.",
      "Ley de Aviación Civil|23|Artículos más importantes de la Ley de Aviación Civil mexicana.",
      "Reglamento de Tránsito Aéreo|20|Reglas VFR e IFR, espacio aéreo y procedimientos.",
      "ROAC — Reglamento de Operación|19|Reglamento de Operación de Aeronaves Civiles y sus implicaciones.",
      "Circulares Obligatorias|10|Las COs más relevantes para el examen CIAAC.",
    ]],
    ["medicina", [
      "Fisiología del vuelo — Introducción|15|Divisiones fisiológicas y leyes de los gases aplicadas a la aviación.",
      "Hipoxia — Tipos y síntomas|20|Qué es la hipoxia, tipos, síntomas y tiempo de consciencia útil.",
      "Barotraumas y aeroembolismo|17|Barosinusitis, barotitis, barodontalgia y maniobra de Valsalva.",
      "Desorientación espacial e ilusiones|18|Tipos de ilusiones vestibulares y visuales en vuelo.",
      "Fatiga y factor humano|22|Tipos de fatiga, efectos en el rendimiento y cómo manejarla.",
      "Medicina preventiva y certificación médica|20|Certificación médica clase I, II y III y sus requisitos.",
    ]],
  ];

  const clases: Clase[] = [];
  catalog.forEach(([slug, items]) => {
    (items as string[]).forEach((raw, i) => {
      const [titulo, dur, desc] = raw.split("|");
      clases.push({
        id: `cl_${slug}_${pad3(i + 1)}`,
        materia: slug as string,
        titulo,
        descripcion: desc,
        duracionMin: parseInt(dur, 10),
        orden: i + 1,
        videoUrl: "",
        status: "borrador",
        createdAt: daysAgoISO(100, 12),
        updatedAt: daysAgoISO(100, 12),
      });
    });
  });
  return clases;
}

function seedMateriales(): Material[] {
  // Los 104 libros reales de la carpeta "libros" de Drive (visor embebible).
  return LIBROS_SEED.map((l) => ({
    id: l.id,
    titulo: l.titulo,
    autor: l.autor,
    materia: l.materia,
    tags: l.tags,
    badge: l.badge,
    badgeColor: l.badgeColor,
    emoji: l.emoji,
    gradient: l.gradient,
    pages: 0, // el visor de Drive pagina por sí mismo
    fileUrl: l.fileUrl,
    descargable: l.descargable,
    imprimible: l.imprimible,
    muestraGratis: l.muestraGratis,
    status: l.status,
    createdAt: daysAgoISO(110, 12),
    updatedAt: daysAgoISO(110, 12),
  }));
}

/** Ids de los 8 materiales del seed v1, reemplazados por la biblioteca real en v2. */
const V1_MATERIAL_IDS = new Set([
  "aero-basica", "aero-avanzada", "sta", "aeronaves",
  "medicina", "ifh", "jeppesen-charts", "oaci-fh",
]);

/** Historial demo de María: 14 días de actividad, 8 cuestionarios, 1 simulador. */
function seedHistory() {
  const userId = DEMO_STUDENT_ID;
  const activity: ActivityEvent[] = [];
  const studyDays: StudyDays = {};

  for (let d = 13; d >= 0; d--) {
    const day = todayKey(new Date(Date.now() - d * 86400000));
    studyDays[day] = (d % 3 === 0 ? 75 : d % 2 === 0 ? 55 : 40) * 60;
  }

  const quizzes: QuizAttempt[] = [
    { materias: ["meteorologia"], total: 50, correct: 41, durationMin: 38, daysAgo: 2 },
    { materias: ["aerodinamica", "meteorologia", "legislacion"], total: 30, correct: 27, durationMin: 22, daysAgo: 3 },
    { materias: ["legislacion"], total: 20, correct: 13, durationMin: 17, daysAgo: 5 },
    { materias: ["aerodinamica"], total: 25, correct: 21, durationMin: 19, daysAgo: 6 },
    { materias: ["navegacion"], total: 20, correct: 13, durationMin: 18, daysAgo: 8 },
    { materias: ["medicina"], total: 20, correct: 18, durationMin: 15, daysAgo: 10 },
    { materias: ["meteorologia"], total: 30, correct: 16, durationMin: 26, daysAgo: 11 },
    { materias: ["factores-humanos"], total: 20, correct: 17, durationMin: 16, daysAgo: 13 },
  ].map((q, i) => ({
    id: `quiz_seed_${pad3(i + 1)}`,
    userId,
    date: daysAgoISO(q.daysAgo, 19),
    materias: q.materias,
    total: q.total,
    correct: q.correct,
    durationMin: q.durationMin,
    porMateria: Object.fromEntries(
      q.materias.map((m) => [
        m,
        {
          correct: Math.round(q.correct / q.materias.length),
          total: Math.round(q.total / q.materias.length),
        },
      ]),
    ),
  }));

  const simPcts: Record<string, number> = {
    aerodinamica: 80, "aeronaves-motores": 80, legislacion: 70, medicina: 85,
    meteorologia: 52, navegacion: 65, "servicios-transito": 70, comunicaciones: 90,
    "manuales-ais": 80, "factores-humanos": 88, "seguridad-aerea": 90, operaciones: 56,
  };
  const porMateria: SimAttempt["porMateria"] = {};
  let simCorrect = 0;
  MATERIAS_DEF.forEach((m) => {
    const c = Math.round((simPcts[m.slug] / 100) * m.simTotal);
    porMateria[m.slug] = { correct: c, total: m.simTotal };
    simCorrect += c;
  });
  const sims: SimAttempt[] = [
    {
      id: "sim_seed_001",
      userId,
      date: daysAgoISO(7, 16),
      total: 310,
      correct: simCorrect,
      scorePct: Math.round((simCorrect / 310) * 1000) / 10,
      passed: simCorrect / 310 >= 0.8,
      durationSecs: 4 * 3600 + 12 * 60,
      porMateria,
      answers: [],
    },
  ];

  quizzes.forEach((q) => {
    activity.push({
      id: `act_${q.id}`,
      userId,
      date: q.date,
      kind: "quiz",
      label: `Cuestionario — ${q.materias.length === 1 ? q.materias[0] : "Varias materias"}`,
      score: Math.round((q.correct / q.total) * 100),
      durationMin: q.durationMin,
    });
  });
  activity.push({
    id: "act_sim_seed_001",
    userId,
    date: sims[0].date,
    kind: "simulador",
    label: "Simulador CIAAC completo",
    score: Math.round(sims[0].scorePct),
    durationMin: 252,
  });
  activity.push(
    { id: "act_flash_seed_001", userId, date: daysAgoISO(1, 20), kind: "flashcards", label: "Flashcards — Definiciones y clasificación", score: 75, durationMin: 12 },
    { id: "act_tema_seed_001", userId, date: daysAgoISO(4, 18), kind: "tema", label: "Learning Path — Fuerzas en vuelo", score: null, durationMin: 18 },
  );

  const temaProgress: TemaProgress[] = [
    "aerodinamica-1-1",
    "aerodinamica-1-2",
    "aerodinamica-1-3",
    "aerodinamica-1-4",
    "aerodinamica-1-5",
  ].map((temaId, i) => ({
    userId,
    temaId,
    completado: true,
    dificultad: 2 + (i % 3),
    fecha: daysAgoISO(12 - i * 2, 18),
  }));

  return { activity, studyDays, quizzes, sims, temaProgress };
}

function seedBitacora(): BitacoraEntry[] {
  const userId = DEMO_STUDENT_ID;
  const mk = (
    daysAgo: number, emotionIcon: string, moodLabel: string, motiv: number,
    conc: number, conf: number, materias: string[], text: string, pathyMsg: string,
  ): BitacoraEntry => ({
    id: `bit_seed_${daysAgo}`,
    userId,
    date: daysAgoISO(daysAgo, 21),
    emotionIcon, moodLabel, motiv, conc, conf, materias, text, pathyMsg,
  });
  return [
    mk(1, "checkCircle", "Bien", 4, 4, 3, ["Meteorología"], "Hoy por fin entendí la diferencia entre METAR y TAF. El simulador de la semana pasada me ayudó a ver mis huecos.", "¡Buen ritmo, María! Notaste tu propio avance en Meteorología: eso es metacognición de piloto. Mañana te recomiendo un cuestionario corto para consolidar."),
    mk(3, "alert", "Frustrada", 2, 3, 2, ["Meteorología", "Navegación Aérea"], "Me frustré con los cálculos de deriva. Siento que me falta base de trigonometría.", "Respira. La deriva confunde a todos al inicio. Te propongo 15 minutos de flashcards de Navegación mañana y luego lo hablamos con Yaris."),
    mk(6, "sun", "¡Increíble!", 5, 5, 4, [], "¡Terminé el simulador completo! 4 horas intensas pero lo logré. 73% general.", "¡Enorme, María! Completar un simulador de 310 preguntas es un hito. Tu 73% marca la línea base: ahora vamos por el 80%."),
    mk(9, "minus", "Más o menos", 3, 2, 3, ["Legislación Aeronáutica"], "Día pesado en la escuela, casi no pude concentrarme. Leí un rato de legislación.", "Los días grises también cuentan: 20 minutos valen más que cero. Mañana intenta tu sesión antes de la escuela, tu concentración suele ser mejor temprano."),
    mk(12, "checkCircle", "Bien", 4, 4, 3, ["Factores Humanos"], "Factores humanos se me da bien. El modelo SHELL tiene mucho sentido.", "Factores Humanos ya es una de tus fortalezas (88% de aciertos). Mantenla con un repaso semanal y enfoquemos la energía en Meteorología."),
  ];
}

function seedReminders(): Reminder[] {
  const userId = DEMO_STUDENT_ID;
  const all7 = [true, true, true, true, true, true, true];
  const weekdays = [true, true, true, true, true, false, false];
  return [
    { id: "rem_seed_1", userId, tipo: "Sesión de estudio diaria", titulo: "Sesión de estudio diaria", sub: "Todos los días · 7:00 PM", hora: "19:00", dias: all7, enabled: true, icon: "book", iconBg: "#EAF0FA", tags: ["Diario", "7:00 PM"], ultimoEnvio: daysAgoISO(1, 19), createdAt: daysAgoISO(60, 10) },
    { id: "rem_seed_2", userId, tipo: "Simulador semanal", titulo: "Simulador semanal", sub: "Sábados · 9:00 AM", hora: "09:00", dias: [false, false, false, false, false, true, false], enabled: true, icon: "clipboard", iconBg: "#F2DCDB", tags: ["Semanal", "Sábado"], ultimoEnvio: daysAgoISO(3, 9), createdAt: daysAgoISO(60, 10) },
    { id: "rem_seed_3", userId, tipo: "Materia débil", titulo: "Reforzar Meteorología", sub: "Lunes a viernes · 6:30 PM", hora: "18:30", dias: weekdays, enabled: true, icon: "cloud", iconBg: "#EAF6EE", tags: ["Materia débil", "L-V"], ultimoEnvio: daysAgoISO(1, 18), createdAt: daysAgoISO(30, 10) },
    { id: "rem_seed_4", userId, tipo: "Racha", titulo: "Recordatorio de racha", sub: "Cuando esté por perderse la racha", hora: "21:00", dias: all7, enabled: false, icon: "flame", iconBg: "#FDF3E7", tags: ["Racha"], ultimoEnvio: null, createdAt: daysAgoISO(30, 10) },
  ];
}

function seedReports(): Report[] {
  return [
    {
      id: "rep_seed_1",
      userId: DEMO_STUDENT_ID,
      userName: "María González Ramírez",
      userEmail: "maria.gonzalez@email.com",
      fecha: daysAgoISO(2, 20),
      tipo: "Pregunta mal redactada",
      seccion: "Cuestionarios",
      recurso: "q_seed_031",
      mensaje: "La pregunta del rumbo verdadero y magnético tiene dos opciones que suenan casi iguales; creo que la B debería mencionar la desviación del compás con más claridad.",
      estado: "pendiente",
      notasInternas: "",
    },
    {
      id: "rep_seed_2",
      userId: DEMO_BASIC_ID,
      userName: "Carlos Mendoza Ruiz",
      userEmail: "carlos.mendoza@email.com",
      fecha: daysAgoISO(5, 13),
      tipo: "Problema de acceso",
      seccion: "Biblioteca",
      recurso: "aero-avanzada",
      mensaje: "No puedo abrir el manual de Aerodinámica Avanzada, me aparece el candado. ¿Es normal con la cuenta gratuita?",
      estado: "resuelto",
      notasInternas: "Es el comportamiento esperado del plan básico. Le expliqué por correo y le compartí los planes.",
    },
  ];
}

/** Corre el seed si el navegador aún no tiene datos (o tiene una versión anterior). */
export function ensureSeeded() {
  const current = read<number>("seed_version", 0);
  if (current >= SEED_VERSION) return;

  if (current >= 1) {
    // Migraciones incrementales para navegadores ya sembrados (conservan usuarios,
    // historial y contenido creado por la administradora).
    if (current < 2) {
      // v2: biblioteca real (8 materiales demo → 104 libros de Drive).
      const custom = read<Material[]>("materiales", []).filter(
        (m) => !V1_MATERIAL_IDS.has(m.id) && !m.id.startsWith("lib_"),
      );
      write("materiales", [...seedMateriales(), ...custom]);
    }
    if (current < 5) {
      // v3: banco oficial completo (72 preguntas semilla → 2,819 del spreadsheet).
      // v4: banco auditado contra el Excel oficial (2,819 → 2,951): se recuperan
      // las preguntas omitidas, cada hoja queda completa en su materia y se
      // reparan 8 filas dañadas. Flashcards re-derivadas del banco corregido.
      // v5: se reconstruyen las filas de Meteorología corruptas en el Excel
      // original (relleno "OMM/la/a" insertado entre palabras) con doble
      // verificación técnica; explicaciones descolocadas reescritas.
      const custom = read<BankQuestion[]>("questions", []).filter(
        (q) => !q.id.startsWith("q_seed_"),
      );
      const fresh = seedQuestions();
      write("questions", [...fresh, ...custom]);
      write("flashcards", seedFlashcards(fresh));
    }
    write("seed_version", SEED_VERSION);
    return;
  }

  const users = seedUsers();
  const existing = read<User[]>("users", []);
  // Conserva cuentas creadas antes del seed (no debería ocurrir, pero por seguridad).
  const merged = [...users, ...existing.filter((u) => !users.some((s) => s.id === u.id || s.email === u.email))];
  write("users", merged);

  const questions = seedQuestions();
  write("questions", [...questions, ...read<BankQuestion[]>("questions", []).filter((q) => !q.id.startsWith("q_seed_"))]);
  write("flashcards", seedFlashcards(questions));
  write("clases", seedClases());
  write("materiales", seedMateriales());

  const { activity, studyDays, quizzes, sims, temaProgress } = seedHistory();
  write("activity", activity);
  write("study_days", { [DEMO_STUDENT_ID]: studyDays });
  write("quiz_attempts", quizzes);
  write("sim_attempts", sims);
  write("tema_progress", temaProgress);
  write("bitacora", seedBitacora());
  write("reminders", seedReminders());
  write("reports", seedReports());

  write("seed_version", SEED_VERSION);
}
