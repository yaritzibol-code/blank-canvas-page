import type { HandbookContentStage, HandbookFigure } from "../handbook-types";

export interface ApprovedAircraftComparisonPanel {
  title: string;
  figureNumber: string;
  /** Zero-based indexes into source cards. May be empty when a common source
   * explanation is mapped once in the board's shared notes (e.g. gravity/pump feed). */
  cardIndexes: number[];
}

export interface ApprovedAircraftMechanismPart {
  cardIndex: number;
  /** Percentages of the original asset, before its canonical crop. */
  x: number;
  y: number;
  /** Optional separated label position in the same original-asset coordinates.
   * The physical point stays at x/y and is joined by a non-directional leader. */
  labelX?: number;
  labelY?: number;
}

export type ApprovedAircraftTeachingBoardConfig = {
  /** Whole assembly shown once above the local comparison or mechanism detail. */
  contextFigureNumber?: string;
  /** Shared source notes, never attached to one category or physical component. */
  noteCardIndexes?: number[];
} & (
  | { kind: "comparison"; panels: ApprovedAircraftComparisonPanel[] }
  | { kind: "mechanism"; figureNumber: string; parts: ApprovedAircraftMechanismPart[] }
);

export interface ApprovedAircraftBoardCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  assetAspectRatio: number;
}

type BoardFigure = HandbookFigure & {
  assetAspectRatio?: number;
  crop?: ApprovedAircraftBoardCrop;
};

