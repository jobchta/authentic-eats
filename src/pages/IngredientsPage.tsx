import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Leaf, Filter, Utensils, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CATEGORY_ICONS: Record<string, string> = {
  spice: "🌶️", protein: "🥩", grain: "🌾", vegetable: "🥬",
  dairy: "🧀", fruit: "🍋", condiment: "🫙", other: "🧂",
};

const CATEGORY_ORDER = ["spice", "protein", "grain", "vegetable", "dairy", "fruit", "condiment", "other"];

interface IngredientWithDishes {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  aliases: string[] | null;
  origin_country: { name: string; flag_emoji: string } | null;
  dishes: { id: string; name: string; cuisine_type: string }[];
}

const IngredientsPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ["ingredients-explorer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*, origin_country:countries!ingredients_origin_country_id_fkey(name, flag_emoji)")
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: recipeLinks } = useQuery({
    queryKey: ["recipe-ingredient-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("ingredient_id, recipe:recipes!recipe_ingredients_recipe_id_fkey(dish_id, dish:dishes!recipes_dish_id_fkey(id, name, cuisine_type))");
      if (error) throw error;
      return data as any[];
    },
  });

  const enriched = useMemo(() => {
    if (!ingredients) return [];
    const dishMap = new Map<string, { id: string; name: string; cuisine_type: string }[]>();
    (recipeLinks || []).forEach((link: any) => {
      const dish = link.recipe?.dish;
      if (!dish) return;
      const arr = dishMap.get(link.ingredient_id) || [];
      if (!arr.find((d) => d.id === dish.id)) arr.push(dish);
      dishMap.set(link.ingredient_id, arr);
    });

    return ingredients.map((ing: any) => ({
      ...ing,
      category: ing.category || "other",
      dishes: dishMap.get(ing.id) || [],
    })) as IngredientWithDishes[];
  }, [ingredients, recipeLinks]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (activeCategory) list = list.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.aliases?.some((a) => a.toLowerCase().includes(q)) ||
          i.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [enriched, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    enriched.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [enriched]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="h-7 w-7 text-primary" />
            <h1 className="font-display text-4xl font-bold text-foreground">Ingredients Explorer</h1>
          </div>
          <p className="font-body text-muted-foreground max-w-xl">
            Browse ingredients from cuisines around the world. Discover what goes into your favorite dishes.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 font-body"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            variant={activeCategory === null ? "default" : "secondary"}
            className="cursor-pointer font-body text-xs"
            onClick={() => setActiveCategory(null)}
          >
            <Filter className="h-3 w-3 mr-1" /> All ({enriched.length})
          </Badge>
          {CATEGORY_ORDER.map((cat) =>
            categoryCounts[cat] ? (
              <Badge
                key={cat}
                variant={activeCategory === cat ? "default" : "secondary"}
                className="cursor-pointer font-body text-xs capitalize"
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              >
                {CATEGORY_ICONS[cat]} {cat} ({categoryCounts[cat]})
              </Badge>
            ) : null
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-display text-lg text-muted-foreground">No ingredients found</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((ing) => (
                <motion.div
                  key={ing.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{CATEGORY_ICONS[ing.category] || "🧂"}</span>
                      <h3 className="font-display text-base font-semibold text-foreground">{ing.name}</h3>
                    </div>
                    <Badge variant="secondary" className="font-body text-[10px] capitalize shrink-0">
                      {ing.category}
                    </Badge>
                  </div>

                  {ing.description && (
                    <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2">{ing.description}</p>
                  )}

                  {ing.origin_country && (
                    <div className="flex items-center gap-1 mb-3">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="font-body text-xs text-muted-foreground">
                        {ing.origin_country.flag_emoji} {ing.origin_country.name}
                      </span>
                    </div>
                  )}

                  {ing.aliases && ing.aliases.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {ing.aliases.slice(0, 3).map((a) => (
                        <Badge key={a} variant="outline" className="font-body text-[10px]">{a}</Badge>
                      ))}
                    </div>
                  )}

                  {ing.dishes.length > 0 && (
                    <div className="border-t border-border pt-3 mt-auto">
                      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        <Utensils className="inline h-3 w-3 mr-1" />
                        Used in {ing.dishes.length} dish{ing.dishes.length !== 1 ? "es" : ""}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ing.dishes.slice(0, 4).map((d) => (
                          <Link key={d.id} to={`/dishes/${d.id}`}>
                            <Badge variant="secondary" className="font-body text-[10px] hover:bg-accent/20 cursor-pointer transition-colors">
                              {d.name}
                            </Badge>
                          </Link>
                        ))}
                        {ing.dishes.length > 4 && (
                          <Badge variant="outline" className="font-body text-[10px]">
                            +{ing.dishes.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default IngredientsPage;
