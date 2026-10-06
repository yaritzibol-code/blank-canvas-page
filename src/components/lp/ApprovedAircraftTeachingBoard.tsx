import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { HandbookCard, HandbookContentStage, HandbookFigure } from "@/lib/lp/handbook-types";
import {
  toBoardPoint,
  validateApprovedAircraftTeachingBoard,
  type ApprovedAircraftTeachingBoardConfig,
} from "@/lib/lp/ciaac-aircraft-approved/teaching-board";
import {
  ApprovedAircraftIllustration,
  type ApprovedAircraftFigure,
} from "./ApprovedAircraftIllustration";
import "./ciaac-aircraft-teaching-board.css";

export type { ApprovedAircraftTeachingBoardConfig } from "@/lib/lp/ciaac-aircraft-approved/teaching-board";

export interface ApprovedAircraftTeachingBoardProps {
  stage: HandbookContentStage;
  board: ApprovedAircraftTeachingBoardConfig;
  onZoom?: (figure: HandbookFigure) => void;
}

function SourceExplanation({ card }: { card: HandbookCard }) {
  return (
    <>
      <p>{card.text}</p>
      {card.detailText && (
        <details className="hb-card-detail am-board__detail">
          <summary>Ver más: {card.title}</summary>
          <p>{card.detailText}</p>
        </details>
      )}
    </>
  );
}

function SourceCard({
  card,
  index,
  labelledBy,
}: {
  card: HandbookCard;
  index: number;
  labelledBy?: string;
}) {
  return (
    <article className="am-board__card" data-card-index={index} aria-labelledby={labelledBy}>
      {!labelledBy && <h3>{card.title}</h3>}
      <SourceExplanation card={card} />
    </article>
  );
}

function BoardNotes({ stage, board }: Pick<ApprovedAircraftTeachingBoardProps, "stage" | "board">) {
  if (!board.noteCardIndexes?.length) return null;
  return (
    <div className="am-board__notes" role="group" aria-label="Notas del tema">
      {board.noteCardIndexes.map((index) => (
        <SourceCard key={index} card={stage.cards[index]} index={index} />
      ))}
    </div>
  );
}

