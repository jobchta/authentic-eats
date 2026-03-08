import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export interface OsmRestaurant {
  osm_id: number;
  name: string;
  cuisine: string | null;
  city: string;
  country: string | null;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: string | null;
}

export function useOsmRestaurants(city: string) {
  const [debouncedCity, setDebouncedCity] = useState(city);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(city), 600);
    return () => clearTimeout(timer);
  }, [city]);

  return useQuery({
    queryKey: ["osm-restaurants", debouncedCity],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("osm-restaurants", {
        body: { city: debouncedCity, limit: 50 },
      });
      if (error) throw error;
      return data as { source: string; results: OsmRestaurant[]; count: number; attribution?: string };
    },
    enabled: debouncedCity.length >= 2,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
