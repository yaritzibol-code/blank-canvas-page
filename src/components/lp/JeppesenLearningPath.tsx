import { useEffect, useMemo, useState } from "react";
import { LearningPathYarisAvatar } from "./LearningPathCharacters";
import type {
  JeppesenFigure,
  JeppesenLearningPathDocument,
  JeppesenSection,
} from "@/lib/lp/jeppesen-types";
import { getLpJourney, resetLpJourney, saveLpJourney } from "@/lib/store/lp-journey";
import { useLearningPathStageView } from "@/components/lp/LearningPathExperience";

interface JeppesenJourneyState {
  stage: number;
  maxStage: number;
  complete: boolean;
  answers: Record<string, number>;
  matches: Record<string, Record<string, string>>;
  orders: Record<string, number[]>;
  checks: boolean[];
}

const freshState = (checkCount: number): JeppesenJourneyState => ({
  stage: 0,
  maxStage: 0,
  complete: false,
  answers: {},
  matches: {},
  orders: {},
  checks: Array.from({ length: checkCount }, () => false),
});

function defaultOrder(section: JeppesenSection) {
  return section.options.map((_, index) => index).reverse();
}

function sectionComplete(section: JeppesenSection, index: number, state: JeppesenJourneyState) {
  const key = String(index);
  if (section.kind === "choice") return state.answers[key] === section.answer;
  if (section.kind === "match") {
    const selected = state.matches[key] ?? {};
    return section.options.every((pair, pairIndex) => selected[String(pairIndex)] === pair[1]);
  }
  const order = state.orders[key] ?? defaultOrder(section);
  return order.every((value, orderIndex) => value === orderIndex);
}

