import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router-compat";
import { useReseller } from "@/lib/reseller-context-hooks";
import SEO from "@/components/SEO";
import { Headset, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { resellerPath } from "@/lib/subdomain";
import LogoIcon from "@/components/brand/LogoIcon";
import resellerBg from "@/assets/images/shopping_complex_mall_1790263022364.jpg";
import { useTranslation } from "react-i18next";
import SupportChatDialog from "@/components/messaging/SupportChatDialog";
import { toast } from "sonner";

export default function ResellerLogin() {
  const loginBgImg = resellerBg;
  const { login } = useReseller();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const referralCode = searchParams.get('ref') || '';

  const handleForgotPassword = async () => {
    if (!emailOrPhone.trim()) {
      setError(t("reseller.enterEmailOrPhoneForReset", { defaultValue: "Please enter your email or phone number above to reset password" }));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch('/api/reseller/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: emailOrPhone.trim() }),
      });
      if (response.ok) {
        setResetSent(true);
        toast.success(t("reseller.resetRequestSent", { defaultValue: "Password reset request submitted. Support team notified." }));
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
      const success = await login(normalizedEmail, password);

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
        
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-sm">
            <LogoIcon size={52} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5 font-poppins">
            <span className="text-[#F1C40F]">Global</span>
            <span className="text-[#2ECC71]">Cart</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90 bg-white/15 px-2 py-0.5 rounded-full ml-1 border border-white/20">
              Reseller
            </span>
          </h1>
          <p className="text-xs text-white/70">{t("reseller.signInToPortal", { defaultValue: "Sign in to your merchant portal" })}</p>
        </div>

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
                disabled={submitting}
                type="text" 
                value={emailOrPhone} 
                onChange={e => setEmailOrPhone(e.target.value)} 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/40" 
                placeholder="you@example.com or +1234567890" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/80 mb-1 block">{t("auth.password", { defaultValue: "Password" })}</label>
            <div className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-2.5 bg-white/10 focus-within:ring-2 focus-within:ring-white/30 transition-all">
              <Lock className="h-4 w-4 text-white/40 shrink-0" />
              <input 
                disabled={submitting}
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

          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-md"
          >
            {submitting ? (
              <span>{t("common.submitting", { defaultValue: "Signing in..." })}</span>
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

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/50 pt-2 border-t border-white/10">
          <LogoIcon size={14} />
          <span>GlobalCart Merchant Protection & Instant Access</span>
        </div>
      </div>

      <SupportChatDialog 
        open={showSupport} 
        onClose={() => setShowSupport(false)} 
        userName={emailOrPhone ? emailOrPhone : undefined}
      />
    </div>
  );
}
