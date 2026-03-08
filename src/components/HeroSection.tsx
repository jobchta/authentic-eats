import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-food.jpg";

const headlines = [
  { top: "Discover Food", bottom: "Worth Traveling For" },
  { top: "The World's Most", bottom: "Authentic Flavors" },
  { top: "Find Your Next", bottom: "Unforgettable Meal" },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % headlines.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[100vh] min-h-[700px] flex items-end overflow-hidden">
      {/* Parallax image with subtle zoom */}
      <motion.img
        initial={{ scale: 1.15 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        src={heroImage}
        alt="Beautifully plated authentic cuisine"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="hero-overlay absolute inset-0" />

      {/* Ambient light effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Floating stats with glass effect */}
      <div className="absolute top-24 right-8 hidden lg:flex flex-col gap-3 z-10">
        {[
          { label: "Dishes catalogued", value: "38,400+" },
          { label: "Restaurants rated", value: "13,600+" },
          { label: "Countries covered", value: "195" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.15, duration: 0.6, type: "spring" }}
            className="glass-dark rounded-xl px-5 py-4 text-right hover:bg-white/10 transition-colors group"
          >
            <p className="font-display text-2xl font-bold text-primary-foreground group-hover:text-accent transition-colors">{stat.value}</p>
            <p className="font-body text-xs text-primary-foreground/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
          className="max-w-3xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-body text-sm font-bold tracking-[0.4em] uppercase text-accent mb-6"
          >
            The World's Authentic Food Guide
          </motion.p>

          <div className="h-[160px] md:h-[220px] relative overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.h1
                key={current}
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -40, rotateX: 15 }}
                transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
                className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-[1.05] text-shadow-hero"
              >
                {headlines[current].top}
                <br />
                <span className="text-gradient-gold italic">{headlines[current].bottom}</span>
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="font-body text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-xl leading-relaxed"
          >
            Curated by 184,000+ food lovers across 195 countries. Every dish verified. Every restaurant authentic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 max-w-xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search dishes, cuisines, cities..."
                className="pl-12 h-14 text-base bg-background/95 backdrop-blur-md border-border font-body rounded-xl shadow-lg"
              />
            </div>
            <Button className="h-14 px-10 font-body font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              Explore
            </Button>
          </motion.div>

          {/* Quick tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {["🔥 Trending", "🍕 Pizza", "🍜 Ramen", "🌮 Tacos", "🥘 Curry", "🥐 Pastries"].map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="font-body text-xs text-primary-foreground/70 glass-dark hover:bg-white/15 px-4 py-2 rounded-full transition-colors"
              >
                {tag}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default HeroSection;
