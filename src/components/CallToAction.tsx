import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { allDishImages } from "@/lib/dish-images";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealStats } from "@/hooks/use-real-stats";

const CallToAction = () => {
  const [imgIndex, setImgIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: stats } = useRealStats();

  useEffect(() => {
    const timer = setInterval(() => setImgIndex((i) => (i + 1) % allDishImages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setSubscribing(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "You're already subscribed! 🎉" });
          setSubscribed(true);
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast({ title: "Subscribed! Welcome aboard 🍽️" });
      }
    } catch (err) {
      toast({ title: "Something went wrong. Try again.", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

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
              Join {stats?.members ? `${stats.members.toLocaleString()}+` : "Our"} Food Lovers
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
              <Button
                size="lg"
                variant="outline"
                className="font-body border-background/40 text-background hover:bg-background/15 bg-background/5"
                onClick={() => navigate("/pricing")}
              >
                View Plans
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
              <p className="font-body text-xs text-accent mt-3 font-bold">— Early Beta User</p>
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
              <form
                onSubmit={(e) => { e.preventDefault(); handleSubscribe(); }}
                className="flex gap-2"
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed}
                  className="h-12 font-body bg-white/10 border-white/20 text-background placeholder:text-background/30 focus:ring-accent/50"
                />
                <Button
                  type="submit"
                  disabled={subscribed || subscribing}
                  className="h-12 px-6 font-body font-semibold shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {subscribed ? <Check className="h-4 w-4" /> : subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                </Button>
              </form>
              {subscribed && (
                <p className="font-body text-xs text-accent mt-3">
                  ✓ You're subscribed! Check your inbox on Friday.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
