import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCuisineCategories, useRegionStats } from "@/hooks/use-homepage-data";
import { ChevronRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CuisineCategories = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const { data: cuisines, isLoading: loadingCuisines } = useCuisineCategories();
  const { data: regionStats, isLoading: loadingRegions } = useRegionStats();

  const filtered = activeRegion
    ? (cuisines ?? []).filter((c) => c.region === activeRegion)
    : cuisines ?? [];

  return (
    <section id="cuisines" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-body text-xs font-bold tracking-[0.3em] uppercase">Explore By Origin</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground">
            World Cuisines
          </h2>
        </motion.div>

        {/* Region buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-14">
          {loadingRegions
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))
            : (regionStats ?? []).map((region, i) => (
                <motion.button
                  key={region.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setActiveRegion(activeRegion === region.name ? null : region.name)
                  }
                  className={`group p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                    activeRegion === region.name
                      ? "bg-primary text-primary-foreground border-primary glow-burgundy"
                      : "bg-card border-border hover:border-accent/40 hover:shadow-lg"
                  }`}
                >
                  {activeRegion === region.name && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  )}
                  <p
                    className={`font-display text-lg font-bold relative z-10 ${
                      activeRegion === region.name ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {region.name}
                  </p>
                  <p
                    className={`font-body text-xs mt-1 relative z-10 ${
                      activeRegion === region.name ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {region.countryCount} countries
                  </p>
                </motion.button>
              ))}
        </div>

        {/* Cuisine grid */}
        {loadingCuisines ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((cuisine, i) => (
                <motion.button
                  key={cuisine.name}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ delay: i * 0.015, type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-accent/50 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-500" />
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-sm">
                    {cuisine.emoji}
                  </span>
                  <div className="text-center relative z-10">
                    <p className="font-display text-xs font-bold text-foreground">{cuisine.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground font-medium">
                      {cuisine.count} {cuisine.count === 1 ? "dish" : "dishes"}
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <button className="inline-flex items-center gap-1 font-body text-sm font-bold text-primary hover:text-primary/80 transition-colors group">
            Explore all cuisines
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CuisineCategories;
