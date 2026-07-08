/**
 * Banco de preguntas semilla (contenido inicial editable desde el Panel Admin).
 * Incluye las preguntas originales de la app y un conjunto base por materia.
 * La administradora puede ampliar el banco vía carga CSV o creación manual.
 */

export interface SeedQuestion {
  materia: string; // slug
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  cite: string;
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  // ───────────────────────── Meteorología ─────────────────────────
  {
    materia: "meteorologia",
    text: "¿Cuál de los siguientes grupos en un METAR indica la visibilidad predominante en metros?",
    options: [
      "El grupo de temperatura y punto de rocío",
      "El grupo de 4 dígitos que sigue al viento, expresado en metros",
      "El grupo de presión altimétrica QNH",
    ],
    correctIndex: 1,
    explanation:
      "En un METAR, la visibilidad se expresa en metros con 4 dígitos y aparece justo después del grupo de viento. Por ejemplo: 9999 significa visibilidad de 10 km o más.",
    cite: "Manual de Meteorología CIAAC, Cap. 21, p. 180",
  },
  {
    materia: "meteorologia",
    text: "¿Qué fenómeno atmosférico describe la inversión de temperatura?",
    options: [
      "Un aumento de temperatura con la altitud, contrario a la condición normal",
      "Una disminución brusca de temperatura en superficie",
      "El enfriamiento adiabático del aire ascendente",
    ],
    correctIndex: 0,
    explanation:
      "Normalmente la temperatura disminuye con la altitud. En una inversión ocurre lo contrario: la temperatura aumenta con la altura, lo que puede atrapar contaminantes, causar niebla y afectar la visibilidad.",
    cite: "Meteorología Básica CIAAC, Cap. 1, p. 8",
  },
  {
    materia: "meteorologia",
    text: "¿Cuál de las siguientes nubes pertenece al género de nubes altas?",
    options: ["Cumulonimbus", "Altocumulus", "Cirrostratus"],
    correctIndex: 2,
    explanation:
      "Las nubes altas incluyen Cirrus, Cirrocumulus y Cirrostratus. Se forman entre 6,000 y 12,000 metros y están compuestas principalmente de cristales de hielo. El Altocumulus es una nube media y el Cumulonimbus es de desarrollo vertical.",
    cite: "Meteorología Básica CIAAC, Cap. 10, p. 95",
  },
  {
    materia: "meteorologia",
    text: "¿Qué condición es necesaria para la formación de niebla de radiación?",
    options: [
      "Cielo despejado, viento en calma y alta humedad durante la noche",
      "Viento fuerte y aire seco en altura",
      "Paso de un frente cálido con lluvia continua",
    ],
    correctIndex: 0,
    explanation:
      "La niebla de radiación se forma en noches despejadas con viento en calma o muy débil: el suelo pierde calor por radiación, enfría el aire adyacente hasta el punto de rocío y el vapor se condensa.",
    cite: "Meteorología Básica CIAAC, Cap. 12, p. 118",
  },
  {
    materia: "meteorologia",
    text: "El gradiente térmico vertical estándar en la atmósfera tipo (ISA) es de:",
    options: ["2 °C por cada 1,000 ft", "6.5 °C por cada 1,000 m", "1 °C por cada 500 m"],
    correctIndex: 1,
    explanation:
      "En la atmósfera estándar internacional (ISA), la temperatura disminuye 6.5 °C por cada 1,000 m (aprox. 2 °C por cada 1,000 ft) hasta la tropopausa.",
    cite: "Meteorología Básica CIAAC, Cap. 2, p. 15",
  },
  {
    materia: "meteorologia",
    text: "¿Qué peligro meteorológico está asociado directamente a un Cumulonimbus?",
    options: [
      "Turbulencia severa, granizo y cortante de viento",
      "Únicamente lluvia ligera continua",
      "Mejora de la visibilidad en superficie",
    ],
    correctIndex: 0,
    explanation:
      "El Cumulonimbus es la nube más peligrosa para la aviación: produce turbulencia severa, granizo, engelamiento, cortante de viento (wind shear), microrráfagas y actividad eléctrica. Debe evitarse siempre.",
    cite: "Meteorología Básica CIAAC, Cap. 11, p. 104",
  },

