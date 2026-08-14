/**
 * Registro de Learning Paths.
 *
 * Cada def concentra lo que distingue a una ruta: su copy 1:1 (hero, cifras,
 * burbuja de Yaris, cobertura), su prefijo de progreso en tema_progress y el
 * import() dinámico de su contenido. El shell, la lección, la evaluación y la
 * cobertura son los mismos componentes para todas las rutas.
 *
 * Para agregar una ruta nueva: generar su content.ts (ver lp737/lpjepp),
 * añadir su def aquí y listo — el hub /ruta y el selector la muestran solos.
 */
import type { Lp737Course, Lp737Lesson, Lp737Meta, Lp737Module } from "@/lib/lp737/types";

export interface LpHeroCopy {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  meta: (m: Lp737Meta) => string[];
}

export interface LpStatCard {
  label: string;
  value: string;
  small: string;
}

export interface LpCourseDef {
  /** URL: /ruta/$slug */
  slug: string;
  /** Nombre completo para el hub y el selector. */
  nombre: string;
  /** Texto corto bajo "Ruta de aprendizaje" en el sidebar. */
  sidebarLabel: string;
  /** Blurb de la card del hub. */
  descripcion: string;
  /** Cifras estáticas para el hub (== meta del contenido; el hub no carga el chunk). */
  lessonCount: number;
  questionCount: number;
  moduleCount: number;
  /** Prefijo en tema_progress ("lp737:") y courseId del estado de respuestas. */
  temaPrefix: string;
  /** Prefijo del label de actividad ("Ruta 737 · <lección>"). */
  actividadLabel: string;
  hero: LpHeroCopy;
  dashboardStats: (m: Lp737Meta, percent: number, complete: number) => LpStatCard[];
  yaris: { strong: string; p: string };
  moduloEyebrow: (mod: Lp737Module) => string;
  /** Línea de fuente al pie de cada lección. */
  fuenteFooter: (lesson: Lp737Lesson) => string;
  coverage: {
    hero: LpHeroCopy;
    resumen: (m: Lp737Meta) => { label: string; value: string }[];
    quality: { eyebrow: string; title: string; p: string };
    /** true: columna extra de Visuales y rangos de fuente en vez de PDF. */
    conVisuales: boolean;
  };
  load: () => Promise<Lp737Course>;
}

export function fmtNum(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value).replaceAll(",", " ");
}

