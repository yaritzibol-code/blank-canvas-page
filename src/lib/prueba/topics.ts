/**
 * "Ponme a Prueba" — selección de tema y material de referencia.
 *
 * Aquí no se inventa contenido académico: el tema sugerido sale del progreso
 * real de la alumna (temas completados, materias flojas) y las referencias
 * salen de los temas del curso (`TEMA_REGISTRY`) y de las explicaciones
 * oficiales del banco de preguntas que ya estén cargadas en memoria.
 */
import {
  getPublishedQuestions,
  getTemaProgress,
  materiaPerformance,
  materiaProgressPct,
} from "@/lib/store";
import { MATERIAS_DEF, materiaBySlug } from "@/lib/store/materias";
import { SUBJECT_TEMAS, TEMA_REGISTRY } from "@/modules/data/registry";

export interface TopicRef {
  titulo: string;
  texto: string;
  cite?: string;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function words(s: string): string[] {
  return norm(s)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
}

/** Título legible de un tema del curso. */
function temaTitle(temaId: string): string | null {
  for (const list of Object.values(SUBJECT_TEMAS)) {
    const hit = list.find((t) => t.id === temaId);
    if (hit) return hit.title;
  }
  return null;
}

/**
 * Tema sugerido por Yaris cuando la alumna pide "Sorpréndeme".
 * Prioriza lo que ya estudió y lo que le conviene reforzar.
 */
export function pickSurpriseTopic(userId: string): string {
  const candidatos: { tema: string; peso: number }[] = [];

  // 1) Temas completados recientemente: ya los vio, puede explicarlos.
  getTemaProgress(userId)
    .filter((t) => t.completado)
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .slice(0, 6)
    .forEach((t, i) => {
      const title = temaTitle(t.temaId);
      if (title) candidatos.push({ tema: title, peso: 10 - i });
    });

  // 2) Materias con desempeño flojo: conviene reforzarlas.
  materiaPerformance(userId, "todo")
    .filter((m) => m.answered >= 3)
    .sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0))
    .slice(0, 4)
    .forEach((m, i) => {
      const name = materiaBySlug(m.slug)?.name;
      if (name) candidatos.push({ tema: name, peso: ((m.avg ?? 0) < 70 ? 9 : 5) - i });
    });

  // 3) Materias ya iniciadas en Learning Paths.
  MATERIAS_DEF.forEach((m) => {
    if (materiaProgressPct(userId, m.slug) > 0) candidatos.push({ tema: m.name, peso: 4 });
  });

  if (candidatos.length === 0) {
    // Sin datos de progreso: un tema base del curso.
    const base = Object.values(TEMA_REGISTRY).map((t) => t.title);
    return base[Math.floor(Math.random() * base.length)] ?? "Sustentación";
  }

  // Ruleta ponderada para que no repita siempre el mismo.
  const total = candidatos.reduce((s, c) => s + c.peso, 0);
  let r = Math.random() * total;
  for (const c of candidatos) {
    r -= c.peso;
    if (r <= 0) return c.tema;
  }
  return candidatos[0]!.tema;
}

/** Materia (slug) que mejor corresponde al tema escrito, si la hay. */
export function guessMateriaSlug(tema: string): string | undefined {
  const t = norm(tema);
  const directa = MATERIAS_DEF.find((m) => t.includes(norm(m.name)) || norm(m.name).includes(t));
  if (directa) return directa.slug;
  const ws = words(tema);
  const porTema = Object.values(TEMA_REGISTRY).find((x) =>
    ws.some((w) => norm(x.title).includes(w)),
  );
  return porTema?.materia;
}

/** Texto plano de los bloques de un tema del curso. */
function temaTexto(temaId: string): string {
  const tema = TEMA_REGISTRY[temaId];
  if (!tema) return "";
  const partes: string[] = [tema.title, tema.subtitle ?? ""];
  tema.blocks.forEach((b) => {
    const d = b.data as Record<string, unknown> | null;
    if (!d) return;
    ["titulo", "texto", "nota_adicional", "explicacion", "concepto", "regla"].forEach((k) => {
      const v = d[k];
      if (typeof v === "string" && v.length > 20) partes.push(v);
    });
  });
  return partes.filter(Boolean).join(" ").replace(/\s+/g, " ").slice(0, 2600);
}

/**
 * Material real de FlightPath sobre el tema: temas del curso y explicaciones
 * oficiales del banco. Es lo que Yaris usa para evaluar la explicación.
 */
export function buildReferences(tema: string, max = 4): TopicRef[] {
  const ws = words(tema);
  const match = (texto: string) => {
    const n = norm(texto);
    return ws.reduce((s, w) => s + (n.includes(w) ? 1 : 0), 0);
  };

  const refs: { ref: TopicRef; score: number }[] = [];

  Object.values(TEMA_REGISTRY).forEach((t) => {
    const score = match(`${t.title} ${t.subtitle ?? ""}`) * 3 + match(temaTexto(t.id));
    if (score > 0) {
      refs.push({
        ref: { titulo: t.title, texto: temaTexto(t.id), cite: `FlightPath — ${t.title}` },
        score,
      });
    }
  });

  const slug = guessMateriaSlug(tema);
  getPublishedQuestions(slug).forEach((q) => {
    const score = match(`${q.text} ${q.explanation}`);
    if (score > 0 && q.explanation) {
      refs.push({
        ref: {
          titulo: q.text.slice(0, 120),
          texto: q.explanation.slice(0, 900),
          ...(q.cite ? { cite: q.cite } : {}),
        },
        score,
      });
    }
  });

  return refs
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((r) => r.ref);
}
