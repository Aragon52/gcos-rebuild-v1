import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  staffId: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

export const Route = createFileRoute("/api/admin/delete-staff")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Staff ID or Email is required" }, { status: 400 });
        }
        if (!body.staffId && !body.email) {
          return Response.json({ error: "Staff ID or Email is required" }, { status: 400 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          console.log(`[DELETE_STAFF] Initiating deletion of staff (id: ${body.staffId}, email: ${body.email})...`);

          let targetId = body.staffId ?? null;
          let targetEmail = body.email ?? null;

          if (!targetId && targetEmail) {
            const { data: staffData } = await supabase
              .from("sla_staff")
              .select("id, email")
              .eq("email", targetEmail.toLowerCase().trim())
              .limit(1)
              .maybeSingle();

            if (staffData) {
              targetId = staffData.id;
              targetEmail = staffData.email;
            } else {
              const { data: userData } = await supabase
                .from("users")
                .select("id, email")
                .eq("email", targetEmail.toLowerCase().trim())
                .limit(1)
                .maybeSingle();
              if (userData) {
                targetId = userData.id;
                targetEmail = userData.email;
              }
            }
          } else if (targetId && !targetEmail) {
            const { data: staffData } = await supabase
              .from("sla_staff")
              .select("email")
              .eq("id", targetId)
              .limit(1)
              .maybeSingle();
            if (staffData) {
              targetEmail = staffData.email;
            }
          }

          if (!targetId) {
            return Response.json({ error: "Staff member not found in database" }, { status: 404 });
          }

          const { error: dissociateError } = await supabase
            .from("reseller_profiles")
            .update({ referred_by_staff_id: null })
            .eq("referred_by_staff_id", targetId);
          if (dissociateError) {
            console.warn(`[DELETE_STAFF] Warning when dissociating resellers:`, dissociateError);
          }

          const { error: staffDelError } = await supabase.from("sla_staff").delete().eq("id", targetId);
          if (staffDelError) {
            console.error(`[DELETE_STAFF] Error deleting from sla_staff:`, staffDelError);
            throw staffDelError;
          }

          const { error: userDelError } = await supabase.from("users").delete().eq("id", targetId);
          if (userDelError) {
            console.warn(`[DELETE_STAFF] Warning when deleting from users:`, userDelError);
          }

          const { error: authError } = await supabase.auth.admin.deleteUser(targetId);
          if (authError) {
            console.warn(
              `[DELETE_STAFF] Warning when deleting Auth user (might already be deleted or missing):`,
              authError,
            );
          }

          console.log(`[DELETE_STAFF] Successfully completed deletion of staff member ${targetId}`);
          return Response.json({ success: true });
        } catch (error) {
          console.error("[DELETE_STAFF] Error deleting staff member:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to delete staff member" },
            { status: 500 },
          );
        }
      },
    },
  },
});
