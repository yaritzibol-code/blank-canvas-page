const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// No browser account, database, network, or source-file writes. Real TypeScript
// modules run with in-memory publication fixtures for both sides of activation.
const root = path.resolve(__dirname, "..");
const file = (relative) => path.join(root, relative);
const json = (relative) => JSON.parse(fs.readFileSync(file(relative), "utf8"));
const approved = "src/lib/lp/ciaac-aircraft-approved/";
const catalog = json(`${approved}catalog.json`);
const legacyMap = json(`${approved}legacy-map.json`);
const raw = json("src/lib/lp/taxonomy.json");
const oldSubject = raw.categories
  .find((category) => category.id === "ciaac")
  .subjects.find((subject) => subject.id === catalog.subjectId);
const legacyItems = oldSubject.containers.flatMap((container) => container.learningPaths);
const legacyIds = legacyItems.map((item) => item.id);
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
const catalogModule = load(`${approved}catalog.ts`);
const { collectReadyApprovedAircraftDocuments: collect } = load(`${approved}content.ts`);
const { migrateApprovedAircraftJourney: migrate } = load(`${approved}journey.ts`);

assert.equal(catalog.lessons.length, 19);
assert.deepEqual(
  catalog.lessons.map((lesson) => lesson.code),
  Array.from({ length: 19 }, (_, index) => `AM${String(index + 1).padStart(2, "0")}`),
);
assert.deepEqual(
  catalog.lessons.map((lesson) => lesson.order),
  Array.from({ length: 19 }, (_, index) => index + 1),
);
assert.equal(new Set(approvedIds).size, 19);
assert.equal(new Set(legacyIds).size, 40);
assert.equal(legacyItems.length, 40);
for (const id of approvedIds) {
  assert.equal(id.split("/").length, 4);
  assert.ok(id.startsWith(`${catalog.containerId}/`));
  assert.ok(!legacyIds.includes(id), "A regrouped lesson never reuses a legacy ID");
}
assert.equal(legacyMap.completionPolicy, "retain-legacy-only");
assert.equal(legacyMap.curriculumVersion, catalog.curriculumVersion);
assert.deepEqual(
  legacyMap.references.map((entry) => entry.approvedCode),
  catalog.lessons.map((lesson) => lesson.code),
);
const references = legacyMap.references.flatMap((entry) => entry.legacyIds);
const crossReferences = legacyMap.crossSubjectReferences.map((entry) => entry.legacyId);
assert.deepEqual(
  [...new Set([...references, ...crossReferences])].sort(),
  [...legacyIds].sort(),
  "Every old route has an approved-scope or explicit cross-subject reference",
);
assert.equal(new Set(references).size, 38);
assert.equal(legacyIds.filter((id) => !references.includes(id)).length, 2);
assert.ok(
  references.length > new Set(references).size,
  "Many-to-many scope references must not be interpreted as a completion mapping",
);
assert.deepEqual(catalogModule.APPROVED_AIRCRAFT_FIRST_BLOCK_IDS, approvedIds.slice(0, 5));

const snapshot = {
  completedIds: [...legacyIds],
  startedIds: [...legacyIds],
  journeysById: Object.fromEntries(
    legacyIds.map((id) => [
      id,
      {
        version: "legacy",
        stage: 5,
        complete: true,
        answers: { 0: 1 },
      },
    ]),
  ),
};
const originalSnapshot = structuredClone(snapshot);
const projected = catalogModule.projectApprovedAircraftProgress(snapshot);
assert.equal(projected.preserved, snapshot);
assert.deepEqual(snapshot, originalSnapshot, "Read-only projection never mutates old rows");
assert.ok(projected.lessons.every((lesson) => lesson.status === "no_iniciado"));
assert.ok(projected.lessons.every((lesson) => lesson.legacyEvidence.length > 0));
assert.ok(
  projected.lessons
    .flatMap((lesson) => lesson.legacyEvidence)
    .every((evidence) => evidence.completed && evidence.started && evidence.hasJourney),
);
const mixed = catalogModule.projectApprovedAircraftProgress({
  ...snapshot,
  completedIds: [...legacyIds, approvedIds[0]],
  startedIds: [...legacyIds, approvedIds[1]],
});
assert.equal(mixed.lessons[0].status, "completado");
assert.equal(mixed.lessons[1].status, "en_progreso");
assert.ok(mixed.lessons.slice(2).every((lesson) => lesson.status === "no_iniciado"));

for (const active of [false, true]) {
  const taxonomy = loader({
    [`${approved}content.ts`]: { APPROVED_AIRCRAFT_ACTIVE: active },
    // This Aircraft-only activation fixture holds the independent Transit rollout off.
    "src/lib/lp/ciaac-transit-approved/publication-review.json": [],
  })("src/lib/lp/taxonomy.ts");
  const subject = taxonomy.lpSubject("ciaac", "aeronaves-y-motores");
  const sequence = taxonomy.subjectSequence(subject).map(({ item }) => item.id);
  assert.deepEqual(sequence, active ? approvedIds : legacyIds);
  assert.equal(taxonomy.subjectLpCount(subject), active ? 19 : 40);
  assert.equal(Boolean(taxonomy.legacyAircraftSubject()), active);
  for (const old of legacyItems) {
    const found = taxonomy.findLp(old.id);
    assert.ok(found, `Legacy route resolves when active=${active}: ${old.id}`);
    assert.deepEqual(found.item, old);
    assert.deepEqual(found.subject, oldSubject);
    assert.equal(taxonomy.subjectSequence(found.subject).length, 40);
    const [category, subjectSlug, containerSlug] = old.id.split("/");
    assert.equal(
      taxonomy.lpSubjectForContainer(category, subjectSlug, containerSlug),
      found.subject,
    );
    assert.equal(taxonomy.lpContainer(category, subjectSlug, containerSlug), found.container);
  }
  for (const id of approvedIds) {
    const found = taxonomy.findLp(id);
    assert.equal(Boolean(found), active);
    if (found) assert.equal(taxonomy.subjectSequence(found.subject).length, 19);
  }
  assert.equal(taxonomy.findLp(`${catalog.containerId}/unknown-lesson`), null);
  assert.equal(taxonomy.findLp(`${approvedIds[0]}/extra-segment`), null);
  assert.equal(
    taxonomy.lpContainer("ciaac", "aeronaves-y-motores", "unknown-container"),
    undefined,
  );
  const before = raw.categories
    .flatMap((category) => category.subjects)
    .filter((candidate) => candidate.id !== catalog.subjectId);
  const after = taxonomy.LP_CATEGORIES.flatMap((category) => category.subjects).filter(
    (candidate) => candidate.id !== catalog.subjectId,
  );
  assert.deepEqual(after, before, "All unrelated subjects retain their complete structure");
  assert.deepEqual(
    json("src/lib/lp/taxonomy.json"),
    raw,
    "Overlay does not rewrite source taxonomy",
  );
}

