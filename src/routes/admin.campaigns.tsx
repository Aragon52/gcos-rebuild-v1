import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SeasonalCampaignsPage from "@/pages/admin/SeasonalCampaignsPage";

export const Route = createFileRoute("/admin/campaigns")({
  head: () => ({
    meta: [
      { title: "Seasonal campaigns — GCOS admin" },
      {
        name: "description",
        content:
          "Create sliding promotion banners and seasonal themes for the GlobalCart reseller portal and storefront.",
      },
      { property: "og:title", content: "Seasonal campaigns — GCOS admin" },
      {
        property: "og:description",
        content:
          "Create sliding promotion banners and seasonal themes for the GlobalCart reseller portal and storefront.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
