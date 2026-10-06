import { useState } from "react";
import { Headset, AlertTriangle, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router-compat";
import { resellerPath } from "@/lib/subdomain";
import { useReseller } from "@/lib/reseller-context-hooks";
import SupportChatDialog from "@/components/messaging/SupportChatDialog";

export function ResellerSuspendedOverlay() {
  const navigate = useNavigate();
  const { reseller } = useReseller();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSupportClick = () => {
    navigate(resellerPath("/reseller/messages"), { state: { tab: "support" } });
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-card border border-destructive/30 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">Retail Shop Suspended</h2>
            <p className="text-xs font-semibold text-destructive uppercase tracking-wider mt-0.5">
              Account Review Required
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Your retail shop has been temporarily suspended by administration. Storefront browsing and customer purchases are paused. Please contact Reseller Customer Service to review your account and reactivate your store.
          </p>

          <div className="pt-2 space-y-2.5">
            <Button 
              onClick={handleSupportClick} 
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 text-sm shadow-md"
            >
              <Headset className="h-4 w-4" />
              Go to Customer Service Chat
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button
              variant="outline"
              onClick={() => setDialogOpen(true)}
              className="w-full gap-2 border-border text-foreground hover:bg-muted font-medium"
            >
              <MessageSquare className="h-4 w-4" />
              Open Live Support Popup
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground pt-1">
            Our support team is available 24/7 to assist with verification and reactivation.
          </p>
        </div>
      </div>

      <SupportChatDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userName={reseller?.shopName || reseller?.firstName}
        resellerId={reseller?.id}
      />
    </>
  );
}
