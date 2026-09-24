import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerMessages from "@/pages/reseller/ResellerMessages";

export const Route = createFileRoute("/reseller/messages")({
  head: () => ({
    meta: [
      { title: "User Portal — GCOS" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerMessagesRoutePage,
});

function ResellerMessagesRoutePage() {
  return <ResellerLayout><ResellerMessages /></ResellerLayout>;
}
