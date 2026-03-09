-- Migration: seed_initial_cities
-- Seeds area_tiles with zoom-5 tiles covering 10 high-value cities
-- so the weekly OSM crawler can immediately start ingesting restaurants.

-- Each tile at zoom 5 covers ~1200 km², enough for a full metro area.
-- Tile XY computed via standard Web Mercator slippy-map formula.

INSERT INTO area_tiles (zoom, x, y, status) VALUES
  -- Mumbai, India (zoom5: 23,14)
  (5, 23, 14, 'pending'),
  -- Delhi, India (zoom5: 23,13)
  (5, 23, 13, 'pending'),
  -- Bangalore, India (zoom5: 23,15)
  (5, 23, 15, 'pending'),
  -- Kolkata, India (zoom5: 24,14)
  (5, 24, 14, 'pending'),
  -- Tokyo, Japan (zoom5: 29,13)
  (5, 29, 13, 'pending'),
  -- Singapore (zoom5: 26,16)
  (5, 26, 16, 'pending'),
  -- Dubai, UAE (zoom5: 21,14)
  (5, 21, 14, 'pending'),
  -- London, UK (zoom5: 15,10)
  (5, 15, 10, 'pending'),
  -- Paris, France (zoom5: 16,10)
  (5, 16, 10, 'pending'),
  -- New York, USA (zoom5: 9,11)
  (5, 9, 11, 'pending')
ON CONFLICT (zoom, x, y) DO NOTHING;

-- Also seed zoom-7 tiles for Mumbai (home city) for higher resolution crawling
-- zoom7 tiles are ~75 km² each; Mumbai metro needs a 3x3 grid
INSERT INTO area_tiles (zoom, x, y, status) VALUES
  (7, 91, 56, 'pending'),
  (7, 92, 56, 'pending'),
  (7, 93, 56, 'pending'),
  (7, 91, 57, 'pending'),
  (7, 92, 57, 'pending'),
  (7, 93, 57, 'pending'),
  (7, 91, 58, 'pending'),
  (7, 92, 58, 'pending'),
  (7, 93, 58, 'pending')
ON CONFLICT (zoom, x, y) DO NOTHING;
