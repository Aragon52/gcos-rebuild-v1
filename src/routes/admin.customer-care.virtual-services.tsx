import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import VirtualCustomerServicesPage from "@/pages/admin/VirtualCustomerServicesPage";

export const Route = createFileRoute("/admin/customer-care/virtual-services")({
  head: () => ({
    meta: [
      { title: "Virtual customer services — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Virtual customer services — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminCustomerCareVirtualServicesRoutePage,
});

function AdminCustomerCareVirtualServicesRoutePage() {
  return <AdminLayout><VirtualCustomerServicesPage /></AdminLayout>;
}
