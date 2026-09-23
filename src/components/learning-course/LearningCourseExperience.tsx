import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { YarisChatModal } from "@/components/shared/YarisChatModal";
import { LearningPathExperience, useLearningPathStageView } from "@/components/lp/LearningPathExperience";
import { leaveLearningPath } from "@/lib/lp/contextual-return";
import { useSessionUser, type YarisContext } from "@/lib/store";
import type { LpCourse } from "@/lib/lp/course-types";
import { LP_COURSES, type LpCourseDef } from "@/lib/lp/registry";
import type { CourseVista } from "./CourseShell";

function ModuleStages({ course, vista, completedLessons, percent, onNavigate }: {
  course: LpCourse;
  vista: CourseVista;
  completedLessons: string[];
  percent: number;
  onNavigate: (vista: CourseVista) => void;
}) {
  const current = vista.tipo === "modulo" ? Math.max(0, course.modules.findIndex((module) => module.id === vista.moduleId)) : 0;
  useLearningPathStageView({
    labels: course.modules.map((module) => module.title),
    current,
    highest: course.modules.length - 1, // Existing course navigation permits every module.
    done: course.modules.map((module) => module.lessons.every((lesson) => completedLessons.includes(lesson.id))),
    percent,
    onNavigate: (index) => {
      const module = course.modules[index];
      if (module) onNavigate({ tipo: "modulo", moduleId: module.id });
    },
  });
  return null;
}

export function LearningCourseExperience({ def, course, vista, percent, completedLessons,
  onNavigate, onSwitchCourse, children }: {
  def: LpCourseDef;
  course: LpCourse;
  vista: CourseVista;
  percent: number;
  completedLessons: string[];
  onNavigate: (vista: CourseVista) => void;
  onSwitchCourse: (slug: string) => void;
  children: ReactNode;
}) {
  const user = useSessionUser();
  const [yarisOpen, setYarisOpen] = useState(false);
  const [yarisContext, setYarisContext] = useState<YarisContext>({});
  const module = vista.tipo === "modulo" ? course.modules.find((item) => item.id === vista.moduleId) : null;

  return <>
    <LearningPathExperience
      identity={{ category: "Learning Paths", subject: def.nombre,
        chapter: module?.title ?? (vista.tipo === "dashboard" ? "Recorrido" : vista.tipo === "evaluacion" ? "Evaluación" : "Cobertura"),
        title: course.meta.course || def.nombre, id: def.slug, categoryId: "ruta",
        subjectId: def.slug, chapterId: module?.id ?? vista.tipo }}
      user={user}
      onBack={() => leaveLearningPath("/ruta")}
      onYaris={(context) => { setYarisContext(context); setYarisOpen(true); }}
    >
      <ModuleStages course={course} vista={vista} completedLessons={completedLessons}
        percent={percent} onNavigate={onNavigate} />
      <div className="lp-course-controls">
        <label>Ruta <select value={def.slug} onChange={(event) => onSwitchCourse(event.target.value)}>
          {LP_COURSES.map((item) => <option key={item.slug} value={item.slug}>{item.nombre}</option>)}
        </select></label>
        <div>
          <button type="button" onClick={() => onNavigate({ tipo: "dashboard" })}>Tablero</button>
          <button type="button" onClick={() => onNavigate({ tipo: "evaluacion" })}>Evaluación</button>
          <button type="button" onClick={() => onNavigate({ tipo: "cobertura" })}>Cobertura</button>
        </div>
      </div>
      <main id="contenido" className="lp-course-content">{children}</main>
    </LearningPathExperience>
    <YarisChatModal open={yarisOpen} onClose={() => setYarisOpen(false)} user={user}
      seccion={`Learning Path · ${def.nombre}`} context={yarisContext} />
  </>;
}
