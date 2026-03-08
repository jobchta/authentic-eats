import { motion, useInView } from "framer-motion";
import { Utensils, Store, Globe, MapPin, Users, MessageSquare } from "lucide-react";
import { stats } from "@/data/food-data";
import { useRef, useState, useEffect } from "react";

const statItems = [
  { icon: Utensils, value: stats.dishes, suffix: "+", label: "Dishes catalogued" },
  { icon: Store, value: stats.restaurants, suffix: "+", label: "Restaurants rated" },
  { icon: MapPin, value: stats.cities, suffix: "+", label: "Cities explored" },
  { icon: Globe, value: stats.countries, suffix: "", label: "Countries covered" },
  { icon: MessageSquare, value: stats.reviews / 1000000, suffix: "M+", label: "Reviews written", decimal: 1 },
  { icon: Users, value: stats.contributors / 1000, suffix: "K+", label: "Contributors", decimal: 0 },
];

function AnimatedNumber({ value, suffix, decimal }: { value: number; suffix: string; decimal?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease out
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = value * eased;
      setDisplay(current);
      if (step >= steps) {
        clearInterval(timer);
        setDisplay(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const formatted = decimal !== undefined
    ? display.toFixed(decimal)
    : display >= 1000
      ? Math.round(display).toLocaleString()
      : Math.round(display).toString();

  return (
    <span ref={ref}>
      {formatted}{suffix}
    </span>
  );
}

const StatsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Rich layered background */}
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black/30" />
      <div className="absolute inset-0 noise" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
            The World Eats Together
          </h2>
          <p className="font-body text-primary-foreground/50 mt-3 text-lg">
            A living database of authentic food, built by the people who eat it
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500 group"
            >
              <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <p className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
                <AnimatedNumber value={item.value} suffix={item.suffix} decimal={item.decimal} />
              </p>
              <p className="font-body text-xs text-primary-foreground/40 mt-2 font-medium tracking-wide">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
