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
const concepts = { machine: "machine", condition: "condition", interval: "interval" };
const solved = () => ({
  ...freshAircraftJourney(),
  classified: {
    airplane: "aircraft",
    helicopter: "aircraft",
    glider: "aircraft",
    balloon: "aircraft",
    hovercraft: "excluded",
  },
  conceptMatches: { ...concepts },
  planeStart: 1,
  planeEnd: 5,
  purposeChoices: { flight: "counts", hangar: "does-not-start" },
  helicopterLabels: { start: "rotor-start", end: "aircraft-and-rotor-stop" },
  helicopterMissing: 1,
  cases: { glider: 1, taxi: 0, rotor: 2 },
  finalMap: { ...concepts },
});
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
const primary = (app) => {
  const buttons = nodes(app.tree, (node) => node.type === "button" && hasClass(node, "av-primary"));
  assert.equal(buttons.length, 1, "One main scene-advance action");
  return buttons[0];
};
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
const eventData = loader({ react: {}, "react/jsx-runtime": jsx })(
  file("src/components/lp/CiaacAircraftScenes.tsx"),
);

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
    "./CiaacAircraftScenes": {
      ...eventData,
      AircraftIllustration: (props) => element("test-illustration", props),
      OperationScene: (props) => element("test-operation", props),
    },
    "./LearningPathExperience": {
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
    state: { get: () => records.get("root").slots[0] },
    view: { get: () => stageView },
    completeCalls: { get: () => completeCalls },
  });
  app.render();
  return app;
}

// Wrong objective responses cannot advance even if the disabled callback is invoked directly.
const wrongPatches = [
  { classified: { ...solved().classified, hovercraft: "aircraft" } },
  { conceptMatches: { ...concepts, machine: "condition" } },
  { planeStart: 3 },
  { helicopterMissing: 0 },
  { cases: { glider: 1, taxi: 1, rotor: 2 } },
];
for (let step = 0; step < 5; step += 1) {
  const app = mount({ ...solved(), ...wrongPatches[step], step, maxStep: 4 });
  assert.equal(primary(app).props.disabled, true, `Scene ${step}: wrong response is gated`);
  app.click(primary(app));
  assert.equal(app.state.step, step);
  assert.equal(app.completeCalls, 0);
  assert.equal(
    nodes(
      app.tree,
      (node) =>
        node.type === "textarea" ||
        (node.type === "input" && !["button", "radio"].includes(node.props.type)),
    ).length,
    0,
    "No free-text or self-certification gate",
  );
  assert.doesNotMatch(textContent(app.tree), /cómputo/i, "Plain-language questions and feedback");
  const ready = mount({ ...solved(), step, maxStep: 4 });
  assert.equal(primary(ready).props.disabled, false, `Scene ${step}: correct work unlocks`);
}
const app = mount(freshAircraftJourney());
app.click(button(app, "Aerodeslizador"));
assert.equal(app.state.selectedAircraft, "hovercraft");
app.click(button(app, /^Es aeronave/));
assert.equal(app.state.classified.hovercraft, "aircraft");
assert.match(textContent(app.tree), /colchón de aire.*superficie debajo/s);
app.click(button(app, /^Queda fuera de esta definición/));
assert.equal(app.state.classified.hovercraft, "excluded");
for (const name of ["Avión", "Helicóptero", "Planeador", "Globo"]) {
  app.click(button(app, name));
  app.click(button(app, /^Es aeronave/));
}
assert.equal(primary(app).props.disabled, false);
app.click(primary(app));
assert.equal(app.state.step, 1);
assert.equal(app.state.done[0], true);
app.click(button(app, "En el aire"));
assert.equal(app.state.machineMoment, 2);
app.click(button(app, "Una condición física"));
const slot = (instance, label) => {
  const matches = nodes(
    instance.tree,
    (node) => node.type === "button" && node.props["aria-label"]?.startsWith(`${label}:`),
  );
  assert.equal(matches.length, 1, `One matching slot ${label}`);
  return matches[0];
};
app.click(slot(app, "Aeronave"));
assert.equal(app.state.conceptMatches.machine, "condition");
assert.match(textContent(app.tree), /Está estacionado y sigue siendo una aeronave/);
app.click(button(app, "La máquina"));
app.click(slot(app, "Aeronave"));
assert.equal(app.state.conceptMatches.machine, "machine");
assert.deepEqual(
  app.storage.get(AIRCRAFT_LP_ID),
  app.state,
  "Selection and navigation persist through the real save effect",
);
const refreshed = mount(app.storage.get(AIRCRAFT_LP_ID));
assert.deepEqual(refreshed.state, app.state, "Refresh restores actual rendered progress");
refreshed.view.onNavigate(0);
refreshed.render();
assert.equal(refreshed.state.step, 0);
refreshed.view.onNavigate(4);
refreshed.render();
assert.equal(refreshed.state.step, 0, "Unopened scenes remain locked");

