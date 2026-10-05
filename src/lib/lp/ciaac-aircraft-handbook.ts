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
      "Aeronave",
      "«Toda máquina que puede sustentarse en la atmósfera por reacciones del aire que no sean las reacciones del mismo contra la superficie de la tierra.»\n\nTener motor no es un requisito: un planeador obtiene sustentación en sus alas al desplazarse respecto del aire. Un globo también es aeronave, aunque se sostenga por flotación y no tenga alas.",
    ),
    card(
      "Tiempo de vuelo y tiempo en el aire",
      "Aeronave nombra a la máquina. Estar en el aire describe una condición física. Tiempo de vuelo es el intervalo que define el manual CIAAC: puede incluir movimiento en tierra. En las siguientes etapas identificamos sus límites y lo distinguimos del tramo entre despegue y aterrizaje.",
    ),
  ];
  const airplane = [
    card(
      "Tiempo de vuelo",
      "«Tiempo total transcurrido desde que la aeronave comienza a moverse por su propia fuerza para despegar, hasta que se detiene al finalizar el vuelo.»",
    ),
    card(
      "Los límites del intervalo",
      "El tiempo empieza con el primer movimiento por su propia fuerza para despegar y termina con la detención definitiva al concluir el vuelo. Un traslado entre hangares para mantenimiento no tiene esa finalidad. Una espera temporal durante el rodaje tampoco equivale a haber terminado la operación.\n\nEl manual llama a este intervalo tiempo «entre calzos». El evento inicial es el movimiento por su propia fuerza para despegar, no simplemente retirar los calzos de un avión que permanece inmóvil.",
    ),
    card(
      "Ejemplo completo",
      "10:00: comienza a rodar por su propia fuerza para despegar. 10:12: despega. 11:00: aterriza. 11:08: se detiene finalmente en plataforma.\n\nEl tiempo de vuelo es de 68 minutos: de 10:00 a 11:08. Estuvo en el aire 48 minutos: de 10:12 a 11:00. Los veinte minutos restantes corresponden a los tramos en tierra.\n\nNota: Empezar a contar en el despegue o terminar al tocar pista dejaría fuera parte del tiempo de vuelo.",
    ),
  ];
  const helicopter = [
    card(
      "El inicio depende del rotor",
      "El tiempo comienza cuando las palas empiezan a girar. Encender sistemas sin giro de palas no cumple ese criterio. Tampoco hay que esperar a que los patines abandonen el suelo.",
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
      "Aprende desde qué momento y hasta cuándo se cuenta el tiempo de vuelo de un avión y de un helicóptero, con el manual CIAAC como fuente principal.",
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
        "El avión comienza a rodar por su propia fuerza para despegar; sus ruedas siguen apoyadas. ¿Ya empezó su tiempo de vuelo según el manual CIAAC?",
        [
          "Sí, con ese movimiento.",
          "No, hasta separarse del suelo.",
          "No, hasta aplicar potencia de despegue.",
        ],
        0,
        "El avión comienza a moverse por su propia fuerza para despegar, como indica el manual CIAAC. No hace falta que las ruedas se hayan separado del suelo.",
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
        "Un avión rueda por su propia fuerza entre hangares para mantenimiento. ¿Basta ese movimiento para iniciar el intervalo estudiado?",
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
        [
          "Primer movimiento del avión por su propia fuerza para despegar.",
          "Inicio del tiempo de vuelo del avión.",
        ],
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
      "Avión: observa el movimiento por su propia fuerza y su propósito de despegar. Helicóptero: observa también las palas. Para registros reales, comprueba la normativa aplicable.",
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
        id: "ciaac-x1-operaciones-aeronauticas",
        title: "SCT / DGAC / CIAAC · X1 Operaciones Aeronáuticas",
        role: "Fuente principal: definiciones de aeronave y tiempo de vuelo.",
        verified_locators: [
          "Aeronave: p. 2-4 (PDF 16)",
          "Tiempo de vuelo: p. 2-8 (PDF 20)",
          "Capítulo fechado en marzo de 1982",
        ],
        limit:
          "Manual de estudio histórico. Para registros reales, comprueba la normativa aplicable.",
      },
      {
        id: "afac-co-av-50-07-r3",
        title: "AFAC · CO AV-50/07 R3 · 2 de mayo de 2023",
        role: "Tiempo de vuelo del helicóptero; referencia 9 de la bibliografía recomendada en la guía del sustentante.",
        verified_locators: [
          "§4.96 · p. 13 de 170 (PDF 13)",
          "Guía del sustentante · p. 42 · referencia 9",
        ],
        limit:
          "Referencia de la edición indicada. Para registros reales, comprueba la normativa aplicable.",
      },
    ],
  };
}
