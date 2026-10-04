import { supabase } from "@/lib/supabase";

export interface AdminActiveSession {
  session_id: string;
  user_id: string;
  email: string | null;
  role: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
}

export interface AdminLoginEvent {
  id: string;
  user_id: string;
  email: string | null;
  role: string | null;
  action: string;
  ip: string | null;
  created_at: string;
}

// All three calls are refused by the database unless the caller is the Owner.
export async function fetchAdminSessions(): Promise<AdminActiveSession[]> {
  const { data, error } = await supabase.rpc("list_admin_sessions");
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminActiveSession[];
}

export async function fetchAdminLoginHistory(limit = 200): Promise<AdminLoginEvent[]> {
  const { data, error } = await supabase.rpc("list_admin_login_history", { _limit: limit });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminLoginEvent[];
}

export async function revokeAdminSession(sessionId: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_admin_session", { _session_id: sessionId });
  if (error) throw new Error(error.message);
}
