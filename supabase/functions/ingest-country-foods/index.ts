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
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  // Auth check - require admin role
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await userSupabase.auth.getClaims(token);
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claims.claims.sub;

  // Check admin role using service role client
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: roleData, error: roleErr } = await adminSupabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleErr || !roleData) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!lovableApiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { countryId, deepResearch } = await req.json();
    if (!countryId) {
      return new Response(JSON.stringify({ error: "countryId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get country info
    const { data: country, error: countryErr } = await adminSupabase
      .from("countries")
      .select("*")
      .eq("id", countryId)
      .single();
    if (countryErr || !country) throw new Error("Country not found");

    // Create ingestion job
    const { data: job, error: jobErr } = await adminSupabase
      .from("ingestion_jobs")
      .insert({ country_id: countryId, status: "running", deep_research: deepResearch ?? false })
      .select()
      .single();
    if (jobErr) throw jobErr;

    // Get existing dishes to avoid duplicates
    const { data: existingDishes } = await adminSupabase
      .from("dishes")
      .select("name")
      .eq("country_id", countryId);
    const existingNames = new Set((existingDishes || []).map((d: any) => d.name.toLowerCase()));

    const dishCount = deepResearch ? 50 : 20;
    const prompt = `You are a world-class food anthropologist. Research the cuisine of ${country.name} (${country.continent}, ${country.region}).

Return EXACTLY a JSON object with this structure:
{
  "dishes": [
    {
      "name": "Dish Name",
      "description": "2-3 sentence authentic description",
      "cuisine_type": "${country.name} Cuisine",
      "spice_level": 0-4,
      "dietary_tags": ["vegetarian", "gluten-free", etc],
      "tags": ["street-food", "festive", "breakfast", etc],
      "is_signature": true/false,
      "rating": 4.0-5.0,
      "ingredients": [
        {"name": "ingredient", "category": "spice|protein|grain|vegetable|dairy|fruit|condiment|other", "quantity": "1 cup", "is_optional": false}
      ],
      "recipe": {
        "prep_time_minutes": 15,
        "cook_time_minutes": 30,
        "difficulty": "easy|medium|hard",
        "servings": 4,
        "instructions": ["Step 1...", "Step 2..."]
      }
    }
  ]
}

Requirements:
- Include ${dishCount} unique traditional dishes from ${country.name}
- Cover: street food, home cooking, festive dishes, regional specialties, drinks, desserts
- ${deepResearch ? "Go DEEP: include obscure regional dishes, indigenous recipes, and tribal cuisines that are rarely documented." : "Focus on well-known traditional dishes."}
- Exclude these already-documented dishes: ${Array.from(existingNames).slice(0, 50).join(", ") || "none"}
- Each dish MUST have ingredients and recipe
- Be authentic — use real traditional names, not anglicized versions
- Return ONLY valid JSON, no markdown`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a food data expert. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      await adminSupabase.from("ingestion_jobs").update({
        status: "failed", error_message: `AI error ${aiResponse.status}`, completed_at: new Date().toISOString(),
      }).eq("id", job.id);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let parsed: any;
    try {
      const jsonStr = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      await adminSupabase.from("ingestion_jobs").update({
        status: "failed", error_message: "Failed to parse AI response", completed_at: new Date().toISOString(),
      }).eq("id", job.id);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dishes = parsed.dishes || [];
    let dishesAdded = 0;
    let ingredientsAdded = 0;
    let recipesAdded = 0;

    for (const dish of dishes) {
      if (existingNames.has(dish.name?.toLowerCase())) continue;

      // Insert dish
      const { data: newDish, error: dishErr } = await adminSupabase
        .from("dishes")
        .insert({
          name: dish.name,
          description: dish.description,
          cuisine_type: dish.cuisine_type || `${country.name} Cuisine`,
          country_id: countryId,
          spice_level: dish.spice_level ?? 1,
          dietary_tags: dish.dietary_tags || [],
          tags: dish.tags || [],
          is_signature: dish.is_signature ?? false,
          rating: dish.rating ?? 4.5,
          reviews_count: Math.floor(Math.random() * 500) + 50,
        })
        .select()
        .single();

      if (dishErr) { console.error("Dish insert error:", dishErr); continue; }
      dishesAdded++;
      existingNames.add(dish.name.toLowerCase());

      // Insert ingredients and recipe
      if (dish.ingredients?.length) {
        for (const ing of dish.ingredients) {
          // Upsert ingredient
          let { data: existingIng } = await adminSupabase
            .from("ingredients")
            .select("id")
            .ilike("name", ing.name)
            .limit(1)
            .single();

          if (!existingIng) {
            const { data: newIng } = await adminSupabase
              .from("ingredients")
              .insert({
                name: ing.name,
                category: ing.category || "other",
                origin_country_id: countryId,
              })
              .select()
              .single();
            existingIng = newIng;
            if (newIng) ingredientsAdded++;
          }
        }
      }

      if (dish.recipe) {
        const { data: newRecipe, error: recipeErr } = await adminSupabase
          .from("recipes")
          .insert({
            dish_id: newDish.id,
            prep_time_minutes: dish.recipe.prep_time_minutes,
            cook_time_minutes: dish.recipe.cook_time_minutes,
            difficulty: dish.recipe.difficulty || "medium",
            servings: dish.recipe.servings || 4,
            instructions: dish.recipe.instructions || [],
          })
          .select()
          .single();

        if (!recipeErr && newRecipe) {
          recipesAdded++;
          // Link ingredients to recipe
          if (dish.ingredients?.length) {
            for (const ing of dish.ingredients) {
              const { data: ingRecord } = await adminSupabase
                .from("ingredients")
                .select("id")
                .ilike("name", ing.name)
                .limit(1)
                .single();

              if (ingRecord) {
                await adminSupabase.from("recipe_ingredients").insert({
                  recipe_id: newRecipe.id,
                  ingredient_id: ingRecord.id,
                  quantity: ing.quantity || null,
                  is_optional: ing.is_optional ?? false,
                });
              }
            }
          }
        }
      }
    }

    // Update job status
    await adminSupabase.from("ingestion_jobs").update({
      status: "completed",
      dishes_added: dishesAdded,
      ingredients_added: ingredientsAdded,
      recipes_added: recipesAdded,
      completed_at: new Date().toISOString(),
    }).eq("id", job.id);

    return new Response(
      JSON.stringify({ success: true, dishesAdded, ingredientsAdded, recipesAdded, jobId: job.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ingestion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
