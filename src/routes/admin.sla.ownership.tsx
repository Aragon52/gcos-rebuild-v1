import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SLAOwnershipPage from "@/pages/admin/SLAOwnershipPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/sla/ownership")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSlaOwnershipRoutePage,
});

function AdminSlaOwnershipRoutePage() {
  return <RoleGuard path="/admin/sla/ownership"><AdminLayout><SLAOwnershipPage /></AdminLayout></RoleGuard>;
}
