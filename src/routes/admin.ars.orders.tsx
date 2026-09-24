import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSTrackOrdersPage from "@/pages/admin/ARSTrackOrdersPage";

export const Route = createFileRoute("/admin/ars/orders")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminArsOrdersRoutePage,
});

function AdminArsOrdersRoutePage() {
  return <AdminLayout><ARSTrackOrdersPage /></AdminLayout>;
}
