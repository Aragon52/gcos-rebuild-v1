import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import Reseller2AdminPage from "@/pages/admin/Reseller2AdminPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/sla/reseller-2-admin")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSlaReseller2AdminRoutePage,
});

function AdminSlaReseller2AdminRoutePage() {
  return <RoleGuard path="/admin/sla/reseller-2-admin"><AdminLayout><Reseller2AdminPage /></AdminLayout></RoleGuard>;
}
