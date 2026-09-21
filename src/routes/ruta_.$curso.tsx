/**
 * Learning path — /ruta/$curso (jeppesen y rutas futuras)
 *
 * Réplica 1:1 de los paquetes de cursos dentro de la app: shell propio con
 * selector de ruta, tablero, lección con capa pedagógica (y evidencia visual
 * cuando el curso la trae), evaluación derivada y cobertura. Requiere sesión;
 * el progreso vive en el estado de rutas y tema_progress por prefijo y se
 * sincroniza a la nube.
 *
 * El contenido de cada curso se carga con import() dinámico al entrar
 * (SEO.md §7): ninguna otra página paga ese peso.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  answerLpQuestion,
  completeLpLesson,
  getLpState,
  lpCompletedLessons,
  saveLpConsolidation,
  useRequireAuth,
  useStore,
} from "@/lib/store";
import type { LpConsolidation, LpCourse } from "@/lib/lp/course-types";
import { LP_PROXIMAMENTE, lpCourseBySlug } from "@/lib/lp/registry";
import { adminOnly } from "@/components/shared/UnderConstruction";
import type { CourseVista } from "@/components/learning-course/CourseShell";
import { LearningCourseExperience } from "@/components/learning-course/LearningCourseExperience";
import {
  CourseCoverage,
  CourseDashboard,
  CourseSimulator,
  ModuleView,
} from "@/components/learning-course/CourseViews";

interface RutaSearch {
  m?: string;
  l?: string;
  vista?: "evaluacion" | "cobertura";
}

export const Route = createFileRoute("/ruta_/$curso")({
  validateSearch: (search: Record<string, unknown>): RutaSearch => ({
    m: typeof search.m === "string" ? search.m : undefined,
    l: typeof search.l === "string" ? search.l : undefined,
    vista: search.vista === "evaluacion" || search.vista === "cobertura" ? search.vista : undefined,
  }),
  head: () => ({
    // Página de app (auth): sin indexar.
    meta: [{ title: "Learning path · FlightPath" }, { name: "robots", content: "noindex" }],
  }),
  component: adminOnly(RutaCursoPage, "Learning paths", LP_PROXIMAMENTE),
});

function RutaCursoPage() {
  const { curso } = Route.useParams();
  const def = lpCourseBySlug(curso);
  const { user, ready } = useRequireAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [course, setCourse] = useState<LpCourse | null>(null);

  // Contenido bajo demanda: chunk propio por curso, solo para quien entra.
  useEffect(() => {
    if (!def) return;
    let alive = true;
    setCourse(null);
    void def.load().then((c) => {
      if (alive) setCourse(c);
    });
    return () => {
      alive = false;
    };
  }, [def]);

  const userId = user?.id ?? "";
  const state = useStore(() => getLpState(userId, def?.slug ?? ""));
  const completed = useStore(() => lpCompletedLessons(userId, def?.temaPrefix ?? "lp∅:"));

  if (!def) {
    return (
      <div
        className="grid min-h-screen place-items-center px-6 text-center"
        style={{ background: "#F5F5F7" }}
      >
        <div>
          <h1 className="font-display text-[26px] text-ink-950">No encontramos esta ruta.</h1>
          <button
            type="button"
            onClick={() => void navigate({ to: "/ruta" })}
            className="mt-5 rounded-full bg-coral-600 px-6 py-2.5 text-[13.5px] font-bold text-white"
          >
            Ver learning paths
          </button>
        </div>
      </div>
    );
  }

  if (!ready || !user) return <div className="min-h-screen" style={{ background: "#F5F5F7" }} />;

  if (!course) {
    return (
      <div
        className="grid min-h-screen place-items-center"
        style={{ background: "#F5F5F7" }}
        aria-busy="true"
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-ink/15 border-t-coral-600" />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-haze-500">
            Cargando {def.nombre}…
          </p>
        </div>
      </div>
    );
  }

  const vista: CourseVista =
    search.vista === "evaluacion"
      ? { tipo: "evaluacion" }
      : search.vista === "cobertura"
        ? { tipo: "cobertura" }
        : search.m
          ? { tipo: "modulo", moduleId: search.m }
          : { tipo: "dashboard" };

  const irA = (v: CourseVista, lessonId?: string) => {
    const s: RutaSearch =
      v.tipo === "modulo"
        ? { m: v.moduleId, l: lessonId }
        : v.tipo === "evaluacion"
          ? { vista: "evaluacion" }
          : v.tipo === "cobertura"
            ? { vista: "cobertura" }
            : {};
    void navigate({ to: "/ruta/$curso", params: { curso: def.slug }, search: s as never });
    window.scrollTo({ top: 0 });
  };

  const cambiarCurso = (slug: string) => {
    if (slug === def.slug) return;
    void navigate({ to: "/ruta/$curso", params: { curso: slug }, search: {} as never });
    window.scrollTo({ top: 0 });
  };

  const percent = Math.round((completed.length / course.meta.lesson_count) * 100);

  let contenido: React.ReactNode;
  if (vista.tipo === "modulo") {
    const module = course.modules.find((x) => x.id === vista.moduleId);
    if (!module) {
      contenido = (
        <div className="mx-auto max-w-[860px] px-6 py-20 text-center">
          <h1 className="font-display text-[26px] text-ink-950">No encontramos este módulo.</h1>
          <button
            type="button"
            onClick={() => irA({ tipo: "dashboard" })}
            className="mt-5 rounded-full bg-coral-600 px-6 py-2.5 text-[13.5px] font-bold text-white"
          >
            Volver a la ruta
          </button>
        </div>
      );
    } else {
      // Igual que los paquetes: lección pedida o la primera sin completar.
      const lesson =
        (search.l && module.lessons.find((x) => x.id === search.l)) ||
        module.lessons.find((x) => !completed.includes(x.id)) ||
        module.lessons[0];
      contenido = (
        <ModuleView
          def={def}
          module={module}
          lesson={lesson}
          completedLessons={completed}
          answers={state.answers}
          consolidation={state.consolidation}
          onSelectLesson={(id) => irA({ tipo: "modulo", moduleId: module.id }, id)}
          onAnswer={(qid, option) => answerLpQuestion(userId, def.slug, qid, option)}
          onConsolidate={(activity: LpConsolidation, input) =>
            saveLpConsolidation(userId, def.slug, activity, input)
          }
          onComplete={() => {
            completeLpLesson(userId, def.temaPrefix, def.actividadLabel, lesson.id, lesson.title);
            // Fija la lección en la URL para que el estado "Estudiada" sea
            // visible (el selector "primera sin completar" saltaría a la
            // siguiente en el mismo render).
            irA({ tipo: "modulo", moduleId: module.id }, lesson.id);
          }}
          onGoEvaluacion={() => irA({ tipo: "evaluacion" })}
          onGoDashboard={() => irA({ tipo: "dashboard" })}
        />
      );
    }
  } else if (vista.tipo === "evaluacion") {
    contenido = <CourseSimulator course={course} />;
  } else if (vista.tipo === "cobertura") {
    contenido = (
      <CourseCoverage
        def={def}
        course={course}
        completedLessons={completed}
        onOpenModule={(id) => irA({ tipo: "modulo", moduleId: id })}
      />
    );
  } else {
    contenido = (
      <CourseDashboard
        def={def}
        course={course}
        completedLessons={completed}
        percent={percent}
        complete={completed.length}
        onOpenModule={(id) => irA({ tipo: "modulo", moduleId: id })}
      />
    );
  }

  return (
    <LearningCourseExperience
      def={def}
      course={course}
      vista={vista}
      percent={percent}
      completedLessons={completed}
      onNavigate={(v) => irA(v)}
      onSwitchCourse={cambiarCurso}
    >
      {contenido}
    </LearningCourseExperience>
  );
}
