import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIngestionStats() {
  return useQuery({
    queryKey: ["ingestion-stats"],
    queryFn: async () => {
      const [dishesRes, countriesRes, ingredientsRes, recipesRes, jobsRes] = await Promise.all([
        supabase.from("dishes").select("id", { count: "exact", head: true }),
        supabase.from("countries").select("id, name, code", { count: "exact" }),
        supabase.from("ingredients").select("id", { count: "exact", head: true }),
        supabase.from("recipes").select("id", { count: "exact", head: true }),
        supabase.from("ingestion_jobs").select("*").order("started_at", { ascending: false }).limit(10),
      ]);

      return {
        totalDishes: dishesRes.count || 0,
        totalCountries: countriesRes.count || 0,
        totalIngredients: ingredientsRes.count || 0,
        totalRecipes: recipesRes.count || 0,
        countries: countriesRes.data || [],
        recentJobs: jobsRes.data || [],
      };
    },
    refetchInterval: 5000, // Poll every 5s
  });
}
