import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
        let { data, error } = await supabase
          .from("deposit_requests")
          .select("*");
        
        if (error) throw error;
        
        const sorted = (data || []).sort((a: any, b: any) => {
          const tA = new Date(a.createdAt || a.created_at || 0).getTime();
          const tB = new Date(b.createdAt || b.created_at || 0).getTime();
          return tB - tA;
        });

        return sorted.map((item: any) => {
          let method = item.method;
          if (!method) {
            const rem = (item.remark || "").toLowerCase();
            if (rem.includes("card") || rem.includes("onramper") || rem.includes("visa") || rem.includes("mastercard")) {
              method = "Credit/Debit Card (Onramper)";
            } else if (rem.includes("bank") || rem.includes("wire")) {
              method = "Bank Transfer";
            } else {
              method = "USDT (TRC20)";
            }
          }
          return {
            ...item,
            method,
            proofImage: item.screenshot || item.proofImage || "",
            createdAt: item.createdAt || item.created_at || new Date().toISOString()
          };
        }) as DepositRequest[];
      } catch (error) {
        console.error("Error fetching deposit requests:", error);
        return [];
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
        const { data, error } = await supabase
          .from("withdrawal_requests")
          .select("*");
        
        if (error) throw error;
        
        const sorted = (data || []).sort((a: any, b: any) => {
          const tA = new Date(a.createdAt || a.created_at || 0).getTime();
          const tB = new Date(b.createdAt || b.created_at || 0).getTime();
          return tB - tA;
        });

        return sorted.map((item: any) => {
          let parsed: Record<string, unknown> | undefined;
          try {
            parsed = item.account_info ? (typeof item.account_info === 'string' ? JSON.parse(item.account_info) : item.account_info) : undefined;
          } catch {
            parsed = undefined;
          }
          return {
            ...item,
            bankInfo: parsed,
            remark: item.remark ?? (parsed?.rejectionRemark as string | undefined),
            createdAt: item.createdAt || item.created_at || new Date().toISOString(),
          };
        }) as WithdrawalRequest[];
      } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        return [];
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
