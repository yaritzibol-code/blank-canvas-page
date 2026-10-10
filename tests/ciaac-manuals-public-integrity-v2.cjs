const assert = require("node:assert/strict");
const fs = require("node:fs");
const { loader } = require("./helpers/ts-loader.cjs");
const { restoreAsset } = require("./helpers/ciaac-manuals-source-corrections-v2.cjs");
const {
  manifest,
  docs,
  file,
  hash,
  valueHash,
  validateLayer,
} = require("./helpers/flightpath-original-mi.cjs");
validateLayer();
const records = require("../docs/ciaac-manuals-reconstruction-v2.json");
const review = require("../src/lib/lp/ciaac-manuals-approved/publication-review.json");
const catalog = require("../src/lib/lp/ciaac-manuals-approved/catalog.json");
assert.equal(records.fixtureScope, "public-runtime-integrity");
assert.equal(Object.keys(docs).length, 10);
assert.equal(records.records.length, 10);
assert.equal(records.assets.length, 143);
assert.deepEqual(
  records.records.map((r) => r.id),
  Object.keys(docs),
);
let boards = 0,
  cards = 0;
for (const row of records.records) {
  const d = docs[row.id];
  assert.ok(d);
  assert.equal(valueHash(d), row.documentSha256, "Exact complete public runtime document");
  assert.equal(d.contentVersion, row.contentVersion, "Existing journey identity remains intact");
  const r = review.find((x) => x.id === row.id);
  for (const [key, expected] of Object.entries(row.reviewIdentity)) assert.equal(r[key], expected);
  for (const key of ["scopeReviewed", "visualsReviewed", "assessmentReviewed"])
    assert.equal(r[key], true);
  for (const s of d.stages.filter((s) => s.kind === "content")) {
    boards++;
    cards += s.cards.length;
  }
}
assert.equal(boards, 69);
assert.equal(cards, 328);
for (const a of records.assets) {
  const removed = manifest.removed.find((r) => r.file === a.file);
  if (removed) assert.equal(removed.sha256, a.sha256);
  else assert.equal(hash(restoreAsset(a.file, fs.readFileSync(file(a.file)))), a.sha256, a.file);
}
const load = loader();
const content = load(file("src/lib/lp/ciaac-manuals-approved/content.ts"));
assert.equal(content.APPROVED_MANUALS_ACTIVE, true);
assert.deepEqual(content.APPROVED_MANUALS_READY_IDS, Object.keys(docs));
assert.deepEqual(content.collectReadyApprovedManualsDocuments(docs, []), {});
for (const key of ["scopeReviewed", "visualsReviewed", "assessmentReviewed"])
  assert.deepEqual(
    content.collectReadyApprovedManualsDocuments(
      docs,
      review.map((r) => ({ ...r, [key]: false })),
    ),
    {},
  );
const availability = load(file("src/lib/lp/ciaac-availability.ts"));
for (const r of records.records) assert.equal(availability.isLearningPathAvailable(r.id), true);
assert.deepEqual(
  catalog.lessons.map((x) => x.code),
  Array.from({ length: 10 }, (_, i) => `MI${String(i + 1).padStart(2, "0")}`),
);
console.log(
  "PASS 10 exact public MI runtime documents, 69 boards/328 cards, 143 historical asset identities, review identities and fail-closed gates. Original authoring-source reversal is a separate private check.",
);
