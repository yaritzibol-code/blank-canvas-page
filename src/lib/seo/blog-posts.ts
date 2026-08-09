/**
 * Artículos del blog (cluster TOFU "carrera de piloto en México").
 *
 * Cada entrada es una página /blog/$slug con Article + FAQPage schema. Reglas
 * de COMPLIANCE.md aplicadas al contenido de carrera: nada de cifras oficiales
 * inventadas — los costos se explican por rubros con horquillas amplias y
 * remisión a las fuentes (escuelas, AFAC); los trámites siempre remiten a la
 * autoridad; las cifras de FlightPath salen del producto. El artículo de datos
 * usa mediciones propias reproducibles (piloto sintético del módulo Compass,
 * ver src/modules/compass y el PR que endureció el motor v2).
 */

export interface BlogSeccion {
  h2: string;
  parrafos: string[];
  lista?: string[];
}

export interface BlogPost {
  slug: string;
  titulo: string;
  /** Meta description / subtítulo del listado. */
  gancho: string;
  categoria: "Carrera" | "Exámenes" | "Datos";
  publicado: string;
  lecturaMin: number;
  keywords: string;
  /** Respuesta corta AEO: primer bloque citable del artículo. */
  resumen: string;
  secciones: BlogSeccion[];
  faqs: { q: string; a: string }[];
  /** Páginas del sitio para profundizar (CTA contextual). */
  paginas: { label: string; href: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-ser-piloto-aviador-en-mexico",
    titulo: "Cómo ser piloto aviador en México: la ruta completa, paso a paso",
    gancho:
      "De cero horas a la cabina de una aerolínea: escuela, licencias, el examen CIAAC, el inglés RTARI y los procesos de selección — en orden y sin mitos.",
    categoria: "Carrera",
    publicado: "2026-08-09",
    lecturaMin: 9,
    keywords:
      "como ser piloto aviador en mexico, requisitos para ser piloto comercial, carrera de piloto aviador, escuela de aviacion mexico, licencia de piloto mexico, cuanto dura la carrera de piloto",
    resumen:
      "Para ser piloto aviador en México necesitas: cumplir los requisitos de edad y aptitud psicofísica, formarte en una escuela de aviación autorizada, acumular horas de vuelo, aprobar los exámenes teóricos y prácticos de cada licencia (privado y luego comercial, con el examen CIAAC de la AFAC como filtro teórico), certificar tu inglés aeronáutico (RTARI) y, con eso, competir en los procesos de selección de las aerolíneas.",
    secciones: [
      {
        h2: "El mapa completo, en orden",
        parrafos: [
          "La carrera tiene una secuencia clara aunque cada historia tome desvíos: requisitos de entrada, escuela, licencia de piloto privado, construcción de horas, licencia de piloto comercial (con el examen CIAAC como su gran filtro teórico), inglés aeronáutico certificado y, al final, los procesos de selección de línea aérea. Verla completa desde el día uno evita el error más caro: descubrir tarde que te falta una pieza.",
        ],
        lista: [
          "1 · Requisitos de entrada: mayoría de edad, certificado psicofísico integral vigente y estudios mínimos (verifica los requisitos exactos con la AFAC y tu escuela).",
          "2 · Escuela de aviación autorizada: formación teórica y horas de vuelo con instructor.",
          "3 · Licencia de Piloto Privado (PPA): tu primera licencia — volar sin remuneración.",
          "4 · Horas y experiencia: construir el mínimo de horas que exige la licencia comercial.",
          "5 · Licencia de Piloto Comercial (PCA): incluye aprobar el examen teórico del CIAAC.",
          "6 · Inglés OACI (RTARI): el certificado de competencia lingüística que piden las operaciones internacionales y las aerolíneas.",
          "7 · Selección de aerolínea: exámenes técnicos, pruebas de aptitud tipo COMPASS, entrevistas y simulador.",
        ],
      },
      {
        h2: "¿Cuánto dura la carrera?",
        parrafos: [
          "Depende de tu ritmo de vuelo y de tu constancia teórica más que del calendario de la escuela. Como referencia general, ir de cero a la licencia comercial suele tomar entre dos y cuatro años: los programas intensivos con buen clima de vuelo y alumno de tiempo completo van más rápido; estudiar mientras trabajas, o los meses de mal tiempo, lo alargan.",
          "La parte que más se subestima no es volar: es la teoría. El examen CIAAC concentra 12 materias en una sola aplicación, y quienes lo dejan para el final terminan pagando el retraso en meses. La preparación teórica puede (y conviene) avanzar en paralelo a las horas de vuelo.",
        ],
      },
      {
        h2: "El CIAAC: el filtro teórico que decide tu licencia comercial",
        parrafos: [
          "El Centro Internacional de Adiestramiento de Aviación Civil (CIAAC) de la AFAC aplica el examen teórico de la licencia de Piloto Aviador Comercial: las 12 materias del temario — de aerodinámica a legislación — evaluadas en una sola sesión, con el 80% como estándar de referencia.",
          "La forma probada de prepararlo es a base de práctica medida: responder bancos de preguntas con explicación, simular el formato real completo y atacar las materias débiles con datos en la mano. Leerse los manuales de corrido no entrena ni el ritmo ni la resistencia que exige un examen de cinco horas.",
        ],
      },
      {
        h2: "El inglés no es opcional",
        parrafos: [
          "Para operar donde las comunicaciones son en inglés — y para cualquier aerolínea con rutas internacionales — necesitas el certificado RTARI, que acredita tu competencia lingüística con la escala OACI (mínimo operacional: nivel 4 de 6). La parte decisiva es una entrevista oral en inglés, y se entrena hablando, no subrayando vocabulario.",
          "Empezar el inglés al final es el segundo error clásico de la carrera. Las seis áreas que evalúa la OACI — pronunciación, estructura, vocabulario, fluidez, comprensión e interacción — mejoran con meses de práctica constante, no con un curso exprés.",
        ],
      },
      {
        h2: "La selección de aerolínea: la última puerta tiene varias cerraduras",
        parrafos: [
          "Llegar con licencias e inglés no es el final: los procesos de selección suelen combinar examen técnico (sobre fuentes como el ATP, manuales del fabricante o el temario que publique la convocatoria), pruebas psicométricas y de aptitud —muchas escuelas y aerolíneas usan baterías tipo COMPASS: coordinación, memoria, cálculo mental, multitarea—, entrevista en inglés y evaluación en simulador.",
          "Cada puerta se entrena por separado y ninguna se improvisa. La ventaja real la tiene quien practica las cuatro con método, no quien confía en el talento del día.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué se necesita para empezar la carrera de piloto en México?",
        a: "En términos generales: mayoría de edad, certificado psicofísico integral (la evaluación médica aeronáutica), estudios mínimos y una escuela de aviación autorizada. Los requisitos exactos y vigentes los publica la AFAC y te los confirma la escuela — verifica ahí antes de inscribirte.",
      },
      {
        q: "¿Puedo trabajar mientras estudio para piloto?",
        a: "Muchos lo hacen: la teoría se puede estudiar en horarios flexibles con plataformas en línea, y las horas de vuelo se agendan por bloques. El costo es que la carrera se alarga. La clave es no dejar la preparación teórica del CIAAC para el final: es la parte que mejor se adapta a horarios partidos.",
      },
      {
        q: "¿Qué es más difícil: la parte práctica o la teórica?",
        a: "Son difíciles distinto. Volar exige coordinación y juicio que se construyen con horas; la teoría exige disciplina sostenida: 12 materias en un solo examen (CIAAC) con 80% de referencia. Estadísticamente, el tropiezo más común de los aspirantes está en la teoría mal preparada, porque es la parte que más se pospone.",
      },
      {
        q: "¿Sirve empezar a prepararme antes de entrar a la escuela?",
        a: "Sí, y es de las pocas ventajas gratis: familiarizarte con las materias del CIAAC, entrenar tu inglés hacia el nivel 4 OACI y ejercitar aptitudes básicas (cálculo mental, memoria de trabajo) te hace mejor alumno desde el primer día de escuela. Todo eso se puede empezar hoy desde un navegador.",
      },
    ],
    paginas: [
      { label: "Examen CIAAC: temario y simulador", href: "/ciaac" },
      { label: "Examen RTARI: la entrevista en inglés", href: "/examen-rtari" },
      { label: "Examen COMPASS: aptitudes de piloto", href: "/examen-compass" },
      { label: "Calculadora de horas de estudio", href: "/calculadora-ciaac" },
    ],
  },
  {
    slug: "cuanto-cuesta-ser-piloto-en-mexico",
    titulo: "¿Cuánto cuesta ser piloto en México? Los rubros reales, sin humo",
    gancho:
      "Nadie puede darte una cifra única y honesta a la vez. Lo que sí se puede: desglosar los rubros, explicar por qué varían tanto y enseñarte a cotizar sin sorpresas.",
    categoria: "Carrera",
    publicado: "2026-08-09",
    lecturaMin: 8,
    keywords:
      "cuanto cuesta ser piloto en mexico, cuanto cuesta la carrera de piloto aviador, precio escuela de aviacion, costo licencia piloto comercial, cuanto cuesta el type rating",
    resumen:
      "El costo de ser piloto en México varía enormemente porque depende de las horas de vuelo (el rubro dominante), la escuela y el equipo en que vueles. La carrera completa hasta la licencia comercial se mueve en el orden de cientos de miles a más de un millón de pesos. Más útil que una cifra única: conocer los rubros — escuela y teoría, horas de vuelo, certificado médico, trámites y exámenes, inglés, y después el type rating — y cotizarlos por separado.",
    secciones: [
      {
        h2: "Por qué nadie serio te da una cifra exacta",
        parrafos: [
          "Dos alumnos de la misma escuela pueden gastar cantidades muy distintas: uno vuela constante y termina las horas en el mínimo, otro alarga la carrera y paga renta de aeronave extra; uno vive cerca de la escuela, otro suma traslados; uno aprueba sus exámenes a la primera, otro paga segundos intentos. El costo total es una función de tus decisiones y tu constancia, no un precio de menú.",
          "Cualquier cifra cerrada que veas publicada es marketing o promedio viejo. Lo que no cambia es la estructura del gasto — y esa sí se puede planear.",
        ],
      },
      {
        h2: "Los rubros que componen el costo",
        parrafos: [
          "Cotiza estos rubros por separado con cada escuela que compares — y pide por escrito qué incluye y qué no:",
        ],
        lista: [
          "Horas de vuelo: el rubro dominante, cotizado por hora de aeronave con instructor. Pregunta el precio por hora, las horas mínimas del programa y qué pasa (y cuánto cuesta) si necesitas más.",
          "Colegiatura teórica: la formación de tierra. A veces viene empaquetada con las horas; sepárala al comparar.",
          "Certificado psicofísico integral: la evaluación médica aeronáutica, con vigencias y renovaciones.",
          "Trámites y exámenes: derechos de licencias y evaluaciones ante la autoridad. Los montos vigentes los publica la AFAC.",
          "Inglés aeronáutico: cursos o práctica para llegar al nivel 4 OACI del RTARI — un rubro chico comparado con volar, pero que descarrila carreras cuando se ignora.",
          "Equipo y extras: headset, material de estudio, uniformes, traslados.",
          "Después de la licencia: el type rating (habilitación del avión de línea) puede correr por tu cuenta o absorberlo la aerolínea según el esquema de contratación — pregunta esto en cualquier oferta.",
        ],
      },
      {
        h2: "El gasto invisible: los segundos intentos",
        parrafos: [
          "Hay un rubro que ningún folleto incluye: reprobar. Un examen teórico reprobado cuesta el derecho del nuevo intento, los meses de espera y, con frecuencia, horas de repaso extra. Multiplícalo por lo que vale tu tiempo y la preparación seria deja de parecer un gasto.",
          "Es el argumento económico — no solo académico — para preparar el CIAAC con banco de preguntas, simulacros medidos y evidencia de que llegas arriba del 80% antes de agendar. Prepararte bien es órdenes de magnitud más barato que repetir.",
        ],
      },
      {
        h2: "Cómo comparar escuelas sin que te mareen",
        parrafos: ["Cinco preguntas que separan una cotización seria de una bonita:"],
        lista: [
          "¿El precio por hora incluye instructor, combustible y seguros, o se cobran aparte?",
          "¿Cuántas horas reales promedia un alumno del programa para terminar (no el mínimo teórico)?",
          "¿Qué flota tienen y cuánta disponibilidad real hay para agendar vuelos?",
          "¿Qué pasa con el dinero si suspendes o cambias de escuela a medio programa?",
          "¿Qué apoyo dan para la teoría del CIAAC y para el inglés — o eso corre 100% por tu cuenta?",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cuánto cuesta la carrera de piloto aviador en México?",
        a: "No existe una cifra única honesta: depende de las horas de vuelo que necesites, la escuela y el equipo. El orden de magnitud de la carrera completa hasta la licencia comercial va de cientos de miles a más de un millón de pesos. Cotiza por rubros (horas, teoría, médico, trámites, inglés) y compara escuelas con las mismas preguntas.",
      },
      {
        q: "¿Hay formas de financiar la carrera?",
        a: "Las opciones típicas: pagar por bloques de horas conforme avanzas (lo más común), planes de financiamiento de algunas escuelas, créditos educativos y, en algunos casos, programas de cadetes de aerolíneas que absorben parte de la formación a cambio de compromiso de permanencia. Cada esquema tiene letras chiquitas: pídelas por escrito.",
      },
      {
        q: "¿Qué parte del costo puedo reducir yo?",
        a: "Las horas extra y los segundos intentos — los dos rubros que dependen de tu preparación. Llegar a cada vuelo con la teoría dominada aprovecha mejor cada hora pagada, y llegar al CIAAC con simulacros arriba de 80% evita el costo completo de repetir. La preparación teórica es el rubro más barato de toda la carrera y el que más protege al resto.",
      },
      {
        q: "¿El type rating lo pago yo o la aerolínea?",
        a: "Depende del esquema de contratación: hay aerolíneas que lo absorben (a veces con compromiso de permanencia) y esquemas donde corre por cuenta del piloto. Es una pregunta obligada en cualquier proceso de selección — y otra razón para llegar competitivo: los mejores esquemas se los llevan los mejores candidatos.",
      },
    ],
    paginas: [
      { label: "Calculadora de horas de estudio CIAAC", href: "/calculadora-ciaac" },
      { label: "Cómo ser piloto en México: la ruta completa", href: "/blog/como-ser-piloto-aviador-en-mexico" },
      { label: "Precios de FlightPath", href: "/precios" },
    ],
  },
  {
    slug: "licencias-de-piloto-en-mexico-ppa-pca-tpa",
    titulo: "PPA, PCA y TPA: las licencias de piloto en México, explicadas",
    gancho:
      "Qué permite cada licencia, en qué orden se obtienen y dónde entran el CIAAC y el RTARI en el camino — la foto completa en una lectura.",
    categoria: "Carrera",
    publicado: "2026-08-09",
    lecturaMin: 7,
    keywords:
      "licencias de piloto en mexico, ppa pca tpa diferencias, licencia piloto privado mexico, licencia piloto comercial requisitos, licencia tpi tpa transporte publico ilimitado, que licencia necesito para aerolinea",
    resumen:
      "En México, la carrera de piloto de ala fija escala por tres licencias: la de Piloto Privado (PPA), que permite volar sin remuneración; la de Piloto Aviador Comercial (PCA), que permite trabajar como piloto y cuyo filtro teórico es el examen CIAAC; y la de Transporte Público Ilimitado (TPI/TPA), la licencia de los comandantes de aerolínea. El certificado de radiotelefonista internacional (RTARI) acredita aparte tu inglés aeronáutico. Las reglas y requisitos vigentes los publica la AFAC.",
    secciones: [
      {
        h2: "La escalera de licencias, de un vistazo",
        parrafos: [
          "Cada licencia amplía lo que puedes hacer a los mandos — y cada una exige más horas, más exámenes y más madurez operacional que la anterior:",
        ],
        lista: [
          "PPA — Piloto Privado: volar por gusto o traslado propio, sin remuneración. Es donde se aprenden las bases reales del vuelo.",
          "PCA — Piloto Aviador Comercial: la licencia profesional. Permite cobrar por volar (instrucción, carga, chárter, primeros oficiales según el equipo). Su gran filtro teórico es el examen CIAAC de la AFAC.",
          "TPI/TPA — Transporte Público Ilimitado: la licencia de nivel de comandante de línea aérea, con los requisitos de experiencia más altos.",
          "RTARI — no es una licencia sino un certificado de capacidad: acredita tu competencia lingüística en inglés (escala OACI) para operar radiocomunicaciones internacionales.",
        ],
      },
      {
        h2: "PPA: donde todo empieza",
        parrafos: [
          "La licencia de Piloto Privado te habilita a volar sin remuneración. Aquí construyes las bases: aerodinámica aplicada, navegación real, meteorología que sí decide si vuelas y el criterio que ninguna teoría sustituye. Casi todo el mundo la obtiene en su escuela de aviación como primer escalón del programa comercial.",
        ],
      },
      {
        h2: "PCA: la licencia profesional y su examen",
        parrafos: [
          "La licencia de Piloto Aviador Comercial es la que convierte el vuelo en profesión. Además de las horas y la evaluación práctica, exige aprobar el examen teórico del CIAAC: las 12 materias del temario oficial en una sola aplicación, con 80% como estándar de referencia. Es el examen que más aspirantes frena — no por imposible, sino por mal preparado.",
          "Un error común es pensar la teoría de la PCA como un trámite de última hora. El temario es amplio (aerodinámica, navegación, meteorología, legislación, sistemas…) y la preparación con práctica medida — banco de preguntas, simulacros completos, análisis por materia — es lo que separa un intento de una licencia.",
        ],
      },
      {
        h2: "TPI/TPA: el nivel de comandante",
        parrafos: [
          "La licencia de Transporte Público Ilimitado es el techo regulatorio: la que exigen los mandos de las aeronaves de transporte público de mayor porte. Llega con miles de horas de experiencia y evaluaciones adicionales; para la mayoría de los pilotos es una meta de mediano plazo tras años de línea.",
        ],
      },
      {
        h2: "¿Y el RTARI dónde entra?",
        parrafos: [
          "En paralelo. El RTARI no es parte de la escalera de licencias: es el certificado que acredita tu inglés aeronáutico ante la autoridad, con la escala OACI (mínimo operacional nivel 4 de 6) y renovaciones periódicas según tu nivel. Sin él no hay operaciones internacionales — y las aerolíneas lo dan por sentado en sus procesos. Conviene construirlo durante la carrera, no después.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué diferencia hay entre la licencia PPA y la PCA?",
        a: "La PPA (Piloto Privado) permite volar sin remuneración — es la licencia de formación y vuelo personal. La PCA (Piloto Aviador Comercial) es la licencia profesional: permite cobrar por volar y exige más horas, evaluación práctica de mayor nivel y aprobar el examen teórico del CIAAC.",
      },
      {
        q: "¿Qué licencia necesito para volar en una aerolínea?",
        a: "Para ocupar un puesto de primer oficial, la base es la licencia comercial (PCA) con las habilitaciones y el inglés (RTARI) que pida la convocatoria; los mandos requieren la licencia de Transporte Público Ilimitado. Cada aerolínea publica sus requisitos exactos en sus convocatorias.",
      },
      {
        q: "¿El CIAAC es una licencia?",
        a: "No: el CIAAC es el centro de evaluación de la AFAC, y 'el examen CIAAC' es el examen teórico que se aprueba como requisito de la licencia comercial. La licencia la emite la autoridad cuando completas todos los requisitos — teóricos, prácticos y administrativos.",
      },
      {
        q: "¿Dónde verifico los requisitos oficiales de cada licencia?",
        a: "Con la AFAC (gob.mx/afac) y su normatividad de licencias al personal técnico aeronáutico, y con tu escuela de aviación para el detalle operativo. Desconfía de requisitos circulando en grupos sin fuente: cambian, y el que paga el error eres tú.",
      },
    ],
    paginas: [
      { label: "Examen CIAAC: el filtro teórico de la PCA", href: "/ciaac" },
      { label: "Examen RTARI: tu inglés OACI", href: "/examen-rtari" },
      { label: "Cómo ser piloto en México: la ruta completa", href: "/blog/como-ser-piloto-aviador-en-mexico" },
    ],
  },
  {
    slug: "que-tan-dificil-es-una-prueba-de-aptitud-datos",
    titulo: "¿Qué tan difícil es una prueba de aptitud de piloto? Lo medimos con datos",
    gancho:
      "Construimos un piloto sintético con tiempo de reacción humano y lo pusimos a jugar nuestros ejercicios tipo COMPASS en los 5 niveles. Estos son los números.",
    categoria: "Datos",
    publicado: "2026-08-09",
    lecturaMin: 6,
    keywords:
      "que tan dificil es el examen compass, dificultad prueba de aptitud pilotos, compass test dificultad, tracking compensatorio dificultad, datos aptitud pilotos",
    resumen:
      "Medimos la dificultad de nuestros ejercicios de aptitud tipo COMPASS con un piloto sintético: un controlador con retardo de reacción de 250 ms (reacción humana típica) jugando cada nivel con las mismas reglas deterministas que un usuario. Resultado: en el ejercicio de control biaxial, el error RMS del piloto sintético casi se triplica del nivel 1 al 5 (0.16 → 0.45); en el slalom, su tasa de puertas limpias cae de 88% a 14%; y el viento cruzado, por sí solo, le cuesta ~9 puntos porcentuales de puertas limpias.",
    secciones: [
      {
        h2: "Por qué medimos esto (y cómo)",
        parrafos: [
          "Cuando endurecimos el motor de nuestros ejercicios de aptitud, necesitábamos una respuesta honesta a una pregunta incómoda: ¿'difícil' según quién? Los juicios subjetivos (\"se siente fácil\") no sirven para calibrar cinco niveles de dificultad.",
          "La solución fue un piloto sintético: un controlador proporcional que persigue el error como lo haría una persona, con un retardo de reacción de 250 milisegundos — del orden del tiempo de reacción visual-motor humano. Corre dentro de la misma simulación determinista de paso fijo (120 Hz) que juegan los usuarios, con las mismas semillas. Todo es reproducible: mismas condiciones, mismos números.",
        ],
      },
      {
        h2: "Control biaxial: la inercia cambia el juego",
        parrafos: [
          "En el ejercicio de control compensatorio de dos ejes (mantener un punto centrado contra perturbaciones), el error RMS del piloto sintético por nivel fue: 0.16, 0.18, 0.20, 0.33 y 0.45 — casi el triple del nivel 1 al 5. Sin ningún control, el error libre es 0.72: incluso en el nivel 5, controlar sigue reduciendo el error a la mitad, pero cada nivel te exige más anticipación.",
          "¿De dónde sale el salto de dificultad? No de mover el objetivo más rápido, sino de física: en niveles altos el mando tiene inercia (soltar tarde produce sobrecorrección real) y los ejes se acoplan — corregir uno contamina al otro, como el alabeo induce guiñada. Es la diferencia entre un minijuego y un entrenamiento.",
        ],
      },
      {
        h2: "Slalom: del paseo al vendaval",
        parrafos: [
          "En el slalom (cruzar puertas en un corredor que se acelera), la tasa de puertas limpias del piloto sintético por nivel fue: 88%, 42%, 39%, 17% y 14%. El nivel 1 es exigente pero jugable; el 5 castiga cada reacción tardía.",
          "El experimento más interesante: encender y apagar el viento cruzado en el nivel 3, con todo lo demás idéntico. Solo el viento le costó al piloto sintético unos 9 puntos porcentuales de puertas limpias (35% contra 44%). El viento es lento y no se ve — se siente en la deriva — y obliga exactamente al tipo de corrección continua que las pruebas de aptitud buscan medir.",
        ],
      },
      {
        h2: "Qué significa esto si vas a presentar una prueba de aptitud",
        parrafos: [
          "Primero: la dificultad de estas pruebas es real y no lineal — los niveles altos no son \"lo mismo más rápido\", son otra física. Llegar sin haber hecho nunca tracking compensatorio significa gastar tus primeros intentos reales en aprender la mecánica, no en demostrar tu aptitud.",
          "Segundo: la familiaridad es la parte entrenable. Nuestro piloto sintético no mejora con la práctica — tú sí. Los puntajes de un entrenador son métricas de tu progreso contra tu propia línea base, no un pronóstico del resultado de ninguna selección; pero eliminar la sorpresa del formato es una ventaja que está completamente en tus manos.",
          "Metodología, en corto: controlador proporcional con retardo de 250 ms, simulación determinista de paso fijo a 120 Hz, tres semillas promediadas por nivel, misma física que juegan los usuarios (inercia de mando, acoplamiento cruzado, viento y chicanes en niveles altos). Los ejercicios son originales de FlightPath: entrenan las familias de aptitud de las pruebas tipo COMPASS, sin replicar ningún examen.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué tan difícil es el examen COMPASS?",
        a: "Depende del módulo y del punto de corte de cada institución, pero nuestros datos con un piloto sintético dan una idea del gradiente: entre el nivel más bajo y el más alto de ejercicios equivalentes, el error de control casi se triplica y las puertas limpias del slalom caen de 88% a 14%. La buena noticia: gran parte de esa brecha es familiaridad con la mecánica — y eso se entrena.",
      },
      {
        q: "¿Se puede mejorar en las pruebas de aptitud practicando?",
        a: "El componente de familiaridad, sí: conocer el tracking compensatorio, el ritmo de la multitarea y el formato de cada módulo elimina los puntos que se pierden por sorpresa. El componente de aptitud base es más estable. Ningún entrenamiento honesto puede garantizarte pasar una selección — pero llegar entrenado depende de ti.",
      },
      {
        q: "¿Estos datos son del COMPASS oficial?",
        a: "No: son mediciones de los ejercicios originales de FlightPath, que entrenan las mismas familias de aptitud que evalúan las baterías tipo COMPASS (producto de EPST, con quien no tenemos afiliación). La metodología es reproducible y está descrita en el artículo.",
      },
    ],
    paginas: [
      { label: "Entrena las 6 aptitudes tipo COMPASS", href: "/examen-compass" },
      { label: "Cómo ser piloto en México: la ruta completa", href: "/blog/como-ser-piloto-aviador-en-mexico" },
    ],
  },
];

export function blogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
