import type { ComponentProps } from "react";
import { HandbookLearningPath } from "./HandbookLearningPath";
import { AircraftHandbookVisual } from "./CiaacAircraftHandbookVisual";
import { migrateAircraftHandbookJourney } from "@/lib/lp/ciaac-aircraft-handbook-journey";
import "./ciaac-aircraft-handbook.css";

const presentation = {
  className: "aircraft-handbook",
  visual: (stage: number) =>
    (stage >= 1 && stage <= 4) || stage === 8 ? <AircraftHandbookVisual stage={stage} /> : null,
  migrate: migrateAircraftHandbookJourney,
};

/** First CIAAC lesson: native Handbook flow, with its approved scoped art direction. */
export function CiaacAircraftLearningPath(
  props: Omit<ComponentProps<typeof HandbookLearningPath>, "presentation">,
) {
  return <HandbookLearningPath {...props} presentation={presentation} />;
}
