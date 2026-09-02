# Sakha

A phone-only daily companion for an elderly person managing everyday health and
routine. Progressive Web App. Android primary, iOS secondary. English + Hindi.

**The target user is one specific person, not a demographic:** a woman in her
late sixties in Delhi, presbyopic, sometimes shaky hands, comfortable with
WhatsApp and not much else. Every threshold in this system exists because of her.

**North star for anything not covered below:** does this make her next action
clearer, easier, safer, or more comfortable? If not, reconsider before shipping.

## Read these first

`docs/design-system.md` · `docs/information-architecture.md` · `docs/prd.md`

They are the contract this code is written against. Read them before writing UI
code. Where they and this file disagree, **this file wins** — the docs predate
several deliberate changes recorded below.

## Figma is the source of truth

File: **"Social Initiative Project"** (`uwL7Ym8EDtxOhyMuQQOicm`), page **"Claude"**.
Sections: `Component Library`, `Home`, `Health`, `Profile`, `Onboarding`,
`Empty States`. Other pages (`Designs`, `Prototype`, `Rough`) are working
history — do not build from them.

- Read components and variables over the Figma MCP connection. **Never
  hand-copy hex values** out of the docs into code.
- `src/app/tokens.css` is **generated**. Do not hand-edit values. To change a
  colour, change it in Figma and regenerate.
- **If a screen or state is not in Figma, stop and ask.** Do not improvise
  design. The authorised exceptions, each asked for explicitly and each built
  from the existing system rather than invented: the walk check-in; adding and
  viewing a health document; the family screens and invite acceptance flow; and
  the Library detail screen.

## Two products, one codebase

Sakha is two experiences behind one set of URLs, branching on
`requireAccount().isFamily`.

**The owner (the elderly person).** Bottom nav: Home | Health | Library |
Profile. Home is today's care — medicines to confirm, readings to record, a
walk to log. Health holds medicines, measurements and documents. Library is a
curated shelf. This is the person living the day.

**The family member.** A single screen, **no bottom navigation at all**. They
are not managing a day, they are looking in on one. `/` renders Family View;
Profile is reached from the avatar in the header.

What is deliberately **not** in the product: Ask AI, Get Help / emergency
flows, trusted contacts (one sharing concept only — a family member on the
account), and the daily mood check-in, which was removed on 2026-08-30 because
nothing ever read the answer back. `daily_checkins` and `mood_level` remain in
the database, unused. Do not rebuild the question without first deciding what
reads the answer.

## Family View

One screen, one day. `src/components/family/family-home.tsx`.

- **No bottom navigation.** There is nowhere else to go. The avatar in the
  header is the route to Profile and to switching account.
- **Date selector** at the top: "Today, 2 September" with a **Change** button
  opening a calendar sheet. The chosen day lives in the URL as `?d=YYYY-MM-DD`
  so Back works and a refresh keeps it. Choosing today drops the parameter, so
  the plain URL is always today — and that is also the way back to it.
- **Medicine is date-specific.** Three slots, Morning / Afternoon / Evening.
  Exactly **two states: Confirmed or Unconfirmed.** A slot counts as Confirmed
  only when every medicine in it is confirmed. There is **no Skipped state on
  this screen** — a `skipped` log and an unanswered one both read Unconfirmed,
  and a past slot that was never confirmed stays Unconfirmed rather than being
  reinterpreted. Tapping a slot opens a **view-only** sheet listing that slot's
  medicines with their three-dot schedule. Nothing on this screen writes to a
  dose; confirming is hers.
- **Measurements are date-specific**, via `getMeasurementsOn`. A reading shows
  only if it was recorded on that day. There is **never a fallback to the
  latest reading from another date** — a June blood pressure under Saturday the
  2nd would be a false statement. A day with no reading says so.
- **Documents are NOT date-specific** and must not become so. A prescription is
  not an event that happened on the day it was photographed. The same library
  shows whatever date is selected.
- **Family members can add documents.** Adding is a member right, not an owner
  one — see Permissions. Deleting is owner-only.
