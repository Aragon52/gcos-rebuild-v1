import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerDashboard from "@/pages/reseller/ResellerDashboard";

export const Route = createFileRoute("/reseller/dashboard")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerDashboardRoutePage,
});

function ResellerDashboardRoutePage() {
  return <ResellerLayout><ResellerDashboard /></ResellerLayout>;
}
