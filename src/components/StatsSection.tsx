import { motion, useInView } from "framer-motion";
import { Utensils, Store, Globe, MapPin, Users } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useRealStats } from "@/hooks/use-real-stats";

function AnimatedNumber({ value, suffix, decimal }: { value: number; suffix: string; decimal?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
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

  return <span ref={ref}>{formatted}{suffix}</span>;
}

const StatsSection = () => {
  const { data: stats } = useRealStats();

  const statItems = [
    { icon: Utensils, value: stats?.dishes ?? 0, suffix: "", label: "Dishes catalogued" },
    { icon: Store, value: stats?.restaurants ?? 0, suffix: "", label: "Restaurants rated" },
    { icon: Globe, value: stats?.countries ?? 0, suffix: "", label: "Countries covered" },
    { icon: Users, value: stats?.members ?? 0, suffix: "", label: "Community members" },
  ];

  return (
    <section className="py-28 relative overflow-hidden particles-bg">
      {/* Rich layered background */}
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black/40" />
      <div className="absolute inset-0 noise" />

      {/* Large ambient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            The World Eats Together
          </h2>
          <p className="font-body text-primary-foreground/50 text-lg max-w-xl mx-auto">
            A living database of authentic food, built by the people who eat it
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500 group"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 group-hover:shadow-lg group-hover:shadow-accent/20 transition-all">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient-gold">
                <AnimatedNumber value={item.value} suffix={item.suffix} />
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