- **Date-change skeleton.** Changing the date navigates, and a plain
  `router.push` would hand the whole screen to the route loading boundary and
  blank the date bar too. `FamilyDay` wraps the push in `startTransition`, so
  React keeps the screen mounted and `isPending` swaps **only** Medicine and
  Measurements for a static skeleton. Documents never flicker. The skeleton
  replaces rather than dims — stale readings under the wrong date are worse
  than none. No artificial delay.

An earlier calendar/history experiment (a historical-day care view built into
the family Home) was **abandoned**. It is not part of the product and must not
be reintroduced. It survives only as the git tag
`archive/family-calendar-experiment`.

## Health and measurements

Three measurements: **Blood Sugar**, **Blood Pressure**, **Weight**. One detail
screen shape for all three, with the chart, the history list and the record
flow.

**Normal ranges have a single numeric source of truth:
`src/lib/measurement-ranges.ts`.**

- Blood Sugar: **70–140 mg/dL**
- Blood Pressure: **90–120 systolic, 60–80 diastolic** (two bands)
- Weight: **no range**, deliberately. None was ever written, a healthy weight
  is not a number this product is in a position to assert, and its absence must
  stay an absence rather than becoming a guess.

These are **product display ranges, not medical advice**, and the app never
presents them as a diagnosis or a personal target. Do not introduce thresholds
from outside the codebase, and do not paraphrase or invent range copy.

The numbers previously existed only as a sentence in the dictionary, once per
language. The chart forced the issue: two copies of a health statement drift,
and a green band disagreeing with the badge above it is worse than no band. So
the values live in one module and both the badge and the chart read from it.
The sentences are still authored per language, with the numbers passed in.

**Graph safe area.** `measurement-chart.tsx` takes `bands` and draws a pale
fill between the boundaries with a thin stroke on each, behind the reading
line. Colours come from existing chart tokens (`--color-chart-range-line`,
`feedback-success-surface`) — no invented values. The Y axis expands to contain
the band as well as the data, so a range is never drawn clipped or implied to
start wherever the axis happens to; a boundary outside the domain draws no
stroke. Verified against no readings, a single reading, flat identical values,
and values far above and below the range.

## Language and data model

**Medicine status is `confirmed`, `skipped`, or `unconfirmed`. Never "missed"
or "failed."** This is a hard rule running through copy, data model, and UI
alike. Confirmation is allowed at any time; no penalty framing for lateness,
ever. (Family View surfaces only Confirmed/Unconfirmed — see above.)

Short sentences, plain words. "Your medicines," not "Medication management."
Errors are calm and actionable, never blaming, never technical. No countdowns,
no auto-expiring confirmations, nothing time-pressured anywhere.

- **Time of day is multi-select.** One medicine can be Morning *and* Evening on
  one entry.
- **Do not create columns the real screens don't collect.** Dosage,
  before/after food, and start/end dates are not in the built Add Medicine flow.
- Condition tag and remarks are optional and never block saving.
- All data hangs off an **`account_id`**, not a `user_id`, with an
  `account_members` join table. Family sharing then costs nothing — same
  screens, same queries, different active account.
- "Unconfirmed" is the **absence** of a log row, not a stored value. Doses are
  computed from `medications × times_of_day` left-joined against that day's
  logs, in `Asia/Kolkata`.
- **The app is the source of truth, not the notification.** What she sees on
  opening the app must be correct whether or not a push ever arrived.

## Permissions

Two roles, and the client mirrors the database rather than replacing it.

| | Owner | Family member |
|---|---|---|
| Read everything on the account | yes | yes |
| Add a reading | yes | **yes** |
| Add a document | yes | **yes** |
| Confirm a dose | yes | no |
| Edit / delete anything | yes | **no** |

`requireAccount()` returns `canEdit = role === "owner"`. RLS is the real
enforcement: **READ and CREATE gate on `private.is_account_member`; every
UPDATE and DELETE gates on `private.is_account_owner`** (`20260828050000`).

