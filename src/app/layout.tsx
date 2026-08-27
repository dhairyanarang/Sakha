import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StatusBarBackdrop } from "@/components/status-bar-backdrop";
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
    // black-translucent is the only style that lets the page draw behind the
    // status bar; "default" fills that strip with a flat light colour and
    // ignores theme_color entirely, which is why it kept coming back white.
    //
    // It also makes the web view claim the whole screen, which is what
    // previously inflated every footer by 34px through
    // env(safe-area-inset-bottom). Nothing consumes the BOTTOM inset any more
    // — bottom spacing is a fixed 24px — so only the top inset is used, which
    // is exactly what it is for.
    statusBarStyle: "black-translucent",
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
        <StatusBarBackdrop />
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
