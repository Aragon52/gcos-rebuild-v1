import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  ShieldCheck,
  Users,
  Globe,
  Search,
  RefreshCw,
  Laptop,
  Smartphone,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  Copy,
  Check,
  Eye,
  LogOut,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/lib/admin-auth-context-hooks";
import { useNavigate } from "@/lib/router-compat";
import { adminPath } from "@/lib/subdomain";
import {
  fetchAllAdminSessionsData,
  terminateAdminSessionById,
  type AdminSessionSummary,
  type AdminActiveSessionRecord,
  type AdminSessionAuditEntry,
} from "@/lib/admin-session-tracker";

export default function AdminSessionsPage() {
  const { session, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<AdminSessionSummary[]>([]);
  const [activeSessions, setActiveSessions] = useState<AdminActiveSessionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminSessionAuditEntry[]>([]);
  const [totalActiveCount, setTotalActiveCount] = useState(0);
  const [totalUniqueIps, setTotalUniqueIps] = useState(0);
  const [totalAdminsOnline, setTotalAdminsOnline] = useState(0);

  // Strictly enforce Ownership role only
  useEffect(() => {
    if (!authLoading && session && session.role !== "Owner") {
      navigate(adminPath("/admin"));
    }
  }, [session, authLoading, navigate]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState("summaries");

  // Inspection Modal state
  const [inspectAdmin, setInspectAdmin] = useState<AdminSessionSummary | null>(null);
  const [inspectAuditLog, setInspectAuditLog] = useState<AdminSessionAuditEntry | null>(null);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchAllAdminSessionsData();
      setSummaries(data.summaries);
      setActiveSessions(data.activeSessions);
      setAuditLogs(data.auditLogs);
      setTotalActiveCount(data.totalActiveCount);
      setTotalUniqueIps(data.totalUniqueIps);
      setTotalAdminsOnline(data.totalAdminsOnline);
    } catch (e: any) {
      console.error("Failed to load admin sessions data:", e);
      if (!silent) {
        toast({
          title: "Failed to load session logs",
          description: e.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 2000);
    toast({ title: "IP Copied", description: `${text} copied to clipboard.` });
  };

  const handleTerminateSession = async (sessId: string, adminName: string) => {
    setTerminatingId(sessId);
    try {
      const ok = await terminateAdminSessionById(sessId);
      if (ok) {
        toast({
          title: "Session Terminated",
          description: `Active session for ${adminName} was disconnected.`,
        });
        await loadData(true);
      } else {
        toast({
          title: "Termination Failed",
          description: "Could not terminate session.",
          variant: "destructive",
        });
      }
    } finally {
      setTerminatingId(null);
    }
  };

  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.adminName.toLowerCase().includes(q) ||
        s.adminEmail.toLowerCase().includes(q) ||
        s.accountId.toLowerCase().includes(q) ||
        s.latestIp.toLowerCase().includes(q) ||
        s.allIps.some((ip) => ip.toLowerCase().includes(q));

      const matchesRole = roleFilter === "ALL" || s.role.toUpperCase() === roleFilter.toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ONLINE" && s.status === "ONLINE") ||
        (statusFilter === "ACTIVE_ONLY" && s.activeSessionCount > 0) ||
        (statusFilter === "OFFLINE" && s.status === "OFFLINE");

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [summaries, searchQuery, roleFilter, statusFilter]);

  const filteredActiveSessions = useMemo(() => {
    return activeSessions.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        s.adminName.toLowerCase().includes(q) ||
        s.adminEmail.toLowerCase().includes(q) ||
        (s.accountId && s.accountId.toLowerCase().includes(q)) ||
        s.ipAddress.toLowerCase().includes(q) ||
        s.deviceLabel.toLowerCase().includes(q)
      );
    });
  }, [activeSessions, searchQuery]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        log.adminEmail.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, searchQuery]);

  const handleExportCsv = () => {
    const headers = ["Admin Name", "Email", "Account ID", "Role", "Active Sessions", "Status", "Latest IP", "All IPs", "Last Active"];
    const rows = filteredSummaries.map((s) => [
      `"${s.adminName}"`,
      `"${s.adminEmail}"`,
      `"${s.accountId}"`,
      `"${s.role}"`,
      s.activeSessionCount,
      `"${s.status}"`,
      `"${s.latestIp}"`,
      `"${s.allIps.join(", ")}"`,
      `"${new Date(s.lastActive).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_sessions_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-foreground">Admin Session Logs & IP Tracker</h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time IP address logging, active session concurrency counts, and access audit per administrator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2 text-xs h-9"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(false)}
            disabled={loading}
            className="gap-2 text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-theme-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Total Active Sessions</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalActiveCount}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Simultaneous active device sessions</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-theme-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Admins Online</span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalAdminsOnline}</span>
            <span className="text-xs text-muted-foreground font-mono">/ {summaries.length} total</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Distinct administrators online</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-theme-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Unique IP Addresses</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalUniqueIps}</span>
            <span className="text-xs text-blue-600 font-medium">Logged</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Unique client networks recorded</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-theme-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Security Concurrency</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-600">ENFORCED</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Max 2 sessions per Owner account</p>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-[480px]">
            <TabsTrigger value="summaries" className="gap-2 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>Admin Accounts ({summaries.length})</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2 text-xs">
              <Activity className="h-3.5 w-3.5" />
              <span>Live Sessions ({activeSessions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>IP Audit Logs ({auditLogs.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search admin, email, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 h-9 text-xs"
              />
            </div>

            {activeTab === "summaries" && (
              <>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ALL">All Roles</option>
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ALL">All Status</option>
                  <option value="ONLINE">Online</option>
                  <option value="ACTIVE_ONLY">With Active Sessions</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Tab 1: Per-Admin Session Counts & IP Telemetry */}
        <TabsContent value="summaries" className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-theme-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">Administrator</TableHead>
                  <TableHead className="text-xs font-semibold">System ID</TableHead>
                  <TableHead className="text-xs font-semibold">Role</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Active Sessions</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Latest IP Address</TableHead>
                  <TableHead className="text-xs font-semibold">All Recorded IPs</TableHead>
                  <TableHead className="text-xs font-semibold">Last Active</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-xs text-muted-foreground">
                      {loading ? "Loading session logs..." : "No administrator session records match the current filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSummaries.map((admin) => {
                    const initials = admin.adminName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    const isOnline = admin.status === "ONLINE";

                    return (
                      <TableRow key={admin.adminEmail} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs text-white ${
                              admin.role === "Owner"
                                ? "bg-amber-600"
                                : admin.role === "Admin"
                                ? "bg-primary"
                                : "bg-slate-600"
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                <span>{admin.adminName}</span>
                                {admin.role === "Owner" && (
                                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 px-1 py-0">
                                    Owner
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">{admin.adminEmail}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-muted">
                            {admin.accountId}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-semibold ${
                              admin.role === "Owner"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                : admin.role === "Admin"
                                ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                                : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                            }`}
                          >
                            {admin.role}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                            admin.activeSessionCount > 0
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {admin.activeSessionCount} {admin.activeSessionCount === 1 ? "session" : "sessions"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${
                              isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                            }`} />
                            <span className={`text-xs font-medium ${
                              isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                            }`}>
                              {admin.status}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-foreground">{admin.latestIp}</span>
                            <button
                              onClick={() => handleCopy(admin.latestIp)}
                              className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                              title="Copy IP Address"
                            >
                              {copiedIp === admin.latestIp ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {admin.allIps.length === 0 ? (
                              <span className="text-xs text-muted-foreground">-</span>
                            ) : (
                              admin.allIps.slice(0, 2).map((ip) => (
                                <Badge key={ip} variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                                  {ip}
                                </Badge>
                              ))
                            )}
                            {admin.allIps.length > 2 && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                +{admin.allIps.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(admin.lastActive).toLocaleDateString()} {new Date(admin.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectAdmin(admin)}
                            className="text-xs gap-1.5 h-8 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Live Sessions Registry */}
        <TabsContent value="active" className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-theme-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">Session ID</TableHead>
                  <TableHead className="text-xs font-semibold">Administrator</TableHead>
                  <TableHead className="text-xs font-semibold">IP Address</TableHead>
                  <TableHead className="text-xs font-semibold">Device & Browser</TableHead>
                  <TableHead className="text-xs font-semibold">Connected At</TableHead>
                  <TableHead className="text-xs font-semibold">Last Heartbeat</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActiveSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                      No active sessions currently open. Sessions automatically register as admins navigate.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActiveSessions.map((sess) => (
                    <TableRow key={sess.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                        {sess.id.slice(0, 12)}...
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{sess.adminName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{sess.adminEmail}</div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{sess.ipAddress}</span>
                          <button
                            onClick={() => handleCopy(sess.ipAddress)}
                            className="text-muted-foreground hover:text-foreground p-1 rounded"
                          >
                            {copiedIp === sess.ipAddress ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {sess.deviceLabel.toLowerCase().includes("android") || sess.deviceLabel.toLowerCase().includes("ios") ? (
                            <Smartphone className="h-4 w-4 text-primary" />
                          ) : (
                            <Laptop className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs text-foreground font-medium">{sess.deviceLabel}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {new Date(sess.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </TableCell>

                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {new Date(sess.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            sess.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          }`}
                        >
                          {sess.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={terminatingId === sess.id}
                          onClick={() => handleTerminateSession(sess.id, sess.adminName)}
                          className="text-xs gap-1.5 h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Disconnect</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 3: Historical IP Audit Logs */}
        <TabsContent value="history" className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-theme-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold">Admin Account</TableHead>
                  <TableHead className="text-xs font-semibold">Action</TableHead>
                  <TableHead className="text-xs font-semibold">Target / Module</TableHead>
                  <TableHead className="text-xs font-semibold">Client IP Address</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                      No audit log telemetry available for current search query.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>

                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {log.adminEmail || "anonymous"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-mono font-semibold ${
                            log.action === "LOGIN"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : log.action === "LOGOUT"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                          }`}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-foreground font-medium">
                        {log.target || "System"}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                          <span>{log.ipAddress || "127.0.0.1"}</span>
                          <button
                            onClick={() => handleCopy(log.ipAddress)}
                            className="text-muted-foreground hover:text-foreground p-1 rounded"
                          >
                            {copiedIp === log.ipAddress ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectAuditLog(log)}
                          className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Admin Detailed Sessions Modal */}
      <Dialog open={!!inspectAdmin} onOpenChange={() => setInspectAdmin(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Session & IP Inspection: {inspectAdmin?.adminName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              {inspectAdmin?.adminEmail} ({inspectAdmin?.accountId}) · Role: {inspectAdmin?.role}
            </DialogDescription>
          </DialogHeader>

          {inspectAdmin && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-muted/30">
                  <span className="text-[11px] text-muted-foreground font-medium">Active Sessions</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">{inspectAdmin.activeSessionCount}</div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <span className="text-[11px] text-muted-foreground font-medium">Status</span>
                  <div className="text-sm font-bold text-emerald-600 mt-1">{inspectAdmin.status}</div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <span className="text-[11px] text-muted-foreground font-medium">Total Unique IPs</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">{inspectAdmin.allIps.length}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Recorded IP Addresses</h4>
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20">
                  {inspectAdmin.allIps.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No IP recorded yet.</span>
                  ) : (
                    inspectAdmin.allIps.map((ip) => (
                      <div key={ip} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border text-xs font-mono">
                        <Globe className="h-3 w-3 text-blue-500" />
                        <span>{ip}</span>
                        <button
                          onClick={() => handleCopy(ip)}
                          className="text-muted-foreground hover:text-foreground ml-1"
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Active Device Connections</h4>
                {inspectAdmin.sessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic p-3 rounded-lg bg-muted/20">
                    No active live connections for this administrator.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {inspectAdmin.sessions.map((sess) => (
                      <div key={sess.id} className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Laptop className="h-4 w-4 text-primary" />
                          <div>
                            <div className="text-xs font-semibold text-foreground">{sess.deviceLabel}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              IP: {sess.ipAddress} · Logged: {new Date(sess.loginAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTerminateSession(sess.id, inspectAdmin.adminName)}
                          className="text-xs h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" onClick={() => setInspectAdmin(null)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Raw Audit Log Payload Modal */}
      <Dialog open={!!inspectAuditLog} onOpenChange={() => setInspectAuditLog(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Audit Telemetry Payload</DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Event ID: {inspectAuditLog?.id} · {inspectAuditLog?.action} from {inspectAuditLog?.ipAddress}
            </DialogDescription>
          </DialogHeader>

          {inspectAuditLog && (
            <div className="p-3.5 rounded-lg bg-muted/80 font-mono text-xs overflow-x-auto max-h-96">
              <pre>{JSON.stringify(inspectAuditLog, null, 2)}</pre>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" onClick={() => setInspectAuditLog(null)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
