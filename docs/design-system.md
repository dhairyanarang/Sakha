# Sakha — Design System Reference

**This document, the IA, the PRD, and the Figma file together are the complete context for building this product. This file replaces every earlier version of the Design MD, none of which reflect the actual finalized system. Figma is the source of truth for anything visual, this document explains it in words and gives exact values as a backup and index, it does not override Figma.**

---

## How to use this, if you're an AI agent building this product

Read this document, the IA, and the PRD before writing any UI code. Then connect to the Figma file via Dev Mode MCP and read the actual variables and components directly, don't hand-copy hex values from this doc into code, read them from Figma so they stay live. Suggested first steps: read all Figma variable collections and generate the Tailwind (or equivalent) config from them first, before implementing a single screen. Use Radix UI primitives, unstyled, only for the three components that need real interactive accessibility behavior not otherwise covered: a select/dropdown if one is ever needed, and any future date picker. Everything else is custom, built directly from the component specs below. Do not introduce shadcn, MUI, or any other component library alongside this system, one visual system only.

---

## Design philosophy

Calm, warm, human, trustworthy. Not clinical, not childish, not a government portal, not a generic AI chatbot skin. The target user is a specific person, not a demographic: a woman in her late sixties in Delhi, presbyopic, sometimes shaky hands, comfortable with WhatsApp, not much else. Every threshold below, type size, touch target, contrast, exists because of her specifically, not as generic best practice.

North star for any decision not covered explicitly here: does this make her next action clearer, easier, safer, or more comfortable? If not, reconsider it before shipping it.

---

## Token architecture

Three tiers, in Figma as three variable collections:

- **Primitives** — raw values, no meaning attached. `color/brand/500`.
- **Semantic** — intent-based, aliases a primitive. `color/action/primary` points at `color/brand/500`. Screens and components should only ever reference semantic tokens, never primitives directly, so a future change to what "primary action" means only requires editing one alias, not hunting through every screen.
- **Spacing** and **Radius** — their own collections, same alias discipline, primitive-style values referenced by name, not raw pixel numbers.

---

## Color

### Neutral primitive scale (`Primitives` collection)

| Token | Hex |
|---|---|
| `color/neutral/0` | `#FFFFFF` |
| `color/neutral/50` | `#FAFAFA` |
| `color/neutral/100` | `#F5F5F5` |
| `color/neutral/200` | `#E7E7E7` |
| `color/neutral/300` | `#D4D4D4` |
| `color/neutral/400` | `#A8A8A8` |
| `color/neutral/500` | `#808080` |
| `color/neutral/600` | `#595959` |
| `color/neutral/700` | `#404040` |
| `color/neutral/800` | `#262626` |
| `color/neutral/900` | `#000000` |

Primary text uses pure `#000000`, not a softened near-black, that was a deliberate correction made partway through this project, don't reintroduce a near-black "just for text."

### Brand primitive scale

| Token | Hex |
|---|---|
| `color/brand/25` | `#F8F8FF` |
| `color/brand/50` | `#F1F1FF` |
| `color/brand/100` | `#E4E3FF` |
| `color/brand/200` | `#C9C7FF` |
| `color/brand/300` | `#AAA8FF` |
| `color/brand/400` | `#807DFF` |
| `color/brand/500` | `#5551FF` ← the actual brand color |
| `color/brand/600` | `#4845D9` |
| `color/brand/700` | `#3C39B3` |
| `color/brand/800` | `#2F2D8C` |
| `color/brand/900` | `#222066` |

There is deliberately no second brand color. Every accent need in this product is served by this one scale plus the semantic colors below, not a second identity color. Don't add one without a genuinely new, specific need, checked against real screens the way every other color decision in this system was.

### Semantic colors, feedback and chart

| Token | Aliases | Hex (resolved) |
|---|---|---|
| `color/feedback/error` | `color/red/500` | `#CF3E3E` |
| `color/feedback/error-surface` | `color/red/100` | `#FAECEC` |
| `color/feedback/mood-not-good` | `color/red/500` | `#CF3E3E` |
| `color/feedback/success` | `color/green/500` | `#6AA969` |
| `color/feedback/success-surface` | `color/green/100` | `#F3F8F3` |
| `color/feedback/success-text` | `color/green/700` | `#1B631A` |
| `color/feedback/info` | `color/brand/500` | `#5551FF` |
| `color/feedback/info-surface` | `color/brand/50` | `#F1F1FF` |
| `color/chart/systolic` | `color/brand/500` | `#5551FF` |
| `color/chart/diastolic` | `color/orange/500` | `#F88F11` |
| `color/chart/range-line` | alpha green | `#6AA969` @ 60% |

