# AI-Powered Care for Elderly

**Product Requirements Document — V1, Final**

Prepared by: Dhairya Narang, Interaction Designer
Status: Scope frozen. Ready for design and build.
Target platform: Progressive Web App, Android primary, iOS secondary

---

## 1. Product Definition and Problem

A phone-only daily companion for an elderly person managing everyday health and routine, with a calm, always-available way to reach help when she decides she needs it. It is not a healthcare platform, not a social network, and not an autonomous AI caregiver. The AI's role throughout is narrow: understand plain-language requests, retrieve or record information, and explain things simply. It never makes a clinical judgement.

Two real gaps sit underneath this. First, an invisible middle in India's elderly-welfare landscape: organisations like HelpAge India and Agewell Foundation do real, large-scale work, but almost entirely for people who are "underprivileged" or "destitute." An elderly person who owns their home and has a pension, but whose children have moved to another city, falls outside that entire system, not poor enough for charity, not close enough to family for support to happen naturally. Second, chronic condition self-management is genuinely hard to sustain on your own: even medication-adherent patients in India show low physical activity, and adherence itself is measurably better when family is involved.

---

## 2. Target User and Principles

**Target user.** A 68-year-old woman in Delhi, lives alone since her husband passed, son works in Bangalore and calls every few days. Mild hypertension, takes a daily tablet, inconsistent about checking her own blood pressure. Owns a smartphone, uses WhatsApp comfortably. Most days, nothing is wrong. Every feature is designed against her specific day, not a generic persona.

**Principles**
- **The daily habit is for her first.** Medication, mood, movement, it exists to help her directly. That it's also visible to family under full sharing is a secondary benefit, not the reason it exists, and the app itself never interprets or flags any of it on anyone's behalf.
- **Get Help is hers to press, always.** The emergency action reaches whoever she's chosen, family or otherwise, and it is only ever triggered by her, deliberately. Nothing is inferred on her behalf.
- **Opt-in, never passive.** Nobody sees anything until she sends or accepts an invite. Once linked, sharing is full by design for this version, a deliberate simplification to test, not a permanent stance.
- **Confirmed, not verified.** The product can know what she confirmed. It can never know what she actually did.
- **Deterministic first, AI where it genuinely helps.** A structured lookup or a scheduled action is answered directly from the database. AI is reserved for natural-language interpretation, explanation, and anything genuinely open-ended.
- **The app is the source of truth, not the notification.** Push can fail, be denied, or arrive late on either platform. What she sees when she opens the app must always be correct regardless of whether a push ever arrived.
- **One tap, no new patterns to learn.** Where a tool she already knows, WhatsApp, a phone call, does the job, use it, don't rebuild it.

---

## 3. Final P0 Scope

- Structured daily check-in: mood (three-option tap: good / okay / not good), inline medication status pulled from today's schedule, optional comment by text or voice where available
- Medication records, reminders, and confirmation, states are confirmed, skipped, or unconfirmed, never "missed"; confirmation is allowed at any time, no penalty for lateness
- Walk check-in: self-reported yes/no plus a simple duration selector, no automatic tracking of any kind
- Health documents: upload, store, and browse chronologically, no Q&A yet
- Three fixed health measurements: blood pressure, blood sugar, weight
- Get Help action: a direct phone call and a WhatsApp deep link to her trusted contacts, in that order
- Trusted contacts: name, freely described relation, phone number, marked as emergency contact or not. Not restricted to a fixed family relationship list, but no dedicated community or RWA infrastructure
- AI assistant, deterministic-first, answering from her own stored data, text or tap on both platforms, voice input on Android
- Text-to-speech for AI responses, both platforms
- Family invite and full shared view, with a profile switcher for a family member linked to more than one elderly account
- Large-text, high-contrast, tap-first UI, no fine motor precision required anywhere
- English and Hindi

**Explicitly not in P0:** automatic detection of missed check-ins or concerning responses, hydration or meal tracking, document Q&A, voice input on iOS, granular sharing permissions, any stored AI conversation history, video calling built into the app, fall detection or any continuous background monitoring, doctor or pharmacy booking integrations.

---

## 4. User Roles

**Elderly user**, the primary account. Full access to their own medications, documents, measurements, routine, the AI assistant, and Get Help. The interface never requires understanding "family," "sharing," or "permissions", those are setup-time concepts, not daily-use ones.

**Family or trusted contact**, a linked role, not a separate product. Access happens through an invite link generated from the elderly account. Once linked, that person sees everything on the account, through the same screens, clearly labeled as viewing someone else's. Where a person is linked to more than one elderly account, a simple switcher moves between them. The two roles aren't mutually exclusive per person, someone can be the primary account holder on their own profile and a linked viewer on someone else's at the same time, a spouse viewing their partner's account being the clearest case.

---

## 5. Core User Flows

**First-time elderly setup.** Name, preferred language, one trusted contact, essential medication information if any exists today. Nothing else is asked up front. Additional profile detail is offered gently after the first return visit, never demanded before first use.

**A normal day.** Open the app, see today's list on the home screen, complete the short daily check-in, confirm medication whenever it's convenient, optionally ask the AI assistant something, optionally log a measurement or a walk.

