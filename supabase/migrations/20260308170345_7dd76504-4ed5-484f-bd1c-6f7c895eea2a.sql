
-- Countries table with food culture data
CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  continent text NOT NULL,
  region text NOT NULL,
  flag_emoji text NOT NULL DEFAULT '',
  food_description text,
  signature_ingredient text,
  food_culture_summary text,
  created_at timestamptz DEFAULT now()
);

-- Dishes table linked to countries
CREATE TABLE public.dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_id uuid REFERENCES public.countries(id) ON DELETE CASCADE NOT NULL,
  description text,
  cuisine_type text NOT NULL,
  tags text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 4.50,
  reviews_count integer DEFAULT 0,
  is_signature boolean DEFAULT false,
  spice_level integer DEFAULT 1,
  dietary_tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dishes_country_id ON public.dishes(country_id);
CREATE INDEX idx_countries_continent ON public.countries(continent);
CREATE INDEX idx_countries_region ON public.countries(region);
CREATE INDEX idx_dishes_cuisine_type ON public.dishes(cuisine_type);
CREATE INDEX idx_dishes_is_signature ON public.dishes(is_signature);

-- Enable RLS (public read)
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Anyone can view dishes" ON public.dishes FOR SELECT USING (true);
