import React, { useState, useEffect, useRef } from "react";
import { useDbProducts } from "@/hooks/use-db-products";
import type { Product } from "@/lib/types";
import { ResellerContext, type ResellerProfile, type StoreTheme, getLevelByDeposit } from "@/lib/reseller-context-hooks";
import { isNewResellerPromotionRuleActive } from "./vip-utils";
import { supabase } from "./supabase";
import { useFcmToken } from "@/hooks/use-fcm-token";
import { resellerPath } from "@/lib/subdomain";

interface CustomSettings {
  shopLogo?: string;
  shopHeroBanner?: string;
  shopDescription?: string;
  storeTheme?: string;
  profilePicture?: string;
  phone?: string;
  usdtAddress?: string;
  bankInfo?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

const DEFAULT_PROFILE_TEMPLATE: Omit<ResellerProfile, "id" | "resellerId" | "firstName" | "lastName" | "email" | "shopName"> = {
  profilePicture: "",
  phone: "",
  shopLogo: "",
  shopHeroBanner: "",
  storeTheme: "minimal",
  level: "VIP-0",
  verified: false,
  balance: 0,
  pendingBalance: 0,
  unpickedBalance: 0,
  guaranteeBalance: 0,
  totalEarnings: 0,
  totalOrders: 0,
  totalDeposits: 0,
  pendingOrders: 0,
  selectedProductIds: [],
  joinedAt: new Date().toISOString(),
  shopLevel: "VIP-0",
  storeRating: 2.0,
  creditLimit: 100,
  creditScore: 100,
  productLimit: 20,
  starRating: 2.0,
  usdtAddress: "",
  bankInfo: { bankName: "", accountName: "", accountNumber: "" },
};

import { RealtimeChannel } from "@supabase/supabase-js";

export function ResellerProvider({ children }: { children: React.ReactNode }) {
  const [reseller, setReseller] = useState<ResellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: products = [] } = useDbProducts();

  // Register FCM token for push notifications
  useFcmToken();

  const currentUserRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    let profileChannel: RealtimeChannel | null = null;
    let userChannel: RealtimeChannel | null = null;
    let selectionChannel: RealtimeChannel | null = null;
    let shopChannel: RealtimeChannel | null = null;
    let ordersChannel: RealtimeChannel | null = null;

