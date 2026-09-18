import { useEffect, useMemo, useState } from "react";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { getLpJourney, resetLpJourney, saveLpJourney } from "@/lib/store/lp-journey";

export const APPLICABLE_REGULATIONS_LP_ID =
  "linea-aerea/atp/chapter-1-regulations/applicable-regulations-1";

const STEPS = [
  "Despegue",
  "La dirección de una regla",
  "Part 91 · La base",
  "Part 121 · Aerolíneas",
  "Part 135 · Taxis aéreos",
  "Otras reglas clave",
  "Ponlo a prueba",
  "Aterrizaje",
] as const;

type StringAnswers = Record<string, string>;
type QuizAnswers = Record<string, number>;

interface RegulationsJourney {
  step: number;
  done: boolean[];
  mapSeen: Record<string, boolean>;
  addr: number;
  addrWrong: boolean;
  layer: "private" | "121" | "135";
  layersTried: Record<string, boolean>;
  a121: StringAnswers;
  a135: StringAnswers;
  aTabs: StringAnswers;
  quiz: QuizAnswers;
  checks: Record<string, boolean>;
  finished: boolean;
}

const freshJourney = (): RegulationsJourney => ({
  step: 0,
  done: [false, false, false, false, false, false, false, false],
  mapSeen: {},
  addr: 0,
  addrWrong: false,
  layer: "private",
  layersTried: { private: true },
  a121: {},
  a135: {},
  aTabs: {},
  quiz: {},
  checks: {},
  finished: false,
});

const ANSWERS_121 = { a: "domestic", b: "flag", c: "supplemental" } as const;
const ANSWERS_135 = { a: "commuter", b: "ondemand" } as const;
const ANSWERS_TABS = { a: "61", b: "67", c: "1" } as const;

function missionDone(step: number, state: RegulationsJourney): boolean {
  switch (step) {
    case 0:
      return Object.keys(state.mapSeen).length >= 3;
    case 1:
      return state.addr >= 3;
    case 2:
      return Object.keys(state.layersTried).length >= 3;
    case 3:
      return Object.entries(ANSWERS_121).every(([key, answer]) => state.a121[key] === answer);
    case 4:
      return Object.entries(ANSWERS_135).every(([key, answer]) => state.a135[key] === answer);
    case 5:
      return Object.entries(ANSWERS_TABS).every(([key, answer]) => state.aTabs[key] === answer);
    case 6:
      return state.quiz.a != null && state.quiz.b != null;
    case 7:
      return Object.values(state.checks).filter(Boolean).length >= 3;
    default:
      return false;
  }
}

function frontier(state: RegulationsJourney): number {
  let index = 0;
  while (index < 7 && state.done[index]) index += 1;
  return index;
}

interface CaseDefinition {
  id: string;
  text: string;
  options: Array<{ key: string; label: string }>;
  answer: string;
  ok: string;
  no: Record<string, string>;
}

