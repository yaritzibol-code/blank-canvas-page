const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const ledger = require("../../docs/ciaac-manuals-source-corrections-v2-20261008.json");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
function restoreAsset(file, bytes) {
  const change = ledger.assets.find((r) => r.file === file);
  if (!change) return bytes;
  assert.equal(hash(bytes), change.afterSha256, file);
  const original = Buffer.from(change.beforeText, "utf8");
  assert.equal(hash(original), change.beforeSha256, file);
  assert.equal(hash(change.afterText), change.afterSha256, file);
  return original;
}
// Full document/source-metadata reversal belongs to the separate historical suite.
// The public fixture deliberately cannot provide that operation.
module.exports = { ledger, hash, restoreAsset };