/** Both the static image and its anchors share this original-asset coordinate system. */
export function toBoardPoint(
  point: { x: number; y: number },
  crop?: Pick<ApprovedAircraftBoardCrop, "x" | "y" | "width" | "height">,
): { x: number; y: number } {
  return crop
    ? { x: ((point.x - crop.x) / crop.width) * 100, y: ((point.y - crop.y) / crop.height) * 100 }
    : { x: point.x, y: point.y };
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const percent = (value: unknown): value is number => finite(value) && value >= 0 && value <= 100;

/** Pure publication/runtime check: no React, CSS, side effects, or rewritten source material. */
export function validateApprovedAircraftTeachingBoard(
  stage: HandbookContentStage,
  board: unknown,
): string[] {
  const errors: string[] = [];
  if (!record(board) || (board.kind !== "comparison" && board.kind !== "mechanism")) {
    return ["Teaching board must use comparison or mechanism mode."];
  }
  const cardUses = Array.from({ length: stage.cards.length }, () => 0);
  const figureUses = new Map(stage.figures.map((figure) => [figure.number, 0]));
  if (figureUses.size !== stage.figures.length) errors.push("Stage figure numbers must be unique.");
  const recordCardReference = (index: unknown) => {
    if (!finite(index) || !Number.isInteger(index) || index < 0 || index >= stage.cards.length) {
      errors.push("Board card indexes must reference an existing source card.");
    } else cardUses[index] += 1;
  };
  const recordFigureReference = (number: unknown): BoardFigure | undefined => {
    if (typeof number !== "string" || !figureUses.has(number)) {
      errors.push("Board figure numbers must reference an existing source figure.");
      return;
    }
    figureUses.set(number, figureUses.get(number)! + 1);
    const figure = stage.figures.find((candidate) => candidate.number === number) as BoardFigure;
    if (figure.crop !== undefined) {
      const crop = figure.crop;
      if (
        !record(crop) ||
        !percent(crop.x) ||
        !percent(crop.y) ||
        !finite(crop.width) ||
        crop.width <= 0 ||
        !finite(crop.height) ||
        crop.height <= 0 ||
        crop.x + crop.width > 100 ||
        crop.y + crop.height > 100 ||
        !finite(crop.assetAspectRatio) ||
        crop.assetAspectRatio <= 0
      )
        errors.push(`Figure ${number} requires valid original-asset crop geometry.`);
    }
    if (
      figure.assetAspectRatio !== undefined &&
      (!finite(figure.assetAspectRatio) || figure.assetAspectRatio <= 0)
    )
      errors.push(`Figure ${number} requires a positive asset aspect ratio.`);
    const crop = figure.crop;
    const ratio =
      record(crop) && finite(crop.assetAspectRatio) && finite(crop.width) && finite(crop.height)
        ? (crop.assetAspectRatio * crop.width) / crop.height
        : figure.assetAspectRatio;
    if (
      ratio !== undefined &&
      (!finite(ratio) || ratio <= 0 || !finite(44 * ratio) || !finite(28 * ratio))
    )
      errors.push(`Figure ${number} requires finite, positive derived display geometry.`);
    if (
      record(crop) &&
      finite(crop.width) &&
      finite(crop.height) &&
      finite(crop.x) &&
      finite(crop.y) &&
      (!finite(10000 / crop.width) ||
        !finite((-crop.x / crop.width) * 100) ||
        !finite((-crop.y / crop.height) * 100))
    )
      errors.push(`Figure ${number} requires finite crop scale and offsets.`);
    return figure;
  };

  if (board.contextFigureNumber !== undefined) {
    const context = recordFigureReference(board.contextFigureNumber);
    if (context && context.crop === undefined && !finite(context.assetAspectRatio))
      errors.push("A bounded context image needs its original asset aspect ratio.");
  }
  if (board.kind === "comparison") {
    if (!Array.isArray(board.panels) || board.panels.length < 2) {
      errors.push("A comparison needs at least two visible panels.");
    } else {
      for (const panel of board.panels) {
        if (!record(panel)) {
          errors.push("Comparison panels must define a title, figure, and card indexes.");
          continue;
        }
        if (typeof panel.title !== "string" || !panel.title.trim()) {
          errors.push("Every comparison panel needs a readable title.");
        }
        recordFigureReference(panel.figureNumber);
        if (
          !Array.isArray(panel.cardIndexes) ||
          (!panel.cardIndexes.length &&
            !(Array.isArray(board.noteCardIndexes) && board.noteCardIndexes.length))
        ) {
          errors.push("Every comparison image must be paired with its source cards.");
        } else panel.cardIndexes.forEach(recordCardReference);
      }
    }
  } else {
    const figure = recordFigureReference(board.figureNumber);
    if (figure && figure.crop === undefined && !finite(figure.assetAspectRatio)) {
      errors.push("A mechanism master image needs its original asset aspect ratio.");
    }
    if (!Array.isArray(board.parts) || !board.parts.length) {
      errors.push("A mechanism needs numbered source-card anchors.");
    } else {
      for (const part of board.parts) {
        if (!record(part)) {
          errors.push("Mechanism parts must define a source card and original-asset anchor.");
          continue;
        }
        recordCardReference(part.cardIndex);
        if (!percent(part.x) || !percent(part.y)) {
          errors.push("Mechanism anchors must be finite original-asset percentages.");
        } else if (figure?.crop && record(figure.crop)) {
          const point = toBoardPoint({ x: part.x, y: part.y }, figure.crop);
          if (!percent(point.x) || !percent(point.y)) {
            errors.push("Mechanism anchors must remain inside the canonical crop.");
          }
        }
        if (part.labelX !== undefined || part.labelY !== undefined) {
          if (!percent(part.labelX) || !percent(part.labelY)) {
            errors.push("Separated labels require both original-asset percentage coordinates.");
          } else if (figure?.crop && record(figure.crop)) {
            const label = toBoardPoint({ x: part.labelX, y: part.labelY }, figure.crop);
            if (!percent(label.x) || !percent(label.y))
              errors.push("Separated labels must remain inside the canonical crop.");
          }
        }
      }
    }
  }
  if (board.noteCardIndexes !== undefined) {
    if (!Array.isArray(board.noteCardIndexes))
      errors.push("Shared board notes must use source card indexes.");
    else board.noteCardIndexes.forEach(recordCardReference);
  }
  if (!cardUses.length || cardUses.some((count) => count !== 1)) {
    errors.push("Every source card must be mapped exactly once.");
  }
  if (!figureUses.size || [...figureUses.values()].some((count) => count !== 1)) {
    errors.push("Every source figure must be mapped exactly once.");
  }
  return errors;
}
