import React from "react";
import SEO from "@/components/SEO";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, Mail, Building2 } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Privacy Policy - GDPR, CCPA & PDPA Compliance"
        description="GlobalCart International Pte. Ltd. Privacy Policy. Understand how we collect, safeguard, and process your personal information under international data protection laws."
        canonical="https://globalcart-onlineshop.com/privacy"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Privacy Policy", item: "/privacy" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trust &amp; Legal Compliance</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated &amp; effective: September 19, 2026</p>
        </div>

        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Commitment to Data Sovereignty:</strong> GlobalCart International Pte. Ltd. respects user privacy and complies with the General Data Protection Regulation (GDPR, EU 2016/679), the California Consumer Privacy Act (CCPA), and the Singapore Personal Data Protection Act (PDPA 2012).
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Data Controller Identification</h2>
            <p className="text-muted-foreground">
              The data controller responsible for your personal information is:
            </p>
            <div className="bg-card border border-border p-4 rounded-xl text-xs space-y-1 text-muted-foreground">
              <p><strong className="text-foreground">Company:</strong> GlobalCart International Pte. Ltd.</p>
              <p><strong className="text-foreground">Registration Number (UEN):</strong> 202301984M</p>
              <p><strong className="text-foreground">Registered Office:</strong> 30 Cecil Street #21-05, Prudential Tower, Singapore 048716</p>
              <p><strong className="text-foreground">Data Protection Officer (DPO):</strong> dpo@globalcart-onlineshop.com</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Categories of Personal Data We Collect</h2>
            <p className="text-muted-foreground">
              We collect information only as necessary to fulfill orders, ensure platform security, and provide customer support:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Contact &amp; Account Data:</strong> Name, email address, telephone number, shipping and billing address.</li>
              <li><strong>Order &amp; Transaction Data:</strong> Items purchased, order value, payment status, courier tracking IDs, and delivery receipts.</li>
              <li><strong>Technical &amp; Log Data:</strong> IP address, device type, browser specifications, operating system, and timestamp data for fraud prevention.</li>
              <li><strong>Verification Information:</strong> For verified merchants and high-value orders, business registration proofs or government-issued credentials as legally required.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Lawful Basis and Purpose of Processing</h2>
            <p className="text-muted-foreground">
              We process your personal information under the following lawful bases:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Contractual Necessity:</strong> Processing payments, coordinating warehouse fulfillment, and delivering products.</li>
              <li><strong>Legal Obligation:</strong> Complying with tax reporting, anti-money laundering (AML), and consumer warranty regulations.</li>
              <li><strong>Legitimate Interests:</strong> Preventing fraud, safeguarding platform infrastructure, and resolving transaction disputes.</li>
              <li><strong>Consent:</strong> Sending promotional updates or optional newsletter communications (you may withdraw consent at any time).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Payment Security &amp; Tokenization</h2>
            <p className="text-muted-foreground text-xs">
              We do not store complete credit card or debit card numbers on our servers. All transactions are securely routed through PCI-DSS Level 1 certified payment gateways and encrypted with 256-bit TLS/SSL protocols.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Your Data Protection Rights</h2>
            <p className="text-muted-foreground text-xs">
              Under GDPR, CCPA, and PDPA, you retain comprehensive rights over your personal data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-card">
                <strong className="text-foreground">Right of Access:</strong> Request a full copy of the personal data we hold about you.
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <strong className="text-foreground">Right to Erasure ("To Be Forgotten"):</strong> Request deletion of your personal records, subject to statutory retention laws.
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate or incomplete personal information.
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <strong className="text-foreground">Right to Data Portability:</strong> Receive your data in a structured, commonly used machine-readable format.
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Cookie Policy &amp; Tracking</h2>
            <p className="text-muted-foreground text-xs">
              We use essential cookies strictly necessary for shopping cart functionality, session authentication, and security. We do not sell your personal data to third-party data brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Contact the Privacy Team</h2>
            <p className="text-muted-foreground text-xs">
              To exercise your privacy rights or submit a data inquiry, contact our Data Protection Officer at:
            </p>
            <p className="font-semibold text-xs text-primary">
              privacy@globalcart-onlineshop.com or support@globalcart-onlineshop.com
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
