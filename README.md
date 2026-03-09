# Authentic Eats — Zero-Cost Restaurant Discovery Platform

**Live App:** https://authentic-eats.vercel.app/

A globally scalable food discovery platform powered by OpenStreetMap data.
Built for 2 million+ records with zero ongoing infrastructure cost.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│  Browser (React + Vite + Vercel)                         │
│  useTileRestaurants hook                                 │
│    └─ latLonToTile(lat, lon, zoom)                       │
│        └─ Supabase query: WHERE tile_id = ?               │
│            (never full-table scan on 2M rows)            │
└────────────────────────────────────────────────────────────┘
              │
┌────────────┴───────────────────────────────────────────────┐
│  Supabase (free tier: 500MB, 5M rows est.)               │
│  ├─ restaurants (osm_id, name, lat, lon, tile_id, ...)  │
│  ├─ area_tiles  (zoom, x, y, status, last_crawled_at)   │
│  └─ tile_cache   (dedup + merged result cache)          │
└────────────────────────────────────────────────────────────┘
              │
┌────────────┴───────────────────────────────────────────────┐
│  GitHub Actions (2000 free min/month)                    │
│  osm-crawler.yml: runs every Sunday 02:00 UTC           │
│    └─ scripts/crawlTiles.ts                             │
│        ├─ Picks pending area_tiles from Supabase         │
│        ├─ Queries Overpass API (free OSM)                │
│        └─ Upserts restaurants, marks tile done           │
└────────────────────────────────────────────────────────────┘
```

## How it reaches 2M records for free

| Metric | Value |
|--------|-------|
| Weekly tile crawl | 50 tiles/run |
| Avg restaurants/tile | ~500 |
| Weekly new records | ~25,000 |
| Time to 2M records | ~80 weeks |
| GitHub Actions cost | $0 (2000 free min/month) |
| Overpass API cost | $0 (public, rate-limited) |
| Supabase cost | $0 (500MB free tier) |
| Vercel cost | $0 (free hobby plan) |

## PR Changelog

### PR-1: Tile-Cache Architecture
- `supabase/migrations/..._tile_cache_architecture.sql` — 3 tables + indexes + RLS + upsert fn
- `src/lib/tileCache.ts` — pure utilities (key, merge, dedup, observability)
- `src/lib/restaurantRepository.ts` — data access facade
- `src/hooks/use-tile-restaurants.ts` — React Query hook with debounce
- `src/test/tileCache.test.ts` — 13 Vitest unit tests

### PR-2: City Seed + OSM Crawler
- `supabase/migrations/..._seed_initial_cities.sql` — 10 cities + 9 Mumbai zoom-7 tiles
- `src/lib/citySeeder.ts` — bbox→tiles conversion + batch upsert helper
- `.github/workflows/osm-crawler.yml` — weekly cron + manual dispatch
- `scripts/crawlTiles.ts` — OSM Overpass crawler (179 lines)

### PR-3: UI Integration
- `src/components/NearbyRestaurants.tsx` — geolocation → tile → restaurant grid
- `src/components/CitySearch.tsx` — city pill nav + filtered search + tile grid
- `src/pages/Explore.tsx` — `/explore` page with Near Me / Browse Cities tabs

### PR-4: Tests + Docs
- `src/test/citySeeder.test.ts` — 16 Vitest tests for tile math utilities
- `README.md` — this document

## How to add a new city

1. Add an entry to `SEED_CITIES` in `src/lib/citySeeder.ts`:
```ts
{
  name: 'Berlin',
  zoom: 7,
  bbox: { minLat: 52.35, maxLat: 52.65, minLon: 13.2, maxLon: 13.6 },
}
```

2. Run the seeder locally or create a SQL migration:
```sql
INSERT INTO area_tiles (zoom, x, y, status)
SELECT zoom, x, y, 'pending'
FROM generate_tiles(7, 52.35, 52.65, 13.2, 13.6)
ON CONFLICT (zoom, x, y) DO NOTHING;
```

3. Trigger the crawler manually from GitHub Actions → osm-crawler.yml → Run workflow.

## Required GitHub Secrets

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Add these in: GitHub repo → Settings → Secrets and variables → Actions.

## Local Development

```bash
bun install
bun run dev

# Run tests
bun run test

# Run crawler locally (requires env vars)
bun run scripts/crawlTiles.ts
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + PostGIS + RLS + Edge Functions)
- **Data:** OpenStreetMap via Overpass API
- **CI/CD:** GitHub Actions + Vercel
- **Testing:** Vitest
- **Runtime:** Bun
