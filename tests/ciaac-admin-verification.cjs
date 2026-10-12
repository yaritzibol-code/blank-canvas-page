const assert = require("node:assert/strict");
const fs = require("node:fs");
const { loader, file } = require("./helpers/ts-loader.cjs");
let session = {
  user: { id: "owner" },
  access_token: "owner.session.token",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};
let sessionError = null;
let clientAvailable = true;
let responseStatus = 200;
let responseError = null;
let payload = { items: [], selected: null };
let fetchHandler = null;
let calls = 0;
let cleanup;
const authListeners = new Set();
const events = new Map();
const visibilityEvents = new Map();
const original = { fetch: global.fetch, window: global.window, document: global.document };
global.window = {
  addEventListener: (name, fn) => events.set(name, fn),
  removeEventListener: (name) => events.delete(name),
};
global.document = {
  visibilityState: "visible",
  addEventListener: (name, fn) => visibilityEvents.set(name, fn),
  removeEventListener: (name) => visibilityEvents.delete(name),
};
const client = {
  auth: {
    getSession: async () => ({ data: { session }, error: sessionError }),
    onAuthStateChange: (fn) => {
      authListeners.add(fn);
      return { data: { subscription: { unsubscribe: () => authListeners.delete(fn) } } };
    },
  },
};
global.fetch = async (url, options) => {
  calls++;
  assert.equal(url, "/api/admin/learning-path-review");
  assert.equal(options.cache, "no-store");
  assert.deepEqual(Object.keys(options.headers), ["Authorization"]);
  assert.ok(options.signal instanceof AbortSignal);
  if (fetchHandler) return fetchHandler(url, options);
  if (responseError) throw responseError;
  return { status: responseStatus, json: async () => payload };
};
const load = loader({
  react: {
    useEffect: (effect) => {
      cleanup = effect();
    },
  },
  "@/lib/store/cloud": { supa: () => (clientAvailable ? client : null) },
  "@/lib/store/db": { touch: () => {} },
});
const verification = load(file("src/lib/lp/ciaac-admin-verification.ts"));
const policy = load(file("src/lib/lp/ciaac-student-availability.ts"));
const studentSpoof = { id: "owner", role: "admin", plan: "paga" };
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
(async () => {
  assert.equal(policy.isCiaacStudentAccessPaused(studentSpoof, "ciaac"), true);
  for (const status of [401, 403, 404, 500, 302]) {
    responseStatus = status;
    assert.equal(await verification.verifyCiaacAdminAccess("owner"), false);
    assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), false);
    assert.equal(policy.isCiaacStudentAccessPaused(studentSpoof, "ciaac"), true);
  }
  responseStatus = 200;
  for (const malformed of [
    null,
    "<!doctype html>",
    [],
    { error: "forbidden" },
    { items: [] },
    { items: {}, selected: null },
    { items: [], selected: {} },
  ]) {
    payload = malformed;
    assert.equal(
      await verification.verifyCiaacAdminAccess("owner"),
      false,
      "HTTP 200 without the review contract fails closed",
    );
    assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), false);
  }
  fetchHandler = () => ({
    status: 200,
    json: async () => {
      throw new SyntaxError("HTML response");
    },
  });
  assert.equal(await verification.verifyCiaacAdminAccess("owner"), false);
  fetchHandler = null;
  payload = { items: [], selected: null };
  responseError = Error("Network unavailable");
  assert.equal(await verification.verifyCiaacAdminAccess("owner"), false);
  assert.equal(verification.ciaacAdminVerificationFailed("owner"), true);
  responseError = null;
  sessionError = Error("Invalid session");
  const before = calls;
  assert.equal(await verification.verifyCiaacAdminAccess("owner"), false);
  assert.equal(calls, before, "An SDK session error never transmits a token");
  sessionError = null;
  assert.equal(await verification.verifyCiaacAdminAccess("another-user"), false);
  assert.equal(calls, before, "Mismatched local user and authenticated session fail closed");
  const validSession = structuredClone(session);
  session = null;
  assert.equal(await verification.verifyCiaacAdminAccess("owner"), false);
  clientAvailable = false;
  assert.equal(await verification.verifyCiaacAdminAccess("owner"), false);
  clientAvailable = true;
  session = structuredClone(validSession);

  const delayed = deferred();
  fetchHandler = () => delayed.promise;
  const pending = verification.verifyCiaacAdminAccess("owner");
  await tick();
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), false);
  assert.equal(
    policy.isCiaacStudentAccessPaused(studentSpoof, "ciaac"),
    true,
    "Pending success cannot flash content",
  );
  session = { ...validSession, access_token: "new.session.token" };
  delayed.resolve({ status: 200, json: async () => ({ items: [], selected: null }) });
  assert.equal(await pending, false, "Same-user token replacement invalidates an in-flight result");
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), false);

  session = structuredClone(validSession);
  const old = deferred();
  fetchHandler = () => old.promise;
  const oldRequest = verification.verifyCiaacAdminAccess("owner");
  await tick();
  session = {
    user: { id: "second-admin" },
    access_token: "second.session.token",
    expires_at: validSession.expires_at,
  };
  fetchHandler = null;
  assert.equal(await verification.verifyCiaacAdminAccess("second-admin"), true);
  old.resolve({ status: 200, json: async () => ({ items: [], selected: null }) });
  assert.equal(await oldRequest, false, "Previous generation success is ignored");
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), false);
  assert.equal(verification.hasVerifiedCiaacAdminAccess("second-admin"), true);
  verification.clearCiaacAdminVerification();
  assert.equal(verification.hasVerifiedCiaacAdminAccess("second-admin"), false);

  session = { ...validSession, expires_at: Math.floor(Date.now() / 1000) - 1 };
  assert.equal(
    await verification.verifyCiaacAdminAccess("owner"),
    false,
    "Expired bearer never grants a lease",
  );
  session = structuredClone(validSession);
  assert.equal(await verification.verifyCiaacAdminAccess("owner"), true);
  assert.equal(
    policy.isCiaacStudentAccessPaused({ id: "owner", role: "student" }, "ciaac"),
    false,
    "Server observation, not local role, is authoritative",
  );
  assert.equal(policy.isCiaacStudentAccessPaused({ id: "other", role: "admin" }, "ciaac"), true);

  verification.useCiaacAdminVerification("owner", true);
  await tick();
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), true);
  const afterInitial = calls;
  authListeners.forEach((listener) => listener("INITIAL_SESSION"));
  await tick();
  assert.equal(
    calls,
    afterInitial,
    "Initial SDK event does not start a duplicate verification loop",
  );
  const onFocus = deferred();
  fetchHandler = () => onFocus.promise;
  events.get("focus")();
  assert.equal(
    verification.hasVerifiedCiaacAdminAccess("owner"),
    false,
    "Focus revokes before rechecking",
  );
  await tick();
  onFocus.resolve({ status: 200, json: async () => ({ items: [], selected: null }) });
  await tick();
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), true);
  fetchHandler = null;
  responseStatus = 403;
  session = { ...validSession, access_token: "refreshed.session.token" };
  authListeners.forEach((listener) => listener("TOKEN_REFRESHED"));
  assert.equal(
    verification.hasVerifiedCiaacAdminAccess("owner"),
    false,
    "Auth events revoke synchronously",
  );
  await tick();
  await tick();
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), false);
  const afterDenied = calls;
  await tick();
  assert.equal(calls, afterDenied, "Denial does not self-retry");
  responseStatus = 200;
  visibilityEvents.get("visibilitychange")();
  await tick();
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), true);
  session = null;
  authListeners.forEach((listener) => listener("SIGNED_OUT"));
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), false);
  assert.equal(policy.isCiaacStudentAccessPaused(studentSpoof, "ciaac"), true);
  await tick();
  assert.equal(calls, afterDenied + 1, "Sign-out never starts a server request");
  cleanup();
  assert.equal(events.size, 0);
  assert.equal(visibilityEvents.size, 0);
  assert.equal(authListeners.size, 0);
  session = validSession;
  verification.useCiaacAdminVerification("owner", true);
  await tick();
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), true);
  cleanup();
  assert.equal(
    verification.hasVerifiedCiaacAdminAccess("owner"),
    false,
    "Leaving the layout revokes the memory lease",
  );
  verification.useCiaacAdminVerification("owner", false);
  assert.equal(verification.hasVerifiedCiaacAdminAccess("owner"), false);
  const source = fs.readFileSync(file("src/lib/lp/ciaac-admin-verification.ts"), "utf8");
  assert.doesNotMatch(source, /localStorage|sessionStorage|\.role\b|\.plan\b|\.rpc\(|\.from\(/);
  console.log(
    "PASS: memory-only server admin observation; spoofed roles/paid plans, 401/403/error, missing/pending/expired/mismatched session, token races and generations; auth/focus/visibility/logout/cleanup revocation; no denial retry loop or persistent writes.",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    cleanup?.();
    verification.clearCiaacAdminVerification();
    Object.assign(global, original);
  });
