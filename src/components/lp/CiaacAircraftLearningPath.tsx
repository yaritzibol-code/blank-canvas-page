import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLearningPathStageView } from "./LearningPathExperience";
import {
  AircraftIllustration,
  OperationScene,
  AIRPLANE_EVENTS,
  HELICOPTER_EVENTS,
} from "./CiaacAircraftScenes";
import {
  AIRCRAFT_SCENES,
  aircraftSceneReady,
  freshAircraftJourney,
  migrateAircraftJourney,
  type AircraftJourney,
} from "@/lib/lp/ciaac-aircraft-journey";
import { getLpJourney, resetLpJourney, saveLpJourney } from "@/lib/store/lp-journey";
import type { HandbookLearningPathDocument } from "@/lib/lp/handbook-types";
import "./ciaac-aircraft.css";

type AircraftKind = "airplane" | "helicopter" | "glider" | "balloon" | "hovercraft";
const AIRCRAFT: {
  id: AircraftKind;
  label: string;
  support: string;
  explanation: string;
  success: string;
}[] = [
  {
    id: "airplane",
    label: "Avión",
    support: "Las alas interactúan con el aire",
    explanation:
      "Las alas permiten que el avión se sostenga por su interacción con el aire. Tener motor no es el criterio que define a la aeronave.",
    success:
      "Sí. Lo importante es su capacidad para sostenerse en la atmósfera mediante las reacciones del aire.",
  },
  {
    id: "helicopter",
    label: "Helicóptero",
    support: "El rotor interactúa con el aire",
    explanation:
      "Las palas del rotor interactúan con el aire y permiten sostener el helicóptero. Observa el rotor: aquí está la pista de su sustentación.",
    success:
      "Sí. Las palas del rotor interactúan con el aire; no necesita un colchón de aire apoyado contra el suelo para entrar en esta definición.",
  },
  {
    id: "glider",
    label: "Planeador",
    support: "Puede sostenerse sin motor",
    explanation:
      "El planeador también tiene alas. Puede sostenerse por su interacción con el aire aunque no tenga motor. Por eso el motor no decide la clasificación.",
    success: "Sí. Puede sostenerse por su interacción con el aire aunque no tenga motor.",
  },
  {
    id: "balloon",
    label: "Globo",
    support: "Su sustentación es por flotación",
    explanation:
      "El globo puede mantenerse en la atmósfera por flotación. No usa el mismo mecanismo que un ala, pero está incluido en la definición de aeronave.",
    success:
      "Sí. La definición también incluye al globo. Su flotación no debe confundirse con la sustentación de un ala o un rotor.",
  },
  {
    id: "hovercraft",
    label: "Aerodeslizador",
    support: "Un colchón de aire apoyado en la superficie",
    explanation:
      "Mira el colchón de aire y la superficie debajo. El aerodeslizador se sostiene gracias a la reacción de ese aire contra la superficie: esa es la excepción de la definición.",
    success:
      "Exacto. El colchón de aire depende de la superficie debajo; por eso queda fuera de esta definición.",
  },
];

const CONCEPT_OPTIONS = [
  { id: "machine", label: "La máquina" },
  { id: "condition", label: "Una condición física" },
  { id: "interval", label: "Un intervalo definido" },
];
const CONCEPT_SLOTS = [
  { id: "machine", label: "Aeronave", expected: "machine" },
  { id: "condition", label: "Físicamente en el aire", expected: "condition" },
  { id: "interval", label: "Tiempo de vuelo", expected: "interval" },
];
const CONCEPT_FEEDBACK =
  "Está estacionado y sigue siendo una aeronave. La máquina no cambia al tocar tierra; estar en el aire es una condición, y el tiempo de vuelo es un intervalo definido.";
const HELICOPTER_SLOTS = [
  { id: "start", label: "Aquí empieza el intervalo", expected: "rotor-start" },
  { id: "end", label: "Aquí termina el intervalo", expected: "aircraft-and-rotor-stop" },
];
const HELICOPTER_OPTIONS = [
  { id: "rotor-start", label: "Empieza a girar el rotor" },
  { id: "aircraft-and-rotor-stop", label: "Aeronave y palas detenidas al terminar" },
];

