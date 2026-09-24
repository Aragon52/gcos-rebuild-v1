import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerShop from "@/pages/reseller/ResellerShop";

export const Route = createFileRoute("/reseller/shop")({
  head: () => ({
    meta: [
      { title: "Reseller Shop Management — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerShopRoutePage,
});

function ResellerShopRoutePage() {
  return <ResellerLayout><ResellerShop /></ResellerLayout>;
}
