const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");

// Run actual TypeScript/TSX with only in-memory account, persistence, and router
// adapters. This test never writes curriculum files or accesses a live account.
const root = path.resolve(__dirname, "..");
const file = (relative) => path.join(root, relative);
const json = (relative) => JSON.parse(fs.readFileSync(file(relative), "utf8"));
const compiled = new Map();
function loader(overrides = {}) {
  const cache = new Map();
  function load(filename) {
    const relative = path.relative(root, filename).split(path.sep).join("/");
    if (Object.hasOwn(overrides, relative)) return overrides[relative];
    if (filename.endsWith(".css")) return {};
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = { exports: {} };
    cache.set(filename, mod);
    if (filename.endsWith(".json")) {
      mod.exports = JSON.parse(fs.readFileSync(filename, "utf8"));
      return mod.exports;
    }
    const stamp = `${filename}:${fs.statSync(filename).mtimeMs}`;
    if (!compiled.has(stamp)) {
      compiled.set(
        stamp,
        ts.transpileModule(fs.readFileSync(filename, "utf8"), {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
      );
    }
    function localRequire(request) {
      if (Object.hasOwn(overrides, request)) return overrides[request];
      if (!request.startsWith(".") && !request.startsWith("@/")) return require(request);
      const base = request.startsWith("@/")
        ? file(`src/${request.slice(2)}`)
        : path.resolve(path.dirname(filename), request);
      const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}.json`, `${base}/index.ts`].find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      );
      assert.ok(resolved, `Unresolved ${request} from ${relative}`);
      return load(resolved);
    }
    vm.runInThisContext(`(function(require, module, exports) {${compiled.get(stamp)}\n})`, {
      filename,
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return (relative) => load(file(relative));
}
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

const approved = "src/lib/lp/ciaac-aircraft-approved/";
const catalog = json(`${approved}catalog.json`);
const documents = json(`${approved}documents.json`);
const firstId = catalog.lessons[0].id;
const document = documents[firstId];
const prefix = `${catalog.curriculumVersion}:${firstId}:`;
const oldVersion = `${prefix}v1`;
const newVersion = `${prefix}am01-remove-piston-v2`;
const { migrateApprovedAircraftJourney: migrate } = loader()(`${approved}journey.ts`);
const fresh = () => ({
  stage: 0,
  maxStage: 0,
  complete: false,
  answers: {},
  checks: document.completionChecks.map(() => false),
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
  activityResponses: {},
});
const oldState = (stage, maxStage = stage, extra = {}) => ({
  ...fresh(),
  version: oldVersion,
  stage,
  maxStage,
  ...extra,
});
const restore = (saved, completed = false, target = document, id = firstId) =>
  migrate(id, target, saved, completed, fresh());
const remap = (stage) => stage - Number(stage > 8);

assert.equal(catalog.lessons[0].status, "pending-user-review");
assert.equal(document.contentVersion, "am01-remove-piston-v2");
assert.deepEqual(
  document.stages.map((stage) => stage.nav),
  [
    "Comienza",
    "Aeróstatos",
    "Aerodinos",
    "Número de alas",
    "Posición del ala",
    "Forma en planta",
    "Ala rotativa: helicóptero",
    "Ala rotativa: autogiro",
    "Tipo de motor: turbina",
    "Número de motores",
    "Tractor, propulsor y tándem",
    "Tren convencional y triciclo",
    "Tren fijo y retráctil",
    "Superficie de operación",
    "Despegue y aterrizaje",
    "Tipo de cabina",
    "Reconoce varias características",
    "Cierra el recorrido",
  ],
  "Delete only the standalone piston screen and retain the remaining order",
);
assert.equal(document.stages.filter((stage) => stage.kind === "exercise").length, 1);
assert.equal(document.stages[16].kind, "exercise");
assert.equal(document.stages[17].kind, "finish");
assert.equal(document.stages.filter((stage) => stage.kind === "quiz").length, 0);
assert.deepEqual(document.questions, []);
assert.deepEqual(document.exercise, {
  kind: "match",
  title: "Reconoce varias características",
  instruction: "Relaciona cada aeronave con la combinación de características que observas.",
  pairs: [
    ["Aeronave A", "Monoplano de ala alta · tren triciclo · cabina cerrada"],
    ["Aeronave B", "Biplano · tren convencional · cabina abierta"],
    ["Aeronave C", "Monoplano · dos flotadores · operación sobre agua"],
  ],
  order: [2, 0, 1],
});
// The audit adds a separately checked PHAK passport; preserve this original source fixture.
const { restoreText } = require("./helpers/ciaac-am-st-source-corrections-v2.cjs");
const originalDocument = JSON.parse(
  restoreText(
    `${approved}documents.json`,
    fs.readFileSync(file(`${approved}documents.json`), "utf8"),
  ),
)[firstId];
assert.deepEqual(originalDocument.sources, [
  {
    id: "ciaac-aeronaves-generalidades-historico",
    title: "CIAAC · Aeronaves y motores: Generalidades (manual histórico consultado)",
    role: "Marco didáctico y terminología histórica; no sustituye los límites y procedimientos del fabricante.",
    verified_locators: ["AyM/7.1-2 a AyM/7.1-10"],
  },
]);
assert.equal(document.sourceLabel, "CIAAC · Aeronaves y motores");
assert.ok(
  [...document.figures, ...document.exerciseFigures].every(
    (figure) =>
      figure.caption === "Ilustración original para reconocimiento; geometría no dimensionada.",
  ),
  "Keep the original teaching-illustration legend",
);

// Exhaust all valid old current/unlocked pairs, including review of an earlier
// stage after the removed screen was passed. 190 pairs cover before/at/after.
let positionCases = 0;
for (let maxStage = 0; maxStage < 19; maxStage++) {
  for (let stage = 0; stage <= maxStage; stage++) {
    const saved = freeze(oldState(stage, maxStage));
    const snapshot = structuredClone(saved);
    const result = restore(saved);
    assert.equal(result.version, newVersion);
    assert.equal(result.stage, remap(stage), `Old current stage ${stage}, unlocked ${maxStage}`);
    assert.equal(result.maxStage, remap(maxStage), `Old unlocked stage ${maxStage}`);
    assert.equal(result.complete, false, "Reaching any old stage never manufactures completion");
    assert.equal(result.migrationNotice, false, "The deletion does not reset the learner");
    assert.deepEqual(result.previousJourney, snapshot);
    assert.deepEqual(saved, snapshot, "The old row is never mutated");
    assert.deepEqual(restore(structuredClone(result)), result, "Repeated hydration is idempotent");
    positionCases++;
  }
}

// Keep partially solved and solved final games, checks, and selected choices.
const partial = oldState(17, 17, {
  checks: [true, false, true],
  exercise: { ...fresh().exercise, pairs: { 0: 0, 1: 2 }, selectedLeft: 2 },
});
const partialCopy = structuredClone(partial);
const partialResult = restore(freeze(partial));
assert.equal(partialResult.stage, 16);
assert.equal(partialResult.maxStage, 16);
assert.deepEqual(partialResult.exercise.pairs, { 0: 0, 1: 2 });
assert.equal(partialResult.exercise.selectedLeft, 2);
assert.equal(partialResult.exerciseDone, false);
assert.deepEqual(partialResult.checks, [true, false, true]);
partialResult.exercise.pairs[0] = 1;
partialResult.checks[0] = false;
assert.deepEqual(partial, partialCopy, "Active game/check maps do not alias the old row");

const solved = oldState(18, 18, {
  checks: [true, true, true],
  exerciseDone: true,
  exercise: { ...fresh().exercise, pairs: { 0: 0, 1: 1, 2: 2 }, selectedLeft: 1 },
});
for (const savedComplete of [false, true]) {
  for (const accountComplete of [false, true]) {
    const result = restore({ ...solved, complete: savedComplete }, accountComplete);
    assert.equal(result.stage, 17);
    assert.equal(result.maxStage, 17);
    assert.equal(result.complete, savedComplete || accountComplete);
    assert.equal(result.exerciseDone, true);
    assert.deepEqual(result.exercise.pairs, solved.exercise.pairs);
    assert.deepEqual(result.checks, solved.checks);
    assert.deepEqual(restore(structuredClone(result), accountComplete), result);
  }
}
assert.equal(restore({ ...solved, complete: "true" }).complete, false);
const reviewed = restore(oldState(4, 9, { complete: true }));
assert.equal(reviewed.stage, 4);
assert.equal(reviewed.maxStage, 17);
assert.equal(reviewed.complete, true);
assert.deepEqual(reviewed.exercise.pairs, {}, "Review access does not fabricate game answers");
assert.equal(reviewed.exerciseDone, false);

// Only this exact LP/version/deletion is migrated. Legacy and different lesson
// states are archived without importing progress or completion into this LP.
for (const saved of [
  { stage: 17, maxStage: 18, complete: true, exerciseDone: true },
  { ...solved, version: `legacy-aircraft:${firstId}:v1`, complete: true },
  {
    ...solved,
    version: `${catalog.curriculumVersion}:${catalog.lessons[1].id}:v1`,
    complete: true,
  },
  { ...solved, version: `${prefix}unknown`, complete: true },
]) {
  const snapshot = structuredClone(saved);
  const result = restore(freeze(saved));
  assert.equal(result.stage, 0);
  assert.equal(result.maxStage, 0);
  assert.equal(result.complete, false);
  assert.equal(result.exerciseDone, false);
  assert.deepEqual(result.exercise.pairs, {});
  assert.deepEqual(result.previousJourney, snapshot);
  assert.equal(result.migrationNotice, true);
  assert.deepEqual(saved, snapshot);
  assert.deepEqual(restore(structuredClone(result)), result);
  assert.equal(restore(saved, true).complete, true, "Authoritative completion remains reviewable");
}
for (const lesson of catalog.lessons.slice(1)) {
  if (!documents[lesson.id]) continue;
  const otherDocument = documents[lesson.id];
  const otherStage = Math.min(3, otherDocument.stages.length - 1);
  const otherState = {
    ...fresh(),
    version: `${catalog.curriculumVersion}:${lesson.id}:${otherDocument.contentVersion ?? "v1"}`,
    stage: otherStage,
    maxStage: otherStage,
  };
  const unchanged = restore(otherState, false, otherDocument, lesson.id);
  assert.equal(unchanged.stage, otherStage);
  assert.equal(unchanged.maxStage, otherStage);
  assert.equal(unchanged.version, otherState.version);
  const isolated = restore({ ...solved, complete: true }, false, otherDocument, lesson.id);
  assert.equal(isolated.stage, 0);
  assert.equal(isolated.complete, false);
  assert.deepEqual(isolated.exercise.pairs, {});
}
for (const alteredDocument of [
  { ...document, contentVersion: "am01-unreviewed-v3" },
  { ...document, stages: document.stages.slice(0, -1) },
]) {
  assert.equal(restore(solved, false, alteredDocument).stage, 0, "No unrecognized migration");
  assert.equal(restore(solved, false, alteredDocument).complete, false);
}
const freshInput = freeze(fresh());
const freshSnapshot = structuredClone(freshInput);
const documentSnapshot = structuredClone(document);
migrate(firstId, freeze(document), freeze(solved), false, freshInput);
assert.deepEqual(freshInput, freshSnapshot);
assert.deepEqual(document, documentSnapshot, "Migration never mutates content or fresh state");
assert.equal(restore(null).stage, 0);
assert.equal(restore(null).complete, false);

// Execute the real subject route and real taxonomy/progress functions. Only
// account storage and navigation components are adapters; no label is duplicated
// from the route implementation to obtain its actual result.
let categoryId = "ciaac";
let currentUser = { id: "review-owner" };
let progressRows = [];
const Card = () => null;
const noWrite = () => assert.fail("Subject cards must be read-only");
const routeLoad = loader({
  "@tanstack/react-router": {
    createFileRoute: () => (options) => ({
      ...options,
      useParams: () => ({ categoria: categoryId }),
    }),
    Navigate: () => null,
  },
  "@/components/lp/nav": {
    LpCard: Card,
    LpBreadcrumbs: () => null,
    LpGrid: () => null,
    LpHeader: () => null,
  },
  "src/routes/dashboard/rutas/index.tsx": { CATEGORY_STYLE: {} },
  "@/lib/store": { useSessionUser: () => currentUser, useStore: (selector) => selector() },
  "src/lib/store/db.ts": { read: (_key, fallback) => fallback, update: noWrite, nowISO: noWrite },
  "src/lib/store/domain.ts": {
    getTemaProgress: (userId) => progressRows.filter((row) => row.userId === userId),
    completeTema: noWrite,
  },
  "src/lib/store/gating.ts": { isPaid: noWrite },
});
const taxonomy = routeLoad("src/lib/lp/taxonomy.ts");
const availability = routeLoad("src/lib/lp/ciaac-availability.ts");
const { Route } = routeLoad("src/routes/dashboard/rutas/$categoria.index.tsx");
const categoriesBefore = structuredClone(taxonomy.LP_CATEGORIES);
const subjectIds = (subject) =>
  subject.containers.flatMap((container) => container.learningPaths.map((lp) => lp.id));
function cardsFrom(node, result = []) {
  if (Array.isArray(node)) {
    node.forEach((child) => cardsFrom(child, result));
  } else if (node && typeof node === "object") {
    if (node.type === Card) result.push(node.props);
    else cardsFrom(node.props?.children, result);
  }
  return result;
}
let descriptorCases = 0;
let singularCases = 0;
let pluralCases = 0;
for (const category of taxonomy.LP_CATEGORIES) {
  categoryId = category.id;
  for (const requestedDone of [0, 2, Infinity]) {
    progressRows = category.subjects.flatMap((subject) => {
      const ids = subjectIds(subject);
      const doneIds = ids.slice(0, Math.min(requestedDone, ids.length));
      return [
        ...doneIds.map((id) => ({ userId: currentUser.id, temaId: `lp:${id}`, completado: true })),
        ...doneIds.map((id) => ({ userId: currentUser.id, temaId: `lp:${id}`, completado: true })),
        ...ids.map((id) => ({ userId: "another-account", temaId: `lp:${id}`, completado: true })),
        { userId: currentUser.id, temaId: `lp:${ids[0]}`, completado: false },
        {
          userId: currentUser.id,
          temaId: "lp:unrelated/subject/container/lesson",
          completado: true,
        },
      ];
    });
    const props = cardsFrom(Route.component());
    assert.equal(props.length, category.subjects.length);
    category.subjects.forEach((subject, i) => {
      const modules = subject.containers.length;
      const total = subjectIds(subject).length;
      const done = Math.min(requestedDone, total);
      assert.equal(
        props[i].meta,
        `${modules} ${modules === 1 ? "módulo" : "módulos"} · ${total} learning paths · ${done} completados`,
        `${subject.id}: count all containers/LPs and real unique user completions, including zero`,
      );
      assert.equal(props[i].percent, total ? Math.round((done / total) * 100) : 0);
      assert.equal(props[i].title, subject.titulo);
      assert.equal(props[i].to, "/dashboard/rutas/$categoria/$materia");
      assert.deepEqual(props[i].params, {
        categoria: category.id,
        materia: subject.id.split("/")[1],
      });
      assert.equal(props[i].disabled, !availability.hasAvailableCiaacContent(subject.id));
      assert.equal(props[i].lockReason, props[i].disabled ? "En preparación" : undefined);
      descriptorCases++;
      if (modules === 1) singularCases++;
      else pluralCases++;
    });
  }
}
assert.ok(singularCases > 0 && pluralCases > 0);
assert.deepEqual(
  taxonomy.LP_CATEGORIES,
  categoriesBefore,
  "Presentation does not mutate academic grouping",
);
currentUser = null;
progressRows = [{ userId: "review-owner", temaId: `lp:${firstId}`, completado: true }];
assert.ok(cardsFrom(Route.component()).every((card) => card.meta.endsWith(" · 0 completados")));

async function verifyDomMigration() {
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM('<!doctype html><div id="review-root"></div>', {
    url: "https://example.test",
  });
  Object.assign(global, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = require("react-dom/client");
  let saved;
  let view;
  let completeCalls = 0;
  let reactRoot;
  const domLoad = loader({
    "@/components/lp/LearningPathExperience": {
      useLearningPathStageView: (value) => {
        view = value;
      },
    },
    "@/lib/store/lp-journey": {
      getLpJourney: () => saved,
      saveLpJourney: (_user, id, state) => {
        assert.equal(id, firstId);
        saved = structuredClone(state);
      },
      resetLpJourney: noWrite,
    },
  });
  const { CiaacApprovedAircraftLearningPath: Component } = domLoad(
    "src/components/lp/CiaacApprovedAircraftLearningPath.tsx",
  );
  const mount = async () => {
    reactRoot = createRoot(global.document.getElementById("review-root"));
    await React.act(() =>
      reactRoot.render(
        React.createElement(Component, {
          document,
          lpId: firstId,
          userId: "isolated-review",
          completed: false,
          onComplete: () => {
            completeCalls++;
          },
        }),
      ),
    );
  };
  const unmount = async () => React.act(() => reactRoot.unmount());
  const button = (text) => {
    const matches = [...global.document.querySelectorAll("button")].filter(
      (node) => node.textContent.trim() === text,
    );
    assert.equal(matches.length, 1, `One button: ${text}`);
    return matches[0];
  };
  const click = async (node) => {
    assert.equal(node.disabled, false);
    await React.act(() => node.click());
  };
  try {
    // Loading, then reloading, at the removed screen lands on the next remaining
    // explanation. Source disclosure, legend and all 18 navigation items survive.
    saved = oldState(8, 8);
    await mount();
    assert.equal(saved.stage, 8);
    assert.equal(
      global.document.querySelector(".hb-heading h2").textContent,
      "Tipo de motor: turbina",
    );
    assert.equal(global.document.querySelectorAll(".hb-waypoints button").length, 18);
    assert.doesNotMatch(
      global.document.querySelector(".hb-waypoints").textContent,
      /Tipo de motor: pistón/,
    );
    assert.match(global.document.body.textContent, /Ilustración original para reconocimiento/);
    assert.match(global.document.body.textContent, /Generalidades \(manual histórico consultado\)/);
    assert.equal(completeCalls, 0);
    const firstLoad = structuredClone(saved);
    await unmount();
    await mount();
    assert.deepEqual(saved, firstLoad);
    assert.equal(completeCalls, 0);
    await unmount();

    // Partial final-game state is retained through refresh and back/forward.
    saved = oldState(17, 17, {
      exercise: { ...fresh().exercise, pairs: { 0: 0 }, selectedLeft: null },
    });
    await mount();
    assert.equal(view.current, 16);
    assert.equal(view.highest, 16);
    assert.equal(saved.exerciseDone, false);
    assert.equal(button("Continuar").disabled, true);
    assert.deepEqual(saved.exercise.pairs, { 0: 0 });
    assert.equal(
      global.document.querySelectorAll(".am-recognition-grid .am-illustration").length,
      3,
    );
    const gameLoad = structuredClone(saved);
    await unmount();
    await mount();
    assert.deepEqual(saved, gameLoad);
    await click(button("Anterior"));
    assert.equal(saved.stage, 15);
    await click(button("Continuar"));
    assert.equal(saved.stage, 16);
    assert.deepEqual(saved.exercise.pairs, { 0: 0 });
    assert.equal(button("Continuar").disabled, true);
    assert.equal(completeCalls, 0);
    await unmount();

    // Fully solved old game keeps its gate open without granting LP completion.
    saved = { ...structuredClone(solved), stage: 17, maxStage: 17, complete: false };
    await mount();
    assert.equal(saved.stage, 16);
    assert.equal(saved.exerciseDone, true);
    assert.equal(button("Continuar").disabled, false);
    assert.equal(completeCalls, 0);
    await click(button("Continuar"));
    assert.equal(saved.stage, 17);
    assert.equal(saved.complete, false);
    assert.equal(completeCalls, 0, "Reaching the finish is not a new reward");
    await click(button("Completar Learning Path"));
    assert.equal(completeCalls, 1, "Only explicit completion invokes the completion callback");
    assert.equal(saved.complete, true);
    await unmount();
    await mount();
    assert.equal(saved.complete, true);
    assert.equal(completeCalls, 1, "Refresh of completed v2 does not award again");
    await unmount();

    saved = { ...structuredClone(solved), complete: true };
    await mount();
    assert.equal(saved.stage, 17);
    assert.equal(saved.complete, true);
    assert.equal(button("Completado").disabled, true);
    assert.equal(completeCalls, 1, "Restoring completed v1 does not award again");
    await unmount();
    reactRoot = null;
  } finally {
    if (reactRoot) await React.act(() => reactRoot.unmount());
    dom.window.close();
  }
}

verifyDomMigration()
  .then(() =>
    console.log(
      `PASS: AM01 18-stage correction; ${positionCases} v1 position migrations; game/check/completion preservation, isolation, idempotence and no mutation; ${descriptorCases} real CIAAC/airline card descriptors; DOM refresh/back-forward and no automatic completion rewards.`,
    ),
  )
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
