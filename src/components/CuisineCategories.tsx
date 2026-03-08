import { useState, forwardRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCuisineCategories, useRegionStats } from "@/hooks/use-homepage-data";
import { ChevronRight, ChevronDown, Sparkles, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const regionGradients: Record<string, string> = {
  Asia: "from-amber-500/10 to-orange-500/5",
  Europe: "from-rose-500/10 to-purple-500/5",
  Americas: "from-emerald-500/10 to-teal-500/5",
  "Middle East": "from-amber-500/10 to-red-500/5",
  Africa: "from-orange-500/10 to-yellow-500/5",
  Oceania: "from-blue-500/10 to-indigo-500/5",
};

const CuisineOrb = forwardRef<HTMLButtonElement, any>(({ cuisine, ...motionProps }, ref) => (
  <motion.button
    ref={ref}
    {...motionProps}
    className="group flex flex-col items-center justify-center p-3 aspect-square rounded-full bg-card border-2 border-border hover:border-accent/50 transition-all cursor-pointer relative overflow-hidden orb-glow hover:shadow-2xl"
  >
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/10 group-hover:to-transparent transition-all duration-500" />
    <span className="text-2xl sm:text-3xl group-hover:scale-125 transition-transform duration-300 relative z-10 drop-shadow-sm">
      {cuisine.emoji}
    </span>
    <div className="text-center relative z-10 mt-0.5">
      <p className="font-display text-[9px] sm:text-[11px] font-bold text-foreground leading-tight">{cuisine.name}</p>
      <p className="font-body text-[8px] sm:text-[9px] text-muted-foreground font-medium">
        {cuisine.count} {cuisine.count === 1 ? "dish" : "dishes"}
      </p>
    </div>
  </motion.button>
));
CuisineOrb.displayName = "CuisineOrb";

const CuisineCategories = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const { data: cuisines, isLoading: loadingCuisines } = useCuisineCategories();
  const { data: regionStats, isLoading: loadingRegions } = useRegionStats();

  const filtered = activeRegion
    ? (cuisines ?? []).filter((c) => c.region === activeRegion)
    : cuisines ?? [];

  // Top cuisines shown as orbs (limit to 24 when collapsed)
  const topCuisines = expanded ? filtered : filtered.slice(0, 24);
  const hasMore = filtered.length > 24;

  // For expanded view: group by region, filter by search
  const groupedCuisines = useMemo(() => {
    if (!expanded) return {};
    const searchLower = search.toLowerCase();
    const items = searchLower
      ? filtered.filter((c) => c.name.toLowerCase().includes(searchLower))
      : filtered;

    const groups: Record<string, typeof items> = {};
    for (const c of items) {
      const region = c.region || "Other";
      if (!groups[region]) groups[region] = [];
      groups[region].push(c);
    }
    // Sort regions
    const order = ["Asia", "Europe", "Americas", "Africa", "Oceania", "Other"];
    const sorted: Record<string, typeof items> = {};
    for (const r of order) {
      if (groups[r]) sorted[r] = groups[r].sort((a, b) => a.name.localeCompare(b.name));
    }
    // Any remaining
    for (const [k, v] of Object.entries(groups)) {
      if (!sorted[k]) sorted[k] = v.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [expanded, filtered, search]);

  const bgGradient = activeRegion ? regionGradients[activeRegion] || "" : "";
  const totalCount = (cuisines ?? []).length;

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
          <p className="font-body text-muted-foreground mt-3 max-w-lg mx-auto">
            {totalCount} cuisine traditions from every corner of the globe — not a single flavor forgotten.
          </p>
        </motion.div>

        {/* Region pills */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
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
                  onClick={() => {
                    setActiveRegion(activeRegion === region.name ? null : region.name);
                    setExpanded(false);
                    setSearch("");
                  }}
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

        {/* Orb grid */}
        {loadingCuisines ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-full" />
            ))}
          </div>
        ) : !expanded ? (
          <>
            <motion.div layout className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
              <AnimatePresence mode="popLayout">
                {topCuisines.map((cuisine, i) => (
                  <CuisineOrb
                    key={cuisine.name}
                    cuisine={cuisine}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ delay: i * 0.015, type: "spring", stiffness: 400, damping: 25 }}
                    whileHover={{ scale: 1.12, y: -6 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && !activeRegion && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-10"
              >
                <button
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-2 font-body text-sm font-bold text-primary hover:text-primary/80 transition-colors group bg-primary/5 hover:bg-primary/10 px-6 py-3 rounded-full"
                >
                  View all {totalCount} cuisines
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          /* Expanded: searchable grouped list */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cuisines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-full bg-card border-border font-body"
              />
            </div>

            {/* Grouped by region */}
            {Object.entries(groupedCuisines).map(([region, items]) => (
              <motion.div
                key={region}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-display text-lg font-bold text-foreground">{region}</h3>
                  <span className="font-body text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((cuisine) => (
                    <motion.div
                      key={cuisine.name}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 bg-card border border-border hover:border-accent/40 rounded-full px-4 py-2 cursor-pointer transition-all hover:shadow-md group"
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">{cuisine.emoji}</span>
                      <span className="font-body text-sm font-medium text-foreground">{cuisine.name}</span>
                      <span className="font-body text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {cuisine.count}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {Object.keys(groupedCuisines).length === 0 && search && (
              <p className="text-center font-body text-muted-foreground py-8">
                No cuisines found for "{search}"
              </p>
            )}

            <div className="text-center">
              <button
                onClick={() => { setExpanded(false); setSearch(""); }}
                className="inline-flex items-center gap-1 font-body text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Show less
                <ChevronRight className="h-4 w-4 rotate-[-90deg]" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CuisineCategories;
