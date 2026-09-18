import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  emailOrPhone: z.string().min(1),
  password: z.string().optional(),
  shopName: z.string().optional(),
  referralCode: z.string().optional().nullable(),
  isPhone: z.boolean().optional(),
  uid: z.string().optional().nullable(),
});

export const Route = createFileRoute("/api/(public)/register-reseller")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Email or phone is required" }, { status: 400 });
        }

        const { firstName, lastName, emailOrPhone, password, shopName, referralCode, isPhone, uid } = body;

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        let createdAuthUserId: string | null = null;
        try {
          let userId = uid ?? undefined;
          const normalizedEmail = isPhone ? emailOrPhone.trim() : emailOrPhone.toLowerCase().trim();

          if (!isPhone && !uid) {
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: normalizedEmail,
              password,
              email_confirm: true,
            });
            if (authError) throw authError;
            userId = authData.user.id;
            createdAuthUserId = userId;
          }

          if (!userId) {
            return Response.json({ error: "Registration failed" }, { status: 400 });
          }

          try {
            const { error: userError } = await supabase.from("users").insert({
              id: userId,
              email: isPhone ? null : normalizedEmail,
              first_name: firstName,
              last_name: lastName,
              role: "reseller",
              created_at: new Date().toISOString(),
            });
            if (userError) throw userError;

            const shopNameVal = shopName || `${firstName}'s Store`;
            const shopSlug = shopNameVal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const referralId = "GC-" + userId.substring(0, 4).toUpperCase();

            const { data: lastReseller } = await supabase
              .from("reseller_profiles")
              .select("reseller_id")
              .order("reseller_id", { ascending: false })
              .limit(1)
              .maybeSingle();

            const lastResellerId = (lastReseller as { reseller_id?: number } | null)?.reseller_id || 25030;
            const newResellerId = lastResellerId + 1;

            let referredByStaffId: string | null = null;
            let memberOfAdminId: string | null = null;
            if (referralCode) {
              const { data: staffData } = await supabase
                .from("sla_staff")
                .select("id, created_by_admin_id")
                .eq("referral_id", referralCode.trim().toUpperCase())
                .maybeSingle();

              if (staffData) {
                referredByStaffId = staffData.id;
                memberOfAdminId = staffData.created_by_admin_id;
              } else {
                const { data: adminData } = await supabase
                  .from("sla_admins")
                  .select("id")
                  .eq("account_id", referralCode.trim().toUpperCase())
                  .maybeSingle();
                if (adminData) {
                  memberOfAdminId = adminData.id;
                }
              }
            }

            const { error: profileError } = await supabase.from("reseller_profiles").insert({
              id: userId,
              first_name: firstName,
              last_name: lastName,
              email: isPhone ? null : normalizedEmail,
              shop_name: shopNameVal,
              shop_slug: shopSlug + "-" + Math.random().toString(36).substring(2, 6),
              referral_id: referralId,
              referral_code: referralCode || null,
              balance: 0,
              total_earnings: 0,
              verified: true,
              reseller_id: newResellerId,
              referred_by_staff_id: referredByStaffId,
              member_of_admin_id: memberOfAdminId,
              registration_date: new Date().toISOString(),
            });
            if (profileError) throw profileError;

            const { error: shopError } = await supabase.from("retail_shops").insert({
              id: userId,
              reseller_id: newResellerId,
              shop_name: shopNameVal,
              shop_slug: shopSlug + "-" + Math.random().toString(36).substring(2, 6),
              level: "VIP-0",
              product_limit: 20,
              star_rating: 2.0,
              credit_score: 100,
              created_at: new Date().toISOString(),
            });
            if (shopError) throw shopError;

            return Response.json({ success: true, userId });
          } catch (dbError) {
            console.error("Database registration records failed. Rolling back:", dbError);
            if (createdAuthUserId) {
              await supabase.auth.admin.deleteUser(createdAuthUserId);
            }
            throw dbError;
          }
        } catch (error) {
          console.error("Registration error:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Registration failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});
