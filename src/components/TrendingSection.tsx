import { motion } from "framer-motion";
import { Star, MapPin, TrendingUp } from "lucide-react";
import { dishes } from "@/data/food-data";

const trendingDishes = dishes.filter((d) => d.trending);

const TrendingSection = () => {
  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span className="font-body text-sm font-semibold">Trending Now</span>
          </div>
          <p className="font-body text-muted-foreground text-sm">
            Most searched dishes this week
          </p>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-5 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="w-4 flex-shrink-0" />
        {trendingDishes.map((dish, i) => (
          <motion.article
            key={dish.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-[300px] snap-start group cursor-pointer"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block bg-accent text-accent-foreground text-[10px] font-body font-bold px-2.5 py-1 rounded-full mb-2 uppercase tracking-wider">
                  #{i + 1} Trending
                </span>
                <h3 className="font-display text-xl font-bold text-background leading-tight">
                  {dish.name}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-body text-sm font-semibold text-background">{dish.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-background/70">
                    <MapPin className="h-3 w-3" />
                    <span className="font-body text-xs">{dish.city}, {dish.country}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
        <div className="w-4 flex-shrink-0" />
      </div>
    </section>
  );
};

export default TrendingSection;
