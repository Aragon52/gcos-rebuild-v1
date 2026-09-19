import { useState, useRef, useEffect } from "react";
import { Copy, Wallet, CreditCard, Headphones, AlertTriangle, Upload, ImageIcon, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { parseSettingValue, type DepositConfig } from "@/lib/system-settings";
import { useReseller } from "@/lib/reseller-context-hooks";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OnramperWidget from "@/components/payment/OnramperWidget";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const cryptoIcons = [
  { name: "BNB", icon: "/crypto/bnb.svg" },
  { name: "BTC", icon: "/crypto/btc.svg" },
  { name: "USDT", icon: "/crypto/usdt.svg" },
  { name: "ETH", icon: "/crypto/eth.svg" },
  { name: "XRP", icon: "/crypto/xrp.svg" },
  { name: "SOL", icon: "/crypto/sol.svg" },
  { name: "ADA", icon: "/crypto/ada.svg" },
  { name: "DOT", icon: "/crypto/dot.svg" },
];

const DEFAULT_DEPOSIT_ADDRESS = "TXrk2qEkPFwSzGYvRmpCkyFbPFCSFdBu8K";

interface ResellerDepositSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional amount used to pre-fill the deposit field when the sheet opens. */
  initialAmount?: string;
  /** Initial tab to open ("card" | "crypto" | "local") */
  defaultTab?: "card" | "crypto" | "local";
}

