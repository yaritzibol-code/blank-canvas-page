/**
 * Yaris (tutora académica) y Pathy (progreso/organización) — versión MVP.
 * Motor determinista basado en el contenido de FlightPath: explica a partir
 * de la explicación oficial de cada pregunta/recurso; no inventa fuentes
 * (PRD §8.8) y nunca modifica datos oficiales (PRD §8.2).
 */
import { getPublishedQuestions, logActivity } from "./domain";
import { materiaBySlug } from "./materias";
import type { BankQuestion } from "./types";

export interface YarisContext {
  /** Pregunta activa (cuestionario/simulador en revisión). */
  question?: {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    cite?: string;
  };
  /** Recurso de biblioteca o tema activo. */
  resourceTitle?: string;
  materiaName?: string;
}

export interface YarisReply {
  t: string;
  c: string | null;
}

/**
 * Genera la respuesta de Yaris según el turno de conversación y el contexto.
 * Turno 0 explica; turnos siguientes refuerzan con ángulos distintos.
 */
export function yarisReply(turn: number, ctx: YarisContext, userMessage?: string): YarisReply {
  const q = ctx.question;
  const msg = (userMessage ?? "").toLowerCase();

  if (q) {
    const correcta = q.options[q.correctIndex];
    const seq: YarisReply[] = [
      {
        t: `¡Claro! Vamos por partes. La respuesta correcta es <b>"${escapeHtml(correcta)}"</b>. ${escapeHtml(q.explanation)}`,
        c: q.cite || null,
      },
      {
        t: `Otra forma de verlo: descarta primero las opciones que contradicen el concepto clave. Aquí, la clave es que ${escapeHtml(firstSentence(q.explanation))} ¿Notas cómo las demás opciones fallan justo en eso?`,
        c: q.cite || null,
      },
      {
        t: `Para que se te quede: intenta explicarle esta pregunta a alguien más con tus palabras. Si puedes decir por qué <b>"${escapeHtml(correcta)}"</b> es correcta sin leer la explicación, ya es tuya. ¿Quieres que te haga una pregunta de repaso de ${escapeHtml(ctx.materiaName ?? "esta materia")}?`,
        c: null,
      },
      {
        t: `Recuerda que en el examen el tiempo importa: lee la pregunta completa, identifica el concepto (${escapeHtml(shortConcept(q.text))}) y elige sin dudar. Sigue practicando, cada error entendido es un punto ganado el día del CIAAC. ✈️`,
        c: null,
      },
    ];
    return seq[Math.min(turn, seq.length - 1)];
  }

  if (msg.includes("pregunta") || msg.includes("repaso") || msg.includes("practicar")) {
    return {
      t: "¡Me encanta esa actitud! Ve a Cuestionarios → Modo Aprendiendo y elige la materia que quieras reforzar. Ahí te acompaño pregunta por pregunta con la explicación de cada una.",
      c: null,
    };
  }

  const generic: YarisReply[] = [
    {
      t: ctx.resourceTitle
        ? `Estoy aquí para ayudarte con <b>${escapeHtml(ctx.resourceTitle)}</b>. Pregúntame sobre cualquier concepto del material y te lo explico con base en el contenido del curso.`
        : "Estoy aquí para tus dudas académicas. Cuéntame qué tema o pregunta te está costando y lo desarmamos juntas, paso a paso.",
      c: null,
    },
    {
      t: "Mi método favorito: primero el concepto en una frase, luego un ejemplo aplicado al vuelo, y al final una pregunta para comprobar que lo entendiste. Dime el tema y empezamos.",
      c: null,
    },
    {
      t: "Si esta duda viene de una pregunta específica de un cuestionario, ábrela y pulsa 'Explícamelo Yaris': ahí tengo la explicación y la fuente oficial del curso para dártela con precisión.",
      c: null,
    },
  ];
  return generic[Math.min(turn, generic.length - 1)];
}

/** Registra el uso de Yaris para métricas (PRD §13.5). */
export function logYarisUse(userId: string, seccion: string) {
  logActivity({ userId, kind: "yaris", label: `Yaris — ${seccion}`, durationMin: 0 });
}

/** Pregunta de repaso aleatoria de una materia (para "Ponme a prueba"). */
export function pickPracticeQuestion(materiaSlug?: string): BankQuestion | null {
  const pool = getPublishedQuestions(materiaSlug || undefined);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function materiaDisplayName(slug: string): string {
  return materiaBySlug(slug)?.name ?? slug;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function firstSentence(s: string): string {
  const m = s.split(/(?<=\.)\s/)[0] ?? s;
  return m.length > 220 ? `${m.slice(0, 217)}...` : m;
}

function shortConcept(text: string): string {
  const t = text.replace(/[¿?]/g, "");
  return t.length > 70 ? `${t.slice(0, 67)}...` : t;
}
