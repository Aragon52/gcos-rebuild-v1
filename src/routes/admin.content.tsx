import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ContentManagementPage from "@/pages/admin/ContentManagementPage";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminContentRoutePage,
});

function AdminContentRoutePage() {
  return <AdminLayout><ContentManagementPage /></AdminLayout>;
}
