import { finishCompassPractice, finishRtariPractice } from "./practice.functions";
import { anunciarFP } from "./client";
import type { CompassResult } from "@/modules/compass/types";
import type { PracticeTurn } from "./practice-validation";

/** Retry with the SAME server run ID; never mint an event when requesting a reward. */
async function confirmed<T extends { nuevos: Parameters<typeof anunciarFP>[0] }>(
  fn: () => Promise<T>,
): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fn();
      anunciarFP(res.nuevos);
      return;
    } catch (error) {
      if (attempt === 2) {
        console.warn("[FlightPoints] Practice reward not confirmed", error);
        return;
      }
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
}
export function rewardCompass(id: string, result: CompassResult): Promise<void> {
  return confirmed(() =>
    finishCompassPractice({
      data: { id, result: { ...result, interactions: result.interactions ?? 0 } },
    }),
  );
}
export function rewardRtari(id: string, durationSec: number, turns: PracticeTurn[]): Promise<void> {
  return confirmed(() =>
    finishRtariPractice({
      data: { id, durationSec, turns: turns.slice(-120).map(({ role, text }) => ({ role, text })) },
    }),
  );
}
