import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/admin/verify-all")({
  server: {
    handlers: {
      POST: async () => {
        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          const { data: profiles, error: profilesError } = await supabase
            .from("reseller_profiles")
            .select("*")
            .eq("verified", false);
          if (profilesError) throw profilesError;

          let count = 0;
          for (const profile of profiles ?? []) {
            await supabase.from("reseller_profiles").update({ verified: true }).eq("id", profile.id);

            const { data: shop } = await supabase.from("retail_shops").select("id").eq("id", profile.id).single();
            if (!shop) {
              await supabase.from("retail_shops").insert({
                id: profile.id,
                reseller_id: profile.reseller_id || 0,
                shop_name: profile.shop_name || "My Retail Shop",
                level: "VIP-0",
                product_limit: 20,
                star_rating: 2.0,
                credit_score: 100,
                created_at: new Date().toISOString(),
              });
            }
            count++;
          }

          return Response.json({ success: true, count });
        } catch (error) {
          console.error("Verify all error:", error);
          return Response.json({ error: "Failed to verify all resellers" }, { status: 500 });
        }
      },
    },
  },
});