  // ───────────────────────── Aerodinámica ─────────────────────────
  {
    materia: "aerodinamica",
    text: "¿Qué sucede con la sustentación si duplicamos la velocidad del avión, manteniendo todo lo demás constante?",
    options: [
      "La sustentación se duplica",
      "La sustentación se mantiene igual",
      "La sustentación se cuadruplica",
      "La sustentación disminuye a la mitad",
    ],
    correctIndex: 2,
    explanation:
      "La fórmula de sustentación L = ½ρV²SCL muestra que la sustentación es proporcional al cuadrado de la velocidad. Si V se duplica, V² se cuadruplica (2² = 4).",
    cite: "Aerodinámica CIAAC, Cap. 5, p. 48",
  },
  {
    materia: "aerodinamica",
    text: "¿Cuál es el efecto de un ángulo de ataque excesivo en un ala?",
    options: [
      "La resistencia disminuye al máximo",
      "El flujo de aire se separa del ala y se produce entrada en pérdida (stall)",
      "La sustentación aumenta indefinidamente",
    ],
    correctIndex: 1,
    explanation:
      "Al superar el ángulo de ataque crítico (aprox. 15-20°), el flujo se separa del extradós del ala y se produce la entrada en pérdida (stall), con pérdida repentina de sustentación.",
    cite: "Aerodinámica CIAAC, Cap. 8, p. 74",
  },
  {
    materia: "aerodinamica",
    text: "¿Cuál es la fuerza aerodinámica que actúa perpendicularmente a la dirección del movimiento y permite el vuelo?",
    options: ["Resistencia aerodinámica", "Sustentación", "Empuje"],
    correctIndex: 1,
    explanation:
      "La sustentación es la fuerza perpendicular al movimiento que permite volar, generada principalmente por las alas gracias al principio de Bernoulli.",
    cite: "Aerodinámica Básica CIAAC, p. 12",
  },
  {
    materia: "aerodinamica",
    text: "¿Qué describe el principio de Bernoulli en relación con la sustentación?",
    options: [
      "La velocidad aumenta la presión",
      "La presión disminuye al aumentar la velocidad",
      "El flujo laminar genera más resistencia",
    ],
    correctIndex: 1,
    explanation:
      "Bernoulli establece que en un fluido en movimiento, al aumentar la velocidad disminuye la presión. Esto explica la diferencia de presión entre extradós e intradós que genera sustentación.",
    cite: "Aerodinámica Básica CIAAC, p. 18",
  },
  {
    materia: "aerodinamica",
    text: "¿Qué es el ángulo de ataque de un perfil alar?",
    options: [
      "El ángulo entre el eje longitudinal y la horizontal",
      "El ángulo entre la cuerda del ala y el viento relativo",
      "El ángulo de inclinación de la aeronave",
    ],
    correctIndex: 1,
    explanation:
      "El ángulo de ataque es el ángulo formado entre la cuerda del ala y la dirección del viento relativo. Es fundamental para entender la generación de sustentación.",
    cite: "Aerodinámica Básica CIAAC, p. 22",
  },
  {
    materia: "aerodinamica",
    text: "La resistencia inducida de un ala:",
    options: [
      "Aumenta al disminuir la velocidad y aumentar el ángulo de ataque",
      "Aumenta con el cuadrado de la velocidad",
      "Es independiente de la sustentación generada",
    ],
    correctIndex: 0,
    explanation:
      "La resistencia inducida es consecuencia de la generación de sustentación (vórtices de punta de ala). Es mayor a bajas velocidades y altos ángulos de ataque, al contrario que la resistencia parásita.",
    cite: "Aerodinámica CIAAC, Cap. 6, p. 55",
  },

  // ───────────────────────── Aeronaves y Motores ─────────────────────────
  {
    materia: "aeronaves-motores",
    text: "En un motor de pistón de 4 tiempos, el orden correcto de los tiempos es:",
    options: [
      "Admisión, compresión, explosión (potencia), escape",
      "Compresión, admisión, escape, explosión",
      "Admisión, explosión, compresión, escape",
    ],
    correctIndex: 0,
    explanation:
      "El ciclo Otto de 4 tiempos sigue el orden: admisión (entra la mezcla), compresión, explosión o tiempo de potencia (se enciende la mezcla) y escape (salen los gases).",
    cite: "Aeronaves y Motores CIAAC, Cap. 3, p. 31",
  },
  {
    materia: "aeronaves-motores",
    text: "¿Cuál es la función principal del carburador en un motor de aviación?",
    options: [
      "Mezclar aire y combustible en la proporción adecuada",
      "Enfriar el aceite del motor",
      "Aumentar la presión de admisión sobre la atmosférica",
    ],
    correctIndex: 0,
    explanation:
      "El carburador dosifica y mezcla el aire con el combustible en la proporción adecuada (aprox. 15:1 en masa) antes de que la mezcla entre a los cilindros.",
    cite: "Aeronaves y Motores CIAAC, Cap. 4, p. 42",
  },
  {
    materia: "aeronaves-motores",
    text: "El engelamiento de carburador es más probable con:",
    options: [
      "Alta humedad y temperaturas entre -5 °C y +25 °C",
      "Aire completamente seco y temperaturas bajo -30 °C",
      "Potencia máxima en despegue",
    ],
    correctIndex: 0,
    explanation:
      "La vaporización del combustible y la caída de presión en el venturi enfrían el aire hasta 20-30 °C; con humedad alta puede formarse hielo incluso con temperatura exterior templada, especialmente con potencia reducida.",
    cite: "Aeronaves y Motores CIAAC, Cap. 4, p. 47",
  },
  {
    materia: "aeronaves-motores",
    text: "¿Qué instrumento del avión funciona con presión estática únicamente?",
    options: ["El altímetro", "El velocímetro (anemómetro)", "El indicador de actitud"],
    correctIndex: 0,
    explanation:
      "El altímetro y el variómetro funcionan solo con presión estática. El velocímetro usa presión dinámica (pitot) y estática; el indicador de actitud es giroscópico.",
    cite: "Aeronaves y Motores CIAAC, Cap. 7, p. 78",
  },
  {
    materia: "aeronaves-motores",
    text: "La mezcla se empobrece (lean) durante el ascenso porque:",
    options: [
      "La densidad del aire disminuye con la altitud y la mezcla se enriquece demasiado",
      "El combustible se congela en altura",
      "El motor requiere más combustible a mayor altitud",
    ],
    correctIndex: 0,
    explanation:
      "Al subir, la densidad del aire disminuye: entra menos masa de aire pero la misma cantidad de combustible, enriqueciendo la mezcla. Se empobrece manualmente para mantener la proporción correcta.",
    cite: "Aeronaves y Motores CIAAC, Cap. 5, p. 53",
  },
  {
    materia: "aeronaves-motores",
    text: "¿Cuál es el propósito del sistema de encendido dual (dos magnetos) en motores de aviación?",
    options: [
      "Seguridad por redundancia y mejor combustión de la mezcla",
      "Duplicar la potencia del motor",
      "Reducir el consumo de combustible a la mitad",
    ],
    correctIndex: 0,
    explanation:
      "Los dos magnetos y las dos bujías por cilindro dan redundancia (si falla uno, el motor sigue funcionando) y mejoran la combustión al encender la mezcla en dos puntos.",
    cite: "Aeronaves y Motores CIAAC, Cap. 6, p. 64",
  },

