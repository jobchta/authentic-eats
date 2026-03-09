import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Heart, Flame } from "lucide-react";
import { useHomepageDishes } from "@/hooks/use-homepage-data";
import { useAuth } from "@/hooks/use-auth";
import { useFavoriteDishes, useToggleFavorite } from "@/hooks/use-passport";
import { useNavigate } from "react-router-dom";
import { getDishImage, continentGradients } from "@/lib/dish-images";
import { Skeleton } from "@/components/ui/skeleton";

const allRegions = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"];

// Wrap motion.article in forwardRef for AnimatePresence
const DishCard = forwardRef<HTMLElement, any>(({ dish, img, isFavorited, isHero, index, user, navigate, toggleFavorite, ...motionProps }, ref) => {
  const gradient = continentGradients[dish.country?.continent] || "from-muted to-muted";

  return (
    <motion.article
      ref={ref}
      {...motionProps}
      className={`group bg-background rounded-2xl overflow-hidden border border-border cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 ${
        isHero ? "sm:col-span-2 sm:row-span-1" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${isHero ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        {img ? (
          <img
            src={img}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-5xl opacity-40">🍽️</span>
          </div>
        )}
        {/* Hover overlay with description */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
          <p className="font-body text-sm text-white/90 line-clamp-3 mb-2">
            {dish.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(dish.dietary_tags ?? []).map((tag: string) => (
              <span key={tag} className="text-[10px] font-body font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] font-body font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
            {dish.cuisine_type}
          </span>
          {dish.is_signature && (
            <span className="badge-gold text-[10px] font-body px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              ★ Signature
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) { navigate("/auth"); return; }
            toggleFavorite.mutate({ dishId: dish.id, isFavorited });
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
            isFavorited
              ? "bg-destructive/20 text-destructive"
              : "bg-black/20 text-white/70 opacity-0 group-hover:opacity-100 hover:text-destructive"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        </button>

        {dish.spice_level && dish.spice_level >= 3 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            {Array.from({ length: dish.spice_level }).map((_, j) => (
              <Flame key={j} className="h-3 w-3 text-orange-400" />
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {dish.name}
          </h3>
          <div className="flex items-center gap-1 text-accent flex-shrink-0 ml-2 bg-accent/10 rounded-full px-2 py-0.5">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-body text-xs font-black">{dish.rating?.toFixed(1) ?? "—"}</span>
          </div>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {dish.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="font-body text-xs font-medium">{dish.country?.name ?? ""}</span>
          </div>
          <div className="flex gap-1">
            {(dish.tags ?? []).slice(0, 2).map((tag: string) => (
              <span key={tag} className="text-[10px] font-body font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
});
DishCard.displayName = "DishCard";

const FeaturedDishes = () => {
  const [activeRegion, setActiveRegion] = useState("All");
  const { data: dishes, isLoading } = useHomepageDishes();
  const { user } = useAuth();
  const { data: favorites } = useFavoriteDishes();
  const toggleFavorite = useToggleFavorite();
  const navigate = useNavigate();

  const filtered =
    activeRegion === "All"
      ? dishes ?? []
      : (dishes ?? []).filter((d) => d.country?.continent === activeRegion);

  return (
    <section id="dishes" className="py-24 bg-secondary relative section-grain">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-sm font-bold tracking-[0.3em] uppercase text-gradient-gold mb-3">
              World Food Atlas
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-secondary-foreground leading-[1.05]">
              Iconic Dishes
            </h2>
            <p className="font-body text-muted-foreground mt-3 max-w-lg">
              The dishes that define civilizations — each one from our global database of authentic cuisine.
            </p>
          </motion.div>

          <div className="flex gap-2 flex-wrap">
            {allRegions.map((region) => (
              <motion.button
                key={region}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveRegion(region)}
                className={`font-body text-sm px-5 py-2.5 rounded-full transition-all duration-300 ${
                  activeRegion === region
                    ? "bg-primary text-primary-foreground shadow-lg glow-burgundy"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border hover:border-primary/30"
                }`}
              >
                {region}
              </motion.button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-background rounded-2xl overflow-hidden border border-border shimmer">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((dish, i) => {
                const img = getDishImage(dish.name, dish.cuisine_type);
                const isFavorited = favorites?.some((f: any) => f.dish_id === dish.id) ?? false;
                const isHero = i === 0;

                return (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    img={img}
                    isFavorited={isFavorited}
                    isHero={isHero}
                    index={i}
                    user={user}
                    navigate={navigate}
                    toggleFavorite={toggleFavorite}
                    onClick={() => navigate(`/dishes/${dish.id}`)}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <button
            onClick={() => navigate("/restaurants")}
            className="font-body text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
          >
            View all dishes & restaurants
            <span className="inline-block ml-1 transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedDishes;
