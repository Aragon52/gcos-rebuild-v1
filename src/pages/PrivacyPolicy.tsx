import React from "react";
import SEO from "@/components/SEO";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, Mail, Building2, AlertTriangle, Briefcase } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO
        title="Privacy Policy & Demo Project Disclosure - GlobalCart"
        description="GlobalCart International Pte. Ltd. Privacy Policy, Data Protection Principles, and Demonstration / Business Investor Pilot Scope Notice."
        canonical="https://globalcart-onlineshop.com/privacy"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Privacy Policy", item: "/privacy" },
        ]}
      />

      <article className="space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trust, Data Privacy &amp; Legal Scope</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated &amp; effective: September 24, 2026</p>
        </div>

        {/* Demo Project & Investor Showcase Notice */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Briefcase className="h-5 w-5 flex-shrink-0" />
            <span>Demonstration Project &amp; Investor Showcase Disclosure</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This entire application, platform, and operating environment (GlobalCart Online Shop / GCOS) is built and maintained solely as a comprehensive <strong>demonstration project and technology pilot</strong>. Its primary objective is to demonstrate, evaluate, and introduce a complete, operating headless e-commerce application architecture and multi-tier operational line-ups for the purpose of <strong>seeking business investor partnerships, strategic collaborators, and commercial evaluations</strong>.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Simulated Environment &amp; Non-Financial Notice:</strong> Interacting with this platform involves no real financial transactions, binding commercial sales, or live monetary deals. All data processed during testing and demonstrations is strictly handled in accordance with privacy safeguards outlined below.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Commitment to Data Sovereignty:</strong> GlobalCart International Pte. Ltd. respects user privacy and enforces technical principles aligned with the General Data Protection Regulation (GDPR, EU 2016/679), the California Consumer Privacy Act (CCPA), and the Singapore Personal Data Protection Act (PDPA 2012).
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Data Controller Identification</h2>
            <p className="text-muted-foreground">
              The data controller responsible for personal information and demonstration records is:
            </p>
            <div className="bg-card border border-border p-4 rounded-xl text-xs space-y-1 text-muted-foreground">
              <p><strong className="text-foreground">Company / Organization:</strong> GlobalCart International Pte. Ltd.</p>
              <p><strong className="text-foreground">Registration Reference (UEN):</strong> 202301984M</p>
              <p><strong className="text-foreground">Corporate Office:</strong> 30 Cecil Street #21-05, Prudential Tower, Singapore 048716</p>
              <p><strong className="text-foreground">Data Protection &amp; Investor Desk:</strong> dpo@globalcart-onlineshop.com / legal@globalcart-onlineshop.com</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Scope of Data Collection in Demo Environment</h2>
            <p className="text-muted-foreground">
              In this operational demonstration environment, information is collected solely to simulate and illustrate full headless marketplace lifecycle features:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Contact &amp; Profile Data:</strong> Name, test email address, phone number, and simulated delivery coordinates.</li>
              <li><strong>Mock Order &amp; Transaction Telemetry:</strong> Simulated cart checkouts, demo order states, tracking numbers, and fulfillment receipts.</li>
              <li><strong>Technical Logs &amp; Security Verification:</strong> IP address, device headers, browser user-agents, and timestamp diagnostics to demonstrate platform security capabilities.</li>
              <li><strong>Reseller &amp; Merchant Applications:</strong> Test partner onboarding inputs and mock verification files to showcase merchant onboarding pipelines.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Lawful Basis and Processing Intent</h2>
            <p className="text-muted-foreground">
              We process data under the following legitimate grounds:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Demonstration &amp; Architecture Evaluation:</strong> Demonstrating full-stack cart, checkout, merchant SLA, ARS, and automated operational features.</li>
              <li><strong>Security &amp; Abuse Prevention:</strong> Safeguarding the demonstration infrastructure against unauthorized intrusion, denial of service, or scraping.</li>
              <li><strong>Investor &amp; Partner Inquiries:</strong> Processing contact communications from potential investors, enterprise licensees, and retail partners.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Payment Security &amp; Absence of Real Financial Charges</h2>
            <p className="text-muted-foreground text-xs">
              This application is configured with simulated and sandbox payment tokenization. <strong>No real financial transactions, live credit card billings, or actual bank debits are conducted.</strong> All payment workflows demonstrate PCI-DSS Level 1 compliant structures, tokenized handling, and 3D Secure 2.0 biometric flows in a risk-free demonstration environment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Your Privacy Rights</h2>
            <p className="text-muted-foreground text-xs">
              Under international privacy frameworks (GDPR, CCPA, PDPA), visitors and demo participants retain complete rights over their data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-card">
                <strong className="text-foreground">Right of Access:</strong> Request a complete export of any test account or profile data.
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <strong className="text-foreground">Right to Erasure ("To Be Forgotten"):</strong> Request immediate purging of test data and logs.
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <strong className="text-foreground">Right to Rectification:</strong> Update or correct any demo profile information.
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <strong className="text-foreground">Right to Object:</strong> Opt out of demonstration communications at any time.
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Contact for Privacy &amp; Investor Inquiries</h2>
            <p className="text-muted-foreground text-xs">
              To submit data requests or for questions regarding the commercial rollout and investment opportunities of this headless e-commerce architecture, contact:
              <br />
              <span className="font-semibold text-primary">legal@globalcart-onlineshop.com</span> or <span className="font-semibold text-primary">investors@globalcart-onlineshop.com</span>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
