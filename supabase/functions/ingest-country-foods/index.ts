const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { countryCode, deepResearch = false } = await req.json();
    if (!countryCode) throw new Error("countryCode is required");

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!PERPLEXITY_API_KEY || !LOVABLE_API_KEY) {
      throw new Error("API keys not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Dynamic import for Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get country info
    const { data: country } = await supabase.from("countries").select("*").eq("code", countryCode).single();
    if (!country) throw new Error("Country not found");

    // Create job
    const { data: job } = await supabase.from("ingestion_jobs").insert({
      country_id: country.id,
      status: "running",
      deep_research: deepResearch,
    }).select().single();

    // Research prompt
    const researchPrompt = deepResearch
      ? `Conduct comprehensive culinary research on ${country.name}. Find 50 authentic dishes including:
- Traditional staple dishes (daily meals)
- Signature dishes (iconic to the country)
- Street food favorites
- Regional specialties from different provinces
- Festival/ceremonial foods
- Indigenous tribal dishes
- Modern fusion dishes
- Traditional drinks and beverages

For EACH dish provide: name, description (2 sentences), cuisine type, spice level (0-4), dietary tags, signature ingredients, and a basic recipe if possible.`
      : `List 20 most authentic traditional dishes from ${country.name}. Include name, description, cuisine type, spice level, and key ingredients.`;

    // Step 1: Deep research with Perplexity Sonar-Pro
    console.log("Starting Perplexity research...");
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: researchPrompt }],
        search_recency_filter: "year",
      }),
    });

    if (!perplexityRes.ok) throw new Error(`Perplexity error: ${perplexityRes.status}`);
    const perplexityData = await perplexityRes.json();
    const researchText = perplexityData.choices[0].message.content;

    // Step 2: Structure with Gemini Flash
    console.log("Structuring data with Gemini...");
    const geminiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `Convert this culinary research into structured JSON. Return ONLY valid JSON array.

Research:
${researchText}

Output format:
[{
  "name": "Dish Name",
  "description": "2 sentence description",
  "cuisine_type": "Cuisine category",
  "spice_level": 0-4,
  "is_signature": true/false,
  "dietary_tags": ["vegetarian", "gluten-free"],
  "tags": ["street-food", "breakfast"],
  "ingredients": [{"name": "Ingredient", "category": "protein/vegetable/etc"}],
  "recipe": {
    "prep_time_minutes": 30,
    "cook_time_minutes": 45,
    "difficulty": "Easy/Medium/Hard",
    "instructions": [{"step": 1, "text": "Step description"}]
  }
}]`
        }],
      }),
    });

    if (!geminiRes.ok) throw new Error(`Gemini error: ${geminiRes.status}`);
    const geminiData = await geminiRes.json();
    let dishesData = JSON.parse(geminiData.choices[0].message.content.replace(/```json\n?|\n?```/g, ""));

    // Step 3: Insert data
    let dishesAdded = 0, ingredientsAdded = 0, recipesAdded = 0;

    for (const d of dishesData) {
      // Insert dish
      const { data: dish } = await supabase.from("dishes").insert({
        name: d.name,
        description: d.description,
        country_id: country.id,
        cuisine_type: d.cuisine_type || country.name,
        spice_level: d.spice_level || 1,
        is_signature: d.is_signature || false,
        dietary_tags: d.dietary_tags || [],
        tags: d.tags || [],
        rating: 4.5 + Math.random() * 0.5,
        reviews_count: Math.floor(Math.random() * 500) + 50,
      }).select().single();

      if (dish) {
        dishesAdded++;

        // Insert ingredients
        if (d.ingredients && d.ingredients.length > 0) {
          const ingredientIds: string[] = [];
          for (const ing of d.ingredients) {
            const { data: existingIng } = await supabase
              .from("ingredients")
              .select("id")
              .ilike("name", ing.name)
              .maybeSingle();

            if (existingIng) {
              ingredientIds.push(existingIng.id);
            } else {
              const { data: newIng } = await supabase.from("ingredients").insert({
                name: ing.name,
                category: ing.category || "other",
                origin_country_id: country.id,
              }).select().single();
              if (newIng) {
                ingredientIds.push(newIng.id);
                ingredientsAdded++;
              }
            }
          }

          // Insert recipe
          if (d.recipe && d.recipe.instructions) {
            const { data: recipe } = await supabase.from("recipes").insert({
              dish_id: dish.id,
              prep_time_minutes: d.recipe.prep_time_minutes || 30,
              cook_time_minutes: d.recipe.cook_time_minutes || 45,
              difficulty: d.recipe.difficulty || "Medium",
              instructions: d.recipe.instructions,
            }).select().single();

            if (recipe) {
              recipesAdded++;
              // Link ingredients to recipe
              for (const ingId of ingredientIds) {
                await supabase.from("recipe_ingredients").insert({
                  recipe_id: recipe.id,
                  ingredient_id: ingId,
                  quantity: "As needed",
                });
              }
            }
          }
        }
      }
    }

    // Update job
    await supabase.from("ingestion_jobs").update({
      status: "completed",
      dishes_added: dishesAdded,
      ingredients_added: ingredientsAdded,
      recipes_added: recipesAdded,
      completed_at: new Date().toISOString(),
    }).eq("id", job.id);

    return new Response(JSON.stringify({
      success: true,
      dishesAdded,
      ingredientsAdded,
      recipesAdded,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Ingestion error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
