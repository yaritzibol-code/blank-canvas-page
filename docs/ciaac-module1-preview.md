# CIAAC Aerodinámica · Module 1

## Scope

Five existing IDs reuse the airline Learning Path shell, stage navigation, per-user journey persistence and completion callbacks. No taxonomy IDs, question bank, backend schema, dependency versions or airline documents change.

- The public content model retains 53 teaching cards, 39 questions and 18 activities.
- LP1 now uses five concept-first scenes with explained classification, phrase banks, operational sequences and illustrated cases. LPs2–5 keep their existing diagnostic exploration.
- LP1 uses one changing illustration per scene with short substeps; the other four lessons retain their existing visual labs and cards.
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

Seven Playwright UI cases are provided for a supported browser environment. Browser visual verification remains separate from structural/runtime checks. The local full build compiled client and SSR bundles but exhausted environment memory during final bundling; a completed production build is not claimed.

This module is for preview review. Publishing the live site and enabling later CIAAC modules remain separate decisions.

## First-lesson redesign checkpoint

`CiaacAircraftLearningPath` is selected only for the existing Aeronave en vuelo ID. Its plain visual shell and transparent existing character art do not alter other lessons. The versioned inner journey retains an older snapshot, restarts an unfinished redesigned activity flow from the first scene, and preserves completed account status. No new account completion is recorded for an already-completed review.

The five-scene renderer and migration have in-memory interaction tests; a separate independent React/jsdom pass covered the full flow. Aircraft SVG geometry was visually inspected. Full-page browser pixels, real focus behavior and animation appearance remain separate, unverified checks for this preview.
