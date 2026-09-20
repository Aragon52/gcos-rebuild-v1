import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ReturnRefundPolicy from "@/pages/ReturnRefundPolicy";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Return & Refund Policy | GlobalCart Online Shop" },
      { name: "description", content: "Learn about GCOS 14-day return guarantees, refund processing, and consumer buyer protection." },
      { property: "og:title", content: "Return & Refund Policy | GlobalCart Online Shop" },
      { property: "og:description", content: "Complete guidelines on returns, refunds, and replacements at GCOS." },
    ],
  }),
  component: () => (
    <MainLayout>
      <ReturnRefundPolicy />
    </MainLayout>
  ),
});
