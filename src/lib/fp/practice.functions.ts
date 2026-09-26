import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildRunConfig,
  COMPASS_MODULE_VERSION,
  COMPASS_SCORING_VERSION,
} from "@/modules/compass/config";
import type { CompassResult } from "@/modules/compass/types";
const id = z.string().uuid();
export const beginCompassPractice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        moduleId: z.enum([
          "control",
          "slalom",
          "memoria",
          "calculo",
          "orientacion",
          "multitarea",
          "logica",
        ]),
        mode: z.enum(["practica", "examen", "simulacro"]),
        level: z.number().int().min(1).max(5),
        simulacroId: id.optional(),
        newBatch: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { practiceRpc } = await import("./practice.server");
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const config = {
      ...buildRunConfig(data.moduleId, data.mode, data.level, seed),
      moduleVersion: COMPASS_MODULE_VERSION,
      scoringVersion: COMPASS_SCORING_VERSION,
    };
    return practiceRpc("fp_begin_compass", {
      p_user: context.userId,
      p_config: config,
      p_batch: data.simulacroId ?? null,
      p_new_batch: data.newBatch ?? false,
    });
  });
export const finishCompassPractice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id,
        result: z.object({
          moduleId: z.enum([
            "control",
            "slalom",
            "memoria",
            "calculo",
            "orientacion",
            "multitarea",
            "logica",
          ]),
          score: z.number().finite().min(0).max(100),
          durationSec: z.number().finite().min(0).max(7200),
          interactions: z.number().int().min(0).max(10000000),
          interruptions: z.number().int().min(0).max(10000),
          input: z.enum(["teclado", "mouse", "touch", "mixto"]),
          raw: z.record(z.number().finite()),
          metrics: z
            .array(
              z.object({
                key: z.string().max(80),
                label: z.string().max(200),
                value: z.string().max(200),
                higherIsBetter: z.boolean(),
                hint: z.string().max(1000).optional(),
              }),
            )
            .max(30),
          advice: z.string().max(3000),
        }),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { completeCompass } = await import("./practice.server");
    return completeCompass(context.userId, data.id, data.result as CompassResult);
  });
export const markPracticeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id, action: z.enum(["connected", "abandoned"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { markPractice } = await import("./practice.server");
    await markPractice(context.userId, data.id, data.action);
    return { ok: true };
  });
export const finishRtariPractice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id,
        durationSec: z.number().int().min(0).max(1320),
        turns: z
          .array(
            z.object({
              role: z.enum(["examiner", "candidate"]),
              text: z.string().min(1).max(3000),
            }),
          )
          .min(1)
          .max(120),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { completeRtari } = await import("./practice.server");
    return completeRtari(context.userId, data.id, data.turns, data.durationSec);
  });
