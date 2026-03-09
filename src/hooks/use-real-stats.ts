import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRealStats() {
  return useQuery({
    queryKey: ["real-stats"],
    queryFn: async () => {
      const [dishRes, restaurantRes, countryRes, profileRes] = await Promise.all([
        supabase.from("dishes").select("id", { count: "exact", head: true }),
        supabase.from("restaurants").select("id", { count: "exact", head: true }),
        supabase.from("countries").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      return {
        dishes: dishRes.count ?? 0,
        restaurants: restaurantRes.count ?? 0,
        countries: countryRes.count ?? 0,
        members: profileRes.count ?? 0,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}
