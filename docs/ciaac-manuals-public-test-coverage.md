# MI public test coverage

This publication contains ten MI lessons and their native teaching vectors. The public fixtures are intentionally minimal. They contain relative repository paths, content hashes, public didactic before/after values, and runtime review identities. They do not contain authoring-source bodies, package locations, source scans, or removed PNG bytes.

## Fixture identity

The filenames `ciaac-manuals-reconstruction-v2.json` and `ciaac-manuals-source-corrections-v2-20261008.json` identify schema-version 2 public fixtures in this distribution. They are not byte-identical copies of the original historical source ledgers. The original ledgers remain unchanged in the separate historical verification set.

The two corresponding `protectedFiles` hashes in `flightpath-original-mi-20261010.json` therefore identify the public fixture bytes and are explicitly labeled `public-test-fixture`. The three protected runtime/catalog/review-gate hashes, complete MI runtime-document hash, 783 unchanged-subtree hashes, 920 reviewed-value hashes, asset hashes, and all journey identities are unchanged. No runtime or gate is modified to accommodate sanitization.

## Public tests

- `ciaac-manuals-public-integrity-v2.cjs` checks all ten complete runtime documents against canonical hashes, ten content-version and review identities, 69 boards, 328 cards, all 143 historical asset identities, availability, and fail-closed review behavior.
- `ciaac-manuals-public-source-corrections-v2.cjs` accounts for all 125 correction records. It checks 94 retained didactic changes with exact before/after values and reversible assertions, plus five superseded didactic changes. All 26 source-metadata records have hashes only: nine check their exact current public values and 17 are explicitly superseded. Ten SVG corrections retain exact before/after-byte hash verification. All 29 retired PNG identities are checked without shipping their bytes.
- `ciaac-manuals-original-diagrams.cjs` preserves every original assertion for 24 accessible SVGs, 29 whole-asset removals, 25 prior dependencies, five coherent exercises, datum calculations, DME geometry, holding geometry, and canonical/displayed figure mirrors.
- `ciaac-manuals-approved-structure-v2.cjs` preserves the original structure, fail-closed gates, full text rendering, navigation, legacy-route, Basic-plan and read-only review assertions. Unused stubs for unrelated subject overlays are removed; no assertions are removed.
- `ciaac-assessment-version-preservation.cjs` uses public MI07 as its fixture, replacing its prior unrelated lesson dependency. All original migration and DOM assertions remain unchanged: earned completion, navigation/checks/history, one-time answer invalidation, partial attempts, unversioned attempts, idempotent reload, blocked unearned completion, and exactly one explicit completion award.

## Separate historical checks

The original `ciaac-manuals-source-integrity-v2.cjs` and `ciaac-manuals-source-corrections-v2.cjs`, together with their original helper and source ledgers, remain unchanged outside this public distribution. They check exact candidate/source reconstruction and the complete historical correction chain. They are not silently replaced by same-named tests with fewer assertions.

The public suite cannot establish the original full candidate byte identity or reverse the omitted historical source-metadata bodies. Hash-only records do not prove those historical contents. Passing the public suite must not be reported as passing the separate historical-source suite. Complete current-runtime identity is independently enforced for all ten lessons.

## Run

From the repository root, with its test dependencies installed:

```sh
node tests/ciaac-manuals-public-integrity-v2.cjs
node tests/ciaac-manuals-public-source-corrections-v2.cjs
node tests/ciaac-manuals-original-diagrams.cjs
node tests/ciaac-manuals-approved-structure-v2.cjs
node tests/ciaac-assessment-version-preservation.cjs
```

The tests require the existing repository test dependencies, including TypeScript, React, React DOM and jsdom. These are local read-only tests; they do not access learner accounts or production services. Runtime vector integrity and static/DOM behavior do not certify interactive browser, mobile zoom or operational suitability.
