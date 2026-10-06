import type { SLARole } from "./admin-auth-context-hooks";

export interface AdminPagePermission {
  id: string;
  title: string;
  url: string;
  description: string;
  ownerOnly?: boolean;
}

export interface PermissionCategory {
  id: string;
  label: string;
  pages: AdminPagePermission[];
}

export const ADMIN_PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "menu",
    label: "MENU",
    pages: [
      {
        id: "overview",
        title: "Overview Dashboard",
        url: "/admin",
        description: "Main administrative analytics, key performance indicators, and store metrics."
      }
    ]
  },
  {
    id: "customer-care",
    label: "CUSTOMER CARE SERVICE",
    pages: [
      {
        id: "cc-staffs",
        title: "Staffs",
        url: "/admin/customer-care/staffs",
        description: "Manage staff accounts, departments, and group members."
      },
      {
        id: "cc-reseller-profile",
        title: "Reseller Profile",
        url: "/admin/customer-care/reseller-profile",
        description: "View and manage reseller account details, credentials, and verification."
      },
      {
        id: "cc-virtual-chat",
        title: "Virtual Chat Service",
        url: "/admin/customer-care/virtual-services",
        description: "Direct real-time customer care chat with assigned resellers."
      },
      {
        id: "cc-virtual-order",
        title: "Virtual Order Service",
        url: "/admin/customer-care/order-services",
        description: "Assist resellers with virtual ordering and custom order fulfillment."
      },
      {
        id: "cc-retail-shops",
        title: "Retail Shops",
        url: "/admin/resellers",
        description: "Retail storefronts overview, suspension status, and credibility scores."
      },
      {
        id: "cc-track-orders",
        title: "Track & Manage Orders",
        url: "/admin/ars/orders",
        description: "Order status tracking, fulfillment progression, and shipment updates."
      }
    ]
  },
  {
    id: "management-financing",
    label: "MANAGEMENT & FINANCING",
    pages: [
      {
        id: "mf-customer-service",
        title: "Customer Service",
        url: "/admin/customer-service",
        description: "Platform customer care ticketing and dispute resolution."
      },
      {
        id: "mf-reseller-chat",
        title: "Reseller Customer Service",
        url: "/admin/sla/reseller-2-admin",
        description: "Reseller support messenger and live issue resolution."
      },
      {
        id: "mf-payment-info",
        title: "Payment Info's & Balance",
        url: "/admin/ars/payment-info",
        description: "Reseller bank accounts, USDC wallets, and account balances."
      },
      {
        id: "mf-deposit",
        title: "Deposit Management",
        url: "/admin/ars/deposit",
        description: "Review and approve reseller top-up and deposit requests."
      },
      {
        id: "mf-withdrawal",
        title: "Withdrawal Management",
        url: "/admin/ars/withdrawal",
        description: "Process and approve reseller balance withdrawal requests."
      },
      {
        id: "mf-administrator",
        title: "Administrator Page",
        url: "/admin/sla/administrator",
        description: "Manage admin accounts, credentials, and page permissions.",
        ownerOnly: true
      },
      {
        id: "mf-ownership",
        title: "Ownership & Control",
        url: "/admin/sla/ownership",
        description: "Root master controls, master passwords, and administrative delegation.",
        ownerOnly: true
      }
    ]
  },
  {
    id: "miscellaneous",
    label: "MISCELLANEOUS GROUP",
    pages: [
      {
        id: "misc-catalog",
        title: "Product Catalog",
        url: "/admin/catalog",
        description: "Global products catalog, pricing, categories, and inventory."
      },
      {
        id: "misc-customers",
        title: "Customers Directory",
        url: "/admin/ach/customers",
        description: "Registered customer profiles, shopping activity, and order history."
      },
      {
        id: "misc-financial",
        title: "Financial Statements",
        url: "/admin/ach/financial",
        description: "Gross revenue, profit margin calculations, and financial reports."
      },
      {
        id: "misc-orders",
        title: "Marketplace Orders",
        url: "/admin/orders",
        description: "Direct marketplace orders, checkout receipts, and customer transactions."
      }
    ]
  },
  {
    id: "system",
    label: "SYSTEM & AUDIT",
    pages: [
      {
        id: "sys-dashboard",
        title: "System Dashboard",
        url: "/admin/system",
        description: "SLA metrics, uptime monitoring, and nightly database backups."
      },
      {
        id: "sys-session-logs",
        title: "Admin Session Logs",
        url: "/admin/admin-sessions",
        description: "Active administrator login sessions, IP addresses, and geolocation tracker."
      },
      {
        id: "sys-alerts",
        title: "Active Alerts",
        url: "/admin/alerts",
        description: "Security events, anomaly alerts, and suspicious activity notifications."
      },
      {
        id: "sys-logs",
        title: "System Audit Logs",
        url: "/admin/system-logs",
        description: "Complete immutable audit trail of administrative modifications."
      }
    ]
  }
];

