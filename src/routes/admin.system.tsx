import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SLASystemPage from "@/pages/admin/SLASystemPage";

export const Route = createFileRoute("/admin/system")({
  head: () => ({
    meta: [
      { title: "System — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "System — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSystemRoutePage,
});

function AdminSystemRoutePage() {
  return <AdminLayout><SLASystemPage /></AdminLayout>;
}
