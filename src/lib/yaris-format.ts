/**
 * Formato de las respuestas de Yaris.
 *
 * El modelo escribe en Markdown aunque se le pida HTML (**negritas**, listas,
 * `código`, títulos…). La UI renderiza HTML, así que aquí traducimos Markdown
 * → HTML simple y sanitizamos el resultado con una lista blanca de etiquetas.
 * Es idempotente: si Yaris ya mandó <b>/<ul>, el texto pasa intacto.
 */
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "div",
  "b", "strong", "i", "em", "u", "br", "ul", "ol", "li", "p", "span", "code", "pre", "blockquote",
];

/** Convierte Markdown ligero a HTML simple. */
function markdownToHtml(src: string): string {
  let s = src.replace(/\r\n/g, "\n").trim();

  // Bloques de código ```...```
  const codeBlocks: string[] = [];
  s = s.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, (_m, code: string) => {
    codeBlocks.push(code.replace(/\n$/, ""));
    return `\u0000CODE${codeBlocks.length - 1}\u0000`;
  });

  // Código en línea `x`
  const inline: string[] = [];
  s = s.replace(/`([^`\n]+)`/g, (_m, code: string) => {
    inline.push(code);
    return `\u0000IC${inline.length - 1}\u0000`;
  });

  // Títulos # ## ### → línea en negritas
  s = s.replace(/^#{1,6}\s+(.+)$/gm, "<b>$1</b>");

  // Énfasis
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<b><em>$1</em></b>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  s = s.replace(/__(.+?)__/g, "<b>$1</b>");
  s = s.replace(/(^|[\s(])\*(?!\s)([^*\n]+?)\*(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[\s(])_(?!\s)([^_\n]+?)_(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");

  // Enlaces [texto](url) → texto (url)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1 ($2)");

  // Citas > texto
  s = s.replace(/^>\s?(.+)$/gm, "<blockquote>$1</blockquote>");

  // Listas: agrupa líneas consecutivas
  const lines = s.split("\n");
  const out: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  const flush = () => {
    if (list) {
      out.push(`<${list.type}>${list.items.map((i) => `<li>${i}</li>`).join("")}</${list.type}>`);
      list = null;
    }
  };
  for (const line of lines) {
    const ul = /^\s*[-*+]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ul) {
      if (!list || list.type !== "ul") { flush(); list = { type: "ul", items: [] }; }
      list.items.push(ul[1]!);
    } else if (ol) {
      if (!list || list.type !== "ol") { flush(); list = { type: "ol", items: [] }; }
      list.items.push(ol[1]!);
    } else {
      flush();
      out.push(line);
    }
  }
  flush();
  s = out.join("\n");

  // Párrafos y saltos de línea
  s = s
    .split(/\n{2,}/)
    .map((block) => {
      const t = block.trim();
      if (!t) return "";
      if (/^<(ul|ol|blockquote|p)\b/i.test(t)) return t;
      return `<p>${t.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("");

  // Restaura código
  s = s.replace(/\u0000IC(\d+)\u0000/g, (_m, i: string) => `<code>${escapeHtml(inline[Number(i)] ?? "")}</code>`);
  s = s.replace(/\u0000CODE(\d+)\u0000/g, (_m, i: string) => `<pre><code>${escapeHtml(codeBlocks[Number(i)] ?? "")}</code></pre>`);

  return s;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Markdown de Yaris → HTML sanitizado listo para renderizar. */
export function yarisToHtml(text: string): string {
  if (!text) return "";
  const html = DOMPurify.sanitize(markdownToHtml(text), {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });
  return `<div class="yaris-md">${html}</div>`;
}

/**
 * Sanea HTML arbitrario en el punto donde se renderiza.
 *
 * `yarisToHtml()` ya limpia lo que devuelve el modelo, pero las burbujas de
 * chat reciben cadenas de varias fuentes (respaldo local, historial guardado,
 * texto que llega por streaming). Sanear otra vez justo antes de pintar cierra
 * la puerta a un XSS por inyección de prompt aunque una ruta se nos escape;
 * la operación es idempotente, así que no altera el HTML ya válido.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["class"] });
}

/**
 * Red de seguridad del modo "te ayudo a pensar".
 *
 * Aunque el prompt del servidor prohíbe revelar la respuesta antes de que la
 * estudiante elija, aquí se tapa cualquier fuga: el texto literal de la opción
 * correcta y las frases del tipo "la respuesta correcta es …" se sustituyen
 * antes de pintarse en el chat. Vive en este módulo porque lo usan todos los
 * cuestionarios (CIAAC, Línea Aérea) y el simulador.
 */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function maskAnswer(text: string, correct: string): string {
  let out = text;
  const c = correct.trim();
  if (c.length >= 4) out = out.replace(new RegExp(escapeRe(c), "gi"), "▮▮▮");
  out = out.replace(
    /\b(la\s+)?(respuesta|opci[oó]n|alternativa)\s+correcta\s+(es|ser[ií]a)[^.\n]*/gi,
    "la respuesta correcta te toca deducirla a ti",
  );
  return out;
}
