import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SLAOwnershipPage from "@/pages/admin/SLAOwnershipPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/sla/ownership")({
  head: () => ({
    meta: [
      { title: "Ownership — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Ownership — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSlaOwnershipRoutePage,
});

function AdminSlaOwnershipRoutePage() {
  return <RoleGuard path="/admin/sla/ownership"><AdminLayout><SLAOwnershipPage /></AdminLayout></RoleGuard>;
}
