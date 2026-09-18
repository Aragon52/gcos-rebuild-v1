import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSPaymentInfoPage from "@/pages/admin/ARSPaymentInfoPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/ars/payment-info")({
  head: () => ({
    meta: [
      { title: "Payment info — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Payment info — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminArsPaymentInfoRoutePage,
});

function AdminArsPaymentInfoRoutePage() {
  return <RoleGuard path="/admin/ars/payment-info"><AdminLayout><ARSPaymentInfoPage /></AdminLayout></RoleGuard>;
}