export function JeppesenLearningPath({
  document,
  userId,
  lpId,
  completed,
  onComplete,
}: {
  document: JeppesenLearningPathDocument;
  userId: string;
  lpId: string;
  completed: boolean;
  onComplete: () => void;
}) {
  const totalStages = document.sections.length + 2;
  const [state, setState] = useState<JeppesenJourneyState>(() =>
    freshState(document.checks.length),
  );
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [zoom, setZoom] = useState<JeppesenFigure | null>(null);
  const sectionIndex = state.stage - 1;
  const section = document.sections[sectionIndex];
  const isIntro = state.stage === 0;
  const isFinish = state.stage === totalStages - 1;
  const ready = isIntro
    ? true
    : isFinish
      ? state.checks.every(Boolean)
      : sectionComplete(section, sectionIndex, state);

  useEffect(() => {
    if (hydrated) return;
    const saved = getLpJourney<JeppesenJourneyState>(userId, lpId);
    if (saved && saved.stage < totalStages && saved.maxStage < totalStages) {
      setState({ ...freshState(document.checks.length), ...saved });
    } else if (completed) {
      setState({
        ...freshState(document.checks.length),
        maxStage: totalStages - 1,
        complete: true,
      });
    }
    setHydrated(true);
  }, [completed, document.checks.length, hydrated, lpId, totalStages, userId]);

  useEffect(() => {
    if (hydrated) saveLpJourney(userId, lpId, state);
  }, [hydrated, lpId, state, userId]);

  const percent = state.complete
    ? 100
    : Math.round((state.maxStage / Math.max(1, totalStages - 1)) * 100);
  const figure = useMemo(
    () => document.figures.find((item) => item.number === section?.figure),
    [document.figures, section?.figure],
  );

  const patch = (next: Partial<JeppesenJourneyState>) =>
    setState((current) => ({ ...current, ...next }));

  const advance = () => {
    if (!ready || state.complete) return;
    if (isFinish) {
      patch({ complete: true, maxStage: totalStages - 1 });
      onComplete();
      return;
    }
    const next = Math.min(state.stage + 1, totalStages - 1);
    patch({ stage: next, maxStage: Math.max(state.maxStage, next) });
  };

  const goTo = (index: number) => {
    if (index < 0 || index > state.maxStage || index >= totalStages) return;
    patch({ stage: index });
    setMenuOpen(false);
  };

  const reset = () => {
    if (!window.confirm("¿Reiniciar este recorrido? Se borrará solamente su avance interno."))
      return;
    resetLpJourney(userId, lpId);
    setState(freshState(document.checks.length));
  };

  const stageTitle = isIntro ? "Briefing" : isFinish ? "Cierre del recorrido" : section.title;

  useLearningPathStageView({
    labels: ["Briefing", ...document.sections.map((item) => item.title), "Cierre"],
    current: state.stage, highest: state.maxStage,
    done: Array.from({ length: totalStages }, (_, index) => index < state.maxStage || state.complete),
    percent, onNavigate: goTo, onReset: reset,
  });

  return (
    <section className={`jp-shell ${menuOpen ? "is-menu-open" : ""}`}>
      <style>{styles}</style>
      <button
        type="button"
        className="jp-mobile-menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? "Cerrar plan" : "Abrir plan"}
      </button>

      <aside className="jp-sidebar" aria-label="Etapas del Learning Path">
        <div className="jp-plan">
          <span>Jeppesen · Bloque {document.block}</span>
          <h2>{document.title}</h2>
          <p>{document.minutes} min · recorrido guiado</p>
        </div>
        <nav className="jp-stages">
          {["Briefing", ...document.sections.map((item) => item.title), "Cierre"].map(
            (title, index) => {
              const locked = index > state.maxStage;
              const done = index < state.maxStage || state.complete;
              return (
                <button
                  type="button"
                  key={`${index}-${title}`}
                  disabled={locked}
                  className={done ? "is-done" : ""}
                  aria-current={index === state.stage ? "step" : undefined}
                  onClick={() => goTo(index)}
                >
                  <span>{done ? "✓" : String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{title}</strong>
                    <small>
                      {locked ? "Bloqueada" : index === state.stage ? "En ruta" : "Repasar"}
                    </small>
                  </span>
                </button>
              );
            },
          )}
        </nav>
        <div className="jp-altitude">
          <img src="/lp/visual/pathy.png" alt="" />
          <div>
            <small>Progreso interno</small>
            <strong>{percent}%</strong>
            <span>
              {state.maxStage + 1} de {totalStages} etapas abiertas
            </span>
          </div>
        </div>
        <button type="button" className="jp-reset" onClick={reset}>
          ↻ Empezar de nuevo
        </button>
      </aside>

      <div className="jp-workspace">
        <header className="jp-topbar">
          <button
            type="button"
            className="jp-menu-icon"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Abrir plan del recorrido"
          >
            ☰
          </button>
          <div>
            <span>
              Etapa {state.stage + 1} / {totalStages}
            </span>
            <strong>{stageTitle}</strong>
          </div>
          <div className="jp-progress-area">
            <span>{ready ? "Etapa lista" : "Misión en curso"}</span>
            <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${percent}%` }} />
            </div>
            <b>{percent}%</b>
          </div>
        </header>

        <main className="jp-content">
          {isIntro && <Intro document={document} />}
          {!isIntro && !isFinish && (
            <SectionStage
              section={section}
              sectionIndex={sectionIndex}
              state={state}
              patch={patch}
              figure={figure}
              onZoom={setZoom}
            />
          )}
          {isFinish && (
            <Finish
              checks={document.checks}
              selected={state.checks}
              complete={state.complete}
              onChange={(index) => {
                const checks = [...state.checks];
                checks[index] = !checks[index];
                patch({ checks });
              }}
            />
          )}
        </main>

        <footer className="jp-footer">
          <div className="jp-yaris-line">
            <LearningPathYarisAvatar size={44} ring />
            <p>
              {state.complete
                ? "Ruta completada. Todas las etapas siguen disponibles para repaso."
                : ready
                  ? "Comprobación correcta. Puedes continuar cuando estés listo."
                  : "Resuelve correctamente la actividad para abrir la siguiente etapa."}
            </p>
          </div>
          <div className="jp-actions">
            <button
              type="button"
              disabled={state.stage === 0}
              onClick={() => goTo(state.stage - 1)}
            >
              Anterior
            </button>
            {!state.complete && (
              <button type="button" className="is-primary" disabled={!ready} onClick={advance}>
                {isFinish ? "Completar Learning Path" : "Continuar"}
              </button>
            )}
          </div>
        </footer>
      </div>

      {zoom && (
        <div className="jp-modal" role="dialog" aria-modal="true" aria-label={zoom.alt}>
          <button type="button" onClick={() => setZoom(null)} aria-label="Cerrar figura">
            ×
          </button>
          <img src={zoom.file} alt={zoom.alt} />
        </div>
      )}
    </section>
  );
}

function Intro({ document }: { document: JeppesenLearningPathDocument }) {
  return (
    <article className="jp-intro">
      <div className="jp-eyebrow">Learning Path · Tema {document.topic}</div>
      <h2>{document.title}</h2>
      <p className="jp-lead">{document.subtitle}</p>
      <div className="jp-objective">
        <LearningPathYarisAvatar size={52} ring />
        <div>
          <span>Objetivo de misión</span>
          <p>{document.objective}</p>
        </div>
      </div>
      <div className="jp-meta-grid">
        <div>
          <small>Bloque</small>
          <strong>{document.block}</strong>
        </div>
        <div>
          <small>Etapas prácticas</small>
          <strong>{document.sections.length}</strong>
        </div>
        <div>
          <small>Duración estimada</small>
          <strong>{document.minutes} min</strong>
        </div>
      </div>
    </article>
  );
}

function SectionStage({
  section,
  sectionIndex,
  state,
  patch,
  figure,
  onZoom,
}: {
  section: JeppesenSection;
  sectionIndex: number;
  state: JeppesenJourneyState;
  patch: (next: Partial<JeppesenJourneyState>) => void;
  figure?: JeppesenFigure;
  onZoom: (figure: JeppesenFigure) => void;
}) {
  const key = String(sectionIndex);
  const done = sectionComplete(section, sectionIndex, state);
  return (
    <article className="jp-stage">
      <div className="jp-eyebrow">Ver · identificar · interpretar · aplicar</div>
      <h2>{section.title}</h2>
      <div className="jp-reading">
        {section.text.split(/\n\s*\n/).map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
      {figure && (
        <>
          <button type="button" className="jp-figure" onClick={() => onZoom(figure)}>
            <img src={figure.file} alt={figure.alt} />
            <span>Ampliar figura {figure.number}</span>
          </button>
          {section.figure_note && <p className="jp-figure-note">{section.figure_note}</p>}
        </>
      )}
      {section.pages.length > 0 && (
        <p className="jp-pages">
          Referencia del material fuente: páginas {section.pages.join(", ")}
        </p>
      )}

      <section className="jp-question" aria-label="Comprobación">
        <span>Comprobación de etapa</span>
        <h3>{section.question}</h3>
        {section.kind === "choice" && (
          <div className="jp-options">
            {section.options.map((option, optionIndex) => {
              const selected = state.answers[key] === optionIndex;
              return (
                <button
                  type="button"
                  key={option}
                  className={selected ? (done ? "is-correct" : "is-wrong") : ""}
                  onClick={() => patch({ answers: { ...state.answers, [key]: optionIndex } })}
                >
                  <i>{String.fromCharCode(65 + optionIndex)}</i>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        )}
        {section.kind === "match" && (
          <div className="jp-match">
            {section.options.map(([left], pairIndex) => (
              <label key={left}>
                <span>{left}</span>
                <select
                  value={state.matches[key]?.[String(pairIndex)] ?? ""}
                  onChange={(event) =>
                    patch({
                      matches: {
                        ...state.matches,
                        [key]: {
                          ...(state.matches[key] ?? {}),
                          [String(pairIndex)]: event.target.value,
                        },
                      },
                    })
                  }
                >
                  <option value="">Selecciona…</option>
                  {section.options.map(([, right], rightIndex) => (
                    <option key={`${right}-${rightIndex}`} value={right}>
                      {right}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        {section.kind === "order" && (
          <OrderExercise
            options={section.options}
            order={state.orders[key] ?? defaultOrder(section)}
            onChange={(order) => patch({ orders: { ...state.orders, [key]: order } })}
          />
        )}
        {(done || (section.kind === "choice" && state.answers[key] !== undefined)) && (
          <p className={`jp-feedback ${done ? "is-correct" : "is-wrong"}`}>
            <strong>{done ? "Correcto." : "Todavía no."}</strong> {section.feedback}
          </p>
        )}
      </section>
    </article>
  );
}

function OrderExercise({
  options,
  order,
  onChange,
}: {
  options: string[];
  order: number[];
  onChange: (order: number[]) => void;
}) {
  const move = (position: number, delta: number) => {
    const target = position + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[position], next[target]] = [next[target], next[position]];
    onChange(next);
  };
  return (
    <ol className="jp-order">
      {order.map((optionIndex, position) => (
        <li key={optionIndex}>
          <span>{options[optionIndex]}</span>
          <div>
            <button type="button" disabled={position === 0} onClick={() => move(position, -1)}>
              ↑
            </button>
            <button
              type="button"
              disabled={position === order.length - 1}
              onClick={() => move(position, 1)}
            >
              ↓
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Finish({
  checks,
  selected,
  complete,
  onChange,
}: {
  checks: string[];
  selected: boolean[];
  complete: boolean;
  onChange: (index: number) => void;
}) {
  return (
    <article className="jp-finish">
      <img src="/lp/visual/pathy.png" alt="Pathy" />
      <div className="jp-eyebrow">Chequeo final</div>
      <h2>{complete ? "Learning Path completado" : "Confirma tu briefing"}</h2>
      <p>Marca cada capacidad cuando puedas explicarla sin mirar la respuesta.</p>
      <div className="jp-checks">
        {checks.map((check, index) => (
          <label key={check}>
            <input
              type="checkbox"
              checked={selected[index] ?? false}
              disabled={complete}
              onChange={() => onChange(index)}
            />
            <span>{check}</span>
          </label>
        ))}
      </div>
    </article>
  );
}

const styles = `
.jp-shell{--jp-navy:#12233f;--jp-blue:#2362d7;--jp-sky:#eaf2ff;--jp-green:#16845b;display:grid;grid-template-columns:300px minmax(0,1fr);min-height:720px;border:1px solid var(--border);border-radius:24px;overflow:hidden;background:#f5f7fb;color:#18243a;box-shadow:0 20px 55px rgba(18,35,63,.09)}
.jp-sidebar{background:var(--jp-navy);color:white;padding:25px 18px;display:flex;flex-direction:column;gap:18px}.jp-plan span,.jp-eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:11px;font-weight:800;color:#6992e6}.jp-plan h2{font-size:21px;line-height:1.16;margin:9px 0}.jp-plan p{margin:0;color:#a9b9d4;font-size:13px}.jp-stages{display:flex;flex-direction:column;gap:7px;max-height:430px;overflow:auto;padding-right:4px}.jp-stages button{appearance:none;border:0;background:transparent;color:#b9c7dc;display:grid;grid-template-columns:32px 1fr;gap:10px;text-align:left;padding:8px;border-radius:12px;cursor:pointer}.jp-stages button>span:first-child{width:30px;height:30px;border:1px solid #52627b;border-radius:50%;display:grid;place-items:center;font-size:11px}.jp-stages strong,.jp-stages small{display:block}.jp-stages strong{font-size:12px;line-height:1.25}.jp-stages small{font-size:10px;margin-top:3px;color:#7f91ac}.jp-stages button[aria-current=step]{background:#203657;color:#fff}.jp-stages button.is-done>span:first-child{background:#1e9b6c;border-color:#1e9b6c;color:#fff}.jp-stages button:disabled{opacity:.45;cursor:not-allowed}.jp-altitude{margin-top:auto;display:flex;gap:12px;align-items:center;border-top:1px solid #31445f;padding-top:18px}.jp-altitude img{width:55px;height:55px;object-fit:contain}.jp-altitude small,.jp-altitude span,.jp-altitude strong{display:block}.jp-altitude small,.jp-altitude span{font-size:10px;color:#9cacc4}.jp-altitude strong{font-size:21px}.jp-reset{border:0;background:transparent;color:#9cacc4;text-align:left;cursor:pointer}.jp-workspace{min-width:0;display:flex;flex-direction:column}.jp-topbar{display:flex;gap:18px;align-items:center;padding:18px 25px;background:white;border-bottom:1px solid #e2e7ef}.jp-topbar>div:first-of-type{min-width:0}.jp-topbar span,.jp-topbar strong{display:block}.jp-topbar span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#66758b}.jp-topbar strong{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.jp-progress-area{margin-left:auto;display:grid;grid-template-columns:auto 150px auto;align-items:center;gap:9px}.jp-progress-area>div{height:7px;border-radius:20px;background:#e7ebf1;overflow:hidden}.jp-progress-area i{height:100%;display:block;background:var(--jp-blue);border-radius:20px}.jp-progress-area b{font-size:12px}.jp-menu-icon,.jp-mobile-menu{display:none}.jp-content{width:min(850px,calc(100% - 44px));margin:0 auto;padding:45px 0;flex:1}.jp-intro h2,.jp-stage h2,.jp-finish h2{font-size:clamp(28px,4vw,44px);line-height:1.04;margin:12px 0 15px;color:var(--jp-navy)}.jp-lead{font-size:19px;line-height:1.6;color:#4a5870;max-width:720px}.jp-objective{display:flex;gap:15px;align-items:center;margin-top:28px;padding:18px;border-radius:18px;background:var(--jp-sky);border:1px solid #cadcff}.jp-objective span{font-size:11px;font-weight:800;text-transform:uppercase;color:var(--jp-blue)}.jp-objective p{margin:4px 0 0;line-height:1.5}.jp-meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}.jp-meta-grid div{padding:18px;border-radius:16px;background:white;border:1px solid #e0e5ed}.jp-meta-grid small,.jp-meta-grid strong{display:block}.jp-meta-grid small{color:#6b788c}.jp-meta-grid strong{font-size:22px;margin-top:4px;color:var(--jp-navy)}.jp-reading{font-size:16px;line-height:1.72;color:#354158}.jp-reading p{margin:0 0 15px}.jp-figure{display:block;width:100%;border:1px solid #dce2eb;background:white;border-radius:18px;overflow:hidden;padding:0;cursor:zoom-in;margin:26px 0 10px}.jp-figure img{display:block;width:100%;max-height:520px;object-fit:contain;background:#eef1f5}.jp-figure span{display:block;padding:10px 14px;font-size:12px;color:#526176;text-align:left}.jp-figure-note{margin:4px 0 12px;color:#526176;font-size:13px}.jp-pages{font-size:12px;color:#7a8799}.jp-question{margin-top:30px;padding:24px;border-radius:20px;background:white;border:1px solid #dce2eb}.jp-question>span{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--jp-blue);font-weight:800}.jp-question h3{font-size:20px;margin:8px 0 18px}.jp-options{display:grid;gap:9px}.jp-options button{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid #d8dee8;background:#fafbfd;border-radius:13px;padding:12px;cursor:pointer}.jp-options i{font-style:normal;width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:#e8edf5;font-weight:800}.jp-options button.is-correct{border-color:#44a982;background:#eaf8f2}.jp-options button.is-wrong{border-color:#d66a6a;background:#fff1f1}.jp-match{display:grid;gap:10px}.jp-match label{display:grid;grid-template-columns:minmax(160px,1fr) minmax(180px,1fr);align-items:center;gap:12px}.jp-match label>span{font-weight:700}.jp-match select{width:100%;border:1px solid #ccd4df;border-radius:10px;background:white;padding:10px}.jp-order{display:grid;gap:8px;padding:0;counter-reset:item}.jp-order li{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #dce2eb;background:#fafbfd;border-radius:12px;padding:10px 12px}.jp-order li span:before{counter-increment:item;content:counter(item) '. ';font-weight:800;color:var(--jp-blue)}.jp-order button{width:32px;height:32px;border:1px solid #ced6e1;background:white;border-radius:8px;cursor:pointer}.jp-feedback{padding:12px 14px;border-radius:12px;margin:15px 0 0}.jp-feedback.is-correct{background:#eaf8f2;color:#116744}.jp-feedback.is-wrong{background:#fff1f1;color:#9b3535}.jp-finish{text-align:center;max-width:680px;margin:auto}.jp-finish>img{width:110px;height:110px;object-fit:contain}.jp-checks{display:grid;gap:10px;text-align:left;margin-top:24px}.jp-checks label{display:flex;gap:11px;align-items:flex-start;padding:14px;border:1px solid #dce2eb;background:white;border-radius:13px}.jp-checks input{width:20px;height:20px;accent-color:var(--jp-green)}.jp-footer{background:white;border-top:1px solid #e2e7ef;padding:16px 25px;display:flex;align-items:center;gap:18px}.jp-yaris-line{display:flex;align-items:center;gap:11px;min-width:0}.jp-yaris-line p{font-size:12px;color:#58667a;margin:0}.jp-actions{margin-left:auto;display:flex;gap:9px}.jp-actions button{border:1px solid #ccd5e1;background:white;border-radius:11px;padding:10px 15px;font-weight:750;cursor:pointer}.jp-actions button.is-primary{background:var(--jp-blue);border-color:var(--jp-blue);color:white}.jp-actions button:disabled{opacity:.42;cursor:not-allowed}.jp-modal{position:fixed;inset:0;z-index:1200;background:rgba(7,14,27,.91);display:grid;place-items:center;padding:40px}.jp-modal img{max-width:95vw;max-height:90vh;object-fit:contain;background:white}.jp-modal>button{position:absolute;right:22px;top:15px;color:white;background:transparent;border:0;font-size:40px;cursor:pointer}
@media(max-width:900px){.jp-shell{grid-template-columns:1fr}.jp-sidebar{position:fixed;z-index:1100;inset:0 auto 0 0;width:min(320px,90vw);transform:translateX(-105%);transition:transform .2s}.jp-shell.is-menu-open .jp-sidebar{transform:translateX(0)}.jp-menu-icon{display:block;border:0;background:transparent;font-size:22px}.jp-progress-area{grid-template-columns:100px auto}.jp-progress-area>span{display:none}.jp-content{padding:30px 0}.jp-mobile-menu{display:none}}
@media(max-width:600px){.jp-shell{border-radius:16px}.jp-topbar{padding:14px}.jp-topbar>div:first-of-type{max-width:150px}.jp-progress-area{grid-template-columns:65px auto}.jp-content{width:calc(100% - 28px)}.jp-meta-grid{grid-template-columns:1fr}.jp-question{padding:17px}.jp-match label{grid-template-columns:1fr}.jp-footer{align-items:flex-end;padding:13px}.jp-yaris-line p{display:none}.jp-actions button{padding:9px 11px}.jp-intro h2,.jp-stage h2,.jp-finish h2{font-size:28px}}
`;
