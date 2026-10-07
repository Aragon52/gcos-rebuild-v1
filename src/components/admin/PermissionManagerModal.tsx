import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Shield,
  ShieldCheck,
  Search,
  CheckCheck,
  XCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Lock,
  UserCheck,
  FolderLock,
  ArrowRight,
  Info
} from "lucide-react";
import {
  ADMIN_PERMISSION_CATEGORIES,
  ALL_ADMIN_PAGES,
  DEFAULT_ADMIN_PAGES,
  DEFAULT_STAFF_PAGES,
  PERMISSION_PRESETS,
  normalizeAdminPath,
  type PermissionCategory,
  type AdminPagePermission
} from "@/lib/admin-permissions";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export interface PermissionTargetAccount {
  id: string;
  name: string;
  email: string;
  accountId?: string;
  staffId?: string;
  department?: string;
  permissions?: string[];
  rawAdminId?: string;
}

interface PermissionManagerModalProps {
  open: boolean;
  onClose: () => void;
  accountType: "admin" | "staff";
  account: PermissionTargetAccount | null;
  onSaveSuccess?: () => void;
}

export function PermissionManagerModal({
  open,
  onClose,
  accountType,
  account,
  onSaveSuccess
}: PermissionManagerModalProps) {
  const queryClient = useQueryClient();
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize selected paths from account data
  useEffect(() => {
    if (!account) return;

    if (Array.isArray(account.permissions) && account.permissions.length > 0) {
      setSelectedPaths(new Set(account.permissions.map(normalizeAdminPath)));
    } else {
      // Default to standard role permissions if no custom permissions configured yet
      const defaults = accountType === "admin" ? DEFAULT_ADMIN_PAGES : DEFAULT_STAFF_PAGES;
      setSelectedPaths(new Set(defaults.map(normalizeAdminPath)));
    }
    setSearchQuery("");
  }, [account, accountType, open]);

  const defaultPages = useMemo(() => {
    return accountType === "admin" ? DEFAULT_ADMIN_PAGES : DEFAULT_STAFF_PAGES;
  }, [accountType]);

  // Filter categories according to search query and account type constraints
  const visibleCategories = useMemo(() => {
    return ADMIN_PERMISSION_CATEGORIES.map(category => {
      // Filter pages for search and owner-only constraints
      const pages = category.pages.filter(page => {
        if (page.ownerOnly && accountType !== "admin") return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          page.title.toLowerCase().includes(q) ||
          page.url.toLowerCase().includes(q) ||
          page.description.toLowerCase().includes(q)
        );
      });

      return {
        ...category,
        pages
      };
    }).filter(category => category.pages.length > 0);
  }, [searchQuery, accountType]);

  // Toggle single page
  const handleTogglePage = (url: string) => {
    const normalized = normalizeAdminPath(url);
    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (next.has(normalized)) {
        next.delete(normalized);
      } else {
        next.add(normalized);
      }
      return next;
    });
  };

  // Toggle all pages in category
  const handleToggleCategory = (category: PermissionCategory) => {
    const categoryPageUrls = category.pages.map(p => normalizeAdminPath(p.url));
    const allSelected = categoryPageUrls.every(url => selectedPaths.has(url));

    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (allSelected) {
        categoryPageUrls.forEach(url => next.delete(url));
      } else {
        categoryPageUrls.forEach(url => next.add(url));
      }
      return next;
    });
  };

  // Apply preset
  const handleApplyPreset = (pageUrls: string[]) => {
    const normalized = pageUrls.map(normalizeAdminPath);
    setSelectedPaths(new Set(normalized));
    toast.success("Applied permission preset template");
  };

  // Reset to default standard role
  const handleResetToDefault = () => {
    setSelectedPaths(new Set(defaultPages.map(normalizeAdminPath)));
    toast.info(`Reset to standard ${accountType === "admin" ? "Administrator" : "Staff"} default permissions.`);
  };

  // Select all visible pages
  const handleSelectAll = () => {
    const all = ALL_ADMIN_PAGES
      .filter(p => !p.ownerOnly || accountType === "admin")
      .map(p => normalizeAdminPath(p.url));
    setSelectedPaths(new Set(all));
  };

  // Clear all permissions
  const handleClearAll = () => {
    setSelectedPaths(new Set());
  };

  // Save changes to database
  const handleSave = async () => {
    if (!account) return;

    setSaving(true);
    try {
      const permissionsArray = Array.from(selectedPaths);
      const tableName = accountType === "admin" ? "sla_admins" : "sla_staff";

      const { error } = await supabase
        .from(tableName)
        .update({
          permissions: permissionsArray
        })
        .eq("id", account.id);

      if (error) throw error;

      // Invalidate query caches
      queryClient.invalidateQueries({ queryKey: ["sla_admins"] });
      queryClient.invalidateQueries({ queryKey: ["sla_staff"] });

      // If the modified account is the currently logged-in account, sync local session immediately
      try {
        const savedSession = localStorage.getItem("gcos_admin_session");
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (
            parsed?.email?.toLowerCase() === account.email?.toLowerCase() ||
            parsed?.uid === account.id
          ) {
            parsed.permissions = permissionsArray;
            localStorage.setItem("gcos_admin_session", JSON.stringify(parsed));
            window.dispatchEvent(new CustomEvent("admin_session_updated", { detail: parsed }));
          }
        }
      } catch {
        // ignore
      }

      toast.success(
        `Permissions updated for ${account.name} (${permissionsArray.length} pages allowed)`
      );

      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating permissions:", err);
      toast.error(`Failed to save permissions: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (!account) return null;

  const totalPagesAvailable = ALL_ADMIN_PAGES.filter(p => !p.ownerOnly || accountType === "admin").length;
  const isCustomConfigured = Array.isArray(account.permissions) && account.permissions.length > 0;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold">
                    Manage Page Permissions
                  </DialogTitle>
                  <Badge variant="outline" className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/30 uppercase">
                    {accountType === "admin" ? "Administrator" : "Staff Member"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Grant or restrict dedicated page access for <span className="font-semibold text-foreground">{account.name}</span> ({account.email})
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-mono">
                {selectedPaths.size} / {totalPagesAvailable} Pages Enabled
              </Badge>
            </div>
          </div>

          {/* Quick Actions & Presets Toolbar */}
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Presets:
              </span>
              {PERMISSION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.pages)}
                  className="px-2.5 py-1 rounded-md bg-background border border-border text-[11px] font-medium text-foreground hover:bg-accent hover:border-primary/40 transition-colors"
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <XCircle className="h-3.5 w-3.5 mr-1 text-destructive" /> Clear All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToDefault}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1 text-primary" /> Reset Default
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Search & Filter */}
        <div className="px-5 py-2.5 bg-muted/10 border-b border-border flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin pages (e.g. deposit, chat, catalog, orders)..."
              className="pl-8 h-8 text-xs bg-background border-border"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {visibleCategories.map((category) => {
            const categoryPages = category.pages;
            const categoryUrls = categoryPages.map(p => normalizeAdminPath(p.url));
            const selectedCount = categoryUrls.filter(u => selectedPaths.has(u)).length;
            const allSelected = categoryPages.length > 0 && selectedCount === categoryPages.length;
            const someSelected = selectedCount > 0 && selectedCount < categoryPages.length;

            return (
              <div
                key={category.id}
                className="rounded-xl border border-border bg-card/50 overflow-hidden shadow-xs"
              >
                {/* Category Header */}
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={() => handleToggleCategory(category)}
                    />
                    <label
                      htmlFor={`cat-${category.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer select-none"
                    >
                      {category.label}
                    </label>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {selectedCount} / {categoryPages.length} active
                  </Badge>
                </div>

                {/* Pages Grid */}
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categoryPages.map((page) => {
                    const normalizedUrl = normalizeAdminPath(page.url);
                    const isChecked = selectedPaths.has(normalizedUrl);

                    return (
                      <div
                        key={page.id}
                        onClick={() => handleTogglePage(page.url)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer select-none flex items-start gap-3 ${
                          isChecked
                            ? "bg-primary/5 border-primary/30 text-foreground"
                            : "bg-background border-border/70 text-muted-foreground hover:bg-muted/40 hover:border-border"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleTogglePage(page.url)}
                          className="mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-semibold truncate ${isChecked ? "text-foreground" : "text-muted-foreground"}`}>
                              {page.title}
                            </span>
                            {page.ownerOnly && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold uppercase shrink-0">
                                Owner
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                            {page.description}
                          </p>
                          <span className="text-[10px] font-mono text-primary/70 mt-1 inline-block truncate max-w-full">
                            {page.url}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              {selectedPaths.size === 0
                ? "Warning: Account will have no page access."
                : `Total ${selectedPaths.size} dedicated pages granted.`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="flex-1 sm:flex-none text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saving ? "Saving Changes..." : "Save Page Permissions"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
