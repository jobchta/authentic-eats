import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbRestaurant {
  id: string;
  name: string;
  cuisine_type: string;
  city: string;
  country_id: string;
  rating: number | null;
  reviews_count: number | null;
  tier: string;
  speciality: string | null;
  price_range: string | null;
  description: string | null;
  michelin_stars: number | null;
  year_established: number | null;
  tags: string[] | null;
  is_featured: boolean | null;
  created_at: string | null;
  country: {
    id: string;
    name: string;
    continent: string;
    flag_emoji: string;
    code: string;
    region: string;
  };
}

export function useRestaurants(options?: { tier?: string; limit?: number }) {
  return useQuery({
    queryKey: ["restaurants", options?.tier, options?.limit],
    queryFn: async () => {
      let query = supabase
        .from("restaurants")
        .select("*, country:countries(*)")
        .order("rating", { ascending: false });

      if (options?.tier && options.tier !== "All") {
        query = query.eq("tier", options.tier);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as DbRestaurant[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedRestaurants() {
  return useQuery({
    queryKey: ["featured-restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*, country:countries(*)")
        .eq("is_featured", true)
        .order("rating", { ascending: false })
        .limit(16);
      if (error) throw error;
      return data as unknown as DbRestaurant[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRestaurantStats() {
  return useQuery({
    queryKey: ["restaurant-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("tier, country:countries(continent)");
      if (error) throw error;

      const tiers: Record<string, number> = {};
      const continents: Record<string, number> = {};

      for (const r of data as any[]) {
        tiers[r.tier] = (tiers[r.tier] || 0) + 1;
        const c = r.country?.continent || "Other";
        continents[c] = (continents[c] || 0) + 1;
      }

      return { total: data.length, tiers, continents };
    },
    staleTime: 5 * 60 * 1000,
  });
}
