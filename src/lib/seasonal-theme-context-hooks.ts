import { createContext, useContext } from "react";
import type { SeasonalCampaign } from "./seasonal-campaigns";

export interface SeasonalDecorations {
  elements?: string[];
  snowfall?: boolean;
  topBanner?: string;
  colors?: { accent?: string; secondary?: string };
}

export interface SeasonalThemeContextType {
  slug: string;
  name: string;
  decorations: SeasonalDecorations;
  isActive: boolean; // true if a non-"none" theme is active
  /** Full active campaign record, when an admin campaign is running. */
  campaign: SeasonalCampaign | null;
}

export const SeasonalThemeContext = createContext<SeasonalThemeContextType>({
  slug: "none",
  name: "None",
  decorations: {},
  isActive: false,
  campaign: null,
});

export function useSeasonalTheme() {
  return useContext(SeasonalThemeContext);
}
