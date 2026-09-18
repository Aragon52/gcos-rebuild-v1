import { createFileRoute } from "@tanstack/react-router";
import ResellerShareTarget from "@/pages/reseller/ResellerShareTarget";

export const Route = createFileRoute("/reseller/share-target")({
  head: () => ({
    meta: [
      { title: "Share to your shop — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Share to your shop — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerShareTargetRoutePage,
});

function ResellerShareTargetRoutePage() {
  return <ResellerShareTarget />;
}
