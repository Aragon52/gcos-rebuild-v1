import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/Login";

export const Route = createFileRoute("/cart/login")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: CartLoginRoutePage,
});

function CartLoginRoutePage() {
  return <MainLayout><Login /></MainLayout>;
}
