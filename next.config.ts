import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

/**
 * Config is evaluated before NODE_ENV is reliably set, so the dev/prod split
 * keys off the phase Next passes in rather than the environment variable.
 */
export default function config(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    turbopack: {
      // Agentation is a development-only annotation toolbar. It ships its own
      // CSS, so the import survives the NODE_ENV check in the layout and all
      // 416KB of it was reaching every visitor. Production resolves it to a
      // no-op instead.
      resolveAlias: isDev ? {} : { agentation: "./src/lib/agentation-stub.tsx" },
    },
  };
}
