import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Agentation } from "agentation";
import { DevTools } from "@/components/dev-tools";
import { Splash } from "@/components/splash";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Sakha's identity on the web.
 *
 * metadataBase is what makes every relative asset below resolve to an absolute
 * URL — Open Graph and Twitter both require absolute, and without it a shared
 * link previews with a broken image. It follows the deployment: the real
 * domain in production, and whatever host a preview happens to be on, so a
 * preview never advertises the production URL as its own.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? "https://sakha.dhairya.work"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

const TITLE = "Sakha — Elderly Care, Made Simple";
const DESCRIPTION =
  "Sakha helps older adults stay on top of medicines, health readings and everyday care, while keeping family members connected.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Sakha",
  // Every screen sits behind auth and none of them is a landing page, so the
  // canonical is the site itself rather than a per-route URL.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Sakha",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: "Sakha",
    // Deliberately NOT black-translucent.
    //
    // That directive does nothing in a browser and everything once installed,
    // which is precisely the shape of the bug it caused: it hands the web view
    // the whole screen INCLUDING the status bar, then iOS offsets the content
    // down by the status bar height while still reporting full height. The
    // last ~47px end up empty — the block of page colour under the bottom nav,
    // present on the home screen and never in Safari.
    //
    // "default" makes iOS reserve and paint the strip itself, so the web view
    // starts below it, the bottom is the real bottom, and the status bar is
    // light — which is what onboarding wants.
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Deliberately NOT locking maximumScale or userScalable. Our reader is
  // presbyopic — pinch-zoom must keep working.
  viewportFit: "cover",
  /**
   * The keyboard covers the page; it does not shrink it.
   *
   * Android's default is resizes-content: opening the keyboard shrinks the
   * LAYOUT viewport, so anything anchored to the bottom is dragged up with it.
   * On an onboarding step that put the whole footer — 112px, and 164px on the
   * step with two buttons — on top of the field she was typing into.
   *
   * overlays-content leaves the layout viewport alone and lets the keyboard sit
   * over it, which is what iOS already does. So both platforms now behave the
   * same way: the Next button stays where it was and the keyboard covers it.
   */
  interactiveWidget: "overlays-content",
  themeColor: "#F8F8FF", // surface/page — matches the canvas
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Read once, here, from a cookie — no database round trip on the shell, and
  // every screen below (server or client) reads the same answer.
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} antialiased`}>
      {/* Sakha is a mobile-only design — one 402px artboard, no tablet or
          desktop layout has ever been drawn. Rather than inventing breakpoints
          that don't exist, the app is capped at a phone-width column and
          centred, with plain white either side on anything larger. Below that
          cap it is fully fluid, so real phones from 320px up are unaffected. */}
      <body className="flex flex-col">
        {/* First child of the body so its inline script settles whether the
            splash plays before the overlay itself is parsed. */}
        <Splash />
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col">
          <LocaleProvider locale={locale}>{children}</LocaleProvider>
        </div>
        {/* Visual feedback toolbar. Dev only — the check compiles away in a
            production build, so it never ships to a real device. */}
        {process.env.NODE_ENV === "development" && <Agentation />}
        <DevTools />
      </body>
    </html>
  );
}