**Late medication confirmation.** She takes a tablet at 10:30 for a 9:00 reminder. Opening the app still shows it as open to confirm, marks it confirmed at whatever time she actually does it, no penalty language anywhere in that path.

**Get Help.** One tap from the home screen, always in the same place, offers a direct call or a WhatsApp message to her trusted contacts. Never inferred, always started by her.

**Family linking.** An invite link is generated from the elderly account and shared however is convenient, WhatsApp being the obvious channel. The recipient opens it, does a light onboarding step, name and relation, and lands directly on the shared view. Linking a second elderly account, say, the other parent, adds a switcher rather than a second app.

**Asking the AI assistant.** A structured question ("what medicines am I taking") is answered directly from stored data, no AI call made. An open-ended one ("remind me to take the white tablet after dinner," "explain what this medicine is for") goes to the AI, grounded in her actual records.

---

## 6. UX and Navigation Structure

Home screen leads with a greeting and today's short list, with Ask AI and Get Help always present and visually distinct, never buried in a menu. Primary navigation is kept to three or four items rather than five, likely grouping documents and measurements under a single "My Health" area. The exact information architecture is intentionally left to the design stage, not locked here.

Family view uses the identical screens as the elderly user's, with a persistent label indicating whose account is being viewed, plus the profile switcher where relevant. No separate dashboard, no parallel navigation system.

---

## 7. AI Responsibilities and Guardrails

**Where AI is used:** interpreting a natural-language request into a structured action, explaining stored information or a document in plain language, answering open-ended questions grounded in her actual data.

**Where AI is deliberately not used:** any structured lookup or scheduled action that the database can answer directly, kept out of the AI path entirely, both for reliability and to hold down cost.

**What the AI must never do:** diagnose, prescribe, change or suggest changing medication, override a doctor, or state uncertain information as fact. When reading a document, it answers confidently for typed or clearly printed text, and says so honestly when it isn't sure, especially handwriting, rather than presenting a guess as a reliable reading.

**Explicit urgent language.** If she describes something potentially serious in her own words, in the optional comment or in conversation with the assistant, the AI responds directly to her, calmly and immediately, pointing her to the Get Help action or her trusted contact. This is not inferred escalation to someone else behind her back, it's the assistant doing the one useful thing it can do with something urgent she's told it herself.

**Future safeguard, noted now for when it's built.** If a photo of a prescription is ever used to pre-fill a medication record, that pre-fill must always require explicit human confirmation before it becomes a live reminder. A misread that quietly enters the actual schedule is a materially worse failure than a wrong answer to a browsing question.

---

## 8. Technical Architecture

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js | Built-in routing suits the number of distinct screens without a separate router; mature PWA tooling; pairs naturally with Vercel |
| Backend, database, auth, storage | Supabase | The data model is genuinely relational; Row Level Security maps directly onto the family-sharing model; the most heavily represented backend in current AI-assisted coding practice, meaning more reliable generated code |
| Auth method | Google OAuth via Supabase Auth | Matches the real onboarding flow's sign-in screen. Whether this is the right primary method for the elderly user herself, versus being better suited to the family member's side of setup, hasn't actually been tested and is worth an early, deliberate check, not an assumption |
| Scheduling | Supabase pg_cron + Edge Functions | Keeps scheduling inside the same platform already holding the data it needs to query, rather than splitting logic across a second scheduler |
| AI | Claude API, server-side only | Keeps the key secure and every guardrail enforceable on our side, never exposed to the client |
| Notifications | Web Push (VAPID) | Free, built into the platform; always server-triggered, since neither platform allows a PWA to reliably schedule something locally into the future |
| Hosting | Vercel | Simplest deploy path paired with Next.js |

**Platform note.** Nearly everything behaves identically on Android and iOS. The one real gap is voice input, which works on Android and is confirmed broken on an iOS PWA once installed to the home screen, a platform limitation, not something more engineering time resolves. The organizing rule for the whole system: anything triggered by an explicit tap works reliably everywhere; anything that would require the app to keep watching passively in the background does not work reliably anywhere, which is why there is no automatic step tracking, fall detection, or missed-check-in monitoring anywhere in this document.

**Distribution.** Installed via "Add to Home Screen," free, no app store account required, auto-updates whenever the app improves.

---

## 9. Core Data Model

- **User** — role (elderly or family); a person may hold the family role on more than one elderly account, and the elderly role on their own
- **TrustedContact** — name, relation (free text, not restricted to a fixed list), phone, is_emergency_contact
- **Medication** — name, time_of_day (multi-select: morning / afternoon / evening — one medication can carry more than one), condition_tag (optional, free-form or from a short suggested set: sugar, BP, acidity, thyroid, asthma), remarks (optional, free text). Dosage, before/after food, and a start/end date range were part of an earlier draft of this model and are not part of the actual, built Add Medicine flow, don't build database columns for fields the real screen doesn't collect
- **MedicationLog** — medication_id, date, time, status: **confirmed / skipped / unconfirmed**. Snoozing is a notification-timing action only, it delays the next push, it is not a stored status
- **DailyCheckIn** — date, mood (good / okay / not good), optional comment (text or transcribed voice)
- **HealthMeasurement** — type (blood pressure, blood sugar, or weight), value, unit, date, note
- **HealthDocument** — title, date, type, file_url, notes, source
- **Reminder** — one unified table covering medication, routine, and health reminders, with a type field and recurrence rule rather than a table per category

