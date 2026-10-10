const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../..");
const file = (p) => path.join(root, p);
const manifest = require("../../docs/flightpath-original-mi-20261010.json");
const docs = require("../../src/lib/lp/ciaac-manuals-approved/documents.json");
const hash = (v) => crypto.createHash("sha256").update(v).digest("hex");
const ordered = (v) =>
  Array.isArray(v)
    ? v.map(ordered)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, ordered(v[k])]),
        )
      : v;
const valueHash = (v) => hash(JSON.stringify(ordered(v)));
const parts = (p) =>
  p
    .split("/")
    .slice(1)
    .map((x) => x.replace(/~1/g, "/").replace(/~0/g, "~"));
const at = (obj, p) => parts(p).reduce((v, k) => v?.[k], obj);
const set = (obj, p, value) => {
  const ks = parts(p),
    k = ks.pop();
  ks.reduce((v, key) => v[key], obj)[k] = value;
};
const covered = (p) =>
  manifest.changedValues.some(
    (c) => p === c.pointer || p.startsWith(c.pointer + "/") || c.pointer.startsWith(p + "/"),
  );
const idFor = (n) => Object.keys(docs).find((id) => docs[id].number === n);
const stage = (id) =>
  Object.values(docs)
    .flatMap((d) => d.stages)
    .find((s) => s.id === id);
const stageText = (id) =>
  stage(id)
    .cards.map((c) => [c.title, c.text, c.detailText].filter(Boolean).join("\n"))
    .join("\n");
function validateLayer() {
  assert.deepEqual(manifest.scope, ["MI04", "MI07", "MI08", "MI09", "MI10"]);
  assert.equal(hash(fs.readFileSync(file(manifest.documentFile))), manifest.afterDocumentSha256);
  for (const r of manifest.unchangedSubtrees)
    assert.equal(valueHash(at(docs, r.pointer)), r.sha256, `Unchanged subtree: ${r.pointer}`);
  for (const r of manifest.changedValues)
    assert.equal(
      at(docs, r.pointer) === undefined ? null : valueHash(at(docs, r.pointer)),
      r.afterSha256,
      `Reviewed replacement: ${r.pointer}`,
    );
  for (const r of manifest.protectedFiles)
    assert.equal(
      hash(fs.readFileSync(file(r.file))),
      r.sha256,
      `Protected runtime file or public fixture: ${r.file}`,
    );
  for (const r of manifest.assets)
    assert.equal(hash(fs.readFileSync(file(r.file))), r.sha256, r.file);
  for (const r of manifest.removed)
    assert.equal(fs.existsSync(file(r.file)), false, `Whole retired asset removed: ${r.file}`);
  assert.equal(manifest.removed.length, 29);
  assert.equal(manifest.removed.filter((r) => r.used).length, 25);
  assert.equal(manifest.removed.filter((r) => !r.used).length, 4);
  assert.equal(manifest.assets.length, 24);
  assert.equal(new Set(manifest.assets.map((r) => r.file)).size, 24);
  for (const r of manifest.removed) {
    assert.equal(r.used, r.replacements.length > 0);
    for (const asset of r.replacements)
      assert.ok(manifest.assets.some((a) => a.file === "public" + asset));
  }
  for (const row of manifest.coverage) {
    const d = docs[row.id];
    assert.equal(d.contentVersion, row.contentVersion, "Journey version retained");
    assert.equal(d.assessmentVersion, "flightpath-original-20261010-v1");
    assert.deepEqual(
      d.stages.map((s) => [s.id ?? null, s.kind]),
      row.stages,
    );
    assert.equal(
      d.stages.reduce((n, s) => n + (s.cards?.length ?? 0), 0),
      row.cardCount,
    );
    assert.equal(d.figures.length, row.figureCount);
    assert.equal(d.exercise.kind, row.exerciseKind);
    assert.deepEqual(d.exercise.order, row.exerciseOrder);
    assert.deepEqual(d.exercise.pairs, row.pairs);
    assert.deepEqual(d.completionChecks, row.completionChecks);
    assert.deepEqual(
      d.completionChecks,
      d.exercise.pairs.map((p) => p[0]),
    );
  }
  for (const d of Object.values(docs))
    for (const s of d.stages)
      for (const f of s.figures ?? [])
        assert.deepEqual(
          f,
          d.figures.find((x) => x.number === f.number),
          "Canonical figure and displayed mirror agree",
        );
}
module.exports = {
  manifest,
  docs,
  file,
  hash,
  valueHash,
  at,
  set,
  covered,
  idFor,
  stage,
  stageText,
  validateLayer,
};
