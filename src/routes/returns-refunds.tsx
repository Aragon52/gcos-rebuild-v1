import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ReturnRefundPolicy from "@/pages/ReturnRefundPolicy";

export const Route = createFileRoute("/returns-refunds")({
  head: () => ({
    meta: [
      { title: "Return & Refund Policy | GCOS" },
      { name: "description", content: "Review GCOS return eligibility, refund processing, and support for faulty or incorrect items." },
      { property: "og:title", content: "Return & Refund Policy | GCOS" },
      { property: "og:description", content: "Review GCOS return eligibility and refund processing." },
    ],
  }),
  component: () => <MainLayout><ReturnRefundPolicy /></MainLayout>,
});
