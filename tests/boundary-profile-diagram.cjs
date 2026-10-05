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
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { JSDOM } = require('jsdom');
const sharp = require('sharp');
const load = loader();
const { CiaacModuleOneHandbookVisual } = load(file('src/components/lp/CiaacModuleOneHandbookVisual.tsx'));
(async () => {
  const html = renderToStaticMarkup(React.createElement(CiaacModuleOneHandbookVisual, { lesson: 3, group: 0 }));
  const document = new JSDOM(html).window.document;
  const figure = document.querySelector('.ciaac-boundary-wing'); assert.ok(figure);
  const svgs = figure.querySelectorAll('svg'); assert.equal(svgs.length, 2);
  assert.ok(svgs[0].querySelector('[data-profile-airfoil]'));
  assert.ok(svgs[0].querySelector('[data-boundary-band]'));
  assert.equal(svgs[0].querySelectorAll('[data-outer-streamline]').length, 6);
  assert.equal(svgs[0].querySelectorAll('text').length, 1);
  assert.equal(svgs[0].querySelector('text').textContent, 'Capa límite');
  assert.equal(svgs[0].querySelectorAll('[data-speed]').length, 0);
  assert.equal(svgs[1].querySelectorAll('[data-speed]').length, 3);
  assert.match(figure.textContent, /cero en la pared respecto del ala/);
  assert.match(figure.textContent, /no es CFD ni representa un grosor constante/);
  assert.match(svgs[0].textContent, /no el borde de la capa límite/);
  assert.doesNotMatch(html, /Flecha más larga = mayor velocidad|CAPA LÍMITE/);
  const airfoil = svgs[0].querySelector('[data-profile-airfoil]').getAttribute('d');
  const vertices = [...airfoil.matchAll(/(?:M|L)([\d.]+),([\d.]+)/g)].map(m => [+m[1],+m[2]]);
  assert.equal(vertices.length, 242);
  assert.ok(Math.abs(vertices[0][0] - 105) < .01);
  assert.ok(Math.abs(vertices[120][0] - 635) < .01);
  assert.ok(Math.abs(vertices[120][1] - vertices[121][1]) < .01, 'sharp trailing edge');
  assert.ok(vertices[60][1] < vertices[181][1], 'upper/lower surfaces correctly oriented');
  const out = file('test-results/boundary-profile'); fs.mkdirSync(out, { recursive: true });
  for (let i=0;i<2;i++) {
    let svg = svgs[i].outerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    svg = svg.replace(/<text /g, `<text fill="#f1cb79" font-family="sans-serif" font-size="${i === 0 ? 26 : 12}" `);
    await sharp(Buffer.from(svg)).flatten({ background: '#06243d' }).png().toFile(path.join(out, `profile-${i}.png`));
  }
  const airHtml = renderToStaticMarkup(React.createElement(CiaacModuleOneHandbookVisual, { lesson: 2, group: 2 }));
  const airDoc = new JSDOM(airHtml).window.document;
  assert.ok(airDoc.querySelector('[data-viscosity-airfoil]'));
  assert.equal(airDoc.querySelectorAll('[data-layer-velocity]').length, 3);
  let airSvg = airDoc.querySelector('svg').outerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/<text /g, '<text fill="#f1cb79" font-family="sans-serif" font-size="16" ');
  await sharp(Buffer.from(airSvg)).flatten({ background: '#06243d' }).png().toFile(path.join(out, 'air-viscosity.png'));
  const { CIAAC_LEARNING_PATHS } = load(file('src/lib/lp/ciaac-content.ts'));
  const fluidDoc = Object.values(CIAAC_LEARNING_PATHS).find(d => d.number === 2 && d.stages.some(s => s.nav === 'El aire y la viscosidad'));
  const fluidStage = fluidDoc.stages.find(s => s.nav === 'El aire y la viscosidad');
  assert.equal(fluidStage.cards.length, 2);
  assert.ok(fluidStage.cards.every(c => c.text.split(/\s+/).length < 55));
  assert.doesNotMatch(fluidStage.cards.map(c => c.title).join(' '), /Del concepto al avión/);
  assert.match(fluidStage.cards[0].text, /masa y peso|movimiento relativo/);
  assert.match(fluidStage.cards[1].text, /No es densidad/);
  console.log('PASS: compact two-SVG profile, one main label, thin band/both surfaces, six separate outer streamlines, local-only velocity arrows, scientific caption, sharp trailing edge; raster outputs');
})().catch(e => { console.error(e); process.exitCode=1; });
