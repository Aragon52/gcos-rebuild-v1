import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerShop from "@/pages/reseller/ResellerShop";

export const Route = createFileRoute("/reseller/shop")({
  head: () => ({
    meta: [
      { title: "My shop — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "My shop — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerShopRoutePage,
});

function ResellerShopRoutePage() {
  return <ResellerLayout><ResellerShop /></ResellerLayout>;
}
