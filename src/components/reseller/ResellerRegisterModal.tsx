import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useReseller } from "@/lib/reseller-context-hooks";
import { User, Mail, Lock, Eye, EyeOff, Tag, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import LogoIcon from "@/components/brand/LogoIcon";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAppModeDriven, PortalType, resellerPath } from "@/lib/subdomain";
import { useTranslation } from "react-i18next";
import resellerBg from "@/assets/reseller_bg.png";
import AuthProgressBanner from "@/components/reseller/AuthProgressBanner";
import { useGlobalLoading } from "@/lib/global-loading-store";

interface ResellerRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialReferralCode?: string;
}

export default function ResellerRegisterModal({ open, onOpenChange, initialReferralCode = "" }: ResellerRegisterModalProps) {
  const { t } = useTranslation();
  const { register } = useReseller();
  const navigate = useNavigate();
  const { isLoading: isGlobalLoading, runWithTransitions } = useGlobalLoading();
  const [form, setForm] = useState({ firstName: "", lastName: "", emailOrPhone: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const loading = submitting || isGlobalLoading;

  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const isFormValid = useMemo(() => {
    return (
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      form.emailOrPhone.trim().length >= 3 &&
      form.password.length >= 6 &&
      confirmPassword === form.password
    );
  }, [form, confirmPassword]);

  const switchPortal = (p: PortalType) => {
    if (isAppModeDriven()) {
      localStorage.setItem("dev_portal_override", p);
      window.location.href = "/reseller/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.emailOrPhone || !form.password) {
      setError(t('auth.allFieldsRequired', { defaultValue: "All fields are required" }));
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch', { defaultValue: "Passwords do not match" }));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await runWithTransitions("signup", async () => {
        return await register({ ...form, shopName: `${form.firstName}'s Store`, referralCode });
      }, { minDurationMs: 2200 });

      if (result.success) {
        onOpenChange(false);
        if (isAppModeDriven()) {
          switchPortal("reseller");
        } else {
          navigate(resellerPath("/reseller/dashboard"));
        }
      } else {
        setError(result.error || t('auth.registrationFailed', { defaultValue: "Registration failed. Please try again." }));
      }
    } catch (err: any) {
      setError(err?.message || t('auth.registrationFailed', { defaultValue: "Registration failed. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[460px] p-0 overflow-hidden bg-[#0A0A0A] border-white/10 text-white relative max-h-[90vh] flex flex-col shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
          style={{ backgroundImage: `url(${resellerBg})` }}
        />
        <div className="absolute inset-0 bg-black/70 pointer-events-none" />
        
        <div className="relative z-10 p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          <VisuallyHidden>
            <DialogTitle>{t('reseller.becomeReseller', { defaultValue: "Become a Reseller" })}</DialogTitle>
            <DialogDescription>{t('reseller.startPartnership', { defaultValue: "Start your merchant partnership" })}</DialogDescription>
          </VisuallyHidden>
          
          <div className="text-center space-y-2">
            <LogoIcon size={44} className="mx-auto" />
            <h2 className="text-xl font-bold text-white">{t('reseller.becomeReseller', { defaultValue: "Become a Reseller" })}</h2>
            <p className="text-sm text-white/60">{t('reseller.startPartnership', { defaultValue: "Start your reseller partnership today" })}</p>
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
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2 text-xs font-semibold text-emerald-300 animate-pulse shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Ready! Click Create Account to start your shop setup.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <p className="text-xs text-red-400 text-center bg-red-400/10 py-2.5 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-white/70">{t('reseller.firstName', { defaultValue: "First Name" })}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input 
                    disabled={loading}
                    value={form.firstName} 
                    onChange={e => set("firstName", e.target.value)} 
                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-white text-sm" 
                    placeholder="John" 
                  />
                  {form.firstName.trim() && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-white/70">{t('reseller.lastName', { defaultValue: "Last Name" })}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input 
                    disabled={loading}
                    value={form.lastName} 
                    onChange={e => set("lastName", e.target.value)} 
                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-white text-sm" 
                    placeholder="Doe" 
                  />
                  {form.lastName.trim() && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-white/70">{t('auth.emailOrPhone', { defaultValue: "Email or Phone" })}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  disabled={loading}
                  type="text" 
                  value={form.emailOrPhone} 
                  onChange={e => set("emailOrPhone", e.target.value)} 
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-white text-sm" 
                  placeholder="you@example.com or +1234567890" 
                />
                {form.emailOrPhone.trim().length >= 3 && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-white/70">{t('auth.password', { defaultValue: "Password" })}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  disabled={loading}
                  type={showPassword ? "text" : "password"} 
                  value={form.password} 
                  onChange={e => set("password", e.target.value)} 
                  className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-primary/50 text-white text-sm" 
                  placeholder="At least 6 characters" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="h-4 w-4 text-white/30" /> : <Eye className="h-4 w-4 text-white/30" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-white/70">{t('auth.confirmPassword', { defaultValue: "Confirm Password" })}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  disabled={loading}
                  type={showConfirm ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-primary/50 text-white text-sm" 
                  placeholder="Confirm password" 
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirm ? <EyeOff className="h-4 w-4 text-white/30" /> : <Eye className="h-4 w-4 text-white/30" />}
                </button>
              </div>
              {confirmPassword && confirmPassword === form.password && (
                <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>

            {referralCode && (
              <div className="space-y-1">
                <Label className="text-xs font-medium text-white/70">{t('reseller.referralCode', { defaultValue: "Referral Code" })}</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <div className="pl-10 h-10 flex items-center bg-white/5 border border-white/10 rounded-md text-primary font-bold cursor-not-allowed select-all text-sm">
                    {referralCode}
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-primary">{t('reseller.referralApplied', { defaultValue: "Referral applied" })}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading} 
              className={`w-full relative flex items-center justify-center gap-2 rounded-xl py-6 font-bold text-sm transition-all shadow-lg overflow-hidden ${
                isFormValid && !loading
                  ? "bg-gradient-to-r from-primary via-emerald-400 to-primary text-primary-foreground shadow-[0_0_20px_rgba(34,197,94,0.4)] ring-2 ring-primary/60 scale-[1.01] hover:brightness-110 active:scale-[0.99]"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              }`}
            >
              {isFormValid && !loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin text-white" />
                  Setting up store...
                </span>
              ) : isFormValid ? (
                <span className="flex items-center gap-2">
                  <span>Create Reseller Account</span>
                  <ArrowRight className="h-4 w-4 animate-pulse" />
                </span>
              ) : (
                <span>{showVerification ? t("reseller.resendCode", { defaultValue: "Resend Code" }) : t('reseller.createAccount', { defaultValue: "Create Account" })}</span>
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-xs text-white/50">
              {t('auth.hasAccount', { defaultValue: "Already have an account?" })}{" "}
              <button 
                onClick={() => {
                  onOpenChange(false);
                  if (isAppModeDriven()) {
                    switchPortal("reseller");
                  } else {
                    navigate(resellerPath("/reseller/login"));
                  }
                }} 
                className="text-white hover:underline font-medium"
              >
                {t('reseller.signIn', { defaultValue: "Sign In" })}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
