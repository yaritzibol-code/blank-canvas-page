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
const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/' });
global.window = dom.window; global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement; global.IS_REACT_ACT_ENVIRONMENT = true;
let reduced = false; let preferenceListener;
window.matchMedia = () => ({ get matches() { return reduced; }, addEventListener: (_, fn) => preferenceListener = fn, removeEventListener() {} });
let frame; window.requestAnimationFrame = cb => { frame = cb; return 1; };
window.cancelAnimationFrame = () => { frame = undefined; };
const React = require('react'); const { createRoot } = require('react-dom/client');
let saved; let view;
const load = loader({
  '@/components/lp/LearningPathExperience': { useLearningPathStageView: v => { view = v; } },
  '@/lib/store/lp-journey': { getLpJourney: () => saved, saveLpJourney: (_, __, state) => { saved = state; }, resetLpJourney() {} },
});
const { BoundaryFlowMedia, BoundaryFlowVideo, boundaryParticle, boundarySurface } = load(file('src/components/lp/BoundaryFlowMedia.tsx'));
const { CiaacModuleOneLearningPath } = load(file('src/components/lp/CiaacModuleOneLearningPath.tsx'));
const { CIAAC_LEARNING_PATHS } = load(file('src/lib/lp/ciaac-content.ts'));
const id = Object.keys(CIAAC_LEARNING_PATHS).find(id => id.includes('capa-limite-flujo'));
const doc = CIAAC_LEARNING_PATHS[id];
const button = text => [...document.querySelectorAll('button')].find(b => b.textContent === text);
const click = async b => { assert.ok(b); await React.act(async () => b.click()); };
let rootNode = createRoot(document.getElementById('root'));
(async () => {
  await React.act(async () => rootNode.render(React.createElement(React.Fragment, null, React.createElement(BoundaryFlowMedia), React.createElement(BoundaryFlowVideo))));
  assert.equal(document.querySelector('iframe'), null);
  assert.equal(document.querySelector('svg').dataset.playing, 'false');
  await click(button('Reproducir animación'));
  await React.act(async () => frame(0)); await React.act(async () => frame(50));
  assert.equal(document.querySelector('svg').dataset.time, '0.050');
  const moved = document.querySelector('[data-particle="0"]').getAttribute('cx');
  await click(button('Pausar animación')); assert.equal(frame, undefined);
  assert.equal(document.querySelector('[data-particle="0"]').getAttribute('cx'), moved);
  await click(button('Turbulento adherido')); assert.equal(button('Turbulento adherido').getAttribute('aria-pressed'), 'true');
  await click(button('Reproducir animación'));
  reduced = true; await React.act(async () => preferenceListener());
  assert.equal(document.querySelector('svg').dataset.playing, 'false'); assert.equal(frame, undefined);
  assert.match(document.body.textContent, /Movimiento reducido/);
  await click(button('Cargar video original · 2:03'));
  const iframe = document.querySelector('iframe'); assert.match(iframe.src, /youtube-nocookie.com\/embed\/OT0ynzPtoVE\?autoplay=0/);
  assert.ok(iframe.hasAttribute('allowfullscreen')); assert.equal(document.querySelectorAll('iframe').length, 1);
  assert.match(document.querySelector('a').href, /watch\?v=OT0ynzPtoVE$/);
  assert.doesNotMatch(document.body.innerHTML, /ANTA|autoplay=1/);
  const sharp = require('sharp'); fs.mkdirSync(file('test-results/boundary-flow'), { recursive: true });
  for (const mode of ['Laminar', 'Turbulento adherido']) {
    await click(button(mode));
    const svg = document.querySelector('svg').outerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replaceAll('class="boundary-small"','fill="#cfdaeb" font-size="12" font-family="sans-serif"').replaceAll('class="boundary-label"','fill="#f2d892" font-size="15" font-family="sans-serif"');
    await sharp(Buffer.from(svg)).flatten({ background: '#13223d' }).png().toFile(file(`test-results/boundary-flow/${mode.split(' ')[0]}.png`));
  }
  // Every trajectory stays outside the stationary airfoil throughout a full crossing.
  for (const mode of ['laminar', 'turbulent']) for (let t = 0; t < 28; t += .07) for (let i = 0; i < 120; i++) {
    const p = boundaryParticle(i, t, mode), next = boundaryParticle(i, t + .001, mode);
    assert.ok(next.x > p.x || p.x > 717, 'mean streamwise motion is forward except periodic reset');
    if (p.x >= 150 && p.x <= 570) {
      const side = i % 2 ? 1 : -1;
      assert.ok(side * (p.y - boundarySurface(p.x, side)) > 2, 'particle does not enter airfoil');
    }
  }
  await React.act(async () => rootNode.unmount()); rootNode = createRoot(document.getElementById('root'));
  saved = { version: 'ciaac-module-one-handbook-3-v1', stage: doc.stages.length - 1, maxStage: doc.stages.length - 1, complete: true };
  await React.act(async () => rootNode.render(React.createElement(CiaacModuleOneLearningPath, { document: doc, userId: 'test', lpId: id, completed: true, onComplete() {} })));
  assert.equal(document.querySelectorAll('.boundary-media').length, 1);
  assert.ok(document.querySelector('.boundary-video'));
  assert.equal(document.querySelector('.boundary-scene'), null);
  const content = [...document.querySelector('.hb-content').children];
  assert.ok(content.indexOf(document.querySelector('.boundary-media')) < content.indexOf(document.querySelector('.hb-source')));
  // Optional end media does not add gates, stages or alter stored completion.
  assert.equal(saved.complete, true); assert.equal(saved.stage, doc.stages.length - 1);
  const concepts = [...document.querySelectorAll('.hb-waypoints button')].find(b => b.textContent.includes('Orden y mezcla'));
  await click(concepts);
  assert.ok(document.querySelector('.boundary-scene'));
  assert.equal(document.querySelector('.boundary-video'), null);
  assert.match(document.body.textContent, /Laminar: capas ordenadas/);
  assert.match(document.body.textContent, /Turbulento: fluctuaciones/);
  // No animation or video on diagnostic/question stages.
  for (let i = 0; i < doc.stages.length; i++) if (doc.stages[i].kind === 'quiz') {
    await click(document.querySelectorAll('.hb-waypoints button')[i]);
    assert.equal(document.querySelector('.boundary-media'), null);
  }
  const planFirst = document.querySelector('.hb-waypoints button'); await click(planFirst);
  assert.equal(document.querySelector('.boundary-media'), null); assert.equal(document.querySelector('iframe'), null);
  await React.act(async () => rootNode.unmount());
  console.log('PASS: real DOM controls, pause/resume, reduced-motion, privacy click-to-load, fallback, finish integration, unmount; 96,000+ temporal particle checks; two PNGs');
})().catch(error => { console.error(error); process.exitCode = 1; });
