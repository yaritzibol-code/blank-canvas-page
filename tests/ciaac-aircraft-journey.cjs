const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const filename = path.join(root, "src/lib/lp/ciaac-aircraft-journey.ts");
const mod = { exports: {} };
const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
vm.runInThisContext(`(function(require, module, exports) {${js}\n})`, { filename })(
  (request) => assert.fail(`The journey helper must be pure; unexpected dependency: ${request}`),
  mod,
  mod.exports,
);
const {
  AIRCRAFT_LP_ID,
  AIRCRAFT_SCENES,
  freshAircraftJourney,
  migrateAircraftJourney,
  aircraftSceneReady,
} = mod.exports;

const allDone = [true, true, true, true, true];
const noneDone = [false, false, false, false, false];
const concepts = { machine: "machine", condition: "condition", interval: "interval" };
const classifications = {
  airplane: "aircraft",
  helicopter: "aircraft",
  glider: "aircraft",
  balloon: "aircraft",
  hovercraft: "excluded",
};
const solved = () => ({
  ...freshAircraftJourney(),
  classified: { ...classifications },
  conceptMatches: { ...concepts },
  planeStart: 1,
  planeEnd: 5,
  purposeChoices: { flight: "counts", hangar: "does-not-start" },
  helicopterLabels: { start: "rotor-start", end: "aircraft-and-rotor-stop" },
  helicopterMissing: 1,
  cases: { glider: 1, taxi: 0, rotor: 2 },
  finalMap: { ...concepts },
});

assert.equal(
  AIRCRAFT_LP_ID,
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/aeronave-en-vuelo-1",
);
const content = JSON.parse(
  fs.readFileSync(path.join(root, "src/lib/lp/ciaac-module1.content.json"), "utf8"),
);
assert.equal(AIRCRAFT_LP_ID, content.lessons[0].id, "Only the existing first LP is targeted");
assert.deepEqual(AIRCRAFT_SCENES, [
  "Qué hace que sea una aeronave",
  "La misma máquina, distintos momentos",
  "El avión: dónde empieza y termina",
  "El helicóptero: la condición que falta",
  "Usa las ideas",
]);
const fresh = freshAircraftJourney();
assert.equal(fresh.version, "ciaac-aircraft-v2");
assert.equal(fresh.step, 0);
assert.equal(fresh.maxStep, 0);
assert.deepEqual(fresh.done, noneDone);
assert.equal(fresh.finished, false);
assert.equal(fresh.planeEvent, 1, "First movement is demonstrated before the question");
assert.equal(fresh.helicopterEvent, 1, "Rotor beginning to turn is initially demonstrated");
assert.equal(fresh.planeStart, null);
assert.equal(fresh.planeEnd, null);
assert.equal(fresh.helicopterMissing, null);
assert.equal(fresh.migrationNotice, false);
assert.ok(!Object.hasOwn(fresh, "previousJourney"));
for (const key of [
  "done",
  "classified",
  "conceptMatches",
  "purposeChoices",
  "helicopterLabels",
  "cases",
  "finalMap",
]) {
  assert.notEqual(fresh[key], freshAircraftJourney()[key], `${key}: no shared mutable defaults`);
}

// Every gate depends on its answers, including when completed review is open.
for (let step = 0; step < 5; step += 1) {
  assert.equal(aircraftSceneReady(step, fresh), false, `Scene ${step}: unanswered`);
  assert.equal(aircraftSceneReady(step, solved()), true, `Scene ${step}: solved`);
  assert.equal(
    aircraftSceneReady(step, { ...fresh, finished: true, maxStep: 4, done: allDone }),
    false,
    `Scene ${step}: completion flags do not bypass objective answers`,
  );
}
for (const invalid of [-1, 5, 1.5, NaN, Infinity, "0", null, undefined]) {
  assert.equal(aircraftSceneReady(invalid, solved()), false, `Invalid scene ${String(invalid)}`);
}

