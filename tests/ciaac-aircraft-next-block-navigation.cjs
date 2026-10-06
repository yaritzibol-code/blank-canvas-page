// Scoped next-block route regression; in-memory account/progress only.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const ts = require("typescript");
const { JSDOM } = require("jsdom");
const repo = path.resolve(__dirname, "..");
const dom = new JSDOM('<div id="root"></div>', { url: "https://example.test" });
Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Event: dom.window.Event,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = require("react-dom/client");
let failCompletion = false;
let saved = null,
  done = [],
  awards = 0,
  navigations = [],
  view,
  params,
  version = 0;
let user = { id: "completion-qa", plan: "pro" };
const listeners = new Set();
const notify = () => {
  version++;
  listeners.forEach((f) => f());
};
const stubs = {
  "@/lib/store/db": { read: () => [], update: () => {}, nowISO: () => "" },
  "@/lib/store/domain": {
    getTemaProgress: () => done.map((id) => ({ temaId: "lp:" + id, completado: true })),
    completeTema: (_u, id) => {
      if (failCompletion) throw Error("save failed");
      done.push(id.slice(3));
      awards++;
      notify();
    },
  },
  "@/lib/store/gating": { isPaid: (u) => u.plan === "pro" },
  "@/lib/store": {
    useSessionUser: () => user,
    useStore: (f) => {
      React.useSyncExternalStore(
        (cb) => {
          listeners.add(cb);
          return () => listeners.delete(cb);
        },
        () => version,
      );
      return f();
    },
  },
  "@/lib/store/lp-journey": {
    getLpJourney: () => saved,
    saveLpJourney: (_u, _l, s) => {
      saved = structuredClone(s);
    },
    resetLpJourney: () => {
      saved = null;
    },
  },
  "@/components/lp/LearningPathExperience": {
    useLearningPathStageView: (s) => {
      view = s;
    },
    LearningPathExperience: ({ children }) => React.createElement("div", null, children),
  },
  "@tanstack/react-router": {
    createFileRoute: () => (config) => ({ ...config, useParams: () => params }),
    useNavigate: () => (p) => navigations.push(p),
    Navigate: () => null,
    Link: () => null,
  },
  "@/components/shared/YarisChatModal": { YarisChatModal: () => null },
  "@/lib/lp/contextual-return": {
    rememberLearningPathOrigin: () => {},
    learningPathOrigin: () => null,
    leaveLearningPath: () => {},
  },
};
const cache = {};
function load(file) {
  if (file.endsWith(".css")) return {};
  if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file, "utf8"));
  if (cache[file]) return cache[file].exports;
  const mod = { exports: {} };
  cache[file] = mod;
  const js = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (name) => {
    if (stubs[name]) return stubs[name];
    if (!name.startsWith("@/") && !name.startsWith(".")) return require(name);
    const base = name.startsWith("@/")
      ? path.join(repo, "src", name.slice(2))
      : path.resolve(path.dirname(file), name);
    const alias = "@/" + path.relative(path.join(repo, "src"), base);
    if (stubs[alias]) return stubs[alias];
    return load(
      [base, base + ".ts", base + ".tsx", base + ".json"].find(
        (f) => fs.existsSync(f) && fs.statSync(f).isFile(),
      ),
    );
  };
  vm.runInThisContext("(function(require,module,exports){" + js + "\n})", { filename: file })(
    localRequire,
    mod,
    mod.exports,
  );
  return mod.exports;
}
const taxonomy = load(path.join(repo, "src/lib/lp/taxonomy.ts"));
const subject = taxonomy.lpSubject("ciaac", "aeronaves-y-motores");
const sequence = taxonomy.subjectSequence(subject).map((s) => s.item);
const docs = load(path.join(repo, "src/lib/lp/ciaac-content.ts")).CIAAC_LEARNING_PATHS;
const Route = load(
  path.join(repo, "src/routes/dashboard/rutas/$categoria.$materia.$contenedor.$lp.tsx"),
).Route;
let root;
async function mount(index, { completed = false, restore = null, plan = "pro", gap = false } = {}) {
  if (root) await React.act(() => root.unmount());
  document.body.innerHTML = '<div id="root"></div>';
  const item = sequence[index],
    doc = docs[item.id];
  const [categoria, materia, contenedor, lp] = item.id.split("/");
  params = { categoria, materia, contenedor, lp };
  user = { id: "completion-qa", plan };
  done = sequence.slice(0, index + (completed ? 1 : 0)).map((i) => i.id);
  if (gap) done = done.filter((id) => id !== sequence[0].id);
  saved = restore ?? {
    version:
      index < 5
        ? index === 0
          ? "ciaac-aircraft-handbook-v1"
          : "ciaac-module-one-handbook-" + doc.number + "-v1"
        : `ciaac-aerodynamics-${doc.chapter}-${doc.number}-v1`,
    stage: doc.stages.length - 1,
    maxStage: doc.stages.length - 1,
    checks: [true, true, true],
    answers: {},
    exercise: { pairs: {}, sequence: [], visited: [], tokens: [], values: {}, feedback: "" },
    activityResponses: {},
    complete: completed,
  };
  // Actual migration establishes the version first, then open the authorized finish.
  awards = 0;
  navigations = [];
  root = createRoot(document.getElementById("root"));
  await React.act(() => root.render(React.createElement(Route.component)));
  if (saved.stage !== doc.stages.length - 1) {
    const hydrated = {
      ...saved,
      stage: doc.stages.length - 1,
      maxStage: doc.stages.length - 1,
      checks: [true, true, true],
    };
    await React.act(() => root.unmount());
    document.body.innerHTML = '<div id="root"></div>';
    saved = hydrated;
    root = createRoot(document.getElementById("root"));
    await React.act(() => root.render(React.createElement(Route.component)));
  }
}
const primary = () => document.querySelector(".hb-actions .is-primary");
const click = async () => {
  assert.equal(primary().disabled, false);
  await React.act(() => primary().click());
};
(async () => {
  for (const index of [10, 11, 12, 13, 14, 15, 16, 17]) {
    await mount(index);
    assert.match(primary().textContent, /Completar Learning Path/);
    await React.act(() => {
      primary().click();
      primary().click();
    });
    assert.equal(awards, 1, "one completion despite double click");
    assert.match(primary().textContent, /Continuar al siguiente/);
    await click();
    assert.equal(navigations.at(-1).params.lp, sequence[index + 1].id.split("/")[3]);
    const resume = structuredClone(saved);
    await mount(index, { completed: true, restore: resume });
    await click();
    assert.equal(awards, 0, "refresh does not award");
    await React.act(() => view.onNavigate(0));
    await click();
    assert.equal(saved.stage, 1, "completed review can advance");
    assert.equal(awards, 0);
  }
  await mount(10);
  failCompletion = true;
  await click();
  assert.equal(awards, 0);
  assert.match(document.querySelector('[role="alert"]').textContent, /Inténtalo/);
  assert.match(primary().textContent, /Completar Learning Path/);
  failCompletion = false;
  await click();
  assert.equal(awards, 1);
  user.plan = "basica";
  await click();
  assert.equal(navigations.at(-1).params.lp, undefined, "click-time access recheck");
  await mount(18, { completed: true });
  assert.equal(primary().textContent, "Volver al módulo");
  await click();
  assert.equal(navigations[0].to, "/dashboard/rutas/$categoria/$materia/$contenedor");
  await mount(0, { completed: true, plan: "basica" });
  assert.equal(primary().textContent, "Volver al módulo");
  await click();
  assert.equal(navigations[0].params.lp, undefined);
  await mount(10, { completed: true, gap: true });
  assert.equal(primary().textContent, "Volver al módulo");
  await click();
  assert.equal(navigations[0].params.lp, undefined);
  await React.act(() => root.unmount());
  console.log(
    "PASS real ReactDOM (not browser): AM11–AM19 route rendering, exact next IDs, AM19 return, plan/sequence gates, double-click award, refresh and completed review.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
