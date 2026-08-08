/**
 * Game loop con paso fijo para las tareas motoras del Pilot Aptitude Trainer.
 *
 * La simulación avanza SIEMPRE en pasos de tamaño fijo (120 Hz lógicos)
 * acumulando el tiempo real entre frames: el resultado no depende del refresh
 * del monitor (60/120/144 Hz) ni de un frame perdido. El render ocurre una vez
 * por requestAnimationFrame con el estado ya simulado.
 *
 * El reloj es performance.now (monotónico). Si la pestaña pierde visibilidad,
 * el loop se detiene y `onHidden` decide qué hacer (pausar y contar la
 * interrupción); al volver, el acumulador se resetea para no "reproducir" el
 * tiempo escondido de golpe.
 */
import { useEffect, useRef } from "react";

export const FIXED_DT = 1 / 120;
/** Tope de tiempo real procesado por frame (evita saltos tras jank). */
const MAX_FRAME_SEC = 0.1;

export function useGameLoop(opts: {
  running: boolean;
  /** Paso de simulación: recibe tiempo simulado acumulado y dt fijo. */
  onStep: (t: number, dt: number) => void;
  /** Render por frame, tras los pasos pendientes. */
  onFrame: () => void;
  /** La pestaña se ocultó a mitad de tarea. */
  onHidden?: () => void;
}) {
  const cb = useRef(opts);
  cb.current = opts;
  const simTime = useRef(0);

  useEffect(() => {
    if (!opts.running) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let alive = true;

    const frame = (now: number) => {
      if (!alive) return;
      acc += Math.min(MAX_FRAME_SEC, (now - last) / 1000);
      last = now;
      while (acc >= FIXED_DT) {
        simTime.current += FIXED_DT;
        cb.current.onStep(simTime.current, FIXED_DT);
        acc -= FIXED_DT;
      }
      cb.current.onFrame();
      raf = requestAnimationFrame(frame);
    };

    const onVis = () => {
      if (document.hidden) {
        cb.current.onHidden?.();
      } else {
        // Reancla el reloj para descartar el tiempo en segundo plano.
        last = performance.now();
        acc = 0;
      }
    };

    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [opts.running]);

  /** Tiempo simulado transcurrido (seg). */
  return simTime;
}

/**
 * Clasifica el input dominante de la sesión a partir de contadores de eventos.
 * "mixto" cuando dos clases superan el 25% cada una.
 */
export function classifyInput(counts: { teclado: number; mouse: number; touch: number }) {
  const total = counts.teclado + counts.mouse + counts.touch;
  if (total === 0) return "mouse" as const;
  const shares = (Object.entries(counts) as ["teclado" | "mouse" | "touch", number][])
    .map(([k, v]) => ({ k, share: v / total }))
    .sort((a, b) => b.share - a.share);
  if (shares[1] && shares[1].share > 0.25) return "mixto" as const;
  return shares[0].k;
}
