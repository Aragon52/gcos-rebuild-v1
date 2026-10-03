import { createClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase";

const getEnv = (key: string) => {
  let val = "";
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      val = import.meta.env[key] || "";
    }
  } catch (e) {
    // ignore
  }
  if (!val && typeof process !== "undefined" && process.env) {
    val = process.env[key] || "";
  }
  return val;
};

const url = (getEnv("VITE_SUPABASE_URL") || getEnv("SUPABASE_URL")).trim();
const serviceKey = (
  getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  getEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("SUPABASE_PUBLISHABLE_KEY")
).trim();

// Diagnostic client bypasses RLS if service role key is present
const supabase = (url && serviceKey)
  ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : defaultSupabase;

export interface DiagnosticRecord {
  id: string;
  table: "orders" | "deposit_requests" | "withdrawal_requests" | "reseller_profiles";
  createdAt: string;
  title: string;
  subtitle: string;
  status: string;
  amount?: number;
  raw: Record<string, any>;
}

export interface UnboundResellerDetail {
  id: string;
  shopName: string;
  email: string;
  referralCode: string;
  referralId: string;
  currentAdminId: string | null;
  assignedAdminId: string;
  assignedStaffId: string | null;
}

export interface DiagnosticResult {
  timestamp: string;
  dateRange: { start: string; end: string };
  counts: {
    totalOrders: number;
    ordersInRange: number;
    totalDeposits: number;
    depositsInRange: number;
    totalWithdrawals: number;
    withdrawalsInRange: number;
    totalResellers: number;
    unboundResellersCount: number;
    repairedCount: number;
  };
  recordsInRange: DiagnosticRecord[];
  unboundResellers: UnboundResellerDetail[];
  healthStatus: {
    ordersOk: boolean;
    depositsOk: boolean;
    withdrawalsOk: boolean;
    resellersOk: boolean;
    overallStatus: "HEALTHY" | "WARNING" | "NEEDS_REPAIR";
    messages: string[];
  };
}

/**
 * Default date filter window: May 21, 2026 to September 2, 2026
 */
export const DEFAULT_DIAGNOSTIC_START = "2026-05-21";
export const DEFAULT_DIAGNOSTIC_END = "2026-09-02";

/**
 * Diagnostic utility function to audit Supabase retrieval,
 * date range coverage (May-21 to Sep-2), and referral bindings.
 */
