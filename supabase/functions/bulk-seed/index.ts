import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  if (!lovableApiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { countryIds, deepResearch } = await req.json();
    if (!countryIds || !Array.isArray(countryIds) || countryIds.length === 0) {
      return new Response(JSON.stringify({ error: "countryIds array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const countryId of countryIds) {
      try {
        const { data: country } = await supabase
          .from("countries").select("*").eq("id", countryId).single();
        if (!country) { results.push({ countryId, error: "not found" }); continue; }

        // Create job
        const { data: job } = await supabase
          .from("ingestion_jobs")
          .insert({ country_id: countryId, status: "running", deep_research: deepResearch ?? false })
          .select().single();

        // Get existing dish names
        const { data: existingDishes } = await supabase
          .from("dishes").select("name").eq("country_id", countryId);
        const existingNames = new Set((existingDishes || []).map((d: any) => d.name.toLowerCase()));

        const dishCount = deepResearch ? 50 : 20;

        const prompt = `You are a world-class food anthropologist. Research the cuisine of ${country.name} (${country.continent}, ${country.region}).

Return EXACTLY a JSON object: {"dishes": [{"name":"...","description":"2-3 sentences","cuisine_type":"${country.name} Cuisine","spice_level":0-4,"dietary_tags":["..."],"tags":["..."],"is_signature":true/false,"rating":4.0-5.0,"ingredients":[{"name":"...","category":"spice|protein|grain|vegetable|dairy|fruit|condiment|other","quantity":"...","is_optional":false}],"recipe":{"prep_time_minutes":15,"cook_time_minutes":30,"difficulty":"easy|medium|hard","servings":4,"instructions":["Step 1..."]}}]}

Requirements: ${dishCount} unique traditional dishes. Cover street food, home cooking, festive, regional, drinks, desserts.
${deepResearch ? "Include obscure regional, indigenous, tribal cuisines." : "Focus on well-known traditional dishes."}
Exclude: ${Array.from(existingNames).slice(0, 30).join(", ") || "none"}
Return ONLY valid JSON.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Return only valid JSON." },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          const err = await aiResponse.text();
          console.error(`AI error for ${country.name}:`, aiResponse.status, err);
          if (job) await supabase.from("ingestion_jobs").update({
            status: "failed", error_message: `AI ${aiResponse.status}`, completed_at: new Date().toISOString(),
          }).eq("id", job.id);
          results.push({ country: country.name, error: `AI ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || "";

        let parsed: any;
        try {
          parsed = JSON.parse(content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
        } catch {
          if (job) await supabase.from("ingestion_jobs").update({
            status: "failed", error_message: "Parse error", completed_at: new Date().toISOString(),
          }).eq("id", job.id);
          results.push({ country: country.name, error: "parse" });
          continue;
        }

        const dishes = parsed.dishes || [];
        let da = 0, ia = 0, ra = 0;

        for (const dish of dishes) {
          if (!dish.name || existingNames.has(dish.name.toLowerCase())) continue;

          const { data: newDish, error: dishErr } = await supabase.from("dishes").insert({
            name: dish.name, description: dish.description,
            cuisine_type: dish.cuisine_type || `${country.name} Cuisine`,
            country_id: countryId, spice_level: dish.spice_level ?? 1,
            dietary_tags: dish.dietary_tags || [], tags: dish.tags || [],
            is_signature: dish.is_signature ?? false, rating: dish.rating ?? 4.5,
            reviews_count: Math.floor(Math.random() * 500) + 50,
          }).select().single();

          if (dishErr) continue;
          da++;
          existingNames.add(dish.name.toLowerCase());

          // Ingredients
          if (dish.ingredients?.length) {
            for (const ing of dish.ingredients) {
              if (!ing.name) continue;
              let { data: existing } = await supabase.from("ingredients")
                .select("id").ilike("name", ing.name).limit(1).single();
              if (!existing) {
                const { data: newIng } = await supabase.from("ingredients").insert({
                  name: ing.name, category: ing.category || "other", origin_country_id: countryId,
                }).select().single();
                existing = newIng;
                if (newIng) ia++;
              }
            }
          }

          // Recipe
          if (dish.recipe) {
            const { data: newRecipe } = await supabase.from("recipes").insert({
              dish_id: newDish.id,
              prep_time_minutes: dish.recipe.prep_time_minutes,
              cook_time_minutes: dish.recipe.cook_time_minutes,
              difficulty: dish.recipe.difficulty || "medium",
              servings: dish.recipe.servings || 4,
              instructions: dish.recipe.instructions || [],
            }).select().single();

            if (newRecipe && dish.ingredients?.length) {
              ra++;
              for (const ing of dish.ingredients) {
                if (!ing.name) continue;
                const { data: ingRec } = await supabase.from("ingredients")
                  .select("id").ilike("name", ing.name).limit(1).single();
                if (ingRec) {
                  await supabase.from("recipe_ingredients").insert({
                    recipe_id: newRecipe.id, ingredient_id: ingRec.id,
                    quantity: ing.quantity || null, is_optional: ing.is_optional ?? false,
                  });
                }
              }
            }
          }
        }

        if (job) await supabase.from("ingestion_jobs").update({
          status: "completed", dishes_added: da, ingredients_added: ia, recipes_added: ra,
          completed_at: new Date().toISOString(),
        }).eq("id", job.id);

        results.push({ country: country.name, dishesAdded: da, ingredientsAdded: ia, recipesAdded: ra });
        console.log(`✅ ${country.name}: +${da} dishes, +${ia} ingredients, +${ra} recipes`);

      } catch (e) {
        console.error(`Error for ${countryId}:`, e);
        results.push({ countryId, error: e instanceof Error ? e.message : "unknown" });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Bulk seed error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
