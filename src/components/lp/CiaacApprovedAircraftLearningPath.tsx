import { useMemo, type ComponentProps } from "react";
import type { HandbookFigure } from "@/lib/lp/handbook-types";
import { HandbookLearningPath } from "./HandbookLearningPath";
import {
  ApprovedAircraftIllustration,
  type ApprovedAircraftFigure,
} from "./ApprovedAircraftIllustration";
import { migrateApprovedAircraftJourney } from "@/lib/lp/ciaac-aircraft-approved/journey";
import "./ciaac-aircraft-handbook.css";
import "./ciaac-aircraft-engines-handbook.css";

/** Native flow; each approved stage keeps one explanation beside its own visual. */
export function CiaacApprovedAircraftLearningPath(
  props: Omit<ComponentProps<typeof HandbookLearningPath>, "presentation">,
) {
  const { document, lpId } = props;
  const exerciseFigures = (
    document as typeof document & { exerciseFigures?: ApprovedAircraftFigure[] }
  ).exerciseFigures;
  const presentation = useMemo(
    () => ({
      className: "aircraft-handbook ciaac-aircraft-engines-handbook ciaac-aircraft-approved",
      visual: (stageIndex: number) =>
        document.stages[stageIndex]?.kind === "exercise" && exerciseFigures?.length ? (
          <div className="am-recognition-grid">
            {exerciseFigures.map((figure) => (
              <ApprovedAircraftIllustration key={figure.number} figure={figure} />
            ))}
          </div>
        ) : null,
      figuresFirst: true,
      // Keep any reviewed crop when enlarged; excluded generated mechanics stay excluded.
      renderZoom: (figure: HandbookFigure) => (
        <ApprovedAircraftIllustration figure={figure} expanded />
      ),
      renderFigure: (figure: HandbookFigure, onZoom: (figure: HandbookFigure) => void) => (
        <ApprovedAircraftIllustration figure={figure} onZoom={onZoom} />
      ),
      migrate: (
        saved: unknown,
        completed: boolean,
        fresh: Parameters<typeof migrateApprovedAircraftJourney>[4],
      ) => migrateApprovedAircraftJourney(lpId, document, saved, completed, fresh),
    }),
    [document, lpId, exerciseFigures],
  );
  return (
    <HandbookLearningPath key={`${props.userId}:${lpId}`} {...props} presentation={presentation} />
  );
}
