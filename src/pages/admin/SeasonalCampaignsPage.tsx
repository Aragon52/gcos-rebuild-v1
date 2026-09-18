import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Sparkles, Power } from "lucide-react";
import {
  SEASONAL_TEMPLATES,
  getTemplate,
  mapCampaign,
  type SeasonalCampaign,
  type SeasonalTemplateId,
  type SeasonalThemeRow,
} from "@/lib/seasonal-campaigns";
import { cn } from "@/lib/utils";

interface CampaignForm {
  id: string | null;
  name: string;
  template: SeasonalTemplateId;
  bannerMessage: string;
  ctaLabel: string;
  ctaPath: string;
  showOnReseller: boolean;
  showOnStorefront: boolean;
  isActive: boolean;
}

const emptyForm: CampaignForm = {
  id: null,
  name: "",
  template: "neutral",
  bannerMessage: "",
  ctaLabel: "",
  ctaPath: "/reseller/profile",
  showOnReseller: true,
  showOnStorefront: true,
  isActive: false,
};

export default function SeasonalCampaignsPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<CampaignForm>(emptyForm);

  const { data: campaigns = [], isLoading } = useQuery<SeasonalCampaign[]>({
    queryKey: ["seasonal-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasonal_themes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as SeasonalThemeRow[]).map(mapCampaign);
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["seasonal-campaigns"] });
    void queryClient.invalidateQueries({ queryKey: ["active-seasonal-theme"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: CampaignForm) => {
      const template = getTemplate(values.template);
      const payload = {
        slug: template.id,
        name: values.name.trim(),
        template: template.id,
        banner_message: values.bannerMessage.trim(),
        cta_label: values.ctaLabel.trim(),
        cta_path: values.ctaPath.trim(),
        show_on_reseller: values.showOnReseller,
        show_on_storefront: values.showOnStorefront,
        is_active: values.isActive,
        decorations: template.decorations,
      };

      if (values.isActive) {
        // Only one campaign may run at a time.
        const { error: resetError } = await supabase
          .from("seasonal_themes")
          .update({ is_active: false })
          .eq("is_active", true);
        if (resetError) throw resetError;
      }

      if (values.id) {
        const { error } = await supabase
          .from("seasonal_themes")
          .update(payload)
          .eq("id", values.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase
        .from("seasonal_themes")
        .insert({ id: crypto.randomUUID(), ...payload });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Campaign saved");
      setSheetOpen(false);
      setForm(emptyForm);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not save the campaign.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (campaign: SeasonalCampaign) => {
      if (!campaign.isActive) {
        const { error: resetError } = await supabase
          .from("seasonal_themes")
          .update({ is_active: false })
          .eq("is_active", true);
        if (resetError) throw resetError;
      }
      const { error } = await supabase
        .from("seasonal_themes")
        .update({ is_active: !campaign.isActive })
        .eq("id", campaign.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Campaign visibility updated");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not update the campaign.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seasonal_themes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Campaign removed");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not remove the campaign.");
    },
  });

  const openCreate = () => {
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (campaign: SeasonalCampaign) => {
    setForm({
      id: campaign.id,
      name: campaign.name,
      template: campaign.template,
      bannerMessage: campaign.bannerMessage,
      ctaLabel: campaign.ctaLabel,
      ctaPath: campaign.ctaPath,
      showOnReseller: campaign.showOnReseller,
      showOnStorefront: campaign.showOnStorefront,
      isActive: campaign.isActive,
    });
    setSheetOpen(true);
  };

  const applyTemplate = (id: SeasonalTemplateId) => {
    const template = getTemplate(id);
    setForm((prev) => ({
      ...prev,
      template: id,
      name: prev.name.trim() ? prev.name : template.name,
      bannerMessage: prev.bannerMessage.trim() ? prev.bannerMessage : template.sampleMessage,
      ctaLabel: prev.ctaLabel.trim() ? prev.ctaLabel : template.sampleCta,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.bannerMessage.trim()) {
      toast.error("Please add a campaign name and banner message.");
      return;
    }
    saveMutation.mutate(form);
  };

  const preview = getTemplate(form.template);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seasonal campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create sliding promotion banners and seasonal decorations for the reseller portal and
            storefront. When no campaign is active, the default deposit bonus banner is shown.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New campaign
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Campaign</TableHead>
              <TableHead className="w-[150px]">Theme</TableHead>
              <TableHead>Banner message</TableHead>
              <TableHead className="w-[160px]">Shown on</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Loading campaigns…
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No campaigns yet. The default deposit bonus banner is running.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getTemplate(campaign.template).name}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate text-sm text-muted-foreground">
                    {campaign.bannerMessage}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[
                      campaign.showOnReseller ? "Reseller portal" : null,
                      campaign.showOnStorefront ? "Storefront" : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Hidden"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={campaign.isActive ? "default" : "outline"}>
                      {campaign.isActive ? "Live" : "Paused"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title={campaign.isActive ? "Pause campaign" : "Make live"}
                        onClick={() => toggleMutation.mutate(campaign)}
                      >
                        <Power
                          className={cn("h-4 w-4", campaign.isActive && "text-success")}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title="Edit campaign"
                        onClick={() => openEdit(campaign)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        title="Remove campaign"
                        onClick={() => deleteMutation.mutate(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl flex flex-col">
          <SheetHeader>
            <SheetTitle>{form.id ? "Edit campaign" : "New campaign"}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-5 py-4 overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g. Christmas deposit festival"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Seasonal theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {SEASONAL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.id)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      form.template === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Sparkles className={cn("h-3.5 w-3.5", template.accentClass)} />
                      {template.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {template.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-message">Banner message</Label>
              <Textarea
                id="campaign-message"
                className="min-h-[100px]"
                placeholder="Write the sliding banner wording here…"
                value={form.bannerMessage}
                onChange={(e) => setForm({ ...form, bannerMessage: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="campaign-cta">Button label</Label>
                <Input
                  id="campaign-cta"
                  placeholder="Deposit now ==>"
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-path">Button link</Label>
                <Input
                  id="campaign-path"
                  placeholder="/reseller/profile"
                  value={form.ctaPath}
                  onChange={(e) => setForm({ ...form, ctaPath: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show in reseller portal</p>
                  <p className="text-xs text-muted-foreground">Sliding banner above the header.</p>
                </div>
                <Switch
                  checked={form.showOnReseller}
                  onCheckedChange={(value) => setForm({ ...form, showOnReseller: value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show on storefront</p>
                  <p className="text-xs text-muted-foreground">
                    Top banner plus seasonal decorations for shoppers.
                  </p>
                </div>
                <Switch
                  checked={form.showOnStorefront}
                  onCheckedChange={(value) => setForm({ ...form, showOnStorefront: value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Make this campaign live</p>
                  <p className="text-xs text-muted-foreground">
                    Only one campaign runs at a time; others pause automatically.
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(value) => setForm({ ...form, isActive: value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className={cn(
                  "flex items-center gap-3 overflow-hidden rounded-lg border px-4 py-2",
                  preview.bannerClass
                )}
              >
                <Sparkles className={cn("h-4 w-4 shrink-0", preview.accentClass)} />
                <span className="truncate text-xs font-semibold">
                  {form.bannerMessage || preview.sampleMessage}
                </span>
                <span className="ml-auto shrink-0 text-[11px] font-bold text-primary">
                  {form.ctaLabel || preview.sampleCta}
                </span>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-border pt-4">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving…" : "Save campaign"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
