import { useState, useEffect } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useReseller } from "@/lib/reseller-context-hooks";
import SEO from "@/components/SEO";
import { Headset, User, Mail, Lock, Eye, EyeOff, Tag } from "lucide-react";
import { resellerPath } from "@/lib/subdomain";
import LogoIcon from "@/components/brand/LogoIcon";
import resellerBg from "@/assets/reseller_bg.png";
import { useTranslation } from "react-i18next";
import SupportChatDialog from "@/components/messaging/SupportChatDialog";

export default function ResellerRegister() {
  const loginBg = resellerBg;
  const { register } = useReseller();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useState(
    () => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search),
  );
  const [form, setForm] = useState({ firstName: "", lastName: "", emailOrPhone: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.emailOrPhone || !form.password) {
      setError(t("reseller.allFieldsRequired", { defaultValue: "All fields are required" }));
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== confirmPassword) {
      setError(t("reseller.passwordsDoNotMatch", { defaultValue: "Passwords do not match" }));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await register({ ...form, referralCode });

      if (result.success) {
        navigate(resellerPath("/reseller/dashboard"));
      } else {
        setError(result.error || t("reseller.registrationFailed", { defaultValue: "Registration failed. Please try again." }));
      }
    } catch (err: any) {
      setError(err?.message || t("reseller.registrationFailed", { defaultValue: "Registration failed. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  };

  const inputBoxClass = "flex items-center gap-2 border border-white/20 rounded-lg px-3 py-2.5 bg-white/10 focus-within:ring-2 focus-within:ring-white/30 transition-all";
  const inputClass = "bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/40";
  const iconClass = "h-4 w-4 text-white/40 shrink-0";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <SEO
        title="Become a Reseller - Open Your Global Store"
        description="Launch your digital storefront with zero upfront inventory on GCOS. Instant setup, profit sharing, and marketing boost tools."
        portal="reseller"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-6 sm:p-7 shadow-2xl">
        <button 
          type="button" 
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors" 
          title={t("common.support", { defaultValue: "Support" })}
          onClick={() => setShowSupport(true)}
        >
          <Headset className="h-5 w-5" />
        </button>
        
        <div className="text-center">
          <LogoIcon size={48} className="mx-auto" />
          <h1 className="text-xl font-bold text-white mt-3">GlobalCart Online Shop</h1>
          <p className="text-sm text-white/70">{t("reseller.startResellingToday", { defaultValue: "Create your merchant shop in seconds" })}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-xs text-red-300 text-center bg-red-500/20 border border-red-500/30 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/80 mb-1 block">{t("reseller.firstName", { defaultValue: "First Name" })}</label>
              <div className={inputBoxClass}>
                <User className={iconClass} />
                <input
                  disabled={submitting}
                  value={form.firstName} 
                  onChange={e => set("firstName", e.target.value)} 
                  className={inputClass} 
                  placeholder="John" 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-white/80 mb-1 block">{t("reseller.lastName", { defaultValue: "Last Name" })}</label>
              <div className={inputBoxClass}>
                <User className={iconClass} />
                <input 
                  disabled={submitting}
                  value={form.lastName} 
                  onChange={e => set("lastName", e.target.value)} 
                  className={inputClass} 
                  placeholder="Doe" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("reseller.emailOrPhone", { defaultValue: "Email or Phone" })}</label>
            <div className={inputBoxClass}>
              <Mail className={iconClass} />
              <input 
                disabled={submitting}
                type="text" 
                value={form.emailOrPhone} 
                onChange={e => set("emailOrPhone", e.target.value)} 
                className={inputClass} 
                placeholder="you@example.com or +1234567890" 
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("auth.password", { defaultValue: "Password" })}</label>
            <div className={inputBoxClass}>
              <Lock className={iconClass} />
              <input 
                disabled={submitting}
                type={showPassword ? "text" : "password"} 
                value={form.password} 
                onChange={e => set("password", e.target.value)} 
                className={inputClass} 
                placeholder="At least 6 characters" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className={iconClass} /> : <Eye className={iconClass} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("auth.confirmPassword", { defaultValue: "Confirm Password" })}</label>
            <div className={inputBoxClass}>
              <Lock className={iconClass} />
              <input 
                disabled={submitting}
                type={showConfirm ? "text" : "password"} 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className={inputClass} 
                placeholder="Confirm password" 
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff className={iconClass} /> : <Eye className={iconClass} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("reseller.referralCode", { defaultValue: "Referral Code (Optional)" })}</label>
            <div className={inputBoxClass}>
              <Tag className={iconClass} />
              <input 
                disabled={submitting}
                value={referralCode} 
                onChange={e => setReferralCode(e.target.value)} 
                className={inputClass} 
                placeholder={t("reseller.enterReferralCode", { defaultValue: "Referral code (if any)" })} 
                readOnly={!!searchParams.get("ref")}
              />
            </div>
            {referralCode && (
              <p className="mt-1 text-[11px] text-primary">{t("reseller.referralCodeApplied", { defaultValue: "Referral code applied" })}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-md"
          >
            {submitting ? (
              <span>{t("common.submitting", { defaultValue: "Setting up store..." })}</span>
            ) : (
              <span>{t("reseller.createAccount", { defaultValue: "Create Account" })}</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/60">
          {t("auth.hasAccount", { defaultValue: "Already have an account?" })}{" "}
          <Link to={resellerPath("/reseller/login")} className="text-white hover:underline font-medium">
            {t("auth.signIn", { defaultValue: "Sign In" })}
          </Link>
        </p>
      </div>

      <SupportChatDialog 
        open={showSupport} 
        onClose={() => setShowSupport(false)} 
        userName={form.firstName ? `${form.firstName} ${form.lastName}` : undefined}
      />
    </div>
  );
}
