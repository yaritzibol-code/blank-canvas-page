import type { HandbookLearningPathDocument, HandbookStage } from "./handbook-types";

/** Native Handbook layouts for the remaining four introductory CIAAC lessons.
 * The audited technical cards are retained; repeated assessments and isolated
 * error screens are consolidated into the relevant explanation. */
export function moduleOneHandbook(
  source: HandbookLearningPathDocument,
): HandbookLearningPathDocument {
  const layouts: Record<number, { groups: [string, number[]][]; checks: number[][] }> = {
    2: {
      groups: [
        ["¿Qué puede fluir?", [1, 2]],
        ["Forma y volumen", [3, 4, 9]],
        ["El aire y la viscosidad", [5, 6, 7]],
      ],
      checks: [[2, 3]],
    },
    3: {
      groups: [
        ["Junto a la superficie", [1, 2, 3]],
        ["Orden y mezcla", [4, 5, 11]],
        ["Transición y separación", [6, 7]],
        ["Una superficie limpia", [8, 9]],
      ],
      checks: [
        [2, 3],
        [1, 4],
      ],
    },
    4: {
      groups: [
        ["Presión y movimiento", [1, 2, 3]],
        ["Frenar el flujo", [4, 6, 10]],
        ["La suma y sus condiciones", [5, 7]],
        ["El sistema Pitot-estático", [8]],
      ],
      checks: [
        [4, 6],
        [3, 10],
      ],
    },
    5: {
      groups: [
        ["Masa por volumen", [1, 2]],
        ["Temperatura y presión", [3, 4]],
        ["El vapor de agua", [5, 6]],
        ["El ala y la propulsión", [7, 8]],
        ["La montaña y el avión", [11]],
      ],
      checks: [
        [9, 11],
        [10, 12],
      ],
    },
  };
  const layout = layouts[source.number];
  if (!layout) return source;
  const errorNotes: Record<number, string> = {
    2: "Nota: Fluido no significa solamente líquido. El aire también tiene viscosidad.",
    3: "Nota: Transición no significa separación. Velocidad cero en la pared siempre se refiere a la pared.",
    4: "Nota: Dinámica y total son distintas. Estar detenido sobre tierra no asegura que no haya viento relativo.",
    5: "Nota: No uses una regla de proporcionalidad inversa con altitud o humedad. Para temperatura, indica presión y composición constantes y usa kelvin.",
  };
  const content: HandbookStage[] = layout.groups.map(([title, indexes], group) => ({
    kind: "content",
    nav: title,
    title,
    figures: [],
    visualStage: group,
    cards: indexes.map((index, position) => ({
      ...source.cards[index],
      text:
        source.cards[index].text
          .replace("ρ = p/(R T)", "ρ = p/(R T), con presión absoluta p")
          .replace(/El ejemplo de Yaris ayuda: /g, "")
          .replace(/Yaris propone dos imágenes: /g, "Dos imágenes ayudan: ")
          .replace(/Yaris propone imaginar una pared\./g, "Imagina una pared.") +
        (group === layout.groups.length - 1 && position === indexes.length - 1
          ? `\n\n${errorNotes[source.number]}`
          : ""),
    })),
  }));
  return {
    ...source,
    ciaac: undefined,
    sources: [
      ...(source.number !== 5
        ? [
            {
              id: "ciaac-basica",
              title: "SCT / DGAC / CIAAC · Aerodinámica básica",
              role: "Fuente curricular principal. Bibliografía de la guía, referencia 28.",
              verified_locators: [
                source.number === 2
                  ? "Capítulo 1 · p. 2 (PDF 5)"
                  : source.number === 3
                    ? "Capítulo 1 · pp. 2–3 (PDF 5–6)"
                    : "Capítulo 1 · pp. 3–4 (PDF 6–7)",
              ],
              limit:
                "Texto histórico. Las explicaciones distinguen los modelos ideales de los efectos reales y emplean unidades SI.",
            },
          ]
        : []),
      ...([3, 4].includes(source.number)
        ? [
            {
              id: "ciaac-avanzada",
              title: "SCT / DGAC / CIAAC · Aerodinámica avanzada",
              role: "Referencia curricular complementaria. Bibliografía de la guía, referencia 29.",
              verified_locators: [
                source.number === 3 ? "Capítulo 1 · p. 6 (PDF 12)" : "Capítulo 1 · p. 5 (PDF 11)",
              ],
            },
          ]
        : []),
      {
        id: "phak",
        title: "FAA · Pilot’s Handbook of Aeronautical Knowledge · FAA-H-8083-25C (2023)",
        role:
          source.number === 5
            ? "Fuente técnica principal de densidad y factores atmosféricos. Bibliografía de la guía, referencia 45."
            : "Apoyo técnico. Bibliografía de la guía, referencia 45.",
        verified_locators: [
          source.number === 2
            ? "pp. 4-1–4-2"
            : source.number === 3
              ? "pp. 5-46–5-47"
              : source.number === 4
                ? "pp. 8-1–8-2"
                : "pp. 4-4–4-5",
        ],
      },
      ...([3, 4, 5].includes(source.number)
        ? [
            {
              id: "nasa-supplement",
              title: `NASA Glenn · ${source.number === 3 ? "Boundary Layer" : source.number === 4 ? "Bernoulli’s Equation" : "Equation of State"}`,
              role: "Aclaración técnica complementaria de las condiciones del modelo.",
              url: `https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/${source.number === 3 ? "boundary-layer" : source.number === 4 ? "bernoullis-equation" : "equation-of-state"}/`,
            },
          ]
        : []),
    ],
    cards: [source.cards[0]],
    questions: source.questions.map((q) => ({
      ...q,
      prompt: q.prompt.replaceAll("diagrama imaginado", "diagrama"),
    })),
    tips:
      source.number === 5
        ? [
            "Antes de comparar densidades, pregunta qué permanece igual. Para operar, usa el AFM o POH y las condiciones reales.",
          ]
        : [],
    stages: [
      { kind: "intro", nav: "Despegue" },
      { kind: "quiz", nav: "Antes de explorar", diagnostic: true, questions: [0] },
      ...content,
      { kind: "exercise", nav: "Conecta las ideas" },
      ...layout.checks.map((questions, index): HandbookStage => ({
        kind: "quiz",
        nav: layout.checks.length === 1 ? "Ponlo a prueba" : `Ponlo a prueba ${index + 1}`,
        questions,
      })),
      { kind: "finish", nav: "Aterrizaje" },
    ],
  };
}
