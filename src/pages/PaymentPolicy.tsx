import React from "react";
import SEO from "@/components/SEO";
import { ShieldCheck, Lock, CreditCard, CheckCircle2, AlertCircle, RefreshCw, Briefcase } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export default function PaymentPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Payment Policy & Demo Transaction Disclosure - GlobalCart"
        description="Understand payment protocols, PCI-DSS encryption, simulated transaction flows, and demonstration project guidelines at GlobalCart."
        canonical="https://globalcart-onlineshop.com/payment-policy"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Payment Policy", item: "/payment-policy" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Financial Trust &amp; Demo Transaction Notice</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Payment Security &amp; Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated &amp; effective: September 24, 2026</p>
        </div>

        {/* Demo Project & Investor Showcase Notice */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Briefcase className="h-5 w-5 flex-shrink-0" />
            <span>Simulated Environment &amp; Non-Financial Transactions Disclosure</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This platform operates as a <strong>demonstration project and investor presentation pilot</strong> designed to showcase a complete operating headless e-commerce application and synchronized multi-channel operations line-ups to business investors and partners.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>No Real Financial Deals or Billings:</strong> All payment flows, card checkouts, digital wallet integrations, crypto rails, and ARS balance settlements operate on a sandbox/simulated basis. No real financial charges, credit card billings, or bank transfers will be executed.
          </p>
        </div>

        {/* Security badges summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-1">
            <Lock className="h-6 w-6 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-foreground">PCI-DSS Level 1 Architecture</div>
            <div className="text-[11px] text-muted-foreground">Certified Tokenized Data Handling</div>
          </div>
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center space-y-1">
            <ShieldCheck className="h-6 w-6 text-blue-600 mx-auto" />
            <div className="text-xs font-bold text-foreground">3D Secure 2.0 Ready</div>
            <div className="text-[11px] text-muted-foreground">Two-Factor Bank Authentication</div>
          </div>
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center space-y-1">
            <CreditCard className="h-6 w-6 text-purple-600 mx-auto" />
            <div className="text-xs font-bold text-foreground">Zero Card Storage</div>
            <div className="text-[11px] text-muted-foreground">Secure Token Vaulting</div>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Supported Payment Gateways (Simulated Integration)</h2>
            <p className="text-muted-foreground text-xs">
              GlobalCart features an omnichannel checkout experience supporting major card networks, digital wallets, and decentralized settlement rails:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-card text-center font-medium">💳 Visa</div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center font-medium">💳 MasterCard</div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center font-medium">💳 American Express</div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center font-medium">🍏 Apple Pay</div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center font-medium">📱 Google Pay</div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center font-medium">🏦 Bank Wire / SEPA</div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center font-medium">🪙 USDT (TRC20/ERC20)</div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center font-medium">🪙 Bitcoin &amp; ETH</div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Tokenization &amp; Data Security Architecture</h2>
            <p className="text-muted-foreground text-xs">
              All payment submissions are routed through modern 256-bit TLS encryption. In compliance with strict PCI-DSS specifications, card numbers are converted into transient tokens and are never logged or stored on application servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Automated Reseller Settlements &amp; Escrow Engine</h2>
            <p className="text-muted-foreground text-xs">
              Our automated ARS and ACH modules simulate instantaneous fee splits, merchant escrow holding, and automated merchant disbursements triggered upon verifiable package delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Inquiries &amp; Investor Contact</h2>
            <p className="text-muted-foreground text-xs">
              For commercial discussions regarding gateway integrations or investment inquiries, contact our finance team at <span className="text-primary font-semibold">billing@globalcart-onlineshop.com</span> or <span className="text-primary font-semibold">investors@globalcart-onlineshop.com</span>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
