import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import VerificationCompliance from "@/pages/VerificationCompliance";

export const Route = createFileRoute("/verification-compliance")({
  head: () => ({
    meta: [
      { title: "Verification & Compliance | GCOS" },
      { name: "description", content: "Learn how GCOS verifies sellers, reviews orders and payments, and protects marketplace trust." },
      { property: "og:title", content: "Verification & Compliance | GCOS" },
      { property: "og:description", content: "Learn how GCOS protects marketplace trust and safety." },
    ],
  }),
  component: () => <MainLayout><VerificationCompliance /></MainLayout>,
});
