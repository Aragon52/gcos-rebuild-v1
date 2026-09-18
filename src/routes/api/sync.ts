import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const productSchema = z.record(z.string(), z.unknown());
const bodySchema = z.object({ products: z.array(productSchema) });

export const Route = createFileRoute("/api/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Products array required" }, { status: 400 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        try {
          for (const product of body.products) {
            const { data: existing } = await supabase
              .from("products")
              .select("id")
              .eq("name", product.name as string)
              .single();
            if (!existing) {
              await supabase.from("products").insert({ ...product, created_at: new Date().toISOString() });
            } else {
              const { id: _newId, ...updateData } = product;
              await supabase
                .from("products")
                .update({ ...updateData, updated_at: new Date().toISOString() })
                .eq("id", existing.id);
            }
          }
          return Response.json({ success: true });
        } catch {
          return Response.json({ error: "Failed to sync" }, { status: 500 });
        }
      },
    },
  },
});
