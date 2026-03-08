import { motion } from "framer-motion";
import { Utensils, Store, Globe, MapPin, Users, MessageSquare } from "lucide-react";
import { stats } from "@/data/food-data";

const statItems = [
  { icon: Utensils, value: stats.dishes.toLocaleString() + "+", label: "Dishes catalogued" },
  { icon: Store, value: stats.restaurants.toLocaleString() + "+", label: "Restaurants rated" },
  { icon: MapPin, value: stats.cities.toLocaleString() + "+", label: "Cities explored" },
  { icon: Globe, value: stats.countries.toString(), label: "Countries covered" },
  { icon: MessageSquare, value: (stats.reviews / 1000000).toFixed(1) + "M+", label: "Reviews written" },
  { icon: Users, value: (stats.contributors / 1000).toFixed(0) + "K+", label: "Contributors" },
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            The World Eats Together
          </h2>
          <p className="font-body text-primary-foreground/60 mt-2">
            A living database of authentic food, built by the people who eat it
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-5"
            >
              <item.icon className="h-5 w-5 text-accent mx-auto mb-3" />
              <p className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
                {item.value}
              </p>
              <p className="font-body text-xs text-primary-foreground/50 mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
