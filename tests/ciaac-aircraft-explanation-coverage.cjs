const assert = require('node:assert/strict');
const fs = require('node:fs');
const docs = JSON.parse(fs.readFileSync('src/lib/lp/ciaac-aircraft-engines.content.json','utf8'));
const baseline = JSON.parse(fs.readFileSync('tests/fixtures/aircraft-explanation-invariants.json','utf8'));
assert.deepEqual(Object.keys(docs).sort(),Object.keys(baseline).sort());
const used = new Set(); let stages = 0; let maxCard = 0;
for (const [id,d] of Object.entries(docs)) {
 const previous=baseline[id];
 assert.equal(d.minutes,previous.minutes,'Keep topic-appropriate duration');
 assert.deepEqual(d.stages.map(s=>s.kind),previous.stageKinds,'Preserve progression indexes');
 assert.equal(d.questions.length,previous.questionCount);
 assert.equal(d.exercise?.kind,previous.exerciseKind || undefined);
 for (const [index,s] of d.stages.entries()) {
  if(s.kind!=='content')continue;
  stages++;
  assert.ok(s.figures.length>0,`${id} stage ${index}: every explanation needs a relevant visual`);
  for(const f of s.figures){
   assert.ok(!used.has(f.file),`${id}: do not repeat a generic figure across explanation stages`);used.add(f.file);
   assert.ok(f.alt.length>25 && f.observe.length>20);
   const svg=fs.readFileSync(`public${f.file}`,'utf8');
   assert.match(svg,/<(?:path|line|circle|ellipse|polygon|polyline)\b/,'Diagram must contain visual geometry, not just prose boxes');
  }
  for(const c of s.cards){
   const words=c.text.trim().split(/\s+/).length; maxCard=Math.max(maxCard,words);
   assert.ok(words<=65,`${id} stage ${index}: ${words}-word wall remains`);
  }
 }
}
assert.equal(stages,105);
assert.ok(new Set(Object.values(docs).map(d=>d.minutes)).size>1);
console.log(`PASS: ${stages} explanation stages have distinct teaching visuals; visible cards ≤${maxCard} words; progression and varied durations preserved.`);
