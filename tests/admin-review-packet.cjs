const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const { loader, file } = require("./helpers/ts-loader.cjs");
const {
  makePacket,
  candidateId,
  publishedId,
  missingId,
  svgPath,
} = require("./fixtures/admin-review-synthetic.cjs");
const dom = new JSDOM("");
global.DOMParser = dom.window.DOMParser;
global.XMLSerializer = dom.window.XMLSerializer;
const {
  validateReviewPacket,
  validateReviewSVG,
  parseReviewJSON,
  materializeReviewPacket,
  REVIEW_PACKET_MAX_BYTES,
} = loader()(file("src/lib/lp/admin-review-packet.ts"));
const published = new Set([publishedId]);
const validate = (packet) => validateReviewPacket(JSON.stringify(packet), published);
const rejected = (change) => {
  const packet = makePacket();
  change(packet);
  assert.throws(() => validate(packet));
};
const valid = validate(makePacket());
assert.equal(valid.catalog.length, 3);
assert.ok(!valid.assets[svgPath].content.includes("discarded"));
for (const status of ["candidate", "source-pending", "incomplete"]) {
  const packet = makePacket();
  packet.catalog[1].status = status;
  assert.equal(validate(packet).catalog[1].status, status);
}
rejected((p) => p.catalog.push(p.catalog[0]));
rejected((p) => (p.catalog[1].code = "PUB"));
rejected((p) => (p.catalog[1].status = "published"));
rejected((p) => (p.catalog[0].status = "candidate"));
rejected((p) => (p.documents[publishedId] = p.documents[candidateId]));
rejected((p) => (p.documents["ciaac/synthetic/module/extra"] = p.documents[candidateId]));
rejected((p) => delete p.documents[candidateId]);
rejected((p) => (p.catalog[2].status = "source-pending"));
rejected((p) => (p.catalog[1].subjectId = "other"));
rejected((p) => (p.catalog[1].title = "Different"));
rejected((p) => (p.version = 2));
rejected((p) => (p.unknown = true));
rejected((p) => (p.documents[candidateId].unknown = true));
rejected((p) => (p.assets[svgPath].mime = "text/html"));
rejected((p) => delete p.assets[svgPath]);
rejected((p) => (p.assets["/extra.svg"] = p.assets[svgPath]));
for (const path of [
  "https://example.org/picture.svg",
  "data:image/svg+xml,xxx",
  "javascript:alert(1)",
  "//host/a.svg",
  "/../a.svg",
  "/a/../b.svg",
  "/%2e%2e/a.svg",
  "blob:untrusted",
  "/a.svg?q=x",
])
  rejected((p) => (p.documents[candidateId].figures[0].file = path));
for (const url of [
  "javascript:alert(1)",
  "http://www.faa.gov/",
  "https://localhost/x",
  "https://127.0.0.1/x",
  "https://[::1]/x",
  "https://internal.local/x",
  "https://u:p@www.faa.gov/x",
  "https://www.faa.gov:8443/x",
])
  rejected((p) => (p.documents[candidateId].sources[0].url = url));
for (const fragment of ["<script>alert(1)</script>", "<img src=x onerror=alert(1)>"])
  rejected((p) => (p.documents[candidateId].intro = fragment));
