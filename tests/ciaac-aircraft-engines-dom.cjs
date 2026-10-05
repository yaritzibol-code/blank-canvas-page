const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const file = (relative) => path.join(root, relative);
const read = (relative) => fs.readFileSync(file(relative), "utf8");

// Transpile the actual application TSX and mount it with React DOM in jsdom.
// Only persistence and the outer navigation hook are stubbed; no live account or network.
const compiledScripts = new Map();
function loader(stubs = {}) {
  const cache = new Map();
  return function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith(".css")) return {};
    if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
    const mod = { exports: {} };
    cache.set(filename, mod);
    const stamp = `${filename}:${fs.statSync(filename).mtimeMs}`;
    if (!compiledScripts.has(stamp))
      compiledScripts.set(
        stamp,
        ts.transpileModule(fs.readFileSync(filename, "utf8"), {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
      );
    const js = compiledScripts.get(stamp);
    const localRequire = (request) => {
      if (Object.hasOwn(stubs, request)) return stubs[request];
      if (!request.startsWith(".") && !request.startsWith("@/")) return require(request);
      const resolved = request.startsWith("@/")
        ? file(`src/${request.slice(2)}`)
        : path.resolve(path.dirname(filename), request);
      const dependency = [resolved, `${resolved}.ts`, `${resolved}.tsx`, `${resolved}.json`].find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      );
      assert.ok(dependency, `Unresolved ${request}`);
      return load(dependency);
    };
    vm.runInThisContext(`(function(require, module, exports) {${js}\n})`, { filename })(
      localRequire,
      mod,
      mod.exports,
    );
    return mod.exports;
  };
}
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://example.test/' });
global.window = dom.window; global.document = dom.window.document;
window.confirm = () => true;
global.HTMLElement = dom.window.HTMLElement; global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const { createRoot } = require('react-dom/client');
const storage = new Map(); const writes = [];
let completeCalls = 0; let continuationCalls = 0; let view;
const load = loader({
  '@/components/lp/LearningPathExperience': { useLearningPathStageView: value => { view = value; } },
  '@/lib/store/lp-journey': {
    getLpJourney: (user, id) => storage.get(`${user}:${id}`),
    saveLpJourney: (user, id, state) => { writes.push([user,id]); storage.set(`${user}:${id}`, structuredClone(state)); },
    resetLpJourney: (user, id) => storage.delete(`${user}:${id}`),
  },
});
const { CiaacAircraftEnginesLearningPath: Component } = load(file('src/components/lp/CiaacAircraftEnginesLearningPath.tsx'));
const docs = load(file('src/lib/lp/ciaac-aircraft-engines.content.json'));
const { CIAAC_REVIEWED_AIRCRAFT_ENGINES_IDS: ready } = load(file('src/lib/lp/ciaac-aircraft-engines-ids.ts'));
const { isLearningPathAvailable } = load(file('src/lib/lp/ciaac-availability.ts'));
assert.deepEqual(Object.keys(docs), [...ready]);
let reactRoot; let id; let doc; let user = 'owner';
const state = () => storage.get(`${user}:${id}`);
const buttons = (within = document) => [...within.querySelectorAll('button')];
const button = (label, within = document) => {
  const found = buttons(within).filter(b => b.textContent.trim() === label);
  assert.equal(found.length, 1, `One button: ${label}`); return found[0];
};
const click = async b => { assert.ok(b && !b.disabled); await React.act(async () => b.click()); };
const render = async (completed = false) => React.act(async () => reactRoot.render(React.createElement(Component, { document: doc, userId: user, lpId: id, completed, completionAction: { label: "Siguiente lección", onContinue: () => continuationCalls++ }, onComplete: () => completeCalls++ })));
const remount = async () => { await React.act(async () => reactRoot.unmount()); reactRoot = createRoot(document.getElementById('root')); await render(); };
(async () => {
  reactRoot = createRoot(document.getElementById('root'));
  for ([id, doc] of Object.entries(docs)) {
    assert.equal(isLearningPathAvailable(id), true);
    storage.set(`${user}:${id}`, { stage: 999, maxStage: 999, activityResponses: { old: true } });
    await render(); assert.equal(state().stage, 0); assert.equal(state().previousJourney.stage, 999);
    await click(button('Iniciar recorrido'));
    let figures = 0;
    for (let i = 1; i < doc.stages.length - 1; i++) {
      assert.equal(state().stage, i); const stage = doc.stages[i];
      if (stage.kind === 'content') {
        const figure = document.querySelector('.hb-figure');
        const grid = document.querySelector('.hb-card-grid');
        if (figure && grid) assert.ok(figure.compareDocumentPosition(grid) & window.Node.DOCUMENT_POSITION_FOLLOWING, 'Teaching visual precedes explanation cards');
        for (const image of document.querySelectorAll('.hb-figure img')) {
          figures++; assert.ok(image.alt.length > 20);
          const svg = read(`public${image.getAttribute('src')}`);
          assert.match(svg, /aria-labelledby=/); assert.match(svg, /<desc id=/);
          assert.match(image.closest('figure').textContent, /Diagrama original/);
          assert.doesNotMatch(image.closest('figure').textContent, /página PDF 0/);
        }
      }
      if (stage.kind === 'quiz') {
        assert.equal(button('Continuar').disabled, true);
        for (const index of stage.questions) {
          const q = doc.questions[index]; const group = [...document.querySelectorAll('[role="group"]')].find(g => g.getAttribute('aria-label') === q.prompt);
          const option = value => buttons(group).find(b => b.textContent.slice(1) === q.options[value]);
          if (!stage.diagnostic) { await click(option((q.correct + 1) % q.options.length)); assert.equal(button('Continuar').disabled, true); }
          await click(option(stage.diagnostic ? (q.correct + 1) % q.options.length : q.correct));
        }
      }
      if (stage.kind === 'exercise') {
        assert.equal(button('Continuar').disabled, true);
        if (doc.exercise.kind === 'match') {
          for (const [left,right] of doc.exercise.pairs) {
            await click(buttons(document.querySelector('.hb-pair-grid')).find(b => b.textContent.endsWith(left))); await click(button(right));
          }
          await click(button('Comprobar relaciones'));
        } else { for (const item of doc.exercise.items) await click(button(item)); await click(button('Comprobar secuencia')); }
      }
      assert.equal(button('Continuar').disabled, false);
      await remount(); assert.equal(state().stage, i);
      if (i > 1) { await click(button('Anterior')); assert.equal(state().stage, i-1); await click(button('Continuar')); }
      await click(button('Continuar'));
    }
    assert.ok(figures > 0, `${id}: verified figure rendered`);
    assert.equal(button('Completar Learning Path').disabled, true);
    for (const check of buttons(document.querySelector('.hb-checks'))) await click(check);
    const previousCalls = completeCalls;
    await click(button('Completar Learning Path')); assert.equal(state().complete, true); assert.equal(completeCalls,previousCalls+1);
    await click(button("Siguiente lección")); assert.equal(completeCalls,previousCalls+1);
    await remount(); assert.equal(state().complete,true); assert.equal(completeCalls,previousCalls+1);
    await React.act(async () => view.onReset()); assert.equal(state().complete,true); assert.equal(state().stage,0); assert.equal(completeCalls,previousCalls+1);
    const prior = structuredClone(state()); user = 'other'; await render(); assert.equal(state().stage,0); assert.equal(state().previousJourney,undefined);
    assert.deepEqual(storage.get(`owner:${id}`),prior); user = 'owner';
  }
  await React.act(async () => reactRoot.unmount());
  assert.equal(completeCalls,ready.length); assert.equal(continuationCalls,ready.length);
  assert.equal(isLearningPathAvailable('ciaac/aeronaves-y-motores/unreviewed/placeholder'),false);
  console.log(`PASS: real React DOM renderer, ${ready.length} ready lessons, all gates, refresh/back, completion once, legacy migration and user/route isolation.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
