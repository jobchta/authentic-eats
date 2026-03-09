import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { allDishImages } from "@/lib/dish-images";
import { useNavigate } from "react-router-dom";
import { useRealStats } from "@/hooks/use-real-stats";

const headlines = [
  { top: "Discover Food", bottom: "Worth Traveling For" },
  { top: "The World's Most", bottom: "Authentic Flavors" },
  { top: "Find Your Next", bottom: "Unforgettable Meal" },
];

const typewriterPhrases = [
  "Search ramen in Tokyo...",
  "Find tacos in Mexico City...",
  "Discover pasta in Naples...",
  "Explore curry in Delhi...",
  "Try phở in Hanoi...",
];

const floatingEmojis = ["🍜", "🌮", "🍕", "🥘", "🍣", "🥐", "🍛", "🥩", "🍲", "🧆"];

const quickTags = [
  { label: "🔥 Trending", query: "" },
  { label: "🍕 Pizza", query: "pizza" },
  { label: "🍜 Ramen", query: "ramen" },
  { label: "🌮 Tacos", query: "tacos" },
  { label: "🥘 Curry", query: "curry" },
  { label: "🥐 Pastries", query: "pastry" },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { data: stats } = useRealStats();

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/restaurants?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate("/restaurants");
    }
  };

  const handleTagClick = (query: string) => {
    if (query) {
      navigate(`/restaurants?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/restaurants");
    }
  };

  // Headline rotation
  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % headlines.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // Background image crossfade
  useEffect(() => {
    const timer = setInterval(() => setBgIndex((i) => (i + 1) % allDishImages.length), 6000);
    return () => clearInterval(timer);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const phrase = typewriterPhrases[phraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < phrase.length) {
          setPlaceholder(phrase.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(phrase.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((phraseIndex + 1) % typewriterPhrases.length);
        }
      }
    }, isDeleting ? 30 : 60);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  return (
    <section className="relative h-[100vh] min-h-[700px] flex items-end overflow-hidden">
      {/* Crossfading background images — only use 5 for performance */}
      {allDishImages.slice(0, 5).map((img, i) => (
        <motion.img
          key={i}
          src={img}
          alt=""
          initial={false}
          animate={{
            opacity: bgIndex % 5 === i ? 1 : 0,
            scale: bgIndex % 5 === i ? 1.05 : 1.15,
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          loading={i < 2 ? "eager" : "lazy"}
        />
      ))}
      <div className="hero-overlay absolute inset-0" />

      {/* Ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Floating food emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((emoji, i) => (
          <span
            key={i}
            className="absolute text-2xl opacity-20 animate-float-up"
            style={{
              left: `${5 + i * 9.5}%`,
              bottom: `-40px`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${12 + i * 2}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Floating stats */}
      <div className="absolute top-24 right-8 hidden lg:flex flex-col gap-3 z-10">
        {[
          { label: "Dishes catalogued", value: stats?.dishes?.toLocaleString() ?? "—" },
          { label: "Restaurants rated", value: stats?.restaurants?.toLocaleString() ?? "—" },
          { label: "Countries covered", value: stats?.countries?.toLocaleString() ?? "—" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.15, duration: 0.6, type: "spring" }}
            className="glass-dark rounded-xl px-5 py-4 text-right hover:bg-white/10 transition-colors group"
          >
            <p className="font-display text-2xl font-bold text-primary-foreground group-hover:text-gradient-gold transition-colors">
              {stat.value}
            </p>
            <p className="font-body text-xs text-primary-foreground/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 pb-28">
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

          <div className="min-h-[140px] md:min-h-[200px] relative mb-8">
            <AnimatePresence mode="wait">
              <motion.h1
                key={current}
                initial={{ opacity: 0, y: 50, rotateX: -20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -50, rotateX: 20 }}
                transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
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
            Curated by food lovers across {stats?.countries ?? "190+"} countries. Every dish verified. Every restaurant authentic.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 max-w-xl"
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={placeholder}
                className="pl-12 h-14 text-base bg-background/95 backdrop-blur-md border-border font-body rounded-xl shadow-lg focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
              />
              <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none glow-gold" />
            </div>
            <Button type="submit" className="h-14 px-10 font-body font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
              Explore
            </Button>
          </motion.form>

          {/* Quick tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {quickTags.map((tag) => (
              <motion.button
                key={tag.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagClick(tag.query)}
                className="font-body text-xs text-primary-foreground/70 glass-dark hover:bg-white/15 px-4 py-2 rounded-full transition-colors"
              >
                {tag.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-primary-foreground/40">
          Scroll
        </span>
        <ChevronDown className="h-4 w-4 text-primary-foreground/40 animate-bounce-down" />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default HeroSection;
