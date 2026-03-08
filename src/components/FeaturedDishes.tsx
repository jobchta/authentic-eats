import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { useHomepageDishes } from "@/hooks/use-homepage-data";
import { Skeleton } from "@/components/ui/skeleton";

const allRegions = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"];

const FeaturedDishes = () => {
  const [activeRegion, setActiveRegion] = useState("All");
  const { data: dishes, isLoading } = useHomepageDishes();

  const filtered =
    activeRegion === "All"
      ? dishes ?? []
      : (dishes ?? []).filter((d) => d.country?.continent === activeRegion);

  return (
    <section id="dishes" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
              World Food Atlas
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground">
              Iconic Dishes
            </h2>
            <p className="font-body text-muted-foreground mt-3 max-w-lg">
              The dishes that define civilizations — each one from our global database of authentic cuisine.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {allRegions.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`font-body text-sm px-4 py-2 rounded-full transition-all ${
                  activeRegion === region
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-background rounded-xl overflow-hidden border border-border">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map((dish, i) => (
              <motion.article
                key={dish.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group card-hover bg-background rounded-xl overflow-hidden border border-border cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
                  <span className="text-7xl">{dish.country?.flag_emoji ?? "🍽️"}</span>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-body font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {dish.cuisine_type}
                    </span>
                    {dish.is_signature && (
                      <span className="bg-accent/90 backdrop-blur-sm text-accent-foreground text-[10px] font-body font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Signature
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-body font-semibold px-2 py-1 rounded-full">
                      {(dish.reviews_count ?? 0).toLocaleString()} reviews
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
                      {dish.name}
                    </h3>
                    <div className="flex items-center gap-1 text-accent flex-shrink-0 ml-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-body text-sm font-bold">{dish.rating?.toFixed(1) ?? "—"}</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mb-2.5 line-clamp-2">
                    {dish.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="font-body text-xs">{dish.country?.name ?? ""}</span>
                    </div>
                    <div className="flex gap-1">
                      {(dish.tags ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        <div className="text-center mt-12">
          <button className="font-body text-sm font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
            View all dishes →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDishes;
