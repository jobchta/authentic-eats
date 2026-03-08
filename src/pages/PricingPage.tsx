import { motion } from "framer-motion";
import { Check, Star, Crown, Sparkles, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore the world's food, no strings attached.",
    features: [
      "Browse all 38,400+ dishes",
      "Read community reviews",
      "Search by cuisine & city",
      "Save up to 10 favorites",
      "Basic restaurant info",
    ],
    locked: [],
    cta: "Current Plan",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Palate Pro",
    price: "$9",
    period: "/month",
    description: "For serious food lovers who travel and eat with purpose.",
    features: [
      "Everything in Free, plus:",
      "Unlimited saved lists & collections",
      "Ad-free experience",
      "Personalized recommendations",
      "Food Passport with badges",
      "Early access to new reviews",
      "Download offline city guides",
      "Priority support",
    ],
    locked: [],
    cta: "Start Free Trial",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Palate Black",
    price: "$29",
    period: "/month",
    description: "The ultimate food connoisseur experience.",
    features: [
      "Everything in Pro, plus:",
      "Exclusive critic-only reviews",
      "Restaurant reservation priority",
      "Invite-only tasting events",
      "Direct message food critics",
      "Custom trip itineraries by AI",
      "Quarterly food box (curated spices & ingredients)",
      "Black member badge on profile",
    ],
    locked: [],
    cta: "Join Waitlist",
    variant: "default" as const,
    popular: false,
  },
];

const comparisons = [
  { feature: "Browse dishes & restaurants", free: true, pro: true, black: true },
  { feature: "Community reviews", free: true, pro: true, black: true },
  { feature: "Save favorites", free: "10", pro: "Unlimited", black: "Unlimited" },
  { feature: "Ad-free experience", free: false, pro: true, black: true },
  { feature: "Personalized recommendations", free: false, pro: true, black: true },
  { feature: "Food Passport badges", free: false, pro: true, black: true },
  { feature: "Offline city guides", free: false, pro: true, black: true },
  { feature: "Exclusive critic reviews", free: false, pro: false, black: true },
  { feature: "Reservation priority", free: false, pro: false, black: true },
  { feature: "Tasting events access", free: false, pro: false, black: true },
  { feature: "AI trip itineraries", free: false, pro: false, black: true },
  { feature: "Quarterly food box", free: false, pro: false, black: true },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
              Membership
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-4">
              Eat Smarter,
              <br />
              <span className="text-gradient-gold italic">Travel Better</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto">
              Unlock premium features designed for food lovers who take their eating seriously.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 border ${
                  tier.popular
                    ? "bg-primary text-primary-foreground border-primary shadow-2xl scale-[1.02]"
                    : tier.name === "Palate Black"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-[10px] font-body font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                {tier.name === "Palate Black" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-[10px] font-body font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Exclusive
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-display text-4xl font-bold">{tier.price}</span>
                    <span className={`font-body text-sm ${tier.popular || tier.name === "Palate Black" ? "opacity-60" : "text-muted-foreground"}`}>
                      {tier.period}
                    </span>
                  </div>
                  <p className={`font-body text-sm ${tier.popular || tier.name === "Palate Black" ? "opacity-70" : "text-muted-foreground"}`}>
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${tier.popular ? "text-accent" : tier.name === "Palate Black" ? "text-accent" : "text-accent"}`} />
                      <span className={`font-body text-sm ${tier.popular || tier.name === "Palate Black" ? "opacity-90" : "text-foreground"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.name === "Free" ? "outline" : "default"}
                  className={`w-full font-body font-semibold ${
                    tier.popular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : tier.name === "Palate Black"
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : ""
                  }`}
                  size="lg"
                >
                  {tier.cta}
                  {tier.name !== "Free" && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>

                {tier.name === "Palate Pro" && (
                  <p className="font-body text-[10px] text-center mt-3 opacity-50">
                    14-day free trial · Cancel anytime
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">
            Compare Plans
          </h2>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-body text-sm font-medium text-muted-foreground py-3 pr-4">Feature</th>
                  <th className="text-center font-body text-sm font-medium text-muted-foreground py-3 px-4 w-28">Free</th>
                  <th className="text-center font-body text-sm font-medium text-primary py-3 px-4 w-28">Pro</th>
                  <th className="text-center font-body text-sm font-medium text-foreground py-3 px-4 w-28">Black</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="font-body text-sm text-foreground py-3 pr-4">{row.feature}</td>
                    {[row.free, row.pro, row.black].map((val, j) => (
                      <td key={j} className="text-center py-3 px-4">
                        {val === true ? (
                          <Check className="h-4 w-4 text-accent mx-auto" />
                        ) : val === false ? (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="font-body text-xs font-semibold text-foreground">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">
            Questions?
          </h2>
          {[
            { q: "Can I cancel anytime?", a: "Yes! No contracts, no commitment. Cancel your subscription anytime from your account settings." },
            { q: "What's the Food Passport?", a: "A gamified profile that tracks every cuisine, city, and dish you've tried. Earn badges like 'Ramen Master' or 'Spice Explorer' as you review more dishes." },
            { q: "What are tasting events?", a: "Exclusive Black-member gatherings hosted in partnership with legendary restaurants worldwide. Think: private kitchen tours, chef's table dinners, and food walks." },
            { q: "Do you offer team/corporate plans?", a: "Yes! We offer corporate plans for food media companies, travel agencies, and hospitality groups. Contact us at partnerships@palateguide.com." },
          ].map((faq) => (
            <div key={faq.q} className="border-b border-border py-5">
              <h3 className="font-display text-base font-semibold text-foreground mb-2">{faq.q}</h3>
              <p className="font-body text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
