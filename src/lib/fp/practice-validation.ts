import type { CompassResult, CompassRunConfig } from "@/modules/compass/types";

/** Validates completion and participation, never an achievement/accuracy threshold. */
export function validCompassResult(
  cfg: CompassRunConfig,
  r: CompassResult,
  elapsedSec: number,
): boolean {
  if (
    r.moduleId !== cfg.moduleId ||
    !Number.isFinite(r.score) ||
    r.score < 0 ||
    r.score > 100 ||
    !Number.isFinite(r.durationSec) ||
    r.durationSec < 1 ||
    r.durationSec > elapsedSec + 3 ||
    elapsedSec > 7200 ||
    !Number.isInteger(r.interactions) ||
    r.interactions! <= 0 ||
    !Number.isInteger(r.interruptions) ||
    r.interruptions < 0 ||
    !["teclado", "mouse", "touch", "mixto"].includes(r.input) ||
    !Array.isArray(r.metrics) ||
    r.metrics.length === 0 ||
    Object.values(r.raw).some((n) => !Number.isFinite(n))
  )
    return false;
  const integer = (n: number) => Number.isInteger(n) && n >= 0;
  const timerEnded = cfg.durationSec > 0 && r.durationSec >= cfg.durationSec - 1;
  if (["control", "slalom", "multitarea"].includes(cfg.moduleId) && !timerEnded) return false;
  if (cfg.moduleId === "control") {
    return (
      ["rmsX", "rmsY", "inBandX", "inBandY", "saturations"].every((k) => r.raw[k] >= 0) &&
      r.raw.inBandX <= 1 &&
      r.raw.inBandY <= 1
    );
  }
  if (cfg.moduleId === "slalom") {
    const { gatesTotal, gatesClean, gatesTouch, gatesMiss } = r.raw;
    return (
      [gatesTotal, gatesClean, gatesTouch, gatesMiss].every(integer) &&
      gatesTotal > 0 &&
      gatesTotal === gatesClean + gatesTouch + gatesMiss
    );
  }
  if (cfg.moduleId === "multitarea") {
    return ["transfersOk", "transfersError", "hits", "misses", "falseAlarms"].every((k) =>
      integer(r.raw[k]),
    );
  }
  if (cfg.moduleId === "memoria") {
    const { blocksTotal, blocksPerfect, fieldsTotal, fieldsCorrect, nearMisses } = r.raw;
    return (
      [blocksTotal, blocksPerfect, fieldsTotal, fieldsCorrect, nearMisses].every(integer) &&
      blocksTotal > 0 &&
      blocksPerfect <= blocksTotal &&
      fieldsTotal >= blocksTotal &&
      fieldsCorrect <= fieldsTotal &&
      nearMisses <= fieldsTotal - fieldsCorrect &&
      (cfg.items > 0 ? blocksTotal === cfg.items && r.durationSec >= blocksTotal * 3 : timerEnded)
    );
  }
  const { total, correct, omitted } = r.raw;
  return (
    [total, correct, omitted].every(integer) &&
    total === cfg.items &&
    correct + omitted <= total &&
    omitted < total &&
    r.durationSec >= total &&
    (omitted === 0 || timerEnded)
  );
}

export type PracticeTurn = { role: "examiner" | "candidate"; text: string };
export function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
}
export function realRtariParticipation(turns: PracticeTurn[], durationSec: number): boolean {
  const candidate = turns.filter((t) => t.role === "candidate" && words(t.text).length >= 3);
  return (
    durationSec >= 60 &&
    candidate.length >= 2 &&
    turns.filter((t) => t.role === "examiner").length >= 2 &&
    words(candidate.map((t) => t.text).join(" ")).length >= 20
  );
}
/** The recording must independently contain the answers, without a vocabulary/grade threshold. */
export function matchesRecordedSpeech(
  turns: PracticeTurn[],
  recording: string,
  audioSeconds: number,
  durationSec: number,
): boolean {
  if (
    !Number.isFinite(audioSeconds) ||
    audioSeconds < 50 ||
    Math.abs(audioSeconds - durationSec) > Math.max(15, durationSec * 0.2)
  )
    return false;
  const candidate = new Set(
    words(
      turns
        .filter((t) => t.role === "candidate")
        .map((t) => t.text)
        .join(" "),
    ),
  );
  const heard = new Set(words(recording));
  const matched = [...candidate].filter((w) => heard.has(w)).length;
  return candidate.size > 0 && matched / candidate.size >= 0.65;
}

export interface RecordedDialogue {
  text: string;
  duration: number;
  segments: { speaker: string; text: string; start: number; end: number }[];
}
/** Both roles must map to different speakers recognized from the audio, not just client role labels. */
export function matchesRecordedDialogue(
  turns: PracticeTurn[],
  recording: RecordedDialogue,
  durationSec: number,
): boolean {
  if (
    !matchesRecordedSpeech(turns, recording.text ?? "", recording.duration, durationSec) ||
    !Array.isArray(recording.segments)
  )
    return false;
  const groups = new Map<string, { texts: string[]; seconds: number; segments: number }>();
  for (const segment of recording.segments) {
    if (
      !segment.speaker ||
      !Number.isFinite(segment.start) ||
      !Number.isFinite(segment.end) ||
      segment.start < 0 ||
      segment.end <= segment.start ||
      segment.end > recording.duration + 2 ||
      !segment.text
    )
      return false;
    const group = groups.get(segment.speaker) ?? { texts: [], seconds: 0, segments: 0 };
    group.texts.push(segment.text);
    group.seconds += segment.end - segment.start;
    group.segments++;
    groups.set(segment.speaker, group);
  }
  const coverage = (role: PracticeTurn["role"], text: string) => {
    const expected = new Set(
      words(
        turns
          .filter((t) => t.role === role)
          .map((t) => t.text)
          .join(" "),
      ),
    );
    const actual = new Set(words(text));
    return expected.size ? [...expected].filter((w) => actual.has(w)).length / expected.size : 0;
  };
  return [...groups].some(
    ([candidateId, candidate]) =>
      candidate.segments >= 2 &&
      candidate.seconds >= 8 &&
      coverage("candidate", candidate.texts.join(" ")) >= 0.65 &&
      [...groups].some(
        ([examinerId, examiner]) =>
          examinerId !== candidateId && coverage("examiner", examiner.texts.join(" ")) >= 0.5,
      ),
  );
}
