import { supabase } from "@/lib/supabase";

export interface OwnerActiveSession {
  sessionId: string;
  deviceId: string;
  deviceLabel: string;
  loginAt: string;
  lastHeartbeat: string;
  ip?: string;
}

const SETTING_KEY = "ownership_active_sessions";
const MAX_SIMULTANEOUS_SESSIONS = 2;
// 10 minutes timeout for inactive sessions
const SESSION_STALE_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Generate a friendly device label based on user agent
 */
function getDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Unknown Device";
  const ua = navigator.userAgent;
  let browser = "Browser";
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  let os = "Desktop";
  if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Linux/i.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}

/**
 * Get or create a persistent device ID for this browser
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server-device";
  let deviceId = localStorage.getItem("gcos_owner_device_id");
  if (!deviceId) {
    deviceId = "dev_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    localStorage.setItem("gcos_owner_device_id", deviceId);
  }
  return deviceId;
}

/**
 * Retrieve current active owner sessions from Supabase system_settings
 */
export async function getActiveOwnerSessions(): Promise<OwnerActiveSession[]> {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .single();

    if (error || !data?.value) return [];
    const parsed = JSON.parse(data.value);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    // Filter out stale sessions
    return parsed.filter((s: OwnerActiveSession) => {
      const hb = new Date(s.lastHeartbeat || s.loginAt || 0).getTime();
      return now - hb < SESSION_STALE_TIMEOUT_MS;
    });
  } catch (e) {
    console.error("[OWNER_SESSION] Failed to get active sessions:", e);
    return [];
  }
}

/**
 * Persist active owner sessions to Supabase system_settings
 */
async function saveActiveOwnerSessions(sessions: OwnerActiveSession[]): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(sessions);
    const { data: existing } = await supabase
      .from("system_settings")
      .select("id")
      .eq("key", SETTING_KEY);

    if (!existing || existing.length === 0) {
      const { error } = await supabase.from("system_settings").insert({
        key: SETTING_KEY,
        value: jsonStr,
        category: "security",
        label: "Active Ownership Login Sessions",
      });
      return !error;
    } else {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: jsonStr })
        .eq("key", SETTING_KEY);
      return !error;
    }
  } catch (e) {
    console.error("[OWNER_SESSION] Failed to save active sessions:", e);
    return false;
  }
}

/**
 * Verify and register a login attempt for the Ownership account.
 * Enforces maximum 2 simultaneous device sessions.
 */
export async function registerOwnerLoginSession(): Promise<{
  success: boolean;
  sessionId?: string;
  message?: string;
  activeSessions: OwnerActiveSession[];
}> {
  try {
    const deviceId = getOrCreateDeviceId();
    const deviceLabel = getDeviceLabel();
    const nowStr = new Date().toISOString();

    const currentSessions = await getActiveOwnerSessions();

    // Check if this device already has an active session
    const existingIndex = currentSessions.findIndex((s) => s.deviceId === deviceId);

    if (existingIndex >= 0) {
      // Refresh current session on the same device
      const refreshedSession: OwnerActiveSession = {
        ...currentSessions[existingIndex],
        lastHeartbeat: nowStr,
        deviceLabel,
      };
      currentSessions[existingIndex] = refreshedSession;
      await saveActiveOwnerSessions(currentSessions);
      sessionStorage.setItem("gcos_owner_session_id", refreshedSession.sessionId);
      return {
        success: true,
        sessionId: refreshedSession.sessionId,
        activeSessions: currentSessions,
      };
    }

    // New device attempting to log in - check if limit of 2 is reached
    if (currentSessions.length >= MAX_SIMULTANEOUS_SESSIONS) {
      console.warn(`[OWNER_SESSION] Login blocked: ${currentSessions.length}/${MAX_SIMULTANEOUS_SESSIONS} active sessions already in use.`);
      return {
        success: false,
        message: `Ownership login blocked: Maximum of ${MAX_SIMULTANEOUS_SESSIONS} simultaneous device sessions allowed. There are already ${currentSessions.length} active sessions on other devices. Please log out from another device to sign in here.`,
        activeSessions: currentSessions,
      };
    }

    // Allow new session
    const newSessionId = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    const newSession: OwnerActiveSession = {
      sessionId: newSessionId,
      deviceId,
      deviceLabel,
      loginAt: nowStr,
      lastHeartbeat: nowStr,
    };

    const updatedSessions = [...currentSessions, newSession];
    await saveActiveOwnerSessions(updatedSessions);
    sessionStorage.setItem("gcos_owner_session_id", newSessionId);

    return {
      success: true,
      sessionId: newSessionId,
      activeSessions: updatedSessions,
    };
  } catch (e) {
    console.error("[OWNER_SESSION] Register session error:", e);
    return {
      success: false,
      message: "Session verification error. Please try again.",
      activeSessions: [],
    };
  }
}

/**
 * Send heartbeat to keep the current ownership session active
 */
export async function sendOwnerHeartbeat(): Promise<boolean> {
  try {
    const sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gcos_owner_session_id") : null;
    const deviceId = getOrCreateDeviceId();
    if (!sessionId && !deviceId) return false;

    const currentSessions = await getActiveOwnerSessions();
    const idx = currentSessions.findIndex((s) => s.sessionId === sessionId || s.deviceId === deviceId);

    if (idx === -1) {
      // Session was revoked or expired
      return false;
    }

    currentSessions[idx].lastHeartbeat = new Date().toISOString();
    await saveActiveOwnerSessions(currentSessions);
    return true;
  } catch (e) {
    console.error("[OWNER_SESSION] Heartbeat error:", e);
    return false;
  }
}

/**
 * Release / terminate the current device's ownership session
 */
export async function releaseOwnerSession(): Promise<void> {
  try {
    const sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gcos_owner_session_id") : null;
    const deviceId = getOrCreateDeviceId();

    const currentSessions = await getActiveOwnerSessions();
    const remaining = currentSessions.filter(
      (s) => s.sessionId !== sessionId && s.deviceId !== deviceId
    );

    await saveActiveOwnerSessions(remaining);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("gcos_owner_session_id");
    }
  } catch (e) {
    console.error("[OWNER_SESSION] Release session error:", e);
  }
}

/**
 * Remotely revoke a specific session (used from SLAOwnershipPage)
 */
export async function revokeOwnerSessionById(targetSessionId: string): Promise<boolean> {
  try {
    const currentSessions = await getActiveOwnerSessions();
    const remaining = currentSessions.filter((s) => s.sessionId !== targetSessionId);
    return await saveActiveOwnerSessions(remaining);
  } catch (e) {
    console.error("[OWNER_SESSION] Revoke session error:", e);
    return false;
  }
}
