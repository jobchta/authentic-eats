-- Ingredients taxonomy table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT, -- 'protein', 'vegetable', 'spice', 'grain', etc.
  origin_country_id UUID REFERENCES public.countries(id),
  description TEXT,
  aliases TEXT[], -- alternative names
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Recipes table with step-by-step instructions
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  servings INTEGER DEFAULT 4,
  instructions JSONB, -- [{"step": 1, "text": "..."}, ...]
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dish_id)
);

-- Recipe ingredients junction table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity TEXT, -- "2 cups", "500g", etc.
  is_optional BOOLEAN DEFAULT false,
  UNIQUE(recipe_id, ingredient_id)
);

-- Ingestion jobs tracking
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  deep_research BOOLEAN DEFAULT false,
  dishes_added INTEGER DEFAULT 0,
  ingredients_added INTEGER DEFAULT 0,
  recipes_added INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view ingredients" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Anyone can view recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Anyone can view recipe ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Anyone can view ingestion jobs" ON public.ingestion_jobs FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON public.ingredients(name);
CREATE INDEX IF NOT EXISTS idx_recipes_dish_id ON public.recipes(dish_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_country_id ON public.ingestion_jobs(country_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON public.ingestion_jobs(status);