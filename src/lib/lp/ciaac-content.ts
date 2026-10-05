import reviewedAerodynamics from "./ciaac-aerodynamics.content.json";
import { moduleOneHandbook } from "./ciaac-module-one-handbook";
import { aircraftHandbook } from "./ciaac-aircraft-handbook";
import { AIRCRAFT_LP_ID } from "./ciaac-aircraft-journey";
import contentJson from "./ciaac-module1.content.json";
import type { CiaacModuleContent, CiaacLessonContent } from "./ciaac-content-types";
import type { HandbookLearningPathDocument, HandbookStage } from "./handbook-types";

/** Complete teaching content, with public bibliographic references only. */
export const CIAAC_MODULE_ONE_CONTENT = contentJson as unknown as CiaacModuleContent;

function toLearningPath(lesson: CiaacLessonContent): HandbookLearningPathDocument {
  const source = lesson.document;
  const stages: HandbookStage[] = [];
  const assessed = new Set(
    lesson.activities.flatMap((activity) => activity.runtimeMapping.questions ?? []),
  );
  const preflight = source.stages.find((stage) => stage.kind === "quiz");
  if (preflight?.kind === "quiz") preflight.questions.forEach((index) => assessed.add(index));
  let activitiesAdded = false;
  source.stages.forEach((stage, originalStageIndex) => {
    if (stage.kind === "exercise" || (stage.kind === "quiz" && stage !== preflight)) {
      if (!activitiesAdded) {
        lesson.activities.forEach((activity, activityIndex) => {
          stages.push({ kind: "activity", nav: activity.title, activityIndex });
        });
        const remaining = source.questions
          .map((_, index) => index)
          .filter((index) => !assessed.has(index));
        if (remaining.length)
          stages.push({ kind: "quiz", nav: "Afina tu explicación", questions: remaining });
        activitiesAdded = true;
      }
      return;
    }
    if (stage.kind === "content") {
      stages.push({ ...stage, visualStage: originalStageIndex });
    } else if (stage === preflight && stage.kind === "quiz") {
      // First predict, then learn: this initial choice is diagnostic, not a mastery gate.
      stages.push({ ...stage, nav: "Antes de explorar", diagnostic: true });
    } else stages.push(stage);
  });
  const document: HandbookLearningPathDocument = {
    ...source,
    questions: source.questions.map((question) => ({
      ...question,
      prompt: question.prompt.replaceAll("diagrama imaginado", "diagrama"),
    })),
    stages,
    completionChecks: lesson.completionChecks,
    sourceLabel: "CIAAC · Aerodinámica",
    chapterLabel: "Módulo",
    sources: lesson.sourceRefs.map((id) => ({ id, ...CIAAC_MODULE_ONE_CONTENT.sources[id] })),
    ciaac: { lessonNumber: source.number, activities: lesson.activities },
  };
  return lesson.id === AIRCRAFT_LP_ID ? aircraftHandbook(document) : moduleOneHandbook(document);
}

export const CIAAC_LEARNING_PATHS: Record<string, HandbookLearningPathDocument> = {
  ...Object.fromEntries(
    CIAAC_MODULE_ONE_CONTENT.lessons.map((lesson) => [lesson.id, toLearningPath(lesson)]),
  ),
  ...Object.fromEntries(
    Object.entries(
      reviewedAerodynamics as unknown as Record<string, HandbookLearningPathDocument>,
    ).map(([id, document]) => [
      id,
      { ...document, ciaac: undefined } as unknown as HandbookLearningPathDocument,
    ]),
  ),
};
