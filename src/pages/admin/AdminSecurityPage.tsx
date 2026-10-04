import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, Monitor, History, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminAuth } from "@/lib/admin-auth-context-hooks";
import {
  fetchAdminSessions,
  fetchAdminLoginHistory,
  revokeAdminSession,
} from "@/services/admin-security-service";

function formatDateTime(value: string): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function describeDevice(ua: string | null): string {
  if (!ua) return "Unknown device";
  const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac OS/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Other";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${browser} on ${os}`;
}

const ACTION_LABELS: Record<string, string> = {
  login: "Signed in",
  logout: "Signed out",
  user_signedup: "Account created",
  token_revoked: "Session ended",
  user_recovery_requested: "Password reset requested",
  user_updated_password: "Password changed",
};

export function AdminSecurityPage() {
  const { session } = useAdminAuth();
  const isOwner = session?.role === "Owner";
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({ queryKey: ["admin-sessions"], queryFn: fetchAdminSessions, enabled: isOwner, refetchInterval: 60_000 });
  const historyQuery = useQuery({ queryKey: ["admin-login-history"], queryFn: () => fetchAdminLoginHistory(200), enabled: isOwner });

  const revoke = useMutation({
    mutationFn: revokeAdminSession,
    onSuccess: () => {
      toast.success("Device signed out");
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <ShieldAlert className="h-10 w-10 text-destructive" />
        <h1 className="text-xl font-semibold">Owner access only</h1>
        <p className="text-sm text-muted-foreground">This page is only available to the Ownership account.</p>
      </div>
    );
  }

  const sessions = sessionsQuery.data ?? [];
  const history = historyQuery.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security and sessions</h1>
        <p className="text-sm text-muted-foreground">Devices signed in to owner, admin and staff accounts, with IP addresses. Visible to the Owner only.</p>
      </div>

      <Card className="border-none shadow-theme-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Active sessions ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {sessionsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading sessions…</p>
          ) : sessionsQuery.error ? (
            <p className="text-sm text-destructive py-6 text-center">{(sessionsQuery.error as Error).message}</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No active sessions.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>IP address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Signed in</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.session_id}>
                    <TableCell className="font-medium">{s.email ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{s.role ?? "—"}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{s.ip ?? "—"}</TableCell>
                    <TableCell className="text-xs" title={s.user_agent ?? ""}>{describeDevice(s.user_agent)}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(s.created_at)}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(s.last_active_at)}</TableCell>
                    <TableCell className="text-right">
                      {s.is_current ? (
                        <Badge>This device</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={revoke.isPending}
                          onClick={() => {
                            if (window.confirm(`Sign out ${s.email ?? "this account"} on ${describeDevice(s.user_agent)}?`)) {
                              revoke.mutate(s.session_id);
                            }
                          }}
                        >
                          <LogOut className="h-3.5 w-3.5 mr-1" /> Sign out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-theme-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Sign-in history with IP addresses</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {historyQuery.isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading history…</p>
          ) : historyQuery.error ? (
            <p className="text-sm text-destructive py-6 text-center">{(historyQuery.error as Error).message}</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No sign-in activity recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date and time</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>IP address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs">{formatDateTime(h.created_at)}</TableCell>
                    <TableCell className="font-medium">{h.email ?? "—"}</TableCell>
                    <TableCell className="capitalize text-xs">{h.role ?? "—"}</TableCell>
                    <TableCell className="text-xs">{ACTION_LABELS[h.action] ?? h.action}</TableCell>
                    <TableCell className="font-mono text-xs">{h.ip ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
