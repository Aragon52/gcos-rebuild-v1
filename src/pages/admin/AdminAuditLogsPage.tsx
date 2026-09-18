import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, Download, User, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface Log {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  details: Record<string, unknown> | null;
}

const PAGE_SIZE = 50;

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // The table holds tens of thousands of rows: fetch one page at a time
  // instead of pulling everything into the browser.
  useEffect(() => {
    let cancelled = false;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("admin_audit_logs")
          .select("*", { count: "estimated" })
          .order("created_at", { ascending: false })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        if (appliedSearch.trim()) {
          const term = `%${appliedSearch.trim()}%`;
          query = query.or(`admin_email.ilike.${term},action.ilike.${term},target.ilike.${term}`);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        if (cancelled) return;

        setTotal(count || 0);
        setLogs(
          (data || []).map((d) => ({
            id: d.id,
            admin_id: d.admin_id,
            admin_email: d.admin_email,
            action: d.action,
            target: d.target || "-",
            timestamp: new Date(d.created_at).toLocaleString(),
            ip: d.ip_address || "Unknown",
            details: d.details,
          })),
        );
      } catch (e) {
        console.error("Failed to fetch audit logs", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [page, appliedSearch]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleExport = () => {
    const rows = [
      ["User", "Action", "Target", "Timestamp", "IP Address"],
      ...logs.map((l) => [l.admin_email || "System", l.action, l.target, l.timestamp, l.ip]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-page-${page + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Track all administrative actions across the system. {total.toLocaleString()} entries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="h-3.5 w-3.5" />
            Export page
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setAppliedSearch(search);
        }}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 w-full sm:w-72"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user, action or target..."
          className="bg-transparent border-none outline-none text-sm w-full h-6 focus-visible:ring-0 p-0"
        />
      </form>

      <Card className="border-none shadow-theme-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {["User", "Action", "Target", "Timestamp", "IP Address"].map((h) => (
                  <th key={h} className="text-left p-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">No audit logs found.</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-accent/50 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                        {log.admin_email ? log.admin_email.substring(0, 2).toUpperCase() : "??"}
                      </div>
                      <span className="font-medium">{log.admin_email || "System"}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium border border-border">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-muted-foreground">{log.target}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-xs text-muted-foreground">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
