const assert = require("node:assert/strict");
const fs = require("node:fs");
const React = require("react");
const { JSDOM } = require("jsdom");
const { loader, file } = require("./helpers/ts-loader.cjs");
const dom = new JSDOM('<div id="root"></div>', {
  url: "https://example.test/admin/revision-learning-paths",
});
Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = require("react-dom/client");
let journeyCalls = [],
  completed = 0,
  exits = 0,
  view;
let saved = { stage: 999, maxStage: 999, complete: true, answers: { 0: 1 }, migrationNotice: true };
const load = loader({
  "@/lib/store/lp-journey": {
    getLpJourney: (...args) => {
      journeyCalls.push(["read", ...args]);
      return saved;
    },
    saveLpJourney: (...args) => {
      journeyCalls.push(["save", ...args]);
      saved = args[2];
    },
    resetLpJourney: (...args) => {
      journeyCalls.push(["reset", ...args]);
      saved = null;
    },
  },
  "@/lib/store": new Proxy(
    {},
    {
      get: (_target, name) => {
        throw Error(`Forbidden store access: ${String(name)}`);
      },
    },
  ),
  "@/components/shared/ReportProblemModal": {
    ReportProblemModal: () => {
      throw Error("Report form must not mount in review");
    },
  },
});
const { learningPathReviewPayload } = load(file("src/lib/lp/admin-review.server.ts"));
const catalog = learningPathReviewPayload(null);
const { AdminReviewLearningPath } = load(file("src/components/lp/AdminReviewLearningPath.tsx"));
const { HandbookLearningPath } = load(file("src/components/lp/HandbookLearningPath.tsx"));
let root;
const forbiddenWrites = [];
const storageProto = Object.getPrototypeOf(window.localStorage);
for (const method of ["setItem", "removeItem", "clear"])
  storageProto[method] = function (...args) {
    forbiddenWrites.push([method, ...args]);
  };
async function mount(component) {
  if (root) await React.act(() => root.unmount());
  document.getElementById("root").innerHTML = "";
  root = createRoot(document.getElementById("root"));
  await React.act(() => root.render(component));
}
async function click(button) {
  assert.ok(button && !button.disabled, "button is enabled");
  await React.act(() => button.click());
}
const primary = () => document.querySelector(".hb-actions .is-primary");
const stageButton = (index) => document.querySelectorAll(".lp-study-desktop-stages button")[index];
const review = (selected) =>
  React.createElement(AdminReviewLearningPath, { selected, onExit: () => exits++ });
(async () => {
  assert.ok(catalog.items.length > 19);
  const aircraft = catalog.items.filter(
    (i) => i.id.startsWith("ciaac/aeronaves-y-motores/") && i.renderer === "approved-aircraft",
  );
  assert.equal(aircraft.length, 19, "all AM01–AM19 available");
  assert.equal(learningPathReviewPayload("ciaac/not-ready/placeholder"), null);
  const original = structuredClone(saved);
  let quizzes = 0,
    zooms = 0;
  // All CIAAC lessons plus one generic Handbook: real native wrappers and real shell.
  const candidates = [
    ...catalog.items.filter((i) => i.id.startsWith("ciaac/")),
    catalog.items.find((i) => i.renderer === "handbook"),
  ].filter(Boolean);
  for (const item of candidates) {
    const selected = learningPathReviewPayload(item.id).selected;
    await mount(review(selected));
    assert.match(document.body.textContent, /sin guardar avance/i);
    assert.equal(
      document.querySelector(".lp-study-progress-track"),
      null,
      "review never suggests saved completion",
    );
    assert.equal(
      document.querySelector(".lp-study-desktop-stages button[aria-current='step']"),
      stageButton(0),
    );
    assert.ok(
      [...document.querySelectorAll(".lp-study-desktop-stages button")].every((b) => !b.disabled),
    );
    assert.equal(document.querySelector(".lp-study-actions"), null);
    assert.equal(
      document.querySelectorAll(".lp-study-stage.is-done").length,
      0,
      "no fake completions",
    );
    await click(primary());
    for (const [index, stage] of selected.document.stages.entries()) {
      await click(stageButton(index));
      assert.ok(!primary().disabled, "unanswered quizzes/activities do not lock review");
      if (stage.kind === "quiz") {
        const option = document.querySelector(".hb-options button");
        if (option) {
          quizzes++;
          await click(option);
        }
        assert.ok(!primary().disabled);
      }
      if (stage.kind === "content") {
        const expand = [...document.querySelectorAll("button")].find((b) =>
          /ampliar|abrir figura/i.test(`${b.getAttribute("aria-label") ?? ""} ${b.textContent}`),
        );
        if (expand) {
          await click(expand);
          assert.ok(document.querySelector("[role='dialog']"));
          await click(document.querySelector("[role='dialog'] button"));
          assert.equal(document.querySelector("[role='dialog']"), null);
          zooms++;
        }
      }
    }
    await click(stageButton(selected.document.stages.length - 1));
    for (const check of document.querySelectorAll(".hb-checks button")) await click(check);
    assert.equal(primary().textContent, "Salir de la revisión");
    await click(primary());
    await click(
      [...document.querySelectorAll("button")].find(
        (b) => b.textContent === "Limpiar prueba local",
      ),
    );
    assert.equal(
      document.querySelector(".lp-study-desktop-stages button[aria-current='step']"),
      stageButton(0),
    );
    await mount(review(selected)); // Refresh is a fresh review, regardless of legacy saved progress.
    assert.equal(
      document.querySelector(".lp-study-desktop-stages button[aria-current='step']"),
      stageButton(0),
    );
    assert.ok(!document.body.textContent.includes("Conservamos tu avance anterior"));
    assert.deepEqual(saved, original);
    assert.deepEqual(journeyCalls, []);
    assert.deepEqual(forbiddenWrites, []);
  }
  assert.equal(exits, candidates.length);
  assert.ok(quizzes > 20);
  assert.ok(zooms > 10);
  // Native engine itself protects callbacks, even if a caller accidentally supplies real ones.
  const selected = learningPathReviewPayload(aircraft[0].id).selected;
  await mount(
    React.createElement(HandbookLearningPath, {
      reviewOnly: true,
      document: selected.document,
      lpId: selected.item.id,
      userId: "real-user",
      completed: true,
      onComplete: () => completed++,
    }),
  );
  const finish = [...document.querySelectorAll(".hb-waypoints button")].at(-1);
  await click(finish);
  await click(primary());
  await click(primary());
  await click(document.querySelector(".hb-reset"));
  await React.act(() => root.unmount());
  root = null;
  assert.equal(completed, 0);
  assert.deepEqual(journeyCalls, []);
  assert.deepEqual(forbiddenWrites, []);
  console.log(
    `PASS admin review: ${candidates.length} native lessons, ${quizzes} quiz stages, ${zooms} zooms; free stage navigation, fresh refresh, reset, finish/exit; zero journey reads/writes, storage changes, migrations or completion callbacks.`,
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
