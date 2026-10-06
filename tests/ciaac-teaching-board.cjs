const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { JSDOM } = require("jsdom");

// Real React components and pure publication checks; no browser, network, account,
// progress fixture, source writes, or lesson explanation substitutions.
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(filename) {
  if (filename.endsWith(".css")) return {};
  if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = { exports: {} };
  cache.set(filename, mod);
  const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (request) => {
    if (!request.startsWith(".") && !request.startsWith("@/")) return require(request);
    const base = request.startsWith("@/")
      ? path.join(root, "src", request.slice(2))
      : path.resolve(path.dirname(filename), request);
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find(
      (name) => fs.existsSync(name) && fs.statSync(name).isFile(),
    );
    assert.ok(resolved, `Unresolved ${request}`);
    return load(resolved);
  };
  vm.runInThisContext(`(function(require, module, exports) {${js}\n})`, { filename })(
    localRequire,
    mod,
    mod.exports,
  );
  return mod.exports;
}
const pureFile = path.join(root, "src/lib/lp/ciaac-aircraft-approved/teaching-board.ts");
const { validateApprovedAircraftTeachingBoard: validate, toBoardPoint } = load(pureFile);
assert.doesNotMatch(fs.readFileSync(pureFile, "utf8"), /from ["']react|\.css["']/);
const { ApprovedAircraftTeachingBoard: Board } = load(
  path.join(root, "src/components/lp/ApprovedAircraftTeachingBoard.tsx"),
);
const card = (title, index) => ({
  title,
  text: `Texto original breve ${index}.`,
  detailText: `Explicación original completa ${index}.\nSe conserva su redacción.`,
  covers: [index],
});
const figure = (number) => ({
  number,
  chapter: 1,
  topic: 1,
  anchor: 0,
  pdf_page: 1,
  file: `/canonical-${number}.webp`,
  alt: `Ilustración original ${number}`,
  observe: `Observa la figura ${number}.`,
  caption: `Fuente original ${number}`,
  assetAspectRatio: 1.5,
});
const comparison = {
  kind: "content",
  title: "Disposición de cilindros",
  nav: "Compara",
  cards: [card("En línea", 0), card("En V", 1), card("Aplicación", 2)],
  figures: [figure("A"), figure("B")],
};
const comparisonBoard = {
  kind: "comparison",
  panels: [
    { title: "Cilindros en línea", figureNumber: "A", cardIndexes: [0, 2] },
    { title: "Cilindros en V", figureNumber: "B", cardIndexes: [1] },
  ],
};
const crop = { x: 20, y: 10, width: 40, height: 60, assetAspectRatio: 1.5 };
comparison.figures[1].crop = crop;
const mechanism = {
  kind: "content",
  title: "Componentes del motor",
  nav: "Localiza",
  cards: [card("Pistón", 0), card("Cilindro", 1), card("Cigüeñal", 2)],
  figures: [{ ...figure("M"), crop }],
};
const mechanismBoard = {
  kind: "mechanism",
  figureNumber: "M",
  parts: [
    { cardIndex: 0, x: 40, y: 40 },
    { cardIndex: 1, x: 20, y: 10 },
    { cardIndex: 2, x: 60, y: 70 },
  ],
};
const originals = JSON.stringify({ comparison, comparisonBoard, mechanism, mechanismBoard });
assert.deepEqual(validate(comparison, comparisonBoard), []);
assert.deepEqual(validate(mechanism, mechanismBoard), []);
assert.deepEqual(toBoardPoint({ x: 40, y: 40 }, crop), { x: 50, y: 50 });
assert.deepEqual(toBoardPoint({ x: 20, y: 10 }, crop), { x: 0, y: 0 });
assert.deepEqual(toBoardPoint({ x: 60, y: 70 }, crop), { x: 100, y: 100 });
assert.deepEqual(toBoardPoint({ x: 22, y: 77 }), { x: 22, y: 77 });

let invalidCount = 0;
const invalid = (stage, board, message) => {
  const errors = validate(stage, board);
  assert.ok(errors.length, message);
  invalidCount++;
};
for (const config of [
  null,
  {},
  [],
  { kind: "tabs" },
  { kind: "comparison" },
  { kind: "comparison", panels: [null, 1] },
  { kind: "mechanism", figureNumber: "M", parts: [null] },
])
  invalid(comparison, config, "Malformed metadata fails closed");
for (const indexes of [[0, 0], [0], [0, 3], [0, -1], [0, 0.5], [0, "2"], []]) {
  const config = structuredClone(comparisonBoard);
  config.panels[0].cardIndexes = indexes;
  invalid(comparison, config, "Every source card must appear once by integer index");
}
for (const number of ["missing", "A"]) {
  const config = structuredClone(comparisonBoard);
  config.panels[1].figureNumber = number;
  invalid(comparison, config, "Missing or repeated source figure");
}
invalid(
  { ...comparison, figures: [...comparison.figures, figure("C")] },
  comparisonBoard,
  "Unmapped figures cannot disappear",
);
invalid(
  { ...comparison, figures: [figure("A"), figure("A")] },
  comparisonBoard,
  "Duplicate canonical figure numbers",
);
invalid(
  comparison,
  { ...comparisonBoard, panels: [comparisonBoard.panels[0]] },
  "A comparison needs simultaneous categories",
);
invalid(
  comparison,
  {
    ...comparisonBoard,
    panels: [{ ...comparisonBoard.panels[0], title: " " }, comparisonBoard.panels[1]],
  },
  "Readable panel label",
);
for (const x of [-1, 101, NaN, Infinity, "40", 10]) {
  const config = structuredClone(mechanismBoard);
  config.parts[0].x = x;
  invalid(mechanism, config, "Anchors must be original-asset percentages inside the reviewed crop");
}
for (const badCrop of [
  null,
  {},
  { ...crop, width: 0 },
  { ...crop, height: -1 },
  { ...crop, x: 90 },
  { ...crop, assetAspectRatio: 0 },
]) {
  invalid(
    { ...mechanism, figures: [{ ...mechanism.figures[0], crop: badCrop }] },
    mechanismBoard,
    "Invalid crop cannot misplace an anchor",
  );
}
for (const ratio of [undefined, 0, NaN, -1, Number.MAX_VALUE]) {
  invalid(
    {
      ...mechanism,
      figures: [{ ...mechanism.figures[0], crop: undefined, assetAspectRatio: ratio }],
    },
    mechanismBoard,
    "A bounded master needs valid asset geometry",
  );
}
for (const badCrop of [
  { ...crop, width: Number.MIN_VALUE },
  { ...crop, height: Number.MIN_VALUE },
  { ...crop, assetAspectRatio: Number.MAX_VALUE },
]) {
  invalid(
    { ...mechanism, figures: [{ ...mechanism.figures[0], crop: badCrop }] },
    mechanismBoard,
    "Derived crop geometry must not overflow or underflow",
  );
}
assert.ok(
  renderToStaticMarkup(
    React.createElement(Board, { stage: comparison, board: comparisonBoard }),
  ).includes("Cilindros en V"),
  "SSR keeps every category",
);

const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: "https://example.test/" });
Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = require("react-dom/client");
const reactRoot = createRoot(document.getElementById("root"));
const zooms = [];
const render = async (stage, board) =>
  React.act(() =>
    reactRoot.render(
      React.createElement(Board, { stage, board, onZoom: (value) => zooms.push(value) }),
    ),
  );
