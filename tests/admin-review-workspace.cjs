const assert = require("node:assert/strict");
const React = require("react");
const { JSDOM } = require("jsdom");
const { loader, file } = require("./helpers/ts-loader.cjs");
const {
  makePacket,
  candidateId,
  publishedId,
  missingId,
} = require("./fixtures/admin-review-synthetic.cjs");
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
let token = "synthetic-token",
  authChange,
  requests = [],
  waiters = [],
  navigations = [],
  urls = [],
  revoked = [],
  timers = new Map(),
  intervalNumber = 0;
window.setInterval = (fn, delay) => {
  assert.equal(delay, 30000);
  timers.set(++intervalNumber, fn);
  return intervalNumber;
};
window.clearInterval = (id) => timers.delete(id);
const originalCreate = URL.createObjectURL,
  originalRevoke = URL.revokeObjectURL;
URL.createObjectURL = (blob) => {
  assert.equal(blob.type, "image/svg+xml");
  const url = `blob:synthetic-${urls.length}`;
  urls.push(url);
  return url;
};
URL.revokeObjectURL = (url) => revoked.push(url);
const forbidden = [];
for (const storage of [window.localStorage, window.sessionStorage])
  for (const method of ["setItem", "removeItem", "clear"])
    Object.getPrototypeOf(storage)[method] = (...args) => forbidden.push([method, ...args]);
