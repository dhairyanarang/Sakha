import { redirect } from "next/navigation";
import { ShieldUser } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignInButton } from "./google-sign-in-button";
import { DEV_TOOLS } from "@/lib/dev";
import { getMessages } from "@/lib/i18n/server";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  const { error } = await searchParams;
  const t = await getMessages();

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <header
        className="flex shrink-0 flex-col items-center gap-6 px-4"
        style={{ paddingTop: "46px" }}
      >
        <div className="flex flex-col items-center gap-[13px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/onboarding/sakha-mark.svg"
            alt=""
            width={83}
            height={83}
            className="size-[83px]"
          />
          <p className="text-action-primary text-[36px] leading-none font-semibold">Sakha</p>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-text-primary text-[24px] leading-[1.4] font-medium">
            {t.signIn.title}
          </p>
          {/* rgba(0,0,0,0.6) over surface/page, resolved to a solid value. */}
          <p className="text-[18px] leading-[1.4] text-[#636366]">{t.signIn.subtitle}</p>
        </div>
      </header>

      {/* Figma places this at 372px wide, i.e. 15px margins rather than 16. */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-[15px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/onboarding/privacy-shield.webp"
          alt=""
          className="h-auto w-full max-w-[372px] object-contain"
        />
      </div>

      <footer
        className="flex shrink-0 flex-col gap-6 px-4"
        style={{ paddingBottom: "var(--spacing-7)" }}
      >
        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error text-center">
            {t.signIn.failed}
          </p>
        ) : null}

        {/* Not the Info Callout component: this uses brand-at-8% with radius/md
            and no border, where Info Callout is surface/tinted with a brand
            border and radius/sm. Flagged. */}
        <div className="flex items-center gap-3 rounded-md bg-[rgb(85_81_255/0.08)] px-3 py-2.5">
          <ShieldUser size={24} className="text-action-primary shrink-0" aria-hidden />
          <p className="text-action-primary text-[16px] leading-[1.4]">
            {t.signIn.privacy}
          </p>
        </div>

        <GoogleSignInButton />

        {/* Testing only. Gated on NEXT_PUBLIC_DEV_TOOLS, which is set on
            preview and development and never on production — so this button
            cannot appear in a real build. Signs in as the QA account and goes
            straight to Home. */}
        {DEV_TOOLS ? (
          <a
            href="/dev/login"
            className="text-text-tertiary flex h-[44px] items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border-subtle)] text-[14px]"
          >
            {t.signIn.guestTesting}
          </a>
        ) : null}
      </footer>
    </div>
  );
}
