import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
  themeColor: "#F8F8FF", // surface/page
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      {/* Sakha is a mobile-only design — one 402px artboard, no tablet or
          desktop layout has ever been drawn. Rather than inventing breakpoints
          that don't exist, the app is capped at a phone-width column and
          centred, with plain white either side on anything larger. Below that
          cap it is fully fluid, so real phones from 320px up are unaffected. */}
      <body className="flex min-h-full flex-col bg-white">
        <div className="bg-surface-page mx-auto flex w-full max-w-[430px] flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
