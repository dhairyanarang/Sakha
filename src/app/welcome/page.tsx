import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  return (
    <div className="bg-surface-page relative flex min-h-dvh flex-col overflow-hidden">
      <div className="flex flex-col items-center px-4 pt-[100px]">
        {/* Placeholder for the gradient Sakha mark — the real vector still
            needs exporting from Figma. */}
        <div className="bg-action-primary size-[69px] rounded-2xl" />
        <p className="text-action-primary mt-3 text-[30px] leading-none font-semibold">Sakha</p>
        <p className="text-text-primary mt-8 text-center text-[24px] leading-[1.4] font-medium">
          A simple way to stay on top of your health
        </p>
      </div>

      <div className="bg-surface-tinted mt-auto h-[448px] w-full" aria-hidden />

      <footer
        className="absolute inset-x-0 bottom-0 px-4"
        style={{ paddingBottom: "calc(var(--spacing-6) + env(safe-area-inset-bottom))" }}
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
