import type { HandbookJourneyState } from "@/components/lp/HandbookLearningPath";

export const AIRCRAFT_HANDBOOK_VERSION = "ciaac-aircraft-handbook-v3";
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const index = (value: unknown, max: number): value is number =>
  Number.isInteger(value) && Number(value) >= 0 && Number(value) <= max;

/** No old question/scene indexes are reused: their meanings changed. Keep the exact
 * previous journey (including its own history), and retain all completed review access.
 * This changes only this lesson's inner journey, never account completion or rewards. */
export function migrateAircraftHandbookJourney(
  saved: unknown,
  completed: boolean,
  fresh: HandbookJourneyState,
): HandbookJourneyState {
  const state = { ...fresh, version: AIRCRAFT_HANDBOOK_VERSION };
  if (!record(saved) || saved.version !== AIRCRAFT_HANDBOOK_VERSION) {
    const finished =
      completed || (record(saved) && (saved.finished === true || saved.complete === true));
    return {
      ...state,
      complete: finished,
      maxStage: finished ? 9 : 0,
      migrationNotice: saved != null && !finished,
      ...(saved != null ? { previousJourney: saved } : {}),
    };
  }
  const finished = completed || saved.complete === true;
  const maxStage = finished ? 9 : index(saved.maxStage, 9) ? saved.maxStage : 0;
  const answers: Record<string, number> = {};
  if (record(saved.answers)) {
    for (let i = 0; i < 5; i++) {
      const value = saved.answers[String(i)];
      if (index(value, i === 0 ? 2 : 1)) answers[String(i)] = value;
    }
  }
  const pairs: Record<string, number> = {};
  if (record(saved.exercise) && record(saved.exercise.pairs)) {
    const used = new Set<number>();
    for (let i = 0; i < 4; i++) {
      const value = saved.exercise.pairs[String(i)];
      if (index(value, 3) && !used.has(value)) {
        pairs[String(i)] = value;
        used.add(value);
      }
    }
  }
  return {
    ...state,
    complete: finished,
    stage: index(saved.stage, maxStage) ? saved.stage : 0,
    maxStage,
    answers,
    checks: fresh.checks.map((_, i) => Array.isArray(saved.checks) && saved.checks[i] === true),
    exerciseDone: saved.exerciseDone === true && [0, 1, 2, 3].every((i) => pairs[String(i)] === i),
    exercise: {
      ...fresh.exercise,
      pairs,
      selectedLeft:
        record(saved.exercise) && index(saved.exercise.selectedLeft, 3)
          ? saved.exercise.selectedLeft
          : null,
    },
    migrationNotice: saved.migrationNotice === true && maxStage === 0,
    ...(Object.hasOwn(saved, "previousJourney") ? { previousJourney: saved.previousJourney } : {}),
  };
}