interface Case {
  id: string;
  title: string;
  kind: AircraftKind;
  event?: number;
  context: string;
  question: string;
  options: string[];
  correct: number;
  feedback: string[];
}
const CASES: Case[] = [
  {
    id: "glider",
    title: "Sin motor",
    kind: "glider",
    context: "Un planeador puede sostenerse por su interacción con el aire, aunque no tenga motor.",
    question: "¿Es una aeronave?",
    options: [
      "No: necesita un motor para ser aeronave.",
      "Sí: importa cómo puede sostenerse en la atmósfera.",
      "Solo cuando está físicamente en el aire.",
    ],
    correct: 1,
    feedback: [
      "Mira sus alas. Tener motor no es parte del criterio: importa cómo puede sostenerse mediante las reacciones del aire.",
      "Exacto. El planeador puede sostenerse por su interacción con el aire. Tener motor no decide si es aeronave.",
      "Aterrizar no cambia la identidad de la máquina. El planeador sigue siendo una aeronave cuando está estacionado.",
    ],
  },
  {
    id: "taxi",
    title: "Una espera en tierra",
    kind: "airplane",
    event: 2,
    context:
      "El avión ya empezó a moverse para despegar. Ahora espera temporalmente durante el rodaje.",
    question: "Según la definición OACI estudiada, ¿qué pasa con el tiempo de vuelo?",
    options: [
      "Sigue contando: la operación aún no ha terminado.",
      "Termina porque el avión dejó de moverse.",
      "Todavía no empieza: no ha despegado.",
    ],
    correct: 0,
    feedback: [
      "Sí. Es una espera temporal dentro de la salida. El final es la detención final al terminar el vuelo.",
      "Una espera temporal no es la detención final. El avión todavía está realizando su salida.",
      "El despegue inicia el tiempo en el aire. Este intervalo ya comenzó con el primer movimiento para despegar.",
    ],
  },
  {
    id: "rotor",
    title: "Ya aterrizó, pero…",
    kind: "helicopter",
    event: 3,
    context: "Al terminar el vuelo, el helicóptero ya está detenido. Las palas todavía giran.",
    question: "¿Qué falta para que termine el intervalo estudiado?",
    options: [
      "Nada: terminó al tocar tierra.",
      "Que se apaguen todos los sistemas.",
      "Que las palas del rotor se detengan.",
    ],
    correct: 2,
    feedback: [
      "Tocar tierra no completa por sí solo el criterio. Mira el rotor: las palas todavía están girando.",
      "La definición estudiada incluye la detención de las palas; apagar todos los sistemas no sustituye esa condición.",
      "Exacto. El final requiere que la aeronave quede finalmente detenida y que las palas se hayan parado.",
    ],
  },
];

function Guide({
  children,
  feedback,
  success,
}: {
  children: ReactNode;
  feedback?: string;
  success?: boolean;
}) {
  return (
    <aside className="av-guide" aria-label="Yaris explica">
      <div className="av-guide-person">
        <img src="/lp/visual/yaris.png" alt="Yaris" />
        <span>Yaris te explica</span>
      </div>
      <div className="av-guide-copy">{children}</div>
      {feedback && (
        <div className={`av-feedback ${success ? "is-success" : ""}`} role="status">
          <span aria-hidden="true">{success ? "✓" : "↗"}</span>
          <p>{feedback}</p>
        </div>
      )}
    </aside>
  );
}

