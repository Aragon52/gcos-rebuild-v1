import React from "react";
import SEO from "@/components/SEO";
import { ShieldCheck, Lock, CheckCircle2, Briefcase, Building2, UserCheck } from "lucide-react";

export default function VerificationCompliance() {
  return (
    <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16 space-y-6">
      <SEO
        title="Verification & Compliance - Demo Project Standards - GlobalCart"
        description="Learn about merchant verification, KYC compliance, trust architecture, and the demonstration pilot framework at GlobalCart."
        canonical="https://globalcart-onlineshop.com/verification-compliance"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Verification & Compliance", item: "/verification-compliance" },
        ]}
      />

      <div className="border-b border-border pb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trust, Safety &amp; Operational Governance</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Verification &amp; Compliance</h1>
        <p className="text-xs text-muted-foreground">Comprehensive overview of KYC vetting, SLA standards, and demo pilot disclosures.</p>
      </div>

      {/* Demo Project & Investor Showcase Notice */}
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <Briefcase className="h-5 w-5 flex-shrink-0" />
          <span>Demonstration Pilot &amp; Investor Presentation Notice</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This system is maintained as a <strong>demonstration project and technology pilot</strong> to introduce prospective business partners and investors to our complete, fully functioning headless e-commerce architecture and compliance line-ups.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Simulated Verification Workflows:</strong> Merchant verification, KYC reviews, and automated compliance tracking demonstrate our operational safeguards and do not execute binding financial contracts or real monetary transactions during this evaluation period.
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">1. Multi-Tier Seller Verification (KYC / KYB)</h2>
          <p className="text-muted-foreground">
            The platform provides complete seller onboarding pipelines, validating business registrations, tax documentation, and merchant identification before granting active selling credentials.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">2. Automated Order &amp; Fraud Monitoring</h2>
          <p className="text-muted-foreground text-xs">
            Every transaction is monitored by automated risk scoring engines to detect anomalies, irregular purchasing patterns, or unauthorized payment attempts, demonstrating robust enterprise defense.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">3. Service Level Agreement (SLA) Governance</h2>
          <p className="text-muted-foreground text-xs">
            Sellers are held to strict fulfillment SLAs, ensuring prompt dispatch, accurate inventory tracking, and rapid customer support response times.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">4. Contact &amp; Compliance Inquiries</h2>
          <p className="text-muted-foreground text-xs">
            For questions regarding our compliance architecture or investment opportunities, contact <span className="text-primary font-semibold">compliance@globalcart-onlineshop.com</span> or <span className="text-primary font-semibold">investors@globalcart-onlineshop.com</span>.
          </p>
        </section>
      </div>
    </article>
  );
}
