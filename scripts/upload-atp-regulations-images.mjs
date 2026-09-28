import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the authorized deployment environment.');
if (new URL(url).hostname !== 'tgkbrfivawpgozwqbpsm.supabase.co') {
  throw new Error('Refusing to upload to a project other than this repository’s configured Supabase project.');
}
const directory = new URL('../supabase/storage/atp-images/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'));
const digest = buffer => createHash('sha256').update(buffer).digest('hex');
for (const asset of manifest.assets) {
  if (!/^atp_2026_(?:figure-(?:185a|186|187|188|188a|301)|legend-12)\.png$/.test(asset.file)) {
    throw new Error(`Unexpected ATP figure filename: ${asset.file}`);
  }
  const bytes = await readFile(new URL(asset.file, directory));
  const target = `${url.replace(/\/$/, '')}/storage/v1/object/atp-images/${asset.file}`;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const result = await fetch(target, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'image/png', 'x-upsert': 'true' }, body: bytes,
  });
  if (!result.ok) throw new Error(`Figure upload failed (${result.status}): ${asset.file}`);
  const check = await fetch(target, { headers });
  if (!check.ok || digest(Buffer.from(await check.arrayBuffer())) !== digest(bytes)) {
    throw new Error(`Uploaded figure verification failed: ${asset.file}`);
  }
  console.log(`Verified atp-images/${asset.file}`);
}
console.log('All seven figures are verified. Apply 20260928190000_atp_2026_regulations.sql next.');
