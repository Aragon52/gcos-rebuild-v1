import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import VirtualCustomerServicesPage from "@/pages/admin/VirtualCustomerServicesPage";

export const Route = createFileRoute("/admin/customer-care/virtual-services")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminCustomerCareVirtualServicesRoutePage,
});

function AdminCustomerCareVirtualServicesRoutePage() {
  return <AdminLayout><VirtualCustomerServicesPage /></AdminLayout>;
}
