const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { JSDOM } = require("jsdom");
const { loader, file } = require("./helpers/ts-loader.cjs");
const json = (relative) => JSON.parse(fs.readFileSync(file(relative), "utf8"));
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const hashObject = (value) => sha(JSON.stringify(value));
const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
};
const approved = "src/lib/lp/ciaac-operations-approved/";
const catalog = json(`${approved}catalog.json`);
const docs = json(`${approved}documents.json`);
const reviews = json(`${approved}publication-review.json`);
const baseline = json("tests/fixtures/ciaac-operations-public-baseline.json");
const ids = catalog.lessons.map((lesson) => lesson.id);
const readyIds = ids.slice(0, 5);
const unavailableIds = ids.slice(5);
const load = loader();
const content = load(file(`${approved}content.ts`));
const collect = content.collectReadyApprovedOperationsDocuments;
const availability = load(file("src/lib/lp/ciaac-availability.ts"));
const registry = load(file("src/lib/lp/ciaac-content.ts")).CIAAC_LEARNING_PATHS;
const taxonomy = load(file("src/lib/lp/taxonomy.ts"));
const subject = taxonomy.lpSubject("ciaac", "operaciones-aeronauticas");
const raw = json("src/lib/lp/taxonomy.json");
const oldSubject = raw.categories
  .find((c) => c.id === "ciaac")
  .subjects.find((s) => s.id === catalog.subjectId);
const legacyItems = oldSubject.containers.flatMap((container) => container.learningPaths);
const reviewPayload = load(file("src/lib/lp/admin-review.server.ts")).learningPathReviewPayload;

assert.deepEqual(
  catalog.lessons.map((x) => x.code),
  Array.from({ length: 12 }, (_, i) => `OP${String(i + 1).padStart(2, "0")}`),
);
assert.deepEqual(
  catalog.lessons.map((x) => x.order),
  Array.from({ length: 12 }, (_, i) => i + 1),
);
for (const lesson of catalog.lessons)
  assert.deepEqual(Object.keys(lesson), ["code", "id", "title", "order"]);
assert.deepEqual(Object.keys(docs), readyIds, "Only five reviewed documents ship");
assert.deepEqual(
  reviews.map((review) => review.id),
  readyIds,
  "No unaudited review records ship",
);
assert.equal(content.APPROVED_OPERATIONS_ACTIVE, true);
assert.deepEqual(content.APPROVED_OPERATIONS_READY_IDS, readyIds);
assert.deepEqual(Object.keys(collect(docs, reviews)), readyIds);
for (const review of reviews) {
  for (const field of ["scopeReviewed", "visualsReviewed", "assessmentReviewed"])
    assert.equal(review[field], true);
  assert.match(review.reviewScope, /historical teaching scope/);
  assert.match(review.reviewScope, /QA remain pending/);
}
assert.deepEqual(collect(docs, []), {});
const withoutFirstReview = loader({
  "./publication-review.json": reviews.filter((review) => review.id !== ids[0]),
  "../ciaac-aircraft-approved/content": load(file("src/lib/lp/ciaac-aircraft-approved/content.ts")),
})(file(`${approved}content.ts`));
assert.equal(withoutFirstReview.APPROVED_OPERATIONS_ACTIVE, false);
assert.deepEqual(withoutFirstReview.APPROVED_OPERATIONS_READY_IDS, []);
assert.deepEqual(
  withoutFirstReview.APPROVED_OPERATIONS_CONTENT,
  {},
  "OP01 activation stays mandatory",
);
assert.deepEqual(collect(docs, [...reviews, ...reviews]), {});
for (const key of ["scopeReviewed", "visualsReviewed", "assessmentReviewed"])
  assert.deepEqual(
    collect(
      docs,
      reviews.map((review) => ({ ...review, [key]: false })),
    ),
    {},
  );
for (const override of [
  { curriculumVersion: "invalid" },
  { notebooklmExplanationSha256: "invalid" },
])
  assert.deepEqual(
    collect(
      docs,
      reviews.map((review) => ({ ...review, ...override })),
    ),
    {},
  );