const legacyDocument = Object.values(json("src/lib/lp/ciaac-aircraft-engines.content.json"))[0];
function validDocument(lesson = catalog.lessons[0]) {
  return {
    ...structuredClone(legacyDocument),
    title: lesson.title,
    number: lesson.order,
    objectives: ["Objetivo verificable"],
    completionChecks: ["Puedo explicar el concepto"],
    questions: [
      {
        prompt: "¿Cuál es la opción correcta?",
        options: ["Correcta", "Incorrecta"],
        correct: 0,
        order: [1, 0],
        feedback: "La explicación justifica la opción correcta.",
      },
    ],
    exercise: null,
    stages: [
      { kind: "intro", nav: "Inicio" },
      {
        kind: "content",
        nav: "Explicación",
        title: "Un concepto",
        cards: [
          {
            title: "Un concepto",
            text: "Explicación de prueba con suficiente contexto.",
            covers: [0],
          },
        ],
        figures: [structuredClone(legacyDocument.figures[0])],
      },
      { kind: "quiz", nav: "Comprueba", questions: [0] },
      { kind: "finish", nav: "Cierre" },
    ],
  };
}
function validReview(lesson = catalog.lessons[0]) {
  return {
    id: lesson.id,
    curriculumVersion: catalog.curriculumVersion,
    notebooklmExplanationSha256: "a".repeat(64),
    scopeReviewed: true,
    visualsReviewed: true,
    assessmentReviewed: true,
  };
}
const firstId = approvedIds[0];
assert.deepEqual(Object.keys(collect({ [firstId]: validDocument() }, [validReview()])), [firstId]);
const invalidDocuments = {
  "title mismatch": (document) => {
    document.title = "Otro título";
  },
  "missing intro": (document) => {
    document.intro = " ";
  },
  "blank objectives": (document) => {
    document.objectives = [""];
  },
  "blank completion checks": (document) => {
    document.completionChecks = [" "];
  },
  "missing sources": (document) => {
    document.sources = [];
  },
  "malformed source": (document) => {
    document.sources = [null];
  },
  "source without locator": (document) => {
    document.sources = [{ id: "x", title: "x", role: "x" }];
  },
  "private source URL": (document) => {
    document.sources = [
      { id: "x", title: "x", role: "x", url: "https://notebooklm.google.com/notebook/private" },
    ];
  },
  "empty question order": (document) => {
    document.questions[0].order = [];
  },
  "correct option omitted": (document) => {
    document.questions[0].order = [1];
  },
  "duplicate option order": (document) => {
    document.questions[0].order = [0, 0];
  },
  "out-of-range option": (document) => {
    document.questions[0].order = [0, 2];
  },
  "blank option": (document) => {
    document.questions[0].options[1] = " ";
  },
  "invalid correct index": (document) => {
    document.questions[0].correct = -1;
  },
  "unreachable question": (document) => {
    document.questions.push(structuredClone(document.questions[0]));
  },
  "invalid quiz index": (document) => {
    document.stages[2].questions = [999];
  },
  "fractional quiz index": (document) => {
    document.stages[2].questions = [0.5];
  },
  "invalid diagnostic index": (document) => {
    document.stages.splice(1, 0, {
      kind: "quiz",
      nav: "Diagnóstico",
      diagnostic: true,
      questions: [999],
    });
  },
  "diagnostic without mastery": (document) => {
    document.stages[2].diagnostic = true;
  },
  "assessment before explanation": (document) => {
    [document.stages[1], document.stages[2]] = [document.stages[2], document.stages[1]];
  },
  "early finish": (document) => {
    document.stages.splice(1, 0, { kind: "finish", nav: "Cierre prematuro" });
  },
  "duplicate intro": (document) => {
    document.stages.splice(2, 0, { kind: "intro", nav: "Otro inicio" });
  },
  "missing final finish": (document) => {
    document.stages.pop();
  },
  "unknown stage": (document) => {
    document.stages.splice(2, 0, { kind: "unknown", nav: "Inválido" });
  },
  "missing stage title": (document) => {
    delete document.stages[1].title;
  },
  "blank navigation": (document) => {
    document.stages[1].nav = " ";
  },
  "no explanation": (document) => {
    document.stages.splice(1, 1);
  },
  "null cards": (document) => {
    document.stages[1].cards = null;
  },
  "null card": (document) => {
    document.stages[1].cards = [null];
  },
  "multiple explanation cards": (document) => {
    document.stages[1].cards.push(structuredClone(document.stages[1].cards[0]));
  },
  "missing visual": (document) => {
    document.stages[1].figures = [];
  },
  "null visual": (document) => {
    document.stages[1].figures = [null];
  },
  "blank visual alt": (document) => {
    document.stages[1].figures[0].alt = " ";
  },
  "figure path traversal": (document) => {
    document.stages[1].figures[0].file = "../private.svg";
  },
  "remote figure URL": (document) => {
    document.stages[1].figures[0].file = "https://example.test/a.svg";
  },
  "exercise stage without exercise": (document) => {
    document.stages.splice(2, 0, { kind: "exercise", nav: "Relaciona" });
  },
  "unsupported activity stage": (document) => {
    document.stages.splice(2, 0, { kind: "activity", nav: "Actividad", activityIndex: 0 });
  },
};
function applyFigureGeometry(document, geometry) {
  const figure = { ...document.stages[1].figures[0], ...geometry };
  document.stages[1].figures = [figure];
  // The core renderer resolves the canonical document figure by its number.
  document.figures = [figure];
}
const validCrop = { x: 20, y: 10, width: 40, height: 60, assetAspectRatio: 1.5 };
const invalidGeometry = {
  "null crop": { crop: null },
  "array crop": { crop: [] },
  "negative crop x": { crop: { ...validCrop, x: -1 } },
  "negative crop y": { crop: { ...validCrop, y: -1 } },
  "zero crop width": { crop: { ...validCrop, width: 0 } },
  "negative crop width": { crop: { ...validCrop, width: -1 } },
  "zero crop height": { crop: { ...validCrop, height: 0 } },
  "negative crop height": { crop: { ...validCrop, height: -1 } },
  "crop crosses right edge": { crop: { ...validCrop, x: 80 } },
  "crop crosses bottom edge": { crop: { ...validCrop, y: 80 } },
  "nonfinite crop width": { crop: { ...validCrop, width: Infinity } },
  "nonfinite crop x": { crop: { ...validCrop, x: NaN } },
  "string crop y": { crop: { ...validCrop, y: "10" } },
  "zero source aspect ratio": { crop: { ...validCrop, assetAspectRatio: 0 } },
  "negative source aspect ratio": { crop: { ...validCrop, assetAspectRatio: -2 } },
  "nonfinite source aspect ratio": { crop: { ...validCrop, assetAspectRatio: Infinity } },
  "finite crop width causes CSS overflow": { crop: { ...validCrop, width: Number.MIN_VALUE } },
  "finite source ratio causes CSS overflow": {
    crop: { ...validCrop, assetAspectRatio: Number.MAX_VALUE },
  },
  "null focus": { focus: null },
  "multiple-focus array": {
    focus: [
      { x: 20, y: 20, label: "A" },
      { x: 30, y: 30, label: "B" },
    ],
  },
  "negative focus x": { focus: { x: -1, y: 20, label: "A" } },
  "focus beyond original asset": { focus: { x: 50, y: 101, label: "A" } },
  "nonfinite focus y": { focus: { x: 50, y: NaN, label: "A" } },
  "string focus x": { focus: { x: "50", y: 50, label: "A" } },
  "blank focus label": { focus: { x: 50, y: 50, label: " " } },
  "focus outside crop left": { crop: validCrop, focus: { x: 19, y: 40, label: "A" } },
  "focus outside crop right": { crop: validCrop, focus: { x: 61, y: 40, label: "A" } },
  "focus outside crop top": { crop: validCrop, focus: { x: 40, y: 9, label: "A" } },
  "focus outside crop bottom": { crop: validCrop, focus: { x: 40, y: 71, label: "A" } },
};
for (const [label, geometry] of Object.entries(invalidGeometry)) {
  invalidDocuments[label] = (document) => applyFigureGeometry(document, geometry);
}
for (const [field, changed] of Object.entries({
  file: "/different-reviewable-asset.svg",
  alt: "Una descripción alternativa",
  observe: "Una observación alternativa",
  caption: "Una atribución alternativa",
  focus: { x: 50, y: 40, label: "Otro punto visible" },
  crop: { ...validCrop, width: 50 },
})) {
  invalidDocuments[`canonical/stage ${field} mismatch`] = (document) => {
    applyFigureGeometry(document, { crop: validCrop, focus: { x: 40, y: 40, label: "Centro" } });
    document.figures = structuredClone(document.figures);
    document.figures[0][field] = changed;
  };
}
invalidDocuments["canonical drops stage focus"] = (document) => {
  applyFigureGeometry(document, { focus: { x: 40, y: 40, label: "Centro" } });
  document.figures = structuredClone(document.figures);
  delete document.figures[0].focus;
};
invalidDocuments["duplicate canonical figure number"] = (document) => {
  document.figures.push(structuredClone(document.figures[0]));
};
invalidDocuments["invalid unreferenced canonical figure"] = (document) => {
  document.figures.push({
    ...document.figures[0],
    number: "unreferenced-invalid",
    crop: { ...validCrop, width: 0 },
  });
};
function applyExerciseFigures(document) {
  document.exercise = {
    kind: "match",
    title: "Reconoce",
    instruction: "Relaciona cada aeronave",
    pairs: [
      ["A", "B"],
      ["C", "D"],
    ],
    order: [1, 0],
  };
  document.stages.splice(2, 0, { kind: "exercise", nav: "Reconocimiento" });
  document.exerciseFigures = [
    {
      ...structuredClone(document.stages[1].figures[0]),
      number: "recognition-A",
      heading: "Aeronave A",
    },
  ];
}
const invalidExerciseFigures = {
  "null exerciseFigures": (document) => {
    document.exerciseFigures = null;
  },
  "object exerciseFigures": (document) => {
    document.exerciseFigures = {};
  },
  "empty exerciseFigures": (document) => {
    document.exerciseFigures = [];
  },
  "null exercise figure": (document) => {
    document.exerciseFigures = [null];
  },
  "duplicate exercise figure ID": (document) => {
    document.exerciseFigures.push(structuredClone(document.exerciseFigures[0]));
  },
  "blank exercise figure alt": (document) => {
    document.exerciseFigures[0].alt = " ";
  },
  "private exercise figure path": (document) => {
    document.exerciseFigures[0].file = "https://notebooklm.google.com/private.png";
  },
  "invalid exercise crop": (document) => {
    document.exerciseFigures[0].crop = { ...validCrop, width: 0 };
  },
  "exercise focus outside crop": (document) => {
    document.exerciseFigures[0].crop = validCrop;
    document.exerciseFigures[0].focus = { x: 0, y: 0, label: "Fuera" };
  },
  "exercise figures without exercise stage": (document) => {
    document.stages = document.stages.filter((stage) => stage.kind !== "exercise");
  },
  "exercise figures with null stage": (document) => {
    document.stages[2] = null;
  },
};
for (const [label, mutate] of Object.entries(invalidExerciseFigures)) {
  invalidDocuments[label] = (document) => {
    applyExerciseFigures(document);
    mutate(document);
  };
}
const withExerciseFigures = validDocument();
applyExerciseFigures(withExerciseFigures);
assert.deepEqual(
  Object.keys(collect({ [firstId]: withExerciseFigures }, [validReview()])),
  [firstId],
  "Optional recognition figures with a valid exercise remain eligible",
);
for (const kind of ["match", "sequence"]) {
  const gameOnly = validDocument();
  applyExerciseFigures(gameOnly);
  gameOnly.questions = [];
  gameOnly.stages = gameOnly.stages.filter((stage) => stage.kind !== "quiz");
  if (kind === "sequence") {
    gameOnly.exercise = {
      kind,
      title: "Ordena",
      instruction: "Reconstruye la secuencia",
      items: ["A", "B"],
      order: [1, 0],
    };
  }
  assert.deepEqual(
    Object.keys(collect({ [firstId]: gameOnly }, [validReview()])),
    [firstId],
    `One validated final ${kind} game supplies mastery without an additional quiz`,
  );
  assert.equal(gameOnly.stages.filter((stage) => stage.kind === "exercise").length, 1);
  assert.equal(gameOnly.stages.at(-2).kind, "exercise");
}
invalidDocuments["empty questions without mastery"] = (document) => {
  document.questions = [];
  document.stages[2] = structuredClone(document.stages[1]);
};
invalidDocuments["empty questions with blank game"] = (document) => {
  applyExerciseFigures(document);
  document.questions = [];
  document.stages = document.stages.filter((stage) => stage.kind !== "quiz");
  document.exercise.pairs = [];
  document.exercise.order = [];
};
for (const geometry of [
  { crop: validCrop },
  { focus: { x: 0, y: 100, label: "Borde del original" } },
  { crop: { x: 0, y: 0, width: 100, height: 100, assetAspectRatio: 1.5 } },
  { crop: validCrop, focus: { x: 40, y: 40, label: "Centro del recorte" } },
  { crop: validCrop, focus: { x: 20, y: 10, label: "Borde superior" } },
  { crop: validCrop, focus: { x: 60, y: 70, label: "Borde inferior" } },
]) {
  const document = validDocument();
  applyFigureGeometry(document, geometry);
  assert.deepEqual(
    Object.keys(collect({ [firstId]: document }, [validReview()])),
    [firstId],
    "Finite, in-bounds crop/focus metadata remains eligible",
  );
}
const failures = [];
for (const [label, mutate] of Object.entries(invalidDocuments)) {
  const document = validDocument();
  mutate(document);
  try {
    assert.deepEqual(Object.keys(collect({ [firstId]: document }, [validReview()])), [], label);
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
  }
}
for (const property of ["scopeReviewed", "visualsReviewed", "assessmentReviewed"]) {
  for (const invalid of [false, undefined, "false"]) {
    const review = validReview();
    review[property] = invalid;
    try {
      assert.deepEqual(
        Object.keys(collect({ [firstId]: validDocument() }, [review])),
        [],
        `${property} must be explicitly true, received ${JSON.stringify(invalid)}`,
      );
    } catch (error) {
      failures.push(error.message);
    }
  }
}
for (const [label, reviews] of [
  ["missing review", []],
  ["duplicate review", [validReview(), validReview()]],
  ["wrong curriculum", [{ ...validReview(), curriculumVersion: "old" }]],
  ["invalid digest", [{ ...validReview(), notebooklmExplanationSha256: "unverified" }]],
]) {
  assert.deepEqual(Object.keys(collect({ [firstId]: validDocument() }, reviews)), [], label);
}
for (const kind of ["match", "sequence"]) {
  const document = validDocument();
  document.exercise =
    kind === "match"
      ? {
          kind,
          title: "Relaciona",
          instruction: "Une cada concepto",
          pairs: [
            ["A", "B"],
            ["C", "D"],
          ],
          order: [1, 0],
        }
      : {
          kind,
          title: "Ordena",
          instruction: "Ordena los pasos",
          items: ["A", "B"],
          order: [1, 0],
        };
  document.stages.splice(2, 0, { kind: "exercise", nav: "Actividad" });
  assert.deepEqual(Object.keys(collect({ [firstId]: document }, [validReview()])), [firstId]);
  document.exercise.order = [0, 0];
  assert.deepEqual(
    Object.keys(collect({ [firstId]: document }, [validReview()])),
    [],
    `${kind} permutation`,
  );
}
assert.equal(failures.length, 0, `Gate must fail closed:\n${failures.join("\n")}`);

