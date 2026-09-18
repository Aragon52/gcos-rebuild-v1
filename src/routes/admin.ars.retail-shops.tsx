import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSRetailShopsPage from "@/pages/admin/ARSRetailShopsPage";

export const Route = createFileRoute("/admin/ars/retail-shops")({
  head: () => ({
    meta: [
      { title: "Retail shops — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Retail shops — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminArsRetailShopsRoutePage,
});

function AdminArsRetailShopsRoutePage() {
  return <AdminLayout><ARSRetailShopsPage /></AdminLayout>;
}