// Flat list of all pages
export const ALL_ADMIN_PAGES: AdminPagePermission[] = ADMIN_PERMISSION_CATEGORIES.flatMap(c => c.pages);

// Default accessible pages for standard roles when no custom permissions are set
export const DEFAULT_OWNER_PAGES = ALL_ADMIN_PAGES.map(p => p.url);

export const DEFAULT_ADMIN_PAGES = ALL_ADMIN_PAGES
  .filter(p => !p.ownerOnly)
  .map(p => p.url);

export const DEFAULT_STAFF_PAGES = [
  "/admin",
  "/admin/customer-care/staffs",
  "/admin/customer-care/reseller-profile",
  "/admin/customer-care/virtual-services",
  "/admin/customer-care/order-services",
  "/admin/resellers",
  "/admin/ars/orders",
  "/admin/customer-service",
  "/admin/sla/reseller-2-admin",
  "/admin/catalog",
  "/admin/orders"
];

// Preset templates for quick configuration
export interface PermissionPreset {
  id: string;
  name: string;
  description: string;
  pages: string[];
}

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: "full-admin",
    name: "Full Administrator",
    description: "Access to all admin pages excluding Owner-exclusive root settings.",
    pages: DEFAULT_ADMIN_PAGES
  },
  {
    id: "customer-care",
    name: "Customer Care Specialist",
    description: "Dedicated to reseller support, virtual chat, order handling, and storefronts.",
    pages: [
      "/admin",
      "/admin/customer-care/staffs",
      "/admin/customer-care/reseller-profile",
      "/admin/customer-care/virtual-services",
      "/admin/customer-care/order-services",
      "/admin/resellers",
      "/admin/ars/orders",
      "/admin/customer-service",
      "/admin/sla/reseller-2-admin"
    ]
  },
  {
    id: "finance-orders",
    name: "Finance & Orders Officer",
    description: "Focuses on deposits, withdrawals, balances, financial statements, and orders.",
    pages: [
      "/admin",
      "/admin/ars/payment-info",
      "/admin/ars/deposit",
      "/admin/ars/withdrawal",
      "/admin/ars/orders",
      "/admin/ach/financial",
      "/admin/orders"
    ]
  },
  {
    id: "catalog-inventory",
    name: "Catalog & Products Manager",
    description: "Focuses on product listings, inventory, and retail store selections.",
    pages: [
      "/admin",
      "/admin/catalog",
      "/admin/resellers",
      "/admin/orders",
      "/admin/ach/customers"
    ]
  },
  {
    id: "audit-monitoring",
    name: "System Auditor & Monitoring",
    description: "Access to session logs, system metrics, database backup status, and alerts.",
    pages: [
      "/admin",
      "/admin/system",
      "/admin/admin-sessions",
      "/admin/alerts",
      "/admin/system-logs"
    ]
  }
];

/**
 * Normalizes a URL path for permission comparison (removes trailing slashes and query strings)
 */
export function normalizeAdminPath(path: string): string {
  if (!path) return "/admin";
  let clean = path.split("?")[0].replace(/\/$/, "");
  if (!clean.startsWith("/admin")) {
    clean = "/admin" + (clean.startsWith("/") ? clean : "/" + clean);
  }
  return clean || "/admin";
}

/**
 * Evaluates whether a given path is allowed for a user based on their role and permissions array.
 */
export function isPageAllowed(
  path: string,
  role?: SLARole,
  userPermissions?: string[] | null
): boolean {
  if (!role) return false;
  if (role === "Owner") return true;

  const targetPath = normalizeAdminPath(path);

  // If page is strictly owner-only, reject regardless of custom permissions
  if (targetPath === "/admin/sla/ownership" || targetPath === "/admin/sla/administrator") {
    return false;
  }

  // If custom permissions array is set and not empty, check if path exists in permissions
  if (Array.isArray(userPermissions) && userPermissions.length > 0) {
    const normalizedPerms = userPermissions.map(normalizeAdminPath);
    // Exact match or sub-route match
    return normalizedPerms.some(p => p === targetPath || targetPath.startsWith(p + "/"));
  }

  // Otherwise, fallback to role default permissions
  if (role === "Admin") {
    const defaultAdmins = DEFAULT_ADMIN_PAGES.map(normalizeAdminPath);
    return defaultAdmins.some(p => p === targetPath || targetPath.startsWith(p + "/"));
  }

  if (role === "Staff") {
    const defaultStaffs = DEFAULT_STAFF_PAGES.map(normalizeAdminPath);
    return defaultStaffs.some(p => p === targetPath || targetPath.startsWith(p + "/"));
  }

  return false;
}
