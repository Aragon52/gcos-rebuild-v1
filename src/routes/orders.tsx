import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Orders from "@/pages/Orders";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: OrdersRoutePage,
});

function OrdersRoutePage() {
  return <MainLayout><Orders /></MainLayout>;
}
