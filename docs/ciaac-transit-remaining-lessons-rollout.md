# CIAAC Transit ST02, ST03, ST05 and ST06 integration

This follow-on release completes the existing seven-lesson native Transit outline. It adds the finalized ST02/ST03/ST05/ST06 packages without changing their document payloads, source-card order, complete cleared assessments, historical/regional qualifications or figures. ST02's provisional top-level `ST02` key is mapped to its existing approved catalog ID; the document itself is unchanged.

The four additions contain 31 teaching boards, 138 source cards, 94 byte-identical SVGs, ten open questions with complete solutions, two matching activities and two sequence activities. Across ST01–ST07 there are 53 boards, 234 cards and 151 figures. The source-integrity manifest pins each approved ZIP, document, assessment, source mapping and asset; the regression test checks the finalized document payloads and all added SVGs. Full source mapping and immutable source originals remain in the matching private reviewed packages.

## Source boundaries

- ST02 retains the cleared F2 example, three original question prompts and full cleared solutions, code/casilla distinctions, ETD/EOBT/EET/ETA conditions and legal closure versus ARR distinction. Superseded answers are not restored.
- ST03 retains historical MGTAM radio/VMC details, the corrected outside-both-protection-zones case and regional MOCA/MORA limitations. Its source's global gate is still not a certification of current operational data.
- ST05 uses the corrected final package, version 1. Historical MGTAM study limits and pending current PIA/AIP, NOTAM, MVA and local minima remain unchanged.
- ST06 uses the final cleared assessment. It preserves direct DETRESFA, phase exceptions, the separate RCC responsibilities, historical sources and pending operational PIA GEN 3.6 data. Its sequence exercise orders message fields, not emergency phases.

## Access and progress

All seven approved lessons now register through the existing fail-closed publication/content gates. Ordinary student access still follows sequential completion; no completion, reward, stored journey, access policy or legacy URL is modified. All 48 legacy Transit routes keep their independent progress. The existing admin-only review automatically lists all seven lessons using the native renderer and isolated ephemeral state. No additional admin bypass or student navigation change is introduced.

## Verification boundary

Passed on the receiving checkout: exact ZIP and package-member hashes, source/assessment validators (including all 111 ST03 source fragments), final source-payload equality, 94 added SVG identities, strict TypeScript, scoped lint, seven-lesson structural/SSR and progression/missing-review-gap gates, all four admin authorization/isolation suites, and focused Aircraft regressions. The serial production build passed with a 4 GB Node heap. Admin ReactDOM coverage exercised 64 native lessons and 160 zooms with no journey, progress, reward, completion or lock writes. These checks do not imply that existing app bootstrap cache cleanup is absent. Real browser/mobile, focus/keyboard, zoom, screen-reader and end-to-end account QA remain pending; static/ReactDOM tests do not satisfy those checks. No browser denial is retried. Production publishing is a separate authorized release step.
