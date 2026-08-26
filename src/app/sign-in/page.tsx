import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoCallout } from "@/components/ui";
import { GoogleSignInButton } from "./google-sign-in-button";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  const { error } = await searchParams;

  return (
    <div className="bg-surface-page flex min-h-dvh flex-col px-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="bg-action-primary size-[84px] rounded-2xl" />
        <p className="text-action-primary text-[36px] leading-none font-semibold">Sakha</p>
        <h1 className="text-text-primary mt-6 text-[24px] font-medium">Welcome to Sakha</h1>
        <p className="text-body-primary text-text-secondary">Sign in to continue</p>
      </div>

      <footer
        className="flex flex-col gap-4"
        style={{ paddingBottom: "calc(var(--spacing-6) + env(safe-area-inset-bottom))" }}
      >
        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error text-center">
            We couldn&apos;t sign you in. Please try again.
          </p>
        ) : null}
        <InfoCallout>
          We respect your privacy and keep your information safe.
        </InfoCallout>
        <GoogleSignInButton />
      </footer>
    </div>
  );
}
