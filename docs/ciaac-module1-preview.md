# CIAAC Aerodinámica · Module 1

## Scope

Five existing IDs reuse the airline Learning Path shell, stage navigation, per-user journey persistence and completion callbacks. No taxonomy IDs, question bank, backend schema, dependency versions or airline documents change.

- 53 teaching cards, 39 questions and 18 activities.
- An initial prediction opens exploration even when incorrect.
- Thirteen focused visual labs illustrate cause and effect before short reading cards.
- Matching, classification, written error correction, calculation, labels and specific closing checks remain available. Written explanations use explicit guided self-assessment, not an implied automated text grade.
- Only these five CIAAC LPs are available. Other CIAAC placeholders are blocked in navigation, direct URLs, and started/completed store callbacks.
- Plan and sequence gates remain active; there is no authentication bypass.

## References and artwork

The content file contains public teaching material and bibliographic references. Printed page locators remain distinct from PDF indexes. Links appear only for official public sources; other references show their book title and verified printed pages. CIAAC does not inherit the Handbook's fixed PHAK attribution.

The three supplied original PNG boards are displayed through exact CSS viewports by `CiaacOfficialArt`. No official character or logo is redrawn.

## Verification

- `node tests/ciaac-module1.cjs`
- `npx tsc --noEmit`
- `npm run build`
- `npx eslint` on changed TS/TSX files

The existing npm lock is inconsistent with the exact Vite/Cloudflare pins, so clean npm installation fails independently of this feature. The existing Bun lock records the mandated versions; this change does not modify either lockfile.

An isolated local fixture is available with `npx vite --config tests/fixtures/ciaac-vite.config.ts`, then `/tests/fixtures/ciaac-preview.html?lesson=1` through `?lesson=5` at port 8081. It uses a local test identity and disables account/report writes. It is not a production application route and does not validate authenticated cloud synchronization.

Six Playwright UI cases are provided for a supported browser environment. Browser visual verification remains separate from structural/runtime checks. The local full build compiled client and SSR bundles but exhausted environment memory during final bundling; a completed production build is not claimed.

This module is for preview review. Publishing the live site and enabling later CIAAC modules remain separate decisions.
