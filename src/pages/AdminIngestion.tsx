import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIngestionStats } from "@/hooks/use-ingestion-stats";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Database, Flame, Globe, Utensils, Leaf, ChefHat, Loader2, CheckCircle2, XCircle, ShieldAlert, Zap } from "lucide-react";

const AdminIngestion = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const navigate = useNavigate();
  const { countries, countriesLoading, totalStats, recentJobs } = useIngestionStats();
  const [deepResearch, setDeepResearch] = useState(false);
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const queryClient = useQueryClient();

  const underCovered = (countries || []).filter((c) => c.dish_count < 10);
  const underCoveredCount = underCovered.length;

  // Check admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;
      if (!user) {
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!error && !!data);
      setCheckingRole(false);
    };

    checkAdminRole();
  }, [user, authLoading]);

  // Redirect non-admins
  useEffect(() => {
    if (!checkingRole && !authLoading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [checkingRole, authLoading, isAdmin, navigate]);

  const runIngestion = async (countryId: string, countryName: string) => {
    setRunningIds((prev) => new Set(prev).add(countryId));
    toast.info(`Starting ingestion for ${countryName}...`);

    try {
      const { data, error } = await supabase.functions.invoke("ingest-country-foods", {
        body: { countryId, deepResearch },
      });

      if (error) throw error;

      toast.success(
        `${countryName}: +${data.dishesAdded} dishes, +${data.ingredientsAdded} ingredients, +${data.recipesAdded} recipes`
      );
      queryClient.invalidateQueries({ queryKey: ["ingestion"] });
      queryClient.invalidateQueries({ queryKey: ["ingestion-totals"] });
      queryClient.invalidateQueries({ queryKey: ["ingestion-countries"] });
      queryClient.invalidateQueries({ queryKey: ["ingestion-jobs"] });
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setRunningIds((prev) => {
        const next = new Set(prev);
        next.delete(countryId);
        return next;
      });
    }
  };

  // Loading state
  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Access denied (will redirect)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="font-body text-muted-foreground mt-2">Admin privileges required.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const statCards = [
    { icon: Utensils, label: "Dishes", value: totalStats?.dishes ?? "—", color: "text-accent" },
    { icon: Leaf, label: "Ingredients", value: totalStats?.ingredients ?? "—", color: "text-primary" },
    { icon: ChefHat, label: "Recipes", value: totalStats?.recipes ?? "—", color: "text-destructive" },
    { icon: Globe, label: "Restaurants", value: totalStats?.restaurants ?? "—", color: "text-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-6 w-6 text-accent" />
          <h1 className="font-display text-3xl font-bold text-foreground">Data Ingestion</h1>
          <Badge variant="outline" className="font-body text-xs ml-auto">
            <ShieldAlert className="h-3 w-3 mr-1" /> Admin
          </Badge>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <p className="font-display text-2xl font-bold text-foreground">
                {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
              </p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-card border border-border rounded-xl flex-wrap">
          <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
            <Switch checked={deepResearch} onCheckedChange={setDeepResearch} />
            <Flame className={`h-4 w-4 ${deepResearch ? "text-destructive" : "text-muted-foreground"}`} />
            Deep Research (50 dishes per run)
          </label>
          <Button
            variant="default"
            size="sm"
            disabled={bulkRunning}
            onClick={runBulkIngestion}
            className="ml-auto font-body"
          >
            {bulkRunning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
            Bulk Ingest ({underCoveredCount} countries &lt;10 dishes)
          </Button>
        </div>

        {/* Recent Jobs */}
        {recentJobs && recentJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">Recent Jobs</h2>
            <div className="space-y-2">
              {recentJobs.slice(0, 8).map((job: any) => (
                <div key={job.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg text-sm">
                  {job.status === "completed" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  {job.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                  {job.status === "running" && <Loader2 className="h-4 w-4 text-accent animate-spin" />}
                  <span className="font-body text-foreground">
                    {(job as any).country?.flag_emoji} {(job as any).country?.name}
                  </span>
                  <Badge variant="secondary" className="font-body text-xs">{job.status}</Badge>
                  {job.status === "completed" && (
                    <span className="font-body text-xs text-muted-foreground ml-auto">
                      +{job.dishes_added} dishes · +{job.ingredients_added} ingredients · +{job.recipes_added} recipes
                    </span>
                  )}
                  {job.error_message && (
                    <span className="font-body text-xs text-destructive ml-auto truncate max-w-[200px]">{job.error_message}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Country Grid */}
        <h2 className="font-display text-lg font-bold text-foreground mb-3">Countries</h2>
        {countriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(countries || []).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 p-3 bg-card border border-border rounded-xl">
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-foreground truncate">
                    {c.flag_emoji} {c.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">{c.dish_count} dishes</p>
                </div>
                <Button
                  size="sm"
                  variant={c.dish_count > 0 ? "outline" : "default"}
                  disabled={runningIds.has(c.id)}
                  onClick={() => runIngestion(c.id, c.name)}
                  className="shrink-0"
                >
                  {runningIds.has(c.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : "Ingest"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminIngestion;
