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
      <img
        src={heroImage}
        alt="Beautifully plated authentic cuisine"
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      <div className="hero-overlay absolute inset-0" />

      {/* Floating stats */}
      <div className="absolute top-24 right-8 hidden lg:flex flex-col gap-3 z-10">
        {[
          { label: "Dishes catalogued", value: "38,400+" },
          { label: "Restaurants rated", value: "13,600+" },
          { label: "Countries covered", value: "195" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="bg-background/10 backdrop-blur-md border border-primary-foreground/10 rounded-lg px-4 py-3 text-right"
          >
            <p className="font-display text-2xl font-bold text-primary-foreground">{stat.value}</p>
            <p className="font-body text-xs text-primary-foreground/60">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-4">
            The World's Authentic Food Guide
          </p>

          <div className="h-[160px] md:h-[200px] relative overflow-hidden mb-6">
            <AnimatePresence mode="wait">
              <motion.h1
                key={current}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-[1.05]"
              >
                {headlines[current].top}
                <br />
                <span className="text-gradient-gold italic">{headlines[current].bottom}</span>
              </motion.h1>
            </AnimatePresence>
          </div>

          <p className="font-body text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl">
            Curated by 184,000+ food lovers across 195 countries. Every dish verified. Every restaurant authentic.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search dishes, cuisines, cities..."
                className="pl-12 h-14 text-base bg-background/95 backdrop-blur-sm border-border font-body rounded-lg"
              />
            </div>
            <Button className="h-14 px-8 font-body font-semibold text-base">
              Explore
            </Button>
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap gap-2 mt-5">
            {["🔥 Trending", "🍕 Pizza", "🍜 Ramen", "🌮 Tacos", "🥘 Curry", "🥐 Pastries"].map((tag) => (
              <button
                key={tag}
                className="font-body text-xs text-primary-foreground/70 bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
