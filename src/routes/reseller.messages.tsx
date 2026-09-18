import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerMessages from "@/pages/reseller/ResellerMessages";

export const Route = createFileRoute("/reseller/messages")({
  head: () => ({
    meta: [
      { title: "Messages — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Messages — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerMessagesRoutePage,
});

function ResellerMessagesRoutePage() {
  return <ResellerLayout><ResellerMessages /></ResellerLayout>;
}
