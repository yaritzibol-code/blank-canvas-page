const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const documents = JSON.parse(
  fs.readFileSync(path.join(root, "src/lib/lp/ciaac-aerodynamics.content.json"), "utf8"),
);
let questions = 0,
  stages = 0;
for (const [id, d] of Object.entries(documents)) {
  assert.match(id, /^ciaac\/aerodinamica\/modulo-[2-8]-[^/]+\/[^/]+$/);
  assert.equal(d.chapter, Number(id.match(/modulo-(\d+)/)[1]));
  assert.equal(d.number, Number(id.match(/-(\d+)$/)[1]));
  assert.ok(d.title && d.intro && d.sources.length && d.objectives.length);
  assert.equal(d.stages[0].kind, "intro");
  assert.equal(d.stages.at(-1).kind, "finish");
  const tested = new Set();
  for (const s of d.stages) {
    stages++;
    assert.ok(s.nav);
    if (s.kind === "content") {
      assert.ok(s.cards.length);
      for (const c of s.cards) assert.ok(c.title && c.text.length > 20);
      for (const f of s.figures) assert.ok(fs.existsSync(path.join(root, "public", f.file)));
    }
    if (s.kind === "quiz")
      for (const q of s.questions) {
        assert.ok(Number.isInteger(q) && q >= 0 && q < d.questions.length);
        tested.add(q);
      }
  }
  for (const [i, q] of d.questions.entries()) {
    questions++;
    assert.ok(tested.has(i), `${id}: question ${i} reachable`);
    assert.ok(q.prompt && q.feedback && q.options.length >= 2);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length);
    assert.deepEqual(
      [...q.order].sort(),
      q.options.map((_, i) => i),
    );
    assert.equal(
      (q.prompt.match(/¿/g) || []).length,
      (q.prompt.match(/\?/g) || []).length,
      "Paired Spanish question marks",
    );
  }
  for (const s of d.sources)
    assert.ok(s.id && s.title && s.role && (s.verified_locators?.length || s.url));
  const visible = JSON.stringify(d);
  assert.doesNotMatch(
    visible,
    /(?:drive|docs|notebooklm|notebook)\.google\.|sourceDraftId|draftId|visualStatus|graphicsBrief/,
  );
}
console.log(
  `PASS: ${Object.keys(documents).length} reviewed documents; ${stages} stages; ${questions} reachable questions; complete public sources and no private provenance.`,
);
const criticalEngine = Object.values(documents).find((d) => d.chapter === 7 && d.number === 6);
if (criticalEngine) {
  const text = JSON.stringify(criticalEngine.stages);
  assert.match(text, /efecto más adverso sobre las prestaciones o las cualidades de manejo/);
  assert.match(text, /No es necesariamente el izquierdo/);
  assert.ok(criticalEngine.sources.some((s) => s.id === "faa-critical-engine-definition"));
}
