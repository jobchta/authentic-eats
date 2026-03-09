import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, Flame, ArrowLeft, Globe, Heart, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useDishImage } from "@/hooks/use-dish-image";
import type { DishWithCountry } from "@/hooks/use-homepage-data";
import type { DbRestaurant } from "@/hooks/use-restaurants";

const DishDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: dish, isLoading } = useQuery({
    queryKey: ["dish", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dishes")
        .select("*, country:countries(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as DishWithCountry;
    },
    enabled: !!id,
  });

  const { data: similar } = useQuery({
    queryKey: ["similar-dishes", dish?.cuisine_type, dish?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dishes")
        .select("*, country:countries(*)")
        .eq("cuisine_type", dish!.cuisine_type)
        .neq("id", dish!.id)
        .order("rating", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as unknown as DishWithCountry[];
    },
    enabled: !!dish,
  });

  const { data: restaurants } = useQuery({
    queryKey: ["restaurants-for-cuisine", dish?.cuisine_type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*, country:countries(*)")
        .eq("cuisine_type", dish!.cuisine_type)
        .order("rating", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as unknown as DbRestaurant[];
    },
    enabled: !!dish,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <Skeleton className="h-64 rounded-2xl mb-6" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <Globe className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Dish not found</h1>
          <Link to="/">
            <Button variant="outline" className="font-body mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back Home
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { imageUrl: image } = useDishImage(
    dish.id,
    dish.name,
    dish.cuisine_type,
    dish.description,
    (dish as any).image_url
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        {/* Hero with Image */}
        <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
          <img src={image} alt={dish.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 container mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 font-body text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> Explore Dishes
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-2xl">{dish.country?.flag_emoji}</span>
                <Badge variant="secondary" className="font-body text-xs">{dish.cuisine_type}</Badge>
                {dish.is_signature && (
                  <Badge className="badge-gold text-xs font-body">Signature</Badge>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-2">
                {dish.name}
              </h1>
              <p className="font-body text-white/70 max-w-xl text-lg">{dish.description}</p>
            </motion.div>
          </div>
        </section>

        {/* Stats Row */}
        <div className="container mx-auto px-4 -mt-6 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Star, label: "Rating", value: dish.rating?.toFixed(1) || "N/A", color: "text-accent" },
              { icon: Heart, label: "Reviews", value: (dish.reviews_count ?? 0).toLocaleString(), color: "text-primary" },
              { icon: Flame, label: "Spice Level", value: dish.spice_level !== null ? `${dish.spice_level}/4` : "Mild", color: "text-destructive" },
              { icon: Globe, label: "Origin", value: dish.country?.name || "Unknown", color: "text-foreground" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 shadow-lg text-center"
              >
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {((dish.tags && dish.tags.length > 0) || (dish.dietary_tags && dish.dietary_tags.length > 0)) && (
          <div className="container mx-auto px-4 mt-8">
            <div className="flex flex-wrap gap-2">
              {dish.dietary_tags?.map((tag) => (
                <Badge key={tag} className="bg-secondary text-secondary-foreground font-body text-xs">{tag}</Badge>
              ))}
              {dish.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-body text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Where to Eat It */}
        {restaurants && restaurants.length > 0 && (
          <div className="container mx-auto px-4 mt-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              <Utensils className="inline h-5 w-5 mr-2 text-accent" />
              Where to Try {dish.cuisine_type} Cuisine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {restaurants.map((r) => (
                <Link key={r.id} to={`/restaurants/${r.id}`}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex gap-3 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm font-semibold text-foreground truncate">{r.name}</h3>
                      <p className="font-body text-xs text-muted-foreground">
                        {r.city}, {r.country?.name} · {r.rating?.toFixed(2)} ★ · {r.price_range}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar Dishes */}
        {similar && similar.length > 0 && (
          <div className="container mx-auto px-4 mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">More {dish.cuisine_type} Dishes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {similar.map((d) => {
                const img = getDishImage(d.name, d.cuisine_type);
                return (
                  <Link key={d.id} to={`/dishes/${d.id}`}>
                    <motion.div whileHover={{ y: -3 }} className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-display text-sm font-semibold text-foreground truncate">{d.name}</h3>
                        <p className="font-body text-xs text-muted-foreground">{d.country?.flag_emoji} {d.country?.name} · {d.rating?.toFixed(1)} ★</p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DishDetailPage;
