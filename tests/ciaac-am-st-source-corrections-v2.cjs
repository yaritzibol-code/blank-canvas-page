const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  ledger,
  hash,
  restoreText,
  restoreAsset,
} = require("./helpers/ciaac-am-st-source-corrections-v2.cjs");
const root = path.resolve(__dirname, "..");
const byCode = {};
let changed = 0;
for (const record of ledger.files) {
  const text = fs.readFileSync(path.join(root, record.file), "utf8");
  const before = JSON.parse(restoreText(record.file, text));
  const after = JSON.parse(text);
  assert.deepEqual(Object.keys(before), Object.keys(after));
  assert.throws(() => restoreText(record.file, text + " "), /Exact corrected bytes/);
  for (const [id, document] of Object.entries(after)) {
    const original = before[id];
    const code = id.split("/").at(-1).slice(0, 4).toUpperCase();
    byCode[code] = document;
    for (const field of ["contentVersion", "completionChecks", "exercise"])
      assert.deepEqual(document[field], original[field], `${code}: original ${field}`);
    assert.deepEqual(
      document.stages.map((s) => [s.kind, s.id, s.nav]),
      original.stages.map((s) => [s.kind, s.id, s.nav]),
    );
    assert.deepEqual(
      (document.questions ?? []).map((q) => [q.prompt, q.correct, q.options?.length]),
      (original.questions ?? []).map((q) => [q.prompt, q.correct, q.options?.length]),
    );
    assert.deepEqual(
      document.figures.map((f) => [f.number, f.file, f.assetAspectRatio, f.crop]),
      original.figures.map((f) => [f.number, f.file, f.assetAspectRatio, f.crop]),
    );
    for (const stage of document.stages.filter((s) => s.kind === "content"))
      for (const figure of stage.figures ?? [])
        assert.deepEqual(
          figure,
          document.figures.find((f) => f.number === figure.number),
          `${code}: canonical figure replica`,
        );
    if (JSON.stringify(document) !== JSON.stringify(original)) changed++;
  }
}
assert.equal(changed, 9, "Nine lessons cover ten bounded findings");
assert.equal(ledger.changes.length, 39);
assert.equal(ledger.assets.length, 3);
const content = (code) => JSON.stringify(byCode[code]);
assert.match(content("AM01"), /dirigible o de giro libre según el diseño/);
assert.match(content("AM01"), /am01-faa-phak-25c-landing-gear/);
assert.match(content("AM07"), /10-30–10-31/);
assert.match(content("AM11"), /AyM\/7-2-3, PDF 37/);
assert.doesNotMatch(content("AM11"), /AyM\/7-2-3, PDF 36/);
assert.match(byCode.AM14.questions[0].options[1], /nitrógeno o aire, según la instalación/);
assert.match(byCode.AM14.questions[0].feedback, /nitrógeno o aire, según la instalación/);
assert.equal(byCode.AM14.questions[0].correct, 1);
assert.match(content("AM17"), /químico o térmico según el agente/);
assert.doesNotMatch(content("AM17"), /Agentes de evaporación rápida que inhiben químicamente/);
for (const number of ["AM17-agent-concept-2", "AM17-agent-concept-3"])
  assert.match(
    byCode.AM17.figures.find((f) => f.number === number).caption,
    /inadecuados como equipo de cabina de mando o pasajeros/,
  );
assert.match(
  byCode.AM17.sources.find((s) => s.id === "am17-faa-ac150-5210-6e").limit,
  /no acredita aprobación para uso en cabina/,
);
assert.match(content("ST02"), /si ésta fuera 280 nudos/);
assert.match(content("ST02"), /El escenario no identifica 280 nudos como TAS consignada en el FPL/);
assert.doesNotMatch(content("ST02"), /Dado que 7.14% excede.*notificar de inmediato/);
assert.match(content("ST03"), /las clases A y B comparten las celdas/);
assert.match(content("ST03"), /corresponde a C y D/);
assert.match(content("ST03"), /PDF 105, AP 4-1/);
assert.match(content("ST05"), /Siempre que sea necesario.*bajas temperaturas/);
assert.match(
  byCode.ST06.stages[7].cards[0].text,
  /Manual de Servicios.*PDF págs\. 61–62.*Anexo 11.*PDF págs\. 77–78/,
);
assert.ok(ledger.limitations.some((s) => /no valida.*examen/i.test(s)));
for (const asset of ledger.assets) {
  const bytes = fs.readFileSync(path.join(root, asset.file));
  assert.equal(hash(bytes), asset.afterSha256);
  assert.equal(hash(restoreAsset(asset.file, bytes)), asset.beforeSha256);
  assert.throws(
    () => restoreAsset(asset.file, Buffer.concat([bytes, Buffer.from(" ")])),
    /Assertion/,
  );
  if (asset.file.includes("radar-surveillance"))
    assert.match(bytes.toString(), /corrección si es necesaria/);
  else {
    assert.match(bytes.toString(), /RADIO · OACI 2016/);
    assert.doesNotMatch(bytes.toString(), /IFR \+ VFR \*\*/);
  }
}
console.log(
  "PASS ten source-qualified AM/ST findings, 39 exact JSON deltas, three reversible SVG changes, canonical replicas and unchanged progress/question identities. Original fixtures remain intact.",
);
