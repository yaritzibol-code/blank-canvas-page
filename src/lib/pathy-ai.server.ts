/**
 * Prompt y utilidades del informe de Pathy. Vive aparte del archivo de
 * `createServerFn` porque los módulos con server functions se transforman y
 * pierden sus hermanos de módulo.
 */

export interface PathyErrorItem {
  materia?: string;
  fuente?: string;
  capitulo?: number;
  capituloTitulo?: string;
  pregunta: string;
  eligio: string;
  correcta: string;
}

export interface PathySpotItem {
  label: string;
  pct: number;
  correct: number;
  total: number;
  muestraCorta: boolean;
}

export const PATHY_SYSTEM = [
  "Eres Pathy, la copiloto de estudio de FlightPath. Analizas el desempeño de una",
  "aspirante mexicana a piloto de línea aérea y le devuelves un informe breve, cálido y accionable en español mexicano.",
  "",
  "Reglas obligatorias:",
  "- Nunca inventes cifras. Los porcentajes válidos son sólo los que te doy en 'Marcador real'.",
  "- Diagnostica el PATRÓN detrás de los errores (qué concepto se está confundiendo), no repitas el porcentaje.",
  "- Sé específica: 'confundes la componente de viento cruzado con la de frente' es útil; 'repasa Meteorología' no lo es.",
  "- Si la muestra viene marcada como corta, dilo con prudencia en vez de sentenciar.",
  "- No transcribas los reactivos ni des las respuestas del banco tal cual: habla de conceptos.",
  "",
  "Responde SOLO con un objeto JSON válido, sin markdown ni texto extra, con esta forma:",
  '{"diagnostico":"una o dos frases","confusiones":["...","..."],"acciones":["...","...","..."]}',
  "confusiones: entre 2 y 4. acciones: exactamente 3, concretas y en imperativo amable.",
].join("\n");

/** Arma el mensaje del usuario con el marcador real y los errores. */
export function buildPathyUserMessage(input: {
  titulo: string;
  origen: string;
  scorePct: number;
  answered: number;
  wrong: number;
  spots: PathySpotItem[];
  errores: PathyErrorItem[];
}): string {
  const lines: string[] = [];
  lines.push(`Sesión: ${input.titulo} (${input.origen})`);
  lines.push(
    `Marcador real: ${input.scorePct}% de aciertos, ${input.answered} preguntas, ${input.wrong} errores.`,
  );
  if (input.spots.length > 0) {
    lines.push("Desglose real por tema/capítulo:");
    input.spots.forEach((s) => {
      lines.push(
        `- ${s.label}: ${s.pct}% (${s.correct}/${s.total})${s.muestraCorta ? " [muestra corta]" : ""}`,
      );
    });
  }
  lines.push("");
  lines.push("Errores cometidos:");
  input.errores.forEach((e, i) => {
    const origen = e.fuente
      ? `${e.fuente}${e.capitulo ? ` cap. ${e.capitulo}` : ""}${e.capituloTitulo ? ` (${e.capituloTitulo})` : ""}`
      : (e.materia ?? "sin materia");
    lines.push(`${i + 1}. [${origen}] ${e.pregunta}`);
    lines.push(`   eligió: ${e.eligio} | correcta: ${e.correcta}`);
  });
  return lines.join("\n");
}

export interface PathyAiNarrative {
  diagnostico: string;
  confusiones: string[];
  acciones: string[];
}

/** Extrae el JSON del modelo tolerando cercos de markdown. */
export function parsePathyNarrative(raw: string): PathyAiNarrative | null {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1)) as Partial<PathyAiNarrative>;
    const diagnostico = typeof obj.diagnostico === "string" ? obj.diagnostico.trim() : "";
    if (!diagnostico) return null;
    const asList = (v: unknown, max: number) =>
      Array.isArray(v)
        ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
            .map((x) => x.trim())
            .slice(0, max)
        : [];
    return {
      diagnostico,
      confusiones: asList(obj.confusiones, 4),
      acciones: asList(obj.acciones, 3),
    };
  } catch {
    return null;
  }
}
