import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SLAAdministratorPage from "@/pages/admin/SLAAdministratorPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/sla/administrator")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSlaAdministratorRoutePage,
});

function AdminSlaAdministratorRoutePage() {
  return <RoleGuard path="/admin/sla/administrator"><AdminLayout><SLAAdministratorPage /></AdminLayout></RoleGuard>;
}
