import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CountryCoverage {
  id: string;
  name: string;
  flag_emoji: string;
  continent: string;
  dish_count: number;
}

export function useIngestionStats() {
  const { data: countries, isLoading: countriesLoading } = useQuery({
    queryKey: ["ingestion-countries"],
    queryFn: async () => {
      const { data: allCountries } = await supabase
        .from("countries")
        .select("id, name, flag_emoji, continent")
        .order("name");

      const { data: dishCounts } = await supabase
        .from("dishes")
        .select("country_id");

      const countMap = new Map<string, number>();
      (dishCounts || []).forEach((d: any) => {
        countMap.set(d.country_id, (countMap.get(d.country_id) || 0) + 1);
      });

      return (allCountries || []).map((c: any) => ({
        ...c,
        dish_count: countMap.get(c.id) || 0,
      })) as CountryCoverage[];
    },
  });

  const { data: totalStats } = useQuery({
    queryKey: ["ingestion-totals"],
    queryFn: async () => {
      const [dishes, ingredients, recipes, restaurants] = await Promise.all([
        supabase.from("dishes").select("id", { count: "exact", head: true }),
        supabase.from("ingredients").select("id", { count: "exact", head: true }),
        supabase.from("recipes").select("id", { count: "exact", head: true }),
        supabase.from("restaurants").select("id", { count: "exact", head: true }),
      ]);
      return {
        dishes: dishes.count || 0,
        ingredients: ingredients.count || 0,
        recipes: recipes.count || 0,
        restaurants: restaurants.count || 0,
      };
    },
  });

  const { data: recentJobs } = useQuery({
    queryKey: ["ingestion-jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ingestion_jobs")
        .select("*, country:countries(name, flag_emoji)")
        .order("started_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 5000,
  });

  return { countries, countriesLoading, totalStats, recentJobs };
}
