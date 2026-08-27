/**
 * Production stand-in for the Agentation toolbar.
 *
 * next.config.ts aliases the real package to this file in production builds.
 * The NODE_ENV guard in the layout stops it RENDERING, but the import itself
 * has side effects (it ships its own CSS), so without this alias the whole
 * 416KB library was still bundled and downloaded by every visitor.
 */
export function Agentation() {
  return null;
}
