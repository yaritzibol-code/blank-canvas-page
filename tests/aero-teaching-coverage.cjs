const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const file = (relative) => path.join(root, relative);
const read = (relative) => fs.readFileSync(file(relative), "utf8");

// Transpile the actual application TSX and mount it with React DOM in jsdom.
// Only persistence and the outer navigation hook are stubbed; no live account or network.
const compiledScripts = new Map();
function loader(stubs = {}) {
  const cache = new Map();
  return function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith(".css")) return {};
    if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
    const mod = { exports: {} };
    cache.set(filename, mod);
    const stamp = `${filename}:${fs.statSync(filename).mtimeMs}`;
    if (!compiledScripts.has(stamp))
      compiledScripts.set(
        stamp,
        ts.transpileModule(fs.readFileSync(filename, "utf8"), {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
      );
    const js = compiledScripts.get(stamp);
    const localRequire = (request) => {
      if (Object.hasOwn(stubs, request)) return stubs[request];
      if (!request.startsWith(".") && !request.startsWith("@/")) return require(request);
      const resolved = request.startsWith("@/")
        ? file(`src/${request.slice(2)}`)
        : path.resolve(path.dirname(filename), request);
      const dependency = [resolved, `${resolved}.ts`, `${resolved}.tsx`, `${resolved}.json`].find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      );
      assert.ok(dependency, `Unresolved ${request}`);
      return load(dependency);
    };
    vm.runInThisContext(`(function(require, module, exports) {${js}\n})`, { filename })(
      localRequire,
      mod,
      mod.exports,
    );
    return mod.exports;
  };
}
const React = require(root+'/node_modules/react');
const {renderToStaticMarkup} = require(root+'/node_modules/react-dom/server');
const {JSDOM} = require(root+'/node_modules/jsdom');
const load=loader();
const {CIAAC_LEARNING_PATHS}=load(file('src/lib/lp/ciaac-content.ts'));
const {AeroConceptVisual,hasAeroConcept,AERO_CONCEPTS}=load(file("src/components/lp/AeroConceptVisual.tsx"));
const {AircraftHandbookVisual}=load(file('src/components/lp/CiaacAircraftHandbookVisual.tsx'));
const {CiaacModuleOneHandbookVisual}=load(file('src/components/lp/CiaacModuleOneHandbookVisual.tsx'));
const {BoundaryFlowMedia}=load(file('src/components/lp/BoundaryFlowMedia.tsx'));
const {CiaacAerodynamicsVisual}=load(file('src/components/lp/CiaacAerodynamicsVisual.tsx'));
const {CiaacAerodynamicsModulesFourFiveVisual}=load(file('src/components/lp/CiaacAerodynamicsModulesFourFiveVisual.tsx'));
const {CiaacAerodynamicsModulesSixSevenVisual}=load(file('src/components/lp/CiaacAerodynamicsModulesSixSevenVisual.tsx'));
const {CiaacAerodynamicsModuleEightVisual}=load(file('src/components/lp/CiaacAerodynamicsModuleEightVisual.tsx'));
const rows=[];const docs=[];const words=s=>(s||'').trim().split(/\s+/).filter(Boolean).length;
for (const [id,doc] of Object.entries(CIAAC_LEARNING_PATHS).filter(([id])=>id.startsWith('ciaac/aerodinamica/'))) {
 docs.push({id,chapter:doc.chapter,number:doc.number,title:doc.title});
 doc.stages.forEach((stage,index)=>{
 if(stage.kind!=='content')return;
 let component,props={module:doc.chapter,lesson:doc.number,stage:index,nav:stage.nav,kind:stage.kind};
 if(doc.chapter===1&&doc.number===1) {component=AircraftHandbookVisual; if(!([1,2,3,4,8].includes(index))) component=null;}
 else if(doc.chapter===1) {component=doc.number===3&&stage.visualStage===1?BoundaryFlowMedia:CiaacModuleOneHandbookVisual; props={lesson:doc.number,group:stage.visualStage};}
 else if(doc.chapter<=3)component=CiaacAerodynamicsVisual;
 else if(doc.chapter<=5)component=CiaacAerodynamicsModulesFourFiveVisual;
 else if(doc.chapter<=7)component=CiaacAerodynamicsModulesSixSevenVisual;
 else component=CiaacAerodynamicsModuleEightVisual;
 if(hasAeroConcept(doc.chapter,doc.number,stage.nav)){component=AeroConceptVisual;props={module:doc.chapter,lesson:doc.number,nav:stage.nav,kind:stage.kind};}
 const html=component?renderToStaticMarkup(React.createElement(component,props)):'';
 const dom=new JSDOM(html).window.document;
 const figures=(stage.figures??[]).map(f=>doc.figures.find(d=>d.number===f.number)??f);
 const media=dom.querySelectorAll('svg,img,video,canvas').length+figures.filter(f=>f.file).length;
 const textWords=stage.cards.reduce((sum,c)=>sum+words(c.text),0);
 rows.push({id,module:doc.chapter,lesson:doc.number,title:doc.title,stage:index,nav:stage.nav,cardCount:stage.cards.length,visibleWords:textWords,detailWords:stage.cards.reduce((sum,c)=>sum+words(c.detailText),0),maxCardWords:Math.max(0,...stage.cards.map(c=>words(c.text))),media,empty:!html,htmlDiagram:!!dom.querySelector("figure,dl,.aero-formula,.aircraft-timeline"),interactive:!!dom.querySelector("button"),svg:dom.querySelectorAll('svg').length,img:dom.querySelectorAll('img').length,figures:figures.map(f=>f.file),animation:(doc.chapter===1&&doc.number===3&&stage.visualStage===1)||!!AERO_CONCEPTS[`${doc.chapter}/${doc.number}/${stage.nav}`]?.animated,visualLabels:dom.body.textContent.replace(/\s+/g,' ').slice(0,130)});
 });
}
assert.equal(docs.length,37,'All registered Aerodynamics LPs audited');
const explanations=rows.filter(r=>!(r.module===1&&r.lesson===1&&r.nav==='Cierre rápido'));
assert.equal(explanations.length,152);
assert.ok(explanations.every(r=>!r.empty||r.media), 'Every explanation stage has a rendered teaching visual');
for(const conceptKey of Object.keys(AERO_CONCEPTS)) assert.ok(rows.some(r=>`${r.module}/${r.lesson}/${r.nav}`===conceptKey), `Reachable concept: ${conceptKey}`);
assert.equal(rows.filter(r=>r.animation).length,22);
const focused=Object.entries(CIAAC_LEARNING_PATHS).filter(([id,d])=>id.startsWith('ciaac/aerodinamica/')&&[2,4,5].includes(d.chapter)).map(([,d])=>d).flatMap(d=>d.stages.filter(s=>s.kind==='content').flatMap(s=>s.cards)).filter(c=>c.detailText);
assert.equal(focused.length,33);assert.ok(focused.every(c=>words(c.detailText)>words(c.text)), 'Focused cards retain the full audited explanation');
const result={docs,rows};fs.mkdirSync(file('test-results'),{recursive:true});fs.writeFileSync(file('test-results/aero-teaching-audit-after.json'),JSON.stringify(result,null,2));
console.log('DOCS',docs.length,'STAGES',rows.length,'WITH MEDIA',rows.filter(r=>r.media).length,'MISSING',rows.filter(r=>!r.media).length,'ANIMATED',rows.filter(r=>r.animation).length);
for(let m=1;m<=8;m++) {const r=rows.filter(r=>r.module===m);console.log(`M${m}: LPs=${docs.filter(d=>d.chapter===m).length}, stages=${r.length}, missing=${r.filter(s=>!s.media).length}, >=180w=${r.filter(s=>s.visibleWords>=180).length}, >=300w=${r.filter(s=>s.visibleWords>=300).length}, motion=${r.filter(s=>s.animation).length}`);}
console.log('NO SVG/BITMAP (existing HTML diagrams or closing exercise)\n'+rows.filter(r=>!r.media).map(r=>`M${r.module} LP${r.lesson} [${r.stage}] ${r.nav} · ${r.visibleWords}w`).join('\n'));
console.log('DENSE TOP\n'+[...rows].sort((a,b)=>b.visibleWords-a.visibleWords).slice(0,22).map(r=>`M${r.module} LP${r.lesson} [${r.stage}] ${r.nav} · ${r.visibleWords}w /${r.cardCount} cards /media${r.media}`).join('\n'));