    // Safety fallback: Never stay stuck on loading indefinitely
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("[RESELLER] Context loading timed out after 15s");
        setLoading(false);
      }
    }, 15000);

    let channelsSetupUserId: string | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const triggerFullReload = async (uid: string) => {
      if (!mounted) return;
      try {
        await fetchProfile(uid, '', true, true);
      } catch (e) {
        console.warn("[RESELLER] Realtime reload error:", e);
      }
    };

    const setupRealtimeChannels = (uid: string) => {
      if (channelsSetupUserId === uid) return;
      channelsSetupUserId = uid;

      // Cleanup previous channels if they exist
      if (profileChannel) supabase.removeChannel(profileChannel);
      if (userChannel) supabase.removeChannel(userChannel);
      if (selectionChannel) supabase.removeChannel(selectionChannel);
      if (shopChannel) supabase.removeChannel(shopChannel);
      if (ordersChannel) supabase.removeChannel(ordersChannel);

      // Setup real-time listeners for all reseller-related tables
      profileChannel = supabase
        .channel(`rt:reseller_profiles:${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reseller_profiles', filter: `id=eq.${uid}` }, () => {
          console.log("[RESELLER_RT] reseller_profiles updated in DB, syncing state...");
          void triggerFullReload(uid);
        })
        .subscribe();

      shopChannel = supabase
        .channel(`rt:retail_shops:${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'retail_shops', filter: `id=eq.${uid}` }, () => {
          console.log("[RESELLER_RT] retail_shops updated in DB, syncing state...");
          void triggerFullReload(uid);
        })
        .subscribe();

      userChannel = supabase
        .channel(`rt:users:${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${uid}` }, () => {
          console.log("[RESELLER_RT] users updated in DB, syncing state...");
          void triggerFullReload(uid);
        })
        .subscribe();

      selectionChannel = supabase
        .channel(`rt:selection:${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reseller_product_selection', filter: `reseller_id=eq.${uid}` }, () => {
          console.log("[RESELLER_RT] reseller_product_selection updated in DB, syncing state...");
          void triggerFullReload(uid);
        })
        .subscribe();

      ordersChannel = supabase
        .channel(`rt:orders:${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `reseller_id=eq.${uid}` }, () => {
          console.log("[RESELLER_RT] orders updated in DB, syncing state...");
          void triggerFullReload(uid);
        })
        .subscribe();
    };

    const onFocusOrVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && currentUserRef.current) {
        console.log("[RESELLER] Tab/Window focused, refreshing reseller data from database...");
        void triggerFullReload(currentUserRef.current);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocusOrVisible);
      document.addEventListener('visibilitychange', onFocusOrVisible);
    }

    // Polling fallback every 10 seconds while logged in
    pollInterval = setInterval(() => {
      if (currentUserRef.current && mounted) {
        void triggerFullReload(currentUserRef.current);
      }
    }, 10000);

    const initializeResellerSession = async () => {
      try {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        const user = sbSession?.user;
        if (user && mounted) {
          currentUserRef.current = user.id;
          setupRealtimeChannels(user.id);
          await fetchProfile(user.id, user.email || '');
        } else if (mounted) {
          console.log("[RESELLER] No session found on initial session check.");
          setReseller(null);
          setLoading(false);
        }
      } catch (e) {
        console.error("Reseller init session error", e);
        if (mounted) setLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    initializeResellerSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      console.log(`[RESELLER] onAuthStateChange event: ${event}, session: ${!!sbSession}`);
      if (event === 'INITIAL_SESSION') return; // Ignore initial to avoid race condition with getSession
      
      const user = sbSession?.user;
      
      if (user) {
        currentUserRef.current = user.id;
        setupRealtimeChannels(user.id);
        
        try {
          await fetchProfile(user.id, user.email || '');
        } catch (error) {
          console.error("[RESELLER] Failed to fetch profile inside onAuthStateChange", error);
        }
      } else {
        currentUserRef.current = null;
        channelsSetupUserId = null;
        if (profileChannel) supabase.removeChannel(profileChannel);
        if (userChannel) supabase.removeChannel(userChannel);
        if (selectionChannel) supabase.removeChannel(selectionChannel);
        if (shopChannel) supabase.removeChannel(shopChannel);
        if (ordersChannel) supabase.removeChannel(ordersChannel);
        if (mounted) {
          setReseller(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (pollInterval) clearInterval(pollInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocusOrVisible);
        document.removeEventListener('visibilitychange', onFocusOrVisible);
      }
      subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
      if (userChannel) supabase.removeChannel(userChannel);
      if (selectionChannel) supabase.removeChannel(selectionChannel);
      if (shopChannel) supabase.removeChannel(shopChannel);
      if (ordersChannel) supabase.removeChannel(ordersChannel);
    };
  }, []);

  const currentProfileFetch = useRef<{ uid: string, promise: Promise<boolean> } | null>(null);

  const fetchProfile = async (userId: string, email: string, force = false, silent = false): Promise<boolean> => {
    if (!force && currentProfileFetch.current?.uid === userId) {
      console.log(`[RESELLER_CONTEXT] Returning existing fetch promise for UID: ${userId}`);
      return currentProfileFetch.current.promise;
    }

    if (!silent) {
      setLoading(true);
    }

    const fetchPromise = (async (): Promise<boolean> => {
      console.log(`[RESELLER_CONTEXT] Fetching profile for UID: ${userId}, Email: ${email}`);
      try {
        console.log(`[RESELLER_CONTEXT] Initiating parallel data load for UID: ${userId}...`);

        const timeoutPromise = new Promise<{ data: null; error: { message: string; code?: string } }>((resolve) => {
          setTimeout(() => resolve({ data: null, error: { message: "Supabase query timed out after 15s" } }), 15000);
        });

        // Parallelize all 5 database queries at once instead of sequential awaits
        const [userRes, profileRes, shopRes, selectionRes, ordersRes] = await Promise.all([
          Promise.race([
            supabase.from('users').select('*').eq('id', userId).single(),
            timeoutPromise
          ]) as Promise<{ data: any; error: { message: string; code?: string } | null }>,
          supabase.from('reseller_profiles').select('*').eq('id', userId).maybeSingle(),
          supabase.from('retail_shops').select('*').eq('id', userId).maybeSingle(),
          supabase.from('reseller_product_selection').select('product_id').eq('reseller_id', userId),
          supabase.from('orders').select('id,profit,profits,status,total_amount,total_cost').eq('reseller_id', userId),
        ]);

        let userData = userRes.data;
        let profileData = profileRes.data;
        let currentShopData = shopRes.data;

        // If user or reseller profile not found, check if this is an authenticated OAuth user who needs first-time setup
        if (!userData || !profileData) {
          console.log(`[RESELLER_CONTEXT] User or profile not found for UID: ${userId}, checking for OAuth auto-provisioning...`);
          try {
            const { data: authUserData } = await supabase.auth.getUser();
            const authUser = authUserData?.user;

            if (authUser && authUser.id === userId) {
              console.log(`[RESELLER_CONTEXT] Authenticated user confirmed for UID: ${userId}. Auto-provisioning reseller store...`);
              const meta = (authUser.user_metadata || {}) as Record<string, any>;
              const fullName = (meta.full_name || meta.name || "").trim();
              let firstName = (meta.first_name || meta.given_name || "").trim();
              let lastName = (meta.last_name || meta.family_name || "").trim();

              if (!firstName && fullName) {
                const parts = fullName.split(" ");
                firstName = parts[0] || "Reseller";
                lastName = parts.slice(1).join(" ") || "Partner";
              }
              if (!firstName) firstName = (authUser.email || email || "").split("@")[0] || "Reseller";
              if (!lastName) lastName = "Merchant";

              let pendingRef: string | null = null;
              if (typeof window !== "undefined") {
                pendingRef = localStorage.getItem("pending_reseller_ref");
                localStorage.removeItem("pending_reseller_ref");
                localStorage.removeItem("pending_auth_portal");
              }

              const autoRegRes = await fetch("/api/register-reseller", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  firstName,
                  lastName,
                  emailOrPhone: authUser.email || email,
                  shopName: `${firstName}'s Store`,
                  referralCode: pendingRef || undefined,
                  uid: userId,
                }),
              });

              if (autoRegRes.ok) {
                console.log(`[RESELLER_CONTEXT] Auto-registration succeeded for Google user UID: ${userId}`);
                const [newUserRes, newProfileRes, newShopRes] = await Promise.all([
                  supabase.from("users").select("*").eq("id", userId).maybeSingle(),
                  supabase.from("reseller_profiles").select("*").eq("id", userId).maybeSingle(),
                  supabase.from("retail_shops").select("*").eq("id", userId).maybeSingle(),
                ]);
                userData = newUserRes.data;
                profileData = newProfileRes.data;
                currentShopData = newShopRes.data;

                const avatarUrl = meta.avatar_url || meta.picture;
                if (avatarUrl && profileData) {
                  supabase.from("reseller_profiles").update({ profile_picture: avatarUrl }).eq("id", userId).then(() => {}, () => {});
                  profileData.profile_picture = avatarUrl;
                }
              }
            }
          } catch (autoErr) {
            console.error("[RESELLER_CONTEXT] Error during OAuth auto-provisioning:", autoErr);
          }
        }

        if (!userData) {
          console.warn(`[RESELLER_CONTEXT] 'users' document NOT FOUND for UID: ${userId}`);
          setReseller(null);
          setLoading(false);
          return false;
        }

        if (!['reseller', 'customer', 'owner', 'admin'].includes(userData.role)) {
          console.warn(`[RESELLER_CONTEXT] Unauthorized role: ${userData.role}`);
          setReseller(null);
          setLoading(false);
          return false;
        }

        if (!profileData) {
          console.warn(`[RESELLER_CONTEXT] 'reseller_profiles' document NOT FOUND for UID: ${userId}`);
          setReseller(null);
          setLoading(false);
          return false;
        }

        // Auto-populate missing shop_slug if not present
        let activeShopSlug = profileData.shop_slug || '';
        if (!activeShopSlug) {
          const baseName = profileData.shop_name || 'my-shop';
          activeShopSlug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          if (!activeShopSlug) activeShopSlug = 'my-shop';
          activeShopSlug = activeShopSlug + '-' + Math.random().toString(36).substring(2, 6);
          
          console.log(`[RESELLER_CONTEXT] Auto-generating missing shop_slug for reseller: ${activeShopSlug}`);
          
          // Persist to DB in background without blocking
          supabase.from('reseller_profiles').update({ shop_slug: activeShopSlug }).eq('id', userId)
            .then(({ error }) => {
              if (error) console.error("Failed to auto-update reseller_profiles with shop_slug:", error);
            });
          supabase.from('retail_shops').upsert({ id: userId, shop_slug: activeShopSlug }, { onConflict: 'id' })
            .then(({ error }) => {
              if (error) console.error("Failed to auto-update retail_shops with shop_slug:", error);
            });
        }

        // Retail shop handling
        if (!currentShopData) {
          console.log(`[RESELLER_CONTEXT] Retail shop missing for ${userId}, auto-creating...`);
          const newShopData = {
            id: userId,
            reseller_id: profileData.reseller_id || 0,
            shop_name: profileData.shop_name || 'My Store',
            shop_slug: activeShopSlug,
            star_rating: 2.0,
            credit_score: 100,
            status: 'active',
            created_at: new Date().toISOString()
          };
          const { data: createdShop } = await supabase.from('retail_shops').insert(newShopData).select().maybeSingle();
          currentShopData = createdShop;
        } else if (!currentShopData.shop_slug) {
          // Fire and forget update if shop exists but lacks slug
          supabase.from('retail_shops').update({ shop_slug: activeShopSlug }).eq('id', userId)
            .then(({ error }) => {
              if (error) console.error("Failed to auto-update retail_shops with shop_slug:", error);
            });
          currentShopData.shop_slug = activeShopSlug;
        }
        
        const totalDeposits = Number(profileData.total_deposits || 0);
        const totalWithdrawals = Number(profileData.total_withdrawals || 0);
        const availableBalance = Number(profileData.balance || 0);
        const netDeposits = totalDeposits - totalWithdrawals;
        const qualificationFunds = Math.max(netDeposits, totalDeposits, availableBalance);
        const registrationDate = profileData.registration_date || profileData.created_at || userData.created_at || (currentShopData as any)?.created_at;
        const currentLevelLabel = (currentShopData?.level as string) || (profileData?.level as string) || "VIP-0";
        const levelInfo = getLevelByDeposit(qualificationFunds, currentLevelLabel, registrationDate, availableBalance);

        // Auto-upgrade VIP tier if qualification funds meet higher tier, but never demote existing configured level
        if (levelInfo.level !== currentLevelLabel && qualificationFunds >= 1000) {
          supabase.from('reseller_profiles').update({ level: levelInfo.level, product_limit: levelInfo.productLimit, updated_at: new Date().toISOString() }).eq('id', userId).then(() => {}, () => {});
          supabase.from('retail_shops').upsert({ id: userId, level: levelInfo.level, product_limit: levelInfo.productLimit }, { onConflict: 'id' }).then(() => {}, () => {});
        }

        // Product selection
        const selectionData = selectionRes.data;
        const selectedProductIds = selectionData ? selectionData.map((d: Record<string, unknown>) => String(d.product_id)) : [];

        // Compute collected profit from completed orders & active order balances
        const orderRows = ordersRes.data || [];
        const orderCount = orderRows.length || Number(profileData.total_orders || 0);
        
        const completedProfit = orderRows
          .filter((r: Record<string, unknown>) => String(r.status || '').toLowerCase() === 'completed')
          .reduce((sum: number, row: Record<string, unknown>) => sum + Number(row.profit ?? row.profits ?? 0), 0);

        const ongoingAmount = orderRows
          .filter((r: Record<string, unknown>) => {
            const st = String(r.status || '').toLowerCase();
            return st === 'ongoing' || st === 'shipped' || st === 'in_progress';
          })
          .reduce((sum: number, row: Record<string, unknown>) => sum + Number(row.total_amount ?? row.total_cost ?? 0), 0);

        const pendingAmount = orderRows
          .filter((r: Record<string, unknown>) => {
            const st = String(r.status || '').toLowerCase();
            return st === 'pending' || st === 'processing' || st === 'unpicked';
          })
          .reduce((sum: number, row: Record<string, unknown>) => sum + Number(row.total_amount ?? row.total_cost ?? 0), 0);

        const profileTotalEarnings = Number(profileData.total_earnings || 0);
        const resolvedTotalEarnings = Number(Math.max(profileTotalEarnings, completedProfit).toFixed(2));

        const profilePendingBalance = Number(profileData.pending_balance || 0);
        const resolvedPendingBalance = orderRows.length > 0 ? Number(ongoingAmount.toFixed(2)) : profilePendingBalance;

        const profileUnpickedBalance = Number(profileData.unpicked_balance || 0);
        const resolvedUnpickedBalance = orderRows.length > 0 ? Number(pendingAmount.toFixed(2)) : profileUnpickedBalance;

        // Auto-synchronize discrepancies back to DB in background
        const dbSyncUpdates: Record<string, unknown> = {};
        if (completedProfit > profileTotalEarnings) {
          dbSyncUpdates.total_earnings = resolvedTotalEarnings;
          dbSyncUpdates.total_orders = orderCount;
        }
        if (Math.abs(profilePendingBalance - resolvedPendingBalance) > 0.01) {
          dbSyncUpdates.pending_balance = resolvedPendingBalance;
        }
        if (Math.abs(profileUnpickedBalance - resolvedUnpickedBalance) > 0.01) {
          dbSyncUpdates.unpicked_balance = resolvedUnpickedBalance;
        }

        if (Object.keys(dbSyncUpdates).length > 0) {
          dbSyncUpdates.updated_at = new Date().toISOString();
          supabase
            .from('reseller_profiles')
            .update(dbSyncUpdates)
            .eq('id', userId)
            .then(() => {}, (e) => console.warn("[RESELLER_CONTEXT] Background DB balance sync failed:", e));
        }

      let custom: CustomSettings = {};
      try {
        if (profileData.payment_method) {
          custom = JSON.parse(profileData.payment_method) as CustomSettings;
        }
      } catch (e) {
        console.error("Error parsing custom payment_method inside fetchProfile:", e);
      }

      let bankInfoObj = { bankName: '', accountName: '', accountNumber: '' };
      const rawBankInfo = custom.bankInfo;
      if (rawBankInfo) {
        try {
          bankInfoObj = typeof rawBankInfo === 'string' ? JSON.parse(rawBankInfo) : rawBankInfo;
        } catch (e) {
          console.error("Error parsing bank_info:", e);
        }
      }

      console.log(`[RESELLER_CONTEXT] Setting reseller state...`);
      setReseller({
        ...DEFAULT_PROFILE_TEMPLATE,
        id: userId,
        resellerId: profileData.reseller_id || 0,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: email,
        phone: custom.phone || (userData as any)?.phone || (profileData as any)?.phone || '',
        profilePicture: custom.profilePicture || profileData.profile_picture || '',
        shopName: profileData.shop_name,
        shopSlug: activeShopSlug,
        shopLogo: custom.shopLogo || profileData.shop_logo || '',
        shopHeroBanner: custom.shopHeroBanner || profileData.shop_hero_banner || '',
        shopDescription: custom.shopDescription || profileData.shop_description || '',
        storeTheme: (custom.storeTheme as StoreTheme) || profileData.store_theme || 'minimal',
        verified: profileData.verified,
        balance: Number(profileData.balance || 0),
        pendingBalance: resolvedPendingBalance,
        unpickedBalance: resolvedUnpickedBalance,
        totalEarnings: resolvedTotalEarnings,
        totalDeposits: totalDeposits,
        totalOrders: orderCount,
        joinedAt: registrationDate || new Date().toISOString(),
        referralCode: profileData.referral_code,
        referredByStaffId: profileData.referred_by_staff_id,
        memberOfAdminId: profileData.member_of_admin_id,
        level: levelInfo.level,
        productLimit: levelInfo.productLimit,
        isSuspended: currentShopData?.is_suspended || false,
        starRating: currentShopData?.star_rating || 2.0,
        creditScore: currentShopData?.credit_score || 100,
        selectedProductIds,
        usdtAddress: custom.usdtAddress || '',
        bankInfo: bankInfoObj,
      } as any);
      console.log(`[RESELLER_CONTEXT] Fetch complete successfully.`);
      return true;
      } catch (error: unknown) {
      console.error("[RESELLER_CONTEXT] Error fetching reseller profile:", error);
      if (error && typeof error === 'object' && 'message' in error) {
         const errObj = error as { message: string };
         if (errObj.message.includes('JWT') || errObj.message.includes('Auth')) {
            setReseller(null);
         }
      }
      return false;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[RESELLER_CONTEXT] Attempting login for: ${normalizedEmail}`);
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) throw error;
      console.log(`[RESELLER_CONTEXT] Supabase Auth login successful for UID: ${data.user?.id}`);
      
      if (data.user) {
        currentUserRef.current = data.user.id;
        const successProfile = await fetchProfile(data.user.id, data.user.email || '');
        if (!successProfile) {
          console.warn("[RESELLER_CONTEXT] Failed to load reseller profile, logging out");
          await supabase.auth.signOut();
          currentUserRef.current = null;
          setReseller(null);
          setLoading(false);
          return false;
        }
      }
      return true;
    } catch (e: unknown) {
      console.error("[RESELLER_CONTEXT] Login error details:", (e as Error).message);
      setLoading(false);
      // Surface connection problems instead of reporting them as wrong credentials
      const err = e as { name?: string; message?: string };
      if (err?.name === "AuthRetryableFetchError" || err?.message?.includes("Failed to fetch")) {
        throw new Error("Cannot reach the server right now. Please try again in a few minutes.");
      }
      return false;
    }
  };

  const register = async (data: { firstName: string; lastName: string; emailOrPhone: string; password: string; shopName?: string; referralCode?: string; isPhone?: boolean }): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedEmail = data.isPhone ? data.emailOrPhone.trim() : data.emailOrPhone.toLowerCase().trim();
      const response = await fetch("/api/register-reseller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          emailOrPhone: normalizedEmail,
          password: data.password,
          shopName: data.shopName,
          referralCode: data.referralCode,
          isPhone: data.isPhone || false,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Registration backend error");
      }

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || "Registration failed");
      }

      // Automatically sign them in on the client side after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.isPhone ? undefined : normalizedEmail,
        password: data.password,
      });

      if (signInError) {
        console.warn("Auto sign-in failed after registration:", signInError);
      }

      await fetchProfile(resData.userId, data.isPhone ? null : normalizedEmail);
      return { success: true };
    } catch (e: unknown) {
      console.error("Registration error details:", e);
      return { success: false, error: (e as Error).message || "Registration failed" };
    }
  };

  const signInWithGoogle = async (referralCode?: string): Promise<{ error?: string }> => {
    try {
      if (typeof window !== "undefined") {
        if (referralCode) {
          localStorage.setItem("pending_reseller_ref", referralCode.trim());
        }
        localStorage.setItem("pending_auth_portal", "reseller");
      }

      const redirectUrl = window.location.origin + resellerPath("/reseller/dashboard");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
      return {};
    } catch (err: any) {
      console.error("[RESELLER_CONTEXT] Google Sign-In error:", err);
      return { error: err.message || "Failed to initialize Google Sign-In" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setReseller(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updateProfile = async (updates: Partial<ResellerProfile>) => {
    if (!reseller) return;
    
    try {
      const profileUpdates: Record<string, unknown> = {};
      const userUpdates: Record<string, unknown> = {};
      const shopUpdates: Record<string, unknown> = {};

      if (updates.firstName !== undefined) {
        userUpdates.first_name = updates.firstName;
        profileUpdates.first_name = updates.firstName;
      }
      if (updates.lastName !== undefined) {
        userUpdates.last_name = updates.lastName;
        profileUpdates.last_name = updates.lastName;
      }

      let generatedSlug: string | undefined;
      if (updates.shopName !== undefined) {
        profileUpdates.shop_name = updates.shopName;
        shopUpdates.shop_name = updates.shopName;
        const slug = reseller.shopSlug || updates.shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + '-' + Math.random().toString(36).substring(2, 6);
        profileUpdates.shop_slug = slug;
        shopUpdates.shop_slug = slug;
        generatedSlug = slug;
      }

      // Prepare custom settings stored in payment_method JSON
      let custom: CustomSettings = {};
      if ((reseller as any)?.payment_method) {
        try {
          custom = typeof (reseller as any).payment_method === 'string'
            ? JSON.parse((reseller as any).payment_method)
            : (reseller as any).payment_method;
        } catch(e) { /* ignore */ }
      }

      // Preserve existing values from current reseller state
      if (reseller.shopLogo && !custom.shopLogo) custom.shopLogo = reseller.shopLogo;
      if (reseller.shopHeroBanner && !custom.shopHeroBanner) custom.shopHeroBanner = reseller.shopHeroBanner;
      if (reseller.storeTheme && !custom.storeTheme) custom.storeTheme = reseller.storeTheme;
      if (reseller.profilePicture && !custom.profilePicture) custom.profilePicture = reseller.profilePicture;
      if (reseller.phone && !custom.phone) custom.phone = reseller.phone;
      if (reseller.usdtAddress && !custom.usdtAddress) custom.usdtAddress = reseller.usdtAddress;
      if (reseller.bankInfo && !custom.bankInfo) custom.bankInfo = reseller.bankInfo;

      let customChanged = false;
      if (updates.shopLogo !== undefined) { 
        custom.shopLogo = updates.shopLogo; 
        profileUpdates.shop_logo = updates.shopLogo;
        shopUpdates.shop_logo = updates.shopLogo;
        customChanged = true; 
      }
      if (updates.shopHeroBanner !== undefined) { 
        custom.shopHeroBanner = updates.shopHeroBanner; 
        profileUpdates.shop_hero_banner = updates.shopHeroBanner;
        shopUpdates.shop_hero_banner = updates.shopHeroBanner;
        customChanged = true; 
      }
      if (updates.storeTheme !== undefined) { 
        custom.storeTheme = updates.storeTheme; 
        profileUpdates.store_theme = updates.storeTheme;
        shopUpdates.store_theme = updates.storeTheme;
        customChanged = true; 
      }
      if (updates.profilePicture !== undefined) { 
        custom.profilePicture = updates.profilePicture; 
        profileUpdates.profile_picture = updates.profilePicture;
        userUpdates.avatar_url = updates.profilePicture;
        customChanged = true; 
      }
      if (updates.phone !== undefined) { 
        custom.phone = updates.phone; 
        profileUpdates.phone = updates.phone;
        userUpdates.phone = updates.phone;
        customChanged = true; 
      }
      if (updates.usdtAddress !== undefined) { 
        custom.usdtAddress = updates.usdtAddress; 
        profileUpdates.usdc_address = updates.usdtAddress;
        customChanged = true; 
      }
      if (updates.bankInfo !== undefined) { 
        custom.bankInfo = updates.bankInfo; 
        profileUpdates.bank_info = typeof updates.bankInfo === 'string' ? updates.bankInfo : JSON.stringify(updates.bankInfo);
        customChanged = true; 
      }

      if (customChanged) {
        profileUpdates.payment_method = JSON.stringify(custom);
      }

      // Synchronize updates including the generated shop slug into the component state
      const nextResellerState: Partial<ResellerProfile> = {
        ...updates,
        phone: updates.phone !== undefined ? updates.phone : (custom.phone || reseller.phone || ''),
        profilePicture: updates.profilePicture !== undefined ? updates.profilePicture : (custom.profilePicture || reseller.profilePicture || ''),
        shopLogo: updates.shopLogo !== undefined ? updates.shopLogo : (custom.shopLogo || reseller.shopLogo || ''),
        shopHeroBanner: updates.shopHeroBanner !== undefined ? updates.shopHeroBanner : (custom.shopHeroBanner || reseller.shopHeroBanner || ''),
        storeTheme: updates.storeTheme !== undefined ? updates.storeTheme : ((custom.storeTheme as StoreTheme) || reseller.storeTheme || 'minimal'),
        usdtAddress: updates.usdtAddress !== undefined ? updates.usdtAddress : (custom.usdtAddress || reseller.usdtAddress || ''),
        bankInfo: updates.bankInfo !== undefined ? updates.bankInfo : (custom.bankInfo || reseller.bankInfo),
      };
      if (generatedSlug) {
        nextResellerState.shopSlug = generatedSlug;
      }
      (nextResellerState as any).payment_method = JSON.stringify(custom);
      setReseller(prev => prev ? { ...prev, ...nextResellerState } : null);

      // 1. First attempt update via dedicated server API endpoint (bypasses RLS limits)
      let serverUpdated = false;
      try {
        const res = await fetch("/api/reseller/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resellerId: reseller.id,
            firstName: updates.firstName,
            lastName: updates.lastName,
            phone: updates.phone,
            profilePicture: updates.profilePicture,
            shopName: updates.shopName,
            shopLogo: updates.shopLogo,
            shopHeroBanner: updates.shopHeroBanner,
            storeTheme: updates.storeTheme,
            usdtAddress: updates.usdtAddress,
            bankInfo: updates.bankInfo,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.slug) {
            nextResellerState.shopSlug = data.slug;
            setReseller(prev => prev ? { ...prev, shopSlug: data.slug } : null);
          }
          serverUpdated = true;
        } else {
          console.warn("[RESELLER_CONTEXT] Server API returned non-ok status, trying fallback:", res.status);
        }
      } catch (apiErr) {
        console.warn("[RESELLER_CONTEXT] Server API call exception, trying fallback:", apiErr);
      }

      // 2. Direct client-side update fallback
      if (!serverUpdated) {
        if (Object.keys(profileUpdates).length > 0) {
          const { error: pErr } = await supabase.from('reseller_profiles').update(profileUpdates).eq('id', reseller.id);
          if (pErr) {
            console.error("[RESELLER_CONTEXT] Error updating reseller_profiles:", pErr);
            throw new Error(pErr.message || "Failed to update reseller profile");
          }
        }
        if (Object.keys(userUpdates).length > 0) {
          const { error: uErr } = await supabase.from('users').update(userUpdates).eq('id', reseller.id);
          if (uErr) console.warn("[RESELLER_CONTEXT] Warning updating users:", uErr);
        }
        if (Object.keys(shopUpdates).length > 0) {
          const { error: sErr } = await supabase.from('retail_shops').upsert({ id: reseller.id, ...shopUpdates }, { onConflict: 'id' });
          if (sErr) console.warn("[RESELLER_CONTEXT] Warning updating retail_shops:", sErr);
        }
      }

    } catch (e) {
      console.error("[RESELLER_CONTEXT] Error updating profile:", e);
      throw e;
    }
  };

  const toggleProduct = async (productId: string): Promise<{ success: boolean; errorType?: 'limit' | 'permission' | 'error' }> => {
    if (!reseller) return { success: false, errorType: 'error' };
    
    const ids = [...reseller.selectedProductIds];
    const idx = ids.indexOf(productId);
    
    try {
      if (idx >= 0) {
        ids.splice(idx, 1);
        await supabase.from('reseller_product_selection').delete().match({ reseller_id: reseller.id, product_id: productId });
      } else {
        if (reseller.productLimit && ids.length >= reseller.productLimit) return { success: false, errorType: 'limit' };
        ids.push(productId);
        await supabase.from('reseller_product_selection').insert({ reseller_id: reseller.id, product_id: productId });
      }
      
      setReseller({ ...reseller, selectedProductIds: ids });
      return { success: true };
    } catch (e) {
      console.error("[RESELLER_CONTEXT] Error toggling product:", e);
      return { success: false, errorType: 'error' };
    }
  };

  const getMyProducts = (): Product[] => {
    if (!reseller) return [];
    return products.filter(p => reseller.selectedProductIds.includes(p.id));
  };

  const getResellerBySlug = (slug: string): ResellerProfile | null => {
    if (reseller && (reseller.id === slug || reseller.shopSlug === slug)) return reseller;
    return null;
  };

  const fetchResellerBySlug = async (slug: string): Promise<ResellerProfile | null> => {
    if (reseller && (reseller.id === slug || reseller.shopSlug === slug)) return reseller;

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      let query = supabase.from('reseller_profiles').select('*');
      
      if (isUuid) {
        query = query.or(`shop_slug.eq.${slug},id.eq.${slug}`);
      } else {
        query = query.eq('shop_slug', slug);
      }

      const { data: profileData, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      if (!profileData) return null;

      const { data: shopData } = await supabase
        .from('retail_shops')
        .select('*')
        .eq('id', profileData.id)
        .maybeSingle();

      return await fetchResellerById(profileData.id, { ...profileData, ...shopData });
    } catch (error) {
      console.error("Error fetching reseller by slug:", error);
      return null;
    }
  };

  const fetchResellerByName = async (name: string): Promise<ResellerProfile | null> => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    try {
      const { data: profileData } = await supabase
        .from('reseller_profiles')
        .select('*')
        .or(`shop_name.ilike.%${trimmedName}%,shop_slug.ilike.%${trimmedName}%`)
        .limit(1)
        .maybeSingle();
      
      if (!profileData) return null;

      const { data: shopData } = await supabase
        .from('retail_shops')
        .select('*')
        .eq('id', profileData.id)
        .maybeSingle();

      return await fetchResellerById(profileData.id, { ...profileData, ...shopData });
    } catch (error) {
      console.error("Error fetching reseller by name:", error);
      return null;
    }
  };

  const fetchResellerById = async (userId: string, shopData: Record<string, unknown>): Promise<ResellerProfile | null> => {
    try {
      const { data: selectionData } = await supabase
        .from('reseller_product_selection')
        .select('product_id')
        .eq('reseller_id', userId);
      
      const selectedProductIds = selectionData ? selectionData.map(d => d.product_id) : [];

      let custom: CustomSettings = {};
      try {
        if (shopData.payment_method) {
          custom = JSON.parse(shopData.payment_method as string) as CustomSettings;
        }
      } catch (e) {
        console.error("Error parsing custom settings inside fetchResellerById:", e);
      }

      let bankInfoObj = { bankName: '', accountName: '', accountNumber: '' };
      const rawBankInfo = custom.bankInfo;
      if (rawBankInfo) {
        try {
          bankInfoObj = typeof rawBankInfo === 'string' ? JSON.parse(rawBankInfo) : rawBankInfo;
        } catch (e) {
          console.error("Error parsing bank_info:", e);
        }
      }

      const totalDeposits = Number(shopData.total_deposits || 0);
      const totalWithdrawals = Number(shopData.total_withdrawals || 0);
      const netDeposits = totalDeposits - totalWithdrawals;
      const currentLevelLabel = (shopData?.level as string) || "VIP-0";
      const levelInfo = getLevelByDeposit(netDeposits, currentLevelLabel);

      return {
        ...DEFAULT_PROFILE_TEMPLATE,
        id: userId,
        resellerId: shopData.reseller_id || 0,
        firstName: shopData.first_name || '',
        lastName: shopData.last_name || '',
        email: shopData.email || '',
        phone: custom.phone || (shopData.phone as string) || '',
        shopName: shopData.shop_name || 'My Shop',
        shopSlug: shopData.shop_slug || userId,
        shopLogo: custom.shopLogo || shopData.shop_logo || '',
        shopHeroBanner: custom.shopHeroBanner || shopData.shop_hero_banner || '',
        shopDescription: custom.shopDescription || (shopData.shop_description as string) || '',
        storeTheme: (custom.storeTheme as StoreTheme) || shopData.store_theme || 'minimal',
        isSuspended: shopData.is_suspended || false,
        starRating: shopData.star_rating || 2.0,
        creditScore: shopData.credit_score || 100,
        level: levelInfo.level || shopData.level || "VIP-0",
        productLimit: levelInfo.productLimit || shopData.product_limit || 20,
        selectedProductIds,
        verified: true,
        usdtAddress: custom.usdtAddress || '',
        bankInfo: bankInfoObj,
      } as ResellerProfile;
    } catch (error) {
      console.error("Error in fetchResellerById:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (reseller) {
      await fetchProfile(reseller.id, reseller.email, true, true);
    }
  };

  return (
    <ResellerContext.Provider value={{ reseller, loading, login, register, signInWithGoogle, logout, updateProfile, changePassword, toggleProduct, getMyProducts, getResellerBySlug, fetchResellerBySlug, fetchResellerByName, refreshProfile }}>
      {children}
    </ResellerContext.Provider>
  );
}

