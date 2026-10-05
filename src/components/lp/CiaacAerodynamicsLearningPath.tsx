import { CiaacAerodynamicsModulesSixSevenVisual } from "./CiaacAerodynamicsModulesSixSevenVisual";
import { CiaacAerodynamicsModuleEightVisual } from "./CiaacAerodynamicsModuleEightVisual";
import { CiaacAerodynamicsModulesFourFiveVisual } from "./CiaacAerodynamicsModulesFourFiveVisual";
import { useMemo, type ComponentProps } from "react";
import { HandbookLearningPath } from "./HandbookLearningPath";
import { CiaacAerodynamicsVisual } from "./CiaacAerodynamicsVisual";
import { migrateAerodynamicsJourney } from "@/lib/lp/ciaac-aerodynamics-journey";
import "./ciaac-aircraft-handbook.css";

/** Shared native Handbook presentation; content is registered only after review. */
export function CiaacAerodynamicsLearningPath(
  props: Omit<ComponentProps<typeof HandbookLearningPath>, "presentation">,
) {
  const { document } = props;
  const presentation = useMemo(
    () => ({
      className: "aircraft-handbook ciaac-aerodynamics-handbook",
      visual: (stage: number) => {
        const current = document.stages[stage];
        if (document.chapter === 6 || document.chapter === 7)
          return (
            <CiaacAerodynamicsModulesSixSevenVisual
              module={document.chapter}
              lesson={document.number}
              stage={stage}
              nav={current.nav}
              kind={current.kind}
            />
          );
        if (document.chapter === 8)
          return (
            <CiaacAerodynamicsModuleEightVisual
              module={document.chapter}
              lesson={document.number}
              stage={stage}
              nav={current.nav}
              kind={current.kind}
            />
          );
        if (document.chapter === 4 || document.chapter === 5)
          return (
            <CiaacAerodynamicsModulesFourFiveVisual
              module={document.chapter}
              lesson={document.number}
              stage={stage}
              nav={current.nav}
              kind={current.kind}
            />
          );
        return (
          <CiaacAerodynamicsVisual
            module={document.chapter}
            lesson={document.number}
            stage={stage}
            nav={current.nav}
            kind={current.kind}
          />
        );
      },
      migrate: (
        saved: unknown,
        completed: boolean,
        fresh: Parameters<typeof migrateAerodynamicsJourney>[3],
      ) => migrateAerodynamicsJourney(document, saved, completed, fresh),
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
