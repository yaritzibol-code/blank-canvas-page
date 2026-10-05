import { AeroConceptVisual, hasAeroConcept } from "./AeroConceptVisual";
import { BoundaryFlowMedia, BoundaryFlowVideo } from "./BoundaryFlowMedia";
import { useMemo, type ComponentProps } from "react";
import { HandbookLearningPath } from "./HandbookLearningPath";
import { CiaacModuleOneHandbookVisual } from "./CiaacModuleOneHandbookVisual";
import { migrateModuleOneHandbookJourney } from "@/lib/lp/ciaac-module-one-handbook-journey";
import "./ciaac-aircraft-handbook.css";
import "./ciaac-module-one-handbook.css";

export function CiaacModuleOneLearningPath(
  props: Omit<ComponentProps<typeof HandbookLearningPath>, "presentation">,
) {
  const { document } = props;
  const presentation = useMemo(
    () => ({
      className: "aircraft-handbook ciaac-module-one-handbook",
      visual: (stage: number) => {
        const current = document.stages[stage];
        if (current.kind === "content" && hasAeroConcept(1, document.number, current.nav))
          return (
            <AeroConceptVisual
              key={stage}
              module={1}
              lesson={document.number}
              nav={current.nav}
              kind={current.kind}
            />
          );
        // Group 1 ("Orden y mezcla") contains the laminar/turbulent definitions.
        if (document.number === 3 && current.kind === "content" && current.visualStage === 1)
          return <BoundaryFlowMedia />;
        return current.kind === "content" && current.visualStage !== undefined ? (
          <CiaacModuleOneHandbookVisual lesson={document.number} group={current.visualStage} />
        ) : null;
      },
      afterStage: (stage: number) =>
        document.number === 3 && document.stages[stage].kind === "finish" ? (
          <BoundaryFlowVideo />
        ) : null,
      migrate: (
        saved: unknown,
        completed: boolean,
        fresh: Parameters<typeof migrateModuleOneHandbookJourney>[3],
      ) => migrateModuleOneHandbookJourney(document, saved, completed, fresh),
    }),
    [document],
  );
  return (
    <HandbookLearningPath
      key={`${props.userId}:${props.lpId}`}
      {...props}
      presentation={presentation}
    />
  );
}