for (const key of Object.keys(classifications)) {
  const state = solved();
  state.classified[key] = classifications[key] === "aircraft" ? "excluded" : "aircraft";
  assert.equal(aircraftSceneReady(0, state), false, `Scene 0: wrong ${key}`);
  delete state.classified[key];
  assert.equal(aircraftSceneReady(0, state), false, `Scene 0: missing ${key}`);
  state.classified[key] = classifications[key];
  assert.equal(aircraftSceneReady(0, state), true, `Scene 0: corrected ${key}`);
}
for (const [scene, map] of [
  [1, "conceptMatches"],
  [4, "finalMap"],
]) {
  for (const key of Object.keys(concepts)) {
    const state = solved();
    state[map][key] = key === "machine" ? "condition" : "machine";
    assert.equal(aircraftSceneReady(scene, state), false, `Scene ${scene}: swapped ${key}`);
    delete state[map][key];
    assert.equal(aircraftSceneReady(scene, state), false, `Scene ${scene}: missing ${key}`);
    state[map][key] = key;
    assert.equal(aircraftSceneReady(scene, state), true, `Scene ${scene}: corrected ${key}`);
  }
}
for (const key of ["planeStart", "planeEnd"]) {
  for (const answer of [null, 0, 1, 2, 3, 4, 5]) {
    assert.equal(
      aircraftSceneReady(2, { ...solved(), [key]: answer }),
      answer === (key === "planeStart" ? 1 : 5),
      `Scene 2: ${key} at ${answer}`,
    );
  }
}
for (const key of ["flight", "hangar"]) {
  const state = solved();
  state.purposeChoices[key] = key === "flight" ? "does-not-start" : "counts";
  assert.equal(aircraftSceneReady(2, state), false, `Scene 2: wrong purpose ${key}`);
  delete state.purposeChoices[key];
  assert.equal(aircraftSceneReady(2, state), false, `Scene 2: missing purpose ${key}`);
}
for (const key of ["start", "end"]) {
  const state = solved();
  state.helicopterLabels[key] = key === "start" ? "aircraft-and-rotor-stop" : "rotor-start";
  assert.equal(aircraftSceneReady(3, state), false, `Scene 3: swapped ${key}`);
  delete state.helicopterLabels[key];
  assert.equal(aircraftSceneReady(3, state), false, `Scene 3: missing ${key}`);
}
for (const answer of [null, 0, 1, 2]) {
  assert.equal(
    aircraftSceneReady(3, { ...solved(), helicopterMissing: answer }),
    answer === 1,
    `Scene 3: missing-condition choice ${answer}`,
  );
}
for (const [key, correct] of Object.entries({ glider: 1, taxi: 0, rotor: 2 })) {
  for (const answer of [0, 1, 2]) {
    const state = solved();
    state.cases[key] = answer;
    assert.equal(aircraftSceneReady(4, state), answer === correct, `Scene 4: ${key} ${answer}`);
  }
  const state = solved();
  delete state.cases[key];
  assert.equal(aircraftSceneReady(4, state), false, `Scene 4: missing ${key}`);
}
const notExplored = solved();
notExplored.selectedAircraft = "airplane";
notExplored.machineMoment = 0;
notExplored.planeEvent = 0;
notExplored.planePurpose = "hangar";
notExplored.helicopterEvent = 0;
for (let step = 0; step < 5; step += 1) {
  assert.equal(aircraftSceneReady(step, notExplored), true, "No exploration, wait, or typing gate");
}