// Temporal teaching puts its explicit scope before the actual scenario illustration.
for (const step of [2, 3]) {
  const temporal = mount({ ...solved(), step, maxStep: 4 });
  const ordered = nodes(temporal.tree, () => true);
  const scope = ordered.findIndex((node) => hasClass(node, "av-scope"));
  const illustration = ordered.findIndex((node) => node.type === "test-operation");
  assert.ok(scope >= 0 && scope < illustration, "OACI scope comes before temporal example");
  assert.match(textContent(ordered[scope]), /OACI/);
}
const plane = mount({ ...solved(), step: 2, maxStep: 4 });
const endpoints = nodes(plane.tree, (node) => node.type === "select");
assert.equal(endpoints.length, 2);
endpoints[0].props.onChange({ target: { value: "3" } });
plane.render();
assert.equal(plane.state.planeStart, 3);
assert.equal(plane.state.planeEvent, 3);
assert.equal(primary(plane).props.disabled, true);
assert.match(textContent(plane.tree), /inicia el tiempo en el aire/);
nodes(plane.tree, (node) => node.type === "select")[0].props.onChange({ target: { value: "1" } });
plane.render();
nodes(plane.tree, (node) => node.type === "select")[1].props.onChange({ target: { value: "2" } });
plane.render();
assert.equal(plane.state.planeEnd, 2);
assert.match(textContent(plane.tree), /La espera es temporal/);
nodes(plane.tree, (node) => node.type === "select")[1].props.onChange({ target: { value: "5" } });
plane.render();
plane.click(button(plane, /Compara el propósito/));
assert.equal(
  nodes(plane.tree, (node) => node.type === "select").length,
  0,
  "Purpose comparison has its own panel",
);
plane.click(button(plane, /No: no tiene el propósito/));
assert.equal(plane.state.purposeChoices.flight, "does-not-start");
assert.equal(primary(plane).props.disabled, true);
plane.click(button(plane, /Sí: tiene el propósito/));
plane.click(button(plane, /Lo cambian de hangar/));
assert.equal(plane.state.planePurpose, "hangar");
plane.click(button(plane, /Sí: tiene el propósito/));
assert.equal(plane.state.purposeChoices.hangar, "counts");
assert.equal(primary(plane).props.disabled, true);
plane.click(button(plane, /No: no tiene el propósito/));
assert.equal(plane.state.purposeChoices.hangar, "does-not-start");
assert.equal(primary(plane).props.disabled, false);
assert.equal(
  nodes(plane.tree, (node) => node.type === "test-operation")[0].props.purpose,
  "hangar",
);
plane.click(button(plane, /Marca el intervalo/));
assert.equal(
  nodes(plane.tree, (node) => node.type === "test-operation")[0].props.purpose,
  "flight",
  "Returning to interval restores the flight context",
);

const helicopter = mount({ ...solved(), step: 3, maxStep: 4 });
helicopter.click(button(helicopter, "Aeronave y palas detenidas al terminar"));
helicopter.click(slot(helicopter, "Aquí empieza el intervalo"));
assert.equal(helicopter.state.helicopterLabels.start, "aircraft-and-rotor-stop");
assert.equal(primary(helicopter).props.disabled, true);
helicopter.click(button(helicopter, "Empieza a girar el rotor"));
helicopter.click(slot(helicopter, "Aquí empieza el intervalo"));
helicopter.click(button(helicopter, /Qué condición falta/));
assert.equal(
  nodes(helicopter.tree, (node) => node.type === "test-operation")[0].props.eventIndex,
  3,
  "Missing condition is shown with the rotor still turning",
);
assert.equal(
  nodes(helicopter.tree, (node) => hasClass(node, "av-map")).length,
  0,
  "Missing-condition question has its own panel",
);
helicopter.click(button(helicopter, /Que se apaguen todos los sistemas/));
assert.equal(helicopter.state.helicopterMissing, 2);
assert.equal(primary(helicopter).props.disabled, true);
assert.match(textContent(helicopter.tree), /no apagar todos los sistemas/);
helicopter.click(button(helicopter, /Que las palas del rotor se detengan/));
assert.equal(helicopter.state.helicopterMissing, 1);
assert.equal(primary(helicopter).props.disabled, false);

