import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import VirtualOrderServicesPage from "@/pages/admin/VirtualOrderServicesPage";

export const Route = createFileRoute("/admin/customer-care/order-services")({
  head: () => ({
    meta: [
      { title: "Virtual order services — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Virtual order services — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminCustomerCareOrderServicesRoutePage,
});

function AdminCustomerCareOrderServicesRoutePage() {
  return <AdminLayout><VirtualOrderServicesPage /></AdminLayout>;
}
