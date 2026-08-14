/**
 * Escenario de lección 1:1 del paquete: objetivo/por qué importa, activación,
 * explicación técnica, puntos, secuencia operacional, error frecuente,
 * refuerzo de Yaris, preguntas derivadas y las 3 consolidaciones. El botón
 * "Marcar como estudiada" se habilita solo con TODO respondido (preguntas +
 * consolidaciones), igual que el original.
 */
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import type {
  Lp737Consolidation,
  Lp737Lesson,
  Lp737Module,
  Lp737Question,
} from "@/lib/lp737/types";
import type { Lp737ConsolidationResult } from "@/lib/store";
import type { LpCourseDef } from "@/lib/lp/registry";

const LETTERS = "ABCDEFGHIJ";

const REINFORCEMENT_TONE: Record<string, string> = {
  mnemonic: "bg-coral-100 text-coral-700",
  example: "bg-haze-100 text-ink-700",
  tip: "bg-[#e7f2ec] text-[#1a7a4a]",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-haze-500">
      {children}
    </span>
  );
}

export function QuestionCard({
  question,
  index,
  selected,
  onAnswer,
}: {
  question: Lp737Question;
  index: number;
  selected: number | undefined;
  onAnswer: (option: number) => void;
}) {
  const answered = Number.isInteger(selected);
  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-5 shadow-card">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-haze-400">
        Pregunta {index + 1}
      </div>
      <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink-950">
        {question.prompt}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isCorrect = answered && i === question.correct;
          const isWrong = answered && i === selected && selected !== question.correct;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onAnswer(i)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-[14px] leading-relaxed transition-colors ${
                isCorrect
                  ? "border-lapis bg-lapis/8 text-ink-950"
                  : isWrong
                    ? "border-coral-600/50 bg-coral-50 text-ink-950"
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
                {LETTERS[i]}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-4 rounded-xl bg-haze-50 px-4 py-3 text-[13.5px] leading-relaxed">
          <strong className="text-ink-950">
            {selected === question.correct
              ? "Bien razonado."
              : `La respuesta correcta es ${LETTERS[question.correct]}.`}
          </strong>
          <p className="mt-1 text-ink-700/80">{question.explanation}</p>
        </div>
      )}
    </article>
  );
}

