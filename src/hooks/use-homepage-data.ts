import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbDish = Tables<"dishes">;
export type DbCountry = Tables<"countries">;

export interface DishWithCountry extends DbDish {
  country: DbCountry;
}

export function useHomepageDishes() {
  return useQuery({
    queryKey: ["homepage-dishes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dishes")
        .select("*, country:countries(*)")
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as unknown as DishWithCountry[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomepageCountries() {
  return useQuery({
    queryKey: ["homepage-countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("*");
      if (error) throw error;
      return data as DbCountry[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Aggregate cuisine categories from countries
export function useCuisineCategories() {
  return useQuery({
    queryKey: ["cuisine-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dishes")
        .select("cuisine_type, country:countries(continent, flag_emoji)");
      if (error) throw error;

      // Group by cuisine_type and count
      const map = new Map<string, { count: number; continent: string; emoji: string }>();
      for (const d of data as any[]) {
        const key = d.cuisine_type;
        const existing = map.get(key);
        if (existing) {
          existing.count++;
        } else {
          map.set(key, {
            count: 1,
            continent: d.country?.continent ?? "Other",
            emoji: d.country?.flag_emoji ?? "🍽️",
          });
        }
      }

      return Array.from(map.entries())
        .map(([name, info]) => ({
          name,
          emoji: info.emoji,
          count: info.count,
          region: info.continent,
        }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Aggregate stats by continent for region filters
export function useRegionStats() {
  return useQuery({
    queryKey: ["region-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("continent");
      if (error) throw error;

      const regionMap = new Map<string, number>();
      for (const c of data) {
        regionMap.set(c.continent, (regionMap.get(c.continent) || 0) + 1);
      }

      return Array.from(regionMap.entries()).map(([name, countryCount]) => ({
        name,
        countryCount,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
