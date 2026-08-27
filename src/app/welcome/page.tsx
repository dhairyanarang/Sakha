import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Welcome. The illustration is full-bleed and bottom-anchored, with a gradient
 * fading it into the page so the button never sits on busy pixels.
 *
 * Assets are served as pre-optimised static files rather than through
 * next/image: they are fixed art, already sized and compressed at build time,
 * and this keeps the PWA off the image-optimisation quota entirely.
 */
export default async function WelcomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  return (
    <div className="bg-surface-tinted flex min-h-0 flex-1 flex-col overflow-hidden">
      <header
        className="flex shrink-0 flex-col items-center px-4"
        style={{ paddingTop: "31px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/onboarding/sakha-mark.svg"
          alt=""
          width={69}
          height={69}
          className="size-[69px]"
        />
        <p className="text-action-primary mt-[11px] text-[30px] leading-none font-semibold">
          Sakha
        </p>
        {/* rgba(10,10,10,0.8) over surface/page, resolved to a solid value —
            text must never be lightened with opacity. */}
        <p className="mt-[15px] max-w-[321px] text-center text-[24px] leading-[1.4] font-medium text-[#3A3A3B]">
          A simple way to stay on top of your health
        </p>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/onboarding/welcome.webp"
          alt="An older woman and her son looking at a phone together"
          /* Fills the box rather than being fitted inside it, so there are no
             slivers of page down the sides. Anchored to the top so a short
             screen crops the bottom of the frame and never their faces. */
          className="absolute inset-0 size-full object-cover object-top"
        />
        <div className="from-surface-tinted/0 to-surface-tinted absolute inset-x-0 bottom-0 h-[125px] bg-gradient-to-b" />
      </div>

      <footer
        className="shrink-0 px-4"
        style={{ paddingBottom: "calc(var(--spacing-6) + var(--spacing-2))" }}
      >
        <Link
          href="/sign-in"
          className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
        >
          Get Started
        </Link>
      </footer>
    </div>
  );
}
