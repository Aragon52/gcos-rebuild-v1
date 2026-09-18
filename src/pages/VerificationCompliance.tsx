import React from "react";

export default function VerificationCompliance() {
  return (
    <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Trust and safety</p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Verification &amp; Compliance</h1>
      <p className="mb-10 text-sm text-muted-foreground">How GCOS helps keep the marketplace safe and reliable.</p>
      <div className="prose prose-slate max-w-none">
        <h2>Seller verification</h2>
        <p>GCOS may review seller identity, business details, contact information, payout details, and supporting documents before enabling marketplace activity. Verification status can be reviewed periodically or when account information changes.</p>
        <h2>Order and payment checks</h2>
        <p>We use order, payment, delivery, and account information to help prevent fraud, resolve disputes, and meet legal and operational requirements. Additional information may be requested when an order, payment, withdrawal, or account activity requires review.</p>
        <h2>Information handling</h2>
        <p>Verification information is used for trust, safety, compliance, customer support, and marketplace operations. Access is limited to personnel and service providers who need it for these purposes and handled in line with our <a href="/privacy">Privacy Policy</a>.</p>
        <h2>Customer responsibilities</h2>
        <p>Keep your account information accurate, use payment methods you are authorized to use, and respond promptly to reasonable verification requests. Never share passwords, one-time codes, or payment credentials with another person.</p>
        <h2>Questions and requests</h2>
        <p>If you need help with verification or believe your account has been reviewed incorrectly, contact support@globalcart-onlineshop.com. Include your account email and relevant order or case reference, but do not send passwords or full payment card numbers.</p>
      </div>
    </article>
  );
}