`canAdd` is a **member** right and must not be gated on `canEdit` — that bug
hid Add Document from the person most likely to use it. `canDelete` correctly
uses `canEdit`.

There is deliberately **no UPDATE policy on `account_members`** — RLS denies by
default, so nobody can rewrite a role at all. Adding a policy to say so would
only weaken it.

## Navigation

Detail screens are shared between owner and family, so **Back is
context-aware**: the origin travels on the link as `?from=<path>`, read through
`safeReturnTo` in `src/lib/return-to.ts`, which falls back to `/health` for
anything that is not a same-origin path (these values end up in an `href`).

Family View passes its own path **including the selected date**, so returning
from a measurement or a document lands on the same screen *and* the same day.
This is not inferred from `isFamily` — role alone would get the screen right
and lose the date.

Family View must never navigate to `/health`. That route still exists and is
the owner's Health screen; its family branch is now unreachable by navigation
and is retained rather than deleted.

## Loading and performance

- `src/app/(home)/` is a route group holding Home and a `loading.tsx`. That
  loading file is never seen — it exists so Next has a **streaming boundary**,
  without which nothing could be flushed until Home's session check and its
  queries finished, and the splash sat behind all of it.
- **`proxy.ts` redirects a signed-out `/` to `/welcome` itself**, before
  anything renders. It has to: once bytes are flushed a redirect can no longer
  be a status code and Next falls back to a meta refresh. It reuses the
  `getUser()` already awaited, so it costs no query, and a signed-in request
  falls straight through and keeps the early paint. **Any future `loading.tsx`
  on a gated route needs the same treatment.**
- Fetch only what the view renders. Family View reads documents through
  `getDocuments`, not `getHealthOverview` — the latter also queries
  `medications` and `health_measurements`, which this screen already has, and
  cost two duplicate round trips per render and per date change.

## PWA and splash

Server-rendered in the root layout and animated entirely in CSS, so the first
frame the phone paints is already the blue lockup. Plays once per app session.

**Do not change the animation, its timing, layout, sequence or reduced-motion
behaviour.** Two non-obvious traps are already solved:

- Centring is flexbox, never a percentage transform on a shrink-wrapped
  absolute box — Safari resolves that width differently from Chrome and the
  lockup sat right of centre on real phones.
- iOS needs `apple-mobile-web-app-capable` written by hand in `metadata.other`.
  Next 16 emits only the modern `mobile-web-app-capable`, and without the Apple
  one iOS ignores every `apple-touch-startup-image` and launches on black.

## Library

Owner-only — a shelf curated for the person living the day. Eight categories as
the primary chips, language demoted to a secondary control shown only where a
shelf holds both. Cards are vertical: full-width 16:9 thumbnail, title, then
language and duration or "Short".

`/library/[id]` plays the video inside Sakha on `youtube-nocookie.com` — no
autoplay, no queue, at most three related items from the same category.

Content is a SQL insert with `published = false` until approved; there is
deliberately no admin CMS. The catalogue lives in
`supabase/seed/library_catalogue_v1.sql`. `library_items` still carries the five
original category values alongside the eight current ones; they are unused.

## Notifications

Event-driven, with the timer as the guarantee.

An `after insert` trigger on `notification_outbox` pokes the dispatcher through
`pg_net` the moment a row lands, which took family activity from a measured
11–53s down to a measured 0.2–0.6s. The minute cron stays as the guarantee if a
poke is ever lost, so claiming a batch is a single `UPDATE ... RETURNING` with
`SKIP LOCKED` — two callers can be in the dispatcher at once.

The poke swallows its own errors: it runs inside the transaction that wrote her
reading, and **a failed notification must never roll back the thing it was
about.** Reminders are excluded from the poke and left to the cron, which also
removes the only loop.

## Supabase

Project `yfuihfgvheavodrzxiwh`, region `ap-south-1` (Mumbai — she is in Delhi).

