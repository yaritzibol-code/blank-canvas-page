/** Render real public components against canonical config, without network or auth. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
const empty = () => null;
const children = ({ children }) => React.createElement("div", null, children);
const shared = {
  Nav: empty,
  Footer: empty,
  AeroBackdrop: empty,
  PlaneField: empty,
  Coord: empty,
  PathyBubble: empty,
  Icon: empty,
  Pill: children,
  Btn: children,
  SectionHead: ({ title, sub }) => React.createElement("div", null, title, sub),
};
function harness(now) {
  const cache = new Map();
  class Clock extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }
    static now() {
      return new Date(now).getTime();
    }
  }
  const modules = {
    react: React,
    "react/jsx-runtime": require("react/jsx-runtime"),
    "@tanstack/react-router": { createFileRoute: () => (value) => value },
    "../shared": shared,
    "./shared": shared,
    "@/components/landing/shared": shared,
    "./reference-motion": { mountReferenceMotion: empty },
    "./reference-home.css": {},
    "@/lib/seo/materias-iconos": { ICONO_MATERIA: {} },
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const result = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    });
    const output = {};
    vm.runInNewContext(
      result.outputText,
      {
        exports: output,
        Date: Clock,
        require: (name) => {
          if (Object.hasOwn(modules, name)) return modules[name];
          const allowed = [
            "@/lib/pricing",
            "@/modules/rtari/config",
            "@/modules/compass/config",
            "@/lib/store/materias",
            "@/lib/convocatoria",
          ];
          assert.ok(allowed.includes(name), `Unexpected import: ${name}`);
          return load(`src/${name.slice(2)}.ts`);
        },
      },
      { filename: file },
    );
    cache.set(file, output);
    return output;
  }
  return { load };
}
function render(component, props) {
  const dom = new JSDOM(renderToStaticMarkup(React.createElement(component, props)));
  return dom;
}
const { load } = harness("2026-10-06T12:00:00Z");
const pricing = load("src/lib/pricing.ts");
const rtari = load("src/modules/rtari/config.ts");
const compass = load("src/modules/compass/config.ts");
const priceDom = render(load("src/components/landing/sections/Pricing.tsx").Pricing);
const priceText = priceDom.window.document.body.textContent;
assert.ok(priceText.includes(`${rtari.RTARI_MINUTOS_INCLUIDOS_PRO} minutos de voz al mes`));
assert.doesNotMatch(priceText, /RTARI.*ilimitado/);
assert.ok(priceText.includes(pricing.formatPrice(pricing.PRO_SETUP_FALLBACK)));
assert.match(priceText, /inscripción única/);
assert.match(priceText, /primer periodo mensual o anual/);
priceDom.window.close();
const homeDom = render(load("src/components/landing/ReferenceHome.tsx").ReferenceHome, {});
const homeText = homeDom.window.document.body.textContent;
assert.ok(homeText.includes(`${compass.COMPASS_MODULES.length} ejercicios`));
assert.ok(homeText.includes(`Simulacro ~${compass.SIMULACRO_MIN_APROX} min`));
assert.doesNotMatch(homeText, /6 ejercicios|Simulacro 20 min/);
homeDom.window.close();
for (const now of ["2026-07-01T12:00:00Z", "2026-10-06T12:00:00Z"]) {
  const { load } = harness(now);
  const dom = render(load("src/routes/calculadora-ciaac.tsx").Route.component);
  const document = dom.window.document;
  const input = document.querySelector('input[type="date"]');
  assert.ok(input);
  const configured = new Date(load("src/lib/convocatoria.ts").PROXIMO_CIAAC);
  const expected =
    configured > new Date(now)
      ? configured
      : new Date(new Date(now).setDate(new Date(now).getDate() + 56));
  const localDate = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}-${String(expected.getDate()).padStart(2, "0")}`;
  assert.equal(input.value, localDate);
  assert.match(document.body.textContent, /referencia de planificación/);
  assert.match(document.body.textContent, /fecha confirmada de tu examen/);
  assert.doesNotMatch(document.body.textContent, /Precargada: la convocatoria/);
  dom.window.close();
}
console.log(
  "PASS rendered public copy: canonical RTARI allowance, enrollment disclosure, COMPASS count/duration, calculator before/after registered date; zero network",
);
