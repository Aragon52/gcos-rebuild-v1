import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import Reseller2AdminPage from "@/pages/admin/Reseller2AdminPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/sla/reseller-2-admin")({
  head: () => ({
    meta: [
      { title: "Reseller to admin — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Reseller to admin — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSlaReseller2AdminRoutePage,
});

function AdminSlaReseller2AdminRoutePage() {
  return <RoleGuard path="/admin/sla/reseller-2-admin"><AdminLayout><Reseller2AdminPage /></AdminLayout></RoleGuard>;
}
