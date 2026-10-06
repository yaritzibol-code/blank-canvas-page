const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { JSDOM } = require("jsdom");

// DOM, source and geometry checks only. No browser, viewport-pixel validation,
// network calls, lesson text substitutions, fixture writes or progress changes.
const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/components/lp/ApprovedPropellerDiagram.tsx");
const css = fs.readFileSync(
  path.join(root, "src/components/lp/ciaac-propeller-diagrams.css"),
  "utf8",
);
const source = fs.readFileSync(file, "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;
const mod = { exports: {} };
vm.runInThisContext(`(function(require, module, exports) {${code}\n})`, { filename: file })(
  (request) => (request.endsWith(".css") ? {} : require(request)),
  mod,
  mod.exports,
);
const Diagram = mod.exports.ApprovedPropellerDiagram;
const figure = Object.freeze({
  number: "AM09-v2",
  chapter: 9,
  topic: 1,
  anchor: 0,
  pdf_page: 0,
  file: "/test/propeller-master-v2.png",
  alt: "Hélice de dos palas, vista oblicua frontal, eje proyectado arriba a la izquierda.",
  observe: "Texto del origen conservado por la lección.",
  caption: "Ilustración original de referencia.",
});
const original = JSON.stringify(figure);
const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: "https://example.test/" });
Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = require("react-dom/client");
const reactRoot = createRoot(document.getElementById("root"));
const zooms = [];
const render = (mode, extra = {}) =>
  React.act(() =>
    reactRoot.render(
      React.createElement(Diagram, {
        mode,
        figure,
        onZoom: (value) => zooms.push(value),
        ...extra,
      }),
    ),
  );
const click = (button) => React.act(() => button.click());
const key = (button, value) =>
  React.act(() =>
    button.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }),
    ),
  );
const selectors = () => [...document.querySelectorAll(".am-propeller__selectors button")];
const press = (index) => {
  assert.deepEqual(
    selectors().map((button) => button.getAttribute("aria-pressed")),
    selectors().map((_, i) => String(i === index)),
  );
  assert.ok(
    document.querySelector('[role="status"]').textContent.includes(selectors()[index].textContent),
  );
};
const vector = (line) => ({
  x: Number(line.getAttribute("x2")) - Number(line.getAttribute("x1")),
  y: Number(line.getAttribute("y2")) - Number(line.getAttribute("y1")),
});
const close = (a, b, label) => assert.ok(Math.abs(a - b) < 1e-7, `${label}: ${a} ≈ ${b}`);
const parallelForward = (line, reference, label) => {
  const v = vector(line);
  close(v.x * reference.y - v.y * reference.x, 0, `${label}: parallel`);
  assert.ok(v.x * reference.x + v.y * reference.y > 0, `${label}: same direction`);
};
const checkSvgReferences = () => {
  const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
  assert.equal(new Set(ids).size, ids.length, "Instance-specific SVG, panel and accessibility IDs");
  for (const node of document.querySelectorAll("[aria-labelledby], [aria-controls]")) {
    for (const id of (
      node.getAttribute("aria-labelledby") || node.getAttribute("aria-controls")
    ).split(/\s+/))
      assert.ok(document.getElementById(id), `Resolved accessible reference ${id}`);
  }
  for (const node of document.querySelectorAll("[marker-end], [marker-start]")) {
    for (const attr of ["marker-end", "marker-start"]) {
      const ref = node.getAttribute(attr);
      if (ref) assert.ok(document.getElementById(ref.slice(5, -1)), `Resolved arrow marker ${ref}`);
    }
  }
};
const checkStaticMaster = (expected) => {
  const img = document.querySelector("img");
  assert.equal(
    img.outerHTML,
    expected,
    "Controls never rotate, mirror, deform, crop or swap the raster",
  );
  assert.equal(img.getAttribute("src"), figure.file);
  assert.equal(img.getAttribute("alt"), figure.alt);
  assert.equal(img.closest("[hidden], [aria-hidden=true]"), null);
};

