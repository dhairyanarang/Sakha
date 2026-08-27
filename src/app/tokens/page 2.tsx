/**
 * Token proof sheet — Phase 0.
 *
 * Temporary. This route exists to verify the generated Figma theme renders
 * correctly on a real device before any screen is built. It will be replaced
 * by Home, and the component states will move to /kitchen-sink in Phase 1.
 *
 * Every value below is referenced through a SEMANTIC token. If something here
 * looks wrong, fix it in Figma and regenerate tokens.css — never patch it here.
 */

const SURFACES = [
  ["surface/page", "bg-surface-page"],
  ["surface/default", "bg-surface-default"],
  ["surface/subtle", "bg-surface-subtle"],
  ["surface/tinted", "bg-surface-tinted"],
  ["surface/tinted-strong", "bg-surface-tinted-strong"],
] as const;

const ACTIONS = [
  ["action/primary", "bg-action-primary"],
  ["action/primary-pressed", "bg-action-primary-pressed"],
  ["action/primary-disabled", "bg-action-primary-disabled"],
] as const;

const FEEDBACK = [
  ["feedback/error", "bg-feedback-error"],
  ["feedback/error-surface", "bg-feedback-error-surface"],
  ["feedback/mood-not-good", "bg-feedback-mood-not-good"],
  ["feedback/success", "bg-feedback-success"],
  ["feedback/success-surface", "bg-feedback-success-surface"],
  ["feedback/info", "bg-feedback-info"],
  ["feedback/info-surface", "bg-feedback-info-surface"],
] as const;

const CHART = [
  ["chart/systolic", "bg-chart-systolic"],
  ["chart/diastolic", "bg-chart-diastolic"],
  ["chart/range-line", "bg-chart-range-line"],
  ["chart/gridline", "bg-chart-gridline"],
  ["chart/gridline-alt", "bg-chart-gridline-alt"],
] as const;

const TYPE = [
  ["screen-title", "text-screen-title", "Good morning, Kamala"],
  ["section-label", "text-section-label", "TODAY"],
  ["subsection-heading", "text-subsection-heading", "Measurements"],
  ["body-primary", "text-body-primary", "Blood pressure"],
  ["body-medium", "text-body-medium", "Amlodipine 5mg"],
  ["body-secondary", "text-body-secondary", "Take one tablet in the morning"],
  ["metadata", "text-metadata", "3 days ago"],
  ["eyebrow-label", "text-eyebrow-label", "Morning"],
  ["nav-label", "text-nav-label", "Library"],
  ["chip-label", "text-chip-label", "Morning"],
  ["button-label", "text-button-label", "Add Medicine"],
  ["value-display", "text-value-display", "124 / 82"],
  ["value-display-large", "text-value-display-large", "124 / 82"],
] as const;

const SPACING = [1, 2, 3, 4, 5, 6, 7] as const;
const SPACE_PX: Record<number, string> = {
  1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px", 6: "24px", 7: "44px",
};

const RADII = [
  ["xs", "rounded-xs", "5"],
  ["sm", "rounded-sm", "8"],
  ["md", "rounded-md", "12"],
  ["lg", "rounded-lg", "16"],
  ["xl", "rounded-xl", "20"],
  ["2xl", "rounded-2xl", "32"],
  ["full", "rounded-full", "999"],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-section-label text-text-tertiary uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatches({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map(([name, cls]) => (
        <div key={name} className="flex items-center gap-3">
          <div
            className={`${cls} size-11 shrink-0 rounded-md border border-border-soft`}
          />
          <span className="text-body-secondary text-text-secondary">{name}</span>
        </div>
      ))}
    </div>
  );
}

export default function TokenProofSheet() {
  return (
    <main className="mx-auto w-full max-w-[402px] px-4 py-6 flex flex-col gap-7">
      <header className="flex flex-col gap-1">
        <h1 className="text-screen-title text-text-primary">Sakha tokens</h1>
        <p className="text-body-secondary text-text-secondary">
          Generated from Figma. Phase 0 verification sheet.
        </p>
      </header>

      <Section title="Surface">
        <Swatches items={SURFACES} />
      </Section>

      <Section title="Action">
        <Swatches items={ACTIONS} />
      </Section>

      <Section title="Feedback">
        <Swatches items={FEEDBACK} />
      </Section>

      <Section title="Chart">
        <Swatches items={CHART} />
      </Section>

      <Section title="Text colors">
        <div className="flex flex-col gap-2">
          <p className="text-body-primary text-text-primary">text/primary — pure black</p>
          <p className="text-body-primary text-text-secondary">text/secondary</p>
          <p className="text-body-primary text-text-tertiary">text/tertiary</p>
          <p className="text-body-primary text-text-disabled">text/disabled</p>
          <p className="bg-action-primary text-text-on-brand text-body-primary rounded-md px-3 py-2">
            text/on-brand
          </p>
        </div>
      </Section>

      <Section title="Borders">
        <div className="flex flex-col gap-2">
          {[
            ["border/default", "border-border-default"],
            ["border/soft", "border-border-soft"],
            ["border/subtle", "border-border-subtle"],
            ["border/faint", "border-border-faint"],
          ].map(([name, cls]) => (
            <div
              key={name}
              className={`${cls} bg-surface-default text-body-secondary text-text-secondary rounded-xl border px-3 py-3`}
            >
              {name}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border p-4">
          {TYPE.map(([name, cls, sample]) => (
            <div key={name} className="flex flex-col gap-1">
              <span className="text-metadata text-text-tertiary">{name}</span>
              <span className={`${cls} text-text-primary`}>{sample}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Spacing · 4px grid">
        <div className="flex flex-col gap-2">
          {SPACING.map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div
                className="bg-action-primary h-4 rounded-xs"
                style={{ width: `var(--spacing-${n})` }}
              />
              <span className="text-body-secondary text-text-secondary">
                space/{n} · {SPACE_PX[n]}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius">
        <div className="flex flex-wrap gap-3">
          {RADII.map(([name, cls, px]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <div className={`${cls} bg-surface-tinted border-border-subtle size-14 border`} />
              <span className="text-metadata text-text-tertiary">
                {name} · {px}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Touch targets · verified sizes">
        <div className="flex flex-col gap-2">
          <div className="bg-action-primary text-text-on-brand text-button-label flex h-[60px] w-full items-center justify-center rounded-xl">
            Primary · 60px
          </div>
          <div className="bg-surface-tinted text-action-primary text-button-label flex h-[39px] w-[100px] items-center justify-center rounded-sm">
            Compact · 39
          </div>
          <div className="bg-surface-tinted text-action-primary text-chip-label flex h-[46px] w-fit items-center justify-center rounded-full px-5">
            Chip · 46px
          </div>
        </div>
      </Section>
    </main>
  );
}
