import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorldMap from "@/components/WorldMap";
import CountryDetailPanel from "@/components/CountryDetailPanel";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export type CountryData = {
  id: string;
  name: string;
  code: string;
  continent: string;
  region: string;
  flag_emoji: string;
  food_description: string | null;
  signature_ingredient: string | null;
  food_culture_summary: string | null;
};

export type DishData = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  rating: number | null;
  reviews_count: number | null;
  spice_level: number | null;
  tags: string[] | null;
  dietary_tags: string[] | null;
  is_signature: boolean | null;
};

const MapPage = () => {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("countries").select("*");
      if (error) throw error;
      return data as CountryData[];
    },
  });

  const { data: dishes = [], isLoading: dishesLoading } = useQuery({
    queryKey: ["dishes", selectedCountryId],
    queryFn: async () => {
      if (!selectedCountryId) return [];
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .eq("country_id", selectedCountryId)
        .order("is_signature", { ascending: false })
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as DishData[];
    },
    enabled: !!selectedCountryId,
  });

  const selectedCountry = countries.find((c) => c.id === selectedCountryId) || null;
  const countryByCode = new Map(countries.map((c) => [c.code.toUpperCase(), c]));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <p className="font-body text-sm font-bold tracking-[0.3em] uppercase text-accent mb-2">
              Explore 197 Countries
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground flex items-center justify-center gap-3">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                🌍
              </motion.span>
              The World's Food Map
            </h1>
            <p className="font-body text-muted-foreground mt-3 max-w-xl mx-auto">
              Click any country to discover its food culture, signature dishes, and culinary traditions.
            </p>
          </motion.div>

          <div className="relative flex flex-col lg:flex-row gap-6">
            <motion.div
              layout
              className={`transition-all duration-500 ${selectedCountry ? "lg:w-3/5" : "w-full"}`}
            >
              <WorldMap
                countryByCode={countryByCode}
                selectedCode={selectedCountry?.code.toUpperCase() || null}
                onSelectCountry={(code) => {
                  const country = countryByCode.get(code);
                  if (country) {
                    setSelectedCountryId(selectedCountryId === country.id ? null : country.id);
                  }
                }}
              />
            </motion.div>

            <AnimatePresence>
              {selectedCountry && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="lg:w-2/5"
                >
                  <CountryDetailPanel
                    country={selectedCountry}
                    dishes={dishes}
                    dishesLoading={dishesLoading}
                    onClose={() => setSelectedCountryId(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MapPage;
