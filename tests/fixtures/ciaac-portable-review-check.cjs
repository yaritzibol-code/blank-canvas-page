/** Focused non-browser tests of the generated classic bundle and isolation. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { JSDOM, VirtualConsole } = require("jsdom");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname, "../..");
const out = path.resolve(root, "../ciaac-review-package");
const html = fs.readFileSync(path.join(out, "ABRIR-REVISION.html"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(out, "verification-manifest.json"), "utf8"));
const catalog = require(path.join(root, "src/lib/lp/ciaac-aircraft-approved/catalog.json"));
const docs = require(path.join(root, "src/lib/lp/ciaac-aircraft-approved/documents.json"));
const prefix = "ciaac_review_am06_am10_v1:";
const dummy = "ciaac-approved-local-review-only";
const errors = [];
const network = [];
const storageCalls = [];
const pause = () => new Promise((resolve) => setTimeout(resolve, 12));

assert.match(html, /connect-src 'none'/);
assert.match(html, /font-src data:/);
assert.doesNotMatch(html, /<script[^>]+(?:src=|type=["']module)/);
assert.doesNotMatch(html, /\bfp_db_/);
assert.doesNotMatch(html, /\bcompleteLp\b|createClient\(|supabase\.co/);
assert.deepEqual(
  manifest.lessonDocuments.map((lesson) => lesson.code),
  ["AM06", "AM07", "AM08", "AM09", "AM10"],
);
for (const required of [
  "LearningPathExperience.tsx",
  "CiaacApprovedAircraftLearningPath.tsx",
  "HandbookLearningPath.tsx",
  "ApprovedAircraftTeachingBoard.tsx",
  "ApprovedPropellerDiagram.tsx",
  "ciaac-review-journey-stub.ts",
  "ciaac-portable-review-report-stub.tsx",
])
  assert.ok(
    manifest.sourceModules.some((id) => id.endsWith(required)),
    `Native/safe module included: ${required}`,
  );
for (const forbidden of [
  /^src\/lib\/store\//,
  /^src\/routes\//,
  /supabase/i,
  /ReportProblemModal.tsx$/,
])
  assert.ok(
    !manifest.sourceModules.some((id) => forbidden.test(id)),
    `Forbidden graph dependency: ${forbidden}`,
  );
for (const item of manifest.files) {
  const bytes = fs.readFileSync(path.join(out, item.path));
  assert.equal(bytes.length, item.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), item.sha256);
}
const localImages = new Set(manifest.files.map((entry) => entry.path));
for (const match of html.matchAll(/["'`]\.\/(ciaac-approved\/[^"'`\s]+\.(?:webp|svg|png))/g))
  assert.ok(localImages.has(match[1]), `Image is packaged: ${match[1]}`);
assert.ok(manifest.embeddedFonts.length > 0);

// Verify the stub itself cannot address a real user or a different lesson, and tolerates denied storage.
const compiled = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, "ciaac-review-journey-stub.ts"), "utf8"),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  },
).outputText;
const stubModule = { exports: {} };
const isolated = {
  module: stubModule,
  exports: stubModule.exports,
  require: () => catalog,
  window: {
    get sessionStorage() {
      throw new Error("Simulated blocked storage");
    },
  },
};
vm.runInNewContext(compiled, isolated);
const stub = stubModule.exports;
const firstId = catalog.lessons[5].id;
assert.throws(() => stub.saveLpJourney("real-user", firstId, {}), /dummy/);
assert.throws(() => stub.getLpJourney(dummy, catalog.lessons[0].id), /dummy/);
stub.saveLpJourney(dummy, firstId, { stage: 2 });
assert.equal(stub.getLpJourney(dummy, firstId).stage, 2);
stub.resetLpJourney(dummy, firstId);
assert.equal(stub.getLpJourney(dummy, firstId), null);

async function boot(code, restored = {}, fileMode = false) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => {
    if (!/Could not parse CSS stylesheet/.test(error.message)) errors.push(error.message);
  });
  const dom = new JSDOM(html, {
    url: fileMode
      ? `file:///offline-review/ABRIR-REVISION.html#${code}`
      : `https://offline-review.invalid/ABRIR-REVISION.html#${code}`,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.confirm = () => true;
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollTo = function () {
        this.scrollTop = 0;
      };
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("Forbidden persistent account storage access");
        },
      });
      for (const [key, value] of Object.entries(restored))
        window.sessionStorage.setItem(key, value);
      let storage;
      try {
        storage = window.sessionStorage;
      } catch {
        /* Opaque file origin: memory fallback is tested below. */
      }
      for (const name of ["getItem", "setItem", "removeItem"]) {
        const original = window.Storage.prototype[name];
        window.Storage.prototype[name] = function (key, ...args) {
          if (this === storage) {
            storageCalls.push([name, key]);
            assert.ok(key.startsWith(prefix), `Only dummy namespace: ${key}`);
          }
          return original.call(this, key, ...args);
        };
      }
      window.Storage.prototype.clear = () => {
        throw new Error("Forbidden broad storage clear");
      };
      window.fetch = (...args) => {
        network.push(["fetch", args]);
        throw new Error("Network forbidden");
      };
      window.XMLHttpRequest = function () {
        network.push(["xhr"]);
        throw new Error("Network forbidden");
      };
      window.WebSocket = function () {
        network.push(["ws"]);
        throw new Error("Network forbidden");
      };
      window.navigator.sendBeacon = (...args) => {
        network.push(["beacon", args]);
        return false;
      };
    },
  });
  for (let i = 0; i < 80 && !dom.window.document.querySelector(".hb-shell"); i++) await pause();
  await pause();
  return dom;
}
function buttons(dom, selector = "button") {
  return [...dom.window.document.querySelectorAll(selector)];
}
function named(dom, text, within) {
  const candidates = [...(within || dom.window.document).querySelectorAll("button")].filter(
    (button) => button.textContent.trim() === text,
  );
  assert.equal(candidates.length, 1, `Exactly one button ${text}`);
  return candidates[0];
}
async function click(button) {
  assert.ok(!button.disabled, `Button enabled: ${button.textContent}`);
  button.click();
  await pause();
}
function saved(dom, id) {
  return JSON.parse(dom.window.sessionStorage.getItem(prefix + encodeURIComponent(id)));
}
function snapshot(dom) {
  const result = {};
  for (let index = 0; index < dom.window.sessionStorage.length; index++) {
    const key = dom.window.sessionStorage.key(index);
    result[key] = dom.window.sessionStorage.getItem(key);
  }
  return result;
}
async function reload(dom, code) {
  const state = snapshot(dom);
  dom.window.close();
  return boot(code, state);
}

