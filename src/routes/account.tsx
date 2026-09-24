import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Account from "@/pages/Account";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AccountRoutePage,
});

function AccountRoutePage() {
  return <MainLayout><Account /></MainLayout>;
}
