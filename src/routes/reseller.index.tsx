import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerDashboard from "@/pages/reseller/ResellerDashboard";

export const Route = createFileRoute("/reseller/")({
  head: () => ({
    meta: [
      { title: "Reseller dashboard — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Reseller dashboard — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerIndexRoutePage,
});

function ResellerIndexRoutePage() {
  return (
    <ResellerLayout>
      <ResellerDashboard />
    </ResellerLayout>
  );
}
