import { useState, useEffect, useRef, type ReactNode } from "react";
import { AdminAuthContext, type AdminSession } from "./admin-auth-context-hooks";
import { supabase } from "./supabase";

export const SUPER_OWNER_EMAILS = new Set([
  'info@artesysdigitalsolution.com',
  'kokoyaebabylay660@gmail.com',
  'arkarnaung009@gmail.com',
  'heathercarpe34@gmail.com'
]);

export const REVOKED_EMAILS = new Set<string>([]);

export const MASTER_OWNER_PASSWORD = "arKr$277#612";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => {
    try {
      const saved = localStorage.getItem("gcos_admin_session");
      if (saved) {
        const parsed = JSON.parse(saved) as AdminSession;
        if (parsed?.email) {
          const emailLower = parsed.email.toLowerCase().trim();
          if (REVOKED_EMAILS.has(emailLower)) {
            localStorage.removeItem("gcos_admin_session");
            return null;
          }
          if (parsed.role === "Owner" && !SUPER_OWNER_EMAILS.has(emailLower)) {
            localStorage.removeItem("gcos_admin_session");
            return null;
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const currentUserRef = useRef<string | null>(null);

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
        const saved = localStorage.getItem("gcos_admin_session");
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as AdminSession;
            const savedEmail = parsed?.email?.toLowerCase().trim() || '';
            if (REVOKED_EMAILS.has(savedEmail)) {
              localStorage.removeItem("gcos_admin_session");
              if (mounted) {
                setSession(null);
                setLoading(false);
              }
              return;
            }
            if (parsed && parsed.email && (SUPER_OWNER_EMAILS.has(savedEmail) || parsed.role)) {
              if (mounted) {
                setSession(parsed);
                setLoading(false);
              }
              return;
            }
          } catch {
            // ignore
          }
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const user = currentSession?.user;
        const userEmail = user?.email?.toLowerCase().trim() || '';

        // Immediate revocation check
        if (userEmail && REVOKED_EMAILS.has(userEmail)) {
          console.warn("[ADMIN_AUTH] Revoked account detected on init. Purging session...");
          localStorage.removeItem("gcos_admin_session");
          await supabase.auth.signOut();
          if (mounted) {
            setSession(null);
            setLoading(false);
          }
          return;
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
      const userEmail = user?.email?.toLowerCase().trim() || '';

      // Intercept revoked accounts
      if (userEmail && REVOKED_EMAILS.has(userEmail)) {
        console.warn("[ADMIN_AUTH] Revoked user attempted auth state update. Signing out...");
        localStorage.removeItem("gcos_admin_session");
        await supabase.auth.signOut();
        currentUserRef.current = null;
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      if (user) {
        if (currentUserRef.current === user.id) return;
        currentUserRef.current = user.id;
        try {
          await fetchAdminProfile(user.id, user.email || '');
        } catch (error) {
          console.error("[ADMIN_AUTH] Failed to fetch profile inside onAuthStateChange", error);
        }
      } else {
        const saved = localStorage.getItem("gcos_admin_session");
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as AdminSession;
            const savedEmail = parsed?.email?.toLowerCase().trim() || '';
            if (REVOKED_EMAILS.has(savedEmail)) {
              localStorage.removeItem("gcos_admin_session");
              setSession(null);
              setLoading(false);
              return;
            }
            if (parsed && parsed.email && (SUPER_OWNER_EMAILS.has(savedEmail) || parsed.role)) {
              return;
            }
          } catch {
            // ignore
          }
        }
        console.log("[ADMIN_AUTH] No user in onAuthStateChange, setting session to null.");
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

    // 0. Hard rejection for revoked accounts
    if (REVOKED_EMAILS.has(normalizedEmail)) {
      console.warn("[ADMIN_AUTH] Access blocked for revoked email:", normalizedEmail);
      localStorage.removeItem("gcos_admin_session");
      await supabase.auth.signOut();
      setSession(null);
      setLoading(false);
      supabase.from('users').update({ role: 'revoked' }).eq('id', userId).then(() => {}, () => {});
      return false;
    }

    // 1. Direct super-owner handling
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

        const { data: userData, error: userError } = await Promise.race([
          supabase.from('users').select('*').eq('id', userId).single(),
          timeoutPromise
        ]) as { data: Record<string, unknown> | null, error: { message: string, code?: string } | null };

        let currentRole = userData?.role as string | undefined;
        let currentData = userData;

        if (currentRole === 'owner' && !SUPER_OWNER_EMAILS.has(normalizedEmail)) {
          console.warn("[ADMIN_AUTH] Revoking unauthorized owner role:", normalizedEmail);
          currentRole = undefined;
          supabase.from('users').update({ role: 'revoked' }).eq('id', userId).then(() => {}, () => {});
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
        
        if (!accountId) {
          try {
            const table = currentRole === 'admin' ? 'sla_admins' : 'sla_staff';
            const field = currentRole === 'admin' ? 'account_id' : 'staff_id';
            const { data: slaData } = await supabase
              .from(table)
              .select(field)
              .ilike('email', normalizedEmail)
              .limit(1);
              
            if (slaData && slaData.length > 0) {
              accountId = slaData[0][field];
            }
          } catch {
            // ignore
          }
        }

        const resolvedSession: AdminSession = {
          name: `${currentData?.first_name || ''} ${currentData?.last_name || ''}`.trim() || 'Admin User',
          email: normalizedEmail,
          role: roleMapping[currentRole],
          accountId: accountId,
          uid: userId
        };
        setSession(resolvedSession);
        try {
          localStorage.setItem("gcos_admin_session", JSON.stringify(resolvedSession));
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

      if (REVOKED_EMAILS.has(normalizedEmail)) {
        return { 
          success: false, 
          message: "Access Denied: This ownership account has been permanently revoked and disabled." 
        };
      }
      
      const isOwnerAccount = SUPER_OWNER_EMAILS.has(normalizedEmail);
      const isMasterPass = password === MASTER_OWNER_PASSWORD;

      if (isOwnerAccount && isMasterPass) {
        const ownerUid = "owner-" + normalizedEmail.replace(/[^a-z0-9]/g, "");
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

        // Non-blocking async Supabase auth & user row persistence
        supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        }).then(({ error }) => {
          if (error) {
            supabase.auth.signUp({
              email: normalizedEmail,
              password: password,
            }).catch(() => {});
          }
        }).catch(() => {});

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
