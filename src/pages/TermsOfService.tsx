import React from "react";
import SEO from "@/components/SEO";
import { ShieldCheck, Scale, FileText, CheckCircle2, AlertCircle, Briefcase, Info } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Terms of Service & Demo Project Agreement - GlobalCart"
        description="Review the terms of use, demonstration project guidelines, investor showcase framework, and operating agreement for GlobalCart International Pte. Ltd."
        canonical="https://globalcart-onlineshop.com/terms"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Terms of Service", item: "/terms" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Legal Terms &amp; Platform Agreement</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Terms of Service &amp; Agreement</h1>
          <p className="text-xs text-muted-foreground">Last updated &amp; effective: September 24, 2026</p>
        </div>

        {/* Demo Project & Investor Showcase Notice */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Briefcase className="h-5 w-5 flex-shrink-0" />
            <span>Demonstration Project &amp; Investor Showcase Disclosure</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Scope of Environment:</strong> This entire platform, application ecosystem, administrative portal, and reseller network is engineered exclusively as an advanced <strong>demonstration project and technology pilot</strong>. The sole purpose of this deployment is to introduce, pitch, and showcase a complete, fully operating headless e-commerce application architecture and operations line-ups to <strong>prospective business partners, strategic investors, and commercial collaborators</strong>.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>No Real Financial Transactions or Liabilities:</strong> Accessing or interacting with this platform does not create commercial retail contracts or financial commitments. <strong>There are no real financial deals, actual monetary transactions, or live payment settlements executed while dealing with this application.</strong> All balances, orders, products, inventory records, and payouts are simulated for functional demonstration purposes only.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing, browsing, testing, or reviewing the GlobalCart platform (GlobalCart Online Shop / GCOS), you acknowledge and agree to be bound by these Terms of Service and user agreements governing this demonstration environment operated under <strong>GlobalCart International Pte. Ltd.</strong> (Registration UEN: 202301984M).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Demonstration Purpose &amp; Operating Architecture</h2>
            <p className="text-muted-foreground">
              GlobalCart exhibits a premier multi-merchant, headless e-commerce system featuring:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Headless Storefront &amp; Multi-Vendor Engine:</strong> Modular API-driven catalog, category routing, and dynamic reseller storefronts.</li>
              <li><strong>Automated Operations &amp; SLA Management:</strong> Operational line-ups including ARS (Automated Reseller Settlement), ACH (Automated Clearing House reconciliation), and SLA oversight.</li>
              <li><strong>Buyer Protection Framework:</strong> Full demonstration of escrow protection, order tracking, and dispute management.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Pricing, Catalog &amp; Simulated Checkout</h2>
            <p className="text-muted-foreground text-xs">
              All prices, product listings, specifications, and availability details rendered throughout the application serve as demonstration content. Checkouts, payments, and invoices processed on the platform are simulated demonstrations of high-conversion multi-gateway payment flows and do not result in actual bank or credit card debits.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Logistics, Tracking &amp; Delivery Simulation</h2>
            <p className="text-muted-foreground text-xs">
              Logistics tracking numbers, carrier status updates (DHL, FedEx, UPS), and delivery timestamps generated within the platform illustrate our integrated real-time logistics telemetry pipeline.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Reseller Network &amp; Merchant Showcases</h2>
            <p className="text-muted-foreground text-xs">
              Reseller registrations, shop customization tools, Ad Boost modules, and profit-sharing dashboards demonstrate the multi-tier partner monetization model of the platform. No real monetary commissions or debts are incurred.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Intellectual Property &amp; Commercial Licensing</h2>
            <p className="text-muted-foreground text-xs">
              The underlying software architecture, proprietary workflows, brand identity, user interface components, and operations systems are the intellectual property of GlobalCart International Pte. Ltd. Unauthorized commercial duplication or reverse engineering is prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Investor Relations &amp; Governing Law</h2>
            <p className="text-muted-foreground text-xs">
              These terms are governed by the laws of the Republic of Singapore. Parties interested in investment opportunities, strategic joint ventures, or technology licensing are invited to contact our corporate desk at <span className="text-primary font-semibold">investors@globalcart-onlineshop.com</span> or <span className="text-primary font-semibold">legal@globalcart-onlineshop.com</span>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
