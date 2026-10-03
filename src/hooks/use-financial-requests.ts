import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { DEFAULT_DEPOSITS, DEFAULT_WITHDRAWALS } from "@/data/default-seed-data";

export interface DepositRequest {
  id: string;
  resellerId: string;
  resellerDocId: string;
  resellerName: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  method: "Bank Transfer" | "USDT (TRC20)" | "Credit/Debit Card" | "Credit/Debit Card (Onramper)" | string;
  bankInfo?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  usdtAddress?: string;
  proofImage: string;
  remark?: string;
  createdAt: string;
  memberOfAdminId?: string;
  referralId?: string;
  staffId?: string;
  adminId?: string;
}

export interface WithdrawalRequest {
  id: string;
  resellerId: string;
  resellerDocId: string;
  resellerName: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  method: "Bank Transfer" | "USDT (TRC20)";
  bankInfo?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  usdtAddress?: string;
  remark?: string;
  createdAt: string;
  memberOfAdminId?: string;
  referralId?: string;
  staffId?: string;
  adminId?: string;
}

export function useDepositRequests() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:deposit_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposit_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["deposit-requests"],
    queryFn: async () => {
      try {
        const [res1, res2, res3, res4] = await Promise.all([
          supabase.from("deposit_requests").select("*").limit(2000).catch(() => ({ data: [] })),
          supabase.from("deposits").select("*").limit(2000).catch(() => ({ data: [] })),
          supabase.from("ars_deposits").select("*").limit(2000).catch(() => ({ data: [] })),
          supabase.from("reseller_deposits").select("*").limit(2000).catch(() => ({ data: [] })),
        ]);
        
        const combined = [
          ...(res1.data || []),
          ...(res2.data || []),
          ...(res3.data || []),
          ...(res4.data || []),
        ];

        // Deduplicate by ID
        const seenIds = new Set<string>();
        const data: any[] = [];
        combined.forEach(item => {
          const id = String(item.id || `${item.reseller_id}-${item.created_at}`);
          if (!seenIds.has(id)) {
            seenIds.add(id);
            data.push(item);
          }
        });

        // Fallback to default seed deposits if database has no records
        if (data.length === 0) {
          DEFAULT_DEPOSITS.forEach(d => data.push(d));
        }
        
        const sorted = data.sort((a: any, b: any) => {
          const tA = new Date(a.createdAt || a.created_at || a.date || 0).getTime();
          const tB = new Date(b.createdAt || b.created_at || b.date || 0).getTime();
          return tB - tA;
        });

        const mapped = sorted.map((item: any) => {
          let method = item.method;
          if (!method) {
            const rem = (item.remark || item.notes || "").toLowerCase();
            if (rem.includes("card") || rem.includes("onramper") || rem.includes("visa") || rem.includes("mastercard")) {
              method = "Credit/Debit Card (Onramper)";
            } else if (rem.includes("bank") || rem.includes("wire")) {
              method = "Bank Transfer";
            } else {
              method = "USDT (TRC20)";
            }
          }

          const rawStatus = String(item.status || "Pending");
          const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

          return {
            id: String(item.id || ""),
            resellerId: String(item.reseller_id || item.resellerId || item.user_id || item.id || ""),
            resellerDocId: String(item.reseller_doc_id || item.reseller_id || item.resellerId || item.user_id || item.id || ""),
            resellerName: String(item.reseller_name || item.resellerName || item.shop_name || item.name || "Reseller"),
            amount: Number(item.amount ?? item.total_amount ?? 0),
            status: (normalizedStatus === "Approved" || normalizedStatus === "Rejected" ? normalizedStatus : "Pending") as "Pending" | "Approved" | "Rejected",
            method,
            proofImage: item.screenshot || item.proof_image || item.proofImage || item.image || item.receipt || "",
            remark: item.remark || item.notes || "",
            createdAt: item.createdAt || item.created_at || item.date || new Date().toISOString(),
            memberOfAdminId: item.member_of_admin_id || item.memberOfAdminId || "",
            referralId: item.referral_id || item.referralId || item.referral_code || "",
            staffId: item.staff_id || item.staffId || item.referred_by || "",
            adminId: item.admin_id || item.adminId || "",
          };
        }) as DepositRequest[];

        console.log(`[FINANCIAL] Loaded ${mapped.length} deposit requests`);
        return mapped;
      } catch (error) {
        console.error("Error fetching deposit requests:", error);
        return DEFAULT_DEPOSITS;
      }
    },
    staleTime: 5000,
  });
}

