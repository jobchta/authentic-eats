import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Heart, MapPin, Star, ArrowLeft, Compass } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useExploredCountries, useFavoriteDishes, useToggleExplored, useToggleFavorite } from "@/hooks/use-passport";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const PassportPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: explored, isLoading: loadingExplored } = useExploredCountries();
  const { data: favorites, isLoading: loadingFavorites } = useFavoriteDishes();
  const toggleExplored = useToggleExplored();
  const toggleFavorite = useToggleFavorite();

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Compass className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Your Food Passport</h1>
          <p className="font-body text-muted-foreground mb-6">Sign in to start tracking your culinary journey across 197 countries.</p>
          <Button onClick={() => navigate("/auth")} size="lg">Sign In to Get Started</Button>
        </div>
      </div>
    );
  }

  const exploredCount = explored?.length ?? 0;
  const totalCountries = 196;
  const progressPercent = Math.round((exploredCount / totalCountries) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Passport Header */}
          <div className="mb-12">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
              🛂 Food Passport
            </h1>
            <p className="font-body text-muted-foreground">Your personal journey through the world's cuisines</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-body text-sm font-semibold text-muted-foreground">Countries Explored</span>
              </div>
              <p className="font-display text-4xl font-bold text-foreground">{exploredCount}</p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="font-body text-xs text-muted-foreground mt-1">{progressPercent}% of {totalCountries} countries</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="h-5 w-5 text-destructive" />
                <span className="font-body text-sm font-semibold text-muted-foreground">Favorite Dishes</span>
              </div>
              <p className="font-display text-4xl font-bold text-foreground">{favorites?.length ?? 0}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-5 w-5 text-accent" />
                <span className="font-body text-sm font-semibold text-muted-foreground">Continents Reached</span>
              </div>
              <p className="font-display text-4xl font-bold text-foreground">
                {new Set(explored?.map((e: any) => e.country?.continent)).size || 0}
              </p>
            </div>
          </div>

          {/* Explored Countries */}
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Explored Countries</h2>
            {loadingExplored ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : exploredCount === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Globe className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-body text-muted-foreground">No countries explored yet. Visit the <button onClick={() => navigate("/map")} className="text-primary font-semibold hover:underline">Food Map</button> to start!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {explored!.map((item: any, i: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-all"
                  >
                    <span className="text-3xl">{item.country?.flag_emoji}</span>
                    <p className="font-display text-sm font-semibold text-foreground mt-2">{item.country?.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{item.country?.region}</p>
                    <button
                      onClick={() => toggleExplored.mutate({ countryId: item.country_id, isExplored: true })}
                      className="mt-2 font-body text-[10px] text-destructive hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
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
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : (favorites?.length ?? 0) === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Heart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-body text-muted-foreground">No favorites yet. Browse <button onClick={() => navigate("/#dishes")} className="text-primary font-semibold hover:underline">dishes</button> and tap the heart!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites!.map((item: any, i: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-card border border-border rounded-xl p-5 flex gap-4 items-start"
                  >
                    <span className="text-4xl flex-shrink-0">{item.dish?.country?.flag_emoji ?? "🍽️"}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold text-foreground truncate">{item.dish?.name}</h3>
                      <p className="font-body text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.dish?.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-body text-xs font-semibold">{item.dish?.rating?.toFixed(1)}</span>
                        </div>
                        <span className="font-body text-xs text-muted-foreground">{item.dish?.cuisine_type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite.mutate({ dishId: item.dish_id, isFavorited: true })}
                      className="text-destructive hover:text-destructive/70 transition-colors flex-shrink-0"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </motion.div>
                ))}
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
