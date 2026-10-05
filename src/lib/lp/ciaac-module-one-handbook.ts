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
  // Boundary-layer pilot: one idea first; the audited explanation remains available.
  const boundarySummaries: Record<number, string> = {
    1: "Mira las flechas: junto a la pared, el aire casi no se mueve respecto de ella. Al alejarse, se aproxima al flujo exterior local. La capa límite es la región donde importa ese efecto viscoso; la velocidad exterior puede variar a lo largo del ala.",
    2: "La viscosidad transmite el efecto de la pared al aire cercano: aparece una variación de velocidad. Ocurre incluso en una superficie lisa; la rugosidad puede adelantar la transición, pero no crea por sí sola la capa límite.",
    3: "Cero significa respecto del ala. Si el avión avanza, el aire pegado a la superficie avanza con ella respecto de la Tierra. No está inmóvil en el espacio.",
    4: "Laminar: capas ordenadas, con poca mezcla transversal. Puede aparecer cerca del borde de ataque si las condiciones lo permiten; no ocurre siempre.",
    5: "Turbulento: fluctuaciones y mezcla entre capas. En condiciones comparables suele generar más fricción, pero puede resistir mejor la separación. Puede seguir adherido; no es lo mismo que turbulencia meteorológica.",
    6: "Transición cambia el régimen de laminar a turbulento, normalmente en una zona. Separación es el desprendimiento del flujo. Una capa turbulenta puede seguir adherida al ala.",
    7: "Compara en condiciones semejantes: la capa turbulenta suele tener más mezcla, fricción y espesor, pero resistir mejor la separación ante presión adversa. Son tendencias, no reglas válidas para cualquier posición o flujo.",
    8: "Suciedad, insectos o hielo pueden adelantar la transición, cambiar la superficie y degradar la aerodinámica. Que el flujo turbulento resista mejor la separación no hace segura un ala contaminada: aplica la inspección y las instrucciones del fabricante.",
    9: "La capa límite conecta viscosidad, superficie y movimiento del aire. Participa en la fricción y la separación: el ala interactúa con el aire, no solo lo corta.",
    11: "Hojas deslizándose ayudan a imaginar orden; humo con remolinos, mezcla. El humo es solo una analogía: también intervienen flotación y ambiente, y no reproduce exactamente la capa límite del ala.",
  };
  const content: HandbookStage[] = layout.groups.map(([title, indexes], group) => ({
    kind: "content",
    nav: title,
    title,
    figures: [],
    visualStage: group,
    cards: indexes.map((index, position) => ({
      ...source.cards[index],
      ...(source.number === 3 ? { detailText: source.cards[index].text } : {}),
      text:
        (source.number === 3 ? boundarySummaries[index] : source.cards[index].text)
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