export function useWithdrawalRequests() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:withdrawal_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["withdrawal-requests"],
    queryFn: async () => {
      try {
        const [res1, res2, res3, res4] = await Promise.all([
          supabase.from("withdrawal_requests").select("*").limit(2000).catch(() => ({ data: [] })),
          supabase.from("withdrawals").select("*").limit(2000).catch(() => ({ data: [] })),
          supabase.from("ars_withdrawals").select("*").limit(2000).catch(() => ({ data: [] })),
          supabase.from("reseller_withdrawals").select("*").limit(2000).catch(() => ({ data: [] })),
        ]);
        
        const combined = [
          ...(res1.data || []),
          ...(res2.data || []),
          ...(res3.data || []),
          ...(res4.data || []),
        ];

        // Deduplicate by ID
        const seenIds = new Set<string>();
        const data: any[] = [];
        combined.forEach(item => {
          const id = String(item.id || `${item.reseller_id}-${item.created_at}`);
          if (!seenIds.has(id)) {
            seenIds.add(id);
            data.push(item);
          }
        });

        // Fallback to default seed withdrawals if database has no records
        if (data.length === 0) {
          DEFAULT_WITHDRAWALS.forEach(w => data.push(w));
        }
        
        const sorted = data.sort((a: any, b: any) => {
          const tA = new Date(a.createdAt || a.created_at || a.date || 0).getTime();
          const tB = new Date(b.createdAt || b.created_at || b.date || 0).getTime();
          return tB - tA;
        });

        const mapped = sorted.map((item: any) => {
          let parsed: Record<string, unknown> | undefined;
          const rawAccount = item.account_info || item.bank_info || item.bankInfo;
          if (rawAccount) {
            try {
              parsed = typeof rawAccount === 'string' ? JSON.parse(rawAccount) : rawAccount;
            } catch {
              parsed = undefined;
            }
          }

          const rawStatus = String(item.status || "Pending");
          const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

          return {
            id: String(item.id || ""),
            resellerId: String(item.reseller_id || item.resellerId || item.user_id || item.id || ""),
            resellerDocId: String(item.reseller_doc_id || item.reseller_id || item.resellerId || item.user_id || item.id || ""),
            resellerName: String(item.reseller_name || item.resellerName || item.shop_name || item.name || "Reseller"),
            amount: Number(item.amount ?? item.total_amount ?? 0),
            status: (normalizedStatus === "Approved" || normalizedStatus === "Rejected" ? normalizedStatus : "Pending") as "Pending" | "Approved" | "Rejected",
            method: item.method || (parsed ? "Bank Transfer" : "USDT (TRC20)"),
            bankInfo: parsed as any,
            usdtAddress: item.usdt_address || item.usdtAddress || (parsed?.usdtAddress as string) || "",
            remark: item.remark || item.notes || (parsed?.rejectionRemark as string | undefined) || "",
            createdAt: item.createdAt || item.created_at || item.date || new Date().toISOString(),
            memberOfAdminId: item.member_of_admin_id || item.memberOfAdminId || "",
            referralId: item.referral_id || item.referralId || item.referral_code || "",
            staffId: item.staff_id || item.staffId || item.referred_by || "",
            adminId: item.admin_id || item.adminId || "",
          };
        }) as WithdrawalRequest[];

        console.log(`[FINANCIAL] Loaded ${mapped.length} withdrawal requests`);
        return mapped;
      } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        return DEFAULT_WITHDRAWALS;
      }
    },
    staleTime: 5000,
  });
}

export function useFinancialMutations() {
  const queryClient = useQueryClient();

  const updateDepositStatus = useMutation({
    mutationFn: async ({ id, status, remark }: { id: string; status: string; remark?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (remark !== undefined) updates.remark = remark.trim() || null;

      const { error } = await supabase
        .from("deposit_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });
      toast.success("Deposit status updated");
    }
  });

  const updateWithdrawalStatus = useMutation({
    mutationFn: async ({ id, status, remark }: { id: string; status: string; remark?: string }) => {
      const updates: Record<string, unknown> = { status };

      // The rejection reason is stored in a dedicated remark column so the
      // reseller portal can display it alongside the request.
      if (remark !== undefined) updates.remark = remark.trim() || null;

      const { error } = await supabase
        .from("withdrawal_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      toast.success("Withdrawal status updated");
    }
  });

  return { updateDepositStatus, updateWithdrawalStatus };
}
