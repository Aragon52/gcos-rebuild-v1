import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import AdBoostService from "@/pages/reseller/AdBoostService";

export const Route = createFileRoute("/reseller/ad-boost")({
  head: () => ({
    meta: [
      { title: "Ad boost — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Ad boost — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerAdBoostRoutePage,
});

function ResellerAdBoostRoutePage() {
  return <ResellerLayout><AdBoostService /></ResellerLayout>;
}