**`error` and `mood-not-good` are two separate tokens that happen to share a value today.** This is deliberate, not redundant. Mood is a soft, personal signal, never treat it as an alarm. Error is a real validation failure. If either one's actual color ever needs to change, they can diverge without a design conversation about what red "really means" in this app. Never reuse `mood-not-good` for a genuine error state or vice versa.

**`info` deliberately reuses the brand color rather than getting its own hue.** One recurring pattern, factual reference content, "typical range for adults," privacy reassurance copy, uses this token. It is not interactive despite sharing the action color, that's an accepted, known trade-off, not an oversight.

**No warning color and no second, separate danger scale exist**, on purpose. Nothing in this product currently needs a genuine "caution" state distinct from error, this product's whole posture is against manufactured alarm. Don't add one speculatively.

### Structural semantic colors

| Token | Aliases | Hex |
|---|---|---|
| `color/text/primary` | neutral/900 | `#000000` |
| `color/text/secondary` | neutral/600 | `#595959` |
| `color/text/tertiary` | neutral/500 | `#808080` |
| `color/text/disabled` | neutral/400 | `#A8A8A8` |
| `color/text/on-brand` | neutral/0 | `#FFFFFF` |
| `color/surface/default` | neutral/0 | `#FFFFFF` |
| `color/surface/page` | brand/25 | `#F8F8FF` — the actual app background, distinct from card surfaces |
| `color/surface/subtle` | neutral/100 | `#F5F5F5` |
| `color/surface/tinted` | brand/50 | `#F1F1FF` |
| `color/surface/tinted-strong` | brand/100 | `#E4E3FF` |
| `color/border/default` | neutral/200 | `#E7E7E7` |
| `color/border/soft` | alpha black-16 | `#000000` @ 16% |
| `color/border/subtle` | alpha black-24 | `#000000` @ 24% — form control borders (Radio's unselected ring) |
| `color/border/faint` | alpha black-12 | `#000000` @ 12% — Bottom Nav's top divider |
| `color/action/primary` | brand/500 | `#5551FF` |
| `color/action/primary-pressed` | brand/600 | `#4845D9` |
| `color/action/primary-disabled` | neutral/300 | `#D4D4D4` |
| `color/icon/stroke` | alpha black-60 | `#000000` @ 60% — inactive nav icon |
| `color/icon/stroke-subtle` | alpha black-40 | `#000000` @ 40% |
| `color/chart/gridline` | alpha black-12 | `#000000` @ 12% |
| `color/chart/gridline-alt` | alpha black-24 | `#000000` @ 24% |

### Opacity, handled correctly

Real transparency (opacity tokens above) is reserved for exactly two legitimate cases: form control borders whose surrounding context is guaranteed static, and genuine overlay/scrim elements, modal backdrops specifically, that need to show whatever's actually behind them at runtime. **A modal scrim must never be implemented as a solid, pre-computed color.** It has to be real CSS/native opacity in code, dimming whatever screen is actually rendered underneath. Every other translucent-looking surface in this system has already been converted to a flat, pre-computed color for exactly the opposite reason, predictability and, specifically, text-contrast safety. Text should never use CSS opacity to achieve a lighter color, it should use a genuinely lighter, solid token from the neutral scale. This distinction was a real, hard-won correction during this project, not a style preference.

---

## Typography

**Inter**, the only real typeface in this system. Not Noto Sans, an earlier draft of this document specified Noto Sans and it was wrong, don't reintroduce it. If Hindi/Devanagari rendering becomes a blocking concern during build, that's a decision to make explicitly and revisit this document, not to assume silently.

### Real text styles (Figma text styles, apply these directly, don't recreate ad hoc font/size combinations)

| Style | Size | Weight | Used for |
|---|---|---|---|
| `text/screen-title` | 20px | Medium | Screen and modal titles, the Home greeting |
| `text/section-label` | 12px | Semi Bold | Small uppercase section headers, the active bottom nav label |
| `text/subsection-heading` | 14px | Medium | Sub-groupings within a section, e.g. "Measurements" |
| `text/body-primary` | 16px | Regular | Primary row/card labels |
| `text/body-medium` | 16px | Medium | Slightly emphasized body text, document titles, settings row labels |
| `text/body-secondary` | 14px | Regular | Supporting text, settings row subtitles |
| `text/metadata` | 14px | Regular | Timestamps, dates, "3 days ago" |
| `text/eyebrow-label` | 12px | Medium | Small emphasized labels |
| `text/nav-label` | 12px | Regular | Inactive bottom nav labels |
| `text/chip-label` | 18px | Regular | Text inside chips |
| `text/button-label` | 18px | Medium | Button text |
| `text/value-display` | 18px | Medium | Compact numeric values in lists |
| `text/value-display-large` | 24px | Medium | The hero reading on a measurement detail screen |

A handful of real text layers in the actual screens legitimately mix two sizes in one layer, a large number next to a smaller unit, "124" next to "mg/dL." That's intentional authored content, not a gap, a single text style can't apply to a mixed-size run and shouldn't be forced to.

---

## Spacing

4px grid, no other unit, anywhere. This was enforced retroactively across the whole file, catching and fixing values that weren't on-grid.

| Token | Value |
|---|---|
| `space/1` | 4px |
| `space/2` | 8px |
| `space/3` | 12px |
| `space/4` | 16px |
| `space/5` | 20px |
| `space/6` | 24px |
| `space/7` | 44px |

---

## Radius

| Token | Value |
|---|---|
| `radius/xs` | 5px |
| `radius/sm` | 8px |
| `radius/md` | 12px |
| `radius/lg` | 16px |
| `radius/xl` | 20px |
| `radius/2xl` | 32px |
| `radius/full` | 999px — pills, circles, fully-rounded buttons |

---

## Icons

**Lucide**, exclusively. No circular icon-button containers anywhere in this system, icons sit directly on their background, unwrapped. Standard inline icon size is 20–22px. The one exception is the back-navigation chevron in a screen header, which is larger, 24px within a 42px tap area, since it's a primary navigation action.

---

## Touch targets, the real, verified numbers

**Primary buttons are 60px tall, not 64px.** An earlier phase of this project referenced 64px from general research before real designs existed; once real screens existed, the actual, deliberately chosen height is 60px. Trust the real, built number over the earlier research-derived one. Compact/secondary buttons are 39px. Chips and the profile-photo-style avatar are 46–54px. None of these are accidental, don't round them to a different convention.

---

## Screen dimensions and layout grid

Real, measured base frame: **402px wide**. Every screen uses a consistent **16px horizontal margin** on both sides (`space/4`), which is why every full-width component in this system, buttons, cards, the text input, is built at **370px**, not because 370 was chosen directly, it's 402 minus two 16px margins. Keep this relationship intact if the target viewport ever changes, don't hardcode 370 as if it were the source number.

This is a single-viewport, mobile-only design system. No tablet or desktop layout has been designed, don't infer responsive breakpoints that don't exist, if a wider viewport needs to be supported later that's a real, separate design task.

## Elevation and shadow

Flat design, deliberately, borders and fills carry hierarchy, not shadows, in almost every part of this system. **One real exception exists**: the selected state of the time-range pill (7 days / 30 days / 3 months) on the measurement chart uses a drop shadow, offset 0/4, 16px blur, 0 spread, black at 16% opacity, sitting on the `action/primary` fill. This is not yet a formal Figma effect style or token, it's a real, one-off effect applied directly. Worth formalizing as a token if a second genuine use case for elevation ever shows up, don't invent a broader shadow system speculatively in the meantime, this is the only sanctioned instance today.

## Motion and dark mode

No animation durations or easing curves have been specified anywhere in this project, static Figma frames can't demonstrate motion. Build transitions using ordinary, restrained defaults consistent with the "calm, functional, never decorative" principle already stated, and treat specific timing as an implementation decision, not something this document defines. No dark mode has been designed or requested, don't build one speculatively.

---

## Component inventory

Every component below exists in Figma, in the "Component Library" section of the "Claude" page in the Sakha file, fully token-bound. Read the actual Figma components for pixel-exact structure, this is a summary, not a replacement.

### Button
Three styles: **Primary** (solid `action/primary` fill, white text), **Secondary** (tint fill, `surface/tinted`, `action/primary` text, no border), **Tertiary** (white fill, `action/primary` border and text). Two sizes: **Full** (370×60, `radius/xl`) and **Compact** (100×39, `radius/sm`). Three states per style/size combination: Default, Pressed (fill darkens to `action/primary-pressed` or text darkens to `brand/700`), Disabled (`action/primary-disabled` fill or `border/default` border, `text/disabled` label). Eighteen real variants total. Has a `Label` text property.

### Chip
Selected (solid `action/primary` fill and border, white text) and Unselected (4% black tint, no border, `text/primary`) states. Fully rounded. Used for the time-of-day selector, medicine condition tags, and the Documents filter.

### Radio
20×20 circle. Selected: white fill, 6px `action/primary` stroke, creating the dot effect through stroke thickness, not a separate inner shape. Unselected: white fill, 1px `border/subtle` stroke. Disabled: `action/primary-disabled` stroke.

### Toggle
54×28 track, `radius/full`, 24×24 white thumb. On: `action/primary` track, thumb right. Off: `neutral/300` track, thumb left. Disabled: `action/primary-disabled` track.

### Icon Circle
46×46, fully round. Four tone variants: Brand (`surface/tinted`), Error (`feedback/error-surface`), Success (`feedback/success-surface`), Neutral (`surface/subtle`).

### Text Input
Label above the field, always, never placeholder-only. Field is 370×54, `radius/md`. Four states: Default (`border/default`, placeholder in `text/tertiary`), Focused (`action/primary` border at 1.5px, real value in `text/primary`), Filled (`border/default`, real value, unfocused), Disabled (`surface/subtle` fill, `text/disabled`). Has `Field Label` and `Value` text properties.

### Card / List Row
One component serves both jobs, a card and a list row are the same container at different heights. Auto-height, 370px wide, white `surface/default` fill, `border/soft` stroke, `radius/xl`.

### Bottom Nav
402×88, `surface/default` fill, `border/faint` top stroke. Three tabs, Home, Health, Library, real Lucide icons (`house`, `heart-pulse`, `library-big`) cloned from the actual navigation, not recreated. Three variants, one per active tab: active tab uses `section-label` style and `action/primary` for both icon and text; inactive tabs use `nav-label` style, `text/secondary` for text, and the `icon/stroke` token (60% opacity) for the icon, not a flat solid color.

### Empty State
Illustration (214×150, placeholder tint in the library, real artwork per screen) plus a message, vertically centered, 16px gap. Each real screen's actual illustration stays as authored, it's not a token.

### Avatar
52×52 circle. Photo state represents where a real image fill goes. Fallback state for no photo yet, `surface/tinted` fill.

### Settings Row
Icon, label/subtitle column, and a trailing control, either a real Toggle instance or a chevron. Used in Profile.

### Family Member Card
179px wide, same card styling as Card/List Row, `radius/xl`. Contains a real Avatar instance, name, relationship, and a real Tertiary/Compact Button instance labeled "Manage."

### Status Tag
Three 12px dots, 8px spacing, filled `action/primary` for confirmed, outlined `border/default` for not yet. The real medicine dose indicator.

### Info Callout
346px wide, `surface/tinted` fill, `radius/sm`, `body-secondary` text. Used for the BP typical-range note, the onboarding privacy line, and the reminders permission note.

### Not yet built, known and deliberate
**Chart** (dual-line for blood pressure, single-line for sugar) is deferred, genuinely more complex than everything above, build it as its own focused task, don't rush a version of it in to complete a set. **Checkbox** doesn't exist because nothing in this product currently needs one, don't add it speculatively, everything that looks like a choice uses Chip, Radio, or Toggle. A dashed "+Add" treatment (Add Medicine, Add Document, the "+Custom" chip) is planned as new variants on the existing Button and Chip components, not a separate component, not yet built.

---

## Content and tone

Short sentences, plain words. "Your medicines," not "Medication management." Medicine status is always **confirmed, skipped, or unconfirmed**, never "missed" or "failed," this is a hard rule, not a style preference, it runs through copy, data model, and UI alike. Errors are calm and actionable, "we couldn't save this, please check and try again," never blame the user, never use technical language. No countdowns, no auto-expiring confirmations, nothing time-pressured anywhere in this product.

## Accessibility, standing rules

No functionality ever depends on a gesture beyond a simple tap, no swipe-only, no long-press-only actions. Never rely on color alone to convey meaning, pair it with an icon or a label. Motion is subtle and functional only, never decorative, respect reduced-motion preferences. All of this applies regardless of what a specific screen's static design shows, since a static frame can't demonstrate motion or gesture behavior, the absence of an example is not permission to add one.
