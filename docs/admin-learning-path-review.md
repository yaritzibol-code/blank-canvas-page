# Admin-only Learning Path review

Entry: `/admin/revision-learning-paths`, also linked as **Revisar Learning Paths** under the admin panel's Content section. A selected lesson uses the same URL with an `lp` query parameter containing its stable full ID.

## Scope and guard

- The browser requests `/api/admin/learning-path-review` with its current authenticated bearer token. The server uses `authenticateRequest` and a strict successful `is_admin` RPC result. Local mirrored roles, paid plans, and query parameters never authorize review.
- Only available registered CIAAC and Handbook documents in the active taxonomy are listed. The AM baseline catalog contains 174 entries (37 CIAAC Aerodynamics, 19 AM, 118 Handbook); 40 preserved legacy aircraft/engines routes are outside this selector, while their normal URLs remain unchanged. The native CIAAC presentation wrappers are retained, including the approved teaching-board renderer for ready ST lessons. Unsupported ATP, Jeppesen, legislation and Annex 10 renderers are not exposed as working review modes.
- No roles, paid-access logic, student sequence logic, migrations, credentials or database schema are changed.

## State isolation

The dedicated route does not mount the normal app runtime, global store hydration, offer watcher, activity/presence hooks, or an AdminShell. Entry from the admin menu performs a full-document navigation. Any accidental client-side entry from a running normal app also reloads before rendering review, discarding its in-memory sync runtime. Leaving for the panel is a full-document link.

The Handbook engine's explicit `reviewOnly` mode starts fresh in React memory and does not call journey read/save/reset/migration, completion or rewards. It exposes all stages without fake completions. Quiz responses, exercise interactions, zoom and finish checks remain inspectable and temporary. Finish exits to the selector. Refresh, changing lessons and returning to a lesson start a fresh review. The normal learning route remains unchanged.

## Checks

Run these serially from the checkout (jsdom is required by the existing DOM test setup):

- `NODE_OPTIONS=--max-old-space-size=512 node tests/admin-learning-path-review.cjs`
- `NODE_OPTIONS=--max-old-space-size=512 node tests/admin-learning-path-review-auth.cjs`
- `node tests/admin-learning-path-review-root.cjs`
- `node tests/admin-learning-path-review-route.cjs`
- Existing regression: `tests/ciaac-completion-navigation.cjs`, `tests/ciaac-aircraft-next-block-navigation.cjs`, `tests/ciaac-aircraft-engines-dom.cjs`
- `npx tsc --noEmit`
- `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

The DOM tests execute the real native renderer and shell, with persistence calls instrumented, including all ready CIAAC lessons. They are not browser screenshot/device QA. Authenticated browser QA on the final preview remains pending: verify admin selection and deep links, non-admin denial, mobile stage menu/zoom, browser Back/Forward and exit, plus unchanged progress before and after inspection.
