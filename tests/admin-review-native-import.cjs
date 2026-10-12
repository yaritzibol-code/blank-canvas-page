const assert = require("node:assert/strict");
const React = require("react");
const { JSDOM } = require("jsdom");
const { loader, file } = require("./helpers/ts-loader.cjs");
const { makePacket, candidateId, publishedId } = require("./fixtures/admin-review-synthetic.cjs");
const dom = new JSDOM('<div id="root"></div>', {
  url: "https://example.test/admin/revision-learning-paths",
});
Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  DOMParser: dom.window.DOMParser,
  XMLSerializer: dom.window.XMLSerializer,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = require("react-dom/client");
const forbidden = [];
const load = loader({
  "@/lib/store/lp-journey": {
    getLpJourney: () => forbidden.push("read"),
    saveLpJourney: () => forbidden.push("save"),
    resetLpJourney: () => forbidden.push("reset"),
  },
  "@/lib/store": new Proxy(
    {},
    {
      get: (_target, key) => {
        throw Error(`Forbidden store access ${String(key)}`);
      },
    },
  ),
  "@/components/shared/ReportProblemModal": {
    ReportProblemModal: () => {
      throw Error("Report form must not mount");
    },
  },
});
for (const method of ["setItem", "removeItem", "clear"])
  Object.getPrototypeOf(window.localStorage)[method] = () => forbidden.push(method);
global.fetch = () => {
  throw Error("Native private renderer must not fetch");
};
const { validateReviewPacket, materializeReviewPacket } = load(
  file("src/lib/lp/admin-review-packet.ts"),
);
const { AdminReviewLearningPath } = load(file("src/components/lp/AdminReviewLearningPath.tsx"));
const raw = makePacket();
raw.documents[candidateId].stages[1].cards.push(
  {
    title: "Second independently visible card",
    text: "Second entire explanation without a teaching board.",
    covers: [],
  },
  {
    title: "Third independently visible card",
    text: "Third entire explanation without a teaching board.",
    covers: [],
  },
);
raw.documents[candidateId].exerciseFigures = [raw.documents[candidateId].figures[0]];
const materialized = materializeReviewPacket(
  validateReviewPacket(JSON.stringify(raw), new Set([publishedId])),
);
const selected = {
  item: {
    id: candidateId,
    title: raw.catalog[1].title,
    category: "CIAAC",
    subject: "Synthetic",
    chapter: "Synthetic",
    renderer: "approved-aircraft",
  },
  document: materialized.documents[candidateId],
};
let exits = 0,
  root;
const stages = () => [...document.querySelectorAll(".lp-study-desktop-stages button")];
const click = async (element) => {
  assert.ok(element && !element.disabled);
  await React.act(() => element.click());
};
const named = (text) =>
  [...document.querySelectorAll("button")].find((button) => button.textContent.includes(text));
(async () => {
  root = createRoot(document.getElementById("root"));
  await React.act(() =>
    root.render(React.createElement(AdminReviewLearningPath, { selected, onExit: () => exits++ })),
  );
  assert.equal(stages().length, 5);
  assert.ok(stages().every((button) => !button.disabled));
  await click(stages()[1]);
  for (const card of raw.documents[candidateId].stages[1].cards) {
    assert.ok(document.body.textContent.includes(card.title));
    assert.ok(document.body.textContent.includes(card.text));
  }
  assert.equal(
    document.querySelector(".am-illustration img").getAttribute("src"),
    materialized.documents[candidateId].figures[0].file,
  );
  await click(named("Ampliar ilustración"));
  assert.ok(document.querySelector('[role="dialog"]'));
  assert.ok(document.querySelector('[role="dialog"] img').src.startsWith("blob:"));
  await click(document.querySelector('[role="dialog"] button'));
  assert.equal(document.querySelector('[role="dialog"]'), null);
  await click(stages()[2]);
  await click(document.querySelectorAll(".hb-options button")[1]);
  assert.match(document.body.textContent, /Aún no/);
  await click(document.querySelector(".hb-options button"));
  assert.match(document.body.textContent, /Correcto/);
  await click(stages()[3]);
  assert.ok(document.querySelector(".am-recognition-grid img").src.startsWith("blob:"));
  const pairs = document.querySelectorAll(".hb-pair-grid > div");
  await click(pairs[0].querySelector("button"));
  await click(
    [...pairs[1].querySelectorAll("button")].find((b) => b.textContent.includes("Four sides")),
  );
  assert.ok(document.querySelector(".hb-pair-grid button.is-paired"));
  await click(stages()[4]);
  await click(document.querySelector(".hb-checks button"));
  await click(named("Salir de la revisión"));
  assert.equal(exits, 1);
  await click(named("Limpiar prueba local"));
  assert.equal(
    document.querySelector('.lp-study-desktop-stages button[aria-current="step"]'),
    stages()[0],
  );
  assert.deepEqual(forbidden, []);
  console.log(
    "PASS imported native review: approved renderer generic fallback shows all unboarded cards; every stage/exercise accessible, quiz retry, exercise matching/figure, Blob zoom/close, reset/finish, zero progress/reward/storage/network actions.",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (root) await React.act(() => root.unmount());
    materialized.dispose();
  });
