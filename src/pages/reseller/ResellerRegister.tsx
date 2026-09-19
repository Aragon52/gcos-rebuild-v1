import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useReseller } from "@/lib/reseller-context-hooks";
import SEO from "@/components/SEO";
import { Headset, User, Mail, Lock, Eye, EyeOff, Tag, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { resellerPath } from "@/lib/subdomain";
import LogoIcon from "@/components/brand/LogoIcon";
import resellerBg from "@/assets/reseller_bg.png";
import { useTranslation } from "react-i18next";
import SupportChatDialog from "@/components/messaging/SupportChatDialog";
import AuthProgressBanner from "@/components/reseller/AuthProgressBanner";
import { useGlobalLoading } from "@/lib/global-loading-store";

export default function ResellerRegister() {
  const loginBg = resellerBg;
  const { register } = useReseller();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading: isGlobalLoading, runWithTransitions } = useGlobalLoading();
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

  const loading = submitting || isGlobalLoading;

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  // Real-time completeness check
  const isFormValid = useMemo(() => {
    return (
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      form.emailOrPhone.trim().length >= 3 &&
      form.password.length >= 6 &&
      confirmPassword === form.password
    );
  }, [form, confirmPassword]);

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
      const result = await runWithTransitions("signup", async () => {
        return await register({ ...form, referralCode });
      }, { minDurationMs: 2200 });

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

        {/* Animated Progress Banner During Creation */}
        {loading && (
          <AuthProgressBanner
            isLoading={loading}
            variant="signup"
          />
        )}

        {/* Real-time readiness status badge before submission */}
        {!loading && isFormValid && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2.5 text-xs font-semibold text-emerald-300 animate-pulse shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Ready! Store setup will start when you click Create Account.</span>
          </div>
        )}

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
                  disabled={loading}
                  value={form.firstName} 
                  onChange={e => set("firstName", e.target.value)} 
                  className={inputClass} 
                  placeholder="John" 
                />
                {form.firstName.trim() && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-white/80 mb-1 block">{t("reseller.lastName", { defaultValue: "Last Name" })}</label>
              <div className={inputBoxClass}>
                <User className={iconClass} />
                <input 
                  disabled={loading}
                  value={form.lastName} 
                  onChange={e => set("lastName", e.target.value)} 
                  className={inputClass} 
                  placeholder="Doe" 
                />
                {form.lastName.trim() && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("reseller.emailOrPhone", { defaultValue: "Email or Phone" })}</label>
            <div className={inputBoxClass}>
              <Mail className={iconClass} />
              <input 
                disabled={loading}
                type="text" 
                value={form.emailOrPhone} 
                onChange={e => set("emailOrPhone", e.target.value)} 
                className={inputClass} 
                placeholder="you@example.com or +1234567890" 
              />
              {form.emailOrPhone.trim().length >= 3 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("auth.password", { defaultValue: "Password" })}</label>
            <div className={inputBoxClass}>
              <Lock className={iconClass} />
              <input 
                disabled={loading}
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
                disabled={loading}
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
            {confirmPassword && confirmPassword === form.password && (
              <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("reseller.referralCode", { defaultValue: "Referral Code (Optional)" })}</label>
            <div className={inputBoxClass}>
              <Tag className={iconClass} />
              <input 
                disabled={loading}
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

          {/* Lit-up Interactive Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all shadow-lg overflow-hidden ${
              isFormValid && !loading
                ? "bg-gradient-to-r from-primary via-emerald-400 to-primary text-primary-foreground shadow-[0_0_20px_rgba(34,197,94,0.4)] ring-2 ring-primary/60 scale-[1.01] hover:brightness-110 active:scale-[0.99]"
                : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            }`}
          >
            {isFormValid && !loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            )}
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin text-white" />
                Setting up your store...
              </span>
            ) : isFormValid ? (
              <span className="flex items-center gap-2">
                <span>Create Reseller Account</span>
                <ArrowRight className="h-4 w-4 animate-pulse" />
              </span>
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
