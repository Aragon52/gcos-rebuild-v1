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
            const shopNameVal = shopName || `${firstName}'s Store`;
            const shopSlug = shopNameVal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const referralId = "GC-" + userId.substring(0, 4).toUpperCase();

            // Run initial database operations concurrently to minimize registration latency
            const referralLookupPromise = (async () => {
              if (!referralCode) return { staffId: null, adminId: null };
              const cleanCode = referralCode.trim().toUpperCase();
              const { data: staffData } = await supabase
                .from("sla_staff")
                .select("id, created_by_admin_id")
                .eq("referral_id", cleanCode)
                .maybeSingle();

              if (staffData) {
                return { staffId: staffData.id, adminId: staffData.created_by_admin_id };
              }
              const { data: adminData } = await supabase
                .from("sla_admins")
                .select("id")
                .eq("account_id", cleanCode)
                .maybeSingle();
              return { staffId: null, adminId: adminData?.id || null };
            })();

            const userInsertPromise = supabase.from("users").insert({
              id: userId,
              email: isPhone ? null : normalizedEmail,
              first_name: firstName,
              last_name: lastName,
              role: "reseller",
              created_at: new Date().toISOString(),
            });

            const lastResellerPromise = supabase
              .from("reseller_profiles")
              .select("reseller_id")
              .order("reseller_id", { ascending: false })
              .limit(1)
              .maybeSingle();

            const [userResult, lastResellerResult, referralResult] = await Promise.all([
              userInsertPromise,
              lastResellerPromise,
              referralLookupPromise,
            ]);

            if (userResult.error) throw userResult.error;

            const lastReseller = lastResellerResult.data as { reseller_id?: number } | null;
            const lastResellerId = lastReseller?.reseller_id || 25030;
            const newResellerId = lastResellerId + 1;
            const referredByStaffId = referralResult.staffId;
            const memberOfAdminId = referralResult.adminId;

            const uniqueShopSlug = shopSlug + "-" + Math.random().toString(36).substring(2, 6);

            // Concurrently insert reseller profile and retail shop
            const [profileResult, shopResult] = await Promise.all([
              supabase.from("reseller_profiles").insert({
                id: userId,
                first_name: firstName,
                last_name: lastName,
                email: isPhone ? null : normalizedEmail,
                shop_name: shopNameVal,
                shop_slug: uniqueShopSlug,
                referral_id: referralId,
                referral_code: referralCode || null,
                balance: 0,
                total_earnings: 0,
                verified: true,
                reseller_id: newResellerId,
                referred_by_staff_id: referredByStaffId,
                member_of_admin_id: memberOfAdminId,
                registration_date: new Date().toISOString(),
              }),
              supabase.from("retail_shops").insert({
                id: userId,
                reseller_id: newResellerId,
                shop_name: shopNameVal,
                shop_slug: uniqueShopSlug,
                level: "VIP-0",
                product_limit: 20,
                star_rating: 2.0,
                credit_score: 100,
                created_at: new Date().toISOString(),
              }),
            ]);

            if (profileResult.error) throw profileResult.error;
            if (shopResult.error) throw shopResult.error;

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
