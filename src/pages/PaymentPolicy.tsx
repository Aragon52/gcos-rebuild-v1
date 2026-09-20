import React from "react";
import SEO from "@/components/SEO";
import { ShieldCheck, Lock, CreditCard, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export default function PaymentPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Payment Security & PCI-DSS Policy - GlobalCart"
        description="Learn how GlobalCart International Pte. Ltd. secures payments with 256-bit SSL encryption, PCI-DSS compliance, 3D Secure 2.0, and fraud prevention."
        canonical="https://globalcart-onlineshop.com/payment-policy"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Payment Policy", item: "/payment-policy" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Financial Trust &amp; Security</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Payment Security Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated &amp; effective: September 19, 2026</p>
        </div>

        {/* Security badges summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-1">
            <Lock className="h-6 w-6 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-foreground">PCI-DSS Level 1</div>
            <div className="text-[11px] text-muted-foreground">Certified Secure Data Handling</div>
          </div>
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center space-y-1">
            <ShieldCheck className="h-6 w-6 text-blue-600 mx-auto" />
            <div className="text-xs font-bold text-foreground">3D Secure 2.0</div>
            <div className="text-[11px] text-muted-foreground">Two-Factor Bank Authentication</div>
          </div>
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center space-y-1">
            <CreditCard className="h-6 w-6 text-purple-600 mx-auto" />
            <div className="text-xs font-bold text-foreground">Tokenized Transactions</div>
            <div className="text-[11px] text-muted-foreground">Card Numbers Never Stored</div>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Accepted Payment Methods</h2>
            <p className="text-muted-foreground text-xs">
              GlobalCart supports a wide array of globally recognized payment methods to offer maximum convenience and security:
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
            <h2 className="text-xl font-bold text-foreground">2. Payment Encryption &amp; Data Protection</h2>
            <p className="text-muted-foreground text-xs">
              All payment submissions are protected by military-grade 256-bit TLS encryption. Sensitive credit and debit card information is directly transmitted to our banking gateways using secure tokenization and is never stored on our web servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Fraud Prevention &amp; Buyer Guarantee</h2>
            <p className="text-muted-foreground text-xs">
              To safeguard cardholders against unauthorized transactions, our real-time risk engine analyzes checkout telemetry for suspicious patterns. Transactions exceeding threshold safety scores undergo additional 3D Secure bank biometric or OTP verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Refund Processing Timelines</h2>
            <p className="text-muted-foreground text-xs">
              Approved refunds are credited back to the original method of payment. Processing timelines typically range from 3 to 7 business days depending on your issuing bank or card provider. Cryptocurrency refunds are remitted to the verified sender wallet within 24 hours of approval.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Billing Inquiries &amp; Support</h2>
            <p className="text-muted-foreground text-xs">
              If you notice an unfamiliar charge or have questions regarding an invoice, please contact our dedicated billing and customer support team immediately at <span className="text-primary font-semibold">billing@globalcart-onlineshop.com</span> or call <span className="font-semibold">+65 6800 4200</span>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