- **Never create a module-level Supabase client.** `src/lib/supabase/server.ts`
  builds one per request; hoisting it leaks one user's session into another's.
- **In `proxy.ts`, use `getUser()`, never `getSession()`.** `getSession()` only
  reads the cookie and will return a forged one; `getUser()` revalidates.
- Access control is one predicate: `private.is_account_member(account_id)`.
  The helpers live in the `private` schema precisely so PostgREST does not
  expose them as REST endpoints — do not move them back into `public`.
- Creating an account goes through `create_account()`, which inserts the
  account and its owner membership together. A bare INSERT policy on
  `account_members` would let anyone claim ownership of any account.
- Storage upsert needs INSERT **and** SELECT **and** UPDATE policies; with
  only INSERT, replacing a document fails silently.
- `service_role` / secret keys must never appear in a `NEXT_PUBLIC_` variable.
- The `reminders` table is deliberately not built yet.

## Deployment

- **Production branch: `main`.** Pushing to `main` triggers a production
  deployment through the Vercel Git integration — treat a push to `main` as a
  deploy.
- **Production domain: https://sakha.dhairya.work**
- Feature work happens on a branch with a preview deployment, is tested on a
  real device, and is fast-forwarded into `main` only once approved.
- Previews sit behind Vercel Deployment Protection; open them in a browser
  signed into the Vercel account.

```bash
pnpm dev      # local dev server
pnpm build    # production build — must pass before any push
pnpm lint
npx tsc --noEmit                  # run AFTER build: it needs .next/types
pnpm db:types                     # regenerate DB types
vercel env pull .env.local --yes  # refresh local env from Vercel
```

`tsc` reads generated route types from `.next/types`, so from a clean tree the
order is **build → tsc → lint**. Running `tsc` against a cleared `.next` fails
on `PageProps` and is a tooling artefact, not a code error.

## Development affordances

Gated on `NEXT_PUBLIC_DEV_TOOLS`, set on preview only — none of it exists in
production.

- A panel offers "Restart onboarding", which deletes the signed-in user's own
  account so the flow starts from the top.
- `/kitchen-sink` and `/tokens` are design-system proof sheets, gated on the
  same flag. They were publicly reachable in production until 2026-09-02.

There is **no dev login route**. Screens behind auth cannot be driven headlessly;
they need a real signed-in browser, which is why UI work is verified on a
preview deployment rather than locally.

## Engineering rules

- **Smallest correct change.** No broad refactors, no stylistic churn, no
  cleanup bundled into a feature.
- **Figma is the visual source of truth** when a frame is supplied. Where it is
  silent, follow the existing design system rather than inventing.
- **Reuse the shared component.** Detail screens, sheets, rows and the design
  system are shared on purpose; make them context-aware rather than forking.
- **Be conservative with health content.** No invented thresholds, no
  paraphrased medical statements, no alarm framing. An unanswered dose is not a
  failure.
- **Never weaken RLS**, and never rely on a client check alone.
- **Verify before deleting.** Check every reference across the repo; keep what
  is intentionally retained and say why.
- **Test before production**, on a preview and on a real device. The build
  passing is not the test.
- **No silent architectural changes.** Say what changed and why.

## Known open issues

- The measurement chart has no 7 days / 30 days / 3 months range pills, so the
  one sanctioned shadow — which lives on the selected pill — is still unused.
- **Weight has no detail frame.** It reuses the sugar/BP screen shape because
  Health links to it, and carries no range note because none was written.
- The Medicines screen's info icon has no designed destination. It toggles a
  legend for the dots — a guess at intent, not a decision.
- No Accessibility or general app-settings screen has been designed.
- PWA file upload on installed iOS has not been tested on a real device.
- `/health`'s family branch (`family-health.tsx`, `health-overview.tsx`,
  `viewing-banner.tsx`, `family-medicines.tsx`) is unreachable by navigation
  now that Family View has no Health tab. Retained, not dead: the route still
  serves the owner, and removing the family branch is a product decision.
- `daily_checkins` and `mood_level` remain in the database with no reader.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
