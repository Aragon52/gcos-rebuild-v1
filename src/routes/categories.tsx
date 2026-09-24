import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Categories from "@/pages/Categories";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Browse Product Categories | GCOS Global Marketplace" },
      {
        name: "description",
        content:
          "Explore all product categories on GCOS: Men's & Women's Fashion, Electronics, Home & Kitchen, Beauty, Health, Sports, Toys, and more.",
      },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { property: "og:title", content: "Browse Product Categories | GCOS Global Marketplace" },
      {
        property: "og:description",
        content:
          "Explore all product categories on GCOS: Men's & Women's Fashion, Electronics, Home & Kitchen, Beauty, Health, Sports, Toys, and more.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://globalcart-onlineshop.com/categories" },
      { property: "og:image", content: "https://globalcart-onlineshop.com/brand/og-customer.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://globalcart-onlineshop.com/brand/og-customer.png" },
    ],
    links: [
      { rel: "canonical", href: "https://globalcart-onlineshop.com/categories" },
    ],
  }),
  component: CategoriesRoutePage,
});

function CategoriesRoutePage() {
  return <MainLayout><Categories /></MainLayout>;
}
