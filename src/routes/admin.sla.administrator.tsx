import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SLAAdministratorPage from "@/pages/admin/SLAAdministratorPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/sla/administrator")({
  head: () => ({
    meta: [
      { title: "Administrator — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Administrator — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSlaAdministratorRoutePage,
});

function AdminSlaAdministratorRoutePage() {
  return <RoleGuard path="/admin/sla/administrator"><AdminLayout><SLAAdministratorPage /></AdminLayout></RoleGuard>;
}
