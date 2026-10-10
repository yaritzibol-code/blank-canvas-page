const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const ordered = (value) =>
  Array.isArray(value)
    ? value.map(ordered)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, ordered(value[key])]),
        )
      : value;
const records = read("docs/ciaac-transit-remaining-source-integrity.json");
const { restoreText, restoreAsset } = require("./helpers/ciaac-am-st-source-corrections-v2.cjs");
const documentPath = "src/lib/lp/ciaac-transit-approved/documents.json";
// Original candidate hashes remain unchanged and are checked after exact inversion.
const documents = JSON.parse(
  restoreText(documentPath, fs.readFileSync(path.join(root, documentPath), "utf8")),
);
const reviews = read("src/lib/lp/ciaac-transit-approved/publication-review.json");
assert.deepEqual(
  records.map((r) => r.code),
  ["ST02", "ST03", "ST05", "ST06"],
);
let assets = 0;
for (const record of records) {
  const document = documents[record.id];
  assert.equal(
    hash(JSON.stringify(ordered(document))),
    record.documentSha256,
    `${record.code}: exact finalized document, including source qualifications, card order, cleared assessments and exercise`,
  );
  assert.equal(
    reviews.find((r) => r.id === record.id).notebooklmExplanationSha256,
    record.notebooklmExplanationSha256,
  );
  assert.equal(document.stages.filter((s) => s.kind === "content").length, record.boards);
  assert.equal(
    document.stages.filter((s) => s.kind === "content").reduce((n, s) => n + s.cards.length, 0),
    record.cards,
  );
  for (const asset of record.assets) {
    assert.equal(
      hash(
        restoreAsset(
          "public/" + asset.path,
          fs.readFileSync(path.join(root, "public", asset.path)),
        ),
      ),
      asset.sha256,
      asset.path,
    );
    assets++;
  }
}
assert.equal(assets, 94);
console.log(
  "PASS original ST02/ST03/ST05/ST06 source payloads and94 asset identities after declared audit inversion; original assessments, card order and review provenance retained.",
);
