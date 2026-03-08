import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

export function useExploredCountries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["explored-countries", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("explored_countries")
        .select("*, country:countries(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useFavoriteDishes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-dishes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorite_dishes")
        .select("*, dish:dishes(*, country:countries(*))")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useToggleExplored() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ countryId, isExplored }: { countryId: string; isExplored: boolean }) => {
      if (!user) throw new Error("Not logged in");
      if (isExplored) {
        const { error } = await supabase
          .from("explored_countries")
          .delete()
          .eq("user_id", user.id)
          .eq("country_id", countryId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("explored_countries")
          .insert({ user_id: user.id, country_id: countryId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["explored-countries"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ dishId, isFavorited }: { dishId: string; isFavorited: boolean }) => {
      if (!user) throw new Error("Not logged in");
      if (isFavorited) {
        const { error } = await supabase
          .from("favorite_dishes")
          .delete()
          .eq("user_id", user.id)
          .eq("dish_id", dishId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorite_dishes")
          .insert({ user_id: user.id, dish_id: dishId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorite-dishes"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