/** Content only. The native lesson owns its heading, sources, navigation, and progress. */
export function ApprovedAircraftTeachingBoard({
  stage,
  board,
  onZoom,
}: ApprovedAircraftTeachingBoardProps) {
  const id = useId();
  if (validateApprovedAircraftTeachingBoard(stage, board).length) {
    // A stale/malformed optional layout must never suppress the original lesson.
    return (
      <div className="am-board am-board--fallback" data-board-fallback="true">
        {stage.figures.map((figure, index) => (
          <ApprovedAircraftIllustration
            key={`${figure.number}-${index}`}
            figure={figure}
            onZoom={onZoom}
          />
        ))}
        {stage.cards.map((card, index) => (
          <SourceCard key={index} card={card} index={index} />
        ))}
      </div>
    );
  }
  if (board.kind === "mechanism") {
    return (
      <MechanismBoard
        key={`${stage.title}:${board.figureNumber}`}
        stage={stage}
        board={board}
        onZoom={onZoom}
      />
    );
  }
  return (
    <div
      className="am-board am-board--comparison"
      role="group"
      aria-label={`Comparación: ${stage.title}`}
    >
      <div className="am-board__comparison-grid" data-panel-count={board.panels.length}>
        {board.panels.map((panel, index) => {
          const figure = stage.figures.find(
            (item) => item.number === panel.figureNumber,
          )! as ApprovedAircraftFigure;
          const ratio = figure.crop
            ? (figure.crop.assetAspectRatio * figure.crop.width) / figure.crop.height
            : figure.assetAspectRatio;
          return (
            <section
              className="am-board__panel"
              key={panel.figureNumber}
              aria-labelledby={`${id}-panel-${index}`}
              style={
                {
                  "--board-figure-width": ratio
                    ? `min(100%, ${28 * ratio}vh, ${18 * ratio}rem)`
                    : "100%",
                } as CSSProperties
              }
            >
              <h3 className="am-board__panel-title" id={`${id}-panel-${index}`}>
                {panel.title}
              </h3>
              <ApprovedAircraftIllustration figure={figure} onZoom={onZoom} />
              <div className="am-board__panel-cards">
                {panel.cardIndexes.map((cardIndex) => (
                  <SourceCard
                    key={cardIndex}
                    card={stage.cards[cardIndex]}
                    index={cardIndex}
                    labelledBy={
                      stage.cards[cardIndex].title.trim() === panel.title.trim()
                        ? `${id}-panel-${index}`
                        : undefined
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <BoardNotes stage={stage} board={board} />
    </div>
  );
}

function MechanismBoard({
  stage,
  board,
  onZoom,
}: ApprovedAircraftTeachingBoardProps & {
  board: Extract<ApprovedAircraftTeachingBoardConfig, { kind: "mechanism" }>;
}) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const markers = useRef<Array<HTMLButtonElement | null>>([]);
  const selectors = useRef<Array<HTMLButtonElement | null>>([]);
  const active = Math.min(selected, board.parts.length - 1);
  const figure = stage.figures.find(
    (item) => item.number === board.figureNumber,
  )! as ApprovedAircraftFigure;
  const crop = figure.crop;
  const ratio = crop
    ? (crop.assetAspectRatio * crop.width) / crop.height
    : figure.assetAspectRatio!;
  const chooseWithKeys = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    buttons: typeof markers,
  ) => {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % board.parts.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + board.parts.length - 1) % board.parts.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = board.parts.length - 1;
    else return; // Native buttons retain Enter/Space activation and ordinary Tab order.
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus();
  };
  return (
    <div
      className="am-board am-board--mechanism"
      role="group"
      aria-label={`Componentes: ${stage.title}`}
    >
      <div className="am-board__mechanism-layout">
        <figure className="am-board__master" aria-describedby={`${id}-instruction`}>
          <div className="am-board__master-head">
            <span>{figure.heading ?? "Localiza los componentes"}</span>
            {onZoom && (
              <button type="button" onClick={() => onZoom(figure)}>
                Ampliar ilustración
              </button>
            )}
          </div>
          <p className="am-board__instruction" id={`${id}-instruction`}>
            Selecciona un nombre o un número para localizar la pieza.
          </p>
          <div className="am-board__image-space">
            <div
              className="am-board__canvas"
              style={{ aspectRatio: ratio, width: `min(100%, ${44 * ratio}vh, ${28 * ratio}rem)` }}
            >
              <div className="am-board__image-clip">
                <img
                  src={figure.file}
                  alt={figure.alt}
                  style={
                    crop
                      ? {
                          position: "absolute",
                          width: `${10000 / crop.width}%`,
                          maxWidth: "none",
                          left: `${(-crop.x / crop.width) * 100}%`,
                          top: `${(-crop.y / crop.height) * 100}%`,
                        }
                      : undefined
                  }
                />
              </div>
              {board.parts.map((part, index) => {
                const point = toBoardPoint(part, crop);
                return (
                  <button
                    key={part.cardIndex}
                    ref={(element) => {
                      markers.current[index] = element;
                    }}
                    type="button"
                    className="am-board__anchor"
                    id={`${id}-anchor-${index}`}
                    aria-label={`${index + 1}. ${stage.cards[part.cardIndex].title}`}
                    aria-controls={`${id}-card-${index}`}
                    aria-pressed={index === active}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    onClick={() => setSelected(index)}
                    onKeyDown={(event) => chooseWithKeys(event, index, markers)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
          {figure.observe && <figcaption>{figure.observe}</figcaption>}
          {figure.caption && <small>{figure.caption}</small>}
          <p className="am-board__selection" role="status" aria-live="polite" aria-atomic="true">
            Referencia seleccionada: {active + 1}.{" "}
            {stage.cards[board.parts[active].cardIndex].title}
          </p>
        </figure>
        <div className="am-board__functions" role="group" aria-label="Componentes y funciones">
          {board.parts.map((part, index) => {
            const card = stage.cards[part.cardIndex];
            return (
              <article
                className={`am-board__card${index === active ? " is-selected" : ""}`}
                key={part.cardIndex}
                id={`${id}-card-${index}`}
                data-card-index={part.cardIndex}
              >
                <h3>
                  <button
                    ref={(element) => {
                      selectors.current[index] = element;
                    }}
                    type="button"
                    className="am-board__part-select"
                    aria-pressed={index === active}
                    aria-controls={`${id}-anchor-${index}`}
                    onClick={() => setSelected(index)}
                    onKeyDown={(event) => chooseWithKeys(event, index, selectors)}
                  >
                    <span className="am-board__number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>{card.title}</span>
                  </button>
                </h3>
                <SourceExplanation card={card} />
              </article>
            );
          })}
        </div>
      </div>
      <BoardNotes stage={stage} board={board} />
    </div>
  );
}
