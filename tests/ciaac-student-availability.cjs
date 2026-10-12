// Temporary CIAAC pause: execute the real access helpers and route components.
// Auth/router/persistence are in-memory adapters; no live accounts or writes.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const React = require("react");
const { JSDOM } = require("jsdom");
const { loader, file } = require("./helpers/ts-loader.cjs");
const dom = new JSDOM('<div id="root"></div>', { url: "https://example.test" });
Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = require("react-dom/client");
let user = null;
let settled = true;
let params = {};
let pathname = "/dashboard/rutas";
let child = null;
let outletMounts = 0;
let started = [];
let completed = [];
let writes = [];
let progressReads = 0;
let planReads = 0;
let journeyWrites = 0;
let serverAdmin = false;
let fetchCalls = 0;
let sdkSession = {
  user: { id: "owner" },
  access_token: "valid.session.token",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};
let storeVersion = 0;
const storeListeners = new Set();
const authListeners = new Set();
const touch = () => {
  storeVersion++;
  storeListeners.forEach((listener) => listener());
};
const client = {
  auth: {
    getSession: async () => ({ data: { session: sdkSession }, error: null }),
    onAuthStateChange: (listener) => {
      authListeners.add(listener);
      return { data: { subscription: { unsubscribe: () => authListeners.delete(listener) } } };
    },
  },
};
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  fetchCalls++;
  assert.equal(url, "/api/admin/learning-path-review");
  assert.equal(options.cache, "no-store");
  assert.equal(options.headers.Authorization, `Bearer ${sdkSession.access_token}`);
  return { status: serverAdmin ? 200 : 403, json: async () => ({ items: [], selected: null }) };
};
const auth = { getSessionUser: () => user, isAuthSettled: () => settled };
const stubs = {
  "./auth": auth,
  "@/lib/store/cloud": { supa: () => client },
  "@/lib/store/db": { touch },
  "./db": {
    read: (_key, fallback) => (started.length ? started : fallback),
    update: (key, fallback, update) => {
      writes.push(key);
      started = update(started.length ? started : fallback);
    },
    nowISO: () => "2026-10-12T00:00:00Z",
  },
  "./domain": {
    getTemaProgress: () => {
      progressReads++;
      return completed;
    },
    completeTema: (...args) => writes.push(args),
  },
  "./gating": {
    isPaid: (value) => {
      planReads++;
      return value?.role === "admin" || (value?.plan === "paga" && value.accessStatus === "activo");
    },
  },
  "@/lib/store": {
    ...auth,
    useSessionUser: () => user,
    useStore: (selector) => {
      React.useSyncExternalStore(
        (listener) => {
          storeListeners.add(listener);
          return () => storeListeners.delete(listener);
        },
        () => storeVersion,
      );
      return selector();
    },
  },
  "@tanstack/react-router": {
    createFileRoute: () => (options) => ({ ...options, useParams: () => params }),
    useParams: () => params,
    useLocation: () => ({ pathname }),
    useNavigate: () => () => {},
    Navigate: () => null,
    Outlet: () => {
      outletMounts++;
      return child;
    },
    Link: ({ to, params: values = {}, children, ...props }) =>
      React.createElement(
        "a",
        {
          ...props,
          href: Object.entries(values).reduce(
            (url, [key, value]) => url.replace(`$${key}`, value),
            to,
          ),
        },
        children,
      ),
  },
  "@/components/lp/LearningPathExperience": {
    LearningPathExperience: ({ children }) =>
      React.createElement("div", { "data-lesson": true }, children),
    useLearningPathStageView: () => {},
  },
  "@/components/shared/YarisChatModal": { YarisChatModal: () => null },
  "@/lib/lp/contextual-return": {
    rememberLearningPathOrigin: () => {},
    learningPathOrigin: () => null,
    leaveLearningPath: () => {},
  },
};
for (const name of [
  "CiaacAircraftLearningPath",
  "CiaacModuleOneLearningPath",
  "CiaacAerodynamicsLearningPath",
  "CiaacAircraftEnginesLearningPath",
  "CiaacApprovedAircraftLearningPath",
  "AtpLearningPath",
  "HandbookLearningPath",
  "JeppesenLearningPath",
  "LegislationLearningPath",
]) {
  stubs[`@/components/lp/${name}`] = {
    [name]: () => {
      React.useEffect(() => {
        journeyWrites++;
      }, []);
      return React.createElement("div", { "data-content": name }, "Contenido del recorrido");
    },
  };
}
const load = loader(stubs);
const verification = load(file("src/lib/lp/ciaac-admin-verification.ts"));
const policy = load(file("src/lib/lp/ciaac-student-availability.ts"));
const nav = load(file("src/lib/store/lp-nav.ts"));
const taxonomy = load(file("src/lib/lp/taxonomy.ts"));
const editorial = load(file("src/lib/lp/ciaac-availability.ts"));
const subject = taxonomy.lpSubject("ciaac", "aerodinamica");
const sequence = taxonomy.subjectSequence(subject).map((entry) => entry.item);
const first = sequence[0];
const airline = taxonomy.LP_CATEGORIES.find((category) => category.id === "linea-aerea")
  .subjects[0];
