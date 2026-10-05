import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('public/images/handbook/ciaac/aircraft-engines/m6-m7');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
test('ten M6/M7 visuals have unique lesson-specific content-stage assignments', () => {
  assert.equal(manifest.length, 10);
  assert.equal(new Set(manifest.map(x => x.learningPathId)).size, 10);
  assert.equal(new Set(manifest.map(x => x.src)).size, 10);
  for (const entry of manifest) {
    assert.match(entry.learningPathId, /^ciaac\/aeronaves-y-motores\/modulo-[67]-/);
    assert.ok(Number.isInteger(entry.stageId) && entry.stageId > 0);
    assert.ok(entry.stageTitle.length > 0);
    assert.match(entry.caption, /^Diagrama original:/);
    assert.ok(entry.alt.length > 70);
  }
});
test('native SVG assets are self-contained, accessible, and compact', () => {
  const ids = new Set();
  for (const entry of manifest) {
    const svg = fs.readFileSync(path.resolve('public', entry.src.slice(1)), 'utf8');
    assert.match(svg, /viewBox="0 0 720 450"/);
    assert.match(svg, /role="img" aria-labelledby="[^"]+"/);
    assert.match(svg, /<title id="[^"]+">[^<]+<\/title>/);
    assert.match(svg, /<desc id="[^"]+">[^<]+<\/desc>/);
    assert.doesNotMatch(svg, /<script|<foreignObject|<image|onload=|https?:\/\/(?!www.w3.org)/);
    for (const [, id] of svg.matchAll(/\bid="([^"]+)"/g)) {
      assert.ok(!ids.has(id), `duplicate SVG id ${id}`);
      ids.add(id);
    }
    assert.ok(Buffer.byteLength(svg) < 16000);
  }
});
