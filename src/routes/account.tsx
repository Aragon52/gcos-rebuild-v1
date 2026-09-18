import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Account from "@/pages/Account";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "My account — GCOS" },
      { name: "description", content: "Manage your GCOS account." },
      { property: "og:title", content: "My account — GCOS" },
      { property: "og:description", content: "Manage your GCOS account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountRoutePage,
});

function AccountRoutePage() {
  return <MainLayout><Account /></MainLayout>;
}
