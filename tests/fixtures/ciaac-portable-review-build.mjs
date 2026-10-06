/** Build a file://-ready, classic-script package. No install, publish, or upload. */
import { build } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.resolve(root, "../ciaac-review-package");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
fs.mkdirSync(out, { recursive: true });
await build({ configFile: path.join(here, "ciaac-portable-review.config.ts") });
const buildDir = path.join(out, ".build");
let css = fs.readFileSync(path.join(buildDir, "review.css"), "utf8");
const js = fs.readFileSync(path.join(buildDir, "review.js"), "utf8");
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "src/lib/lp/ciaac-aircraft-approved/catalog.json")),
);
const documents = JSON.parse(
  fs.readFileSync(path.join(root, "src/lib/lp/ciaac-aircraft-approved/documents.json")),
);
const lessons = catalog.lessons.slice(5, 10);
const assets = new Set();
const fonts = new Set();
function visit(value) {
  if (typeof value === "string" && /^\/(?:ciaac-approved|lp)\//.test(value)) assets.add(value);
  else if (Array.isArray(value)) value.forEach(visit);
  else if (value && typeof value === "object") Object.values(value).forEach(visit);
}
for (const lesson of lessons) visit(documents[lesson.id]);
// Actual shell assets and non-CIAAC character branch used by these authored documents.
for (const asset of [
  "/lp/visual/flightpath-logo.png",
  "/lp/visual/yaris.png",
  "/lp/visual/pathy.png",
])
  assets.add(asset);
css = css.replace(/url\((['"]?)(\/(?:fonts|lp)\/[^)'"\s]+)\1\)/g, (_all, _quote, resource) => {
  const bytes = fs.readFileSync(path.join(root, "public", resource));
  if (/\.(woff2?|ttf|otf)$/.test(resource)) {
    fonts.add(resource);
    const mime = resource.endsWith(".woff2")
      ? "font/woff2"
      : resource.endsWith(".ttf")
        ? "font/ttf"
        : "font/woff";
    return `url("data:${mime};base64,${bytes.toString("base64")}")`;
  }
  assets.add(resource);
  return `url(".${resource}")`;
});
if (/url\([^)]*(?:https?:|\/fonts\/|["']\/lp\/)/.test(css))
  throw new Error("An unresolved external/root CSS resource remains.");
const manifest = [];
for (const resource of [...assets].sort()) {
  const source = path.join(root, "public", resource);
  const destination = path.join(out, resource);
  if (!fs.existsSync(source)) throw new Error(`Missing native asset ${resource}`);
  const bytes = fs.readFileSync(source);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
  manifest.push({ path: resource.slice(1), bytes: bytes.length, sha256: sha(bytes) });
}
const template = fs.readFileSync(path.join(here, "ciaac-portable-review.html"), "utf8");
const html = template
  .replace("/*__REVIEW_CSS__*/", () => css.replace(/<\/style/gi, "<\\/style"))
  .replace("/*__REVIEW_JS__*/", () => js.replace(/<\/script/gi, "<\\/script"));
if (/<script[^>]*\b(?:src=|type=["']module)/i.test(html))
  throw new Error("Review must remain a single inline classic script.");
fs.writeFileSync(path.join(out, "ABRIR-REVISION.html"), html);
const modules = JSON.parse(
  fs.readFileSync(path.join(buildDir, "review-build-modules.json"), "utf8"),
);
fs.writeFileSync(
  path.join(out, "verification-manifest.json"),
  JSON.stringify(
    {
      package: "CIAAC AM06–10 local-only review",
      builtAt: new Date().toISOString(),
      nativeComponents: [
        "LearningPathExperience",
        "CiaacApprovedAircraftLearningPath",
        "HandbookLearningPath",
        "ApprovedAircraftTeachingBoard",
        "ApprovedPropellerDiagram",
      ],
      dummyUser: "ciaac-approved-local-review-only",
      sessionStoragePrefix: "ciaac_review_am06_am10_v1:",
      completion: "local boolean callback and isolated dummy journey only",
      externalNetwork:
        "connect-src none; no server/account/reward/report modules; deliberate source-link clicks only",
      lessonDocuments: lessons.map((lesson) => ({
        code: lesson.code,
        id: lesson.id,
        title: documents[lesson.id].title,
        stageCount: documents[lesson.id].stages.length,
        questionCount: documents[lesson.id].questions.length,
        contentSha256: sha(JSON.stringify(documents[lesson.id])),
      })),
      files: [
        { path: "ABRIR-REVISION.html", bytes: Buffer.byteLength(html), sha256: sha(html) },
        ...manifest,
      ],
      embeddedFonts: [...fonts].sort().map((resource) => {
        const bytes = fs.readFileSync(path.join(root, "public", resource));
        return { source: resource, bytes: bytes.length, sha256: sha(bytes) };
      }),
      sourceModules: modules,
      browserQa:
        "Not performed. Real Chromium launch was previously denied; this package does not bypass that restriction.",
    },
    null,
    2,
  ),
);
console.log(
  `Built ${out}: ${assets.size} local image/SVG assets, ${fonts.size} embedded fonts, ${Buffer.byteLength(html)} HTML bytes.`,
);
