import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  matchesRecordedDialogue,
  realRtariParticipation,
  validCompassResult,
  type PracticeTurn,
  type RecordedDialogue,
} from "./practice-validation";
import { COMPASS_MODULE_VERSION, COMPASS_SCORING_VERSION } from "@/modules/compass/config";
import type { CompassResult, CompassRunConfig } from "@/modules/compass/types";
import type { FpNuevo } from "./shared";

// New private schema intentionally has no writable browser client / generated SDK types yet.
const db = supabaseAdmin as any;
export async function practiceRpc(name: string, args: Record<string, unknown>): Promise<any> {
  const { data, error } = await db.rpc(name, args);
  if (error) throw new Error(`Practice persistence failed: ${error.code ?? "unknown"}`);
  return data;
}
export async function practiceRun(userId: string, id: string): Promise<any> {
  const { data, error } = await db
    .from("fp_practice_runs")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) throw new Error("Unknown practice session");
  return data;
}
export async function startRtariPractice(
  userId: string,
  id: string,
  config: Record<string, unknown>,
): Promise<void> {
  const { error } = await db
    .from("fp_practice_runs")
    .insert({ id, user_id: userId, kind: "rtari", config });
  if (error) throw new Error("Could not register RTARI evidence");
}
export async function markPractice(
  userId: string,
  id: string,
  action: "connected" | "closed" | "abandoned",
): Promise<void> {
  await practiceRpc("fp_mark_practice", { p_user: userId, p_id: id, p_action: action });
}
export async function completeCompass(
  userId: string,
  id: string,
  result: CompassResult,
): Promise<{ nuevos: FpNuevo[]; total: number }> {
  const run = await practiceRun(userId, id);
  if (run.kind !== "compass") throw new Error("Invalid practice kind");
  if (run.state === "completed")
    return { nuevos: [], total: await practiceRpc("fp_reconcile_balance", { p_user: userId }) };
  const cfg = run.config as CompassRunConfig & { moduleVersion: number; scoringVersion: number };
  if (
    cfg.moduleVersion !== COMPASS_MODULE_VERSION ||
    cfg.scoringVersion !== COMPASS_SCORING_VERSION ||
    !validCompassResult(cfg, result, (Date.now() - Date.parse(run.started_at)) / 1000)
  )
    throw new Error("Incomplete or incoherent practice");
  return practiceRpc("fp_finish_practice", {
    p_user: userId,
    p_id: id,
    p_result: { ...result, validated: true },
  });
}

/** No grade or AI evaluation is required. Store independently verified practice evidence. */
export async function completeRtari(
  userId: string,
  id: string,
  turns: PracticeTurn[],
  durationSec: number,
): Promise<{ nuevos: FpNuevo[]; total: number }> {
  const run = await practiceRun(userId, id);
  if (run.kind !== "rtari") throw new Error("Invalid practice kind");
  if (run.state === "completed")
    return { nuevos: [], total: await practiceRpc("fp_reconcile_balance", { p_user: userId }) };
  const connectedMs = Date.parse(run.connected_at ?? "");
  const closedMs = Date.parse(run.closed_at ?? "");
  if (
    run.state !== "closed" ||
    !Number.isFinite(connectedMs) ||
    !Number.isFinite(closedMs) ||
    durationSec > (closedMs - connectedMs) / 1000 + 5 ||
    durationSec > run.config.maxSeconds + 5 ||
    Date.now() - Date.parse(run.started_at) > 7200000 ||
    !realRtariParticipation(turns, durationSec)
  )
    throw new Error("No valid interview evidence");
  // Canonical server-owned ID, never a client-supplied path/URL or metadata row.
  let audio: Blob | null = null;
  let path = "";
  for (const ext of ["webm", "mp4"]) {
    path = `${userId}/${id}.${ext}`;
    const { data, error } = await db.storage.from("rtari-audio").download(path);
    if (!error && data) {
      audio = data;
      break;
    }
  }
  if (!audio || audio.size < 1000 || audio.size > 24 * 1024 * 1024)
    throw new Error("Missing valid recording");
  const bytes = await audio.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  const { data: replay, error: replayError } = await db
    .from("fp_practice_runs")
    .select("id")
    .eq("user_id", userId)
    .eq("audio_hash", hash)
    .maybeSingle();
  if (replayError || (replay && replay.id !== id)) throw new Error("Duplicate recording");
  const form = new FormData();
  form.set("file", audio, path.split("/").at(-1)!);
  form.set("model", "gpt-4o-transcribe-diarize");
  form.set("response_format", "diarized_json");
  form.set("chunking_strategy", "auto");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Audio verification unavailable");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error("Audio verification failed");
  const speech = (await res.json()) as RecordedDialogue;
  if (!matchesRecordedDialogue(turns, speech, durationSec))
    throw new Error("Recording does not confirm participation");
  // The result and reward commit atomically; a recording hash cannot be rewarded twice.
  return practiceRpc("fp_finish_practice", {
    p_user: userId,
    p_id: id,
    p_audio_hash: hash,
    p_result: {
      ...(run.result ?? {}),
      verified: true,
      durationSec,
      turns,
      questionIds: run.config.questionIds,
      audioPath: path,
      audioDurationSec: speech.duration,
      audioVerification: { model: "gpt-4o-transcribe-diarize", segments: speech.segments },
    },
  });
}
