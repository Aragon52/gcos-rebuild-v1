import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerServicePage from "@/pages/admin/CustomerServicePage";

export const Route = createFileRoute("/admin/customer-service")({
  head: () => ({
    meta: [
      { title: "Customer service — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Customer service — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminCustomerServiceRoutePage,
});

function AdminCustomerServiceRoutePage() {
  return <AdminLayout><CustomerServicePage /></AdminLayout>;
}
