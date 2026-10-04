const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const file = (relative) => path.join(root, relative);
const read = (relative) => fs.readFileSync(file(relative), "utf8");

// Match the existing ATP regression tests: execute TypeScript without a browser,
// bundler, database, or network. Stubs are explicit when testing store guards.
function loader(stubs = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
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
      assert.ok(dependency, `Unresolved import ${request} in ${filename}`);
      return load(dependency);
    };
    vm.runInThisContext(`(function(require, module, exports) {${js}\n})`, { filename })(
      localRequire,
      mod,
      mod.exports,
    );
    return mod.exports;
  }
  return load;
}

const load = loader();
const canonical = JSON.parse(read("src/lib/lp/ciaac-module1.content.json"));
const { CIAAC_MODULE_ONE_CONTENT, CIAAC_LEARNING_PATHS } = load(
  file("src/lib/lp/ciaac-content.ts"),
);
const { CIAAC_MODULE_ONE_IDS, isLearningPathAvailable, hasAvailableCiaacContent } = load(
  file("src/lib/lp/ciaac-availability.ts"),
);
const taxonomy = JSON.parse(read("src/lib/lp/taxonomy.json"));
const category = taxonomy.categories.find((item) => item.id === "ciaac");
const subject = category.subjects.find((item) => item.id === "ciaac/aerodinamica");
const moduleOne = subject.containers.find((item) => item.id === canonical.module.id);
const ids = canonical.lessons.map((lesson) => lesson.id);
const indexes = (length) => Array.from({ length }, (_, index) => index);
const sorted = (values) => [...values].sort((a, b) => a - b);
const sum = (key) =>
  canonical.lessons.reduce(
    (total, lesson) => total + (lesson[key] ?? lesson.document[key]).length,
    0,
  );

// Public assets retain the complete teaching material but must never bundle
// source-review records, private links, identifiers, or authoring metadata.
assert.deepEqual(
  CIAAC_MODULE_ONE_CONTENT,
  canonical,
  "The complete public teaching payload is exported",
);
assert.equal(canonical.formatVersion, "ciaac-module-content-1");
assert.equal(canonical.course, "CIAAC");
assert.equal(canonical.subject, "Aerodinámica");
assert.equal(canonical.module.number, 1);
function exactKeys(value, expected, context) {
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), context);
}
exactKeys(
  canonical,
  ["formatVersion", "language", "course", "subject", "module", "sources", "lessons"],
  "Only the public content contract is shipped",
);
const forbiddenKeys = new Set([
  "review",
  "sourceWorkflow",
  "verificationLimits",
  "sourceTextSha256",
  "sourceSnapshot",
  "mediaBriefs",
  "technicalCorrections",
  "coverage",
  "origin",
  "schemaCompatibility",
  "schemaBase",
  "createdAt",
  "originalBrief",
  "technicalAdjustments",
  "sourceHashes",
]);
function privateDataAbsent(value, context) {
  if (Array.isArray(value))
    return value.forEach((item, index) => privateDataAbsent(item, `${context}[${index}]`));
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!forbiddenKeys.has(key), `${context}: no private provenance field ${key}`);
      privateDataAbsent(child, `${context}.${key}`);
    }
  }
}
privateDataAbsent(canonical, "public content");
privateDataAbsent(CIAAC_LEARNING_PATHS, "rendered content");
const publicPayload = JSON.stringify({ canonical, documents: CIAAC_LEARNING_PATHS });
assert.doesNotMatch(
  publicPayload,
  /(?:drive|docs|notebooklm|notebook)\.google\.(?:com|[a-z.]+)/i,
  "No private Google document or notebook URL",
);
assert.doesNotMatch(publicPayload, /\b[a-f0-9]{64}\b/i, "No source hashes");
assert.doesNotMatch(
  publicPayload,
  /\/(?:workspace|Users|home|agent_notes|user_notes)\//,
  "No internal filesystem paths",
);
assert.doesNotMatch(
  publicPayload,
  /NotebookLM|pending_notebook_crosscheck|user_drive|content_review_not_published|specification_only_not_produced/i,
  "No internal source-review workflow text",
);