for (const id of readyIds) {
  for (const mutate of [
    (doc) => {
      doc.title += " changed";
    },
    (doc) => {
      delete doc.exercise;
    },
    (doc) => {
      doc.stages.find((stage) => stage.kind === "content").figures[0].alt += " changed";
    },
  ]) {
    const broken = structuredClone(docs);
    mutate(broken[id]);
    assert.equal(
      collect(broken, reviews)[id],
      undefined,
      "Structural validator remains fail closed",
    );
  }
}
for (const id of ids) {
  const ready = readyIds.includes(id);
  assert.equal(availability.isLearningPathAvailable(id), ready);
  assert.equal(Boolean(registry[id]), ready);
  assert.equal(Boolean(reviewPayload(id)), ready);
  if (ready) assert.equal(reviewPayload(id).selected.item.renderer, "approved-aircraft");
}
assert.equal(availability.CIAAC_AVAILABLE_IDS.length, baseline.baselineAvailableCount + 5);
assert.equal(reviewPayload(null).items.length, baseline.baselineReviewCount + 5);
const existingIds = availability.CIAAC_AVAILABLE_IDS.filter((id) => !readyIds.includes(id));
assert.equal(
  hashObject(existingIds),
  baseline.baselineIdsSha256,
  "All 113 prior IDs remain in order",
);
assert.equal(
  hashObject(Object.keys(registry).filter((id) => !readyIds.includes(id))),
  baseline.baselineIdsSha256,
);
assert.deepEqual(
  taxonomy.subjectSequence(subject).map(({ item }) => item.id),
  ids,
);
assert.equal(taxonomy.subjectLpCount(subject), 12);
assert.deepEqual(taxonomy.legacyOperationsSubject(), oldSubject);
for (const item of legacyItems) {
  const found = taxonomy.findLp(item.id);
  assert.ok(found, "Legacy URLs still resolve");
  assert.deepEqual(found.item, item);
  assert.deepEqual(found.subject, oldSubject);
  assert.ok(!ids.includes(item.id));
}
const categoriesWithoutOverlay = taxonomy.LP_CATEGORIES.map((category) =>
  category.id === "ciaac"
    ? {
        ...category,
        subjects: category.subjects.map((s) => (s.id === catalog.subjectId ? oldSubject : s)),
      }
    : category,
);
assert.equal(
  hashObject(categoriesWithoutOverlay),
  baseline.baselineCategoriesSha256,
  "Every previous subject is preserved",
);

let completedIds = [],
  paid = true;
const navStubs = {
  "./db": { read: () => [], update: () => assert.fail("No store writes"), nowISO: () => "test" },
  "./domain": {
    getTemaProgress: () => completedIds.map((id) => ({ temaId: `lp:${id}`, completado: true })),
    completeTema: () => assert.fail("No progress mutation"),
  },
  "./gating": { isPaid: () => paid },
};
const nav = loader(navStubs)(file("src/lib/store/lp-nav.ts"));
const user = { id: "public-integration-test" };
assert.equal(nav.lpAccess(null, subject, ids[0]).allowed, false);
for (let i = 0; i < 5; i++) {
  completedIds = ids.slice(0, i);
  assert.equal(nav.lpAccess(user, subject, ids[i]).allowed, true);
  assert.equal(nav.subjectContinue(user.id, subject).id, ids[i]);
  if (i < 4) assert.equal(nav.lpAccess(user, subject, ids[i + 1]).lock, "previo");
}
completedIds = readyIds;
assert.equal(nav.subjectContinue(user.id, subject), null, "Continuation stops at OP06");
for (const id of unavailableIds) assert.equal(nav.lpAccess(user, subject, id).lock, "contenido");
completedIds = ids;
for (const id of unavailableIds)
  assert.equal(
    nav.lpAccess(user, subject, id).allowed,
    false,
    "Even stale completion cannot open missing content",
  );
