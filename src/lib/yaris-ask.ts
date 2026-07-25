/**
 * Punto único de entrada a Yaris.
 *
 * Antes cada pantalla decidía por su cuenta: sólo el chat lateral llamaba al
 * modelo real y el resto (cuestionario, biblioteca, estudiemos, bitácora)
 * usaba `yarisReply()`, un guion determinista de cuatro respuestas fijas que
 * se repetía en bucle mientras la UI simulaba latencia con `setTimeout`.
 *
 * Ahora todas piden por aquí y el comportamiento es honesto:
 *
 *  - **Pro / admin** → modelo real (`yarisAiChat`). Si la llamada falla, se
 *    devuelve la explicación oficial de la pregunta, nunca un guion disfrazado
 *    de IA.
 *  - **Plan básica** → sin IA (es la regla de `canUseAI`). Se entrega la
 *    explicación oficial del banco —contenido real del curso— diciendo con
 *    claridad que es eso, más la invitación a Pro.
 */
import { useServerFn } from "@tanstack/react-start";
import { yarisAiChat } from "@/lib/yaris-ai.functions";
import { canUseAI, useSessionUser, type YarisContext } from "@/lib/store";

export interface YarisAnswer {
  /** HTML simple listo para sanitizar y renderizar. */
  text: string;
  cite: string | null;
  /** Origen real de la respuesta, para que la UI no prometa de más. */
  source: "ia" | "explicacion_oficial" | "requiere_pro";
}

export interface YarisTurn {
  history: Array<{ role: "user" | "assistant"; content: string }>;
  ctx: YarisContext;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Explicación oficial del banco: contenido real, presentado como tal. */
function officialExplanation(ctx: YarisContext, prefix: string): YarisAnswer {
  const q = ctx.question;
  if (!q) {
    return {
      text: `${prefix} Abre una pregunta de un cuestionario y te muestro su explicación oficial del curso.`,
      cite: null,
      source: "requiere_pro",
    };
  }
  const correcta = escapeHtml(q.options[q.correctIndex] ?? "");
  return {
    text: `${prefix} <b>Explicación oficial del curso:</b> la respuesta correcta es <b>"${correcta}"</b>. ${escapeHtml(q.explanation)}`,
    cite: q.cite || null,
    source: "explicacion_oficial",
  };
}

/**
 * Devuelve una función `ask()` para pedirle una respuesta a Yaris.
 * Debe llamarse dentro de un componente (usa hooks).
 */
export function useYarisAsk() {
  const askAi = useServerFn(yarisAiChat);
  const user = useSessionUser();
  const paid = canUseAI(user);

  return async function ask({ history, ctx }: YarisTurn): Promise<YarisAnswer> {
    if (!paid) {
      return officialExplanation(
        ctx,
        "Yaris con IA es parte de FlightPath Pro, así que no puedo conversar libremente contigo todavía.",
      );
    }

    const q = ctx.question;
    try {
      const res = await askAi({
        data: {
          history: history.slice(-16),
          context: {
            ...(ctx.materiaName && { materia: ctx.materiaName }),
            ...(ctx.resourceTitle && { resourceTitle: ctx.resourceTitle }),
            ...(q && {
              questionText: q.text,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              ...(q.cite && { cite: q.cite }),
            }),
          },
        },
      });
      return { text: res.text, cite: res.cite ?? null, source: "ia" };
    } catch {
      // Sin conexión con el modelo: se entrega contenido real del curso.
      return officialExplanation(ctx, "No pude conectarme con la IA en este momento.");
    }
  };
}

/** Convierte el historial de una UI a los turnos que espera el modelo. */
export function toHistory(
  msgs: Array<{ text: string; fromUser: boolean }>,
): Array<{ role: "user" | "assistant"; content: string }> {
  return msgs
    .map((m) => ({
      role: (m.fromUser ? "user" : "assistant") as "user" | "assistant",
      // El modelo recibe texto plano; la UI guarda HTML simple.
      content: m.text.replace(/<[^>]+>/g, "").trim(),
    }))
    .filter((m) => m.content.length > 0);
}
