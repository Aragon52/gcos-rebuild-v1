import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminMessengerPage from "@/pages/admin/AdminMessengerPage";

export const Route = createFileRoute("/admin/messenger")({
  head: () => ({
    meta: [
      { title: "Admin messenger — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Admin messenger — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminMessengerRoutePage,
});

function AdminMessengerRoutePage() {
  return <AdminLayout><AdminMessengerPage /></AdminLayout>;
}
