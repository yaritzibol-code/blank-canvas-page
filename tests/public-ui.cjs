/** Public UI regressions: real React/DOM, no cloud requests or account writes. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost" });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");
const cloudCalls = [];
const forbidden = () => {
  cloudCalls.push("unexpected request");
  throw new Error("No cloud calls allowed");
};
const navigate = () => {};
const modules = {
  react: React,
  "react/jsx-runtime": require("react/jsx-runtime"),
  "@tanstack/react-router": {
    Link: ({ to, children, ...props }) =>
      React.createElement("a", { href: to, ...props }, children),
    useNavigate: () => navigate,
  },
  "lucide-react": { Eye: () => null, EyeOff: () => null },
  "@/lib/store": {
    register: forbidden,
    login: forbidden,
    resetPassword: forbidden,
    ensureSeededAsync: async () => {},
    useSessionUser: () => null,
  },
  "@/integrations/lovable": { lovable: { auth: { signInWithOAuth: forbidden } } },
  "@/lib/meta": { metaTrack: forbidden },
  "@/lib/oaiq": { oaiqMeasure: forbidden },
  "../shared": {
    SectionHead: ({ title, sub }) => React.createElement("div", null, title, sub),
    Icon: () => null,
    Pill: ({ children }) => React.createElement("span", null, children),
    Btn: ({ children, to }) => React.createElement("a", { href: to }, children),
  },
};
function load(file) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const result = ts.transpileModule(source, {
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  });
  assert.equal(result.diagnostics.length, 0, file);
  const context = {
    exports: {},
    URLSearchParams,
    require(name) {
      assert.ok(name in modules, `Unexpected import: ${name}`);
      return modules[name];
    },
  };
  vm.runInNewContext(result.outputText, context);
  return context.exports;
}
modules["@/lib/pricing"] = load("src/lib/pricing.ts");
modules["@/modules/rtari/config"] = load("src/modules/rtari/config.ts");
const { AuthPage } = load("src/components/auth/AuthPage.tsx");
const { Pricing } = load("src/components/landing/sections/Pricing.tsx");
const root = createRoot(document.getElementById("root"));
const byText = (text) =>
  [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === text);
const click = async (button) => {
  assert.ok(button);
  await act(async () => button.click());
};
function field(label) {
  const node = [...document.querySelectorAll("label")].find((l) => l.textContent.trim() === label);
  assert.ok(node, label);
  assert.ok(node.htmlFor, `${label}: associated label`);
  const input = document.getElementById(node.htmlFor);
  assert.ok(input && input.labels.length === 1, `${label}: named input`);
  return input;
}
function uniqueIds() {
  const ids = [...document.querySelectorAll("[id]")].map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length);
}
async function togglePassword() {
  const input = field("Contraseña");
  assert.equal(input.type, "password");
  for (let i = 0; i < 2; i++) {
    await click(document.querySelector('button[aria-label="Mostrar contraseña"]'));
    assert.equal(input.type, "text");
    await click(document.querySelector('button[aria-label="Ocultar contraseña"]'));
    assert.equal(input.type, "password");
  }
}
(async () => {
  await act(async () => root.render(React.createElement(AuthPage, { initialTab: "register" })));
  field("Nombre completo");
  field("Correo electrónico");
  const password = field("Contraseña");
  assert.match(
    document.getElementById(password.getAttribute("aria-describedby")).textContent,
    /letras, números y símbolos/,
  );
  uniqueIds();
  await togglePassword();
  await click(byText("Inicia sesión aquí"));
  field("Correo electrónico");
  uniqueIds();
  await togglePassword();
  await click(byText("¿Olvidaste tu contraseña?"));
  field("Correo electrónico");
  uniqueIds();
  assert.equal(document.querySelectorAll("input").length, 1);
  await click(byText("← Volver a iniciar sesión"));
  field("Correo electrónico");
  await togglePassword();
  await click(byText("Regístrate gratis"));
  field("Nombre completo");
  uniqueIds();
  await togglePassword();
  await act(async () => root.render(React.createElement(Pricing)));
  const pricing = document.getElementById("precios");
  assert.ok(pricing);
  assert.equal(pricing.querySelector(".text-6xl").textContent, "Gratis");
  assert.doesNotMatch(pricing.textContent, /bash/);
  assert.match(pricing.textContent, /\$500/);
  assert.match(pricing.textContent, /\$5,000/);
  assert.equal(pricing.querySelector("a").getAttribute("href"), "/register");
  assert.equal(cloudCalls.length, 0);
  await act(async () => root.unmount());
  console.log(
    "PASS: registration/login/reset labels, password hint, repeated toggles, tab/reset return flows, free and Pro pricing; zero cloud calls",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