  // ───────────────────────── Legislación Aeronáutica ─────────────────────────
  {
    materia: "legislacion",
    text: "En México, la autoridad encargada de regular y vigilar la aviación civil es:",
    options: [
      "La Agencia Federal de Aviación Civil (AFAC)",
      "La Organización de Aviación Civil Internacional (OACI)",
      "La Secretaría de Marina",
    ],
    correctIndex: 0,
    explanation:
      "La AFAC (antes DGAC) es la autoridad aeronáutica mexicana, dependiente de la SICT. La OACI es el organismo internacional que emite normas y métodos recomendados, pero no regula directamente a nivel nacional.",
    cite: "Legislación Aeronáutica CIAAC, Cap. 1, p. 6",
  },
  {
    materia: "legislacion",
    text: "El Convenio de Chicago de 1944 estableció:",
    options: [
      "La creación de la OACI y los principios del transporte aéreo internacional",
      "Las tarifas máximas de los boletos de avión",
      "La obligación de usar el idioma francés en radiotelefonía",
    ],
    correctIndex: 0,
    explanation:
      "El Convenio de Chicago (1944) creó la OACI y sentó las bases de la aviación civil internacional: soberanía del espacio aéreo, anexos técnicos y estándares internacionales.",
    cite: "Legislación Aeronáutica CIAAC, Cap. 2, p. 14",
  },
  {
    materia: "legislacion",
    text: "La Ley de Aviación Civil mexicana regula principalmente:",
    options: [
      "La explotación, uso y aprovechamiento del espacio aéreo nacional",
      "El diseño de aeronaves experimentales extranjeras",
      "Los viajes espaciales comerciales",
    ],
    correctIndex: 0,
    explanation:
      "La Ley de Aviación Civil regula la explotación, el uso y el aprovechamiento del espacio aéreo situado sobre el territorio nacional, respecto de la prestación y desarrollo de los servicios de transporte aéreo civil y de Estado.",
    cite: "Ley de Aviación Civil, Art. 1",
  },
  {
    materia: "legislacion",
    text: "¿Qué documento acredita la aeronavegabilidad de una aeronave?",
    options: [
      "El certificado de aeronavegabilidad vigente",
      "La bitácora del piloto",
      "El plan de vuelo aprobado",
    ],
    correctIndex: 0,
    explanation:
      "El certificado de aeronavegabilidad, expedido por la autoridad aeronáutica, acredita que la aeronave cumple las condiciones técnicas para volar con seguridad. Debe llevarse a bordo junto con el certificado de matrícula.",
    cite: "Legislación Aeronáutica CIAAC, Cap. 5, p. 41",
  },
  {
    materia: "legislacion",
    text: "Las marcas de nacionalidad de las aeronaves mexicanas comienzan con:",
    options: ["XA, XB o XC", "N", "HK"],
    correctIndex: 0,
    explanation:
      "Las aeronaves mexicanas usan XA (servicio público), XB (servicio privado) y XC (aeronaves de Estado). N corresponde a EE. UU. y HK a Colombia.",
    cite: "Legislación Aeronáutica CIAAC, Cap. 6, p. 48",
  },
  {
    materia: "legislacion",
    text: "¿Qué anexo de la OACI trata sobre licencias al personal?",
    options: ["Anexo 1", "Anexo 6", "Anexo 14"],
    correctIndex: 0,
    explanation:
      "El Anexo 1 de la OACI establece las normas sobre licencias al personal aeronáutico. El Anexo 6 trata la operación de aeronaves y el 14, aeródromos.",
    cite: "Legislación Aeronáutica CIAAC, Cap. 3, p. 22",
  },

