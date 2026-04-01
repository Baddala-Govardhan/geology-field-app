/**
 * Router basename from CRA PUBLIC_URL (set at build time).
 * Examples: "" for Docker at /, "/geology-field-app" for GitHub Pages.
 */
export function getRouterBasename() {
  const raw = process.env.PUBLIC_URL || "";
  const trimmed = raw.replace(/\/$/, "");
  if (!trimmed || trimmed === ".") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
