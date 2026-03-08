import { motion } from "framer-motion";
import { Check, BarChart3, Star, Eye, Megaphone, ArrowRight, TrendingUp, Users, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const benefits = [
  { icon: Eye, title: "Get Discovered", desc: "2.4M+ monthly food explorers searching for authentic restaurants near them." },
  { icon: Star, title: "Build Trust", desc: "Verified ratings from real food lovers, not bots. 89% of users trust Palate reviews." },
  { icon: BarChart3, title: "Track Performance", desc: "Real-time analytics: views, saves, click-throughs, and sentiment analysis on reviews." },
  { icon: Megaphone, title: "Reach Foodies", desc: "Promoted placements, featured stories, and targeted campaigns to high-intent diners." },
];

const restaurantTiers = [
  {
    name: "Claim",
    price: "Free",
    period: "",
    description: "Claim and manage your restaurant profile.",
    features: [
      "Claim your restaurant listing",
      "Respond to reviews",
      "Update hours & menu",
      "Basic analytics dashboard",
      "Contact information management",
    ],
    cta: "Claim Your Restaurant",
    highlight: false,
  },
  {
    name: "Partner",
    price: "$99",
    period: "/month",
    description: "Grow your visibility and attract more diners.",
    features: [
      "Everything in Claim, plus:",
      "Featured in 'Top Picks' sections",
      "Promoted dish listings",
      "Advanced analytics & insights",
      "Competitor benchmarking",
      "Priority review moderation",
      "Monthly performance reports",
      "Dedicated account manager",
    ],
    cta: "Become a Partner",
    highlight: true,
  },
  {
    name: "Spotlight",
    price: "$299",
    period: "/month",
    description: "Maximum exposure for legendary restaurants.",
    features: [
      "Everything in Partner, plus:",
      "Homepage featured placement",
      "Sponsored editorial stories",
      "Social media amplification",
      "Video content production",
      "Event hosting on Palate",
      "API access for integrations",
      "Custom branded page",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const stats = [
  { icon: Users, value: "2.4M+", label: "Monthly visitors" },
  { icon: TrendingUp, value: "89%", label: "Trust our reviews" },
  { icon: MessageSquare, value: "2.4M+", label: "Reviews written" },
  { icon: Zap, value: "34%", label: "Avg. booking increase" },
];

const ForRestaurantsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
              For Restaurants
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
              Where the World Comes
              <br />
              <span className="text-gradient-gold italic">to Find You</span>
            </h1>
            <p className="font-body text-lg text-primary-foreground/70 mb-8 max-w-xl">
              2.4 million food lovers use Palate Guide every month to discover authentic restaurants. Make sure they find yours.
            </p>
            <div className="flex gap-3">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold">
                Claim Your Restaurant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-body">
                See Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Why Restaurants Choose Palate
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-card rounded-xl border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <b.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
              Partnership Plans
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground">
              Choose Your Level
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {restaurantTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 border ${
                  tier.highlight
                    ? "bg-primary text-primary-foreground border-primary shadow-2xl scale-[1.02]"
                    : "bg-background border-border"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-[10px] font-body font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-display text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className={`font-body text-sm ${tier.highlight ? "opacity-60" : "text-muted-foreground"}`}>
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p className={`font-body text-sm ${tier.highlight ? "opacity-70" : "text-muted-foreground"}`}>
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                      <span className={`font-body text-sm ${tier.highlight ? "opacity-90" : "text-foreground"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.highlight ? "default" : "outline"}
                  className={`w-full font-body font-semibold ${
                    tier.highlight ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""
                  }`}
                  size="lg"
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored content section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
              Advertising
            </p>
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Sponsored Content & Ads
            </h2>
            <p className="font-body text-muted-foreground max-w-lg mx-auto">
              Reach food lovers at the exact moment they're deciding where to eat. Transparent, clearly labeled, and high-converting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Promoted Dishes",
                price: "From $2 CPM",
                desc: "Your signature dish appears in search results and category pages with a 'Promoted' label.",
              },
              {
                title: "Sponsored Stories",
                price: "From $500",
                desc: "A professionally written editorial feature about your restaurant, cuisine, or chef — distributed to 42K+ newsletter subscribers.",
              },
              {
                title: "Tourism Board Packages",
                price: "Custom Pricing",
                desc: "Regional cuisine campaigns for tourism boards. Highlight your country's food culture to millions of food travelers.",
              },
            ].map((ad) => (
              <div key={ad.title} className="p-6 bg-card rounded-xl border border-border">
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{ad.title}</h3>
                <p className="font-body text-sm font-semibold text-accent mb-3">{ad.price}</p>
                <p className="font-body text-sm text-muted-foreground">{ad.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" className="font-body font-semibold">
              Contact Advertising Team
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForRestaurantsPage;