function CaseCard({
  item,
  value,
  onChoose,
  dark = true,
}: {
  item: CaseDefinition;
  value?: string;
  onChoose: (answer: string) => void;
  dark?: boolean;
}) {
  const correct = value === item.answer;
  return (
    <article className={`ar-case ${dark ? "ar-case--dark" : ""}`}>
      <p>{item.text}</p>
      <div className="ar-options">
        {item.options.map((option) => {
          const selected = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              className={`ar-choice ${selected ? (option.key === item.answer ? "is-correct" : "is-wrong") : ""}`}
              onClick={() => onChoose(option.key)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {value && (
        <div className={`ar-feedback ${correct ? "is-correct" : "is-wrong"}`} role="status">
          <strong>{correct ? "Correcto." : "Revisa la pista."}</strong>{" "}
          {correct ? item.ok.replace(/^Correcto\.\s*/i, "") : item.no[value]}
        </div>
      )}
    </article>
  );
}

function SectionHeading({
  number,
  label,
  children,
  intro,
}: {
  number: string;
  label: string;
  children: React.ReactNode;
  intro: React.ReactNode;
}) {
  return (
    <header className="ar-section-heading">
      <span className="ar-pill">
        {number} · {label}
      </span>
      <h2>{children}</h2>
      <p>{intro}</p>
    </header>
  );
}

export function ApplicableRegulationsPath({
  userId,
  lpId,
  completed,
  onComplete,
}: {
  userId: string;
  lpId: string;
  completed: boolean;
  onComplete: () => void;
}) {
  const [state, setState] = useState<RegulationsJourney>(freshJourney);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    const saved = getLpJourney<RegulationsJourney>(userId, lpId);
    if (saved) {
      setState({
        ...freshJourney(),
        ...saved,
        done: Array.from({ length: 8 }, (_, index) => Boolean(saved.done?.[index])),
      });
    } else if (completed) {
      setState((current) => ({ ...current, done: current.done.map(() => true), finished: true }));
    }
    setHydrated(true);
  }, [completed, hydrated, lpId, userId]);

  useEffect(() => {
    if (hydrated) saveLpJourney(userId, lpId, state);
  }, [hydrated, lpId, state, userId]);

  const currentMissionDone = missionDone(state.step, state);
  const openThrough = frontier(state);
  const doneCount = state.done.filter(Boolean).length;
  const percent = Math.round((doneCount / STEPS.length) * 100);

  const update = (patch: Partial<RegulationsJourney>) =>
    setState((current) => ({ ...current, ...patch }));

  const goTo = (step: number) => {
    if (step < 0 || step >= STEPS.length || step > openThrough) return;
    update({ step });
  };

  const advance = () => {
    if (!currentMissionDone || (state.step === 7 && state.finished)) return;
    const done = [...state.done];
    done[state.step] = true;
    if (state.step < 7) {
      update({ done, step: state.step + 1 });
      return;
    }
    update({ done, finished: true });
    onComplete();
  };

  const reset = () => {
    if (!window.confirm("¿Empezar de nuevo? Se borrará el avance interno de este recorrido."))
      return;
    resetLpJourney(userId, lpId);
    setState(freshJourney());
  };

  const correct121 = Object.entries(ANSWERS_121).filter(
    ([key, value]) => state.a121[key] === value,
  ).length;
  const correct135 = Object.entries(ANSWERS_135).filter(
    ([key, value]) => state.a135[key] === value,
  ).length;
  const correctTabs = Object.entries(ANSWERS_TABS).filter(
    ([key, value]) => state.aTabs[key] === value,
  ).length;

  const guide = [
    currentMissionDone
      ? "Ya tienes el mapa en la cabeza. Vamos a ponerle nombre a las reglas."
      : "Toca las tres cajas del mapa para descubrir cómo se ordenan las reglas.",
    currentMissionDone
      ? "Perfecto. Ahora veamos qué hay dentro de Part 91."
      : "Arma la dirección: primero el libro, luego el capítulo y al final la regla.",
    currentMissionDone
      ? "Ya entiendes el piso de abajo. Subamos al mundo de las aerolíneas."
      : "Prueba los tres tipos de vuelo y mira qué pisos se agregan encima de Part 91.",
    currentMissionDone
      ? "Tres de tres. Ahora los taxis aéreos."
      : `Lee cada caso y elige el tipo. Llevas ${correct121} de 3.`,
    currentMissionDone
      ? "Autobús o taxi: ya lo distingues. Falta la carpeta del piloto."
      : `¿Horario fijo o cuando el cliente quiera? Llevas ${correct135} de 2.`,
    currentMissionDone
      ? "Ya sabes qué pestaña abrir. Hora de ponerlo a prueba."
      : `Cada pregunta abre una pestaña distinta. Llevas ${correctTabs} de 3.`,
    currentMissionDone
      ? "Respondiste los dos escenarios. Vamos a aterrizar."
      : "Responde los dos escenarios. Si te equivocas, lee la explicación y sigue.",
    state.finished
      ? "Recorrido completo. Puedes volver a cualquier etapa para repasar."
      : currentMissionDone
        ? "Todo marcado. Toca Terminar para aterrizar."
        : "Marca solo lo que puedes explicar con tus palabras.",
  ][state.step];

  return (
    <section className="ar-shell" aria-label="Learning Path Applicable Regulations">
      <style>{styles}</style>
      <aside className="ar-sidebar" aria-label="Etapas del recorrido">
        <div className="ar-route-title">
          <span>ATP · Chapter 1</span>
          <strong>Applicable Regulations</strong>
        </div>
        <nav className="ar-waypoints">
          {STEPS.map((label, index) => {
            const locked = index > openThrough;
            const active = index === state.step;
            const done = state.done[index];
            return (
              <button
                key={label}
                type="button"
                disabled={locked}
                aria-current={active ? "step" : undefined}
                className={`ar-waypoint ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}
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
        <button type="button" className="ar-reset" onClick={reset}>
          ↻ Empezar de nuevo
        </button>
      </aside>

      <div className="ar-main">
        <header className="ar-topbar">
          <div>
            <span>ETAPA {String(state.step + 1).padStart(2, "0")}</span>
            <strong>{STEPS[state.step]}</strong>
          </div>
          <div className="ar-progress">
            <span>
              {doneCount} de 8 · {percent}%
            </span>
            <div aria-label={`${percent}% completado`}>
              <i style={{ width: `${percent}%` }} />
            </div>
          </div>
        </header>

        <main className="ar-content">
          {state.step === 0 && (
            <StepTakeoff
              seen={state.mapSeen}
              onSee={(key) => update({ mapSeen: { ...state.mapSeen, [key]: true } })}
            />
          )}
          {state.step === 1 && (
            <StepAddress
              count={state.addr}
              wrong={state.addrWrong}
              onPick={(index) => {
                if (index === state.addr) update({ addr: state.addr + 1, addrWrong: false });
                else if (index > state.addr) update({ addrWrong: true });
              }}
            />
          )}
          {state.step === 2 && (
            <StepPart91
              layer={state.layer}
              onLayer={(layer) =>
                update({ layer, layersTried: { ...state.layersTried, [layer]: true } })
              }
            />
          )}
          {state.step === 3 && (
            <StepPart121
              answers={state.a121}
              onAnswer={(key, value) => update({ a121: { ...state.a121, [key]: value } })}
            />
          )}
          {state.step === 4 && (
            <StepPart135
              answers={state.a135}
              onAnswer={(key, value) => update({ a135: { ...state.a135, [key]: value } })}
            />
          )}
          {state.step === 5 && (
            <StepOtherRules
              answers={state.aTabs}
              onAnswer={(key, value) => update({ aTabs: { ...state.aTabs, [key]: value } })}
            />
          )}
          {state.step === 6 && (
            <StepQuiz
              answers={state.quiz}
              onAnswer={(key, value) => update({ quiz: { ...state.quiz, [key]: value } })}
            />
          )}
          {state.step === 7 && (
            <StepLanding
              checks={state.checks}
              finished={state.finished}
              onCheck={(key) => update({ checks: { ...state.checks, [key]: !state.checks[key] } })}
            />
          )}
        </main>

        <div className="ar-guide">
          <YarisAvatar size={42} ring />
          <div>
            <strong>Mini Yaris</strong>
            <p>{guide}</p>
          </div>
          <span className={currentMissionDone ? "is-done" : ""}>
            {currentMissionDone ? "✓ Misión cumplida" : "Misión en curso"}
          </span>
        </div>

        <footer className="ar-footer">
          <button
            type="button"
            className="ar-button ar-button--ghost"
            disabled={state.step === 0}
            onClick={() => goTo(state.step - 1)}
          >
            ← Anterior
          </button>
          <button
            type="button"
            className="ar-button ar-button--primary"
            disabled={!currentMissionDone || (state.step === 7 && state.finished)}
            onClick={advance}
          >
            {state.step === 0
              ? "Empezar"
              : state.step === 7
                ? state.finished
                  ? "Completado"
                  : "Terminar"
                : "Siguiente"}{" "}
            →
          </button>
        </footer>
      </div>
    </section>
  );
}

function StepTakeoff({
  seen,
  onSee,
}: {
  seen: Record<string, boolean>;
  onSee: (key: string) => void;
}) {
  const nodes = [
    {
      key: "op",
      eyebrow: "Paso 1",
      title: "¿Qué vuelo es?",
      body: "Antes de abrir un reglamento, mira el vuelo: ¿es privado, de aerolínea o de taxi aéreo?",
    },
    {
      key: "base",
      eyebrow: "Paso 2",
      title: "Part 91",
      body: "Las reglas que casi todos siguen. Como las reglas generales de la escuela.",
    },
    {
      key: "extra",
      eyebrow: "Paso 3",
      title: "Part 121 o 135",
      body: "Reglas extra si el vuelo es de aerolínea (121) o de taxi aéreo (135).",
    },
  ];
  return (
    <>
      <div className="ar-hero">
        <div>
          <span className="ar-pill">01 · Despegue</span>
          <h1>
            Las reglas <em>del cielo.</em>
          </h1>
          <p>
            Piensa en la calle: hay reglas para todos los coches, y reglas extra para los camiones y
            los taxis. En el cielo pasa lo mismo.{" "}
            <strong>Primero hay que saber qué tipo de vuelo tienes delante.</strong>
          </p>
          <p>
            El certificado <strong>ATP</strong> es el nivel más alto para un piloto en Estados
            Unidos. Y todo empieza aquí: en saber dónde están las reglas y cuál abrir.
          </p>
          <div className="ar-meta">
            <span>
              <small>Duración</small>10–15 min
            </span>
            <span>
              <small>Recorrido</small>8 etapas
            </span>
            <span>
              <small>Meta</small>Saber dónde buscar
            </span>
          </div>
        </div>
        <img src="/img/pathy-small.png" alt="Pathy con gorra de piloto" />
      </div>
      <div className="ar-dark-panel">
        <span className="ar-overline">Misión 1 · Descubre el mapa</span>
        <h3>Primero identifica el vuelo. Luego abre la regla correcta.</h3>
        <div className="ar-map">
          {nodes.map((node) => (
            <button
              key={node.key}
              type="button"
              className={seen[node.key] ? "is-seen" : ""}
              onClick={() => onSee(node.key)}
            >
              <small>{node.eyebrow}</small>
              <strong>{node.title}</strong>
              <p>{node.body}</p>
              <span>{seen[node.key] ? "✓ Descubierta" : "Tócame para descubrir"}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StepAddress({
  count,
  wrong,
  onPick,
}: {
  count: number;
  wrong: boolean;
  onPick: (index: number) => void;
}) {
  const tokens = [
    {
      small: "El libro",
      big: "14 CFR",
      title: "El libro.",
      body: "Title 14 del Code of Federal Regulations. Ahí están las reglas de aviación y espacio de EE. UU.",
    },
    {
      small: "El capítulo",
      big: "Part 91",
      title: "El capítulo.",
      body: "Una Part agrupa reglas parecidas. Part 91 tiene las reglas generales de vuelo.",
    },
    {
      small: "La regla",
      big: "§ 91.3",
      title: "La regla exacta.",
      body: "El signo § significa “sección”. Se escribe completo: 91.3, nunca solo “§ 3”.",
    },
  ];
  const last = count > 0 ? tokens[count - 1] : null;
  return (
    <>
      <SectionHeading
        number="02"
        label="¿Cómo se llaman las reglas?"
        intro={
          <>
            Igual que tu casa tiene país, calle y número, una regla de aviación tiene libro,
            capítulo y número. La gente le dice <strong>FAR</strong> (el apodo), pero la dirección
            oficial es <strong>14 CFR</strong>.
          </>
        }
      >
        Cada regla tiene <em>su dirección.</em>
      </SectionHeading>
      <div className="ar-two">
        <div className="ar-card">
          <span className="ar-overline ar-burgundy">Misión 2 · Arma la dirección en orden</span>
          <p>
            Toca las piezas de lo más grande a lo más pequeño: primero el libro, luego el capítulo,
            al final la regla.
          </p>
          <div className="ar-token-grid">
            {tokens.map((token, index) => (
              <button
                key={token.big}
                type="button"
                className={index < count ? "is-filled" : ""}
                onClick={() => onPick(index)}
                disabled={index < count}
              >
                <small>{token.small}</small>
                <strong>{token.big}</strong>
              </button>
            ))}
          </div>
          <div
            className={`ar-feedback ${wrong ? "is-wrong" : count >= 3 ? "is-correct" : ""}`}
            role="status"
          >
            <strong>
              {wrong ? "Ese no va todavía." : (last?.title ?? "Empieza por lo más grande.")}
            </strong>{" "}
            {wrong
              ? "Recuerda: primero el libro, luego el capítulo y al final la regla."
              : (last?.body ?? "¿Cuál es el libro completo donde viven todas las reglas?")}
          </div>
        </div>
        <div className="ar-address-board">
          {tokens.map((token, index) => (
            <div key={token.big} className={index < count ? "is-filled" : ""}>
              <small>{token.small}</small>
              <strong>{index < count ? token.big : "· · ·"}</strong>
            </div>
          ))}
          <p>
            {count >= 3
              ? "Listo: 14 CFR § 91.3. Ya sabes leer cualquier dirección de regla."
              : "Cuando termines la dirección podrás encontrar cualquier regla en segundos."}
          </p>
        </div>
      </div>
    </>
  );
}

function StepPart91({
  layer,
  onLayer,
}: {
  layer: "private" | "121" | "135";
  onLayer: (layer: "private" | "121" | "135") => void;
}) {
  const layers = {
    private: {
      label: "Vuelo privado",
      added: "",
      caption:
        "Vuelas tu avioneta con amigos y nadie paga. Aquí Part 91 es tu base. Otras Parts también pueden aplicar, por ejemplo, las del piloto.",
    },
    "121": {
      label: "Vuelo de aerolínea",
      added: "Part 121",
      caption:
        "Es una aerolínea: se agregan reglas extra de Part 121 encima. Algunas cambian las reglas generales, pero el piso de Part 91 sigue ahí.",
    },
    "135": {
      label: "Taxi aéreo",
      added: "Part 135",
      caption:
        "Es un taxi aéreo: se agregan reglas extra de Part 135. Mismo truco: el piso de abajo no desaparece.",
    },
  };
  const current = layers[layer];
  return (
    <>
      <SectionHeading
        number="03"
        label="Part 91 · La base"
        intro={
          <>
            Part 91 es el piso de abajo: las reglas generales de operación y vuelo. Cuando aparece
            una aerolínea o un taxi aéreo, se agrega otro piso, pero{" "}
            <strong>Part 91 no desaparece.</strong>
          </>
        }
      >
        El piso que <em>todos comparten.</em>
      </SectionHeading>
      <div className="ar-layer-tabs">
        {(
          Object.entries(layers) as Array<
            [keyof typeof layers, (typeof layers)[keyof typeof layers]]
          >
        ).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={layer === key ? "is-active" : ""}
            onClick={() => onLayer(key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="ar-two">
        <div className="ar-building">
          {current.added && (
            <div className="ar-added-floor">
              <small>Reglas extra</small>
              <strong>{current.added}</strong>
            </div>
          )}
          <div className="ar-base-floor">
            <small>La base operativa</small>
            <strong>Part 91</strong>
            <span>General Operating and Flight Rules</span>
          </div>
          <div className="ar-ground">14 CFR · El libro completo</div>
        </div>
        <div className="ar-card ar-explain">
          <span className="ar-overline ar-burgundy">Misión 3 · Prueba las tres capas</span>
          <h3>{current.label}</h3>
          <p>{current.caption}</p>
          <div className="ar-note">
            <strong>La idea clave</strong>
            <p>
              Las reglas especiales se suman a la base. Si una regla especial cambia una general,
              sigues la especial para ese caso.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function StepPart121({
  answers,
  onAnswer,
}: {
  answers: StringAnswers;
  onAnswer: (key: string, answer: string) => void;
}) {
  const options = [
    { key: "domestic", label: "Domestic" },
    { key: "flag", label: "Flag" },
    { key: "supplemental", label: "Supplemental" },
  ];
  const cases: CaseDefinition[] = [
    {
      id: "a",
      text: "Una aerolínea vuela todos los días a las 7:00 de Dallas a Chicago, dentro de los 48 estados.",
      options,
      answer: "domestic",
      ok: "Correcto. Horario fijo y dentro del país: Domestic.",
      no: {
        flag: "Flag es cuando el vuelo sale o entra del país. Este se queda dentro.",
        supplemental:
          "Supplemental no tiene horario fijo. Este vuela todos los días a la misma hora.",
      },
    },
    {
      id: "b",
      text: "Una aerolínea vuela con horario de Miami a Madrid.",
      options,
      answer: "flag",
      ok: "Correcto. Horario fijo y cruza la frontera: Flag.",
      no: {
        domestic: "Domestic se queda dentro de EE. UU. Este va a España.",
        supplemental: "Tiene horario publicado, así que no es Supplemental.",
      },
    },
    {
      id: "c",
      text: "Un equipo de fútbol renta un avión grande para un viaje especial, sin horario publicado.",
      options,
      answer: "supplemental",
      ok: "Correcto. Sin horario, negociado con el cliente: Supplemental.",
      no: {
        domestic: "Domestic necesita horario publicado. Aquí no lo hay.",
        flag: "Flag también necesita horario. Este viaje es especial, sin horario.",
      },
    },
  ];
  return (
    <>
      <SectionHeading
        number="04"
        label="Part 121 · Aerolíneas"
        intro={
          <>
            Part 121 contiene las reglas para aerolíneas grandes y operaciones de transporte
            público. Dentro hay tres tipos. La pista principal es{" "}
            <strong>si existe un horario publicado y por dónde vuela.</strong>
          </>
        }
      >
        Tres maneras de operar <em>una aerolínea.</em>
      </SectionHeading>
      <div className="ar-three">
        <article className="ar-mini">
          <small>Tipo 1</small>
          <strong>Domestic</strong>
          <p>Vuelos con horario dentro de EE. UU., por ejemplo entre los 48 estados.</p>
        </article>
        <article className="ar-mini">
          <small>Tipo 2</small>
          <strong>Flag</strong>
          <p>Vuelos con horario que salen o entran del país, o entre dos puntos fuera de EE. UU.</p>
        </article>
        <article className="ar-mini">
          <small>Tipo 3</small>
          <strong>Supplemental</strong>
          <p>Vuelos sin horario fijo: chárters, carga y viajes negociados con el cliente.</p>
        </article>
      </div>
      <div className="ar-case-list">
        {cases.map((item) => (
          <CaseCard
            key={item.id}
            item={item}
            value={answers[item.id]}
            onChoose={(value) => onAnswer(item.id, value)}
          />
        ))}
      </div>
    </>
  );
}

function StepPart135({
  answers,
  onAnswer,
}: {
  answers: StringAnswers;
  onAnswer: (key: string, answer: string) => void;
}) {
  const options = [
    { key: "commuter", label: "Commuter" },
    { key: "ondemand", label: "On-demand" },
  ];
  const cases: CaseDefinition[] = [
    {
      id: "a",
      text: "Una avioneta vuela de una isla a otra todos los días a las 8:00, cinco veces por semana.",
      options,
      answer: "commuter",
      ok: "Correcto. Funciona como autobús: horario fijo y repetido. Commuter.",
      no: { ondemand: "On-demand es cuando el cliente decide cuándo. Aquí hay horario fijo." },
    },
    {
      id: "b",
      text: "Una familia contrata un avión pequeño para ir a la playa el sábado que ellos quieran.",
      options,
      answer: "ondemand",
      ok: "Correcto. Funciona como taxi: lo pides cuando lo necesitas. On-demand.",
      no: { commuter: "Commuter tiene horario publicado. Aquí la familia decide el día." },
    },
  ];
  return (
    <>
      <SectionHeading
        number="05"
        label="Part 135 · Taxis aéreos"
        intro={
          <>
            Part 135 cubre operaciones más pequeñas que cobran por transportar personas o carga.
            Pueden funcionar como <strong>autobús con horario</strong> o como{" "}
            <strong>taxi cuando el cliente llama.</strong>
          </>
        }
      >
        ¿Autobús o <em>taxi aéreo?</em>
      </SectionHeading>
      <div className="ar-two">
        <article className="ar-card ar-mode-card">
          <span>🗓️</span>
          <small>Horario publicado</small>
          <strong>Commuter</strong>
          <p>
            Sale de forma repetida, al menos cinco veces por semana. El pasajero se adapta al
            horario.
          </p>
          <div className="ar-week">
            {["LUN", "MAR", "MIÉ", "JUE", "VIE"].map((day) => (
              <b key={day}>{day}</b>
            ))}
          </div>
        </article>
        <article className="ar-card ar-mode-card">
          <span>☎️</span>
          <small>Cuando lo pides</small>
          <strong>On-demand</strong>
          <p>El cliente elige cuándo y a dónde. No depende de un horario publicado.</p>
          <div className="ar-callout">Tú llamas → el vuelo se organiza</div>
        </article>
      </div>
      <div className="ar-case-list">
        {cases.map((item) => (
          <CaseCard
            key={item.id}
            item={item}
            value={answers[item.id]}
            onChoose={(value) => onAnswer(item.id, value)}
          />
        ))}
      </div>
    </>
  );
}

function StepOtherRules({
  answers,
  onAnswer,
}: {
  answers: StringAnswers;
  onAnswer: (key: string, answer: string) => void;
}) {
  const options = [
    { key: "61", label: "Part 61" },
    { key: "67", label: "Part 67" },
    { key: "1", label: "Part 1" },
  ];
  const cases: CaseDefinition[] = [
    {
      id: "a",
      text: "“¿Qué necesito para sacar mi licencia de piloto?”",
      options,
      answer: "61",
      ok: "Correcto. Part 61 habla de certificar pilotos.",
      no: {
        "67": "Part 67 es de salud. Aquí preguntan por la licencia.",
        "1": "Part 1 es el diccionario. Aquí preguntan por la licencia.",
      },
    },
    {
      id: "b",
      text: "“Uso lentes. ¿Puedo pasar el examen médico?”",
      options,
      answer: "67",
      ok: "Correcto. Part 67 es la pestaña de salud.",
      no: {
        "61": "Part 61 certifica al piloto, pero lo médico vive en Part 67.",
        "1": "Part 1 define palabras. Lo médico vive en Part 67.",
      },
    },
    {
      id: "c",
      text: "“¿Qué significa exactamente la palabra night en las reglas?”",
      options,
      answer: "1",
      ok: "Correcto. Part 1 es el diccionario. Ojo: algunas palabras se definen en otras Parts, como § 110.2.",
      no: {
        "61": "Part 61 es de licencias. Las definiciones viven en Part 1.",
        "67": "Part 67 es de salud. Las definiciones viven en Part 1.",
      },
    },
  ];
  return (
    <>
      <div className="ar-heading-with-yaris">
        <SectionHeading
          number="06"
          label="Otras reglas clave"
          intro={
            <>
              Ya viste las reglas del vuelo. Faltan las del piloto, las de salud y el diccionario.
              Imagina una carpeta con tres pestañas:{" "}
              <strong>1 define, 61 certifica al piloto y 67 cubre lo médico.</strong>
            </>
          }
        >
          No todo es <em>91, 121 y 135.</em>
        </SectionHeading>
        <img src="/img/yaris-mini.png" alt="Yaris con la carpeta de reglamentos" />
      </div>
      <div className="ar-three ar-tabs">
        <article className="ar-mini">
          <small>El piloto</small>
          <strong>61</strong>
          <h3>Certifica</h3>
          <p>Qué necesitas para ser piloto o instructor.</p>
        </article>
        <article className="ar-mini">
          <small>Lo médico</small>
          <strong>67</strong>
          <h3>Revisa tu salud</h3>
          <p>Los exámenes médicos y sus certificados.</p>
        </article>
        <article className="ar-mini">
          <small>El diccionario</small>
          <strong>1</strong>
          <h3>Define</h3>
          <p>Qué significa cada palabra y abreviatura.</p>
        </article>
      </div>
      <div className="ar-case-list">
        {cases.map((item) => (
          <CaseCard
            key={item.id}
            dark={false}
            item={item}
            value={answers[item.id]}
            onChoose={(value) => onAnswer(item.id, value)}
          />
        ))}
      </div>
    </>
  );
}

function StepQuiz({
  answers,
  onAnswer,
}: {
  answers: QuizAnswers;
  onAnswer: (key: string, answer: number) => void;
}) {
  const questions = useMemo(
    () => [
      {
        id: "a",
        eyebrow: "Escenario 01",
        title: "Un vuelo cuando el cliente quiera.",
        text: "Un operador hace vuelos chárter en la categoría on-demand: el cliente decide cuándo y a dónde.",
        answer: 2,
        feedback: [
          [
            "La base no es toda la respuesta.",
            "Part 91 aplica, pero el escenario dice on-demand. Para esas reglas extra, abres Part 135.",
          ],
          [
            "Mira la pista del caso.",
            "Part 121 es de aerolíneas (domestic, flag, supplemental). Aquí dice on-demand: eso apunta a Part 135.",
          ],
          [
            "Correcto. Usaste el contexto.",
            "On-demand vive en Part 135. La pista no es la palabra chárter, sino la categoría que indica el caso.",
          ],
        ],
      },
      {
        id: "b",
        eyebrow: "Escenario 02",
        title: "Un paseo con amigos.",
        text: "Vuelas tu propia avioneta con dos amigos un domingo. Nadie paga nada y no es una empresa.",
        answer: 0,
        feedback: [
          [
            "Correcto. Es la base.",
            "Vuelo privado, sin cobro: Part 91 es tu base operativa. También pueden aplicar reglas del piloto (Part 61).",
          ],
          [
            "No es una aerolínea.",
            "Part 121 es para aerolíneas con common carriage. Aquí nadie ofrece transporte al público.",
          ],
          [
            "No es un taxi aéreo.",
            "Part 135 es para taxis aéreos que cobran. Aquí es un paseo privado: Part 91.",
          ],
        ],
      },
    ],
    [],
  );
  const labels = ["Part 91", "Part 121", "Part 135"];
  return (
    <>
      <div className="ar-heading-with-yaris">
        <SectionHeading
          number="07"
          label="Ponlo a prueba"
          intro={
            <>
              Ya tienes el mapa completo. Ahora úsalo. Lee cada situación, piensa qué tipo de vuelo
              es y elige. Si te equivocas, no pasa nada: te explico y sigues.
            </>
          }
        >
          ¿Qué Part <em>abrirías primero?</em>
        </SectionHeading>
        <img src="/img/yaris-mini.png" alt="Yaris piensa en la respuesta" />
      </div>
      <div className="ar-quiz-list">
        {questions.map((question) => {
          const picked = answers[question.id];
          return (
            <article className="ar-quiz" key={question.id}>
              <div>
                <small>{question.eyebrow}</small>
                <strong>{question.title}</strong>
                <p>{question.text}</p>
              </div>
              <div>
                <strong>¿Qué Part consultas primero?</strong>
                {labels.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={
                      picked === index
                        ? index === question.answer
                          ? "is-correct"
                          : "is-wrong"
                        : ""
                    }
                    onClick={() => onAnswer(question.id, index)}
                  >
                    <span>{"ABC"[index]}</span>
                    {label}
                  </button>
                ))}
                <div
                  className={`ar-feedback ${picked == null ? "" : picked === question.answer ? "is-correct" : "is-wrong"}`}
                >
                  <strong>
                    {picked == null ? "Elige una opción." : question.feedback[picked][0]}
                  </strong>{" "}
                  {picked == null
                    ? "Piensa primero qué tipo de vuelo es."
                    : question.feedback[picked][1]}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function StepLanding({
  checks,
  finished,
  onCheck,
}: {
  checks: Record<string, boolean>;
  finished: boolean;
  onCheck: (key: string) => void;
}) {
  const items = [
    ["reference", "Sé leer 14 CFR § 91.3: libro, capítulo y regla."],
    ["base", "Sé por qué Part 91 sigue ahí aunque el vuelo sea de aerolínea o taxi aéreo."],
    ["context", "Sé que pagar o tener horario no decide solo la Part: hay que ver todo el caso."],
  ];
  return (
    <>
      <SectionHeading
        number="08"
        label="Aterrizaje"
        intro={
          <>
            Antes de buscar una regla, pregúntate: ¿qué tipo de vuelo es? Esa pregunta te dice qué
            Part abrir.
          </>
        }
      >
        Si recuerdas esto, <em>ya tienes el mapa.</em>
      </SectionHeading>
      <div className="ar-two">
        <div className="ar-summary">
          <div>
            <small>El libro</small>
            <strong>14 CFR</strong>
            <span>FAR = apodo</span>
          </div>
          <div className="is-base">
            <strong>91</strong>
            <span>El piso de abajo, para todos</span>
          </div>
          <div className="ar-summary-split">
            <span>
              <strong>121</strong>Aerolíneas
            </span>
            <span>
              <strong>135</strong>Taxis aéreos
            </span>
          </div>
          <div>
            <small>Otras pestañas</small>
            <span>1 define · 61 certifica · 67 revisa salud</span>
          </div>
        </div>
        <div className="ar-card">
          <span className="ar-overline ar-burgundy">Comprobación final</span>
          <h3>¿Qué puedes explicar con tus palabras?</h3>
          <div className="ar-checks">
            {items.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={checks[key] ? "is-checked" : ""}
                onClick={() => onCheck(key)}
              >
                <span>{checks[key] ? "✓" : ""}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`ar-finish ${finished ? "is-finished" : ""}`}>
        <img
          src={finished ? "/img/pathy-5-elite.png" : "/img/pathy-small.png"}
          alt="Pathy acompaña el cierre del recorrido"
        />
        <div>
          <small>{finished ? "RECORRIDO COMPLETO" : "ÚLTIMA APROXIMACIÓN"}</small>
          <h3>{finished ? "Aterrizaste." : "Casi aterrizas."}</h3>
          <p>
            {finished
              ? "Este tema te enseñó dónde buscar. Los siguientes te llevarán a decisiones más específicas."
              : "Marca las tres ideas y toca Terminar para cerrar el recorrido."}
          </p>
        </div>
      </div>
    </>
  );
}

const styles = `
.ar-shell{--ar-ink:#0f1833;--ar-burgundy:#6c0820;--ar-cherry:#f2aebc;--ar-lapis:#3d5d91;--ar-silver:#90a5c8;--ar-mist:#f5f7fb;display:grid;grid-template-columns:250px minmax(0,1fr);min-height:720px;margin:0 0 24px;border:1px solid rgba(15,24,51,.12);border-radius:24px;overflow:hidden;background:var(--ar-mist);color:var(--ar-ink);box-shadow:0 18px 50px rgba(15,24,51,.12)}
.ar-shell *{box-sizing:border-box}.ar-shell button{font:inherit}.ar-sidebar{display:flex;flex-direction:column;padding:24px 18px;background:var(--ar-ink);color:#fff}.ar-route-title{padding:0 8px 20px;border-bottom:1px solid rgba(255,255,255,.12)}.ar-route-title span,.ar-overline{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ar-cherry)}.ar-route-title strong{display:block;margin-top:8px;font-size:18px;line-height:1.2}.ar-waypoints{display:flex;flex:1;flex-direction:column;gap:5px;padding:16px 0}.ar-waypoint{display:grid;grid-template-columns:32px 1fr;gap:10px;align-items:center;width:100%;padding:9px 8px;border:0;border-radius:12px;background:transparent;color:#fff;text-align:left;cursor:pointer}.ar-waypoint:disabled{opacity:.42;cursor:not-allowed}.ar-waypoint.is-active{background:rgba(255,255,255,.1)}.ar-waypoint>span:first-child{display:grid;width:28px;height:28px;place-items:center;border-radius:50%;background:rgba(255,255,255,.08);font-family:ui-monospace,monospace;font-size:10px}.ar-waypoint.is-active>span:first-child{background:#fff;color:var(--ar-ink);box-shadow:0 0 0 4px rgba(242,174,188,.3)}.ar-waypoint.is-done>span:first-child{background:var(--ar-cherry);color:var(--ar-burgundy)}.ar-waypoint strong,.ar-waypoint small{display:block}.ar-waypoint strong{font-size:12.5px}.ar-waypoint small{margin-top:2px;color:rgba(255,255,255,.55);font-size:10px}.ar-reset{border:0;background:transparent;color:rgba(255,255,255,.55);font-size:11px;cursor:pointer;text-align:left}.ar-reset:hover{color:#fff}
.ar-main{display:grid;min-width:0;grid-template-rows:auto 1fr auto auto}.ar-topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 28px;border-bottom:1px solid rgba(15,24,51,.1);background:#fff}.ar-topbar span,.ar-topbar strong{display:block}.ar-topbar>div:first-child span{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.16em;color:var(--ar-burgundy)}.ar-topbar>div:first-child strong{margin-top:3px;font-size:15px}.ar-progress{width:min(260px,42%);font-size:11px;color:#687084;text-align:right}.ar-progress>div{height:6px;margin-top:6px;border-radius:999px;background:#e7eaf0;overflow:hidden}.ar-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--ar-cherry),var(--ar-burgundy));transition:width .3s}
.ar-content{display:flex;flex-direction:column;gap:26px;padding:32px;overflow:hidden}.ar-pill{display:inline-flex;width:max-content;padding:6px 11px;border-radius:999px;background:#f9d8df;color:var(--ar-burgundy);font-family:ui-monospace,monospace;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.ar-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(180px,.55fr);gap:28px;align-items:center}.ar-hero h1,.ar-section-heading h2{margin:14px 0 12px;font-family:Georgia,"Times New Roman",serif;font-size:clamp(36px,4.4vw,62px);font-weight:600;letter-spacing:-.035em;line-height:1.02}.ar-hero h1 em,.ar-section-heading h2 em{display:block;color:var(--ar-burgundy);font-weight:400}.ar-hero p,.ar-section-heading p{max-width:760px;margin:8px 0;color:#586074;font-size:16px;line-height:1.65}.ar-hero img{width:100%;max-width:280px;margin:auto;filter:drop-shadow(0 18px 24px rgba(15,24,51,.18))}.ar-meta{display:flex;flex-wrap:wrap;gap:24px;margin-top:20px;padding-top:15px;border-top:1px solid rgba(15,24,51,.1)}.ar-meta span{font-size:13px;font-weight:700}.ar-meta small{display:block;margin-bottom:3px;color:#7a8294;font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase}
.ar-dark-panel{padding:26px;border-radius:18px;background:var(--ar-ink);color:#fff}.ar-dark-panel h3{max-width:620px;margin:9px 0 20px;font-family:Georgia,serif;font-size:24px}.ar-map,.ar-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.ar-map button{display:flex;min-height:188px;flex-direction:column;gap:8px;padding:18px;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:rgba(255,255,255,.05);color:#fff;text-align:left;cursor:pointer}.ar-map button.is-seen{border-color:var(--ar-cherry);background:rgba(242,174,188,.15)}.ar-map button small,.ar-mini small{color:var(--ar-cherry);font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase}.ar-map button strong{font-family:Georgia,serif;font-size:21px}.ar-map button p{margin:0;color:rgba(255,255,255,.7);font-size:13px;line-height:1.5}.ar-map button span{margin-top:auto;color:var(--ar-cherry);font-size:11px}
.ar-section-heading{max-width:820px}.ar-section-heading h2{font-size:clamp(32px,3.7vw,50px)}.ar-section-heading h2 em{display:inline}.ar-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:stretch}.ar-card,.ar-mini{padding:24px;border:1px solid rgba(15,24,51,.12);border-radius:16px;background:#fff;box-shadow:0 8px 24px rgba(15,24,51,.06)}.ar-card>p,.ar-mini p{color:#5c6477;font-size:14px;line-height:1.55}.ar-burgundy{color:var(--ar-burgundy)}.ar-token-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0}.ar-token-grid button{padding:16px 8px;border:1px solid rgba(15,24,51,.16);border-radius:12px;background:#fff;color:var(--ar-ink);cursor:pointer}.ar-token-grid button.is-filled{border-color:var(--ar-silver);background:#eef2f8}.ar-token-grid small,.ar-token-grid strong{display:block}.ar-token-grid small{font-size:9px;color:#727a8d}.ar-token-grid strong{margin-top:6px;font-size:17px}.ar-address-board{display:flex;flex-direction:column;gap:9px;padding:24px;border-radius:16px;background:var(--ar-ink);color:#fff}.ar-address-board>div{display:flex;align-items:center;justify-content:space-between;padding:15px;border:1px dashed rgba(255,255,255,.2);border-radius:12px}.ar-address-board>div.is-filled{border-style:solid;border-color:var(--ar-cherry);background:rgba(255,255,255,.06)}.ar-address-board small{color:rgba(255,255,255,.55);font-family:ui-monospace,monospace;font-size:9px;text-transform:uppercase}.ar-address-board strong{font-family:Georgia,serif;font-size:22px}.ar-address-board p{margin-top:auto;color:rgba(255,255,255,.65);font-size:12px;line-height:1.5}
.ar-feedback{margin-top:12px;padding:12px 14px;border-radius:11px;background:#eef1f6;color:#5b6476;font-size:12.5px;line-height:1.5}.ar-feedback.is-correct{background:#eaf0f8;color:#294977}.ar-feedback.is-wrong{background:#f9eaed;color:var(--ar-burgundy)}.ar-layer-tabs{display:flex;flex-wrap:wrap;gap:8px}.ar-layer-tabs button{padding:9px 16px;border:1px solid rgba(15,24,51,.16);border-radius:999px;background:#fff;color:var(--ar-ink);font-size:13px;font-weight:700;cursor:pointer}.ar-layer-tabs button.is-active{border-color:var(--ar-ink);background:var(--ar-ink);color:#fff}.ar-building{display:flex;flex-direction:column;justify-content:flex-end;min-height:330px;padding:28px;border-radius:16px;background:linear-gradient(#e9eff8,#f8e8ec)}.ar-added-floor,.ar-base-floor{display:flex;flex-direction:column;padding:22px;border-radius:14px 14px 4px 4px}.ar-added-floor{margin:0 18px 8px;background:var(--ar-lapis);color:#fff}.ar-base-floor{background:var(--ar-ink);color:#fff}.ar-added-floor small,.ar-base-floor small{font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;opacity:.7}.ar-added-floor strong,.ar-base-floor strong{font-family:Georgia,serif;font-size:32px}.ar-base-floor span{font-size:11px;opacity:.6}.ar-ground{padding:10px;border-radius:0 0 10px 10px;background:#ccd6e6;color:#344461;text-align:center;font-size:10px;font-weight:700}.ar-explain h3{font-family:Georgia,serif;font-size:28px}.ar-note{margin-top:20px;padding:16px;border-left:3px solid var(--ar-cherry);background:#fbf1f3}.ar-note p{margin:4px 0 0;color:#60687a;font-size:13px;line-height:1.5}
.ar-mini{display:flex;min-height:158px;flex-direction:column;gap:6px}.ar-mini strong{font-family:Georgia,serif;font-size:29px}.ar-mini p{margin:auto 0 0}.ar-case-list{display:flex;flex-direction:column;gap:14px}.ar-case{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.8fr);gap:20px;padding:22px;border-radius:16px;background:var(--ar-ink);color:#fff}.ar-case:not(.ar-case--dark){border:1px solid rgba(15,24,51,.12);background:#fff;color:var(--ar-ink)}.ar-case>p{margin:0;color:rgba(255,255,255,.78);font-size:15px;line-height:1.55}.ar-case:not(.ar-case--dark)>p{color:#555e72}.ar-options{display:flex;flex-wrap:wrap;align-content:flex-start;gap:7px}.ar-choice{padding:8px 12px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:rgba(255,255,255,.06);color:inherit;cursor:pointer}.ar-case:not(.ar-case--dark) .ar-choice{border-color:rgba(15,24,51,.16);background:#fff}.ar-choice.is-correct,.ar-quiz button.is-correct{border-color:var(--ar-silver)!important;background:rgba(144,165,200,.25)!important}.ar-choice.is-wrong,.ar-quiz button.is-wrong{border-color:#e28da0!important;background:rgba(108,8,32,.18)!important}.ar-case .ar-feedback{grid-column:2;margin:0}
.ar-mode-card{display:flex;flex-direction:column;gap:7px}.ar-mode-card>span{font-size:28px}.ar-mode-card>small{color:var(--ar-burgundy);font-family:ui-monospace,monospace;font-size:9px;text-transform:uppercase}.ar-mode-card>strong{font-family:Georgia,serif;font-size:30px}.ar-week{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:auto}.ar-week b{padding:7px 3px;border-radius:7px;background:#e8edf5;color:#52698f;text-align:center;font-size:9px}.ar-callout{margin-top:auto;padding:11px;border-radius:9px;background:#f7e7eb;color:var(--ar-burgundy);font-size:12px;font-weight:700}.ar-heading-with-yaris{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:20px;align-items:center}.ar-heading-with-yaris img{width:100%;max-height:210px;object-fit:contain}.ar-tabs{padding-top:18px}.ar-tabs .ar-mini{position:relative}.ar-tabs .ar-mini strong{font-size:42px}.ar-tabs .ar-mini h3{margin:0;font-size:15px}
.ar-quiz-list{display:flex;flex-direction:column;gap:16px}.ar-quiz{display:grid;grid-template-columns:1fr 1fr;border:1px solid rgba(15,24,51,.12);border-radius:16px;overflow:hidden;background:#fff}.ar-quiz>div{display:flex;flex-direction:column;gap:10px;padding:24px}.ar-quiz>div:first-child{background:var(--ar-ink);color:#fff}.ar-quiz>div:first-child small{color:var(--ar-cherry);font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase}.ar-quiz>div:first-child strong{font-family:Georgia,serif;font-size:22px}.ar-quiz>div:first-child p{margin:0;color:rgba(255,255,255,.72);font-size:14px;line-height:1.55}.ar-quiz button{display:grid;grid-template-columns:28px 1fr;gap:9px;align-items:center;padding:9px 12px;border:1px solid rgba(15,24,51,.14);border-radius:10px;background:#fff;color:var(--ar-ink);text-align:left;cursor:pointer}.ar-quiz button span{display:grid;width:28px;height:28px;place-items:center;border-radius:50%;background:#eef0f4;font-family:ui-monospace,monospace;font-size:10px}
.ar-summary{display:flex;flex-direction:column;gap:8px;padding:22px;border-radius:16px;background:var(--ar-ink);color:#fff}.ar-summary>div{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:13px 15px;border-radius:11px;background:rgba(255,255,255,.06)}.ar-summary small{color:rgba(255,255,255,.5);font-family:ui-monospace,monospace;font-size:9px;text-transform:uppercase}.ar-summary>div>strong{font-family:Georgia,serif;font-size:23px}.ar-summary>div>span{color:rgba(255,255,255,.7);font-size:12px}.ar-summary .is-base{background:var(--ar-lapis)}.ar-summary-split{display:grid!important;grid-template-columns:1fr 1fr}.ar-summary-split span{display:flex;align-items:center;gap:8px}.ar-summary-split strong{font-family:Georgia,serif;font-size:24px;color:#fff}.ar-card h3{font-family:Georgia,serif;font-size:24px}.ar-checks{display:flex;flex-direction:column;gap:8px}.ar-checks button{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:center;padding:11px;border:1px solid rgba(15,24,51,.12);border-radius:10px;background:#fff;color:var(--ar-ink);text-align:left;cursor:pointer}.ar-checks button.is-checked{border-color:var(--ar-silver);background:#edf2f8}.ar-checks button span{display:grid;width:25px;height:25px;place-items:center;border:1px solid #cbd0da;border-radius:7px}.ar-checks button.is-checked span{border-color:var(--ar-lapis);background:var(--ar-lapis);color:#fff}.ar-finish{display:grid;grid-template-columns:130px 1fr;gap:20px;align-items:center;padding:20px;border:1px solid rgba(15,24,51,.12);border-radius:16px;background:#fff}.ar-finish.is-finished{border-color:var(--ar-silver);background:linear-gradient(135deg,#edf3fb,#fbebef)}.ar-finish img{width:100%;max-height:120px;object-fit:contain}.ar-finish small{color:var(--ar-burgundy);font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.14em}.ar-finish h3{margin:4px 0;font-family:Georgia,serif;font-size:28px}.ar-finish p{margin:0;color:#5f6779;font-size:14px}
.ar-guide{display:flex;align-items:center;gap:12px;margin:0 28px;padding:13px 16px;border:1px solid rgba(15,24,51,.1);border-radius:14px;background:#fff}.ar-guide>div{min-width:0;flex:1}.ar-guide strong{font-size:12px}.ar-guide p{margin:3px 0 0;color:#667084;font-size:12px;line-height:1.4}.ar-guide>span{padding:6px 9px;border-radius:999px;background:#f2f3f6;color:#687184;font-size:10px;font-weight:700;white-space:nowrap}.ar-guide>span.is-done{background:#e8eef7;color:var(--ar-lapis)}.ar-footer{display:flex;justify-content:space-between;gap:12px;padding:18px 28px}.ar-button{padding:10px 18px;border-radius:999px;font-weight:700;cursor:pointer}.ar-button:disabled{opacity:.42;cursor:not-allowed}.ar-button--ghost{border:1px solid rgba(15,24,51,.14);background:#fff;color:var(--ar-ink)}.ar-button--primary{border:1px solid var(--ar-burgundy);background:var(--ar-burgundy);color:#fff}
@media(max-width:980px){.ar-shell{grid-template-columns:1fr}.ar-sidebar{padding:16px}.ar-route-title{padding-bottom:12px}.ar-waypoints{flex-direction:row;overflow-x:auto;padding:12px 0}.ar-waypoint{min-width:170px}.ar-reset{display:none}.ar-content{padding:26px}.ar-case{grid-template-columns:1fr}.ar-case .ar-feedback{grid-column:1}.ar-guide{margin:0 20px}.ar-footer{padding:16px 20px}}
@media(max-width:700px){.ar-shell{margin-inline:-4px;border-radius:18px}.ar-topbar{align-items:flex-start;padding:15px 18px}.ar-progress{width:45%}.ar-content{gap:21px;padding:22px 18px}.ar-hero,.ar-two,.ar-heading-with-yaris,.ar-quiz,.ar-finish{grid-template-columns:1fr}.ar-hero img{max-width:190px}.ar-map,.ar-three{grid-template-columns:1fr}.ar-map button{min-height:145px}.ar-token-grid{grid-template-columns:1fr}.ar-building{min-height:280px}.ar-heading-with-yaris img{max-width:160px;margin:auto}.ar-case{padding:18px}.ar-guide{align-items:flex-start;margin:0 14px}.ar-guide>span{display:none}.ar-footer{padding:14px}.ar-button{padding:10px 14px}.ar-summary>div{align-items:flex-start;flex-direction:column}.ar-summary-split{grid-template-columns:1fr}.ar-finish img{max-height:110px}.ar-section-heading h2{font-size:34px}}
`;
