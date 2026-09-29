import type { AtpLearningPathDocument, AtpLessonStep } from "./atp-types";
import { ATP_2026_NEW_IDS, ATP_2026_NEW_PATHS } from "./atp-new-paths.2026";
import references from "./atp-references.2026.json";

type Documents = Record<string, AtpLearningPathDocument>;
const link = (label: string, url: string) =>
  `${label} (${url})`;
const official = {
  atp: "https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-G/section-61.167",
  medical: "https://www.faa.gov/ame_guide/app_process/general/validity",
  runway: "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_3.html",
  speed: "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_4.html",
  buffet: "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-107B_CHG_1_FAA.pdf",
  physiology: "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap8_section_1.html",
  adm: "https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/faa-h-8083-25c.pdf",
  medevac: "https://www.faa.gov/air_traffic/publications/atpubs/aip_html/chap4_section_2.html",
  hotspots: "https://www.faa.gov/newsroom/hot-spot-standardized-symbology",
  rvr: "https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-B/section-91.175",
};
const figure = (number: number, alt: string, caption: string) => ({
  file: `atp_2026_asa_figure-${number}-unit.svg`, alt, caption,
});

/** Content-only revision: stable IDs, stage order and existing questions are preserved. */
export function applyAtp2026Updates(original: Documents): Documents {
  const documents: Documents = Object.fromEntries(Object.entries(original).map(([id, doc]) => {
    const ref = references[id as keyof typeof references];
    if (!ref) throw new Error(`Missing ATP 2026 reference: ${id}`);
    return [id, {
      ...doc,
      meta: { ...doc.meta, source_start: ref.start, source_end: ref.end },
      content: { ...doc.content, source: ref.source },
    }];
  }));

  function revise(topic: string, edit: (doc: AtpLearningPathDocument) => AtpLearningPathDocument) {
    const entry = Object.entries(documents).find(([, doc]) => doc.meta.topic_name === topic);
    if (!entry) throw new Error(`Missing ATP topic: ${topic}`);
    documents[entry[0]] = edit(entry[1]);
  }
  function steps(doc: AtpLearningPathDocument, edits: Record<string, (step: AtpLessonStep) => AtpLessonStep>) {
    for (const name of Object.keys(edits)) {
      if (!doc.content.steps.some(step => step.name === name)) throw new Error(`Missing ATP stage: ${name}`);
    }
    return { ...doc, content: { ...doc.content, steps: doc.content.steps.map(step => edits[step.name]?.(step) ?? step) } };
  }
  function addFigure(doc: AtpLearningPathDocument, number: number) {
    const file = `atp_2026_asa_figure-${number}-unit.svg`;
    return { ...doc, figures: { ...doc.figures, [file]: `/learning-paths/atp/2026/${file}` } };
  }
  function cite(doc: AtpLearningPathDocument, citation: string) {
    return { ...doc, content: { ...doc.content, source: `${doc.content.source} · FAA: ${citation}. Verificación: 28 septiembre 2026.` } };
  }

  // A03 + C02: privileges belong with the certificate, not recurrent training.
  revise("The ATP Certificate", doc => cite(steps(doc, {
    "Type ratings": step => ({ ...step, lead: "En Part 121, comprueba certificado ATP, type rating apropiado y requisitos del puesto. Tener ATP no sustituye la habilitación del avión ni elimina las limitaciones del certificado restringido.", cards: [...step.cards,
      { title: "Restricted ATP · El puesto importa", body: "<p>Un ATP con las limitaciones de §61.167(b) puede permitir actuar como SIC en una operación Part 121 cuando se cumplen los requisitos aplicables. No autoriza actuar como PIC Part 121 ni en los casos PIC de §§91.1053(a)(2)(i) y 135.243(a)(1); tampoco como SIC en una operación flag o supplemental Part 121 que requiera tres o más pilotos.</p><p>ATP, type rating y cualificación del operador son comprobaciones distintas. No conviertas experiencia reducida o edad mínima para obtener un certificado restringido en privilegios PIC irrestrictos.</p>" },
    ], explore: [...(step.explore ?? []),
      { title: "Caso · R-ATP como SIC", body: "El piloto tiene ATP restringido y el type rating adecuado. Antes de asignarlo como SIC, comprueba las limitaciones de su certificado, la clase de operación y la cualificación exigida por el operador; no basta con leer ATP." },
      { title: "Caso · Tres pilotos", body: "La operación flag Part 121 requiere tres pilotos. La limitación de §61.167(b) impide usar ese ATP restringido como SIC en ese caso; no se resuelve añadiendo el type rating." },
    ], note: `Referencia: ${link("14 CFR §61.167(b)", official.atp)}.` }),
    "Ejercer los privilegios": step => ({ ...step, cards: step.cards.map(card => card.title === "Ejercer privilegios ATP" ? {
      ...card,
      body: "<p>Para ejercer los privilegios ATP como PIC de un vuelo de air carrier, se requiere first-class medical dentro del plazo aplicable: <strong>6 meses calendario si tenías 40 años o más en la fecha del examen</strong>; <strong>12 si tenías menos de 40</strong>.</p><p>El punto de corte incluye exactamente los 40 años y se determina en el examen. Los meses calendario se cuentan desde el mes de expedición; no son bloques de 30 días. La vigencia para otros privilegios puede ser distinta.</p>",
    } : card), explore: [...(step.explore ?? []),
      { title: "Caso · Exactamente 40", body: "Cumpliste 40 antes del examen de abril. Para estos privilegios PIC, el first-class cumple hasta el último día de octubre: seis meses calendario después del mes del examen." },
      { title: "Caso · Cumpleaños posterior", body: "Tenías 39 en el examen de abril y cumples 40 en mayo. El criterio de ese examen permanece: doce meses calendario para esos privilegios, hasta el último día de abril siguiente." },
    ], note: `Referencia: ${link("FAA · Medical Certificate Validity", official.medical)} y 14 CFR §61.23(d).` }),
  }), "14 CFR §§61.23(d), 61.167(b) y 121.436"));
  revise("Experience and Training Requirements", doc => ({ ...doc, content: {
    ...doc.content,
    excluded: doc.content.excluded.replace("Pregunta 9342-2: privilegios del certificado ATP.", "Privilegios y limitaciones R-ATP, incluido el caso 9342-2, en The ATP Certificate."),
  } }));

  // A04: keep mandatory reporting here and teach voluntary programs separately.
  for (const topic of ["Emergency Equipment and Operations", "National Transportation Safety Board (NTSB)"]) {
    revise(topic, doc => {
      const last = doc.content.steps.at(-1)!;
      return steps(doc, { [last.name]: step => ({ ...step, cards: [...step.cards,
        { title: "Reportar para aprender", body: "<p>Los canales voluntarios VDRP, FOQA, ASAP y ASRS se desarrollan en Safety Reporting Programs. No reemplazan los reportes obligatorios ni sus destinatarios y plazos.</p>" },
      ] }) });
    });
  }
  revise("GPS", doc => steps(doc, {
    "Integridad": step => ({ ...step, cards: [...step.cards,
      { title: "Cuando GNSS deja de ser fiable", body: "<p>Una pérdida de señal o integridad exige verificar la capacidad restante y coordinar con ATC. GNSS Disruption and VOR MON desarrolla el cross-check, la transición a navegación convencional y la selección de un aeropuerto de respaldo.</p>" },
    ] }),
  }));

  // A05: add runway condition interpretation without introducing chapter 4 calculations.
  revise("Landing", doc => {
    const updated = cite(steps(doc, {
      "Spoilers y deceleración": step => ({ ...step,
        cards: [...step.cards.map(card => card.title === "Braking action" ? { ...card,
          body: "<p>Los seis términos son <strong>good, good to medium, medium, medium to poor, poor y nil</strong>. Un reporte de piloto describe la respuesta de frenado; no es una medición universal para cualquier avión.</p>",
        } : card),
          { title: "FICON · Tres tercios", body: "<p>Para una pista pavimentada, el FICON comunica contaminantes y sus medidas; los RwyCC describen cada tercio en el sentido de operación. Lee el orden y la hora de evaluación. Un reporte <strong>3/4/2</strong> no es un promedio: el último tercio presenta el código más bajo del ejemplo.</p><p>Usa esa información con reportes recientes, meteorología, procedimientos y datos aprobados del avión para decidir la aptitud de la pista. Si cambian las condiciones, la evaluación previa puede dejar de representar lo que encontrarás.</p>" },
        ],
        table: { headers: ["RwyCC / referencia RCAM", "Condición o braking action asociado"], rows: [
          ["6", "Dry · pista seca."], ["5", "Good."], ["4", "Good to medium."], ["3", "Medium."],
          ["2", "Medium to poor."], ["1", "Poor."], ["0 · referencia de la matriz", "Nil. No se publica 0 en FICON; la condición NIL exige mitigar mediante cierre de la superficie afectada en los aeropuertos indicados por FAA."],
        ] },
        explore: [...(step.explore ?? []),
          { title: "Caso · 3/4/2", body: "Comprueba la dirección reportada: touchdown, tercio medio y roll-out. El 2 del último tercio importa; no lo ocultes con el 4 del centro ni conviertas los tres códigos en una media." },
          { title: "Caso · Reporte posterior", body: "Un avión informa poor después de una evaluación previa mejor. Solicita información actualizada y reevalúa la pista con los criterios del operador; los reportes corresponden a instantes y experiencias concretos." },
        ],
        note: `RCAM relaciona contaminantes y criterios de evaluación; esta tabla resume sus códigos, no sustituye la matriz completa. ATC no emite RwyCC si los tres tercios son 6. Referencia: ${link("AIM 4-3-8 y 4-3-9 · RCAM", official.runway)}.`,
      }),
    }), "AIM 4-3-8 y 4-3-9; RCAM");
    return { ...updated, content: { ...updated.content,
      excluded: "Cambio a advisory frequency y reportes se asignan a Communications. Wake turbulence en Flight Emergencies and Hazards. No desarrolla cálculos de Performance o Weight & Balance.",
      takeaways: [...updated.content.takeaways, "Interpretar RwyCC y FICON por tercios sin omitir poor ni promediar códigos."],
    } };
  });
  revise("NOTAMs (Notices To AirMen)", doc => {
    const first = doc.content.steps[0];
    return steps(doc, { [first.name]: step => ({ ...step, cards: [...step.cards,
      { title: "FICON y pista disponible", body: "<p>Busca condición de pista, contaminantes, hora y RwyCC por tercios cuando correspondan. Un NOTAM de cierre y un reporte de condición tienen consecuencias distintas. La interpretación de FICON y RCAM se practica en Landing.</p>" },
    ] }) });
  });

  // A06: connect the high-altitude envelope to the existing Mach lesson.
  revise("High Speed Flight", doc => cite(steps(doc, {
    "Altitud y alcance": step => ({ ...step, cards: [...step.cards,
      { title: "Low-speed buffet a gran altitud", body: "<p>A gran altitud, una IAS baja puede coincidir con TAS y Mach elevados. Si sostener lift exige mayor ángulo de ataque, puede aparecer separación y buffet por el límite de baja velocidad, aun sin exceder MMO.</p><p>Mayor peso, altitud o load factor pueden reducir el margen entre los límites de buffet. Un giro o una ráfaga puede consumir margen aunque la velocidad indicada apenas cambie.</p>", dark: true },
      { title: "Dos límites, una envolvente", body: "<p>El buffet de baja velocidad se relaciona con alto ángulo de ataque; el de alta velocidad, con compresibilidad y separación asociada a ondas de choque. Que ambos produzcan vibración no los convierte en el mismo mecanismo.</p><p>Selecciona altitud y velocidad con margen según el AFM y los procedimientos del avión. No uses una cifra genérica como recuperación universal.</p>" },
    ], explore: [...(step.explore ?? []),
      { title: "Caso · Giro en crucero alto", body: "El avión está dentro de VMO/MMO, pero pesado y cerca del límite de su envolvente a esa altitud. Un giro incrementa el load factor y el AOA requerido: seguir por debajo de MMO no garantiza margen de baja velocidad." },
    ], note: `Referencia: ${link("FAA AC 61-107B, Change 1 · buffet limits", official.buffet)}.` }),
  }), "AC 61-107B, Change 1, §§1-4 y 3-2"));

  // A07: retain the existing exercise, qualify its turbojet departure context.
  revise("Speed Adjustments", doc => {
    const updated = cite(steps(doc, {
      "Dos situaciones": step => ({ ...step, lead: "Identifica altitud, tipo de avión y fase. La cifra de 230 kt del ejercicio corresponde a departing turbojet; no a todo avión que despega.",
        table: { headers: ["Situación", "Mínimo recomendado para ajustes ATC"], rows: [
          ["Entre FL280 y 10,000 ft", "250 kt o Mach equivalente."],
          ["Turbojet llegando por debajo de 10,000 ft", "210 kt; dentro de 20 flying miles del aeropuerto: 170 kt."],
          ["Reciprocating o turboprop llegando, dentro de 20 flying miles del umbral", "150 kt."],
          ["Turbojet saliendo", "230 kt."], ["Reciprocating saliendo", "150 kt."],
        ] },
        cards: [...step.cards, { title: "Recomendado no significa absoluto", body: "<p>ATC puede utilizar velocidades menores cuando existe ventaja operacional. Estos valores no son máximos legales de espacio aéreo ni velocidades certificadas del avión. En día estándar, 250 kt CAS equivalen aproximadamente a <strong>Mach 0.64 en FL270</strong>.</p>" }],
        explore: [...(step.explore ?? []), { title: "Caso · Mismo turbojet, otra distancia", body: "Por debajo de 10,000 ft, identifica si la llegada está dentro de 20 flying miles: el mínimo recomendado cambia de 210 a 170 kt. No traslades 230 kt de salida a esa llegada." }],
      }),
      "Fuera de capacidad": step => ({ ...step, cards: [...step.cards,
        { title: "Expresa la limitación", body: "<p>Si no puedes cumplir, informa a ATC y comunica la velocidad utilizable. La asignación no autoriza exceder límites del avión ni elimina los máximos reglamentarios aplicables.</p>" },
      ], note: `Referencia: ${link("AIM 4-4-12 · Speed Adjustments", official.speed)}.` }),
    }), "AIM 4-4-12");
    return { ...updated, content: { ...updated.content, takeaways: ["Seleccionar el mínimo recomendado según altitud, tipo, fase y distancia.", "Relacionar 250 kt CAS con Mach equivalente a gran altitud.", "Comunicar una velocidad utilizable cuando un ajuste excede la capacidad del avión."] } };
  });

  // A08: pressure, judgment and command responsibility belong with physiology/CRM.
  revise("Flight Physiology", doc => cite(steps(doc, {
    "Oxígeno y respiración": step => ({ ...step, cards: [...step.cards,
      { title: "Presión y bloqueo de oído", body: "<p>Durante el descenso aumenta la presión ambiente. Para igualar la presión, el aire necesita entrar al oído medio por la trompa de Eustaquio; congestión o inflamación pueden impedirlo y producir dolor, deterioro de audición y ear block.</p><p>El descenso suele dificultar más esa igualación que el ascenso. Evalúa tu aptitud antes de volar y sigue la orientación médica aeronáutica; la congestión no se resuelve simplemente aumentando el oxígeno.</p>" },
    ], explore: [...(step.explore ?? []), { title: "Caso · Descenso y congestión", body: "Un tripulante con congestión presenta dolor de oído al descender. Relaciona el síntoma con igualación de presión; no lo clasifiques automáticamente como hypoxia porque ocurre durante un cambio de altitud." }],
      note: `${step.note ?? ""} Referencia: ${link("AIM 8-1-2 · Ear block", official.physiology)}.` }),
    "CRM y error management": step => ({ ...step, cards: [...step.cards,
      { title: "El capitán conserva la responsabilidad", body: "<p>Delegar tareas y utilizar el criterio del SIC mejora la capacidad del equipo. El PIC conserva autoridad y responsabilidad por la operación segura: CRM no consiste en transferir esa responsabilidad ni en impedir que otros cuestionen una decisión insegura.</p>" },
    ], explore: [...(step.explore ?? []), { title: "Caso · Objeción útil", body: "El SIC identifica que la pista propuesta no cumple una condición. El capitán escucha, verifica y decide con información completa; invitar a intervenir forma parte del mando efectivo." }] }),
    "Actitudes que reconocer": step => ({ ...step, cards: [...step.cards,
      { title: "Decisión automática y analítica", body: "<p>La experiencia permite reconocer patrones y responder con rapidez a situaciones conocidas. Si el patrón no encaja, cambian las condiciones o falta información, detente a comparar opciones y consecuencias dentro del tiempo disponible.</p><p>Una respuesta familiar puede ser incorrecta en un caso nuevo. La decisión analítica tampoco significa demorar una acción urgente que el procedimiento ya define.</p>" },
      { title: "Probabilidad y severidad", body: "<p>Pregunta qué podría ocurrir, qué tan probable es y qué consecuencias tendría. Una consecuencia muy grave merece barreras aunque parezca poco probable. Tras aplicar una medida, comprueba el riesgo residual y si puedes aceptarlo.</p>" },
    ], explore: [...(step.explore ?? []),
      { title: "Caso · Desvío conocido", body: "Elegir automáticamente el alternate habitual falla si su approach está cerrado. Comprueba condiciones actuales y compara alternativas; la familiaridad aporta rapidez, pero no reemplaza datos." },
      { title: "Caso · Probabilidad baja", body: "La posibilidad de alinearse con otra pista parece pequeña, pero el daño potencial es grave. Un briefing de identificación de pista y un cross-check reducen el riesgo antes del final." },
    ], note: `Referencias: ${link("FAA Pilot’s Handbook of Aeronautical Knowledge · ADM", official.adm)} y 14 CFR §91.3.` }),
  }), "AIM 8-1-2; FAA-H-8083-25C, capítulo ADM; 14 CFR §91.3"));

  // A09 + E02: actual supplement figures, with current symbology taught explicitly.
  revise("Airport Lighting and Marking", doc => cite(addFigure(steps(doc, {
    "Puntos que exigen atención": step => ({ ...step, cards: [...step.cards,
      { title: "Dos riesgos, símbolos diferentes", body: "<p>En la simbología FAA estandarizada, <strong>círculo o elipse</strong> identifica ground movement hot spots; un <strong>cilindro</strong> identifica wrong-surface hot spots. HS y su número remiten a una descripción que debes leer.</p><p>El primero dirige atención a rodaje, cruces y puntos conflictivos. El segundo advierte riesgo de intentar aterrizar o despegar desde una superficie equivocada. Un Arrival Alert Notice puede añadir una vista de la alineación problemática.</p>" },
    ], figure: figure(241, "Figure 241: tabla de hot spots y sus descripciones en aeropuertos de California", "FAA-CT-8080-7D · Figure 241, suplemento de estudio incluido en ASA 2025–2026. La lista es material de examen histórico; consulta cartas vigentes para operar. Su texto previo sobre formas se complementa aquí con la simbología FAA estandarizada."),
      explore: [...(step.explore ?? []),
        { title: "Figure 241 · CRQ", body: "Localiza Carlsbad / Mc Clellan-Palomar, HS 1. La descripción advierte que jets grandes pueden ocultar pequeños aviones a la torre. Un clearance no elimina la necesidad de vigilancia y confirmación del tránsito." },
        { title: "Caso · Cilindro en final", body: "Identifica la superficie autorizada con su designación, orientación y carta. El cilindro advierte riesgo de superficie equivocada; no equivale a una orden de hold short para una intersección." },
      ], note: `Referencia actual: ${link("FAA · Hot Spot Standardized Symbology", official.hotspots)}.` }),
  }), 241), "Hot Spot Standardized Symbology; FAA-CT-8080-7D Figure 241"));

  // C01: flight-plan remarks alone do not request radio priority.
  revise("Items on the Flight Plan", doc => cite(steps(doc, {
    "Anotaciones y permisos": step => ({ ...step, table: { ...step.table!, rows: step.table!.rows.map(row =>
      row[0] === "Emergencia médica que requiere manejo expedito" ? [row[0], "MEDEVAC en Item 11 (Remarks) o Item 18 (Other Information), según formato. Para prioridad ATC, identifica verbalmente MEDEVAC seguido del callsign o matrícula."] : row,
    ) }, cards: [...step.cards,
      { title: "Prioridad donde se necesita", body: "<p>Usa MEDEVAC para la misión de naturaleza médica urgente y solo en el tramo que necesita prioridad. Las anotaciones del plan informan a ATC; para recibir manejo prioritario debes comunicar verbalmente el estado MEDEVAC.</p><p>Ejemplo original: <strong>“MEDEVAC One Two Three Golf”</strong>, si esa es la matrícula del vuelo. El término histórico LIFEGUARD no es la identificación que se enseña para este uso actual.</p>" },
    ], explore: [...(step.explore ?? []), { title: "Caso · Solo remarks", body: "El plan contiene MEDEVAC, pero la primera llamada usa únicamente el callsign habitual. Para solicitar la prioridad correspondiente comunica verbalmente MEDEVAC; escribirlo no sustituye ese paso." }],
      note: `Referencia: ${link("FAA AIP ENR 1.1 · Air Ambulance Flights", official.medevac)}.` }),
  }), "AIP / AIM 4-2-4, Air Ambulance Flights"));

  // E02: a public regulatory table resolves the unavailable RVR supplement table.
  revise("Instrument Approaches", doc => {
    const updated = cite(addFigure(steps(doc, {
      "Weather en final": step => ({ ...step,
        cards: [...step.cards, { title: "RVR no reportado", body: "<p>§91.175(h) permite convertir el mínimo RVR publicado a ground visibility con su tabla cuando RVR no se reporta para la pista prevista. No es una conversión libre para ignorar un RVR reportado; se excluyen mínimos CAT II y CAT III.</p>" }],
        table: { headers: ["RVR · ft", "Ground visibility · statute miles"], rows: [["1,600", "¼"], ["2,400", "½"], ["3,200", "⅝"], ["4,000", "¾"], ["4,500", "⅞"], ["5,000", "1"], ["6,000", "1¼"]] },
        explore: [...(step.explore ?? []), { title: "Caso · 4,000 ft", body: "El mínimo publicado no es CAT II/III y RVR no se reporta: la tabla de §91.175(h) da ¾ statute mile. Aún debes cumplir los demás requisitos de la aproximación y las autorizaciones del operador." }],
        note: `${step.note ?? ""} Referencia: ${link("14 CFR §91.175(h)", official.rvr)}.`,
      }),
      "Vectores y course reversal": step => ({ ...step,
        figure: figure(293, "Figure 293: carta VOR or GPS RWY 13L/13R de JFK con plan view, perfil y mínimos", "FAA-CT-8080-7D · Figure 293, carta de estudio del suplemento ASA 2025–2026. Material histórico para aprender a leer componentes; no utilizar para navegación actual."),
        explore: [...(step.explore ?? []), { title: "Figure 293 · Perfil", body: "Localiza ASALT, CRI y DMYHL en el perfil. Lee las altitudes y notas de cada tramo antes de trasladar una clearance al descenso: interceptar un curso no autoriza por sí solo toda altitud posterior." }],
      }),
    }), 293), "14 CFR §91.175(h); FAA-CT-8080-7D Figure 293");
    return { ...updated, content: { ...updated.content, excluded: "La tabla RVR se enseña conforme a §91.175(h), con sus condiciones y exclusión CAT II/III. Símbolos y lectura integral de cartas se amplían en Charts. Mínimos CAT II dependen de procedimiento, equipo y autorización; no se enseña una cifra RVR universal." } };
  });
  revise("Charts", doc => {
    const updated = cite(addFigure(addFigure(steps(doc, {
      "Cuatro lugares que leer": step => ({ ...step,
        figure: figure(293, "Figure 293: carta VOR or GPS RWY 13L/13R, JFK", "FAA-CT-8080-7D · Figure 293. Carta histórica del suplemento de estudio; los valores de este ejercicio no son datos operacionales actuales."),
        explore: [...(step.explore ?? []),
          { title: "Figure 293 · Título y equipo", body: "Compara VOR or GPS del título con DME or RADAR REQUIRED en plan view. La nota de inoperative LDIN impide el procedimiento cuando no funcionan las lead-in lights. Leer solo el título deja requisitos sin comprobar." },
          { title: "Figure 293 · MAP y runway", body: "En plan view, el MAP se identifica a 3.6 NM CRI para 13L y 2.6 NM para 13R. En el perfil aparece DMYHL a 2.6 DME. Identifica el extremo solicitado antes de copiar una distancia." },
        ],
      }),
      "Datos de aeropuerto": step => ({ ...step,
        figure: figure(241, "Figure 241: descripciones de hot spots por aeropuerto y número HS", "FAA-CT-8080-7D · Figure 241. Lista histórica de estudio; vincula cada HS con su descripción y consulta el diagrama vigente para operar."),
        explore: [...(step.explore ?? []), { title: "Figure 241 · LAX", body: "Busca Los Angeles, HS 1: Taxiway R no visible desde la torre. Vincula el número con el diagrama y prepara vigilancia y confirmación; no supongas que la torre observa todos los movimientos." }],
      }),
    }), 293), 241), "FAA-CT-8080-7D Figures 293 y 241; FAA Hot Spots");
    return { ...updated, content: { ...updated.content, excluded: "Se adjuntan Figures 293 y 241 para lectura aplicada. Las otras cartas citadas se limitan a relaciones y datos explícitos del libro; no se inventan mapas ni frecuencias. GPS overlay y sensibilidad se asignan a GPS; contingencia MON en su recorrido propio." } };
  });
  revise("Wind Shear", doc => {
    const updated = addFigure(steps(doc, {
      "Microburst": step => ({ ...step,
        figure: figure(144, "Figure 144: avión atravesando headwind creciente, downdraft fuerte y tailwind creciente", "FAA-CT-8080-7D · Figure 144, Microburst Section Chart, suplemento ASA 2025–2026. Secuencia conceptual; no representa una trayectoria recomendada."),
        explore: [...(step.explore ?? []),
          { title: "Figure 144 · Entrada", body: "En las posiciones 1–2 aumenta headwind. Una mejora inicial de IAS o lift no significa que el peligro haya pasado." },
          { title: "Figure 144 · Centro y salida", body: "La zona central contiene downdraft; hacia 4–5 aumenta tailwind. Se combina pérdida de componente favorable con flujo descendente: no reduzcas el problema a una sola lectura de IAS." },
        ],
      }),
    }), 144);
    return { ...updated, content: { ...updated.content, source: `${updated.content.source} · FAA-CT-8080-7D Figure 144.`, excluded: "Isotachs y gradientes en cartas se desarrollan en Surface Analysis and Constant Pressure Charts. Figure 144 se utiliza para interpretar la secuencia; respuesta operacional según procedimientos del avión y operador." } };
  });

  // Metadata follows the new taxonomy positions; IDs/URLs remain stable.
  revise("Part 135 Regulations", doc => ({ ...doc, meta: { ...doc.meta, topic_number: 17 } }));
  revise("Airport Lighting and Marking", doc => ({ ...doc, meta: { ...doc.meta, topic_number: 13 } }));
  revise("Approach Lighting", doc => ({ ...doc, meta: { ...doc.meta, topic_number: 14 } }));
  return { ...documents, ...ATP_2026_NEW_PATHS };
}

export { ATP_2026_NEW_IDS };
