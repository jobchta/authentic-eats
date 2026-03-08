import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { allDishImages } from "@/lib/dish-images";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const [imgIndex, setImgIndex] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setImgIndex((i) => (i + 1) % allDishImages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/80" />
      <div className="absolute inset-0 noise" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Join CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-sm font-bold tracking-[0.3em] uppercase text-accent mb-3">
              Join 184,000+ Food Lovers
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-background mb-4 leading-tight">
              Your Taste <span className="text-gradient-gold italic">Matters</span>
            </h2>
            <p className="font-body text-background/60 mb-8 max-w-md leading-relaxed">
              Rate dishes, recommend hidden gems, build your food passport, and help the world discover authentic flavors. Free forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="font-body font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/auth")}
              >
                Create Free Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="font-body border-background/40 text-background hover:bg-background/15 bg-background/5">
                Learn How It Works
              </Button>
            </div>

            {/* Glass testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 glass-dark rounded-2xl p-5 max-w-md"
            >
              <p className="font-body text-sm text-background/70 italic leading-relaxed">
                "I've discovered more authentic food in 3 months on Palate Guide than in 10 years of traveling."
              </p>
              <p className="font-body text-xs text-accent mt-3 font-bold">— Sarah K., Tokyo</p>
            </motion.div>
          </motion.div>

          {/* Right: Rotating image + newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Rotating food gallery */}
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
              {allDishImages.slice(0, 6).map((img, i) => (
                <motion.img
                  key={i}
                  src={img}
                  alt=""
                  initial={false}
                  animate={{ opacity: imgIndex % 6 === i ? 1 : 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Newsletter */}
            <div className="glass-dark rounded-2xl p-8">
              <h3 className="font-display text-2xl font-bold text-background mb-2">
                The Weekly Bite 🍽️
              </h3>
              <p className="font-body text-sm text-background/50 mb-6">
                Every Friday: one iconic dish, one hidden-gem restaurant, one food story from a corner of the world you haven't tasted yet.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="h-12 font-body bg-white/10 border-white/20 text-background placeholder:text-background/30 focus:ring-accent/50"
                />
                <Button
                  className="h-12 px-6 font-body font-semibold shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setSubscribed(true)}
                >
                  {subscribed ? <Check className="h-4 w-4" /> : "Subscribe"}
                </Button>
              </div>
              <p className="font-body text-[10px] text-background/30 mt-3">
                Join 42,000+ subscribers. No spam. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
