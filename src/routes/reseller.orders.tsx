import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerOrders from "@/pages/reseller/ResellerOrders";

export const Route = createFileRoute("/reseller/orders")({
  head: () => ({
    meta: [
      { title: "Shop orders — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Shop orders — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerOrdersRoutePage,
});

function ResellerOrdersRoutePage() {
  return <ResellerLayout><ResellerOrders /></ResellerLayout>;
}
