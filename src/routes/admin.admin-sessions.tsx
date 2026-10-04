import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminSessionsPage from "@/pages/admin/AdminSessionsPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/admin-sessions")({
  head: () => ({
    meta: [
      { title: "Admin Sessions & IP Log — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSessionsRoutePage,
});

function AdminSessionsRoutePage() {
  return (
    <RoleGuard path="/admin/admin-sessions">
      <AdminLayout>
        <AdminSessionsPage />
      </AdminLayout>
    </RoleGuard>
  );
}
