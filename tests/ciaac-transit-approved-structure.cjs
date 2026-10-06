const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
const file = (relative) => path.join(root, relative);
const json = (relative) => JSON.parse(fs.readFileSync(file(relative), "utf8"));
const approved = "src/lib/lp/ciaac-transit-approved/";
const catalog = json(`${approved}catalog.json`);
const docs = json(`${approved}documents.json`);
const sourceIds = Object.keys(docs);
const raw = json("src/lib/lp/taxonomy.json");
const oldSubject = raw.categories
  .find((category) => category.id === "ciaac")
  .subjects.find((subject) => subject.id === catalog.subjectId);
const legacyItems = oldSubject.containers.flatMap((container) => container.learningPaths);
const approvedIds = catalog.lessons.map((lesson) => lesson.id);
const compilationCache = new Map();

function loader(overrides = {}) {
  const cache = new Map();
  function load(filename) {
    const relative = path.relative(root, filename).split(path.sep).join("/");
    if (Object.hasOwn(overrides, relative)) return overrides[relative];
    if (filename.endsWith(".css")) return {};
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith(".json")) {
      const exports = JSON.parse(fs.readFileSync(filename, "utf8"));
      cache.set(filename, { exports });
      return exports;
    }
    const mod = { exports: {} };
    cache.set(filename, mod);
    const stamp = `${filename}:${fs.statSync(filename).mtimeMs}`;
    if (!compilationCache.has(stamp)) {
      compilationCache.set(
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
    const localRequire = (request) => {
      if (!request.startsWith(".") && !request.startsWith("@/")) return require(request);
      const base = request.startsWith("@/")
        ? file(`src/${request.slice(2)}`)
        : path.resolve(path.dirname(filename), request);
      const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}.json`].find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      );
      assert.ok(resolved, `Unresolved ${request} from ${relative}`);
      return load(resolved);
    };
    vm.runInThisContext(`(function(require, module, exports) {${compilationCache.get(stamp)}\n})`, {
      filename,
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return (relative) => load(file(relative));
}

const load = loader();
const content = load(`${approved}content.ts`);
const { collectReadyApprovedTransitDocuments: collect } = content;
const { migrateApprovedAircraftJourney: migrate } = load(
  "src/lib/lp/ciaac-aircraft-approved/journey.ts",
);
// These records exist in memory solely to exercise fail-closed gate branches.
// They are not publication approvals or a source-review artifact.
const fixtureReviews = sourceIds.map((id) => ({
  id,
  curriculumVersion: catalog.curriculumVersion,
  notebooklmExplanationSha256: "a".repeat(64),
  scopeReviewed: true,
  visualsReviewed: true,
  assessmentReviewed: true,
}));
assert.deepEqual(
  catalog.lessons.map((lesson) => lesson.code),
  ["ST01", "ST02", "ST03", "ST04", "ST05", "ST06", "ST07"],
);
assert.deepEqual(
  catalog.lessons.map((lesson) => lesson.order),
  [1, 2, 3, 4, 5, 6, 7],
);
assert.equal(legacyItems.length, 48);
for (const id of approvedIds) {
  assert.equal(id.split("/").length, 4);
  assert.ok(id.startsWith(`${catalog.containerId}/`));
  assert.ok(!legacyItems.some((item) => item.id === id));
}
const actualReviews = json(`${approved}publication-review.json`);
const actualReady = collect(docs, actualReviews);
const actualActive = Boolean(actualReady[approvedIds[0]]);
assert.equal(content.APPROVED_TRANSIT_ACTIVE, actualActive);
assert.deepEqual(content.APPROVED_TRANSIT_READY_IDS, actualActive ? Object.keys(actualReady) : []);
assert.deepEqual(collect(docs, []), {});
assert.deepEqual(Object.keys(collect(docs, fixtureReviews)), sourceIds);
for (const key of ["scopeReviewed", "visualsReviewed", "assessmentReviewed"])
  assert.deepEqual(
    collect(
      docs,
      fixtureReviews.map((r) => ({ ...r, [key]: false })),
    ),
    {},
  );
for (const override of [{ curriculumVersion: "wrong" }, { notebooklmExplanationSha256: "invalid" }])
  assert.deepEqual(
    collect(
      docs,
      fixtureReviews.map((r) => ({ ...r, ...override })),
    ),
    {},
  );
assert.deepEqual(collect(docs, [...fixtureReviews, ...fixtureReviews]), {});
for (const id of sourceIds) {
  const copy = structuredClone(docs);
  copy[id].title += " changed";
  assert.ok(!collect(copy, fixtureReviews)[id]);
  const missingAssessment = structuredClone(docs);
  delete missingAssessment[id].exercise;
  assert.ok(!collect(missingAssessment, fixtureReviews)[id]);
  const badFigure = structuredClone(docs);
  badFigure[id].stages.find((s) => s.kind === "content").figures[0].alt += " different";
  assert.ok(!collect(badFigure, fixtureReviews)[id]);
}
const normalized = (s) => s.replace(/\s+/g, " ").trim();
const { ApprovedAircraftTeachingBoard: Board } = load(
  "src/components/lp/ApprovedAircraftTeachingBoard.tsx",
);
let boards = 0,
  cards = 0,
  figures = 0;
for (const [id, doc] of Object.entries(docs)) {
  assert.equal(doc.questions.length, 0, "No invented multiple-choice questions");
  assert.equal(doc.exercise.kind, "sequence");
  assert.deepEqual(doc.exercise.order, [2, 0, 1]);
  assert.deepEqual([...doc.exercise.order].sort(), [0, 1, 2]);
  const stages = doc.stages.filter((s) => s.kind === "content");
  const html = renderToStaticMarkup(
    React.createElement(
      "main",
      null,
      ...stages.map((stage) =>
        React.createElement(Board, { key: stage.id, stage, board: stage.board, onZoom: () => {} }),
      ),
    ),
  );
  const dom = new JSDOM(html).window.document;
  const text = normalized(dom.body.textContent);
  const ids = [...dom.querySelectorAll("[id]")].map((el) => el.id);
  assert.equal(new Set(ids).size, ids.length, `${id}: unique DOM IDs`);
  for (const stage of stages) {
    boards++;
    figures += stage.figures.length;
    for (const card of stage.cards) {
      cards++;
      assert.ok(text.includes(normalized(card.text)), `${id}: source card ${card.title}`);
      if (card.detailText)
        assert.ok(
          text.includes(normalized(card.detailText)),
          `${id}: full source answer ${card.title}`,
        );
    }
    if (stage.board.contextFigureNumber) {
      const context = stage.figures.find((f) => f.number === stage.board.contextFigureNumber);
      assert.ok(text.includes(normalized(context.observe)), `${id}: scenario context included`);
      if (stage === stages.at(-1))
        assert.ok(
          text.indexOf(normalized(context.observe)) < text.indexOf(normalized(stage.cards[0].text)),
          `${id}: scenario before questions`,
        );
    }
  }
  for (const figure of doc.figures) assert.ok(fs.existsSync(file(`public${figure.file}`)));
  const fresh = {
    stage: 0,
    maxStage: 0,
    answers: {},
    checks: doc.completionChecks.map(() => false),
    exercise: { pairs: {}, sequence: [], selectedLeft: null },
    exerciseDone: false,
    complete: false,
  };
  const state = migrate(id, doc, null, false, fresh, catalog.curriculumVersion);
  assert.equal(state.version, `${catalog.curriculumVersion}:${id}:${doc.contentVersion}`);
  assert.ok(!state.version.startsWith("ciaac-aircraft-approved"));
  const saved = {
    ...state,
    stage: 3,
    maxStage: 3,
    exercise: { ...state.exercise, sequence: [0, 1, 2] },
  };
  const resumed = migrate(id, doc, saved, false, fresh, catalog.curriculumVersion);
  assert.equal(resumed.stage, 3);
  assert.equal(resumed.exerciseDone, true);
  const mismatch = migrate(
    id,
    doc,
    { ...saved, version: "legacy" },
    false,
    fresh,
    catalog.curriculumVersion,
  );
  assert.equal(mismatch.stage, 0);
  assert.equal(mismatch.complete, false);
  assert.equal(mismatch.previousJourney.version, "legacy");
}
for (const amActive of [false, true])
  for (const stActive of [false, true]) {
    const taxonomy = loader({
      "src/lib/lp/ciaac-aircraft-approved/content.ts": { APPROVED_AIRCRAFT_ACTIVE: amActive },
      [`${approved}content.ts`]: { APPROVED_TRANSIT_ACTIVE: stActive },
    })("src/lib/lp/taxonomy.ts");
    const subject = taxonomy.lpSubject("ciaac", "servicios-de-transito-aereo");
    assert.deepEqual(
      taxonomy.subjectSequence(subject).map(({ item }) => item.id),
      stActive ? approvedIds : legacyItems.map((item) => item.id),
    );
    assert.equal(taxonomy.subjectLpCount(subject), stActive ? 7 : 48);
    for (const item of legacyItems) {
      const found = taxonomy.findLp(item.id);
      assert.ok(found);
      assert.deepEqual(found.item, item);
      assert.deepEqual(found.subject, oldSubject);
    }
    assert.equal(
      taxonomy.subjectLpCount(taxonomy.lpSubject("ciaac", "aeronaves-y-motores")),
      amActive ? 19 : 40,
    );
  }
const readyLoad = loader({ [`${approved}publication-review.json`]: fixtureReviews });
const available = readyLoad("src/lib/lp/ciaac-availability.ts");
const registry = readyLoad("src/lib/lp/ciaac-content.ts");
for (const id of approvedIds) {
  assert.equal(available.isLearningPathAvailable(id), sourceIds.includes(id));
  assert.equal(Boolean(registry.CIAAC_LEARNING_PATHS[id]), sourceIds.includes(id));
}
let completedIds = [];
const navLoad = loader({
  [`${approved}publication-review.json`]: fixtureReviews,
  "src/lib/store/db.ts": {
    read: () => [],
    update: () => {
      throw Error("Read-only test");
    },
    nowISO: () => "test",
  },
  "src/lib/store/domain.ts": {
    getTemaProgress: () => completedIds.map((id) => ({ temaId: `lp:${id}`, completado: true })),
    completeTema: () => {
      throw Error("Read-only test");
    },
  },
  "src/lib/store/gating.ts": { isPaid: () => true },
});
const nav = navLoad("src/lib/store/lp-nav.ts");
const subject = navLoad(`${approved}catalog.ts`).approvedTransitSubject();
const user = { id: "fixture-reviewer" };
assert.equal(nav.lpAccess(user, subject, approvedIds[0]).allowed, true);
completedIds = [approvedIds[0]];
assert.equal(nav.lpAccess(user, subject, approvedIds[1]).lock, "contenido");
assert.equal(nav.lpAccess(user, subject, approvedIds[3]).lock, "previo");
assert.equal(nav.lpAccess(user, subject, approvedIds[6]).lock, "previo");
assert.equal(nav.subjectContinue(user.id, subject), null, "Never skip a pending gap");
assert.equal(nav.lpNeighbors(subject, approvedIds[3]).prev.id, approvedIds[2]);
assert.equal(nav.lpNeighbors(subject, approvedIds[3]).next.id, approvedIds[4]);
completedIds = legacyItems.map((item) => item.id);
assert.equal(
  nav.subjectProgress(user.id, subject).done,
  0,
  "No legacy completion becomes approved-ST credit",
);
const route = fs.readFileSync(
  file("src/routes/dashboard/rutas/$categoria.$materia.$contenedor.$lp.tsx"),
  "utf8",
);
assert.ok(route.includes("APPROVED_TRANSIT_READY_IDS.includes(item.id)"));
assert.ok(route.includes("journeyCurriculumVersion="));
assert.ok(
  route.indexOf("if (acceso && !acceso.allowed)") <
    route.indexOf("<CiaacApprovedAircraftLearningPath"),
);
console.log(
  JSON.stringify(
    {
      status: "passed",
      lessons: sourceIds.length,
      outline: approvedIds.length,
      legacyUrls: legacyItems.length,
      boards,
      cards,
      figures,
      openQuestionsAndAnswers: 9,
      sequenceExercises: 3,
      productionActivation: actualActive,
      nativeBrowserQA: "pending",
    },
    null,
    2,
  ),
);
