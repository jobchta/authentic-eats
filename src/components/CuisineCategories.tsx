import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCuisineCategories, useRegionStats } from "@/hooks/use-homepage-data";
import { ChevronRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const regionGradients: Record<string, string> = {
  Asia: "from-amber-500/10 to-orange-500/5",
  Europe: "from-rose-500/10 to-purple-500/5",
  Americas: "from-emerald-500/10 to-teal-500/5",
  "Middle East": "from-amber-500/10 to-red-500/5",
  Africa: "from-orange-500/10 to-yellow-500/5",
  Oceania: "from-blue-500/10 to-indigo-500/5",
};

// forwardRef wrapper for AnimatePresence compatibility
const CuisineOrb = forwardRef<HTMLButtonElement, any>(({ cuisine, index, ...motionProps }, ref) => (
  <motion.button
    ref={ref}
    {...motionProps}
    className="group flex flex-col items-center justify-center p-4 aspect-square rounded-full bg-card border-2 border-border hover:border-accent/50 transition-all cursor-pointer relative overflow-hidden orb-glow hover:shadow-2xl"
  >
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/10 group-hover:to-transparent transition-all duration-500" />
    <span className="text-3xl sm:text-4xl group-hover:scale-125 transition-transform duration-300 relative z-10 drop-shadow-sm">
      {cuisine.emoji}
    </span>
    <div className="text-center relative z-10 mt-1">
      <p className="font-display text-[10px] sm:text-xs font-bold text-foreground">{cuisine.name}</p>
      <p className="font-body text-[9px] text-muted-foreground font-medium">
        {cuisine.count} dishes
      </p>
    </div>
  </motion.button>
));
CuisineOrb.displayName = "CuisineOrb";

const CuisineCategories = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const { data: cuisines, isLoading: loadingCuisines } = useCuisineCategories();
  const { data: regionStats, isLoading: loadingRegions } = useRegionStats();

  const filtered = activeRegion
    ? (cuisines ?? []).filter((c) => c.region === activeRegion)
    : cuisines ?? [];

  const bgGradient = activeRegion ? regionGradients[activeRegion] || "" : "";

  return (
    <section id="cuisines" className="py-24 relative overflow-hidden transition-all duration-700">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient || "from-transparent to-transparent"} transition-all duration-700`} />
      <div className="absolute inset-0 bg-background/95" />

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

        <div className="flex gap-3 mb-14 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
          {loadingRegions
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-32 rounded-full" />
              ))
            : (regionStats ?? []).map((region, i) => (
                <motion.button
                  key={region.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setActiveRegion(activeRegion === region.name ? null : region.name)
                  }
                  className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
                    activeRegion === region.name
                      ? "bg-primary text-primary-foreground shadow-lg glow-burgundy"
                      : "bg-card text-foreground border border-border hover:border-accent/40 hover:shadow-lg"
                  }`}
                >
                  <span className="font-display text-sm font-bold">{region.name}</span>
                  <span
                    className={`font-body text-xs px-2 py-0.5 rounded-full ${
                      activeRegion === region.name
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {region.countryCount}
                  </span>
                </motion.button>
              ))}
        </div>

        {loadingCuisines ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-full" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((cuisine, i) => (
                <CuisineOrb
                  key={cuisine.name}
                  cuisine={cuisine}
                  index={i}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ delay: i * 0.02, type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.15, y: -8 }}
                  whileTap={{ scale: 0.9 }}
                />
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
