import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { esPreguntaHelicoptero } from '../src/lib/store/linea-aerea-meta.ts';

const sql=readFileSync(new URL('../supabase/migrations/20260928210000_atp_2026_remaining_chapters.sql',import.meta.url),'utf8');
const questions=JSON.parse(sql.match(/\$questions\$\s*([\s\S]*?)\s*\$questions\$::jsonb/)[1]);
const oldSql=readFileSync(new URL('../supabase/migrations/20260928190000_atp_2026_regulations.sql',import.meta.url),'utf8');
const regulations=JSON.parse(oldSql.match(/\$questions\$\s*([\s\S]*?)\s*\$questions\$::jsonb/)[1]);
const expected={2:[213,207],3:[117,92],6:[216,212],7:[87,87],8:[230,230]};
assert.equal(questions.length,863);
assert.equal(new Set([...questions,...regulations].map(q=>q.id)).size,1226);
assert.equal(new Set([...questions,...regulations].map(q=>q.sourceQuestionId)).size,1226);
for(const [chapter,[total,fixed]] of Object.entries(expected)){
 const rows=questions.filter(q=>q.capitulo===+chapter);
 assert.equal(rows.length,total);
 assert.equal(rows.filter(q=>!esPreguntaHelicoptero(q)).length,fixed);
}
for(const q of questions){
 assert.equal(q.fuente,'ATP');assert.equal(q.sourceEdition,'2025–2026');assert.equal(q.status,'publicada');
 assert.ok(expected[q.capitulo]);assert.equal(q.options.length,3,q.id);
 assert.ok(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<=2,q.id);
 assert.ok(q.text.trim()&&q.explanation.trim()&&q.options.every(o=>o.trim()),q.id);
 assert.ok(q.seccion&&Number.isInteger(q.sourcePage)&&q.sourcePage>0,q.id);
 assert.ok(q.sourceCategories.every(c=>['ALL','ATM','ATS','ADX','RTC'].includes(c)),q.id);
 assert.ok(q.options.every(o=>!/\(PLT\d|FAA-H-8083|Answer \([ABC]\) is/.test(o)),q.id);
}
const lookup=n=>questions.find(q=>q.sourceQuestionId===n);
assert.deepEqual(lookup('8206').imagenes,['atp_2026_question-8206.svg']);
assert.deepEqual(lookup('9751').imagenes,['atp_2026_question-9751.svg']);
assert.deepEqual(lookup('9737').imagenes,['atp_2026_question-9737.svg']);
assert.ok(!/CONTROL TOWER|WEST RAMP|Runway Incursion Figure\. 16/.test(lookup('9737').text));
assert.equal(lookup('9831').correctIndex,2);assert.equal(lookup('9831').sourceOriginalAnswerKey,'9381 [C]');
assert.equal(lookup('9381').capitulo,2);assert.equal(lookup('9381').correctIndex,0);
assert.equal(lookup('8802').options[1],'115.');assert.equal(lookup('8802').correctIndex,1);
assert.ok(lookup('8802').explanation.includes('115 feet'));
assert.ok(lookup('8802').sourceOriginalExplanation.includes('111 feet'));
assert.ok(!lookup('9266').explanation.includes('Key to Aerodrome Forecast'));
assert.ok(lookup('9044').explanation.startsWith('After landing,'));
assert.ok(!lookup('9044').explanation.includes('Assessment Criteria'));
assert.ok(!lookup('9769').explanation.includes('decks870'));
assert.ok(questions.filter(q=>q.seccion==='Helicopter Aerodynamics').every(esPreguntaHelicoptero));
assert.ok(!esPreguntaHelicoptero({text:'Rotor clouds indicate mountain-wave turbulence.',options:[],explanation:'',cite:'',seccion:'Turbulence'}));

const directory=new URL('../supabase/storage/atp-images/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest-2026.json',directory),'utf8'));
assert.equal(manifest.assets.length,78);
assert.equal(manifest.source,'https://library.asa2fly.com/reader/#/reader');
assert.equal(manifest.bookISBN,'9781644254271');
assert.equal(manifest.assets.filter(a=>a.individualFigure).length,75);
const names=new Set(manifest.assets.map(a=>a.file));assert.equal(names.size,78);
for(const q of questions)for(const file of q.imagenes)assert.ok(names.has(file),q.id+' missing '+file);
for(const asset of manifest.assets){
 const bytes=readFileSync(new URL(asset.file,directory));
 assert.equal(bytes.length,asset.bytes,asset.file);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);
 const svg=bytes.toString('utf8');
 assert.ok(!/<(?:script|foreignObject)\b|\son\w+\s*=/i.test(svg),asset.file);
 const links=[...svg.matchAll(/(?:xlink:)?href="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(links.every(h=>h.startsWith('#')||/^data:image\/(?:png|jpeg|jpg|webp);base64,/.test(h)),asset.file);
 assert.ok((asset.nativeGraphicPreserved||asset.nativeFigurePreserved)&&asset.viewBox.length===4,asset.file);
 assert.ok(svg.includes('viewBox="'+asset.viewBox.join(' ')+'"'),asset.file+' crop must match reviewed bounds');
 if(asset.individualFigure){
  assert.ok(asset.file.startsWith('atp_2026_asa_')&&asset.source===manifest.source,asset.file);
  assert.ok(Number.isInteger(asset.readerPage)&&asset.readerPage>482,asset.file);
  assert.match(asset.sourceOriginalSha256,/^[a-f0-9]{64}$/,asset.file);
  assert.ok(asset.file.endsWith('-unit.svg')&&asset.nativeVectorsPreserved,asset.file);
  const [x,y,w,h]=asset.viewBox;
  assert.ok(x>=0&&y>=33&&w>0&&h>0&&x+w<=594&&y+h<=742,asset.file);
  assert.notDeepEqual(asset.viewBox,asset.sourcePageViewBox,asset.file+' must isolate the figure');
 }
}
for(const group of [['123','124'],['126','127'],['129','130','131'],['141','142'],['156','157'],['223','224','225'],['226','227','228']]){
 const crops=group.map(n=>manifest.assets.find(a=>a.label==='figure-'+n).viewBox.join(','));
 assert.equal(new Set(crops).size,group.length,'Figures on one page must have independent crops: '+group.join(','));
}
assert.ok(!/DELETE\s+FROM/i.test(sql));
assert.ok(sql.includes("c.data->>'capitulo' IN ('2','3','6','7','8')"));
assert.ok(sql.includes("AND c.data->>'status'='publicada'"));
assert.ok(sql.indexOf('Upload missing ATP figures')<sql.indexOf('UPDATE public.content'));
console.log('ATP 2026 remaining: 863 valid questions; 1226 active across included chapters, 1170 without helicopters; 78 verified native SVG assets.');
