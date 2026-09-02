"use client";
import { notFound } from "next/navigation";
import { DEV_TOOLS } from "@/lib/dev";

import { useState } from "react";
import { Bell, Calendar, ChevronRight, Droplet, Globe } from "lucide-react";
import {
  Avatar,
  BottomNav,
  Button,
  Card,
  Chip,
  EmptyState,
  FamilyMemberCard,
  IconCircle,
  InfoCallout,
  Radio,
  SettingsRow,
  StatusTag,
  TextInput,
  Toggle,
} from "@/components/ui";

/**
 * Kitchen sink — every component, every state, for diffing against the Figma
 * Component Library. Not a product screen. Not linked from the app.
 */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-subsection-heading text-text-primary">{title}</h2>
        {note ? <p className="text-metadata text-text-tertiary">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-metadata text-text-tertiary">{label}</span>
      {children}
    </div>
  );
}

const STYLES = ["primary", "secondary", "tertiary"] as const;

export default function KitchenSink() {
  // A design-system page, not a product screen. It was publicly reachable in
  // production, which is not where an internal proof sheet belongs — gated on
  // the flag that already exists for exactly this, so it stays available on
  // preview and is simply absent in production.
  if (!DEV_TOOLS) notFound();
  const [chip, setChip] = useState("Morning");
  const [notif, setNotif] = useState(true);
  const [lang, setLang] = useState("English");

  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto flex w-full max-w-[402px] flex-col gap-7 px-4 py-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-screen-title text-text-primary">Component library</h1>
          <p className="text-body-secondary text-text-secondary">
            Every component, every state. Diff against Figma.
          </p>
        </header>

        <Section title="Button" note="3 styles x 2 sizes x 3 states = 18 variants">
          {STYLES.map((variant) => (
            <div key={variant} className="flex flex-col gap-3">
              <span className="text-eyebrow-label text-text-secondary capitalize">
                {variant}
              </span>
              <Row label="Full — default / pressed / disabled">
                <div className="flex flex-col gap-2">
                  <Button variant={variant}>Add Medicine</Button>
                  <Button variant={variant} pressed>
                    Add Medicine
                  </Button>
                  <Button variant={variant} disabled>
                    Add Medicine
                  </Button>
                </div>
              </Row>
              <Row label="Compact — default / pressed / disabled">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant={variant} size="compact">
                    Manage
                  </Button>
                  <Button variant={variant} size="compact" pressed>
                    Manage
                  </Button>
                  <Button variant={variant} size="compact" disabled>
                    Manage
                  </Button>
                </div>
              </Row>
            </div>
          ))}
        </Section>

        <Section title="Chip" note="Tap to select — multi-select in real use">
          <div className="flex flex-wrap gap-2">
            {["Morning", "Afternoon", "Evening"].map((t) => (
              <Chip key={t} selected={chip === t} onClick={() => setChip(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Radio" note="Selected / unselected / disabled">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Radio selected />
              <span className="text-body-primary text-text-primary">English</span>
            </span>
            <span className="flex items-center gap-2">
              <Radio />
              <span className="text-body-primary text-text-primary">Hindi</span>
            </span>
            <Radio disabled />
          </div>
        </Section>

        <Section title="Toggle" note="On / off / disabled — first one is live">
          <div className="flex items-center gap-4">
            <Toggle checked={notif} onCheckedChange={setNotif} />
            <Toggle checked={false} />
            <Toggle checked disabled />
          </div>
        </Section>

        <Section title="Icon Circle" note="Brand / error / success / neutral">
          <div className="flex items-center gap-3">
            <IconCircle tone="brand">
              <Droplet size={22} className="text-action-primary" />
            </IconCircle>
            <IconCircle tone="error">
              <Droplet size={22} className="text-feedback-error" />
            </IconCircle>
            <IconCircle tone="success">
              <Droplet size={22} className="text-feedback-success-text" />
            </IconCircle>
            <IconCircle tone="neutral">
              <Droplet size={22} className="text-text-secondary" />
            </IconCircle>
          </div>
        </Section>

        <Section title="Text Input" note="Label always above the field — never placeholder-only">
          <div className="flex flex-col gap-4">
            <TextInput label="Name" placeholder="Enter your name" />
            <TextInput label="Name" defaultValue="Kamala Devi" />
            <TextInput label="Name" placeholder="Enter your name" disabled />
          </div>
        </Section>

        <Section title="Card / List Row" note="One container, both jobs">
          <div className="flex flex-col gap-3">
            <Card>
              <IconCircle tone="error">
                <Droplet size={22} className="text-feedback-error" />
              </IconCircle>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-body-primary text-text-primary">Blood Sugar</span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-value-display-large text-text-primary">124</span>
                  <span className="text-button-label text-text-primary">mg/dL</span>
                </span>
                <span className="text-metadata text-text-tertiary flex items-center gap-1">
                  <Calendar size={16} aria-hidden />
                  Today, 9:12 AM
                </span>
              </div>
              <ChevronRight size={20} className="text-text-primary shrink-0" />
            </Card>

            <Card>
              <IconCircle tone="brand">
                <Droplet size={22} className="text-action-primary" />
              </IconCircle>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-body-medium text-text-primary">Amlodipine 5mg</span>
                <span className="text-body-secondary text-text-secondary">Morning, Evening</span>
              </div>
              <StatusTag confirmed={2} />
            </Card>
          </div>
        </Section>

        <Section title="Status Tag" note="Filled = confirmed. Outlined = not yet, never 'missed'">
          <div className="flex items-center gap-6">
            <StatusTag confirmed={0} />
            <StatusTag confirmed={1} />
            <StatusTag confirmed={3} />
          </div>
        </Section>

        <Section title="Info Callout" note="Factual reference. Brand-coloured but not interactive">
          <div className="flex flex-col gap-3">
            <InfoCallout label="Typical range for adults:">
              90–120 systolic, 60–80 diastolic
            </InfoCallout>
            <InfoCallout label="Your information stays private.">
              Only people you invite can see it.
            </InfoCallout>
          </div>
        </Section>

        <Section title="Avatar" note="Photo / fallback">
          <div className="flex items-center gap-3">
            <Avatar />
            <Avatar name="Rahul" src="/icons/icon-192.png" />
          </div>
        </Section>

        <Section title="Settings Row" note="Trailing toggle or chevron">
          <div className="bg-surface-default border-border-soft flex flex-col gap-5 rounded-xl border-[0.5px] p-4">
            <SettingsRow
              icon={<Bell size={22} strokeWidth={1.375} />}
              label="Notification"
              subtitle={notif ? "Reminders: On" : "Reminders: Off"}
              control={<Toggle checked={notif} onCheckedChange={setNotif} />}
            />
            <SettingsRow
              icon={<Globe size={22} strokeWidth={1.375} />}
              label="Language"
              subtitle={lang}
            />
          </div>
        </Section>

        <Section title="Language chips" note="Profile uses chips; onboarding uses radios — a known, accepted difference">
          <div className="flex flex-wrap gap-2">
            {["English", "Hindi"].map((l) => (
              <Chip key={l} selected={lang === l} onClick={() => setLang(l)}>
                {l}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Family Member Card">
          <div className="flex flex-wrap gap-3">
            <FamilyMemberCard name="Rahul Sharma" relation="Son" />
            <FamilyMemberCard name="Priya" relation="Daughter" />
          </div>
        </Section>

        <Section title="Empty State">
          <EmptyState message="You have no medicines." >
            <Button variant="primary" className="mt-2">
              Add Medicine
            </Button>
          </EmptyState>
        </Section>

        <Section title="Bottom Nav" note="One variant per active tab">
          <div className="flex flex-col gap-3">
            {(["home", "health", "library"] as const).map((t) => (
              <div key={t} className="border-border-soft overflow-hidden rounded-xl border-[0.5px]">
                <BottomNav active={t} />
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}
