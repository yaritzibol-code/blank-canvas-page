const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const file = (relative) => path.join(root, relative);
const read = (relative) => fs.readFileSync(file(relative), "utf8");
const element = (type, props, key) => ({ type, props: props ?? {}, key });
const jsx = { jsx: element, jsxs: element, Fragment: Symbol("Fragment") };

// As in ciaac-module1.cjs, transpile the actual TSX into a test-only JSX tree.
// No DOM, browser, application account, database, or network is involved.
function loader(stubs = {}) {
  const cache = new Map();
  return function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith(".css")) return {};
    if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
    const mod = { exports: {} };
    cache.set(filename, mod);
    const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
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
const load = loader();
const { AIRCRAFT_LP_ID, freshAircraftJourney } = load(file("src/lib/lp/ciaac-aircraft-journey.ts"));
const { CIAAC_LEARNING_PATHS } = load(file("src/lib/lp/ciaac-content.ts"));
const ids = Object.keys(CIAAC_LEARNING_PATHS);
const document = CIAAC_LEARNING_PATHS[AIRCRAFT_LP_ID];
function nodes(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((child) => nodes(child, predicate));
  if (!node || typeof node !== "object") return [];
  return [...(predicate(node) ? [node] : []), ...nodes(node.props?.children, predicate)];
}
function textContent(node) {
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  return node.type === "style" ? "" : textContent(node.props?.children);
}
const hasClass = (node, name) => node.props.className?.split(" ").includes(name);
function button(app, label) {
  const matches = nodes(
    app.tree,
    (node) =>
      node.type === "button" &&
      (typeof label === "string"
        ? textContent(node).trim() === label
        : label.test(textContent(node))),
  );
  assert.equal(
    matches.length,
    1,
    `One button matching ${label}; found ${matches.map(textContent).join(" | ")}`,
  );
  return matches[0];
}
function mount(saved, completed = false) {
  const records = new Map();
  const storage = new Map(
    ids.map((id) => [id, id === AIRCRAFT_LP_ID ? structuredClone(saved) : { untouched: id }]),
  );
  const writes = [];
  const resets = [];
  let active;
  let changed = false;
  let effects = [];
  let tree;
  let stageView;
  let completeCalls = 0;
  const app = { storage, writes, resets };
  const record = () => {
    const index = active.index++;
    return [active.slots, index];
  };
  const react = {
    useState(initial) {
      const [slots, index] = record();
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [
        slots[index],
        (next) => {
          const value = typeof next === "function" ? next(slots[index]) : next;
          if (!Object.is(value, slots[index])) {
            slots[index] = value;
            changed = true;
          }
        },
      ];
    },
    useRef(initial) {
      const [slots, index] = record();
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(effect, deps) {
      const [slots, index] = record();
      if (!(index in slots) || !deps || deps.some((dep, i) => !Object.is(dep, slots[index][i]))) {
        slots[index] = deps;
        effects.push(effect);
      }
    },
    useMemo: (factory) => factory(),
  };
  function runComponent(Component, props, id) {
    const previous = active;
    if (!records.has(id)) records.set(id, { slots: [], index: 0 });
    active = records.get(id);
    active.index = 0;
    const value = Component(props);
    active = previous;
    return value;
  }
  function materialize(node, id = "tree") {
    if (Array.isArray(node))
      return node.map((child, index) => materialize(child, `${id}/${child?.key ?? index}`));
    if (node === null || node === undefined || typeof node === "boolean") return null;
    if (typeof node !== "object") return node;
    if (typeof node.type === "function")
      return materialize(
        runComponent(node.type, node.props, `${id}/${node.type.name}`),
        `${id}/rendered`,
      );
    return {
      ...node,
      props: { ...node.props, children: materialize(node.props.children, `${id}/children`) },
    };
  }
  const { CiaacAircraftLearningPath } = loader({
    react,
    "react/jsx-runtime": jsx,
    "@/components/lp/LearningPathExperience": {
      useLearningPathStageView: (value) => {
        stageView = value;
      },
    },
    "@/lib/store/lp-journey": {
      getLpJourney: (userId, lpId) => {
        assert.equal(userId, "test-user");
        return storage.get(lpId);
      },
      saveLpJourney: (userId, lpId, value) => {
        writes.push([userId, lpId]);
        storage.set(lpId, structuredClone(value));
      },
      resetLpJourney: (userId, lpId) => {
        resets.push([userId, lpId]);
        storage.delete(lpId);
      },
    },
  })(file("src/components/lp/CiaacAircraftLearningPath.tsx"));
  app.render = () => {
    for (let pass = 0; pass < 30; pass += 1) {
      changed = false;
      effects = [];
      tree = materialize(
        runComponent(
          CiaacAircraftLearningPath,
          {
            document,
            userId: "test-user",
            lpId: AIRCRAFT_LP_ID,
            completed,
            onComplete: () => {
              completeCalls += 1;
            },
          },
          "root",
        ),
      );
      for (const effect of effects) effect();
      if (!changed) return tree;
    }
    assert.fail("Hook/effect render did not settle");
  };
  app.click = (node) => {
    node.props.onClick();
    app.render();
  };
  Object.defineProperties(app, {
    tree: { get: () => tree },
    state: { get: () => storage.get(AIRCRAFT_LP_ID) },
    view: { get: () => stageView },
    completeCalls: { get: () => completeCalls },
  });
  app.render();
  return app;
}

const next = (app) => button(app, "Continuar");
let app = mount(null);
assert.equal(app.view.labels.length, 10);
assert.equal(app.state.version, "ciaac-aircraft-handbook-v3");
assert.match(textContent(app.tree), /Cuándo empieza a contar el vuelo/);
app.click(button(app, "Iniciar recorrido"));
assert.equal(app.state.stage, 1);
assert.equal(next(app).props.disabled, true);
assert.equal(
  nodes(app.tree, (n) => n.type === "img" && n.props.src.includes("preflight-pushback")).length,
  1,
);
app.click(button(app, /No, hasta separarse del suelo/));
assert.equal(
  next(app).props.disabled,
  false,
  "Preflight is diagnostic, including wrong predictions",
);
app.click(next(app));
assert.equal(app.state.stage, 2);
assert.match(textContent(app.tree), /¿Qué es una aeronave\?/);
assert.match(textContent(app.tree), /Un globo también es aeronave/);
assert.match(textContent(app.tree), /Toda máquina que puede sustentarse en la atmósfera/);
assert.match(textContent(app.tree), /se cierran todas sus puertas externas después del embarque/);
assert.match(textContent(app.tree), /contexto AVSEC/);
assert.match(textContent(app.tree), /No equivale al tiempo de vuelo/);
assert.ok(document.sources.some((source) => source.id === "afac-avsec-definitions-2024"));
assert.match(
  textContent(app.tree),
  /que no sean las reacciones de esta contra la superficie de la tierra/,
);
assert.match(textContent(app.tree), /Planeador/);
assert.match(textContent(app.tree), /Globo/);
assert.doesNotMatch(textContent(app.tree), /aerodeslizador|colchón de aire/i);
assert.equal(
  nodes(app.tree, (n) => hasClass(n, "aircraft-mechanisms"))[0].props.children.length,
  2,
);
assert.doesNotMatch(
  JSON.stringify(document) +
    nodes(app.tree, (n) => n.type === "img")
      .map((n) => n.props.alt)
      .join(" "),
  /aerodeslizador|colchón de aire/i,
);
app.click(next(app));
assert.equal(app.state.stage, 3);
assert.match(textContent(app.tree), /68 minutos/);
assert.match(textContent(app.tree), /48 minutos/);
assert.match(textContent(app.tree), /retirar los calzos/);
app.click(next(app));
assert.equal(app.state.stage, 4);
assert.match(textContent(app.tree), /09:43/);
app.click(next(app));
assert.equal(app.state.stage, 5);
assert.equal(next(app).props.disabled, true);
app.click(button(app, "Comprobar relaciones"));
assert.equal(next(app).props.disabled, true);
for (const pair of document.exercise.pairs) {
  app.click(button(app, new RegExp(pair[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
  app.click(button(app, pair[1]));
}
app.click(button(app, "Comprobar relaciones"));
assert.equal(next(app).props.disabled, false);
app.click(next(app));
assert.equal(app.state.stage, 6);
const answer = (index, option) => {
  const group = nodes(
    app.tree,
    (n) => n.props.role === "group" && n.props["aria-label"] === document.questions[index].prompt,
  )[0];
  const choice = nodes(group, (n) => n.type === "button" && textContent(n).endsWith(option))[0];
  app.click(choice);
};
answer(1, "Falso");
answer(2, "Falso");
answer(3, "Falso");
assert.equal(next(app).props.disabled, true);
app.click(next(app));
assert.equal(app.state.stage, 6, "Wrong mastery answer cannot bypass gate");
answer(1, "Verdadero");
app.click(next(app));
assert.equal(app.state.stage, 7);
answer(4, "Sí, cualquier desplazamiento basta.");
assert.equal(next(app).props.disabled, true);
answer(4, "No, falta el propósito de despegar.");
app.click(next(app));
assert.equal(app.state.stage, 8);
assert.match(textContent(app.tree), /12:27/);
assert.doesNotMatch(textContent(app.tree), /Los siete minutos de rodaje/);
assert.equal(next(app).props.disabled, false, "Closing reflection remains optional");
app.click(button(app, "12:20"));
assert.match(textContent(app.tree), /El intervalo termina a las 12:27/);
assert.match(textContent(app.tree), /Los siete minutos de rodaje/);
assert.match(textContent(app.tree), /La idea que te llevas/);
app.click(button(app, "12:27"));
assert.match(textContent(app.tree), /Correcto: a las 12:27/);
assert.equal(button(app, "12:27").props["aria-pressed"], true);
assert.equal(button(app, "12:20").props["aria-pressed"], false);
const closingJourney = structuredClone(app.state);
app = mount(closingJourney);
assert.equal(app.state.stage, 8, "Refresh preserves closing stage");
assert.doesNotMatch(textContent(app.tree), /Los siete minutos de rodaje/);
assert.equal(next(app).props.disabled, false, "Optional reflection never blocks after refresh");
app.click(button(app, "Anterior"));
assert.equal(app.state.stage, 7);
app.click(next(app));
assert.equal(app.state.stage, 8);
app.click(next(app));
assert.equal(app.state.stage, 9);
assert.equal(button(app, "Completar Learning Path").props.disabled, true);
for (const check of document.completionChecks) app.click(button(app, check));
app.click(button(app, "Completar Learning Path"));
assert.equal(app.completeCalls, 1);
app.click(button(app, "Completado"));
assert.equal(app.completeCalls, 1, "Repeated finish cannot double-award");
assert.equal(app.state.complete, true);
const completedState = structuredClone(app.state);
app = mount(completedState);
assert.equal(app.view.highest, 9);
app.view.onNavigate(3);
app.render();
assert.equal(app.state.stage, 3);
assert.equal(app.completeCalls, 0, "Completed review never awards completion");
const legacy = {
  ...freshAircraftJourney(),
  step: 3,
  maxStep: 3,
  previousJourney: { stage: 7, complete: false },
};
app = mount(legacy);
assert.deepEqual(app.state.previousJourney, legacy);
assert.equal(app.state.stage, 0);
assert.equal(app.state.maxStage, 0);
assert.match(textContent(app.tree), /Conservamos tu avance anterior/);
app = mount({ ...legacy, finished: true });
assert.equal(app.state.complete, true);
assert.equal(app.view.highest, 9);
app = mount(legacy, true);
assert.equal(app.state.complete, true);
assert.equal(app.completeCalls, 0);
for (const id of ids.slice(1)) assert.deepEqual(app.storage.get(id), { untouched: id });
const resumed = { ...completedState, complete: false, stage: 7, maxStage: 7 };
app = mount(resumed);
assert.equal(app.state.stage, 7);
assert.equal(app.state.answers[4], 1);
assert.equal(app.state.exerciseDone, true);
global.window = { confirm: () => false };
app.view.onReset();
app.render();
assert.equal(app.state.stage, 7);
window.confirm = () => true;
app.view.onReset();
app.render();
assert.equal(app.state.stage, 0);
assert.equal(app.state.version, "ciaac-aircraft-handbook-v3");
app = mount(completedState);
app.view.onReset();
app.render();
assert.equal(app.state.complete, true, "Reset never revokes earned completion");
assert.equal(app.state.maxStage, 9);
assert.equal(app.completeCalls, 0);
const migration = load(file("src/lib/lp/ciaac-aircraft-handbook-journey.ts"));
const dirty = migration.migrateAircraftHandbookJourney(
  {
    version: migration.AIRCRAFT_HANDBOOK_VERSION,
    stage: 999,
    maxStage: -1,
    answers: { 0: 99 },
    checks: null,
    exercise: null,
  },
  false,
  {
    ...completedState,
    stage: 0,
    maxStage: 0,
    complete: false,
    answers: {},
    checks: [false, false, false],
    exerciseDone: false,
    exercise: {
      pairs: {},
      selectedLeft: null,
      sequence: [],
      visited: [],
      tokens: [],
      values: {},
      feedback: "",
    },
  },
);
assert.equal(dirty.stage, 0);
assert.deepEqual(dirty.answers, {});
for (const name of ["preflight-pushback", "aircraft-support", "helicopter-rotor"]) {
  assert.ok(
    fs.existsSync(file(`public/lp/ciaac/aircraft-handbook/${name}.png`)),
    `Real illustration ${name} exists`,
  );
}
console.log(
  "PASS: native 10-stage lesson, diagnostic/mastery gates, matching, repeated finish, resume, legacy migration, completion preservation, reset, scoped assets.",
);
