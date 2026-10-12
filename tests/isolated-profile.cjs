/** Real profile React DOM with an in-memory student fixture. No registered account. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<div id="root"></div>', { url: "https://example.invalid" });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");
let user = {
  id: "qa-profile",
  nombre: "Estudiante Ficticio",
  email: "student@example.invalid",
  whatsapp: "",
  escuela: "Escuela de prueba",
  fechaCiaac: "2026-12-01",
  perfilCiaac: "Piloto",
  createdAt: "2026-01-01",
  planNombre: "Básica",
  focoRuta: "ciaac",
  focoMateria: "",
  accessEnd: null,
};
const writes = [];
const navigation = [];
let loggedOut = false;
const empty = () => null;
const store = {
  useSessionUser: () => user,
  useStore: (fn) => fn(),
  studentStats: () => ({ streak: 0, answered: 0, simCount: 0, studyHours: 0 }),
  progresoPorRuta: () => ({ ciaac: [], lineaAerea: [], aeronave: [] }),
  getActivity: () => [],
  getSimAttempts: () => [],
  MATERIAS_DEF: [],
  updateUser: (id, patch) => {
    assert.equal(id, user.id);
    writes.push(patch);
    user = { ...user, ...patch };
  },
  logout: () => {
    loggedOut = true;
  },
  flushCloudWrites: async () => {},
};
const stubs = {
  react: React,
  "react/jsx-runtime": require("react/jsx-runtime"),
  "@tanstack/react-router": {
    createFileRoute: () => (x) => x,
    useNavigate: () => (x) => navigation.push(x),
  },
  "@/lib/store": store,
  "@/components/ui/fp-icon": { Icon: empty },
  "@/components/shared/PlaneField": { PlaneField: empty },
  "@/components/shared/PathyMark": { PathyMark: empty },
  "@/components/shared/AvatarPicker": { AvatarPicker: empty },
  "@/components/compass/CompassLogCard": { CompassLogCard: empty },
  "@/components/logros/LogrosPanel": { LogrosPanel: empty },
  "@/components/fp/FlightPointsPanel": { FlightPointsPanel: empty },
};
const source = fs.readFileSync(path.join(__dirname, "../src/routes/dashboard/perfil.tsx"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText;
const exportsObject = {};
vm.runInNewContext(compiled, {
  exports: exportsObject,
  document,
  setTimeout: () => 0,
  require: (name) => {
    assert.ok(Object.hasOwn(stubs, name), `Unexpected import ${name}`);
    return stubs[name];
  },
});
const root = createRoot(document.getElementById("root"));
const button = (text) =>
  [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === text);
const click = async (text) => {
  assert.ok(button(text), text);
  await act(async () => button(text).click());
};
const field = (text) => {
  const label = [...document.querySelectorAll("label")].find((x) => x.textContent === text);
  assert.ok(label, text);
  return label.parentElement.querySelector("input");
};
const input = async (element, value) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(
      element,
      value,
    );
    element.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
};
(async () => {
  await act(async () => root.render(React.createElement(exportsObject.Route.component)));
  await click("Editar perfil");
  const email = field("Correo electrónico");
  assert.ok(
    email?.readOnly || email?.disabled || !email,
    "Email cannot appear editable: profile save does not update authenticated email",
  );
  for (const text of [
    "Nombre completo",
    "WhatsApp",
    "Escuela de aviación",
    "Fecha estimada del CIAAC",
  ]) {
    const element = field(text);
    if (element) assert.ok(element.labels.length, `${text} has an associated label`);
  }
  await input(field("Nombre completo"), "Discard this");
  await click("Cancelar");
  assert.equal(writes.length, 0);
  await click("Editar perfil");
  assert.equal(field("Nombre completo").value, user.nombre);
  await input(field("Nombre completo"), "  Nuevo Estudiante  ");
  await click("Guardar cambios");
  assert.equal(user.nombre, "Nuevo Estudiante");
  assert.equal(user.email, "student@example.invalid");
  assert.equal(writes.length, 1);
  await click("Editar perfil");
  assert.equal(field("Nombre completo").value, "Nuevo Estudiante");
  await click("Cancelar");
  await click("Cerrar sesión");
  assert.equal(loggedOut, true);
  assert.equal(navigation.at(-1).to, "/login");
  await act(async () => root.unmount());
  dom.window.close();
  console.log(
    "PASS profile: immutable auth email, accessible inputs, cancel/reopen, trimmed save, logout navigation; mocked persistence only",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  dom.window.close();
});
