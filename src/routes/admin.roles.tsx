import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import { RolesPage } from "@/pages/admin/AdminPlaceholderPages";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminRolesRoutePage,
});

function AdminRolesRoutePage() {
  return <AdminLayout><RolesPage /></AdminLayout>;
}
