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
import { canUseAI, cloudEnabled, useSessionUser, type YarisContext } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { yarisToHtml } from "@/lib/yaris-format";

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
    if (!paid && ctx.preAnswer) {
      return {
        text:
          "Todavía no eliges respuesta, así que no te doy la solución: <b>lee la pregunta buscando la palabra clave</b> (qué te piden exactamente), descarta las opciones que contradigan lo que ya sabes y quédate con la que puedas justificar. Cuando marques una, te muestro la explicación oficial.",
        cite: null,
        source: "explicacion_oficial",
      };
    }
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
              ...(ctx.userSelectedIndex !== undefined && { userSelectedIndex: ctx.userSelectedIndex }),
              ...(ctx.preAnswer && { preAnswer: true }),
              ...(q.cite && { cite: q.cite }),
            }),
          },
        },
      });
      return { text: yarisToHtml(res.text), cite: res.cite ?? null, source: "ia" };
    } catch {
      // Sin conexión con el modelo: se entrega contenido real del curso.
      return officialExplanation(ctx, "No pude conectarme con la IA en este momento.");
    }
  };
}

/** Contexto de la pregunta tal como lo espera el servidor. */
function serverContext(ctx: YarisContext): Record<string, unknown> {
  const q = ctx.question;
  return {
    ...(ctx.materiaName && { materia: ctx.materiaName }),
    ...(ctx.resourceTitle && { resourceTitle: ctx.resourceTitle }),
    ...(q && {
      questionText: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      ...(ctx.userSelectedIndex !== undefined && { userSelectedIndex: ctx.userSelectedIndex }),
      ...(ctx.preAnswer && { preAnswer: true }),
      ...(q.cite && { cite: q.cite }),
    }),
  };
}

export interface YarisStreamTurn extends YarisTurn {
  /** Se llama con cada fragmento de texto plano según llega del modelo. */
  onDelta: (chunk: string) => void;
  signal?: AbortSignal;
}

/**
 * Igual que `useYarisAsk()`, pero entrega la respuesta mientras se genera.
 *
 * Si el streaming no está disponible (sin nube, sin sesión, error de red o
 * respuesta no-SSE) cae a la petición normal sin que la UI note el cambio: el
 * texto simplemente aparece de golpe en vez de escribirse.
 */
export function useYarisStream() {
  const ask = useYarisAsk();

  return async function stream({ history, ctx, onDelta, signal }: YarisStreamTurn): Promise<YarisAnswer> {
    if (!cloudEnabled()) return ask({ history, ctx });

    let token: string | undefined;
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    } catch {
      token = undefined;
    }
    if (!token) return ask({ history, ctx });

    try {
      const res = await fetch("/api/yaris/stream", {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ history: history.slice(-16), context: serverContext(ctx) }),
      });
      if (!res.ok || !res.body) return ask({ history, ctx });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let plain = "";
      let cite: string | null = ctx.question?.cite ?? null;
      let failed = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // Los eventos SSE llegan separados por una línea en blanco.
        let sep = buffer.indexOf("\n\n");
        while (sep !== -1) {
          const raw = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          sep = buffer.indexOf("\n\n");
          const evt = /^event:\s*(.+)$/m.exec(raw)?.[1]?.trim();
          const dataLine = /^data:\s*(.*)$/m.exec(raw)?.[1];
          if (!dataLine) continue;
          let payload: { t?: string; cite?: string | null; status?: number };
          try {
            payload = JSON.parse(dataLine);
          } catch {
            continue;
          }
          if (evt === "delta" && payload.t) {
            plain += payload.t;
            onDelta(payload.t);
          } else if (evt === "done") {
            cite = payload.cite ?? cite;
          } else if (evt === "error") {
            failed = true;
          }
        }
      }

      if (failed || plain.trim().length === 0) return ask({ history, ctx });
      return { text: yarisToHtml(plain.trim()), cite, source: "ia" };
    } catch (err) {
      if ((err as Error)?.name === "AbortError") throw err;
      return ask({ history, ctx });
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