function PhraseMap({
  title,
  options,
  slots,
  answers,
  onPlace,
}: {
  title: string;
  options: { id: string; label: string }[];
  slots: { id: string; label: string; expected: string }[];
  answers: Record<string, string>;
  onPlace: (slot: string, value: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <section className="av-map" aria-label={title}>
      <h3>{title}</h3>
      <p className="av-instruction">
        1. Elige una frase. 2. Toca el espacio al que pertenece. Puedes cambiarla cuando quieras.
      </p>
      <div className="av-word-bank" role="group" aria-label="Banco de frases">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={picked === option.id}
            onClick={() => setPicked(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="av-map-connections">
        {slots.map((slot) => {
          const value = answers[slot.id];
          const correct = value === slot.expected;
          return (
            <div className="av-map-row" key={slot.id}>
              <strong>{slot.label}</strong>
              <span className="av-map-arrow" aria-hidden="true">
                →
              </span>
              <button
                type="button"
                className={value ? (correct ? "is-correct" : "needs-review") : ""}
                aria-label={`${slot.label}: ${options.find((option) => option.id === value)?.label ?? "sin completar"}`}
                onClick={() => {
                  if (picked) onPlace(slot.id, picked);
                }}
              >
                <span>
                  {options.find((option) => option.id === value)?.label ??
                    (picked ? "Coloca aquí la frase" : "Primero elige una frase")}
                </span>
                {value && <small>{correct ? "✓ Conectado" : "Revisa esta relación"}</small>}
              </button>
            </div>
          );
        })}
      </div>
      <p className="av-bank-selection" aria-live="polite">
        {picked
          ? `Elegiste: ${options.find((option) => option.id === picked)?.label}. Ahora selecciona su espacio.`
          : "Las frases permanecen visibles mientras completas el mapa."}
      </p>
    </section>
  );
}

function Choices({
  question,
  options,
  value,
  correct,
  onChoose,
  label,
}: {
  question: string;
  options: string[];
  value: number | null | undefined;
  correct: number;
  onChoose: (index: number) => void;
  label?: string;
}) {
  return (
    <fieldset className="av-choices">
      <legend>{question}</legend>
      {label && <p className="av-instruction">{label}</p>}
      {options.map((option, index) => (
        <button
          type="button"
          key={option}
          aria-pressed={value === index}
          className={value === index ? (index === correct ? "is-correct" : "needs-review") : ""}
          onClick={() => onChoose(index)}
        >
          <b aria-hidden="true">{String.fromCharCode(65 + index)}</b>
          <span>{option}</span>
          {value === index && <small>{index === correct ? "✓" : "Revisa"}</small>}
        </button>
      ))}
    </fieldset>
  );
}

function EventControls({
  labels,
  current,
  onSelect,
}: {
  labels: string[];
  current: number;
  onSelect: (event: number) => void;
}) {
  return (
    <div className="av-events" role="group" aria-label="Explora los momentos de la operación">
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          aria-pressed={current === index}
          onClick={() => onSelect(index)}
        >
          <b>{index + 1}</b>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function CiaacAircraftLearningPath({
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
  const [state, setState] = useState<AircraftJourney>(freshAircraftJourney);
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [motion, setMotion] = useState(false);
  const [currentCase, setCurrentCase] = useState(0);
  const [planeTask, setPlaneTask] = useState<"interval" | "purpose">("interval");
  const [helicopterTask, setHelicopterTask] = useState<"labels" | "condition">("labels");
  const completeRequested = useRef(false);
  const ready = aircraftSceneReady(state.step, state);
  const allReady = AIRCRAFT_SCENES.every((_, index) => aircraftSceneReady(index, state));
  const canContinue = state.finished || (ready && (state.step < 4 || allReady));
  const selected = AIRCRAFT.find((item) => item.id === state.selectedAircraft) ?? AIRCRAFT[0];
  const caseItem = CASES[currentCase];
  const casesReady = CASES.every((item) => state.cases[item.id] === item.correct);

  useEffect(() => {
    if (hydrated) return;
    setState(migrateAircraftJourney(getLpJourney(userId, lpId), completed));
    setHydrated(true);
  }, [completed, hydrated, lpId, userId]);
  useEffect(() => {
    if (hydrated) saveLpJourney(userId, lpId, state);
  }, [hydrated, lpId, state, userId]);
  useEffect(() => {
    setFeedback(null);
    setMotion(false);
    setPlaneTask("interval");
    setHelicopterTask("labels");
  }, [state.step]);

  const patch = (value: Partial<AircraftJourney>) =>
    setState((previous) => ({ ...previous, ...value }));
  const say = (text: string, success = false) => setFeedback({ text, success });
  const navigate = (step: number) => {
    if (step >= 0 && step < AIRCRAFT_SCENES.length && step <= state.maxStep) patch({ step });
  };
  const advance = () => {
    if (!canContinue) return;
    if (state.step === 4) {
      if (state.finished || completeRequested.current) return;
      completeRequested.current = true;
      patch({ finished: true, done: [true, true, true, true, true], maxStep: 4 });
      if (!completed) onComplete();
      return;
    }
    const done: AircraftJourney["done"] = [...state.done];
    done[state.step] = true;
    patch({ step: state.step + 1, maxStep: Math.max(state.maxStep, state.step + 1), done });
  };
  const reset = () => {
    if (
      !window.confirm(
        "¿Reiniciar las actividades de este recorrido? El estado general de completado de tu cuenta se conserva.",
      )
    )
      return;
    resetLpJourney(userId, lpId);
    completeRequested.current = false;
    setFeedback(null);
    setState(freshAircraftJourney());
  };
  const progress = state.finished
    ? 100
    : Math.round((state.done.filter(Boolean).length / AIRCRAFT_SCENES.length) * 100);
  useLearningPathStageView({
    labels: AIRCRAFT_SCENES,
    current: state.step,
    highest: state.maxStep,
    done: state.done,
    percent: progress,
    onNavigate: navigate,
    onReset: reset,
  });

  const placeConcept = (field: "conceptMatches" | "finalMap", slot: string, value: string) => {
    patch({ [field]: { ...state[field], [slot]: value } });
    say(
      slot === value
        ? "Sí. Separaste la identidad de la máquina, su condición física y el intervalo definido."
        : CONCEPT_FEEDBACK,
      slot === value,
    );
  };
  const selectEndpoint = (endpoint: "planeStart" | "planeEnd", event: number) => {
    patch({ [endpoint]: event, planeEvent: event });
    const good = endpoint === "planeStart" ? event === 1 : event === 5;
    if (good)
      say(
        endpoint === "planeStart"
          ? "Aquí empieza: el avión realiza su primer movimiento con propósito de despegar. No necesita haber elevado las ruedas."
          : "Aquí termina: es la detención final al acabar el vuelo, no una espera temporal.",
        true,
      );
    else if (endpoint === "planeStart")
      say(
        event === 3
          ? "Ese momento inicia el tiempo en el aire. El tiempo de vuelo ya comenzó cuando el avión se movió para despegar."
          : "Busca el primer movimiento con propósito de despegar. Preparar sistemas o esperar no sustituye esa condición.",
      );
    else
      say(
        event === 2
          ? "La espera es temporal. La operación todavía no termina."
          : event === 4
            ? "Ya terminó el tiempo en el aire. Falta la detención final al terminar el vuelo."
            : "El final no es cualquier parada ni el despegue: busca la detención final al terminar el vuelo.",
      );
  };

  const stageTitle = [
    "Aeronave en vuelo",
    "La misma máquina, distintos momentos",
    "El avión: dónde empieza y termina",
    "El helicóptero: la condición que falta",
    "Usa las ideas",
  ][state.step];
  const taskHint = [
    "Ubica los cinco ejemplos usando su forma de sustentarse.",
    "Conecta las tres ideas en el mapa.",
    "Marca los dos extremos y compara los dos propósitos.",
    "Coloca las dos etiquetas y elige la condición que falta.",
    "Resuelve los tres casos y conecta el mapa final.",
  ][state.step];

  return (
    <section className="ciaac-aircraft" aria-labelledby="av-title">
      {state.migrationNotice && (
        <div className="av-migration" role="status">
          <p>
            Este recorrido tiene una nueva organización. Tu avance general se conserva; empezamos la
            nueva exploración desde la primera escena.
          </p>
          <button type="button" onClick={() => patch({ migrationNotice: false })}>
            Entendido
          </button>
        </div>
      )}
      <header className="av-heading">
        <span>Escena {state.step + 1} de 5 · Entender primero</span>
        <h1 id="av-title">{stageTitle}</h1>
        <p>
          {
            [
              "No lo decide el motor. Lo decide cómo puede sostenerse.",
              "El nombre de la máquina no cambia al tocar tierra.",
              "Dos intervalos que no significan lo mismo.",
              "Mira la aeronave y también las palas.",
              "Aplica lo que observaste, sin memorizar una frase.",
            ][state.step]
          }
        </p>
      </header>

      {state.step === 0 && (
        <>
          <div className="av-example-tabs" role="group" aria-label="Elige un ejemplo para explorar">
            {AIRCRAFT.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={state.selectedAircraft === item.id}
                onClick={() => {
                  patch({ selectedAircraft: item.id });
                  setFeedback(null);
                }}
              >
                <span>{item.label}</span>
                {state.classified[item.id] ===
                  (item.id === "hovercraft" ? "excluded" : "aircraft") && (
                  <b aria-label="Clasificado correctamente">✓</b>
                )}
              </button>
            ))}
          </div>
          <div className="av-explain-layout">
            <figure className="av-figure">
              <AircraftIllustration kind={selected.id} motion={motion} />
              <figcaption>
                <strong>{selected.label}</strong>
                <span>{selected.support}</span>
              </figcaption>
              <button
                className="av-motion"
                type="button"
                aria-pressed={motion}
                onClick={() => setMotion((value) => !value)}
              >
                {motion ? "Pausar movimiento" : "Mostrar movimiento"}
              </button>
            </figure>
            <Guide feedback={feedback?.text} success={feedback?.success}>
              <p>
                Fíjate en cómo puede sostenerse. Tener motor no es lo que decide si es una aeronave.
              </p>
              <p>
                <strong>{selected.explanation}</strong>
              </p>
              <details>
                <summary>La definición completa</summary>
                <p>
                  Una máquina que puede mantenerse en la atmósfera gracias a las reacciones del
                  aire, excluyendo las que dependen de la reacción de ese aire contra la superficie
                  terrestre.
                </p>
              </details>
            </Guide>
          </div>
          <section className="av-classify" aria-label="Mapa de clasificación">
            <h2>
              ¿Dónde ubicas{" "}
              {selected.id === "hovercraft"
                ? "el aerodeslizador"
                : `el ${selected.label.toLocaleLowerCase("es-MX")}`}
              ?
            </h2>
            <p>Selecciona un ejemplo arriba y después su lugar en el mapa.</p>
            <div className="av-bins">
              {[
                { id: "aircraft", label: "Es aeronave" },
                { id: "excluded", label: "Queda fuera de esta definición" },
              ].map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => {
                    patch({ classified: { ...state.classified, [selected.id]: category.id } });
                    const correct =
                      category.id === (selected.id === "hovercraft" ? "excluded" : "aircraft");
                    say(
                      correct
                        ? selected.success
                        : selected.id === "hovercraft"
                          ? "Mira el colchón de aire: depende de la superficie debajo. Esa es la excepción de esta definición."
                          : "Mira cómo puede sostenerse por su interacción con el aire. No lo clasifiques por tener motor ni por estar en tierra en este instante.",
                      correct,
                    );
                  }}
                >
                  <strong>{category.label}</strong>
                  <span className="av-placed-examples">
                    {AIRCRAFT.filter((item) => state.classified[item.id] === category.id).map(
                      (item) => (
                        <span key={item.id}>
                          {item.label}{" "}
                          {category.id === (item.id === "hovercraft" ? "excluded" : "aircraft")
                            ? "✓"
                            : "↗"}
                        </span>
                      ),
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {state.step === 1 && (
        <>
          <div
            className="av-example-tabs"
            role="group"
            aria-label="La misma aeronave en tres momentos"
          >
            {["Estacionado", "Rodando", "En el aire"].map((label, index) => (
              <button
                type="button"
                key={label}
                aria-pressed={state.machineMoment === index}
                onClick={() => {
                  patch({ machineMoment: index });
                  setFeedback(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="av-explain-layout">
            <figure className="av-figure">
              <OperationScene
                kind="airplane"
                eventIndex={[0, 1, 3][state.machineMoment]}
                motion={motion}
              />
              <figcaption className="av-status-pair">
                <span>
                  <b>Aeronave</b> · sigue siendo la misma máquina
                </span>
                <span key={state.machineMoment}>
                  <b>Condición física</b> · {state.machineMoment === 2 ? "en el aire" : "en tierra"}
                </span>
              </figcaption>
            </figure>
            <Guide feedback={feedback?.text} success={feedback?.success}>
              <p>
                El avión sigue siendo una aeronave cuando está estacionado. Estar en el aire
                describe otro aspecto de esa misma máquina.
              </p>
              <p>
                El <strong>tiempo de vuelo</strong> es un intervalo con un inicio y un final
                definidos. No es automáticamente lo mismo que estar físicamente en el aire ni todas
                las posibles definiciones legales de «en vuelo».
              </p>
              <p>Ahora conecta cada idea con lo que describe.</p>
            </Guide>
          </div>
          <PhraseMap
            title="Una máquina, tres ideas distintas"
            options={CONCEPT_OPTIONS}
            slots={CONCEPT_SLOTS}
            answers={state.conceptMatches}
            onPlace={(slot, value) => placeConcept("conceptMatches", slot, value)}
          />
        </>
      )}

      {state.step === 2 && (
        <>
          <p className="av-scope">
            Aquí usamos la definición de tiempo de vuelo de OACI estudiada en este módulo.
          </p>
          <div
            className="av-substeps"
            role="group"
            aria-label="Dos partes de la comparación del avión"
          >
            <button
              type="button"
              aria-pressed={planeTask === "interval"}
              onClick={() => {
                setPlaneTask("interval");
                setFeedback(null);
              }}
            >
              1. Marca el intervalo {state.planeStart === 1 && state.planeEnd === 5 && "✓"}
            </button>
            <button
              type="button"
              aria-pressed={planeTask === "purpose"}
              onClick={() => {
                setPlaneTask("purpose");
                patch({ planeEvent: 1 });
                setFeedback(null);
              }}
            >
              2. Compara el propósito{" "}
              {state.purposeChoices.flight === "counts" &&
                state.purposeChoices.hangar === "does-not-start" &&
                "✓"}
            </button>
          </div>
          <div className="av-explain-layout">
            <figure className="av-figure">
              <OperationScene
                kind="airplane"
                eventIndex={planeTask === "purpose" ? 1 : state.planeEvent}
                purpose={planeTask === "purpose" ? state.planePurpose : "flight"}
                motion={motion}
              />
              {planeTask === "interval" && (
                <div className="av-event-actions">
                  <button
                    type="button"
                    disabled={state.planeEvent === 0}
                    onClick={() => {
                      patch({ planeEvent: state.planeEvent - 1 });
                      setFeedback(null);
                    }}
                  >
                    ← Momento anterior
                  </button>
                  <button
                    type="button"
                    aria-pressed={motion}
                    onClick={() => setMotion((value) => !value)}
                  >
                    {motion ? "Pausar movimiento" : "Mostrar movimiento"}
                  </button>
                  <button
                    type="button"
                    disabled={state.planeEvent === 5}
                    onClick={() => {
                      patch({ planeEvent: state.planeEvent + 1 });
                      setFeedback(null);
                    }}
                  >
                    Momento siguiente →
                  </button>
                </div>
              )}
            </figure>
            <Guide feedback={feedback?.text} success={feedback?.success}>
              <p>
                Para el avión, el tiempo de vuelo empieza con el{" "}
                <strong>primer movimiento con propósito de despegar</strong> y termina con la{" "}
                <strong>detención final al terminar el vuelo</strong>.
              </p>
              <p>
                {planeTask === "purpose"
                  ? state.planePurpose === "flight"
                    ? "Este movimiento inicia una salida a volar: el propósito de despegar es parte de la condición."
                    : "Este traslado entre hangares no tiene propósito de despegar. El movimiento por sí solo no inicia el intervalo estudiado."
                  : AIRPLANE_EVENTS[state.planeEvent].description}
              </p>
              <details>
                <summary>Push-back, esperas y «entre calzos»</summary>
                <p>
                  El push-back o rodaje que inicia la salida puede formar parte del intervalo. Una
                  espera temporal no lo termina. «Entre calzos» nombra este intervalo: la definición
                  se refiere al movimiento y a la detención final, no al gesto de quitar o colocar
                  un calzo.
                </p>
              </details>
            </Guide>
          </div>
          {planeTask === "interval" && (
            <>
              <EventControls
                labels={AIRPLANE_EVENTS.map((event) => event.label)}
                current={state.planeEvent}
                onSelect={(planeEvent) => {
                  patch({ planeEvent });
                  setFeedback(null);
                }}
              />
              <section className="av-interval-task">
                <h2>Marca los extremos del intervalo</h2>
                <p>¿Desde qué momento se empieza a contar el tiempo de vuelo? ¿En cuál termina?</p>
                <div className="av-endpoints">
                  <label>
                    Empieza a contar
                    <select
                      value={state.planeStart ?? ""}
                      onChange={(event) => selectEndpoint("planeStart", Number(event.target.value))}
                    >
                      <option value="" disabled>
                        Elige el momento
                      </option>
                      {AIRPLANE_EVENTS.map((event, index) => (
                        <option key={event.id} value={index}>
                          {index + 1}. {event.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Termina
                    <select
                      value={state.planeEnd ?? ""}
                      onChange={(event) => selectEndpoint("planeEnd", Number(event.target.value))}
                    >
                      <option value="" disabled>
                        Elige el momento
                      </option>
                      {AIRPLANE_EVENTS.map((event, index) => (
                        <option key={event.id} value={index}>
                          {index + 1}. {event.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div
                  className="av-intervals"
                  aria-label="Comparación de dos intervalos en la misma secuencia"
                >
                  <div className="av-interval-scale" aria-hidden="true">
                    {AIRPLANE_EVENTS.map((_, index) => (
                      <span key={index}>{index + 1}</span>
                    ))}
                  </div>
                  <div className="av-interval-row">
                    <strong>Tiempo de vuelo OACI</strong>
                    <div className="av-interval-track">
                      <span
                        className="av-band av-band--flight"
                        style={{ left: "20%", width: "80%" }}
                      >
                        Del primer movimiento para despegar a la detención final
                      </span>
                    </div>
                  </div>
                  <div className="av-interval-row">
                    <strong>Tiempo físicamente en el aire</strong>
                    <div className="av-interval-track">
                      <span className="av-band av-band--air" style={{ left: "60%", width: "20%" }}>
                        En el aire
                      </span>
                    </div>
                  </div>
                  <p>
                    Las bandas comparan los límites, no la duración real de cada momento. El
                    aterrizaje termina el tiempo en el aire; aún puede faltar rodaje de llegada.
                  </p>
                </div>
              </section>
              <button
                type="button"
                className="av-substep-next"
                onClick={() => {
                  setPlaneTask("purpose");
                  patch({ planeEvent: 1 });
                  setFeedback(null);
                }}
              >
                Ahora compara el propósito →
              </button>
            </>
          )}
          {planeTask === "purpose" && (
            <section className="av-purpose">
              <h2>El movimiento se parece. El propósito cambia.</h2>
              <div
                className="av-example-tabs"
                role="group"
                aria-label="Compara el propósito del movimiento"
              >
                {[
                  { id: "flight" as const, label: "Se mueve para salir a volar" },
                  { id: "hangar" as const, label: "Lo cambian de hangar" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={state.planePurpose === item.id}
                    onClick={() => {
                      patch({ planePurpose: item.id, planeEvent: 1 });
                      setFeedback(null);
                    }}
                  >
                    {item.label}
                    {state.purposeChoices[item.id] ===
                      (item.id === "flight" ? "counts" : "does-not-start") && " ✓"}
                  </button>
                ))}
              </div>
              <p>
                {state.planePurpose === "flight"
                  ? "Este es el primer movimiento con propósito de despegar."
                  : "Lo trasladan entre hangares, sin propósito de despegar."}
              </p>
              <Choices
                question="¿Este movimiento inicia el tiempo de vuelo estudiado?"
                options={[
                  "Sí: tiene el propósito de despegar.",
                  "No: no tiene el propósito de despegar.",
                ]}
                value={
                  state.purposeChoices[state.planePurpose] === "counts"
                    ? 0
                    : state.purposeChoices[state.planePurpose] === "does-not-start"
                      ? 1
                      : null
                }
                correct={state.planePurpose === "flight" ? 0 : 1}
                onChoose={(index) => {
                  const answer = index === 0 ? "counts" : "does-not-start";
                  patch({
                    purposeChoices: { ...state.purposeChoices, [state.planePurpose]: answer },
                  });
                  const good = (state.planePurpose === "flight" ? 0 : 1) === index;
                  say(
                    good
                      ? state.planePurpose === "flight"
                        ? "Sí: primer movimiento y propósito de despegar. Las dos condiciones importan."
                        : "Exacto. Hay movimiento, pero falta el propósito de despegar; este traslado no inicia el intervalo estudiado."
                      : "No basta con ver que se mueve. Lee el propósito: salir a volar y cambiarlo de hangar no son el mismo caso.",
                    good,
                  );
                }}
              />
            </section>
          )}
        </>
      )}

      {state.step === 3 && (
        <>
          <p className="av-scope">
            La misma referencia OACI; ahora aplicada a la operación de vuelo del helicóptero.
          </p>
          <div
            className="av-substeps"
            role="group"
            aria-label="Dos partes de la comparación del helicóptero"
          >
            <button
              type="button"
              aria-pressed={helicopterTask === "labels"}
              onClick={() => {
                setHelicopterTask("labels");
                setFeedback(null);
              }}
            >
              1. Conecta inicio y final{" "}
              {state.helicopterLabels.start === "rotor-start" &&
                state.helicopterLabels.end === "aircraft-and-rotor-stop" &&
                "✓"}
            </button>
            <button
              type="button"
              aria-pressed={helicopterTask === "condition"}
              onClick={() => {
                setHelicopterTask("condition");
                patch({ helicopterEvent: 3 });
                setFeedback(null);
              }}
            >
              2. ¿Qué condición falta? {state.helicopterMissing === 1 && "✓"}
            </button>
          </div>
          <div className="av-explain-layout">
            <figure className="av-figure">
              <OperationScene
                kind="helicopter"
                eventIndex={helicopterTask === "condition" ? 3 : state.helicopterEvent}
                motion={motion}
              />
              <button
                className="av-motion"
                type="button"
                aria-pressed={motion}
                onClick={() => setMotion((value) => !value)}
              >
                {motion ? "Pausar movimiento" : "Mostrar movimiento del rotor"}
              </button>
            </figure>
            <Guide feedback={feedback?.text} success={feedback?.success}>
              <p>
                Aquí el intervalo empieza cuando{" "}
                <strong>las palas comienzan a girar para esta operación de vuelo</strong>. Encender
                solo los sistemas no basta.
              </p>
              <p>
                Al terminar, la aeronave debe quedar finalmente detenida{" "}
                <strong>y las palas deben haberse parado</strong>. Mira ambas condiciones.
              </p>
              <p>
                {
                  HELICOPTER_EVENTS[helicopterTask === "condition" ? 3 : state.helicopterEvent]
                    .description
                }
              </p>
              <details>
                <summary>El contexto importa</summary>
                <p>
                  Esta definición se aplica al caso y a la operación de vuelo estudiados. No la
                  generalices a cualquier prueba de mantenimiento ni a registros bajo otra normativa
                  sin comprobar su regla.
                </p>
              </details>
            </Guide>
          </div>
          {helicopterTask === "labels" && (
            <>
              <EventControls
                labels={HELICOPTER_EVENTS.map((event) => event.label)}
                current={state.helicopterEvent}
                onSelect={(helicopterEvent) => {
                  patch({ helicopterEvent });
                  setFeedback(null);
                }}
              />
              <PhraseMap
                title="Completa el inicio y el final"
                options={HELICOPTER_OPTIONS}
                slots={HELICOPTER_SLOTS}
                answers={state.helicopterLabels}
                onPlace={(slot, value) => {
                  patch({ helicopterLabels: { ...state.helicopterLabels, [slot]: value } });
                  const good =
                    HELICOPTER_SLOTS.find((item) => item.id === slot)?.expected === value;
                  say(
                    good
                      ? slot === "start"
                        ? "El inicio está en el giro de las palas para el vuelo, aunque todavía esté en plataforma."
                        : "El final reúne las dos condiciones: aeronave finalmente detenida y palas detenidas."
                      : "Sigue el orden: primero empiezan a girar las palas; al final se detienen la aeronave y las palas.",
                    good,
                  );
                }}
              />
              <button
                type="button"
                className="av-substep-next"
                onClick={() => {
                  setHelicopterTask("condition");
                  patch({ helicopterEvent: 3 });
                  setFeedback(null);
                }}
              >
                Ahora observa qué falta →
              </button>
            </>
          )}
          {helicopterTask === "condition" && (
            <section className="av-missing">
              <h2>Observa la condición que falta</h2>
              <Choices
                question="Ya aterrizó y está detenido, pero las palas siguen girando. ¿Qué falta para que termine este tiempo de vuelo?"
                options={[
                  "Que vuelva a despegar.",
                  "Que las palas del rotor se detengan.",
                  "Que se apaguen todos los sistemas.",
                ]}
                value={state.helicopterMissing}
                correct={1}
                onChoose={(helicopterMissing) => {
                  patch({ helicopterMissing });
                  say(
                    [
                      "No necesita otro despegue. Revisa el final de la operación y el estado de las palas.",
                      "Todavía falta que se detengan las palas. Esa condición también forma parte del final.",
                      "La condición estudiada es la detención de las palas, no apagar todos los sistemas.",
                    ][helicopterMissing],
                    helicopterMissing === 1,
                  );
                }}
              />
            </section>
          )}
        </>
      )}

      {state.step === 4 && (
        <>
          <div
            className="av-example-tabs"
            role="group"
            aria-label="Tres casos para aplicar las ideas"
          >
            {CASES.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={currentCase === index}
                onClick={() => {
                  setCurrentCase(index);
                  setFeedback(null);
                }}
              >
                {index + 1}. {item.title}
                {state.cases[item.id] === item.correct && " ✓"}
              </button>
            ))}
          </div>
          <div className="av-explain-layout">
            <figure className="av-figure">
              {caseItem.event !== undefined &&
              (caseItem.kind === "airplane" || caseItem.kind === "helicopter") ? (
                <OperationScene kind={caseItem.kind} eventIndex={caseItem.event} motion={motion} />
              ) : (
                <AircraftIllustration kind={caseItem.kind} motion={motion} />
              )}
              <figcaption>{caseItem.context}</figcaption>
            </figure>
            <Guide
              feedback={
                feedback?.text ??
                (state.cases[caseItem.id] !== undefined
                  ? caseItem.feedback[state.cases[caseItem.id]]
                  : undefined)
              }
              success={feedback?.success ?? state.cases[caseItem.id] === caseItem.correct}
            >
              <p>
                Busca la pista en la imagen y en el contexto. No respondas solo por «tiene motor»,
                «se mueve» o «ya aterrizó».
              </p>
              <p>
                <strong>{caseItem.context}</strong>
              </p>
            </Guide>
          </div>
          <Choices
            question={caseItem.question}
            options={caseItem.options}
            value={state.cases[caseItem.id]}
            correct={caseItem.correct}
            onChoose={(index) => {
              patch({ cases: { ...state.cases, [caseItem.id]: index } });
              say(caseItem.feedback[index], index === caseItem.correct);
            }}
          />
          {casesReady ? (
            <PhraseMap
              title="Conecta las tres ideas para cerrar"
              options={CONCEPT_OPTIONS}
              slots={CONCEPT_SLOTS}
              answers={state.finalMap}
              onPlace={(slot, value) => placeConcept("finalMap", slot, value)}
            />
          ) : (
            <p className="av-next-map">
              Resuelve los tres casos para abrir el mapa final. Puedes cambiar de caso con los
              botones de arriba.
            </p>
          )}
          {state.finished && (
            <div className="av-completed" role="status">
              <img src="/lp/visual/pathy.png" alt="Pathy celebra tu avance" />
              <div>
                <h2>Ahora las tres ideas están claras.</h2>
                <p>
                  Aeronave identifica la máquina; estar en el aire describe su condición; tiempo de
                  vuelo es el intervalo definido que acabas de comparar.
                </p>
                <p>Tu recorrido está completado. Puedes volver a cualquier escena para repasar.</p>
              </div>
            </div>
          )}
          {ready && !allReady && !state.finished && (
            <p className="av-review-notice">
              Antes de cerrar, revisa las escenas con alguna relación pendiente:{" "}
              {AIRCRAFT_SCENES.filter((_, index) => !aircraftSceneReady(index, state)).join(" · ")}.
            </p>
          )}
        </>
      )}

      <details className="av-sources">
        <summary>Fuentes y alcance</summary>
        <p>
          Definiciones y contexto de estudio. El intervalo de tiempo de vuelo no sustituye todas las
          posibles definiciones legales de «en vuelo».
        </p>
        <ul>
          {document.sources?.map((source) => (
            <li key={source.id}>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>
              ) : (
                <strong>{source.title}</strong>
              )}
              {source.verified_locators?.length && (
                <span>{source.verified_locators.join("; ")}</span>
              )}
              {source.limit && <small>{source.limit}</small>}
            </li>
          ))}
        </ul>
      </details>
      <footer className="av-footer">
        <div
          className="av-pathy"
          key={`${state.step}:${ready}:${state.finished}`}
          data-state={state.finished ? "celebrating" : ready ? "success" : "observing"}
        >
          <img src="/lp/visual/pathy.png" alt="Pathy acompaña tu recorrido" />
          <p>
            {state.finished
              ? "Puedes repasar a tu ritmo."
              : ready
                ? "Ya conectaste esta idea."
                : taskHint}
          </p>
        </div>
        <div className="av-navigation">
          <button
            type="button"
            disabled={state.step === 0}
            onClick={() => navigate(state.step - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            className="av-primary"
            disabled={!hydrated || !canContinue || (state.step === 4 && state.finished)}
            onClick={advance}
          >
            {state.step === 4
              ? state.finished
                ? "Recorrido completado"
                : "Completar recorrido"
              : "Continuar"}
          </button>
        </div>
      </footer>
    </section>
  );
}
