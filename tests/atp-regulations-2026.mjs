import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { esPreguntaHelicoptero } from '../src/lib/store/linea-aerea-meta.ts';

const migration = readFileSync(new URL('../supabase/migrations/20260928190000_atp_2026_regulations.sql', import.meta.url), 'utf8');
const questions = JSON.parse(migration.match(/\$questions\$\s*([\s\S]*?)\s*\$questions\$::jsonb/)[1]);
assert.equal(questions.length, 363);
assert.equal(new Set(questions.map(q => q.id)).size, 363);
assert.equal(new Set(questions.map(q => q.sourceQuestionId)).size, 363);
for (const q of questions) {
  assert.equal(q.fuente, 'ATP');
  assert.equal(q.capitulo, 1);
  assert.equal(q.capituloTitulo, 'Regulations');
  assert.equal(q.sourceEdition, '2025–2026');
  assert.equal(q.status, 'publicada');
  assert.equal(q.options.length, 3, q.id);
  assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 2, q.id);
  assert.ok(q.text.trim() && q.explanation.trim() && q.options.every(o => o.trim()), q.id);
  assert.ok(q.seccion && q.sourcePage >= 4 && q.sourcePage <= 92, q.id);
  assert.ok(q.options.every(o => !/\(PLT\d|FAA-H-8083|Answer \([ABC]\) is/.test(o)), q.id);
  for (const file of q.imagenes) assert.ok(existsSync(new URL(`../supabase/storage/atp-images/${file}`, import.meta.url)), file);
}
const lookup = number => questions.find(q => q.sourceQuestionId === number);
assert.equal(lookup('9350').correctIndex, 1);
assert.equal(lookup('9350-1').correctIndex, 0);
assert.equal(lookup('8975').correctIndex, 0);
assert.equal(lookup('8834').correctIndex, 1);
assert.ok(lookup('8834').sourceOriginalText.endsWith('20 to'));
assert.equal(lookup('9842').options[2], '15 hours if assigned to report at 1730 with a Class 2 rest facility available.');
assert.ok(!lookup('9842').options.some(o => /Maximum flight duty/.test(o)));

// Exercise the unchanged filter used by the real questionnaire, including
// rotorcraft references outside Helicopter Regulations and ordinary questions.
const heli = questions.filter(esPreguntaHelicoptero);
assert.equal(heli.length, 21);
assert.equal(questions.filter(q => !esPreguntaHelicoptero(q)).length, 342);
assert.ok(questions.filter(q => q.seccion === 'Helicopter Regulations').every(esPreguntaHelicoptero));
assert.ok(esPreguntaHelicoptero(lookup('8043')));
assert.ok(!esPreguntaHelicoptero(lookup('9350')));
assert.ok(!esPreguntaHelicoptero({ text: 'Rotor clouds indicate mountain-wave turbulence.', options: [], explanation: '', cite: '', seccion: 'Turbulence' }));
assert.deepEqual(lookup('9618').imagenes, ['atp_2026_figure-301.png']);
assert.deepEqual(lookup('9636').imagenes, ['atp_2026_legend-12.png']);
assert.deepEqual(lookup('9668').imagenes, ['atp_2026_legend-12.png', 'atp_2026_figure-185a.png']);
assert.deepEqual(lookup('9638').imagenes, ['atp_2026_figure-186.png', 'atp_2026_figure-187.png', 'atp_2026_figure-188.png', 'atp_2026_figure-188a.png']);
assert.equal(questions.filter(q => q.imagenes.length).length, 4);
assert.equal(new Set(questions.flatMap(q => q.imagenes)).size, 7);
assert.ok(migration.indexOf('Upload missing ATP figures') < migration.indexOf('UPDATE public.content'));
assert.ok(!/DELETE\s+FROM/i.test(migration));
console.log('ATP Regulations 2026: 363 questions, all keys/options valid, 21 excluded / 342 available, 7 linked figures.');