const click = async (element) => React.act(() => element.click());
const key = async (element, value) =>
  React.act(() =>
    element.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }),
    ),
  );
const verifySourceCards = (stage) => {
  const cards = [...document.querySelectorAll("[data-card-index]")];
  assert.equal(cards.length, stage.cards.length);
  assert.equal(new Set(cards.map((item) => item.dataset.cardIndex)).size, stage.cards.length);
  for (const item of cards) {
    const source = stage.cards[Number(item.dataset.cardIndex)];
    assert.equal(item.querySelector(":scope > p").textContent, source.text);
    if (source.detailText) {
      assert.equal(item.querySelector("details p").textContent, source.detailText);
      assert.equal(
        item.querySelector("details").open,
        false,
        "Full explanation stays a native, initially closed disclosure",
      );
    } else assert.equal(item.querySelector("details"), null);
    const heading =
      item.querySelector("h3") ?? document.getElementById(item.getAttribute("aria-labelledby"));
    assert.ok(heading?.textContent.includes(source.title));
    assert.equal(
      item.closest("[hidden], [aria-hidden=true]"),
      null,
      "The card is not concealed behind a selector",
    );
  }
};

(async () => {
  try {
    await render(comparison, comparisonBoard);
    const panels = [...document.querySelectorAll(".am-board__panel")];
    assert.equal(panels.length, 2);
    assert.deepEqual(
      panels.map((panel) => panel.querySelector(".am-board__panel-title").textContent),
      ["Cilindros en línea", "Cilindros en V"],
    );
    assert.deepEqual(
      panels.map((panel) => panel.querySelector("img").getAttribute("src")),
      comparison.figures.map((item) => item.file),
    );
    assert.deepEqual(
      panels.map((panel) =>
        [...panel.querySelectorAll("[data-card-index]")].map((item) =>
          Number(item.dataset.cardIndex),
        ),
      ),
      [[0, 2], [1]],
    );
    assert.equal(
      document.querySelector('[role="tab"], [role="tabpanel"], [hidden]'),
      null,
      "No category carousel, tab, or concealed comparison",
    );
    assert.ok(
      document
        .querySelector('[role="group"]')
        .getAttribute("aria-label")
        .includes(comparison.title),
    );
    verifySourceCards(comparison);
    await click(panels[1].querySelector(".am-illustration__head button"));
    assert.equal(
      zooms.at(-1),
      comparison.figures[1],
      "Zoom gets the exact canonical figure, including crop",
    );
    assert.equal(zooms.at(-1).crop, crop);
    verifySourceCards(comparison);

    await render(mechanism, mechanismBoard);
    verifySourceCards(mechanism);
    assert.equal(
      document.querySelectorAll("img").length,
      1,
      "One detailed master rather than a separate decorative diagram",
    );
    const canvas = document.querySelector(".am-board__canvas");
    const ratio = canvas.style.aspectRatio.split("/").map(Number);
    assert.equal(ratio[0] / (ratio[1] ?? 1), 1);
    assert.ok(
      renderToStaticMarkup(
        React.createElement(Board, { stage: mechanism, board: mechanismBoard }),
      ).includes("width:min(100%, 44vh, 28rem)"),
      "SSR retains bounded CSS; jsdom does not parse CSS min() widths",
    );
    const image = canvas.querySelector("img");
    assert.equal(image.style.width, "250%");
    assert.equal(image.style.left, "-50%");
    assert.ok(Math.abs(parseFloat(image.style.top) + 100 / 6) < 1e-9);
    const imageState = image.outerHTML;
    const anchors = [...document.querySelectorAll(".am-board__anchor")];
    const selectors = [...document.querySelectorAll(".am-board__part-select")];
    assert.deepEqual(
      anchors.map((item) => [item.style.left, item.style.top]),
      [
        ["50%", "50%"],
        ["0%", "0%"],
        ["100%", "100%"],
      ],
    );
    for (const [index, anchor] of anchors.entries()) {
      assert.equal(anchor.tagName, "BUTTON");
      assert.equal(anchor.type, "button");
      assert.ok(anchor.getAttribute("aria-label").includes(mechanism.cards[index].title));
      assert.equal(
        document.getElementById(anchor.getAttribute("aria-controls")).dataset.cardIndex,
        String(index),
      );
      assert.equal(document.getElementById(selectors[index].getAttribute("aria-controls")), anchor);
    }
    const selected = (index) => {
      assert.deepEqual(
        anchors.map((item) => item.getAttribute("aria-pressed")),
        anchors.map((_, current) => String(current === index)),
      );
      assert.deepEqual(
        selectors.map((item) => item.getAttribute("aria-pressed")),
        selectors.map((_, current) => String(current === index)),
      );
      assert.equal(document.querySelectorAll(".am-board__card.is-selected").length, 1);
      assert.ok(
        document
          .querySelector('[role="status"]')
          .textContent.includes(mechanism.cards[index].title),
      );
      verifySourceCards(mechanism);
      assert.equal(
        image.outerHTML,
        imageState,
        "Selection changes the annotation only; baked physical parts do not move",
      );
    };
    selected(0);
    await click(selectors[1]);
    selected(1);
    selectors[1].focus();
    await key(selectors[1], "ArrowDown");
    selected(2);
    assert.equal(document.activeElement, selectors[2]);
    await key(selectors[2], "ArrowRight");
    selected(0);
    await key(selectors[0], "End");
    selected(2);
    await key(selectors[2], "Home");
    selected(0);
    await click(anchors[1]);
    selected(1);
    anchors[1].focus();
    await key(anchors[1], "ArrowUp");
    selected(0);
    assert.equal(document.activeElement, anchors[0]);
    await key(anchors[0], "ArrowLeft");
    selected(2);
    await key(anchors[2], "Home");
    selected(0);
    await key(anchors[0], "End");
    selected(2);
    assert.doesNotMatch(
      document.querySelector(".am-board").textContent,
      /animaci[oó]n|simulaci[oó]n|reproducir|play|gira al seleccionar/i,
    );
    assert.equal(
      document.querySelector('[role="dialog"], .hb-actions, .hb-progress'),
      null,
      "The board does not own zoom, navigation, or progress",
    );
    await click(document.querySelector(".am-board__master-head button"));
    assert.equal(zooms.at(-1), mechanism.figures[0]);
    assert.equal(zooms.at(-1).crop, crop);
    const explanation = document.querySelector(".am-board__card details");
    await click(explanation.querySelector("summary"));
    assert.equal(explanation.open, true, "Native disclosure opens the exact full explanation");
    await click(selectors[1]);
    assert.equal(explanation.open, true, "Locating another part does not collapse an explanation");
    await click(explanation.querySelector("summary"));
    assert.equal(explanation.open, false);

    const uncropped = {
      ...mechanism,
      title: "Otro mecanismo",
      figures: [{ ...mechanism.figures[0], crop: undefined, assetAspectRatio: 2 }],
    };
    await render(uncropped, mechanismBoard);
    assert.ok(
      renderToStaticMarkup(
        React.createElement(Board, { stage: uncropped, board: mechanismBoard }),
      ).includes("width:min(100%, 88vh, 56rem)"),
    );
    assert.equal(document.querySelector(".am-board__anchor").style.left, "40%");
    assert.equal(document.querySelector(".am-board__anchor").style.top, "40%");
    assert.equal(document.querySelector("img").getAttribute("style"), null);

    await render(comparison, {
      ...comparisonBoard,
      panels: [{ ...comparisonBoard.panels[0], cardIndexes: [0, 0] }, comparisonBoard.panels[1]],
    });
    assert.ok(document.querySelector("[data-board-fallback=true]"));
    assert.equal(document.querySelectorAll("img").length, comparison.figures.length);
    verifySourceCards(comparison);
    assert.equal(
      JSON.stringify({ comparison, comparisonBoard, mechanism, mechanismBoard }),
      originals,
      "Rendering never mutates lesson explanations, figure geometry, or mappings",
    );

    for (const [sourceStage, sourceBoard] of [
      [comparison, comparisonBoard],
      [mechanism, mechanismBoard],
    ]) {
      const stage = {
        ...sourceStage,
        cards: [...sourceStage.cards, card("Nota de terminología compartida", 3)],
      };
      const board = { ...sourceBoard, noteCardIndexes: [3] };
      assert.deepEqual(validate(stage, board), []);
      for (const indexes of [undefined, [], [0, 3], [3, 3], [4], [-1], ["3"], "3"]) {
        invalid(
          stage,
          { ...board, noteCardIndexes: indexes },
          "Shared notes reject duplicate, missing, malformed, or orphan source indexes",
        );
      }
      await render(stage, board);
      verifySourceCards(stage);
      const notes = document.querySelector(".am-board__notes");
      assert.equal(notes.getAttribute("aria-label"), "Notas del tema");
      assert.deepEqual(
        [...notes.querySelectorAll("[data-card-index]")].map((item) => item.dataset.cardIndex),
        ["3"],
      );
      assert.equal(
        notes.closest(".am-board__panel, .am-board__master, .am-board__functions"),
        null,
        "A common terminology note never implies a category/component association",
      );
      assert.ok(
        document
          .querySelector(".am-board__comparison-grid, .am-board__mechanism-layout")
          .compareDocumentPosition(notes) & window.Node.DOCUMENT_POSITION_FOLLOWING,
      );
      assert.equal(notes.querySelector(".am-board__part-select, .am-board__anchor, img"), null);
    }

    const tripleStage = {
      ...comparison,
      figures: [...comparison.figures, figure("C")],
      cards: [...comparison.cards, card("Tercera categoría", 3)],
    };
    const tripleBoard = {
      ...comparisonBoard,
      panels: [
        ...comparisonBoard.panels,
        { title: "Tercera categoría", figureNumber: "C", cardIndexes: [3] },
      ],
    };
    assert.deepEqual(validate(tripleStage, tripleBoard), []);
    await render(tripleStage, tripleBoard);
    assert.equal(
      document.querySelectorAll(".am-board__panel").length,
      3,
      "All three categories render concurrently; grid CSS handles available width",
    );
    verifySourceCards(tripleStage);

    const authored = JSON.parse(
      fs.readFileSync(path.join(root, "src/lib/lp/ciaac-aircraft-approved/documents.json"), "utf8"),
    );
    const [am10Id, am10] = Object.entries(authored).find(([id]) => id.includes("/am10-"));
    const actualBoards = am10.stages.filter((stage) => stage.kind === "content" && stage.board);
    assert.equal(
      actualBoards.length,
      3,
      "AM10 has two mechanism boards and a simultaneous comparison",
    );
    assert.deepEqual(
      actualBoards.map((stage) => stage.board.kind),
      ["mechanism", "mechanism", "comparison"],
    );
    const [am07Id, am07] = Object.entries(authored).find(([id]) => id.includes("/am07-"));
    const combustionBoards = am07.stages.filter((stage) => stage.kind === "content" && stage.board);
    assert.equal(combustionBoards.length, 2);
    assert.deepEqual(
      combustionBoards.map((stage) => stage.board.panels.length),
      [3, 2],
    );
    assert.deepEqual(
      combustionBoards.map((stage) => stage.board.noteCardIndexes.length),
      [1, 2],
    );
    const remainingDocuments = Object.entries(authored).filter(([id]) => /\/am0[689]-/.test(id));
    const remainingBoards = remainingDocuments.flatMap(([, doc]) =>
      doc.stages.filter((stage) => stage.kind === "content" && stage.board),
    );
    for (const stage of [...actualBoards, ...combustionBoards, ...remainingBoards]) {
      assert.deepEqual(validate(stage, stage.board), [], stage.title);
      await render(stage, stage.board);
      verifySourceCards(stage);
      assert.equal(document.querySelector("[data-board-fallback]"), null);
      if (stage.board.kind === "mechanism") {
        const master = stage.figures[0];
        const actualImage = document.querySelector(".am-board__canvas img");
        assert.equal(actualImage.getAttribute("src"), master.file);
        if (master.crop) {
          assert.ok(
            Math.abs(parseFloat(actualImage.style.width) - 10000 / master.crop.width) < 1e-8,
          );
          assert.ok(
            Math.abs(
              parseFloat(actualImage.style.top) - (-master.crop.y / master.crop.height) * 100,
            ) < 1e-8,
          );
        }
        const actualAnchors = [...document.querySelectorAll(".am-board__anchor")];
        assert.equal(actualAnchors.length, stage.board.parts.length);
        actualAnchors.forEach((anchor, index) => {
          const point = toBoardPoint(stage.board.parts[index], master.crop);
          assert.ok(Math.abs(parseFloat(anchor.style.left) - point.x) < 1e-8);
          assert.ok(Math.abs(parseFloat(anchor.style.top) - point.y) < 1e-8);
        });
        const originalImage = actualImage.outerHTML;
        await click(
          document.querySelectorAll(".am-board__part-select")[stage.board.parts.length - 1],
        );
        assert.equal(actualAnchors.at(-1).getAttribute("aria-pressed"), "true");
        assert.equal(actualImage.outerHTML, originalImage);
        verifySourceCards(stage);
        await click(document.querySelector(".am-board__master-head button"));
        assert.equal(zooms.at(-1), master);
        assert.equal(zooms.at(-1).crop, master.crop);
      } else {
        const actualPanels = [...document.querySelectorAll(".am-board__panel")];
        assert.equal(actualPanels.length, stage.board.panels.length);
        for (const [index, panel] of actualPanels.entries()) {
          const config = stage.board.panels[index];
          const canonical = stage.figures.find((item) => item.number === config.figureNumber);
          assert.equal(panel.querySelector("img").getAttribute("src"), canonical.file);
          const displayRatio = canonical.crop
            ? (canonical.crop.assetAspectRatio * canonical.crop.width) / canonical.crop.height
            : canonical.assetAspectRatio;
          assert.equal(
            panel.style.getPropertyValue("--board-figure-width"),
            `min(100%, ${28 * displayRatio}vh, ${18 * displayRatio}rem)`,
            "Each comparison image retains its canonical crop ratio with the compact 28vh bound",
          );
          assert.equal(
            panel.querySelectorAll("h3").length,
            1,
            "Matching category and card headings are not repeated",
          );
          await click(panel.querySelector(".am-illustration__head button"));
          assert.equal(zooms.at(-1), canonical);
          assert.equal(zooms.at(-1).crop, canonical.crop);
          assert.equal(
            document.querySelectorAll(".am-board__panel").length,
            stage.board.panels.length,
          );
        }
      }
    }
    const productionContent = load(
      path.join(root, "src/lib/lp/ciaac-aircraft-approved/content.ts"),
    );
    assert.equal(
      productionContent.APPROVED_AIRCRAFT_READY_IDS.length,
      10,
      "Only the two explicitly reviewed five-lesson blocks are available",
    );
    assert.ok(productionContent.APPROVED_AIRCRAFT_READY_IDS.includes(am10Id));
    assert.ok(productionContent.APPROVED_AIRCRAFT_READY_IDS.includes(am07Id));
    for (const [id] of remainingDocuments)
      assert.ok(productionContent.APPROVED_AIRCRAFT_READY_IDS.includes(id));
    const releasedReviews = JSON.parse(
      fs.readFileSync(
        path.join(root, "src/lib/lp/ciaac-aircraft-approved/publication-review.json"),
        "utf8",
      ),
    );
    assert.equal(
      Object.keys(
        productionContent.collectReadyApprovedAircraftDocuments(
          authored,
          releasedReviews.slice(0, 5),
        ),
      ).length,
      5,
      "Source files and board UI alone never publish an unreviewed lesson",
    );

    const [am09Id, am09] = remainingDocuments.find(([id]) => id.includes("/am09-"));
    const catalog = JSON.parse(
      fs.readFileSync(path.join(root, "src/lib/lp/ciaac-aircraft-approved/catalog.json"), "utf8"),
    );
    const review = {
      id: am09Id,
      curriculumVersion: catalog.curriculumVersion,
      notebooklmExplanationSha256: "a".repeat(64),
      scopeReviewed: true,
      visualsReviewed: true,
      assessmentReviewed: true,
    };
    const collect = (doc) =>
      productionContent.collectReadyApprovedAircraftDocuments({ [am09Id]: doc }, [review]);
    assert.ok(collect(am09)[am09Id]);
    for (const mutate of [
      (d, s) => {
        s.propellerDiagram = "unknown";
      },
      (d, s) => {
        delete s.propellerDiagram;
      },
      (d, s) => {
        d.number = 8;
      },
      (d, s) => {
        s.board = {
          kind: "mechanism",
          figureNumber: s.figures[0].number,
          parts: s.cards.map((_, cardIndex) => ({ cardIndex, x: 50, y: 50 })),
        };
      },
      (d, s) => {
        s.figures[0].crop = { x: 0, y: 0, width: 100, height: 100, assetAspectRatio: 1.5 };
      },
      (d, s) => {
        s.figures[0].assetAspectRatio = 1.4;
      },
      (d, s) => {
        s.figures[0].file = "/another-propeller.webp";
      },
    ]) {
      const doc = structuredClone(am09),
        stage = doc.stages.find((s) => s.propellerDiagram);
      mutate(doc, stage);
      doc.figures = doc.figures.map((f) =>
        f.number === stage.figures[0].number ? structuredClone(stage.figures[0]) : f,
      );
      assert.deepEqual(
        Object.keys(collect(doc)),
        [],
        "Native propeller stages reject mismatched mode, document, geometry, image or ambiguous layout metadata",
      );
    }

    const assetManifest = JSON.parse(
      fs.readFileSync(
        path.join(root, "public/ciaac-approved/engine-systems/asset-manifest.json"),
        "utf8",
      ),
    );
    for (const asset of assetManifest.assets) {
      const bytes = fs.readFileSync(path.join(root, "public", asset.file.replace(/^\//, "")));
      assert.equal(bytes.length, asset.bytes);
      assert.equal(
        require("node:crypto").createHash("sha256").update(bytes).digest("hex"),
        asset.sha256,
      );
      if (asset.file.endsWith(".webp")) {
        assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
        assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
      } else {
        assert.ok(asset.file.endsWith(".svg"));
        const svg = bytes.toString("utf8");
        assert.match(svg, /<svg\s/);
        assert.ok(svg.includes(`width="${asset.width}"`));
        assert.ok(svg.includes(`height="${asset.height}"`));
        assert.doesNotMatch(svg, /<script|<foreignObject|(?:xlink:)?href\s*=/i);
      }
      for (const doc of [am07, am10, ...remainingDocuments.map(([, doc]) => doc)])
        for (const figure of doc.figures.filter((f) => f.file === asset.file)) {
          assert.ok(Math.abs(figure.assetAspectRatio - asset.width / asset.height) < 1e-8);
        }
    }

    const css = fs.readFileSync(
      path.join(root, "src/components/lp/ciaac-aircraft-teaching-board.css"),
      "utf8",
    );
    assert.match(css, /max-height:\s*44vh/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(css, /\[data-motion="reduced"\]/);
    assert.match(css, /repeat\(auto-fit,\s*minmax\(min\(100%,/);
    assert.match(css, /@media\s*\(max-width:\s*300px\)/);
    assert.match(css, /max-height:\s*28vh/);
    assert.match(css, /max\(9\.375rem,/);
    assert.match(css, /calc\(\(100% - 1\.3rem\) \/ 3\)/);
    assert.doesNotMatch(css, /line-clamp|text-overflow:\s*ellipsis|@keyframes/);
    console.log(
      `PASS: concurrent comparison panels and exact source pairing, independent shared source notes in both modes, static master/keyboard selection, ${invalidCount} invalid mappings/geometry cases, 7 native-diagram guard cases, crop math, canonical zoom, disclosure preservation, SSR and safe fallback; all ${actualBoards.length + combustionBoards.length + remainingBoards.length} actual AM06–AM10 boards, verified runtime asset hashes, no duplicate category headings, production 10 reviewed and unreviewed content still blocked. Responsive CSS inspected; pixel layout not browser-verified.`,
    );
  } finally {
    await React.act(() => reactRoot.unmount());
    dom.window.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
