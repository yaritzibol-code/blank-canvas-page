const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const esbuild = process.env.FP_TEST_ESBUILD
  ? require(process.env.FP_TEST_ESBUILD)
  : createRequire(require.resolve("vite/package.json"))("esbuild");
(async () => {
  const bundled = await esbuild.build({
    entryPoints: [path.join(root, "src/lib/fp/practice-validation.ts")],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
  });
  const mod = { exports: {} };
  new Function("module", "exports", bundled.outputFiles[0].text)(mod, mod.exports);
  const {
    validCompassResult,
    realRtariParticipation,
    matchesRecordedSpeech,
    matchesRecordedDialogue,
  } = mod.exports;
  const base = {
    score: 0,
    metrics: [{ key: "score", label: "Score", value: "0", higherIsBetter: true }],
    input: "touch",
    interruptions: 0,
    interactions: 10,
    advice: "",
  };
  const cases = {
    control: {
      durationSec: 120,
      items: 0,
      raw: { rmsX: 3, rmsY: 3, inBandX: 0, inBandY: 0, saturations: 10, meanRecovery: -1 },
    },
    slalom: {
      durationSec: 120,
      items: 0,
      raw: { gatesTotal: 20, gatesClean: 0, gatesTouch: 0, gatesMiss: 20 },
    },
    multitarea: {
      durationSec: 150,
      items: 0,
      raw: { transfersOk: 0, transfersError: 10, hits: 0, misses: 10, falseAlarms: 10 },
    },
    memoria: {
      durationSec: 30,
      items: 6,
      raw: { blocksTotal: 6, blocksPerfect: 0, fieldsTotal: 24, fieldsCorrect: 0, nearMisses: 4 },
    },
    calculo: {
      durationSec: 10,
      items: 10,
      raw: { total: 10, correct: 0, omitted: 0, medianCorrectSec: -1 },
    },
    orientacion: {
      durationSec: 8,
      items: 8,
      raw: { total: 8, correct: 0, omitted: 0, medianCorrectSec: -1 },
    },
    logica: {
      durationSec: 8,
      items: 8,
      raw: { total: 8, correct: 0, omitted: 0, medianCorrectSec: -1 },
    },
  };
  for (const [moduleId, c] of Object.entries(cases)) {
    const cfg = {
      moduleId,
      mode: "practica",
      level: 1,
      seed: 1,
      durationSec: c.items > 0 ? 0 : c.durationSec,
      items: c.items,
    };
    const result = { ...base, moduleId, durationSec: c.durationSec, raw: c.raw };
    assert.equal(
      validCompassResult(cfg, result, c.durationSec + 1),
      true,
      moduleId + " legitimate zero score",
    );
    assert.equal(
      validCompassResult(cfg, { ...result, interactions: 0 }, c.durationSec + 1),
      false,
      moduleId + " AFK",
    );
    assert.equal(validCompassResult(cfg, result, 1), false, moduleId + " impossible elapsed");
    assert.equal(
      validCompassResult(cfg, { ...result, moduleId: "unknown" }, 999),
      false,
      moduleId + " mismatched module",
    );
  }
  const calcCfg = {
    moduleId: "calculo",
    mode: "examen",
    level: 3,
    seed: 1,
    durationSec: 1080,
    items: 24,
  };
  assert.equal(
    validCompassResult(
      calcCfg,
      {
        ...base,
        moduleId: "calculo",
        durationSec: 20,
        raw: { total: 24, correct: 0, omitted: 23 },
      },
      20,
    ),
    false,
  );
  assert.equal(
    validCompassResult(
      calcCfg,
      {
        ...base,
        moduleId: "calculo",
        durationSec: 1080,
        raw: { total: 24, correct: 0, omitted: 23 },
      },
      1081,
    ),
    true,
  );
  assert.equal(
    validCompassResult(
      calcCfg,
      {
        ...base,
        moduleId: "calculo",
        durationSec: 1080,
        raw: { total: 24, correct: 0, omitted: 24 },
      },
      1081,
    ),
    false,
  );
  console.log(
    "All seven modules: zero-score valid practice; no input, premature/forged result denied; timed exam partial participation handled",
  );
  const turns = [
    { role: "examiner", text: "Tell me about your training." },
    {
      role: "candidate",
      text: "Yesterday during simulator practice we encountered turbulence and demonstrated careful communication with several experienced colleagues.",
    },
    { role: "examiner", text: "What happened next?" },
    {
      role: "candidate",
      text: "Afterwards our instructor reviewed navigation procedures and emergency checklists before preparing another departure safely.",
    },
  ];
  const recorded = turns.map((t) => t.text).join(" ");
  assert.equal(realRtariParticipation(turns, 120), true);
  assert.equal(realRtariParticipation(turns, 30), false);
  assert.equal(
    realRtariParticipation(
      turns.filter((t) => t.role === "examiner"),
      120,
    ),
    false,
  );
  assert.equal(matchesRecordedSpeech(turns, recorded, 119, 120), true);
  assert.equal(
    matchesRecordedSpeech(
      turns,
      turns
        .filter((t) => t.role === "examiner")
        .map((t) => t.text)
        .join(" "),
      120,
      120,
    ),
    false,
  );
  assert.equal(matchesRecordedSpeech(turns, recorded, 10, 120), false);
  assert.equal(
    matchesRecordedSpeech(turns, "Unrelated old audio recording with other content", 120, 120),
    false,
  );
  const dialogue = {
    text: recorded,
    duration: 120,
    segments: turns.map((t, i) => ({
      speaker: t.role,
      text: t.text,
      start: i * 20,
      end: i * 20 + 12,
    })),
  };
  assert.equal(matchesRecordedDialogue(turns, dialogue, 120), true);
  assert.equal(
    matchesRecordedDialogue(
      turns,
      { ...dialogue, segments: dialogue.segments.map((s) => ({ ...s, speaker: "one-speaker" })) },
      120,
    ),
    false,
  );
  assert.equal(
    matchesRecordedDialogue(
      turns,
      { ...dialogue, segments: dialogue.segments.filter((s) => s.speaker === "examiner") },
      120,
    ),
    false,
  );
  console.log(
    "RTARI: real answers + independently transcribed audio match required; silent, short, examiner-only and unrelated recordings denied",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