  // ───────────────────────── Medicina de Aviación ─────────────────────────
  {
    materia: "medicina",
    text: "La hipoxia hipóxica en vuelo se debe principalmente a:",
    options: [
      "La disminución de la presión parcial de oxígeno con la altitud",
      "El exceso de oxígeno en cabina",
      "La deshidratación del piloto",
    ],
    correctIndex: 0,
    explanation:
      "Al aumentar la altitud disminuye la presión parcial de oxígeno, reduciendo su transferencia a la sangre. Por eso se requiere oxígeno suplementario por encima de ciertas altitudes de cabina.",
    cite: "Medicina de Aviación CIAAC, Cap. 2, p. 17",
  },
  {
    materia: "medicina",
    text: "¿Cuál es un síntoma típico de la hiperventilación?",
    options: [
      "Hormigueo en extremidades, mareo y visión borrosa",
      "Aumento de la temperatura corporal",
      "Dolor articular intenso",
    ],
    correctIndex: 0,
    explanation:
      "La hiperventilación elimina demasiado CO₂ de la sangre (alcalosis respiratoria), causando hormigueo, mareo, visión borrosa y hasta espasmos. Se controla respirando lenta y conscientemente.",
    cite: "Medicina de Aviación CIAAC, Cap. 3, p. 25",
  },
  {
    materia: "medicina",
    text: "Las ilusiones somatogravíticas en vuelo se producen por:",
    options: [
      "Aceleraciones que el oído interno interpreta erróneamente como cambios de actitud",
      "El reflejo de la luz solar en los instrumentos",
      "Comer alimentos pesados antes de volar",
    ],
    correctIndex: 0,
    explanation:
      "Una aceleración lineal (p. ej. en despegue) puede sentirse como un cabeceo hacia arriba, induciendo al piloto a bajar la nariz erróneamente. Ante desorientación espacial: confiar en los instrumentos.",
    cite: "Medicina de Aviación CIAAC, Cap. 5, p. 44",
  },
  {
    materia: "medicina",
    text: "¿Cuánto tiempo debe esperarse para volar después de bucear con descompresión?",
    options: ["Al menos 24 horas", "2 horas", "No es necesario esperar"],
    correctIndex: 0,
    explanation:
      "Tras buceo que requirió paradas de descompresión se recomienda esperar al menos 24 horas antes de volar, para evitar la enfermedad por descompresión al reducirse la presión en altura.",
    cite: "Medicina de Aviación CIAAC, Cap. 6, p. 52",
  },
  {
    materia: "medicina",
    text: "La visión nocturna se adapta completamente a la oscuridad en aproximadamente:",
    options: ["30 minutos", "2 minutos", "6 horas"],
    correctIndex: 0,
    explanation:
      "Los bastones de la retina tardan aproximadamente 30 minutos en adaptarse por completo a la oscuridad. Las luces blancas brillantes pueden anular la adaptación en segundos.",
    cite: "Medicina de Aviación CIAAC, Cap. 4, p. 35",
  },
  {
    materia: "medicina",
    text: "El monóxido de carbono es peligroso en cabina porque:",
    options: [
      "Se une a la hemoglobina con mucha mayor afinidad que el oxígeno",
      "Tiene un olor fuerte que distrae al piloto",
      "Congela los instrumentos de vuelo",
    ],
    correctIndex: 0,
    explanation:
      "El CO es inodoro e incoloro y se une a la hemoglobina ~200 veces más fácilmente que el oxígeno, produciendo hipoxia hipémica. Suele provenir de fugas del sistema de calefacción.",
    cite: "Medicina de Aviación CIAAC, Cap. 2, p. 21",
  },

  // ───────────────────────── Navegación Aérea ─────────────────────────
  {
    materia: "navegacion",
    text: "La diferencia entre el rumbo verdadero y el rumbo magnético es:",
    options: ["La variación magnética", "La desviación del compás", "La deriva por viento"],
    correctIndex: 0,
    explanation:
      "La variación (o declinación) magnética es el ángulo entre el norte verdadero y el norte magnético. La desviación es el error del compás causado por campos magnéticos del propio avión.",
    cite: "Navegación Aérea CIAAC, Cap. 3, p. 28",
  },
  {
    materia: "navegacion",
    text: "Un meridiano es:",
    options: [
      "Un semicírculo máximo que une los polos geográficos",
      "Un círculo paralelo al ecuador",
      "La línea que marca el cambio de fecha",
    ],
    correctIndex: 0,
    explanation:
      "Los meridianos son semicírculos máximos que van de polo a polo y miden la longitud (0° a 180° E/W desde Greenwich). Los paralelos miden la latitud.",
    cite: "Navegación Aérea CIAAC, Cap. 1, p. 9",
  },
  {
    materia: "navegacion",
    text: "¿Qué ayuda a la navegación emite radiales que el piloto puede interceptar y seguir?",
    options: ["El VOR", "El transpondedor", "El ELT"],
    correctIndex: 0,
    explanation:
      "El VOR (VHF Omnidirectional Range) emite 360 radiales magnéticos. El piloto selecciona un radial con el OBS y lo intercepta usando el CDI.",
    cite: "Navegación Aérea CIAAC, Cap. 7, p. 63",
  },
  {
    materia: "navegacion",
    text: "Un nudo (knot) equivale a:",
    options: ["Una milla náutica por hora", "Un kilómetro por hora", "Una milla terrestre por hora"],
    correctIndex: 0,
    explanation:
      "1 nudo = 1 milla náutica por hora = 1.852 km/h. La milla náutica (1,852 m) corresponde a un minuto de arco de latitud.",
    cite: "Navegación Aérea CIAAC, Cap. 2, p. 16",
  },
  {
    materia: "navegacion",
    text: "La hora UTC (Zulu) se utiliza en aviación porque:",
    options: [
      "Es una referencia única mundial que evita confusiones entre husos horarios",
      "Es la hora oficial de Estados Unidos",
      "Los relojes de aviación no pueden ajustarse",
    ],
    correctIndex: 0,
    explanation:
      "UTC (Tiempo Universal Coordinado, sufijo Z) es la referencia horaria mundial de la aviación: planes de vuelo, METAR, TAF y NOTAM se expresan en UTC para evitar ambigüedades.",
    cite: "Navegación Aérea CIAAC, Cap. 2, p. 19",
  },
  {
    materia: "navegacion",
    text: "Volando con viento cruzado de la izquierda sin corregir, la aeronave:",
    options: [
      "Derivará hacia la derecha de la ruta deseada",
      "Derivará hacia la izquierda de la ruta deseada",
      "Mantendrá la ruta pero perderá velocidad",
    ],
    correctIndex: 0,
    explanation:
      "El viento empuja la aeronave en la dirección hacia la que sopla: un viento de la izquierda desplaza el avión hacia la derecha. Se corrige apuntando la nariz hacia el viento (ángulo de corrección de deriva).",
    cite: "Navegación Aérea CIAAC, Cap. 4, p. 37",
  },

