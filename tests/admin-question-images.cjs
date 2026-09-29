const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const esbuild = createRequire(require.resolve("vite/package.json"))("esbuild");
const root = path.resolve(__dirname, "..");
async function bundle(file, mocks = {}) {
  const { outputFiles } = await esbuild.build({
    entryPoints: [path.join(root, file)], bundle: true, write: false, platform: "node", format: "cjs",
    plugins: [{ name: "fixtures", setup(build) {
      build.onResolve({ filter: /.*/ }, args => args.path in mocks ? { path: args.path, namespace: "fixture" } : undefined);
      build.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({ contents: mocks[args.path], loader: "js" }));
    } }],
  });
  const mod = { exports: {} };
  new Function("module", "exports", "require", outputFiles[0].text)(mod, mod.exports, require);
  return mod.exports;
}
(async () => {
  const policy = await bundle("src/lib/question-image-policy.ts");
  assert.equal(policy.questionImageBucket("ATP"), "atp-images");
  assert.equal(policy.questionImageBucket("LAOF"), "e190-images");
  assert.equal(policy.questionImageBucket("JEPP"), "jeppesen-images");
  assert.equal(policy.questionImageBucket("arbitrary-bucket"), "jeppesen-images");
  const png = new File([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6bQAAAABJRU5ErkJggg==", "base64")], "figure.png", { type: "image/png" });
  const calls = [];
  global.__questionImageQA = { upload(bucket, name, bytes, opts) { calls.push({ bucket, name, bytes, opts }); return { error: null }; } };
  const dbMock = 'export const supabaseAdmin = { storage: { from(bucket) { return { upload: (...args) => globalThis.__questionImageQA.upload(bucket, ...args) }; } } };';
  const server = await bundle("src/lib/admin-question-images.server.ts", { "@/integrations/supabase/client.server": dbMock });
  const form = (image, fuente = "ATP") => { const data = new FormData(); data.set("image", image); data.set("fuente", fuente); return data; };
  const stored = await server.storeQuestionImage(form(png));
  assert.match(stored.name, /^admin_[a-f0-9-]+\.png$/);
  assert.equal(calls[0].bucket, "atp-images");
  assert.equal(calls[0].opts.upsert, false);
  assert.equal(calls[0].opts.contentType, "image/png");
  assert("error" in await server.storeQuestionImage(form(new File(["<html>"], "fake.png", { type: "image/png" }))));
  assert("error" in await server.storeQuestionImage(form(new File(["<svg/>"], "x.svg", { type: "image/svg+xml" }))));
  assert("error" in await server.storeQuestionImage(form(new File([], "empty.png", { type: "image/png" }))));
  assert("error" in await server.storeQuestionImage(form(new File([new Uint8Array(policy.QUESTION_IMAGE_MAX_BYTES + 1)], "big.png", { type: "image/png" }))));
  assert.equal(calls.length, 1, "invalid files never reach storage");
  global.__questionImageQA.upload = () => ({ error: { message: "private storage error" } });
  assert("error" in await server.storeQuestionImage(form(png)));

  // Run the real endpoint handler: an authenticated non-admin cannot reach privileged storage.
  const functions = await bundle("src/lib/admin-question-images.functions.ts", {
    "@tanstack/react-start": 'export const createServerFn = () => ({ middleware() { return this; }, inputValidator(validate) { this.validate = validate; return this; }, handler(handler) { return { handler, validate: this.validate }; } });',
    "@/integrations/supabase/auth-middleware": 'export const requireSupabaseAuth = {};',
    "@/integrations/supabase/client.server": dbMock,
  });
  let privileged = 0;
  global.__questionImageQA.upload = () => { privileged++; return { error: null }; };
  const endpoint = functions.uploadQuestionImage;
  assert.throws(() => endpoint.validate({ image: "not multipart" }));
  for (const result of [{ data: false, error: null }, { data: null, error: { message: "offline" } }]) {
    assert("error" in await endpoint.handler({ data: form(png), context: { supabase: { rpc: async () => result } } }));
  }
  assert.equal(privileged, 0);
  assert("name" in await endpoint.handler({ data: form(png), context: { supabase: { rpc: async () => ({ data: true, error: null }) } } }));
  assert.equal(privileged, 1);

  let uploads = 0;
  global.__imageUploadQA = async () => { uploads++; return { name: "replacement.png" }; };
  const editor = await bundle("src/components/admin/QuestionImageEditor.tsx", {
    "./AdminShell": 'export const labelStyle = {}; export const secondaryBtnStyle = {};',
    "@/lib/store/cloud": 'export const supa = () => null;',
    "@/lib/admin-question-images.functions": 'export const uploadQuestionImage = (...args) => globalThis.__imageUploadQA(...args);',
  });
  const drafts = editor.questionImageDrafts(["original.png", "shared.png"]);
  assert.deepEqual(await editor.prepareQuestionImages(drafts, "ATP"), ["original.png", "shared.png"]);
  assert.equal(uploads, 0);
  const changed = [{ ...drafts[0], name: undefined, file: png }, drafts[1]];
  assert.deepEqual(await editor.prepareQuestionImages(changed, "ATP"), ["replacement.png", "shared.png"]);
  assert.deepEqual(await editor.prepareQuestionImages(changed, "ATP"), ["replacement.png", "shared.png"]);
  assert.equal(uploads, 1, "retry reuses uploaded image");
  assert.deepEqual(await editor.prepareQuestionImages([], "ATP"), []);
  assert.equal(uploads, 1, "removing references does not touch storage");
  global.__imageUploadQA = async () => ({ error: "Storage unavailable" });
  await assert.rejects(() => editor.prepareQuestionImages([{ id: "new", file: new File([png], "another.png", { type: png.type }) }]), /Storage unavailable/);
  assert.deepEqual(drafts.map(d => d.name), ["original.png", "shared.png"], "failed replacement preserves original draft");
  console.log("PASS admin image authorization, file validation, immutable storage, preserved references and retry handling");
})().catch(error => { console.error(error); process.exitCode = 1; });
