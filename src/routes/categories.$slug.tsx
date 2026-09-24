import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import CategoryDetail from "@/pages/CategoryDetail";

export const Route = createFileRoute("/categories/$slug")({
  head: () => ({
    meta: [
      { title: "Explore Category Deals & Products | GCOS Marketplace" },
      {
        name: "description",
        content:
          "Shop top rated products, discover new arrivals, and take advantage of special promotions in this category on GCOS.",
      },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { property: "og:title", content: "Explore Category Deals & Products | GCOS Marketplace" },
      {
        property: "og:description",
        content:
          "Shop top rated products and explore curated items in this category on GCOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesSlugRoutePage,
});

function CategoriesSlugRoutePage() {
  return <MainLayout><CategoryDetail /></MainLayout>;
}
