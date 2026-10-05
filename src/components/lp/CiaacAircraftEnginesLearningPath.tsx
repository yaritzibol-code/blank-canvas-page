import { useMemo, type ComponentProps } from "react";
import { HandbookLearningPath } from "./HandbookLearningPath";
import { migrateAircraftEnginesJourney } from "@/lib/lp/ciaac-aircraft-engines-journey";
import "./ciaac-aircraft-handbook.css";
import "./ciaac-aircraft-engines-handbook.css";

/** Native journey. Reviewed figures live beside the explanation they teach. */
export function CiaacAircraftEnginesLearningPath(
  props: Omit<ComponentProps<typeof HandbookLearningPath>, "presentation">,
) {
  const { document } = props;
  const presentation = useMemo(() => ({
    className: "aircraft-handbook ciaac-aircraft-engines-handbook",
    visual: () => null,
    migrate: (saved: unknown, completed: boolean, fresh: Parameters<typeof migrateAircraftEnginesJourney>[3]) =>
      migrateAircraftEnginesJourney(document, saved, completed, fresh),
  }), [document]);
  return <HandbookLearningPath key={`${props.userId}:${props.lpId}`} {...props} presentation={presentation} />;
}
