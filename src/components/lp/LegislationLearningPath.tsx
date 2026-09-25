import { useEffect, useMemo, useState } from "react";
import { LearningPathYarisAvatar } from "./LearningPathCharacters";
import { LearningPathPathyMark } from "./LearningPathCharacters";
import { LEGISLATION_ANNEXES } from "@/lib/lp/legislation-content.generated";
import type { LegislationCourse, LegislationStep } from "@/lib/lp/legislation-types";
import { getLpJourney, resetLpJourney, saveLpJourney } from "@/lib/store/lp-journey";
import { useLearningPathStageView } from "@/components/lp/LearningPathExperience";

interface JourneyState {
  stage: number;
  maxStage: number;
  complete: boolean;
  answers: Record<string, number>;
  revealed: Record<string, boolean>;
  matches: Record<string, string>;
  orders: Record<string, number[]>;
}

const freshState = (): JourneyState => ({
  stage: 0,
  maxStage: 0,
  complete: false,
  answers: {},
  revealed: {},
  matches: {},
  orders: {},
});

const key = (stage: number, kind: string, index: number) => `${stage}:${kind}:${index}`;

function challengeOptions(number: number) {
  const indexes = [number - 1, number % 19, (number + 5) % 19, (number + 11) % 19];
  return indexes.map((index) => LEGISLATION_ANNEXES[index]);
}

function ready(step: LegislationStep, stage: number, state: JourneyState) {
  const checks: boolean[] = [];
  if (step.cards)
    checks.push(step.cards.every((_, index) => state.revealed[key(stage, "card", index)]));
  if (step.questions)
    checks.push(
      step.questions.every(
        (question, index) => state.answers[key(stage, "question", index)] === question.answer,
      ),
    );
  if (step.match)
    checks.push(
      step.match.every(([, right], index) => state.matches[key(stage, "match", index)] === right),
    );
  if (step.order) {
    const order = state.orders[String(stage)] ?? step.order.map((_, index) => index).reverse();
    checks.push(order.every((value, index) => value === index));
  }
  if (step.recall)
    checks.push(step.recall.every((_, index) => state.revealed[key(stage, "recall", index)]));
  if (step.recap)
    checks.push(step.recap.every((_, index) => state.revealed[key(stage, "recap", index)]));
  if (step.annex)
    checks.push(step.annex.every((number) => state.revealed[key(stage, "annex", number)]));
  if (step.challenge)
    checks.push(
      LEGISLATION_ANNEXES.every(
        (annex) => state.answers[key(stage, "challenge", annex.n)] === annex.n,
      ),
    );
  return checks.length === 0 || checks.every(Boolean);
}

