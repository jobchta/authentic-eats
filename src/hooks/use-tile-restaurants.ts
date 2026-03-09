/**
 * use-tile-restaurants.ts
 * -----------------------
 * React Query hook that wraps restaurantRepository.getCityRestaurants.
 *
 * Features:
 *  - 600ms debounce on city input (matches existing use-osm-restaurants pattern)
 *  - Automatic staleTime aligned with TILE_TTL_DAYS
 *  - Returns cache metadata (source, cacheHit, latencyMs) alongside restaurants
 *  - Single retry on failure
 *  - Disabled while city is shorter than MIN_CITY_LENGTH
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useId } from 'react';
import {
  getCityRestaurants,
  type RestaurantFilters,
} from '@/lib/restaurantRepository';
import { TILE_TTL_DAYS, MIN_CITY_LENGTH } from '@/lib/tileCache';
import type { TileLookupResult } from '@/lib/tileCache';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseTileRestaurantsOptions
  extends Omit<RestaurantFilters, 'city'> {
  /** Override country code for tile key, e.g. 'IN' */
  countryCode?: string;
  /** Debounce delay in ms (default 600) */
  debounceMs?: number;
}

export interface UseTileRestaurantsResult extends Partial<TileLookupResult> {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useTileRestaurants
 *
 * Drop-in replacement / complement for useOsmRestaurants.
 * Uses the tile cache + curated merge instead of direct OSM calls.
 *
 * @example
 * const { restaurants, source, cacheHit, isLoading } = useTileRestaurants('Mumbai');
 */
export function useTileRestaurants(
  city: string,
  options: UseTileRestaurantsOptions = {}
): UseTileRestaurantsResult {
  const { debounceMs = 600, countryCode, ...filters } = options;

  // Stable session id for analytics grouping
  const sessionId = useId();

  // Debounce city input
  const [debouncedCity, setDebouncedCity] = useState(city);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(city), debounceMs);
    return () => clearTimeout(timer);
  }, [city, debounceMs]);

  const result = useQuery({
    queryKey: ['tile-restaurants', debouncedCity, filters, countryCode],
    queryFn: () =>
      getCityRestaurants(debouncedCity, filters, {
        sessionId,
        countryCode,
      }),
    enabled: debouncedCity.length >= MIN_CITY_LENGTH,
    staleTime: TILE_TTL_DAYS * 24 * 60 * 60 * 1000,   // match 7-day TTL
    gcTime: (TILE_TTL_DAYS + 1) * 24 * 60 * 60 * 1000, // keep 1 extra day
    retry: 1,
  });

  return {
    restaurants: result.data?.restaurants,
    source: result.data?.source,
    cacheHit: result.data?.cacheHit,
    tileId: result.data?.tileId,
    totalCount: result.data?.totalCount,
    latencyMs: result.data?.latencyMs,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error as Error | null,
    isFetching: result.isFetching,
  };
}

// ---------------------------------------------------------------------------
// Companion hook — global explore (no city scope)
// ---------------------------------------------------------------------------

import { getGlobalRestaurants } from '@/lib/restaurantRepository';
import type { UnifiedRestaurant } from '@/lib/tileCache';

/**
 * useGlobalRestaurants
 *
 * Wraps getGlobalRestaurants for the /explore page.
 * Identical filter shape to useRestaurantsPaginated but routes
 * through the repository layer.
 */
export function useGlobalRestaurants(filters: RestaurantFilters = {}): {
  restaurants: UnifiedRestaurant[] | undefined;
  total: number | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const result = useQuery({
    queryKey: ['global-restaurants', filters],
    queryFn: () => getGlobalRestaurants(filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    restaurants: result.data?.restaurants,
    total: result.data?.total,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
