const assert = require("node:assert/strict");
const fs = require("node:fs");
const { ledger, restoreAsset } = require("./helpers/ciaac-manuals-source-corrections-v2.cjs");
const {
  manifest,
  docs,
  file,
  hash,
  valueHash,
  at,
  set,
  covered,
  validateLayer,
  stageText,
} = require("./helpers/flightpath-original-mi.cjs");
validateLayer();
assert.equal(ledger.fixtureScope, "public-didactic-corrections");
assert.equal(ledger.changes.length, 125);
assert.equal(ledger.assets.length, 10);
assert.deepEqual(
  ledger.changes.map((c) => c.sequence),
  Array.from({ length: 125 }, (_, i) => i),
);
let retained = 0,
  superseded = 0,
  metadataRetained = 0,
  metadataSuperseded = 0;
const historicalDidactic = structuredClone(docs);
for (const c of ledger.changes.toReversed()) {
  for (const key of ["beforeSha256", "afterSha256"]) assert.match(c[key], /^[a-f0-9]{64}$/);
  if (c.payloadScope === "hash-only-source-metadata") {
    assert.match(c.pointer, /\/sources(?:\/|$)/);
    for (const key of ["before", "after", "beforeRaw", "afterRaw"])
      assert.ok(!Object.hasOwn(c, key), "Source payload remains excluded");
    if (covered(c.pointer)) metadataSuperseded++;
    else {
      metadataRetained++;
      assert.equal(
        valueHash(at(docs, c.pointer)),
        c.currentValueSha256,
        "Current public citation metadata remains exact",
      );
    }
    continue;
  }
  assert.equal(c.payloadScope, "public-didactic-values");
  assert.doesNotMatch(c.pointer, /\/sources(?:\/|$)/);
  assert.deepEqual(JSON.parse(c.beforeRaw), c.before);
  assert.deepEqual(JSON.parse(c.afterRaw), c.after);
  assert.equal(valueHash(c.before), c.beforeSha256);
  assert.equal(valueHash(c.after), c.afterSha256);
  if (covered(c.pointer)) superseded++;
  else {
    assert.deepEqual(at(historicalDidactic, c.pointer), c.after, c.pointer);
    set(historicalDidactic, c.pointer, c.before);
    retained++;
  }
}
assert.equal(retained, 94);
assert.equal(superseded, 5);
assert.equal(metadataRetained, 9);
assert.equal(metadataSuperseded, 17);
assert.equal(retained + metadataRetained, 103);
assert.equal(superseded + metadataSuperseded, 22);
for (const a of ledger.assets) {
  const bytes = fs.readFileSync(file(a.file));
  assert.equal(hash(bytes), a.afterSha256);
  assert.equal(hash(restoreAsset(a.file, bytes)), a.beforeSha256);
}
const inventory = require("../docs/ciaac-manuals-reconstruction-v2.json");
for (const a of inventory.assets.filter((a) => a.file.endsWith(".png"))) {
  const removed = manifest.removed.find((r) => r.file === a.file);
  assert.ok(removed, "Every retired PNG is individually accounted for");
  assert.equal(removed.sha256, a.sha256);
  assert.equal(fs.existsSync(file(a.file)), false);
}
assert.match(stageText("MI04-01"), /1319/);
assert.match(stageText("MI09-01"), /9\.99/);
assert.match(stageText("MI10-06"), /5°/);
assert.match(stageText("MI10-05"), /ENR 1\.5/);
console.log(
  `PASS public MI corrections: ${retained} exact didactic reversals, ${superseded} explicitly superseded didactic values, ${metadataRetained} exact current citation values, ${metadataSuperseded} superseded citation records, 10 exact SVG corrections, 29 whole-asset retirements. Historical source-metadata reversal is a separate private check.`,
);
