import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/StatCard";
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Landmark } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useDepositRequests, useWithdrawalRequests } from "@/hooks/use-financial-requests";

interface ACHTransaction {
  id: string;
  customer: string;
  type: "Deposit" | "Withdrawal" | "Fee";
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  date: string;
  rawDate?: string;
  referralId?: string;
  referredBy?: string;
  memberOfAdminId?: string;
}

export default function ACHFinancialPage() {
  const { canSeeAll, hasAccessToReseller } = useAdminAccess();
  
  const { data: deposits = [] } = useDepositRequests();
  const { data: withdrawals = [] } = useWithdrawalRequests();

  const transactions = useMemo(() => {
    const mapStatus = (s: string): ACHTransaction["status"] =>
      s === "Approved" ? "Completed" : s === "Rejected" ? "Failed" : "Pending";

    const rows: ACHTransaction[] = [
      ...deposits.map((d) => ({
        id: `dep-${d.id}`,
        customer: d.resellerName || d.resellerId,
        type: "Deposit" as const,
        amount: Number(d.amount || 0),
        status: mapStatus(d.status),
        date: d.createdAt ? new Date(d.createdAt).toLocaleString() : "-",
        rawDate: d.createdAt,
        referralId: d.referralId,
        referredBy: d.staffId,
        memberOfAdminId: d.memberOfAdminId,
      })),
      ...withdrawals.map((w) => ({
        id: `wd-${w.id}`,
        customer: w.resellerName || w.resellerId,
        type: "Withdrawal" as const,
        amount: Number(w.amount || 0),
        status: mapStatus(w.status),
        date: w.createdAt ? new Date(w.createdAt).toLocaleString() : "-",
        rawDate: w.createdAt,
        referralId: w.referralId,
        referredBy: w.staffId,
        memberOfAdminId: w.memberOfAdminId,
      })),
    ];

    return rows.sort(
      (a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime()
    );
  }, [deposits, withdrawals]);

  const filtered = useMemo(() => {
    if (canSeeAll) return transactions;
    return transactions.filter(tx => hasAccessToReseller(tx));
  }, [transactions, canSeeAll, hasAccessToReseller]);

  const summary = useMemo(() => {
    const money = (n: number) =>
      `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const completed = filtered.filter((t) => t.status === "Completed");
    const pending = filtered.filter((t) => t.status === "Pending");
    const volume = completed.reduce((s, t) => s + t.amount, 0);
    const pendingTotal = pending.reduce((s, t) => s + t.amount, 0);
    const decided = filtered.filter((t) => t.status !== "Pending").length;
    return {
      volume: money(volume),
      pending: money(pendingTotal),
      successRate: decided > 0 ? `${((completed.length / decided) * 100).toFixed(1)}%` : "—",
    };
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ACH Financials</h1>
        <p className="text-sm text-muted-foreground">Monitor ACH transaction volume and financial health.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total ACH Volume" value={summary.volume} icon={DollarSign} />
        <StatCard label="Pending Settlements" value={summary.pending} icon={Wallet} />
        <StatCard label="Success Rate" value={summary.successRate} icon={TrendingUp} />
      </div>

      <Card className="border-none shadow-theme-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Customer", "Amount", "Type", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left p-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-accent/50 transition-colors">
                  <td className="p-3.5 pl-5 font-medium">{tx.customer}</td>
                  <td className="p-3.5">
                    <span className={cn(
                      "font-bold",
                      tx.type === "Deposit" ? "text-success" : "text-danger"
                    )}>
                      {tx.type === "Deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3.5 text-muted-foreground">{tx.type}</td>
                  <td className="p-3.5">
                    <StatusBadge 
                      label={tx.status} 
                      variant={tx.status === "Completed" ? "success" : tx.status === "Pending" ? "warning" : "danger"} 
                    />
                  </td>
                  <td className="p-3.5 text-muted-foreground">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