export default function ResellerDepositSheet({ open, onOpenChange, initialAmount, defaultTab = "card" }: ResellerDepositSheetProps) {
  const { reseller } = useReseller();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [depositAddress, setDepositAddress] = useState(DEFAULT_DEPOSIT_ADDRESS);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Deposit Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        let configData: DepositConfig | null = null;

        if (reseller?.memberOfAdminId) {
          const { data } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", `deposit_config_${reseller.memberOfAdminId}`)
            .maybeSingle();
          configData = parseSettingValue<DepositConfig>(data?.value);
        }

        if (!configData) {
          const { data } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "deposit_config")
            .maybeSingle();
          configData = parseSettingValue<DepositConfig>(data?.value);
        }

        if (configData) {
          if (configData.usdtAddress) setDepositAddress(configData.usdtAddress);
          if (configData.qrCodeUrl) setQrCodeUrl(configData.qrCodeUrl);
        }
      } catch (error) {
        console.error("Error fetching deposit config:", error);
      }
    };
    if (open) {
      fetchConfig();
    }
  }, [open, reseller?.memberOfAdminId]);

  // Pre-fill the amount when the sheet is opened with a suggested value
  useEffect(() => {
    if (open && initialAmount) setDepositAmount(initialAmount);
    if (open && defaultTab) setActiveTab(defaultTab);
  }, [open, initialAmount, defaultTab]);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(depositAddress);
    setWalletCopied(true);
    toast({ title: t("common.copied"), description: t("common.walletCopiedDesc") });
    setTimeout(() => setWalletCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("common.fileTooLarge"), description: t("common.imageUnder5MB"), variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      setScreenshotName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDeposit = async () => {
    if (!reseller) return;
    setSubmitting(true);
    
    try {
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({ title: t("common.invalidAmount"), description: t("common.enterValidAmount"), variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const proofImageUrl = screenshot || "";

      const { error } = await supabase
        .from("deposit_requests")
        .insert({
          resellerDocId: reseller.id,
          amount: amount,
          status: "Pending",
          screenshot: proofImageUrl,
        });

      if (error) throw error;

      toast({ title: t("reseller.depositSubmitted"), description: `$${depositAmount} ${t("reseller.depositRequestSent")}` });
      setDepositAmount("");
      setScreenshot(null);
      setScreenshotName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleSubmitDeposit:", error);
      toast({ title: t("common.error"), description: t("reseller.failedToSubmitDeposit"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = screenshot !== null && depositAmount.trim() !== "";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-y-auto px-4 pb-8 max-w-xl mx-auto">
          <SheetHeader className="pb-3 text-left">
            <SheetTitle className="text-base font-bold text-foreground">{t("reseller.depositFunds")}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Select your preferred deposit channel: Instant Credit/Debit Card via Onramper or direct Crypto transfer.
            </SheetDescription>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-4 bg-muted/80 p-1 rounded-xl">
              <TabsTrigger value="card" className="rounded-lg text-xs gap-1.5 py-1.5 font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span>Card (Instant)</span>
              </TabsTrigger>
              <TabsTrigger value="crypto" className="rounded-lg text-xs gap-1.5 py-1.5 font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Wallet className="h-3.5 w-3.5 text-amber-500" />
                <span>Crypto USDT</span>
              </TabsTrigger>
              <TabsTrigger value="local" className="rounded-lg text-xs gap-1.5 py-1.5 font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Headphones className="h-3.5 w-3.5 text-purple-500" />
                <span>Local / Wire</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Direct Card / Apple Pay / Google Pay via Onramper */}
            <TabsContent value="card" className="mt-0 focus-visible:outline-none">
              <OnramperWidget
                resellerDocId={reseller?.id}
                walletAddress={depositAddress}
                initialAmount={depositAmount ? parseFloat(depositAmount) : 100}
                defaultCrypto="usdt_tron"
                onDepositSubmitted={() => {
                  onOpenChange(false);
                }}
              />
            </TabsContent>

            {/* TAB 2: Crypto Direct Address & Proof */}
            <TabsContent value="crypto" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{t("reseller.globalPayment")}</h3>
                    <p className="text-xs text-muted-foreground">{t("reseller.paySecurelyWithCrypto")}</p>
                  </div>
                </div>
                <Separator />

                <div className="space-y-3">
                  {/* Deposit Amount */}
                  <div>
                    <Label htmlFor="deposit-amount" className="text-xs text-muted-foreground">{t("reseller.depositAmount")}</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder={t("reseller.enterAmountInUsd")}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="mt-1 rounded-xl"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full gap-2 justify-center border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => setShowWalletModal(true)}
                  >
                    <Wallet className="h-4 w-4" />
                    {t("reseller.getWalletAddress")}
                  </Button>

                  {/* Transaction Screenshot */}
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("reseller.transactionProof")}</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 flex items-center gap-3 rounded-xl border border-dashed border-input bg-background px-4 py-3 cursor-pointer hover:border-primary/40 transition-colors"
                    >
                      {screenshot ? (
                        <>
                          <img src={screenshot} alt="Screenshot" className="h-10 w-10 rounded-lg object-cover border border-border" />
                          <span className="text-sm text-foreground truncate flex-1">{screenshotName}</span>
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="text-sm text-muted-foreground">{t("reseller.attachTransactionScreenshot")}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    className="w-full rounded-xl gap-2"
                    disabled={!canSubmit || submitting}
                    onClick={handleSubmitDeposit}
                  >
                    <Upload className="h-4 w-4" />
                    {submitting ? t("common.submitting") : t("reseller.submitDeposit")}
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("card")}
                      className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <CreditCard className="h-3 w-3" />
                      Want to pay directly with Credit/Debit card instead? Click here
                    </button>
                  </div>

                  <div className="rounded-lg bg-muted/50 border border-border p-4 text-center mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      {t("reseller.empoweredByBlockchain")}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {cryptoIcons.map((crypto) => (
                        <div
                          key={crypto.name}
                          className="flex h-7 items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5"
                        >
                          <img src={crypto.icon} alt={crypto.name} className="h-4 w-4" />
                          <span className="text-[10px] font-bold text-muted-foreground">{crypto.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Local Wire / Bank Transfer */}
            <TabsContent value="local" className="mt-0 focus-visible:outline-none">
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <CreditCard className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{t("reseller.payInLocal")}</h3>
                    <p className="text-xs text-muted-foreground">{t("reseller.payInLocalDesc")}</p>
                  </div>
                </div>
                <Separator />
                <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("reseller.payInLocalAdvised")}
                  </p>
                  <Button variant="outline" className="w-full gap-2 justify-center" asChild>
                    <a href="mailto:support@example.com">
                      <Headphones className="h-4 w-4" /> {t("reseller.contactFinancialExpert")}
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* USDT Wallet Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="flex items-center justify-center gap-2 text-base">
            <img src="/crypto/usdt.svg" alt="USDT" className="h-6 w-6" />
            {t("reseller.usdtTrc20")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("reseller.usdtTrc20Reminder")}
          </DialogDescription>
          <DialogHeader className="text-center">
            <DialogDescription className="text-xs text-muted-foreground">
              {t("reseller.scanQrOrCopyAddress")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-3">
            <div className="rounded-xl border-2 border-border bg-background p-3">
              <img
                src={qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${depositAddress}`}
                alt="USDT TRC20 QR Code"
                className="h-44 w-44"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{t("reseller.depositAddress")}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-foreground break-all leading-relaxed">
                {depositAddress}
              </code>
              <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0" onClick={handleCopyWallet}>
                <Copy className={`h-4 w-4 ${walletCopied ? "text-green-500" : "text-muted-foreground"}`} />
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs text-destructive leading-relaxed" dangerouslySetInnerHTML={{ __html: t("reseller.makeSureSendOnlyUsdt") }} />
          </div>

          <div className="pt-2">
            <Button
              className="w-full text-xs gap-1.5"
              variant="secondary"
              onClick={() => {
                setShowWalletModal(false);
                setActiveTab("card");
              }}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Or Pay Directly with Debit / Credit Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
