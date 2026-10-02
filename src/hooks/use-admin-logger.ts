import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/admin-auth-context-hooks';

export type AdminActionType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW_PAGE'
  | 'BUTTON_CLICK'
  | 'ERROR'
  | 'DATA_UPDATE'
  | 'DATA_DELETE'
  | 'DATA_CREATE';

// Cached client IP to avoid repeated external requests
let cachedIp: string | null = null;
let cachedNetworkInfo: Record<string, unknown> | null = null;

export async function getClientPublicIp(): Promise<{ ip: string; network?: Record<string, unknown> }> {
  if (cachedIp) {
    return { ip: cachedIp, network: cachedNetworkInfo || undefined };
  }

  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        cachedIp = data.ip;
        return { ip: data.ip };
      }
    }
  } catch {
    // Fallback secondary provider
    try {
      const res2 = await fetch('https://api.my-ip.io/v2/ip.json', { signal: AbortSignal.timeout(3000) });
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.ip) {
          cachedIp = data2.ip;
          return { ip: data2.ip };
        }
      }
    } catch {
      // ignore
    }
  }

  return { ip: '127.0.0.1' };
}

export function useAdminLogger() {
  const { session } = useAdminAuth();

  const logActivity = useCallback(async (
    action: AdminActionType, 
    target: string, 
    details?: Record<string, unknown>
  ) => {
    try {
      const adminId = session?.uid || 'anonymous';
      const adminEmail = session?.email || (details?.email as string) || 'unknown';
      
      const { ip } = await getClientPublicIp();
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

      const enrichedDetails = {
        ...(details || {}),
        userAgent,
        loggedAt: new Date().toISOString(),
      };

      const { error } = await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        admin_email: adminEmail,
        action,
        target,
        ip_address: ip,
        details: enrichedDetails,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.warn('Failed to log admin activity to Supabase:', error.message);
      }
    } catch (e) {
      console.error('Error logging admin activity:', e);
    }
  }, [session]);

  return { logActivity };
}
