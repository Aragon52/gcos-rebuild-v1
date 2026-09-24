import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useReseller } from "@/lib/reseller-context-hooks";
import { User, Mail, Lock, Eye, EyeOff, Tag } from "lucide-react";
import LogoIcon from "@/components/brand/LogoIcon";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAppModeDriven, PortalType, resellerPath } from "@/lib/subdomain";
import { useTranslation } from "react-i18next";
import resellerBg from "@/assets/images/shopping_complex_mall_1790263022364.jpg";

interface ResellerRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialReferralCode?: string;
}

export default function ResellerRegisterModal({ open, onOpenChange, initialReferralCode = "" }: ResellerRegisterModalProps) {
  const { t } = useTranslation();
  const { register } = useReseller();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", emailOrPhone: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

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
    if (!agreeTerms) {
      setError(t('auth.mustAgreeTerms', { defaultValue: "Please agree to the Terms of Service & Privacy Policy to continue" }));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await register({ ...form, shopName: `${form.firstName}'s Store`, referralCode });

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
                    disabled={submitting}
                    value={form.firstName} 
                    onChange={e => set("firstName", e.target.value)} 
                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-white text-sm" 
                    placeholder="John" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-white/70">{t('reseller.lastName', { defaultValue: "Last Name" })}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input 
                    disabled={submitting}
                    value={form.lastName} 
                    onChange={e => set("lastName", e.target.value)} 
                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-white text-sm" 
                    placeholder="Doe" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-white/70">{t('auth.emailOrPhone', { defaultValue: "Email or Phone" })}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  disabled={submitting}
                  type="text" 
                  value={form.emailOrPhone} 
                  onChange={e => set("emailOrPhone", e.target.value)} 
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-white text-sm" 
                  placeholder="you@example.com or +1234567890" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-white/70">{t('auth.password', { defaultValue: "Password" })}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  disabled={submitting}
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
                  disabled={submitting}
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

            {/* Agreement Checkbox (Checked by default) */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-xs text-white/80 select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-primary accent-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="leading-snug text-[11px]">
                {t("auth.agreeToTermsPrefix", { defaultValue: "I agree to the" })}{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  {t("footer.termsOfService", { defaultValue: "Terms of Service" })}
                </a>
                {", "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  {t("footer.privacyPolicy", { defaultValue: "Privacy Policy" })}
                </a>
                {" "}&amp;{" "}
                <a href="/verification-compliance" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  Reseller Terms
                </a>
              </span>
            </label>

            <Button 
              type="submit" 
              disabled={submitting} 
              className="w-full rounded-xl py-6 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors shadow-md"
            >
              {submitting ? (
                <span>{t("common.submitting", { defaultValue: "Setting up store..." })}</span>
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
