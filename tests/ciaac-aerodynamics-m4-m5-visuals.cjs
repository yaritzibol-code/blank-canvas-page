/** Native SSR/SVG checks; no browser, network or application-state mutation. */
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const out = path.resolve("node_modules/.cache/aero45-visual-test.cjs");
execFileSync(
  path.resolve("node_modules/.bin/esbuild"),
  [
    "src/components/lp/CiaacAerodynamicsModulesFourFiveVisual.tsx",
    "--bundle",
    "--platform=node",
    "--format=cjs",
    "--external:react",
    "--loader:.css=empty",
    `--outfile=${out}`,
  ],
  { stdio: "pipe" },
);
const { CiaacAerodynamicsModulesFourFiveVisual: Visual } = require(out);
const render = (module, lesson, stage, kind = "content") =>
  renderToStaticMarkup(React.createElement(Visual, { module, lesson, stage, kind, nav: "" }));
const explanatory = [
  [4, 1, 2],
  [4, 1, 4],
  [4, 2, 3],
  [4, 2, 4],
  [4, 3, 3],
  [4, 3, 4],
  [4, 4, 2],
  [5, 1, 1],
  [5, 1, 2],
  [5, 2, 3],
  [5, 3, 2],
  [5, 3, 3],
  [5, 3, 4],
];
for (const args of explanatory) {
  const html = render(...args);
  assert.match(html, /<svg/);
  assert.match(html, /role="img"/);
  assert.match(html, /<figcaption>/);
  assert.doesNotMatch(html, /<button|<input|<img|https?:\/\//);
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, "SVG marker ids are unique");
}
for (const [m, l] of [
  [4, 1],
  [4, 2],
  [5, 3],
]) {
  assert.match(render(m, l, 1, "quiz"), /<svg/);
  assert.equal(render(m, l, 5, "quiz"), "");
}
for (const kind of ["intro", "exercise", "finish"]) assert.equal(render(4, 1, 2, kind), "");
assert.equal(render(5, 2, 1), "");
assert.match(render(4, 2, 3), /Vista desde atrás/);
assert.match(render(4, 4, 2), /Tab abajo → elevador arriba/);
assert.match(render(4, 4, 2), /Tab arriba → elevador abajo/);
assert.match(render(5, 2, 3), /Reynolds, Mach, estado superficial/);
assert.match(render(5, 1, 2), /t\/c = 0,12 = 12 %/);
assert.doesNotMatch(render(4, 1, 1, "quiz"), /Alabeo|longitudinal/);
assert.doesNotMatch(render(4, 2, 1, "quiz"), /Alerón derecho arriba/);
assert.doesNotMatch(render(5, 3, 1, "quiz"), /Puede producir sustentación/);
fs.unlinkSync(out);
console.log(
  "PASS: 13 explanatory stages, 3 contextual diagnostics, accessible SVGs, unique markers, scientific invariants and selective rendering.",
);
