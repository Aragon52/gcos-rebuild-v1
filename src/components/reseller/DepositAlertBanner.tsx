import { useState, useEffect } from "react";
import { useReseller } from "@/lib/reseller-context-hooks";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Clock, X, ArrowRight, Wallet, Sparkles, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@/lib/router-compat";
import { resellerPath } from "@/lib/subdomain";

interface DepositRecord {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  remark?: string;
}

export default function DepositAlertBanner({ className = "" }: { className?: string }) {
  const { reseller } = useReseller();
  const navigate = useNavigate();
  const [latestDeposit, setLatestDeposit] = useState<DepositRecord | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reseller?.id) return;

    const fetchLatestDeposit = async () => {
      try {
        const { data, error } = await supabase
          .from("deposit_requests")
          .select("*")
          .eq("resellerDocId", reseller.id)
          .order("createdAt", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const item = data[0];
          setLatestDeposit({
            id: item.id,
            amount: Number(item.amount || 0),
            status: item.status || "pending",
            createdAt: item.createdAt || item.created_at,
            remark: item.remark,
          });
        } else {
          setLatestDeposit(null);
        }
      } catch (err) {
        console.error("Error fetching latest deposit alert:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestDeposit();

    // Listen for realtime updates to update the banner immediately
    const channel = supabase
      .channel(`public:deposit_banner:${reseller.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deposit_requests",
          filter: `resellerDocId=eq.${reseller.id}`,
        },
        () => {
          fetchLatestDeposit();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reseller?.id]);

  if (loading || !latestDeposit || !reseller) return null;

  const isApproved = latestDeposit.status.toLowerCase() === "approved";
  const isPending = latestDeposit.status.toLowerCase() === "pending";

  // Check if approved deposit is within the last 48 hours
  const isRecentApproval =
    isApproved &&
    latestDeposit.createdAt &&
    Date.now() - new Date(latestDeposit.createdAt).getTime() < 48 * 60 * 60 * 1000;

  // Don't show if user dismissed this specific deposit notification
  if (dismissedId === latestDeposit.id) return null;

  // Only show for pending or recent approved deposits
  if (!isPending && !isRecentApproval) return null;

  return (
    <div className={`mx-4 mt-3 ${className}`}>
      {isApproved ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
                    Deposit Approved & Balance Credited! 🎉
                  </h4>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] py-0 px-1.5 font-semibold">
                    +${latestDeposit.amount.toLocaleString()} USD
                  </Badge>
                </div>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                  Your deposit of <strong>${latestDeposit.amount.toLocaleString()}</strong> has been approved by admin. Your balance has been updated to <strong>${reseller.balance.toLocaleString()}</strong> (Level: {reseller.level}).
                </p>
                <div className="pt-1.5 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-emerald-600/40 text-emerald-900 dark:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20"
                    onClick={() => navigate(resellerPath("/reseller/profile"))}
                  >
                    <Wallet className="h-3 w-3" />
                    View Wallet & Balance
                  </Button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDismissedId(latestDeposit.id)}
              className="text-emerald-700/60 dark:text-emerald-300/60 hover:text-emerald-900 dark:hover:text-emerald-100 p-1 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : isPending ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm flex-shrink-0 mt-0.5">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-amber-950 dark:text-amber-300">
                    Deposit Request Under Review ⏳
                  </h4>
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] py-0 px-1.5 font-semibold">
                    ${latestDeposit.amount.toLocaleString()} USD
                  </Badge>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                  Your deposit request of <strong>${latestDeposit.amount.toLocaleString()}</strong> is currently pending admin verification. Your account balance will update automatically once verified.
                </p>
                <div className="pt-1.5 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-amber-600/40 text-amber-900 dark:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20"
                    onClick={() => navigate(resellerPath("/reseller/messages"), { state: { tab: "support" } })}
                  >
                    <Headphones className="h-3 w-3" />
                    Customer Service
                  </Button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDismissedId(latestDeposit.id)}
              className="text-amber-700/60 dark:text-amber-300/60 hover:text-amber-900 dark:hover:text-amber-100 p-1 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