const application = mount({ ...solved(), step: 4, maxStep: 4 });
application.click(button(application, /No: necesita un motor/));
assert.equal(application.state.cases.glider, 0);
assert.equal(primary(application).props.disabled, true);
application.click(button(application, /Sí: importa cómo puede sostenerse/));
application.click(button(application, /Una espera en tierra/));
application.click(button(application, /Termina porque el avión dejó de moverse/));
assert.equal(application.state.cases.taxi, 1);
application.click(button(application, /Sigue contando: la operación/));
application.click(button(application, /Ya aterrizó, pero/));
application.click(button(application, /Nada: terminó al tocar tierra/));
assert.equal(application.state.cases.rotor, 0);
application.click(button(application, /Que las palas del rotor se detengan/));
application.click(button(application, "Un intervalo definido"));
application.click(slot(application, "Aeronave"));
assert.equal(application.state.finalMap.machine, "interval");
assert.equal(primary(application).props.disabled, true);
application.click(button(application, "La máquina"));
application.click(slot(application, "Aeronave"));
assert.equal(primary(application).props.disabled, false);

const earlierError = mount({ ...solved(), conceptMatches: {}, step: 4, maxStep: 4 });
assert.equal(
  primary(earlierError).props.disabled,
  true,
  "A revised earlier error must be repaired before final completion",
);
earlierError.click(primary(earlierError));
assert.equal(earlierError.completeCalls, 0);

const final = mount({ ...solved(), step: 4, maxStep: 4 });
const finish = primary(final);
finish.props.onClick();
finish.props.onClick();
final.render();
assert.equal(
  final.completeCalls,
  1,
  "Repeated finish clicks use the existing callback exactly once",
);
assert.equal(final.state.finished, true);
assert.deepEqual(final.state.done, [true, true, true, true, true]);
primary(final).props.onClick();
assert.equal(final.completeCalls, 1);
const review = mount({ stage: 9, maxStage: 9, complete: true }, true);
assert.equal(review.state.finished, true);
assert.equal(review.view.highest, 4);
review.view.onNavigate(4);
review.render();
assert.equal(review.state.step, 4);
review.click(button(review, "Anterior"));
assert.equal(review.state.step, 3);
assert.equal(
  primary(review).props.disabled,
  false,
  "Completed review navigation does not require re-answering",
);
assert.equal(review.completeCalls, 0);
const originalWindow = global.window;
try {
  global.window = { confirm: () => false };
  const before = structuredClone(app.state);
  const writes = app.writes.length;
  app.view.onReset();
  app.render();
  assert.deepEqual(app.state, before, "Cancelling reset leaves the journey intact");
  assert.equal(app.resets.length, 0);
  assert.equal(app.writes.length, writes);
} finally {
  if (originalWindow === undefined) delete global.window;
  else global.window = originalWindow;
}
for (const [id, value] of app.storage) {
  if (id !== AIRCRAFT_LP_ID)
    assert.deepEqual(value, { untouched: id }, "Other LP journeys are untouched");
}
assert.ok(app.writes.every(([userId, lpId]) => userId === "test-user" && lpId === AIRCRAFT_LP_ID));
const source = nodes(app.tree, (node) => node.type === "details" && hasClass(node, "av-sources"));
assert.equal(source.length, 1);
assert.deepEqual(
  nodes(source, (node) => node.type === "a").map((node) => node.props.href),
  document.sources.filter((item) => item.url).map((item) => item.url),
);
for (const reference of document.sources) {
  assert.ok(textContent(source).includes(reference.title));
  if (reference.limit) assert.ok(textContent(source).includes(reference.limit));
}
for (const img of nodes(
  final.tree,
  (node) => node.type === "img" && /Pathy/i.test(node.props.alt),
)) {
  assert.equal(
    img.props.src,
    "/lp/visual/pathy.png",
    "Reuse transparent approved Pathy, not the official board",
  );
}
assert.ok(
  nodes(final.tree, (node) => node.type === "img" && node.props.src === "/lp/visual/pathy.png")
    .length > 0,
);
assert.ok(
  !nodes(final.tree, (node) => node.type === "img").some((node) =>
    /board|official/i.test(node.props.src),
  ),
);
const png = fs.readFileSync(file("public/lp/visual/pathy.png"));
assert.equal(png.subarray(1, 4).toString(), "PNG");
assert.ok([4, 6].includes(png[25]), "Existing Pathy PNG includes an alpha channel");
const css = read("src/components/lp/ciaac-aircraft.css");
for (const selector of css
  .split("{")
  .slice(0, -1)
  .map((part) => part.split("}").at(-1))
  .filter((part) => part.includes(".lp-study"))) {
  for (const branch of selector.split(","))
    assert.match(
      branch,
      /\.lp-study--conceptual/,
      "Shared-shell CSS overrides are exact-experience scoped",
    );
}

