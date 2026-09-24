import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSWithdrawalPage from "@/pages/admin/ARSWithdrawalPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/ars/withdrawal")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminArsWithdrawalRoutePage,
});

function AdminArsWithdrawalRoutePage() {
  return <RoleGuard path="/admin/ars/withdrawal"><AdminLayout><ARSWithdrawalPage /></AdminLayout></RoleGuard>;
}
