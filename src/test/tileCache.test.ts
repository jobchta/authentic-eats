/**
 * tileCache.test.ts
 * -----------------
 * Unit tests for the pure utility functions in src/lib/tileCache.ts.
 * No network calls, no Supabase — all pure function coverage.
 *
 * Run with:  bun test  or  npx vitest
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  canonicaliseTileKey,
  isTileFresh,
  mergeRestaurantResults,
} from '@/lib/tileCache';
import type { TileRestaurantsCache } from '@/lib/tileCache';
import type { DbRestaurant } from '@/hooks/use-restaurants';
import type { OsmRestaurant } from '@/hooks/use-osm-restaurants';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeDbRestaurant = (overrides: Partial<DbRestaurant> = {}): DbRestaurant =>
  ({
    id: 'db-1',
    name: 'Trishna',
    cuisine_type: 'Seafood',
    city: 'Mumbai',
    country_id: 'IN',
    rating: 4.8,
    reviews_count: 1200,
    tier: 'Heritage',
    speciality: 'Butter Garlic Crab',
    price_range: '$$$',
    description: null,
    michelin_stars: null,
    year_established: 1981,
    tags: ['seafood', 'mumbai'],
    is_featured: true,
    created_at: new Date().toISOString(),
    country: {
      id: 'IN',
      name: 'India',
      continent: 'Asia',
      flag_emoji: '\uD83C\uDDEE\uD83C\uDDF3',
      code: 'IN',
      region: 'South Asia',
    },
    ...overrides,
  } as DbRestaurant);

const makeOsmRestaurant = (overrides: Partial<OsmRestaurant> = {}): OsmRestaurant =>
  ({
    osm_id: 12345,
    name: 'Britannia & Co',
    cuisine: 'Parsi',
    city: 'Mumbai',
    country: 'India',
    lat: 18.9396,
    lng: 72.8355,
    address: 'Ballard Estate, Mumbai',
    phone: null,
    website: null,
    opening_hours: null,
    ...overrides,
  } as OsmRestaurant);

// ---------------------------------------------------------------------------
// canonicaliseTileKey
// ---------------------------------------------------------------------------

describe('canonicaliseTileKey', () => {
  it('lowercases and trims city', () => {
    expect(canonicaliseTileKey('  Mumbai  ', 'IN')).toBe('IN-mumbai');
  });

  it('replaces spaces with hyphens', () => {
    expect(canonicaliseTileKey('New Delhi', 'IN')).toBe('IN-new-delhi');
  });

  it('uppercases country code', () => {
    expect(canonicaliseTileKey('paris', 'fr')).toBe('FR-paris');
  });

  it('falls back to XX when no country code provided', () => {
    expect(canonicaliseTileKey('Tokyo')).toBe('XX-tokyo');
  });

  it('handles multi-space gaps', () => {
    expect(canonicaliseTileKey('Kuala  Lumpur', 'MY')).toBe('MY-kuala-lumpur');
  });
});

// ---------------------------------------------------------------------------
// isTileFresh
// ---------------------------------------------------------------------------

describe('isTileFresh', () => {
  const makeCacheEntry = (
    expiresInMs: number,
    is_stale: boolean
  ): Pick<TileRestaurantsCache, 'expires_at' | 'is_stale'> => ({
    expires_at: new Date(Date.now() + expiresInMs).toISOString(),
    is_stale,
  });

  it('returns true for a future expiry and is_stale=false', () => {
    expect(isTileFresh(makeCacheEntry(60_000, false))).toBe(true);
  });

  it('returns false when is_stale=true even if expires_at is future', () => {
    expect(isTileFresh(makeCacheEntry(60_000, true))).toBe(false);
  });

  it('returns false when expires_at is in the past', () => {
    expect(isTileFresh(makeCacheEntry(-1000, false))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// mergeRestaurantResults
// ---------------------------------------------------------------------------

describe('mergeRestaurantResults', () => {
  it('returns empty array when both inputs are empty', () => {
    expect(mergeRestaurantResults([], [])).toHaveLength(0);
  });

  it('tags curated entries with _source=curated', () => {
    const result = mergeRestaurantResults([makeDbRestaurant()], []);
    expect(result[0]._source).toBe('curated');
  });

  it('tags live entries with _source=live by default', () => {
    const result = mergeRestaurantResults([], [makeOsmRestaurant()]);
    expect(result[0]._source).toBe('live');
  });

  it('tags live entries with _source=tile when liveSource=tile', () => {
    const result = mergeRestaurantResults([], [makeOsmRestaurant()], 'tile');
    expect(result[0]._source).toBe('tile');
  });

  it('curated entries appear before live entries', () => {
    const result = mergeRestaurantResults(
      [makeDbRestaurant()],
      [makeOsmRestaurant()]
    );
    expect(result[0]._source).toBe('curated');
    expect(result[1]._source).toBe('live');
  });

  it('deduplicates by osm_id — live entry with same osm_id as curated name is kept if different id', () => {
    const curated = makeDbRestaurant({ name: 'Trishna', city: 'Mumbai' });
    const live1 = makeOsmRestaurant({ osm_id: 111, name: 'Britannia & Co', city: 'Mumbai' });
    const live2 = makeOsmRestaurant({ osm_id: 222, name: 'New Entry', city: 'Mumbai' });
    const result = mergeRestaurantResults([curated], [live1, live2]);
    // curated + 2 unique live = 3
    expect(result).toHaveLength(3);
  });

  it('deduplicates by name+city fingerprint across sources', () => {
    const curated = makeDbRestaurant({ name: 'Trishna', city: 'Mumbai' });
    // Same name+city as curated — should be deduped
    const live = makeOsmRestaurant({ osm_id: 999, name: 'Trishna', city: 'Mumbai' });
    const result = mergeRestaurantResults([curated], [live]);
    expect(result).toHaveLength(1);
    expect(result[0]._source).toBe('curated');
  });

  it('sorts curated by rating descending', () => {
    const low = makeDbRestaurant({ id: 'low', name: 'Low Rated', rating: 3.0 });
    const high = makeDbRestaurant({ id: 'high', name: 'High Rated', rating: 4.9 });
    const result = mergeRestaurantResults([low, high], []);
    expect((result[0] as DbRestaurant).rating).toBe(4.9);
    expect((result[1] as DbRestaurant).rating).toBe(3.0);
  });

  it('handles null rating gracefully (treats as 0)', () => {
    const nullRating = makeDbRestaurant({ id: 'null', name: 'No Rating', rating: null });
    const high = makeDbRestaurant({ id: 'high', name: 'High Rated', rating: 4.5 });
    const result = mergeRestaurantResults([nullRating, high], []);
    expect((result[0] as DbRestaurant).id).toBe('high');
  });

  it('does not mutate input arrays', () => {
    const curated = [makeDbRestaurant()];
    const live = [makeOsmRestaurant()];
    const curatedCopy = [...curated];
    const liveCopy = [...live];
    mergeRestaurantResults(curated, live);
    expect(curated).toEqual(curatedCopy);
    expect(live).toEqual(liveCopy);
  });
});
