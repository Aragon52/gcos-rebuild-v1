import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import CategoryDetail from "@/pages/CategoryDetail";

export const Route = createFileRoute("/categories/$slug")({
  head: () => ({
    meta: [
      { title: "Browse category products | GCOS" },
      { name: "description", content: "Browse products in this GCOS category and explore items from the global online marketplace." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Browse category products | GCOS" },
      { property: "og:description", content: "Browse products in this category on GCOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesSlugRoutePage,
});

function CategoriesSlugRoutePage() {
  return <MainLayout><CategoryDetail /></MainLayout>;
}
