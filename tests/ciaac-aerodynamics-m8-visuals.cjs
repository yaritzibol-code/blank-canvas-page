const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { buildSync } = require("esbuild");
const { createElement } = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const out = path.join(os.tmpdir(), `ciaac-m8-visual-${process.pid}.cjs`);
buildSync({
  entryPoints: ["src/components/lp/CiaacAerodynamicsModuleEightVisual.tsx"],
  bundle: true,
  platform: "node",
  format: "cjs",
  packages: "external",
  loader: { ".css": "empty" },
  outfile: out,
  jsx: "automatic",
});
// Bundles in /tmp resolve React through this repository's node_modules.
const Module = require("node:module");
const original = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...args) {
  if (request === "react" || request === "react/jsx-runtime")
    return original.call(this, request, module, ...args);
  return original.call(this, request, parent, ...args);
};
const { CiaacAerodynamicsModuleEightVisual: Visual } = require(out);
Module._resolveFilename = original;
const stageNames = [
  ["Modelo de ascenso", "Exceso disponible", "Prestaciones y decisión"],
  ["Reconocer la condición", "Una condición, varias velocidades"],
  ["Leer la envolvente", "Peso y límites"],
  ["Dos maneras de observar", "Carga y pérdida", "Radio y régimen", "Coordinación y límites"],
  ["El balance durante el descenso", "Alcance y duración", "Aplicación razonada"],
  ["Fases y energía", "Aerodinámica cerca del suelo", "Pista y prestaciones"],
  ["Del perfil al rotor", "Controles y reacción", "Aire en movimiento", "Autorrotación y límites"],
];
const render = (lesson, nav, kind = "content", module = 8) =>
  renderToStaticMarkup(createElement(Visual, { module, lesson, stage: 2, nav, kind }));
let count = 0;
const svgs = [];
for (const [i, names] of stageNames.entries()) {
  for (const nav of ["Antes de despegar", ...names]) {
    const html = render(i + 1, nav, nav === "Antes de despegar" ? "quiz" : "content");
    assert.match(html, /<svg /, `Missing lesson ${i + 1}: ${nav}`);
    assert.match(html, /<title /);
    assert.match(html, /<desc /);
    assert.match(html, /<figcaption>/);
    assert.doesNotMatch(html, /<animate|<script|NaN|undefined|Infinity|https?:\/\//);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, "SVG IDs must be unique within a stage");
    for (const marker of html.matchAll(/marker-end="url\(#([^)]*)\)"/g))
      assert(ids.includes(marker[1]), "Arrow marker must resolve");
    for (const [j, m] of [...html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].entries())
      svgs.push({ lesson: i + 1, nav, index: j, svg: m[0] });
    count++;
  }
  assert.equal(render(i + 1, "Antes de despegar", "intro"), "");
  assert.equal(render(i + 1, "Unknown"), "");
  assert.equal(render(i + 1, names[0], "content", 7), "");
}
assert.match(render(3, "Peso y límites"), /no se garantiza protección/);
assert.match(render(4, "Dos maneras de observar"), /fuerza inercial centrífuga/);
assert.match(render(6, "Fases y energía"), /no tiene una corrección universal/);
assert.match(render(7, "Aire en movimiento"), /mitad derecha avanza/);
assert.match(render(7, "Controles y reacción"), /360°/);
assert.match(render(7, "Autorrotación y límites"), /no representan porcentajes/);
if (process.env.M8_VISUAL_QA_DIR) {
  fs.mkdirSync(process.env.M8_VISUAL_QA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(process.env.M8_VISUAL_QA_DIR, "svg-panels.json"),
    JSON.stringify(svgs, null, 2),
  );
}
fs.unlinkSync(out);
console.log(
  `M8 visual checks passed: ${count} stage variants, ${svgs.length} accessible SVG panels, 7 diagnostic contexts.`,
);

// Geometry regressions: force arrows must close, banked wing must be normal to L,
// radius comparison must retain equal radial acceleration at a fixed bank angle.
const climb = render(1, "Modelo de ascenso");
for (const d of ["M168 148L271 110.4", "M168 148L96 174.3", "M168 148L137 63", "M168 148V244.3"])
  assert(climb.includes(`d="${d}"`));
const climbVectors = [
  [103, -37.6],
  [-72, 26.3],
  [-31, -85],
  [0, 96.3],
];
for (const axis of [0, 1])
  assert(Math.abs(climbVectors.reduce((sum, v) => sum + v[axis], 0)) < 1e-10);
assert.match(render(4, "Dos maneras de observar"), /M115 91L245 166/);
assert.match(render(4, "Dos maneras de observar"), /M180 129H125/);
assert.match(render(4, "Radio y régimen"), /M239 38V60/);
assert.match(render(4, "Radio y régimen"), /M72 107V129/);
const cycle = render(7, "Controles y reacción")
  .match(/<polyline points="([^"]+)"/)[1]
  .split(" ")
  .map((p) => Number(p.split(",")[1]));
assert.equal(cycle.length, 73);
assert.equal(
  cycle.filter((y, i) => i > 0 && i < 72 && y < cycle[i - 1] && y < cycle[i + 1]).length,
  1,
  "Cyclic pitch must have one full cycle per revolution",
);
const css = fs.readFileSync("src/components/lp/ciaac-aerodynamics-m8.css", "utf8");
assert.match(css, /overflow-x: auto/);
assert.match(css, /focus-visible/);
assert.match(css, /min-width: 320px/);
console.log("M8 scientific geometry and responsive-accessibility regressions passed.");
