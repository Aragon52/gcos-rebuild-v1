import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SQCVirtualOrdersPage from "@/pages/admin/SQCVirtualOrdersPage";

export const Route = createFileRoute("/admin/sla/sqc-orders")({
  head: () => ({
    meta: [
      { title: "SQC virtual orders — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "SQC virtual orders — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSlaSqcOrdersRoutePage,
});

function AdminSlaSqcOrdersRoutePage() {
  return <AdminLayout><SQCVirtualOrdersPage /></AdminLayout>;
}
