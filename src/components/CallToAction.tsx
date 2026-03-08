import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CallToAction = () => {
  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Join CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
              Join 184,000+ Food Lovers
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Taste Matters
            </h2>
            <p className="font-body text-muted-foreground mb-8 max-w-md">
              Rate dishes, recommend hidden gems, build your food passport, and help the world discover authentic flavors. Free forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="font-body font-semibold">
                Create Free Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="font-body">
                Learn How It Works
              </Button>
            </div>
          </motion.div>

          {/* Right: Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-secondary rounded-2xl p-8"
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              The Weekly Bite
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Every Friday: one iconic dish, one hidden-gem restaurant, one food story from a corner of the world you haven't tasted yet.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                className="h-12 font-body"
              />
              <Button className="h-12 px-6 font-body font-semibold shrink-0">
                Subscribe
              </Button>
            </div>
            <p className="font-body text-[10px] text-muted-foreground/60 mt-3">
              Join 42,000+ subscribers. No spam. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
