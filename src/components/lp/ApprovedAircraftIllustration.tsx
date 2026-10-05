import type { HandbookFigure } from "@/lib/lp/handbook-types";
import "./ciaac-aircraft-approved.css";

/** Coordinates are percentages of the original asset. Cropping is a viewport,
 * never a modified aircraft or a simulated motion of a baked-in engine part. */
export interface ApprovedAircraftFigure extends HandbookFigure {
  heading?: string;
  assetAspectRatio?: number;
  focus?: { x: number; y: number; label: string };
  crop?: { x: number; y: number; width: number; height: number; assetAspectRatio: number };
}

export function ApprovedAircraftIllustration({
  figure,
  onZoom,
  expanded = false,
}: {
  figure: ApprovedAircraftFigure;
  onZoom?: (figure: HandbookFigure) => void;
  expanded?: boolean;
}) {
  const crop = figure.crop;
  const focus = figure.focus;
  const displayRatio = crop
    ? (crop.assetAspectRatio * crop.width) / crop.height
    : figure.assetAspectRatio;
  const point = focus && {
    x: crop ? ((focus.x - crop.x) / crop.width) * 100 : focus.x,
    y: crop ? ((focus.y - crop.y) / crop.height) * 100 : focus.y,
  };
  return (
    <figure className="am-illustration">
      <div className="am-illustration__head">
        <span>{figure.heading ?? focus?.label ?? "Observa"}</span>
        {onZoom && (
          <button type="button" onClick={() => onZoom(figure)}>
            Ampliar ilustración
          </button>
        )}
      </div>
      <div
        className={`am-illustration__viewport${crop ? " is-cropped" : ""}`}
        style={
          displayRatio
            ? {
                aspectRatio: displayRatio,
                width: `min(100%, ${(expanded ? 76 : 44) * displayRatio}vh, ${(expanded ? 48 : 28) * displayRatio}rem)`,
                marginInline: "auto",
              }
            : undefined
        }
      >
        <img
          src={figure.file}
          alt={figure.alt}
          style={
            crop
              ? {
                  width: `${10000 / crop.width}%`,
                  maxWidth: "none",
                  left: `${(-crop.x / crop.width) * 100}%`,
                  top: `${(-crop.y / crop.height) * 100}%`,
                }
              : undefined
          }
        />
        {point && (
          <span
            className="am-illustration__focus"
            aria-hidden="true"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          />
        )}
      </div>
      {figure.observe && <figcaption>{figure.observe}</figcaption>}
      {figure.caption && <small>{figure.caption}</small>}
    </figure>
  );
}
