# CIAAC Aerodinámica · Module 1

## Scope

Five existing IDs reuse the airline Learning Path shell, stage navigation, per-user journey persistence and completion callbacks. No taxonomy IDs, question bank, backend schema, dependency versions or airline documents change.

- The public content model retains 53 teaching cards, 39 questions and 18 activities.
- LP1 now uses the approved native Handbook sequence: Despegue, diagnostic Preflight, three content stages, matching, two quiz stages, reflection and Aterrizaje. LPs2–5 keep their existing diagnostic exploration.
- LP1 uses distinct push-back, support-mechanism and rotor illustrations plus an HTML flight-time timeline; the other four lessons retain their existing visual labs and cards.
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

Native first-lesson Playwright cases are provided for a supported browser environment. Browser visual verification remains separate from structural/runtime checks. The local full build compiled client and SSR bundles but exhausted environment memory during final bundling; a completed production build is not claimed.

This module is for preview review. Publishing the live site and enabling later CIAAC modules remain separate decisions.

## Approved first-lesson Handbook checkpoint

The existing `CiaacAircraftLearningPath` route wrapper now delegates rendering, navigation,
matching, quizzes, completion and persistence to `HandbookLearningPath`. Only the first
lesson receives its approved copy and optional presentation/migration hooks. The remaining
four CIAAC lessons and all airline lesson data retain their original behavior.

The ten native stages preserve the complete approved script, its 9-minute estimate,
inline timing note, preflight illustration within the question stage, and native closing checks.
Three distinct generated raster illustrations use original transparent Yaris/Pathy assets
alongside the existing sky. The airplane example is an accessible HTML timeline.

Version `ciaac-aircraft-handbook-v3` retains the exact old inner journey in `previousJourney`,
including any earlier snapshot. Incomplete old flows restart at Despegue because question
indexes changed. Completed accounts and completed v2 journeys retain full review access
without new completion callbacks or rewards. Native v3 progress resumes at its saved stage.

Verification: TypeScript, changed-file ESLint, native renderer interaction tests, legacy
journey tests and module regression tests pass. The native renderer test exercises all ten
stages, wrong/right diagnostic and mastery choices, four matching pairs, repeated finish,
resume, legacy migration, completed review and confirmed/cancelled reset. Source images
were inspected. Full build compiled client/SSR modules but was killed during final server
chunk rendering; a successful production build is not claimed. Cloud Browser refused the
local fixture with `net::ERR_BLOCKED_BY_CLIENT`; full-page visual QA and Playwright execution
remain unverified in this environment. No restriction was bypassed.

No publish, dependency, backend, taxonomy or other lesson changes are included.