// Execute the actual route decision, stubbing only external app/UI boundaries.
const Marker = (name) => Object.defineProperty(() => null, "name", { value: name });
const Dedicated = Marker("CiaacAircraftLearningPath");
const Handbook = Marker("HandbookLearningPath");
const Shell = Marker("LearningPathExperience");
let params;
const routeStub = {
  createFileRoute: () => (config) => ({ ...config, useParams: () => params }),
  Link: Marker("Link"),
  Navigate: Marker("Navigate"),
  useNavigate: () => () => {},
};
const subject = { id: "ciaac/aerodinamica", titulo: "Aerodinámica" };
const container = {
  titulo: "Módulo 1",
  learningPaths: ids.map((id) => ({ id, titulo: CIAAC_LEARNING_PATHS[id].title })),
};
const { Route } = loader({
  react: { useState: (initial) => [initial, () => {}], useEffect: () => {} },
  "react/jsx-runtime": jsx,
  "@tanstack/react-router": routeStub,
  "@/components/ui/fp-icon": { Icon: Marker("Icon") },
  "@/components/lp/ApplicableRegulationsPath": {
    APPLICABLE_REGULATIONS_LP_ID: "unrelated",
    ApplicableRegulationsPath: Marker("ApplicableRegulationsPath"),
  },
  "@/components/lp/AtpLearningPath": { AtpLearningPath: Marker("AtpLearningPath") },
  "@/components/lp/CiaacAircraftLearningPath": { CiaacAircraftLearningPath: Dedicated },
  "@/components/lp/HandbookLearningPath": { HandbookLearningPath: Handbook },
  "@/components/lp/JeppesenLearningPath": { JeppesenLearningPath: Marker("JeppesenLearningPath") },
  "@/components/lp/LegislationLearningPath": {
    LegislationLearningPath: Marker("LegislationLearningPath"),
  },
  "@/components/lp/LearningPathExperience": { LearningPathExperience: Shell },
  "@/components/shared/YarisChatModal": { YarisChatModal: Marker("YarisChatModal") },
  "@/components/lp/nav": {
    LpEmptyState: Marker("LpEmptyState"),
    LpFullscreen: Marker("LpFullscreen"),
    lpButtonStyle: () => ({}),
  },
  "@/lib/lp/taxonomy": {
    lpCategory: () => ({ titulo: "CIAAC" }),
    lpSubject: () => subject,
    lpContainer: () => container,
  },
  "@/lib/lp/atp-content.generated": { ATP_LEARNING_PATHS: {} },
  "@/lib/lp/annex10-content.generated": { ANNEX10_LEARNING_PATHS: {} },
  "@/lib/lp/handbook-content.generated": { HANDBOOK_LEARNING_PATHS: {} },
  "@/lib/lp/jeppesen-content.generated": { JEPPESEN_LEARNING_PATHS: {} },
  "@/lib/lp/legislation-content.generated": { LEGISLATION_LEARNING_PATHS: {} },
  "@/lib/store": { useSessionUser: () => ({ id: "test-user" }), useStore: (factory) => factory() },
  "@/lib/store/lp-nav": {
    completeLp: () => {},
    startLp: () => {},
    lpAccess: () => ({ allowed: true, status: "iniciado" }),
    lpNeighbors: () => ({}),
    subjectProgress: () => ({}),
  },
  "@/lib/lp/contextual-return": {
    leaveLearningPath: () => {},
    learningPathOrigin: () => null,
    rememberLearningPathOrigin: () => {},
  },
})(file("src/routes/dashboard/rutas/$categoria.$materia.$contenedor.$lp.tsx"));
for (const id of ids) {
  const [categoria, materia, contenedor, lp] = id.split("/");
  params = { categoria, materia, contenedor, lp };
  const tree = Route.component();
  assert.equal(
    nodes(tree, (node) => node.type === Dedicated).length,
    id === AIRCRAFT_LP_ID ? 1 : 0,
  );
  assert.equal(nodes(tree, (node) => node.type === Handbook).length, id === AIRCRAFT_LP_ID ? 0 : 1);
  const shell = nodes(tree, (node) => node.type === Shell)[0];
  assert.equal(shell.props.appearance, id === AIRCRAFT_LP_ID ? "conceptual" : undefined);
}
console.log(
  "PASS: real CIAAC aircraft renderer gates, handlers, persistence, review, completion, sources, art, CSS scope, and exact-ID route. In-memory checks only; no browser claim.",
);
