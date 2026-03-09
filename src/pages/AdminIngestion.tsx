import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIngestionStats } from "@/hooks/use-ingestion-stats";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2, Sparkles, CheckCircle2, XCircle, Clock } from "lucide-react";

const AdminIngestion = () => {
  const { data: stats, refetch } = useIngestionStats();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [deepResearch, setDeepResearch] = useState(false);

  const runIngestion = async (countryCode: string, countryName: string) => {
    setLoading(countryCode);
    try {
      const { data, error } = await supabase.functions.invoke("ingest-country-foods", {
        body: { countryCode, deepResearch },
      });

      if (error) throw error;

      toast({
        title: "Ingestion Complete",
        description: `Added ${data.dishesAdded} dishes, ${data.ingredientsAdded} ingredients, ${data.recipesAdded} recipes for ${countryName}`,
      });
      refetch();
    } catch (err) {
      toast({
        title: "Ingestion Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      case "running": return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl font-bold">Global Food Ingestion</h1>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Dishes", value: stats?.totalDishes || 0, icon: "🍽️" },
              { label: "Countries", value: stats?.totalCountries || 0, icon: "🌍" },
              { label: "Ingredients", value: stats?.totalIngredients || 0, icon: "🥕" },
              { label: "Recipes", value: stats?.totalRecipes || 0, icon: "📖" },
            ].map((stat) => (
              <Card key={stat.label} className="p-4 text-center">
                <div className="text-3xl mb-1">{stat.icon}</div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground uppercase">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Deep Research Toggle */}
          <Card className="p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <div>
                <Label htmlFor="deep-research" className="font-semibold">Deep Research Mode</Label>
                <p className="text-xs text-muted-foreground">50 dishes per country (slower, more comprehensive)</p>
              </div>
            </div>
            <Switch id="deep-research" checked={deepResearch} onCheckedChange={setDeepResearch} />
          </Card>

          {/* Country Grid */}
          <h2 className="font-display text-2xl font-bold mb-4">Countries</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {stats?.countries.map((c: any) => (
              <Card key={c.id} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{c.code === "US" ? "🇺🇸" : c.code === "GB" ? "🇬🇧" : "🌏"}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.code}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={loading !== null}
                  onClick={() => runIngestion(c.code, c.name)}
                >
                  {loading === c.code ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ingest"}
                </Button>
              </Card>
            ))}
          </div>

          {/* Recent Jobs */}
          <h2 className="font-display text-2xl font-bold mb-4">Recent Jobs</h2>
          <div className="space-y-2">
            {stats?.recentJobs.map((job: any) => (
              <Card key={job.id} className="p-3 flex items-center gap-3">
                {getStatusIcon(job.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{job.country_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.dishes_added} dishes · {job.ingredients_added} ingredients · {job.recipes_added} recipes
                  </p>
                </div>
                <Badge variant={job.deep_research ? "default" : "secondary"}>
                  {job.deep_research ? "Deep" : "Standard"}
                </Badge>
                <p className="text-xs text-muted-foreground">{new Date(job.started_at).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminIngestion;
