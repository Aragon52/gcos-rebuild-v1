import { createFileRoute } from "@tanstack/react-router";
import ResellerShareTarget from "@/pages/reseller/ResellerShareTarget";

export const Route = createFileRoute("/reseller/share-target")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerShareTargetRoutePage,
});

function ResellerShareTargetRoutePage() {
  return <ResellerShareTarget />;
}
