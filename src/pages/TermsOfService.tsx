import React from "react";
import SEO from "@/components/SEO";
import { ShieldCheck, Scale, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Terms of Service & User Agreement - GlobalCart"
        description="Review the terms, buyer protection policies, merchant guidelines, and governing law for GlobalCart International Pte. Ltd. (GCOS)."
        canonical="https://globalcart-onlineshop.com/terms"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Terms of Service", item: "/terms" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Legal Terms &amp; Conditions</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated &amp; effective: September 19, 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              These Terms of Service constitute a legally binding agreement between you and <strong>GlobalCart International Pte. Ltd.</strong> (Registration UEN: 202301984M), governing your access to and use of the GlobalCart platform, website, and related services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Marketplace Structure &amp; Buyer Protection</h2>
            <p className="text-muted-foreground">
              GlobalCart operates as a premier multi-merchant e-commerce platform connecting verified independent sellers with consumers worldwide. All transactions conducted on the platform benefit from our <strong>Buyer Protection Policy</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Guaranteed Authentic Goods:</strong> Sellers are prohibited from listing counterfeit or infringing items.</li>
              <li><strong>Fulfillment Tracking:</strong> Every order must include verifiable logistics tracking.</li>
              <li><strong>Escrow Settlement:</strong> Merchant payouts are governed by delivery confirmation to protect buyer funds.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Pricing, Payments &amp; Currency</h2>
            <p className="text-muted-foreground text-xs">
              Prices displayed on the platform are in USD unless otherwise specified. We accept payments via major credit/debit cards (Visa, MasterCard, American Express), digital wallets (Apple Pay, Google Pay), and approved cryptocurrency rails. All charges are securely processed using encrypted payment tokenization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Shipping, Delivery &amp; Risk of Loss</h2>
            <p className="text-muted-foreground text-xs">
              Orders are dispatched by the respective seller or logistics warehouse within the stated handling timeframe. Risk of loss passes to the buyer upon recorded delivery by the carrier at the designated address. If a parcel is lost in transit, GlobalCart customer support will initiate a carrier investigation and process an immediate replacement or refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Returns, Replacements &amp; Refunds</h2>
            <p className="text-muted-foreground text-xs">
              Buyers may request a return or refund for items that arrive damaged, defective, or significantly not as described within 14 days of delivery. Refer to our <a href="/returns-refunds" className="text-primary underline">Return &amp; Refund Policy</a> for complete instructions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Intellectual Property &amp; DMCA Compliance</h2>
            <p className="text-muted-foreground text-xs">
              All trademarks, product graphics, software code, and brand assets are protected under international copyright and trademark conventions. For DMCA notices, email: <span className="font-semibold text-primary">legal@globalcart-onlineshop.com</span>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Governing Law &amp; Dispute Resolution</h2>
            <p className="text-muted-foreground text-xs">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of Singapore, without regard to conflict of law principles. Any dispute arising out of or in connection with this agreement shall be subject to the exclusive jurisdiction of the Singapore International Arbitration Centre (SIAC) or local courts.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
