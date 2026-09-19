import React, { useState, useMemo, useRef } from "react";
import { 
  CreditCard, ShieldCheck, Zap, RefreshCw, ExternalLink, Sparkles, 
  CheckCircle2, AlertCircle, Headphones, Send, Upload, FileCheck, Globe, Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@tanstack/react-router";

interface OnramperWidgetProps {
  /** Optional custom API key. Falls back to environment variable or sandbox key */
  apiKey?: string;
  /** Default crypto to buy, e.g. 'usdt_tron', 'btc', 'eth' */
  defaultCrypto?: string;
  /** Destination wallet address for the chosen crypto */
  walletAddress?: string;
  /** Suggested initial amount in USD */
  initialAmount?: number | string;
  /** Default fiat currency (USD, EUR, GBP, etc.) */
  defaultFiat?: string;
  /** Target theme: 'light' or 'dark' */
  themeMode?: "light" | "dark";
  /** Reseller Document ID if submitting on behalf of a reseller */
  resellerDocId?: string;
  /** Optional callback after a deposit request is successfully created */
  onDepositSubmitted?: (amount: number) => void;
  /** Whether to show the manual/direct request recording card */
  showRecordRequestSection?: boolean;
  /** Optional callback or class styling */
  className?: string;
  /** Compact mode for smaller sheet containers */
  compact?: boolean;
}

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export default function OnramperWidget({
  apiKey,
  defaultCrypto = "usdt_tron",
  walletAddress,
  initialAmount = 100,
  defaultFiat = "usd",
  themeMode = "light",
  resellerDocId,
  onDepositSubmitted,
  showRecordRequestSection = true,
  className = "",
  compact = false,
}: OnramperWidgetProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAmount, setSelectedAmount] = useState<number | string>(initialAmount || 100);
  const [customAmount, setCustomAmount] = useState<string>(
    initialAmount && !PRESET_AMOUNTS.includes(Number(initialAmount)) ? String(initialAmount) : ""
  );
  const [selectedCrypto, setSelectedCrypto] = useState(defaultCrypto);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  // Form submission state for creating the deposit_requests record
  const [txRef, setTxRef] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Derive API Key
  const envKey = (typeof import.meta !== "undefined" && import.meta.env?.VITE_ONRAMPER_API_KEY) || "";
  const effectiveApiKey = (apiKey || envKey || "").trim();

  // Determine whether this key is staging / test or production
  const isKeyStaging = useMemo(() => {
    if (!effectiveApiKey) return true;
    const lower = effectiveApiKey.toLowerCase();
    return (
      lower.startsWith("pk_test_") ||
      lower.includes("test") ||
      lower.includes("dev") ||
      lower.includes("sandbox") ||
      lower.includes("staging")
    );
  }, [effectiveApiKey]);

  // Environment mode state (defaults based on key format, can be toggled)
  const [environmentMode, setEnvironmentMode] = useState<"staging" | "prod">(
    isKeyStaging ? "staging" : "prod"
  );

  // Active numeric amount
  const currentAmount = useMemo(() => {
    const num = customAmount ? parseFloat(customAmount) : Number(selectedAmount);
    return isNaN(num) || num <= 0 ? 100 : num;
  }, [customAmount, selectedAmount]);

  // Build the Onramper iframe URL
  const onramperUrl = useMemo(() => {
    // Determine base host:
    // Staging / Sandbox keys MUST use buy.onramper.dev
    // Production keys use buy.onramper.com
    const isSandbox = environmentMode === "staging";
    const baseHost = isSandbox ? "https://buy.onramper.dev" : "https://buy.onramper.com";

    // Standard public fallback test key for sandbox if none provided
    const keyToUse = effectiveApiKey || (isSandbox ? "pk_test_1DPv8427fEeV4Zp4" : "pk_prod_01H1C72Z9P5B8WQE7S18V5N6M3");

    const params = new URLSearchParams();
    if (keyToUse) {
      params.set("apiKey", keyToUse);
    }
    params.set("defaultCrypto", selectedCrypto);
    params.set("defaultFiat", defaultFiat.toLowerCase());
    params.set("mode", "buy");

    if (currentAmount > 0) {
      params.set("defaultAmount", String(currentAmount));
    }

    if (walletAddress && walletAddress.trim().length > 5) {
      params.set("wallets", `${selectedCrypto}:${walletAddress.trim()}`);
    }

    params.set("themeName", themeMode === "dark" ? "dark" : "light");
    params.set("color", "3b82f6");

    return `${baseHost}/?${params.toString()}`;
  }, [environmentMode, effectiveApiKey, selectedCrypto, defaultFiat, currentAmount, walletAddress, themeMode]);

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount("");
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    setSelectedAmount(val);
  };

  const handleApplyCustomAmount = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleCryptoChange = (crypto: string) => {
    setSelectedCrypto(crypto);
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleEnvironment = (mode: "staging" | "prod") => {
    setEnvironmentMode(mode);
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      setScreenshotName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Create deposit request record in database
  const handleRecordDepositRequest = async () => {
    if (!resellerDocId) {
      toast({
        title: "Session Information Required",
        description: "Please make sure you are logged in to record your deposit request.",
        variant: "destructive",
      });
      return;
    }

    if (currentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please specify a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingRequest(true);
    try {
      const cryptoLabel = selectedCrypto.toUpperCase().replace("_", "-");
      const remarkDetails = `Card Deposit (Onramper) | Asset: ${cryptoLabel} | Dest Address: ${
        walletAddress || "CS Assigned Address"
      }${txRef ? ` | Ref/Order ID: ${txRef}` : ""}`;

      const { error } = await supabase.from("deposit_requests").insert({
        resellerDocId: resellerDocId,
        amount: currentAmount,
        status: "Pending",
        screenshot: screenshot || "",
        remark: remarkDetails,
      });

      if (error) throw error;

      setSubmittedSuccess(true);
      toast({
        title: "Deposit Request Submitted",
        description: `Your $${currentAmount} card deposit request has been registered as Pending. Admin will review and credit your balance once crypto arrives.`,
      });

      if (onDepositSubmitted) {
        onDepositSubmitted(currentAmount);
      }
    } catch (err: any) {
      console.error("Failed to submit card deposit request:", err);
      toast({
        title: "Submission Error",
        description: err?.message || "Failed to record deposit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* ⚠️ CRITICAL NOTICE & REMINDER: Customer Service Deposit Address */}
      <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="ml-2">
          <AlertTitle className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            Important Notice for Card & Crypto Deposits
          </AlertTitle>
          <AlertDescription className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
            Please make sure to <strong>contact Customer Service</strong> to obtain the official, verified deposit
            wallet address corresponding to the token and blockchain network (e.g. <strong>USDT-TRC20, USDT-ERC20, BTC, ETH</strong>)
            you choose before completing your payment.
          </AlertDescription>
          <div className="mt-2.5 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 border-amber-600/40 text-amber-900 dark:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20"
              asChild
            >
              <Link to="/reseller/messages" state={{ activeTab: "support" }}>
                <Headphones className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Contact Customer Service for Address
              </Link>
            </Button>
          </div>
        </div>
      </Alert>

      {/* Payment Information Header */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-foreground">Instant Card Payment</h4>
                <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] px-1.5 py-0">
                  <Zap className="h-3 w-3 mr-0.5 fill-primary" /> Instant
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Pay directly with Visa, Mastercard, Apple Pay, or Google Pay via Onramper
              </p>
            </div>
          </div>

          {/* Gateway Mode Switcher */}
          <div className="flex items-center gap-1 bg-background/80 border border-border p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleToggleEnvironment("staging")}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                environmentMode === "staging"
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Sandbox / Staging Mode (buy.onramper.dev)"
            >
              Staging
            </button>
            <button
              type="button"
              onClick={() => handleToggleEnvironment("prod")}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                environmentMode === "prod"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Production Live Mode (buy.onramper.com)"
            >
              Live
            </button>
          </div>
        </div>

        {/* Supported Payment Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pt-2 border-t border-primary/10">
          <span className="font-semibold text-foreground">Supported:</span>
          <span className="inline-flex items-center rounded-md bg-background px-2 py-0.5 border border-border text-[10px] font-medium text-foreground">
            💳 Visa / Mastercard
          </span>
          <span className="inline-flex items-center rounded-md bg-background px-2 py-0.5 border border-border text-[10px] font-medium text-foreground">
            🍏 Apple Pay
          </span>
          <span className="inline-flex items-center rounded-md bg-background px-2 py-0.5 border border-border text-[10px] font-medium text-foreground">
            📱 Google Pay
          </span>
          <span className="inline-flex items-center rounded-md bg-background px-2 py-0.5 border border-border text-[10px] font-medium text-foreground">
            ⚡ Revolut & SEPA
          </span>
        </div>
      </div>

      {/* Amount & Preset Selection */}
      {!compact && (
        <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
          <Label className="text-xs font-semibold text-foreground">Select Deposit Amount (USD)</Label>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = selectedAmount === amt && !customAmount;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPreset(amt)}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm scale-100 ring-2 ring-primary/20"
                      : "bg-muted/70 hover:bg-muted text-foreground border border-border"
                  }`}
                >
                  ${amt}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                placeholder="Other Amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-6 h-8 text-xs rounded-lg"
              />
            </div>
            {customAmount && (
              <Button size="sm" variant="secondary" onClick={handleApplyCustomAmount} className="h-8 text-xs px-3">
                Update
              </Button>
            )}
          </div>

          {/* Crypto selection shortcuts */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-muted-foreground">Target Asset:</span>
              {[
                { id: "usdt_tron", label: "USDT (TRC20)", icon: "/crypto/usdt.svg" },
                { id: "btc", label: "BTC", icon: "/crypto/btc.svg" },
                { id: "eth", label: "ETH", icon: "/crypto/eth.svg" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCryptoChange(c.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
                    selectedCrypto === c.id
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <img src={c.icon} alt={c.label} className="h-3 w-3" />
                  {c.label}
                </button>
              ))}
            </div>

            <a
              href={onramperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Onramper Embedded Iframe Container */}
      <div className="relative w-full rounded-2xl border border-border bg-background shadow-sm overflow-hidden min-h-[580px]">
        {/* Loading Skeleton */}
        {iframeLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm gap-3 p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Initializing Secure Card Gateway...</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connecting to Onramper {environmentMode === "staging" ? "Sandbox / Staging" : "Production"} Gateway
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>256-Bit SSL Encrypted & 3D Secure Verification</span>
            </div>
          </div>
        )}

        <iframe
          key={`${iframeKey}-${environmentMode}`}
          src={onramperUrl}
          title="Onramper Card & Fiat Payment"
          height="620px"
          width="100%"
          className="w-full h-[600px] border-0"
          allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
          onLoad={() => setIframeLoading(false)}
        />
      </div>

      {/* Card Deposit Request Logging Card for Admin Approval */}
      {showRecordRequestSection && resellerDocId && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-foreground">Record Card Deposit Request</h5>
                <p className="text-[11px] text-muted-foreground">
                  Logs this transaction in ARS records so Admin can approve and credit your balance
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30">
              ${currentAmount} USD
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <Label className="text-[11px] text-muted-foreground">Payment Reference / Order ID (Optional)</Label>
              <Input
                placeholder="e.g. Onramper Order # or Tx ID"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                className="mt-1 h-8 text-xs rounded-lg"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Payment Receipt / Screenshot (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex items-center justify-between h-8 rounded-lg border border-dashed border-input bg-background px-3 cursor-pointer hover:border-primary/40 text-[11px] text-muted-foreground truncate"
              >
                <span className="truncate">{screenshotName || "Click to upload receipt"}</span>
                <Upload className="h-3.5 w-3.5 ml-1.5 flex-shrink-0 text-muted-foreground" />
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="w-full gap-2 justify-center rounded-xl bg-primary text-primary-foreground text-xs h-9 font-semibold"
            disabled={submittingRequest || currentAmount <= 0}
            onClick={handleRecordDepositRequest}
          >
            {submittingRequest ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Submitting Request...
              </>
            ) : submittedSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-300" />
                Deposit Request Submitted (${currentAmount})
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Submit Card Deposit Request (${currentAmount})
              </>
            )}
          </Button>
        </div>
      )}

      {/* Security & Assurance footer */}
      <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Direct Settlement & Admin Verification
          </span>
          <span className="text-muted-foreground font-normal">Powered by Onramper</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Once your card purchase is processed and cryptocurrency is received on the platform's destination address,
          the system administrator will verify and approve the deposit to immediately update your balance and VIP level.
        </p>
      </div>
    </div>
  );
}