  // ───────────────────────── Servicios de Tránsito Aéreo ─────────────────────────
  {
    materia: "servicios-transito",
    text: "El objetivo principal de los servicios de tránsito aéreo es:",
    options: [
      "Prevenir colisiones y mantener un flujo de tránsito ordenado y expedito",
      "Cobrar tarifas de aterrizaje",
      "Establecer los precios del combustible",
    ],
    correctIndex: 0,
    explanation:
      "Los ATS buscan prevenir colisiones entre aeronaves (y con obstáculos en el área de maniobras), acelerar y mantener ordenado el tránsito, y proporcionar asesoramiento e información para vuelos seguros.",
    cite: "Servicios de Tránsito Aéreo CIAAC, Cap. 1, p. 7",
  },
  {
    materia: "servicios-transito",
    text: "¿En qué clase de espacio aéreo se proporciona separación a todos los vuelos (IFR y VFR)?",
    options: ["Clase B", "Clase E", "Clase G"],
    correctIndex: 0,
    explanation:
      "En el espacio aéreo Clase B se separan todas las aeronaves entre sí, IFR y VFR. En clase E solo se separa IFR de IFR; la clase G es espacio no controlado.",
    cite: "Servicios de Tránsito Aéreo CIAAC, Cap. 3, p. 24",
  },
  {
    materia: "servicios-transito",
    text: "Una autorización (clearance) del control de tránsito aéreo:",
    options: [
      "Autoriza a proceder bajo condiciones especificadas y debe colacionarse",
      "Es solo una sugerencia opcional para el piloto",
      "Exime al piloto de la responsabilidad de evitar colisiones en VMC",
    ],
    correctIndex: 0,
    explanation:
      "La autorización ATC permite proceder bajo las condiciones especificadas. Los elementos críticos (pista, nivel, etc.) deben colacionarse. No exime al piloto de 'ver y evitar' en condiciones visuales.",
    cite: "Servicios de Tránsito Aéreo CIAAC, Cap. 4, p. 33",
  },
  {
    materia: "servicios-transito",
    text: "El servicio de información de vuelo (FIS) proporciona:",
    options: [
      "Información útil para la realización segura y eficaz de los vuelos",
      "Separación radar entre todas las aeronaves",
      "Mantenimiento de aeronaves en tierra",
    ],
    correctIndex: 0,
    explanation:
      "El FIS brinda información meteorológica, de aeródromos, NOTAM y de tránsito conocida, pero no proporciona separación: esa es función del servicio de control.",
    cite: "Servicios de Tránsito Aéreo CIAAC, Cap. 2, p. 15",
  },
  {
    materia: "servicios-transito",
    text: "La torre de control de aeródromo (TWR) es responsable del tránsito:",
    options: [
      "En el circuito de tránsito y en el área de maniobras del aeródromo",
      "En ruta a nivel de crucero",
      "Únicamente en plataformas de estacionamiento",
    ],
    correctIndex: 0,
    explanation:
      "La TWR controla el tránsito del aeródromo: despegues, aterrizajes, circuito de tránsito y área de maniobras. El control de área (ACC) maneja el tránsito en ruta.",
    cite: "Servicios de Tránsito Aéreo CIAAC, Cap. 5, p. 41",
  },
  {
    materia: "servicios-transito",
    text: "¿Qué código de transpondedor indica una emergencia general?",
    options: ["7700", "7500", "1200"],
    correctIndex: 0,
    explanation:
      "7700 = emergencia general, 7600 = falla de comunicaciones, 7500 = interferencia ilícita. 1200 es el código VFR estándar en varios países.",
    cite: "Servicios de Tránsito Aéreo CIAAC, Cap. 6, p. 49",
  },

  // ───────────────────────── Comunicaciones Aeronáuticas ─────────────────────────
  {
    materia: "comunicaciones",
    text: "En el alfabeto fonético OACI, la letra 'M' se transmite como:",
    options: ["Mike", "Mama", "México"],
    correctIndex: 0,
    explanation:
      "El alfabeto fonético OACI asigna 'Mike' a la M. Se usa para deletrear con claridad en radiotelefonía: Alfa, Bravo, Charlie… Mike… Zulu.",
    cite: "Comunicaciones Aeronáuticas CIAAC, Cap. 2, p. 13",
  },
  {
    materia: "comunicaciones",
    text: "La palabra 'MAYDAY' repetida tres veces indica:",
    options: [
      "Una situación de socorro con peligro grave e inminente",
      "Una situación de urgencia sin peligro inmediato",
      "Una prueba de radio",
    ],
    correctIndex: 0,
    explanation:
      "MAYDAY ×3 declara socorro: peligro grave e inminente que requiere auxilio inmediato. PAN PAN ×3 declara urgencia (situación seria sin peligro inmediato).",
    cite: "Comunicaciones Aeronáuticas CIAAC, Cap. 5, p. 38",
  },
  {
    materia: "comunicaciones",
    text: "¿Qué banda de frecuencias usa la comunicación VHF aeronáutica?",
    options: ["118.000 a 136.975 MHz", "88 a 108 MHz", "3 a 30 kHz"],
    correctIndex: 0,
    explanation:
      "La banda aeronáutica VHF de comunicaciones va de 118.000 a 136.975 MHz. La banda de 108 a 117.975 MHz se reserva para radioayudas (VOR/ILS).",
    cite: "Comunicaciones Aeronáuticas CIAAC, Cap. 3, p. 21",
  },
  {
    materia: "comunicaciones",
    text: "'WILCO' en radiotelefonía significa:",
    options: [
      "He entendido su mensaje y lo cumpliré",
      "Repita su último mensaje",
      "Espere en la frecuencia",
    ],
    correctIndex: 0,
    explanation:
      "WILCO (will comply) = entendido y lo cumpliré. 'SAY AGAIN' = repita; 'STAND BY' = espere. 'ROGER' solo significa 'recibí su transmisión', no implica cumplimiento.",
    cite: "Comunicaciones Aeronáuticas CIAAC, Cap. 4, p. 29",
  },
  {
    materia: "comunicaciones",
    text: "Ante falla de comunicaciones en VMC, el piloto debe:",
    options: [
      "Continuar en VMC, aterrizar en el aeródromo apropiado más cercano y notificar",
      "Ascender inmediatamente al nivel máximo",
      "Apagar el transpondedor",
    ],
    correctIndex: 0,
    explanation:
      "Con falla de comunicaciones en condiciones visuales, se continúa en VMC y se aterriza en el aeródromo adecuado más próximo. Se selecciona 7600 en el transpondedor y se notifica al ATS lo antes posible.",
    cite: "Comunicaciones Aeronáuticas CIAAC, Cap. 6, p. 44",
  },
  {
    materia: "comunicaciones",
    text: "Los números en radiotelefonía se transmiten:",
    options: [
      "Dígito por dígito, ej. 'uno dos tres' para 123",
      "Como cifra completa, ej. 'ciento veintitrés'",
      "Siempre en inglés aunque la comunicación sea en español",
    ],
    correctIndex: 0,
    explanation:
      "Para evitar errores, los números se transmiten dígito por dígito (con excepciones como centenas/millares enteros en algunos casos: 'dos mil quinientos').",
    cite: "Comunicaciones Aeronáuticas CIAAC, Cap. 2, p. 16",
  },

