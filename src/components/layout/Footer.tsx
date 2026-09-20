import { useState, useEffect } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { 
  FileText, RotateCcw, Settings, ShieldAlert, Mail, MapPin, Phone, 
  ShieldCheck, Lock, CreditCard, Award, HelpCircle, Building2, CheckCircle2 
} from "lucide-react";
import LogoIcon from "@/components/brand/LogoIcon";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { resellerPath } from "@/lib/subdomain";

interface ContentLink {
  label: string;
  url: string;
}

export default function Footer() {
  const { t } = useTranslation();
  const [contentLinks, setContentLinks] = useState<ContentLink[]>([]);
  const [searchParams] = useSearchParams();

  const referralCode = searchParams.get("ref") || "";

  const [isDev, setIsDev] = useState(false);
  useEffect(() => {
    setIsDev(
      window.location.hostname.includes("ais-dev-") ||
      window.location.hostname.includes("ais-pre-") ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  }, []);

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Contact & Support", href: "/contact" },
    { label: "FAQ & Trust Center", href: "/faq" },
    { label: "Verification & Compliance", href: "/verification-compliance" },
    { label: "Legal Notice & Impressum", href: "/legal" },
    ...(isDev
      ? [
          { label: "Admin Portal", href: "/admin" },
          { label: "Reseller Portal", href: "/reseller" },
        ]
      : []),
  ];

  const documentationLinks = [
    { label: "Shipping & Delivery", href: "/shipping-policy" },
    { label: "Returns & Refund Policy", href: "/returns-refunds" },
    { label: "Payment Security & PCI-DSS", href: "/payment-policy" },
    { label: t("footer.termsOfService"), href: "/terms" },
    { label: t("footer.privacyPolicy"), href: "/privacy" },
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("label, value")
          .eq("category", "Content")
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          const links = data.map((item) => ({
            label: item.label,
            url: item.value,
          }));
          setContentLinks(links);
        }
      } catch (error) {
        console.error("Error fetching footer links:", error);
      }
    };
    fetch();
  }, []);

  return (
    <footer className="pb-20 md:pb-0">
      {/* Trust & Verification Strip */}
      <section className="border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/60">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">Verified Merchants</div>
                <div className="text-[10px] text-muted-foreground">100% KYC & SLA Audited</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/60">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 flex-shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">256-Bit SSL Encryption</div>
                <div className="text-[10px] text-muted-foreground">PCI-DSS Level 1 Gateway</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/60">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 flex-shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">Buyer Protection</div>
                <div className="text-[10px] text-muted-foreground">Guaranteed Delivery &amp; Refunds</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/60">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 flex-shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">Secure Payments</div>
                <div className="text-[10px] text-muted-foreground">Visa, MC, ApplePay &amp; Crypto</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main dark footer */}
      <section style={{ backgroundColor: "hsl(var(--footer-bg))" }}>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* Brand + Corporate Identity */}
            <div className="md:col-span-1 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <LogoIcon variant="footer" />
              </Link>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--footer-text))" }}>
                GlobalCart International Pte. Ltd. is an officially registered marketplace operator providing transparent, high-security global retail infrastructure.
              </p>
              
              <div className="pt-2 text-xs space-y-1.5" style={{ color: "hsl(var(--footer-text))" }}>
                <div className="font-mono text-[11px] text-white/90">UEN: 202301984M</div>
                <div className="font-mono text-[11px] text-white/90">GST / Tax: SG202301984M</div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>SSL &amp; Domain Verified</span>
                </div>
              </div>
            </div>

            {/* Corporate & Trust Pages */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--footer-heading))" }}>
                Trust &amp; Company
              </h4>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs hover:text-white transition-colors"
                      style={{ color: "hsl(var(--footer-text))" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Compliance Policies */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--footer-heading))" }}>
                Legal &amp; Consumer Policies
              </h4>
              <ul className="space-y-2.5">
                {documentationLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs hover:text-white transition-colors"
                      style={{ color: "hsl(var(--footer-text))" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {contentLinks
                  .filter((link) => !documentationLinks.some((doc) => doc.label === link.label))
                  .map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:text-white transition-colors"
                        style={{ color: "hsl(var(--footer-text))" }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Corporate Contact Info & Reseller Program */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--footer-heading))" }}>
                Corporate Contact
              </h4>
              <div className="space-y-3 text-xs" style={{ color: "hsl(var(--footer-text))" }}>
                <div className="flex gap-2.5">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                  <div className="leading-tight">
                    <p className="font-semibold text-white/90">Global Headquarters</p>
                    <p className="mt-0.5 text-[11px]">30 Cecil Street #21-05, Singapore 048716</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-white/90">Customer Support</p>
                    <p className="mt-0.5 text-[11px]">support@globalcart-onlineshop.com</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-white/90">Direct Hotline</p>
                    <p className="mt-0.5 text-[11px] font-mono">+65 6800 4200 (24/7)</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h5 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--footer-heading))" }}>
                  {t("reseller.partnership")}
                </h5>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--footer-text))" }}>
                  {t("common.becomeReseller")}{" "}
                  <Link
                    to={resellerPath(`/reseller/register${referralCode ? `?ref=${referralCode}` : ""}`)}
                    className="font-bold text-secondary hover:underline"
                  >
                    {t("common.learnMore")}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright and Legal Notice */}
          <div className="mt-12 border-t border-white/10 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-[11px]" style={{ color: "hsl(var(--footer-text))" }}>
              <p>
                &copy; 2026 GlobalCart International Pte. Ltd. All rights reserved. Registered in Singapore (UEN: 202301984M).
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/legal" className="hover:underline">Legal Notice</Link>
                <span>&bull;</span>
                <Link to="/terms" className="hover:underline">Terms of Service</Link>
                <span>&bull;</span>
                <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                <span>&bull;</span>
                <Link to="/payment-policy" className="hover:underline">Payment Security</Link>
                <span>&bull;</span>
                <Link to="/faq" className="hover:underline">FAQ</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
