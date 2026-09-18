import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Categories from "@/pages/Categories";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Shop product categories | GCOS" },
      { name: "description", content: "Browse product categories and discover items available through the GCOS global marketplace." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Shop product categories | GCOS" },
      { property: "og:description", content: "Browse product categories and discover items available through the GCOS global marketplace." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://globalcart-onlineshop.com/categories" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesRoutePage,
});

function CategoriesRoutePage() {
  return <MainLayout><Categories /></MainLayout>;
}
