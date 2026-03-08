import { Star, Award, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const restaurants = [
  {
    name: "Sukiyabashi Jiro",
    cuisine: "Japanese",
    city: "Tokyo",
    rating: 4.97,
    tier: "Legendary",
    speciality: "Omakase Sushi",
    reviews: 12400,
  },
  {
    name: "Pujol",
    cuisine: "Mexican",
    city: "Mexico City",
    rating: 4.93,
    tier: "Exceptional",
    speciality: "Mole Madre",
    reviews: 8900,
  },
  {
    name: "Gaggan Anand",
    cuisine: "Indian",
    city: "Bangkok",
    rating: 4.95,
    tier: "Legendary",
    speciality: "Progressive Indian",
    reviews: 7600,
  },
  {
    name: "Septime",
    cuisine: "French",
    city: "Paris",
    rating: 4.88,
    tier: "Exceptional",
    speciality: "Neo-Bistro",
    reviews: 9200,
  },
];

const tierColors: Record<string, string> = {
  Legendary: "bg-accent text-accent-foreground",
  Exceptional: "bg-primary text-primary-foreground",
};

const TopRestaurants = () => {
  return (
    <section id="restaurants" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
            Verified Excellence
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Top Restaurants
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-md mx-auto">
            The world's finest, ranked by authenticity, craft, and taste — not hype.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {restaurants.map((restaurant, index) => (
            <article
              key={restaurant.name}
              className="card-hover flex gap-5 p-6 bg-card rounded-lg border border-border cursor-pointer"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <span className="font-display text-lg font-bold text-secondary-foreground">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg font-semibold text-card-foreground truncate">
                    {restaurant.name}
                  </h3>
                  <Badge className={`text-[10px] font-body ${tierColors[restaurant.tier]}`}>
                    <Award className="h-3 w-3 mr-1" />
                    {restaurant.tier}
                  </Badge>
                </div>
                <p className="font-body text-sm text-muted-foreground mb-2">
                  {restaurant.speciality} · {restaurant.cuisine}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-body text-sm font-semibold">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="font-body text-xs">{restaurant.city}</span>
                  </div>
                  <span className="font-body text-xs text-muted-foreground">
                    {restaurant.reviews.toLocaleString()} reviews
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopRestaurants;
