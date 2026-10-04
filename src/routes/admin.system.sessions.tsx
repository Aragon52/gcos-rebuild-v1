import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminSessionsPage from "@/pages/admin/AdminSessionsPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/system/sessions")({
  head: () => ({
    meta: [
      { title: "Admin Sessions & IP Log — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSystemSessionsRoutePage,
});

function AdminSystemSessionsRoutePage() {
  return (
    <RoleGuard path="/admin/system/sessions">
      <AdminLayout>
        <AdminSessionsPage />
      </AdminLayout>
    </RoleGuard>
  );
}
