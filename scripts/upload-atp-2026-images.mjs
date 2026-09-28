import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the authorized deployment environment.');
if(new URL(url).hostname!=='tgkbrfivawpgozwqbpsm.supabase.co')throw new Error('Unexpected Supabase project.');
const directory=new URL('../supabase/storage/atp-images/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest-2026.json',directory),'utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
for(const asset of manifest.assets){
 if(!/^atp_2026_(?:figure-\d+[a-z]?|legend-\d+|question-\d+(?:-faa)?)\.svg$/.test(asset.file))throw new Error('Unexpected filename '+asset.file);
 const bytes=await readFile(new URL(asset.file,directory));
 if(digest(bytes)!==asset.sha256)throw new Error('Local figure checksum mismatch '+asset.file);
 const target=`${url.replace(/\/$/,'')}/storage/v1/object/atp-images/${asset.file}`;
 const headers={apikey:key,Authorization:`Bearer ${key}`};
 const result=await fetch(target,{method:'POST',headers:{...headers,'Content-Type':'image/svg+xml','x-upsert':'true'},body:bytes});
 if(!result.ok)throw new Error(`Figure upload failed (${result.status}): ${asset.file}`);
 const check=await fetch(target,{headers});
 if(!check.ok||digest(Buffer.from(await check.arrayBuffer()))!==asset.sha256)throw new Error('Uploaded checksum mismatch '+asset.file);
 console.log('Verified '+asset.file);
}
console.log('All 78 figures verified. Apply 20260928210000_atp_2026_remaining_chapters.sql next.');