export function LegislationLearningPath({
  document,
  userId,
  lpId,
  completed,
  onComplete,
}: {
  document: LegislationCourse;
  userId: string;
  lpId: string;
  completed: boolean;
  onComplete: () => void;
}) {
  const [state, setState] = useState<JourneyState>(freshState);
  const [hydrated, setHydrated] = useState(false);
  const step = document.steps[state.stage];
  const canContinue = ready(step, state.stage, state);
  const percent = state.complete
    ? 100
    : Math.round((state.maxStage / Math.max(1, document.steps.length - 1)) * 100);

  useEffect(() => {
    if (hydrated) return;
    const saved = getLpJourney<JourneyState>(userId, lpId);
    if (saved && saved.stage < document.steps.length && saved.maxStage < document.steps.length) {
      setState({ ...freshState(), ...saved });
    } else if (completed) {
      setState({ ...freshState(), maxStage: document.steps.length - 1, complete: true });
    }
    setHydrated(true);
  }, [completed, document.steps.length, hydrated, lpId, userId]);

  useEffect(() => {
    if (hydrated) saveLpJourney(userId, lpId, state);
  }, [hydrated, lpId, state, userId]);

  const patch = (next: Partial<JourneyState>) => setState((current) => ({ ...current, ...next }));
  const finish = state.stage === document.steps.length - 1;

  const advance = () => {
    if (!canContinue || state.complete) return;
    if (finish) {
      patch({ complete: true, maxStage: document.steps.length - 1 });
      onComplete();
      return;
    }
    const next = state.stage + 1;
    patch({ stage: next, maxStage: Math.max(state.maxStage, next) });
  };

  const goTo = (index: number) => {
    if (index < 0 || index > state.maxStage || index >= document.steps.length) return;
    patch({ stage: index });
  };

  useLearningPathStageView({
    labels: document.steps.map((item) => item.label), current: state.stage,
    highest: state.maxStage,
    done: document.steps.map((_, index) => index < state.maxStage || state.complete),
    percent, onNavigate: goTo,
  });

  return (
    <section className="law-shell">
      <style>{styles}</style>
      <aside className="law-nav">
        <p>{document.year}</p>
        <h2>{document.name}</h2>
        <small>{document.subtitle}</small>
        <nav>
          {document.steps.map((item, index) => (
            <button
              type="button"
              key={`${index}-${item.label}`}
              disabled={index > state.maxStage}
              aria-current={index === state.stage ? "step" : undefined}
              onClick={() => patch({ stage: index })}
            >
              <span>{index < state.maxStage || state.complete ? "✓" : index + 1}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="law-meter">
          <i style={{ width: `${percent}%` }} />
        </div>
        <b>{percent}% completado</b>
      </aside>

      <div className="law-main">
        <header>
          <div>
            <small>
              Etapa {state.stage + 1} de {document.steps.length}
            </small>
            <strong>{step.label}</strong>
          </div>
          <span className="law-mission">
            <LearningPathPathyMark size={28} />
            {canContinue ? "Etapa lista" : "Misión en curso"}
          </span>
        </header>
        <main>
          <div className="law-kicker">
            {document.year} · {document.word}
          </div>
          <h2 dangerouslySetInnerHTML={{ __html: step.title }} />
          <div className="law-body" dangerouslySetInnerHTML={{ __html: step.body }} />
          {step.figure && (
            <figure className="law-figure">
              <img src={step.figure.src} alt={step.figure.alt} />
              <figcaption>{step.figure.alt}</figcaption>
            </figure>
          )}
          {step.guide && (
            <p className="law-guide">
              <strong>Yaris:</strong> {step.guide}
            </p>
          )}
          {step.cards && (
            <RevealCards items={step.cards} stage={state.stage} state={state} patch={patch} />
          )}
          {step.questions && (
            <Questions items={step.questions} stage={state.stage} state={state} patch={patch} />
          )}
          {step.match && (
            <Match items={step.match} stage={state.stage} state={state} patch={patch} />
          )}
          {step.order && (
            <Order items={step.order} stage={state.stage} state={state} patch={patch} />
          )}
          {step.memory && (
            <div className="law-memory">
              <strong dangerouslySetInnerHTML={{ __html: step.memory.visual }} />
              <p>{step.memory.text}</p>
            </div>
          )}
          {step.recall && (
            <RevealCards
              items={step.recall}
              stage={state.stage}
              state={state}
              patch={patch}
              kind="recall"
            />
          )}
          {step.recap && (
            <RevealCards
              items={step.recap}
              stage={state.stage}
              state={state}
              patch={patch}
              kind="recap"
            />
          )}
          {step.annex && (
            <AnnexCards numbers={step.annex} stage={state.stage} state={state} patch={patch} />
          )}
          {step.challenge && (
            <AnnexChallenge
              level={step.challenge}
              stage={state.stage}
              state={state}
              patch={patch}
            />
          )}
          {step.refs && (
            <div className="law-refs">
              <strong>Referencias</strong>
              {step.refs.map((ref) => (
                <span key={ref}>{ref}</span>
              ))}
            </div>
          )}
        </main>
        <footer>
          <div className="law-coach">
            <LearningPathYarisAvatar size={44} ring />
            <span>
              {state.complete
                ? "Recorrido completo; puedes repasar cualquier etapa."
                : canContinue
                  ? "Actividad completa. Continúa cuando estés listo."
                  : "Completa la actividad para avanzar."}
            </span>
          </div>
          <div className="law-actions">
            <button
              type="button"
              disabled={state.stage === 0}
              onClick={() => patch({ stage: state.stage - 1 })}
            >
              Anterior
            </button>
            {!state.complete && (
              <button type="button" className="primary" disabled={!canContinue} onClick={advance}>
                {finish ? "Completar Learning Path" : "Continuar"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Reiniciar este recorrido?")) {
                  resetLpJourney(userId, lpId);
                  setState(freshState());
                }
              }}
            >
              Reiniciar
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

type Patch = (next: Partial<JourneyState>) => void;

function RevealCards({
  items,
  stage,
  state,
  patch,
  kind = "card",
}: {
  items: [string, string][];
  stage: number;
  state: JourneyState;
  patch: Patch;
  kind?: string;
}) {
  return (
    <div className="law-grid">
      {items.map(([title, text], index) => {
        const id = key(stage, kind, index);
        const open = state.revealed[id];
        return (
          <button
            type="button"
            className={`law-card ${open ? "open" : ""}`}
            key={id}
            onClick={() => patch({ revealed: { ...state.revealed, [id]: true } })}
          >
            <strong>{title}</strong>
            <span>{open ? text : "Descubrir"}</span>
          </button>
        );
      })}
    </div>
  );
}

function Questions({
  items,
  stage,
  state,
  patch,
}: {
  items: NonNullable<LegislationStep["questions"]>;
  stage: number;
  state: JourneyState;
  patch: Patch;
}) {
  return (
    <div className="law-questions">
      {items.map((question, index) => {
        const id = key(stage, "question", index);
        const selected = state.answers[id];
        return (
          <section key={id}>
            <h3>{question.q}</h3>
            {question.options.map((option, optionIndex) => (
              <button
                type="button"
                className={
                  selected === optionIndex
                    ? selected === question.answer
                      ? "correct"
                      : "wrong"
                    : ""
                }
                key={option}
                onClick={() => patch({ answers: { ...state.answers, [id]: optionIndex } })}
              >
                {String.fromCharCode(65 + optionIndex)}. {option}
              </button>
            ))}
            {selected !== undefined && (
              <p>
                {selected === question.answer ? "Correcto. " : "Todavía no. "}
                {question.feedbacks?.[selected] ??
                  (selected === question.answer ? question.why : (question.wrong ?? question.why))}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Match({
  items,
  stage,
  state,
  patch,
}: {
  items: [string, string][];
  stage: number;
  state: JourneyState;
  patch: Patch;
}) {
  return (
    <div className="law-match">
      {items.map(([left], index) => {
        const id = key(stage, "match", index);
        return (
          <label key={id}>
            <span>{left}</span>
            <select
              value={state.matches[id] ?? ""}
              onChange={(event) =>
                patch({ matches: { ...state.matches, [id]: event.target.value } })
              }
            >
              <option value="">Selecciona…</option>
              {items.map(([, right]) => (
                <option key={right} value={right}>
                  {right}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </div>
  );
}

function Order({
  items,
  stage,
  state,
  patch,
}: {
  items: string[];
  stage: number;
  state: JourneyState;
  patch: Patch;
}) {
  const order = state.orders[String(stage)] ?? items.map((_, index) => index).reverse();
  const move = (position: number, direction: number) => {
    const target = position + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[position], next[target]] = [next[target], next[position]];
    patch({ orders: { ...state.orders, [stage]: next } });
  };
  return (
    <ol className="law-order">
      {order.map((itemIndex, position) => (
        <li key={itemIndex}>
          <span>{items[itemIndex]}</span>
          <button type="button" onClick={() => move(position, -1)}>
            ↑
          </button>
          <button type="button" onClick={() => move(position, 1)}>
            ↓
          </button>
        </li>
      ))}
    </ol>
  );
}

function AnnexCards({
  numbers,
  stage,
  state,
  patch,
}: {
  numbers: number[];
  stage: number;
  state: JourneyState;
  patch: Patch;
}) {
  return (
    <div className="law-grid">
      {numbers.map((number) => {
        const annex = LEGISLATION_ANNEXES[number - 1];
        const id = key(stage, "annex", number);
        const open = state.revealed[id];
        return (
          <button
            type="button"
            className={`law-card ${open ? "open" : ""}`}
            key={number}
            onClick={() => patch({ revealed: { ...state.revealed, [id]: true } })}
          >
            <strong>
              Anexo {annex.n} · {annex.name}
            </strong>
            <span>
              {open
                ? `${annex.theme}. ${annex.about}. ${annex.visual}: ${annex.memory}`
                : "Estudiar tarjeta"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AnnexChallenge({
  level,
  stage,
  state,
  patch,
}: {
  level: number;
  stage: number;
  state: JourneyState;
  patch: Patch;
}) {
  return (
    <div className="law-questions">
      <p>Nivel {level}: relaciona cada escenario con su Anexo.</p>
      {LEGISLATION_ANNEXES.map((annex) => {
        const id = key(stage, "challenge", annex.n);
        const selected = state.answers[id];
        const options = challengeOptions(annex.n);
        return (
          <section key={id}>
            <h3>
              {level === 1
                ? annex.scenario
                : level === 2
                  ? `Anexo ${annex.n} · ${annex.theme}`
                  : `Anexo ${annex.n}`}
            </h3>
            {options.map((option) => (
              <button
                type="button"
                key={option.n}
                className={
                  selected === option.n ? (selected === annex.n ? "correct" : "wrong") : ""
                }
                onClick={() => patch({ answers: { ...state.answers, [id]: option.n } })}
              >
                {option.name}
              </button>
            ))}
            {selected !== undefined && (
              <p>
                {selected === annex.n
                  ? "Correcto."
                  : `Revisa: el Anexo ${annex.n} es ${annex.name}.`}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

const styles = `
.law-shell{display:grid;grid-template-columns:minmax(230px,280px) 1fr;min-height:680px;border:1px solid var(--border);border-radius:24px;overflow:hidden;background:var(--card);box-shadow:0 20px 50px rgba(15,23,42,.08)}
.law-nav{padding:24px;background:#132846;color:#fff}.law-nav>p{color:#f9a8d4;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.law-nav h2{font-size:23px;margin:8px 0}.law-nav small{color:#cbd5e1}.law-nav nav{display:grid;gap:8px;margin:24px 0}.law-nav nav button{display:flex;gap:10px;align-items:center;border:0;border-radius:12px;padding:10px;text-align:left;background:transparent;color:#dbeafe}.law-nav nav button[aria-current=step]{background:#fff;color:#132846}.law-nav nav button:disabled{opacity:.38}.law-nav nav span{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#ffffff20}.law-meter{height:7px;border-radius:9px;background:#ffffff24;overflow:hidden;margin:12px 0}.law-meter i{display:block;height:100%;background:linear-gradient(90deg,#fb7185,#f9a8d4)}
.law-main{min-width:0;display:flex;flex-direction:column}.law-main>header,.law-main>footer{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:18px 24px;border-bottom:1px solid var(--border)}.law-main>header div{display:grid}.law-main>header span{font-size:13px;color:var(--muted-foreground)}.law-main>header .law-mission{display:flex;align-items:center;gap:8px}.law-main>main{padding:clamp(22px,4vw,46px);max-width:980px;width:100%;margin:auto;flex:1}.law-kicker{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#db2777;font-weight:800}.law-main h2{font-size:clamp(30px,5vw,52px);line-height:1.04;margin:12px 0 18px}.law-body{font-size:17px;line-height:1.75;color:var(--muted-foreground);white-space:pre-line}.law-body table{width:100%;border-collapse:collapse;margin:18px 0}.law-body th,.law-body td{padding:10px;border:1px solid var(--border);text-align:left;vertical-align:top}.law-body .concepts{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:18px 0}.law-body .concepts article{padding:16px;border:1px solid var(--border);border-radius:14px}.law-figure{margin:24px 0}.law-figure img{display:block;max-width:100%;height:auto;margin:auto;border:1px solid var(--border);border-radius:14px}.law-figure figcaption{margin-top:8px;font-size:12px;color:var(--muted-foreground);text-align:center}.law-guide,.law-memory{padding:18px;border-radius:16px;background:#fff1f7;border:1px solid #fbcfe8;margin:22px 0}.law-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:24px 0}.law-card{min-height:130px;padding:20px;border:1px solid var(--border);border-radius:18px;background:var(--background);display:grid;gap:10px;text-align:left}.law-card.open{border-color:#f472b6;background:#fff7fb}.law-card span{color:var(--muted-foreground);line-height:1.55;white-space:pre-line}.law-questions{display:grid;gap:18px;margin:24px 0}.law-questions section{padding:20px;border:1px solid var(--border);border-radius:18px}.law-questions h3{margin:0 0 14px}.law-questions button{display:block;width:100%;margin:8px 0;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--background);text-align:left}.law-questions button.correct{border-color:#22c55e;background:#f0fdf4}.law-questions button.wrong{border-color:#f43f5e;background:#fff1f2}.law-match{display:grid;gap:12px;margin:24px 0}.law-match label{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:center}.law-match select{padding:11px;border:1px solid var(--border);border-radius:10px;background:var(--background)}.law-order{display:grid;gap:8px;padding:0;list-style:none}.law-order li{display:flex;gap:8px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:12px}.law-order li span{flex:1}.law-order button{padding:6px 10px}.law-refs{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}.law-refs strong{width:100%}.law-refs span{font-size:12px;padding:6px 9px;border-radius:20px;background:var(--muted)}
.law-main>footer{border-top:1px solid var(--border);border-bottom:0;flex-wrap:wrap}.law-coach{display:flex;gap:12px;align-items:center;max-width:520px}.law-actions{display:flex;gap:8px;flex-wrap:wrap}.law-actions button{padding:10px 15px;border-radius:12px;border:1px solid var(--border);background:var(--background)}.law-actions .primary{background:#db2777;color:#fff;border-color:#db2777}.law-actions button:disabled{opacity:.4}
@media(max-width:800px){.law-shell{grid-template-columns:1fr}.law-nav{padding:18px}.law-nav nav{grid-template-columns:repeat(2,minmax(0,1fr));max-height:230px;overflow:auto}.law-main>header{position:sticky;top:0;background:var(--card);z-index:2}.law-match label{grid-template-columns:1fr}.law-main>footer{align-items:flex-start}}
`;
