import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSTrackOrdersPage from "@/pages/admin/ARSTrackOrdersPage";

export const Route = createFileRoute("/admin/ars/orders")({
  head: () => ({
    meta: [
      { title: "Track orders — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Track orders — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminArsOrdersRoutePage,
});

function AdminArsOrdersRoutePage() {
  return <AdminLayout><ARSTrackOrdersPage /></AdminLayout>;
}
