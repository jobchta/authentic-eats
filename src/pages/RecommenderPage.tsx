import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Leaf, Globe, ChefHat, ArrowRight, RotateCcw, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { getDishImage } from "@/lib/dish-images";

interface Recommendation {
  dishName: string;
  dishId?: string;
  cuisine: string;
  country: string;
  flag: string;
  reason: string;
  spiceLevel: number;
  rating: number;
}

const questions = [
  {
    id: "mood",
    title: "What's your mood?",
    subtitle: "How are you feeling right now?",
    icon: Sparkles,
    options: [
      { value: "adventurous", label: "🌍 Adventurous", desc: "Try something completely new" },
      { value: "comfort", label: "🏠 Comfort", desc: "Something warm and familiar" },
      { value: "celebratory", label: "🎉 Celebratory", desc: "Special occasion vibes" },
      { value: "light", label: "🌿 Light & Fresh", desc: "Clean and refreshing" },
    ],
  },
  {
    id: "spice",
    title: "Spice tolerance?",
    subtitle: "How hot can you handle it?",
    icon: Flame,
    options: [
      { value: "none", label: "😌 No spice", desc: "Keep it mild" },
      { value: "mild", label: "🌶️ Mild", desc: "A gentle warmth" },
      { value: "medium", label: "🌶️🌶️ Medium", desc: "Bring some heat" },
      { value: "hot", label: "🔥 Fiery", desc: "Maximum heat" },
    ],
  },
  {
    id: "diet",
    title: "Any dietary preferences?",
    subtitle: "We'll find the perfect match",
    icon: Leaf,
    options: [
      { value: "any", label: "🍽️ Eat Everything", desc: "No restrictions" },
      { value: "vegetarian", label: "🥬 Vegetarian", desc: "No meat please" },
      { value: "seafood", label: "🐟 Seafood Lover", desc: "Fish and shellfish" },
      { value: "meat", label: "🥩 Meat Lover", desc: "Bring on the protein" },
    ],
  },
  {
    id: "region",
    title: "Any region preference?",
    subtitle: "Or let us surprise you",
    icon: Globe,
    options: [
      { value: "any", label: "🌏 Surprise Me", desc: "From anywhere in the world" },
      { value: "asia", label: "🏯 Asia", desc: "East, South & Southeast" },
      { value: "europe", label: "🏰 Europe", desc: "Mediterranean to Nordic" },
      { value: "americas", label: "🌮 Americas", desc: "North to South" },
    ],
  },
];

