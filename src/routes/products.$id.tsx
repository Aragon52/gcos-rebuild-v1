import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ProductDetail from "@/pages/ProductDetail";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Product Details & Customer Reviews | GCOS Marketplace" },
      {
        name: "description",
        content:
          "View authentic product details, verified customer reviews, specifications, and fast worldwide delivery on the GCOS marketplace.",
      },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { property: "og:title", content: "Product Details | GCOS Marketplace" },
      { property: "og:description", content: "View product specifications and customer reviews on GCOS." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsIdRoutePage,
});

function ProductsIdRoutePage() {
  return <MainLayout><ProductDetail /></MainLayout>;
}
