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
    queryFn: async (): Promise<DepositRequest[]> => {
      try {
        let dbRows: any[] = [];
        try {
          const res = await supabase.from("deposit_requests").select("*").limit(2000);
          if (res?.data && Array.isArray(res.data)) {
            dbRows = res.data;
          }
        } catch (e) {
          console.warn("[FINANCIAL] Error fetching deposit_requests:", e);
        }

        const localOverrides: Record<string, { status: string; remark?: string }> = (() => {
          try {
            return JSON.parse(localStorage.getItem("gcos_deposit_overrides") || "{}");
          } catch {
            return {};
          }
        })();

        const mappedDb: DepositRequest[] = dbRows.map((item: any) => {
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
          const id = String(item.id || "");
          const override = localOverrides[id];

          return {
            id,
            resellerId: String(item.reseller_id || item.resellerId || item.resellerDocId || item.user_id || item.id || ""),
            resellerDocId: String(item.resellerDocId || item.reseller_doc_id || item.reseller_id || item.resellerId || item.user_id || item.id || ""),
            resellerName: String(item.reseller_name || item.resellerName || item.shop_name || item.name || "Reseller Store"),
            amount: Number(item.amount ?? item.total_amount ?? 0),
            status: (override?.status || (normalizedStatus === "Approved" || normalizedStatus === "Rejected" ? normalizedStatus : "Pending")) as "Pending" | "Approved" | "Rejected",
            method,
            proofImage: item.screenshot || item.proof_image || item.proofImage || item.image || item.receipt || "",
            remark: override?.remark ?? (item.remark || item.notes || ""),
            createdAt: item.createdAt || item.created_at || item.date || new Date().toISOString(),
            memberOfAdminId: item.member_of_admin_id || item.memberOfAdminId || "",
            referralId: item.referral_id || item.referralId || item.referral_code || "",
            staffId: item.staff_id || item.staffId || item.referred_by || "",
            adminId: item.admin_id || item.adminId || "",
          };
        });

        // Deduplicate & Merge DB items with DEFAULT_DEPOSITS
        const seenIds = new Set<string>();
        const combined: DepositRequest[] = [];

        mappedDb.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            combined.push(item);
          }
        });

        DEFAULT_DEPOSITS.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            const override = localOverrides[item.id];
            combined.push(override ? { ...item, status: override.status as any, remark: override.remark ?? item.remark } : item);
          }
        });

        combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        console.log(`[FINANCIAL] Loaded ${combined.length} deposit requests`);
        return combined;
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
    queryFn: async (): Promise<WithdrawalRequest[]> => {
      try {
        let dbRows: any[] = [];
        try {
          const res = await supabase.from("withdrawal_requests").select("*").limit(2000);
          if (res?.data && Array.isArray(res.data)) {
            dbRows = res.data;
          }
        } catch (e) {
          console.warn("[FINANCIAL] Error fetching withdrawal_requests:", e);
        }

        const localOverrides: Record<string, { status: string; remark?: string }> = (() => {
          try {
            return JSON.parse(localStorage.getItem("gcos_withdrawal_overrides") || "{}");
          } catch {
            return {};
          }
        })();

        const mappedDb: WithdrawalRequest[] = dbRows.map((item: any) => {
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
          const id = String(item.id || "");
          const override = localOverrides[id];

          return {
            id,
            resellerId: String(item.reseller_id || item.resellerId || item.resellerDocId || item.user_id || item.id || ""),
            resellerDocId: String(item.resellerDocId || item.reseller_doc_id || item.reseller_id || item.resellerId || item.user_id || item.id || ""),
            resellerName: String(item.reseller_name || item.resellerName || item.shop_name || item.name || "Reseller Store"),
            amount: Number(item.amount ?? item.total_amount ?? 0),
            status: (override?.status || (normalizedStatus === "Approved" || normalizedStatus === "Rejected" ? normalizedStatus : "Pending")) as "Pending" | "Approved" | "Rejected",
            method: item.method || (parsed ? "Bank Transfer" : "USDT (TRC20)"),
            bankInfo: parsed as any,
            usdtAddress: item.usdt_address || item.usdtAddress || (parsed?.usdtAddress as string) || "",
            remark: override?.remark ?? (item.remark || item.notes || (parsed?.rejectionRemark as string | undefined) || ""),
            createdAt: item.createdAt || item.created_at || item.date || new Date().toISOString(),
            memberOfAdminId: item.member_of_admin_id || item.memberOfAdminId || "",
            referralId: item.referral_id || item.referralId || item.referral_code || "",
            staffId: item.staff_id || item.staffId || item.referred_by || "",
            adminId: item.admin_id || item.adminId || "",
          };
        });

        // Deduplicate & Merge DB items with DEFAULT_WITHDRAWALS
        const seenIds = new Set<string>();
        const combined: WithdrawalRequest[] = [];

        mappedDb.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            combined.push(item);
          }
        });

        DEFAULT_WITHDRAWALS.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            const override = localOverrides[item.id];
            combined.push(override ? { ...item, status: override.status as any, remark: override.remark ?? item.remark } : item);
          }
        });

        combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        console.log(`[FINANCIAL] Loaded ${combined.length} withdrawal requests`);
        return combined;
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
      // 1. Save to local overrides for guaranteed UI responsiveness and persistence
      try {
        const overrides = JSON.parse(localStorage.getItem("gcos_deposit_overrides") || "{}");
        overrides[id] = { status, remark };
        localStorage.setItem("gcos_deposit_overrides", JSON.stringify(overrides));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }

      // 2. Also try updating Supabase table
      try {
        const updates: Record<string, unknown> = { status };
        if (remark !== undefined) updates.remark = remark.trim() || null;
        await supabase
          .from("deposit_requests")
          .update(updates)
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase update error (seed item or offline):", err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });
      toast.success("Deposit status updated");
    }
  });

  const updateWithdrawalStatus = useMutation({
    mutationFn: async ({ id, status, remark }: { id: string; status: string; remark?: string }) => {
      // 1. Save to local overrides for guaranteed UI responsiveness and persistence
      try {
        const overrides = JSON.parse(localStorage.getItem("gcos_withdrawal_overrides") || "{}");
        overrides[id] = { status, remark };
        localStorage.setItem("gcos_withdrawal_overrides", JSON.stringify(overrides));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }

      // 2. Also try updating Supabase table
      try {
        const updates: Record<string, unknown> = { status };
        if (remark !== undefined) updates.remark = remark.trim() || null;
        await supabase
          .from("withdrawal_requests")
          .update(updates)
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase update error (seed item or offline):", err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      toast.success("Withdrawal status updated");
    }
  });

  return { updateDepositStatus, updateWithdrawalStatus };
}
