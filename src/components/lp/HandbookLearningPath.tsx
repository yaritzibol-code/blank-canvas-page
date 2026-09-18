import { useEffect, useMemo, useState } from "react";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import type {
  HandbookCard,
  HandbookExercise,
  HandbookFigure,
  HandbookLabExercise,
  HandbookLearningPathDocument,
  HandbookQuestion,
} from "@/lib/lp/handbook-types";
import { getLpJourney, resetLpJourney, saveLpJourney } from "@/lib/store/lp-journey";

interface ExerciseProgress {
  pairs: Record<string, number>;
  selectedLeft: number | null;
  sequence: number[];
  visited: string[];
  tokens: number[];
  values: Record<string, string | number>;
  feedback: string;
}

interface HandbookJourneyState {
  stage: number;
  maxStage: number;
  complete: boolean;
  answers: Record<string, number>;
  checks: boolean[];
  exerciseDone: boolean;
  exercise: ExerciseProgress;
}

const emptyExercise = (): ExerciseProgress => ({
  pairs: {},
  selectedLeft: null,
  sequence: [],
  visited: [],
  tokens: [],
  values: {},
  feedback: "",
});

const freshState = (): HandbookJourneyState => ({
  stage: 0,
  maxStage: 0,
  complete: false,
  answers: {},
  checks: [false, false, false],
  exerciseDone: false,
  exercise: emptyExercise(),
});

function questionDone(question: HandbookQuestion, value: number | undefined) {
  return value === question.correct;
}

