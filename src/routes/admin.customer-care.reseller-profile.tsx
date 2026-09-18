import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ResellerProfilePage from "@/pages/admin/ResellerProfilePage";

export const Route = createFileRoute("/admin/customer-care/reseller-profile")({
  head: () => ({
    meta: [
      { title: "Reseller profile review — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Reseller profile review — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminCustomerCareResellerProfileRoutePage,
});

function AdminCustomerCareResellerProfileRoutePage() {
  return <AdminLayout><ResellerProfilePage /></AdminLayout>;
}