  // ───────────────────────── Manuales de Información Aeronáutica ─────────────────────────
  {
    materia: "manuales-ais",
    text: "La Publicación de Información Aeronáutica (AIP o PIA) contiene:",
    options: [
      "Información aeronáutica esencial de carácter duradero para la navegación",
      "Únicamente pronósticos meteorológicos",
      "Los manuales de mantenimiento de cada aeronave",
    ],
    correctIndex: 0,
    explanation:
      "La AIP/PIA es la publicación oficial del Estado con información aeronáutica de carácter duradero: aeródromos, rutas, espacios aéreos, procedimientos y reglamentación (secciones GEN, ENR y AD).",
    cite: "Manuales AIS CIAAC, Cap. 1, p. 8",
  },
  {
    materia: "manuales-ais",
    text: "Un NOTAM es:",
    options: [
      "Un aviso con información esencial y temporal para el personal de operaciones de vuelo",
      "Un permiso permanente de sobrevuelo",
      "Un tipo de carta de navegación",
    ],
    correctIndex: 0,
    explanation:
      "El NOTAM (Notice to Airmen) difunde información esencial y de carácter temporal o urgente: cierres de pista, radioayudas fuera de servicio, obstáculos, etc. Debe consultarse antes de cada vuelo.",
    cite: "Manuales AIS CIAAC, Cap. 2, p. 15",
  },
  {
    materia: "manuales-ais",
    text: "El sistema AIRAC establece:",
    options: [
      "Fechas comunes de entrada en vigor de cambios aeronáuticos importantes (cada 28 días)",
      "El horario de operación de las torres de control",
      "Los precios de las cartas aeronáuticas",
    ],
    correctIndex: 0,
    explanation:
      "AIRAC (Aeronautical Information Regulation and Control) fija un ciclo de 28 días con fechas efectivas comunes a nivel mundial para cambios significativos, dando tiempo a actualizar cartas y bases de datos.",
    cite: "Manuales AIS CIAAC, Cap. 3, p. 22",
  },
  {
    materia: "manuales-ais",
    text: "La sección 'AD' de la AIP contiene información sobre:",
    options: ["Aeródromos", "Rutas en vuelo", "Generalidades y reglamentos"],
    correctIndex: 0,
    explanation:
      "La AIP se divide en GEN (generalidades), ENR (en ruta) y AD (aeródromos: pistas, ayudas, procedimientos locales, cartas de aeródromo).",
    cite: "Manuales AIS CIAAC, Cap. 1, p. 11",
  },
  {
    materia: "manuales-ais",
    text: "¿Qué documento complementa a la AIP con cambios de larga duración mediante hojas sustituibles?",
    options: ["Las enmiendas AIP (AIP Amendment)", "El METAR", "El plan de vuelo"],
    correctIndex: 0,
    explanation:
      "Las enmiendas AIP incorporan cambios permanentes; los suplementos AIP publican cambios temporales de larga duración; las circulares AIC difunden información explicativa o administrativa.",
    cite: "Manuales AIS CIAAC, Cap. 2, p. 18",
  },
  {
    materia: "manuales-ais",
    text: "Antes de un vuelo, el piloto está obligado a familiarizarse con:",
    options: [
      "Toda la información disponible pertinente al vuelo (NOTAM, meteorología, AIP)",
      "Únicamente el pronóstico del aeródromo de salida",
      "Solo las cartas de aproximación del destino",
    ],
    correctIndex: 0,
    explanation:
      "La reglamentación exige que el piloto al mando se familiarice con toda la información disponible apropiada al vuelo previsto: NOTAM vigentes, información meteorológica, AIP, combustible y alternativas.",
    cite: "Manuales AIS CIAAC, Cap. 4, p. 30",
  },

