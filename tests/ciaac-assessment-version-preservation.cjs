const assert = require("node:assert/strict");
const fs = require("node:fs");
const React = require("react");
const { JSDOM } = require("jsdom");
const { loader, file } = require("./helpers/ts-loader.cjs");
const docs = JSON.parse(fs.readFileSync(file("src/lib/lp/ciaac-manuals-approved/documents.json")));
const [id, source] = Object.entries(docs).find(([key]) =>
  key.split("/").at(-1).startsWith("mi07-"),
);
const document = {
  ...structuredClone(source),
  assessmentVersion: "original-exercise-v1",
};
const curriculum = "isolated-assessment-preservation";
const version = `${curriculum}:${id}:${document.contentVersion ?? "v1"}`;
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
const old = (extra = {}) => ({
  ...fresh(),
  version,
  stage: 3,
  maxStage: 5,
  checks: document.completionChecks.map(() => true),
  exerciseDone: true,
  exercise: { ...fresh().exercise, pairs: { 0: 0, 1: 1, 2: 2, 3: 3 } },
  ...extra,
});
const { migrateApprovedAircraftJourney: migrate } = loader()(
  file("src/lib/lp/ciaac-aircraft-approved/journey.ts"),
);
const restore = (saved, completed = false, doc = document) =>
  migrate(id, doc, saved, completed, fresh(), curriculum);
const noRevision = { ...document };
delete noRevision.assessmentVersion;
for (const [saved, completed] of [
  [old(), false],
  [old({ complete: true }), false],
  [old(), true],
  [old({ assessmentVersion: "old-v0" }), false],
]) {
  const original = structuredClone(saved);
  const baseline = restore(saved, completed, noRevision);
  const revised = restore(saved, completed);
  for (const key of [
    "version",
    "stage",
    "maxStage",
    "complete",
    "answers",
    "checks",
    "migrationNotice",
  ])
    assert.deepEqual(revised[key], baseline[key], `preserve ${key}`);
  assert.deepEqual(revised.exercise, fresh().exercise);
  assert.equal(revised.exerciseDone, false);
  assert.deepEqual(revised.previousAssessments, [
    {
      version: saved.assessmentVersion ?? null,
      exercise: saved.exercise,
      exerciseDone: true,
    },
  ]);
  assert.deepEqual(saved, original, "Input is immutable");
  assert.deepEqual(restore(revised, completed), revised, "Double reload is idempotent");
  assert.deepEqual(
    restore(saved, completed, noRevision),
    baseline,
    "Unmodified material unchanged",
  );
}
const partial = restore(
  old({
    exerciseDone: false,
    exercise: { ...fresh().exercise, pairs: { 0: 1 } },
  }),
);
const resumed = {
  ...partial,
  exercise: { ...partial.exercise, pairs: { 0: 0 } },
  exerciseDone: false,
};
assert.deepEqual(
  restore(resumed).exercise.pairs,
  { 0: 0 },
  "New revision partial answers survive reload",
);
assert.equal(restore(resumed).previousAssessments.length, 1);
const next = restore(resumed, false, {
  ...document,
  assessmentVersion: "original-exercise-v2",
});
assert.equal(
  next.previousAssessments.length,
  2,
  "Prior attempt history preserved across another revision",
);
assert.deepEqual(next.previousAssessments[1].exercise, resumed.exercise);
const newUser = restore(null);
assert.equal(newUser.assessmentVersion, document.assessmentVersion);
assert.equal(newUser.complete, false);
assert.deepEqual(restore(newUser), { ...newUser, previousAssessments: [] });
assert.equal(
  restore(null, true).complete,
  true,
  "External completion survives even with no saved attempt",
);
// A content-version mismatch remains the old separate route migration. This test
// does not grant a new content version to any lesson or migrate any production row.
const unknown = old();
delete unknown.version;
const unknownBaseline = restore(unknown, false, noRevision);
const unknownRevised = restore(unknown);
for (const k of ["stage", "maxStage", "complete", "checks", "answers", "previousJourney"])
  assert.deepEqual(unknownRevised[k], unknownBaseline[k]);

