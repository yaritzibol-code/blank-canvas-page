/** Test-only module loader. No production auth, database, network or credentials. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const allowed = new Set([
  "src/lib/store/domain.ts",
  "src/lib/store/learning-course.ts",
  "src/lib/store/library-progress.ts",
  "src/lib/store/compass.ts",
  "src/lib/store/rtari.ts",
  "src/lib/store/analytics.ts",
  "src/lib/store/materias.ts",
  "src/lib/store/linea-aerea-meta.ts",
  "src/modules/compass/config.ts",
  "src/modules/rtari/icao.ts",
]);
function isolatedStore() {
  const data = new Map();
  const cache = new Map();
  const evidence = [];
  let sequence = 0;
  const copy = (value) => structuredClone(value);
  const db = {
    read: (key, fallback) => copy(data.has(key) ? data.get(key) : fallback),
    write: (key, value) => data.set(key, copy(value)),
    update: (key, fallback, fn) => db.write(key, fn(db.read(key, fallback))),
    uid: (prefix) => `${prefix}_fixture_${++sequence}`,
    nowISO: () => new Date(Date.now() + sequence).toISOString(),
    todayKey: (date = new Date()) => date.toISOString().slice(0, 10),
  };
  function load(relative) {
    assert.ok(allowed.has(relative), `Module not approved for isolated execution: ${relative}`);
    if (cache.has(relative)) return cache.get(relative).exports;
    const module = { exports: {} };
    cache.set(relative, module);
    const source = ts.transpileModule(fs.readFileSync(path.join(root, relative), "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const localRequire = (name) => {
      if (name === "./db") return db;
      if (name === "./auth") return { getUsers: () => [] };
      if (name === "@/modules/data/registry") return { SUBJECT_TEMAS: {} };
      if (name === "@/lib/evidence-client")
        return { captureEvidence: (...args) => evidence.push(args) };
      const resolved = name.startsWith("@/")
        ? `src/${name.slice(2)}`
        : path.posix.join(path.posix.dirname(relative), name);
      return load(`${resolved}.ts`);
    };
    // Deliberately no fetch, process, browser storage, unrestricted require or timers.
    vm.runInNewContext(
      source,
      { exports: module.exports, require: localRequire, Date, console },
      { filename: relative },
    );
    return module.exports;
  }
  return { load, db, evidence };
}
module.exports = { isolatedStore };
