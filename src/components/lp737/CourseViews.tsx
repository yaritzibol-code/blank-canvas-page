/**
 * Vistas de la Ruta 737 MAX (1:1 con el paquete): tablero con buscador y grid
 * de módulos, vista de módulo (rail de lecciones + escenario), evaluación
 * derivada de las lecciones y cobertura del manual.
 */
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { CourseHero, ProgressTrack, fmtNum } from "./CourseShell";
import { LessonStage } from "./LessonStage";
import type { Lp737Consolidation, Lp737Course, Lp737Lesson, Lp737Module } from "@/lib/lp737/types";
import type { Lp737ConsolidationResult } from "@/lib/store";

export interface ModuleStats {
  completed: number;
  percent: number;
  questions: number;
}

export function moduleStats(module: Lp737Module, completedLessons: string[]): ModuleStats {
  const completed = module.lessons.filter((l) => completedLessons.includes(l.id)).length;
  return {
    completed,
    percent: Math.round((completed / module.lessons.length) * 100),
    questions: module.lessons.reduce((sum, l) => sum + l.questions.length, 0),
  };
}

/* ───────────────────────── Tablero ───────────────────────── */

export function CourseDashboard({
  course,
  completedLessons,
  percent,
  complete,
  onOpenModule,
}: {
  course: Lp737Course;
  completedLessons: string[];
  percent: number;
  complete: number;
  onOpenModule: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visibles = course.modules.filter(
    (m) => !q || `${m.id} ${m.title} ${m.summary}`.toLowerCase().includes(q),
  );

  const stats = [
    {
      label: "Temas del manual",
      value: fmtNum(course.meta.topics_traced ?? 1915),
      small: "Todos trazados",
    },
    {
      label: "Lecciones técnicas",
      value: String(course.meta.lesson_count),
      small: "De principio a fin",
    },
    {
      label: "Evaluaciones",
      value: String(course.meta.question_count),
      small: "Desde las lecciones",
    },
    { label: "Tu avance", value: `${percent}%`, small: `${complete} completadas` },
  ];

  return (
    <>
      <CourseHero
        eyebrow="FCOM Rev. 16 · Ruta completa"
        title="Comprende el 737 MAX"
        accent="sistema por sistema"
        description="Una ruta técnica y digerible. Lees, conectas la lógica operacional y después respondes preguntas creadas únicamente a partir de lo que acabas de estudiar."
        meta={[
          `${fmtNum(course.meta.source_pages)} páginas`,
          `${course.meta.lesson_count} lecciones`,
          `${course.meta.question_count} preguntas derivadas`,
        ]}
      />
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8 py-8">
        {/* Cifras */}
        <section
          aria-label="Cifras del curso"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 -mt-16 relative z-10"
        >
          {stats.map((s) => (
            <article
              key={s.label}
              className="rounded-2xl border border-ink/8 bg-white p-5 shadow-card"
            >
              <span className="text-[12px] font-semibold text-haze-500">{s.label}</span>
              <strong className="mt-1 block font-display text-[30px] leading-none tracking-tight text-ink-950">
                {s.value}
              </strong>
              <small className="mt-1.5 block text-[12px] text-haze-400">{s.small}</small>
            </article>
          ))}
        </section>

        {/* Panel de Yaris */}
        <section className="mt-6 rounded-3xl border border-ink/8 bg-white p-5 sm:p-6 shadow-card">
          <div className="flex items-center gap-5">
            <img
              src="/img/yaris-mini.png"
              alt="Mini Yaris, instructora de FlightPath"
              width={96}
              height={96}
              className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full border border-coral-300/50 bg-coral-50 object-cover object-top"
            />
            <div className="min-w-0 rounded-2xl border border-ink/8 px-5 py-4">
              <strong className="text-[14.5px] text-coral-700">
                No es suerte. Es preparación.
              </strong>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-950/75">
                Primero entiende qué hace el sistema y por qué. Al final de cada lección compruebas
                el razonamiento; no memorizas preguntas sueltas.
              </p>
            </div>
          </div>
        </section>

        {/* Toolbar + grid de módulos */}
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-haze-500">
              Temario completo
            </span>
            <h2 className="font-display mt-1 text-[26px] tracking-tight text-ink-950">
              Tu ruta de vuelo
            </h2>
          </div>
          <label className="flex items-center gap-2 rounded-full border-2 border-ink/12 bg-white px-4 py-2 focus-within:border-lapis">
            <Icon n="search" size={15} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar sistema o tema"
              aria-label="Buscar módulos"
              className="w-44 bg-transparent text-[13.5px] text-ink-950 outline-none placeholder:text-haze-400"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((m) => {
            const s = moduleStats(m, completedLessons);
            const stateLabel =
              s.completed === m.lessons.length
                ? "Completado"
                : s.completed
                  ? "En curso"
                  : "Pendiente";
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onOpenModule(m.id)}
                className="group flex h-full flex-col rounded-2xl border border-ink/8 bg-white p-5 text-left shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-ink-950 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-white">
                    MÓDULO {m.id}
                  </span>
                  <span
                    className={`text-[11.5px] font-bold ${
                      stateLabel === "Completado"
                        ? "text-lapis"
                        : stateLabel === "En curso"
                          ? "text-coral-700"
                          : "text-haze-400"
                    }`}
                  >
                    {stateLabel}
                  </span>
                </div>
                <h3 className="font-display mt-3 text-[17px] leading-snug tracking-tight text-ink-950">
                  {m.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-haze-600">
                  {m.summary}
                </p>
                <div className="mt-auto pt-4">
                  <ProgressTrack percent={s.percent} className="h-1.5" />
                  <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-haze-500">
                    <span>{m.lessons.length} lecciones</span>
                    <span>{s.questions} preguntas</span>
                    <span>
                      PDF {m.source_pages[0]}–{m.source_pages[1]}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {visibles.length === 0 && (
          <div className="mt-8 rounded-2xl border border-ink/10 bg-white px-6 py-8 text-center text-[14px] text-haze-600">
            No encontramos un módulo con ese término.
          </div>
        )}
      </div>
    </>
  );
}

/* ───────────────────────── Vista de módulo ───────────────────────── */

export function ModuleView({
  module,
  lesson,
  completedLessons,
  answers,
  consolidation,
  onSelectLesson,
  onAnswer,
  onConsolidate,
  onComplete,
  onGoEvaluacion,
  onGoDashboard,
}: {
  module: Lp737Module;
  lesson: Lp737Lesson;
  completedLessons: string[];
  answers: Record<string, number>;
  consolidation: Record<string, Lp737ConsolidationResult>;
  onSelectLesson: (id: string) => void;
  onAnswer: (questionId: string, option: number) => void;
  onConsolidate: (activity: Lp737Consolidation, input: boolean | string[]) => void;
  onComplete: () => void;
  onGoEvaluacion: () => void;
  onGoDashboard: () => void;
}) {
  const stats = moduleStats(module, completedLessons);
  const lessonIndex = module.lessons.indexOf(lesson);
  const isComplete = completedLessons.includes(lesson.id);

  return (
    <>
      <CourseHero
        compact
        eyebrow={`Módulo ${module.id} · Capítulo ${module.chapter_code}`}
        title={module.title}
        description={module.summary}
        meta={[
          `PDF ${module.source_pages[0]}–${module.source_pages[1]}`,
          `${module.lessons.length} lecciones`,
          `${stats.questions} preguntas derivadas`,
        ]}
      />
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8 py-8">
        {/* Overview */}
        <section className="relative z-10 -mt-16 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-3xl border border-ink/8 bg-white p-6 shadow-card">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-haze-500">
              Progreso del módulo
            </span>
            <h2 className="font-display mt-1 text-[24px] tracking-tight text-ink-950">
              {stats.completed} de {module.lessons.length} lecciones
            </h2>
            <ProgressTrack percent={stats.percent} className="mt-4" />
            <div className="mt-2.5 flex items-center justify-between text-[12.5px] text-haze-500">
              <span>Comprensión y evaluación</span>
              <strong className="text-ink-950">{stats.percent}%</strong>
            </div>
          </article>
          <article className="rounded-3xl bg-ink-950 p-6 text-white shadow-navy">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-coral-300">
              Método FlightPath
            </span>
            <strong className="font-display mt-2 block text-[19px] leading-snug tracking-tight">
              Anticipa → comprende → practica → consolida
            </strong>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
              Cada ciclo parte de una decisión de piloto y termina recuperando lo aprendido.
            </p>
          </article>
        </section>

        {/* Rail + lección */}
        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[290px_1fr]">
          <aside
            aria-label="Lecciones del módulo"
            className="rounded-3xl border border-ink/8 bg-white p-4 shadow-card lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
          >
            <div className="px-2 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-haze-500">
                Lecciones
              </span>
              <strong className="mt-0.5 block text-[13px] leading-snug text-ink-950">
                {module.title}
              </strong>
            </div>
            <div className="space-y-1">
              {module.lessons.map((item, index) => {
                const done = completedLessons.includes(item.id);
                const active = item.id === lesson.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectLesson(item.id)}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] leading-snug transition-colors ${
                      active
                        ? "bg-ink-950 text-white"
                        : done
                          ? "text-ink-950/75 hover:bg-haze-50"
                          : "text-ink-950/60 hover:bg-haze-50"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] pt-0.5 ${active ? "text-coral-300" : "text-haze-400"}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">{item.title}</span>
                    {done && (
                      <span className={active ? "text-coral-300" : "text-lapis"}>
                        <Icon n="check" size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <LessonStage
            module={module}
            lesson={lesson}
            lessonIndex={lessonIndex}
            answers={answers}
            consolidation={consolidation}
            isComplete={isComplete}
            onAnswer={onAnswer}
            onConsolidate={onConsolidate}
            onComplete={onComplete}
            onSelectLesson={onSelectLesson}
            onGoEvaluacion={onGoEvaluacion}
            onGoDashboard={onGoDashboard}
          />
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── Evaluación ───────────────────────── */

interface SimQuestionItem {
  module: Lp737Module;
  lesson: Lp737Lesson;
  question: Lp737Lesson["questions"][number];
}

interface SimSession {
  questions: SimQuestionItem[];
  index: number;
  score: number;
  answered: boolean;
  selected: number | null;
}

export function CourseSimulator({ course }: { course: Lp737Course }) {
  const [moduleId, setModuleId] = useState("all");
  const [count, setCount] = useState(10);
  const [sim, setSim] = useState<SimSession | null>(null);

  const pool = useMemo<SimQuestionItem[]>(
    () =>
      course.modules.flatMap((module) =>
        module.lessons.flatMap((lesson) =>
          lesson.questions.map((question) => ({ module, lesson, question })),
        ),
      ),
    [course],
  );

  const start = () => {
    const filtered = pool.filter((item) => moduleId === "all" || item.module.id === moduleId);
    const shuffled = [...filtered]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, filtered.length));
    setSim({ questions: shuffled, index: 0, score: 0, answered: false, selected: null });
  };

  if (!sim) {
    return (
      <>
        <CourseHero
          compact
          eyebrow="Evaluación razonada"
          title="Comprueba tu"
          accent="comprensión"
          description="Selecciona un módulo. Las preguntas salen únicamente de sus lecciones y siempre incluyen la explicación enseñada."
          meta={[
            `${course.meta.question_count} preguntas disponibles`,
            "Sin banco externo",
            "Retroalimentación inmediata",
          ]}
        />
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-8">
          <section className="relative z-10 -mt-16 rounded-3xl border border-ink/8 bg-white p-6 sm:p-7 shadow-card">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-haze-500">
              Configura tu sesión
            </span>
            <h2 className="font-display mt-1 text-[24px] tracking-tight text-ink-950">
              ¿Qué quieres repasar?
            </h2>
            <p className="mt-1.5 text-[13.5px] text-haze-600">
              Una sesión corta sirve para comprobar conexiones, no para adivinar reactivos.
            </p>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <label className="flex min-w-0 flex-col gap-1.5 text-[12px] font-bold text-haze-600">
                Módulo
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="max-w-[340px] rounded-xl border-2 border-ink/12 bg-white px-3 py-2.5 text-[13.5px] font-medium text-ink-950 outline-none focus:border-lapis"
                >
                  <option value="all">Toda la ruta</option>
                  {course.modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} · {m.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[12px] font-bold text-haze-600">
                Número de preguntas
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="rounded-xl border-2 border-ink/12 bg-white px-3 py-2.5 text-[13.5px] font-medium text-ink-950 outline-none focus:border-lapis"
                >
                  {[5, 10, 20].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={start}
                className="rounded-full bg-coral-600 px-6 py-2.5 text-[13.5px] font-bold text-white hover:opacity-90"
              >
                Iniciar evaluación →
              </button>
            </div>
          </section>
        </div>
      </>
    );
  }

  const { questions, index, score, answered, selected } = sim;

  if (index >= questions.length) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <>
        <CourseHero
          compact
          mascot={false}
          eyebrow="Sesión completada"
          title="Resultado"
          accent={`${percent}%`}
          description="El resultado señala qué conexiones conviene volver a estudiar. No te penaliza: te da la siguiente ruta."
          meta={[
            `${score} correctas`,
            `${questions.length - score} por revisar`,
            `${questions.length} respondidas`,
          ]}
        />
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-8">
          <section className="relative z-10 -mt-16 flex flex-wrap items-center gap-6 rounded-3xl border border-ink/8 bg-white p-6 sm:p-7 shadow-card">
            <img
              src="/img/yaris-mini.png"
              alt="Mini Yaris"
              width={110}
              height={110}
              className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-haze-500">
                Siguiente paso
              </span>
              <h2 className="font-display mt-1 text-[22px] leading-tight tracking-tight text-ink-950">
                {percent >= 80
                  ? "La lógica está conectando."
                  : "Vuelve a las explicaciones marcadas."}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-haze-600">
                {percent >= 80
                  ? "Mantén el ritmo y repasa las referencias de las que dudaste."
                  : "Relee las lecciones de esta sesión y busca el flujo operacional antes de repetir."}
              </p>
              <button
                type="button"
                onClick={() => setSim(null)}
                className="mt-4 rounded-full bg-coral-600 px-6 py-2.5 text-[13.5px] font-bold text-white hover:opacity-90"
              >
                Nueva sesión
              </button>
            </div>
          </section>
        </div>
      </>
    );
  }

  const item = questions[index];
  const q = item.question;
  const progressPct = Math.round(((index + (answered ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-8">
      <section className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white px-5 py-4 shadow-card">
        <div className="min-w-0 flex-1">
          <span className="text-[12px] font-semibold text-haze-600">
            Pregunta {index + 1} de {questions.length}
          </span>
          <ProgressTrack percent={progressPct} className="mt-2 h-1.5" />
        </div>
        <button
          type="button"
          onClick={() => setSim(null)}
          className="rounded-full border-2 border-ink/15 bg-white px-4 py-1.5 text-[12.5px] font-bold text-ink-950 hover:border-lapis/60"
        >
          Salir
        </button>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-haze-500">
        <span className="rounded-full bg-ink-950 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-white">
          MÓDULO {item.module.id}
        </span>
        <span>Lección {item.lesson.id}</span>
      </div>

      <article className="mt-3 rounded-3xl border border-ink/8 bg-white p-6 shadow-card">
        <p className="text-[15.5px] font-semibold leading-relaxed text-ink-950">{q.prompt}</p>
        <div className="mt-4 flex flex-col gap-2">
          {q.options.map((option, i) => {
            const isCorrect = answered && i === q.correct;
            const isWrong = answered && i === selected && selected !== q.correct;
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() =>
                  setSim((s) =>
                    s
                      ? {
                          ...s,
                          answered: true,
                          selected: i,
                          score: s.score + (i === q.correct ? 1 : 0),
                        }
                      : s,
                  )
                }
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-[14px] leading-relaxed transition-colors ${
                  isCorrect
                    ? "border-lapis bg-lapis/8"
                    : isWrong
                      ? "border-coral-600/50 bg-coral-50"
                      : "border-ink/10 bg-white hover:border-lapis/50 disabled:hover:border-ink/10"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11.5px] font-bold ${
                    isCorrect
                      ? "bg-lapis text-white"
                      : isWrong
                        ? "bg-coral-600 text-white"
                        : "bg-ink/6 text-ink-700"
                  }`}
                >
                  {"ABCD"[i]}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <>
            <div className="mt-4 rounded-xl bg-haze-50 px-4 py-3 text-[13.5px] leading-relaxed">
              <strong className="text-ink-950">
                {selected === q.correct
                  ? "Bien razonado."
                  : `La respuesta correcta es ${"ABCD"[q.correct]}.`}
              </strong>
              <p className="mt-1 text-ink-700/80">{q.explanation}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-haze-500">
                <Icon n="book" size={13} /> {item.lesson.title} · {item.lesson.reference}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setSim((s) =>
                  s ? { ...s, index: s.index + 1, answered: false, selected: null } : s,
                )
              }
              className="mt-4 rounded-full bg-coral-600 px-6 py-2.5 text-[13.5px] font-bold text-white hover:opacity-90"
            >
              {index === questions.length - 1 ? "Ver resultado →" : "Siguiente pregunta →"}
            </button>
          </>
        )}
      </article>
    </div>
  );
}

/* ───────────────────────── Cobertura ───────────────────────── */

export function CourseCoverage({
  course,
  completedLessons,
  onOpenModule,
}: {
  course: Lp737Course;
  completedLessons: string[];
  onOpenModule: (id: string) => void;
}) {
  const resumen = [
    { label: "Primera página", value: "1" },
    { label: "Última página", value: fmtNum(course.meta.source_pages) },
    { label: "Huecos", value: "0" },
    { label: "Preguntas externas", value: "0" },
  ];
  return (
    <>
      <CourseHero
        compact
        eyebrow="Trazabilidad completa"
        title="Cobertura del manual"
        accent="sin atajos"
        description="Cada página del FCOM pertenece a una lección; cada lección declara su referencia y evalúa sólo lo que explica."
        meta={[
          `${course.meta.module_count} módulos`,
          `${course.meta.lesson_count} lecciones`,
          `${fmtNum(course.meta.topics_traced ?? 1915)} temas trazados`,
        ]}
      />
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8 py-8">
        <section className="relative z-10 -mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resumen.map((r) => (
            <article
              key={r.label}
              className="rounded-2xl border border-ink/8 bg-white p-5 shadow-card"
            >
              <span className="text-[12px] font-semibold text-haze-500">{r.label}</span>
              <strong className="mt-1 block font-display text-[28px] leading-none tracking-tight text-ink-950">
                {r.value}
              </strong>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-ink/8 bg-white p-6 shadow-card">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-haze-500">
            Regla de calidad
          </span>
          <h2 className="font-display mt-1 text-[22px] tracking-tight text-ink-950">
            La evaluación nace después de explicar.
          </h2>
          <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed text-haze-600">
            El contenido de esta ruta se compila exclusivamente desde los 21 módulos de lecciones
            validados. No existe conexión con ningún banco externo.
          </p>
        </section>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-ink/8 bg-white shadow-card">
          <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-haze-500">
                {["Módulo", "Contenido", "Páginas PDF", "Lecciones", "Preguntas", "Tu avance"].map(
                  (h) => (
                    <th key={h} className="border-b-2 border-ink/10 px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {course.modules.map((m) => {
                const s = moduleStats(m, completedLessons);
                return (
                  <tr key={m.id} className="border-b border-ink/6 last:border-0">
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-ink-950 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-white">
                        M{m.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onOpenModule(m.id)}
                        className="text-left font-semibold text-ink-950 hover:text-coral-700 transition-colors"
                      >
                        {m.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap text-haze-600">
                      {m.source_pages[0]}–{m.source_pages[1]}
                    </td>
                    <td className="px-4 py-3">{m.lessons.length}</td>
                    <td className="px-4 py-3">{s.questions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <ProgressTrack percent={s.percent} className="h-1.5 w-24" />
                        <span className="font-semibold">{s.percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
