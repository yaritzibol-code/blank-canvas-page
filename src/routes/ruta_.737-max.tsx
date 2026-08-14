/**
 * Ruta de aprendizaje 737 MAX (FCOM Rev. 16) — /ruta/737-max
 *
 * Réplica 1:1 del paquete FlightPath737MAXLearningPath dentro de la app:
 * shell propio (sidebar de 21 módulos), tablero, lección con capa pedagógica,
 * evaluación derivada y cobertura. Requiere sesión; el progreso vive en el
 * store (lp737_state + tema_progress) y se sincroniza a la nube.
 *
 * El contenido (~1.7 MB) se carga con import() dinámico al entrar (SEO.md §7):
 * ninguna otra página paga ese peso.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  answerLp737Question,
  completeLp737Lesson,
  getLp737State,
  lp737CompletedLessons,
  saveLp737Consolidation,
  useRequireAuth,
  useStore,
} from "@/lib/store";
import type { Lp737Consolidation, Lp737Course } from "@/lib/lp737/types";
import { CourseShell, type CourseVista } from "@/components/lp737/CourseShell";
import {
  CourseCoverage,
  CourseDashboard,
  CourseSimulator,
  ModuleView,
} from "@/components/lp737/CourseViews";

interface RutaSearch {
  m?: string;
  l?: string;
  vista?: "evaluacion" | "cobertura";
}

export const Route = createFileRoute("/ruta_/737-max")({
  validateSearch: (search: Record<string, unknown>): RutaSearch => ({
    m: typeof search.m === "string" ? search.m : undefined,
    l: typeof search.l === "string" ? search.l : undefined,
    vista: search.vista === "evaluacion" || search.vista === "cobertura" ? search.vista : undefined,
  }),
  head: () => ({
    // Página de app (auth): sin indexar.
    meta: [{ title: "Ruta 737 MAX · FlightPath" }, { name: "robots", content: "noindex" }],
  }),
  component: Ruta737Page,
});

function Ruta737Page() {
  const { user, ready } = useRequireAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [course, setCourse] = useState<Lp737Course | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Contenido bajo demanda: chunk propio, solo para quien entra a la ruta.
  useEffect(() => {
    let alive = true;
    void import("@/lib/lp737/content").then((m) => {
      if (alive) setCourse(m.LP737_COURSE);
    });
    return () => {
      alive = false;
    };
  }, []);

  const userId = user?.id ?? "";
  const state = useStore(() => getLp737State(userId));
  const completed = useStore(() => lp737CompletedLessons(userId));

  if (!ready || !user) return <div className="min-h-screen" style={{ background: "#FBFAF7" }} />;

  if (!course) {
    return (
      <div
        className="grid min-h-screen place-items-center"
        style={{ background: "#FBFAF7" }}
        aria-busy="true"
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-ink/15 border-t-coral-600" />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-haze-500">
            Cargando la ruta 737 MAX…
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
    setMenuOpen(false);
    const s: RutaSearch =
      v.tipo === "modulo"
        ? { m: v.moduleId, l: lessonId }
        : v.tipo === "evaluacion"
          ? { vista: "evaluacion" }
          : v.tipo === "cobertura"
            ? { vista: "cobertura" }
            : {};
    void navigate({ to: "/ruta/737-max", search: s as never });
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
      // Igual que el original: lección pedida o la primera sin completar.
      const lesson =
        (search.l && module.lessons.find((x) => x.id === search.l)) ||
        module.lessons.find((x) => !completed.includes(x.id)) ||
        module.lessons[0];
      contenido = (
        <ModuleView
          module={module}
          lesson={lesson}
          completedLessons={completed}
          answers={state.answers}
          consolidation={state.consolidation}
          onSelectLesson={(id) => irA({ tipo: "modulo", moduleId: module.id }, id)}
          onAnswer={(qid, option) => answerLp737Question(userId, qid, option)}
          onConsolidate={(activity: Lp737Consolidation, input) =>
            saveLp737Consolidation(userId, activity, input)
          }
          onComplete={() => {
            completeLp737Lesson(userId, lesson.id, lesson.title);
            // Fija la lección en la URL: sin esto, el selector "primera sin
            // completar" saltaría a la siguiente y el estado "Estudiada"
            // nunca se vería (el original conserva la lección activa).
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
        course={course}
        completedLessons={completed}
        onOpenModule={(id) => irA({ tipo: "modulo", moduleId: id })}
      />
    );
  } else {
    contenido = (
      <CourseDashboard
        course={course}
        completedLessons={completed}
        percent={percent}
        complete={completed.length}
        onOpenModule={(id) => irA({ tipo: "modulo", moduleId: id })}
      />
    );
  }

  return (
    <CourseShell
      course={course}
      vista={vista}
      percent={percent}
      complete={completed.length}
      menuOpen={menuOpen}
      onMenuToggle={() => setMenuOpen((v) => !v)}
      onNavigate={(v) => irA(v)}
    >
      {contenido}
    </CourseShell>
  );
}
