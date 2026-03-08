import { motion } from "framer-motion";
import { Star, MapPin, TrendingUp, Heart } from "lucide-react";
import { useHomepageDishes } from "@/hooks/use-homepage-data";
import { useAuth } from "@/hooks/use-auth";
import { useFavoriteDishes, useToggleFavorite } from "@/hooks/use-passport";
import { useNavigate } from "react-router-dom";
import { getDishImage, allDishImages } from "@/lib/dish-images";
import { Skeleton } from "@/components/ui/skeleton";

const TrendingSection = () => {
  const { data: dishes, isLoading } = useHomepageDishes();
  const { user } = useAuth();
  const { data: favorites } = useFavoriteDishes();
  const toggleFavorite = useToggleFavorite();
  const navigate = useNavigate();

  const trendingDishes = (dishes ?? []).slice(0, 7);

  return (
    <section className="py-20 bg-background overflow-hidden relative section-grain">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full glow-accent-hover transition-all">
            <TrendingUp className="h-4 w-4" />
            <span className="font-body text-sm font-bold tracking-wide">Trending Now</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </motion.div>
      </div>

      <div
        className="flex gap-5 overflow-x-auto pb-6 px-4 snap-x snap-mandatory scrollbar-hide"
      >
        <div className="w-8 flex-shrink-0" />
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[320px] snap-start">
                <Skeleton className="aspect-[3/4] rounded-2xl" />
              </div>
            ))
          : trendingDishes.map((dish, i) => {
              const img = getDishImage(dish.name, dish.cuisine_type) || allDishImages[i % allDishImages.length];
              const isFavorited = favorites?.some((f: any) => f.dish_id === dish.id) ?? false;

              return (
                <motion.article
                  key={dish.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="flex-shrink-0 w-[320px] snap-start group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={img}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Cinematic gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <motion.span
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 + 0.3, type: "spring" }}
                        className="bg-accent text-accent-foreground text-[10px] font-body font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg"
                      >
                        #{i + 1} Trending
                      </motion.span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) { navigate("/auth"); return; }
                          toggleFavorite.mutate({ dishId: dish.id, isFavorited });
                        }}
                        className={`p-2 rounded-full glass-dark transition-all hover:scale-110 ${
                          isFavorited ? "text-destructive" : "text-white/70 hover:text-destructive"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-display text-2xl font-bold text-white leading-tight text-shadow-hero">
                        {dish.name}
                      </h3>
                      <p className="font-body text-xs text-white/60 mt-1 line-clamp-2">
                        {dish.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 bg-accent/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="font-body text-xs font-bold text-accent">
                            {dish.rating?.toFixed(1) ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/60">
                          <MapPin className="h-3 w-3" />
                          <span className="font-body text-xs">{dish.country?.name ?? ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
        <div className="w-8 flex-shrink-0" />
      </div>
    </section>
  );
};

export default TrendingSection;
