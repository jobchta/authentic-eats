import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Award, MapPin, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { restaurants } from "@/data/food-data";

const tierConfig: Record<string, { classes: string; icon: boolean }> = {
  Legendary: { classes: "bg-accent text-accent-foreground", icon: true },
  Exceptional: { classes: "bg-primary text-primary-foreground", icon: true },
  Outstanding: { classes: "bg-secondary text-secondary-foreground border border-border", icon: false },
  Remarkable: { classes: "bg-muted text-muted-foreground", icon: false },
};

const tiers = ["All", "Legendary", "Exceptional", "Outstanding", "Remarkable"];

const TopRestaurants = () => {
  const [activeTier, setActiveTier] = useState("All");
  const filtered = activeTier === "All" ? restaurants : restaurants.filter((r) => r.tier === activeTier);

  return (
    <section id="restaurants" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
              Verified Excellence
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground">
              World's Best Restaurants
            </h2>
            <p className="font-body text-muted-foreground mt-3 max-w-lg">
              Ranked by authenticity, craft, and taste — not hype. Each one visited and rated by our expert critics.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {tiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`font-body text-sm px-4 py-2 rounded-full transition-all ${
                  activeTier === tier
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((restaurant, index) => (
            <motion.article
              key={restaurant.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="card-hover flex gap-4 p-5 bg-background rounded-xl border border-border cursor-pointer"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                <span className="font-display text-base font-bold text-foreground">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-display text-base font-semibold text-foreground truncate">
                    {restaurant.name}
                  </h3>
                  <Badge className={`text-[9px] font-body shrink-0 ${tierConfig[restaurant.tier].classes}`}>
                    {tierConfig[restaurant.tier].icon && <Award className="h-2.5 w-2.5 mr-0.5" />}
                    {restaurant.tier}
                  </Badge>
                </div>
                <p className="font-body text-xs text-muted-foreground mb-2">
                  {restaurant.speciality} · {restaurant.cuisine}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-body text-xs font-bold">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="font-body text-[11px]">{restaurant.city}, {restaurant.country}</span>
                  </div>
                  <span className="font-body text-[11px] text-muted-foreground">
                    {restaurant.reviews.toLocaleString()} reviews
                  </span>
                  <span className="font-body text-[11px] text-accent font-semibold">
                    {restaurant.priceRange}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="font-body text-sm font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
            View all 13,600+ restaurants →
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopRestaurants;
