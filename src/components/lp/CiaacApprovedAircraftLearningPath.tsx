import { useMemo, type ComponentProps } from "react";
import type { HandbookContentStage, HandbookFigure } from "@/lib/lp/handbook-types";
import { HandbookLearningPath } from "./HandbookLearningPath";
import {
  ApprovedAircraftIllustration,
  type ApprovedAircraftFigure,
} from "./ApprovedAircraftIllustration";
import { migrateApprovedAircraftJourney } from "@/lib/lp/ciaac-aircraft-approved/journey";
import { ApprovedAircraftTeachingBoard } from "./ApprovedAircraftTeachingBoard";
import { ApprovedPropellerDiagram } from "./ApprovedPropellerDiagram";
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
      renderContent: (stage: HandbookContentStage, onZoom: (figure: HandbookFigure) => void) =>
        stage.propellerDiagram && document.number === 9 ? (
          <>
            <header className="hb-heading">
              <span className="hb-pill">Comprende</span>
              <h2>{stage.title}</h2>
            </header>
            <ApprovedPropellerDiagram
              mode={stage.propellerDiagram}
              figure={stage.figures[0]}
              onZoom={onZoom}
            />
            <div className="hb-card-grid">
              {stage.cards.map((card, i) => (
                <section
                  className={`hb-card ${card.wide ? "is-wide" : ""}`}
                  key={`${i}:${card.title}`}
                >
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  {card.detailText && (
                    <details className="hb-card-detail">
                      <summary>Ver más: {card.title}</summary>
                      <p>{card.detailText}</p>
                    </details>
                  )}
                </section>
              ))}
            </div>
          </>
        ) : stage.board ? (
          <>
            <header className="hb-heading">
              <span className="hb-pill">Comprende</span>
              <h2>{stage.title}</h2>
            </header>
            <ApprovedAircraftTeachingBoard
              key={stage.nav}
              stage={stage}
              board={stage.board}
              onZoom={onZoom}
            />
          </>
        ) : null,
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
