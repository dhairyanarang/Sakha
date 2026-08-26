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
code. Where they and this file disagree, they win — except on P0 scope, where
the changes recorded at the bottom of this file are newer.

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
  design. The one authorised exception is the walk check-in, which the user has
  explicitly asked to be designed in code from the existing system.

## Hard rules

**Tokens.** Components reference **semantic** tokens only (`text-text-primary`,
`bg-surface-page`). Never reference primitives (`--brand-500`) directly.

**No component libraries.** No shadcn, no MUI, nothing alongside this system.
One visual system only. Radix UI primitives, unstyled, are permitted for exactly
two things: a select/dropdown, and a future date picker.

**Typography.** Inter, only. An earlier draft said Noto Sans — that was wrong.
Apply the 13 text-style utilities directly; never invent a font-size/weight pair.

**Measurements are verified, not conventional.** Primary buttons are **60px**
tall, not 64 — earlier research said 64 before real designs existed; trust the
built number. Compact buttons 39px. Chips and avatar 46–54px. 4px grid, no
other unit, anywhere.

**Layout.** Mobile only. 402px base frame, 16px horizontal margins. 370px
component width is *derived* (402 − 32) — never hardcode it, and never invent
tablet or desktop breakpoints. No responsive design has been done.

**Colour.** One brand scale, no second identity colour. No warning colour and no
second danger scale — this product's whole posture is against manufactured
alarm. `feedback/error` and `feedback/mood-not-good` share a value today but are
separate tokens; never substitute one for the other. Mood is a soft personal
signal, never an alarm.

**Opacity.** Never use CSS opacity to lighten text — use a lighter solid
neutral. A modal scrim must be real runtime opacity, never a pre-computed solid.

**Elevation.** Flat by design. Exactly one sanctioned shadow exists: the
selected time-range pill on the measurement chart (0/4, 16 blur, 0 spread,
black 16%). Do not build a broader shadow system.

**Dark mode.** None designed. Do not build one speculatively.

**Motion.** No durations or curves were ever specified — static frames can't
show motion. Restrained, functional, never decorative. Always honour
`prefers-reduced-motion`.

**Accessibility.** No functionality may depend on a gesture beyond a simple tap
— no swipe-only, no long-press-only. Never rely on colour alone; pair it with an
icon or label. Never disable pinch-zoom.

**Icons.** Lucide, exclusively. 20–22px inline. No circular icon-button
containers — icons sit directly on their background. The back chevron is the one
exception at 24px in a 42px tap area.

## Language and data model

**Medicine status is `confirmed`, `skipped`, or `unconfirmed`. Never "missed"
or "failed."** This is a hard rule running through copy, data model, and UI
alike. Confirmation is allowed at any time; no penalty framing for lateness,
ever. Snoozing delays a push — it is not a stored status.

Short sentences, plain words. "Your medicines," not "Medication management."
Errors are calm and actionable, never blaming, never technical. No countdowns,
no auto-expiring confirmations, nothing time-pressured anywhere.

- **Time of day is multi-select.** One medicine can be Morning *and* Evening on
  one entry. An earlier draft required adding it twice — that is gone.
- **Do not create columns the real screens don't collect.** Dosage,
  before/after food, and start/end dates were in an earlier draft of the data
  model and are not in the built Add Medicine flow.
- Condition tag and remarks are optional and never block saving.
- All data hangs off an **`account_id`** (the elderly person's account), not a
  `user_id`, with an `account_members` join table. Family sharing then costs
  nothing — same screens, same queries, different active account.
- "Unconfirmed" is the **absence** of a log row, not a stored value. Today's
  doses are computed from `medications × times_of_day` left-joined against
  today's logs, in `Asia/Kolkata`.
- **The app is the source of truth, not the notification.** What she sees on
  opening the app must be correct whether or not a push ever arrived.

## P0 scope changes (newer than `docs/prd.md`)

Decided by the user on 2026-08-26:

- **Ask AI is out of P0.** No Claude API layer, no assistant, no urgent-language
  guardrail. Revisit after the core ships.
- **Get Help is out of P0.** No emergency call/WhatsApp flow. Consequently
  `is_emergency_contact` is dropped — do not build it.
- Trusted contacts **remain** in scope — they are the family-linking mechanism.
- **Daily check-in is on the Home screen**, already designed: a "how do you feel
  today" question, medicine confirmation for today, and log actions for sugar,
  BP and walking. *Verify the exact mood options against the Home frame in
  Figma — the PRD says good/okay/not good, the user described not good/good/very
  good. Figma decides.*
- **Walk check-in** is to be designed in code from the existing component
  library. This is the sole authorised exception to "don't invent design."
- Auth is **Google OAuth via Supabase**, as designed.

## Known open issues

- Chart (dual-line BP, single-line sugar) is deliberately not built yet.
- No Accessibility or general app-settings screen has been designed.
- The family invite *acceptance* flow has never been designed.
- PWA file upload on installed iOS has not been tested on a real device.

### Resolved 2026-08-26

Tertiary button gained a real pressed state (tinted fill, darkened border and
label). Secondary's pressed label was restored to `action/primary-pressed` after
a rebinding had made it identical to Default. Settings Row's chevron replaced an
8px circle. Card padding 14 -> 16 and Family Member Card gap 10 -> 12, both back
on the grid. All 18 Button labels and the Empty State message are now bound to
real text styles.

`surface/tinted-strong` was re-aliased brand/50 -> brand/100 and now actually
differs from `surface/tinted`; Secondary/Pressed uses it so the fill darkens
rather than relying on a label shift alone. Two new semantic tokens,
`control/track-off` (neutral/300) and `control/track-disabled` (neutral/200),
separate an off toggle from a disabled one — they previously resolved to the
same hex. A new `text/name-label` style (18/Medium) carries the Family Member
Card name, which had no correct style to bind to. 83 variables, 14 text styles.

## Commands

```bash
pnpm dev      # local dev server
pnpm build    # production build — must pass before any push
pnpm lint
node scripts/generate-icons.mjs   # regenerate PWA icons from placeholder mark
```