  // ───────────────────────── Factores Humanos ─────────────────────────
  {
    materia: "factores-humanos",
    text: "El modelo SHELL en factores humanos representa:",
    options: [
      "La interacción del ser humano con software, hardware, entorno y otras personas",
      "Las cinco fases del vuelo",
      "Un tipo de chaleco salvavidas",
    ],
    correctIndex: 0,
    explanation:
      "SHELL: Software (procedimientos), Hardware (máquinas), Environment (entorno), Liveware (la persona) y Liveware (los demás). El elemento central es el ser humano y sus interfaces.",
    cite: "Factores Humanos CIAAC, Cap. 1, p. 9",
  },
  {
    materia: "factores-humanos",
    text: "La conciencia situacional se define como:",
    options: [
      "La percepción y comprensión precisa de lo que ocurre alrededor y su proyección futura",
      "La habilidad de volar sin instrumentos",
      "El conocimiento de memoria de todos los manuales",
    ],
    correctIndex: 0,
    explanation:
      "La conciencia situacional implica percibir los elementos del entorno, comprender su significado y proyectar su estado futuro. Perderla es factor común en incidentes y accidentes.",
    cite: "Factores Humanos CIAAC, Cap. 3, p. 24",
  },
  {
    materia: "factores-humanos",
    text: "¿Qué es el CRM (Crew Resource Management)?",
    options: [
      "El uso efectivo de todos los recursos disponibles para lograr operaciones seguras",
      "Un sistema de radar meteorológico",
      "El manual de reparaciones del avión",
    ],
    correctIndex: 0,
    explanation:
      "El CRM es la gestión de recursos de la tripulación: comunicación, liderazgo, toma de decisiones y trabajo en equipo para operar con seguridad y eficiencia.",
    cite: "Factores Humanos CIAAC, Cap. 4, p. 33",
  },
  {
    materia: "factores-humanos",
    text: "La fatiga en el piloto:",
    options: [
      "Degrada el juicio, la memoria y el tiempo de reacción",
      "Solo afecta después de 24 horas sin dormir",
      "Se elimina completamente con cafeína",
    ],
    correctIndex: 0,
    explanation:
      "La fatiga reduce la atención, el juicio, la memoria de corto plazo y aumenta el tiempo de reacción. La única solución real es el descanso adecuado; los estimulantes solo la enmascaran.",
    cite: "Factores Humanos CIAAC, Cap. 5, p. 41",
  },
  {
    materia: "factores-humanos",
    text: "Una actitud peligrosa tipo 'invulnerabilidad' se contrarresta pensando:",
    options: [
      "'Esto también me puede pasar a mí'",
      "'Las reglas son para otros'",
      "'Debo demostrar que puedo hacerlo'",
    ],
    correctIndex: 0,
    explanation:
      "Las 5 actitudes peligrosas (antiautoridad, impulsividad, invulnerabilidad, machismo y resignación) tienen antídotos. Para invulnerabilidad: 'esto podría pasarme a mí'.",
    cite: "Factores Humanos CIAAC, Cap. 6, p. 48",
  },
  {
    materia: "factores-humanos",
    text: "El estrés agudo en cabina puede provocar:",
    options: [
      "Visión de túnel y fijación en un solo problema",
      "Mejora automática del desempeño en todas las tareas",
      "Inmunidad a la fatiga",
    ],
    correctIndex: 0,
    explanation:
      "Bajo estrés agudo la atención se estrecha (visión de túnel) y el piloto puede fijarse en un solo estímulo, descuidando el resto del vuelo. Se gestiona con priorización: aviate, navigate, communicate.",
    cite: "Factores Humanos CIAAC, Cap. 5, p. 44",
  },

  // ───────────────────────── Seguridad Aérea ─────────────────────────
  {
    materia: "seguridad-aerea",
    text: "El SMS (Safety Management System) es:",
    options: [
      "Un enfoque sistemático para gestionar la seguridad operacional, con políticas y procedimientos",
      "Un servicio de mensajes de texto del ATC",
      "Un sistema de detección de metales",
    ],
    correctIndex: 0,
    explanation:
      "El SMS es el enfoque sistemático de gestión de la seguridad operacional: política y objetivos, gestión de riesgos, aseguramiento y promoción de la seguridad.",
    cite: "Seguridad Aérea CIAAC, Cap. 1, p. 8",
  },
  {
    materia: "seguridad-aerea",
    text: "En el modelo del 'queso suizo' de Reason, los accidentes ocurren cuando:",
    options: [
      "Las fallas de varias capas de defensa se alinean",
      "Una sola persona comete un error",
      "El clima es adverso",
    ],
    correctIndex: 0,
    explanation:
      "El modelo de Reason explica que los accidentes resultan de la alineación de agujeros (fallas latentes y activas) en múltiples capas de defensa del sistema, no de un error aislado.",
    cite: "Seguridad Aérea CIAAC, Cap. 2, p. 16",
  },
  {
    materia: "seguridad-aerea",
    text: "La diferencia entre 'safety' y 'security' en aviación es:",
    options: [
      "Safety = seguridad operacional; Security = protección contra actos de interferencia ilícita",
      "Son sinónimos exactos",
      "Security aplica solo a aviones de carga",
    ],
    correctIndex: 0,
    explanation:
      "Safety (seguridad operacional) gestiona riesgos técnicos y humanos de la operación. Security (seguridad de la aviación) protege contra actos ilícitos: sabotaje, secuestro, intrusiones.",
    cite: "Seguridad Aérea CIAAC, Cap. 1, p. 11",
  },
  {
    materia: "seguridad-aerea",
    text: "Un 'incidente' se diferencia de un 'accidente' en que:",
    options: [
      "No hay lesiones graves ni daños importantes, pero afecta o podría afectar la seguridad",
      "Ocurre solamente en tierra",
      "Siempre involucra a dos aeronaves",
    ],
    correctIndex: 0,
    explanation:
      "El accidente implica lesiones graves/mortales o daños estructurales importantes. El incidente es un suceso que afecta o podría afectar la seguridad sin llegar a accidente. Los incidentes graves se investigan igual.",
    cite: "Seguridad Aérea CIAAC, Cap. 3, p. 23",
  },
  {
    materia: "seguridad-aerea",
    text: "La cultura justa (just culture) promueve:",
    options: [
      "Reportar errores sin temor a castigo, distinguiendo el error honesto de la negligencia",
      "Sancionar todo error humano sin excepción",
      "Ocultar los incidentes menores",
    ],
    correctIndex: 0,
    explanation:
      "La cultura justa fomenta el reporte voluntario de errores y peligros sin represalias por errores honestos, aunque sí distingue y sanciona la negligencia grave o violaciones intencionales.",
    cite: "Seguridad Aérea CIAAC, Cap. 4, p. 31",
  },
  {
    materia: "seguridad-aerea",
    text: "El propósito principal de la investigación de accidentes según el Anexo 13 es:",
    options: [
      "Prevenir futuros accidentes, no atribuir culpa o responsabilidad",
      "Determinar responsables para sancionarlos",
      "Calcular indemnizaciones para aseguradoras",
    ],
    correctIndex: 0,
    explanation:
      "El Anexo 13 de la OACI establece que el único objetivo de la investigación de accidentes e incidentes es la prevención; no busca determinar culpas ni responsabilidades.",
    cite: "Seguridad Aérea CIAAC, Cap. 3, p. 27",
  },

