import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import PaymentPolicy from "@/pages/PaymentPolicy";

export const Route = createFileRoute("/payment-policy")({
  head: () => ({
    meta: [
      { title: "Payment Security & PCI-DSS Policy | GlobalCart Online Shop" },
      { name: "description", content: "Details on payment encryption, PCI-DSS Level 1 compliance, 3D Secure, and fraud prevention at GCOS." },
      { property: "og:title", content: "Payment Security Policy | GlobalCart Online Shop" },
      { property: "og:description", content: "PCI-DSS Level 1 security and payment safeguards at GCOS." },
    ],
  }),
  component: () => (
    <MainLayout>
      <PaymentPolicy />
    </MainLayout>
  ),
});
