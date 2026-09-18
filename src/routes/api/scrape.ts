import { createFileRoute } from "@tanstack/react-router";
import * as cheerio from "cheerio";
import * as PapaModule from "papaparse";
import { z } from "zod";

const Papa = (PapaModule as { default?: typeof PapaModule }).default || PapaModule;

const bodySchema = z.object({
  url: z.string().min(1),
  category: z.string().optional(),
});

export const Route = createFileRoute("/api/scrape")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "URL is required" }, { status: 400 });
        }

        const { category } = body;
        let url = body.url;

        try {
          const iframeMatch = url.match(/src=["']([^"']+)["']/);
          if (iframeMatch && iframeMatch[1]) url = iframeMatch[1];
          url = url.replace(/&amp;/g, "&");

          if (url.includes("docs.google.com/spreadsheets")) {
            if (url.includes("/pubhtml")) {
              url = url.includes("?")
                ? url.replace("/pubhtml?", "/pub?output=csv&")
                : url.replace("/pubhtml", "/pub?output=csv");
            } else if (url.includes("/pub") && !url.includes("output=csv")) {
              url = url.includes("?") ? `${url}&output=csv` : `${url}?output=csv`;
            } else if (!url.includes("/pub") && !url.includes("/export")) {
              const pubMatch = url.match(/\/d\/e\/([^/?]+)/);
              const standardMatch = url.match(/\/d\/([^/]+)/);
              if (pubMatch && pubMatch[1]) {
                url = `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv`;
              } else if (standardMatch && standardMatch[1] && standardMatch[1] !== "e") {
                url = `https://docs.google.com/spreadsheets/d/${standardMatch[1]}/export?format=csv`;
              }
            }
          }

          const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
          if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);

          const contentType = response.headers.get("content-type") || "";
          const products: unknown[] = [];

          if (contentType.includes("text/csv") || url.includes("output=csv")) {
            const csvText = await response.text();
            const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            const data = results.data as Record<string, unknown>[];

            for (const row of data) {
              const getVal = (keys: string[]) => {
                const foundKey = Object.keys(row).find((k) =>
                  keys.some((sk) => k.trim().toLowerCase() === sk.toLowerCase()),
                );
                return foundKey ? String(row[foundKey] || "").trim() : undefined;
              };
              const name = getVal(["name", "product name", "title"]);
              const price = parseFloat(String(getVal(["price", "cost"]) || "0").replace(/[^0-9.]/g, ""));
              if (name && price > 0) {
                products.push({
                  id: `prod-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                  name,
                  price,
                  image: getVal(["image url", "image"]) || `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400`,
                  category: getVal(["category"]) || category || "uncategorized",
                  stock: 50,
                  in_stock: true,
                  sku: getVal(["sku"]) || `CSV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                });
              }
            }
          } else {
            const html = await response.text();
            const $ = cheerio.load(html);
            $("img").each((_i, el) => {
              if (products.length >= 10) return;
              const alt = $(el).attr("alt");
              const src = $(el).attr("src");
              if (alt && alt.length > 10 && src) {
                products.push({
                  id: `scrape-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                  name: alt,
                  price: 49.99,
                  image: src,
                  category: category || "uncategorized",
                  stock: 50,
                  in_stock: true,
                  sku: `SCRAPE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                });
              }
            });
          }
          return Response.json({ products });
        } catch (error) {
          console.error("Scrape error:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to scrape" },
            { status: 500 },
          );
        }
      },
    },
  },
});
