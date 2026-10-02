import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ShieldCheck, 
  ShieldAlert,
  Clock, 
  Globe, 
  Activity, 
  TrendingUp, 
  Radio, 
  ArrowUpRight,
  Laptop,
  UserCheck,
  Filter,
  Info,
  ExternalLink,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/lib/admin-auth-context-hooks";
import { SUPER_OWNER_EMAILS } from "@/lib/admin-auth-context";
import { Link } from "@/lib/router-compat";
import { adminPath } from "@/lib/subdomain";

interface AdminAuditLog {
  id: string;
  admin_id?: string;
  admin_email: string;
  admin_name?: string;
  account_id?: string;
  action: string;
  ip_address: string;
  created_at: string;
  details?: Record<string, unknown>;
  device?: string;
  status?: "active" | "completed" | "flagged";
}

export function AdminSecurityActivityCard() {
  const { session } = useAdminAuth();
  const [viewMode, setViewMode] = useState<"hourly" | "daily" | "ips">("hourly");
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>("all");

  // Normalized set of owner/self emails to strictly exclude
  const excludedEmails = useMemo(() => {
    const set = new Set(Array.from(SUPER_OWNER_EMAILS).map((e) => e.toLowerCase()));
    if (session?.email) {
      set.add(session.email.toLowerCase().trim());
    }
    return set;
  }, [session?.email]);

  // Fetch real audit logs excluding ownership accounts
  const { data: realLogs = [], isLoading, refetch } = useQuery<AdminAuditLog[]>({
    queryKey: ["admin-security-logs", Array.from(excludedEmails).join(",")],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("admin_audit_logs")
          .select("id, admin_id, admin_email, action, ip_address, created_at, details")
          .limit(200);

        if (error) {
          console.warn("[ADMIN_SECURITY] Error reading logs:", error.message);
          return [];
        }

        // Exclude all ownership and current self accounts
        return (data || [])
          .filter((log) => {
            const email = (log.admin_email || "").toLowerCase().trim();
            if (!email) return false;
            return !excludedEmails.has(email) && !email.includes("owner");
          })
          .map((log) => ({
            id: log.id,
            admin_id: log.admin_id,
            admin_email: log.admin_email,
            action: log.action || "LOGIN",
            ip_address: log.ip_address || "127.0.0.1",
            created_at: log.created_at,
            details: log.details,
            device: (log.details?.userAgent as string) || "Browser Client",
            status: "active",
          }));
      } catch (err) {
        console.error("[ADMIN_SECURITY] Error:", err);
        return [];
      }
    },
    staleTime: 10_000,
  });

  const hasRealData = realLogs.length > 0;

  // Active dataset
  const allLogs = useMemo(() => {
    if (hasRealData) return realLogs;
    return [];
  }, [hasRealData, realLogs]);

  // Filter logs by selected administrator if dropdown applied
  const filteredLogs = useMemo(() => {
    if (selectedAdminFilter === "all") return allLogs;
    return allLogs.filter(
      (l) =>
        l.admin_email.toLowerCase() === selectedAdminFilter.toLowerCase() ||
        l.account_id === selectedAdminFilter
    );
  }, [allLogs, selectedAdminFilter]);

  // List of distinct non-owner admin accounts present in the telemetry
  const distinctAdmins = useMemo(() => {
    const map = new Map<string, { email: string; name: string; accountId: string }>();
    allLogs.forEach((l) => {
      if (!map.has(l.admin_email)) {
        map.set(l.admin_email, {
          email: l.admin_email,
          name: l.admin_name || l.admin_email.split("@")[0],
          accountId: l.account_id || "GA-ADM",
        });
      }
    });
    return Array.from(map.values());
  }, [allLogs]);

  // Hourly Peak Times Breakdown (00:00 - 23:00)
  const hourlyData = useMemo(() => {
    const counts: number[] = new Array(24).fill(0);

    filteredLogs.forEach((log) => {
      try {
        const hour = new Date(log.created_at).getHours();
        if (hour >= 0 && hour < 24) counts[hour]++;
      } catch {
        // ignore
      }
    });

    return counts.map((count, hour) => {
      const isAm = hour < 12;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const formatted = `${displayHour} ${isAm ? "AM" : "PM"}`;
      return {
        rawHour: hour,
        hour: `${hour.toString().padStart(2, "0")}:00`,
        display: formatted,
        sessions: count,
      };
    });
  }, [filteredLogs]);

  // Daily Frequency (Past 7 Days)
  const dailyData = useMemo(() => {
    const daysMap: Record<string, { label: string; date: string; sessions: number }> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      daysMap[key] = {
        label: `${dayName} (${monthDay})`,
        date: key,
        sessions: 0,
      };
    }

    filteredLogs.forEach((log) => {
      try {
        const key = new Date(log.created_at).toISOString().split("T")[0];
        if (daysMap[key]) {
          daysMap[key].sessions++;
        }
      } catch {
        // ignore
      }
    });

    return Object.values(daysMap);
  }, [filteredLogs]);

  // IP Address Distribution & Breakdown
  const ipBreakdown = useMemo(() => {
    const map: Record<string, { ip: string; count: number; lastUsed: string; admins: Set<string> }> = {};

    filteredLogs.forEach((log) => {
      const ip = log.ip_address || "Unknown IP";
      if (!map[ip]) {
        map[ip] = {
          ip,
          count: 0,
          lastUsed: log.created_at,
          admins: new Set<string>(),
        };
      }
      map[ip].count++;
      map[ip].admins.add(log.admin_email);
      if (new Date(log.created_at) > new Date(map[ip].lastUsed)) {
        map[ip].lastUsed = log.created_at;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        adminCount: item.admins.size,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLogs]);

  // Derived Summary KPI Stats
  const totalAdminSessions = filteredLogs.length;

  const peakHour = useMemo(() => {
    let max = 0;
    let peakIndex = 0;
    hourlyData.forEach((item, idx) => {
      if (item.sessions > max) {
        max = item.sessions;
        peakIndex = idx;
      }
    });
    const peakItem = hourlyData[peakIndex];
    return {
      time: max > 0 ? (peakItem ? peakItem.display : "None") : "No Activity Yet",
      range: `${peakIndex}:00 - ${peakIndex + 1}:00`,
      sessions: max,
    };
  }, [hourlyData]);

  return (
    <Card className="overflow-hidden border border-border shadow-theme-md bg-card">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                  Security Activity: Administrator Accounts
                </CardTitle>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <UserCheck className="h-3 w-3" />
                  Real Admin Telemetry (Excludes Ownership)
                </span>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Live monitoring of administrator connecting public IPs, peak access hours, and login sessions
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {distinctAdmins.length > 0 && (
              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg border border-border">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={selectedAdminFilter}
                  onChange={(e) => setSelectedAdminFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="all">All Administrators ({distinctAdmins.length})</option>
                  {distinctAdmins.map((adm) => (
                    <option key={adm.email} value={adm.email}>
                      {adm.accountId} - {adm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border/60">
              <button
                onClick={() => setViewMode("hourly")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "hourly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Peak Times
              </button>
              <button
                onClick={() => setViewMode("daily")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "daily"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Frequency Trend
              </button>
              <button
                onClick={() => setViewMode("ips")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "ips"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                IP Directory ({ipBreakdown.length})
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-border bg-muted/25 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Admin Sessions</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold text-foreground">{totalAdminSessions}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {distinctAdmins.length} active admin accounts
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/25 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Peak Login Time</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold text-foreground">{peakHour.time}</span>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                {peakHour.sessions > 0 ? `${peakHour.sessions} sessions` : "No sessions logged"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/25 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Distinct IP Addresses</span>
              <Globe className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold text-foreground">{ipBreakdown.length}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Connecting network IPs
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/25 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Live IP Engine</span>
              <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Auto-Capture</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Logging connecting addresses</p>
            </div>
          </div>
        </div>

        {/* Real Data View vs Waiting For First Admin Login */}
        {!hasRealData ? (
          <div className="rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 p-6 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">Real IP Logging Engine is Active</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                When administrators sign in at <code className="text-primary font-mono">/admin/auth/sign-in</code>, their actual connecting public IP address (and VPN endpoint address) will be automatically captured and visualized in real time.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button size="sm" asChild variant="default">
                <Link to={adminPath("/admin/sla/ownership")} className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Create Administrator Account
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Refresh Telemetry
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chart Area */}
            {viewMode === "ips" ? (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-500" />
                      Administrator Connecting IP Directory
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Actual connecting public IPs and proxy/VPN addresses logged by the server
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                    {ipBreakdown.length} Unique IPs
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                  {ipBreakdown.map((item, idx) => (
                    <div
                      key={item.ip || idx}
                      className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          {item.ip}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {item.count} sessions
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Admins:</span>
                          <span className="font-semibold text-foreground">{item.adminCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Activity:</span>
                          <span>{new Date(item.lastUsed).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {viewMode === "hourly" ? (
                        <>
                          <Clock className="h-4 w-4 text-blue-500" />
                          Administrator Peak Login Times (24-Hour Distribution)
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          Administrator Session Frequency (Past 7 Days)
                        </>
                      )}
                    </h4>
                  </div>
                </div>

                <div className="h-[240px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {viewMode === "hourly" ? (
                      <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                        <XAxis dataKey="display" axisLine={false} tickLine={false} interval={2} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                        <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                        <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Live Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Laptop className="h-3.5 w-3.5 text-blue-500" />
                Real Administrator Login Sessions
              </h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border font-semibold">
                    <tr>
                      <th className="px-4 py-3">Administrator</th>
                      <th className="px-4 py-3">Connecting IP</th>
                      <th className="px-4 py-3">Device / User Agent</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-semibold text-foreground">{log.admin_email}</td>
                        <td className="px-4 py-3 font-mono font-medium">{log.ip_address}</td>
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{log.device}</td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
