import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SeasonalThemeContext } from "./seasonal-theme-context-hooks";
import { mapCampaign, type SeasonalCampaign, type SeasonalThemeRow } from "./seasonal-campaigns";

export function SeasonalThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery<SeasonalCampaign | null>({
    queryKey: ["active-seasonal-theme"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasonal_themes")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? mapCampaign(data as unknown as SeasonalThemeRow) : null;
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000, // refresh every 5 minutes
  });

  const campaign = data ?? null;

  return (
    <SeasonalThemeContext.Provider
      value={{
        slug: campaign?.slug ?? "none",
        name: campaign?.name ?? "None",
        decorations: campaign?.decorations ?? {},
        isActive: Boolean(campaign),
        campaign,
      }}
    >
      {children}
    </SeasonalThemeContext.Provider>
  );
}
