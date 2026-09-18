import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ContentManagementPage from "@/pages/admin/ContentManagementPage";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Content management — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Content management — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminContentRoutePage,
});

function AdminContentRoutePage() {
  return <AdminLayout><ContentManagementPage /></AdminLayout>;
}