for (const count of [0, 1, 4, 5, 19]) {
  const lessons = catalog.lessons.slice(0, count);
  const documents = Object.fromEntries(lessons.map((lesson) => [lesson.id, validDocument(lesson)]));
  const reviews = lessons.map(validReview);
  const publicationLoader = loader({
    [`${approved}documents.json`]: documents,
    [`${approved}publication-review.json`]: reviews,
  });
  const content = publicationLoader(`${approved}content.ts`);
  const taxonomy = publicationLoader("src/lib/lp/taxonomy.ts");
  const availability = publicationLoader("src/lib/lp/ciaac-availability.ts");
  assert.equal(content.APPROVED_AIRCRAFT_ACTIVE, count >= 5, `${count} completed reviews`);
  assert.deepEqual(
    content.APPROVED_AIRCRAFT_READY_IDS,
    count >= 5 ? approvedIds.slice(0, count) : [],
  );
  assert.equal(
    taxonomy.subjectLpCount(taxonomy.lpSubject("ciaac", "aeronaves-y-motores")),
    count >= 5 ? 19 : 40,
  );
  for (const id of legacyIds) assert.equal(availability.isLearningPathAvailable(id), true);
  for (const [index, id] of approvedIds.entries())
    assert.equal(availability.isLearningPathAvailable(id), count >= 5 && index < count);
  assert.equal(availability.isLearningPathAvailable(`${catalog.containerId}/unknown`), false);
}

