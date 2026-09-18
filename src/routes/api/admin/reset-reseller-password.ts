import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({ resellerId: z.string().min(1) });

export const Route = createFileRoute("/api/admin/reset-reseller-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Reseller ID is required" }, { status: 400 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          const { error: authError } = await supabase.auth.admin.updateUserById(body.resellerId, {
            password: "12345678",
          });
          if (authError) throw authError;

          await supabase
            .from("reseller_profiles")
            .update({
              password_reset_requested: false,
              last_password_reset_at: new Date().toISOString(),
            })
            .eq("id", body.resellerId);

          return Response.json({ success: true });
        } catch (error) {
          console.error("[RESET] Error resetting reseller password:", error);
          return Response.json({ error: "Failed to reset password." }, { status: 500 });
        }
      },
    },
  },
});
