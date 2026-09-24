import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["Pending", "Ongoing", "Completed", "Cancelled", "Shipped"]),
});

export const Route = createFileRoute("/api/admin/update-order-status")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch (e) {
          return Response.json({ error: "Invalid request payload", details: String(e) }, { status: 400 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", body.orderId)
            .single();

          if (orderError || !orderData) {
            return Response.json({ error: "Order not found" }, { status: 404 });
          }

          const previousStatus = String(orderData.status || "").toLowerCase();
          const newStatus = body.status;

          const updateData: Record<string, unknown> = {
            status: newStatus,
            updated_at: new Date().toISOString(),
          };

          if (newStatus === "Ongoing" && (previousStatus === "pending" || previousStatus === "processing")) {
            updateData.picked_up_at = new Date().toISOString();
          } else if (newStatus === "Completed" && previousStatus !== "completed") {
            updateData.completed_at = new Date().toISOString();
          }

          const { error: updateOrderErr } = await supabase
            .from("orders")
            .update(updateData)
            .eq("id", body.orderId);

          if (updateOrderErr) throw updateOrderErr;

          const resellerId = orderData.reseller_id || orderData.resellerId;
          const totalAmount = Number(orderData.total_amount || orderData.total_cost || 0);
          const profit = Number(orderData.profits || orderData.profit || 0);
          const serviceCost = Number(orderData.service_cost || 0);

          if (resellerId) {
            let resolvedId: string | null = null;
            const { data: direct } = await supabase.from("reseller_profiles").select("id").eq("id", resellerId).maybeSingle();
            if (direct) {
              resolvedId = direct.id;
            } else {
              const digitsMatch = String(resellerId).match(/\d+/);
              if (digitsMatch) {
                const numId = parseInt(digitsMatch[0]);
                const { data: byNum } = await supabase.from("reseller_profiles").select("id").eq("reseller_id", numId).maybeSingle();
                if (byNum) resolvedId = byNum.id;
              }
            }

            if (resolvedId) {
              const { data: profile } = await supabase.from("reseller_profiles").select("*").eq("id", resolvedId).maybeSingle();
              if (profile) {
                const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

                if (newStatus === "Completed" && previousStatus !== "completed") {
                  updates.total_earnings = Number(((profile.total_earnings || 0) + profit).toFixed(2));
                  if (previousStatus === "ongoing" || previousStatus === "shipped") {
                    updates.pending_balance = Math.max(0, Number(((profile.pending_balance || 0) - totalAmount).toFixed(2)));
                    updates.balance = Number(((profile.balance || 0) + totalAmount).toFixed(2));
                  } else if (previousStatus === "pending" || previousStatus === "processing") {
                    updates.unpicked_balance = Math.max(0, Number(((profile.unpicked_balance || 0) - totalAmount).toFixed(2)));
                    updates.balance = Number(((profile.balance || 0) + profit).toFixed(2));
                  }
                } else if (newStatus === "Cancelled" && previousStatus !== "cancelled") {
                  if (previousStatus === "pending" || previousStatus === "processing") {
                    updates.unpicked_balance = Math.max(0, Number(((profile.unpicked_balance || 0) - totalAmount).toFixed(2)));
                  } else if (previousStatus === "ongoing" || previousStatus === "shipped") {
                    updates.pending_balance = Math.max(0, Number(((profile.pending_balance || 0) - totalAmount).toFixed(2)));
                    updates.balance = Number(((profile.balance || 0) + serviceCost).toFixed(2));
                  }
                } else if (newStatus === "Ongoing" && (previousStatus === "pending" || previousStatus === "processing")) {
                  updates.unpicked_balance = Math.max(0, Number(((profile.unpicked_balance || 0) - totalAmount).toFixed(2)));
                  updates.pending_balance = Number(((profile.pending_balance || 0) + totalAmount).toFixed(2));
                  updates.balance = Number(((profile.balance || 0) - serviceCost).toFixed(2));
                }

                if (Object.keys(updates).length > 1) {
                  await supabase.from("reseller_profiles").update(updates).eq("id", resolvedId);
                }
              }
            }
          }

          return Response.json({ success: true, orderId: body.orderId, status: newStatus });
        } catch (error) {
          console.error("Failed to update order status:", error);
          return Response.json({ error: "Failed to update order status", details: String(error) }, { status: 500 });
        }
      },
    },
  },
});
