/**
 * Render del contenido de los artículos del blog.
 *
 * El cuerpo se guarda en la base de datos como Markdown ligero: encabezados
 * `##` / `###`, listas con `-`, citas con `>`, **negritas** y enlaces
 * `[texto](/ruta)`. Aquí se convierte a JSX con la tipografía de FlightPath.
 */
import type { ReactNode } from "react";

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
      out.push(
        <a
          key={`${keyBase}-a${i}`}
          href={href}
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

export function BlogProse({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let list: string[] = [];
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

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flushList();
    if (line.startsWith("### ")) {
      nodes.push(
        <h3
          key={`h3${key++}`}
          className="font-display mt-9 text-[18px] lg:text-[20px] tracking-tight text-ink"
        >
          {inline(line.slice(4), `h3${key}`)}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      nodes.push(
        <h2
          key={`h2${key++}`}
          className="font-display mt-12 text-[24px] lg:text-[30px] tracking-tight text-ink"
        >
          {inline(line.slice(3), `h2${key}`)}
        </h2>,
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
  flushList();

  return <div>{nodes}</div>;
}