function SelectField({
  ariaLabel,
  options,
  value,
  disabled,
  onChange,
}: {
  ariaLabel: string;
  options: string[];
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <select
      aria-label={ariaLabel}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 max-w-full rounded-lg border-2 border-ink/15 bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink-950 outline-none focus:border-lapis disabled:bg-haze-50"
    >
      <option value="">Selecciona…</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function ConsolidationCard({
  activity,
  index,
  result,
  onSubmit,
}: {
  activity: Lp737Consolidation;
  index: number;
  result: Lp737ConsolidationResult | undefined;
  onSubmit: (input: boolean | string[]) => void;
}) {
  const answered = Boolean(result);
  const slots =
    activity.type === "complete_sentence"
      ? activity.parts.length
      : activity.type === "complete_table"
        ? activity.rows.length
        : 0;
  const [draft, setDraft] = useState<string[]>(() => Array(slots).fill(""));
  const listo = draft.every((v) => v !== "");

  let interaction: React.ReactNode = null;
  if (activity.type === "true_false") {
    interaction = (
      <div className="flex flex-wrap gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            disabled={answered}
            onClick={() => onSubmit(v)}
            className={`rounded-full border-2 px-5 py-2 text-[13.5px] font-bold transition-colors ${
              answered && result?.value === v
                ? "border-lapis bg-lapis text-white"
                : "border-ink/15 bg-white text-ink-950 hover:border-lapis/60 disabled:opacity-60"
            }`}
          >
            {v ? "Verdadero" : "Falso"}
          </button>
        ))}
      </div>
    );
  } else if (activity.type === "complete_sentence") {
    const values = result?.values ?? draft;
    interaction = (
      <>
        <div className="flex flex-wrap items-center gap-2 text-[14px] text-ink-950">
          <span>{activity.parts[0]}</span>
          <SelectField
            ariaLabel="Primer paso"
            options={activity.options}
            value={values[0] ?? ""}
            disabled={answered}
            onChange={(v) => setDraft((d) => [v, d[1] ?? ""])}
          />
          <span>{activity.parts[1]}</span>
          <SelectField
            ariaLabel="Último paso"
            options={activity.options}
            value={values[1] ?? ""}
            disabled={answered}
            onChange={(v) => setDraft((d) => [d[0] ?? "", v])}
          />
          <span>.</span>
        </div>
        {!answered && (
          <button
            type="button"
            disabled={!listo}
            onClick={() => onSubmit(draft)}
            className="mt-3 rounded-full border-2 border-ink/15 bg-white px-5 py-2 text-[13px] font-bold text-ink-950 hover:border-lapis/60 disabled:opacity-45"
          >
            Comprobar flujo
          </button>
        )}
      </>
    );
  } else {
    const values = result?.values ?? draft;
    interaction = (
      <>
        <div
          role="table"
          aria-label="Conceptos y funciones"
          className="overflow-hidden rounded-xl border border-ink/10"
        >
          <div
            role="row"
            className="grid grid-cols-[minmax(110px,0.6fr)_1fr] gap-3 bg-haze-50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-haze-500"
          >
            <span role="columnheader">Concepto</span>
            <span role="columnheader">Función o significado</span>
          </div>
          {activity.rows.map((row, i) => (
            <div
              key={row.label}
              role="row"
              className="grid grid-cols-[minmax(110px,0.6fr)_1fr] items-center gap-3 border-t border-ink/8 px-4 py-2.5"
            >
              <strong role="cell" className="text-[13px] text-ink-950">
                {row.label}
              </strong>
              <div role="cell">
                <SelectField
                  ariaLabel={`Función de ${row.label}`}
                  options={activity.options}
                  value={values[i] ?? ""}
                  disabled={answered}
                  onChange={(v) =>
                    setDraft((d) => {
                      const next = [...d];
                      next[i] = v;
                      return next;
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
        {!answered && (
          <button
            type="button"
            disabled={!listo}
            onClick={() => onSubmit(draft)}
            className="mt-3 rounded-full border-2 border-ink/15 bg-white px-5 py-2 text-[13px] font-bold text-ink-950 hover:border-lapis/60 disabled:opacity-45"
          >
            Comprobar tabla
          </button>
        )}
      </>
    );
  }

  return (
    <article
      className={`rounded-2xl border p-5 shadow-card ${
        answered
          ? result?.correct
            ? "border-lapis/40 bg-lapis/4"
            : "border-coral-600/35 bg-coral-50/60"
          : "border-ink/10 bg-white"
      }`}
    >
      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-haze-400">
        Actividad {index + 1} · {activity.title}
      </div>
      <p className="mt-2 mb-4 text-[14.5px] font-semibold leading-relaxed text-ink-950">
        {activity.prompt}
      </p>
      {interaction}
      {answered && (
        <div className="mt-4 rounded-xl bg-white/80 border border-ink/8 px-4 py-3 text-[13.5px] leading-relaxed">
          <strong className="text-ink-950">
            {result?.correct ? "Conexión correcta." : "Revisa la relación."}
          </strong>
          <p className="mt-1 text-ink-700/80">{activity.explanation}</p>
        </div>
      )}
    </article>
  );
}

export function LessonStage({
  def,
  module,
  lesson,
  lessonIndex,
  answers,
  consolidation,
  isComplete,
  onAnswer,
  onConsolidate,
  onComplete,
  onSelectLesson,
  onGoEvaluacion,
  onGoDashboard,
}: {
  def: LpCourseDef;
  module: Lp737Module;
  lesson: Lp737Lesson;
  lessonIndex: number;
  answers: Record<string, number>;
  consolidation: Record<string, Lp737ConsolidationResult>;
  isComplete: boolean;
  onAnswer: (questionId: string, option: number) => void;
  onConsolidate: (activity: Lp737Consolidation, input: boolean | string[]) => void;
  onComplete: () => void;
  onSelectLesson: (lessonId: string) => void;
  onGoEvaluacion: () => void;
  onGoDashboard: () => void;
}) {
  const questions = lesson.questions;
  const allAnswered = questions.every((q) => Object.prototype.hasOwnProperty.call(answers, q.id));
  const allConsolidated = lesson.consolidation.every((a) =>
    Object.prototype.hasOwnProperty.call(consolidation, a.id),
  );
  const lessonReady = allAnswered && allConsolidated;
  const previous = module.lessons[lessonIndex - 1];
  const next = module.lessons[lessonIndex + 1];
  const reinforcement = lesson.yaris_reinforcement;

  return (
    <article
      id="leccion"
      tabIndex={-1}
      className="min-w-0 rounded-3xl border border-ink/8 bg-white p-6 sm:p-8 shadow-card outline-none"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/8 pb-5">
        <div className="min-w-0">
          <SectionLabel>
            Lección {lessonIndex + 1} de {module.lessons.length}
          </SectionLabel>
          <h2 className="font-display mt-1.5 text-[22px] sm:text-[26px] leading-tight tracking-tight text-ink-950">
            {lesson.title}
          </h2>
        </div>
        <span
          className={`rounded-full px-3.5 py-1 text-[12px] font-bold ${
            isComplete ? "bg-lapis/10 text-lapis" : "bg-haze-100 text-haze-600"
          }`}
        >
          {isComplete ? "Estudiada" : "En curso"}
        </span>
      </header>

      {/* Objetivo / por qué importa */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-haze-50 px-5 py-4">
          <SectionLabel>Objetivo</SectionLabel>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-950/85">{lesson.objective}</p>
        </div>
        <div className="rounded-2xl bg-haze-50 px-5 py-4">
          <SectionLabel>Por qué importa</SectionLabel>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-950/85">
            {lesson.why_it_matters}
          </p>
        </div>
      </div>

      {/* Activación */}
      <section className="mt-6 flex gap-4 rounded-2xl border border-lapis/25 bg-lapis/5 p-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lapis text-white">
          <Icon n="brain" size={22} />
        </div>
        <div>
          <SectionLabel>{lesson.activation.eyebrow}</SectionLabel>
          <h3 className="font-display mt-1 text-[17px] tracking-tight text-ink-950">
            Activa tu razonamiento
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-950/85">
            {lesson.activation.prompt}
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-haze-600">
            {lesson.activation.instruction}
          </p>
        </div>
      </section>

      {/* Explicación */}
      <section className="mt-7">
        <SectionLabel>Explicación técnica</SectionLabel>
        <div className="mt-2 space-y-3">
          {lesson.explanation.map((p, i) => (
            <p key={i} className="max-w-[72ch] text-[14.5px] leading-[1.75] text-ink-950/85">
              {p}
            </p>
          ))}
        </div>
      </section>

      {lesson.academic_note && <EvidenceSection lesson={lesson} />}
      {lesson.visual && <VisualSection lesson={lesson} />}

      {/* Puntos técnicos */}
      <section className="mt-7">
        <SectionLabel>Puntos que debes conectar</SectionLabel>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {lesson.technical_points.map((point) => (
            <article key={point.label} className="rounded-2xl border border-ink/10 bg-white p-4">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-coral-700">
                {point.label}
              </span>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-950/80">{point.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Flujo operacional */}
      <section className="mt-7">
        <SectionLabel>Secuencia operacional</SectionLabel>
        <ol className="mt-3 space-y-2.5">
          {lesson.operational_flow.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-950 font-mono text-[11px] text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 text-[14px] leading-relaxed text-ink-950/85">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Error frecuente */}
      <section className="mt-7 rounded-2xl border border-coral-600/30 bg-coral-50 p-5">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-coral-700">
          Error frecuente
        </span>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-950/85">{lesson.common_error}</p>
      </section>

      {/* Refuerzo de Yaris */}
      <section className="mt-6 flex gap-4 rounded-2xl border border-ink/10 bg-haze-50 p-5">
        <img
          src="/img/yaris-mini.png"
          alt="Mini Yaris, instructora de FlightPath"
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full border-2 border-white bg-white object-cover object-top shadow-card"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[14px] font-bold text-ink-950">Yaris</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${REINFORCEMENT_TONE[reinforcement.type] ?? "bg-haze-100 text-ink-700"}`}
            >
              {reinforcement.title}
            </span>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-950/85">
            {reinforcement.content}
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-haze-600">
            {reinforcement.transfer}
          </p>
        </div>
      </section>

      {/* Preguntas */}
      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <SectionLabel>Comprueba lo aprendido</SectionLabel>
            <h3 className="font-display mt-1 text-[19px] tracking-tight text-ink-950">
              Preguntas de esta lección
            </h3>
          </div>
          <span className="text-[12.5px] font-semibold text-haze-500">
            {questions.length} preguntas
          </span>
        </div>
        <div className="mt-4 space-y-4">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              selected={answers[q.id]}
              onAnswer={(option) => onAnswer(q.id, option)}
            />
          ))}
        </div>
      </section>

      {/* Consolidación */}
      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <SectionLabel>Cierre de la lección</SectionLabel>
            <h3 className="font-display mt-1 text-[19px] tracking-tight text-ink-950">
              Consolida como piloto
            </h3>
            <p className="mt-1 text-[13px] text-haze-600">
              Recupera, ordena y relaciona sin releer. Recibirás feedback al terminar cada
              actividad.
            </p>
          </div>
          <span className="text-[12.5px] font-semibold text-haze-500">3 actividades</span>
        </div>
        <div className="mt-4 space-y-4">
          {lesson.consolidation.map((a, i) => (
            <ConsolidationCard
              key={a.id}
              activity={a}
              index={i}
              result={consolidation[a.id]}
              onSubmit={(input) => onConsolidate(a, input)}
            />
          ))}
        </div>

        <div
          className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 ${
            lessonReady ? "border-lapis/35 bg-lapis/5" : "border-ink/10 bg-haze-50"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5 text-[13.5px] text-ink-950/80">
            <Icon n={lessonReady ? "check" : "clock"} size={17} />
            <p>
              {lessonReady
                ? "Completaste la evaluación y la consolidación. Puedes cerrar esta lección."
                : "Responde las preguntas y completa las tres actividades para marcar la lección como estudiada."}
            </p>
          </div>
          <button
            type="button"
            disabled={!lessonReady}
            onClick={onComplete}
            className="rounded-full bg-coral-600 px-6 py-2.5 text-[13.5px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isComplete ? "Lección estudiada" : "Marcar como estudiada"}
          </button>
        </div>
      </section>

      {/* Pie: fuente + navegación */}
      <footer className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pt-5">
        <div className="flex items-center gap-2 text-[12.5px] text-haze-600">
          <Icon n="book" size={15} />
          <span>
            <strong className="text-ink-950">Fuente</strong> {def.fuenteFooter(lesson)}
          </span>
        </div>
        <nav aria-label="Navegación entre lecciones" className="flex gap-2.5">
          {previous ? (
            <button
              type="button"
              onClick={() => onSelectLesson(previous.id)}
              className="rounded-full border-2 border-ink/15 bg-white px-5 py-2 text-[13px] font-bold text-ink-950 hover:border-lapis/60"
            >
              ← Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoDashboard}
              className="rounded-full border-2 border-ink/15 bg-white px-5 py-2 text-[13px] font-bold text-ink-950 hover:border-lapis/60"
            >
              Volver a la ruta
            </button>
          )}
          {next ? (
            <button
              type="button"
              onClick={() => onSelectLesson(next.id)}
              className="rounded-full bg-coral-600 px-5 py-2 text-[13px] font-bold text-white hover:opacity-90"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoEvaluacion}
              className="rounded-full bg-coral-600 px-5 py-2 text-[13px] font-bold text-white hover:opacity-90"
            >
              Ir a evaluación →
            </button>
          )}
        </nav>
      </footer>
    </article>
  );
}

/* ─────────── Secciones exclusivas de rutas con evidencia (Jeppesen) ─────────── */

/** "Evidencia y jurisdicción": afirmación auditada, cátedra, alcance y fuentes. */
function EvidenceSection({ lesson }: { lesson: Lp737Lesson }) {
  const note = lesson.academic_note;
  const claim = lesson.claim_evidence;
  if (!note) return null;
  return (
    <section className="mt-7 rounded-2xl border border-lapis/25 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionLabel>Evidencia y jurisdicción</SectionLabel>
          <h3 className="font-display mt-1 text-[17px] tracking-tight text-ink-950">
            {note.title || "Fuente verificada"}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lapis/10 px-3 py-1 text-[11.5px] font-bold text-lapis">
          <Icon n="check" size={13} /> Verificada
        </span>
      </div>
      {claim?.claim && (
        <div className="mt-4 rounded-xl bg-haze-50 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-haze-500">
            Afirmación auditada
          </span>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-950/85">{claim.claim}</p>
          {claim.verification_method && (
            <small className="mt-1 block text-[11.5px] text-haze-500">
              {claim.verification_method}
            </small>
          )}
        </div>
      )}
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-950/80">{note.content}</p>
      {(note.scope || lesson.jurisdiction_scope) && (
        <div className="mt-3 flex gap-2 text-[12.5px] leading-relaxed">
          <strong className="shrink-0 text-ink-950">Alcance</strong>
          <span className="text-haze-600">{note.scope || lesson.jurisdiction_scope}</span>
        </div>
      )}
      {note.verification && (
        <div className="mt-1.5 flex gap-2 text-[12.5px] leading-relaxed">
          <strong className="shrink-0 text-coral-700">Límite</strong>
          <span className="text-haze-600">{note.verification}</span>
        </div>
      )}
      {lesson.source_refs && lesson.source_refs.length > 0 && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {lesson.source_refs.map((src) => {
            const body = (
              <>
                <strong className="block text-[13px] text-ink-950">{src.label}</strong>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-haze-600">
                  {src.detail}
                </span>
                <small className="mt-1 block text-[11px] text-haze-400">
                  {src.supports || src.authority || ""}
                </small>
              </>
            );
            return src.url ? (
              <a
                key={src.label + src.detail}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-ink/10 bg-white px-4 py-3 transition-colors hover:border-lapis/50"
              >
                {body}
              </a>
            ) : (
              <div
                key={src.label + src.detail}
                className="rounded-xl border border-ink/10 bg-white px-4 py-3"
              >
                {body}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/** "Lectura visual guiada": recorte real del manual con lightbox y laboratorio. */
function VisualSection({ lesson }: { lesson: Lp737Lesson }) {
  const visual = lesson.visual;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  if (!visual) return null;
  return (
    <section className="mt-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <SectionLabel>Lectura visual guiada</SectionLabel>
          <h3 className="font-display mt-1 text-[19px] tracking-tight text-ink-950">
            Encuentra la evidencia en la carta
          </h3>
        </div>
        <span className="text-[12.5px] font-semibold text-haze-500">Imagen real</span>
      </div>
      <button
        type="button"
        aria-label={`Ampliar: ${visual.alt}`}
        onClick={() => setOpen(true)}
        className="group relative mt-3 block w-full overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-card"
      >
        <img
          src={visual.src}
          alt={visual.alt}
          loading="lazy"
          className="max-h-[420px] w-full bg-white object-contain"
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/85 px-3 py-1.5 text-[11.5px] font-bold text-white opacity-80 transition-opacity group-hover:opacity-100">
          <Icon n="search" size={13} /> Ampliar
        </span>
      </button>
      <p className="mt-2.5 text-[12.5px] leading-relaxed">
        <strong className="text-ink-950">{visual.caption}</strong>{" "}
        <span className="text-haze-500">{visual.source}</span>
      </p>
      {lesson.visual_task && (
        <details className="mt-3 rounded-2xl border border-ink/10 bg-haze-50 px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[13.5px] font-bold text-ink-950">
            <Icon n="target" size={15} /> Laboratorio visual
          </summary>
          <div className="mt-3">
            {lesson.visual_task.method && (
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-haze-500">
                {lesson.visual_task.method}
              </span>
            )}
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-950/85">
              {lesson.visual_task.prompt}
            </p>
            <details className="mt-2.5">
              <summary className="cursor-pointer list-none text-[12.5px] font-bold text-coral-700">
                Ver criterio de comprobación
              </summary>
              <p className="mt-1.5 text-[13px] leading-relaxed text-haze-600">
                {lesson.visual_task.expected}
              </p>
            </details>
          </div>
        </details>
      )}

      {/* Lightbox nativo: click en el fondo o en cerrar lo apaga */}
      <dialog
        ref={dialogRef}
        aria-label={`Vista ampliada: ${visual.alt}`}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="m-auto w-[min(96vw,1100px)] rounded-2xl border-0 bg-white p-3 shadow-navy backdrop:bg-ink-950/80"
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink-950 text-white"
        >
          <Icon n="close" size={16} />
        </button>
        {open && (
          <img src={visual.src} alt={visual.alt} className="max-h-[86vh] w-full object-contain" />
        )}
        <p className="px-2 py-2 text-[12.5px] text-haze-600">{visual.alt}</p>
      </dialog>
    </section>
  );
}
