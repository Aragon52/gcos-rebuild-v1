/**
 * Host-based portal routing.
 *
 * Production hosting (Netlify) serves all three portals from one deployment:
 *   globalcart-onlineshop.com           -> customer portal  (routes at "/")
 *   reseller.globalcart-onlineshop.com  -> reseller portal   (internally "/reseller/*")
 *   admin.globalcart-onlineshop.com     -> admin portal      (internally "/admin/*")
 *
 * The route tree always keeps the canonical "/admin" and "/reseller" prefixes.
 * The router rewrites URLs on the way in (browser/SSR request -> internal path)
 * and on the way out (internal path -> address bar), so a visitor on the admin
 * subdomain sees admin.globalcart-onlineshop.com/orders while the router matches
 * the /admin/orders route.
 *
 * Path-based access (globalcart-onlineshop.com/admin/...) keeps working, which is
 * what the Lovable preview and localhost use.
 */

export type PortalPrefix = "" | "/admin" | "/reseller";

const HOST_PREFIX_RULES: Array<{ test: RegExp; prefix: PortalPrefix }> = [
  { test: /^(admin|administration)\./i, prefix: "/admin" },
  { test: /^(reseller|retailshops)\./i, prefix: "/reseller" },
];

/** Paths that must never be rewritten (server functions, API routes, assets, Vite internals, public files). */
const RESERVED_PATH = /^\/(api|_serverFn|_server|_build|assets|src|node_modules|@|__|\.netlify|\.tanstack|favicon|robots\.txt|sitemap|manifest|brand|images|fonts|crypto|badges|placeholder|\.well-known|sw\.js|offline\.html|store|products|categories|cart|checkout)/;

export function portalPrefixForHost(hostname?: string | null): PortalPrefix {
  // 0. Manual dev override via localStorage
  try {
    if (typeof window !== "undefined") {
      const override = localStorage.getItem("dev_portal_override");
      if (override === "admin") return "/admin";
      if (override === "reseller") return "/reseller";
      if (override === "customer" || override === "site") return "";
    }
  } catch (e) {
    /* ignore */
  }

  // 1. Explicit env configuration (VITE_PORTAL or VITE_APP_MODE)
  const envMode =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_PORTAL || import.meta.env.VITE_APP_MODE || "")
      : "";
  if (envMode === "admin") return "/admin";
  if (envMode === "reseller") return "/reseller";
  if (envMode === "site" || envMode === "customer") return "";

  // 2. Subdomain host rules
  if (!hostname) return "";
  for (const rule of HOST_PREFIX_RULES) {
    if (rule.test.test(hostname)) return rule.prefix;
  }
  return "";
}

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Request/address-bar URL -> internal router URL. */
export function toInternalUrl({ url }: { url: URL }): URL | undefined {
  if (RESERVED_PATH.test(url.pathname)) return undefined;

  const prefix = portalPrefixForHost(url.hostname);
  if (!prefix) return undefined;
  if (hasPrefix(url.pathname, prefix)) return undefined;

  const next = new URL(url);
  next.pathname = `${prefix}${url.pathname === "/" ? "" : url.pathname}` || prefix;
  return next;
}

/** Internal router URL -> address-bar URL. */
export function toExternalUrl({ url }: { url: URL }): URL | undefined {
  if (RESERVED_PATH.test(url.pathname)) return undefined;

  const prefix = portalPrefixForHost(url.hostname);
  if (!prefix) return undefined;
  if (!hasPrefix(url.pathname, prefix)) return undefined;

  const next = new URL(url);
  next.pathname = url.pathname.slice(prefix.length) || "/";
  return next;
}
