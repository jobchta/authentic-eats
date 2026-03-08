

# Plan: Real Restaurant Discovery — Zero Fake Data

## The Honesty Problem

I cannot fabricate restaurant names and call them "real." My training data contains knowledge of real restaurants, but I can only confidently seed restaurants I **know exist** — famous, well-documented places. For the 130 empty countries (especially small nations like Comoros, Guinea-Bissau, São Tomé), I don't have verified restaurant names I can guarantee are accurate.

**Two approaches to get maximum real coverage with zero fake data:**

## Approach 1: OSM Live Discovery Engine (15M+ real restaurants, zero fake)

This is the only way to get millions of **verified, accurate** restaurants. Every result comes from OpenStreetMap's community-mapped database — real names, real addresses, real coordinates.

### Implementation

**A. Database migration** — `osm_restaurant_cache` table
- `osm_id` (bigint PK), `name`, `cuisine`, `city`, `country`, `lat`, `lng`, `address`, `phone`, `website`, `opening_hours`, `fetched_at`
- Public SELECT RLS, index on `(city, fetched_at)`

**B. Edge function** — `supabase/functions/osm-restaurants/index.ts`
- Accepts `{ city }` or `{ lat, lng, radius }`
- Cache check (7-day TTL) → Nominatim geocode → Overpass API query → cache & return
- No API keys needed, all free
- Returns only real, community-verified restaurant data

**C. Frontend hook** — `src/hooks/use-osm-restaurants.ts`
- `useOsmRestaurants(city)` with debounce

**D. Component** — `src/components/OsmRestaurantCard.tsx`
- Lightweight card for OSM results (name, cuisine, address, "Open in Maps")

**E. Update `RestaurantsPage.tsx`**
- "Search any city on Earth" input
- Dual sections: Curated Collection + Live Discovery
- OSM attribution footer

## Approach 2: Curated Seeding — Only Restaurants I Can Verify

I'll seed restaurants I'm confident are real — well-known, documented establishments. This means:

- **Major food cities** (Tokyo, Paris, NYC, London, Bangkok, Istanbul, etc.): 20-40 real restaurants each — these I know well
- **Countries with famous dining scenes** (Italy, Japan, France, Spain, India, Mexico, Thailand, Peru, etc.): many real names available
- **Smaller/obscure countries**: I'll seed only what I can verify. Some countries may get 1-3 or even zero if I can't name a real restaurant there with confidence.

Realistic honest estimate: **~500-800 additional verified restaurants**, concentrated in countries where I have real knowledge. NOT 2,000 made-up names.

## Approach 3: Server-Side Pagination
- Update `use-restaurants.ts` with offset/limit
- "Load More" on RestaurantsPage

## Summary

| Source | Count | Accuracy |
|--------|-------|----------|
| Current curated DB | 283 | Real |
| New curated seeding | ~500-800 | Real, verified names only |
| OSM live discovery | ~15M+ | Real, community-mapped |

**Total: ~15M+ real restaurants, zero fake data.**

## Files to create
- `supabase/functions/osm-restaurants/index.ts`
- `src/hooks/use-osm-restaurants.ts`
- `src/components/OsmRestaurantCard.tsx`

## Files to edit
- `src/pages/RestaurantsPage.tsx`
- `src/hooks/use-restaurants.ts`

## Migrations
- 1 for `osm_restaurant_cache` table
- Multiple insert batches for verified curated restaurants

