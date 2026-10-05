const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { createRequire } = require("node:module");
const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");
const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(
  path.join(root, "src/components/lp/ciaac-module-one-handbook.css"),
  "utf8",
);
const rule = (selector) => {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, selector);
  return css.slice(start, css.indexOf("}", start));
};
const figure = rule(".ciaac-module-one-handbook .ciaac-fluid-context");
assert.match(figure, /width: min\(100%, 42rem, 66svh\)/);
assert.match(figure, /margin: 24px auto/);
const image = rule(".ciaac-module-one-handbook .ciaac-fluid-context img");
assert.match(image, /height: auto/);
assert.match(image, /object-fit: contain/);
assert.match(rule(".ciaac-module-one-handbook .ciaac-fluid-context figcaption"), /max-width: 62ch/);
assert.match(rule(".ciaac-module-one-handbook .ciaac-fluid-labels"), /repeat\(3, 1fr\)/);
assert.match(rule(".ciaac-module-one-handbook .hb-card-grid"), /gap: clamp\(18px, 2vw, 28px\)/);
assert.match(css, /@media \(max-width: 700px\)[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
// The positive reference remains a full-width schematic, not subject to the photo cap.
const diagram = rule(".ciaac-module-one-handbook .ciaac-science-diagram svg");
assert.match(diagram, /width: 100%/);
assert.match(diagram, /height: auto/);
assert.doesNotMatch(diagram, /max-height|svh|object-fit/);
const filename = path.join(root, "src/components/lp/CiaacModuleOneHandbookVisual.tsx");
const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const mod = { exports: {} };
new Function("require", "module", "exports", js)(createRequire(filename), mod, mod.exports);
const render = (group) =>
  renderToStaticMarkup(
    React.createElement(mod.exports.CiaacModuleOneHandbookVisual, { lesson: 2, group }),
  );
const photo = render(0);
const states = render(1);
assert.match(photo, /fluid-states-context.png/);
assert.match(photo, /width="1536" height="1024"/);
assert.match(photo, /Sólido/);
assert.match(photo, /Líquido/);
assert.match(photo, /Gas/);
assert.doesNotMatch(photo, /button|dialog/);
assert.match(states, /Conserva su forma/);
assert.match(states, /Adopta la forma/);
assert.match(states, /Ocupa el espacio/);
assert.match(states, /viewBox="0 0 720 270"/);
// Evaluate the declared limit for representative viewport sizes, without a browser.
for (const [available, height] of [
  [1620, 1080],
  [1100, 768],
  [326, 844],
  [603, 390],
]) {
  const width = Math.min(available, 42 * 16, 0.66 * height);
  assert.ok(width <= available);
  assert.ok((width * 1024) / 1536 <= height * 0.44 + 0.01);
}
if (process.argv[2]) {
  const out = path.resolve(process.argv[2]);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, "fluid-actual-markup.html"),
    `<style>${css}</style><main class="ciaac-module-one-handbook">${photo}${states}</main>`,
  );
  const sharp = require("sharp");
  (async () => {
    await sharp(path.join(root, "public/lp/ciaac/module-one/fluid-states-context.png"))
      .resize({ width: 672 })
      .png()
      .toFile(path.join(out, "fluid-desktop-content-672x448.png"));
    await sharp(path.join(root, "public/lp/ciaac/module-one/fluid-states-context.png"))
      .resize({ width: 326 })
      .png()
      .toFile(path.join(out, "fluid-mobile-content-326x217.png"));
    const svg = states
      .match(/<svg[\s\S]*?<\/svg>/)[0]
      .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
      .replace(
        "<title>",
        "<style>text{font-family:DejaVu Sans,sans-serif;font-size:17px;fill:#f8efdc}svg{color:#f8efdc}</style><title>",
      );
    await sharp(Buffer.from(svg))
      .resize({ width: 1080 })
      .flatten({ background: "#06243d" })
      .png()
      .toFile(path.join(out, "approved-states-unchanged.png"));
    console.log(
      "Static raster evidence saved; these are content renders, not browser screenshots.",
    );
  })().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
console.log(
  "PASS: scoped photo bounds, aspect ratio, readable caption, responsive spacing, preserved approved States schematic.",
);