completedIds = [ids[0]];
paid = false;
assert.equal(nav.lpAccess(user, subject, ids[0]).allowed, true);
assert.equal(nav.lpAccess(user, subject, ids[1]).lock, "plan");
assert.equal(nav.lpAccess(user, subject, ids[2]).lock, "previo");
completedIds = [];
assert.equal(nav.lpAccess(user, subject, ids[0]).allowed, true);
paid = true;
completedIds = legacyItems.map((item) => item.id);
assert.equal(nav.subjectProgress(user.id, subject).done, 0, "Legacy credit is not reassigned");
assert.equal(nav.subjectContinue(user.id, subject).id, ids[0]);
const gapContent = {
  ...content,
  APPROVED_OPERATIONS_READY_IDS: readyIds.filter((id) => id !== ids[1]),
};
completedIds = [ids[0]];
const gapNav = loader({ ...navStubs, "./ciaac-operations-approved/content": gapContent })(
  file("src/lib/store/lp-nav.ts"),
);
assert.equal(gapNav.lpAccess(user, subject, ids[1]).lock, "contenido");
assert.equal(gapNav.lpAccess(user, subject, ids[2]).lock, "previo");
assert.equal(gapNav.subjectContinue(user.id, subject), null);
const inactiveTaxonomy = loader({
  "./ciaac-operations-approved/content": { ...content, APPROVED_OPERATIONS_ACTIVE: false },
})(file("src/lib/lp/taxonomy.ts"));
assert.deepEqual(inactiveTaxonomy.lpSubject("ciaac", "operaciones-aeronauticas"), oldSubject);
assert.equal(inactiveTaxonomy.legacyOperationsSubject(), undefined);

