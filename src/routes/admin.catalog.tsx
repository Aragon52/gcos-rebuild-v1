import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminCatalogPage from "@/pages/admin/AdminCatalogPage";

export const Route = createFileRoute("/admin/catalog")({
  head: () => ({
    meta: [
      { title: "Product Catalog — GCOS" },
      { name: "description", content: "Browse sourced products and available stock for resellers." },
      { property: "og:title", content: "Product Catalog — GCOS" },
      { property: "og:description", content: "Browse sourced products and available stock for resellers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminCatalogRoutePage,
});

function AdminCatalogRoutePage() {
  return (
    <AdminLayout>
      <AdminCatalogPage />
    </AdminLayout>
  );
}
