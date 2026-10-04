import { createClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase";
import { getClientPublicIp } from "@/hooks/use-admin-logger";
import type { AdminSession } from "@/lib/admin-auth-context-hooks";

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

const supabase = (url && serviceKey)
  ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : defaultSupabase;

export interface AdminActiveSessionRecord {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  role: string;
  accountId: string | null;
  ipAddress: string;
  deviceLabel: string;
  userAgent: string;
  loginAt: string;
  lastHeartbeat: string;
  status: "ACTIVE" | "IDLE" | "EXPIRED" | "TERMINATED";
}

export interface AdminSessionSummary {
  adminEmail: string;
  adminName: string;
  accountId: string;
  role: string;
  activeSessionCount: number;
  totalSessionCount: number;
  latestIp: string;
  allIps: string[];
  status: "ONLINE" | "IDLE" | "OFFLINE";
  lastActive: string;
  sessions: AdminActiveSessionRecord[];
}

export interface AdminSessionAuditEntry {
  id: string;
  adminEmail: string;
  adminId: string;
  action: string;
  ipAddress: string;
  target: string;
  userAgent?: string;
  createdAt: string;
  details?: Record<string, any>;
}

const REGISTRY_KEY = "admin_active_sessions_registry";
const STALE_HEARTBEAT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate human-readable device label
 */
export function parseDeviceLabel(ua?: string): string {
  const userAgent = ua || (typeof navigator !== "undefined" ? navigator.userAgent : "Unknown");
  let browser = "Browser";
  if (userAgent.includes("Firefox/")) browser = "Firefox";
  else if (userAgent.includes("Edg/")) browser = "Edge";
  else if (userAgent.includes("Chrome/")) browser = "Chrome";
  else if (userAgent.includes("Safari/")) browser = "Safari";

  let os = "Desktop";
  if (/Android/i.test(userAgent)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";
  else if (/Mac OS X/i.test(userAgent)) os = "macOS";
  else if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Linux/i.test(userAgent)) os = "Linux";

  return `${browser} on ${os}`;
}

/**
 * Retrieve raw registry from system_settings
 */
async function getRawRegistry(): Promise<AdminActiveSessionRecord[]> {
  try {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", REGISTRY_KEY)
      .single();

    if (!data?.value) return [];
    const parsed = JSON.parse(data.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[ADMIN_SESSION_TRACKER] Failed to read registry:", e);
    return [];
  }
}

/**
 * Save registry to system_settings
 */
async function saveRawRegistry(records: AdminActiveSessionRecord[]): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(records);
    const { data: existing } = await supabase
      .from("system_settings")
      .select("id")
      .eq("key", REGISTRY_KEY);

    if (!existing || existing.length === 0) {
      const { error } = await supabase.from("system_settings").insert({
        key: REGISTRY_KEY,
        value: jsonStr,
        category: "security",
        label: "Admin Active Sessions Registry",
      });
      return !error;
    } else {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: jsonStr })
        .eq("key", REGISTRY_KEY);
      return !error;
    }
  } catch (e) {
    console.error("[ADMIN_SESSION_TRACKER] Failed to save registry:", e);
    return false;
  }
}

/**
 * Register or refresh an admin session on login / page load
 */
export async function trackAdminSessionLogin(session: AdminSession): Promise<string> {
  try {
    const { ip } = await getClientPublicIp();
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "Unknown";
    const deviceLabel = parseDeviceLabel(userAgent);
    const now = new Date().toISOString();

    let sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gcos_admin_session_tracker_id") : null;
    if (!sessionId) {
      sessionId = "asess_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("gcos_admin_session_tracker_id", sessionId);
      }
    }

    const registry = await getRawRegistry();
    const filtered = registry.filter((r) => {
      // Prune dead sessions older than 24 hours
      const diff = Date.now() - new Date(r.lastHeartbeat || r.loginAt).getTime();
      return diff < 24 * 60 * 60 * 1000;
    });

    const existingIdx = filtered.findIndex((r) => r.id === sessionId);
    const sessionRecord: AdminActiveSessionRecord = {
      id: sessionId,
      adminId: session.uid || session.email,
      adminEmail: session.email.toLowerCase().trim(),
      adminName: session.name || "Admin",
      role: session.role || "Admin",
      accountId: session.accountId || "GA-SYS",
      ipAddress: ip || "127.0.0.1",
      deviceLabel,
      userAgent,
      loginAt: existingIdx >= 0 ? filtered[existingIdx].loginAt : now,
      lastHeartbeat: now,
      status: "ACTIVE",
    };

    if (existingIdx >= 0) {
      filtered[existingIdx] = sessionRecord;
    } else {
      filtered.push(sessionRecord);
    }

    await saveRawRegistry(filtered);

    // Also log in admin_audit_logs for audit persistence
    await supabase.from("admin_audit_logs").insert({
      admin_id: session.uid || session.email,
      admin_email: session.email.toLowerCase().trim(),
      action: "LOGIN",
      target: "Admin Portal",
      ip_address: ip,
      details: {
        sessionId,
        deviceLabel,
        userAgent,
        role: session.role,
        accountId: session.accountId,
      },
      created_at: now,
    });

    return sessionId;
  } catch (e) {
    console.error("[ADMIN_SESSION_TRACKER] trackAdminSessionLogin error:", e);
    return "";
  }
}