rejected((p) => (p.documents[candidateId].questions[0].correct = 2));
rejected((p) => (p.documents[candidateId].questions[0].order = [0, 0]));
rejected((p) => (p.documents[candidateId].stages[2].questions = [1]));
rejected((p) =>
  p.documents[candidateId].stages.push({ kind: "activity", nav: "Invalid", activityIndex: 0 }),
);
rejected((p) => (p.documents[candidateId].exercise.order = [0, 0]));
rejected((p) => (p.documents[candidateId].exercise = null));
rejected(
  (p) =>
    (p.documents[candidateId].stages[1].board = {
      kind: "mechanism",
      figureNumber: "missing",
      parts: [{ cardIndex: 0, x: 50, y: 50 }],
    }),
);
rejected(
  (p) =>
    (p.documents[candidateId].figures[0].crop = {
      x: 90,
      y: 0,
      width: 20,
      height: 100,
      assetAspectRatio: 1,
    }),
);
rejected((p) =>
  p.documents[candidateId].stages[1].figures.push(p.documents[candidateId].stages[1].figures[0]),
);
rejected((p) => (p.catalog = Array.from({ length: 130 }, () => p.catalog[0])));
assert.throws(() => parseReviewJSON('{"x":1,"x":2}'), /duplicada/);
assert.throws(() => parseReviewJSON('{"x":1,"\\u0078":2}'), /duplicada/);
assert.throws(() => parseReviewJSON('{"__proto__":{"polluted":true}}'), /insegura/);
assert.throws(() => parseReviewJSON('{"constructor":{}}'), /insegura/);
assert.throws(() => parseReviewJSON("[".repeat(34) + "0" + "]".repeat(34)), /estructura/);
assert.throws(() => parseReviewJSON("[" + Array(2001).fill(0).join(",") + "]"), /colección/);
assert.throws(() => parseReviewJSON('"' + "x".repeat(512 * 1024 + 1) + '"'), /cadena/);
assert.throws(() => parseReviewJSON(" ".repeat(REVIEW_PACKET_MAX_BYTES + 1)), /32 MiB/);
for (const json of [
  '{"x":1,}',
  "[1,]",
  '{"x":Infinity}',
  '{"x":1e999}',
  "{} trailing",
  '{"x":"bad\nstring"}',
])
  assert.throws(() => parseReviewJSON(json));
for (const body of [
  "<script>alert(1)</script>",
  "<foreignObject><div>html</div></foreignObject>",
  '<image href="https://evil.com/x"/>',
  '<use href="#x"/>',
  "<style>text {fill:red}</style>",
  '<rect onload="alert(1)"/>',
  '<rect style="fill:red"/>',
  '<rect fill="url(https://evil.com/a.svg#x)"/>',
  '<rect fill="url(#missing)"/>',
  '<rect id="x"/><rect id="x"/>',
  '<g xmlns="http://www.w3.org/1999/xhtml"/>',
  '<a href="https://www.faa.gov/">x</a>',
  '<animate attributeName="fill"/>',
  '<rect width="999999999"/>',
])
  assert.throws(
    () => validateReviewSVG(`<svg xmlns="http://www.w3.org/2000/svg">${body}</svg>`),
    body,
  );
for (const prefix of [
  '<!DOCTYPE svg [<!ENTITY x SYSTEM "https://evil.com/x">]>',
  '<?xml-stylesheet href="https://evil.com/x"?>',
])
  assert.throws(() => validateReviewSVG(prefix + '<svg xmlns="http://www.w3.org/2000/svg"/>'));
const pattern =
  '<svg xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M0 0 L8 8"/></pattern><marker id="arrow" markerWidth="4" markerHeight="4"><path d="M0 0 L4 2 L0 4"/></marker></defs><rect width="100" height="50" fill="url(#p)"/><line x1="0" y1="0" x2="20" y2="20" marker-end="url(#arrow)"/></svg>';
assert.ok(validateReviewSVG(pattern).includes("pattern"));
let created = [],
  revoked = [];
const originalCreate = URL.createObjectURL,
  originalRevoke = URL.revokeObjectURL;
try {
  URL.createObjectURL = (blob) => {
    assert.equal(blob.type, "image/svg+xml");
    const url = `blob:synthetic-${created.length}`;
    created.push(url);
    return url;
  };
  URL.revokeObjectURL = (url) => revoked.push(url);
  const loaded = materializeReviewPacket(valid);
  assert.equal(loaded.documents[candidateId].figures[0].file, created[0]);
  assert.equal(loaded.documents[candidateId].stages[1].figures[0].file, created[0]);
  loaded.dispose();
  loaded.dispose();
  assert.deepEqual(revoked, created);
  const broken = structuredClone(valid);
  broken.assets["/second.svg"] = broken.assets[svgPath];
  created = [];
  revoked = [];
  URL.createObjectURL = () => {
    if (created.length) throw Error("allocation failed");
    created.push("blob:first");
    return "blob:first";
  };
  assert.throws(() => materializeReviewPacket(broken), /allocation failed/);
  assert.deepEqual(revoked, created);
} finally {
  URL.createObjectURL = originalCreate;
  URL.revokeObjectURL = originalRevoke;
}
console.log(
  "PASS private packet validation: strict schema, duplicate/prototype keys, bounds, published identity, all document/exercise/asset refs, unsafe links/images/markup, inert SVG whitelist and URL rollback/disposal.",
);
