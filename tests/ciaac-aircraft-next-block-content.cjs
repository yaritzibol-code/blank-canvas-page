const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const json = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const docs = json("src/lib/lp/ciaac-aircraft-approved/documents.json");
const fixture = json("tests/fixtures/ciaac-aircraft-next-block.json");
const canonical = (x) =>
  Array.isArray(x)
    ? x.map(canonical)
    : x && typeof x === "object"
      ? Object.fromEntries(
          Object.keys(x)
            .sort()
            .map((k) => [k, canonical(x[k])]),
        )
      : x;
const digest = (x) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify(canonical(x)))
    .digest("hex");
for (const [id, hash] of Object.entries(fixture.existingDocumentHashes))
  assert.equal(digest(docs[id]), hash, `Existing reviewed lesson preserved: ${id}`);
for (const [id, hash] of Object.entries(fixture.newSourceContentHashes)) {
  const d = docs[id];
  assert.equal(
    digest(
      Object.fromEntries(
        [
          "intro",
          "objectives",
          "completionChecks",
          "cards",
          "questions",
          "sources",
          "contentVersion",
        ].map((k) => [k, d[k]]),
      ),
    ),
    hash,
    `Reviewed source wording and assessments preserved: ${id}`,
  );
  assert.equal(new Set(d.figures.map((f) => f.number)).size, d.figures.length);
  for (const s of d.stages.filter((s) => s.kind === "content"))
    for (const f of s.figures)
      assert.deepEqual(
        f,
        d.figures.find((c) => c.number === f.number),
      );
}
for (const asset of fixture.runtimeAssets) {
  const bytes = fs.readFileSync(path.join(root, "public", asset.file.replace(/^\//, "")));
  assert.equal(bytes.length, asset.bytes);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), asset.sha256, asset.file);
}
const am18 = Object.values(docs).find((d) => d.number === 18);
assert.equal(am18.contentVersion, "am18-grouped-candidate-v3-corr2");
assert.equal(am18.questions[0].correct, 1);
assert.equal(am18.completionChecks[0], am18.questions[0].prompt);
console.log(
  "PASS: AM01–10 exact document preservation; AM11–19 reviewed text, 17 assessments, unique canonical figures, CORR2 question/answer mirror and 62 source-exact runtime assets.",
);
