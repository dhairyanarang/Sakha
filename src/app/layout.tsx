import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeColor } from "@/components/theme-color";
import { Agentation } from "agentation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sakha",
  description: "A calm daily companion for your health and routine.",
  applicationName: "Sakha",
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
  themeColor: "#F1F1FF", // surface/tinted — matches the canvas
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      {/* Sakha is a mobile-only design — one 402px artboard, no tablet or
          desktop layout has ever been drawn. Rather than inventing breakpoints
          that don't exist, the app is capped at a phone-width column and
          centred, with plain white either side on anything larger. Below that
          cap it is fully fluid, so real phones from 320px up are unaffected. */}
      <body className="bg-surface-tinted flex flex-col">
        <ThemeColor />
        <div className="bg-surface-tinted fixed inset-y-0 left-1/2 flex w-full max-w-[430px] -translate-x-1/2 flex-col overflow-hidden">
          {children}
        </div>
        {/* Visual feedback toolbar. Dev only — the check compiles away in a
            production build, so it never ships to a real device. */}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
