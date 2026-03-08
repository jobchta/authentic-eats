import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Heart, MapPin, Star, ArrowLeft, Compass, Trophy, Plane } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useExploredCountries, useFavoriteDishes, useToggleExplored, useToggleFavorite } from "@/hooks/use-passport";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getDishImage, allDishImages } from "@/lib/dish-images";

const milestones = [
  { count: 1, label: "First Stamp", emoji: "🌱" },
  { count: 5, label: "Food Tourist", emoji: "🧳" },
  { count: 10, label: "Globe Trotter", emoji: "🌍" },
  { count: 25, label: "Culinary Explorer", emoji: "🗺️" },
  { count: 50, label: "World Taster", emoji: "🏅" },
  { count: 100, label: "Flavor Master", emoji: "👑" },
  { count: 196, label: "Legend", emoji: "🏆" },
];

const PassportPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: explored, isLoading: loadingExplored } = useExploredCountries();
  const { data: favorites, isLoading: loadingFavorites } = useFavoriteDishes();
  const toggleExplored = useToggleExplored();
  const toggleFavorite = useToggleFavorite();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative z-10"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center animate-pulse-glow">
            <Compass className="h-12 w-12 text-accent" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Your Food Passport</h1>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            Sign in to start tracking your culinary journey across 197 countries. Collect stamps, save favorites, and become a food legend.
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" className="font-body font-bold shadow-lg">
            Sign In to Get Started
          </Button>
        </motion.div>
      </div>
    );
  }

  const exploredCount = explored?.length ?? 0;
  const totalCountries = 196;
  const progressPercent = Math.round((exploredCount / totalCountries) * 100);
  const currentMilestone = milestones.filter((m) => exploredCount >= m.count).pop();
  const nextMilestone = milestones.find((m) => exploredCount < m.count);
  const continentsReached = new Set(explored?.map((e: any) => e.country?.continent)).size || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Passport Header with rich gradient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black/30" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
              <div className="absolute inset-0 noise" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🛂</span>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
                      Food Passport
                    </h1>
                  </div>
                  <p className="font-body text-primary-foreground/60">
                    Your personal journey through the world's cuisines
                  </p>
                  {currentMilestone && (
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mt-4">
                      <span className="text-xl">{currentMilestone.emoji}</span>
                      <span className="font-body text-sm font-bold text-primary-foreground">{currentMilestone.label}</span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsla(0,0%,100%,0.1)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="hsl(38, 70%, 50%)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${progressPercent * 2.64} ${264 - progressPercent * 2.64}`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-3xl font-bold text-primary-foreground">{exploredCount}</span>
                      <span className="font-body text-[10px] text-primary-foreground/50">of {totalCountries}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Globe, label: "Countries Explored", value: exploredCount, color: "text-primary", bg: "bg-primary/10" },
              { icon: Heart, label: "Favorite Dishes", value: favorites?.length ?? 0, color: "text-destructive", bg: "bg-destructive/10" },
              { icon: Plane, label: "Continents Reached", value: continentsReached, color: "text-accent", bg: "bg-accent/10" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="font-body text-sm font-bold text-muted-foreground">{stat.label}</span>
                </div>
                <p className="font-display text-4xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Milestones */}
          {nextMilestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-12 bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-accent" />
                <h3 className="font-display text-lg font-bold text-foreground">Next Milestone</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{nextMilestone.emoji}</span>
                <div className="flex-1">
                  <p className="font-body text-sm font-bold text-foreground">{nextMilestone.label}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    {nextMilestone.count - exploredCount} more countries to go
                  </p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${(exploredCount / nextMilestone.count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Explored Countries */}
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Explored Countries</h2>
            {loadingExplored ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            ) : exploredCount === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Globe className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="font-body text-muted-foreground">
                  No countries explored yet. Visit the{" "}
                  <button onClick={() => navigate("/map")} className="text-primary font-bold hover:underline">
                    Food Map
                  </button>{" "}
                  to start collecting stamps!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {explored!.map((item: any, i: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="group bg-card border-2 border-primary/20 rounded-2xl p-4 text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                    <div className="relative z-10">
                      <div className="stamp mx-auto w-14 h-14 flex items-center justify-center mb-2">
                        <span className="text-2xl">{item.country?.flag_emoji}</span>
                      </div>
                      <p className="font-display text-sm font-bold text-foreground">{item.country?.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.country?.region}</p>
                      <button
                        onClick={() => toggleExplored.mutate({ countryId: item.country_id, isExplored: true })}
                        className="mt-2 font-body text-[10px] text-destructive hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Favorite Dishes */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Favorite Dishes</h2>
            {loadingFavorites ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
              </div>
            ) : (favorites?.length ?? 0) === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Heart className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="font-body text-muted-foreground">
                  No favorites yet. Browse{" "}
                  <button onClick={() => navigate("/#dishes")} className="text-primary font-bold hover:underline">
                    dishes
                  </button>{" "}
                  and tap the heart!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites!.map((item: any, i: number) => {
                  const img = getDishImage(item.dish?.name || "", item.dish?.cuisine_type || "") || allDishImages[i % allDishImages.length];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group bg-card border border-border rounded-2xl overflow-hidden flex"
                    >
                      <div className="w-28 flex-shrink-0 relative overflow-hidden">
                        <img src={img} alt={item.dish?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-display text-base font-bold text-foreground truncate">{item.dish?.name}</h3>
                          <p className="font-body text-xs text-muted-foreground line-clamp-2 mt-1">{item.dish?.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-accent/10 rounded-full px-2 py-0.5">
                              <Star className="h-3 w-3 fill-accent text-accent" />
                              <span className="font-body text-xs font-bold">{item.dish?.rating?.toFixed(1)}</span>
                            </div>
                            <span className="font-body text-[10px] text-muted-foreground">{item.dish?.cuisine_type}</span>
                          </div>
                          <button
                            onClick={() => toggleFavorite.mutate({ dishId: item.dish_id, isFavorited: true })}
                            className="text-destructive hover:text-destructive/70 transition-colors"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PassportPage;
