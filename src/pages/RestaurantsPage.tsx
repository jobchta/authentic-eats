import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Award, MapPin, Search, Filter, ChefHat, Globe, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OsmRestaurantCard from "@/components/OsmRestaurantCard";
import { useRestaurantsPaginated, useRestaurantStats } from "@/hooks/use-restaurants";
import { useOsmRestaurants } from "@/hooks/use-osm-restaurants";

const tierConfig: Record<string, { classes: string; icon: boolean; glow?: boolean }> = {
  Legendary: { classes: "badge-gold", icon: true, glow: true },
  Exceptional: { classes: "bg-primary text-primary-foreground", icon: true },
  Outstanding: { classes: "bg-secondary text-secondary-foreground border border-border", icon: false },
  Remarkable: { classes: "bg-muted text-muted-foreground", icon: false },
};

const tiers = ["All", "Legendary", "Exceptional", "Outstanding", "Remarkable"];
const continents = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"];
const priceRanges = ["All", "$", "$$", "$$$", "$$$$"];

const RestaurantsPage = () => {
  const [activeTier, setActiveTier] = useState("All");
  const [activeContinent, setActiveContinent] = useState("All");
  const [activePrice, setActivePrice] = useState("All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const filters = useMemo(
    () => ({ tier: activeTier, continent: activeContinent, price: activePrice, search }),
    [activeTier, activeContinent, activePrice, search]
  );

  const {
    data: pages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRestaurantsPaginated(filters);

  const { data: stats } = useRestaurantStats();
  const { data: osmData, isLoading: osmLoading, isError: osmError } = useOsmRestaurants(citySearch);

  const allRestaurants = useMemo(
    () => pages?.pages.flatMap((p) => p.items) || [],
    [pages]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black/40" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 noise" />
          <div className="container mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-accent" />
                </div>
                <Badge className="badge-gold text-xs px-3 py-1">
                  {stats?.total || "100"}+ Curated · 15M+ Discoverable
                </Badge>
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-[1.05] mb-4">
                World's Finest<br />Restaurants
              </h1>
              <p className="font-body text-primary-foreground/60 max-w-lg text-lg">
                From Michelin-starred temples to legendary street stalls. Browse our curated collection or search any city on Earth for live restaurant discovery.
              </p>
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { label: "Legendary", value: stats?.tiers?.Legendary || 0 },
                  { label: "Exceptional", value: stats?.tiers?.Exceptional || 0 },
                  { label: "Outstanding", value: stats?.tiers?.Outstanding || 0 },
                  { label: "Remarkable", value: stats?.tiers?.Remarkable || 0 },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-3xl font-bold text-primary-foreground">{s.value}</p>
                    <p className="font-body text-xs text-primary-foreground/40 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search & Filters */}
        <div className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter curated restaurants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 font-body"
                />
              </div>
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                <Input
                  placeholder="Search any city on Earth (e.g. Tokyo, Lagos, Lima)..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="pl-10 font-body border-accent/30 focus-visible:ring-accent"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="font-body gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Tier filter */}
            <div className="flex gap-2 flex-wrap mb-3">
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`font-body text-xs px-4 py-2 rounded-full transition-all ${
                    activeTier === tier
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tier === "All" ? "All Tiers" : tier}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-3"
                >
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-2 uppercase tracking-wider">Region</p>
                    <div className="flex gap-2 flex-wrap">
                      {continents.map((c) => (
                        <button
                          key={c}
                          onClick={() => setActiveContinent(c)}
                          className={`font-body text-xs px-3 py-1.5 rounded-full transition-all ${
                            activeContinent === c
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-2 uppercase tracking-wider">Price</p>
                    <div className="flex gap-2">
                      {priceRanges.map((p) => (
                        <button
                          key={p}
                          onClick={() => setActivePrice(p)}
                          className={`font-body text-xs px-3 py-1.5 rounded-full transition-all ${
                            activePrice === p
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {p === "All" ? "All Prices" : p}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="font-body text-xs text-muted-foreground mt-3">
              Showing {allRestaurants.length} curated restaurant{allRestaurants.length !== 1 ? "s" : ""}
              {hasNextPage ? "+" : ""}
            </p>
          </div>
        </div>

        {/* OSM Live Discovery Section */}
        {citySearch.length >= 2 && (
          <div className="container mx-auto px-4 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Live Discovery: {citySearch}
              </h2>
              {osmLoading && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
            </div>

            {osmLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : osmError ? (
              <p className="font-body text-sm text-muted-foreground">
                Could not reach discovery service. Try again in a moment.
              </p>
            ) : osmData && osmData.results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {osmData.results.map((r, i) => (
                    <OsmRestaurantCard key={r.osm_id} restaurant={r} index={i} />
                  ))}
                </div>
                {osmData.attribution && (
                  <p className="font-body text-[10px] text-muted-foreground/50 mt-3">
                    Data: {osmData.attribution}
                  </p>
                )}
              </>
            ) : osmData ? (
              <p className="font-body text-sm text-muted-foreground">
                No restaurants found for "{citySearch}". Try a different city name.
              </p>
            ) : null}
          </div>
        )}

        {/* Curated Results */}
        <div className="container mx-auto px-4 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="h-5 w-5 text-foreground" />
            <h2 className="font-display text-xl font-bold text-foreground">Curated Collection</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : allRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-body text-muted-foreground">No restaurants match your filters.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 font-body"
                onClick={() => {
                  setActiveTier("All");
                  setActiveContinent("All");
                  setActivePrice("All");
                  setSearch("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {allRestaurants.map((restaurant, index) => {
                    const isLegendary = restaurant.tier === "Legendary";
                    return (
                      <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`}>
                        <motion.article
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: Math.min(index * 0.03, 0.3) }}
                          whileHover={{ y: -4 }}
                          className={`flex gap-4 p-5 bg-card rounded-xl border cursor-pointer transition-all duration-500 hover:shadow-xl relative overflow-hidden ${
                            isLegendary ? "border-accent/30 glow-gold" : "border-border"
                          }`}
                        >
                          {isLegendary && (
                            <div className="absolute inset-0 shimmer pointer-events-none" />
                          )}
                          <div
                            className={`flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${
                              isLegendary ? "bg-gradient-to-br from-accent to-accent/60" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`font-display text-lg font-bold ${
                                isLegendary ? "text-accent-foreground" : "text-foreground"
                              }`}
                            >
                              #{index + 1}
                            </span>
                            {(restaurant.michelin_stars ?? 0) > 0 && (
                              <div className="flex gap-0.5 mt-0.5">
                                {Array.from({ length: restaurant.michelin_stars! }).map((_, i) => (
                                  <Star key={i} className="h-2 w-2 fill-accent text-accent" />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-display text-base font-semibold text-foreground truncate">
                                {restaurant.name}
                              </h3>
                              <Badge
                                className={`text-[9px] font-body shrink-0 ${tierConfig[restaurant.tier]?.classes || ""}`}
                              >
                                {tierConfig[restaurant.tier]?.icon && <Award className="h-2.5 w-2.5 mr-0.5" />}
                                {restaurant.tier}
                              </Badge>
                            </div>
                            <p className="font-body text-xs text-muted-foreground mb-2">
                              {restaurant.speciality} · {restaurant.cuisine_type}
                            </p>
                            {restaurant.description && (
                              <p className="font-body text-xs text-muted-foreground/70 line-clamp-1 mb-2">
                                {restaurant.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-1 text-accent">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="font-body text-xs font-bold">
                                  {restaurant.rating?.toFixed(2)}
                                </span>
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
                      </Link>
                    );
                  })}
                </AnimatePresence>
              </div>

              {hasNextPage && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="font-body gap-2"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Restaurants"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantsPage;
