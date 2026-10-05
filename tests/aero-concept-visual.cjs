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
const React = require('react'), {renderToStaticMarkup} = require('react-dom/server'), {JSDOM} = require('jsdom'), sharp = require('sharp');
const load=loader();const {AeroConceptVisual,AERO_CONCEPTS}=load(file('src/components/lp/AeroConceptVisual.tsx'));
(async()=>{
const out=file('test-results/aero-concepts');fs.mkdirSync(out,{recursive:true});const tiles=[];
for(const [index,[key,concept]] of Object.entries(AERO_CONCEPTS).entries()){
 const [m,l,...nav]=key.split('/');const props={module:+m,lesson:+l,nav:nav.join('/'),kind:'content'};
 const html=renderToStaticMarkup(React.createElement(AeroConceptVisual,props));const d=new JSDOM(html).window.document;
 assert.ok(d.querySelector('svg'));assert.ok(d.querySelector('svg path,svg circle,svg rect'));
 assert.equal(d.querySelectorAll('button').length,concept.animated?1:0);
 assert.match(d.body.textContent,/Esquema original/);
 assert.equal(renderToStaticMarkup(React.createElement(AeroConceptVisual,{...props,kind:'quiz'})),'');
 const svg=d.querySelector('svg').outerHTML.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace(/<text /g,'<text fill="#edf3fa" font-family="sans-serif" font-size="16" ');
 const png=await sharp(Buffer.from(svg)).flatten({background:'#10263b'}).png().toBuffer();await fs.promises.writeFile(path.join(out,`${index}-${concept.scene}.png`),png);
 const title=Buffer.from(`<svg width="350" height="22"><rect width="350" height="22" fill="#10263b"/><text x="5" y="16" fill="#e7c77b" font-size="12">${index}. M${m} L${l} ${concept.scene} ${concept.variant||''}</text></svg>`);
 const tile=await sharp({create:{width:350,height:152,channels:4,background:'#10263b'}}).composite([{input:await sharp(png).resize(350,130).toBuffer(),top:22,left:0},{input:title,top:0,left:0}]).png().toBuffer();tiles.push(tile);
}
for(let page=0;page<Math.ceil(tiles.length/12);page++){const batch=tiles.slice(page*12,(page+1)*12);await sharp({create:{width:1050,height:Math.ceil(batch.length/3)*152,channels:4,background:'#10263b'}}).composite(batch.map((input,i)=>({input,left:i%3*350,top:Math.floor(i/3)*152}))).png().toFile(path.join(out,`contact-${page}.png`));}
const dom=new JSDOM('<div id="root"></div>',{url:'https://example.test'});global.window=dom.window;global.document=dom.window.document;global.HTMLElement=dom.window.HTMLElement;global.IS_REACT_ACT_ENVIRONMENT=true;
let frame,listener,reduced=false;window.matchMedia=()=>({get matches(){return reduced},addEventListener:(_,fn)=>listener=fn,removeEventListener(){}});window.requestAnimationFrame=fn=>{frame=fn;return 1};window.cancelAnimationFrame=()=>{frame=undefined};
const {createRoot}=require('react-dom/client');let rootNode=createRoot(document.getElementById('root'));let checked=0;
for(const [key,concept] of Object.entries(AERO_CONCEPTS).filter(([,c])=>c.animated)){
 const [m,l,...nav]=key.split('/');const props={module:+m,lesson:+l,nav:nav.join('/'),kind:'content'};
 await React.act(async()=>rootNode.render(React.createElement(AeroConceptVisual,{...props,key})));
 const svg=document.querySelector('svg');const before=svg.innerHTML;assert.equal(document.querySelector('button').getAttribute('aria-pressed'),'false');
 await React.act(async()=>document.querySelector('button').click());
 for(let i=0;i<6;i++)await React.act(async()=>frame(i*50));
 assert.notEqual(svg.innerHTML,before,`Actual geometry changes: ${key}`);
 await React.act(async()=>document.querySelector('button').click());assert.equal(frame,undefined);
 const paused=svg.innerHTML;assert.equal(svg.innerHTML,paused);
 await React.act(async()=>document.querySelector('button').click());assert.ok(frame);
 reduced=true;await React.act(async()=>listener());assert.equal(frame,undefined);assert.equal(document.querySelector('button').getAttribute('aria-pressed'),'false');reduced=false;await React.act(async()=>listener());await React.act(async()=>document.querySelector('button').click());
 await React.act(async()=>rootNode.render(React.createElement(AeroConceptVisual,{...props,key,kind:'quiz'})));assert.equal(document.querySelector('svg'),null);assert.equal(frame,undefined);
 checked++;
}
await React.act(async()=>rootNode.unmount());assert.equal(frame,undefined);
console.log(`PASS: ${checked} actual DOM animations change geometry, pause/resume and stop on quiz navigation/unmount.`);
console.log(`PASS: ${Object.keys(AERO_CONCEPTS).length} topic-mapped visuals, scientific captions, motion controls, quiz exclusion, raster contact sheets.`);
})().catch(e=>{console.error(e);process.exitCode=1});
