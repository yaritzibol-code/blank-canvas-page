import { HandbookLearningPath } from "./HandbookLearningPath";
import { CiaacAircraftLearningPath } from "./CiaacAircraftLearningPath";
import { CiaacModuleOneLearningPath } from "./CiaacModuleOneLearningPath";
import { CiaacAerodynamicsLearningPath } from "./CiaacAerodynamicsLearningPath";
import { CiaacApprovedAircraftLearningPath } from "./CiaacApprovedAircraftLearningPath";
import { CiaacAircraftEnginesLearningPath } from "./CiaacAircraftEnginesLearningPath";
import { LearningPathExperience } from "./LearningPathExperience";
import type { ReviewPayload } from "@/lib/lp/admin-review-types";

const renderers = {
  handbook: HandbookLearningPath,
  aircraft: CiaacAircraftLearningPath,
  "module-one": CiaacModuleOneLearningPath,
  aerodynamics: CiaacAerodynamicsLearningPath,
  "approved-aircraft": CiaacApprovedAircraftLearningPath,
  "aircraft-engines": CiaacAircraftEnginesLearningPath,
};
const noCompletion = () => {};

/** No real user ID, progress hooks, completion/reward actions, or journey migration. */
export function AdminReviewLearningPath({
  selected,
  onExit,
}: {
  selected: NonNullable<ReviewPayload["selected"]>;
  onExit: () => void;
}) {
  const { item, document } = selected;
  const [categoryId, subjectId, chapterId] = item.id.split("/");
  const Renderer = renderers[item.renderer];
  return (
    <LearningPathExperience
      key={item.id}
      reviewOnly
      appearance={categoryId === "ciaac" ? "conceptual" : undefined}
      identity={{
        category: item.category,
        subject: item.subject,
        chapter: item.chapter,
        title: item.title,
        id: item.id,
        categoryId,
        subjectId,
        chapterId,
      }}
      user={null}
      onBack={onExit}
      onYaris={noCompletion}
    >
      <Renderer
        key={item.id}
        reviewOnly
        document={document}
        userId="admin-review"
        lpId={item.id}
        completed={false}
        onComplete={noCompletion}
        completionAction={{ label: "Salir de la revisión", onContinue: onExit }}
      />
    </LearningPathExperience>
  );
}