  // ───────────────────────── Operaciones Aeronáuticas ─────────────────────────
  {
    materia: "operaciones",
    text: "La velocidad V1 en un despegue es:",
    options: [
      "La velocidad de decisión: por encima de ella el despegue debe continuarse",
      "La velocidad de rotación",
      "La velocidad máxima de operación",
    ],
    correctIndex: 0,
    explanation:
      "V1 es la velocidad de decisión: antes de V1 se puede abortar el despegue; después de V1, el despegue debe continuar aun con falla de motor. VR es la rotación y V2 la velocidad segura de despegue.",
    cite: "Operaciones Aeronáuticas CIAAC, Cap. 4, p. 35",
  },
  {
    materia: "operaciones",
    text: "El peso máximo de despegue (MTOW) de una aeronave:",
    options: [
      "No debe excederse nunca, pues compromete el rendimiento y la estructura",
      "Puede excederse hasta 10% con autorización del ATC",
      "Solo aplica a vuelos internacionales",
    ],
    correctIndex: 0,
    explanation:
      "El MTOW es una limitación estructural y de rendimiento certificada. Excederlo degrada el despegue, el ascenso y la integridad estructural, y viola las limitaciones del manual de vuelo.",
    cite: "Operaciones Aeronáuticas CIAAC, Cap. 2, p. 18",
  },
  {
    materia: "operaciones",
    text: "Un centro de gravedad (CG) demasiado atrasado provoca:",
    options: [
      "Inestabilidad longitudinal y dificultad para recuperarse de una pérdida",
      "Mayor estabilidad y mejor control",
      "Solo un mayor consumo de combustible",
    ],
    correctIndex: 0,
    explanation:
      "Con CG atrás del límite, el avión se vuelve longitudinalmente inestable, el mando se siente muy sensible y la recuperación de pérdida o barrena puede ser imposible.",
    cite: "Operaciones Aeronáuticas CIAAC, Cap. 3, p. 27",
  },
  {
    materia: "operaciones",
    text: "La altitud de densidad alta (aeropuerto caliente y alto) afecta al despegue porque:",
    options: [
      "Aumenta la carrera de despegue y reduce el régimen de ascenso",
      "Mejora el rendimiento del motor",
      "Reduce la distancia de despegue necesaria",
    ],
    correctIndex: 0,
    explanation:
      "A mayor altitud de densidad, menor densidad del aire: menos sustentación, menos potencia y menos empuje. La carrera de despegue se alarga y el ascenso se degrada.",
    cite: "Operaciones Aeronáuticas CIAAC, Cap. 5, p. 43",
  },
  {
    materia: "operaciones",
    text: "El combustible mínimo de reserva para un vuelo VFR diurno es típicamente:",
    options: [
      "El necesario para volar 30 minutos adicionales a velocidad de crucero",
      "El necesario para 5 minutos de vuelo",
      "No se requiere reserva en VFR",
    ],
    correctIndex: 0,
    explanation:
      "En VFR diurno se exige combustible hasta el destino más una reserva típica de 30 minutos a crucero (45 minutos en nocturno, según reglamentación aplicable).",
    cite: "Operaciones Aeronáuticas CIAAC, Cap. 6, p. 51",
  },
  {
    materia: "operaciones",
    text: "Las listas de verificación (checklists) deben usarse:",
    options: [
      "En todas las fases del vuelo, de forma disciplinada",
      "Solo cuando hay una emergencia",
      "Solo durante el examen de licencia",
    ],
    correctIndex: 0,
    explanation:
      "El uso disciplinado de checklists en todas las fases (prevuelo, arranque, despegue, crucero, aproximación, aterrizaje y emergencias) es una barrera fundamental contra errores de omisión.",
    cite: "Operaciones Aeronáuticas CIAAC, Cap. 1, p. 9",
  },
];
