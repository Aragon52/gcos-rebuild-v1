import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminMessengerPage from "@/pages/admin/AdminMessengerPage";

export const Route = createFileRoute("/admin/messenger")({
  head: () => ({
    meta: [
      { title: "Admin portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminMessengerRoutePage,
});

function AdminMessengerRoutePage() {
  return <AdminLayout><AdminMessengerPage /></AdminLayout>;
}
