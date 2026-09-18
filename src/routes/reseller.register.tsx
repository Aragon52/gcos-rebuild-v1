import { createFileRoute } from "@tanstack/react-router";
import ResellerRegister from "@/pages/reseller/ResellerRegister";

export const Route = createFileRoute("/reseller/register")({
  head: () => ({
    meta: [
      { title: "Become a reseller — GCOS" },
      { name: "description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:title", content: "Become a reseller — GCOS" },
      { property: "og:description", content: "GCOS — Global Commerce Online Store marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerRegisterRoutePage,
});

function ResellerRegisterRoutePage() {
  return <ResellerRegister />;
}
