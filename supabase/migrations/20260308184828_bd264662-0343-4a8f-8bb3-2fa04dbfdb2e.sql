
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cuisine_type text NOT NULL,
  city text NOT NULL,
  country_id uuid REFERENCES public.countries(id) ON DELETE CASCADE NOT NULL,
  rating numeric DEFAULT 4.5,
  reviews_count integer DEFAULT 0,
  tier text NOT NULL DEFAULT 'Remarkable',
  speciality text,
  price_range text DEFAULT '$$',
  description text,
  address text,
  website_url text,
  michelin_stars integer DEFAULT 0,
  year_established integer,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants" ON public.restaurants
  FOR SELECT USING (true);
