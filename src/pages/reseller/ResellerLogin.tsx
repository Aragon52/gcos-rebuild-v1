import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router-compat";
import { useReseller } from "@/lib/reseller-context-hooks";
import SEO from "@/components/SEO";
import { Headset, Mail, Lock, Eye, EyeOff, CheckCircle2, Sparkles, LogIn, ArrowRight } from "lucide-react";
import { resellerPath } from "@/lib/subdomain";
import LogoIcon from "@/components/brand/LogoIcon";
import resellerBg from "@/assets/reseller_bg.png";
import { useTranslation } from "react-i18next";
import SupportChatDialog from "@/components/messaging/SupportChatDialog";
import { toast } from "sonner";
import AuthProgressBanner from "@/components/reseller/AuthProgressBanner";
import { useGlobalLoading } from "@/lib/global-loading-store";

export default function ResellerLogin() {
  const loginBgImg = resellerBg;
  const { login } = useReseller();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading: isGlobalLoading, runWithTransitions } = useGlobalLoading();
  const [searchParams] = useSearchParams();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const loading = submitting || isGlobalLoading;
  const referralCode = searchParams.get('ref') || '';

  // Real-time completeness check
  const isFormValid = useMemo(() => {
    return emailOrPhone.trim().length >= 3 && password.length >= 6;
  }, [emailOrPhone, password]);

  const handleForgotPassword = async () => {
    if (!emailOrPhone || emailOrPhone.includes('+') || !emailOrPhone.includes('@')) {
      setError(t("reseller.enterEmailForReset", { defaultValue: "Please enter a valid email to reset password" }));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch('/api/reseller/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone }),
      });
      if (response.ok) {
        setResetSent(true);
        toast.success(t("reseller.resetRequestSent", { defaultValue: "Password reset instructions requested" }));
        setShowSupport(true);
      } else {
        const data = await response.json();
        setError(data.error || t("reseller.resetRequestFailed", { defaultValue: "Reset request failed" }));
      }
    } catch (err) {
      console.error(err);
      setError(t("reseller.resetRequestFailed", { defaultValue: "Reset request failed" }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      setError(t("reseller.allFieldsRequired", { defaultValue: "All fields are required" }));
      return;
    }

    setSubmitting(true);
    setError("");
    const normalizedEmail = emailOrPhone.toLowerCase().trim();

    try {
      const success = await runWithTransitions("login", async () => {
        return await login(normalizedEmail, password);
      }, { minDurationMs: 2000 });

      if (success) {
        navigate(resellerPath("/reseller/dashboard"));
      } else {
        setError(t("reseller.invalidCredentials", { defaultValue: "Invalid login credentials. Please verify and try again." }));
      }
    } catch (err: any) {
      setError(err?.message || t("reseller.invalidCredentials", { defaultValue: "Invalid login credentials. Please verify and try again." }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${loginBgImg})` }}
    >
      <SEO
        title="Reseller Sign In"
        description="Sign in to your GCOS Reseller Portal to manage your shop, fulfill orders, customize themes, and track earnings."
        portal="reseller"
        noindex={false}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-6 sm:p-7 shadow-2xl">
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
          <p className="text-sm text-white/70">{t("reseller.signInToPortal", { defaultValue: "Sign in to your merchant portal" })}</p>
        </div>

        {/* Animated Progress Banner During Login */}
        {loading && (
          <AuthProgressBanner
            isLoading={loading}
            variant="login"
          />
        )}

        {/* Real-time readiness status badge before submission */}
        {!loading && isFormValid && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2 text-xs font-semibold text-emerald-300 animate-pulse shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Ready! Click Sign In to connect to your dashboard.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-red-300 text-center bg-red-500/20 border border-red-500/30 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("reseller.emailOrPhone", { defaultValue: "Email or Phone" })}</label>
            <div className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-2.5 bg-white/10 focus-within:ring-2 focus-within:ring-white/30 transition-all">
              <Mail className="h-4 w-4 text-white/40 shrink-0" />
              <input 
                disabled={loading}
                type="text" 
                value={emailOrPhone} 
                onChange={e => setEmailOrPhone(e.target.value)} 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/40" 
                placeholder="you@example.com or +1234567890" 
              />
              {emailOrPhone.trim().length >= 3 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("auth.password", { defaultValue: "Password" })}</label>
            <div className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-2.5 bg-white/10 focus-within:ring-2 focus-within:ring-white/30 transition-all">
              <Lock className="h-4 w-4 text-white/40 shrink-0" />
              <input 
                disabled={loading}
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/40" 
                placeholder="••••••••" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4 text-white/40" /> : <Eye className="h-4 w-4 text-white/40" />}
              </button>
            </div>
          </div>

          {/* Lit-up Dynamic Sign In Button */}
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
                Connecting & Synchronizing...
              </span>
            ) : isFormValid ? (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4 animate-pulse" />
              </span>
            ) : (
              <span>{t("auth.signIn", { defaultValue: "Sign In" })}</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/60">
          {t("auth.forgotPassword", { defaultValue: "Forgot your password?" })}{" "}
          <button 
            type="button"
            onClick={handleForgotPassword} 
            className="text-white hover:underline font-medium"
          >
            {t("common.clickHere", { defaultValue: "Click here" })}
          </button>
        </p>
        
        <p className="text-center text-xs text-white/60">
          {t("auth.noAccount", { defaultValue: "Don't have an account?" })}{" "}
          <Link 
            to={resellerPath(`/reseller/register${referralCode ? `?ref=${referralCode}` : ''}`)}
            className="text-white hover:underline font-medium"
          >
            {t("reseller.joinAsReseller", { defaultValue: "Join as a Reseller" })}
          </Link>
        </p>
      </div>

      <SupportChatDialog 
        open={showSupport} 
        onClose={() => setShowSupport(false)} 
        userName={emailOrPhone ? emailOrPhone : undefined}
      />
    </div>
  );
}
