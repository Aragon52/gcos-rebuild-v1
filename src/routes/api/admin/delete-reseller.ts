import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({ resellerId: z.string().min(1) });

export const Route = createFileRoute("/api/admin/delete-reseller")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Reseller ID is required" }, { status: 400 });
        }
        const resellerId = body.resellerId;

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          console.log(`[DELETE_RESELLER] Initiating deletion of reseller ${resellerId}...`);

          await supabase.from("reseller_product_selection").delete().eq("reseller_id", resellerId);
          await supabase.from("deposit_requests").delete().eq("resellerDocId", resellerId);
          await supabase.from("withdrawal_requests").delete().eq("resellerDocId", resellerId);
          await supabase.from("reseller_notifications").delete().eq("reseller_id", resellerId);

          const { data: chatSessions } = await supabase
            .from("reseller_chat_sessions")
            .select("id")
            .eq("reseller_id", resellerId);
          if (chatSessions && chatSessions.length > 0) {
            const sessionIds = chatSessions.map((s) => s.id);
            await supabase.from("reseller_chat_messages").delete().in("session_id", sessionIds);
            await supabase.from("reseller_chat_sessions").delete().eq("reseller_id", resellerId);
          }

          const { data: supportSessions } = await supabase
            .from("support_sessions")
            .select("id")
            .eq("reseller_id", resellerId);
          if (supportSessions && supportSessions.length > 0) {
            const sessionIds = supportSessions.map((s) => s.id);
            await supabase.from("support_messages").delete().in("session_id", sessionIds);
            await supabase.from("support_sessions").delete().eq("reseller_id", resellerId);
          }

          const { data: orders } = await supabase.from("orders").select("id").eq("reseller_id", resellerId);
          if (orders && orders.length > 0) {
            const orderIds = orders.map((o) => o.id);
            await supabase.from("order_items").delete().in("order_id", orderIds);
            await supabase.from("orders").delete().eq("reseller_id", resellerId);
          }

          await supabase.from("retail_shops").delete().eq("id", resellerId);
          await supabase.from("reseller_profiles").delete().eq("id", resellerId);
          await supabase.from("users").delete().eq("id", resellerId);

          const { error: authError } = await supabase.auth.admin.deleteUser(resellerId);
          if (authError) {
            console.warn(
              `[DELETE_RESELLER] Warning when deleting Auth user (might already be deleted or missing):`,
              authError,
            );
          }

          console.log(`[DELETE_RESELLER] Successfully completed deletion of reseller ${resellerId}`);
          return Response.json({ success: true });
        } catch (error) {
          console.error("[DELETE_RESELLER] Error deleting reseller:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to delete reseller" },
            { status: 500 },
          );
        }
      },
    },
  },
});