const airlineFirst = taxonomy.subjectSequence(airline)[0].item;
const admin = { id: "owner", role: "admin", plan: "basica", accessStatus: "activo" };
const students = [
  { id: "owner", role: "student", plan: "free", accessStatus: "vencido" },
  { id: "owner", role: "student", plan: "basica", accessStatus: "activo" },
  { id: "owner", role: "student", plan: "paga", accessStatus: "activo" },
  { id: "owner", role: undefined, plan: "paga", accessStatus: "activo" },
  null,
];
assert.equal(policy.CIAAC_STUDENT_ACCESS_PAUSED, true, "Owner pause stays enabled without expiry");
const policySource = fs.readFileSync(file("src/lib/lp/ciaac-student-availability.ts"), "utf8");
assert.doesNotMatch(
  policySource,
  /Date\(|Date\.now|setTimeout|localStorage|process\.env/,
  "No timed or per-device reopening",
);
const snapshots = {
  completed: [{ userId: "owner", temaId: `lp:${first.id}`, completado: true }],
  started: [{ userId: "owner", lpId: first.id }],
};
let roleCases = 0;
(async () => {
  for (const value of students) {
    user = value;
    for (const previous of [[], snapshots.completed]) {
      completed = structuredClone(previous);
      started = structuredClone(snapshots.started);
      writes = [];
      progressReads = planReads = 0;
      for (const categorySubject of taxonomy.LP_CATEGORIES.find((cat) => cat.id === "ciaac")
        .subjects) {
        for (const { item } of taxonomy.subjectSequence(categorySubject)) {
          const access = nav.lpAccess(user, categorySubject, item.id);
          assert.equal(access.allowed, false);
          assert.equal(access.lock, "disponibilidad");
          nav.startLp("owner", item.id);
          nav.completeLp("owner", item, categorySubject.titulo);
          roleCases++;
        }
        assert.equal(nav.subjectContinue("owner", categorySubject), null);
      }
      assert.equal(progressReads, 0, "Pause precedes progress checks");
      assert.equal(planReads, 0, "Paid status cannot bypass the pause");
      assert.deepEqual(
        writes,
        [],
        "Blocked imperative calls never write starts, completions or rewards",
      );
      assert.deepEqual(completed, previous, "Saved completion is untouched");
      assert.deepEqual(started, snapshots.started, "Saved starts are untouched");
      assert.equal(policy.isCiaacStudentAccessPaused(user, "linea-aerea"), false);
      for (const unrelated of ["cuestionarios", "simuladores", "biblioteca", "ciaac-other", ""])
        assert.equal(policy.isCiaacStudentAccessPaused(user, unrelated), false);
      if (user) assert.equal(nav.lpAccess(user, airline, airlineFirst.id).allowed, true);
    }
  }
  user = admin;
  completed = [];
  started = [];
  settled = false;
  assert.equal(
    nav.lpAccess(user, subject, first.id).lock,
    "disponibilidad",
    "Pending stale admin profile fails closed",
  );
  nav.startLp(user.id, first.id);
  nav.completeLp(user.id, first, subject.titulo);
  assert.equal(nav.subjectContinue(user.id, subject), null);
  assert.deepEqual(writes, []);
  settled = true;
  assert.equal(
    nav.lpAccess(user, subject, first.id).allowed,
    false,
    "Editing the local role cannot grant the exception",
  );
  assert.equal(
    await verification.verifyCiaacAdminAccess(user.id),
    false,
    "A server 403 defeats a spoofed admin role",
  );
  nav.startLp(user.id, first.id);
  nav.completeLp(user.id, first, subject.titulo);
  assert.deepEqual(writes, []);
  serverAdmin = true;
  assert.equal(await verification.verifyCiaacAdminAccess(user.id), true);
  assert.equal(nav.lpAccess(user, subject, first.id).allowed, true);
  assert.equal(
    nav.lpAccess(user, subject, sequence[1].id).lock,
    "previo",
    "Admin keeps sequence gates",
  );
  assert.equal(nav.subjectContinue(user.id, subject).id, first.id);
  assert.equal(nav.subjectContinue("someone-else", subject), null);
  nav.startLp("someone-else", first.id);
  nav.completeLp("someone-else", first, subject.titulo);
  assert.deepEqual(
    writes,
    [],
    "Another profile's admin session does not authorize an imperative call",
  );
  nav.startLp(user.id, first.id);
  nav.completeLp(user.id, first, subject.titulo);
  assert.equal(writes.length, 2, "The existing admin still starts and completes released content");
  const operations = taxonomy.lpSubject("ciaac", "operaciones-aeronauticas");
  const pending = taxonomy
    .subjectSequence(operations)
    .map((x) => x.item)
    .find((item) => !editorial.isLearningPathAvailable(item.id));
  assert.ok(pending);
  completed = [{ userId: user.id, temaId: `lp:${pending.id}`, completado: true }];
  assert.equal(
    nav.lpAccess(user, operations, pending.id).lock,
    "contenido",
    "No admin bypass of unpublished content",
  );
  writes = [];
  nav.startLp(user.id, pending.id);
  nav.completeLp(user.id, pending, operations.titulo);
  assert.deepEqual(writes, []);

  const rootRoute = load(file("src/routes/dashboard/rutas.tsx")).Route;
  const indexRoute = load(file("src/routes/dashboard/rutas/index.tsx")).Route;
  const lessonRoute = load(
    file("src/routes/dashboard/rutas/$categoria.$materia.$contenedor.$lp.tsx"),
  ).Route;
  const root = createRoot(document.getElementById("root"));
  const render = async (Component) => React.act(() => root.render(React.createElement(Component)));
  const setPath = (id = first.id) => {
    const [categoria, materia, contenedor, lp] = id.split("/");
    params = { categoria, materia, contenedor, lp };
    pathname = `/dashboard/rutas/${id}`;
    child = React.createElement(lessonRoute.component);
  };
  serverAdmin = false;
  verification.clearCiaacAdminVerification();
  for (const value of students) {
    user = value;
    settled = true;
    completed = structuredClone(snapshots.completed);
    started = structuredClone(snapshots.started);
    params = {};
    pathname = "/dashboard/rutas";
    writes = [];
    journeyWrites = 0;
    await render(indexRoute.component);
    const ciaacCard = document.querySelector('[aria-label="CIAAC, Aún no disponible"]');
    assert.ok(ciaacCard, "Visible card has the requested accessible label");
    assert.equal(ciaacCard.getAttribute("aria-disabled"), "true");
    assert.equal(ciaacCard.tagName, "BUTTON");
    assert.match(ciaacCard.style.opacity, /0\.68/);
    assert.doesNotMatch(ciaacCard.textContent, /Explorar módulo 1/);
    assert.equal(
      document.querySelector('a[href^="/dashboard/rutas/ciaac"]'),
      null,
      "No CIAAC continuation link",
    );
    assert.ok(
      document.querySelector('a[href="/dashboard/rutas/linea-aerea"]'),
      "Airline category remains a link",
    );
    // Category, subject, container and lesson all hit the parent guard, including reload/back-forward destinations.
    for (const id of [
      "ciaac",
      "ciaac/aerodinamica",
      first.id.split("/").slice(0, 3).join("/"),
      first.id,
    ]) {
      setPath(id);
      child = React.createElement(lessonRoute.component);
      outletMounts = 0;
      await render(rootRoute.component);
      assert.match(document.body.textContent, /Aún no disponible/);
      assert.equal(outletMounts, 0, "Blocked subtree is never mounted");
      assert.equal(document.querySelector("[data-content]"), null);
    }
    setPath();
    await render(lessonRoute.component);
    assert.match(
      document.body.textContent,
      /Aún no disponible/,
      "Leaf guard also rejects a direct URL",
    );
    assert.equal(document.querySelector("[data-content]"), null);
    assert.equal(journeyWrites, 0, "No lesson/journey effect during blocked navigation");
    assert.deepEqual(writes, []);
  }
  // No lesson flash before profile readiness; changing roles re-evaluates the same mounted route.
  user = admin;
  serverAdmin = true;
  settled = false;
  completed = [];
  started = [];
  setPath();
  child = React.createElement(lessonRoute.component);
  await render(rootRoute.component);
  assert.equal(document.querySelector("[data-content]"), null);
  assert.match(document.body.textContent, /Aún no disponible/);
  settled = true;
  await render(rootRoute.component);
  assert.ok(
    document.querySelector("[data-content]"),
    "Authenticated existing admin can view the ready lesson",
  );
  const afterAdminWrites = writes.length;
  const afterAdminJourneys = journeyWrites;
  user = students[2];
  serverAdmin = false;
  await React.act(() => {
    authListeners.forEach((listener) => listener("USER_UPDATED"));
  });
  await render(rootRoute.component);
  assert.equal(
    document.querySelector("[data-content]"),
    null,
    "Role change removes mounted lesson immediately",
  );
  assert.equal(writes.length, afterAdminWrites);
  assert.equal(journeyWrites, afterAdminJourneys);
  user = admin;
  serverAdmin = true;
  await React.act(() => verification.verifyCiaacAdminAccess(user.id));
  setPath(pending.id);
  await render(rootRoute.component);
  assert.match(document.body.textContent, /en preparación/);
  assert.equal(document.querySelector("[data-content]"), null);
  user = students[2];
  setPath(airlineFirst.id);
  child = React.createElement("div", { "data-airline": true }, "ATP disponible");
  const beforeAirlineCalls = fetchCalls;
  await render(rootRoute.component);
  assert.equal(fetchCalls, beforeAirlineCalls, "The airline subtree does not query the admin API");
  assert.ok(document.querySelector("[data-airline]"), "Other LP routes still mount");
  await React.act(() => root.unmount());
  dom.window.close();
  global.fetch = originalFetch;
  console.log(
    `PASS: ${roleCases} CIAAC access cases, Free/Basic/Pro/unknown/null and pending profiles; admin and editorial gates; zero blocked writes; gray entry and no Continue links; direct/subroutes/reload/back-forward destinations; role transitions; airline scope preserved.`,
  );
})().catch((error) => {
  global.fetch = originalFetch;
  console.error(error);
  process.exitCode = 1;
});