// Developers can supply a private handoff locally. This never embeds its path
// or contents in the repository; only approved teaching content is compared.
if (process.env.CIAAC_REVIEW_SOURCE) {
  const privateReview = JSON.parse(fs.readFileSync(process.env.CIAAC_REVIEW_SOURCE, "utf8"));
  assert.deepEqual(
    canonical.lessons.map((lesson) => lesson.id),
    privateReview.lessons.map((lesson) => lesson.id),
  );
  for (const lesson of canonical.lessons) {
    const original = privateReview.lessons.find((entry) => entry.id === lesson.id);
    const expectedDocument = structuredClone(original.document);
    expectedDocument.source_print_page = "Consulta las referencias bibliográficas del recorrido";
    expectedDocument.subtopics.forEach((subtopic) => {
      subtopic.source_method = "Referencia bibliográfica";
      subtopic.source_print_page = "Consulta las referencias bibliográficas del recorrido";
    });
    assert.deepEqual(
      lesson.document,
      expectedDocument,
      `${lesson.id}: all authored teaching content is preserved`,
    );
    assert.deepEqual(
      lesson.activities,
      original.activities,
      `${lesson.id}: all authored activities are preserved`,
    );
    assert.deepEqual(
      lesson.completionChecks,
      original.completionChecks,
      `${lesson.id}: all authored closure checks are preserved`,
    );
  }
  for (const [id, source] of Object.entries(canonical.sources)) {
    const original = privateReview.sources[id];
    if (original?.verified_locators)
      assert.deepEqual(
        source.verified_locators,
        original.verified_locators.map((locator) =>
          locator.replace(/\s+(?:mediante|original abierto)\b.*$/u, ""),
        ),
        `${id}: verified bibliographic pages are retained`,
      );
  }
  const privateText = JSON.stringify(privateReview);
  const privateIds = [
    ...privateText.matchAll(
      /https?:\/\/(?:drive|docs|notebooklm|notebook)\.google\.[^"\s]+?\/(?:d|notebook)\/([\w-]+)/g,
    ),
  ].map((match) => match[1]);
  for (const id of privateIds)
    assert.ok(!publicPayload.includes(id), "No private source identifier is exposed");
}
assert.equal(ids.length, 5);
assert.equal(new Set(ids).size, 5);
assert.deepEqual(
  ids,
  moduleOne.learningPaths.map((item) => item.id),
  "Existing taxonomy IDs and order",
);
assert.deepEqual(Object.keys(CIAAC_LEARNING_PATHS), ids);
assert.deepEqual(CIAAC_MODULE_ONE_IDS, ids);
assert.deepEqual(
  canonical.lessons.map((lesson) => lesson.document.cards.length),
  [8, 10, 12, 11, 12],
);
assert.deepEqual(
  canonical.lessons.map((lesson) => lesson.document.questions.length),
  [6, 4, 5, 11, 13],
);
assert.equal(sum("cards"), 53);
assert.equal(sum("questions"), 39);
assert.equal(sum("activities"), 18);

function validQuestionIndex(index, document, context) {
  assert.ok(Number.isInteger(index) && index >= 0 && index < document.questions.length, context);
}

function validSourceReferences(refs, context) {
  assert.ok(refs.length > 0, `${context}: missing source references`);
  for (const ref of refs) {
    assert.ok(canonical.sources[ref], `${context}: unresolved source ${ref}`);
    const source = canonical.sources[ref];
    assert.ok(source.title && source.role, `${context}: incomplete source ${ref}`);
    assert.ok(
      Object.keys(source).every((key) =>
        ["title", "url", "role", "verified_locators", "limit"].includes(key),
      ),
      `${context}: public bibliographic source fields only`,
    );
    if (source.url) {
      assert.match(source.url, /^https:\/\//, `${context}: invalid public source URL ${ref}`);
      assert.ok(
        [
          "www.icao.int",
          "www.ordenjuridico.gob.mx",
          "www2.anac.gov.br",
          "tc.canada.ca",
          "www1.grc.nasa.gov",
        ].includes(new URL(source.url).hostname),
        `${context}: source URL must use an approved official public host`,
      );
    }
  }
}

validSourceReferences(Object.keys(canonical.sources), "Public bibliography");
assert.ok(
  Object.keys(canonical.sources).every((id) => id !== "syllabus" && !/^draft-\d+$/.test(id)),
  "Private source records are omitted",
);
assert.deepEqual(
  fs.readdirSync(file("src/lib/lp")).filter((name) => /^ciaac-.*review/.test(name)),
  [],
  "No private review artifact remains in application sources",
);

function expectedRenderedQuestion(question, lessonNumber, questionIndex) {
  // These three questions now have the supplied diagram on screen. The full
  // historical wording remains in the canonical teaching JSON.
  return lessonNumber === 4 && [7, 8, 9].includes(questionIndex)
    ? { ...question, prompt: question.prompt.replace("diagrama imaginado", "diagrama") }
    : question;
}

for (const [lessonIndex, lesson] of canonical.lessons.entries()) {
  const document = CIAAC_LEARNING_PATHS[lesson.id];
  const original = lesson.document;
  const item = moduleOne.learningPaths[lessonIndex];
  assert.equal(document.number, item.orden, lesson.id);
  assert.equal(document.name, item.titulo, lesson.id);
  assert.equal(document.chapter, 1, lesson.id);
  assert.equal(document.chapterLabel, "Módulo", lesson.id);
  assert.equal(document.sourceLabel, "CIAAC · Aerodinámica", lesson.id);
  assert.equal(document.ciaac.lessonNumber, lessonIndex + 1, lesson.id);
  exactKeys(
    lesson,
    ["id", "document", "activities", "completionChecks", "sourceRefs"],
    `${lesson.id}: public lesson fields only`,
  );
  exactKeys(
    document.ciaac,
    ["lessonNumber", "activities"],
    `${lesson.id}: no review metadata in the renderer`,
  );
  assert.deepEqual(
    document.ciaac.activities,
    lesson.activities,
    `${lesson.id}: all activities survive`,
  );
  assert.deepEqual(
    document.completionChecks,
    lesson.completionChecks,
    `${lesson.id}: specific finish checks`,
  );
  assert.ok(document.completionChecks.length >= 3, lesson.id);

  // Adaptation changes presentation stages only; authored pedagogy stays intact.
  for (const key of Object.keys(original).filter((key) => key !== "stages")) {
    const expected =
      key === "questions"
        ? original.questions.map((question, index) =>
            expectedRenderedQuestion(question, original.number, index),
          )
        : original[key];
    assert.deepEqual(document[key], expected, `${lesson.id}: preserve document.${key}`);
  }
  assert.equal(document.source_pdf_page, null, `${lesson.id}: never invent a PDF page`);
  assert.ok(
    document.subtopics.every((subtopic) => subtopic.source_pdf_page === null),
    lesson.id,
  );
  assert.deepEqual(
    document.figures,
    [],
    `${lesson.id}: media briefs are not fabricated source figures`,
  );
  assert.deepEqual(
    document.sources,
    lesson.sourceRefs.map((id) => ({ id, ...canonical.sources[id] })),
  );
  validSourceReferences(lesson.sourceRefs, lesson.id);
  for (const [cardIndex, card] of original.cards.entries()) {
    const context = `${lesson.id}: card ${cardIndex + 1}`;
    assert.ok(card.title && card.text && card.covers.length, context);
    assert.deepEqual(document.cards[cardIndex], card, `${context}: card text is unchanged`);
    assert.ok(
      Object.keys(card).every((key) => ["title", "text", "covers", "wide"].includes(key)),
      `${context}: teaching card fields only`,
    );
  }
  for (const [questionIndex, question] of original.questions.entries()) {
    const context = `${lesson.id}: question ${questionIndex + 1}`;
    assert.deepEqual(
      document.questions[questionIndex],
      expectedRenderedQuestion(question, original.number, questionIndex),
      `${context}: question semantics are unchanged`,
    );
    assert.ok(question.options.length >= 2 && question.feedback.length > 20, context);
    assert.ok(
      Number.isInteger(question.correct) &&
        question.correct >= 0 &&
        question.correct < question.options.length,
      context,
    );
    assert.deepEqual(
      sorted(question.order),
      indexes(question.options.length),
      `${context}: option-order permutation`,
    );
    assert.ok(
      Object.keys(question).every((key) =>
        ["prompt", "options", "feedback", "correct", "order", "after", "chapter", "topic"].includes(
          key,
        ),
      ),
      `${context}: teaching question fields only`,
    );
  }

  assert.equal(document.stages[0].kind, "intro", lesson.id);
  assert.equal(document.stages.at(-1).kind, "finish", lesson.id);
  const activityStages = document.stages.filter((stage) => stage.kind === "activity");
  assert.deepEqual(
    activityStages.map((stage) => stage.activityIndex),
    indexes(lesson.activities.length),
    `${lesson.id}: every activity has its own stage`,
  );
  assert.deepEqual(
    activityStages.map((stage) => stage.nav),
    lesson.activities.map((activity) => activity.title),
  );
  assert.ok(
    !document.stages.some((stage) => stage.kind === "exercise"),
    `${lesson.id}: no duplicated generic exercise`,
  );

  const originalContent = original.stages.flatMap((stage, index) =>
    stage.kind === "content" ? [{ ...stage, visualStage: index }] : [],
  );
  assert.deepEqual(
    document.stages.filter((stage) => stage.kind === "content"),
    originalContent,
    `${lesson.id}: content and visual anchors are preserved`,
  );
  const diagnostic = document.stages.filter((stage) => stage.kind === "quiz" && stage.diagnostic);
  assert.equal(diagnostic.length, 1, `${lesson.id}: one diagnostic preflight`);
  assert.deepEqual(diagnostic[0].questions, [0], `${lesson.id}: preflight keeps its question`);

  const visitedQuestions = document.stages.flatMap((stage) =>
    stage.kind === "quiz" ? stage.questions : [],
  );
  for (const [activityIndex, activity] of lesson.activities.entries()) {
    const context = `${lesson.id}: activity ${activityIndex + 1} (${activity.kind})`;
    assert.ok(activity.title && activity.instruction && activity.answer, context);
    const mapping = activity.runtimeMapping;
    assert.ok(
      mapping.exercise || mapping.questions?.length,
      `${context}: activity has meaningful runtime work`,
    );
    for (const index of mapping.questions ?? []) {
      validQuestionIndex(index, document, context);
      visitedQuestions.push(index);
    }
    if (mapping.exercise) {
      assert.ok(document.exercise, `${context}: mapped exercise exists`);
      assert.equal(document.exercise.kind, "match", context);
      assert.ok(document.exercise.pairs.length >= 3, context);
      assert.deepEqual(
        sorted(document.exercise.order),
        indexes(document.exercise.pairs.length),
        `${context}: exercise permutation`,
      );
    }
  }
  for (const index of visitedQuestions) validQuestionIndex(index, document, lesson.id);
  assert.deepEqual(
    sorted(visitedQuestions),
    indexes(document.questions.length),
    `${lesson.id}: every question is reachable exactly once`,
  );
}

// This lesson intentionally needs four distinct mastery checks, not the legacy
// renderer's default three generic statements.
assert.equal(CIAAC_LEARNING_PATHS[ids[4]].completionChecks.length, 4);
assert.ok(
  !CIAAC_LEARNING_PATHS[ids[0]].sources.some((source) => source.id === "phak"),
  "Flight-time definitions must not acquire false PHAK attribution",
);

let availableCiaac = 0;
let unchangedNonCiaac = 0;
for (const cat of taxonomy.categories) {
  for (const subj of cat.subjects) {
    for (const container of subj.containers) {
      for (const item of container.learningPaths) {
        const expected = cat.id !== "ciaac" || ids.includes(item.id);
        assert.equal(isLearningPathAvailable(item.id), expected, `${item.id}: availability`);
        if (cat.id === "ciaac" && expected) availableCiaac += 1;
        if (cat.id !== "ciaac" && expected) unchangedNonCiaac += 1;
      }
      if (cat.id === "ciaac") {
        assert.equal(
          hasAvailableCiaacContent(container.id),
          container.id === canonical.module.id,
          `${container.id}: module availability`,
        );
      }
    }
    if (cat.id === "ciaac")
      assert.equal(
        hasAvailableCiaacContent(subj.id),
        subj.id === subject.id,
        `${subj.id}: subject availability`,
      );
  }
}
assert.equal(availableCiaac, 5);
assert.ok(unchangedNonCiaac > 0, "Existing non-CIAAC paths remain available");
assert.equal(hasAvailableCiaacContent("ciaac"), true);
assert.equal(isLearningPathAvailable("ciaac/unknown/module/placeholder"), false);
assert.equal(isLearningPathAvailable(`${canonical.module.id}/not-reviewed-6`), false);
assert.equal(hasAvailableCiaacContent("ciaac/aerodinamica/modulo-10"), false);
assert.equal(hasAvailableCiaacContent("linea-aerea"), true);

// Placeholder content is guarded at the store boundary too, including direct
// URLs and stale/forged completion data. No placeholder may earn completion FP.
const database = new Map();
let completedRows = [];
const completionCalls = [];
const navigation = loader({
  "./db": {
    read: (key, fallback) => database.get(key) ?? fallback,
    update: (key, fallback, update) => database.set(key, update(database.get(key) ?? fallback)),
    nowISO: () => "2026-10-04T00:00:00.000Z",
  },
  "./domain": {
    getTemaProgress: () => completedRows,
    completeTema: (...args) => completionCalls.push(args),
  },
  "./gating": { isPaid: (user) => user.paid },
})(file("src/lib/store/lp-nav.ts"));
const user = { id: "ciaac-regression-user", paid: true };
const placeholder = subject.containers
  .flatMap((container) => container.learningPaths)
  .find((item) => !ids.includes(item.id));
assert.ok(placeholder, "The taxonomy still includes later, unavailable CIAAC lessons");
assert.equal(navigation.lpAccess(user, subject, ids[0]).allowed, true);
assert.equal(navigation.lpAccess(user, subject, ids[1]).lock, "previo");
assert.equal(navigation.lpAccess(null, subject, ids[0]).allowed, false);
completedRows = [{ temaId: `lp:${ids[0]}`, completado: true }];
assert.equal(navigation.lpAccess(user, subject, ids[1]).allowed, true);
assert.equal(navigation.lpAccess({ ...user, paid: false }, subject, ids[1]).lock, "plan");
completedRows = ids.map((id) => ({ temaId: `lp:${id}`, completado: true }));
assert.equal(navigation.subjectContinue(user.id, subject), null, "Stop after the reviewed module");
assert.equal(navigation.lpAccess(user, subject, placeholder.id).lock, "contenido");
assert.equal(navigation.lpAccess(user, subject, placeholder.id).allowed, false);
completedRows.push({ temaId: `lp:${placeholder.id}`, completado: true });
assert.equal(
  navigation.lpAccess(user, subject, placeholder.id).allowed,
  false,
  "Stale completion cannot unlock missing content",
);
navigation.startLp(user.id, placeholder.id);
navigation.completeLp(user.id, placeholder, subject.titulo);
assert.equal(database.has("lp_started"), false, "No placeholder start is persisted");
assert.equal(completionCalls.length, 0, "No placeholder completion/reward is persisted");
navigation.startLp(user.id, ids[0]);
navigation.startLp(user.id, ids[0]);
assert.equal(database.get("lp_started").length, 1, "A reviewed path is started once");
navigation.completeLp(user.id, moduleOne.learningPaths[0], subject.titulo);
assert.equal(completionCalls.length, 1);
assert.equal(completionCalls[0][1], `lp:${ids[0]}`, "Existing progress identity is retained");

// Execute the real renderer with an in-memory JSX tree and hook state. These
// assertions cover content/gates without requiring a DOM or mocking source copy.
let hookIndex = 0;
let initialPatch = {};
let renderedState;
const element = (type, props) => ({ type, props: props ?? {} });
const fragment = Symbol("Fragment");
const { HandbookLearningPath } = loader({
  react: {
    useState: (initial) => {
      const index = hookIndex++;
      const value = typeof initial === "function" ? initial() : initial;
      if (index === 0) renderedState = { ...value, ...initialPatch };
      return [
        index === 0 ? renderedState : value,
        (next) => {
          if (index === 0) renderedState = typeof next === "function" ? next(renderedState) : next;
        },
      ];
    },
    useEffect: () => {},
    useMemo: (factory) => factory(),
  },
  "react/jsx-runtime": { jsx: element, jsxs: element, Fragment: fragment },
  "./CiaacTeachingVisual": { CiaacTeachingVisual: () => null },
  "./LearningPathCharacters": { LearningPathYarisAvatar: () => null },
  "@/lib/store/lp-journey": {
    getLpJourney: () => null,
    resetLpJourney: () => {},
    saveLpJourney: () => {},
  },
  "@/components/lp/LearningPathExperience": { useLearningPathStageView: () => {} },
})(file("src/components/lp/HandbookLearningPath.tsx"));

function materialize(node) {
  if (Array.isArray(node)) return node.map(materialize);
  if (node === null || node === undefined || typeof node === "boolean") return null;
  if (typeof node !== "object") return node;
  if (typeof node.type === "function") return materialize(node.type(node.props));
  return { ...node, props: { ...node.props, children: materialize(node.props.children) } };
}

function nodes(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((child) => nodes(child, predicate));
  if (!node || typeof node !== "object") return [];
  return [...(predicate(node) ? [node] : []), ...nodes(node.props.children, predicate)];
}

function textContent(node) {
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  if (node.type === "style") return "";
  return textContent(node.props.children);
}

function render(document, patch = {}, onComplete = () => {}) {
  hookIndex = 0;
  initialPatch = patch;
  return materialize(
    HandbookLearningPath({
      document,
      userId: user.id,
      lpId: ids[document.number - 1],
      completed: false,
      onComplete,
    }),
  );
}

function advanceButton(tree) {
  const footer = nodes(
    tree,
    (node) => node.type === "footer" && node.props.className === "hb-footer",
  );
  const result = nodes(
    footer,
    (node) => node.type === "button" && node.props.className === "is-primary",
  );
  assert.equal(result.length, 1, "One primary progression action");
  return result[0];
}

for (const id of ids) {
  const document = CIAAC_LEARNING_PATHS[id];
  const intro = render(document);
  assert.equal(
    renderedState.checks.length,
    document.completionChecks.length,
    `${id}: initial check state`,
  );
  const source = nodes(
    intro,
    (node) => node.type === "details" && textContent(node).includes("Fuentes y alcance"),
  );
  assert.equal(source.length, 1, id);
  assert.deepEqual(
    nodes(source, (node) => node.type === "a").map((node) => node.props.href),
    document.sources.filter((entry) => entry.url).map((entry) => entry.url),
  );
  const sourceText = textContent(source);
  for (const reference of document.sources) {
    assert.ok(sourceText.includes(reference.title), `${id}: visible source title`);
    assert.ok(sourceText.includes(reference.role), `${id}: visible source role`);
    if (reference.limit)
      assert.ok(sourceText.includes(reference.limit), `${id}: visible source limit`);
  }
  assert.doesNotMatch(
    sourceText,
    /página PDF\s*(?:null|0|undefined)/,
    `${id}: no invented pagination`,
  );
  if (document.number === 1)
    assert.doesNotMatch(
      sourceText,
      /Pilot’s Handbook|FAA-H-8083-25C/,
      "No fallback PHAK attribution for OACI definitions",
    );

  const finishIndex = document.stages.length - 1;
  let completed = 0;
  const finish = render(document, { stage: finishIndex, maxStage: finishIndex }, () => {
    completed += 1;
  });
  const checkButtons = nodes(
    finish,
    (node) => node.type === "section" && node.props.className === "hb-card hb-checks",
  ).flatMap((section) => nodes(section, (node) => node.type === "button"));
  assert.deepEqual(
    checkButtons.map(textContent),
    document.completionChecks,
    `${id}: authored finish statements render`,
  );
  assert.equal(advanceButton(finish).props.disabled, true, `${id}: unchecked finish is gated`);
  advanceButton(finish).props.onClick();
  assert.equal(completed, 0, `${id}: disabled finish cannot complete programmatically`);
  const readyFinish = render(
    document,
    {
      stage: finishIndex,
      maxStage: finishIndex,
      checks: document.completionChecks.map(() => true),
    },
    () => {
      completed += 1;
    },
  );
  assert.equal(advanceButton(readyFinish).props.disabled, false, `${id}: all checks unlock finish`);
  advanceButton(readyFinish).props.onClick();
  assert.equal(completed, 1, `${id}: finish delegates normal completion`);

  const diagnosticIndex = document.stages.findIndex(
    (stage) => stage.kind === "quiz" && stage.diagnostic,
  );
  const wrong = (document.questions[0].correct + 1) % document.questions[0].options.length;
  assert.equal(
    advanceButton(render(document, { stage: diagnosticIndex })).props.disabled,
    true,
    `${id}: diagnostic needs an attempt`,
  );
  assert.equal(
    advanceButton(render(document, { stage: diagnosticIndex, answers: { 0: wrong } })).props
      .disabled,
    false,
    `${id}: diagnostic accepts an initial misconception`,
  );

  for (const stage of document.stages.filter((stage) => stage.kind === "activity")) {
    const index = document.stages.indexOf(stage);
    const activity = document.ciaac.activities[stage.activityIndex];
    assert.equal(
      advanceButton(render(document, { stage: index })).props.disabled,
      true,
      `${id}: ${activity.title} requires work`,
    );
    const answers = Object.fromEntries(
      (activity.runtimeMapping.questions ?? []).map((questionIndex) => [
        questionIndex,
        document.questions[questionIndex].correct,
      ]),
    );
    const progress = {
      responses:
        activity.kind === "fill_blank"
          ? activity.items
          : activity.kind === "calculation"
            ? ["20"]
            : ["Mi explicación razonada del caso."],
      revealed: true,
      reflected: true,
    };
    const ready = render(document, {
      stage: index,
      answers,
      exerciseDone: true,
      activityResponses: { [stage.activityIndex]: progress },
    });
    assert.equal(
      advanceButton(ready).props.disabled,
      false,
      `${id}: ${activity.title} can be completed`,
    );
  }
}

const density = CIAAC_LEARNING_PATHS[ids[4]];
assert.equal(
  advanceButton(
    render(density, { stage: density.stages.length - 1, checks: [true, true, true, false] }),
  ).props.disabled,
  true,
  "Density needs its fourth mastery check",
);

const { ciaacResponseReady, emptyCiaacActivity } = load(file("src/lib/lp/ciaac-progress.ts"));
const fillBlank = canonical.lessons[0].activities.find(
  (activity) => activity.kind === "fill_blank",
);
assert.equal(
  ciaacResponseReady(fillBlank, {
    ...emptyCiaacActivity(),
    responses: [" AIRE ", "moverse", "palas"],
  }),
  true,
);
assert.equal(
  ciaacResponseReady(fillBlank, { ...emptyCiaacActivity(), responses: ["aire", "volar", "palas"] }),
  false,
);
const calculation = canonical.lessons[3].activities.find(
  (activity) => activity.kind === "calculation",
);
for (const response of ["", " ", "0", "80", "100", "texto"]) {
  assert.equal(
    ciaacResponseReady(calculation, { ...emptyCiaacActivity(), responses: [response] }),
    false,
    `Reject calculation response ${JSON.stringify(response)}`,
  );
}
const shortAnswer = canonical.lessons[0].activities.find(
  (activity) => activity.kind === "short_answer",
);
assert.equal(
  ciaacResponseReady(shortAnswer, { responses: [" "], revealed: true, reflected: true }),
  false,
);
assert.equal(
  ciaacResponseReady(shortAnswer, { responses: ["Explicación"], revealed: false, reflected: true }),
  false,
);
assert.equal(
  ciaacResponseReady(shortAnswer, { responses: ["Explicación"], revealed: true, reflected: false }),
  false,
);
assert.equal(
  ciaacResponseReady(shortAnswer, { responses: ["Explicación"], revealed: true, reflected: true }),
  true,
);

console.log(
  `PASS: 5 CIAAC paths; 53 cards, 39 questions and 18 activities preserved; public-data privacy, sources, nullable pages, stage mappings, activity/mastery gates and placeholder guards verified; ${unchangedNonCiaac} non-CIAAC paths unchanged.`,
);
