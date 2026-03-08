import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Award, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedRestaurants } from "@/hooks/use-restaurants";
import { useNavigate } from "react-router-dom";

const tierConfig: Record<string, { classes: string; icon: boolean; glow?: boolean }> = {
  Legendary: { classes: "badge-gold", icon: true, glow: true },
  Exceptional: { classes: "bg-primary text-primary-foreground", icon: true },
  Outstanding: { classes: "bg-secondary text-secondary-foreground border border-border", icon: false },
  Remarkable: { classes: "bg-muted text-muted-foreground", icon: false },
};

const tiers = ["All", "Legendary", "Exceptional", "Outstanding", "Remarkable"];

const TopRestaurants = () => {
  const [activeTier, setActiveTier] = useState("All");
  const { data: restaurants, isLoading } = useFeaturedRestaurants();
  const navigate = useNavigate();

  const filtered = activeTier === "All"
    ? restaurants ?? []
    : (restaurants ?? []).filter((r) => r.tier === activeTier);

  return (
    <section id="restaurants" className="py-24 bg-secondary section-grain">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-sm font-bold tracking-[0.3em] uppercase text-gradient-gold mb-3">
              Verified Excellence
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground">
              World's Best Restaurants
            </h2>
            <p className="font-body text-muted-foreground mt-3 max-w-lg">
              Ranked by authenticity, craft, and taste — not hype. Each one visited and rated by our expert critics.
            </p>
          </motion.div>

          <div className="flex gap-2 flex-wrap">
            {tiers.map((tier) => (
              <motion.button
                key={tier}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTier(tier)}
                className={`font-body text-sm px-4 py-2 rounded-full transition-all ${
                  activeTier === tier
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {tier}
              </motion.button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((restaurant, index) => {
              const isLegendary = restaurant.tier === "Legendary";
              return (
                <motion.article
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`flex gap-4 p-5 bg-background rounded-xl border cursor-pointer transition-all duration-500 hover:shadow-xl relative overflow-hidden ${
                    isLegendary ? "border-accent/30 glow-gold" : "border-border"
                  }`}
                >
                  {isLegendary && (
                    <div className="absolute inset-0 shimmer pointer-events-none" />
                  )}

                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isLegendary ? "bg-gradient-to-br from-accent to-accent/60" : "bg-muted"
                  }`}>
                    <span className={`font-display text-lg font-bold ${
                      isLegendary ? "text-accent-foreground" : "text-foreground"
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-base font-semibold text-foreground truncate">
                        {restaurant.name}
                      </h3>
                      <Badge className={`text-[9px] font-body shrink-0 ${tierConfig[restaurant.tier]?.classes || ""}`}>
                        {tierConfig[restaurant.tier]?.icon && <Award className="h-2.5 w-2.5 mr-0.5" />}
                        {restaurant.tier}
                      </Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mb-2">
                      {restaurant.speciality} · {restaurant.cuisine_type}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-body text-xs font-bold">{restaurant.rating?.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="font-body text-[11px]">
                          {restaurant.city}, {restaurant.country?.name}
                          {restaurant.country?.flag_emoji && ` ${restaurant.country.flag_emoji}`}
                        </span>
                      </div>
                      <span className="font-body text-[11px] text-muted-foreground">
                        {(restaurant.reviews_count ?? 0).toLocaleString()} reviews
                      </span>
                      <span className="font-body text-[11px] text-accent font-semibold">
                        {restaurant.price_range}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/restaurants")}
            className="font-body text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            View all {restaurants?.length ? `${restaurants.length}+` : ""} restaurants
            <span className="inline-block ml-1 transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopRestaurants;
