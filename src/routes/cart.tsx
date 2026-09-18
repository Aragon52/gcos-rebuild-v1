import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Cart from "@/pages/Cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Cart — GCOS" },
      { name: "description", content: "Your shopping cart on GCOS." },
      { property: "og:title", content: "Cart — GCOS" },
      { property: "og:description", content: "Your shopping cart on GCOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartRoutePage,
});

function CartRoutePage() {
  return <MainLayout><Cart /></MainLayout>;
}
