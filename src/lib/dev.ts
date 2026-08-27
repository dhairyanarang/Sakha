/**
 * Development affordances.
 *
 * Gated on an environment variable that is set on preview deployments only, so
 * none of this exists in production regardless of what the code says. Anything
 * behind this flag is a testing convenience and must never become a real
 * product path.
 */
export const DEV_TOOLS = process.env.NEXT_PUBLIC_DEV_TOOLS === "1";
