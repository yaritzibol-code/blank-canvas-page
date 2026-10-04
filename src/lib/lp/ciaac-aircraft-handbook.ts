import type {
  HandbookLearningPathDocument,
  HandbookCard,
  HandbookQuestion,
} from "./handbook-types";

const card = (title: string, text: string, wide = false): HandbookCard => ({
  title,
  text,
  wide,
  covers: [],
});
const question = (
  prompt: string,
  options: string[],
  correct: number,
  feedback: string,
): HandbookQuestion => ({
  prompt,
  options,
  correct,
  feedback,
  order: options.map((_, index) => index),
});

/** Approved first-lesson copy, using the same stage contract as the airline Handbook. */
export function aircraftHandbook(
  source: HandbookLearningPathDocument,
): HandbookLearningPathDocument {
  const concept = [
    card(
      "Aeronave: definición formal",
      "«Toda máquina que puede sustentarse en la atmósfera por reacciones del aire que no sean las reacciones de esta contra la superficie de la tierra.»\n\nAFAC · Lista de Definiciones y Acrónimos, 1 de marzo de 2024, p. 1.\n\nTener motor no es un requisito: un planeador obtiene sustentación en sus alas al desplazarse respecto del aire. Un globo también es aeronave, aunque se sostenga por flotación y no tenga alas.",
    ),
    card(
      "Aeronave en vuelo: contexto AVSEC",
      "«Una aeronave, desde el momento en que se cierran todas sus puertas externas después del embarque, hasta el momento en que se abran dichas puertas para el desembarque.»\n\nAFAC · Lista de Definiciones y Acrónimos, 1 de marzo de 2024, p. 1. Esta definición corresponde a seguridad de la aviación civil (AVSEC). No equivale al tiempo de vuelo que calculamos en las siguientes etapas.",
    ),
  ];
  const airplane = [
    card(
      "Los límites del intervalo",
      "El tiempo empieza con el primer movimiento destinado al despegue y termina con la detención definitiva al concluir el vuelo. Un traslado entre hangares para mantenimiento no tiene esa finalidad. Una espera temporal durante el rodaje tampoco equivale a haber terminado la operación.\n\nLa expresión «entre calzos» se utiliza para este intervalo. El evento inicial es el movimiento, no simplemente retirar los calzos de un avión que permanece inmóvil.",
    ),
    card(
      "Ejemplo completo",
      "10:00: comienza a moverse para despegar. 10:12: despega. 11:00: aterriza. 11:08: se detiene finalmente en plataforma.\n\nEl tiempo de vuelo es de 68 minutos: de 10:00 a 11:08. Estuvo en el aire 48 minutos: de 10:12 a 11:00. Los veinte minutos restantes corresponden a los tramos en tierra.\n\nNota: Empezar a contar en el despegue o terminar al tocar pista dejaría fuera parte del tiempo de vuelo.",
    ),
  ];
  const helicopter = [
    card(
      "El inicio depende del rotor",
      "En la operación estudiada, el tiempo comienza cuando las palas empiezan a girar. Encender sistemas sin giro de palas no cumple ese criterio. Tampoco hay que esperar a que los patines abandonen el suelo.",
    ),
    card(
      "Dos condiciones para terminar",
      "A las 09:40 el helicóptero aterriza y queda inmóvil, pero sus palas continúan girando. A las 09:43 las palas se detienen. El intervalo termina a las 09:43: entonces están detenidos tanto el helicóptero como el rotor. Esos tres minutos posteriores al aterrizaje también cuentan.",
    ),
  ];
  return {
    ...source,
    title: "¿Cuándo empieza a contar el vuelo?",
    intro:
      "Aprende desde qué momento y hasta cuándo se cuenta el tiempo de vuelo de un avión y de un helicóptero, según las definiciones OACI estudiadas.",
    cards: [
      card(
        "La misión",
        "Identificar los eventos de inicio y final en una operación completa, incluidos los que suceden en tierra.",
      ),
    ],
    objectives: [
      "Reconocer una aeronave.",
      "Aplicar ambos criterios.",
      "Distinguir tiempo de vuelo y tiempo en el aire.",
    ],
    minutes: 9,
    figures: [],
    questions: [
      question(
        "El avión inicia push-back para despegar; sus ruedas siguen apoyadas. ¿Ya empezó su tiempo de vuelo según la definición OACI estudiada?",
        [
          "Sí, con ese movimiento.",
          "No, hasta separarse del suelo.",
          "No, hasta aplicar potencia de despegue.",
        ],
        0,
        "El movimiento inicia la salida para despegar. No hace falta que las ruedas se hayan separado del suelo.",
      ),
      question(
        "Un planeador sin motor puede ser aeronave.",
        ["Verdadero", "Falso"],
        0,
        "Verdadero: sus alas pueden generar sustentación.",
      ),
      question(
        "Los 48 minutos en el aire del ejemplo son todo su tiempo de vuelo.",
        ["Verdadero", "Falso"],
        1,
        "Falso: el intervalo completo dura 68 minutos.",
      ),
      question(
        "El helicóptero del ejemplo termina su tiempo de vuelo a las 09:40.",
        ["Verdadero", "Falso"],
        1,
        "Falso: a esa hora las palas siguen girando.",
      ),
      question(
        "Un remolcador traslada un avión entre hangares para mantenimiento. ¿Basta ese movimiento para iniciar el intervalo estudiado?",
        ["Sí, cualquier desplazamiento basta.", "No, falta el propósito de despegar."],
        1,
        "El traslado no tiene propósito de despegar.",
      ),
    ],
    exercise: {
      kind: "match",
      title: "Relaciona el evento con su significado",
      instruction: "Conecta las ideas",
      pairs: [
        ["Primer movimiento del avión para despegar.", "Inicio del tiempo de vuelo del avión."],
        ["Detención final del avión en plataforma.", "Final del tiempo de vuelo del avión."],
        [
          "Las palas empiezan a girar para la operación.",
          "Inicio del tiempo de vuelo del helicóptero.",
        ],
        [
          "Helicóptero y palas detenidos al terminar.",
          "Final del tiempo de vuelo del helicóptero.",
        ],
      ],
      order: [2, 0, 3, 1],
    },
    tips: [
      "Avión: observa el movimiento y su propósito. Helicóptero: observa también las palas. Para registros reales, comprueba la normativa aplicable.",
    ],
    completionChecks: [
      "Reconocer una aeronave por cómo se sustenta.",
      "Identificar el inicio y el final en ambos tipos.",
      "Calcular el intervalo sin confundirlo con el tramo en el aire.",
    ],
    stages: [
      { kind: "intro", nav: "Despegue" },
      { kind: "quiz", nav: "Preflight check", diagnostic: true, questions: [0] },
      {
        kind: "content",
        nav: "¿Qué es una aeronave?",
        title: "¿Qué es una aeronave?",
        cards: concept,
        figures: [],
      },
      {
        kind: "content",
        nav: "Avión del movimiento a la detención",
        title: "Avión del movimiento a la detención",
        cards: airplane,
        figures: [],
      },
      {
        kind: "content",
        nav: "Helicóptero del giro al rotor parado",
        title: "Helicóptero del giro al rotor parado",
        cards: helicopter,
        figures: [],
      },
      { kind: "exercise", nav: "Conecta las ideas" },
      { kind: "quiz", nav: "Ponlo a prueba 1", questions: [1, 2, 3] },
      { kind: "quiz", nav: "Ponlo a prueba 2", questions: [4] },
      {
        kind: "content",
        nav: "Cierre rápido",
        title: "Cierre rápido",
        cards: [],
        figures: [],
      },
      { kind: "finish", nav: "Aterrizaje" },
    ],
    ciaac: undefined,
    sources: [
      {
        id: "afac-avsec-definitions-2024",
        title: "AFAC · Lista de Definiciones y Acrónimos · 1 de marzo de 2024",
        role: "Definiciones formales de aeronave y aeronave en vuelo en el contexto AVSEC.",
        url: "https://www.gob.mx/cms/uploads/attachment/file/906219/lista-definiciones-acronimos.pdf",
        verified_locators: ["Página 1 de 11 · revisión Original"],
        limit:
          "La definición AVSEC de aeronave en vuelo no sustituye los criterios de tiempo de vuelo estudiados en esta lección.",
      },
      {
        id: "icao-8984",
        title: "OACI · Manual de medicina aeronáutica civil · Doc 8984, tercera edición",
        role: "Definiciones de tiempo de vuelo de aviones y helicópteros estudiadas.",
        url: "https://www.icao.int/sites/default/files/2024-12/8984_cons_es.pdf",
        verified_locators: ["I-1-18 / I-1-19 (páginas PDF 34 / 35)"],
        limit:
          "Manual orientativo que remite al Anexo 1. Para registros reales, comprueba la normativa aplicable.",
      },
      ...(source.sources?.filter((item) => item.id === "mex-aircraft") ?? []),
    ],
  };
}
