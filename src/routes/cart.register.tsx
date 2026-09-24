import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Register from "@/pages/Register";

export const Route = createFileRoute("/cart/register")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: CartRegisterRoutePage,
});

function CartRegisterRoutePage() {
  return <MainLayout><Register /></MainLayout>;
}