const gapLessons = [...catalog.lessons.slice(0, 5), catalog.lessons[6]];
let completedRows = legacyIds.map((id) => ({
  userId: "owner",
  temaId: `lp:${id}`,
  completado: true,
}));
const navigationLoader = loader({
  [`${approved}documents.json`]: Object.fromEntries(
    gapLessons.map((lesson) => [lesson.id, validDocument(lesson)]),
  ),
  [`${approved}publication-review.json`]: gapLessons.map(validReview),
  "src/lib/store/db.ts": { read: () => [], update: () => {}, nowISO: () => "2026-10-05T00:00:00Z" },
  "src/lib/store/domain.ts": {
    getTemaProgress: (userId) => completedRows.filter((row) => row.userId === userId),
  },
  "src/lib/store/gating.ts": { isPaid: (user) => user.plan === "pro" },
});
const navigation = navigationLoader("src/lib/store/lp-nav.ts");
const navigationTaxonomy = navigationLoader("src/lib/lp/taxonomy.ts");
const newSubject = navigationTaxonomy.lpSubject("ciaac", "aeronaves-y-motores");
const pro = { id: "owner", plan: "pro" };
assert.deepEqual(navigation.subjectProgress(pro.id, newSubject), {
  done: 0,
  total: 19,
  percent: 0,
});
assert.equal(navigation.lpAccess(pro, newSubject, approvedIds[0]).allowed, true);
assert.equal(navigation.lpAccess(pro, newSubject, approvedIds[1]).lock, "previo");
assert.equal(navigation.subjectContinue(pro.id, newSubject).id, approvedIds[0]);
const retainedSubject = navigationTaxonomy.legacyAircraftSubject();
assert.deepEqual(navigation.subjectProgress(pro.id, retainedSubject), {
  done: 40,
  total: 40,
  percent: 100,
});
for (const id of legacyIds) {
  assert.equal(
    navigation.lpAccess({ ...pro, plan: "basica" }, retainedSubject, id).allowed,
    true,
    "Completed legacy routes remain reviewable after downgrade",
  );
}
completedRows.push({ userId: "owner", temaId: `lp:${approvedIds[0]}`, completado: true });
assert.equal(navigation.lpAccess(pro, newSubject, approvedIds[1]).allowed, true);
assert.equal(
  navigation.lpAccess({ ...pro, plan: "basica" }, newSubject, approvedIds[1]).lock,
  "plan",
);
assert.equal(
  navigation.lpAccess({ id: "different-user", plan: "pro" }, newSubject, approvedIds[1]).lock,
  "previo",
);
completedRows = [
  ...completedRows,
  ...approvedIds
    .slice(1, 5)
    .map((id) => ({ userId: "owner", temaId: `lp:${id}`, completado: true })),
];
assert.equal(
  navigation.subjectContinue(pro.id, newSubject),
  null,
  "Do not skip an unpublished AM06 to published AM07",
);
assert.equal(navigation.lpAccess(pro, newSubject, approvedIds[5]).lock, "contenido");
assert.equal(navigation.lpAccess(pro, newSubject, approvedIds[6]).lock, "previo");
assert.equal(navigation.lpNeighbors(newSubject, approvedIds[4]).next.id, approvedIds[5]);

