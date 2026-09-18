import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SiteFrontAdvertisingPage from "@/pages/admin/SiteFrontAdvertisingPage";

export const Route = createFileRoute("/admin/sla/site-advertising")({
  head: () => ({
    meta: [
      { title: "Site advertising — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Site advertising — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSlaSiteAdvertisingRoutePage,
});

function AdminSlaSiteAdvertisingRoutePage() {
  return <AdminLayout><SiteFrontAdvertisingPage /></AdminLayout>;
}