/**
 * Send heartbeat for active admin session
 */
export async function trackAdminSessionHeartbeat(session: AdminSession): Promise<void> {
  try {
    const sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gcos_admin_session_tracker_id") : null;
    if (!sessionId) {
      await trackAdminSessionLogin(session);
      return;
    }

    const registry = await getRawRegistry();
    const idx = registry.findIndex((r) => r.id === sessionId);
    const now = new Date().toISOString();

    if (idx >= 0) {
      registry[idx].lastHeartbeat = now;
      registry[idx].status = "ACTIVE";
      await saveRawRegistry(registry);
    } else {
      await trackAdminSessionLogin(session);
    }
  } catch (e) {
    console.error("[ADMIN_SESSION_TRACKER] Heartbeat error:", e);
  }
}

/**
 * Mark session as logged out / terminate
 */
export async function trackAdminSessionLogout(session: AdminSession): Promise<void> {
  try {
    const sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gcos_admin_session_tracker_id") : null;
    if (sessionId) {
      const registry = await getRawRegistry();
      const filtered = registry.filter((r) => r.id !== sessionId);
      await saveRawRegistry(filtered);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("gcos_admin_session_tracker_id");
      }
    }

    const { ip } = await getClientPublicIp();
    await supabase.from("admin_audit_logs").insert({
      admin_id: session.uid || session.email,
      admin_email: session.email.toLowerCase().trim(),
      action: "LOGOUT",
      target: "Admin Portal",
      ip_address: ip,
      details: {
        sessionId,
        role: session.role,
      },
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[ADMIN_SESSION_TRACKER] Logout error:", e);
  }
}

/**
 * Remotely terminate an admin session by ID
 */
export async function terminateAdminSessionById(targetSessionId: string): Promise<boolean> {
  try {
    const registry = await getRawRegistry();
    const updated = registry.filter((r) => r.id !== targetSessionId);
    return await saveRawRegistry(updated);
  } catch (e) {
    console.error("[ADMIN_SESSION_TRACKER] Terminate error:", e);
    return false;
  }
}

/**
 * Fetch consolidated admin sessions, per-admin active counts, and IP history logs
 */
export async function fetchAllAdminSessionsData(): Promise<{
  summaries: AdminSessionSummary[];
  activeSessions: AdminActiveSessionRecord[];
  auditLogs: AdminSessionAuditEntry[];
  totalActiveCount: number;
  totalUniqueIps: number;
  totalAdminsOnline: number;
}> {
  try {
    // 1. Fetch raw active sessions registry
    const registry = await getRawRegistry();
    const now = Date.now();

    // Mark status based on last heartbeat
    const activeSessions: AdminActiveSessionRecord[] = registry.map((r) => {
      const diff = now - new Date(r.lastHeartbeat || r.loginAt).getTime();
      let status: "ACTIVE" | "IDLE" | "EXPIRED" | "TERMINATED" = "ACTIVE";
      if (diff > 24 * 60 * 60 * 1000) status = "EXPIRED";
      else if (diff > STALE_HEARTBEAT_MS) status = "IDLE";
      return { ...r, status };
    }).filter(r => r.status !== "EXPIRED");

    // 2. Fetch admin accounts from sla_admins, sla_staff, and users
    const [
      { data: slaAdmins = [] },
      { data: slaStaff = [] },
      { data: rawAuditLogs = [] },
    ] = await Promise.all([
      supabase.from("sla_admins").select("*"),
      supabase.from("sla_staff").select("*"),
      supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
    ]);

    // 3. Process Audit Logs
    const auditLogs: AdminSessionAuditEntry[] = (rawAuditLogs || []).map((log: any) => ({
      id: log.id,
      adminEmail: (log.admin_email || "").toLowerCase().trim(),
      adminId: log.admin_id || "",
      action: log.action || "ACTIVITY",
      ipAddress: log.ip_address || "127.0.0.1",
      target: log.target || "",
      userAgent: log.details?.userAgent || "",
      createdAt: log.created_at || new Date().toISOString(),
      details: log.details || {},
    }));

    // 4. Map known admins into summaries
    const adminMap = new Map<string, AdminSessionSummary>();

    // Seed Owner
    adminMap.set("heathercarpe34@gmail.com", {
      adminEmail: "heathercarpe34@gmail.com",
      adminName: "System Owner",
      accountId: "OWNER-ROOT",
      role: "Owner",
      activeSessionCount: 0,
      totalSessionCount: 0,
      latestIp: "127.0.0.1",
      allIps: [],
      status: "OFFLINE",
      lastActive: new Date().toISOString(),
      sessions: [],
    });

    // Seed SLA Admins
    (slaAdmins || []).forEach((a: any) => {
      const email = (a.email || "").toLowerCase().trim();
      if (!email) return;
      adminMap.set(email, {
        adminEmail: email,
        adminName: a.name || "Administrator",
        accountId: a.account_id || "GA--",
        role: "Admin",
        activeSessionCount: 0,
        totalSessionCount: 0,
        latestIp: "127.0.0.1",
        allIps: [],
        status: "OFFLINE",
        lastActive: a.created_at || new Date().toISOString(),
        sessions: [],
      });
    });

    // Seed SLA Staff
    (slaStaff || []).forEach((s: any) => {
      const email = (s.email || "").toLowerCase().trim();
      if (!email) return;
      adminMap.set(email, {
        adminEmail: email,
        adminName: s.name || "Staff",
        accountId: s.staff_id || "GA--S--",
        role: "Staff",
        activeSessionCount: 0,
        totalSessionCount: 0,
        latestIp: "127.0.0.1",
        allIps: [],
        status: "OFFLINE",
        lastActive: s.created_at || new Date().toISOString(),
        sessions: [],
      });
    });

    // Merge active sessions into adminMap
    activeSessions.forEach((sess) => {
      const email = sess.adminEmail.toLowerCase().trim();
      let summary = adminMap.get(email);
      if (!summary) {
        summary = {
          adminEmail: email,
          adminName: sess.adminName || "Admin",
          accountId: sess.accountId || "GA-SYS",
          role: sess.role || "Admin",
          activeSessionCount: 0,
          totalSessionCount: 0,
          latestIp: sess.ipAddress,
          allIps: [],
          status: "OFFLINE",
          lastActive: sess.lastHeartbeat,
          sessions: [],
        };
        adminMap.set(email, summary);
      }

      summary.sessions.push(sess);
      if (sess.status === "ACTIVE") {
        summary.activeSessionCount++;
        summary.status = "ONLINE";
      } else if (sess.status === "IDLE" && summary.status !== "ONLINE") {
        summary.status = "IDLE";
      }

      if (sess.ipAddress && !summary.allIps.includes(sess.ipAddress)) {
        summary.allIps.push(sess.ipAddress);
      }
      summary.latestIp = sess.ipAddress || summary.latestIp;
      summary.lastActive = sess.lastHeartbeat || summary.lastActive;
    });

    // Enrich with audit logs IPs & recent timestamps
    const uniqueIpsSet = new Set<string>();
    activeSessions.forEach((s) => s.ipAddress && uniqueIpsSet.add(s.ipAddress));

    auditLogs.forEach((log) => {
      if (log.ipAddress && log.ipAddress !== "null") {
        uniqueIpsSet.add(log.ipAddress);
      }
      const email = log.adminEmail;
      const summary = adminMap.get(email);
      if (summary) {
        summary.totalSessionCount++;
        if (log.ipAddress && !summary.allIps.includes(log.ipAddress)) {
          summary.allIps.push(log.ipAddress);
        }
        if (!summary.latestIp || summary.latestIp === "127.0.0.1") {
          summary.latestIp = log.ipAddress;
        }
        if (new Date(log.createdAt).getTime() > new Date(summary.lastActive).getTime()) {
          summary.lastActive = log.createdAt;
        }
      }
    });

    const summaries = Array.from(adminMap.values()).sort((a, b) => {
      // Online first, then by active count, then alphabetically
      if (a.status === "ONLINE" && b.status !== "ONLINE") return -1;
      if (b.status === "ONLINE" && a.status !== "ONLINE") return 1;
      return b.activeSessionCount - a.activeSessionCount || a.adminName.localeCompare(b.adminName);
    });

    const totalActiveCount = activeSessions.filter((s) => s.status === "ACTIVE").length;
    const totalAdminsOnline = summaries.filter((s) => s.status === "ONLINE").length;

    return {
      summaries,
      activeSessions,
      auditLogs,
      totalActiveCount,
      totalUniqueIps: uniqueIpsSet.size,
      totalAdminsOnline,
    };
  } catch (e) {
    console.error("[ADMIN_SESSION_TRACKER] fetchAllAdminSessionsData error:", e);
    return {
      summaries: [],
      activeSessions: [],
      auditLogs: [],
      totalActiveCount: 0,
      totalUniqueIps: 0,
      totalAdminsOnline: 0,
    };
  }
}
