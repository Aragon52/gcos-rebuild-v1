import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ResellerStorefront from "@/pages/ResellerStorefront";

export const Route = createFileRoute("/store/$slug")({
  head: () => ({
    meta: [
      { title: "Reseller store | GCOS marketplace" },
      { name: "description", content: "Explore products and information from this independent reseller store on GCOS." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Reseller store | GCOS marketplace" },
      { property: "og:description", content: "Visit this reseller's store on GCOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoreSlugRoutePage,
});

function StoreSlugRoutePage() {
  return <MainLayout><ResellerStorefront /></MainLayout>;
}
