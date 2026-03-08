import { Star, MapPin } from "lucide-react";
import dishRamen from "@/assets/dish-ramen.jpg";
import dishTacos from "@/assets/dish-tacos.jpg";
import dishButterChicken from "@/assets/dish-butter-chicken.jpg";
import dishCroissant from "@/assets/dish-croissant.jpg";
import dishPadthai from "@/assets/dish-padthai.jpg";
import dishEthiopian from "@/assets/dish-ethiopian.jpg";

const dishes = [
  {
    name: "Tonkotsu Ramen",
    cuisine: "Japanese",
    location: "Tokyo, Japan",
    rating: 4.9,
    image: dishRamen,
    description: "Rich pork bone broth simmered for 18 hours",
  },
  {
    name: "Tacos al Pastor",
    cuisine: "Mexican",
    location: "Mexico City, Mexico",
    rating: 4.8,
    image: dishTacos,
    description: "Spit-grilled pork with pineapple and cilantro",
  },
  {
    name: "Butter Chicken",
    cuisine: "Indian",
    location: "Delhi, India",
    rating: 4.9,
    image: dishButterChicken,
    description: "Creamy tomato curry with tender tandoori chicken",
  },
  {
    name: "Croissant au Beurre",
    cuisine: "French",
    location: "Paris, France",
    rating: 4.7,
    image: dishCroissant,
    description: "72-hour laminated dough, pure French butter",
  },
  {
    name: "Pad Thai Goong",
    cuisine: "Thai",
    location: "Bangkok, Thailand",
    rating: 4.8,
    image: dishPadthai,
    description: "Wok-fired rice noodles with tiger prawns",
  },
  {
    name: "Doro Wat & Injera",
    cuisine: "Ethiopian",
    location: "Addis Ababa, Ethiopia",
    rating: 4.7,
    image: dishEthiopian,
    description: "Spiced chicken stew on sourdough flatbread",
  },
];

const FeaturedDishes = () => {
  return (
    <section id="dishes" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
            Editor's Selection
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Iconic Dishes
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-md mx-auto">
            The dishes that define their cuisine — tasted and verified by our global community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <article
              key={dish.name}
              className="group card-hover bg-card rounded-lg overflow-hidden border border-border cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-body font-semibold px-3 py-1.5 rounded-full">
                    {dish.cuisine}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-xl font-semibold text-card-foreground">
                    {dish.name}
                  </h3>
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-body text-sm font-semibold">{dish.rating}</span>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground mb-3">
                  {dish.description}
                </p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="font-body text-xs">{dish.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDishes;
