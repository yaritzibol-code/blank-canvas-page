const assert = require("node:assert/strict");
const fs = require("node:fs");
const { JSDOM } = require("jsdom");
const {
  manifest,
  docs,
  file,
  idFor,
  stageText,
  validateLayer,
} = require("./helpers/flightpath-original-mi.cjs");
validateLayer();
const svg = (name) => fs.readFileSync(file(`public/flightpath-original/mi/${name}.svg`), "utf8");
for (const row of manifest.assets) {
  const raw = fs.readFileSync(file(row.file), "utf8");
  const dom = new JSDOM(raw, { contentType: "image/svg+xml" }).window.document;
  const el = dom.documentElement;
  assert.equal(el.tagName, "svg");
  assert.equal(el.getAttribute("role"), "img");
  assert.equal(el.getAttribute("aria-labelledby"), "title desc");
  assert.ok(dom.querySelector("title")?.textContent.trim());
  assert.ok(dom.querySelector("desc")?.textContent.trim());
  assert.match(raw, /Ejemplo ficticio/);
  assert.match(raw, /No usar para navegación/);
  assert.doesNotMatch(
    raw,
    /<(?:script|image|foreignObject)\b|\bon\w+=|(?:href|src)=|data:image|libfile_|\/workspace\/|drive\.google|docs\.google|copyright|jeppesen/i,
  );
  assert.match(el.getAttribute("viewBox"), /^0 0 600 \d+$/);
  for (const t of dom.querySelectorAll("text"))
    assert.ok(Number(t.getAttribute("font-size")) >= 18, "No microscopic vector text");
}
for (const n of [4, 7, 8, 9, 10]) {
  const d = docs[idFor(n)];
  assert.doesNotMatch(JSON.stringify(d.figures), /\/ciaac-approved\/mi\/[^" ]+\.png/);
  assert.ok(d.sources.some((s) => s.id === "flightpath-original-mi-20261010"));
  assert.ok(!d.sources.some((s) => /-img-|jepp-historical/.test(s.id)));
  for (const f of d.figures.filter((x) => x.file.startsWith("/flightpath-original/"))) {
    assert.equal(f.pdf_page, 0);
    assert.equal(f.crop, undefined);
    assert.match(f.alt, /ficticio/);
    const el = new JSDOM(svg(f.file.split("/").at(-1).replace(".svg", "")), {
      contentType: "image/svg+xml",
    }).window.document.documentElement;
    const [, , width, height] = el.getAttribute("viewBox").split(" ").map(Number);
    assert.equal(f.assetAspectRatio, width / height);
  }
}
// Every changed answer is supported by explicitly displayed fictional data.
assert.deepEqual(docs[idFor(4)].exercise.pairs, [
  ["Ladera · elevación", "2,240 ft MSL"],
  ["Ladera · localizador", "LOC-L · 111.3 MHz"],
  ["Alba · elevación", "1,520 ft MSL"],
  ["Horarios solares fechados", "AIP/PIA GEN 2.7"],
]);
for (const v of ["2,240", "111.3", "2,220"]) assert.ok(svg("identity-ladera").includes(v));
assert.match(svg("identity-alba"), /1,520/);
assert.match(stageText("MI04-07"), /2,240[\s\S]*111\.3[\s\S]*1,520[\s\S]*GEN 2\.7/);
assert.match(svg("solar-record"), /15 JUN 2030[\s\S]*06:10 Z \/ 18:15 Z/);
assert.equal(1700 - 1500, 200);
assert.equal(1900 - 1500, 400);
assert.equal(2120 - 1520, 600);
assert.equal(2220 - 1520, 700);
assert.deepEqual(docs[idFor(7)].exercise.pairs, [
  ["DA(H) ILS de Alba", "1,700 ft (200 ft)"],
  ["Localizador LOC-A", "110.9 MHz"],
  ["Trayectoria inicial de frustrada", "Track 090° a SALIDA"],
  ["Cruce en RETORNO", "A o por encima de 4,000 ft"],
]);
assert.match(
  stageText("MI07-07"),
  /1,700 − 1,500 = 200[\s\S]*090°[\s\S]*SALIDA[\s\S]*RETORNO[\s\S]*4,000/,
);
for (const v of ["1,700", "200", "1,900", "400", "2,120", "600", "2,220", "700"])
  assert.ok(svg("approach-minima").includes(v));
assert.match(svg("approach-plan"), /090°[\s\S]*4,000/);
assert.match(svg("approach-missed"), /090° hasta SALIDA[\s\S]*izquierda[\s\S]*RETORNO[\s\S]*4,000/);
assert.match(stageText("MI07-03"), /radio 25 NM[\s\S]*norte 4,000[\s\S]*sur 5,000/);
assert.equal(2700 - 2220, 480);
assert.notEqual(2700 - 2210, 480, "TDZE is not threshold");
assert.equal(2840 - 2240, 600);
assert.equal(2940 - 2240, 700);
assert.equal(3040 - 2240, 800);
assert.deepEqual(docs[idFor(8)].exercise.pairs, [
  ["LOC directo Ladera", "MDA 2,700 ft"],
  ["Altura publicada sobre TDZE", "480 ft"],
  ["Circling A/B Ladera", "2,840 ft · 1 SM"],
  ["RNAV Alba", "GNSS requerido en la ficha"],
]);
for (const v of ["2,700", "480", "2,840", "600", "2,940", "700", "3,040", "800"])
  assert.ok(svg("types-minima").includes(v));
assert.match(stageText("MI08-07"), /2,700 − 2,220 = 480 ft sobre TDZE/);
assert.match(svg("types-profile"), /2,220[\s\S]*2,210/);
for (const v of ["1,850", "350", "2,000", "500"]) assert.ok(svg("rnp-minima").includes(v));
assert.match(svg("rnp-briefing"), /GNSS requerido[\s\S]*−5 °C/);
assert.match(stageText("MI08-06"), /GNSS[\s\S]*1,850[\s\S]*2,000[\s\S]*−5 °C/);
assert.deepEqual(docs[idFor(9)].exercise.pairs, [
  ["Estación del arco", "AULA-DME · 114.8 MHz"],
  ["Radio", "10.0 NM DME"],
  ["Tramo este", "7,000 ft MSL"],
  ["Transición D10.0 a D8.0", "210° · 2.0 NM · D8 a 5,800 ft"],
]);
assert.match(
  stageText("MI09-02"),
  /VOR\/DME ficticio[\s\S]*114\.8[\s\S]*10\.0 NM[\s\S]*6,200[\s\S]*5,800[\s\S]*D5\.0[\s\S]*D4\.7 LOC-ARC[\s\S]*4,800/,
);
assert.match(svg("arc-profile"), /D10[\s\S]*6,200[\s\S]*5,800[\s\S]*4,800/);
assert.match(stageText("MI09-06"), /después del IF a 5,800/);
assert.doesNotMatch(stageText("MI09-02"), /LOC-A(?!RC)/);
assert.equal(Math.sqrt(10 ** 2 - (3000 / 6076.12) ** 2).toFixed(2), "9.99");
assert.match(stageText("MI09-01"), /9\.99 NM/);
assert.deepEqual(docs[idFor(10)].exercise.pairs, [
  ["Espera ficticia AULA", "Virajes a la izquierda"],
  ["Inbound de la espera", "090°"],
  ["Outbound de la espera", "270°"],
  ["Altitud del circuito", "6,000 ft MSL"],
]);
assert.match(svg("holding-left"), /Outbound 270°[\s\S]*Inbound 090°[\s\S]*6,000/);
assert.match(svg("holding-missed"), /R120[\s\S]*D4[\s\S]*izquierda[\s\S]*6,000/);
assert.match(stageText("MI10-02"), /inbound 090°[\s\S]*outbound 270°[\s\S]*6,000/);
assert.equal((90 + 180) % 360, 270);
console.log(
  "PASS MI original vectors: 29 PNG retired, 25 dependencies replaced, 24 accessible SVGs, five coherent assessments, datums, DME, holding geometry and canonical mirrors.",
);