// Activation preserves pending historical subject rewards and keeps the stable
// lifetime event key even when the owner completes both curriculum versions.
const rules = new Map(
  ["learning_path", "materia_completa"].map((key, index) => [
    key,
    {
      key,
      enabled: true,
      value: { fp: index ? 100 : 20 },
    },
  ]),
);
for (const active of [false, true]) {
  const rewardEngine = loader({
    [`${approved}content.ts`]: { APPROVED_AIRCRAFT_ACTIVE: active },
    "src/lib/lp/ciaac-transit-approved/publication-review.json": [],
  })("src/lib/fp/fp.server.ts");
  for (const [label, oldIds, newIds, expectedBonus] of [
    ["partial legacy", legacyIds.slice(0, -1), [], 0],
    ["complete legacy", legacyIds, [], 1],
    ["partial approved", [], approvedIds.slice(0, -1), 0],
    ["complete approved", [], approvedIds, active ? 1 : 0],
    ["complete both", legacyIds, approvedIds, 1],
  ]) {
    const state = {
      activity: [],
      quizzes: [],
      sims: [],
      flash: [],
      logros: [],
      studyDays: {},
      temas: [
        ...oldIds.map((id) => ({
          temaId: `lp:${id}`,
          completado: true,
          fecha: "2026-09-30T12:00:00Z",
        })),
        ...newIds.map((id) => ({
          temaId: `lp:${id}`,
          completado: true,
          fecha: "2026-10-05T12:00:00Z",
        })),
      ],
    };
    const events = rewardEngine.derivarEventos(state, rules);
    const lpEvents = events.filter((event) => event.ruleKey === "learning_path");
    assert.equal(lpEvents.length, oldIds.length + newIds.length);
    assert.ok(lpEvents.every((event) => event.eventKey === `lp:${event.activityId}`));
    const bonuses = events.filter((event) => event.ruleKey === "materia_completa");
    assert.equal(bonuses.length, expectedBonus, `${label}, active=${active}`);
    if (bonuses.length) {
      assert.equal(bonuses[0].eventKey, `materia:${catalog.subjectId}`);
      assert.equal(
        bonuses[0].occurredAt,
        oldIds.length === 40 ? "2026-09-30T12:00:00Z" : "2026-10-05T12:00:00Z",
      );
    }
    assert.deepEqual(
      rewardEngine.derivarEventos(state, rules),
      events,
      "Reward derivation is deterministic",
    );
  }
}

