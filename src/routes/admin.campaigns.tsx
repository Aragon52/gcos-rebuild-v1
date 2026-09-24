import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SeasonalCampaignsPage from "@/pages/admin/SeasonalCampaignsPage";

export const Route = createFileRoute("/admin/campaigns")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminCampaignsRoutePage,
});

function AdminCampaignsRoutePage() {
  return (
    <AdminLayout>
      <SeasonalCampaignsPage />
    </AdminLayout>
  );
}