// Refresh retains meaningful progress and valid wrong attempts so feedback can resume.
const progress = {
  ...solved(),
  step: 2,
  maxStep: 3,
  done: [true, true, false, false, false],
  selectedAircraft: "hovercraft",
  machineMoment: 2,
  planeEvent: 4,
  planePurpose: "hangar",
  helicopterEvent: 3,
  classified: { ...classifications, glider: "excluded" },
  conceptMatches: { machine: "condition", condition: "machine", interval: "interval" },
  purposeChoices: { flight: "does-not-start", hangar: "counts" },
  helicopterLabels: { start: "aircraft-and-rotor-stop", end: "rotor-start" },
  helicopterMissing: 0,
  cases: { glider: 0, taxi: 2, rotor: 1 },
  finalMap: { machine: "interval", condition: "machine", interval: "condition" },
};
assert.deepEqual(migrateAircraftJourney(JSON.parse(JSON.stringify(progress)), false), progress);
const snapshot = structuredClone(progress);
const restored = migrateAircraftJourney(progress, false);
restored.classified.glider = "aircraft";
restored.done[0] = false;
assert.deepEqual(progress, snapshot, "Migration never mutates its input or aliases active maps");

const bad = migrateAircraftJourney(
  {
    version: "ciaac-aircraft-v2",
    step: 100,
    maxStep: 2.9,
    done: [true, "true", 1, null, false, true],
    finished: "true",
    selectedAircraft: "rocket",
    machineMoment: -9,
    planeEvent: 100,
    planeStart: -1,
    planeEnd: 6,
    planePurpose: "maintenance",
    helicopterEvent: 100,
    helicopterMissing: 1.5,
    classified: {
      airplane: "aircraft",
      hovercraft: "excluded",
      balloon: "invalid",
      rocket: "aircraft",
    },
    conceptMatches: { machine: "machine", condition: "bogus", other: "interval" },
    purposeChoices: { flight: "counts", hangar: true, other: "does-not-start" },
    helicopterLabels: { start: "rotor-start", end: "touchdown", other: "rotor-start" },
    cases: { glider: 1, taxi: "0", rotor: 9, other: 2 },
    finalMap: { machine: "machine", condition: "condition", interval: 1 },
    migrationNotice: "true",
    unexpected: "discard this",
  },
  false,
);
assert.equal(bad.step, 2, "Current scene cannot exceed the restored unlocked scene");
assert.equal(bad.maxStep, 2);
assert.deepEqual(bad.done, [true, false, false, false, false]);
assert.equal(bad.finished, false);
assert.equal(bad.selectedAircraft, "airplane");
assert.equal(bad.machineMoment, 0);
assert.equal(bad.planeEvent, 5);
assert.equal(bad.planeStart, null, "Invalid endpoints cannot be clamped into right answers");
assert.equal(bad.planeEnd, null);
assert.equal(bad.planePurpose, "flight");
assert.equal(bad.helicopterEvent, 4);
assert.equal(bad.helicopterMissing, null);
assert.deepEqual(bad.classified, { airplane: "aircraft", hovercraft: "excluded" });
assert.deepEqual(bad.conceptMatches, { machine: "machine" });
assert.deepEqual(bad.purposeChoices, { flight: "counts" });
assert.deepEqual(bad.helicopterLabels, { start: "rotor-start" });
assert.deepEqual(bad.cases, { glider: 1 });
assert.deepEqual(bad.finalMap, { machine: "machine", condition: "condition" });
assert.equal(bad.migrationNotice, false);
assert.ok(!Object.hasOwn(bad, "unexpected"));
for (const value of [NaN, Infinity, -Infinity, "2", null, undefined, {}, []]) {
  const state = migrateAircraftJourney(
    {
      ...freshAircraftJourney(),
      step: value,
      maxStep: value,
      machineMoment: value,
      planeEvent: value,
      helicopterEvent: value,
      planeStart: value,
      planeEnd: value,
      helicopterMissing: value,
    },
    false,
  );
  assert.equal(state.step, 0);
  assert.equal(state.maxStep, 0);
  assert.equal(state.machineMoment, 0);
  assert.equal(state.planeEvent, 1);
  assert.equal(state.helicopterEvent, 1);
  assert.equal(state.planeStart, null);
  assert.equal(state.planeEnd, null);
  assert.equal(state.helicopterMissing, null);
}
for (const value of [null, [], "machine", 123]) {
  const state = migrateAircraftJourney(
    {
      ...freshAircraftJourney(),
      done: value,
      classified: value,
      conceptMatches: value,
      purposeChoices: value,
      helicopterLabels: value,
      cases: value,
      finalMap: value,
    },
    false,
  );
  assert.deepEqual(state.done, noneDone);
  for (const key of [
    "classified",
    "conceptMatches",
    "purposeChoices",
    "helicopterLabels",
    "cases",
    "finalMap",
  ]) {
    assert.deepEqual(state[key], {}, `${key}: malformed map is ignored`);
  }
}
const inherited = migrateAircraftJourney(
  {
    ...freshAircraftJourney(),
    classified: Object.create(classifications),
    conceptMatches: Object.create(concepts),
    cases: Object.create({ glider: 1, taxi: 0, rotor: 2 }),
  },
  false,
);
assert.deepEqual(inherited.classified, {});
assert.deepEqual(inherited.conceptMatches, {});
assert.deepEqual(inherited.cases, {});

