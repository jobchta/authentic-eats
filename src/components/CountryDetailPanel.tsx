import { motion } from "framer-motion";
import { X, Flame, Star, Leaf, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useExploredCountries, useFavoriteDishes, useToggleExplored, useToggleFavorite } from "@/hooks/use-passport";
import { useNavigate } from "react-router-dom";
import { getDishImage, allDishImages } from "@/lib/dish-images";
import type { CountryData, DishData } from "@/pages/MapPage";

interface CountryDetailPanelProps {
  country: CountryData;
  dishes: DishData[];
  dishesLoading: boolean;
  onClose: () => void;
}

const SpiceIndicator = ({ level }: { level: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4].map((i) => (
      <Flame
        key={i}
        className={`h-3 w-3 ${i <= level ? "text-orange-400" : "text-muted-foreground/20"}`}
      />
    ))}
  </div>
);

const CountryDetailPanel = ({ country, dishes, dishesLoading, onClose }: CountryDetailPanelProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: explored } = useExploredCountries();
  const toggleExplored = useToggleExplored();
  const isExplored = explored?.some((e: any) => e.country_id === country.id) ?? false;

  const signatureDishes = dishes.filter((d) => d.is_signature);
  const otherDishes = dishes.filter((d) => !d.is_signature);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.98 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Header with gradient */}
      <div className="relative overflow-hidden p-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/5 to-transparent" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-[60px]" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-4 relative z-10">
          <div className="text-6xl drop-shadow-lg">{country.flag_emoji}</div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">{country.name}</h2>
            <p className="font-body text-sm text-muted-foreground">
              {country.continent} · {country.region}
            </p>
          </div>
        </div>

        {country.signature_ingredient && (
          <div className="mt-4 inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm rounded-full px-3 py-1.5 relative z-10">
            <Leaf className="h-3.5 w-3.5 text-accent" />
            <span className="font-body text-xs font-bold text-accent">
              Signature: {country.signature_ingredient}
            </span>
          </div>
        )}

        <div className="mt-4 relative z-10">
          <Button
            variant={isExplored ? "outline" : "default"}
            size="sm"
            className={`w-full font-body text-xs rounded-xl ${isExplored ? "glow-gold border-accent/30" : ""}`}
            onClick={() => {
              if (!user) { navigate("/auth"); return; }
              toggleExplored.mutate({ countryId: country.id, isExplored });
            }}
          >
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            {isExplored ? "✓ Explored — Stamped!" : "Mark as Explored"}
          </Button>
        </div>
      </div>

      {/* Food culture */}
      <div className="px-6 pb-4 border-b border-border">
        {country.food_culture_summary && (
          <p className="font-body text-sm text-foreground leading-relaxed">
            {country.food_culture_summary}
          </p>
        )}
        {country.food_description && (
          <p className="font-body text-xs text-muted-foreground mt-2 leading-relaxed italic">
            {country.food_description}
          </p>
        )}
      </div>

      {/* Dishes */}
      <div className="p-6 max-h-[50vh] overflow-y-auto">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">
          {dishes.length} {dishes.length === 1 ? "Dish" : "Dishes"}
        </h3>

        {dishesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : dishes.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">
            No dishes catalogued yet for this country.
          </p>
        ) : (
          <div className="space-y-3">
            {signatureDishes.length > 0 && (
              <>
                <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-accent">
                  ★ Signature Dishes
                </p>
                {signatureDishes.map((dish, i) => (
                  <DishCard key={dish.id} dish={dish} index={i} />
                ))}
              </>
            )}
            {otherDishes.length > 0 && (
              <>
                {signatureDishes.length > 0 && (
                  <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mt-4">
                    More Dishes
                  </p>
                )}
                {otherDishes.map((dish, i) => (
                  <DishCard key={dish.id} dish={dish} index={i + signatureDishes.length} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const DishCard = ({ dish, index }: { dish: DishData; index: number }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: favorites } = useFavoriteDishes();
  const toggleFavorite = useToggleFavorite();
  const isFavorited = favorites?.some((f: any) => f.dish_id === dish.id) ?? false;
  const img = getDishImage(dish.name, dish.cuisine_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-3 p-3 bg-background rounded-2xl border border-border hover:border-accent/30 hover:shadow-md transition-all group"
    >
      {/* Image thumbnail */}
      {img && (
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <img src={img} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-display text-sm font-bold text-foreground truncate">
                {dish.name}
              </p>
              {dish.is_signature && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-accent/15 text-accent border-0 font-bold">
                  ★
                </Badge>
              )}
            </div>
            <p className="font-body text-[11px] text-muted-foreground">{dish.cuisine_type}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (!user) { navigate("/auth"); return; }
                toggleFavorite.mutate({ dishId: dish.id, isFavorited });
              }}
              className={`transition-all hover:scale-110 ${isFavorited ? "text-destructive" : "text-muted-foreground/30 hover:text-destructive"}`}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-current" : ""}`} />
            </button>
            <div className="flex items-center gap-1 bg-accent/10 rounded-full px-2 py-0.5">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="font-body text-xs font-bold">
                {dish.rating?.toFixed(1) || "—"}
              </span>
            </div>
          </div>
        </div>

        {dish.description && (
          <p className="font-body text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-wrap gap-1">
            {dish.dietary_tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20 text-primary font-medium">
                {tag}
              </Badge>
            ))}
            {dish.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 font-medium">
                {tag}
              </Badge>
            ))}
          </div>
          {dish.spice_level && dish.spice_level > 0 && (
            <SpiceIndicator level={dish.spice_level} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CountryDetailPanel;
