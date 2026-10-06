import documentsJson from "./documents.json";
import publicationReviewJson from "./publication-review.json";
import { APPROVED_AIRCRAFT_CATALOG, APPROVED_AIRCRAFT_FIRST_BLOCK_IDS } from "./catalog";
import type { HandbookFigure, HandbookLearningPathDocument } from "../handbook-types";
import { validateApprovedAircraftTeachingBoard } from "./teaching-board";

export interface AircraftPublicationReview {
  id: string;
  curriculumVersion: string;
  /** Digest of the captured NotebookLM explanation used in the editorial review.
   * Raw NotebookLM artifacts and private source URLs remain outside the app bundle. */
  notebooklmExplanationSha256: string;
  scopeReviewed: boolean;
  visualsReviewed: boolean;
  assessmentReviewed: boolean;
}

const nonblank = (value: unknown): value is string =>
  typeof value === "string" && Boolean(value.trim());
const textList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every(nonblank);
const permutation = (value: unknown, count: number): boolean =>
  Array.isArray(value) &&
  value.length === count &&
  new Set(value).size === count &&
  value.every((index) => Number.isInteger(index) && index >= 0 && index < count);
const privateSource =
  /(?:drive|docs|notebooklm|notebook)\.google\.|sourceDraftId|draftId|graphicsBrief/i;

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const percent = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
function usableFigure(figure: HandbookFigure): boolean {
  if (
    !figure ||
    !nonblank(figure.number) ||
    !nonblank(figure.alt) ||
    !nonblank(figure.file) ||
    figure.file.includes("..") ||
    !/^\/?[a-zA-Z0-9_./-]+\.(?:svg|png|jpe?g|webp)$/.test(figure.file)
  )
    return false;
  const extra = figure as HandbookFigure & { heading?: unknown; crop?: unknown; focus?: unknown };
  if (extra.heading !== undefined && !nonblank(extra.heading)) return false;
  let crop: { x: number; y: number; width: number; height: number } | undefined;
  if (extra.crop !== undefined) {
    const candidate = extra.crop;
    if (
      !record(candidate) ||
      !percent(candidate.x) ||
      !percent(candidate.y) ||
      !percent(candidate.width) ||
      !percent(candidate.height) ||
      candidate.width <= 0 ||
      candidate.height <= 0 ||
      candidate.x + candidate.width > 100 ||
      candidate.y + candidate.height > 100 ||
      typeof candidate.assetAspectRatio !== "number" ||
      !Number.isFinite(candidate.assetAspectRatio) ||
      candidate.assetAspectRatio <= 0 ||
      !Number.isFinite(10000 / candidate.width) ||
      !Number.isFinite((candidate.assetAspectRatio * candidate.width) / candidate.height)
    )
      return false;
    crop = { x: candidate.x, y: candidate.y, width: candidate.width, height: candidate.height };
  }
  if (extra.focus !== undefined) {
    const focus = extra.focus;
    if (!record(focus) || !nonblank(focus.label) || !percent(focus.x) || !percent(focus.y))
      return false;
    if (
      crop &&
      (focus.x < crop.x ||
        focus.x > crop.x + crop.width ||
        focus.y < crop.y ||
        focus.y > crop.y + crop.height)
    )
      return false;
  }
  return true;
}

/** Fail closed on malformed authored JSON before it can reach the native renderer.
 * Asset existence and source/explanation review are additionally checked before release. */
