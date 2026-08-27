import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

/**
 * Config is evaluated before NODE_ENV is reliably set, so the dev/prod split
 * keys off the phase Next passes in rather than the environment variable.
 */
export default function config(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    experimental: {
      /**
       * How long a rendered route stays reusable in the client cache.
       *
       * `dynamic` ships as 0, meaning every return to a screen refetches from
       * the server before anything appears — which is what made going back to
       * a tab feel as slow as opening it the first time. Thirty seconds is
       * short enough that data stays honest and long enough to cover moving
       * between tabs, and every mutation calls revalidatePath, so a
       * confirmation or a new reading still invalidates these entries
       * immediately rather than waiting out the window.
       */
      staleTimes: {
        dynamic: 30,
        static: 300,
      },
    },
    turbopack: {
      // Agentation is a development-only annotation toolbar. It ships its own
      // CSS, so the import survives the NODE_ENV check in the layout and all
      // 416KB of it was reaching every visitor. Production resolves it to a
      // no-op instead.
      resolveAlias: isDev ? {} : { agentation: "./src/lib/agentation-stub.tsx" },
    },
  };
}
