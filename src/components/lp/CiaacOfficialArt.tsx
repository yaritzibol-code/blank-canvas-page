import type { CSSProperties } from "react";

type BoardRegion = {
  src: string;
  boardWidth: number;
  boardHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

const YARIS_BOARD = "/lp/ciaac/official/yaris-official-reference.png";
const PATHY_BOARD = "/lp/ciaac/official/pathy-official-reference.png";
const BRAND_BOARD = "/lp/ciaac/official/flightpath-official-brand-identity.png";

/** Display a region of an untouched original board using CSS only. */
function OfficialBoardRegion({
  region,
  width,
  label,
  className,
  rounded = false,
}: {
  region: BoardRegion;
  width: number;
  label: string;
  className: string;
  rounded?: boolean;
}) {
  const scale = width / region.width;
  const height = region.height * scale;
  const style: CSSProperties = {
    display: "inline-block",
    position: "relative",
    boxSizing: "content-box",
    width,
    height,
    minWidth: width,
    minHeight: height,
    maxWidth: "none",
    maxHeight: "none",
    flex: "0 0 auto",
    overflow: "hidden",
    padding: 0,
    margin: 0,
    border: 0,
    borderRadius: rounded ? "50%" : 0,
    verticalAlign: "middle",
    lineHeight: 0,
    backgroundImage: `url("${region.src}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${region.boardWidth * scale}px ${region.boardHeight * scale}px`,
    backgroundPosition: `${-region.x * scale}px ${-region.y * scale}px`,
  };

  // A background viewport avoids the handbook's global img sizing rules.
  return (
    <span
      role="img"
      aria-label={label}
      className={`ciaac-official-art ${className}`}
      style={style}
    />
  );
}

export function CiaacYarisAvatar({ size = 44 }: { size?: number }) {
  return (
    <OfficialBoardRegion
      region={{
        src: YARIS_BOARD,
        boardWidth: 1536,
        boardHeight: 1024,
        x: 625,
        y: 501,
        width: 126,
        height: 126,
      }}
      width={size}
      label="Yaris, tu copiloto de estudio"
      className="ciaac-official-art--yaris"
      rounded
    />
  );
}

export function CiaacPathyArt({
  size = 150,
  celebrate = false,
}: {
  size?: number;
  celebrate?: boolean;
}) {
  return (
    <OfficialBoardRegion
      region={{
        src: PATHY_BOARD,
        boardWidth: 1536,
        boardHeight: 1024,
        x: celebrate ? 1040 : 1038,
        y: celebrate ? 592 : 434,
        width: 114,
        height: 114,
      }}
      width={size}
      label={celebrate ? "Pathy celebra tu avance" : "Pathy acompaña tu recorrido"}
      className={`ciaac-official-art--pathy${celebrate ? " is-celebrating" : ""}`}
    />
  );
}

export function CiaacOfficialLogo({ width = 140 }: { width?: number }) {
  return (
    <OfficialBoardRegion
      region={{
        src: BRAND_BOARD,
        boardWidth: 1224,
        boardHeight: 1285,
        x: 18,
        y: 110,
        width: 457,
        height: 176,
      }}
      width={width}
      label="FlightPath, tu ruta al siguiente nivel"
      className="ciaac-official-art--logo"
    />
  );
}
