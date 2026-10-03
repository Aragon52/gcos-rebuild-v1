/**
 * Portal detection utilities for multi-portal routing.
 *
 * Supports two detection methods:
 * 1. Environment variable: VITE_PORTAL (for separate Cloud Run/container deployments)
 *    - "customer"  → customer portal (myshop.com)
 *    - "reseller"  → reseller portal (reseller.myshop.com)
 *    - "admin"     → admin portal (admin.myshop.com)
 *
 * 2. Subdomain detection (unified deployment / dev):
 *    - myshop.com              → customer
 *    - reseller.myshop.com     → reseller
 *    - admin.myshop.com        → admin
 */

export type PortalType = "customer" | "reseller" | "admin";

/**
 * Legacy portal-lock flag.
 *
 * URL shortening on the admin./reseller. subdomains is now handled by the
 * router rewrite in src/lib/portal-host.ts, so application code must always
 * build canonical "/admin/..." and "/reseller/..." paths. Keeping this false
 * also guarantees identical markup on the server and in the browser.
 */
export function isAppModeDriven(): boolean {
  return false;
}

export function shouldShowPortalSwitcher(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname;

    // Explicitly exclude on production domain and custom domains
    if (
      host === "globalcart-onlineshop.com" ||
      host.endsWith(".globalcart-onlineshop.com") ||
      host === "lovable.app" ||
      host.endsWith(".lovable.app")
    ) {
      return false;
    }

    // Only render on development/preview runtimes (localhost, ais-dev, ais-pre, Cloud Run dev previews)
    const isDevPreview =
      host.includes("ais-dev-") ||
      host.includes("ais-pre-") ||
      host.includes(".run.app") ||
      host === "localhost" ||
      host === "127.0.0.1";

    return isDevPreview;
  } catch (e) {
    return false;
  }
}

export function setPortalOverride(portal: PortalType) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem("dev_portal_override", portal);
    }
  } catch (e) { /* ignore */ }
}

export function detectPortal(): PortalType {
  // 0. Manual override (Highest priority for dev)
  try {
    const override = typeof window !== 'undefined' ? localStorage.getItem("dev_portal_override") as PortalType : null;
    if (override === "admin" || override === "reseller" || override === "customer") {
      return override;
    }
  } catch (e) { /* ignore */ }

  // 1. Env vars (Hard lock for production deployments)
  const mode = import.meta.env.VITE_PORTAL || import.meta.env.VITE_APP_MODE;
  if (mode === "admin") return "admin";
  if (mode === "reseller") return "reseller";
  if (mode === "site" || mode === "customer") return "customer";

  // 2. Subdomain detection
  try {
    const host = window.location.hostname;
    if (host.startsWith("admin.") || host.startsWith("administration.")) return "admin";
    if (host.startsWith("reseller.") || host.startsWith("retailshops.")) return "reseller";
  } catch (e) { /* ignore */ }

  // 3. Path-based detection (Fallback for unified mode)
  try {
    const path = window.location.pathname;
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/reseller")) return "reseller";
  } catch (e) { /* ignore */ }

  return "admin";
}

/** @deprecated Use detectPortal() === "admin" instead */
export function isAdminSubdomain(): boolean {
  return detectPortal() === "admin";
}

export function isResellerSubdomain(): boolean {
  return detectPortal() === "reseller";
}

/**
 * Returns the route prefix for admin pages.
 * When locked to admin portal, returns "" (root-level).
 */
export function adminPrefix(): string {
  return isAppModeDriven() && detectPortal() === "admin" ? "" : "/admin";
}

/**
 * Returns the route prefix for reseller pages.
 * When locked to reseller portal, returns "" (root-level).
 */
export function resellerPrefix(): string {
  return isAppModeDriven() && detectPortal() === "reseller" ? "" : "/reseller";
}

function normalizeCanonicalPath(canonicalPath: string, basePath: "/admin" | "/reseller"): string {
  const normalized = canonicalPath.replace(/\/$/, "") || basePath;
  return normalized.startsWith(basePath) ? normalized : `${basePath}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
}

export function adminPath(canonicalPath: string): string {
  const normalized = normalizeCanonicalPath(canonicalPath, "/admin");

  if (isAppModeDriven() && detectPortal() === "admin") {
    const stripped = normalized.replace(/^\/admin(?=\/|$)/, "") || "/";
    return stripped;
  }

  return normalized;
}

export function resellerPath(canonicalPath: string): string {
  const normalized = normalizeCanonicalPath(canonicalPath, "/reseller");

  if (isAppModeDriven() && detectPortal() === "reseller") {
    const stripped = normalized.replace(/^\/reseller(?=\/|$)/, "") || "/";
    return stripped;
  }

  return normalized;
}

/**
 * Returns the absolute URL for a reseller's storefront.
 * Handles subdomain vs path-based routing correctly.
 */
export function getStorefrontUrl(shopSlug: string): string {
  if (!shopSlug) return "/";
  
  try {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If we're on a dev/preview host, use path-based routing
    if (host.includes('ais-dev-') || host.includes('ais-pre-') || host === 'localhost' || host === '127.0.0.1') {
      return `/store/${shopSlug}`;
    }
    
    // In production, we might be on reseller.myshop.com or admin.myshop.com
    // We want to go to myshop.com/store/slug
    const baseHost = host.replace(/^(admin|reseller|administration|retailshops)\./, "");
    return `${protocol}//${baseHost}/store/${shopSlug}`;
  } catch (e) {
    return `/store/${shopSlug}`;
  }
}
