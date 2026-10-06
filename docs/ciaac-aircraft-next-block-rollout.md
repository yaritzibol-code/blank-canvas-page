# CIAAC Aircraft AM11–AM19 review-preview integration

This adds the nine prepared lessons to the existing approved Aircraft sequence, retaining AM01–AM10 and the forty legacy routes. It does not publish the Lovable production site.

## Scope

- 36 native teaching screens, 150 source-preserved cards and 17 assessment questions.
- 62 source-exact runtime assets, including two existing shared dependencies.
- Finalized AM17 fire-system material and AM18 CORR2 gas/oleo-pneumatic wording, question 1, answer B and completion mirror.
- AM19 uses section-specific identifiers only for its two reused figure identities; image files, captions, physical anchors, teaching text and assessments are unchanged.
- Shared board support adds optional context figures and label positions with leader lines, without changing physical anchor coordinates or creating extra progress steps.

The publication-review records attest to source/scope, image and assessment review. They do not attest to live-browser QA. Explanation digests use the captured Notebook explanation; AM11, AM13 and AM18 combine the original capture, one NUL byte and the applicable verification/correction capture, matching the preceding release convention.

## Verification

- Production build passes with `NODE_OPTIONS=--max-old-space-size=6144`; the default Node heap exhausted at about 2 GB.
- TypeScript and scoped source/test lint pass; all changed files pass formatting and whitespace checks. Repository-wide lint remains red (10,838 errors / 83 warnings in unchanged files); no bulk lint cleanup is included.
- Native structural gate accepts all nineteen documents. AM01–AM10 remain semantically exact.
- ReactDOM tests cover all 36 new boards: retained card text, figure/anchor/context associations, marker/label coordinates, click and keyboard selection, exact zoom payloads and unmutated source data.
- Route tests cover AM11–AM19 completion, exact next IDs, the final return, double-click reward protection, resume and existing sequence/plan locks.
- Asset checks verify 62 runtime hashes; assessments preserve the finalized source wording.

Actual browser/mobile viewport, screen-reader and end-to-end account checks were not run. Static rendering and ReactDOM tests are not browser validation. No denied browser route was retried.

## Baseline findings outside this change

The same clean-main revision reproduces the Aerodynamics boundary aria-label test mismatch and internal-source-text scan failure, plus the ATP remaining-chapters SVG assertion. FlightPoints reward SQL tests cannot run without their separate `FP_QA_DEPS` PGlite dependency. Those unrelated files were not changed.

No taxonomy bulk replacement, unfinished legislation drafts, AM01 photo restructuring, library, rankings or quiz-system redesign is included.
