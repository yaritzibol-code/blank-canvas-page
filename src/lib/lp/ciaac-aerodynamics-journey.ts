import type { HandbookJourneyState } from "@/components/lp/HandbookLearningPath";
import type { HandbookLearningPathDocument } from "./handbook-types";
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const index = (value: unknown, length: number): value is number =>
  Number.isInteger(value) && Number(value) >= 0 && Number(value) < length;

/** Preserve the original journey for audit and completed review access, without
 * translating activity/question indexes whose meanings have changed. */
export function migrateAerodynamicsJourney(
  document: HandbookLearningPathDocument,
  saved: unknown,
  completed: boolean,
  fresh: HandbookJourneyState,
): HandbookJourneyState {
  const version = `ciaac-aerodynamics-${document.chapter}-${document.number}-v1`;
  const finished =
    completed || (record(saved) && (saved.complete === true || saved.finished === true));
  const last = document.stages.length - 1;
  const state = { ...fresh, version, complete: finished, maxStage: finished ? last : 0 };
  if (!record(saved) || saved.version !== version)
    return {
      ...state,
      migrationNotice: saved != null && !finished,
      ...(saved != null ? { previousJourney: saved } : {}),
    };
  const maxStage = finished
    ? last
    : index(saved.maxStage, document.stages.length)
      ? saved.maxStage
      : 0;
  const answers: Record<string, number> = {};
  if (record(saved.answers))
    document.questions.forEach((question, i) => {
      const value = (saved.answers as Record<string, unknown>)[String(i)];
      if (index(value, question.options.length)) answers[String(i)] = value;
    });
  const pairs: Record<string, number> = {};
  const exercise = document.exercise;
  const pairCount = exercise?.kind === "match" ? exercise.pairs.length : 0;
  if (record(saved.exercise) && record(saved.exercise.pairs)) {
    const used = new Set<number>();
    for (let i = 0; i < pairCount; i++) {
      const value = saved.exercise.pairs[String(i)];
      if (index(value, pairCount) && !used.has(value)) {
        pairs[String(i)] = value;
        used.add(value);
      }
    }
  }
  const sequenceCount = exercise?.kind === "sequence" ? exercise.items.length : 0;
  const sequence: number[] = [];
  if (record(saved.exercise) && Array.isArray(saved.exercise.sequence))
    for (const value of saved.exercise.sequence)
      if (index(value, sequenceCount) && !sequence.includes(value)) sequence.push(value);
  return {
    ...state,
    maxStage,
    stage: index(saved.stage, maxStage + 1) ? saved.stage : 0,
    answers,
    checks: fresh.checks.map((_, i) => Array.isArray(saved.checks) && saved.checks[i] === true),
    exercise: {
      ...fresh.exercise,
      pairs,
      sequence,
      selectedLeft:
        record(saved.exercise) && index(saved.exercise.selectedLeft, pairCount)
          ? saved.exercise.selectedLeft
          : null,
    },
    exerciseDone:
      (pairCount > 0 &&
        Array.from({ length: pairCount }, (_, i) => pairs[String(i)] === i).every(Boolean)) ||
      (sequenceCount > 0 &&
        sequence.length === sequenceCount &&
        sequence.every((value, i) => value === i)),
    migrationNotice: saved.migrationNotice === true && maxStage === 0,
    ...(Object.hasOwn(saved, "previousJourney") ? { previousJourney: saved.previousJourney } : {}),
  };
}
