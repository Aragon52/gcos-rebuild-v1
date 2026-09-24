import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerProfile from "@/pages/reseller/ResellerProfile";

export const Route = createFileRoute("/reseller/profile")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerProfileRoutePage,
});

function ResellerProfileRoutePage() {
  return <ResellerLayout><ResellerProfile /></ResellerLayout>;
}
