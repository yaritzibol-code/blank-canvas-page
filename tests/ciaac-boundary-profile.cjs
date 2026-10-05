const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const filename = require("node:path").join(
  __dirname,
  "../src/components/lp/CiaacModuleOneHandbookVisual.tsx",
);
const mod = { exports: {} };
vm.runInThisContext(
  "(function(require,module,exports){" +
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText +
    "})",
)(require, mod, mod.exports);
const html = renderToStaticMarkup(
  React.createElement(mod.exports.CiaacModuleOneHandbookVisual, { lesson: 3, group: 0 }),
);
assert.match(html, /role="img" aria-label="Capa límite:/);
assert.match(html, /<title>Velocidad del aire respecto de una superficie fija<\/title>/);
assert.match(html, /<desc>.*flujo exterior local.*velocidad relativa es cero.*flujo adherido/);
for (const term of [
  "Flecha más larga = mayor velocidad",
  "CAPA LÍMITE",
  "Mayor V",
  "Menor V",
  "Superficie fija · V = 0",
  "V: velocidad respecto de la pared",
])
  assert.ok(html.includes(term), term);
const arrows = [...html.matchAll(/data-speed="([^"]+)" d="M(\d+) (\d+)h(\d+)"/g)].map(
  ([, id, x, y, length]) => ({ id, x: +x, y: +y, length: +length }),
);
assert.deepEqual(
  arrows.map((a) => a.id),
  ["exterior", "farther", "nearer"],
);
assert.ok(
  arrows.every((a) => a.x === 142),
  "Compare arrows from the same origin",
);
assert.ok(
  arrows[0].length > arrows[1].length && arrows[1].length > arrows[2].length,
  "Speed increases away from the stationary wall",
);
assert.ok(
  arrows[0].y < 98 && arrows.slice(1).every((a) => a.y > 98 && a.y < 242),
  "Only interior rows are in the layer",
);
assert.doesNotMatch(
  html,
  /stroke-dasharray/,
  "No ambiguous velocity-envelope curve masquerading as a streamline",
);
const css = fs.readFileSync(
  require("node:path").join(__dirname, "../src/components/lp/ciaac-module-one-handbook.css"),
  "utf8",
);
assert.match(css, /ciaac-boundary-profile\s*\{[^}]*38rem/);
assert.match(css, /ciaac-boundary-profile text\s*\{\s*font-size: 16px/);
console.log("PASS boundary-layer semantics, geometry, legend, accessibility and scoped size");
const comparison = renderToStaticMarkup(
  React.createElement(mod.exports.CiaacModuleOneHandbookVisual, { lesson: 3, group: 1 }),
);
assert.match(comparison, /Ambos pueden seguir adheridos/);
assert.match(comparison, /Flujo medio hacia la derecha/);
assert.equal((comparison.match(/data-regime="laminar"/g) || []).length, 3);
assert.equal((comparison.match(/data-regime="turbulent-attached"/g) || []).length, 3);
assert.match(comparison, /no compara espesores/);
const adapterFile = require("node:path").join(
  __dirname,
  "../src/lib/lp/ciaac-module-one-handbook.ts",
);
const adapter = { exports: {} };
vm.runInThisContext(
  "(function(require,module,exports){" +
    ts.transpileModule(fs.readFileSync(adapterFile, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText +
    "})",
)(require, adapter, adapter.exports);
const source = require("../src/lib/lp/ciaac-module1.content.json").lessons[2].document;
const mapped = adapter.exports.moduleOneHandbook(source);
const cards = mapped.stages.filter((s) => s.kind === "content").flatMap((s) => s.cards);
const originalCards = [1, 2, 3, 4, 5, 11, 6, 7, 8, 9].map((i) => source.cards[i]);
assert.equal(cards.length, originalCards.length);
cards.forEach((card, i) => {
  assert.equal(
    card.detailText,
    originalCards[i].text,
    "Every full canonical explanation retained verbatim",
  );
  assert.deepEqual(card.covers, originalCards[i].covers, "Topic coverage unchanged");
  assert.ok(
    card.text.length < card.detailText.length,
    card.title + " has a shorter main explanation",
  );
});
assert.deepEqual(
  mapped.stages.filter((s) => s.kind === "content").map((s) => s.nav),
  ["Junto a la superficie", "Orden y mezcla", "Transición y separación", "Una superficie limpia"],
);
for (const lesson of require("../src/lib/lp/ciaac-module1.content.json").lessons.filter(
  (l) => l.document.number !== 3,
)) {
  assert.ok(
    adapter.exports
      .moduleOneHandbook(lesson.document)
      .stages.every((s) => !(s.cards || []).some((c) => c.detailText)),
    "Other lessons never opt in",
  );
}
const renderer = fs.readFileSync(
  require("node:path").join(__dirname, "../src/components/lp/HandbookLearningPath.tsx"),
  "utf8",
);
assert.match(
  renderer,
  /card.detailText && \([\s\S]*?<details className="hb-card-detail">[\s\S]*?<summary>Ver más: \{card.title\}<\/summary>[\s\S]*?<p>\{card.detailText\}<\/p>/,
  "Keyboard-operable native disclosure with unique visible label",
);
console.log(
  "PASS boundary lesson full-fact retention, shorter copy, native disclosures and unchanged progression",
);
