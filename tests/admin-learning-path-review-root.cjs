const assert = require("node:assert/strict");
const React = require("react");
const { JSDOM } = require("jsdom");
const { loader, file } = require("./helpers/ts-loader.cjs");
const dom = new JSDOM('<div id="root"></div>', {
  url: "https://example.test/admin/revision-learning-paths",
});
Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = require("react-dom/client");
let pathname = "/admin/revision-learning-paths",
  boot = 0,
  session = 0,
  flash = 0,
  prefs = 0,
  presence = 0,
  activity = 0,
  reload = 0,
  outlet = 0;
const noop = () => {};
const stubs = {
  "@tanstack/react-query": {
    QueryClient: function () {},
    QueryClientProvider: ({ children }) => children,
  },
  "@tanstack/react-router": {
    createRootRouteWithContext: () => (config) => ({
      ...config,
      useRouteContext: () => ({ queryClient: {} }),
    }),
    useLocation: () => ({ pathname }),
    Outlet: () => {
      outlet++;
      return React.createElement("p", null, "route content");
    },
    Link: () => null,
    HeadContent: () => null,
    Scripts: () => null,
    useRouter: noop,
  },
  "@/lib/store": {
    initAppStore: () => boot++,
    useSessionUser: () => {
      session++;
      return null;
    },
  },
  "@/hooks/use-presence": { usePresence: () => presence++ },
  "@/hooks/use-activity-tracker": { useActivityTracker: () => activity++ },
  "@/lib/client-error-reporter": { installClientErrorReporter: noop, reportClientError: noop },
  "@/hooks/use-apply-prefs": { useApplyPrefs: () => prefs++ },
  "@/hooks/use-meta-pixel": { useMetaPixel: noop },
  "@/lib/ads": { isAdsConfigured: () => false },
  "@/lib/meta": { isMetaConfigured: () => false },
  "@/lib/oaiq": { isOaiqConfigured: () => false },
  "@/components/shared/FlashOfferWatch": {
    FlashOfferWatch: () => {
      flash++;
      return null;
    },
  },
};
const rootWindow = { location: { href: dom.window.location.href, replace: () => reload++ } };
const { Route } = loader(stubs, { window: rootWindow })(file("src/routes/__root.tsx"));
let root;
async function mount() {
  if (root) await React.act(() => root.unmount());
  document.getElementById("root").innerHTML = "";
  root = createRoot(document.getElementById("root"));
  await React.act(() => root.render(React.createElement(Route.component)));
}
(async () => {
  await mount();
  await mount(); // Direct entry and refresh.
  assert.deepEqual(
    [boot, session, flash, prefs, presence, activity, reload],
    [0, 0, 0, 0, 0, 0, 0],
  );
  assert.equal(outlet, 2);
  pathname += "/";
  await mount();
  assert.equal(boot, 0);
  pathname = "/dashboard";
  await mount();
  assert.deepEqual(
    [boot, session, flash, prefs, presence, activity],
    [1, 1, 1, 1, 1, 1],
    "normal app startup remains active",
  );
  const priorOutlet = outlet;
  pathname = "/admin/revision-learning-paths";
  await React.act(() => root.render(React.createElement(Route.component)));
  assert.equal(reload, 1, "SPA entry discards prior app sync runtime before mounting review");
  assert.equal(outlet, priorOutlet, "review never mounts into an already-running app cache");
  assert.equal(boot, 1);
  await React.act(() => root.unmount());
  assert.ok(
    !require("node:fs")
      .readFileSync(file("src/routes/admin/revision-learning-paths.tsx"), "utf8")
      .includes("useSessionUser"),
  );
  assert.match(
    require("node:fs").readFileSync(file("src/components/admin/AdminShell.tsx"), "utf8"),
    /reloadDocument=\{item.path === "\/admin\/revision-learning-paths"\}/,
  );
  console.log(
    "PASS isolated review root: direct/refresh/trailing-slash mount never starts app hydration, session hooks, preferences, presence/activity or offer; normal startup unchanged; SPA entry reloads before review.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
