import React from "react";
import { ShieldCheck, Store, ShoppingBag } from "lucide-react";
import { detectPortal, setPortalOverride, shouldShowPortalSwitcher, type PortalType } from "@/lib/subdomain";
import { useNavigate, useLocation } from "@/lib/router-compat";

export function PortalSwitcher() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isVisible = shouldShowPortalSwitcher();
  if (!mounted || !isVisible) {
    return null;
  }

  const navigate = useNavigate();
  const location = useLocation();
  const currentPortal = detectPortal();

  const handleSwitch = (portal: PortalType) => {
    setPortalOverride(portal);
    if (portal === "admin") {
      navigate({ to: "/admin" });
    } else if (portal === "reseller") {
      navigate({ to: "/reseller/dashboard" });
    } else {
      navigate({ to: "/" });
    }
  };

  const isCurrent = (portal: PortalType) => {
    if (portal === "admin") return location.pathname.startsWith("/admin");
    if (portal === "reseller") return location.pathname.startsWith("/reseller");
    return !location.pathname.startsWith("/admin") && !location.pathname.startsWith("/reseller");
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-xl text-xs">
      <button
        onClick={() => handleSwitch("admin")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
          isCurrent("admin")
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Admin Portal
      </button>

      <button
        onClick={() => handleSwitch("reseller")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
          isCurrent("reseller")
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Store className="h-3.5 w-3.5" />
        Reseller Portal
      </button>

      <button
        onClick={() => handleSwitch("customer")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
          isCurrent("customer")
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        Storefront
      </button>
    </div>
  );
}
