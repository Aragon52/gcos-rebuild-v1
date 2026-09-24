import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import VirtualOrderServicesPage from "@/pages/admin/VirtualOrderServicesPage";

export const Route = createFileRoute("/admin/customer-care/order-services")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminCustomerCareOrderServicesRoutePage,
});

function AdminCustomerCareOrderServicesRoutePage() {
  return <AdminLayout><VirtualOrderServicesPage /></AdminLayout>;
}
