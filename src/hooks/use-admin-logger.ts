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

export function useAdminLogger() {
  const { session } = useAdminAuth();

  const logActivity = useCallback(async (
    action: AdminActionType, 
    target: string, 
    details?: Record<string, unknown>
  ) => {
    try {
      const adminId = session?.uid || 'anonymous';
      const adminEmail = session?.email || 'unknown';
      
      const { error } = await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        admin_email: adminEmail,
        action,
        target,
        details: details || {},
        created_at: new Date().toISOString()
      });

      if (error) {
        console.warn('Admin audit log not saved:', error.message || error);
      }
    } catch (e) {
      console.warn('Error in admin audit logging:', e);
    }
  }, [session]);

  return { logActivity };
}
