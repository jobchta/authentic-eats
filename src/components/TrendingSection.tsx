import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Star, MapPin, TrendingUp, Heart } from "lucide-react";
import { useHomepageDishes } from "@/hooks/use-homepage-data";
import { useAuth } from "@/hooks/use-auth";
import { useFavoriteDishes, useToggleFavorite } from "@/hooks/use-passport";
import { useNavigate } from "react-router-dom";
import { getDishImage, continentGradients } from "@/lib/dish-images";
import { Skeleton } from "@/components/ui/skeleton";

function TiltCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const TrendingSection = () => {
  const { data: dishes, isLoading } = useHomepageDishes();
  const { user } = useAuth();
  const { data: favorites } = useFavoriteDishes();
  const toggleFavorite = useToggleFavorite();
  const navigate = useNavigate();

  const trendingDishes = (dishes ?? []).slice(0, 8);
  const marqueeItems = [...trendingDishes, ...trendingDishes];

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

      {/* Marquee carousel */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden pb-6">
          {isLoading ? (
            <div className="flex gap-5 px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[340px]">
                  <Skeleton className="aspect-[3/4] rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="marquee-track">
              {marqueeItems.map((dish, i) => {
                const img = getDishImage(dish.name, dish.cuisine_type);
                const isFavorited = favorites?.some((f: any) => f.dish_id === dish.id) ?? false;
                const rank = (i % trendingDishes.length) + 1;
                const gradient = continentGradients[dish.country?.continent] || "from-muted to-muted";

                return (
                  <TiltCard
                    key={`${dish.id}-${i}`}
                    className="flex-shrink-0 w-[340px] cursor-pointer perspective-[800px]"
                    onClick={() => navigate(`/dishes/${dish.id}`)}
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group">
                      {img ? (
                        <img
                          src={img}
                          alt={dish.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <span className="text-6xl opacity-30">🍽️</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />

                      {/* Rank badge */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="badge-gold text-xs px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg font-body">
                            #{rank}
                          </span>
                          <span className="bg-accent/90 backdrop-blur-md text-accent-foreground text-[10px] font-body font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            Trending
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) { navigate("/auth"); return; }
                            toggleFavorite.mutate({ dishId: dish.id, isFavorited });
                          }}
                          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                          className={`p-2.5 rounded-full glass-dark transition-all hover:scale-110 ${
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
                  </TiltCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
