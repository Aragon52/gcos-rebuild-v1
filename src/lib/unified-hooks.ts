import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Reseller } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { calculateVipLevel, getVipProductLimit } from "@/lib/vip-utils";

const EMPTY_RESELLERS: Reseller[] = [];

export function useUnifiedResellers() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Setup real-time listener for profiles and retail_shops
    const profilesChannel = supabase
      .channel('public:reseller_profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reseller_profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ["resellers"] });
      })
      .subscribe();

    const retailShopsChannel = supabase
      .channel('public:retail_shops')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'retail_shops' }, () => {
        queryClient.invalidateQueries({ queryKey: ["resellers"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(retailShopsChannel);
    };
  }, [queryClient]);

  const { data = EMPTY_RESELLERS } = useQuery({
    queryKey: ["resellers"],
    queryFn: async () => {
      try {
        console.log("[UNIFIED_HOOKS] Fetching unified resellers with safe multi-table resolution...");
        
        // Individual safe queries to avoid complete failure if one table has an error
        const [
          usersRes,
          profilesRes,
          adminsRes,
          staffRes,
          retailShopsRes,
          resellersTableRes,
          ordersRes
        ] = await Promise.all([
          supabase.from('users').select('*').limit(1000).catch(e => ({ data: [], error: e })),
          supabase.from('reseller_profiles').select('*').limit(1000).catch(e => ({ data: [], error: e })),
          supabase.from('sla_admins').select('*').limit(200).catch(e => ({ data: [], error: e })),
          supabase.from('sla_staff').select('*').limit(200).catch(e => ({ data: [], error: e })),
          supabase.from('retail_shops').select('*').limit(1000).catch(e => ({ data: [], error: e })),
          supabase.from('resellers').select('*').limit(1000).catch(e => ({ data: [], error: e })),
          supabase.from('orders').select('reseller_id, created_at').limit(2000).catch(e => ({ data: [], error: e }))
        ]);

        const users = (usersRes && 'data' in usersRes && Array.isArray(usersRes.data)) ? usersRes.data : [];
        const profiles = (profilesRes && 'data' in profilesRes && Array.isArray(profilesRes.data)) ? profilesRes.data : [];
        const admins = (adminsRes && 'data' in adminsRes && Array.isArray(adminsRes.data)) ? adminsRes.data : [];
        const staff = (staffRes && 'data' in staffRes && Array.isArray(staffRes.data)) ? staffRes.data : [];
        const retailShops = (retailShopsRes && 'data' in retailShopsRes && Array.isArray(retailShopsRes.data)) ? retailShopsRes.data : [];
        const directResellers = (resellersTableRes && 'data' in resellersTableRes && Array.isArray(resellersTableRes.data)) ? resellersTableRes.data : [];

        console.log(`[UNIFIED_HOOKS] Fetched: ${users.length} users, ${profiles.length} profiles, ${retailShops.length} shops, ${directResellers.length} direct resellers`);

        const usersMap = new Map<string, Record<string, unknown>>();
        users.forEach(u => {
          if (u.id) usersMap.set(String(u.id), u);
          if (u.email) usersMap.set(String(u.email).toLowerCase(), u);
        });

        const retailShopsMap = new Map<string, Record<string, unknown>>();
        retailShops.forEach(s => {
          if (s.id) retailShopsMap.set(String(s.id), s);
          if (s.reseller_id) retailShopsMap.set(String(s.reseller_id), s);
        });
        
        const directResellersMap = new Map<string, Record<string, unknown>>();
        directResellers.forEach(r => {
          if (r.id) directResellersMap.set(String(r.id), r);
        });

        const latestOrderMap = new Map<string, string>();
        if (ordersRes && 'data' in ordersRes && Array.isArray(ordersRes.data)) {
          ordersRes.data.forEach(o => {
            if (o.reseller_id) {
              const oTime = o.created_at;
              const existing = latestOrderMap.get(String(o.reseller_id));
              if (!existing || new Date(oTime) > new Date(existing)) {
                latestOrderMap.set(String(o.reseller_id), oTime);
              }
            }
          });
        }
        
        const adminsNameMap = new Map<string, string>();
        const adminsIdToAccountIdMap = new Map<string, string>();
        
        admins.forEach(a => {
          const name = a.name || a.username || a.account_id || a.id;
          if (a.id) {
            adminsNameMap.set(String(a.id), name);
            if (a.account_id) adminsIdToAccountIdMap.set(String(a.id), a.account_id);
          }
          if (a.account_id) {
            adminsNameMap.set(String(a.account_id), name);
          }
        });

        const staffMap = new Map<string, Record<string, unknown>>();
        staff.forEach(s => {
          if (s.referral_id) staffMap.set(String(s.referral_id), s);
          if (s.staff_id) staffMap.set(String(s.staff_id), s);
          if (s.id) staffMap.set(String(s.id), s);
        });

        const allResellerIds = new Set<string>();
        profiles.forEach(p => p.id && allResellerIds.add(String(p.id)));
        retailShops.forEach(s => s.id && allResellerIds.add(String(s.id)));
        directResellers.forEach(r => r.id && allResellerIds.add(String(r.id)));
        
        // Also include any users who are marked as reseller or not admin/staff
        users.forEach(u => {
          const role = String(u.role || '').toLowerCase();
          if (role === 'reseller' || (role !== 'owner' && role !== 'admin' && role !== 'staff' && !allResellerIds.has(String(u.id)))) {
            if (u.id) allResellerIds.add(String(u.id));
          }
        });

        const profilesMap = new Map<string, Record<string, unknown>>();
        profiles.forEach(p => {
          if (p.id) profilesMap.set(String(p.id), p);
        });

        const resellers: Reseller[] = Array.from(allResellerIds).map(id => {
          const profileData = profilesMap.get(id) || {};
          const userData = usersMap.get(id) || {};
          const retailShopData = retailShopsMap.get(id) || {};
          const directData = directResellersMap.get(id) || {};
          
          let adminName = '';
          let staffName = '';
          
          const memberOfAdminIdRaw = (profileData.member_of_admin_id as string) || (userData.member_of_admin_id as string) || (directData.member_of_admin_id as string) || '';
          let inferredAdminId = memberOfAdminIdRaw ? (adminsIdToAccountIdMap.get(memberOfAdminIdRaw) || memberOfAdminIdRaw) : '';
          
          if (memberOfAdminIdRaw && adminsNameMap.has(memberOfAdminIdRaw)) {
            adminName = adminsNameMap.get(memberOfAdminIdRaw)!;
          } 
          
          const referredByStaffId = (profileData.referred_by_staff_id as string) || (userData.referred_by_staff_id as string) || (directData.referred_by as string) || '';
          if (referredByStaffId && staffMap.has(referredByStaffId)) {
            const staffData = staffMap.get(referredByStaffId)!;
            staffName = (staffData.username as string) || (staffData.name as string) || referredByStaffId;
            
            const staffAdminIdRaw = (staffData.created_by_admin_id as string) || '';
            const staffAdminAccountId = staffAdminIdRaw ? (adminsIdToAccountIdMap.get(staffAdminIdRaw) || staffAdminIdRaw) : '';
            
            if (!inferredAdminId) {
              inferredAdminId = staffAdminAccountId;
            }

            if (!adminName && staffAdminIdRaw && adminsNameMap.has(staffAdminIdRaw)) {
              adminName = adminsNameMap.get(staffAdminIdRaw)!;
            }
          }

          const firstNameRaw = (userData.first_name as string) || (profileData.first_name as string) || (retailShopData.first_name as string) || (directData.first_name as string) || '';
          const lastNameRaw = (userData.last_name as string) || (profileData.last_name as string) || (retailShopData.last_name as string) || (directData.last_name as string) || '';
          const shopName = (profileData.shop_name as string) || (retailShopData.shop_name as string) || (directData.shop_name as string) || (userData.shop_name as string) || (userData.first_name as string) || 'Reseller Store';

          const firstName = firstNameRaw || (shopName ? shopName.split(' ')[0] : 'Reseller');
          const lastName = lastNameRaw || (shopName ? shopName.split(' ').slice(1).join(' ') || '' : 'Partner');

          const referralId = (profileData.referral_code as string) || (profileData.referral_id as string) || (userData.referral_id as string) || (directData.referral_id as string) || '';

          let customSettings: Record<string, unknown> = {};
          try {
            const pMethod = profileData.payment_method || directData.payment_method;
            if (pMethod) {
              customSettings = typeof pMethod === 'string' ? JSON.parse(pMethod) : (pMethod as Record<string, unknown>);
            }
          } catch(e) { /* ignore parse error */ }
          
          let bankInfoVal: Record<string, unknown> | undefined;
          const rawBankInfo = customSettings.bankInfo || profileData.bank_info || directData.bank_info;
          if (rawBankInfo) {
             try {
                bankInfoVal = typeof rawBankInfo === 'string' ? JSON.parse(rawBankInfo) : rawBankInfo;
             } catch(e) { /* ignore parse error */ }
          }
          
          const usdtAddressVal = (customSettings.usdtAddress as string) || (profileData.usdt_address as string) || (directData.usdt_address as string) || '';

          const latestOrderDate = latestOrderMap.get(id) || '';
          const dates = [
            profileData.updated_at,
            profileData.last_token_update,
            profileData.registration_date,
            profileData.created_at,
            userData.created_at,
            latestOrderDate
          ].filter(Boolean).map(d => new Date(d as string).getTime());
          
          const maxTime = dates.length > 0 ? Math.max(...dates) : Date.now();
          const lastActive = new Date(maxTime).toISOString();

          const totalDeposits = Number(profileData.total_deposits || directData.total_deposits || 0);
          const totalWithdrawals = Number(profileData.total_withdrawals || directData.total_withdrawals || 0);
          const netDeposits = totalDeposits - totalWithdrawals;
          const regDate = (profileData.registration_date as string) || (userData.created_at as string) || (directData.created_at as string) || '';
          
          const rawLvlStr = (retailShopData.level as string) || (profileData.level as string) || (directData.level as string) || 'VIP-0';
          const explicitLvlNum = parseInt(String(rawLvlStr).match(/\d+/)?.[0] || '0', 10);
          const resolvedLvlNum = calculateVipLevel(netDeposits, explicitLvlNum, regDate);
          const resolvedLevel = `VIP-${resolvedLvlNum}`;
          const resolvedProductLimit = (retailShopData.product_limit as number) || (profileData.product_limit as number) || getVipProductLimit(resolvedLvlNum, regDate);

          const rawResellerIdNum = profileData.reseller_id || directData.reseller_id || (typeof userData.reseller_id === 'number' ? userData.reseller_id : undefined);

          return {
            id: id,
            firstName,
            lastName,
            name: firstNameRaw || lastNameRaw ? `${firstNameRaw} ${lastNameRaw}`.trim() : (shopName || 'Unknown Reseller'),
            shopName,
            shopSlug: (retailShopData.shop_slug as string) || (profileData.shop_slug as string) || '',
            email: (userData.email as string) || (profileData.email as string) || (directData.email as string) || '',
            registrationDate: regDate,
            referredBy: (profileData.referred_by_staff_id as string) || (directData.referred_by as string) || '',
            staffName,
            adminMember: adminName,
            memberOfAdminId: inferredAdminId,
            hasRequestedPasswordReset: profileData.password_reset_requested === true,
            referralId,
            level: resolvedLevel,
            productLimit: resolvedProductLimit,
            isSuspended: (retailShopData.is_suspended as boolean) || (profileData.is_suspended as boolean) || false,
            starRating: (retailShopData.star_rating as number) || (profileData.star_rating as number) || 2.0,
            creditScore: (retailShopData.credit_score as number) || (profileData.credit_score as number) || 100,
            selectedProductIds: [],
            resellerId: rawResellerIdNum as number,
            // Financial fields
            balance: Number(profileData.balance || directData.balance || 0),
            pendingBalance: Number(profileData.pending_balance || directData.pending_balance || 0),
            unpickedBalance: Number(profileData.unpicked_balance || directData.unpicked_balance || 0),
            totalDeposits: totalDeposits,
            totalWithdrawals: totalWithdrawals,
            totalEarnings: Number(profileData.total_earnings || directData.total_earnings || 0),
            totalOrders: Number(profileData.total_orders || directData.total_orders || 0),
            bankInfo: bankInfoVal as { bankName: string; accountName: string; accountNumber: string } | undefined,
            usdtAddress: usdtAddressVal,
            lastActive
          };
        });

        return resellers;
      } catch (error) {
        console.error("Error in useUnifiedResellers queryFn:", error);
        return [];
      }
    },
    staleTime: 5000, 
    refetchOnWindowFocus: true,
    placeholderData: (previousData: Reseller[] | undefined) => previousData,
  });

  return data;
}
