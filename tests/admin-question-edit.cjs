/** Regression test: real React/DOM, with all cloud reads and writes mocked. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { JSDOM } = require("jsdom");

const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost" });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require("react");
const { createRoot } = require("react-dom/client");
const { act } = React;

const original = {
  id: "test-question-1", text: "Original question", options: ["One", "Two", "Three"],
  correctIndex: 0, explanation: "Original explanation", cite: "Original reference",
  status: "borrador", imagenes: ["test-image.svg"], materia: "test",
};
const reads = [], writes = [], remembered = [], flashes = [];
let closes = 0, saveError = null;
const modules = {
  react: React,
  "react/jsx-runtime": require("react/jsx-runtime"),
  "@/components/ui/fp-icon": { Icon: () => null },
  "@/components/banco/QuestionImages": { QuestionImages: () => null },
  "@/components/admin/AdminShell": { inputStyle: {}, labelStyle: {} },
  "@/lib/store/linea-aerea-meta": { capLabel: () => "Chapter" },
  "@/lib/store": { rememberQuestion: (q) => remembered.push(q) },
  "@/integrations/supabase/client": {
    supabase: { from(table) {
      assert.equal(table, "content");
      const filters = {};
      return {
        select() { return this; },
        eq(key, value) { filters[key] = value; return this; },
        maybeSingle() {
          assert.equal(filters.collection, "questions");
          return new Promise(resolve => reads.push({ id: filters.id, resolve }));
        },
        async upsert(payload) { writes.push(payload); return { error: saveError }; },
      };
    } },
  },
};
const source = fs.readFileSync(path.join(__dirname, "../src/components/admin/QuestionEditModal.tsx"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
} }).outputText;
const context = { exports: {}, require(name) {
  assert.ok(name in modules, `Unexpected import: ${name}`);
  return modules[name];
} };
vm.runInNewContext(compiled, context);
const { QuestionEditModal } = context.exports;
const root = createRoot(document.getElementById("root"));
let props = { questionId: original.id, snapshot: structuredClone(original),
  onClose: () => closes++, onFlash: (...args) => flashes.push(args) };
const render = async (next = {}) => {
  props = { ...props, ...next };
  await act(async () => root.render(React.createElement(QuestionEditModal, props)));
};
const resolveRead = async (index, data) => {
  await act(async () => reads[index].resolve({ data: data ? { data } : null }));
};
const fields = () => [...document.querySelectorAll("textarea, input:not([type=radio]), select")];
const edit = async (index, value) => {
  const field = fields()[index];
  await act(async () => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), "value").set.call(field, value);
    field.dispatchEvent(new dom.window.Event(field.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
  });
  assert.equal(fields()[index].value, value);
};
const click = async (text) => {
  const button = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === text);
  assert.ok(button, text);
  await act(async () => button.click());
};

(async () => {
  await render();
  assert.equal(reads.length, 1);
  // A refreshed report during the initial fetch must not start another fetch.
  await render({ snapshot: structuredClone(original) });
  assert.equal(reads.length, 1);
  await resolveRead(0, structuredClone(original));
  const draft = ["Unsaved question", "Edited A", "Edited B", "Edited C", "Unsaved explanation", "Unsaved reference", "oculta"];
  for (let i = 0; i < draft.length; i++) await edit(i, draft[i]);
  await act(async () => document.querySelectorAll('input[type="radio"]')[1].click());
  const input = fields()[0];
  input.focus();
  input.setSelectionRange(3, 3);
  for (let i = 0; i < 4; i++) {
    await render({ snapshot: { ...structuredClone(original), text: `Remote revision ${i}` } });
    assert.equal(reads.length, 1);
    assert.deepEqual(fields().map(f => f.value), draft);
    assert.equal(fields()[0], input, "Input must not unmount/flicker");
    assert.equal(document.activeElement, input);
    assert.equal(input.selectionStart, 3);
    assert.equal(document.querySelectorAll('input[type="radio"]')[1].checked, true);
  }
  assert.equal(writes.length, 0, "Typing and refresh must never autosave");
  saveError = { message: "Simulated failure" };
  await click("Guardar cambios");
  assert.equal(closes, 0);
  assert.equal(remembered.length, 0);
  assert.deepEqual(fields().map(f => f.value), draft);
  assert.equal(flashes.at(-1)[1], true);
  saveError = null;
  await click("Guardar cambios");
  const saved = writes.at(-1);
  assert.equal(saved.collection, "questions");
  assert.equal(saved.id, original.id);
  assert.equal(saved.data.text, draft[0]);
  assert.deepEqual(Array.from(saved.data.options), draft.slice(1, 4));
  assert.equal(saved.data.explanation, draft[4]);
  assert.equal(saved.data.cite, draft[5]);
  assert.equal(saved.data.status, draft[6]);
  assert.equal(saved.data.correctIndex, 1);
  assert.deepEqual(saved.data.imagenes, original.imagenes);
  assert.equal(remembered.length, 1);
  assert.equal(flashes.at(-1)[0], "Pregunta actualizada");
  assert.equal(closes, 1);

  await act(async () => root.render(null));
  await render();
  await resolveRead(1, structuredClone(original));
  assert.equal(fields()[0].value, original.text, "Reopening loads a fresh draft");
  await edit(0, "Cancelled edit");
  const writesBeforeCancel = writes.length;
  await click("Cancelar");
  assert.equal(writes.length, writesBeforeCancel);
  assert.equal(closes, 2);

  // Changing questions discards the previous load, including late responses.
  const second = { ...original, id: "test-question-2", text: "Second question" };
  const third = { ...original, id: "test-question-3", text: "Third question" };
  await render({ questionId: second.id, snapshot: second });
  await render({ questionId: third.id, snapshot: third });
  await resolveRead(3, third);
  await edit(0, "Third question draft");
  await resolveRead(2, second);
  assert.equal(fields()[0].value, "Third question draft");

  // Snapshot fallback also remains stable when the report is refreshed.
  const fallback = { ...original, id: "test-missing", text: "Opening snapshot" };
  await render({ questionId: fallback.id, snapshot: fallback });
  await render({ snapshot: { ...fallback, text: "New report snapshot" } });
  await resolveRead(4, null);
  assert.equal(fields()[0].value, "Opening snapshot");
  await edit(0, "Fallback draft");
  await render({ snapshot: structuredClone(fallback) });
  assert.equal(reads.length, 5);
  assert.equal(fields()[0].value, "Fallback draft");
  await act(async () => root.unmount());
  dom.window.close();
  console.log("Admin editor: draft/focus survive refresh; save success/failure, cancel, reopen, question switch, stale response and fallback pass. All cloud operations mocked.");
})().catch(error => { console.error(error); process.exitCode = 1; });
