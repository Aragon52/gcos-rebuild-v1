import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerProfile from "@/pages/reseller/ResellerProfile";

export const Route = createFileRoute("/reseller/profile")({
  head: () => ({
    meta: [
      { title: "Reseller profile — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Reseller profile — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerProfileRoutePage,
});

function ResellerProfileRoutePage() {
  return <ResellerLayout><ResellerProfile /></ResellerLayout>;
}
