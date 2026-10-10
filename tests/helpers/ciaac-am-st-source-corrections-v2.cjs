const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const ledger = require("../../docs/ciaac-am-st-source-corrections-v2-20261008.json");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const pointer = (parts) =>
  parts.map((p) => "/" + String(p).replace(/~/g, "~0").replace(/\//g, "~1")).join("");
function valueSpans(text) {
  const spans = new Map();
  const space = (i) => {
    while (/\s/.test(text[i] ?? "") && i < text.length) i++;
    return i;
  };
  const stringEnd = (start) => {
    assert.equal(text[start], '"');
    let i = start + 1;
    while (i < text.length) {
      if (text[i] === "\\") i += 2;
      else if (text[i++] === '"') return i;
    }
    throw Error("Unterminated JSON string");
  };
  function parse(start, path) {
    let i = space(start);
    const first = i;
    if (text[i] === "{") {
      i = space(i + 1);
      const keys = new Set();
      while (text[i] !== "}") {
        const end = stringEnd(i),
          key = JSON.parse(text.slice(i, end));
        assert.ok(!keys.has(key), "Unique JSON object keys");
        keys.add(key);
        i = space(end);
        assert.equal(text[i], ":");
        i = space(parse(i + 1, [...path, key]));
        if (text[i] === "}") break;
        assert.equal(text[i], ",");
        i = space(i + 1);
      }
      i++;
    } else if (text[i] === "[") {
      i = space(i + 1);
      let index = 0;
      while (text[i] !== "]") {
        i = space(parse(i, [...path, index++]));
        if (text[i] === "]") break;
        assert.equal(text[i], ",");
        i = space(i + 1);
      }
      i++;
    } else if (text[i] === '"') i = stringEnd(i);
    else {
      while (i < text.length && !/[\s,}\]]/.test(text[i])) i++;
      JSON.parse(text.slice(first, i));
    }
    spans.set(pointer(path), [first, i]);
    return i;
  }
  assert.equal(space(parse(0, [])), text.length);
  return spans;
}
function restoreText(file, text) {
  const record = ledger.files.find((r) => r.file === file);
  assert.ok(record, "Declared correction file");
  assert.equal(hash(text), record.afterSha256, "Exact corrected bytes: " + file);
  let restored = text;
  for (const change of ledger.changes.filter((c) => c.file === file).toReversed()) {
    const span = valueSpans(restored).get(change.pointer);
    assert.ok(span, change.pointer);
    const [start, end] = span;
    assert.equal(restored.slice(start, end), change.afterRaw, change.pointer);
    assert.deepEqual(JSON.parse(change.beforeRaw), change.before);
    assert.deepEqual(JSON.parse(change.afterRaw), change.after);
    restored = restored.slice(0, start) + change.beforeRaw + restored.slice(end);
  }
  assert.equal(hash(restored), record.beforeSha256, "Exact public baseline bytes: " + file);
  return restored;
}
function restoreAsset(file, bytes) {
  const change = ledger.assets.find((r) => r.file === file);
  if (!change) return bytes;
  assert.equal(hash(bytes), change.afterSha256, file);
  const original = Buffer.from(change.beforeText, "utf8");
  assert.equal(hash(original), change.beforeSha256, file);
  return original;
}
module.exports = { ledger, hash, valueSpans, restoreText, restoreAsset };