(async () => {
  let completedLessons = 0,
    zoomCount = 0,
    selectorCount = 0;
  for (const lesson of catalog.lessons.slice(5, 10)) {
    const doc = docs[lesson.id];
    let dom = await boot(lesson.code);
    assert.ok(dom.window.document.querySelector(".review-banner"));
    assert.equal(saved(dom, lesson.id).stage, 0);
    assert.ok(
      buttons(dom, ".lp-study-stage").filter((button) => button.disabled).length > 0,
      "Native stage gates retained",
    );
    await click(named(dom, "Iniciar recorrido"));
    for (let index = 1; index < doc.stages.length - 1; index++) {
      assert.equal(saved(dom, lesson.id).stage, index);
      const stage = doc.stages[index];
      if (stage.kind === "content") {
        for (const image of dom.window.document.querySelectorAll(".hb-content img")) {
          const src = image.getAttribute("src");
          assert.ok(src.startsWith("./"), `Offline image path: ${src}`);
          assert.ok(fs.existsSync(path.join(out, src)), `Packaged image exists: ${src}`);
        }
        const zooms = buttons(dom).filter(
          (button) => button.textContent.trim() === "Ampliar ilustración",
        );
        for (const zoom of zooms) {
          await click(zoom);
          const modal = dom.window.document.querySelector(".hb-modal");
          assert.ok(modal);
          const src = modal.querySelector("img").getAttribute("src");
          assert.ok(fs.existsSync(path.join(out, src)));
          await click(named(dom, "Cerrar ×", modal));
          assert.equal(dom.window.document.querySelector(".hb-modal"), null);
          zoomCount++;
        }
        for (const button of buttons(
          dom,
          ".am-board__part-select,.am-board__anchor,.am-propeller__selectors button",
        )) {
          await click(button);
          assert.equal(button.getAttribute("aria-pressed"), "true");
          selectorCount++;
        }
      }
      if (stage.kind === "quiz") {
        assert.equal(named(dom, "Continuar").disabled, true);
        for (const qIndex of stage.questions) {
          const question = doc.questions[qIndex];
          const group = [...dom.window.document.querySelectorAll('[role="group"]')].find(
            (element) => element.getAttribute("aria-label") === question.prompt,
          );
          assert.ok(group);
          const choices = [...group.querySelectorAll("button")];
          await click(choices[(question.correct + 1) % choices.length]);
          assert.equal(named(dom, "Continuar").disabled, true, "Wrong answer cannot advance");
          await click(choices[question.correct]);
        }
      }
      assert.equal(named(dom, "Continuar").disabled, false);
      dom = await reload(dom, lesson.code);
      assert.equal(saved(dom, lesson.id).stage, index, "Reload resumes the dummy lesson");
      if (index > 1) {
        await click(named(dom, "Anterior"));
        assert.equal(saved(dom, lesson.id).stage, index - 1);
        await click(named(dom, "Continuar"));
        assert.equal(saved(dom, lesson.id).stage, index);
      }
      await click(named(dom, "Continuar"));
    }
    assert.equal(named(dom, "Completar Learning Path").disabled, true);
    for (const check of buttons(dom, ".hb-checks button")) await click(check);
    await click(named(dom, "Completar Learning Path"));
    assert.equal(saved(dom, lesson.id).complete, true);
    assert.equal(named(dom, "Completado").disabled, true, "Repeated completion disabled");
    assert.equal(
      dom.window.document.querySelector('[data-testid="completion-status"]').textContent,
      "complete",
    );
    dom = await reload(dom, lesson.code);
    assert.equal(saved(dom, lesson.id).complete, true);
    assert.equal(
      dom.window.document.querySelector('[data-testid="completion-status"]').textContent,
      "incomplete",
      "Reload does not re-call the local completion callback",
    );
    await click(named(dom, "Reportar contenido"));
    assert.ok(dom.window.document.querySelector(".review-dialog"));
    assert.equal(dom.window.document.querySelector(".review-dialog textarea"), null);
    await click(named(dom, "Cerrar", dom.window.document.querySelector(".review-dialog")));
    await click(named(dom, "Pregúntale a Yaris"));
    assert.match(
      dom.window.document.querySelector(".review-banner").textContent,
      /Yaris está desactivada/,
    );
    await click(named(dom, "← Regresar a Learning Paths"));
    assert.ok(dom.window.document.querySelector(".review-selector"));
    await click(named(dom, `${lesson.code} · ${lesson.title}`));
    assert.equal(
      saved(dom, lesson.id).complete,
      true,
      "Return from selector preserves dummy progress",
    );
    dom.window.history.back();
    await pause();
    await pause();
    assert.ok(
      dom.window.document.querySelector(".review-selector"),
      "Browser Back restores selector fragment",
    );
    dom.window.history.forward();
    await pause();
    await pause();
    assert.ok(
      dom.window.document.querySelector(".hb-shell"),
      "Browser Forward restores lesson fragment",
    );
    assert.equal(
      saved(dom, lesson.id).complete,
      true,
      "History navigation preserves dummy completion",
    );
    await click(named(dom, "Borrar solo esta revisión"));
    assert.equal(saved(dom, lesson.id).stage, 0);
    assert.equal(saved(dom, lesson.id).complete, false);
    dom.window.close();
    completedLessons++;
  }
  const fileDom = await boot("AM06", {}, true);
  assert.ok(
    fileDom.window.document.querySelector(".hb-hero"),
    "Classic script starts under a file URL",
  );
  await click(named(fileDom, "Iniciar recorrido"));
  assert.ok(
    fileDom.window.document.querySelector(".hb-heading"),
    "Memory fallback supports native lesson interaction",
  );
  await click(named(fileDom, "← Regresar a Learning Paths"));
  await click(named(fileDom, `${catalog.lessons[5].code} · ${catalog.lessons[5].title}`));
  assert.ok(
    fileDom.window.document.querySelector(".hb-heading"),
    "File-origin memory fallback resumes after selector navigation",
  );
  fileDom.window.close();
  assert.equal(network.length, 0, "No network API attempts");
  assert.equal(errors.length, 0, errors.join("\n"));
  assert.ok(storageCalls.length > 0);
  const result = {
    status: "PASS",
    scope: "Non-browser jsdom execution of the packaged production IIFE",
    completedLessons,
    zoomCount,
    selectorCount,
    storageCalls: storageCalls.length,
    networkAttempts: network.length,
    browserQa: "Not performed; Chrome/mobile visual QA remains manual.",
    checkedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(out, "test-results.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