const RecommenderPage = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleAnswer = async (value: string) => {
    const newAnswers = { ...answers, [questions[step].id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Generate recommendations from database
      setLoading(true);
      try {
        const recs = await generateRecommendations(newAnswers);
        setRecommendations(recs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setRecommendations([]);
  };

  const showResults = recommendations.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-primary/5 py-16 px-4">
          <div className="absolute inset-0 noise" />
          <div className="container mx-auto relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-accent" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
                What Should I Eat?
              </h1>
              <p className="font-body text-muted-foreground max-w-md mx-auto">
                Answer 4 quick questions and we'll recommend the perfect dish from our global database.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 mt-8 max-w-2xl">
          {!showResults && !loading && (
            <>
              {/* Progress */}
              <div className="flex gap-2 mb-8">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i <= step ? "bg-accent" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const q = questions[step];
                    const Icon = q.icon;
                    return (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <h2 className="font-display text-xl font-bold text-foreground">{q.title}</h2>
                            <p className="font-body text-sm text-muted-foreground">{q.subtitle}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt) => (
                            <motion.button
                              key={opt.value}
                              whileHover={{ y: -2, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAnswer(opt.value)}
                              className="text-left p-5 rounded-xl border border-border bg-card hover:border-accent hover:shadow-md transition-all"
                            >
                              <p className="font-display text-base font-semibold text-foreground mb-1">{opt.label}</p>
                              <p className="font-body text-xs text-muted-foreground">{opt.desc}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full border-4 border-accent/30 border-t-accent animate-spin mx-auto mb-4" />
              <p className="font-display text-lg font-semibold text-foreground">Finding your perfect dishes...</p>
              <p className="font-body text-sm text-muted-foreground">Searching across 200+ countries</p>
            </motion.div>
          )}

          {showResults && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  <Sparkles className="inline h-5 w-5 mr-2 text-accent" />
                  Your Recommendations
                </h2>
                <Button variant="outline" size="sm" onClick={reset} className="font-body gap-2">
                  <RotateCcw className="h-3 w-3" /> Try Again
                </Button>
              </div>
              <div className="space-y-4">
                {recommendations.map((rec, i) => {
                  const img = getDishImage(rec.dishName, rec.cuisine);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all"
                    >
                      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                        <img src={img} alt={rec.dishName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-display text-base font-semibold text-foreground">{rec.dishName}</h3>
                          <span className="text-lg">{rec.flag}</span>
                        </div>
                        <p className="font-body text-xs text-muted-foreground mb-2">{rec.reason}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="font-body text-[10px]">{rec.cuisine}</Badge>
                          <span className="font-body text-[10px] text-muted-foreground">{rec.country}</span>
                          {rec.spiceLevel > 0 && (
                            <span className="font-body text-[10px]">{"🌶️".repeat(Math.min(rec.spiceLevel, 3))}</span>
                          )}
                        </div>
                      </div>
                      {rec.dishId && (
                        <Link to={`/dishes/${rec.dishId}`} className="self-center">
                          <Button size="sm" variant="ghost" className="font-body">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

async function generateRecommendations(answers: Record<string, string>): Promise<Recommendation[]> {
  // Build a query based on answers
  let query = supabase.from("dishes").select("*, country:countries(*)");

  // Spice filter
  if (answers.spice === "none") query = query.lte("spice_level", 0);
  else if (answers.spice === "mild") query = query.lte("spice_level", 2);
  else if (answers.spice === "medium") query = query.gte("spice_level", 2).lte("spice_level", 3);
  else if (answers.spice === "hot") query = query.gte("spice_level", 3);

  // Region filter via country continent
  // We can't filter nested but we can filter post-query

  // Diet filter via dietary_tags
  if (answers.diet === "vegetarian") query = query.contains("dietary_tags", ["vegetarian"]);

  // Get top-rated
  query = query.order("rating", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let results = data as any[];

  // Post-filter by region
  if (answers.region === "asia") results = results.filter((d) => d.country?.continent === "Asia");
  else if (answers.region === "europe") results = results.filter((d) => d.country?.continent === "Europe");
  else if (answers.region === "americas") results = results.filter((d) => d.country?.continent === "Americas");

  // Post-filter by mood
  if (answers.mood === "comfort") {
    results = results.filter((d) => 
      d.tags?.some((t: string) => ["comfort","classic","traditional","hearty","grilled","social","indulgent","creamy"].includes(t))
    );
  } else if (answers.mood === "adventurous") {
    results = results.filter((d) =>
      d.tags?.some((t: string) => ["exotic","unique","fermented","spicy","bold","street","delicate"].includes(t)) || (d.spice_level ?? 0) >= 2
    );
  } else if (answers.mood === "light") {
    results = results.filter((d) =>
      d.tags?.some((t: string) => ["fresh","citrus","salad","light","seafood","fish","raw","delicate"].includes(t))
    );
  }

  // Diet post-filter for meat/seafood
  if (answers.diet === "seafood") {
    results = results.filter((d) => d.tags?.some((t: string) => ["fish","seafood","shellfish","crab","shrimp"].includes(t)));
  } else if (answers.diet === "meat") {
    results = results.filter((d) => d.tags?.some((t: string) => ["meat","beef","chicken","pork","lamb","grilled","bbq"].includes(t)));
  }

  // Shuffle and take top 5
  const shuffled = results.sort(() => Math.random() - 0.5).slice(0, 8);

  // If we don't have enough results, pad with random top dishes
  if (shuffled.length < 5) {
    const { data: fallback } = await supabase
      .from("dishes")
      .select("*, country:countries(*)")
      .order("rating", { ascending: false })
      .limit(20);
    if (fallback) {
      const existingIds = new Set(shuffled.map((d) => d.id));
      for (const d of fallback) {
        if (!existingIds.has(d.id)) shuffled.push(d);
        if (shuffled.length >= 8) break;
      }
    }
  }

  return shuffled.map((d: any) => ({
    dishName: d.name,
    dishId: d.id,
    cuisine: d.cuisine_type,
    country: d.country?.name || "Unknown",
    flag: d.country?.flag_emoji || "🍽️",
    reason: d.description || `A beloved ${d.cuisine_type} classic`,
    spiceLevel: d.spice_level ?? 0,
    rating: d.rating ?? 4.5,
  }));
}

export default RecommenderPage;