(async () => {
  try {
    for (const mode of ["geometry", "pitch", "forces"]) {
      const markup = renderToStaticMarkup(React.createElement(Diagram, { mode, figure }));
      assert.ok(markup.includes(`data-propeller-mode="${mode}"`));
      assert.ok(markup.includes('width="1536" height="1024"'));
      assert.ok(markup.includes(figure.file));
      assert.ok(!markup.includes("Ampliar ilustración"), "No dead zoom button without callback");
      assert.ok(
        !markup.includes("am-propeller__source"),
        "Containing lesson owns citations unless explicitly supplied",
      );
    }
    assert.match(css, /width: min\(100%, 66vh, 42rem\)/);
    assert.match(css, /aspect-ratio: 1\.5/);
    assert.match(css, /object-fit: contain/);
    assert.match(css, /min-height: 44px/);
    assert.match(css, /:focus-visible/);
    assert.match(css, /prefers-reduced-motion: reduce/);
    assert.doesNotMatch(css, /@keyframes|\btransform\s*:/);
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|setInterval|requestAnimationFrame|supabase|onComplete|setProgress/,
    );

    await render("geometry");
    const master = document.querySelector("img").outerHTML;
    let angles = [];
    assert.equal(document.querySelectorAll("img").length, 1);
    for (let index = 0; index < 3; index++) {
      await click(selectors()[index]);
      press(index);
      checkStaticMaster(master);
      const selected = document.querySelectorAll('[data-station][data-selected="true"]');
      assert.equal(selected.length, 1);
      assert.equal(selected[0].dataset.station, String(index));
      const section = document.querySelector("[data-section]");
      assert.equal(section.dataset.section, String(index));
      const chord = section.querySelector("[data-chord]");
      const plane = section.querySelector("[data-rotation-plane]");
      close(
        Number(plane.getAttribute("y1")),
        Number(chord.getAttribute("y1")),
        "Rotation-plane trace crosses chord origin",
      );
      close(
        Number(plane.getAttribute("y1")),
        Number(plane.getAttribute("y2")),
        "Rotation plane is the horizontal section reference",
      );
      const v = vector(chord);
      angles.push(Math.atan2(v.y, v.x));
      const ends = [...section.querySelectorAll(".am-propeller__edge")];
      for (const [i, edge] of ends.entries()) {
        close(
          Number(edge.getAttribute("cx")),
          Number(chord.getAttribute(`x${i + 1}`)),
          "Chord meets airfoil edge, x",
        );
        close(
          Number(edge.getAttribute("cy")),
          Number(chord.getAttribute(`y${i + 1}`)),
          "Chord meets airfoil edge, y",
        );
      }
      const nums = section
        .querySelector("[data-angle-arc]")
        .getAttribute("d")
        .match(/-?\d+(?:\.\d+)?/g)
        .map(Number);
      const origin = { x: Number(chord.getAttribute("x1")), y: Number(chord.getAttribute("y1")) };
      close(nums[0] - origin.x, 52, "Angle arc starts on rotation-plane trace");
      close(nums[1], origin.y, "Angle arc start y");
      const arcVector = { x: nums.at(-2) - origin.x, y: nums.at(-1) - origin.y };
      close(Math.hypot(arcVector.x, arcVector.y), 52, "Circular angle arc radius");
      close(
        arcVector.x * v.y - arcVector.y * v.x,
        0,
        "Angle arc ends on chord, not an arbitrary raster edge",
      );
      checkSvgReferences();
    }
    assert.ok(
      angles[0] > angles[1] && angles[1] > angles[2] && angles[2] > 0,
      "Qualitative twist decreases continuously root to tip",
    );
    assert.doesNotMatch(
      document.querySelector(".am-propeller").textContent,
      /\d\s*(?:°|rpm|RPM|kt|%)/,
      "No operational or measured numerical angle claim",
    );
    selectors()[2].focus();
    await key(selectors()[2], "ArrowRight");
    press(0);
    assert.equal(document.activeElement, selectors()[0]);
    await key(selectors()[0], "End");
    press(2);
    await key(selectors()[2], "Home");
    press(0);
    await key(selectors()[0], "ArrowLeft");
    press(2);
    await key(selectors()[2], "ArrowUp");
    press(1);
    await key(selectors()[1], "ArrowDown");
    press(2);
    const current = selectors()[2];
    await key(current, "Tab");
    press(2);
    assert.equal(current.type, "button");
    checkStaticMaster(master);
    await click(document.querySelector(".am-propeller__master-head button"));
    assert.equal(
      zooms.at(-1),
      figure,
      "Zoom receives exact source identity, never a schematic or transformed substitute",
    );

    await render("pitch");
    press(0);
    const pitchMaster = document.querySelector("img").outerHTML;
    const distances = [...document.querySelectorAll("[data-distance] line")];
    const [geometric, effective, slip] = distances;
    const x = (line, name) => Number(line.getAttribute(name));
    assert.equal(x(geometric, "x1"), x(effective, "x1"), "Both distances have same start");
    assert.equal(x(slip, "x1"), x(effective, "x2"), "Slip starts at actual endpoint");
    assert.equal(x(slip, "x2"), x(geometric, "x2"), "Slip ends at theoretical endpoint");
    close(
      vector(geometric).x - vector(effective).x,
      vector(slip).x,
      "Slip exactly equals difference on shared normalized scale",
    );
    assert.ok(vector(geometric).x > vector(effective).x && vector(effective).x > 0);
    const distancesBefore = distances.map((line) => line.outerHTML);
    for (let i = 1; i < 4; i++) {
      await click(selectors()[i]);
      press(i);
      assert.equal(document.querySelectorAll('[data-distance][data-emphasized="true"]').length, 1);
      assert.equal(
        document.querySelectorAll("[data-distance]").length,
        3,
        "Comparison stays simultaneous",
      );
      assert.equal(document.querySelector("[hidden]"), null);
      assert.deepEqual(
        [...document.querySelectorAll("[data-distance] line")].map((line) => line.outerHTML),
        distancesBefore,
        "Highlight does not invent a new operating condition",
      );
      checkStaticMaster(pitchMaster);
    }
    assert.match(document.querySelector(".am-propeller").textContent, /Una vuelta completa/);
    assert.match(document.querySelector(".am-propeller").textContent, /sin escala/);
    checkSvgReferences();

    await render("forces");
    press(0);
    const forceMaster = document.querySelector("img").outerHTML;
    const axial = [...document.querySelectorAll('[data-force="axial"] line')];
    const radial = [...document.querySelectorAll('[data-force="radial"] line')];
    assert.equal(axial.length, 2);
    assert.equal(radial.length, 2);
    for (const line of axial)
      parallelForward(line, { x: 213, y: 192 }, "Thrust away from aft flange, lower right");
    parallelForward(
      radial[0],
      { x: 1467 - 856, y: 80 - 392 },
      "Upper radial load points root to tip",
    );
    parallelForward(
      radial[1],
      { x: 72 - 640, y: 887 - 514 },
      "Lower radial load points root to tip",
    );
    const rv = vector(radial[0]);
    assert.ok(Math.abs(rv.x * 192 - rv.y * 213) > 1, "Radial and shaft axes remain distinct");
    const moments = [...document.querySelectorAll("[data-moment] path")];
    assert.deepEqual(
      moments.map((node) => node.dataset.sweep),
      ["1", "0"],
      "Aerodynamic increase and centrifugal decrease have opposite winding",
    );
    for (const [i, node] of moments.entries()) {
      const values = node
        .getAttribute("d")
        .match(/-?\d+(?:\.\d+)?/g)
        .map(Number);
      const center = { x: 240, y: 169 };
      const radius = i === 0 ? 90 : 115;
      for (const [px, py] of [
        [values[0], values[1]],
        [values.at(-2), values.at(-1)],
      ]) {
        assert.ok(
          Math.abs(Math.hypot(px - center.x, py - center.y) - radius) < 0.02,
          "Moment surrounds selected longitudinal blade axis",
        );
      }
      assert.ok(
        node.closest(".am-propeller__schematic"),
        "Twist arrows belong to separate section, never motor shaft or raster",
      );
    }
    for (let i = 1; i < 5; i++) {
      await click(selectors()[i]);
      press(i);
      assert.equal(
        document.querySelectorAll(
          '[data-force][data-emphasized="true"], [data-moment][data-emphasized="true"]',
        ).length,
        1,
      );
      assert.equal(document.querySelectorAll("[data-force]").length, 2);
      assert.equal(document.querySelectorAll("[data-moment]").length, 2);
      checkStaticMaster(forceMaster);
    }
    await click(selectors()[4]);
    press(4);
    await key(selectors()[4], "Home");
    press(0);
    assert.equal(
      document.querySelectorAll(
        '[data-force][data-emphasized="true"], [data-moment][data-emphasized="true"]',
      ).length,
      4,
    );
    assert.match(
      document.querySelector(".am-propeller__orientation").textContent,
      /antihorario.*de frente.*hacia atrás/,
    );
    assert.match(document.querySelector(".am-propeller").textContent, /Fuerzas seleccionadas/);
    checkSvgReferences();
    assert.equal(document.querySelector('.hb-progress, .hb-actions, [role="dialog"]'), null);
    assert.equal(JSON.stringify(figure), original, "Canonical figure is not mutated");

    const citation = {
      title: "FAA: Propellers",
      url: "https://www.faa.gov/sites/faa.gov/files/09_amtp_ch7.pdf",
    };
    await render("forces", { source: citation });
    assert.equal(
      document.querySelector(".am-propeller__source").getAttribute("href"),
      citation.url,
    );
    await React.act(() =>
      reactRoot.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(Diagram, { mode: "geometry", figure }),
          React.createElement(Diagram, { mode: "geometry", figure }),
          React.createElement(Diagram, { mode: "forces", figure }),
        ),
      ),
    );
    checkSvgReferences();
    await render("geometry");
    press(0);
    console.log(
      "PASS: propeller diagrams; source identity, unchanged raster, local keyboard controls, qualitative section geometry, one-turn distance identity, shaft/radial directions, opposite blade-axis moments, reduced-motion CSS and unique accessible SVG references. No browser or viewport-pixel validation performed.",
    );
  } finally {
    await React.act(() => reactRoot.unmount());
    dom.window.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
