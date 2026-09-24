import { useState, useMemo, useEffect } from "react";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { useAdminAuth } from "@/lib/admin-auth-context-hooks";
import { useUnifiedResellers } from "@/lib/unified-hooks";
import { supabase } from "@/lib/supabase";
import { parseSettingValue, serializeSettingValue, type DepositConfig } from "@/lib/system-settings";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal, Search, Eye, CheckCircle, XCircle,
  Filter, ChevronLeft, ChevronRight, Download, Landmark, Bitcoin, CreditCard, Settings, QrCode, Sparkles, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

import { useDepositRequests, useFinancialMutations, DepositRequest } from "@/hooks/use-financial-requests";

const PAGE_SIZE = 10;

export default function ARSDepositPage() {
  const { session } = useAdminAuth();
  const { toast } = useToast();
  const resellers = useUnifiedResellers();
  const { canSeeAll, allowedReferralIds, allowedAdminIds, allowedStaffIds, allowedStaffDocIds } = useAdminAccess();
  const { data: requests = [], isLoading, isError, error, refetch } = useDepositRequests();
  const { updateDepositStatus } = useFinancialMutations();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewRequest, setViewRequest] = useState<DepositRequest | null>(null);
  const [rejectRequest, setRejectRequest] = useState<DepositRequest | null>(null);
  const [rejectRemark, setRejectRemark] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [usdtAddress, setUsdtAddress] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch Deposit Settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session) return;
      try {
        const configKey = session.role === "Owner" ? "deposit_config" : `deposit_config_${session.accountId || session.uid}`;
        const { data } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", configKey)
          .maybeSingle();

        let config = parseSettingValue<DepositConfig>(data?.value);

        if (!config && session.role !== "Owner") {
          // Fallback to global config
          const { data: globalData } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "deposit_config")
            .maybeSingle();
          config = parseSettingValue<DepositConfig>(globalData?.value);
        }

        if (config) {
          setUsdtAddress(config.usdtAddress || "");
          setQrCodeUrl(config.qrCodeUrl || "");
        }
      } catch (error) {
        console.error("Error fetching deposit settings:", error);
      }
    };
    fetchSettings();
  }, [session]);

  const handleSaveSettings = async () => {
    if (!session) return;
    setSavingSettings(true);
    try {
      const configKey = session.role === "Owner" ? "deposit_config" : `deposit_config_${session.accountId || session.uid}`;
      // `value` is a text column, so the config object must be serialized.
      const { error } = await supabase.from("system_settings").upsert(
        {
          key: configKey,
          value: serializeSettingValue({
            usdtAddress,
            qrCodeUrl,
            updatedAt: new Date().toISOString(),
            updatedBy: session.role,
          }),
        },
        { onConflict: "key" },
      );
      if (error) throw error;
      toast({ title: "Settings Saved", description: "Deposit configuration updated successfully." });
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving deposit settings:", error);
      const message = error instanceof Error ? error.message : "Failed to save settings.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  /* ─── Filtering ─── */
  const filtered = useMemo(() => {
    let list = requests.filter((r) => {
      if (canSeeAll) return true;
      
      const reseller = resellers.find(res => res.id === r.resellerDocId);
      
      const referralId = r.referralId || reseller?.referralId;
      const memberOfAdminId = r.memberOfAdminId || reseller?.memberOfAdminId;
      const referredBy = reseller?.referredBy;

      if ((referralId && allowedReferralIds.includes(referralId)) ||
          (memberOfAdminId && allowedAdminIds.includes(memberOfAdminId)) ||
          (referredBy && (allowedStaffIds.includes(String(referredBy)) || allowedStaffDocIds.includes(String(referredBy))))) {
        return true;
      }
      
      return false;
    });

    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => {
          const reseller = resellers.find(res => res.id === r.resellerDocId);
          return (r.resellerId?.toLowerCase().includes(q) || false) ||
                 (r.resellerName?.toLowerCase().includes(q) || false) ||
                 (r.referralId?.toLowerCase().includes(q) || false) ||
                 (r.staffId?.toLowerCase().includes(q) || false) ||
                 (r.method?.toLowerCase().includes(q) || false) ||
                 (r.remark?.toLowerCase().includes(q) || false) ||
                 r.amount.toString().includes(q) ||
                 (reseller && (
                   (reseller.shopName?.toLowerCase().includes(q) || false) ||
                   (reseller.resellerId?.toString().includes(q) || false)
                 ));
        }
      );
    }
    return list;
  }, [requests, search, statusFilter, canSeeAll, allowedReferralIds, allowedAdminIds, allowedStaffIds, allowedStaffDocIds, resellers]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="text-destructive font-semibold">Error loading deposit requests</div>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {error instanceof Error ? error.message : "You might not have sufficient permissions to view this data."}
        </p>
        <Button onClick={() => refetch()}>Retry Loading</Button>
      </div>
    );
  }

  /* ─── Actions ─── */

  const handleApprove = async (req: DepositRequest) => {
    if (processingId) return;
    if (!req.resellerDocId) {
      toast({ title: "Error", description: "Missing reseller document ID.", variant: "destructive" });
      return;
    }
    if (req.status !== "Pending") {
      toast({ title: "Already Processed", description: "This deposit request is no longer pending." });
      return;
    }
    setProcessingId(req.id);
    try {
      // 1. Update the deposit request status in Supabase
      await updateDepositStatus.mutateAsync({ id: req.id, status: "Approved" });
      
      // 2. Fetch fresh reseller profile from Supabase to prevent stale balance overwrites
      const { data: currentReseller, error: fetchErr } = await supabase
        .from('reseller_profiles')
        .select('balance, total_deposits, total_withdrawals, level, registration_date, created_at')
        .eq('id', req.resellerDocId)
        .single();

      if (fetchErr || !currentReseller) {
        throw new Error("Could not fetch current reseller balance.");
      }

      const newTotalDeposits = (currentReseller.total_deposits || 0) + req.amount;
      const newBalance = (currentReseller.balance || 0) + req.amount;

      // Calculate and update VIP level and product limit with registration date check
      const { calculateVipLevel, getVipLabel, getVipProductLimit } = await import("@/lib/vip-utils");
      
      const regDate = currentReseller.registration_date || (currentReseller as any).created_at;
      const totalWithdrawals = currentReseller.total_withdrawals || 0;
      const netDeposits = newTotalDeposits - totalWithdrawals;
      const currentLevel = typeof currentReseller.level === 'string' 
        ? Number(currentReseller.level.replace('VIP-', '')) 
        : Number(currentReseller.level || 0);

      const newLevel = calculateVipLevel(netDeposits, currentLevel, regDate);
      const newLimit = getVipProductLimit(newLevel, regDate);
      const levelLabel = getVipLabel(newLevel);

      await supabase.from('reseller_profiles').update({
        total_deposits: newTotalDeposits,
        balance: newBalance,
        level: levelLabel,
        updated_at: new Date().toISOString()
      }).eq('id', req.resellerDocId);

      await supabase.from('retail_shops').upsert({
        id: req.resellerDocId,
        level: levelLabel,
        product_limit: newLimit
      }, { onConflict: 'id' });

      // 3. Send real-time notification to the reseller
      try {
        await supabase.from('reseller_notifications').insert({
          reseller_id: req.resellerDocId,
          title: "Deposit Approved & Balance Updated",
          content: `Your deposit of $${req.amount.toLocaleString()} has been approved! $${req.amount.toLocaleString()} has been credited to your balance. Your new balance is $${newBalance.toLocaleString()} (Shop Level: ${levelLabel}).`,
          type: "deposit_approved",
          read: false,
        });
      } catch (notifErr) {
        console.warn("Failed to create reseller notification record:", notifErr);
      }

      toast({ 
        title: "Deposit Approved", 
        description: `The amount of $${req.amount.toLocaleString()} has been added. Reseller is now ${levelLabel} with a ${newLimit} product limit.` 
      });
    } catch (e) {
      console.error("Error approving deposit:", e);
      toast({ title: "Error", description: "Failed to process deposit approval.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectRequest || processingId) return;
    if (rejectRequest.status !== "Pending") {
      toast({ title: "Already Processed", description: "This deposit request is no longer pending." });
      return;
    }
    setProcessingId(rejectRequest.id);
    try {
      await updateDepositStatus.mutateAsync({ 
        id: rejectRequest.id, 
        status: "Rejected", 
        remark: rejectRemark 
      });

      // Send rejection notification to the reseller
      if (rejectRequest.resellerDocId) {
        try {
          await supabase.from('reseller_notifications').insert({
            reseller_id: rejectRequest.resellerDocId,
            title: "Deposit Request Rejected",
            content: `Your deposit request of $${rejectRequest.amount.toLocaleString()} was not approved.${rejectRemark ? ` Reason: ${rejectRemark}` : ''}`,
            type: "deposit_rejected",
            read: false,
          });
        } catch (notifErr) {
          console.warn("Failed to create rejection notification record:", notifErr);
        }
      }

      toast({ title: "Deposit Rejected", description: "The request has been marked as rejected." });
      setRejectRequest(null);
      setRejectRemark("");
    } catch (e) {
      console.error("Error rejecting deposit:", e);
      toast({ title: "Error", description: "Failed to reject request.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">ARS Management &gt; Deposit Requests</p>
          <h1 className="text-2xl font-bold text-foreground">Deposit Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and process reseller deposit requests. Verify payment proofs before approval.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-4 w-4" />
          Payment Settings
        </Button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Reseller ID, Name, Referral or Staff..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[170px] bg-background">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Reseller ID</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Reseller Name</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Method</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-right">Deposit Amount</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
              <TableHead className="w-10 text-xs font-bold uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No deposit requests found.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/10 transition-colors">
                  {/* Join to find reseller for extra info */}
                  {(() => {
                    const reseller = resellers.find(r => r.id === req.resellerDocId);
                    return (
                      <>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {format(new Date(req.createdAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#009000]">
                          {req.resellerId || (reseller ? `GRS${reseller.resellerId}` : "Unknown")}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {req.resellerName || (reseller ? `${reseller.firstName} ${reseller.lastName}` : "Unknown")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs">
                            {req.method?.toLowerCase().includes("card") || req.remark?.toLowerCase().includes("card") || req.remark?.toLowerCase().includes("onramper") ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 gap-1.5 py-0.5 font-medium">
                                <CreditCard className="h-3 w-3 text-blue-500" />
                                Card (Onramper)
                              </Badge>
                            ) : req.method === "Bank Transfer" ? (
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 gap-1.5 py-0.5 font-medium">
                                <Landmark className="h-3 w-3 text-purple-500" />
                                Bank Transfer
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1.5 py-0.5 font-medium">
                                <Bitcoin className="h-3 w-3 text-amber-500" />
                                USDT (TRC20)
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    ${req.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={req.status === "Approved" ? "default" : req.status === "Rejected" ? "destructive" : "outline"}
                      className={req.status === "Approved" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setViewRequest(req)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {req.status === "Pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(req)} className="text-emerald-600">
                              <CheckCircle className="h-4 w-4 mr-2" /> Accept Deposit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRejectRequest(req)} className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" /> Request Rejected
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                      </>
                    );
                  })()}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} requests total</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={(o) => !o && setViewRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deposit Details — {viewRequest?.resellerName}</DialogTitle>
            <DialogDescription>Review the payment screenshot and transaction details.</DialogDescription>
          </DialogHeader>
          {viewRequest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="rounded-lg border border-border p-4 bg-muted/30 space-y-3">
                  <h3 className="font-semibold text-sm border-b border-border pb-2">Request Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-lg text-primary">${viewRequest.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">{viewRequest.method}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Payment Information</h3>
                  {viewRequest.method === "Bank Transfer" && viewRequest.bankInfo && (
                    <div className="space-y-2 text-sm p-4 rounded-lg border border-border bg-card">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank Name:</span>
                        <span className="font-medium">{viewRequest.bankInfo.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Name:</span>
                        <span className="font-medium">{viewRequest.bankInfo.accountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Number:</span>
                        <span className="font-mono">{viewRequest.bankInfo.accountNumber}</span>
                      </div>
                    </div>
                  )}
                  {viewRequest.method === "USDT (TRC20)" && (
                    <div className="space-y-2 text-sm p-4 rounded-lg border border-border bg-card">
                      <div className="text-muted-foreground mb-1">USDT TRC20 Address:</div>
                      <div className="font-mono text-xs bg-muted p-2 rounded break-all select-all">
                        {viewRequest.usdtAddress}
                      </div>
                    </div>
                  )}
                  {viewRequest.remark && (
                    <div className="space-y-1.5 text-sm p-4 rounded-lg border border-border bg-card">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                        <span>Transaction Details / Remark:</span>
                      </div>
                      <div className="font-mono text-xs bg-muted/60 p-2.5 rounded-lg border border-border text-foreground break-all select-all">
                        {viewRequest.remark}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Reseller ID:</span>
                    <span className="font-mono">{viewRequest.resellerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff Name:</span>
                    <span className="font-medium">{viewRequest.staffId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin ID:</span>
                    <span className="font-mono">{viewRequest.adminId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date Requested:</span>
                    <span>{format(new Date(viewRequest.createdAt), "yyyy-MM-dd HH:mm")}</span>
                  </div>
                </div>
                
                {viewRequest.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                      disabled={!!processingId}
                      onClick={() => { handleApprove(viewRequest); setViewRequest(null); }}
                    >
                      Accept Deposit
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1" 
                      disabled={!!processingId}
                      onClick={() => { setRejectRequest(viewRequest); setViewRequest(null); }}
                    >
                      Request Rejected
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Payment Proof Screenshot</h3>
                <div className="aspect-[3/4] rounded-lg border border-border overflow-hidden bg-muted/40 flex items-center justify-center p-4">
                  {viewRequest.proofImage ? (
                    <img 
                      src={viewRequest.proofImage} 
                      alt="Payment Proof" 
                      className="max-w-full max-h-full object-contain rounded-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 text-muted-foreground">
                      <CreditCard className="h-10 w-10 text-primary/40" />
                      <div className="text-xs font-semibold text-foreground">Direct Card Gateway Deposit</div>
                      <p className="text-[11px] leading-relaxed max-w-[200px]">
                        Processed directly via Onramper widget. Admin verifies received crypto on merchant wallet before approval.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectRequest} onOpenChange={(o) => !o && setRejectRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit Request</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this deposit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Remark</label>
              <Textarea 
                placeholder="e.g., Screenshot is blurry, Transaction ID mismatch..." 
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={!!processingId} onClick={() => setRejectRequest(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectRemark.trim() || !!processingId}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Deposit Payment Settings
            </DialogTitle>
            <DialogDescription>
              Configure the USDT address and QR code shown to resellers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usdt-address">USDT TRC20 Address</Label>
              <div className="relative">
                <Bitcoin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="usdt-address"
                  placeholder="Enter USDT TRC20 Wallet Address"
                  className="pl-9"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">This address will be visible to all resellers in their deposit section.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-url">Custom QR Code URL (Optional)</Label>
              <div className="relative">
                <QrCode className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="qr-url"
                  placeholder="https://example.com/qr-code.png"
                  className="pl-9"
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">If left empty, a QR code will be auto-generated from the USDT address.</p>
            </div>

            {usdtAddress && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Preview QR Code</span>
                <div className="bg-white p-2 rounded-lg border border-border">
                  <img 
                    src={qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${usdtAddress}`}
                    alt="QR Preview"
                    className="h-32 w-32 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveSettings} 
              disabled={savingSettings || !usdtAddress.trim()}
              className="gap-2"
            >
              {savingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
