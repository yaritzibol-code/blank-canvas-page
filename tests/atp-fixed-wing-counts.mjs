import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ATP_CHAPTERS, chaptersConConteo, esPreguntaHelicoptero } from '../src/lib/store/linea-aerea-meta.ts';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const questions = JSON.parse(read('../supabase/migrations/20260928190000_atp_2026_regulations.sql')
  .match(/\$questions\$\s*([\s\S]*?)\s*\$questions\$::jsonb/)[1]);
const sql = read('../supabase/migrations/20260928200000_atp_fixed_wing_counts.sql');
const strong = new RegExp(sql.match(/\$strong\$([^]*?)\$strong\$/)[1], 'i');
const context = new RegExp(sql.match(/\$context\$([^]*?)\$context\$/)[1].replaceAll('\\y', '\\b'), 'i');
const sqlRule = q => {
  const heading = [q.seccion, q.capituloTitulo, q.text, ...(q.options ?? []), q.cite].filter(Boolean).join('\n');
  return strong.test(heading) || context.test(heading) || strong.test(q.explanation ?? '');
};
const fixtures = [
  ...questions,
  { text: 'Rotor clouds indicate mountain-wave turbulence.' },
  { text: 'What is the purpose of a tail rotor?' },
  { text: 'What is hovering?' },
  { text: 'Collective pitch changes lift.' },
  { text: 'A collective agreement applies to the crew.' },
  { text: 'What are gyroplane requirements?' },
  { text: 'Normal aircraft operations.', explanation: 'The helicopter exception applies.' },
  { text: 'Normal aircraft operations.', explanation: 'Use the collective.' },
  { seccion: 'Helicopter Regulations', text: 'What minimum fuel is required?' },
];
for (const q of fixtures) assert.equal(sqlRule(q), esPreguntaHelicoptero(q), q.text);
assert.equal(questions.filter(sqlRule).length, 21);
const baseCounts = [{ fuente: 'ATP', capitulo: 1, materia: 'operaciones', total: 363 }];
const filteredCounts = [{ ...baseCounts[0], total: 342 }];
assert.equal(chaptersConConteo('ATP', ATP_CHAPTERS, baseCounts).chapters[0].total, 363);
const filtered = chaptersConConteo('ATP', ATP_CHAPTERS, filteredCounts, true);
assert.equal(filtered.chapters[0].total, 342);
assert.equal(filtered.total, 342);
assert.equal(chaptersConConteo('ATP', ATP_CHAPTERS, [], true).total, 0);
assert.ok(chaptersConConteo('ATP', ATP_CHAPTERS, [], true).chapters.every(c => c.total === 0));
assert.equal(chaptersConConteo('ATP', ATP_CHAPTERS, undefined).total, null);
assert.match(sql, /auth\.uid\(\) IS NOT NULL/);
assert.match(sql, /c\.data->>'status' = 'publicada'/);
assert.match(sql, /REVOKE ALL ON FUNCTION public\.get_atp_fixed_wing_counts\(\) FROM PUBLIC, anon/);
assert.match(sql, /RETURNS TABLE\(materia text, fuente text, capitulo int, total bigint\)/);
console.log('Filtered ATP counts: 363 → 342; rules agree on 372 fixtures; empty results remain zero.');
