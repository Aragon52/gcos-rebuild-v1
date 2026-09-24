import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ResellerStorefront from "@/pages/ResellerStorefront";

export const Route = createFileRoute("/store/$slug")({
  head: () => ({
    meta: [
      { title: "Verified Reseller Storefront | GCOS Marketplace" },
      {
        name: "description",
        content:
          "Shop exclusive collections, authentic brands, and verified inventory directly from this independent reseller partner store on GCOS.",
      },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { property: "og:title", content: "Verified Reseller Storefront | GCOS Marketplace" },
      { property: "og:description", content: "Shop exclusive curated collections from verified partners on GCOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoreSlugRoutePage,
});

function StoreSlugRoutePage() {
  return <MainLayout><ResellerStorefront /></MainLayout>;
}