Object.defineProperty(document, "cookie", {
  set: (value) => forbidden.push(["cookie", value]),
  get: () => "",
});
Object.defineProperty(window, "indexedDB", {
  get: () => {
    throw Error("IndexedDB is forbidden");
  },
});
global.fetch = (url, options) => {
  requests.push([url, options]);
  return new Promise((resolve) => waiters.push(resolve));
};
const publishedItem = {
  id: publishedId,
  title: "Server verified title",
  category: "CIAAC",
  subject: "Synthetic subject",
  chapter: "Synthetic module",
  renderer: "handbook",
};
const serverCatalog = { items: [publishedItem], selected: null };
let renderDocument;
function NativeStub({ selected, onExit }) {
  const [answer, setAnswer] = React.useState(false);
  renderDocument = selected.document;
  return React.createElement(
    "section",
    { "data-review": selected.item.id },
    React.createElement("h2", null, selected.item.title),
    React.createElement(
      "button",
      { onClick: () => setAnswer(true) },
      answer ? "Temporary answer retained" : "Answer temporarily",
    ),
    React.createElement("button", { onClick: onExit }, "Exit native review"),
  );
}
const load = loader({
  "@tanstack/react-router": {
    createFileRoute: () => (config) => ({ ...config, useSearch: () => ({}) }),
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
  "@/components/lp/AdminReviewLearningPath": { AdminReviewLearningPath: NativeStub },
});
const { Route } = load(file("src/routes/admin/revision-learning-paths.tsx"));
let root;
const watchdog = setTimeout(() => {
  console.error("FAIL workspace test did not finish");
  process.exit(1);
}, 20000);
async function mount() {
  if (root) await React.act(() => root.unmount());
  document.getElementById("root").innerHTML = "";
  root = createRoot(document.getElementById("root"));
  await React.act(async () => root.render(React.createElement(Route.component)));
}
async function respond(status = 200, body = serverCatalog) {
  const resolver = waiters.shift();
  assert.ok(resolver, "expected pending server request");
  await React.act(async () => resolver(new Response(JSON.stringify(body), { status })));
}
async function click(text) {
  const button = [...document.querySelectorAll("button")].find((b) => b.textContent.includes(text));
  assert.ok(button, text);
  await React.act(async () => button.click());
}
async function pick(packet = makePacket(), custom = {}) {
  const input = document.querySelector("input[type=file]");
  assert.ok(input);
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [
      { name: "synthetic.json", size: 2000, text: async () => JSON.stringify(packet), ...custom },
    ],
  });
  await React.act(async () => input.dispatchEvent(new window.Event("change", { bubbles: true })));
}
async function importReady() {
  await pick();
  await respond();
  assert.match(document.body.textContent, /Verificando acceso/);
  await respond();
  assert.match(document.body.textContent, /3 de 129/);
}
async function change(selector, value) {
  const node = document.querySelector(selector);
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), "value").set;
  await React.act(async () => {
    setter.call(node, value);
    node.dispatchEvent(
      new window.Event(node.tagName === "SELECT" ? "change" : "input", { bubbles: true }),
    );
  });
}
(async () => {
  token = null;
  await mount();
  assert.equal(document.querySelector("input[type=file]"), null);
  assert.equal(requests.length, 0);
  token = "synthetic-token";
  await mount();
  assert.equal(document.querySelector("input[type=file]"), null);
  await respond();
  const beforeOversize = requests.length;
  await pick(undefined, { size: 32 * 1024 * 1024 + 1 });
  assert.match(document.body.textContent, /supera 32 MiB/);
  assert.equal(requests.length, beforeOversize);
  let reads = 0;
  await pick(undefined, {
    text: async () => {
      reads++;
      return JSON.stringify(makePacket());
    },
  });
  await respond(403, {});
  assert.equal(reads, 0);
  assert.equal(document.querySelector("input[type=file]"), null);
  assert.equal(urls.length, 0);
  await mount();
  await respond();
  await importReady();
  assert.equal(urls.length, 1);
  assert.match(document.body.textContent, /Faltan 126/);
  assert.match(document.body.textContent, /incompletas/);
  await change("#private-review-filter", "incomplete");
  assert.equal(
    [...document.querySelectorAll("button")].filter((b) =>
      b.textContent.includes("Synthetic sample"),
    ).length,
    0,
  );
  await change("#private-review-filter", "all");
  await change("#review-search", "Missing synthetic");
  assert.equal(
    [...document.querySelectorAll("button")].filter((b) =>
      b.textContent.includes("Synthetic sample"),
    ).length,
    0,
  );
  await change("#review-search", "");
  await click("Missing synthetic");
  assert.equal(document.querySelector("[data-review]"), null);
  await respond();
  assert.match(document.body.textContent, /Documento pendiente/);
  await click("Volver al catálogo privado");
  await click("Synthetic sample");
  assert.equal(navigations.length, 0);
  assert.equal(requests.at(-1)[0], "/api/admin/learning-path-review");
  assert.equal(document.querySelector("[data-review]"), null);
  await respond();
  assert.equal(document.querySelector("[data-review]").dataset.review, candidateId);
  assert.equal(renderDocument.figures[0].file, urls[0]);
  assert.match(document.body.textContent, /Synthetic reservation/);
  await click("Answer temporarily");
  assert.match(document.body.textContent, /Temporary answer retained/);
  await React.act(async () => window.dispatchEvent(new window.Event("focus")));
  assert.ok(document.querySelector('[aria-label="Paquete privado"]').hidden);
  await respond();
  assert.match(document.body.textContent, /Temporary answer retained/);
  assert.equal(document.querySelector('[aria-label="Paquete privado"]').hidden, false);
  await React.act(async () => {
    void [...timers.values()][0]();
  });
  await respond();
  assert.match(document.body.textContent, /Temporary answer retained/);
  await click("Exit native review");
  await click("Published synthetic");
  assert.ok(requests.at(-1)[0].includes(encodeURIComponent(publishedId)));
  await respond(200, {
    ...serverCatalog,
    selected: { item: publishedItem, document: { serverOnly: true } },
  });
  assert.deepEqual(renderDocument, { serverOnly: true });
  assert.match(document.body.textContent, /Server verified title/);
  await click("Volver al catálogo privado");
  const oldURL = urls.at(-1);
  await pick(undefined, { text: async () => '{"bad":true}' });
  assert.ok(revoked.includes(oldURL));
  await respond();
  assert.match(document.body.textContent, /Paquete incompatible/);
  assert.equal(document.querySelector("[data-review]"), null);
  await importReady();
  const replacementURL = urls.at(-1);
  await click("Borrar paquete privado");
  assert.ok(revoked.includes(replacementURL));
  assert.equal(document.querySelector("#private-review-filter"), null);
  let resolveRead;
  await pick(undefined, {
    text: () =>
      new Promise((resolve) => {
        resolveRead = resolve;
      }),
  });
  await respond();
  await click("Borrar paquete privado");
  const count = urls.length;
  await React.act(async () => resolveRead(JSON.stringify(makePacket())));
  assert.equal(urls.length, count);
  assert.equal(document.querySelector("#private-review-filter"), null);
  // A newer file wins even if the old file read completes later.
  let resolveOldRead;
  await pick(undefined, {
    text: () =>
      new Promise((resolve) => {
        resolveOldRead = resolve;
      }),
  });
  await respond();
  const newer = makePacket();
  newer.title = "Newer synthetic replacement";
  await pick(newer);
  await respond();
  await respond();
  const newerURL = urls.at(-1),
    countAfterNewer = urls.length;
  await React.act(async () => resolveOldRead(JSON.stringify(makePacket())));
  assert.match(document.body.textContent, /Newer synthetic replacement/);
  assert.equal(urls.length, countAfterNewer);
  assert.ok(!revoked.includes(newerURL));
  // Clearing while a lesson authorization request is pending cannot resurrect it.
  await click("Synthetic sample");
  await click("Borrar paquete privado");
  await respond();
  assert.equal(document.querySelector("[data-review]"), null);
  assert.equal(document.querySelector("#private-review-filter"), null);
  assert.ok(revoked.includes(newerURL));
  await importReady();
  await click("Synthetic sample");
  await respond(403, {});
  assert.equal(document.querySelector("[data-review]"), null);
  assert.ok(revoked.includes(urls.at(-1)));
  assert.match(document.body.textContent, /exclusivo para administradores/);
  await mount();
  await respond();
  await importReady();
  token = null;
  await React.act(async () => authChange("SIGNED_OUT"));
  assert.ok(revoked.includes(urls.at(-1)));
  assert.equal(document.querySelector("#private-review-filter"), null);
  assert.match(document.body.textContent, /Inicia sesión/);
  token = "synthetic-token";
  await mount();
  await respond();
  await pick(undefined, {
    text: () =>
      new Promise((resolve) => {
        resolveRead = resolve;
      }),
  });
  await respond();
  const beforeLogout = urls.length;
  token = null;
  await React.act(async () => authChange("SIGNED_OUT"));
  await React.act(async () => resolveRead(JSON.stringify(makePacket())));
  assert.equal(urls.length, beforeLogout);
  assert.equal(document.querySelector("[data-review]"), null);
  token = "new-token";
  await React.act(async () => authChange("SIGNED_IN"));
  await respond(403, {});
  assert.equal(document.querySelector("input[type=file]"), null);
  token = "synthetic-token";
  await mount();
  await respond();
  await importReady();
  await React.act(async () => window.dispatchEvent(new window.Event("focus")));
  await respond(401, {});
  assert.ok(revoked.includes(urls.at(-1)));
  assert.equal(document.querySelector("#private-review-filter"), null);
  await mount();
  await respond();
  await importReady();
  await React.act(async () => window.dispatchEvent(new window.PageTransitionEvent("pagehide")));
  assert.ok(revoked.includes(urls.at(-1)));
  assert.equal(document.querySelector("#private-review-filter"), null);
  await importReady();
  await React.act(async () =>
    window.dispatchEvent(new window.PageTransitionEvent("pageshow", { persisted: true })),
  );
  assert.ok(revoked.includes(urls.at(-1)));
  assert.equal(document.querySelector("#private-review-filter"), null);
  const full = makePacket();
  for (let i = 3; i < 129; i++)
    full.catalog.push({
      ...full.catalog[2],
      id: `ciaac/synthetic/module/missing-${i}`,
      code: `SYN-${i}`,
      title: `Synthetic missing ${i}`,
      order: i,
    });
  await pick(full);
  await respond();
  await respond();
  assert.match(document.body.textContent, /129 de 129/);
  assert.ok(!document.body.textContent.includes("Faltan 126"));
  const catalogButtons = [...document.querySelectorAll("li > button")];
  assert.equal(catalogButtons.length, 129);
  assert.ok(catalogButtons.every((button) => !button.disabled && button.type === "button"));
  await click("Synthetic missing 128");
  await respond();
  assert.match(document.body.textContent, /Documento pendiente/);
  await React.act(() => root.unmount());
  root = null;
  assert.equal(authChange, null);
  assert.equal(timers.size, 0);
  assert.deepEqual([...new Set(revoked)].sort(), urls.slice().sort());
  assert.equal(revoked.length, urls.length);
  assert.deepEqual(forbidden, []);
  assert.ok(
    requests.every(
      ([url, options]) =>
        url.startsWith("/api/admin/learning-path-review") &&
        (options.method ?? "GET") === "GET" &&
        options.cache === "no-store" &&
        !options.body &&
        options.headers.Authorization.startsWith("Bearer "),
    ),
  );
  console.log(
    "PASS private workspace: authorization before file read/render, 401/403/auth loss/import-read races, replacement/clear/back-cache/unmount URL cleanup, all129/missing/status/search/filter navigation, published fetch verification, focus/30-second checks, temporary answers retained, no uploads/persistence/student requests.",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (root) await React.act(() => root.unmount());
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    clearTimeout(watchdog);
  });
