# CIAAC Transit ST01, ST04 and ST07 integration

Three source-reviewed lessons are registered in the existing native learning-path renderer. The approved seven-lesson order remains ST01 through ST07; the missing ST02/03/05/06 positions stay pending. All 48 legacy Transit routes and their independent progress remain intact.

The release contains 22 teaching boards, 96 unchanged source cards, six context passages, nine original open questions with their full answers, three source-derived native sequence exercises and 57 byte-identical SVGs. It preserves the supplied source qualifications and historical/didactic limitations.

## Access and progress

- ST01 activates the seven-position outline and can be opened at the beginning of the subject.
- ST04 and ST07 are content-ready but retain the existing sequential locks behind missing earlier lessons, including when opened by direct URL.
- There is no admin bypass, fabricated completion, automatic progress migration, reward change or student-access change.
- New ST journeys use their own curriculum and lesson/content version. The shared aircraft wrapper retains the existing Aircraft default and its narrowly scoped AM01 migration.

## Verification

The receiving checkout passes a serial production build with a 4 GB Node heap, TypeScript and scoped source/test lint. Source-payload equality, all ST assets and native structural/SSR checks pass. Relevant Aircraft and Transit route, completion, restoration, history and publication tests pass. The Aircraft-only activation mocks now explicitly hold the independent Transit rollout off; the dedicated Transit suite covers both activation combinations.

Full-suite baseline findings remain the same three unrelated Aerodynamics/ATP assertions and the FlightPoints SQL test's missing isolated PGlite dependency. No broad lint cleanup is included.

Actual browser/mobile, accessibility and end-to-end account QA remain pending. Static/ReactDOM evidence is not a browser validation. No production publish action is included.