export function HandbookLearningPath({
  document,
  userId,
  lpId,
  completed,
  onComplete,
}: {
  document: HandbookLearningPathDocument;
  userId: string;
  lpId: string;
  completed: boolean;
  onComplete: () => void;
}) {
  const [state, setState] = useState<HandbookJourneyState>(freshState);
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [zoom, setZoom] = useState<HandbookFigure | null>(null);
  const stages = document.stages;
  const current = stages[state.stage];

  useEffect(() => {
    if (hydrated) return;
    const saved = getLpJourney<HandbookJourneyState>(userId, lpId);
    if (saved && saved.stage < stages.length && saved.maxStage < stages.length) {
      setState({ ...freshState(), ...saved });
    } else if (completed) {
      setState({ ...freshState(), stage: 0, maxStage: stages.length - 1, complete: true });
    }
    setHydrated(true);
  }, [completed, hydrated, lpId, stages.length, userId]);

  useEffect(() => {
    if (hydrated) saveLpJourney(userId, lpId, state);
  }, [hydrated, lpId, state, userId]);

  const quizComplete =
    current.kind !== "quiz" ||
    current.questions.every((index) =>
      questionDone(document.questions[index], state.answers[String(index)]),
    );
  const canContinue =
    current.kind === "exercise"
      ? state.exerciseDone
      : current.kind === "finish"
        ? state.checks.every(Boolean)
        : quizComplete;
  const percent = state.complete
    ? 100
    : Math.round((state.maxStage / Math.max(1, stages.length - 1)) * 100);

  const patchState = (patch: Partial<HandbookJourneyState>) =>
    setState((value) => ({ ...value, ...patch }));

  const goTo = (index: number) => {
    if (index < 0 || index >= stages.length || index > state.maxStage) return;
    patchState({ stage: index });
    setMenuOpen(false);
  };

  const advance = () => {
    if (!canContinue || state.complete) return;
    if (current.kind === "finish") {
      patchState({ complete: true, maxStage: stages.length - 1 });
      onComplete();
      return;
    }
    const next = Math.min(state.stage + 1, stages.length - 1);
    patchState({ stage: next, maxStage: Math.max(state.maxStage, next) });
  };

  const reset = () => {
    if (!window.confirm("¿Reiniciar este recorrido? Se borrará solamente su avance interno."))
      return;
    resetLpJourney(userId, lpId);
    setState(freshState());
  };

  const guide = state.complete
    ? "Recorrido completo. Puedes repasar cualquier etapa cuando quieras."
    : current.kind === "quiz"
      ? canContinue
        ? "Buen trabajo. Todas las decisiones están justificadas."
        : "Responde correctamente cada decisión para continuar."
      : current.kind === "exercise"
        ? canContinue
          ? "Actividad comprobada. Ya puedes continuar."
          : "Completa y comprueba la actividad antes de avanzar."
        : current.kind === "finish"
          ? "Confirma las tres ideas que puedes explicar y cierra el recorrido."
          : "Avanza a tu ritmo. Las etapas completadas quedan abiertas para repaso.";

  return (
    <section className={`hb-shell ${menuOpen ? "is-menu-open" : ""}`}>
      <style>{styles}</style>
      <button
        type="button"
        className="hb-mobile-menu"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
      >
        {menuOpen ? "Cerrar plan de vuelo" : "Abrir plan de vuelo"}
      </button>
      <aside className="hb-sidebar" aria-label="Plan de vuelo">
        <div className="hb-plan">
          <span>Handbook · Chapter {document.chapter}</span>
          <h2>{document.name}</h2>
          <p>{document.title}</p>
        </div>
        <nav className="hb-waypoints" aria-label="Etapas del Learning Path">
          {stages.map((stage, index) => {
            const locked = index > state.maxStage;
            const done = index < state.maxStage || state.complete;
            return (
              <button
                key={`${index}-${stage.nav}`}
                type="button"
                disabled={locked}
                aria-current={index === state.stage ? "step" : undefined}
                className={done ? "is-done" : ""}
                onClick={() => goTo(index)}
              >
                <span>{done ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{stage.nav}</strong>
                  <small>
                    {locked ? "Bloqueada" : index === state.stage ? "En ruta" : "Disponible"}
                  </small>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="hb-altitude">
          <img src={state.complete ? "/img/pathy-5-elite.png" : "/img/pathy-small.png"} alt="" />
          <div>
            <small>Tu altitud</small>
            <strong>{percent}%</strong>
            <span>
              {state.maxStage + 1} de {stages.length} etapas abiertas
            </span>
          </div>
        </div>
        <button type="button" className="hb-reset" onClick={reset}>
          ↻ Empezar de nuevo
        </button>
      </aside>

      <div className="hb-workspace">
        <header className="hb-topbar">
          <button
            type="button"
            className="hb-menu-icon"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar plan de vuelo" : "Abrir plan de vuelo"}
          >
            ☰
          </button>
          <div>
            <span>
              Learning Path · {String(state.stage + 1).padStart(2, "0")} /{" "}
              {String(stages.length).padStart(2, "0")}
            </span>
            <strong>{current.nav}</strong>
          </div>
          <div className="hb-progress-area">
            <span>{canContinue ? "Etapa lista" : "Misión en curso"}</span>
            <div
              className="hb-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <i style={{ width: `${percent}%` }} />
            </div>
            <b>{percent}%</b>
          </div>
        </header>

        <main className="hb-content">
          {current.kind === "intro" && <Intro document={document} />}
          {current.kind === "content" && (
            <ContentStage
              title={current.title}
              cards={current.cards}
              figures={current.figures.map(
                (figure) =>
                  document.figures.find((candidate) => candidate.number === figure.number) ??
                  figure,
              )}
              onZoom={setZoom}
            />
          )}
          {current.kind === "quiz" && (
            <QuizStage
              cards={current.cards ?? []}
              indexes={current.questions}
              questions={document.questions}
              answers={state.answers}
              onAnswer={(index, answer) =>
                patchState({ answers: { ...state.answers, [String(index)]: answer } })
              }
            />
          )}
          {current.kind === "exercise" && document.exercise && (
            <ExerciseStage
              exercise={document.exercise}
              progress={state.exercise}
              done={state.exerciseDone}
              onProgress={(exercise) => patchState({ exercise })}
              onDone={() => patchState({ exerciseDone: true })}
            />
          )}
          {current.kind === "finish" && (
            <Finish
              document={document}
              checks={state.checks}
              complete={state.complete}
              onCheck={(index) => {
                const checks = [...state.checks];
                checks[index] = !checks[index];
                patchState({ checks });
              }}
            />
          )}
          <Source document={document} />
        </main>

        <footer className="hb-footer">
          <div className="hb-guide">
            <YarisAvatar size={44} ring />
            <div>{guide}</div>
          </div>
          <div className="hb-actions">
            <button
              type="button"
              disabled={state.stage === 0}
              onClick={() => goTo(state.stage - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              className="is-primary"
              disabled={!canContinue || state.complete}
              onClick={advance}
            >
              {current.kind === "intro"
                ? "Iniciar recorrido"
                : current.kind === "finish"
                  ? state.complete
                    ? "Completado"
                    : "Completar Learning Path"
                  : "Continuar"}
            </button>
          </div>
        </footer>
      </div>

      {zoom && (
        <div
          className="hb-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Figure ${zoom.number}`}
        >
          <button type="button" onClick={() => setZoom(null)}>
            Cerrar ×
          </button>
          <img src={zoom.file} alt={zoom.alt} />
          <p>
            <strong>Figure {zoom.number}.</strong> {zoom.observe}
          </p>
        </div>
      )}
    </section>
  );
}

function Intro({ document }: { document: HandbookLearningPathDocument }) {
  return (
    <>
      <section className="hb-hero">
        <div>
          <span className="hb-pill">
            Chapter {document.chapter} · Learning Path {String(document.number).padStart(2, "0")}
          </span>
          <h1>{document.title}</h1>
          <h2>{document.name}</h2>
          <p>{document.intro}</p>
          <div className="hb-stats">
            <span>
              <small>Etapas</small>
              <strong>{document.stages.length}</strong>
            </span>
            <span>
              <small>Duración</small>
              <strong>{document.minutes} min aprox.</strong>
            </span>
            <span>
              <small>Chapter</small>
              <strong>{document.chapter_name}</strong>
            </span>
          </div>
        </div>
        <img src="/img/pathy-small.png" alt="Pathy acompaña el recorrido" />
      </section>
      <section className="hb-card hb-dark">
        <span className="hb-overline">La misión</span>
        <h3>{document.name}</h3>
        <p>{document.cards[0]?.text}</p>
        <div className="hb-pills">
          {document.objectives.map((objective) => (
            <span key={objective}>{objective}</span>
          ))}
        </div>
      </section>
      <details className="hb-source">
        <summary>Temas incluidos en este recorrido</summary>
        <p>Este Learning Path conserva sus subtemas dentro del tema principal.</p>
        <ul>
          {document.subtopics.length ? (
            document.subtopics.map((subtopic) => (
              <li key={`${subtopic.level}-${subtopic.name}`}>{subtopic.name}</li>
            ))
          ) : (
            <li>{document.name}</li>
          )}
        </ul>
      </details>
    </>
  );
}

function ContentStage({
  title,
  cards,
  figures,
  onZoom,
}: {
  title: string;
  cards: HandbookCard[];
  figures: HandbookFigure[];
  onZoom: (figure: HandbookFigure) => void;
}) {
  return (
    <>
      <header className="hb-heading">
        <span className="hb-pill">Comprende</span>
        <h2>{title}</h2>
      </header>
      <div className="hb-card-grid">
        {cards.map((card, index) => (
          <Card key={`${index}-${card.title}`} card={card} />
        ))}
      </div>
      {figures.map((figure) => (
        <Figure key={figure.number} figure={figure} onZoom={onZoom} />
      ))}
    </>
  );
}

function Card({ card }: { card: HandbookCard }) {
  return (
    <section className={`hb-card ${card.wide ? "is-wide" : ""}`}>
      <h3>{card.title}</h3>
      <p>{card.text}</p>
    </section>
  );
}

function Figure({
  figure,
  onZoom,
}: {
  figure: HandbookFigure;
  onZoom: (figure: HandbookFigure) => void;
}) {
  return (
    <figure className="hb-card hb-figure">
      <div className="hb-figure-head">
        <span className="hb-overline hb-overline-dark">Observa la relación</span>
        <button type="button" onClick={() => onZoom(figure)}>
          Ampliar ↗
        </button>
      </div>
      <img src={figure.file} alt={figure.alt} />
      <figcaption>
        Figure {figure.number} · Pilot’s Handbook of Aeronautical Knowledge · página PDF{" "}
        {figure.pdf_page}.
      </figcaption>
      <details>
        <summary>Qué observar en esta figura</summary>
        <p>{figure.observe}</p>
      </details>
    </figure>
  );
}

function QuizStage({
  cards,
  indexes,
  questions,
  answers,
  onAnswer,
}: {
  cards: HandbookCard[];
  indexes: number[];
  questions: HandbookQuestion[];
  answers: Record<string, number>;
  onAnswer: (index: number, answer: number) => void;
}) {
  return (
    <>
      <header className="hb-heading">
        <span className="hb-pill">Ponlo a prueba</span>
        <h2>Decide y explica por qué</h2>
        <p>Usa lo que acabas de estudiar. El feedback te ayudará a corregir la relación.</p>
      </header>
      {cards.length > 0 && (
        <div className="hb-card-grid">
          {cards.map((card, index) => (
            <Card key={`${index}-${card.title}`} card={card} />
          ))}
        </div>
      )}
      <section className="hb-card hb-dark hb-quiz-stack">
        {indexes.map((index) => (
          <Question
            key={index}
            question={questions[index]}
            value={answers[String(index)]}
            onAnswer={(answer) => onAnswer(index, answer)}
          />
        ))}
      </section>
    </>
  );
}

function Question({
  question,
  value,
  onAnswer,
}: {
  question: HandbookQuestion;
  value?: number;
  onAnswer: (answer: number) => void;
}) {
  const answered = Number.isInteger(value);
  const correct = value === question.correct;
  return (
    <div className="hb-question" role="group" aria-label={question.prompt}>
      <h3>{question.prompt}</h3>
      <div className="hb-options">
        {question.order.map((optionIndex, displayIndex) => {
          const selected = value === optionIndex;
          return (
            <button
              key={`${optionIndex}-${question.options[optionIndex]}`}
              type="button"
              aria-pressed={selected}
              className={selected ? (correct ? "is-correct" : "is-wrong") : ""}
              onClick={() => onAnswer(optionIndex)}
            >
              <span>{String.fromCharCode(65 + displayIndex)}</span>
              {question.options[optionIndex]}
            </button>
          );
        })}
      </div>
      <div
        className={`hb-feedback ${answered ? (correct ? "is-correct" : "is-wrong") : ""}`}
        role="status"
      >
        {answered ? (
          <>
            <strong>
              {correct ? "✓ Correcto. Esta es la relación." : "Aún no. Revisa el razonamiento."}
            </strong>{" "}
            {question.feedback}
            {!correct && " Vuelve a elegir y comprueba tu respuesta."}
          </>
        ) : (
          "Elige una respuesta para comprobar tu razonamiento."
        )}
      </div>
    </div>
  );
}

function Source({ document }: { document: HandbookLearningPathDocument }) {
  return (
    <details className="hb-source">
      <summary>Fuente y alcance de esta etapa</summary>
      <p>
        Pilot’s Handbook of Aeronautical Knowledge · FAA-H-8083-25C · página impresa{" "}
        {document.source_print_page} · página PDF {document.source_pdf_page}. Adaptación pedagógica
        nativa de FlightPath.
      </p>
    </details>
  );
}

function Finish({
  document,
  checks,
  complete,
  onCheck,
}: {
  document: HandbookLearningPathDocument;
  checks: boolean[];
  complete: boolean;
  onCheck: (index: number) => void;
}) {
  const statements = [
    "Puedo explicar la idea central con mis propias palabras.",
    "Puedo justificar mis respuestas y distinguir las alternativas.",
    "Sé qué subtemas necesito repasar y dónde encontrarlos.",
  ];
  return (
    <>
      <section className="hb-success">
        <div>
          <span className="hb-overline hb-overline-dark">Aterrizaje</span>
          <h2>{complete ? "Recorrido completado." : "Haz tuyo lo aprendido."}</h2>
          <p>
            Antes de cerrar <strong>{document.name}</strong>, comprueba que puedes explicar la idea
            y aplicarla a una decisión.
          </p>
        </div>
        <img
          src={complete ? "/img/pathy-5-elite.png" : "/img/pathy-small.png"}
          alt="Pathy celebra el recorrido"
        />
      </section>
      {document.tips.length > 0 && (
        <aside className="hb-tip">
          <YarisAvatar size={52} ring />
          <p>
            <strong>Para recordar</strong>
            {document.tips.join(" ")}
          </p>
        </aside>
      )}
      <section className="hb-card hb-checks">
        {statements.map((statement, index) => (
          <button
            key={statement}
            type="button"
            className={checks[index] ? "is-checked" : ""}
            onClick={() => onCheck(index)}
          >
            <span>{checks[index] ? "✓" : ""}</span>
            {statement}
          </button>
        ))}
      </section>
    </>
  );
}

function ExerciseStage({
  exercise,
  progress,
  done,
  onProgress,
  onDone,
}: {
  exercise: HandbookExercise;
  progress: ExerciseProgress;
  done: boolean;
  onProgress: (progress: ExerciseProgress) => void;
  onDone: () => void;
}) {
  if (exercise.kind === "match")
    return (
      <MatchExercise
        exercise={exercise}
        progress={progress}
        done={done}
        onProgress={onProgress}
        onDone={onDone}
      />
    );
  if (exercise.kind === "sequence")
    return (
      <SequenceExercise
        exercise={exercise}
        progress={progress}
        done={done}
        onProgress={onProgress}
        onDone={onDone}
      />
    );
  return (
    <LabExercise
      exercise={exercise}
      progress={progress}
      done={done}
      onProgress={onProgress}
      onDone={onDone}
    />
  );
}

function ExerciseFrame({
  exercise,
  done,
  children,
}: {
  exercise: HandbookExercise;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="hb-heading">
        <span className="hb-pill">Aplica</span>
        <h2>{exercise.title}</h2>
        <p>{exercise.instruction}</p>
      </header>
      <section className="hb-card hb-exercise">
        {children}
        {done && (
          <div className="hb-feedback is-correct" role="status">
            <strong>✓ Actividad completada.</strong> La relación quedó comprobada y puedes
            continuar.
          </div>
        )}
      </section>
    </>
  );
}

function MatchExercise({
  exercise,
  progress,
  done,
  onProgress,
  onDone,
}: {
  exercise: Extract<HandbookExercise, { kind: "match" }>;
  progress: ExerciseProgress;
  done: boolean;
  onProgress: (progress: ExerciseProgress) => void;
  onDone: () => void;
}) {
  const selectRight = (right: number) => {
    if (progress.selectedLeft === null) return;
    const pairs = { ...progress.pairs };
    for (const key of Object.keys(pairs)) if (pairs[key] === right) delete pairs[key];
    pairs[String(progress.selectedLeft)] = right;
    onProgress({ ...progress, pairs, selectedLeft: null, feedback: "" });
  };
  const check = () => {
    const errors = exercise.pairs
      .map((_, index) => index)
      .filter((index) => progress.pairs[String(index)] !== index);
    if (errors.length === 0) onDone();
    else
      onProgress({
        ...progress,
        feedback: `Revisa ${errors.length} relación${errors.length === 1 ? "" : "es"} y vuelve a comprobar.`,
      });
  };
  return (
    <ExerciseFrame exercise={exercise} done={done}>
      <div className="hb-pair-grid">
        <div>
          {exercise.pairs.map((pair, index) => (
            <button
              key={pair[0]}
              type="button"
              className={progress.selectedLeft === index ? "is-active" : ""}
              onClick={() => onProgress({ ...progress, selectedLeft: index, feedback: "" })}
            >
              <span>{index + 1}</span>
              {pair[0]}
            </button>
          ))}
        </div>
        <div>
          {exercise.order.map((right) => {
            const left = Object.keys(progress.pairs).find((key) => progress.pairs[key] === right);
            return (
              <button
                key={right}
                type="button"
                className={left !== undefined ? "is-paired" : ""}
                onClick={() => selectRight(right)}
              >
                {left !== undefined && <span>{Number(left) + 1}</span>}
                {exercise.pairs[right][1]}
              </button>
            );
          })}
        </div>
      </div>
      <div className="hb-exercise-actions">
        <button type="button" className="is-primary" onClick={check}>
          Comprobar relaciones
        </button>
        <button type="button" onClick={() => onProgress({ ...emptyExercise() })}>
          Empezar de nuevo
        </button>
      </div>
      {progress.feedback && (
        <div className="hb-feedback is-wrong" role="status">
          {progress.feedback}
        </div>
      )}
    </ExerciseFrame>
  );
}

function SequenceExercise({
  exercise,
  progress,
  done,
  onProgress,
  onDone,
}: {
  exercise: Extract<HandbookExercise, { kind: "sequence" }>;
  progress: ExerciseProgress;
  done: boolean;
  onProgress: (progress: ExerciseProgress) => void;
  onDone: () => void;
}) {
  const check = () => {
    const correct =
      progress.sequence.length === exercise.items.length &&
      progress.sequence.every((item, index) => item === index);
    if (correct) onDone();
    else
      onProgress({
        ...progress,
        feedback:
          "El orden todavía no reproduce la secuencia. Deshaz o reinicia y vuelve a comprobar.",
      });
  };
  return (
    <ExerciseFrame exercise={exercise} done={done}>
      <div className="hb-sequence">
        <div className="hb-sequence-result">
          {progress.sequence.length ? (
            progress.sequence.map((item, index) => (
              <span key={item}>
                <b>{index + 1}</b>
                {exercise.items[item]}
              </span>
            ))
          ) : (
            <p>Selecciona el primer paso.</p>
          )}
        </div>
        <div className="hb-sequence-options">
          {exercise.order.map((item) => (
            <button
              key={item}
              type="button"
              disabled={progress.sequence.includes(item)}
              onClick={() =>
                onProgress({ ...progress, sequence: [...progress.sequence, item], feedback: "" })
              }
            >
              {exercise.items[item]}
            </button>
          ))}
        </div>
      </div>
      <div className="hb-exercise-actions">
        <button type="button" className="is-primary" onClick={check}>
          Comprobar secuencia
        </button>
        <button
          type="button"
          disabled={!progress.sequence.length}
          onClick={() =>
            onProgress({ ...progress, sequence: progress.sequence.slice(0, -1), feedback: "" })
          }
        >
          Deshacer
        </button>
        <button type="button" onClick={() => onProgress(emptyExercise())}>
          Reiniciar
        </button>
      </div>
      {progress.feedback && <div className="hb-feedback is-wrong">{progress.feedback}</div>}
    </ExerciseFrame>
  );
}

function LabExercise({
  exercise,
  progress,
  done,
  onProgress,
  onDone,
}: {
  exercise: HandbookLabExercise;
  progress: ExerciseProgress;
  done: boolean;
  onProgress: (progress: ExerciseProgress) => void;
  onDone: () => void;
}) {
  const values = progress.values;
  const remember = (
    signature: string,
    valuesPatch: Record<string, string | number>,
    required = 2,
  ) => {
    const visited = progress.visited.includes(signature)
      ? progress.visited
      : [...progress.visited, signature];
    onProgress({ ...progress, values: { ...values, ...valuesPatch }, visited });
    if (visited.length >= required) onDone();
  };
  if (exercise.kind === "metar")
    return (
      <MetarLab
        exercise={exercise}
        progress={progress}
        done={done}
        onProgress={onProgress}
        onDone={onDone}
      />
    );
  if (exercise.kind === "axes") {
    const axes = [
      ["Pitch", "Eje lateral", "La nariz sube o baja."],
      ["Roll", "Eje longitudinal", "Un ala sube y la otra baja."],
      ["Yaw", "Eje vertical", "La nariz gira a izquierda o derecha."],
    ];
    const selected = Number(values.axis ?? -1);
    return (
      <ExerciseFrame exercise={exercise} done={done}>
        <div className="hb-lab-buttons">
          {axes.map((axis, index) => (
            <button
              key={axis[0]}
              type="button"
              className={selected === index ? "is-active" : ""}
              onClick={() => remember(`axis-${index}`, { axis: index }, 3)}
            >
              {axis[0]}
            </button>
          ))}
        </div>
        <div className="hb-readout">
          {selected >= 0 ? (
            <>
              <strong>
                {axes[selected][0]} · {axes[selected][1]}
              </strong>
              <span>{axes[selected][2]}</span>
            </>
          ) : (
            <span>Explora los tres movimientos y localiza su eje.</span>
          )}
        </div>
      </ExerciseFrame>
    );
  }
  if (exercise.kind === "pitot") {
    const block = String(values.block ?? "normal");
    const motion = String(values.motion ?? "climb");
    const text: Record<string, string> = {
      normal: "ASI, altimeter y VSI responden normalmente.",
      drain: "ASI tiende a cero; altimeter y VSI conservan static libre.",
      both:
        motion === "climb"
          ? "ASI indica falsamente más; pitot queda atrapado."
          : "ASI indica falsamente menos; pitot queda atrapado.",
      static:
        motion === "climb"
          ? "ASI lee por debajo; altimeter queda congelado y VSI vuelve a cero."
          : "ASI lee por encima; altimeter queda congelado y VSI vuelve a cero.",
    };
    return (
      <ExerciseFrame exercise={exercise} done={done}>
        <div className="hb-controls">
          <label>
            Obstrucción
            <select
              value={block}
              onChange={(event) =>
                remember(`${event.target.value}-${motion}`, { block: event.target.value })
              }
            >
              <option value="normal">Normal</option>
              <option value="drain">Pitot bloqueado, drain abierto</option>
              <option value="both">Pitot y drain bloqueados</option>
              <option value="static">Static bloqueado</option>
            </select>
          </label>
          <label>
            Movimiento
            <select
              value={motion}
              onChange={(event) =>
                remember(`${block}-${event.target.value}`, { motion: event.target.value })
              }
            >
              <option value="climb">Ascenso</option>
              <option value="descent">Descenso</option>
            </select>
          </label>
        </div>
        <div className="hb-readout">
          <strong>{text[block]}</strong>
        </div>
      </ExerciseFrame>
    );
  }
  const bank = Number(values.bank ?? 30);
  const speed = Number(values.speed ?? 120);
  const arm = Number(values.arm ?? 30);
  const papi = Number(values.papi ?? 2);
  const wind = Number(values.wind ?? 0);
  const distance = Number(values.distance ?? 120);
  const flow = Number(values.flow ?? 9);
  const range = (
    label: string,
    key: string,
    min: number,
    max: number,
    value: number,
    unit: string,
    step = 1,
  ) => (
    <label>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          remember(`${key}-${event.target.value}-${key === "bank" ? speed : bank}`, {
            [key]: Number(event.target.value),
          })
        }
      />
      <output>
        {value} {unit}
      </output>
    </label>
  );
  let controls: React.ReactNode;
  let readout: React.ReactNode;
  if (exercise.kind === "balance") {
    controls = range("Brazo de la carga", "arm", 30, 110, arm, "in");
    readout = (
      <>
        <strong>{(77 + (100 * (arm - 30)) / 8000).toFixed(2)} in</strong>
        <span>Nuevo CG · peso total 8,000 lb</span>
      </>
    );
  } else if (exercise.kind === "papi") {
    controls = range("Luces rojas", "papi", 0, 4, papi, "de 4");
    readout = (
      <>
        <div className="hb-lights">
          {Array.from({ length: 4 }, (_, index) => (
            <i key={index} className={index >= 4 - papi ? "red" : ""} />
          ))}
        </div>
        <strong>
          {["Muy alto", "Ligeramente alto", "On glidepath", "Ligeramente bajo", "Muy bajo"][papi]}
        </strong>
      </>
    );
  } else if (exercise.kind === "wind") {
    controls = range("Componente de viento", "wind", -40, 40, wind, "kt", 5);
    readout = (
      <>
        <strong>{120 + wind} knots</strong>
        <span>Groundspeed con TAS constante de 120 knots</span>
      </>
    );
  } else if (exercise.kind === "fuel") {
    controls = (
      <div className="hb-controls">
        <label>
          Distancia
          <input
            type="number"
            min={1}
            value={distance}
            onChange={(event) =>
              remember(`fuel-${event.target.value}-${speed}-${flow}`, {
                distance: Number(event.target.value),
              })
            }
          />
        </label>
        <label>
          Groundspeed
          <input
            type="number"
            min={1}
            value={speed}
            onChange={(event) =>
              remember(`fuel-${distance}-${event.target.value}-${flow}`, {
                speed: Number(event.target.value),
              })
            }
          />
        </label>
        <label>
          Fuel flow
          <input
            type="number"
            min={1}
            value={flow}
            onChange={(event) =>
              remember(`fuel-${distance}-${speed}-${event.target.value}`, {
                flow: Number(event.target.value),
              })
            }
          />
        </label>
      </div>
    );
    const hours = distance / Math.max(1, speed);
    readout = (
      <>
        <strong>{(hours * 60).toFixed(1)} min</strong>
        <span>{(hours * flow).toFixed(2)} gallons de tramo</span>
      </>
    );
  } else {
    controls = (
      <div className="hb-controls">
        {range("Bank", "bank", 0, 60, bank, "°")}
        {(exercise.kind === "turn" || exercise.kind === "radius") &&
          range("TAS", "speed", 60, 220, speed, "kt", 5)}
      </div>
    );
    const radians = (bank * Math.PI) / 180;
    if (exercise.kind === "load")
      readout = (
        <>
          <strong>{(1 / Math.cos(radians)).toFixed(2)} G</strong>
          <span>Stall speed relativa ×{Math.sqrt(1 / Math.cos(radians)).toFixed(2)}</span>
        </>
      );
    else if (exercise.kind === "turn")
      readout = (
        <>
          <strong>{((1091 * Math.tan(radians)) / speed).toFixed(2)} °/s</strong>
          <span>A igual bank, mayor TAS reduce rate of turn.</span>
        </>
      );
    else
      readout = (
        <>
          <strong>
            {bank ? Math.round((speed * speed) / (11.26 * Math.tan(radians))) : "∞"} ft
          </strong>
          <span>A igual bank, mayor TAS aumenta radius.</span>
        </>
      );
  }
  return (
    <ExerciseFrame exercise={exercise} done={done}>
      <div className="hb-controls">{controls}</div>
      <div className="hb-readout">{readout}</div>
      <p className="hb-instruction">
        Compara al menos dos condiciones para completar la actividad.
      </p>
    </ExerciseFrame>
  );
}

function MetarLab({
  exercise,
  progress,
  done,
  onProgress,
  onDone,
}: {
  exercise: HandbookLabExercise;
  progress: ExerciseProgress;
  done: boolean;
  onProgress: (progress: ExerciseProgress) => void;
  onDone: () => void;
}) {
  const tokens = useMemo(
    () =>
      [
        ["METAR KGGG", "Reporte rutinario de Gregg County Airport."],
        ["161753Z", "Día 16 a las 17:53 UTC."],
        ["AUTO", "Observación automática."],
        ["14021G26KT", "Viento 140° true a 21 knots; gusts 26."],
        ["3/4SM", "Visibilidad predominante de 3/4 statute mile."],
        ["+TSRA BR", "Thunderstorm con heavy rain y mist."],
        ["BKN008 OVC012CB", "Ceiling 800 ft AGL; cumulonimbus a 1,200 ft AGL."],
        ["18/17 A2970", "Temperatura 18 °C, dew point 17 °C; altimeter 29.70 inHg."],
        ["RMK PRESFR", "Presión cayendo rápidamente."],
      ] as const,
    [],
  );
  const selected = Number(progress.values.token ?? -1);
  const select = (index: number) => {
    const seen = progress.tokens.includes(index) ? progress.tokens : [...progress.tokens, index];
    onProgress({ ...progress, tokens: seen, values: { ...progress.values, token: index } });
    if (seen.length === tokens.length) onDone();
  };
  return (
    <ExerciseFrame exercise={exercise} done={done}>
      <div className="hb-token-list">
        {tokens.map((token, index) => (
          <button
            key={token[0]}
            type="button"
            className={progress.tokens.includes(index) ? "is-seen" : ""}
            onClick={() => select(index)}
          >
            {token[0]}
          </button>
        ))}
      </div>
      <div className="hb-readout">
        <span>{selected >= 0 ? tokens[selected][1] : "Empieza por tipo, estación y hora."}</span>
      </div>
    </ExerciseFrame>
  );
}

const styles = `
.hb-shell{--ink:#0f1833;--burgundy:#6c0820;--cherry:#f2aebc;--lapis:#3d5d91;--silver:#90a5c8;--page:#f3f1ea;position:relative;display:grid;grid-template-columns:250px minmax(0,1fr);height:min(920px,calc(100vh - 64px));min-height:700px;margin-bottom:24px;overflow:hidden;border:1px solid rgba(15,24,51,.12);border-radius:24px;background:var(--page);color:var(--ink);box-shadow:0 18px 50px rgba(15,24,51,.12)}.hb-shell *{box-sizing:border-box}.hb-shell button,.hb-shell input,.hb-shell select{font:inherit}.hb-mobile-menu{display:none}.hb-sidebar{display:flex;min-height:0;flex-direction:column;padding:24px 18px 18px;overflow:hidden;background:radial-gradient(120% 120% at 20% 0%,#2a426e 0%,var(--ink) 58%);color:#fff}.hb-plan{padding:0 6px 16px}.hb-plan>span,.hb-overline{display:block;color:var(--cherry);font:700 10px ui-monospace,monospace;letter-spacing:.15em;text-transform:uppercase}.hb-plan h2{margin:8px 0 0;font:22px/1.08 Georgia,serif}.hb-plan p{margin:7px 0 0;color:rgba(255,255,255,.62);font-size:12px}.hb-waypoints{display:flex;min-height:0;flex:1;flex-direction:column;gap:4px;overflow:auto}.hb-waypoints button{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;align-items:center;padding:8px 6px;border:0;border-radius:12px;background:transparent;color:#fff;text-align:left;cursor:pointer}.hb-waypoints button:hover:not(:disabled),.hb-waypoints button[aria-current]{background:rgba(255,255,255,.09)}.hb-waypoints button:disabled{opacity:.42}.hb-waypoints button>span:first-child{display:grid;width:30px;height:30px;place-items:center;border-radius:50%;background:rgba(255,255,255,.08);font:10px ui-monospace,monospace}.hb-waypoints button[aria-current]>span:first-child{background:#fff;color:var(--ink);box-shadow:0 0 0 4px rgba(242,174,188,.32)}.hb-waypoints button.is-done>span:first-child{background:var(--cherry);color:var(--burgundy)}.hb-waypoints strong,.hb-waypoints small{display:block}.hb-waypoints strong{font-size:12px}.hb-waypoints small{margin-top:2px;color:rgba(255,255,255,.55);font-size:10px}.hb-altitude{display:flex;gap:10px;align-items:center;margin-top:12px;padding:12px;border-radius:15px;background:rgba(255,255,255,.06)}.hb-altitude img{width:48px;height:48px;object-fit:contain}.hb-altitude small,.hb-altitude strong,.hb-altitude span{display:block}.hb-altitude small{color:rgba(255,255,255,.55);font-size:9px;text-transform:uppercase}.hb-altitude strong{font:21px Georgia,serif}.hb-altitude span{color:rgba(255,255,255,.55);font-size:10px}.hb-reset{margin-top:8px;padding:5px;border:0;background:none;color:rgba(255,255,255,.55);font-size:11px;text-align:left;cursor:pointer}.hb-workspace{display:grid;min-width:0;min-height:0;grid-template-rows:auto minmax(0,1fr) auto}.hb-topbar{display:flex;align-items:center;gap:16px;padding:15px 28px;border-bottom:1px solid rgba(15,24,51,.1);background:rgba(255,255,255,.45)}.hb-topbar>div:nth-child(2)>span{display:block;color:#737b8e;font:9px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase}.hb-topbar>div:nth-child(2)>strong{display:block;margin-top:2px;font-size:14px}.hb-menu-icon{display:none}.hb-progress-area{display:flex;align-items:center;gap:10px;margin-left:auto;color:#697286;font-size:11px}.hb-progress{width:140px;height:6px;overflow:hidden;border-radius:999px;background:rgba(15,24,51,.08)}.hb-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--cherry),var(--burgundy))}.hb-content{display:flex;flex-direction:column;gap:24px;padding:30px;overflow:auto}.hb-pill{display:inline-flex;width:max-content;padding:5px 11px;border:1px solid rgba(242,174,188,.5);border-radius:999px;background:rgba(242,174,188,.18);color:var(--burgundy);font:700 10px ui-monospace,monospace;letter-spacing:.11em;text-transform:uppercase}.hb-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(180px,.5fr);gap:28px;align-items:center}.hb-hero h1,.hb-heading h2,.hb-success h2{margin:14px 0 0;font:clamp(34px,4vw,56px)/1.03 Georgia,serif;letter-spacing:-.035em}.hb-hero h2{margin:10px 0;color:var(--burgundy);font:italic 400 clamp(24px,2.8vw,38px) Georgia,serif}.hb-hero p,.hb-heading p,.hb-success p{max-width:780px;margin:0;color:#5c6578;font-size:15px;line-height:1.65}.hb-hero>img{width:100%;max-width:270px;margin:auto}.hb-stats{display:flex;flex-wrap:wrap;gap:22px;margin-top:18px;padding-top:14px;border-top:1px solid rgba(15,24,51,.1)}.hb-stats small,.hb-stats strong{display:block}.hb-stats small{color:#788094;font:9px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}.hb-stats strong{margin-top:3px;font-size:12px}.hb-heading{display:flex;max-width:820px;flex-direction:column;gap:12px}.hb-heading h2{margin:0}.hb-card{display:flex;flex-direction:column;gap:14px;padding:24px;border:1px solid rgba(15,24,51,.12);border-radius:16px;background:#fff;box-shadow:0 7px 24px rgba(15,24,51,.06)}.hb-card h3{margin:0;font:24px/1.15 Georgia,serif}.hb-card p{margin:0;color:#5c6578;font-size:14px;line-height:1.65}.hb-dark{border-color:transparent;background:var(--ink);color:#fff}.hb-dark h3{color:#fff}.hb-dark p{color:rgba(255,255,255,.76)}.hb-pills{display:flex;flex-wrap:wrap;gap:8px}.hb-pills span{padding:7px 10px;border:1px solid rgba(255,255,255,.15);border-radius:999px;color:rgba(255,255,255,.78);font-size:11px}.hb-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.hb-card-grid .is-wide{grid-column:1/-1}.hb-figure{margin:0}.hb-figure-head{display:flex;justify-content:space-between;align-items:center}.hb-overline-dark{color:var(--burgundy)}.hb-figure-head button{border:0;background:none;color:var(--burgundy);font-weight:700;cursor:pointer}.hb-figure img{max-width:100%;max-height:580px;object-fit:contain}.hb-figure figcaption,.hb-figure details,.hb-source{color:#70798b;font-size:11px;line-height:1.55}.hb-figure summary,.hb-source summary{width:max-content;padding:6px 0;cursor:pointer;font-weight:700}.hb-source p{margin:6px 0}.hb-quiz-stack{gap:24px}.hb-question+.hb-question{padding-top:22px;border-top:1px solid rgba(255,255,255,.14)}.hb-question h3{font-size:20px}.hb-options{display:flex;flex-direction:column;gap:8px;margin-top:14px}.hb-options button{display:flex;gap:10px;align-items:center;min-height:46px;padding:10px 13px;border:1px solid rgba(255,255,255,.17);border-radius:11px;background:rgba(255,255,255,.06);color:#fff;text-align:left;cursor:pointer}.hb-options button>span{display:grid;width:27px;height:27px;flex-shrink:0;place-items:center;border-radius:50%;background:rgba(255,255,255,.1);font:10px ui-monospace,monospace}.hb-options button.is-correct{border-color:#8fb9a8;background:rgba(80,160,125,.2)}.hb-options button.is-wrong{border-color:var(--cherry);background:rgba(242,174,188,.14)}.hb-feedback{margin-top:12px;padding:12px 14px;border-radius:11px;background:#eef0f4;color:#4f586b;font-size:13px;line-height:1.5}.hb-feedback.is-correct{background:#deeee8;color:#1d5945}.hb-feedback.is-wrong{background:#f8e6ea;color:var(--burgundy)}.hb-success{display:grid;grid-template-columns:1fr 150px;gap:24px;align-items:center;padding:25px;border-radius:18px;background:#fff}.hb-success h2{margin:8px 0}.hb-success img{width:145px}.hb-tip{display:flex;gap:15px;align-items:center;padding:18px;border:1px solid rgba(15,24,51,.1);border-radius:16px;background:#f2e6e9}.hb-tip p{margin:0;color:#535d70;font-size:13px}.hb-tip strong{display:block;color:var(--burgundy)}.hb-checks button{display:grid;grid-template-columns:26px 1fr;gap:10px;align-items:center;padding:11px 13px;border:1px solid rgba(15,24,51,.14);border-radius:11px;background:#fff;color:var(--ink);text-align:left;cursor:pointer}.hb-checks button>span{display:grid;width:24px;height:24px;place-items:center;border:1px solid #c8ced8;border-radius:7px}.hb-checks button.is-checked{border-color:var(--silver);background:rgba(61,93,145,.08)}.hb-checks button.is-checked>span{border-color:var(--lapis);background:var(--lapis);color:#fff}.hb-exercise{gap:18px}.hb-pair-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.hb-pair-grid>div{display:flex;flex-direction:column;gap:8px}.hb-pair-grid button,.hb-sequence button,.hb-lab-buttons button,.hb-token-list button{display:flex;gap:8px;align-items:center;padding:10px 12px;border:1px solid rgba(15,24,51,.14);border-radius:10px;background:#fff;color:var(--ink);text-align:left;cursor:pointer}.hb-pair-grid button>span{display:grid;width:23px;height:23px;flex:0 0 auto;place-items:center;border-radius:50%;background:#eef0f4;font-size:10px}.hb-pair-grid button.is-active,.hb-pair-grid button.is-paired,.hb-lab-buttons button.is-active,.hb-token-list button.is-seen{border-color:var(--lapis);background:#edf2fa}.hb-exercise-actions{display:flex;flex-wrap:wrap;gap:8px}.hb-exercise-actions button,.hb-actions button{padding:9px 15px;border:1px solid rgba(15,24,51,.14);border-radius:10px;background:#fff;color:var(--burgundy);font-weight:700;cursor:pointer}.hb-exercise-actions button.is-primary,.hb-actions button.is-primary{border-color:var(--burgundy);background:var(--burgundy);color:#fff}.hb-sequence{display:grid;grid-template-columns:1fr 1fr;gap:18px}.hb-sequence-result,.hb-sequence-options{display:flex;flex-direction:column;gap:8px}.hb-sequence-result>span{display:flex;gap:9px;padding:10px;border-radius:10px;background:#edf2fa}.hb-sequence-result b{color:var(--burgundy)}.hb-lab-buttons,.hb-token-list{display:flex;flex-wrap:wrap;gap:8px}.hb-controls{display:flex;flex-wrap:wrap;gap:18px}.hb-controls label{display:flex;min-width:180px;flex:1;flex-direction:column;gap:7px;color:#5c6578;font-size:12px}.hb-controls input,.hb-controls select{min-height:38px}.hb-controls output{color:var(--ink);font-weight:700}.hb-readout{display:flex;min-height:100px;flex-direction:column;gap:8px;align-items:center;justify-content:center;padding:22px;border-radius:14px;background:var(--ink);color:#fff;text-align:center}.hb-readout strong{font:28px Georgia,serif}.hb-readout span{color:rgba(255,255,255,.72);font-size:13px}.hb-lights{display:flex;gap:9px}.hb-lights i{width:28px;height:28px;border-radius:50%;background:#fff;box-shadow:0 0 12px #fff}.hb-lights i.red{background:#df3152;box-shadow:0 0 12px #df3152}.hb-instruction{font-size:12px!important}.hb-footer{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:13px 27px;border-top:1px solid rgba(15,24,51,.1);background:rgba(255,255,255,.55)}.hb-guide{display:flex;align-items:center;gap:11px}.hb-guide>div{max-width:600px;padding:9px 14px;border:1px solid rgba(15,24,51,.1);border-radius:14px;border-bottom-left-radius:4px;background:#fff;color:#535d70;font-size:12px}.hb-actions{display:flex;gap:9px}.hb-actions button:disabled,.hb-exercise-actions button:disabled{opacity:.42;cursor:not-allowed}.hb-modal{position:absolute;z-index:50;inset:18px;display:flex;flex-direction:column;gap:12px;padding:18px;overflow:auto;border-radius:18px;background:#fff;box-shadow:0 18px 60px rgba(15,24,51,.4)}.hb-modal>button{align-self:flex-end;padding:8px 12px;border:0;border-radius:9px;background:var(--ink);color:#fff;cursor:pointer}.hb-modal img{max-width:100%;max-height:calc(100% - 110px);object-fit:contain}.hb-modal p{margin:0;color:#5c6578;font-size:12px}
@media(max-width:980px){.hb-shell{display:block;height:auto;min-height:760px}.hb-mobile-menu{display:block;width:100%;padding:11px;border:0;background:var(--ink);color:#fff;font-weight:700}.hb-sidebar{display:none}.hb-shell.is-menu-open .hb-sidebar{display:flex;position:absolute;z-index:20;width:min(330px,90vw);height:calc(100% - 42px)}.hb-workspace{min-height:760px}.hb-menu-icon{display:grid;width:38px;height:38px;place-items:center;border:1px solid rgba(15,24,51,.14);border-radius:10px;background:#fff}.hb-content{overflow:visible}.hb-footer{position:sticky;bottom:0}.hb-modal{position:fixed}}
@media(max-width:700px){.hb-topbar{padding:12px 15px}.hb-progress-area>span{display:none}.hb-progress{width:62px}.hb-content{gap:20px;padding:22px 16px}.hb-hero,.hb-card-grid,.hb-pair-grid,.hb-sequence,.hb-success{grid-template-columns:1fr}.hb-hero>img{max-width:180px}.hb-card{padding:19px}.hb-success img{width:110px}.hb-footer{display:flex;flex-direction:column;align-items:stretch;gap:9px;padding:9px 13px;background:rgba(243,241,234,.96)}.hb-guide>img{width:32px!important;height:32px!important}.hb-actions{justify-content:flex-end}.hb-modal{inset:8px}}
`;