const assets = new Set();
const visit = (value) => {
  if (Array.isArray(value)) value.forEach(visit);
  else if (value && typeof value === "object")
    for (const [key, child] of Object.entries(value)) {
      if (key === "file" && typeof child === "string") assets.add(`public${child}`);
      visit(child);
    }
};
visit(docs);
assert.equal(assets.size, 23);
assert.deepEqual(
  [...assets].sort(),
  Object.keys(baseline.operationsAssets).sort(),
  "Exact reviewed SVG closure",
);
const walk = (dir) =>
  fs
    .readdirSync(file(dir), { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`],
    );
assert.deepEqual(walk("public/ciaac-approved/op").sort(), [...assets].sort());
for (const [relative, hash] of Object.entries(baseline.operationsAssets)) {
  const bytes = fs.readFileSync(file(relative));
  assert.equal(sha(bytes), hash);
  const svg = bytes.toString("utf8");
  assert.match(svg, /<svg\b/);
  assert.doesNotMatch(svg, /\bFORMAR\b/);
  assert.doesNotMatch(svg, /<image\b|<script\b|data:image|(?:href|src)=["']https?:/i);
}
const newPayload = JSON.stringify(docs) + JSON.stringify(reviews) + JSON.stringify(catalog);
assert.doesNotMatch(
  newPayload,
  /\/workspace\/|\/tmp\/|library_file_id|sourceDraftId|draftId|graphicsBrief|(?:drive|docs|notebooklm)\.google\./i,
);
assert.doesNotMatch(newPayload, /\bFORMAR\b/);
assert.ok(!newPayload.includes("inherited-candidate-references"));
assert.ok(
  !Object.keys(registry).some((id) => /itinerario-aprobado.*\/nv\d/.test(id)),
  "No NV publication",
);
const basePublic = walk("public")
  .filter((relative) => !assets.has(relative))
  .sort()
  .map((relative) => [relative, sha(fs.readFileSync(file(relative)))]);
assert.equal(basePublic.length, baseline.baselinePublicFilesCount);
assert.equal(
  hashObject(basePublic),
  baseline.baselinePublicFilesSha256,
  "Every existing public asset remains byte-exact",
);
for (const [relative, hash] of Object.entries(baseline.protectedFiles))
  assert.equal(sha(fs.readFileSync(file(relative))), hash, `Preserve ${relative}`);
for (const [relative, hash] of Object.entries(baseline.operationsValidators))
  assert.equal(
    sha(fs.readFileSync(file(`${approved}${relative}`))),
    hash,
    "Operations validators unchanged",
  );

const { ApprovedAircraftTeachingBoard: Board } = load(
  file("src/components/lp/ApprovedAircraftTeachingBoard.tsx"),
);
const { migrateApprovedAircraftJourney: migrate } = load(
  file("src/lib/lp/ciaac-aircraft-approved/journey.ts"),
);
const normalized = (text) => text.replace(/\s+/g, " ").trim();
let boards = 0,
  cards = 0;
for (const [id, doc] of Object.entries(docs)) {
  const expected = baseline.lessons[id];
  assert.equal(
    hashObject(canonical(doc)),
    expected.documentSha256,
    "Exact reviewed teaching document and completion checks",
  );
  assert.equal(doc.contentVersion, expected.contentVersion);
  assert.equal(doc.assessmentVersion ?? null, expected.assessmentVersion);
  assert.equal(
    hashObject(canonical(doc.exercise)),
    expected.exerciseSha256,
    "Original exercise preserved",
  );
  assert.equal(doc.questions.length, 0);
  assert.equal(doc.exercise.kind, "match", "Existing match interaction only");
  const stages = doc.stages.filter((stage) => stage.kind === "content");
  const markup = renderToStaticMarkup(
    React.createElement(
      "main",
      null,
      ...stages.map((stage) =>
        React.createElement(Board, { key: stage.id, stage, board: stage.board, onZoom: () => {} }),
      ),
    ),
  );
  const dom = new JSDOM(markup).window.document;
  const text = normalized(dom.body.textContent);
  for (const stage of stages) {
    boards++;
    for (const card of stage.cards) {
      cards++;
      assert.ok(text.includes(normalized(card.text)), `${id}: full teaching card visible`);
      if (card.detailText) assert.ok(text.includes(normalized(card.detailText)));
    }
  }
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
  const saved = {
    ...state,
    stage: 3,
    maxStage: 3,
    exercise: { ...fresh.exercise, pairs: { 0: 0 } },
  };
  const before = structuredClone(saved);
  const restored = migrate(id, doc, saved, false, fresh, catalog.curriculumVersion);
  assert.equal(restored.stage, 3);
  assert.deepEqual(restored.exercise.pairs, { 0: 0 });
  assert.deepEqual(saved, before, "Restoration does not mutate saved progress");
  const finished = migrate(
    id,
    doc,
    { ...saved, complete: true },
    false,
    fresh,
    catalog.curriculumVersion,
  );
  assert.equal(finished.complete, true);
  assert.deepEqual(migrate(id, doc, finished, false, fresh, catalog.curriculumVersion), finished);
  const legacy = { ...saved, version: "legacy" };
  const migrated = migrate(id, doc, legacy, false, fresh, catalog.curriculumVersion);
  assert.equal(migrated.complete, false);
  assert.equal(migrated.previousJourney, legacy);
}
assert.equal(boards, 40);
assert.equal(cards, 143);
const route = fs.readFileSync(
  file("src/routes/dashboard/rutas/$categoria.$materia.$contenedor.$lp.tsx"),
  "utf8",
);
assert.ok(route.includes("APPROVED_OPERATIONS_READY_IDS.includes(item.id)"));
assert.ok(route.includes("? APPROVED_OPERATIONS_CATALOG.curriculumVersion"));
assert.ok(
  route.indexOf("if (acceso && !acceso.allowed)") <
    route.indexOf("<CiaacApprovedAircraftLearningPath"),
);
console.log(
  JSON.stringify(
    {
      status: "passed",
      reviewed: 5,
      unavailable: 7,
      originalSvgAssets: assets.size,
      boards,
      cards,
      preservedAvailableIds: existingIds.length,
      preservedPublicFiles: basePublic.length,
      legacyUrls: legacyItems.length,
      authenticatedBrowserQA: "pending",
    },
    null,
    2,
  ),
);
