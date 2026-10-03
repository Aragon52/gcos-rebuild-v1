import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Edit2,
  Eye,
  ShieldCheck,
  Search,
  Database,
  Users,
  Calendar,
  Layers,
  Wrench,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  runSupabaseDiagnostic,
  repairResellerBindings,
  updateDiagnosticRecord,
  deleteDiagnosticRecord,
  DEFAULT_DIAGNOSTIC_START,
  DEFAULT_DIAGNOSTIC_END,
  DiagnosticResult,
  DiagnosticRecord,
} from "@/lib/diagnostics";

interface DataDiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataDiagnosticsModal({ open, onOpenChange }: DataDiagnosticsModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [startDate, setStartDate] = useState(DEFAULT_DIAGNOSTIC_START);
  const [endDate, setEndDate] = useState(DEFAULT_DIAGNOSTIC_END);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Record View / Edit / Delete Modal state
  const [viewRecord, setViewRecord] = useState<DiagnosticRecord | null>(null);
  const [editRecord, setEditRecord] = useState<DiagnosticRecord | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [deleteRecord, setDeleteRecord] = useState<DiagnosticRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleRunAudit = async (autoFix = false) => {
    setLoading(true);
    try {
      const res = await runSupabaseDiagnostic({
        startDate,
        endDate,
        autoRepairBindings: autoFix,
      });
      setResult(res);
      if (autoFix && res.counts.repairedCount > 0) {
        toast({
          title: "Referral Bindings Repaired",
          description: `Successfully bound ${res.counts.repairedCount} reseller profiles to their referral admins.`,
        });
      } else {
        toast({
          title: "Diagnostic Completed",
          description: `Audit finished. ${res.recordsInRange.length} records found in range ${startDate} to ${endDate}.`,
        });
      }
    } catch (err: any) {
      console.error("Diagnostic error:", err);
      toast({
        title: "Diagnostic Failed",
        description: err.message || "Failed to execute diagnostic audit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !result) {
      handleRunAudit(false);
    }
  }, [open]);

  const handleManualRepair = async () => {
    setRepairing(true);
    try {
      const rep = await repairResellerBindings();
      toast({
        title: "Repair Executed",
        description: `Repaired ${rep.repaired} out of ${rep.total} reseller profile referral bindings.`,
      });
      await handleRunAudit(false);
    } catch (err: any) {
      toast({
        title: "Repair Error",
        description: err.message || "Failed to repair reseller bindings",
        variant: "destructive",
      });
    } finally {
      setRepairing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editRecord) return;
    setActionLoading(true);
    try {
      const updates: Record<string, any> = {};
      if (editRecord.table === "orders") {
        updates.status = editStatus;
        if (editAmount) updates.total_amount = editAmount;
      } else if (editRecord.table === "deposit_requests" || editRecord.table === "withdrawal_requests") {
        updates.status = editStatus;
        if (editAmount) updates.amount = editAmount;
      }

      const res = await updateDiagnosticRecord(editRecord.table, editRecord.id, updates);
      if (res.success) {
        toast({ title: "Record Updated", description: `Record ${editRecord.id} saved successfully.` });
        setEditRecord(null);
        await handleRunAudit(false);
      } else {
        toast({ title: "Update Failed", description: res.error, variant: "destructive" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExecute = async () => {
    if (!deleteRecord) return;
    setActionLoading(true);
    try {
      const res = await deleteDiagnosticRecord(deleteRecord.table, deleteRecord.id);
      if (res.success) {
        toast({ title: "Record Deleted", description: `Record ${deleteRecord.id} removed from database.` });
        setDeleteRecord(null);
        await handleRunAudit(false);
      } else {
        toast({ title: "Delete Failed", description: res.error, variant: "destructive" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRecords = (result?.recordsInRange || []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.table.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6 bg-background text-foreground">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    Database Retrieval & Referral Diagnostic Utility
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Audit Supabase table retrieval across date windows (May-21 to Sep-2) & verify reseller admin bindings.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Date Filter & Control Toolbar */}
          <div className="my-4 p-4 rounded-xl border bg-muted/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Date Range:</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-36 h-9 text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-36 h-9 text-xs"
                />
              </div>
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                May 21 - Sep 2 Window
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRunAudit(false)}
                disabled={loading}
                className="gap-2 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Run Audit
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleManualRepair}
                disabled={repairing || loading}
                className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <ShieldCheck className={`h-3.5 w-3.5 ${repairing ? "animate-spin" : ""}`} />
                Repair Referral Bindings
              </Button>
            </div>
          </div>

          {/* Overall Health Status Banner */}
          {result && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between mb-4 ${
                result.healthStatus.overallStatus === "HEALTHY"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : result.healthStatus.overallStatus === "NEEDS_REPAIR"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {result.healthStatus.overallStatus === "HEALTHY" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">
                    Database Retrieval Status: {result.healthStatus.overallStatus}
                  </h4>
                  <p className="text-xs opacity-90">
                    {result.recordsInRange.length} total records retrieved for date window {result.dateRange.start} to {result.dateRange.end}.
                    {result.counts.unboundResellersCount === 0
                      ? " All reseller profiles are bound 100% to respective Referral Admin accounts."
                      : ` ${result.counts.unboundResellersCount} reseller account(s) require referral binding repair.`}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                Audited at {new Date(result.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
          )}

          {/* Metric Summary Grid */}
          {result && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-xl border bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Orders (May 21 - Sep 2)</span>
                  <Database className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold">{result.counts.ordersInRange}</div>
                <span className="text-[11px] text-muted-foreground">Out of {result.counts.totalOrders} total in Supabase</span>
              </div>

              <div className="p-3.5 rounded-xl border bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Deposits (May 21 - Sep 2)</span>
                  <Layers className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-xl font-bold">{result.counts.depositsInRange}</div>
                <span className="text-[11px] text-muted-foreground">Out of {result.counts.totalDeposits} total in Supabase</span>
              </div>

              <div className="p-3.5 rounded-xl border bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Withdrawals (May 21 - Sep 2)</span>
                  <Activity className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-xl font-bold">{result.counts.withdrawalsInRange}</div>
                <span className="text-[11px] text-muted-foreground">Out of {result.counts.totalWithdrawals} total in Supabase</span>
              </div>

              <div className="p-3.5 rounded-xl border bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Resellers Referral Binding</span>
                  <Users className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {result.counts.totalResellers - result.counts.unboundResellersCount} / {result.counts.totalResellers}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {result.counts.unboundResellersCount === 0 ? "100% Bound" : `${result.counts.unboundResellersCount} Unbound`}
                </span>
              </div>
            </div>
          )}

          {/* Main Tabs for Record Explorer & Referral Binding Audit */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="overview" className="gap-2">
                <Database className="h-4 w-4" />
                Records Explorer (May 21 - Sep 2)
              </TabsTrigger>
              <TabsTrigger value="bindings" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Reseller Referral Bindings ({result?.counts.unboundResellersCount || 0} Unbound)
              </TabsTrigger>
            </TabsList>

            {/* Records Explorer Content */}
            <TabsContent value="overview" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search retrieved records by ID, title, reseller, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  Showing {filteredRecords.length} records
                </span>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Record ID</TableHead>
                      <TableHead className="text-xs">Details</TableHead>
                      <TableHead className="text-xs">Date Created</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                          {loading ? "Scanning Supabase tables..." : "No records match the current filter or date range."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.slice(0, 100).map((record) => (
                        <TableRow key={`${record.table}-${record.id}`}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] uppercase font-semibold ${
                                record.table === "orders"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-200"
                                  : record.table === "deposit_requests"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                                  : "bg-amber-500/10 text-amber-600 border-amber-200"
                              }`}
                            >
                              {record.table.replace("_requests", "")}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold">{record.id}</TableCell>
                          <TableCell>
                            <div className="text-xs font-medium">{record.title}</div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-xs">{record.subtitle}</div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="text-xs font-semibold font-mono">
                            {record.amount ? `$${record.amount.toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${
                                record.status === "Completed" || record.status === "Approved"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : record.status === "Processing" || record.status === "Ongoing" || record.status === "Pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              }`}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="View Raw Details"
                                onClick={() => setViewRecord(record)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-blue-600"
                                title="Edit Record"
                                onClick={() => {
                                  setEditRecord(record);
                                  setEditStatus(record.status);
                                  setEditAmount(record.amount || 0);
                                }}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                                title="Delete Record"
                                onClick={() => setDeleteRecord(record)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Referral Bindings Audit Tab */}
            <TabsContent value="bindings" className="space-y-4">
              <div className="p-4 rounded-xl border bg-muted/20 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Referral Record & Admin Binding Integrity
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Verifies that every reseller account has `member_of_admin_id` bound to their referral code / staff creator.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleManualRepair}
                  disabled={repairing}
                  className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Wrench className={`h-3.5 w-3.5 ${repairing ? "animate-spin" : ""}`} />
                  Auto-Repair Referral Bindings
                </Button>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Reseller ID</TableHead>
                      <TableHead className="text-xs">Store Name</TableHead>
                      <TableHead className="text-xs">Referral Code</TableHead>
                      <TableHead className="text-xs">Current Admin Binding</TableHead>
                      <TableHead className="text-xs">Target Referral Admin</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result?.unboundResellers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
                          All reseller accounts are 100% bound correctly to their respective Referral Admin accounts!
                        </TableCell>
                      </TableRow>
                    ) : (
                      result?.unboundResellers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs">{u.id.slice(0, 8)}...</TableCell>
                          <TableCell className="text-xs font-medium">{u.shopName}</TableCell>
                          <TableCell className="text-xs font-mono text-blue-600 font-semibold">
                            {u.referralCode || u.referralId || "DEFAULT"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {u.currentAdminId || "UNBOUND (null)"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-emerald-600 font-semibold">
                            {u.assignedAdminId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-300">
                              Requires Repair
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="text-xs text-muted-foreground font-mono">
              May-21 to Sep-2 Diagnostic Engine Active
            </div>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Close Diagnostic Utility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Record Details Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Record Inspection Details</DialogTitle>
            <DialogDescription className="text-xs">
              Full raw database record payload retrieved from Supabase.
            </DialogDescription>
          </DialogHeader>
          {viewRecord && (
            <div className="my-2 p-3 rounded-lg bg-muted/80 font-mono text-xs overflow-x-auto max-h-96">
              <pre>{JSON.stringify(viewRecord.raw, null, 2)}</pre>
            </div>
          )}
          <DialogFooter>
            <Button size="sm" onClick={() => setViewRecord(null)} className="text-xs">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Supabase Record</DialogTitle>
            <DialogDescription className="text-xs">
              Modify status or amount for record <span className="font-mono font-semibold">{editRecord?.id}</span>.
            </DialogDescription>
          </DialogHeader>
          {editRecord && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Record Status</Label>
                <Input
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="text-xs h-9"
                  placeholder="e.g. Completed, Approved, Pending"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Amount ($)</Label>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditRecord(null)} className="text-xs">Cancel</Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={actionLoading} className="text-xs gap-2">
              {actionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Record Confirmation Dialog */}
      <Dialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600">Confirm Record Deletion</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <span className="font-mono font-semibold">{deleteRecord?.id}</span> from table <span className="font-mono">{deleteRecord?.table}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteRecord(null)} className="text-xs">Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteExecute} disabled={actionLoading} className="text-xs gap-2">
              {actionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
