# Sakha — Information Architecture (Updated)

This replaces the earlier IA document specifically where the two diverge. The core structure below, Home | Health | Library, the persistent Profile icon, was already correct and stays unchanged. What's new is everything below the original scope: Onboarding, Profile's real structure, and Empty States, none of which existed when the IA was first written.

---

## Primary navigation, unchanged and confirmed

**Home | Health | Library**, plus a persistent Profile icon, top right, every screen.

**Health contains three sections: Medicines, Measurements, Documents.** Documents stays in Health, not Library, that decision was correct from the start and hasn't moved. Library is curated wellness content only, breathing, stretching, general guidance, still P1, may launch with little or nothing in it.

---

## Onboarding, new, seven real screens

1. **Welcome** — app name, tagline, a photo, "Get Started"
2. **Sign-in** — "Continue with Google," with a short privacy reassurance line. Worth a real product decision before build: confirm whether this is the primary auth path for the elderly user herself, or whether it's better suited to the family member's side of onboarding specifically, given the target user's comfort with OAuth flows is a real open question, not yet tested.
3. **Name** — "What should we call you?"
4. **Language** — English or Hindi, radio-style selection, exactly two options for P0. This is a different interaction pattern from the Language selector inside Profile, which uses tap chips instead of radio buttons, that's a known, accepted inconsistency between the two screens, not an error, follow each screen exactly as designed rather than reconciling them.
5. **Trusted contact** — name, phone number, relationship (chip selector: Spouse, Son, Daughter), skippable, with "Add Another Member" available
6. **Add medicine** — name, time of day, condition tag, remarks, skippable, with "Add Another Medicine" available, the exact same fields and optionality as the standalone Add Medicine flow inside Health
7. **Notification permission** — "Allow Reminders" or "Not now"

This whole sequence is deliberately short, several of these screens are a single question. Nothing beyond name, language, and one trusted contact is actually required to finish onboarding, medicines and notifications are both real, genuine skips, not soft-blocked.

---

## Medicines, the resolved data model

**Time of day is multi-select, not single-select.** One medicine can be tagged Morning and Evening both, on the same entry. This reverses an earlier draft decision that required adding a medicine twice, once per time slot, that requirement is gone, don't reintroduce it.

**Condition tag is optional**, Sugar, BP, Acidity, Thyroid, Asthma, or Custom. Medicines list groups by condition when one is set; ungrouped medicines fall under a general category. Remarks are optional too. Neither field blocks saving a medicine.

---

## Profile, new, real structure

```
Profile
├── My Profile — name, age, edit
├── Invitations — linked family members, each with Manage; tapping a
│   member shows their detail with Revoke Access
├── + Invite Family Member
└── Preferences
    ├── Notification — a real toggle, on/off
    └── Language — tap-chip selection. Two languages for P0,
        English and Hindi. Marathi and Bengali exist in earlier
        design exploration and were explicitly removed for P0,
        don't build against a version of this screen that still
        shows four options.
```

No separate Accessibility or general app-settings section has been designed yet, that's still a real, open gap, not an oversight to route around.

---

## Empty states, new, one per section

- **Medicines** — "You have no medicines," illustration, Add Medicine action
- **Health, all three sections at once** — Medicines, Measurements, and Documents each show their own empty treatment simultaneously when nothing exists yet anywhere
- **Documents** — "You have no uploaded documents," illustration, Add Document action
- **Home** — a distinct, calmer state from the others: "You have no medicine recorded" with an Add action, not the same invitation-to-add tone as the others, since Home's job is different, today's status, not a first-time setup nudge
- **Invitations** — "You have no invitations," illustration, the Invite Family Member action

---

## What's still genuinely open, not yet resolved anywhere

- Whether Google Sign-In is the right primary auth path for the elderly user specifically
- General app settings and Accessibility, referenced in the original IA, never designed
- The Get Help flow as its own screen, still only referenced as a persistent icon, never given a real destination
- The family invite acceptance flow, what a family member actually sees the first time they open an invite link

None of these are blockers to starting development on what does exist, Home, Health, Onboarding, Profile, but they're real gaps worth tracking, not things to assume are simply "not needed."