// Release assets are verified against disk; the runtime gate cannot inspect public/.
function pngDimensions(bytes, label) {
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(
    bytes.length >= 33 &&
      bytes.subarray(0, 8).equals(pngSignature) &&
      bytes.readUInt32BE(8) === 13 &&
      bytes.toString("ascii", 12, 16) === "IHDR",
    `${label}: invalid or truncated PNG IHDR dimensions`,
  );
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert.ok(width > 0 && height > 0, `${label}: PNG dimensions must be positive`);
  return { width, height };
}
// Header-only parsers following the WebP container and lossless bitstream specs:
// https://developers.google.com/speed/webp/docs/riff_container
// https://developers.google.com/speed/webp/docs/webp_lossless_bitstream_specification
function webpDimensions(bytes, label) {
  assert.ok(
    bytes.length >= 12 &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP",
    `${label}: invalid WebP RIFF header`,
  );
  const end = bytes.readUInt32LE(4) + 8;
  assert.ok(
    end === bytes.length && end >= 12 && end % 2 === 0,
    `${label}: truncated, trailing, or invalid WebP RIFF length`,
  );
  let offset = 12;
  let chunks = 0;
  let canvas;
  let bitstream;
  while (offset < end) {
    assert.ok(++chunks <= 128 && offset + 8 <= end, `${label}: invalid or excessive RIFF chunks`);
    const kind = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    const next = start + size + (size & 1);
    assert.ok(next <= end, `${label}: truncated ${kind} chunk`);
    if (size & 1) assert.equal(bytes[start + size], 0, `${label}: nonzero RIFF padding`);
    if (kind === "VP8X") {
      assert.ok(size === 10 && !canvas, `${label}: invalid or repeated VP8X header`);
      canvas = {
        width: bytes.readUIntLE(start + 4, 3) + 1,
        height: bytes.readUIntLE(start + 7, 3) + 1,
      };
    } else if (kind === "VP8 ") {
      assert.ok(
        size >= 10 &&
          !(bytes[start] & 1) &&
          bytes.subarray(start + 3, start + 6).equals(Buffer.from([0x9d, 0x01, 0x2a])),
        `${label}: invalid or truncated VP8 key-frame header`,
      );
      assert.ok(!bitstream, `${label}: repeated WebP image bitstream`);
      bitstream = {
        width: bytes.readUInt16LE(start + 6) & 0x3fff,
        height: bytes.readUInt16LE(start + 8) & 0x3fff,
      };
    } else if (kind === "VP8L") {
      assert.ok(size >= 5 && bytes[start] === 0x2f, `${label}: invalid or truncated VP8L header`);
      const bits = bytes.readUInt32LE(start + 1);
      assert.equal(bits >>> 29, 0, `${label}: unsupported VP8L version`);
      assert.ok(!bitstream, `${label}: repeated WebP image bitstream`);
      bitstream = { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    offset = next;
  }
  const dimensions = canvas ?? bitstream;
  assert.ok(
    dimensions && dimensions.width > 0 && dimensions.height > 0,
    `${label}: no supported positive WebP canvas dimensions`,
  );
  return dimensions;
}
function imageDimensions(bytes, label) {
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return pngDimensions(bytes, label);
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF")
    return webpDimensions(bytes, label);
  assert.fail(
    `${label}: cropped assets require supported PNG/WebP dimension validation; add a supported parser before using another format`,
  );
}
function riffFixture(chunks) {
  const body = Buffer.concat(
    chunks.map(([kind, payload]) => {
      const header = Buffer.alloc(8);
      header.write(kind, 0, "ascii");
      header.writeUInt32LE(payload.length, 4);
      return Buffer.concat([header, payload, Buffer.alloc(payload.length & 1)]);
    }),
  );
  const header = Buffer.alloc(12);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(body.length + 4, 4);
  header.write("WEBP", 8, "ascii");
  return Buffer.concat([header, body]);
}
const pngHeaderFixture = Buffer.alloc(33);
Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(pngHeaderFixture);
pngHeaderFixture.writeUInt32BE(13, 8);
pngHeaderFixture.write("IHDR", 12, "ascii");
pngHeaderFixture.writeUInt32BE(2048, 16);
pngHeaderFixture.writeUInt32BE(1152, 20);
assert.deepEqual(imageDimensions(pngHeaderFixture, "in-memory IHDR fixture"), {
  width: 2048,
  height: 1152,
});
assert.throws(
  () => imageDimensions(Buffer.from("<svg/>"), "unsupported cropped SVG"),
  /require supported PNG\/WebP dimension validation/,
);
const vp8xFixture = Buffer.alloc(10);
vp8xFixture.writeUIntLE(2047, 4, 3);
vp8xFixture.writeUIntLE(1151, 7, 3);
const vp8Fixture = Buffer.alloc(10);
Buffer.from([0x9d, 0x01, 0x2a]).copy(vp8Fixture, 3);
vp8Fixture.writeUInt16LE(2048 | 0x8000, 6);
vp8Fixture.writeUInt16LE(1152 | 0x4000, 8);
const vp8lFixture = Buffer.alloc(5);
vp8lFixture[0] = 0x2f;
vp8lFixture.writeUInt32LE((2047 | (1151 << 14) | (1 << 28)) >>> 0, 1);
for (const [kind, payload] of [
  ["VP8X", vp8xFixture],
  ["VP8 ", vp8Fixture],
  ["VP8L", vp8lFixture],
]) {
  assert.deepEqual(
    imageDimensions(
      riffFixture([
        ["JUNK", Buffer.from([1])],
        [kind, payload],
      ]),
      kind,
    ),
    { width: 2048, height: 1152 },
    `${kind} dimensions and odd RIFF padding`,
  );
  assert.throws(
    () => imageDimensions(riffFixture([[kind, payload.subarray(0, 4)]]), `${kind} truncated`),
    /invalid|truncated/,
  );
}
assert.deepEqual(
  webpDimensions(
    riffFixture([
      ["VP8X", vp8xFixture],
      ["VP8 ", vp8Fixture],
    ]),
    "extended WebP",
  ),
  { width: 2048, height: 1152 },
);
const malformedWebpCases = {
  "RIFF length exceeds bytes": () => {
    const bytes = riffFixture([["VP8L", vp8lFixture]]);
    bytes.writeUInt32LE(bytes.length + 100, 4);
    return bytes;
  },
  "chunk length exceeds RIFF": () => {
    const bytes = riffFixture([["VP8L", vp8lFixture]]);
    bytes.writeUInt32LE(0xffffffff, 16);
    return bytes;
  },
  "nonzero odd padding": () => {
    const bytes = riffFixture([["VP8L", vp8lFixture]]);
    bytes[bytes.length - 1] = 1;
    return bytes;
  },
  "invalid VP8 signature": () => {
    const payload = Buffer.from(vp8Fixture);
    payload[3] = 0;
    return riffFixture([["VP8 ", payload]]);
  },
  "unsupported VP8L version": () => {
    const payload = Buffer.from(vp8lFixture);
    payload[4] |= 0x20;
    return riffFixture([["VP8L", payload]]);
  },
  "missing image dimensions": () => riffFixture([["JUNK", Buffer.alloc(0)]]),
  "bounded chunk count": () =>
    riffFixture(Array.from({ length: 129 }, () => ["JUNK", Buffer.alloc(0)])),
};
for (const [label, fixture] of Object.entries(malformedWebpCases))
  assert.throws(() => webpDimensions(fixture(), label), undefined, label);
const assetDirectory = file("public/ciaac-approved/structures-engines");
const webpFiles = fs.readdirSync(assetDirectory).filter((name) => name.endsWith(".webp"));
const assetManifest = json("public/ciaac-approved/structures-engines/asset-manifest.json");
for (const asset of assetManifest.assets) {
  assert.ok(webpFiles.includes(asset.src), `${asset.src}: reviewed runtime asset is present`);
  const dimensions = imageDimensions(
    fs.readFileSync(path.join(assetDirectory, asset.src)),
    asset.src,
  );
  assert.deepEqual(
    dimensions,
    { width: asset.width, height: asset.height },
    `${asset.src}: preserves the reviewed original resolution`,
  );
  assert.ok(!Object.hasOwn(asset, "png"), "No manifest link to archived non-runtime PNG masters");
}
assert.equal(
  webpFiles.length,
  assetManifest.assets.length,
  "Every shipped engine illustration is covered by the reviewed manifest",
);
const publishedContent = load(`${approved}content.ts`).APPROVED_AIRCRAFT_CONTENT;
const authoredDocuments = json(`${approved}documents.json`);
const productionReviews = json(`${approved}publication-review.json`);
const productionEligible = collect(authoredDocuments, productionReviews);
const expectedProductionActive = approvedIds.slice(0, 5).every((id) => productionEligible[id]);
const productionContent = load(`${approved}content.ts`);
assert.equal(
  productionContent.APPROVED_AIRCRAFT_ACTIVE,
  expectedProductionActive,
  "Production activation reflects its real review rows, never a default-empty assumption",
);
assert.deepEqual(
  productionContent.APPROVED_AIRCRAFT_READY_IDS,
  expectedProductionActive ? Object.keys(productionEligible) : [],
);
const productionTaxonomy = load("src/lib/lp/taxonomy.ts");
assert.deepEqual(
  productionTaxonomy
    .subjectSequence(productionTaxonomy.lpSubject("ciaac", "aeronaves-y-motores"))
    .map(({ item }) => item.id),
  expectedProductionActive ? approvedIds : legacyIds,
);
const reviewFixtures = catalog.lessons
  .filter((lesson) => Object.hasOwn(authoredDocuments, lesson.id))
  .map(validReview);
// Temporary mechanical validation only. These in-memory fixture flags never
// update publication-review.json or constitute an editorial publication review.
const mechanicallyValidDocuments = collect(authoredDocuments, reviewFixtures);
assert.deepEqual(
  Object.keys(mechanicallyValidDocuments).sort(),
  Object.keys(authoredDocuments).sort(),
  `Authored documents rejected by the structural gate: ${Object.keys(authoredDocuments)
    .filter((id) => !mechanicallyValidDocuments[id])
    .join(", ")}`,
);
for (const id of approvedIds.slice(0, 5))
  assert.ok(authoredDocuments[id], `First-block authored document exists: ${id}`);
const recognitionLesson = authoredDocuments[firstId];
assert.equal(recognitionLesson.questions.length, 0, "AM01 has no extra question bank");
assert.equal(recognitionLesson.stages.filter((stage) => stage.kind === "quiz").length, 0);
assert.equal(recognitionLesson.stages.filter((stage) => stage.kind === "exercise").length, 1);
assert.equal(recognitionLesson.stages.at(-2).kind, "exercise");
assert.equal(recognitionLesson.exercise.kind, "match");
assert.deepEqual(
  recognitionLesson.exerciseFigures.map((figure) => figure.heading),
  recognitionLesson.exercise.pairs.map(([label]) => label),
  "Every AM01 recognition option has its corresponding labeled image",
);
const authoredCards = Object.values(authoredDocuments).flatMap((document) =>
  document.stages.filter((stage) => stage.kind === "content").flatMap((stage) => stage.cards),
);
const excerptWords = authoredCards.map((card) => card.text.trim().split(/\s+/).length);
const assetFailures = new Set();
for (const [id, document] of Object.entries({ ...authoredDocuments, ...publishedContent })) {
  const figures = [
    ...document.stages
      .filter((candidate) => candidate.kind === "content")
      .flatMap((stage) => stage.figures),
    ...(document.exerciseFigures ?? []),
  ];
  for (const figure of figures) {
    try {
      const asset = file(`public/${figure.file.replace(/^\//, "")}`);
      assert.ok(fs.existsSync(asset), `${id}: missing asset ${figure.file}`);
      if (figure.crop) {
        const dimensions = imageDimensions(fs.readFileSync(asset), `${id}: ${figure.file}`);
        const actualAspect = dimensions.width / dimensions.height;
        assert.ok(
          Math.abs(actualAspect - figure.crop.assetAspectRatio) <= 1e-6,
          `${id}: ${figure.file}: crop.assetAspectRatio ${figure.crop.assetAspectRatio} differs from image dimensions (${actualAspect})`,
        );
      }
    } catch (error) {
      assetFailures.add(error.message);
    }
  }
}
assert.equal(
  assetFailures.size,
  0,
  `Authored asset checks failed:\n${[...assetFailures].join("\n")}`,
);

const fresh = () => ({
  stage: 0,
  maxStage: 0,
  complete: false,
  answers: {},
  checks: [false],
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
const document = validDocument();
const state = migrate(firstId, document, null, false, fresh());
assert.equal(state.version, `${catalog.curriculumVersion}:${firstId}:v1`);
assert.equal(state.complete, false);
assert.equal(state.stage, 0);
assert.equal(state.maxStage, 0);
const oldJourney = {
  version: "ciaac-aircraft-engines-1-1-v1",
  stage: 99,
  maxStage: 99,
  complete: true,
  finished: true,
  answers: { 0: 0 },
  checks: [true],
};
const oldCopy = structuredClone(oldJourney);
const migrated = migrate(firstId, document, oldJourney, false, fresh());
assert.equal(migrated.complete, false, "Old completion is never new completion");
assert.equal(migrated.maxStage, 0);
assert.equal(migrated.stage, 0);
assert.deepEqual(migrated.answers, {});
assert.deepEqual(migrated.checks, [false]);
assert.equal(migrated.previousJourney, oldJourney);
assert.equal(migrated.migrationNotice, true);
assert.deepEqual(oldJourney, oldCopy);
const previousVersion = migrate(
  firstId,
  document,
  { ...oldJourney, version: `${state.version}-old` },
  false,
  fresh(),
);
assert.equal(previousVersion.complete, false);
const completed = migrate(firstId, document, oldJourney, true, fresh());
assert.equal(
  completed.complete,
  true,
  "Authoritative completion for the new ID remains reviewable",
);
assert.equal(completed.maxStage, document.stages.length - 1);
assert.equal(completed.migrationNotice, false);
const resumed = migrate(
  firstId,
  document,
  { ...state, stage: 2, maxStage: 2, answers: { 0: 1 }, checks: [true] },
  false,
  fresh(),
);
assert.equal(resumed.stage, 2);
assert.equal(resumed.maxStage, 2);
assert.deepEqual(resumed.answers, { 0: 1 });
assert.deepEqual(resumed.checks, [true]);
assert.deepEqual(migrate(firstId, document, structuredClone(resumed), false, fresh()), resumed);
const savedComplete = migrate(firstId, document, { ...resumed, complete: true }, false, fresh());
assert.equal(savedComplete.complete, true);
assert.equal(savedComplete.maxStage, document.stages.length - 1);
const differentId = migrate(
  approvedIds[1],
  validDocument(catalog.lessons[1]),
  savedComplete,
  false,
  fresh(),
);
assert.equal(differentId.complete, false, "Completion never crosses approved LP IDs");
assert.equal(differentId.stage, 0);
assert.deepEqual(differentId.answers, {});
const dirty = migrate(
  firstId,
  document,
  {
    ...state,
    stage: 99,
    maxStage: -1,
    answers: { 0: 20, 99: 0 },
    checks: ["true", true],
    exerciseDone: true,
    exercise: { pairs: { 0: 0 }, sequence: [0, 0] },
  },
  false,
  fresh(),
);
assert.equal(dirty.stage, 0);
assert.equal(dirty.maxStage, 0);
assert.deepEqual(dirty.answers, {});
assert.deepEqual(dirty.checks, [false]);
assert.equal(dirty.exerciseDone, false);

async function verifyNativeIllustrationRendering() {
  const React = require("react");
  const { JSDOM } = require("jsdom");
  const browser = new JSDOM('<div id="root"></div>', { url: "https://example.test" });
  const browserDocument = browser.window.document;
  Object.assign(global, {
    window: browser.window,
    document: browserDocument,
    HTMLElement: browser.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = require("react-dom/client");
  const lesson = validDocument();
  applyFigureGeometry(lesson, {
    crop: validCrop,
    focus: { x: 40, y: 40, label: "Centro visible" },
  });
  let saved = null;
  const domLoader = loader({
    "src/components/lp/LearningPathExperience.tsx": { useLearningPathStageView: () => {} },
    "src/lib/store/lp-journey.ts": {
      getLpJourney: () => saved,
      saveLpJourney: (_user, _id, state) => {
        saved = structuredClone(state);
      },
      resetLpJourney: () => {
        saved = null;
      },
    },
  });
  const { HandbookLearningPath } = domLoader("src/components/lp/HandbookLearningPath.tsx");
  const { CiaacApprovedAircraftLearningPath } = domLoader(
    "src/components/lp/CiaacApprovedAircraftLearningPath.tsx",
  );
  const figure = lesson.stages[1].figures[0];
  const assertCrop = (container) => {
    const viewport = container.querySelector(".am-illustration__viewport.is-cropped");
    assert.ok(viewport, "The reviewed crop viewport is retained");
    const image = viewport.querySelector("img");
    const focus = viewport.querySelector(".am-illustration__focus");
    const ratio = viewport.style.aspectRatio.split("/").map(Number);
    assert.equal(ratio[0] / (ratio[1] ?? 1), 1);
    assert.equal(image.style.width, "250%");
    assert.equal(image.style.left, "-50%");
    assert.ok(Math.abs(parseFloat(image.style.top) + 100 / 6) < 1e-9);
    assert.equal(focus.style.left, "50%");
    assert.equal(focus.style.top, "50%");
    assert.equal(focus.getAttribute("aria-hidden"), "true");
    assert.equal(viewport.querySelectorAll(".am-illustration__focus").length, 1);
    assert.equal(image.alt, figure.alt);
    return viewport.getAttribute("style") + image.getAttribute("style");
  };
  for (const approvedWrapper of [false, true]) {
    saved = { ...migrate(firstId, lesson, null, false, fresh()), stage: 1, maxStage: 1 };
    const reactRoot = createRoot(browserDocument.getElementById("root"));
    try {
      await React.act(() =>
        reactRoot.render(
          React.createElement(
            approvedWrapper ? CiaacApprovedAircraftLearningPath : HandbookLearningPath,
            {
              document: lesson,
              userId: "isolated-review",
              lpId: firstId,
              completed: false,
              onComplete: () => {},
            },
          ),
        ),
      );
      assert.equal(
        browserDocument.querySelectorAll(approvedWrapper ? ".am-illustration" : ".hb-figure")
          .length,
        1,
      );
      assert.equal(
        browserDocument.querySelectorAll(approvedWrapper ? ".hb-figure" : ".am-illustration")
          .length,
        0,
      );
      const normalCrop = approvedWrapper ? assertCrop(browserDocument) : null;
      const zoomButton = browserDocument.querySelector(
        approvedWrapper ? ".am-illustration__head button" : ".hb-figure-head button",
      );
      await React.act(() => zoomButton.click());
      const dialog = browserDocument.querySelector('[role="dialog"]');
      assert.ok(dialog);
      assert.equal(dialog.getAttribute("aria-modal"), "true");
      assert.equal(dialog.querySelector("img").getAttribute("src"), figure.file);
      assert.equal(dialog.querySelector("img").alt, figure.alt);
      if (approvedWrapper) {
        assert.equal(
          assertCrop(dialog),
          normalCrop,
          "Enlarging never reveals the excluded image region",
        );
        assert.equal(
          dialog.querySelectorAll(".am-illustration__head button").length,
          0,
          "Expanded illustration cannot recursively open another zoom",
        );
      } else {
        assert.equal(
          dialog.querySelector("img").getAttribute("style"),
          null,
          "Legacy callback-absent zoom remains the original full image",
        );
        assert.equal(dialog.querySelectorAll(".am-illustration").length, 0);
      }
      await React.act(() => dialog.querySelector("button").click());
      assert.equal(browserDocument.querySelector('[role="dialog"]'), null);
    } finally {
      await React.act(() => reactRoot.unmount());
    }
  }
  const exerciseLesson = validDocument();
  applyExerciseFigures(exerciseLesson);
  saved = { ...migrate(firstId, exerciseLesson, null, false, fresh()), stage: 2, maxStage: 2 };
  const exerciseRoot = createRoot(browserDocument.getElementById("root"));
  try {
    await React.act(() =>
      exerciseRoot.render(
        React.createElement(CiaacApprovedAircraftLearningPath, {
          document: exerciseLesson,
          userId: "isolated-review",
          lpId: firstId,
          completed: false,
          onComplete: () => {},
        }),
      ),
    );
    const grid = browserDocument.querySelector(".am-recognition-grid");
    assert.ok(grid, "The recognition exercise shows its actual referenced figures");
    assert.equal(
      grid.querySelectorAll(".am-illustration").length,
      exerciseLesson.exerciseFigures.length,
    );
    assert.equal(grid.querySelectorAll(".am-illustration__head button").length, 0);
    assert.equal(
      grid.querySelector("img").getAttribute("src"),
      exerciseLesson.exerciseFigures[0].file,
    );
    assert.equal(grid.querySelector("img").alt, exerciseLesson.exerciseFigures[0].alt);
  } finally {
    await React.act(() => exerciseRoot.unmount());
    browser.window.close();
  }
}

verifyNativeIllustrationRendering()
  .then(() => {
    console.log(
      `PASS: production active=${expectedProductionActive}, ${productionContent.APPROVED_AIRCRAFT_READY_IDS.length} ready; explicit inactive and first-five fixtures; 19 approved IDs; 40 preserved legacy routes; ${Object.keys(invalidDocuments).length} invalid-document cases (${Object.keys(invalidGeometry).length} geometry, ${Object.keys(invalidExerciseFigures).length} exercise-figure); 6 valid geometry boundaries; VP8X/VP8/VP8L parsers and ${webpFiles.length} reviewed full-resolution WebP assets; ${Object.keys(authoredDocuments).length} authored documents structurally valid with in-memory review fixtures, ${authoredCards.length} cards at ${Math.min(...excerptWords)}–${Math.max(...excerptWords)} words; game-only mastery, crop-preserving approved zoom, unchanged legacy zoom, recognition figures; progress, publication, rewards, and versioned journeys.`,
    );
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
