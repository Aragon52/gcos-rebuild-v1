import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, Search,
  DollarSign, TrendingUp, TrendingDown, CreditCard, Eye,
  ChevronDown, Filter, BarChart3, Package, Trash2, Edit2, Save, X,
  Plus, Minus, Gift, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { LEVEL_PROFIT_MAP } from "@/lib/reseller-context-hooks";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { calculateVipLevel, getVipLabel, getVipMarginProfit, getVipProductLimit } from "@/lib/vip-utils";
import { useUnifiedResellers } from "@/lib/unified-hooks";

const VIP_LABELS = ["VIP-0", "VIP-1", "VIP-2", "VIP-3", "VIP-4", "VIP-5"];

const MANUAL_DEPOSIT_REMARK = "Direct deposit request via Customer Care Service";

interface ResellerFinancial {
  id: string;
  resellerId: number;
  name: string;
  level: number;
  vipLabel: string;
  availableBalance: number;
  pendingBalance: number;
  unpickedAmount: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalEarnings: number;
  totalOrders: number;
  profitMargin: number;
  withdrawalInfo: {
    usdtAddress?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };
  lastActivity: string;
}

export default function ARSPaymentInfoPage() {
  const { canSeeAll, hasAccessToReseller } = useAdminAccess();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<ResellerFinancial | null>(null);
  const [resellerToDelete, setResellerToDelete] = useState<ResellerFinancial | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    level: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalEarnings: 0,
    usdtAddress: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  
  const [adjustmentMode, setAdjustmentMode] = useState<'none' | 'add' | 'sub'>('none');
  const [adjustmentAmount, setAdjustmentAmount] = useState("");

  // Quick Bonus Top-up States
  const [bonusInputs, setBonusInputs] = useState<Record<string, string>>({});
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [modalResellerId, setModalResellerId] = useState("");
  const [modalBonusAmount, setModalBonusAmount] = useState("");
  const [modalRemark, setModalRemark] = useState("");
  const [detailBonusAmount, setDetailBonusAmount] = useState("");
  const [detailBonusRemark, setDetailBonusRemark] = useState("");
  
  const queryClient = useQueryClient();
  const unifiedResellers = useUnifiedResellers();

  const grantBonusMutation = useMutation({
    mutationFn: async ({ resellerId, resellerName, resellerNumId, amount, remark }: {
      resellerId: string;
      resellerName: string;
      resellerNumId?: number;
      amount: number;
      remark?: string;
    }) => {
      if (!amount || amount <= 0) {
        throw new Error("Please enter a valid bonus amount greater than $0.");
      }

      // Fetch existing profile to get current balance and total deposits
      const { data: profile, error: fetchErr } = await supabase
        .from('reseller_profiles')
        .select('balance, total_deposits')
        .eq('id', resellerId)
        .single();

      if (fetchErr && fetchErr.code !== 'PGRST116') {
        throw fetchErr;
      }

      const currentBalance = Number(profile?.balance || 0);
      const currentDeposits = Number(profile?.total_deposits || 0);
      const newBalance = Number((currentBalance + amount).toFixed(2));
      const newDeposits = Number((currentDeposits + amount).toFixed(2));

      // Update reseller profile balance and deposits
      const { error: updateErr } = await supabase
        .from('reseller_profiles')
        .update({
          balance: newBalance,
          total_deposits: newDeposits,
          updated_at: new Date().toISOString()
        })
        .eq('id', resellerId);

      if (updateErr) throw updateErr;

      // Log a record in deposit_requests table for tracking
      try {
        await supabase.from('deposit_requests').insert({
          resellerId: resellerId,
          resellerDocId: resellerId,
          resellerName: resellerName,
          amount: amount,
          status: 'Approved',
          method: 'Bonus Match',
          proofImage: 'bonus_topup',
          remark: remark || `Deposit Match Bonus ($${amount})`,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Notice: Failed to insert deposit_requests audit log:", err);
      }

      return { resellerName, amount, newBalance };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });
      toast.success(`🎁 Granted $${data.amount.toFixed(2)} deposit bonus to ${data.resellerName}! New Balance: $${data.newBalance.toFixed(2)}`);
      setShowBonusModal(false);
      setModalBonusAmount("");
      setModalRemark("");
      setModalResellerId("");
      setDetailBonusAmount("");
      setDetailBonusRemark("");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to grant bonus";
      toast.error(msg);
    }
  });

  const deleteResellerMutation = useMutation({
    mutationFn: async (resellerId: string) => {
      // In Supabase, we delete the profile. We might also need to delete the shop.
      const { error: profileError } = await supabase.from('reseller_profiles').delete().eq('id', resellerId);
      if (profileError) throw profileError;

      const { error: shopError } = await supabase.from('retail_shops').delete().eq('id', resellerId);
      if (shopError) throw shopError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      toast.success("Reseller profile deleted successfully");
      setResellerToDelete(null);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "An error occurred";
      toast.error(`Error deleting reseller: ${message}`);
      setResellerToDelete(null);
    },
  });

  const updateResellerMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Record<string, unknown>; balanceDelta?: number }) => {
      const profileUpdates: Record<string, unknown> = {};
      const shopUpdates: Record<string, unknown> = {};

      if (data.updates.balance !== undefined) profileUpdates.balance = data.updates.balance;
      if (data.updates.pending_balance !== undefined) profileUpdates.pending_balance = data.updates.pending_balance;
      if (data.updates.total_deposits !== undefined) profileUpdates.total_deposits = data.updates.total_deposits;
      if (data.updates.total_withdrawals !== undefined) profileUpdates.total_withdrawals = data.updates.total_withdrawals;
      if (data.updates.total_earnings !== undefined) profileUpdates.total_earnings = data.updates.total_earnings;
      
      if (data.updates.usdtAddress !== undefined || data.updates.bankInfo !== undefined) {
        try {
          const { data: existing } = await supabase.from('reseller_profiles').select('payment_method').eq('id', data.id).single();
          let custom: Record<string, unknown> = {};
          if (existing?.payment_method) {
            try { custom = JSON.parse(existing.payment_method); } catch(e){ /* ignore */ }
          }
          if (data.updates.usdtAddress !== undefined) custom.usdtAddress = data.updates.usdtAddress;
          if (data.updates.bankInfo !== undefined) custom.bankInfo = data.updates.bankInfo;
          profileUpdates.payment_method = JSON.stringify(custom);
        } catch (e) {
          console.error("Error fetching payment_method:", e);
        }
      }

      let finalLevelToSet = data.updates.level as number | undefined;

      // Auto-calculate VIP level if deposits or withdrawals change
      if (data.updates.total_deposits !== undefined || data.updates.total_withdrawals !== undefined) {
        try {
          const { data: existing } = await supabase.from('reseller_profiles').select('total_deposits, total_withdrawals, level').eq('id', data.id).single();
          if (existing) {
            const finalDep = data.updates.total_deposits !== undefined ? Number(data.updates.total_deposits) : Number(existing.total_deposits || 0);
            const finalWith = data.updates.total_withdrawals !== undefined ? Number(data.updates.total_withdrawals) : Number(existing.total_withdrawals || 0);
            const netDeposits = finalDep - finalWith;
            const existingLevelNum = Number(String(existing.level || '0').match(/\d+/)?.[0] || '0');
            const calculatedLevel = calculateVipLevel(netDeposits, existingLevelNum);
            
            // Override passed level if calculated level is higher
            if (finalLevelToSet === undefined || calculatedLevel > finalLevelToSet) {
              finalLevelToSet = calculatedLevel;
            }
          }
        } catch (e) {
          console.error("Error calculating VIP level:", e);
        }
      }

      if (finalLevelToSet !== undefined) {
        profileUpdates.level = `VIP-${finalLevelToSet}`;
        shopUpdates.level = `VIP-${finalLevelToSet}`;
        shopUpdates.product_limit = getVipProductLimit(finalLevelToSet);
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase.from('reseller_profiles').update({
          ...profileUpdates,
          updated_at: new Date().toISOString()
        }).eq('id', data.id);
        if (error) throw error;
      }

      // Record a manual balance top-up as an approved deposit for traceability
      const delta = Number(data.balanceDelta || 0);
      if (delta > 0) {
        const { error: depositError } = await supabase.from('deposit_requests').insert({
          resellerDocId: data.id,
          amount: Number(delta.toFixed(2)),
          status: 'Approved',
          remark: MANUAL_DEPOSIT_REMARK,
          createdAt: new Date().toISOString(),
        });
        if (depositError) {
          console.error("Failed to record manual deposit:", depositError);
        }
      }

      
      if (Object.keys(shopUpdates).length > 0) {
        const { error } = await supabase.from('retail_shops').upsert({
          id: data.id,
          ...shopUpdates
        }, { onConflict: 'id' });
        if (error) throw error;
      }
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });
      const delta = Number(variables.balanceDelta || 0);
      if (delta > 0) {
        toast.success(`Reseller financial data updated. ${fmt(delta)} recorded as a direct deposit.`);
      } else {
        toast.success("Reseller financial data updated");
      }
      setIsEditing(false);
    },
    onError: (e: unknown) => {
      console.error("DEBUG: Update Reseller Error:", e);
      const message = e instanceof Error ? e.message : "An error occurred";
      toast.error(`Error updating reseller: ${message}`);
    },
  });

  const filteredResellers = useMemo(() => {
    if (canSeeAll) return unifiedResellers;
    
    return unifiedResellers.filter((r) => hasAccessToReseller(r));
  }, [unifiedResellers, canSeeAll, hasAccessToReseller]);

  // Build financial data from filtered resellers
  const financialData: ResellerFinancial[] = useMemo(() => {
    return filteredResellers.map((r) => {
      const resellerId = r.id;
      
      const unpickedAmount = r.unpickedBalance || 0;
      const totalDeposits = r.totalDeposits || 0;
      const availableBalance = r.balance || 0;
      const pendingBalance = r.pendingBalance || 0;
      const totalWithdrawals = r.totalWithdrawals || 0;
      const totalEarnings = r.totalEarnings || 0;
      const totalOrders = r.totalOrders || 0;

      // Use the actual stored level, do not calculate it automatically on the fly to avoid mismatch
      // with other pages like Retail Shops.
      const storedLevel = Number(String(r.level).match(/\d+/)?.[0] || '0');
      const finalLevel = storedLevel;

      return {
        id: resellerId,
        resellerId: r.resellerId || 0,
        name: r.name || 'Unknown',
        level: finalLevel,
        vipLabel: getVipLabel(finalLevel),
        availableBalance,
        pendingBalance,
        unpickedAmount,
        totalDeposits,
        totalWithdrawals,
        totalEarnings,
        totalOrders,
        profitMargin: getVipMarginProfit(finalLevel) * 100,
        withdrawalInfo: {
          usdtAddress: r.usdtAddress,
          bankName: r.bankInfo?.bankName,
          accountName: r.bankInfo?.accountName,
          accountNumber: r.bankInfo?.accountNumber,
        }, 
        lastActivity: r.registrationDate || new Date().toISOString()
      };
    });
  }, [filteredResellers]);

  // Aggregated totals
  const totals = useMemo(() => {
    return financialData.reduce(
      (acc, r) => ({
        totalAvailable: acc.totalAvailable + r.availableBalance,
        totalPending: acc.totalPending + r.pendingBalance,
        totalUnpicked: acc.totalUnpicked + r.unpickedAmount,
        totalDeposits: acc.totalDeposits + r.totalDeposits,
        totalWithdrawals: acc.totalWithdrawals + r.totalWithdrawals,
        totalEarnings: acc.totalEarnings + r.totalEarnings,
      }),
      { totalAvailable: 0, totalPending: 0, totalUnpicked: 0, totalDeposits: 0, totalWithdrawals: 0, totalEarnings: 0 }
    );
  }, [financialData]);

  // Filter
  const filtered = useMemo(() => {
    return financialData.filter((r) => {
      const searchNormalized = search.toLowerCase().replace(/^(grs|gsr)-?/, "");
      const matchSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        String(r.resellerId).includes(searchNormalized) ||
        `grs${r.resellerId}`.includes(search.toLowerCase()) ||
        `gsr${r.resellerId}`.includes(search.toLowerCase());
      const matchLevel = levelFilter === "all" || r.level === Number(levelFilter);
      return matchSearch && matchLevel;
    });
  }, [financialData, search, levelFilter]);

  const handleEdit = () => {
    if (!selectedReseller) return;
    setEditForm({
      level: selectedReseller.level,
      availableBalance: selectedReseller.availableBalance,
      pendingBalance: selectedReseller.pendingBalance,
      totalDeposits: selectedReseller.totalDeposits,
      totalWithdrawals: selectedReseller.totalWithdrawals,
      totalEarnings: selectedReseller.totalEarnings,
      usdtAddress: selectedReseller.withdrawalInfo.usdtAddress || "",
      bankName: selectedReseller.withdrawalInfo.bankName || "",
      accountName: selectedReseller.withdrawalInfo.accountName || "",
      accountNumber: selectedReseller.withdrawalInfo.accountNumber || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedReseller) return;

    const balanceDelta = Number(
      (editForm.availableBalance - selectedReseller.availableBalance).toFixed(2)
    );

    updateResellerMutation.mutate({
      id: selectedReseller.id,
      balanceDelta,
      updates: {
        level: editForm.level,
        balance: editForm.availableBalance,
        pending_balance: editForm.pendingBalance,
        total_deposits: editForm.totalDeposits,
        total_withdrawals: editForm.totalWithdrawals,
        total_earnings: editForm.totalEarnings,
        usdtAddress: editForm.usdtAddress,
        bankInfo: {
          bankName: editForm.bankName,
          accountName: editForm.accountName,
          accountNumber: editForm.accountNumber,
        }
      }
    });
  };

  const handleApplyAdjustment = () => {
    const amount = Number(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const newBalance = adjustmentMode === 'add' 
      ? editForm.availableBalance + amount 
      : editForm.availableBalance - amount;
      
    setEditForm(prev => ({ ...prev, availableBalance: newBalance }));
    setAdjustmentMode('none');
    setAdjustmentAmount("");
    toast.success(`Balance ${adjustmentMode === 'add' ? 'increased' : 'decreased'} by ${fmt(amount)}`);
  };

  const handleBulkSyncBalances = async () => {
    if (!window.confirm("Are you sure you want to recalculate and sync pending/unpicked balances for ALL resellers based on their actual orders? This may take a minute.")) return;
    
    setIsSyncing(true);
    toast.success("Starting background sync...");
    try {
      // 1. Fetch all orders
      const { data: orders, error: ordersError } = await supabase.from('orders').select('*');
      if (ordersError) throw ordersError;
      
      const idMap: Record<string, string> = {};
      const numericToUid: Record<string, string> = {};
      const resellerSums: Record<string, { sumUnpicked: number; sumPending: number }> = {};
      
      // 2. Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase.from('reseller_profiles').select('*');
      if (profilesError) throw profilesError;

      profiles.forEach((r) => {
        const uid = r.id;
        idMap[uid.toLowerCase()] = uid;
        
        if (r.reseller_id) {
          const numIdRaw = String(r.reseller_id);
          const numOnly = numIdRaw.replace(/\D/g, "");
          if (numOnly) {
            numericToUid[numOnly] = uid;
            idMap[numOnly] = uid;
            idMap[`grs${numOnly}`] = uid;
            idMap[`grs-${numOnly}`] = uid;
            idMap[`gsr${numOnly}`] = uid;
            idMap[`gsr-${numOnly}`] = uid;
          }
          idMap[numIdRaw.toLowerCase()] = uid;
          idMap[numIdRaw.toLowerCase().replace("-", "")] = uid;
        }
        resellerSums[uid] = { sumUnpicked: 0, sumPending: 0 };
      });
      
      let orphanedCount = 0;
      const orphanedIds = new Set<string>();

      orders.forEach((order) => {
        const originalRId = String(order.reseller_id || "").trim();
        if (!originalRId) return;

        let rId = idMap[originalRId.toLowerCase()] || idMap[originalRId.toLowerCase().replace("-", "")] || null;
        
        if (!rId) {
          const digits = originalRId.replace(/\D/g, "");
          if (digits && numericToUid[digits]) {
            rId = numericToUid[digits];
          }
        }

        if (!rId) {
          orphanedCount++;
          orphanedIds.add(originalRId);
          return;
        }
        
        const total = Number(order.total_amount || 0);
        const status = (order.status || "Pending").toLowerCase();
        
        if (status === "pending" || status === "processing") {
           resellerSums[rId].sumUnpicked += total;
        } else if (status === "ongoing" || status === "shipped") {
           resellerSums[rId].sumPending += total;
        }
      });
      
      if (orphanedCount > 0) {
        console.warn(`[SYNC] Found ${orphanedCount} orders with unmapped resellers:`, Array.from(orphanedIds));
      }

      const promises = Object.entries(resellerSums).map(([uid, sums]) => {
         return supabase.from('reseller_profiles').update({
           unpicked_balance: Math.max(0, Number(sums.sumUnpicked.toFixed(2))),
           pending_balance: Math.max(0, Number(sums.sumPending.toFixed(2)))
         }).eq('id', uid);
      });
      
      await Promise.all(promises);
      
      toast.success(`Successfully synced balances for ${Object.keys(resellerSums).length} resellers.${orphanedCount > 0 ? ` (${orphanedCount} orders orphaned)` : ""}`);
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
    } catch (error) {
       console.error("Error syncing balances:", error);
       toast.error("Failed to sync balances");
    } finally {
       setIsSyncing(false);
    }
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Info's & Balance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Financial overview for all registered resellers
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Badge variant="outline" className="text-xs gap-1">
            <BarChart3 className="h-3 w-3" />
            {financialData.length} Resellers
          </Badge>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs" 
            size="sm" 
            onClick={() => setShowBonusModal(true)}
          >
            <Gift className="h-4 w-4" />
            Grant Deposit Bonus
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkSyncBalances} disabled={isSyncing}>
            <TrendingUp className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : "text-primary"}`} />
            Sync All Balances
          </Button>
        </div>
      </div>
...
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <SummaryCard
          icon={Wallet}
          label="Total Available Balance"
          value={fmt(totals.totalAvailable)}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <SummaryCard
          icon={Clock}
          label="Total Pending Balance"
          value={fmt(totals.totalPending)}
          color="text-warning"
          bgColor="bg-warning/10"
        />
        <SummaryCard
          icon={Package}
          label="Total Unpicked"
          value={fmt(totals.totalUnpicked)}
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
        <SummaryCard
          icon={ArrowDownToLine}
          label="Total Deposits"
          value={fmt(totals.totalDeposits)}
          color="text-success"
          bgColor="bg-success/10"
        />
        <SummaryCard
          icon={ArrowUpFromLine}
          label="Total Withdrawal"
          value={fmt(totals.totalWithdrawals)}
          color="text-destructive"
          bgColor="bg-destructive/10"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Total Earnings"
          value={fmt(totals.totalEarnings)}
          color="text-primary"
          bgColor="bg-primary/10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or Reseller ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="VIP Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {VIP_LABELS.map((label, i) => (
              <SelectItem key={i} value={String(i)}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Reseller ID</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">VIP</TableHead>
                <TableHead className="text-xs text-right">Available</TableHead>
                <TableHead className="text-xs text-right">Pending</TableHead>
                <TableHead className="text-xs text-right">Unpicked</TableHead>
                <TableHead className="text-xs text-right">Deposits</TableHead>
                <TableHead className="text-xs text-right">Withdrawal</TableHead>
                <TableHead className="text-xs text-right">Earnings</TableHead>
                <TableHead className="text-xs text-right">Margin</TableHead>
                <TableHead className="text-xs text-center min-w-[210px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold">Bonus Top-Up ($)</TableHead>
                <TableHead className="text-xs text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12 text-muted-foreground">
                    {financialData.length === 0
                      ? "No resellers registered yet"
                      : "No results match your filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs text-primary">GRS{r.resellerId}</TableCell>
                    <TableCell className="font-medium text-sm">{r.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{r.vipLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      {fmt(r.availableBalance)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-warning">
                      {fmt(r.pendingBalance)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-orange-500 font-medium">
                      {fmt(r.unpickedAmount)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-success">
                      {fmt(r.totalDeposits)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-destructive">
                      {fmt(r.totalWithdrawals)}
                    </TableCell>
                    <TableCell className="text-right text-sm">{fmt(r.totalEarnings)}</TableCell>
                    <TableCell className="text-right text-sm">{r.profitMargin.toFixed(0)}%</TableCell>
                    <TableCell className="text-center min-w-[210px] bg-emerald-500/5 dark:bg-emerald-950/20 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="relative flex-1 max-w-[100px]">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">$</span>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Amount"
                            value={bonusInputs[r.id] || ""}
                            onChange={(e) => setBonusInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                            className="h-8 pl-5 pr-1 text-xs font-semibold bg-background"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1 shrink-0 shadow-xs"
                          disabled={grantBonusMutation.isPending}
                          onClick={() => {
                            const val = Number(bonusInputs[r.id]);
                            if (!val || val <= 0) {
                              toast.error("Please enter a valid bonus amount greater than $0");
                              return;
                            }
                            grantBonusMutation.mutate({
                              resellerId: r.id,
                              resellerName: r.name,
                              resellerNumId: r.resellerId,
                              amount: val,
                              remark: "Deposit Match Promotion Bonus"
                            });
                            setBonusInputs(prev => ({ ...prev, [r.id]: "" }));
                          }}
                        >
                          <Gift className="h-3.5 w-3.5" />
                          Topup
                        </Button>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[10, 20, 50, 100].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setBonusInputs(prev => ({ ...prev, [r.id]: String(preset) }))}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                          >
                            +${preset}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setSelectedReseller(r)}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          onClick={() => setResellerToDelete(r)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReseller} onOpenChange={(open) => {
        if (!open) {
          setSelectedReseller(null);
          setIsEditing(false);
          setAdjustmentMode('none');
          setAdjustmentAmount("");
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="flex flex-row items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Details — {selectedReseller?.name}
            </DialogTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleEdit}>
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={() => setIsEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button size="sm" className="h-8 gap-1.5" onClick={handleSave} disabled={updateResellerMutation.isPending}>
                  <Save className="h-3.5 w-3.5" />
                  {updateResellerMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </DialogHeader>
          {selectedReseller && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <InfoBlock label="Reseller ID" value={`GRS${selectedReseller.resellerId}`} />
                
                {isEditing ? (
                  <div className="rounded-lg bg-muted/20 border border-border p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">VIP Level</p>
                    <Select 
                      value={String(editForm.level)} 
                      onValueChange={(val) => setEditForm(prev => ({ ...prev, level: Number(val) }))}
                    >
                      <SelectTrigger className="h-7 text-sm mt-1 px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIP_LABELS.map((label, i) => (
                          <SelectItem key={i} value={String(i)}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <InfoBlock label="VIP Level" value={selectedReseller.vipLabel} />
                )}

                <EditableInfoBlock 
                  label="Available Balance" 
                  value={fmt(selectedReseller.availableBalance)} 
                  accent 
                  isEditing={isEditing}
                  inputValue={editForm.availableBalance}
                  onChange={(val) => setEditForm(prev => ({ ...prev, availableBalance: Number(val) }))}
                >
                  <div className="mt-2 flex flex-col gap-1.5">
                    {adjustmentMode === 'none' ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 flex-1 gap-1 text-[9px] uppercase font-bold border-primary/20 hover:bg-primary/5 text-primary"
                          onClick={() => setAdjustmentMode('add')}
                        >
                          <Plus className="h-2.5 w-2.5" /> Add
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 flex-1 gap-1 text-[9px] uppercase font-bold border-destructive/20 hover:bg-destructive/5 text-destructive"
                          onClick={() => setAdjustmentMode('sub')}
                        >
                          <Minus className="h-2.5 w-2.5" /> Sub
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 items-center bg-background/50 p-1 rounded-md border border-border">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                          className="h-6 text-[10px] flex-1 bg-background"
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          className="h-6 px-2 text-[9px] uppercase font-bold"
                          onClick={handleApplyAdjustment}
                        >
                          Save
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setAdjustmentMode('none');
                            setAdjustmentAmount("");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </EditableInfoBlock>
                <EditableInfoBlock 
                  label="Pending Balance" 
                  value={fmt(selectedReseller.pendingBalance)} 
                  isEditing={isEditing}
                  inputValue={editForm.pendingBalance}
                  onChange={(val) => setEditForm(prev => ({ ...prev, pendingBalance: Number(val) }))}
                />
                <InfoBlock label="Unpicked Amount" value={fmt(selectedReseller.unpickedAmount)} />
                <EditableInfoBlock 
                  label="Total Deposits" 
                  value={fmt(selectedReseller.totalDeposits)} 
                  isEditing={isEditing}
                  inputValue={editForm.totalDeposits}
                  onChange={(val) => setEditForm(prev => ({ ...prev, totalDeposits: Number(val) }))}
                />
                <EditableInfoBlock 
                  label="Total Withdrawals" 
                  value={fmt(selectedReseller.totalWithdrawals)} 
                  isEditing={isEditing}
                  inputValue={editForm.totalWithdrawals}
                  onChange={(val) => setEditForm(prev => ({ ...prev, totalWithdrawals: Number(val) }))}
                />
                <EditableInfoBlock 
                  label="Total Earnings" 
                  value={fmt(selectedReseller.totalEarnings)} 
                  isEditing={isEditing}
                  inputValue={editForm.totalEarnings}
                  onChange={(val) => setEditForm(prev => ({ ...prev, totalEarnings: Number(val) }))}
                />
                <InfoBlock label="Profit Margin" value={`${selectedReseller.profitMargin.toFixed(0)}%`} />
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Grant Deposit Match Bonus</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Auto-credited to balance</span>
                </div>
                
                <p className="text-[11px] text-muted-foreground">
                  Instantly credit a bonus reward for deposit matches ($10 to $100+).
                </p>

                <div className="flex gap-1.5">
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDetailBonusAmount(String(amt))}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                        detailBonusAmount === String(amt)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-background hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      +${amt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Bonus Amount"
                      value={detailBonusAmount}
                      onChange={(e) => setDetailBonusAmount(e.target.value)}
                      className="h-8 pl-6 text-xs bg-background"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5"
                    disabled={grantBonusMutation.isPending || !detailBonusAmount || Number(detailBonusAmount) <= 0}
                    onClick={() => {
                      grantBonusMutation.mutate({
                        resellerId: selectedReseller.id,
                        resellerName: selectedReseller.name,
                        resellerNumId: selectedReseller.resellerId,
                        amount: Number(detailBonusAmount),
                        remark: detailBonusRemark || "Deposit Match Promotion Bonus"
                      });
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Top Up Bonus
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Withdrawal Information
                </h4>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">USDT Address (TRC20)</label>
                      <Input 
                        value={editForm.usdtAddress} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, usdtAddress: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="TRC20 Address"
                      />
                    </div>
                    <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-2">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Bank Details</label>
                      <div className="space-y-1.5">
                        <Input 
                          value={editForm.bankName} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, bankName: e.target.value }))}
                          className="h-8 text-xs"
                          placeholder="Bank Name"
                        />
                        <Input 
                          value={editForm.accountName} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, accountName: e.target.value }))}
                          className="h-8 text-xs"
                          placeholder="Account Name"
                        />
                        <Input 
                          value={editForm.accountNumber} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className="h-8 text-xs"
                          placeholder="Account Number"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedReseller.withdrawalInfo.usdtAddress ? (
                      <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-1.5 mb-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs text-muted-foreground">USDT (TRC20)</span>
                        </div>
                        <p className="text-xs font-mono break-all text-foreground">
                          {selectedReseller.withdrawalInfo.usdtAddress}
                        </p>
                      </div>
                    ) : null}
                    
                    {selectedReseller.withdrawalInfo.bankName ? (
                      <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-1">
                        <p className="text-xs"><span className="text-muted-foreground">Bank:</span> {selectedReseller.withdrawalInfo.bankName}</p>
                        <p className="text-xs"><span className="text-muted-foreground">Account Name:</span> {selectedReseller.withdrawalInfo.accountName}</p>
                        <p className="text-xs"><span className="text-muted-foreground">Account #:</span> {selectedReseller.withdrawalInfo.accountNumber}</p>
                      </div>
                    ) : (
                      !selectedReseller.withdrawalInfo.usdtAddress && (
                        <p className="text-xs text-muted-foreground italic">
                          No withdrawal method configured
                        </p>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Topup Bonus Modal Dialog */}
      <Dialog open={showBonusModal} onOpenChange={setShowBonusModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Grant Deposit Match Bonus
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select a reseller and specify the bonus amount to reward for qualifying deposit requirements ($10 to $100+).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Select Reseller</label>
              <Select value={modalResellerId} onValueChange={setModalResellerId}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Choose a reseller..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {financialData.map((res) => (
                    <SelectItem key={res.id} value={res.id} className="text-xs">
                      GRS{res.resellerId} — {res.name} (Bal: {fmt(res.availableBalance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Quick Preset Bonus</label>
              <div className="flex gap-2">
                {[10, 20, 50, 100].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={modalBonusAmount === String(amt) ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 text-xs font-bold ${
                      modalBonusAmount === String(amt)
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                    }`}
                    onClick={() => setModalBonusAmount(String(amt))}
                  >
                    +${amt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Custom Bonus Amount ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 50"
                  value={modalBonusAmount}
                  onChange={(e) => setModalBonusAmount(e.target.value)}
                  className="pl-7 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reason / Promotion Remark (Optional)</label>
              <Input
                placeholder="e.g. $200+ Deposit Match Promotion Bonus"
                value={modalRemark}
                onChange={(e) => setModalRemark(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowBonusModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
              disabled={grantBonusMutation.isPending || !modalResellerId || !modalBonusAmount || Number(modalBonusAmount) <= 0}
              onClick={() => {
                const targetReseller = financialData.find(r => r.id === modalResellerId);
                if (!targetReseller) {
                  toast.error("Please select a reseller");
                  return;
                }
                grantBonusMutation.mutate({
                  resellerId: targetReseller.id,
                  resellerName: targetReseller.name,
                  resellerNumId: targetReseller.resellerId,
                  amount: Number(modalBonusAmount),
                  remark: modalRemark || "Deposit Match Promotion Bonus"
                });
              }}
            >
              <Sparkles className="h-4 w-4" />
              {grantBonusMutation.isPending ? "Crediting..." : "Grant & Credit Bonus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!resellerToDelete} onOpenChange={() => setResellerToDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Reseller</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{resellerToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResellerToDelete(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => resellerToDelete && deleteResellerMutation.mutate(resellerToDelete.id)}
              disabled={deleteResellerMutation.isPending}
            >
              {deleteResellerMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground tracking-tight">{value}</p>
    </div>
  );
}

function InfoBlock({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/20 border border-border p-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function EditableInfoBlock({ 
  label, 
  value, 
  accent, 
  isEditing, 
  inputValue,
  onChange,
  children
}: { 
  label: string; 
  value: string; 
  accent?: boolean;
  isEditing?: boolean;
  inputValue?: number;
  onChange?: (val: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted/20 border border-border p-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      {isEditing ? (
        <Input
          type="number"
          step="0.01"
          value={inputValue}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-7 text-sm mt-1 px-2"
        />
      ) : (
        <p className={`text-sm font-semibold mt-0.5 ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      )}
      {isEditing && children}
    </div>
  );
}
