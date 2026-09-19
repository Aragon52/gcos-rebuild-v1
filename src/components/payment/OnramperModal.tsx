import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import OnramperWidget from "./OnramperWidget";
import { CreditCard, ShieldCheck } from "lucide-react";

interface OnramperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress?: string;
  initialAmount?: number | string;
  defaultCrypto?: string;
}

export default function OnramperModal({
  open,
  onOpenChange,
  walletAddress,
  initialAmount = 100,
  defaultCrypto = "usdt_tron",
}: OnramperModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-4 w-4" />
            </div>
            Pay with Credit / Debit Card
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
            Instant card checkout powered by Onramper. Supports Visa, Mastercard, Apple Pay & Google Pay.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <OnramperWidget
            walletAddress={walletAddress}
            initialAmount={initialAmount}
            defaultCrypto={defaultCrypto}
            compact={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