async function domProof() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "https://example.test",
  });
  Object.assign(global, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = require("react-dom/client");
  let saved,
    external = false,
    awards = 0,
    root;
  const load = loader({
    "@/components/lp/LearningPathExperience": {
      useLearningPathStageView: () => {},
    },
    "@/lib/store/lp-journey": {
      getLpJourney: () => saved,
      saveLpJourney: (_user, lp, state) => {
        assert.equal(lp, id);
        saved = structuredClone(state);
      },
      resetLpJourney: () => assert.fail("No journey deletion allowed"),
    },
  });
  const { CiaacApprovedAircraftLearningPath: Component } = load(
    file("src/components/lp/CiaacApprovedAircraftLearningPath.tsx"),
  );
  const mount = async () => {
    root = createRoot(global.document.getElementById("root"));
    await React.act(() =>
      root.render(
        React.createElement(Component, {
          document,
          lpId: id,
          userId: "isolated-test-only",
          journeyCurriculumVersion: curriculum,
          completed: external,
          onComplete: () => {
            awards++;
          },
        }),
      ),
    );
  };
  const unmount = async () => {
    await React.act(() => root.unmount());
    root = null;
  };
  try {
    for (const useExternal of [false, true]) {
      external = useExternal;
      saved = old({
        stage: document.stages.length - 1,
        maxStage: document.stages.length - 1,
        complete: !useExternal,
      });
      await mount();
      assert.equal(saved.complete, true);
      assert.equal(saved.exerciseDone, false);
      assert.equal(awards, 0, "Restoring earned completion does not award");
      const button = [...global.document.querySelectorAll("button")].find(
        (b) => b.textContent.trim() === "Completado",
      );
      assert.ok(button?.disabled, "Completed learner is not required to redo new exercise");
      await React.act(() => {
        button.click();
        button.click();
      });
      const first = structuredClone(saved);
      await unmount();
      await mount();
      assert.deepEqual(saved, first);
      assert.equal(awards, 0, "Repeated reload/click cannot double award");
      await unmount();
    }
    external = false;
    const exerciseStage = document.stages.findIndex((s) => s.kind === "exercise");
    saved = old({
      stage: exerciseStage,
      maxStage: exerciseStage,
      complete: false,
    });
    await mount();
    assert.equal(saved.stage, exerciseStage);
    assert.equal(saved.maxStage, exerciseStage);
    assert.deepEqual(saved.exercise.pairs, {});
    assert.equal(awards, 0);
    await unmount();
    await mount();
    assert.equal(saved.previousAssessments.length, 1);
    assert.equal(saved.complete, false);
    assert.equal(awards, 0);
    await unmount();
    // A learner who reached the old finish but has not completed cannot
    // earn credit from the now-invalid exercise. Navigation/checks remain intact.
    for (const oldAssessmentVersion of [undefined, "old-v0", document.assessmentVersion]) {
      saved = old({
        stage: document.stages.length - 1,
        maxStage: document.stages.length - 1,
        complete: false,
        assessmentVersion: oldAssessmentVersion,
        exercise: { ...fresh().exercise, pairs: {} },
        exerciseDone: false,
      });
      await mount();
      const finishButton = [...global.document.querySelectorAll("button")].find(
        (b) => b.textContent.trim() === "Completar Learning Path",
      );
      assert.ok(finishButton?.disabled, "Unresolved revised exercise blocks only final completion");
      assert.match(global.document.body.textContent, /conservas tu avance y tus comprobaciones/);
      assert.equal(saved.stage, document.stages.length - 1);
      assert.equal(saved.maxStage, document.stages.length - 1);
      assert.ok(saved.checks.every(Boolean));
      const revise = [...global.document.querySelectorAll("button")].find(
        (b) => b.textContent.trim() === "Revisar ejercicio actualizado",
      );
      await React.act(() => revise.click());
      assert.equal(
        saved.stage,
        exerciseStage,
        "Existing navigation returns to exercise without reset",
      );
      assert.equal(saved.maxStage, document.stages.length - 1);
      assert.equal(awards, 0);
      await unmount();
    }
    // Solving the current revision permits exactly one explicit completion.
    saved = old({
      stage: document.stages.length - 1,
      maxStage: document.stages.length - 1,
      assessmentVersion: document.assessmentVersion,
      complete: false,
    });
    await mount();
    assert.equal(saved.exerciseDone, true);
    const finishButton = [...global.document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === "Completar Learning Path",
    );
    assert.equal(finishButton.disabled, false);
    await React.act(() => {
      finishButton.click();
      finishButton.click();
    });
    assert.equal(awards, 1, "Double click grants one completion callback only");
    assert.equal(saved.complete, true);
    await unmount();
    await mount();
    assert.equal(awards, 1, "Reload after newly earned completion cannot re-award");
    await unmount();
  } finally {
    if (root) await unmount();
    dom.window.close();
  }
}
domProof()
  .then(() =>
    console.log(
      "PASS assessment-only revision: completion/navigation/checks/history retained; old pairs invalidated once; partial/new/no-version/unmodified cases; double reload and real DOM no duplicate award; no production access.",
    ),
  )
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
