import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().optional(),
  emailOrPhone: z.string().optional(),
});

export const Route = createFileRoute("/api/(public)/reseller/request-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed: z.infer<typeof bodySchema>;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Email or phone is required" }, { status: 400 });
        }

        const identifier = (parsed.emailOrPhone || parsed.email || "").trim();
        if (!identifier) {
          return Response.json({ error: "Email or phone is required" }, { status: 400 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          const isPhone = !identifier.includes("@") && /^[+0-9\s-]{6,}$/.test(identifier);

          let targetUserId: string | null = null;

          if (isPhone) {
            // Find by phone in reseller_profiles
            const { data: profile } = await supabase
              .from("reseller_profiles")
              .select("id")
              .or(`phone.eq.${identifier},phone.eq.${identifier.replace(/\s+/g, "")}`)
              .limit(1)
              .maybeSingle();

            if (profile) {
              targetUserId = profile.id;
            }
          } else {
            const cleanEmail = identifier.toLowerCase();
            // Try users table first
            const { data: user } = await supabase
              .from("users")
              .select("id")
              .ilike("email", cleanEmail)
              .limit(1)
              .maybeSingle();

            if (user) {
              targetUserId = user.id;
            } else {
              // Try reseller_profiles table
              const { data: profile } = await supabase
                .from("reseller_profiles")
                .select("id")
                .ilike("email", cleanEmail)
                .limit(1)
                .maybeSingle();

              if (profile) {
                targetUserId = profile.id;
              }
            }
          }

          if (!targetUserId) {
            return Response.json(
              { error: "No reseller account found with this email or phone" },
              { status: 404 }
            );
          }

          await supabase
            .from("reseller_profiles")
            .update({
              password_reset_requested: true,
              password_reset_requested_at: new Date().toISOString(),
            })
            .eq("id", targetUserId);

          return Response.json({
            success: true,
            message: "Password reset request submitted successfully. Support team has been notified.",
          });
        } catch (error) {
          console.error("[RESET] Error requesting reset:", error);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
