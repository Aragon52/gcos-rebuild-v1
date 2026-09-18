import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
});

export const Route = createFileRoute("/api/(public)/reseller/request-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Email is required" }, { status: 400 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          const { data: user, error } = await supabase
            .from("users")
            .select("id")
            .eq("email", parsed.email)
            .single();

          if (error || !user) {
            return Response.json({ error: "Reseller not found with this email" }, { status: 404 });
          }

          await supabase
            .from("reseller_profiles")
            .update({
              password_reset_requested: true,
              password_reset_requested_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          return Response.json({ success: true });
        } catch (error) {
          console.error("[RESET] Error requesting reset:", error);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
