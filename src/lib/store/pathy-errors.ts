/**
 * Puntos flojos reales: se calculan con las respuestas guardadas de cada
 * intento (no con la IA), para que el número que ve la estudiante siempre sea
 * verificable. La IA solo interpreta este material.
 */
import { MATERIAS_DEF } from "./materias";
import { ATP_CHAPTERS, JEPP_CHAPTERS, PHAK_CHAPTERS, LEG_CHAPTERS } from "./linea-aerea-meta";
import type { AttemptAnswer, PathyWeakSpot } from "./types";

/** Muestra mínima para declarar un punto débil sin advertencia. */
const MUESTRA_MIN = 4;

const MANUAL_NOMBRE: Record<string, string> = {
  ATP: "ATP",
  JEPP: "Jeppesen",
  PHAK: "Handbook (PHAK)",
  ANX10: "Anexo 10",
  LEG: "Legislación",
  CPAM: "Compendio CPAM",

};

function chaptersFor(fuente: string) {
  if (fuente === "ATP") return ATP_CHAPTERS;
  if (fuente === "JEPP") return JEPP_CHAPTERS;
  if (fuente === "PHAK") return PHAK_CHAPTERS;
  if (fuente === "LEG") return LEG_CHAPTERS;

  return [];
}

function tituloCapitulo(fuente: string, cap: number, fallback?: string): string {
  if (fallback && fallback.trim()) return fallback.trim();
  const found = chaptersFor(fuente).find((c) => c.num === cap);
  return found?.titulo ?? "";
}

function materiaNombre(slug: string): string {
  return MATERIAS_DEF.find((m) => m.slug === slug)?.name ?? slug;
}

interface Bucket {
  correct: number;
  total: number;
}

function pctOf(b: Bucket): number {
  return b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
}

/**
 * Ordena los puntos flojos: primero los que tienen muestra suficiente y peor
 * porcentaje; los de muestra corta van al final para no sacar conclusiones de
 * dos preguntas.
 */
function ordenar(list: PathyWeakSpot[]): PathyWeakSpot[] {
  return list.sort((a, b) => {
    if (a.muestraCorta !== b.muestraCorta) return a.muestraCorta ? 1 : -1;
    if (a.pct !== b.pct) return a.pct - b.pct;
    return b.total - a.total;
  });
}

/** Ranking por materia CIAAC. */
export function weakByMateria(answers: AttemptAnswer[]): PathyWeakSpot[] {
  const map = new Map<string, Bucket>();
  answers.forEach((a) => {
    if (!a.materia || a.fuente) return; // los reactivos de manual van por capítulo
    const b = map.get(a.materia) ?? { correct: 0, total: 0 };
    b.total++;
    if (a.selectedIndex === a.correctIndex) b.correct++;
    map.set(a.materia, b);
  });
  return ordenar(
    [...map.entries()].map(([slug, b]) => ({
      tipo: "materia" as const,
      label: materiaNombre(slug),
      correct: b.correct,
      total: b.total,
      pct: pctOf(b),
      muestraCorta: b.total < MUESTRA_MIN,
      to: "/cuestionario",
      search: { materia: slug },
    })),
  );
}

/** Ranking por manual + capítulo (Línea Aérea). */
export function weakByCapitulo(answers: AttemptAnswer[]): PathyWeakSpot[] {
  const map = new Map<string, { b: Bucket; fuente: string; cap: number; titulo: string }>();
  answers.forEach((a) => {
    if (!a.fuente) return;
    const cap = a.capitulo ?? 0;
    const key = `${a.fuente}#${cap}`;
    const entry =
      map.get(key) ??
      {
        b: { correct: 0, total: 0 },
        fuente: a.fuente,
        cap,
        titulo: tituloCapitulo(a.fuente, cap, a.capituloTitulo),
      };
    entry.b.total++;
    if (a.selectedIndex === a.correctIndex) entry.b.correct++;
    map.set(key, entry);
  });
  return ordenar(
    [...map.values()].map((e) => {
      const manual = MANUAL_NOMBRE[e.fuente] ?? e.fuente;
      const capTxt = e.cap > 0 ? ` · Cap. ${e.cap}` : "";
      const tit = e.titulo ? ` — ${e.titulo}` : "";
      return {
        tipo: "capitulo" as const,
        label: `${manual}${capTxt}${tit}`,
        correct: e.b.correct,
        total: e.b.total,
        pct: pctOf(e.b),
        muestraCorta: e.b.total < MUESTRA_MIN,
        to: "/cuestionario",
        search: (e.cap > 0
          ? { fuente: e.fuente, caps: String(e.cap) }
          : { fuente: e.fuente }) as Record<string, string>,
      };
    }),
  );
}

/** Los peores puntos de una tanda de respuestas (materias y capítulos juntos). */
export function weakSpots(answers: AttemptAnswer[], limit = 3): PathyWeakSpot[] {
  return ordenar([...weakByMateria(answers), ...weakByCapitulo(answers)]).slice(0, limit);
}

/** Respuestas incorrectas o en blanco. */
export function wrongAnswers(answers: AttemptAnswer[]): AttemptAnswer[] {
  return answers.filter((a) => a.selectedIndex !== a.correctIndex);
}
