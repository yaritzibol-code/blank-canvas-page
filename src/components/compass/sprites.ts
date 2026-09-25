/**
 * Sprites vectoriales compartidos de COMPASS (SVG y canvas).
 */

/** Silueta cenital de avión (nariz hacia arriba), centrada en 0,0; 42 de envergadura. */
export const AVION_PATH =
  "M0,-22 C2,-22 3,-19 3,-15 L3,-5 L21,4 L21,8 L3,3.5 L2.4,14 L8.5,18 L8.5,21 L0,19.2 L-8.5,21 L-8.5,18 L-2.4,14 L-3,3.5 L-21,8 L-21,4 L-3,-5 L-3,-15 C-3,-19 -2,-22 0,-22 Z";

/** Media envergadura de AVION_PATH, para escalarlo a un ancho dado. */
export const AVION_HALF_SPAN = 21;

let avion2d: Path2D | null = null;
/** Path2D perezoso: sólo existe en el navegador. */
function avionPath(): Path2D {
  return (avion2d ??= new Path2D(AVION_PATH));
}

/**
 * Avión cenital para canvas: sombra sobre el terreno, fuselaje con brillo,
 * franja dorada y luces de navegación (roja a la izquierda, verde a la
 * derecha) con estrobo de cola.
 */
export function drawPlane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  halfSpanPx: number,
  rot: number,
  timeSec: number,
) {
  const p = avionPath();
  const k = halfSpanPx / AVION_HALF_SPAN;

  ctx.save();
  ctx.translate(x + halfSpanPx * 0.55, y + halfSpanPx * 0.75);
  ctx.rotate(rot);
  ctx.scale(k * 0.9, k * 0.9);
  ctx.fillStyle = "rgba(0,0,0,.4)";
  ctx.fill(p);
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(k, k);
  const cuerpo = ctx.createLinearGradient(-AVION_HALF_SPAN, 0, AVION_HALF_SPAN, 0);
  cuerpo.addColorStop(0, "#aeb9ca");
  cuerpo.addColorStop(0.5, "#ffffff");
  cuerpo.addColorStop(1, "#aeb9ca");
  ctx.shadowColor = "rgba(143,211,244,.6)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = cuerpo;
  ctx.fill(p);
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1 / k;
  ctx.strokeStyle = "rgba(8,26,53,.55)";
  ctx.stroke(p);

  ctx.fillStyle = "#e3c98a";
  ctx.fillRect(-1.1, -12, 2.2, 25);
  ctx.fillStyle = "#0b2447";
  ctx.beginPath();
  ctx.ellipse(0, -16.5, 1.7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const luz = (lx: number, ly: number, color: string, r: number) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lx, ly, r, 0, Math.PI * 2);
    ctx.fill();
  };
  luz(-20.2, 6, "#ff5a4f", 1.6);
  luz(20.2, 6, "#5dffa0", 1.6);
  if (timeSec % 1.2 < 0.12) luz(0, 19.5, "#ffffff", 2);
  ctx.shadowBlur = 0;
  ctx.restore();
}
