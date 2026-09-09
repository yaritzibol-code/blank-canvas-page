/**
 * Inventario de recursos **reales** de FlightPath para "Estudiemos Juntos".
 * Aquí no se inventa contenido: cada candidato apunta a una ruta que ya existe
 * (Learning Path, cuestionario con sus filtros, banco, simulador, flashcards).
 */
import { MATERIAS_DEF } from "@/lib/store/materias";
import {
  ALL_MANUAL_QUIZZES,
  ATP_CHAPTERS,
  JEPP_CHAPTERS,
  PHAK_CHAPTERS,
  LEG_CHAPTERS,
  B737MAX_CHAPTERS,
  type AtpChapter,
} from "@/lib/store/linea-aerea-meta";
import { SUBJECT_TEMAS } from "@/modules/data/registry";
import type { ResourceCandidate, StudyTrack } from "./types";

const CHAPTERS_BY_CODE: Record<string, AtpChapter[]> = {
  ATP: ATP_CHAPTERS,
  JEPP: JEPP_CHAPTERS,
  PHAK: PHAK_CHAPTERS,
  LEG: LEG_CHAPTERS,
  B737MAX: B737MAX_CHAPTERS,
};

export interface CatalogOptions {
  track: StudyTrack;
  /** Módulos todavía en construcción (Learning Paths, Flashcards) sólo para admin. */
  allowLocked: boolean;
}

function base(c: Omit<ResourceCandidate, "score">): ResourceCandidate {
  return { ...c, score: 0 };
}

export function buildCatalog({ track, allowLocked }: CatalogOptions): ResourceCandidate[] {
  const out: ResourceCandidate[] = [];

  if (track === "ciaac") {
    MATERIAS_DEF.forEach((m) => {
      const temas = SUBJECT_TEMAS[m.slug] ?? [];
      if (allowLocked && temas.length > 0) {
        out.push(
          base({
            id: `lp:${m.slug}`,
            kind: "learning_path",
            titulo: `Learning Path · ${m.name}`,
            detalle: `${temas.length} tema${temas.length === 1 ? "" : "s"} con teoría y práctica`,
            icon: "book",
            minutes: 15,
            to: `/dashboard/materias/${m.slug}`,
            keywords: `${m.name} ${m.slug} ${temas.map((t) => t.title).join(" ")}`.toLowerCase(),
          }),
        );
      }
      out.push(
        base({
          id: `quiz:${m.slug}`,
          kind: "cuestionario",
          titulo: `Cuestionario · ${m.name}`,
          detalle: "Preguntas del banco CIAAC de esta materia",
          icon: "help",
          minutes: 12,
          to: "/cuestionario",
          search: { materias: m.slug, qty: 10 },
          keywords: `${m.name} ${m.slug}`.toLowerCase(),
        }),
      );
    });

    out.push(
      base({
        id: "banco:ciaac",
        kind: "banco",
        titulo: "Banco de preguntas CIAAC",
        detalle: "Repaso libre por materia",
        icon: "library",
        minutes: 10,
        to: "/dashboard/banco",
        keywords: "banco preguntas ciaac repaso",
      }),
      base({
        id: "sim:ciaac",
        kind: "simulador",
        titulo: "Simulador CIAAC",
        detalle: "Examen completo en condiciones reales",
        icon: "sim",
        minutes: 45,
        to: "/simulador",
        keywords: "simulador examen completo ciaac",
      }),
    );
  } else {
    ALL_MANUAL_QUIZZES.forEach((q) => {
      const caps = CHAPTERS_BY_CODE[q.code] ?? [];
      if (caps.length > 0) {
        caps.forEach((c) => {
          out.push(
            base({
              id: `quiz:${q.code}:${c.num}`,
              kind: "cuestionario",
              titulo: `${q.titulo} · Cap. ${c.num}`,
              detalle: c.titulo,
              icon: q.icon as ResourceCandidate["icon"],
              minutes: 12,
              to: "/cuestionario",
              search: { banco: "la", fuente: q.code, caps: String(c.num), qty: 10 },
              keywords: `${q.titulo} ${q.code} ${c.titulo} ${c.tituloEn ?? ""}`.toLowerCase(),
            }),
          );
        });
      } else {
        out.push(
          base({
            id: `quiz:${q.code}`,
            kind: "cuestionario",
            titulo: `Cuestionario · ${q.titulo}`,
            detalle: q.descripcion,
            icon: q.icon as ResourceCandidate["icon"],
            minutes: 14,
            to: "/cuestionario",
            search: { banco: "la", fuente: q.code, qty: 15 },
            keywords: `${q.titulo} ${q.code} ${q.descripcion}`.toLowerCase(),
          }),
        );
      }
    });

    out.push(
      base({
        id: "banco:la",
        kind: "banco",
        titulo: "Banco de Línea Aérea",
        detalle: "Repaso libre por manual",
        icon: "library",
        minutes: 10,
        to: "/dashboard/banco",
        search: { banco: "la" },
        keywords: "banco linea aerea manuales repaso",
      }),
      base({
        id: "sim:la",
        kind: "simulador",
        titulo: "Simulador de Línea Aérea",
        detalle: "Examen completo del curso",
        icon: "sim",
        minutes: 45,
        to: "/simulador",
        search: { banco: "la" },
        keywords: "simulador examen linea aerea",
      }),
    );
  }

  if (allowLocked) {
    out.push(
      base({
        id: "flash",
        kind: "flashcards",
        titulo: "Flashcards",
        detalle: "Repaso rápido de lo que marcaste por repasar",
        icon: "cards",
        minutes: 10,
        to: "/dashboard/flashcards",
        keywords: "flashcards repaso memoria tarjetas",
      }),
    );
  }

  out.push(
    base({
      id: "prueba",
      kind: "prueba",
      titulo: "Ponme a prueba",
      detalle: "Yaris comprueba si de verdad entendiste",
      icon: "spark",
      minutes: 8,
      keywords: "ponme a prueba yaris explicacion nemotecnia",
    }),
  );

  return out;
}
