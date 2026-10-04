import {
  LayoutDashboard, ShoppingCart, Package, Users, FileText,
  UserCog, MessageSquare, Shield, ScrollText, Lock,
  Globe, Activity, AlertTriangle, FileCode, ChevronDown, Store,
  UserCheck, Wallet, Puzzle, Megaphone, Newspaper, Headset,
  ShieldCheck, Landmark, CreditCard,
} from "lucide-react";
import { useLocation, Link } from "@/lib/router-compat";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAdminAuth, isPathAllowed, OWNER_ONLY_PATHS, type SLARole } from "@/lib/admin-auth-context-hooks";
import { adminPath } from "@/lib/subdomain";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import LogoIcon from "@/components/brand/LogoIcon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type NavItem = {
  title: string;
  icon: React.ElementType;
  url?: string;
  rawUrl?: string;
  children?: { title: string; url: string; rawUrl?: string }[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const canonicalNavGroups: NavGroup[] = [
  {
    label: "MENU",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        children: [
          { title: "Overview", url: "/admin" },
        ],
      },
    ],
  },
  {
    label: "CUSTOMER CARE SERVICE",
    items: [
      { title: "Staffs", icon: Users, url: "/admin/customer-care/staffs" },
      { title: "Reseller profile", icon: UserCog, url: "/admin/customer-care/reseller-profile" },
      { title: "Virtual Chat", icon: MessageSquare, url: "/admin/customer-care/virtual-services" },
      { title: "Virtual Order", icon: ShoppingCart, url: "/admin/customer-care/order-services" },
      { title: "Retail Shops", icon: Store, url: "/admin/resellers" },
      { title: "Track & Manage Orders", icon: ShoppingCart, url: "/admin/ars/orders" },
    ],
  },
  {
    label: "MANAGEMENT & FINANCING",
    items: [
      { title: "Customer Service", icon: Headset, url: "/admin/customer-service" },
      { title: "Ownership", icon: Shield, url: "/admin/sla/ownership" },
      { title: "Administrator", icon: UserCog, url: "/admin/sla/administrator" },
      { title: "Reseller Customer Service", icon: MessageSquare, url: "/admin/sla/reseller-2-admin" },
      { title: "Payment Info's & Balance", icon: Wallet, url: "/admin/ars/payment-info" },
      { title: "Deposit", icon: Landmark, url: "/admin/ars/deposit" },
      { title: "Withdrawal", icon: CreditCard, url: "/admin/ars/withdrawal" },
    ],
  },
  {
    label: "MISCELLANEOUS GROUP",
    items: [
      { title: "Product Catalog", icon: Package, url: "/admin/catalog" },
      { title: "Customers", icon: UserCheck, url: "/admin/ach/customers" },
      { title: "Financial", icon: Wallet, url: "/admin/ach/financial" },
      { title: "Orders", icon: ShoppingCart, url: "/admin/orders" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        title: "System",
        icon: Activity,
        children: [
          { title: "System Dashboard", url: "/admin/system" },
          { title: "Admin Session Logs", url: "/admin/admin-sessions" },
          { title: "Active Alerts", url: "/admin/alerts" },
          { title: "System Logs", url: "/admin/system-logs" },
        ],
      },
    ],
  },
];

function transformNavGroups(groups: NavGroup[]): NavGroup[] {
  return groups.map((g) => ({
    ...g,
    items: g.items.map((item) => ({
      ...item,
      rawUrl: item.url,
      url: item.url ? adminPath(item.url) : undefined,
      children: item.children?.map((c) => ({
        ...c,
        rawUrl: c.url,
        url: adminPath(c.url),
      })),
    })),
  }));
}

function filterByRole(groups: NavGroup[], role: SLARole): NavGroup[] {
  if (role === "Owner") return groups;
  return groups
    .map((g) => ({
      ...g,
      items: g.items
        .filter((item) => !item.rawUrl || !OWNER_ONLY_PATHS.has(item.rawUrl))
        .map((item) => ({
          ...item,
          children: item.children?.filter((c) => !c.rawUrl || !OWNER_ONLY_PATHS.has(c.rawUrl)),
        }))
        .filter((item) => {
          // If it has children, only keep it if children is not empty
          if (item.children) return item.children.length > 0;
          return true;
        }),
    }))
    .filter((g) => g.items.length > 0);
}

export function AppSidebar() {
  const location = useLocation();
  const { session } = useAdminAuth();
  const role = session?.role || "User";
  const { open, setOpen, isMobile } = useSidebar();

  const navGroups = useMemo(() => {
    const transformed = transformNavGroups(canonicalNavGroups);
    return filterByRole(transformed, role);
  }, [role]);

  // Expand on hover, fold back when the pointer leaves (desktop only).
  const handleMouseEnter = () => {
    if (!isMobile) setOpen(true);
  };
  const handleMouseLeave = () => {
    if (!isMobile) setOpen(false);
  };
  // Fold back after the user selects a page.
  const collapseAfterNav = () => {
    if (!isMobile) setOpen(false);
  };

  return (
    <Sidebar
      collapsible="icon"
      hoverExpand
      className="overflow-hidden transition-all duration-300 ease-in-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader className="overflow-hidden border-b border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
          <div className="shrink-0">
            <LogoIcon size={open ? 32 : 24} />
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 whitespace-nowrap",
            open ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>
            <span className="text-sm font-bold tracking-tight">
              <span className="text-brand-green">Global</span>
              <span className="text-brand-gold">Cart</span>
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Admin Console</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarNavItem key={item.title} item={item} currentPath={location.pathname} onNavigate={collapseAfterNav} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="overflow-hidden border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
          <span className={cn(
            "text-xs text-muted-foreground whitespace-nowrap transition-all duration-300 overflow-hidden",
            open ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>
            All systems operational
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarNavItem({
  item,
  currentPath,
  onNavigate,
}: {
  item: NavItem;
  currentPath: string;
  onNavigate?: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children!.some((c) => currentPath === c.url);
  const isActive = item.url === currentPath || isChildActive;

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.title}
        >
          <Link to={item.url!} onClick={onNavigate}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      asChild
      defaultOpen={isChildActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isChildActive}>
            <item.icon />
            <span>{item.title}</span>
            <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild isActive={currentPath === subItem.url}>
                  <Link to={subItem.url} onClick={onNavigate}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
