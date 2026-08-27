import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sakha",
    short_name: "Sakha",
    description: "A calm daily companion for your health and routine.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8F8FF", // surface/page
    // iOS reads this at install time for the status bar. Light, to match the
    // onboarding screens — there is no per-screen control for an installed
    // app, so this is the value every screen gets unless iOS happens to
    // honour the dynamic tag below.
    theme_color: "#F8F8FF",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