export async function runSupabaseDiagnostic(options?: {
  startDate?: string;
  endDate?: string;
  autoRepairBindings?: boolean;
}): Promise<DiagnosticResult> {
  const startStr = options?.startDate || DEFAULT_DIAGNOSTIC_START;
  const endStr = options?.endDate || DEFAULT_DIAGNOSTIC_END;
  const startTime = new Date(`${startStr}T00:00:00.000Z`).getTime();
  const endTime = new Date(`${endStr}T23:59:59.999Z`).getTime();

  const messages: string[] = [];

  // 1. Fetch Staff & Admins for Referral Matching
  const [{ data: staffList }, { data: adminList }] = await Promise.all([
    supabase.from("sla_staff").select("*"),
    supabase.from("sla_admins").select("*"),
  ]);

  const defaultAdminId = "263f859e-2088-444b-b4aa-93a009c9c844"; // GA01 Primary Admin

  // 2. Audit Reseller Profiles and Referral Bindings
  const { data: rawResellers = [] } = await supabase.from("reseller_profiles").select("*").limit(3000);
  const resellers = rawResellers || [];
  const unboundList: UnboundResellerDetail[] = [];
  let repairedCount = 0;

  for (const r of resellers) {
    let targetAdminId = r.member_of_admin_id;
    let targetStaffId = r.referred_by_staff_id;
    const refCode = (r.referral_code || r.referral_id || "").trim();

    // Match Staff referral code
    if (refCode && staffList) {
      const matchedStaff = staffList.find(
        (s: any) =>
          (s.referral_id && s.referral_id.toUpperCase() === refCode.toUpperCase()) ||
          (s.staff_id && s.staff_id.toUpperCase() === refCode.toUpperCase()) ||
          (s.username && s.username.toUpperCase() === refCode.toUpperCase())
      );
      if (matchedStaff) {
        targetStaffId = matchedStaff.id;
        if (matchedStaff.created_by_admin_id) {
          targetAdminId = matchedStaff.created_by_admin_id;
        }
      }
    }

    // Match Admin referral code
    if (!targetAdminId && refCode && adminList) {
      const matchedAdmin = adminList.find(
        (a: any) =>
          (a.account_id && a.account_id.toUpperCase() === refCode.toUpperCase()) ||
          a.id === refCode
      );
      if (matchedAdmin) {
        targetAdminId = matchedAdmin.id;
      }
    }

    // Default fallback
    if (!targetAdminId) {
      targetAdminId = defaultAdminId;
    }

    const isUnbound = !r.member_of_admin_id || r.member_of_admin_id !== targetAdminId;

    if (isUnbound) {
      unboundList.push({
        id: r.id,
        shopName: r.shop_name || "Reseller Store",
        email: r.email || "",
        referralCode: r.referral_code || "",
        referralId: r.referral_id || "",
        currentAdminId: r.member_of_admin_id || null,
        assignedAdminId: targetAdminId,
        assignedStaffId: targetStaffId || null,
      });

      if (options?.autoRepairBindings) {
        const { error: updateErr } = await supabase
          .from("reseller_profiles")
          .update({
            member_of_admin_id: targetAdminId,
            referred_by_staff_id: targetStaffId || r.referred_by_staff_id,
          })
          .eq("id", r.id);

        if (!updateErr) {
          repairedCount++;
        }
      }
    }
  }

  // 3. Fetch Orders
  const { data: rawOrders = [] } = await supabase.from("orders").select("*").limit(5000);
  const orders = rawOrders || [];
  const ordersInRange = orders.filter((o: any) => {
    const dt = new Date(o.created_at || o.createdAt || 0).getTime();
    return dt >= startTime && dt <= endTime;
  });

  // 4. Fetch Deposit Requests
  const { data: rawDeposits = [] } = await supabase.from("deposit_requests").select("*").limit(5000);
  const deposits = rawDeposits || [];
  const depositsInRange = deposits.filter((d: any) => {
    const dt = new Date(d.createdAt || d.created_at || d.requestedAt || 0).getTime();
    return dt >= startTime && dt <= endTime;
  });

  // 5. Fetch Withdrawal Requests
  const { data: rawWithdrawals = [] } = await supabase.from("withdrawal_requests").select("*").limit(5000);
  const withdrawals = rawWithdrawals || [];
  const withdrawalsInRange = withdrawals.filter((w: any) => {
    const dt = new Date(w.createdAt || w.created_at || w.requestedAt || 0).getTime();
    return dt >= startTime && dt <= endTime;
  });

  // 6. Build Diagnostic Records View
  const recordsInRange: DiagnosticRecord[] = [
    ...ordersInRange.map((o: any) => ({
      id: String(o.id || o.order_number || ""),
      table: "orders" as const,
      createdAt: o.created_at || o.createdAt || new Date().toISOString(),
      title: `Order #${o.order_number || o.id}`,
      subtitle: `${o.reseller_name || "Reseller"} - ${o.customer_name || "Customer"}`,
      status: String(o.status || "Pending"),
      amount: Number(o.total_amount || o.total_cost || 0),
      raw: o,
    })),
    ...depositsInRange.map((d: any) => ({
      id: String(d.id || ""),
      table: "deposit_requests" as const,
      createdAt: d.createdAt || d.created_at || new Date().toISOString(),
      title: `Deposit Request`,
      subtitle: d.remark || `Deposit for ${d.resellerDocId}`,
      status: String(d.status || "Pending"),
      amount: Number(d.amount || 0),
      raw: d,
    })),
    ...withdrawalsInRange.map((w: any) => ({
      id: String(w.id || ""),
      table: "withdrawal_requests" as const,
      createdAt: w.createdAt || w.created_at || new Date().toISOString(),
      title: `Withdrawal Request`,
      subtitle: w.remark || `Withdrawal for ${w.resellerDocId}`,
      status: String(w.status || "Pending"),
      amount: Number(w.amount || 0),
      raw: w,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Health Assessment
  const ordersOk = ordersInRange.length > 0;
  const depositsOk = depositsInRange.length > 0;
  const withdrawalsOk = withdrawalsInRange.length > 0;
  const resellersOk = unboundList.length === 0 || repairedCount === unboundList.length;

  if (!ordersOk) messages.push(`No orders found between ${startStr} and ${endStr}.`);
  if (!depositsOk) messages.push(`No deposit requests found between ${startStr} and ${endStr}.`);
  if (!withdrawalsOk) messages.push(`No withdrawal requests found between ${startStr} and ${endStr}.`);
  if (unboundList.length > 0 && repairedCount < unboundList.length) {
    messages.push(`${unboundList.length - repairedCount} reseller accounts are unbound from admin referral records.`);
  }

  let overallStatus: "HEALTHY" | "WARNING" | "NEEDS_REPAIR" = "HEALTHY";
  if (unboundList.length > repairedCount) {
    overallStatus = "NEEDS_REPAIR";
  } else if (!ordersOk || !depositsOk || !withdrawalsOk) {
    overallStatus = "WARNING";
  }

  return {
    timestamp: new Date().toISOString(),
    dateRange: { start: startStr, end: endStr },
    counts: {
      totalOrders: orders.length,
      ordersInRange: ordersInRange.length,
      totalDeposits: deposits.length,
      depositsInRange: depositsInRange.length,
      totalWithdrawals: withdrawals.length,
      withdrawalsInRange: withdrawalsInRange.length,
      totalResellers: resellers.length,
      unboundResellersCount: unboundList.length,
      repairedCount,
    },
    recordsInRange,
    unboundResellers: unboundList,
    healthStatus: {
      ordersOk,
      depositsOk,
      withdrawalsOk,
      resellersOk,
      overallStatus,
      messages,
    },
  };
}

/**
 * Execute Referral Binding Repair across all resellers
 */
export async function repairResellerBindings(): Promise<{ success: boolean; repaired: number; total: number }> {
  const [{ data: staffList }, { data: adminList }, { data: resellers = [] }] = await Promise.all([
    supabase.from("sla_staff").select("*"),
    supabase.from("sla_admins").select("*"),
    supabase.from("reseller_profiles").select("*").limit(3000),
  ]);

  if (!resellers) return { success: false, repaired: 0, total: 0 };

  const defaultAdminId = "263f859e-2088-444b-b4aa-93a009c9c844"; // GA01
  let repaired = 0;

  for (const r of resellers) {
    let targetAdminId = r.member_of_admin_id;
    let targetStaffId = r.referred_by_staff_id;
    const refCode = (r.referral_code || r.referral_id || "").trim();

    if (refCode && staffList) {
      const matchedStaff = staffList.find(
        (s: any) =>
          (s.referral_id && s.referral_id.toUpperCase() === refCode.toUpperCase()) ||
          (s.staff_id && s.staff_id.toUpperCase() === refCode.toUpperCase()) ||
          (s.username && s.username.toUpperCase() === refCode.toUpperCase())
      );
      if (matchedStaff) {
        targetStaffId = matchedStaff.id;
        if (matchedStaff.created_by_admin_id) {
          targetAdminId = matchedStaff.created_by_admin_id;
        }
      }
    }

    if (!targetAdminId && refCode && adminList) {
      const matchedAdmin = adminList.find(
        (a: any) =>
          (a.account_id && a.account_id.toUpperCase() === refCode.toUpperCase()) ||
          a.id === refCode
      );
      if (matchedAdmin) {
        targetAdminId = matchedAdmin.id;
      }
    }

    if (!targetAdminId) {
      targetAdminId = defaultAdminId;
    }

    if (r.member_of_admin_id !== targetAdminId || (targetStaffId && r.referred_by_staff_id !== targetStaffId)) {
      const { error } = await supabase
        .from("reseller_profiles")
        .update({
          member_of_admin_id: targetAdminId,
          referred_by_staff_id: targetStaffId || r.referred_by_staff_id,
        })
        .eq("id", r.id);

      if (!error) repaired++;
    }
  }

  return { success: true, repaired, total: resellers.length };
}

/**
 * Edit a specific record in Supabase
 */
export async function updateDiagnosticRecord(
  table: "orders" | "deposit_requests" | "withdrawal_requests" | "reseller_profiles",
  id: string,
  updates: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from(table).update(updates).eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update record" };
  }
}

/**
 * Delete a specific record in Supabase
 */
export async function deleteDiagnosticRecord(
  table: "orders" | "deposit_requests" | "withdrawal_requests" | "reseller_profiles",
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete record" };
  }
}
