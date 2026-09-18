import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function AdminGlobalNotifications() {
  useEffect(() => {
    const startListener = (
      tableName: string,
      title: string,
      messageCallback: (data: Record<string, unknown>) => string,
      filterConditions: { field: string, value: unknown }[] = []
    ) => {
      const channelName = `global_notifs_${tableName}_${Math.random().toString(36).substring(2,9)}`;
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: tableName 
        }, (payload) => {
          const data = payload.new as Record<string, unknown>;
          
          let match = true;
          for (const cond of filterConditions) {
            if (data[cond.field] !== cond.value) {
              match = false;
              break;
            }
          }

          if (match) {
            const body = messageCallback(data);
            toast(title, {
              description: body,
              duration: 300000,
              action: {
                label: "Dismiss",
                onClick: () => {}
              }
            });

            playNotificationSound();
            if (document.hidden) startTabFlash(title);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const formatChatNotification = (data: Record<string, unknown>, prefix: string) => {
      let content = String(data.content || data.message || '');
      
      if (content.includes('[IMG_ATTACH:')) {
        content = content.replace(/\s*\[IMG_ATTACH:[^\]]+\]\s*/g, ' ').trim();
        if (!content) return `${prefix}: [Image attachment]`;
        return `${prefix}: ${content} [Image attachment]`;
      }
      if (content.includes('[PRODUCT_ATTACH:')) {
        content = content.replace(/\s*\[PRODUCT_ATTACH:[^\]]+\]\s*/g, ' ').trim();
        if (!content) return `${prefix}: [Product attachment]`;
        return `${prefix}: ${content} [Product attachment]`;
      }
      
      return `${prefix}: ${content}`;
    };

    // 1. Reseller Chat Messages
    const unsubResellerMsgs = startListener(
      "reseller_chat_messages",
      "New Message (Reseller 2 Admin)",
      (data) => formatChatNotification(data, data.sender === "reseller" ? "Reseller" : "System"),
      [{ field: "sender", value: "reseller" }]
    );

    // 2. Virtual Customer Chat Messages
    const unsubVirtualMsgs = startListener(
      "reseller_chat_messages", // Both use the same table now in Supabase refactor
      "New Message (Virtual Chat)",
      (data) => formatChatNotification(data, "Reseller"),
      [{ field: "sender", value: "reseller" }]
    );

    // 3. Deposit Requests
    const unsubDeposits = startListener(
      "deposit_requests",
      "New Deposit Request",
      (data) => `Reseller ${data.reseller_name || "Unknown"} requested a deposit of $${data.amount}`
    );

    // 4. Withdrawal Requests
    const unsubWithdrawals = startListener(
      "withdrawal_requests",
      "New Withdrawal Request",
      (data) => `Reseller ${data.reseller_name || "Unknown"} requested a withdrawal of $${data.amount}`
    );

    // 5. New Reseller Registration
    const unsubResellers = startListener(
      "reseller_profiles",
      "New Reseller Registered",
      (data) => `Shop: ${data.shop_name || "Unknown"} (ID: ${data.reseller_id})`
    );

    // 6. New Orders
    const unsubOrders = startListener(
      "orders",
      "New Order Received",
      (data) => `Reseller ID: ${data.reseller_id || "Unknown"} placed an order for $${data.total_amount || 0}`
    );

    return () => {
      unsubResellerMsgs();
      unsubVirtualMsgs();
      unsubDeposits();
      unsubWithdrawals();
      unsubResellers();
      unsubOrders();
    };
  }, []);

  return null;
}


function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880; // slightly higher pitch A5
    osc.type = "sine";
    gain.gain.setValueAtTime(0.1, ctx.currentTime); // Lower volume to not be too intrusive
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.error("Audio playback failed", err);
  }
}

let flashInterval: ReturnType<typeof setInterval> | null = null;
function startTabFlash(title: string) {
  if (flashInterval) return;
  const original = document.title;
  let on = false;
  flashInterval = setInterval(() => {
    document.title = on ? `🔔 ${title}` : original;
    on = !on;
  }, 1000);
  const stopFlash = () => {
    if (flashInterval) { clearInterval(flashInterval); flashInterval = null; }
    document.title = original;
    window.removeEventListener("focus", stopFlash);
  };
  window.addEventListener("focus", stopFlash);
}
