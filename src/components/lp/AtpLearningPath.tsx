import { useEffect, useState } from "react";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { getLpJourney, resetLpJourney, saveLpJourney } from "@/lib/store/lp-journey";
import type { AtpLearningPathDocument, AtpLessonStep, AtpQuestion } from "@/lib/lp/atp-types";

interface AtpJourneyState {
  step: number;
  done: boolean[];
  answers: Record<string, number>;
  seen: Record<string, boolean>;
  checks: Record<string, boolean>;
  finished: boolean;
}

function freshState(total: number): AtpJourneyState {
  return {
    step: 0,
    done: Array.from({ length: total }, () => false),
    answers: {},
    seen: {},
    checks: {},
    finished: false,
  };
}

function frontier(state: AtpJourneyState): number {
  let index = 0;
  while (index < state.done.length - 1 && state.done[index]) index += 1;
  return index;
}

function missionDone(
  state: AtpJourneyState,
  steps: AtpLessonStep[],
  takeaways: string[],
  introExplore?: AtpLearningPathDocument["content"]["introExplore"],
): boolean {
  if (state.step === 0) {
    return !introExplore || introExplore.every((_, index) => state.seen[`0-${index}`]);
  }
  if (state.step === state.done.length - 1) {
    return takeaways.every((_, index) => state.checks[index]);
  }
  const lesson = steps[state.step - 1];
  const questionsDone = lesson.questions.every(
    (question, index) => state.answers[`${state.step}-${index}`] === question.answer,
  );
  const exploresDone =
    !lesson.explore || lesson.explore.every((_, index) => state.seen[`${state.step}-${index}`]);
  return questionsDone && exploresDone;
}

/** El contenido proviene del JSON estático extraído; nunca ejecutamos scripts del HTML original. */
function RichText({ html, className = "" }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Question({
  question,
  value,
  onAnswer,
}: {
  question: AtpQuestion;
  value?: number;
  onAnswer: (answer: number) => void;
}) {
  const answered = Number.isInteger(value);
  const correct = value === question.answer;
  return (
    <div className="atp-choices" role="group" aria-label={question.prompt}>
      <RichText html={question.prompt} className="atp-question" />
      {question.options.map((option, index) => {
        const selected = value === index;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            className={`atp-option ${selected ? (correct ? "is-correct" : "is-wrong") : ""}`}
            onClick={() => onAnswer(index)}
          >
            <span>{selected ? (correct ? "✓" : "↺") : String.fromCharCode(65 + index)}</span>
            <RichText html={option} />
          </button>
        );
      })}
      <div
        className={`atp-feedback ${answered ? (correct ? "is-correct" : "is-wrong") : ""}`}
        role="status"
      >
        {answered ? (
          <>
            <strong>{correct ? "Bien razonado." : "Revisa la condición."}</strong>{" "}
            {question.explanation}
            {!correct && " Vuelve a elegir aplicando esta regla."}
          </>
        ) : (
          "Selecciona una respuesta. Puedes volver a intentarlo."
        )}
      </div>
    </div>
  );
}

