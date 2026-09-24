import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerOrders from "@/pages/reseller/ResellerOrders";

export const Route = createFileRoute("/reseller/orders")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerOrdersRoutePage,
});

function ResellerOrdersRoutePage() {
  return <ResellerLayout><ResellerOrders /></ResellerLayout>;
}
