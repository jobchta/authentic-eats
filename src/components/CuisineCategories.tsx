import { useState } from "react";
import { motion } from "framer-motion";
import { useCuisineCategories, useRegionStats } from "@/hooks/use-homepage-data";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CuisineCategories = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const { data: cuisines, isLoading: loadingCuisines } = useCuisineCategories();
  const { data: regionStats, isLoading: loadingRegions } = useRegionStats();

  const filtered = activeRegion
    ? (cuisines ?? []).filter((c) => c.region === activeRegion)
    : cuisines ?? [];

  return (
    <section id="cuisines" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
            Explore By Origin
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            World Cuisines
          </h2>
        </div>

        {/* Region buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {loadingRegions
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))
            : (regionStats ?? []).map((region) => (
                <button
                  key={region.name}
                  onClick={() =>
                    setActiveRegion(activeRegion === region.name ? null : region.name)
                  }
                  className={`group p-4 rounded-xl border transition-all text-left ${
                    activeRegion === region.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/30 card-hover"
                  }`}
                >
                  <p
                    className={`font-display text-lg font-bold ${
                      activeRegion === region.name
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {region.name}
                  </p>
                  <p
                    className={`font-body text-xs mt-1 ${
                      activeRegion === region.name
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {region.countryCount} countries
                  </p>
                </button>
              ))}
        </div>

        {/* Cuisine grid */}
        {loadingCuisines ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
          >
            {filtered.map((cuisine, i) => (
              <motion.button
                key={cuisine.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className="group flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-accent/50 hover:shadow-md transition-all cursor-pointer"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {cuisine.emoji}
                </span>
                <div className="text-center">
                  <p className="font-display text-xs font-semibold text-foreground">
                    {cuisine.name}
                  </p>
                  <p className="font-body text-[10px] text-muted-foreground">
                    {cuisine.count} {cuisine.count === 1 ? "dish" : "dishes"}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        <div className="text-center mt-8">
          <button className="inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Explore all cuisines
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CuisineCategories;
