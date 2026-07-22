import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const contextSchema = z
  .object({
    materia: z.string().optional(),
    questionText: z.string().optional(),
    options: z.array(z.string()).optional(),
    correctIndex: z.number().optional(),
    userSelectedIndex: z.number().optional(),
    explanation: z.string().optional(),
    cite: z.string().optional(),
  })
  .optional();

const schema = z.object({
  history: z.array(messageSchema).max(20),
  context: contextSchema,
});

const LETTERS = ["A", "B", "C", "D", "E"];

/**
 * Yaris tutora IA — usa Lovable AI Gateway (Gemini) para explicar preguntas
 * combinando conocimiento aeronáutico general con la explicación oficial de
 * cada pregunta en revisión. Devuelve HTML seguro con la respuesta.
 */
export const yarisAiChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        text:
          "Todavía no está conectada la IA en este entorno. Puedo revisar la explicación oficial de la pregunta, pero no responder libremente. Vuelve a intentarlo cuando el equipo active Yaris IA.",
        cite: null as string | null,
      };
    }

    const ctx = data.context ?? {};
    let system = [
      "Eres Yaris, tutora académica cálida, empática y precisa de FlightPath para pilotos que preparan el examen CIAAC de México (Piloto Comercial de la DGAC/AFAC).",
      "Responde SIEMPRE en español mexicano, tono cercano de tú. Usa HTML simple para dar formato (<b>, <br>, <ul>, <li>, <em>). No uses Markdown.",
      "Sé concisa: entre 3 y 8 oraciones por respuesta salvo que el usuario pida detalle.",
      "Explica conceptos usando tu conocimiento general de aeronáutica: aerodinámica, motores, meteorología, navegación aérea, legislación (DGAC/AFAC/OACI/RACM), factores humanos, medicina de aviación, comunicaciones, servicios de tránsito aéreo y operaciones.",
      "Si la duda no es de aviación, responde brevemente y redirígela al estudio.",
      "No inventes citas ni normativas específicas; si no estás segura de un número/artículo exacto, dilo con humildad.",
    ].join(" ");

    if (ctx.questionText) {
      const correcta =
        ctx.options && ctx.correctIndex !== undefined && ctx.options[ctx.correctIndex] !== undefined
          ? `${LETTERS[ctx.correctIndex]}. ${ctx.options[ctx.correctIndex]}`
          : "?";
      const elegida =
        ctx.options && ctx.userSelectedIndex !== undefined && ctx.userSelectedIndex >= 0
          ? `${LETTERS[ctx.userSelectedIndex]}. ${ctx.options[ctx.userSelectedIndex]}`
          : "Sin responder";
      const opts = (ctx.options ?? [])
        .map((o, i) => `${LETTERS[i]}. ${o}`)
        .join(" | ");
      system +=
        "\n\nCONTEXTO DE LA PREGUNTA EN REVISIÓN (úsalo como base y complementa con tu conocimiento):" +
        `\n- Materia: ${ctx.materia ?? "N/D"}` +
        `\n- Pregunta: ${ctx.questionText}` +
        `\n- Opciones: ${opts}` +
        `\n- Respuesta correcta: ${correcta}` +
        `\n- Respuesta del estudiante: ${elegida}` +
        `\n- Explicación oficial del curso: ${ctx.explanation ?? "—"}` +
        (ctx.cite ? `\n- Fuente oficial: ${ctx.cite}` : "");
    }

    const messages = [
      { role: "system", content: system },
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        if (res.status === 429) {
          return {
            text:
              "¡Uy! Ahora mismo hay demasiadas consultas. Dame un momento antes de volver a preguntarme, por favor.",
            cite: ctx.cite ?? null,
          };
        }
        if (res.status === 402) {
          return {
            text:
              "Se agotaron los créditos de IA para este entorno. Avísale a tu instructor o al equipo de FlightPath para reactivar Yaris.",
            cite: ctx.cite ?? null,
          };
        }
        console.error("Yaris AI error", res.status, errBody.slice(0, 300));
        return {
          text:
            "No pude conectarme con la IA justo ahora. Puedes releer la explicación oficial y volver a intentarlo en un momento.",
          cite: ctx.cite ?? null,
        };
      }
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text =
        json.choices?.[0]?.message?.content?.trim() ||
        "No pude generar una respuesta esta vez. Intenta reformular tu pregunta.";
      return { text, cite: ctx.cite ?? null };
    } catch (err) {
      console.error("Yaris AI fetch failed", err);
      return {
        text:
          "Tuve un problema al conectarme con la IA. Revisa la explicación oficial de la pregunta y vuelve a intentarlo.",
        cite: ctx.cite ?? null,
      };
    }
  });
