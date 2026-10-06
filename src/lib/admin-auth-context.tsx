import { useState, useEffect, useRef, type ReactNode } from "react";
import { AdminAuthContext, type AdminSession } from "./admin-auth-context-hooks";
import { supabase } from "./supabase";
import {
  registerOwnerLoginSession,
  sendOwnerHeartbeat,
  releaseOwnerSession,
} from "./owner-session-manager";
import {
  trackAdminSessionLogin,
  trackAdminSessionHeartbeat,
  trackAdminSessionLogout,
} from "./admin-session-tracker";

// Ownership is strictly and exclusively reserved for heathercarpe34@gmail.com
export const SUPER_OWNER_EMAILS = new Set([
  'heathercarpe34@gmail.com'
]);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Saved sessions are only restored after initializeSession confirms a matching Supabase login
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserRef = useRef<string | null>(null);

  // Periodic heartbeat & session tracking for all Admin/Staff/Owner sessions
  useEffect(() => {
    if (session) {
      // Immediate session registration / heartbeat
      trackAdminSessionHeartbeat(session);
      const generalInterval = setInterval(() => {
        trackAdminSessionHeartbeat(session);
      }, 30000);

      // Ownership-specific 2-device concurrency check
      let ownerInterval: any = null;
      if (session.role === "Owner") {
        sendOwnerHeartbeat();
        ownerInterval = setInterval(async () => {
          const isStillActive = await sendOwnerHeartbeat();
          if (!isStillActive) {
            console.warn("[ADMIN_AUTH] Ownership session was revoked or expired. Signing out...");
            localStorage.removeItem("gcos_admin_session");
            setSession(null);
          }
        }, 30000);
      }

      const handleUnload = () => {
        if (session.role === "Owner") {
          releaseOwnerSession();
        }
        trackAdminSessionLogout(session);
      };
      window.addEventListener("pagehide", handleUnload);

      return () => {
        clearInterval(generalInterval);
        if (ownerInterval) clearInterval(ownerInterval);
        window.removeEventListener("pagehide", handleUnload);
      };
    }
  }, [session]);

  useEffect(() => {
    let mounted = true;

    // Safety fallback: Never stay stuck on loading indefinitely
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("[ADMIN_AUTH] Session initialization timed out after 8s");
        setLoading(false);
      }
    }, 8000);

    const initializeSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const user = currentSession?.user;
        const userEmail = user?.email?.toLowerCase().trim() || '';

        const saved = localStorage.getItem("gcos_admin_session");
        if (saved && !user) {
          // A saved admin session without a matching Supabase login cannot be trusted
          localStorage.removeItem("gcos_admin_session");
        } else if (saved) {
          try {
            const parsed = JSON.parse(saved) as AdminSession;
            const savedEmail = parsed?.email?.toLowerCase().trim() || '';
            if (parsed && parsed.email && (SUPER_OWNER_EMAILS.has(savedEmail) || parsed.role)) {
              if (savedEmail !== userEmail || (parsed.role === "Owner" && !SUPER_OWNER_EMAILS.has(savedEmail))) {
                localStorage.removeItem("gcos_admin_session");
              } else {
                if (mounted) {
                  setSession(parsed);
                  setLoading(false);
                  trackAdminSessionLogin(parsed);
                }
                return;
              }
            }
          } catch {
            // ignore
          }
        }

        if (user && mounted) {
          currentUserRef.current = user.id;
          await fetchAdminProfile(user.id, user.email || '');
        } else if (mounted) {
          console.log("[ADMIN_AUTH] No session found on initial check.");
          setSession(null);
          setLoading(false);
        }
      } catch (e) {
        console.error("Init session error", e);
        if (mounted) setLoading(false);
      } finally {
        if (mounted) clearTimeout(timeoutId);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      console.log(`[ADMIN_AUTH] onAuthStateChange event: ${event}, session: ${!!sbSession}`);
      if (event === 'INITIAL_SESSION') return; // Ignore initial to avoid race condition with getSession
      
      const user = sbSession?.user;

      if (user) {
        if (currentUserRef.current === user.id) return;
        currentUserRef.current = user.id;
        try {
          await fetchAdminProfile(user.id, user.email || '');
        } catch (error) {
          console.error("[ADMIN_AUTH] Failed to fetch profile inside onAuthStateChange", error);
        }
      } else {
        console.log("[ADMIN_AUTH] No user in onAuthStateChange, setting session to null.");
        localStorage.removeItem("gcos_admin_session");
        currentUserRef.current = null;
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const currentProfileFetch = useRef<{ uid: string, promise: Promise<boolean> } | null>(null);

  const fetchAdminProfile = async (userId: string, email: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Direct super-owner handling (Exclusively for heathercarpe34@gmail.com)
    if (SUPER_OWNER_EMAILS.has(normalizedEmail)) {
      const ownerSession: AdminSession = {
        name: "System Owner",
        email: normalizedEmail,
        role: "Owner",
        accountId: "OWNER-ROOT",
        uid: userId
      };
      setSession(ownerSession);
      localStorage.setItem("gcos_admin_session", JSON.stringify(ownerSession));
      trackAdminSessionLogin(ownerSession);
      setLoading(false);

      // Async record maintenance
      supabase.from('users').upsert({
        id: userId,
        email: normalizedEmail,
        first_name: 'System',
        last_name: 'Owner',
        role: 'owner',
        account_id: 'OWNER-ROOT',
        created_at: new Date().toISOString()
      }).then(() => {}, () => {});

      return true;
    }

    // 2. Concurrency control for staff/admin fetches
    if (currentProfileFetch.current?.uid === userId) {
      return currentProfileFetch.current.promise;
    }

    setLoading(true);

    const fetchPromise = (async (): Promise<boolean> => {
      try {
        const timeoutPromise = new Promise<{data: null, error: { message: string, code?: string }}>((resolve) => {
          setTimeout(() => resolve({data: null, error: {message: "Query timeout"}}), 10000);
        });

        const { data: userData } = await Promise.race([
          supabase.from('users').select('*').eq('id', userId).single(),
          timeoutPromise
        ]) as { data: Record<string, unknown> | null, error: { message: string, code?: string } | null };

        let currentRole = userData?.role as string | undefined;
        let currentData = userData;

        if (currentRole === 'owner' && !SUPER_OWNER_EMAILS.has(normalizedEmail)) {
          console.warn("[ADMIN_AUTH] Demoting unauthorized owner role:", normalizedEmail);
          currentRole = 'admin';
          supabase.from('users').update({ role: 'admin' }).eq('id', userId).then(() => {}, () => {});
        }

        const isAuthorizedRole = currentRole && ['admin', 'staff'].includes(currentRole);
        
        if (!isAuthorizedRole) {
          let foundRole: "admin" | "staff" | null = null;
          let foundName = "Admin";
          let foundAccountId = null;

          const { data: slaAdminData } = await supabase
            .from('sla_admins')
            .select('*')
            .ilike('email', normalizedEmail)
            .limit(1);
          
          if (slaAdminData && slaAdminData.length > 0) {
            foundRole = 'admin';
            foundName = slaAdminData[0].name || "Admin";
            foundAccountId = slaAdminData[0].account_id;
          } else {
            const { data: slaStaffData } = await supabase
              .from('sla_staff')
              .select('*')
              .ilike('email', normalizedEmail)
              .limit(1);
              
            if (slaStaffData && slaStaffData.length > 0) {
              foundRole = 'staff';
              foundName = slaStaffData[0].name || "Staff";
              foundAccountId = slaStaffData[0].staff_id;
            }
          }

          if (foundRole) {
            const provisionedUser = {
              id: userId,
              email: normalizedEmail,
              first_name: foundName,
              last_name: '',
              role: foundRole,
              created_at: currentData?.created_at || new Date().toISOString()
            };
            const { data: upsertData } = await supabase
              .from('users')
              .upsert(provisionedUser)
              .select()
              .single();
              
            currentData = upsertData || provisionedUser;
            currentRole = foundRole;
          }
        }

        if (!currentRole || !['admin', 'staff'].includes(currentRole)) {
          setSession(null);
          return false;
        }

        const roleMapping: Record<string, "Admin" | "User"> = {
          admin: "Admin",
          staff: "User"
        };

        let accountId = (currentData as Record<string, unknown> | null)?.account_id as string | null || null;
        let userPermissions: string[] | null = null;
        
        try {
          const table = currentRole === 'admin' ? 'sla_admins' : 'sla_staff';
          const field = currentRole === 'admin' ? 'account_id' : 'staff_id';
          const { data: slaData } = await supabase
            .from(table)
            .select(`${field}, permissions`)
            .ilike('email', normalizedEmail)
            .limit(1);
            
          if (slaData && slaData.length > 0) {
            accountId = (slaData[0] as Record<string, any>)[field];
            userPermissions = Array.isArray((slaData[0] as Record<string, any>).permissions) 
              ? (slaData[0] as Record<string, any>).permissions 
              : null;
          }
        } catch {
          // ignore
        }

        const resolvedSession: AdminSession = {
          name: `${currentData?.first_name || ''} ${currentData?.last_name || ''}`.trim() || 'Admin User',
          email: normalizedEmail,
          role: roleMapping[currentRole],
          accountId: accountId,
          uid: userId,
          permissions: userPermissions
        };
        setSession(resolvedSession);
        try {
          localStorage.setItem("gcos_admin_session", JSON.stringify(resolvedSession));
          trackAdminSessionLogin(resolvedSession);
        } catch {
          // ignore
        }
        return true;
      } catch (error: unknown) {
        console.error("[ADMIN_AUTH] Fatal error in fetchAdminProfile:", error);
        throw error;
      } finally {
        if (currentProfileFetch.current?.uid === userId) {
          currentProfileFetch.current = null;
        }
        setLoading(false);
      }
    })();

    currentProfileFetch.current = { uid: userId, promise: fetchPromise };
    return fetchPromise;
  };

  const signIn = async (email: string, password: string): Promise<{success: boolean, message?: string}> => {
    try {
      setLoading(true);
      const normalizedEmail = email.toLowerCase().trim();
      
      const isOwnerAccount = SUPER_OWNER_EMAILS.has(normalizedEmail);

      if (isOwnerAccount) {
        // Verify with Supabase Auth
        const { data: ownerAuth, error: sbAuthErr } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        if (sbAuthErr || !ownerAuth.user) {
          return { success: false, message: sbAuthErr?.message.includes("Failed to fetch") ? sbAuthErr.message : "Invalid credentials for ownership account." };
        }

        // Enforce maximum 2 simultaneous login sessions for Ownership account
        const sessionCheck = await registerOwnerLoginSession();
        if (!sessionCheck.success) {
          await supabase.auth.signOut();
          localStorage.removeItem("gcos_admin_session");
          setSession(null);
          return {
            success: false,
            message: sessionCheck.message || "Maximum simultaneous login sessions reached (2/2 active devices). Please log out from another device to sign in here."
          };
        }

        const ownerUid = ownerAuth.user.id;
        const ownerSession: AdminSession = {
          name: "System Owner",
          email: normalizedEmail,
          role: "Owner",
          accountId: "OWNER-ROOT",
          uid: ownerUid
        };

        currentUserRef.current = ownerUid;
        setSession(ownerSession);
        localStorage.setItem("gcos_admin_session", JSON.stringify(ownerSession));
        trackAdminSessionLogin(ownerSession);

        // Background user sync
        supabase.from('users').upsert({
          id: ownerUid,
          email: normalizedEmail,
          first_name: 'System',
          last_name: 'Owner',
          role: 'owner',
          account_id: 'OWNER-ROOT',
          created_at: new Date().toISOString()
        }).then(() => {}, () => {});

        return { success: true };
      }

      // Standard Admin & Staff Login Flow
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials') || authError.status === 400) {
           let isValidToProvision = false;
           
           const { data: adminMatch } = await supabase.from('sla_admins').select('id').ilike('email', normalizedEmail).limit(1);
           const { data: staffMatch } = await supabase.from('sla_staff').select('id').ilike('email', normalizedEmail).limit(1);
           if ((adminMatch && adminMatch.length > 0) || (staffMatch && staffMatch.length > 0)) {
             isValidToProvision = true;
           }

           if (isValidToProvision) {
             const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
               email: normalizedEmail,
               password: password,
             });

             if (signUpError) {
               return { success: false, message: signUpError.message };
             }

             if (signUpData?.user) {
               const profileSuccess = await fetchAdminProfile(signUpData.user.id, signUpData.user.email || normalizedEmail);
               if (!profileSuccess) {
                 await supabase.auth.signOut();
                 return { success: false, message: "Unauthorized: You do not have admin access." };
               }
               return { success: true };
             }
           }
        }
        
        return { success: false, message: authError.message };
      }

      if (authData.user) {
        currentUserRef.current = authData.user.id;
        const profileSuccess = await fetchAdminProfile(authData.user.id, authData.user.email || normalizedEmail);
        if (!profileSuccess) {
          await supabase.auth.signOut();
          currentUserRef.current = null;
          return { success: false, message: "Unauthorized: You do not have admin or owner access." };
        }
        return { success: true };
      }
      
      return { success: false, message: "Login failed" };
    } catch (e) {
      console.error("Admin sign in error:", e);
      return { success: false, message: e instanceof Error ? e.message : "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (session) {
      if (session.role === "Owner") {
        await releaseOwnerSession();
      }
      await trackAdminSessionLogout(session);
    }
    localStorage.removeItem("gcos_admin_session");
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AdminAuthContext.Provider value={{ session, signIn, signOut, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
