const assert = require("node:assert/strict");
const { loader, file } = require("./helpers/ts-loader.cjs");
let claimsError = null,
  admin = false,
  rpcError = null,
  rpcCalls = [],
  claimsCalls = 0,
  created = 0;
const before = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_PUBLISHABLE_KEY };
process.env.SUPABASE_URL = "https://example.test";
process.env.SUPABASE_PUBLISHABLE_KEY = "public-test-key";
const load = loader({
  "@supabase/supabase-js": {
    createClient: (_url, _key, options) => {
      created++;
      assert.deepEqual(options.auth, { persistSession: false, autoRefreshToken: false });
      assert.match(options.global.headers.Authorization, /^Bearer /);
      return {
        auth: {
          getClaims: async () => {
            claimsCalls++;
            return {
              data: claimsError ? null : { claims: { sub: "verified-user" } },
              error: claimsError,
            };
          },
        },
        rpc: async (name) => {
          rpcCalls.push(name);
          return { data: admin, error: rpcError };
        },
        from: () => {
          throw Error("Review must not read or write user profiles/progress");
        },
      };
    },
  },
  "@tanstack/react-router": { createFileRoute: () => (config) => config },
});
const { Route } = load(file("src/routes/api/admin/learning-path-review.ts"));
const get = (id = "", headers = { Authorization: "Bearer verified.test.token" }) =>
  Route.server.handlers.GET({
    request: new Request(
      `https://example.test/api/admin/learning-path-review${id ? `?lp=${encodeURIComponent(id)}` : ""}`,
      { headers },
    ),
  });
(async () => {
  assert.equal((await get("", {})).status, 401);
  assert.equal(created, 0);
  assert.equal(
    (await get("", { Authorization: "Bearer malformed", "X-Role": "admin" })).status,
    401,
  );
  assert.equal(created, 0);
  claimsError = Error("expired or forged token");
  assert.equal((await get()).status, 401);
  assert.equal(rpcCalls.length, 0);
  claimsError = null;
  for (admin of [false, null, "true", 1, { role: "admin" }]) {
    const response = await get("", {
      Authorization: "Bearer verified.test.token",
      "X-Role": "admin",
      "X-Plan": "pro",
    });
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "forbidden" });
    assert.match(response.headers.get("Cache-Control"), /no-store/);
  }
  admin = true;
  rpcError = Error("database unavailable");
  assert.equal((await get()).status, 403);
  rpcError = null;
  const response = await get();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Vary"), "Authorization");
  const catalog = await response.json();
  assert.ok(catalog.items.length > 19);
  assert.equal(catalog.selected, null);
  const lesson = catalog.items.find((item) => item.renderer === "approved-aircraft");
  const selected = await get(lesson.id);
  assert.equal(selected.status, 200);
  assert.equal((await selected.json()).selected.item.id, lesson.id);
  assert.equal((await get("ciaac/unknown/placeholder")).status, 404);
  admin = false;
  assert.equal((await get(lesson.id)).status, 403, "revoked admins cannot request a direct lesson");
  assert.ok(rpcCalls.every((name) => name === "is_admin"));
  assert.equal(claimsCalls, created);
  console.log(
    "PASS server review authorization: missing/forged/expired bearer, non-admin/paid/spoofed roles, RPC failure, strict admin boolean, direct lesson denial, revoked admin, no-store, and unavailable-content denial.",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (before.url === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = before.url;
    if (before.key === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = before.key;
  });
