import { motion } from "framer-motion";
import { X, Flame, Star, Leaf, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useExploredCountries, useFavoriteDishes, useToggleExplored, useToggleFavorite } from "@/hooks/use-passport";
import { useNavigate } from "react-router-dom";
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
        className={`h-3 w-3 ${i <= level ? "text-destructive" : "text-muted-foreground/30"}`}
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="relative bg-primary/10 p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-5xl">{country.flag_emoji}</span>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">{country.name}</h2>
            <p className="font-body text-sm text-muted-foreground">
              {country.continent} · {country.region}
            </p>
          </div>
        </div>
        {country.signature_ingredient && (
          <div className="mt-3 flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-accent" />
            <span className="font-body text-xs font-semibold text-accent">
              Signature: {country.signature_ingredient}
            </span>
          </div>
        )}
        <div className="mt-4">
          <Button
            variant={isExplored ? "outline" : "default"}
            size="sm"
            className="w-full font-body text-xs"
            onClick={() => {
              if (!user) { navigate("/auth"); return; }
              toggleExplored.mutate({ countryId: country.id, isExplored });
            }}
          >
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            {isExplored ? "Explored ✓" : "Mark as Explored"}
          </Button>
        </div>
      </div>

      {/* Food culture */}
      <div className="p-6 border-b border-border">
        {country.food_culture_summary && (
          <p className="font-body text-sm text-foreground leading-relaxed">
            {country.food_culture_summary}
          </p>
        )}
        {country.food_description && (
          <p className="font-body text-xs text-muted-foreground mt-2 leading-relaxed">
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
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
                <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                  ★ Signature Dishes
                </p>
                {signatureDishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </>
            )}
            {otherDishes.length > 0 && (
              <>
                {signatureDishes.length > 0 && (
                  <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mt-4">
                    More Dishes
                  </p>
                )}
                {otherDishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const DishCard = ({ dish }: { dish: DishData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: favorites } = useFavoriteDishes();
  const toggleFavorite = useToggleFavorite();
  const isFavorited = favorites?.some((f: any) => f.dish_id === dish.id) ?? false;

  return (
  <div className="p-4 bg-background rounded-xl border border-border hover:border-accent/30 transition-all">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display text-sm font-bold text-foreground truncate">
            {dish.name}
          </p>
          {dish.is_signature && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-accent/15 text-accent border-0">
              Signature
            </Badge>
          )}
        </div>
        <p className="font-body text-xs text-muted-foreground mt-0.5">{dish.cuisine_type}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Star className="h-3 w-3 fill-accent text-accent" />
        <span className="font-body text-xs font-semibold text-foreground">
          {dish.rating?.toFixed(1) || "—"}
        </span>
      </div>
    </div>

    {dish.description && (
      <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-2">
        {dish.description}
      </p>
    )}

    <div className="flex items-center justify-between mt-3">
      <div className="flex flex-wrap gap-1">
        {dish.dietary_tags?.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary">
            {tag}
          </Badge>
        ))}
        {dish.tags?.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
            {tag}
          </Badge>
        ))}
      </div>
      {dish.spice_level && dish.spice_level > 0 && (
        <SpiceIndicator level={dish.spice_level} />
      )}
    </div>
  </div>
);

export default CountryDetailPanel;
