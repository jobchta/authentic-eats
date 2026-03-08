import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, Award, MapPin, ChefHat, Globe, Clock, DollarSign, ArrowLeft, Flame, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { DbRestaurant } from "@/hooks/use-restaurants";

const tierConfig: Record<string, { classes: string; icon: boolean }> = {
  Legendary: { classes: "badge-gold", icon: true },
  Exceptional: { classes: "bg-primary text-primary-foreground", icon: true },
  Outstanding: { classes: "bg-secondary text-secondary-foreground border border-border", icon: false },
  Remarkable: { classes: "bg-muted text-muted-foreground", icon: false },
};

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*, country:countries(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as DbRestaurant;
    },
    enabled: !!id,
  });

  const { data: similar } = useQuery({
    queryKey: ["similar-restaurants", restaurant?.cuisine_type, restaurant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*, country:countries(*)")
        .eq("cuisine_type", restaurant!.cuisine_type)
        .neq("id", restaurant!.id)
        .order("rating", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as unknown as DbRestaurant[];
    },
    enabled: !!restaurant,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 rounded-2xl mb-6" />
          <Skeleton className="h-32 rounded-xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <Globe className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Restaurant not found</h1>
          <Link to="/restaurants">
            <Button variant="outline" className="font-body mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Restaurants
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isLegendary = restaurant.tier === "Legendary";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className={`relative overflow-hidden py-16 px-4 ${isLegendary ? "bg-gradient-to-br from-primary via-primary to-accent/20" : "bg-primary"}`}>
          <div className="absolute inset-0 noise" />
          {isLegendary && <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />}
          <div className="container mx-auto relative z-10">
            <Link to="/restaurants" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground mb-6 font-body text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> All Restaurants
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <Badge className={`text-xs font-body ${tierConfig[restaurant.tier]?.classes || ""}`}>
                  {tierConfig[restaurant.tier]?.icon && <Award className="h-3 w-3 mr-1" />}
                  {restaurant.tier}
                </Badge>
                {(restaurant.michelin_stars ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: restaurant.michelin_stars! }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                    <span className="font-body text-xs text-primary-foreground/60 ml-1">Michelin</span>
                  </div>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-3">
                {restaurant.name}
              </h1>
              <p className="font-body text-primary-foreground/60 text-lg max-w-2xl mb-6">
                {restaurant.description}
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-display text-2xl font-bold text-primary-foreground">{restaurant.rating?.toFixed(2)}</span>
                  <span className="font-body text-sm text-primary-foreground/40">({(restaurant.reviews_count ?? 0).toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/60">
                  <MapPin className="h-4 w-4" />
                  <span className="font-body">{restaurant.city}, {restaurant.country?.name} {restaurant.country?.flag_emoji}</span>
                </div>
                <span className="font-body text-lg text-accent font-semibold">{restaurant.price_range}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Details Grid */}
        <div className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: ChefHat, label: "Speciality", value: restaurant.speciality || restaurant.cuisine_type },
              { icon: Clock, label: "Established", value: restaurant.year_established ? `Since ${restaurant.year_established}` : "Unknown" },
              { icon: Globe, label: "Cuisine", value: restaurant.cuisine_type },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-5 shadow-lg"
              >
                <item.icon className="h-5 w-5 text-accent mb-2" />
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="font-display text-lg font-semibold text-foreground">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="container mx-auto px-4 mt-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {restaurant.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-body text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Country Info */}
        {restaurant.country && (
          <div className="container mx-auto px-4 mt-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{restaurant.country.flag_emoji}</span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{restaurant.country.name}</h3>
                  <p className="font-body text-xs text-muted-foreground">{restaurant.country.region} · {restaurant.country.continent}</p>
                </div>
              </div>
              {restaurant.country.food_culture_summary && (
                <p className="font-body text-sm text-muted-foreground">{restaurant.country.food_culture_summary}</p>
              )}
            </div>
          </div>
        )}

        {/* Similar Restaurants */}
        {similar && similar.length > 0 && (
          <div className="container mx-auto px-4 mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">More {restaurant.cuisine_type} Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similar.map((r) => (
                <Link key={r.id} to={`/restaurants/${r.id}`}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-lg transition-all"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Star className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-sm font-semibold text-foreground truncate">{r.name}</h3>
                        <Badge className={`text-[9px] font-body ${tierConfig[r.tier]?.classes || ""}`}>{r.tier}</Badge>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {r.city}, {r.country?.name} {r.country?.flag_emoji} · {r.rating?.toFixed(2)} ★
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;
