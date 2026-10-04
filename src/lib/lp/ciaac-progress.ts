import type { CiaacActivity } from "./ciaac-content-types";

export interface CiaacActivityProgress {
  responses: string[];
  revealed: boolean;
  reflected: boolean;
}

export const emptyCiaacActivity = (): CiaacActivityProgress => ({
  responses: [],
  revealed: false,
  reflected: false,
});

const normalize = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Objective responses are checked directly; open explanations require a written attempt and explicit comparison. */
export function ciaacResponseReady(
  activity: CiaacActivity,
  progress: CiaacActivityProgress,
): boolean {
  if (activity.kind === "fill_blank") {
    return activity.items.every(
      (answer, index) => normalize(progress.responses[index] ?? "") === normalize(answer),
    );
  }
  if (activity.kind === "calculation")
    return Number(progress.responses[0]) === 20 && Boolean(progress.responses[0]?.trim());
  if (activity.kind === "short_answer")
    return Boolean(progress.responses[0]?.trim()) && progress.revealed && progress.reflected;
  return true;
}