No AI conversation history is stored.

---

## 10. Notification and Reminder Approach

A scheduled job (pg_cron plus an Edge Function) checks what's due and sends Web Push at the right time; the device itself never schedules anything, since neither platform allows a PWA to reliably fire something at a future time on its own. This is best-effort by design: if notification permission was never granted, or she's offline at the moment it fires, the push simply won't arrive. Because of that, today's list on the home screen is always the authoritative view of what's due and what's been confirmed, independent of whether any push was ever delivered or seen. On iOS specifically, push only works once "Add to Home Screen" has been completed, so onboarding needs to make that step unmissable rather than an afterthought.

---

## 11. Privacy and Security Considerations

This product handles health-adjacent personal data, which India's Digital Personal Data Protection Act treats as requiring real care. This isn't a legal judgement, but the design posture held throughout: nothing is shared with anyone until an invite is actively sent and accepted, that invite is the consent point. Once linked, sharing is full rather than field-by-field, a deliberate simplification for this testing stage. No AI conversation history is retained anywhere. The AI API key and all guardrail logic live server-side only, never exposed to the client. A genuine, working account and data deletion path is part of P0, not deferred.

---

## 12. P1 and Later Features

- Document Q&A: confident answers for typed and printed documents; explicit, honest uncertainty for anything genuinely unclear, especially handwriting, never a guess presented as fact
- Voice input on iOS, via a record-and-server-transcribe approach that bypasses the broken browser API, only if it earns its cost later
- Recurring health reminders ("blood test every 2 months")
- Medicine refill estimate, clearly labeled as an estimate
- Lightweight doctor or appointment storage, name, date, note only
- Location shared as a map link inside the Get Help message
- Curated content library (pranayama, gentle stretching, breathing exercises, linked not hosted)
- Additional Indian languages beyond Hindi

**Consciously not built, not merely deferred:** automatic detection of missed check-ins or concerning responses, and any notification sent to a third party without her direct action. This was in earlier versions of this product and was deliberately removed, not overlooked, because building a "something seems off" signal before anyone has a real habit with the product risks feeling like surveillance rather than support. Worth revisiting only once real usage exists to design it around honestly.

---

## 13. Acceptance Criteria for Core P0 Workflows

**Daily check-in.** Can be completed in well under a minute in normal use. Mood and medication status are always visible and answerable without leaving the check-in flow. The comment field is genuinely optional, skipping it doesn't block completion. A completed check-in is reflected on the home screen immediately.

**Medication.** A medication can be added by the elderly user or by a linked family member. A due reminder is delivered by push when permitted, and independently shown as due on the home screen regardless of push delivery. Confirmation is possible at any time after the scheduled time, with no penalty framing. Status is always one of confirmed, skipped, or unconfirmed, never "missed."

**Get Help.** Reachable in one tap from the home screen at all times. Offers a direct phone call and a WhatsApp deep link to every contact marked as an emergency contact. Never triggered by anything other than her own tap.

**Family sharing.** An invite link can be generated and shared. Once accepted, the family member sees the same data the elderly user sees, through the same screens, clearly labeled as someone else's account. A person linked to more than one elderly account can switch between them without confusion about which one is currently in view.

**AI assistant.** A structured question is answered without an AI call. An open-ended question is answered grounded in her actual stored data, never fabricated. Uncertain document content is stated as uncertain, never as fact. Explicit urgent language in her own words results in a direct, calm pointer to Get Help.

---

## 14. Known Limitations and Open Questions

- The iOS voice gap is structural and confirmed independently multiple times, not something more engineering time resolves within a PWA.
- Push is best-effort on both platforms by the nature of the web platform itself, not a flaw specific to this build.
- Full sharing is a deliberate simplification to test, not a validated decision. Watch specifically whether the free-text comment field is where a real family first wants more privacy than "everything visible," that's the most likely place for this assumption to break.
- File upload inside an installed iOS PWA hasn't been stress-tested the way voice input was, worth an early check on a real device.
- The niche statement in section 1 reflects the current best synthesis of the research done so far. It's ready to be said back in your own words once tested against a real conversation, not just reasoned from competitor research.
- The `is_emergency_contact` flag described in the data model and used by Get Help's acceptance criteria has no real control anywhere in the actual designed screens, not on the onboarding trusted-contact flow, not on the Profile family-member detail screen. Either a real UI for setting this needs to be designed, or the product decision needs to change to something the current screens already support, for instance, defaulting every trusted contact to reachable by Get Help. This needs a decision before build, not an assumption either way.

---

**This scope is frozen.** The next step is design and build against sections 3 through 13 as written, not further review cycles. New ideas that surface during build or testing go into section 12 for later consideration, not into P0.
