# Isolated module QA

These tests execute application domain functions and the real profile React component
with synthetic in-memory fixtures. They do **not** register an account or authenticate
to FlightPath. The fixture email uses the reserved, non-deliverable `example.invalid`
domain; there are no passwords, access tokens, admin users, production flags or login
bypasses. Application auth, cloud and database implementations cannot be loaded by
the contract-test allowlist. Evidence events are captured in memory, not sent.

## Run

From the repository root after installing the project's locked dependencies:

```sh
node --test tests/isolated-modules.cjs
node tests/isolated-profile.cjs
node tests/public-ui.cjs
```

The DOM regression uses `jsdom`, like the existing public-ui and aircraft DOM suites.

## Coverage and boundaries

| Area | Verified here | Not verified here |
| --- | --- | --- |
| Question bank | Published/hidden/draft filtering; deterministic free cap | Real Supabase permissions or quota |
| Quiz / simulator | Attempt recording; interrupted exam counts actual answered questions; per-user selectors | Full browser exam, server scoring, persistence |
| Learning | First answer retention; consolidation retry; idempotent lesson completion; course/user separation | Every lesson render or cloud completion |
| Library | Resume, upper page clamp, invalid-page guard, bookmarks, user isolation | PDF downloads/rendering or signed URLs |
| COMPASS | All seven configured modules' synthetic result history and stats | Exercise engine execution, physical input, reward validation |
| RTARI | Synthetic transcript history, minutes and distinct questions | Microphone, live voice, evaluation or billing |
| Logbook / reminders | Local create/edit/delete and per-user selectors | Notification delivery or cloud storage |
| Profile | Actual React edit/cancel/reopen/save/logout; email read-only; input labels | Authenticated profile/email writes, avatar upload |
| Public auth / pricing | Existing public-ui DOM regression | Real signup, login, reset email, payment |

The analytics harness intentionally substitutes an empty content registry and no admin
users. Its assertions concern attempt counts and user isolation, not full course
completion percentages or admin authorization. In-memory isolation tests are not proof
of backend row-level security.

## Confirmed profile defect

Previously the profile rendered an editable login-email input but `saveEdit` never
updated the authenticated email; local display state could falsely show a changed
email until reload. The DOM regression fails on that behavior. The fix keeps the email
read-only and explains that it cannot be changed from this form. Editable fields also
receive associated labels. No authentication setting is changed by this patch.

## Remaining real integration prerequisites

A user-completed test signup/sign-in and applicable consent are still needed for real
account journeys. Actual plan/payment, voice usage, server persistence and permissions
need their respective authorized test environments and credentials. Passing this suite
must not be reported as end-to-end production verification or account creation.