function usableDocument(document: HandbookLearningPathDocument, title: string): boolean {
  if (
    !document ||
    document.title !== title ||
    !nonblank(document.intro) ||
    !textList(document.objectives) ||
    !textList(document.completionChecks) ||
    !Array.isArray(document.sources) ||
    !document.sources.length ||
    !Array.isArray(document.questions) ||
    !Array.isArray(document.figures) ||
    document.figures.some((figure) => !usableFigure(figure)) ||
    new Set(document.figures.map((figure) => figure.number)).size !== document.figures.length ||
    !Array.isArray(document.stages) ||
    document.stages.length < 4 ||
    privateSource.test(JSON.stringify(document))
  )
    return false;
  if (
    document.sources.some(
      (source) =>
        !source ||
        !nonblank(source.id) ||
        !nonblank(source.title) ||
        !nonblank(source.role) ||
        (!textList(source.verified_locators) && !/^https:\/\//.test(source.url ?? "")),
    )
  )
    return false;
  if (
    document.questions.some(
      (question) =>
        !question ||
        !nonblank(question.prompt) ||
        !nonblank(question.feedback) ||
        !textList(question.options) ||
        question.options.length < 2 ||
        !Number.isInteger(question.correct) ||
        question.correct < 0 ||
        question.correct >= question.options.length ||
        !permutation(question.order, question.options.length),
    )
  )
    return false;

  const exerciseFigures = (
    document as HandbookLearningPathDocument & { exerciseFigures?: HandbookFigure[] }
  ).exerciseFigures;
  if (
    exerciseFigures !== undefined &&
    (!Array.isArray(exerciseFigures) ||
      !exerciseFigures.length ||
      exerciseFigures.some((figure) => !usableFigure(figure)) ||
      new Set(exerciseFigures.map((figure) => figure.number)).size !== exerciseFigures.length ||
      !document.stages.some((stage) => stage?.kind === "exercise"))
  )
    return false;

  let explanationCount = 0;
  let assessmentCount = 0;
  const reachedQuestions = new Set<number>();
  for (const [index, stage] of document.stages.entries()) {
    if (!stage || !nonblank(stage.nav)) return false;
    if (index === 0 && stage.kind !== "intro") return false;
    if (index === document.stages.length - 1 && stage.kind !== "finish") return false;
    if (stage.kind === "intro") {
      if (index !== 0) return false;
    } else if (stage.kind === "finish") {
      if (index !== document.stages.length - 1) return false;
    } else if (stage.kind === "content") {
      // A legacy-style stage stays focused. An explicit board can compare related
      // source cards together only when every card is paired to a reviewed visual.
      if (
        !nonblank(stage.title) ||
        !Array.isArray(stage.cards) ||
        !stage.cards.length ||
        (stage.board === undefined &&
          stage.propellerDiagram === undefined &&
          stage.cards.length !== 1) ||
        stage.cards.some((card) => !card || !nonblank(card.title) || !nonblank(card.text)) ||
        !Array.isArray(stage.figures) ||
        !stage.figures.length ||
        stage.figures.some((figure) => {
          if (!usableFigure(figure)) return true;
          const canonical = document.figures.find(
            (candidate) => candidate.number === figure.number,
          );
          if (!canonical) return false;
          // The native renderer prefers the canonical figure. Never silently lose a
          // stage-specific focus/crop or substitute a different unreviewed visual.
          return ["file", "alt", "observe", "caption", "heading", "focus", "crop"].some(
            (key) =>
              JSON.stringify((canonical as unknown as Record<string, unknown>)[key]) !==
              JSON.stringify((figure as unknown as Record<string, unknown>)[key]),
          );
        })
      )
        return false;
      if (
        stage.board !== undefined &&
        validateApprovedAircraftTeachingBoard(stage, stage.board).length
      )
        return false;
      if (stage.propellerDiagram !== undefined) {
        const figure = stage.figures[0] as HandbookFigure & {
          crop?: unknown;
          assetAspectRatio?: unknown;
        };
        if (
          document.number !== 9 ||
          !["geometry", "pitch", "forces"].includes(stage.propellerDiagram) ||
          stage.figures.length !== 1 ||
          stage.board !== undefined ||
          figure.file !== "/ciaac-approved/engine-systems/propeller-fixed-master.webp" ||
          figure.crop !== undefined ||
          figure.assetAspectRatio !== 1.5
        )
          return false;
      }
      explanationCount++;
    } else if (stage.kind === "quiz") {
      if (
        !Array.isArray(stage.questions) ||
        !stage.questions.length ||
        stage.questions.some(
          (question) =>
            !Number.isInteger(question) || question < 0 || question >= document.questions.length,
        )
      )
        return false;
      stage.questions.forEach((question) => reachedQuestions.add(question));
      if (!stage.diagnostic) {
        if (!explanationCount) return false;
        assessmentCount++;
      }
    } else if (stage.kind === "exercise") {
      const exercise = document.exercise;
      if (
        !explanationCount ||
        !exercise ||
        !nonblank(exercise.title) ||
        !nonblank(exercise.instruction)
      )
        return false;
      if (exercise.kind === "match") {
        if (
          !Array.isArray(exercise.pairs) ||
          exercise.pairs.length < 2 ||
          exercise.pairs.some(
            (pair) => !Array.isArray(pair) || pair.length !== 2 || !pair.every(nonblank),
          ) ||
          !permutation(exercise.order, exercise.pairs.length)
        )
          return false;
      } else if (exercise.kind === "sequence") {
        if (
          !textList(exercise.items) ||
          exercise.items.length < 2 ||
          !permutation(exercise.order, exercise.items.length)
        )
          return false;
      } else return false;
      assessmentCount++;
    } else return false;
  }
  return (
    explanationCount > 0 &&
    assessmentCount > 0 &&
    reachedQuestions.size === document.questions.length
  );
}

/** A catalog title or legacy document alone can never make a new LP available. */
export function collectReadyApprovedAircraftDocuments(
  documents: Readonly<Record<string, HandbookLearningPathDocument>>,
  reviews: readonly AircraftPublicationReview[],
): Record<string, HandbookLearningPathDocument> {
  const ready: Record<string, HandbookLearningPathDocument> = {};
  for (const lesson of APPROVED_AIRCRAFT_CATALOG.lessons) {
    const document = documents?.[lesson.id];
    const matches = Array.isArray(reviews)
      ? reviews.filter((entry) => entry?.id === lesson.id)
      : [];
    const review = matches[0];
    if (
      matches.length !== 1 ||
      !document ||
      !review ||
      review.curriculumVersion !== APPROVED_AIRCRAFT_CATALOG.curriculumVersion ||
      !/^[a-f0-9]{64}$/.test(review.notebooklmExplanationSha256) ||
      review.scopeReviewed !== true ||
      review.visualsReviewed !== true ||
      review.assessmentReviewed !== true ||
      !usableDocument(document, lesson.title)
    )
      continue;
    ready[lesson.id] = document;
  }
  return ready;
}

const reviewed = collectReadyApprovedAircraftDocuments(
  documentsJson as Record<string, HandbookLearningPathDocument>,
  publicationReviewJson as AircraftPublicationReview[],
);

/** Switch the displayed subject only when the entire first approved block is ready. */
export const APPROVED_AIRCRAFT_ACTIVE = APPROVED_AIRCRAFT_FIRST_BLOCK_IDS.every(
  (id) => reviewed[id],
);
export const APPROVED_AIRCRAFT_CONTENT = APPROVED_AIRCRAFT_ACTIVE ? reviewed : {};
export const APPROVED_AIRCRAFT_READY_IDS = Object.keys(APPROVED_AIRCRAFT_CONTENT);
