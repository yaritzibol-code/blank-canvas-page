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
let lp,
  token = "test-token",
  authChange,
  renderCalls = 0,
  navigations = [],
  requests = [],
  waiters = [];
const item = {
  id: "ciaac/subject/container/am19",
  title: "AM19 Test",
  category: "CIAAC",
  subject: "Aeronaves",
  chapter: "Native",
  renderer: "handbook",
};
const payload = { items: [item], selected: { item, document: { stages: [] } } };
global.fetch = (url, options) => {
  requests.push([url, options]);
  return new Promise((resolve) => waiters.push(resolve));
};
const load = loader({
  "@tanstack/react-router": {
    createFileRoute: () => (config) => ({ ...config, useSearch: () => ({ lp }) }),
    useNavigate: () => (props) => navigations.push(props),
  },
  "@/integrations/supabase/client": {
    supabase: {
      auth: {
        getSession: async () => ({ data: { session: token ? { access_token: token } : null } }),
        onAuthStateChange: (callback) => {
          authChange = callback;
          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  authChange = null;
                },
              },
            },
          };
        },
      },
    },
  },
  "@/components/lp/AdminReviewLearningPath": {
    AdminReviewLearningPath: ({ selected, onExit }) => {
      renderCalls++;
      return React.createElement(
        "button",
        { onClick: onExit, "data-review": true },
        selected.item.title,
      );
    },
  },
});
const { Route } = load(file("src/routes/admin/revision-learning-paths.tsx"));
let root;
async function mount() {
  if (root) await React.act(() => root.unmount());
  document.getElementById("root").innerHTML = "";
  root = createRoot(document.getElementById("root"));
  await React.act(async () => root.render(React.createElement(Route.component)));
}
async function respond(status = 200, body = payload, index = 0) {
  const resolver = waiters.splice(index, 1)[0];
  assert.ok(resolver);
  await React.act(async () => resolver(new Response(JSON.stringify(body), { status })));
}
(async () => {
  lp = item.id;
  token = null;
  await mount();
  assert.equal(requests.length, 0);
  assert.equal(renderCalls, 0);
  assert.match(document.body.textContent, /Inicia sesión/);
  token = "test-token";
  await mount();
  assert.equal(renderCalls, 0, "no content before server authorization");
  assert.match(requests.at(-1)[0], /\?lp=ciaac%2F/);
  assert.equal(requests.at(-1)[1].cache, "no-store");
  await respond(403, { error: "forbidden" });
  assert.equal(renderCalls, 0);
  assert.match(document.body.textContent, /exclusivo para administradores/);
  await mount();
  await respond();
  assert.ok(document.querySelector("[data-review]"));
  await React.act(() => document.querySelector("[data-review]").click());
  assert.deepEqual(navigations.at(-1), { to: "/admin/revision-learning-paths", search: {} });
  // Moving to a different URL immediately hides old content, before its request resolves.
  lp = "ciaac/subject/container/am01";
  await React.act(async () => root.render(React.createElement(Route.component)));
  assert.equal(document.querySelector("[data-review]"), null);
  lp = item.id;
  await React.act(async () => root.render(React.createElement(Route.component)));
  await respond(200, {
    items: [item],
    selected: { ...payload.selected, item: { ...item, title: "Stale content" } },
  });
  assert.equal(
    document.querySelector("[data-review]"),
    null,
    "stale response cannot restore content",
  );
  await respond();
  assert.ok(document.querySelector("[data-review]"));
  token = null;
  await React.act(async () => authChange("SIGNED_OUT"));
  assert.equal(document.querySelector("[data-review]"), null);
  assert.match(document.body.textContent, /Inicia sesión/);
  token = "new-token";
  await React.act(async () => authChange("SIGNED_IN"));
  await respond(403, {});
  assert.equal(
    document.querySelector("[data-review]"),
    null,
    "account switch rechecks server authorization",
  );
  lp = undefined;
  await mount();
  await respond(200, { items: [item], selected: null });
  assert.ok(document.querySelector("input[type='search']"));
  const open = [...document.querySelectorAll("button")].find((b) =>
    b.textContent.includes("AM19 Test"),
  );
  await React.act(() => open.click());
  assert.equal(navigations.at(-1).search.lp, item.id);
  assert.match(document.body.textContent, /otros visores todavía no están habilitados/);
  assert.equal(document.querySelector("a[href='/admin']").textContent, "Salir al panel");
  await React.act(() => root.unmount());
  assert.equal(authChange, null);
  console.log(
    "PASS review route: server verification before renderer, anonymous/non-admin denial, no-store bearer requests, selector/deep link, stale responses, auth sign-out/account switch, exit and cleanup.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
