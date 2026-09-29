const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const contentFile = path.join(root, "src/lib/lp/atp-content.generated.ts");
function loader(identity = false) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
    const mod = { exports: {} };
    cache.set(filename, mod);
    const source = fs.readFileSync(filename, "utf8");
    const js = ts.transpileModule(source, { compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
    } }).outputText;
    const localRequire = request => {
      if (identity && filename === contentFile && request === "./atp-content.2026") {
        return { applyAtp2026Updates: original => original };
      }
      if (!request.startsWith(".")) return require(request);
      const resolved = path.resolve(path.dirname(filename), request);
      return load(fs.existsSync(resolved) ? resolved : `${resolved}.ts`);
    };
    vm.runInThisContext(`(function(require, module, exports) {${js}\n})`, { filename })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}
const original = loader(true)(contentFile).ATP_LEARNING_PATHS;
const revised = loader()(contentFile).ATP_LEARNING_PATHS;
const { ATP_2026_NEW_IDS } = loader()(path.join(root, "src/lib/lp/atp-new-paths.2026.ts"));
const taxonomy = JSON.parse(fs.readFileSync(path.join(root, "src/lib/lp/taxonomy.json"), "utf8"));
const atp = taxonomy.categories.find(c => c.id === "linea-aerea").subjects.find(s => s.id === "linea-aerea/atp");
const sequence = atp.containers.flatMap(c => c.learningPaths);
const newIds = Object.values(ATP_2026_NEW_IDS);
assert.equal(Object.keys(original).length, 67);
assert.equal(Object.keys(revised).length, 70);
assert.equal(sequence.length, 71);
assert.equal(new Set(sequence.map(item => item.id)).size, 71);
assert.deepEqual(atp.containers.map(c => Number(c.id.match(/chapter-(\d+)/)[1])), [1, 2, 3, 6, 7, 8]);
assert.equal(sequence.filter(item => !revised[item.id]).length, 1);
assert.match(sequence.find(item => !revised[item.id]).id, /applicable-regulations-1$/);

for (const [id, doc] of Object.entries(original)) {
  const next = revised[id];
  assert.ok(next, `Existing ID lost: ${id}`);
  // Journey keys depend on stage/question/explore indices. Existing assessments must not move.
  assert.deepEqual(next.content.steps.map(s => s.name), doc.content.steps.map(s => s.name), id);
  assert.deepEqual(next.content.steps.map(s => s.questions), doc.content.steps.map(s => s.questions), `Question changed: ${id}`);
  for (const [i, step] of doc.content.steps.entries()) {
    assert.deepEqual(next.content.steps[i].explore?.slice(0, step.explore?.length ?? 0) ?? [], step.explore ?? [], `Explore indices changed: ${id}`);
  }
  assert.match(next.content.source, /2025–2026/);
  assert.ok(next.meta.source_start <= next.meta.source_end);
}
for (const container of atp.containers) {
  assert.deepEqual(container.learningPaths.map(item => item.orden), container.learningPaths.map((_, i) => i + 1));
  for (const item of container.learningPaths) {
    const doc = revised[item.id];
    if (doc) {
      assert.equal(doc.meta.topic_number, item.orden, item.id);
      assert.equal(doc.meta.topic_name, item.titulo, item.id);
    }
  }
}
function neighbors(id, before, after) {
  const index = sequence.findIndex(item => item.id === id);
  assert.ok(index > 0);
  assert.ok(sequence[index - 1].id.endsWith(before));
  assert.ok(sequence[index + 1].id.endsWith(after));
}
neighbors(ATP_2026_NEW_IDS.safety, "national-transportation-safety-board-ntsb-15", "part-135-regulations-16");
neighbors(ATP_2026_NEW_IDS.gnss, "gps-10", "ads-b-12");
neighbors(ATP_2026_NEW_IDS.adsb, "gnss-disruption-and-vor-mon-11", "airport-lighting-and-marking-11");
for (const id of newIds) {
  const doc = revised[id];
  assert.ok(doc.content.steps.length >= 5);
  assert.ok(doc.content.introExplore.length >= 2);
  assert.ok(doc.content.takeaways.length >= 3);
  assert.ok(doc.content.steps.every(step => step.questions.length > 0));
  assert.ok(doc.content.steps.some(step => step.table));
  assert.match(doc.content.source, /FAA/);
  assert.doesNotMatch(JSON.stringify(doc), /helicopter|chapter-4|chapter-5/i);
  for (const step of doc.content.steps) for (const q of step.questions) {
    assert.ok(q.options.length >= 2);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
    assert.ok(q.explanation.length > 30);
  }
}
const revisedTopics = Object.values(revised);
const topic = name => revisedTopics.find(doc => doc.meta.topic_name === name);
assert.match(JSON.stringify(topic("The ATP Certificate").content.steps), /40 años o más en la fecha del examen/);
assert.match(JSON.stringify(topic("The ATP Certificate").content.steps), /tres o más pilotos/);
assert.match(JSON.stringify(topic("Items on the Flight Plan").content.steps), /MEDEVAC/);
assert.doesNotMatch(JSON.stringify(topic("Items on the Flight Plan").content.steps), /El libro usa LIFEGUARD/);
assert.match(JSON.stringify(topic("Speed Adjustments").content.steps), /Mach 0.64/);
assert.match(JSON.stringify(topic("Landing").content.steps), /No se publica 0 en FICON/);
assert.doesNotMatch(topic("Surface Analysis and Constant Pressure Charts").content.source, /\b9310\b|\b9711\b/);
assert.doesNotMatch(topic("Charts").content.source, /\b8839\b/);
// Restore the vocabulary table and add the conversion where weather decisions are taught.
assert.deepEqual(topic("Instrument Approaches").content.steps[0].table,
  Object.values(original).find(d => d.meta.topic_name === "Instrument Approaches").content.steps[0].table);

for (const doc of revisedTopics) for (const step of doc.content.steps) {
  assert.doesNotMatch(step.note ?? "", /<a\s|\uFFFD/, "Notes must be plain text for the unchanged renderer");
  if (!step.figure) continue;
  const src = doc.figures[step.figure.file];
  assert.ok(src, `Unresolved figure: ${step.figure.file}`);
  if (!src.startsWith("/learning-paths/atp/2026/")) continue;
  const publicFile = path.join(root, "public", src);
  const originalFile = path.join(root, "supabase/storage/atp-images", step.figure.file);
  const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  assert.equal(hash(publicFile), hash(originalFile), "Native figure altered");
  assert.ok(step.figure.alt && step.figure.caption);
}
console.log("PASS: 71 paths; 3 new placements; all 298 existing questions and stage keys preserved; exclusions, references and native figures verified.");
