import { createContext, useContext } from "react";

export type SLARole = "Owner" | "Admin" | "User";

export interface AdminSession {
  name: string;
  email: string;
  role: SLARole;
  accountId: string | null;
  uid: string;
}

export const STAFF_ALLOWED_PATHS = new Set([
  "/admin",
  "/admin/inventory",
  "/admin/catalog",
  "/admin/orders",
  "/admin/resellers",
  "/admin/customer-service",
  "/admin/content",
  "/admin/ach/customers",
  "/admin/ach/financial",
  "/admin/ach/miscellaneous",
  "/admin/sla/site-advertising",
  "/admin/sla/broadcast-news",
  "/admin/sla/sqc",
  "/admin/sla/sqc-orders",
  "/admin/sla/administrator",
  "/admin/sla/staff",
  "/admin/sla/reseller-2-admin",
  "/admin/ars/reseller-profiles",
  "/admin/ars/retail-shops",
  "/admin/ars/orders",
  "/admin/ars/payment-info",
  "/admin/ars/deposit",
  "/admin/ars/withdrawal",
  "/admin/customer-care/staffs",
  "/admin/customer-care/reseller-profile",
  "/admin/customer-care/virtual-services",
  "/admin/customer-care/order-services",
  "/admin/system",
  "/admin/admin-sessions",
  "/admin/system/sessions",
  "/admin/alerts",
  "/admin/system-logs",
  "/admin/admins",
  "/admin/messenger",
  "/admin/roles",
  "/admin/audit-logs",
  "/admin/security",
]);

export const OWNER_ONLY_PATHS = new Set([
  "/admin/sla/ownership",
  "/admin/admin-sessions",
  "/admin/system/sessions",
]);

export function isPathAllowed(role: SLARole, pathname: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/admin";
  if (p.startsWith("/admin/auth")) return true;
  if (OWNER_ONLY_PATHS.has(p)) {
    return role === "Owner";
  }
  if (role === "Owner" || role === "Admin") return true;
  return STAFF_ALLOWED_PATHS.has(p);
}

export interface AdminAuthContextType {
  session: AdminSession | null;
  signIn: (email: string, password: string) => Promise<{success: boolean, message?: string}>;
  signOut: () => Promise<void>;
  loading: boolean;
  user?: { id?: string; email?: string; role?: string } | null;
}

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
