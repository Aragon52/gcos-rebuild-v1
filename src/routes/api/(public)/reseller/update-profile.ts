import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  resellerId: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  profilePicture: z.string().optional().nullable(),
  shopName: z.string().optional(),
  shopLogo: z.string().optional().nullable(),
  shopHeroBanner: z.string().optional().nullable(),
  storeTheme: z.string().optional(),
  usdtAddress: z.string().optional().nullable(),
  bankInfo: z.any().optional(),
});

export const Route = createFileRoute("/api/(public)/reseller/update-profile")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Invalid payload";
          return Response.json({ error: msg }, { status: 400 });
        }

        const {
          resellerId,
          firstName,
          lastName,
          phone,
          profilePicture,
          shopName,
          shopLogo,
          shopHeroBanner,
          storeTheme,
          usdtAddress,
          bankInfo,
        } = body;

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "https://hreotqowulxpchyxjlai.supabase.co";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          const profileUpdates: Record<string, unknown> = {};
          const userUpdates: Record<string, unknown> = {};
          const shopUpdates: Record<string, unknown> = {};

          if (firstName !== undefined) {
            userUpdates.first_name = firstName;
            profileUpdates.first_name = firstName;
          }
          if (lastName !== undefined) {
            userUpdates.last_name = lastName;
            profileUpdates.last_name = lastName;
          }
          if (phone !== undefined) {
            userUpdates.phone = phone;
            profileUpdates.phone = phone;
          }

          let generatedSlug: string | undefined;
          if (shopName !== undefined && shopName.trim()) {
            profileUpdates.shop_name = shopName.trim();
            shopUpdates.shop_name = shopName.trim();

            // Fetch existing shop to see if it already has a slug
            const { data: existingShop } = await supabase
              .from("retail_shops")
              .select("shop_slug")
              .eq("id", resellerId)
              .maybeSingle();

            if (!existingShop?.shop_slug) {
              const slug =
                shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
                "-" +
                Math.random().toString(36).substring(2, 6);
              profileUpdates.shop_slug = slug;
              shopUpdates.shop_slug = slug;
              generatedSlug = slug;
            } else {
              generatedSlug = existingShop.shop_slug;
            }
          }

          if (profilePicture !== undefined) {
            profileUpdates.profile_picture = profilePicture;
            userUpdates.avatar_url = profilePicture;
          }

          if (shopLogo !== undefined) {
            profileUpdates.shop_logo = shopLogo;
            shopUpdates.shop_logo = shopLogo;
          }

          if (shopHeroBanner !== undefined) {
            profileUpdates.shop_hero_banner = shopHeroBanner;
            shopUpdates.shop_hero_banner = shopHeroBanner;
          }

          if (storeTheme !== undefined) {
            profileUpdates.store_theme = storeTheme;
            shopUpdates.store_theme = storeTheme;
          }

          if (usdtAddress !== undefined) {
            profileUpdates.usdc_address = usdtAddress;
          }

          if (bankInfo !== undefined) {
            profileUpdates.bank_info =
              typeof bankInfo === "string" ? bankInfo : JSON.stringify(bankInfo);
          }

          // Fetch current payment_method to merge custom JSON
          const { data: currentProf } = await supabase
            .from("reseller_profiles")
            .select("payment_method")
            .eq("id", resellerId)
            .maybeSingle();

          let customObj: Record<string, unknown> = {};
          if (currentProf?.payment_method) {
            try {
              customObj =
                typeof currentProf.payment_method === "string"
                  ? JSON.parse(currentProf.payment_method)
                  : currentProf.payment_method;
            } catch {
              customObj = {};
            }
          }

          if (profilePicture !== undefined) customObj.profilePicture = profilePicture;
          if (shopLogo !== undefined) customObj.shopLogo = shopLogo;
          if (shopHeroBanner !== undefined) customObj.shopHeroBanner = shopHeroBanner;
          if (storeTheme !== undefined) customObj.storeTheme = storeTheme;
          if (phone !== undefined) customObj.phone = phone;
          if (usdtAddress !== undefined) customObj.usdtAddress = usdtAddress;
          if (bankInfo !== undefined) customObj.bankInfo = bankInfo;

          profileUpdates.payment_method = JSON.stringify(customObj);
          profileUpdates.updated_at = new Date().toISOString();

          if (Object.keys(profileUpdates).length > 0) {
            const { error: pErr } = await supabase
              .from("reseller_profiles")
              .update(profileUpdates)
              .eq("id", resellerId);
            if (pErr) {
              console.error("[API_UPDATE_PROFILE] reseller_profiles update error:", pErr);
              return Response.json({ error: pErr.message }, { status: 500 });
            }
          }

          if (Object.keys(shopUpdates).length > 0) {
            const { error: sErr } = await supabase
              .from("retail_shops")
              .upsert(
                { id: resellerId, ...shopUpdates },
                { onConflict: "id" }
              );
            if (sErr) {
              console.warn("[API_UPDATE_PROFILE] retail_shops upsert warning:", sErr);
            }
          }

          if (Object.keys(userUpdates).length > 0) {
            try {
              const { error: uErr } = await supabase
                .from("users")
                .update(userUpdates)
                .eq("id", resellerId);
              if (uErr) {
                console.warn("[API_UPDATE_PROFILE] users update warning:", uErr);
              }
            } catch (uErr) {
              console.warn("[API_UPDATE_PROFILE] users update exception:", uErr);
            }
          }

          return Response.json({
            success: true,
            slug: generatedSlug,
            profile: {
              profilePicture,
              shopLogo,
              shopHeroBanner,
              storeTheme,
              shopName,
              phone,
            },
          });
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : "Internal error";
          console.error("[API_UPDATE_PROFILE] Unexpected error:", error);
          return Response.json({ error: errMsg }, { status: 500 });
        }
      },
    },
  },
});