export const LP_COURSES: LpCourseDef[] = [
  {
    slug: "737-max",
    nombre: "737 MAX · FCOM Rev. 16",
    sidebarLabel: "737 MAX · FCOM Rev. 16",
    descripcion:
      "El FCOM completo como ruta técnica: limitaciones, procedimientos, performance y sistemas, con preguntas creadas únicamente a partir de lo que acabas de estudiar.",
    lessonCount: 265,
    questionCount: 530,
    moduleCount: 21,
    temaPrefix: "lp737:",
    actividadLabel: "Ruta 737",
    hero: {
      eyebrow: "FCOM Rev. 16 · Ruta completa",
      title: "Comprende el 737 MAX",
      accent: "sistema por sistema",
      description:
        "Una ruta técnica y digerible. Lees, conectas la lógica operacional y después respondes preguntas creadas únicamente a partir de lo que acabas de estudiar.",
      meta: (m) => [
        `${fmtNum(m.source_pages)} páginas`,
        `${m.lesson_count} lecciones`,
        `${m.question_count} preguntas derivadas`,
      ],
    },
    dashboardStats: (m, percent, complete) => [
      {
        label: "Temas del manual",
        value: fmtNum(m.topics_traced ?? 1915),
        small: "Todos trazados",
      },
      { label: "Lecciones técnicas", value: String(m.lesson_count), small: "De principio a fin" },
      { label: "Evaluaciones", value: String(m.question_count), small: "Desde las lecciones" },
      { label: "Tu avance", value: `${percent}%`, small: `${complete} completadas` },
    ],
    yaris: {
      strong: "No es suerte. Es preparación.",
      p: "Primero entiende qué hace el sistema y por qué. Al final de cada lección compruebas el razonamiento; no memorizas preguntas sueltas.",
    },
    moduloEyebrow: (mod) => `Módulo ${mod.id} · Capítulo ${mod.chapter_code}`,
    fuenteFooter: (lesson) =>
      `FCOM ref. ${lesson.reference} · PDF ${lesson.source_pages[0]}–${lesson.source_pages[1]}`,
    coverage: {
      hero: {
        eyebrow: "Trazabilidad completa",
        title: "Cobertura del manual",
        accent: "sin atajos",
        description:
          "Cada página del FCOM pertenece a una lección; cada lección declara su referencia y evalúa sólo lo que explica.",
        meta: (m) => [
          `${m.module_count} módulos`,
          `${m.lesson_count} lecciones`,
          `${fmtNum(m.topics_traced ?? 1915)} temas trazados`,
        ],
      },
      resumen: (m) => [
        { label: "Primera página", value: "1" },
        { label: "Última página", value: fmtNum(m.source_pages) },
        { label: "Huecos", value: "0" },
        { label: "Preguntas externas", value: "0" },
      ],
      quality: {
        eyebrow: "Regla de calidad",
        title: "La evaluación nace después de explicar.",
        p: "El contenido de esta ruta se compila exclusivamente desde los 21 módulos de lecciones validados. No existe conexión con ningún banco externo.",
      },
      conVisuales: false,
    },
    load: () => import("@/lib/lp737/content").then((m) => m.LP737_COURSE),
  },
  {
    slug: "jeppesen",
    nombre: "Jeppesen · Interpretación de cartas",
    sidebarLabel: "Jeppesen · Interpretación operacional",
    descripcion:
      "El lenguaje Jeppesen por capas: vigencia, ruta, vertical, aproximación y PBN — cada lección con su evidencia visual del manual y tareas sobre la carta real.",
    lessonCount: 80,
    questionCount: 160,
    moduleCount: 16,
    temaPrefix: "lpjepp:",
    actividadLabel: "Ruta Jeppesen",
    hero: {
      eyebrow: "Jeppesen · Ruta completa",
      title: "Lee la carta como",
      accent: "una decisión de vuelo",
      description:
        "Aprende el lenguaje Jeppesen por capas: confirma vigencia, reconstruye la ruta, entiende la vertical y cierra cada lectura con comunicación, contingencia y autorización.",
      meta: (m) => [
        `${m.module_count} módulos`,
        `${m.lesson_count} lecciones`,
        `${m.visual_count ?? m.lesson_count} lecciones ilustradas`,
      ],
    },
    dashboardStats: (m, percent, complete) => [
      { label: "Fuente oficial", value: fmtNum(m.source_pages), small: "Páginas del manual" },
      { label: "Lecciones técnicas", value: String(m.lesson_count), small: "De principio a fin" },
      { label: "Evaluaciones", value: String(m.question_count), small: "Basadas en lo explicado" },
      { label: "Tu avance", value: `${percent}%`, small: `${complete} completadas` },
    ],
    yaris: {
      strong: "No memorices dibujitos: brieféa decisiones.",
      p: "Cada símbolo debe responder qué área protege, qué capacidad promete y qué autorización necesitas. La carta vigente, sus notas y NOTAM siempre mandan.",
    },
    moduloEyebrow: (mod) => `Módulo ${mod.id} · Fuente §${mod.chapter_code}`,
    fuenteFooter: (lesson) =>
      `${lesson.reference}. Material educativo: confirma carta, leyenda, NOTAM, AIP, manuales del operador y autorización vigentes antes de operar.`,
    coverage: {
      hero: {
        eyebrow: "Trazabilidad completa",
        title: "Fuentes, imágenes y",
        accent: "límites de uso",
        description:
          "Cada lección declara páginas exactas del manual, jurisdicción, fuente primaria y límite operacional. Los recortes visuales se usan para práctica educativa, nunca como carta operacional.",
        meta: (m) => [
          `${m.unique_visual_count ?? 0} recursos visuales`,
          `${m.applied_question_count ?? 0} casos aplicados`,
          `${m.lesson_count} lecciones verificadas`,
        ],
      },
      resumen: (m) => [
        { label: "Manual oficial", value: fmtNum(m.source_pages) },
        { label: "Lecciones verificadas", value: String(m.lesson_count) },
        { label: "Ilustradas", value: String(m.visual_count ?? 0) },
        { label: "Casos aplicados", value: String(m.applied_question_count ?? 0) },
      ],
      quality: {
        eyebrow: "Regla de calidad",
        title: "La evaluación nace después de explicar.",
        p: "Cada afirmación crítica está auditada contra el manual suministrado y fuentes primarias, con jurisdicción y límites declarados por lección. Los recortes visuales no son aptos para navegación.",
      },
      conVisuales: true,
    },
    load: () => import("@/lib/lpjepp/content").then((m) => m.LPJEPP_COURSE),
  },
];

export function lpCourseBySlug(slug: string): LpCourseDef | undefined {
  return LP_COURSES.find((c) => c.slug === slug);
}
