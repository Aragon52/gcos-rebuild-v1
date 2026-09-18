import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerShopCustomization from "@/pages/reseller/ResellerShopCustomization";

export const Route = createFileRoute("/reseller/profile/customize")({
  head: () => ({
    meta: [
      { title: "Customize shop — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Customize shop — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerProfileCustomizeRoutePage,
});

function ResellerProfileCustomizeRoutePage() {
  return <ResellerLayout><ResellerShopCustomization /></ResellerLayout>;
}