// Legacy stage indexes must never be reinterpreted as indexes into the new scenes.
for (const saved of [null, undefined]) {
  assert.deepEqual(migrateAircraftJourney(saved, false), freshAircraftJourney());
}
const legacy = {
  stage: 4,
  maxStage: 9,
  complete: false,
  answers: { 0: 1 },
  checks: [true],
  activityResponses: { 0: { responses: ["old response"], revealed: true } },
};
const legacySnapshot = structuredClone(legacy);
const migrated = migrateAircraftJourney(legacy, false);
assert.deepEqual(migrated, {
  ...freshAircraftJourney(),
  previousJourney: legacy,
  migrationNotice: true,
});
assert.deepEqual(legacy, legacySnapshot, "Legacy state is retained without mutation");
assert.deepEqual(migrateAircraftJourney(JSON.parse(JSON.stringify(migrated)), false), migrated);
const unknownVersion = { version: "ciaac-aircraft-v1", step: 3, maxStep: 4, finished: false };
assert.deepEqual(migrateAircraftJourney(unknownVersion, false), {
  ...freshAircraftJourney(),
  previousJourney: unknownVersion,
  migrationNotice: true,
});
for (const saved of [false, 4, "broken", []]) {
  const state = migrateAircraftJourney(saved, false);
  assert.equal(state.step, 0);
  assert.equal(state.maxStep, 0);
  assert.deepEqual(state.done, noneDone);
  assert.equal(state.previousJourney, saved);
}

// Completion is retained as review access, without manufacturing correct answers or rewards.
for (const saved of [null, legacy, progress]) {
  const state = migrateAircraftJourney(saved, true);
  assert.equal(state.finished, true, "Account completion always wins");
  assert.equal(state.maxStep, 4);
  assert.deepEqual(state.done, allDone);
}
const completedLegacy = { ...legacy, complete: true };
const review = migrateAircraftJourney(completedLegacy, false);
assert.equal(review.step, 0);
assert.equal(review.finished, true);
assert.equal(review.maxStep, 4);
assert.deepEqual(review.done, allDone);
assert.equal(review.migrationNotice, false);
assert.deepEqual(review.previousJourney, completedLegacy);
for (let step = 0; step < 5; step += 1) {
  assert.equal(aircraftSceneReady(step, review), false, "Review access does not fake solved work");
}
const completeV2 = migrateAircraftJourney({ ...progress, finished: true }, false);
assert.equal(completeV2.finished, true);
assert.equal(completeV2.step, progress.step);
assert.equal(completeV2.maxStep, 4);
assert.deepEqual(completeV2.done, allDone);
assert.deepEqual(completeV2.classified, progress.classified);
assert.deepEqual(migrateAircraftJourney(JSON.parse(JSON.stringify(completeV2)), false), completeV2);

console.log(
  "CIAAC first-LP aircraft journey: gates, persistence, validation, and migration passed.",
);
