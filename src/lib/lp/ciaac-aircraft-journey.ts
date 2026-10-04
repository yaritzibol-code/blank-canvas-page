/** State for the first CIAAC lesson only. Other learning paths keep their existing journeys. */
export const AIRCRAFT_LP_ID =
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/aeronave-en-vuelo-1";

export const AIRCRAFT_SCENES: string[] = [
  "Qué hace que sea una aeronave",
  "La misma máquina, distintos momentos",
  "El avión: dónde empieza y termina",
  "El helicóptero: la condición que falta",
  "Usa las ideas",
];

export interface AircraftJourney {
  version: "ciaac-aircraft-v2";
  step: number;
  maxStep: number;
  done: [boolean, boolean, boolean, boolean, boolean];
  finished: boolean;
  selectedAircraft: "airplane" | "helicopter" | "glider" | "balloon" | "hovercraft";
  classified: Record<string, string>;
  machineMoment: number;
  conceptMatches: Record<string, string>;
  planeEvent: number;
  planeStart: number | null;
  planeEnd: number | null;
  planePurpose: "flight" | "hangar";
  purposeChoices: Record<string, string>;
  helicopterEvent: number;
  helicopterLabels: Record<string, string>;
  helicopterMissing: number | null;
  cases: Record<string, number>;
  finalMap: Record<string, string>;
  migrationNotice: boolean;
  previousJourney?: unknown;
}

export function freshAircraftJourney(): AircraftJourney {
  return {
    version: "ciaac-aircraft-v2",
    step: 0,
    maxStep: 0,
    done: [false, false, false, false, false],
    finished: false,
    selectedAircraft: "airplane",
    classified: {},
    machineMoment: 0,
    conceptMatches: {},
    planeEvent: 1,
    planeStart: null,
    planeEnd: null,
    planePurpose: "flight",
    purposeChoices: {},
    helicopterEvent: 1,
    helicopterLabels: {},
    helicopterMissing: null,
    cases: {},
    finalMap: {},
    migrationNotice: false,
  };
}

const aircraft = ["airplane", "helicopter", "glider", "balloon", "hovercraft"] as const;
const conceptKeys = ["machine", "condition", "interval"] as const;
const lastScene = AIRCRAFT_SCENES.length - 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function counter(value: unknown, maximum: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(0, Math.trunc(value)))
    : fallback;
}

/** An invalid answer is unanswered, rather than clamped into a possibly correct choice. */
function answerIndex(value: unknown, maximum: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= maximum
    ? value
    : null;
}

function answerMap(
  value: unknown,
  keys: readonly string[],
  choices: readonly string[],
): Record<string, string> {
  if (!isRecord(value)) return {};
  const result: Record<string, string> = {};
  for (const key of keys) {
    if (
      Object.hasOwn(value, key) &&
      typeof value[key] === "string" &&
      choices.includes(value[key])
    ) {
      result[key] = value[key];
    }
  }
  return result;
}

function caseAnswers(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const result: Record<string, number> = {};
  for (const key of ["glider", "taxi", "rotor"]) {
    if (!Object.hasOwn(value, key)) continue;
    const answer = answerIndex(value[key], 2);
    if (answer !== null) result[key] = answer;
  }
  return result;
}

function finishedReview(state: AircraftJourney): AircraftJourney {
  return { ...state, finished: true, maxStep: lastScene, done: [true, true, true, true, true] };
}

/**
 * Migrate only the lesson's inner journey, without account/store writes or rewards.
 * Legacy indexes belong to different activities and must never select these new scenes.
 * An incomplete legacy journey intentionally restarts the new pedagogy at scene zero,
 * retaining the exact old value in previousJourney for review. Account started/completed
 * status is untouched. Completed accounts or legacy journeys retain finished review access.
 */
export function migrateAircraftJourney(saved: unknown, completed: boolean): AircraftJourney {
  const fresh = freshAircraftJourney();
  if (!isRecord(saved) || saved.version !== fresh.version) {
    const legacyComplete = isRecord(saved) && saved.complete === true;
    const finished = completed || legacyComplete;
    const hasPrevious = saved !== null && saved !== undefined;
    const state: AircraftJourney = {
      ...fresh,
      migrationNotice: hasPrevious && !finished,
      ...(hasPrevious ? { previousJourney: saved } : {}),
    };
    return finished ? finishedReview(state) : state;
  }

  const maxStep = counter(saved.maxStep, lastScene, fresh.maxStep);
  const selectedAircraft = aircraft.find((item) => item === saved.selectedAircraft);
  const done = Array.isArray(saved.done) ? saved.done : [];
  const state: AircraftJourney = {
    ...fresh,
    step: Math.min(counter(saved.step, lastScene, fresh.step), maxStep),
    maxStep,
    done: [
      done[0] === true,
      done[1] === true,
      done[2] === true,
      done[3] === true,
      done[4] === true,
    ],
    selectedAircraft: selectedAircraft ?? fresh.selectedAircraft,
    classified: answerMap(saved.classified, aircraft, ["aircraft", "excluded"]),
    machineMoment: counter(saved.machineMoment, 2, fresh.machineMoment),
    conceptMatches: answerMap(saved.conceptMatches, conceptKeys, conceptKeys),
    planeEvent: counter(saved.planeEvent, 5, fresh.planeEvent),
    planeStart: answerIndex(saved.planeStart, 5),
    planeEnd: answerIndex(saved.planeEnd, 5),
    planePurpose: saved.planePurpose === "hangar" ? "hangar" : "flight",
    purposeChoices: answerMap(
      saved.purposeChoices,
      ["flight", "hangar"],
      ["counts", "does-not-start"],
    ),
    helicopterEvent: counter(saved.helicopterEvent, 4, fresh.helicopterEvent),
    helicopterLabels: answerMap(
      saved.helicopterLabels,
      ["start", "end"],
      ["rotor-start", "aircraft-and-rotor-stop"],
    ),
    helicopterMissing: answerIndex(saved.helicopterMissing, 2),
    cases: caseAnswers(saved.cases),
    finalMap: answerMap(saved.finalMap, conceptKeys, conceptKeys),
    migrationNotice: saved.migrationNotice === true,
    ...(Object.hasOwn(saved, "previousJourney") ? { previousJourney: saved.previousJourney } : {}),
  };
  return completed || saved.finished === true ? finishedReview(state) : state;
}

const conceptsReady = (answers: Record<string, string>) =>
  conceptKeys.every((key) => Object.hasOwn(answers, key) && answers[key] === key);

/** Objective gates only; the renderer separately permits navigation for finished review. */
export function aircraftSceneReady(step: number, state: AircraftJourney): boolean {
  switch (step) {
    case 0:
      return aircraft.every(
        (key) =>
          Object.hasOwn(state.classified, key) &&
          state.classified[key] === (key === "hovercraft" ? "excluded" : "aircraft"),
      );
    case 1:
      return conceptsReady(state.conceptMatches);
    case 2:
      return (
        state.planeStart === 1 &&
        state.planeEnd === 5 &&
        state.purposeChoices.flight === "counts" &&
        state.purposeChoices.hangar === "does-not-start"
      );
    case 3:
      return (
        state.helicopterLabels.start === "rotor-start" &&
        state.helicopterLabels.end === "aircraft-and-rotor-stop" &&
        state.helicopterMissing === 1
      );
    case 4:
      return (
        state.cases.glider === 1 &&
        state.cases.taxi === 0 &&
        state.cases.rotor === 2 &&
        conceptsReady(state.finalMap)
      );
    default:
      return false;
  }
}
