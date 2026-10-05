const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const documents = JSON.parse(
  fs.readFileSync(path.join(root, "src/lib/lp/ciaac-aircraft-engines.content.json"), "utf8"),
);
let questions = 0,
  stages = 0;
for (const [id, d] of Object.entries(documents)) {
  assert.match(id, /^ciaac\/aeronaves-y-motores\/modulo-[1-7]-[^/]+\/[^/]+$/);
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
const taxonomy = JSON.parse(fs.readFileSync(path.join(root, 'src/lib/lp/taxonomy.json'), 'utf8'));
function collect(value) {
  if (Array.isArray(value)) return value.flatMap(collect);
  if (!value || typeof value !== 'object') return [];
  return [...(value.id?.startsWith('ciaac/aeronaves-y-motores/') && value.id.split('/').length === 4 ? [value.id] : []), ...Object.values(value).flatMap(collect)];
}
const canonicalIds = collect(taxonomy);
assert.equal(canonicalIds.length, 40, 'Original subject retains all 40 canonical routes');
for (const id of Object.keys(documents)) assert.ok(canonicalIds.includes(id), `Stable canonical ID: ${id}`);
const svgIds = new Set();
for (const d of Object.values(documents)) {
  const renderedFigures = d.stages.flatMap(s => s.figures || []);
  assert.ok(renderedFigures.length > 0, 'Ready lesson has a contextual figure');
  for (const figure of d.figures) {
    const svg = fs.readFileSync(path.join(root, 'public', figure.file), 'utf8');
    assert.match(svg, /aria-labelledby="[^"]+"/);
    assert.match(svg, /<desc id="[^"]+">[^<]+<\/desc>/);
    for (const [, id] of svg.matchAll(/\bid="([^"]+)"/g)) {
      assert.ok(!svgIds.has(id), `Globally unique diagram identifier ${id}`); svgIds.add(id);
    }
    assert.ok(figure.caption.startsWith('Diagrama original'));
  }
}
console.log('PASS: exact canonical route identity, 40-route taxonomy preserved, distinct accessible figure IDs and original attribution.');
const pitotLesson = Object.values(documents).find(d => d.chapter === 6 && d.number === 9);
if (pitotLesson) {
  assert.match(JSON.stringify(pitotLesson.stages), /presión total o de estancamiento/);
  assert.doesNotMatch(JSON.stringify(pitotLesson.stages), /presión total o de impacto/);
}
assert.equal(Object.keys(documents).length, 40, 'The entire subject is reviewed and registered');
assert.deepEqual(Object.keys(documents).sort(), canonicalIds.sort());
const abnormalities = Object.values(documents).find(d => d.chapter === 3 && d.number === 7);
assert.match(JSON.stringify(abnormalities.stages), /(?:No se identificó|no aportan) una definición específica/);
assert.match(JSON.stringify(abnormalities.stages), /Una precámara diésel es un componente/);
assert.ok(abnormalities.sources.some(s => s.id === 'notebook-editorial-support' && /no es una fuente técnica primaria/.test(s.role)));
assert.ok(abnormalities.sources.some(s => s.verified_locators?.some(l => l.includes('AyM/7-2-10'))));
