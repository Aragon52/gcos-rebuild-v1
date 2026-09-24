import React from "react";
import SEO from "@/components/SEO";
import { RotateCcw, ShieldCheck, CheckCircle2, Briefcase, Mail, Clock } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export default function ReturnRefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Return & Refund Policy - Demo Project Disclosure - GlobalCart"
        description="Review return eligibility, refund processes, buyer guarantee workflows, and demo environment notices for GlobalCart."
        canonical="https://globalcart-onlineshop.com/returns-refunds"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Return & Refund Policy", item: "/returns-refunds" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Customer Protection &amp; Operations</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Return &amp; Refund Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated &amp; effective: September 24, 2026</p>
        </div>

        {/* Demo Project & Investor Showcase Notice */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Briefcase className="h-5 w-5 flex-shrink-0" />
            <span>Demonstration Pilot &amp; Operational Workflow Notice</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This platform operates as a <strong>demonstration project and investor presentation pilot</strong> showcasing an advanced headless e-commerce architecture, integrated return management, and customer satisfaction workflows.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Simulated Return &amp; Refund Management:</strong> Return requests, RMA tracking, and refund status updates illustrate the automated dispute and customer care capabilities of our platform without involving real monetary debits or physical merchandise handling.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Return Request Initiation</h2>
            <p className="text-muted-foreground">
              Customers can initiate return and replacement workflows directly from their account dashboard or by submitting an inquiry with order details. The automated system categorizes claims based on defect type, damaged packaging, or transit delays.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Item Condition Standards &amp; Verification</h2>
            <p className="text-muted-foreground text-xs">
              Except for defective or damaged goods, items are evaluated to ensure they remain complete with original packaging. The platform's automated quality control (SQC) modules assist merchants in verifying claims via photo and serial verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Automated Escrow Reversal &amp; Refund Execution</h2>
            <p className="text-muted-foreground text-xs">
              Once a return is approved by the merchant or customer care administrator, the platform executes an automated escrow reversal, crediting the original method of payment (or demo digital wallet balance).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Support &amp; Dispute Inquiries</h2>
            <p className="text-muted-foreground text-xs">
              For any return inquiries or demonstration feedback, contact our operations desk at <span className="text-primary font-semibold">support@globalcart-onlineshop.com</span>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
