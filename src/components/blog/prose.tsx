/**
 * Render del contenido de los artículos del blog.
 *
 * El cuerpo se guarda en la base de datos como Markdown ligero:
 * - encabezados `##` / `###` (reciben un ancla para el índice)
 * - listas con `-` y listas numeradas con `1.`
 * - tablas con `| col | col |`
 * - avisos con `> [!aviso] Texto`
 * - citas con `>`, **negritas** y enlaces `[texto](/ruta)`
 */
import type { ReactNode } from "react";

/** Ancla estable a partir del texto de un encabezado. */
export function anchorId(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\*\*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Encabezados de nivel 2 para construir el índice del artículo. */
export function extractHeadings(content: string): { id: string; text: string }[] {
  return content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = l.slice(3).replace(/\*\*/g, "").trim();
      return { id: anchorId(text), text };
    });
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      out.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("](") + 2, -1);
      const externo = href.startsWith("http");
      out.push(
        <a
          key={`${keyBase}-a${i}`}
          href={href}
          {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-coral-700 font-semibold underline decoration-coral-300 underline-offset-4 hover:decoration-coral-600 transition-colors"
        >
          {label}
        </a>,
      );
    }
    last = m.index + token.length;
    i += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const isTableRow = (l: string) => l.startsWith("|") && l.endsWith("|");
const isTableSep = (l: string) => /^\|[\s:|-]+\|$/.test(l);
const cells = (l: string) =>
  l
    .slice(1, -1)
    .split("|")
    .map((c) => c.trim());

export function BlogProse({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let list: string[] = [];
  let ordered: string[] = [];
  let table: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!list.length) return;
    const items = list;
    list = [];
    nodes.push(
      <ul key={`ul${key++}`} className="mt-4 space-y-2.5 pl-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-400" />
            <span className="text-[15.5px] leading-relaxed text-ink/65">
              {inline(item, `li${key}-${i}`)}
            </span>
          </li>
        ))}
      </ul>,
    );
  };

  const flushOrdered = () => {
    if (!ordered.length) return;
    const items = ordered;
    ordered = [];
    nodes.push(
      <ol key={`ol${key++}`} className="mt-4 space-y-3 pl-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
              {i + 1}
            </span>
            <span className="text-[15.5px] leading-relaxed text-ink/65">
              {inline(item, `ol${key}-${i}`)}
            </span>
          </li>
        ))}
      </ol>,
    );
  };

  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((l) => !isTableSep(l)).map(cells);
    table = [];
    const [head, ...body] = rows;
    if (!head) return;
    nodes.push(
      <div
        key={`tb${key++}`}
        className="mt-6 overflow-x-auto rounded-2xl border border-ink/8 bg-white"
      >
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="bg-haze-100/60">
              {head.map((c, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-[11px] uppercase tracking-[0.14em] font-bold text-ink/55"
                >
                  {inline(c, `th${key}-${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className="border-t border-ink/6">
                {r.map((c, ci) => (
                  <td key={ci} className="px-4 py-3 text-[14.5px] leading-relaxed text-ink/70">
                    {inline(c, `td${key}-${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
  };

  const flushAll = () => {
    flushList();
    flushOrdered();
    flushTable();
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushAll();
      continue;
    }
    if (isTableRow(line)) {
      flushList();
      flushOrdered();
      table.push(line);
      continue;
    }
    if (line.startsWith("- ")) {
      flushOrdered();
      flushTable();
      list.push(line.slice(2));
      continue;
    }
    const om = /^(\d+)\.\s+(.*)$/.exec(line);
    if (om) {
      flushList();
      flushTable();
      ordered.push(om[2]);
      continue;
    }
    flushAll();
    if (line.startsWith("### ")) {
      const text = line.slice(4);
      nodes.push(
        <h3
          key={`h3${key++}`}
          id={anchorId(text)}
          className="font-display mt-9 scroll-mt-24 text-[18px] lg:text-[20px] tracking-tight text-ink"
        >
          {inline(text, `h3${key}`)}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      const text = line.slice(3);
      nodes.push(
        <h2
          key={`h2${key++}`}
          id={anchorId(text.replace(/\*\*/g, ""))}
          className="font-display mt-12 scroll-mt-24 text-[24px] lg:text-[30px] tracking-tight text-ink"
        >
          {inline(text, `h2${key}`)}
        </h2>,
      );
    } else if (line.startsWith("> [!aviso]")) {
      nodes.push(
        <div
          key={`av${key++}`}
          className="mt-6 rounded-2xl border border-coral-300/60 bg-coral-50/60 px-6 py-5"
        >
          <div className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-coral-700">
            Aviso oficial
          </div>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink/70">
            {inline(line.slice(10).trim(), `av${key}`)}
          </p>
        </div>,
      );
    } else if (line.startsWith("> ")) {
      nodes.push(
        <blockquote
          key={`q${key++}`}
          className="mt-6 rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[14.5px] leading-relaxed text-ink/60"
        >
          {inline(line.slice(2), `q${key}`)}
        </blockquote>,
      );
    } else {
      nodes.push(
        <p key={`p${key++}`} className="mt-4 text-[16px] leading-[1.75] text-ink/70">
          {inline(line, `p${key}`)}
        </p>,
      );
    }
  }
  flushAll();

  return <div>{nodes}</div>;
}
