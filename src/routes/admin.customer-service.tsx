import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerServicePage from "@/pages/admin/CustomerServicePage";

export const Route = createFileRoute("/admin/customer-service")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminCustomerServiceRoutePage,
});

function AdminCustomerServiceRoutePage() {
  return <AdminLayout><CustomerServicePage /></AdminLayout>;
}
