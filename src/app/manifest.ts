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
    background_color: "#F1F1FF", // surface/tinted
    // iOS reads THIS at install time and uses it for the status bar. A
    // per-route <meta name="theme-color"> does not reach a standalone app, so
    // the brand colour is set here to continue Home's header gradient. The
    // cost is that the other screens get an indigo strip too.
    theme_color: "#5551FF",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