export function AtpLearningPath({
  document,
  userId,
  lpId,
  completed,
  onComplete,
}: {
  document: AtpLearningPathDocument;
  userId: string;
  lpId: string;
  completed: boolean;
  onComplete: () => void;
}) {
  const { meta, content, figures } = document;
  const labels = ["Despegue", ...content.steps.map((step) => step.name), "Aterrizaje"];
  const [state, setState] = useState<AtpJourneyState>(() => freshState(labels.length));
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    const saved = getLpJourney<AtpJourneyState>(userId, lpId);
    if (saved && saved.done?.length === labels.length) {
      setState({ ...freshState(labels.length), ...saved });
    } else if (completed) {
      setState({
        ...freshState(labels.length),
        done: Array.from({ length: labels.length }, () => true),
        finished: true,
      });
    }
    setHydrated(true);
  }, [completed, hydrated, labels.length, lpId, userId]);

  useEffect(() => {
    if (hydrated) saveLpJourney(userId, lpId, state);
  }, [hydrated, lpId, state, userId]);

  const currentDone = missionDone(state, content.steps, content.takeaways, content.introExplore);
  const openThrough = frontier(state);
  const doneCount = state.done.filter(Boolean).length;
  const percent = Math.round((doneCount / labels.length) * 100);
  const update = (patch: Partial<AtpJourneyState>) =>
    setState((current) => ({ ...current, ...patch }));

  const goTo = (index: number) => {
    if (index < 0 || index >= labels.length || index > openThrough) return;
    update({ step: index });
    setMenuOpen(false);
  };

  const advance = () => {
    if (!currentDone || (state.finished && state.step === labels.length - 1)) return;
    const done = [...state.done];
    done[state.step] = true;
    if (state.step < labels.length - 1) {
      update({ done, step: state.step + 1 });
    } else {
      update({ done, finished: true });
      onComplete();
    }
  };

  const reset = () => {
    if (!window.confirm("¿Empezar de nuevo? Se borrará el avance interno de este recorrido."))
      return;
    resetLpJourney(userId, lpId);
    setState(freshState(labels.length));
  };

  const guide = state.finished
    ? "Recorrido completo. Puedes volver a cualquier etapa para repasar."
    : state.step === 0
      ? "Este es tu plan de vuelo. Toca Empezar para trabajar la primera idea."
      : state.step === labels.length - 1
        ? "Marca sólo lo que puedes explicar sin mirar."
        : currentDone
          ? "Aplicaste la regla. Puedes continuar cuando quieras."
          : "Lee la explicación y completa la misión. Si te equivocas, revisa la condición del caso.";

  return (
    <section className={`atp-shell ${menuOpen ? "is-menu-open" : ""}`}>
      <style>{styles}</style>
      <button
        type="button"
        className="atp-mobile-menu"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
      >
        {menuOpen ? "Cerrar plan de vuelo" : "Abrir plan de vuelo"}
      </button>
      <aside className="atp-sidebar" aria-label="Plan de vuelo">
        <div className="atp-plan">
          <span>ATP · Chapter {meta.chapter_number}</span>
          <h2>{meta.topic_name}</h2>
          <p>{content.subtitle}</p>
        </div>
        <nav className="atp-waypoints">
          {labels.map((label, index) => {
            const locked = index > openThrough;
            const active = index === state.step;
            const done = state.done[index];
            return (
              <button
                key={`${index}-${label}`}
                type="button"
                disabled={locked}
                aria-current={active ? "step" : undefined}
                className={`atp-waypoint ${done ? "is-done" : ""}`}
                onClick={() => goTo(index)}
              >
                <span>{done ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{label}</strong>
                  <small>
                    {done ? "Completada" : active ? "En ruta" : locked ? "Bloqueada" : "Disponible"}
                  </small>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="atp-altitude">
          <img src="/img/pathy-small.png" alt="" />
          <div>
            <small>Tu altitud</small>
            <strong>{percent}%</strong>
            <span>
              {doneCount} de {labels.length} etapas
            </span>
          </div>
        </div>
        <button type="button" className="atp-reset" onClick={reset}>
          ↻ Empezar de nuevo
        </button>
      </aside>

      <div className="atp-workspace">
        <header className="atp-topbar">
          <button
            type="button"
            className="atp-menu-icon"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar plan de vuelo" : "Abrir plan de vuelo"}
          >
            ☰
          </button>
          <div>
            <span>
              Learning path · {String(state.step + 1).padStart(2, "0")} /{" "}
              {String(labels.length).padStart(2, "0")}
            </span>
            <strong>{labels[state.step]}</strong>
          </div>
          <div className="atp-progress-area">
            <span>{currentDone ? "Misión cumplida" : "Misión en curso"}</span>
            <div
              className="atp-progress"
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

        <main className="atp-content">
          {state.step === 0 ? (
            <Takeoff
              document={document}
              total={labels.length}
              seen={state.seen}
              onReveal={(key) => update({ seen: { ...state.seen, [key]: true } })}
            />
          ) : state.step === labels.length - 1 ? (
            <Landing
              document={document}
              checks={state.checks}
              finished={state.finished}
              onCheck={(index) =>
                update({ checks: { ...state.checks, [index]: !state.checks[index] } })
              }
            />
          ) : (
            <Lesson
              step={content.steps[state.step - 1]}
              stepNumber={state.step}
              figures={figures}
              answers={state.answers}
              seen={state.seen}
              onAnswer={(key, value) => update({ answers: { ...state.answers, [key]: value } })}
              onReveal={(key) => update({ seen: { ...state.seen, [key]: true } })}
              source={content.source}
              excluded={content.excluded}
              depth={content.depth}
            />
          )}
        </main>

        <footer className="atp-footer">
          <div className="atp-guide">
            <YarisAvatar size={44} ring />
            <div>{guide}</div>
          </div>
          <div className="atp-actions">
            <button type="button" disabled={state.step === 0} onClick={() => goTo(state.step - 1)}>
              Anterior
            </button>
            <button
              type="button"
              className="is-primary"
              disabled={!currentDone || (state.finished && state.step === labels.length - 1)}
              onClick={advance}
            >
              {state.step === 0
                ? "Empezar"
                : state.step === labels.length - 1
                  ? state.finished
                    ? "Completado"
                    : "Terminar"
                  : "Siguiente"}
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

function Source({ source, excluded, depth }: { source: string; excluded: string; depth: string }) {
  return (
    <details className="atp-source">
      <summary>Fuente y alcance de este Learning Path</summary>
      <p>
        <strong>Fuente:</strong> Libro ATP proporcionado · {source}.
      </p>
      <p>
        <strong>Profundidad:</strong> {depth}
      </p>
      <p>
        <strong>Fuera de este tema:</strong> {excluded}
      </p>
    </details>
  );
}

function Takeoff({
  document,
  total,
  seen,
  onReveal,
}: {
  document: AtpLearningPathDocument;
  total: number;
  seen: Record<string, boolean>;
  onReveal: (key: string) => void;
}) {
  const { meta, content } = document;
  return (
    <>
      <div className="atp-hero">
        <div>
          <span className="atp-pill">01 · Despegue</span>
          <h1>{meta.topic_name}</h1>
          <h2>{content.subtitle}</h2>
          <p>{content.intro}</p>
          <div className="atp-stats">
            <span>
              <small>Etapas</small>
              <strong>{total} misiones</strong>
            </span>
            <span>
              <small>Enfoque</small>
              <strong>ATP Airplane</strong>
            </span>
            <span>
              <small>Chapter</small>
              <strong>
                {meta.chapter_number} · {meta.chapter_name}
              </strong>
            </span>
          </div>
        </div>
        <img src="/img/pathy-small.png" alt="Pathy acompaña el recorrido" />
      </div>
      {content.introExplore && (
        <section className="atp-card atp-dark">
          <span className="atp-overline">Misión 1 · Toca cada tarjeta</span>
          <h3>Primero, las palabras clave.</h3>
          <div className="atp-grid">
            {content.introExplore.map((item, index) => {
              const key = `0-${index}`;
              const revealed = seen[key];
              return (
                <button
                  key={key}
                  type="button"
                  className="atp-reveal"
                  aria-expanded={revealed}
                  onClick={() => onReveal(key)}
                >
                  <strong>{item.title}</strong>
                  <span>
                    {revealed ? item.body : "Toca para descubrir qué significa en este tema."}
                  </span>
                  <small>{revealed ? "✓ Descubierta" : "Descubrir →"}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}
      <section className="atp-card atp-dark">
        <span className="atp-overline">Tu plan de vuelo</span>
        <h3>Al terminar podrás…</h3>
        <div className="atp-takeaways">
          {content.takeaways.map((takeaway) => (
            <p key={takeaway}>{takeaway}</p>
          ))}
        </div>
      </section>
      <Source source={content.source} excluded={content.excluded} depth={content.depth} />
    </>
  );
}

function Lesson({
  step,
  stepNumber,
  figures,
  answers,
  seen,
  onAnswer,
  onReveal,
  source,
  excluded,
  depth,
}: {
  step: AtpLessonStep;
  stepNumber: number;
  figures: Record<string, string>;
  answers: Record<string, number>;
  seen: Record<string, boolean>;
  onAnswer: (key: string, value: number) => void;
  onReveal: (key: string) => void;
  source: string;
  excluded: string;
  depth: string;
}) {
  return (
    <>
      <header className="atp-heading">
        <span className="atp-pill">
          {String(stepNumber + 1).padStart(2, "0")} · {step.name}
        </span>
        <h2>{step.title}</h2>
        {step.lead && <p>{step.lead}</p>}
      </header>

      {step.cards.length > 0 && (
        <div className={step.cards.length > 1 ? "atp-grid" : ""}>
          {step.cards.map((card, index) => (
            <section
              key={`${index}-${card.title}`}
              className={`atp-card ${card.dark ? "atp-dark" : ""}`}
            >
              <h3>{card.title}</h3>
              <RichText html={card.body} className="atp-prose" />
            </section>
          ))}
        </div>
      )}

      {step.table && (
        <section className="atp-card atp-table-card">
          <div className="atp-table-scroll" tabIndex={0} role="region" aria-label={step.name}>
            <table>
              <thead>
                <tr>
                  {step.table.headers.map((header) => (
                    <th key={header} scope="col">
                      <RichText html={header} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) =>
                      cellIndex === 0 ? (
                        <th key={cellIndex} scope="row">
                          <RichText html={String(cell)} />
                        </th>
                      ) : (
                        <td key={cellIndex}>
                          <RichText html={String(cell)} />
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {step.figure && figures[step.figure.file] && (
        <figure className="atp-card atp-figure">
          <img src={figures[step.figure.file]} alt={step.figure.alt} />
          <figcaption>{step.figure.caption}</figcaption>
        </figure>
      )}

      {step.explore && (
        <section className="atp-card atp-dark">
          <span className="atp-overline">Toca cada tarjeta para comparar</span>
          <div className="atp-grid">
            {step.explore.map((item, index) => {
              const key = `${stepNumber}-${index}`;
              const revealed = seen[key];
              return (
                <button
                  key={key}
                  type="button"
                  className="atp-reveal"
                  aria-expanded={revealed}
                  onClick={() => onReveal(key)}
                >
                  <strong>{item.title}</strong>
                  <span>{revealed ? item.body : "Descubre qué cambia en este caso."}</span>
                  <small>{revealed ? "✓ Descubierta" : "Toca para descubrir →"}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {step.note && <aside className="atp-note">{step.note}</aside>}

      {step.questions.length > 0 && (
        <section className="atp-card">
          <span className="atp-overline atp-overline--dark">
            Misión {stepNumber + 1} · Aplica lo que acabas de ver
          </span>
          <div className="atp-question-stack">
            {step.questions.map((question, index) => {
              const key = `${stepNumber}-${index}`;
              return (
                <Question
                  key={key}
                  question={question}
                  value={answers[key]}
                  onAnswer={(answer) => onAnswer(key, answer)}
                />
              );
            })}
          </div>
        </section>
      )}
      <Source source={source} excluded={excluded} depth={depth} />
    </>
  );
}

function Landing({
  document,
  checks,
  finished,
  onCheck,
}: {
  document: AtpLearningPathDocument;
  checks: Record<string, boolean>;
  finished: boolean;
  onCheck: (index: number) => void;
}) {
  const { content } = document;
  return (
    <>
      <header className="atp-heading">
        <span className="atp-pill">Aterrizaje</span>
        <h2>{finished ? "Ya tienes el criterio." : "Quédate con lo esencial."}</h2>
        <p>
          Marca lo que puedes explicar con tus palabras. Las etapas anteriores están disponibles
          para repasar.
        </p>
      </header>
      {finished && (
        <div className="atp-finish-banner" role="status">
          <strong>Recorrido completo.</strong> Puedes revisar cualquier etapa.
        </div>
      )}
      <div className="atp-grid">
        <section className="atp-card atp-dark">
          <span className="atp-overline">Tu mapa del tema</span>
          <h3>{content.subtitle}</h3>
          <div className="atp-takeaways">
            {content.takeaways.map((takeaway) => (
              <p key={takeaway}>{takeaway}</p>
            ))}
          </div>
        </section>
        <section className="atp-card">
          <span className="atp-overline atp-overline--dark">Chequeo final</span>
          <div className="atp-checks">
            {content.takeaways.map((takeaway, index) => (
              <button
                key={takeaway}
                type="button"
                className={checks[index] ? "is-checked" : ""}
                onClick={() => onCheck(index)}
              >
                <span>{checks[index] ? "✓" : ""}</span>
                {takeaway}
              </button>
            ))}
          </div>
          <div className="atp-celebration">
            <img
              src={finished ? "/img/pathy-5-elite.png" : "/img/pathy-small.png"}
              alt="Pathy acompaña el cierre"
            />
            <p>
              <strong>{finished ? "Aterrizaste." : "Casi aterrizas."}</strong>
              <br />
              {finished ? "Completaste este Learning Path." : "Marca las ideas y toca Terminar."}
            </p>
          </div>
        </section>
      </div>
      <Source source={content.source} excluded={content.excluded} depth={content.depth} />
    </>
  );
}

const styles = `
.atp-shell{--ink:#0f1833;--burgundy:#7A5C1E;--cherry:#C7A052;--lapis:#163D70;--silver:#90a5c8;--page:#f3f1ea;display:grid;grid-template-columns:248px minmax(0,1fr);height:min(920px,calc(100vh - 64px));min-height:680px;margin-bottom:24px;overflow:hidden;border:1px solid rgba(15,24,51,.12);border-radius:24px;background:var(--page);color:var(--ink);box-shadow:0 18px 50px rgba(15,24,51,.12)}
.atp-shell *{box-sizing:border-box}.atp-shell button{font:inherit}.atp-mobile-menu{display:none}.atp-sidebar{position:relative;display:flex;min-height:0;flex-direction:column;padding:24px 18px 18px;overflow:hidden;background:radial-gradient(120% 120% at 20% 0%,#2a426e 0%,var(--ink) 58%);color:#fff}.atp-plan{padding:0 6px 16px}.atp-plan>span,.atp-overline{display:block;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.17em;text-transform:uppercase;color:var(--cherry)}.atp-plan h2{margin:8px 0 0;font-family:Georgia,serif;font-size:22px;line-height:1.06}.atp-plan p{margin:6px 0 0;color:rgba(255,255,255,.62);font-size:12px;line-height:1.4}.atp-waypoints{position:relative;display:flex;min-height:0;flex:1;flex-direction:column;gap:4px;overflow:auto;padding:4px 0}.atp-waypoint{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;align-items:center;padding:8px 6px;border:0;border-radius:12px;background:transparent;color:#fff;text-align:left;cursor:pointer}.atp-waypoint:hover:not(:disabled),.atp-waypoint[aria-current]{background:rgba(255,255,255,.09)}.atp-waypoint:disabled{opacity:.43;cursor:not-allowed}.atp-waypoint>span:first-child{display:grid;width:30px;height:30px;place-items:center;border-radius:50%;background:rgba(255,255,255,.08);font-family:ui-monospace,monospace;font-size:10px}.atp-waypoint[aria-current]>span:first-child{background:#fff;color:var(--ink);box-shadow:0 0 0 4px rgba(199,160,82,.32)}.atp-waypoint.is-done>span:first-child{background:var(--cherry);color:var(--burgundy)}.atp-waypoint strong,.atp-waypoint small{display:block}.atp-waypoint strong{font-size:12px;line-height:1.2}.atp-waypoint small{margin-top:2px;color:rgba(255,255,255,.55);font-size:10px}.atp-altitude{display:flex;gap:10px;align-items:center;margin-top:12px;padding:12px;border-radius:15px;background:rgba(255,255,255,.06)}.atp-altitude img{width:48px;height:48px;object-fit:contain}.atp-altitude small,.atp-altitude strong,.atp-altitude span{display:block}.atp-altitude small{color:rgba(255,255,255,.55);font-size:9px;text-transform:uppercase}.atp-altitude strong{font-family:Georgia,serif;font-size:21px}.atp-altitude span{color:rgba(255,255,255,.55);font-size:10px}.atp-reset{margin-top:8px;padding:5px;border:0;background:none;color:rgba(255,255,255,.55);font-size:11px;text-align:left;cursor:pointer}
.atp-workspace{display:grid;min-width:0;min-height:0;grid-template-rows:auto minmax(0,1fr) auto}.atp-topbar{display:flex;align-items:center;gap:16px;padding:15px 28px;border-bottom:1px solid rgba(15,24,51,.1);background:rgba(255,255,255,.45)}.atp-topbar>div:nth-child(2)>span{display:block;color:#737b8e;font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase}.atp-topbar>div:nth-child(2)>strong{display:block;margin-top:2px;font-size:14px}.atp-menu-icon{display:none}.atp-progress-area{display:flex;align-items:center;gap:10px;margin-left:auto;color:#697286;font-size:11px}.atp-progress{width:140px;height:6px;overflow:hidden;border-radius:999px;background:rgba(15,24,51,.08)}.atp-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--cherry),var(--burgundy));transition:width .35s}.atp-content{display:flex;flex-direction:column;gap:26px;padding:30px;overflow:auto}.atp-pill{display:inline-flex;width:max-content;padding:5px 11px;border:1px solid rgba(199,160,82,.5);border-radius:999px;background:rgba(199,160,82,.18);color:var(--burgundy);font-family:ui-monospace,monospace;font-size:10px;font-weight:700;letter-spacing:.11em;text-transform:uppercase}.atp-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(180px,.55fr);gap:28px;align-items:center}.atp-hero h1,.atp-heading h2{margin:14px 0 0;font-family:Georgia,serif;font-size:clamp(36px,4.2vw,58px);letter-spacing:-.035em;line-height:1.02}.atp-hero h2{margin:10px 0;color:var(--burgundy);font-family:Georgia,serif;font-size:clamp(24px,2.8vw,38px);font-style:italic;font-weight:400}.atp-hero p,.atp-heading p{max-width:760px;margin:0;color:#5c6578;font-size:16px;line-height:1.65}.atp-hero>img{width:100%;max-width:290px;margin:auto;filter:drop-shadow(0 20px 28px rgba(15,24,51,.18));animation:atp-float 5s ease-in-out infinite}.atp-stats{display:flex;flex-wrap:wrap;gap:22px;margin-top:18px;padding-top:14px;border-top:1px solid rgba(15,24,51,.1)}.atp-stats small,.atp-stats strong{display:block}.atp-stats small{color:#788094;font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.atp-stats strong{margin-top:3px;font-size:12px}.atp-heading{display:flex;max-width:790px;flex-direction:column;gap:12px}.atp-heading h2{margin:0;font-size:clamp(32px,3.7vw,50px)}
.atp-card{display:flex;flex-direction:column;gap:15px;padding:25px;border:1px solid rgba(15,24,51,.12);border-radius:16px;background:#fff;box-shadow:0 7px 24px rgba(15,24,51,.06)}.atp-card h3{margin:0;font-family:Georgia,serif;font-size:24px;line-height:1.12}.atp-dark{border-color:transparent;background:var(--ink);color:#fff}.atp-dark h3,.atp-dark strong{color:#fff}.atp-dark p{color:rgba(255,255,255,.74)}.atp-overline--dark{color:var(--burgundy)}.atp-takeaways{display:flex;flex-direction:column;gap:9px}.atp-takeaways p{margin:0;padding:12px 14px;border-radius:11px;background:rgba(255,255,255,.06);font-size:13px;line-height:1.45}.atp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.atp-prose{color:#5c6578;font-size:15px;line-height:1.62}.atp-prose p{margin:0}.atp-prose p+p{margin-top:11px}.atp-prose ul{margin:8px 0;padding-left:20px}.atp-dark .atp-prose{color:rgba(255,255,255,.76)}.atp-table-card{padding:0;overflow:hidden}.atp-table-scroll{overflow-x:auto}.atp-table-card table{width:100%;border-collapse:collapse;font-size:13px;line-height:1.5}.atp-table-card th,.atp-table-card td{padding:14px 17px;border-bottom:1px solid rgba(15,24,51,.1);text-align:left;vertical-align:top}.atp-table-card thead{background:var(--ink);color:#fff}.atp-table-card tbody th{font-weight:700}.atp-table-card tbody tr:nth-child(even){background:rgba(22,61,112,.04)}.atp-figure{margin:0}.atp-figure img{max-width:100%;max-height:580px;object-fit:contain}.atp-figure figcaption{color:#737c8e;font-size:11px;line-height:1.55}.atp-reveal{display:flex;min-height:150px;flex-direction:column;gap:8px;padding:17px;border:1px solid rgba(255,255,255,.15);border-radius:14px;background:rgba(255,255,255,.05);color:#fff;text-align:left;cursor:pointer}.atp-reveal:hover{border-color:var(--cherry);transform:translateY(-2px)}.atp-reveal[aria-expanded=true]{border-color:var(--cherry);background:rgba(199,160,82,.15)}.atp-reveal strong{font-family:Georgia,serif;font-size:20px}.atp-reveal span{color:rgba(255,255,255,.76);font-size:13px;line-height:1.5}.atp-reveal small{margin-top:auto;color:var(--cherry);font-size:11px}.atp-note{padding:15px 19px;border:1px solid rgba(15,24,51,.1);border-radius:14px;background:#f2e6e9;color:#4c5365;font-size:13px;line-height:1.55}
.atp-question-stack{display:flex;flex-direction:column;gap:20px}.atp-choices{display:flex;flex-direction:column;gap:8px}.atp-choices+.atp-choices{padding-top:19px;border-top:1px solid rgba(15,24,51,.1)}.atp-question{font-size:14px;font-weight:700;line-height:1.45}.atp-question p{margin:0}.atp-option{display:flex;gap:10px;align-items:center;min-height:44px;padding:10px 13px;border:1px solid rgba(15,24,51,.16);border-radius:11px;background:#fff;color:var(--ink);text-align:left;cursor:pointer}.atp-option:hover{border-color:var(--burgundy);background:#f8eef0}.atp-option>span{display:grid;width:27px;height:27px;flex-shrink:0;place-items:center;border-radius:50%;background:rgba(15,24,51,.06);font-family:ui-monospace,monospace;font-size:10px}.atp-option.is-correct{border-color:var(--silver);background:rgba(22,61,112,.1);color:#2d4e7e}.atp-option.is-wrong{border-color:#bd5971;background:rgba(122,92,30,.07);color:var(--burgundy)}.atp-feedback{min-height:44px;padding:11px 13px;border-radius:11px;background:#f0f1f4;color:#4f586b;font-size:13px;line-height:1.5}.atp-feedback.is-correct{background:rgba(22,61,112,.1)}.atp-feedback.is-wrong{background:rgba(122,92,30,.07)}.atp-source{color:#70798b;font-size:11px;line-height:1.55}.atp-source summary{width:max-content;padding:7px 0;cursor:pointer;font-weight:700}.atp-source p{margin:5px 0}.atp-checks{display:flex;flex-direction:column;gap:8px}.atp-checks button{display:grid;grid-template-columns:26px 1fr;gap:9px;align-items:center;padding:10px 12px;border:1px solid rgba(15,24,51,.14);border-radius:11px;background:#fff;color:var(--ink);text-align:left;cursor:pointer}.atp-checks button>span{display:grid;width:24px;height:24px;place-items:center;border:1px solid #c8ced8;border-radius:7px}.atp-checks button.is-checked{border-color:var(--silver);background:rgba(22,61,112,.08)}.atp-checks button.is-checked>span{border-color:var(--lapis);background:var(--lapis);color:#fff}.atp-celebration{display:flex;gap:13px;align-items:center;padding-top:14px;border-top:1px solid rgba(15,24,51,.1)}.atp-celebration img{width:82px;height:82px;object-fit:contain}.atp-celebration p{margin:0;color:#60697b;font-size:12px;line-height:1.5}.atp-finish-banner{padding:14px 18px;border-radius:14px;background:var(--lapis);color:#fff}.atp-finish-banner strong{color:#fff}
.atp-footer{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:13px 27px;border-top:1px solid rgba(15,24,51,.1);background:rgba(255,255,255,.5)}.atp-guide{display:flex;align-items:center;gap:11px;min-width:0}.atp-guide>div{max-width:560px;padding:9px 14px;border:1px solid rgba(15,24,51,.1);border-radius:14px;border-bottom-left-radius:4px;background:#fff;color:#535d70;font-size:12px;line-height:1.4}.atp-actions{display:flex;gap:9px}.atp-actions button{min-height:41px;padding:9px 17px;border:1px solid rgba(15,24,51,.14);border-radius:11px;background:#fff;color:var(--burgundy);font-size:13px;font-weight:700;cursor:pointer}.atp-actions button.is-primary{border-color:var(--burgundy);background:var(--burgundy);color:#fff}.atp-actions button:disabled{opacity:.4;cursor:not-allowed}
@keyframes atp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@media(prefers-reduced-motion:reduce){.atp-shell *{animation:none!important;transition:none!important}}
@media(max-width:980px){.atp-shell{display:block;height:auto;min-height:760px}.atp-mobile-menu{display:block;width:100%;padding:11px;border:0;background:var(--ink);color:#fff;font-weight:700}.atp-sidebar{display:none}.atp-shell.is-menu-open .atp-sidebar{display:flex;position:absolute;z-index:20;width:min(320px,90vw);height:calc(100% - 42px)}.atp-workspace{min-height:760px}.atp-menu-icon{display:grid;width:38px;height:38px;place-items:center;border:1px solid rgba(15,24,51,.14);border-radius:10px;background:#fff}.atp-content{overflow:visible}.atp-footer{position:sticky;bottom:0}}
@media(max-width:700px){.atp-topbar{padding:12px 15px}.atp-progress-area>span{display:none}.atp-progress{width:62px}.atp-content{gap:22px;padding:23px 17px}.atp-hero,.atp-grid{grid-template-columns:1fr}.atp-hero>img{max-width:190px}.atp-card{padding:20px}.atp-table-card{padding:0}.atp-table-card th,.atp-table-card td{min-width:115px;padding:11px}.atp-heading h2{font-size:34px}.atp-footer{display:flex;flex-direction:column;align-items:stretch;gap:9px;padding:9px 13px;background:rgba(243,241,234,.96)}.atp-guide>img{width:32px!important;height:32px!important}.atp-guide>div{flex:1;font-size:11px}.atp-actions{justify-content:flex-end}.atp-actions button{padding:8px 13px}}
`;
