const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const esbuild = createRequire(require.resolve("vite/package.json"))("esbuild");
const root = path.resolve(__dirname, "..");
async function bundle(file, plugins = []) {
  const build = await esbuild.build({
    entryPoints: [path.join(root, file)],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    plugins,
  });
  const mod = { exports: {} };
  new Function("module", "exports", build.outputFiles[0].text)(mod, mod.exports);
  return mod.exports;
}
(async () => {
  const engine = await bundle("src/lib/fp/fp.server.ts");
  const taxonomy = require("../src/lib/lp/taxonomy.json");
  const subject = taxonomy.categories.find((c) => c.id === "linea-aerea").subjects[0];
  const ids = subject.containers.flatMap((c) => c.learningPaths).map((item) => item.id);
  assert(ids.length > 1);
  const rules = new Map(
    ["learning_path", "materia_completa"].map((key, index) => [
      key,
      { key, enabled: true, value: { fp: index ? 100 : 20 } },
    ]),
  );
  const state = {
    activity: [],
    quizzes: [],
    sims: [],
    temas: [],
    flash: [],
    logros: [],
    studyDays: {},
  };
  state.temas = ids
    .slice(0, -1)
    .map((id) => ({ temaId: "lp:" + id, completado: true, fecha: "2026-09-26T12:00:00Z" }));
  assert(!engine.derivarEventos(state, rules).some((e) => e.ruleKey === "materia_completa"));
  state.temas.push({ temaId: "lp:" + ids.at(-1), completado: true, fecha: "2026-09-26T13:00:00Z" });
  const events = engine.derivarEventos(state, rules);
  assert.equal(events.filter((e) => e.ruleKey === "learning_path").length, ids.length);
  assert(
    events
      .filter((e) => e.ruleKey === "learning_path")
      .every((e) => e.amount === 20 && e.eventKey === "lp:" + e.activityId),
  );
  assert.equal(events.find((e) => e.eventKey === "materia:" + subject.id).amount, 100);
  assert.deepEqual(engine.derivarEventos(state, rules), events);
  state.activity.push({ kind: "rtari", id: "historical" }, { kind: "compass", id: "historical" });
  assert.deepEqual(engine.derivarEventos(state, rules), events);
  console.log(
    "Real taxonomy: last required LP grants materia100; LP20 stable keys; historical practice does not derive rewards",
  );

  const user = "user-fixture",
    id = "run-fixture";
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
  let run, replay, audio, speech, downloads, calls, transcriptions;
  const reset = () => {
    run = {
      kind: "rtari",
      state: "closed",
      started_at: new Date(Date.now() - 130000).toISOString(),
      connected_at: new Date(Date.now() - 120000).toISOString(),
      closed_at: new Date().toISOString(),
      config: { maxSeconds: 600, questionIds: ["q1", "q2"] },
      debrief: { level: 1 },
    };
    replay = null;
    audio = new Blob(["a".repeat(2000)], { type: "audio/webm" });
    downloads = [];
    calls = [];
    transcriptions = 0;
    speech = {
      text: turns.map((t) => t.text).join(" "),
      duration: 120,
      segments: turns.map((t, i) => ({
        speaker: t.role,
        text: t.text,
        start: i * 20,
        end: i * 20 + 12,
      })),
    };
  };
  global.__fpTestDb = {
    from: (table) => {
      const filters = {};
      const query = {
        select: () => query,
        eq: (k, v) => {
          filters[k] = v;
          return query;
        },
        maybeSingle: async () => {
          assert.equal(table, "fp_practice_runs");
          assert.equal(filters.user_id, user);
          return { data: "audio_hash" in filters ? replay : run, error: null };
        },
      };
      return query;
    },
    storage: {
      from: (bucket) => ({
        download: async (p) => {
          assert.equal(bucket, "rtari-audio");
          downloads.push(p);
          return { data: audio, error: null };
        },
      }),
    },
    rpc: async (name, args) => {
      calls.push({ name, args });
      return {
        data: name === "fp_reconcile_balance" ? 50 : { nuevos: [{ amount: 50 }], total: 50 },
        error: null,
      };
    },
  };
  const originalFetch = global.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-fixture-key";
  global.fetch = async (url, request) => {
    assert.equal(url, "https://api.openai.com/v1/audio/transcriptions");
    assert.equal(request.body.get("model"), "gpt-4o-transcribe-diarize");
    assert.equal(request.body.get("response_format"), "diarized_json");
    assert.equal(request.body.get("chunking_strategy"), "auto");
    transcriptions++;
    return { ok: true, json: async () => speech };
  };
  try {
    const helpers = await bundle("src/lib/fp/practice.server.ts", [
      {
        name: "mock-service",
        setup(build) {
          build.onResolve({ filter: /^@\/integrations\/supabase\/client\.server$/ }, () => ({
            path: "service",
            namespace: "fixture",
          }));
          build.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
            contents: "export const supabaseAdmin = globalThis.__fpTestDb;",
            loader: "js",
          }));
        },
      },
    ]);
    reset();
    await helpers.completeRtari(user, id, turns, 120);
    assert.deepEqual(downloads, [user + "/" + id + ".webm"]);
    assert.equal(calls[0].name, "fp_finish_practice");
    assert.equal(calls[0].args.p_id, id);
    assert.equal(calls[0].args.p_result.verified, true);
    assert.equal(calls[0].args.p_audio_hash.length, 64);
    assert.equal(transcriptions, 1);
    for (const mutate of [
      () => (run = null),
      () => (run.state = "abandoned"),
      () => (audio = null),
      () => (replay = { id: "other-run" }),
      () => speech.segments.forEach((s) => (s.speaker = "one-voice")),
    ]) {
      reset();
      mutate();
      await assert.rejects(() => helpers.completeRtari(user, id, turns, 120));
      assert.equal(calls.length, 0);
    }
    reset();
    run.state = "completed";
    assert.deepEqual(await helpers.completeRtari(user, id, turns, 120), { nuevos: [], total: 50 });
    assert.equal(downloads.length, 0);
    assert.equal(transcriptions, 0);
    console.log(
      "Server RTARI: canonical recording + two speakers required; unknown/abandoned/missing/replayed rejected; low debrief score irrelevant; completed retry performs no transcription or reward",
    );
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
    delete global.__fpTestDb;
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
