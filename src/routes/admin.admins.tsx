import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAdminsPage from "@/pages/admin/AdminAdminsPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/admins")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminAdminsRoutePage,
});

function AdminAdminsRoutePage() {
  return <RoleGuard path="/admin/admins"><AdminLayout><AdminAdminsPage /></AdminLayout></RoleGuard>;
}
