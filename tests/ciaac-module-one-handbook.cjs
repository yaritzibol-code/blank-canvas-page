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
let document;
let activeId;
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
    ids.map((id) => [id, id === activeId ? structuredClone(saved) : { untouched: id }]),
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
  const { CiaacModuleOneLearningPath } = loader({
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
  })(file("src/components/lp/CiaacModuleOneLearningPath.tsx"));
  app.render = () => {
    for (let pass = 0; pass < 30; pass += 1) {
      changed = false;
      effects = [];
      tree = materialize(
        runComponent(
          CiaacModuleOneLearningPath,
          {
            document,
            userId: "test-user",
            lpId: activeId,
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
    state: { get: () => storage.get(activeId) },
    view: { get: () => stageView },
    completeCalls: { get: () => completeCalls },
  });
  app.render();
  return app;
}

const next = (app) => button(app, "Continuar");
for ([activeId, document] of Object.entries(CIAAC_LEARNING_PATHS).filter(
  ([id, d]) => id.startsWith("ciaac/aerodinamica/modulo-1-") && d.number > 1,
)) {
  const original = JSON.parse(read("src/lib/lp/ciaac-module1.content.json")).lessons.find(
    (l) => l.id === activeId,
  ).document;
  const renderedCards = [
    ...document.cards,
    ...document.stages.flatMap((s) => (s.kind === "content" ? s.cards : [])),
  ];
  for (const card of original.cards.filter(
    (c) => !["Error común", "La paleta y sus límites"].includes(c.title) && !(document.number === 2 && c.title === "Del concepto al avión"),
  )) {
    assert.ok(
      renderedCards.some((c) => c.title === card.title),
      `Preserve technical topic: ${card.title}`,
    );
  }
  if (document.number === 2) {
    const stage = document.stages.find(s => s.nav === "El aire y la viscosidad");
    assert.equal(stage.cards.length, 2, "Requested concise pair replaces repetitive third card");
    assert.match(stage.cards[0].text, /movimiento relativo/);
    assert.match(stage.cards[0].text, /fuerzas aerodinámicas/);
    assert.match(stage.cards[1].text, /resistencia interna.*capas/);
    assert.match(stage.cards[1].text, /No es densidad/);
    assert.ok(original.cards[7].covers.every(c => stage.cards[0].covers.includes(c)));
  }
  assert.equal(document.ciaac, undefined);
  assert.equal(document.stages.filter((s) => s.kind === "exercise").length, 1);
  assert.ok(!document.stages.some((s) => s.kind === "activity"));
  let app = mount({ stage: 6, maxStage: 7, activityResponses: { 2: { answer: "old" } } });
  assert.equal(app.state.stage, 0);
  assert.equal(app.state.previousJourney.maxStage, 7);
  assert.equal(app.state.migrationNotice, true);
  app.click(button(app, "Iniciar recorrido"));
  for (let stageIndex = 1; stageIndex < document.stages.length - 1; stageIndex++) {
    const stage = document.stages[stageIndex];
    assert.equal(app.state.stage, stageIndex);
    assert.equal(nodes(app.tree, (n) => n.type === "textarea" || n.type === "input").length, 0);
    if (stage.kind === "quiz") {
      assert.equal(next(app).props.disabled, true);
      for (const i of stage.questions) {
        const q = document.questions[i];
        const group = nodes(
          app.tree,
          (n) => n.props.role === "group" && n.props["aria-label"] === q.prompt,
        )[0];
        if (!stage.diagnostic) {
          app.click(
            nodes(
              group,
              (n) =>
                n.type === "button" &&
                textContent(n).endsWith(q.options[(q.correct + 1) % q.options.length]),
            )[0],
          );
          assert.equal(next(app).props.disabled, true, "Wrong mastery choice is gated");
        }
        app.click(
          nodes(
            group,
            (n) =>
              n.type === "button" &&
              textContent(n).endsWith(
                q.options[stage.diagnostic ? (q.correct + 1) % q.options.length : q.correct],
              ),
          )[0],
        );
      }
    }
    if (stage.kind === "exercise") {
      assert.equal(next(app).props.disabled, true);
      for (const pair of document.exercise.pairs) {
        app.click(
          nodes(
            nodes(app.tree, (n) => hasClass(n, "hb-pair-grid"))[0],
            (n) => n.type === "button" && textContent(n).endsWith(pair[0]),
          )[0],
        );
        app.click(button(app, pair[1]));
      }
      app.click(button(app, "Comprobar relaciones"));
    }
    assert.equal(next(app).props.disabled, false);
    const saved = structuredClone(app.state);
    app = mount(saved);
    assert.equal(app.state.stage, stageIndex, "Refresh keeps each stage");
    app.click(next(app));
  }
  assert.equal(button(app, "Completar Learning Path").props.disabled, true);
  // Finish checklist buttons carry their state on the enclosing hb-checks region.
  const checks = nodes(app.tree, (n) => hasClass(n, "hb-checks"))[0];
  for (let i = 0; i < document.completionChecks.length; i++) {
    const region = nodes(app.tree, (n) => hasClass(n, "hb-checks"))[0];
    app.click(nodes(region, (n) => n.type === "button")[i]);
  }
  app.click(button(app, "Completar Learning Path"));
  assert.equal(app.state.complete, true);
  assert.equal(app.completeCalls, 1);
  const completed = mount({ stage: 9, finished: true });
  assert.equal(completed.state.maxStage, document.stages.length - 1);
  assert.equal(completed.state.complete, true);
  const accountCompleted = mount({ stage: 3 }, true);
  assert.equal(accountCompleted.state.complete, true);
  assert.equal(accountCompleted.completeCalls, 0);
  assert.ok(app.writes.every(([, id]) => id === activeId));
}
console.log(
  "PASS: four native Handbook paths, all stages, selection/matching gates, refresh, previous-journey retention and completed review access.",
);
