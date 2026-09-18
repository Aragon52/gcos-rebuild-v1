import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { suggestCategory } from "@/lib/catalog-categories";

const CATALOG_ENDPOINT = "https://catalog.shopify.com/api/ucp/mcp";
const AGENT_PROFILE = "https://shopify.dev/ucp/agent-profiles/2026-08-25/valid-with-capabilities.json";

const inputSchema = z.object({
  query: z.string().min(2).max(200),
  limit: z.number().int().min(1).max(50).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  cursor: z.string().optional(),
});

export interface SourcedProduct {
  sourceId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  category: string;
  sku: string;
  seller: string;
  sourceUrl: string;
}

export interface CatalogSearchResult {
  products: SourcedProduct[];
  cursor: string | null;
  hasNextPage: boolean;
}

interface CatalogMedia {
  type?: string;
  url?: string;
}

interface CatalogVariant {
  id?: string;
  sku?: string;
  url?: string;
  price?: { amount?: number; currency?: string };
  availability?: { available?: boolean };
  media?: CatalogMedia[];
}

interface CatalogProduct {
  id?: string;
  title?: string;
  url?: string;
  description?: { plain?: string; html?: string };
  categories?: { value?: string; taxonomy?: string }[];
  media?: CatalogMedia[];
  price_range?: { min?: { amount?: number; currency?: string } };
  variants?: CatalogVariant[];
  seller?: { name?: string };
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const firstImage = (media?: CatalogMedia[]) =>
  media?.find((m) => (m.type ?? "image") === "image" && m.url)?.url ?? "";

/** Searches Shopify's Global Catalog (keyless tier) and normalises results for the inventory importer. */
export const searchGlobalCatalog = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CatalogSearchResult> => {
    const filters: Record<string, unknown> = { available: true };
    if (data.minPrice !== undefined || data.maxPrice !== undefined) {
      filters.price = {
        ...(data.minPrice !== undefined ? { min: Math.round(data.minPrice * 100) } : {}),
        ...(data.maxPrice !== undefined ? { max: Math.round(data.maxPrice * 100) } : {}),
      };
    }

    const response = await fetch(CATALOG_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "search_catalog",
          arguments: {
            meta: { "ucp-agent": { profile: AGENT_PROFILE } },
            catalog: {
              query: data.query,
              filters,
              pagination: {
                limit: data.limit ?? 24,
                ...(data.cursor ? { cursor: data.cursor } : {}),
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Product catalog is unavailable right now (${response.status}).`);
    }

    const payload = (await response.json()) as {
      error?: { message?: string };
      result?: {
        structuredContent?: {
          products?: CatalogProduct[];
          pagination?: { cursor?: string; has_next_page?: boolean };
        };
      };
    };

    if (payload.error) {
      throw new Error(payload.error.message ?? "Product search failed.");
    }

    const content = payload.result?.structuredContent;
    const products: SourcedProduct[] = (content?.products ?? []).map((product, index) => {
      const variant = product.variants?.find((v) => v.availability?.available !== false) ?? product.variants?.[0];
      const amount = variant?.price?.amount ?? product.price_range?.min?.amount ?? 0;
      const currency = variant?.price?.currency ?? product.price_range?.min?.currency ?? "USD";
      const rawDescription = product.description?.plain ?? stripHtml(product.description?.html ?? "");
      const merchantCategory = product.categories?.find((c) => c.taxonomy === "merchant")?.value;
      const sourceId = product.id ?? variant?.id ?? `catalog-${index}`;

      return {
        sourceId,
        name: product.title ?? "Untitled product",
        description: rawDescription,
        image: firstImage(product.media) || firstImage(variant?.media),
        price: Math.round(amount) / 100,
        currency,
        category: suggestCategory(product.title, merchantCategory, rawDescription),
        sku: variant?.sku ?? `SHC-${sourceId.split("/").pop() ?? index}`,
        seller: product.seller?.name ?? "",
        sourceUrl: variant?.url ?? product.url ?? "",
      };
    });

    return {
      products,
      cursor: content?.pagination?.cursor ?? null,
      hasNextPage: Boolean(content?.pagination?.has_next_page),
    };
  });
