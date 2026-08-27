import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
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
    // NOT black-translucent. That setting applies only once installed to the
    // home screen, and it makes the web view claim the whole screen — which
    // flips env(safe-area-inset-bottom) from ~0 in the browser to 34px in
    // standalone. Every footer then gained 34px the moment the app was
    // installed, which is why it looked right in Safari and floated on the
    // home screen. The cost is that Home's gradient stops at the status bar
    // rather than running under it.
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
