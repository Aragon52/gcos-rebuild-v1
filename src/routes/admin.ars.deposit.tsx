import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSDepositPage from "@/pages/admin/ARSDepositPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/ars/deposit")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminArsDepositRoutePage,
});

function AdminArsDepositRoutePage() {
  return <RoleGuard path="/admin/ars/deposit"><AdminLayout><ARSDepositPage /></AdminLayout></RoleGuard>;
}
