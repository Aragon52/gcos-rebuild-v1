import type { SeasonalDecorations } from "./seasonal-theme-context-hooks";

/** A seasonal promotion campaign managed by admins. */
export interface SeasonalCampaign {
  id: string;
  slug: string;
  name: string;
  template: SeasonalTemplateId;
  bannerMessage: string;
  ctaLabel: string;
  ctaPath: string;
  showOnReseller: boolean;
  showOnStorefront: boolean;
  isActive: boolean;
  decorations: SeasonalDecorations;
  updatedAt: string | null;
}

export type SeasonalTemplateId =
  | "christmas"
  | "new-year"
  | "spring-festival"
  | "black-friday"
  | "summer-sale"
  | "neutral";

export interface SeasonalTemplate {
  id: SeasonalTemplateId;
  name: string;
  description: string;
  /** Gradient used by the sliding banner strip. */
  bannerClass: string;
  accentClass: string;
  decorations: SeasonalDecorations;
  sampleMessage: string;
  sampleCta: string;
}

export const SEASONAL_TEMPLATES: SeasonalTemplate[] = [
  {
    id: "christmas",
    name: "Christmas",
    description: "Snowfall, trees and gifts with red and green colours.",
    bannerClass:
      "bg-gradient-to-r from-red-600/20 via-emerald-600/20 to-red-600/20 border-red-500/30",
    accentClass: "text-red-600 dark:text-red-400",
    decorations: {
      snowfall: true,
      elements: ["christmas-tree", "santa", "gifts", "snowflakes"],
      colors: { accent: "#d62828", secondary: "#2a9d8f" },
    },
    sampleMessage:
      "Christmas special: enjoy festive rewards on every deposit made this holiday season!",
    sampleCta: "Celebrate now ==>",
  },
  {
    id: "new-year",
    name: "New year",
    description: "Sparkles and gold accents for the new year countdown.",
    bannerClass:
      "bg-gradient-to-r from-amber-500/20 via-indigo-600/20 to-amber-500/20 border-amber-500/30",
    accentClass: "text-amber-600 dark:text-amber-400",
    decorations: {
      snowfall: false,
      elements: ["gifts", "sale-tags", "lightning"],
      colors: { accent: "#f4a261", secondary: "#3d348b" },
    },
    sampleMessage:
      "New year kick-off: fresh bonuses and upgraded reseller levels all through January!",
    sampleCta: "Claim reward ==>",
  },
  {
    id: "spring-festival",
    name: "Spring festival",
    description: "Flowers and butterflies in soft pink and green.",
    bannerClass:
      "bg-gradient-to-r from-pink-500/20 via-emerald-400/20 to-pink-500/20 border-pink-500/30",
    accentClass: "text-pink-600 dark:text-pink-400",
    decorations: {
      snowfall: false,
      elements: ["flowers", "butterflies"],
      colors: { accent: "#e76f9e", secondary: "#67b26f" },
    },
    sampleMessage:
      "Spring festival sale: refreshed product picks and seasonal discounts for every shop.",
    sampleCta: "Shop the sale ==>",
  },
  {
    id: "black-friday",
    name: "Black friday",
    description: "High-contrast dark and orange promotion styling.",
    bannerClass:
      "bg-gradient-to-r from-neutral-900/30 via-orange-600/25 to-neutral-900/30 border-orange-500/30",
    accentClass: "text-orange-600 dark:text-orange-400",
    decorations: {
      snowfall: false,
      elements: ["sale-tags", "lightning"],
      colors: { accent: "#f97316", secondary: "#111827" },
    },
    sampleMessage:
      "Black friday: the biggest margins of the year are live for a limited time only.",
    sampleCta: "Grab the deals ==>",
  },
  {
    id: "summer-sale",
    name: "Summer sale",
    description: "Sunny yellow and cyan with beach elements.",
    bannerClass:
      "bg-gradient-to-r from-yellow-400/20 via-cyan-400/20 to-yellow-400/20 border-cyan-500/30",
    accentClass: "text-cyan-600 dark:text-cyan-400",
    decorations: {
      snowfall: false,
      elements: ["sun", "waves", "palm-tree"],
      colors: { accent: "#22d3ee", secondary: "#facc15" },
    },
    sampleMessage:
      "Summer sale: seasonal bestsellers restocked with extra reseller margin.",
    sampleCta: "See offers ==>",
  },
  {
    id: "neutral",
    name: "Neutral promotion",
    description: "Clean brand styling with no seasonal decorations.",
    bannerClass:
      "bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border-primary/30",
    accentClass: "text-primary",
    decorations: { snowfall: false, elements: [] },
    sampleMessage: "Announcement: a new promotion is now running across the platform.",
    sampleCta: "Learn more ==>",
  },
];

export function getTemplate(id: string | null | undefined): SeasonalTemplate {
  return SEASONAL_TEMPLATES.find((t) => t.id === id) ?? SEASONAL_TEMPLATES[SEASONAL_TEMPLATES.length - 1];
}

/** Row shape returned by Supabase for the seasonal_themes table. */
export interface SeasonalThemeRow {
  id: string;
  slug: string | null;
  name: string | null;
  template: string | null;
  banner_message: string | null;
  cta_label: string | null;
  cta_path: string | null;
  show_on_reseller: boolean | null;
  show_on_storefront: boolean | null;
  is_active: boolean | null;
  decorations: unknown;
  updated_at: string | null;
}

export function mapCampaign(row: SeasonalThemeRow): SeasonalCampaign {
  const template = getTemplate(row.template);
  const decorations = (row.decorations as SeasonalDecorations | null) ?? template.decorations;
  return {
    id: row.id,
    slug: row.slug ?? template.id,
    name: row.name ?? template.name,
    template: template.id,
    bannerMessage: row.banner_message ?? "",
    ctaLabel: row.cta_label ?? "",
    ctaPath: row.cta_path ?? "",
    showOnReseller: row.show_on_reseller ?? true,
    showOnStorefront: row.show_on_storefront ?? true,
    isActive: row.is_active ?? false,
    decorations,
    updatedAt: row.updated_at,
  };
}
