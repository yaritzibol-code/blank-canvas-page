// Isolated PostgreSQL QA: FP_QA_DEPS points to a test-only @electric-sql/pglite install.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require(process.env.FP_QA_DEPS + "/@electric-sql/pglite");
const root = path.resolve(__dirname, "..");
const user = "00000000-0000-4000-8000-000000000001";
let db;
const sql = (text, args = []) => db.query(text, args);
async function start(moduleId = "memoria", batch = null, newBatch = false) {
  const config = {
    moduleId,
    mode: batch || newBatch ? "simulacro" : "practica",
    level: 3,
    seed: 1,
    items: 5,
    durationSec: 0,
    moduleVersion: 2,
    scoringVersion: 2,
  };
  return (
    await sql("select fp_begin_compass($1,$2,$3,$4) result", [
      user,
      JSON.stringify(config),
      batch,
      newBatch,
    ])
  ).rows[0].result;
}
async function finish(id, result = { validated: true }, audio = null) {
  return (
    await sql("select fp_finish_practice($1,$2,$3,$4) result", [
      user,
      id,
      JSON.stringify(result),
      audio,
    ])
  ).rows[0].result;
}
const amount = (r) => r.nuevos.reduce((s, n) => s + n.amount, 0);
async function rtari(state = "closed", historical = false) {
  return (
    await sql(
      `insert into fp_practice_runs(user_id,kind,config,state,connected_at,closed_at,started_at)
 values($1,'rtari','{}',$2,clock_timestamp()-interval '100 seconds',clock_timestamp(),clock_timestamp()-($3::boolean::int * interval '1 day')) returning id`,
      [user, state, historical],
    )
  ).rows[0].id;
}
(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
 CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';
 CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql AS 'SELECT false';`);
  const base = fs
    .readFileSync(path.join(root, "drizzle/migrations/0002_flightpoints_core.sql"), "utf8")
    .split("-- ── Rankings")[0];
  await db.exec(base);
  await db.exec(`insert into fp_rules(key,label,categoria,value) values
 ('learning_path','LP','Study','{"fp":100}'),('materia_completa','Materia','Study','{"fp":1000}'),('material_completado','Material','Study','{"fp":5}');`);
  await db.exec(
    fs.readFileSync(
      path.join(root, "supabase/migrations/20260926010000_fp_practice_rewards.sql"),
      "utf8",
    ),
  );
  const rules = (await sql("select key,value from fp_rules")).rows;
  assert.equal(rules.find((r) => r.key === "learning_path").value.fp, 20);
  assert.equal(rules.find((r) => r.key === "materia_completa").value.fp, 100);
  assert.equal(rules.find((r) => r.key === "material_completado").value.fp, 5);
  console.log("Rules: LP20, materia100, other rewards unchanged");
  // The old stable event keys remain lifetime unique; values come from the migrated rules.
  for (const [key, rule] of [
    ["lp:new-path", "learning_path"],
    ["materia:new-subject", "materia_completa"],
  ]) {
    for (let i = 0; i < 3; i++)
      await sql(
        `insert into fp_transactions(user_id,event_key,rule_key,activity_type,amount) select $1,$2,key,key,(value->>'fp')::int from fp_rules where key=$3 on conflict(user_id,event_key) do nothing`,
        [user, key, rule],
      );
  }
  assert.equal(
    (
      await sql(
        "select sum(amount)::int total from fp_transactions where rule_key in ('learning_path','materia_completa')",
      )
    ).rows[0].total,
    120,
  );
  console.log("LP/materia stable event keys: reopening/reclaim does not duplicate");
  const oldRtari = await rtari("closed", true);
  await assert.rejects(() => finish(oldRtari, { verified: true }, "old-audio"));
  let a = await rtari();
  assert.equal(amount(await finish(a, { verified: true, nivelGlobal: 1 }, "audio-1")), 50);
  const duplicate = await Promise.all([
    finish(a, { verified: true }, "audio-1"),
    finish(a, { verified: true }, "audio-1"),
  ]);
  assert.equal(
    duplicate.reduce((s, r) => s + amount(r), 0),
    0,
  );
  const b = await rtari();
  assert.equal(amount(await finish(b, { verified: true }, "audio-2")), 50);
  const c = await rtari();
  assert.equal(amount(await finish(c, { verified: true }, "audio-3")), 0);
  for (const state of ["started", "connected", "abandoned"])
    await assert.rejects(async () =>
      finish(await rtari(state), { verified: true }, "bad-" + state),
    );
  await assert.rejects(async () => finish(await rtari(), { verified: true }, "audio-1"));
  console.log(
    "RTARI: 50+50+0, low score allowed, duplicates/abandon/history/replayed audio rejected",
  );
  a = await start();
  const simultaneous = await Promise.all([finish(a.id), finish(a.id)]);
  assert.equal(
    simultaneous.reduce((s, r) => s + amount(r), 0),
    10,
  );
  a = await start();
  assert.equal(amount(await finish(a.id)), 0);
  a = await start("calculo");
  assert.equal(amount(await finish(a.id)), 10);
  a = await start("control");
  await sql("select fp_mark_practice($1,$2,'abandoned')", [user, a.id]);
  await assert.rejects(() => finish(a.id));
  a = await start("logica");
  await sql(
    "update fp_practice_runs set started_at=clock_timestamp()-interval '1 day' where id=$1",
    [a.id],
  );
  await assert.rejects(() => finish(a.id));
  console.log("Compass: first Memoria10, repeat0, Cálculo10, quit/history0, simultaneous only10");
  const modules = [
    "control",
    "slalom",
    "calculo",
    "memoria",
    "multitarea",
    "orientacion",
    "logica",
  ];
  let totalBonus = 0;
  for (let cycle = 0; cycle < 2; cycle++) {
    let batch = null;
    for (let i = 0; i < 7; i++) {
      a = await start(modules[i], batch, i === 0);
      batch = a.simulacroId;
      const r = await finish(a.id);
      const bonus = r.nuevos
        .filter((n) => n.activity_type === "compass_bateria")
        .reduce((s, n) => s + n.amount, 0);
      assert.equal(bonus, i === 6 && cycle === 0 ? 30 : 0);
      totalBonus += bonus;
    }
    assert.equal(amount(await finish(a.id)), 0);
  }
  assert.equal(totalBonus, 30);
  const compassTotal = (
    await sql(
      "select sum(amount)::int total from fp_transactions where rule_key in ('compass_modulo','compass_bateria')",
    )
  ).rows[0].total;
  assert.equal(compassTotal, 100);
  a = await start("control", null, true);
  await assert.rejects(() => start("logica", a.simulacroId));
  await finish(a.id);
  a = await start("slalom", a.simulacroId);
  await sql("select fp_mark_practice($1,$2,'abandoned')", [user, a.id]);
  await assert.rejects(() => start("slalom", a.simulacroId));
  console.log(
    "Battery: <7 no bonus; 7 same ID30; repeated/second battery0; order/abandon enforced; Compass daily100",
  );
  const day = (
    await sql(
      "select to_char(timestamptz '2026-09-26 05:59:59+00' at time zone 'America/Mexico_City','YYYY-MM-DD') a,to_char(timestamptz '2026-09-26 06:00:00+00' at time zone 'America/Mexico_City','YYYY-MM-DD') b",
    )
  ).rows[0];
  assert.equal(day.a, "2026-09-25");
  assert.equal(day.b, "2026-09-26");
  const ledger = (
    await sql("select sum(amount)::int total from fp_transactions where status='procesada'")
  ).rows[0].total;
  const balance = (await sql("select fp_reconcile_balance($1) total", [user])).rows[0].total;
  assert.equal(balance, ledger);
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    await assert.rejects(() =>
      sql("select fp_finish_practice($1,$2,$3)", [user, a.id, '{"validated":true}']),
    );
    await assert.rejects(() => sql("select * from fp_practice_runs"));
    await db.exec("reset role");
  }
  console.log(
    "Mexico midnight boundary, ledger=balance, no client access to private runs/award RPC",
  );
  await db.close();
})().catch(async (e) => {
  console.error(e);
  if (db) await db.close();
  process.exit(1);
});
