import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSPaymentInfoPage from "@/pages/admin/ARSPaymentInfoPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/ars/payment-info")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminArsPaymentInfoRoutePage,
});

function AdminArsPaymentInfoRoutePage() {
  return <RoleGuard path="/admin/ars/payment-info"><AdminLayout><ARSPaymentInfoPage /></AdminLayout></RoleGuard>;
}
