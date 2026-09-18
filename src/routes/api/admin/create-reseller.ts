import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const sessionSchema = z
  .object({
    role: z.string().optional(),
    accountId: z.string().optional(),
    uid: z.string().optional(),
  })
  .optional()
  .nullable();

const bodySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().optional(),
  shopName: z.string().min(1),
  session: sessionSchema,
});

export const Route = createFileRoute("/api/admin/create-reseller")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Email is required" }, { status: 400 });
        }
        const { firstName, lastName, email, password, shopName, session } = body;

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          const normalizedEmail = email.toLowerCase().trim();

          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: normalizedEmail,
            password,
            email_confirm: true,
          });
          if (authError) throw authError;

          const userId = authData.user.id;

          await supabase.from("users").insert({
            id: userId,
            email: normalizedEmail,
            first_name: firstName,
            last_name: lastName,
            role: "reseller",
            created_at: new Date().toISOString(),
          });

          const shopSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const referralId = "GC-" + userId.substring(0, 4).toUpperCase();

          const { data: lastReseller } = await supabase
            .from("reseller_profiles")
            .select("reseller_id")
            .order("reseller_id", { ascending: false })
            .limit(1)
            .single();

          const lastResellerId = (lastReseller as { reseller_id?: number } | null)?.reseller_id || 25030;
          const newResellerId = lastResellerId + 1;

          let referredByStaffId: string | null = null;
          let memberOfAdminId: string | null = null;

          if (session) {
            if (session.role === "Admin" || session.role === "Owner") {
              const { data: adminData } = await supabase
                .from("sla_admins")
                .select("id")
                .eq("account_id", session.accountId)
                .single();
              memberOfAdminId = adminData?.id || session.uid || null;
            } else if (session.role === "User") {
              const { data: staffData } = await supabase
                .from("sla_staff")
                .select("id, created_by_admin_id")
                .eq("referral_id", session.accountId)
                .single();
              if (staffData) {
                referredByStaffId = staffData.id;
                memberOfAdminId = staffData.created_by_admin_id;
              } else {
                referredByStaffId = session.uid || null;
                const { data: fallbackStaff } = await supabase
                  .from("sla_staff")
                  .select("created_by_admin_id")
                  .eq("id", referredByStaffId)
                  .single();
                if (fallbackStaff) memberOfAdminId = fallbackStaff.created_by_admin_id;
              }
            }
          }

          await supabase.from("reseller_profiles").insert({
            id: userId,
            shop_name: shopName,
            shop_slug: shopSlug + "-" + Math.random().toString(36).substring(2, 6),
            referral_id: referralId,
            balance: 0,
            total_earnings: 0,
            verified: true,
            reseller_id: newResellerId,
            referred_by_staff_id: referredByStaffId,
            member_of_admin_id: memberOfAdminId,
            registration_date: new Date().toISOString(),
          });

          await supabase.from("retail_shops").insert({
            id: userId,
            reseller_id: newResellerId,
            shop_name: shopName,
            level: "VIP-0",
            product_limit: 20,
            star_rating: 2.0,
            credit_score: 100,
            created_at: new Date().toISOString(),
          });

          return Response.json({ success: true, userId });
        } catch (error) {
          console.error("Create reseller error:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to create reseller" },
            { status: 500 },
          );
        }
      },
    },
  },
});
