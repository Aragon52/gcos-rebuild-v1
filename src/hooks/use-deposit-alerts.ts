import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useReseller } from "@/lib/reseller-context-hooks";
import { playNotificationSound, startTabFlash } from "@/hooks/use-notifications";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@/lib/router-compat";
import { resellerPath } from "@/lib/subdomain";

export function useDepositAlerts() {
  const { reseller, refreshProfile } = useReseller();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const activeResellerId = reseller?.id;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!activeResellerId) return;

    // Reset initial mount flag on reseller change
    isInitialMount.current = true;
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 2000);

    // Channel 1: Listen to real-time status updates on deposit_requests
    const depositChannel = supabase
      .channel(`public:deposit_requests:${activeResellerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deposit_requests",
          filter: `resellerDocId=eq.${activeResellerId}`,
        },
        async (payload) => {
          const oldRecord = payload.old as any;
          const newRecord = payload.new as any;

          if (!newRecord) return;

          const amount = Number(newRecord.amount || 0);
          const oldStatus = (oldRecord?.status || "").toLowerCase();
          const newStatus = (newRecord?.status || "").toLowerCase();

          // If status transitioned from pending to approved
          if (newStatus === "approved" && oldStatus !== "approved") {
            playNotificationSound();
            if (document.hidden) startTabFlash();

            // Refresh profile & financial queries
            if (refreshProfile) refreshProfile();
            queryClient.invalidateQueries({ queryKey: ["reseller_profile"] });
            queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });
            queryClient.invalidateQueries({ queryKey: ["broadcast_notifications_unread"] });
            queryClient.invalidateQueries({ queryKey: ["broadcast_notifications_all"] });

            toast.success("Deposit Approved & Balance Updated! 🎉", {
              description: `Your deposit of $${amount.toLocaleString()} has been approved. Your balance is now updated!`,
              duration: 8000,
              action: {
                label: "View Wallet",
                onClick: () => navigate(resellerPath("/reseller/profile")),
              },
            });
          } else if (newStatus === "rejected" && oldStatus !== "rejected") {
            playNotificationSound();

            if (refreshProfile) refreshProfile();
            queryClient.invalidateQueries({ queryKey: ["reseller_profile"] });
            queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });

            toast.error("Deposit Request Rejected", {
              description: `Your deposit request of $${amount.toLocaleString()} was rejected.${
                newRecord.remark ? ` Reason: ${newRecord.remark}` : ""
              }`,
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    // Channel 2: Listen to newly inserted reseller_notifications
    const notifChannel = supabase
      .channel(`public:reseller_notifications:${activeResellerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reseller_notifications",
          filter: `reseller_id=eq.${activeResellerId}`,
        },
        (payload) => {
          const notif = payload.new as any;
          if (!notif || isInitialMount.current) return;

          queryClient.invalidateQueries({ queryKey: ["broadcast_notifications_unread"] });
          queryClient.invalidateQueries({ queryKey: ["broadcast_notifications_all"] });

          if (notif.type === "deposit_approved") {
            playNotificationSound();
            if (document.hidden) startTabFlash();
            if (refreshProfile) refreshProfile();

            toast.success(notif.title || "Deposit Approved! 🎉", {
              description: notif.content || "Your deposit has been credited to your account.",
              duration: 8000,
              action: {
                label: "View Wallet",
                onClick: () => navigate(resellerPath("/reseller/profile")),
              },
            });
          } else if (notif.type === "deposit_rejected") {
            toast.error(notif.title || "Deposit Request Rejected", {
              description: notif.content || "Your deposit request was rejected by administrator.",
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(depositChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [activeResellerId, queryClient, refreshProfile, navigate]);
}
