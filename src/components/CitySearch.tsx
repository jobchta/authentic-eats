/**
 * CitySearch.tsx
 * Lets users pick a pre-seeded city to browse restaurants.
 * Passes the tile coordinates down to NearbyRestaurants.
 * Zero external dependencies — uses SEED_CITIES from citySeeder.
 */

import { useState, useMemo } from 'react';
import { SEED_CITIES, latLonToTile } from '@/lib/citySeeder';
import { useTileRestaurants } from '@/hooks/use-tile-restaurants';

const ZOOM = 7;

/** City with pre-computed center tile. */
const CITY_OPTIONS = SEED_CITIES.map((city) => {
  const centerLat = (city.bbox.minLat + city.bbox.maxLat) / 2;
  const centerLon = (city.bbox.minLon + city.bbox.maxLon) / 2;
  const tile = latLonToTile(centerLat, centerLon, ZOOM);
  return { ...city, tile };
});

export function CitySearch() {
  const [selected, setSelected] = useState(CITY_OPTIONS[0]);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      query.trim().length > 0
        ? CITY_OPTIONS.filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase())
          )
        : CITY_OPTIONS,
    [query]
  );

  const { restaurants, isLoading, error } = useTileRestaurants({
    zoom: ZOOM,
    x: selected.tile.x,
    y: selected.tile.y,
  });

  return (
    <div className="space-y-6">
      {/* City picker */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex flex-wrap gap-2">
          {filtered.map((city) => (
            <button
              key={city.name}
              onClick={() => { setSelected(city); setQuery(''); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selected.name === city.name
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Restaurants in {selected.name}
          {!isLoading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({restaurants.length} found)
            </span>
          )}
        </h2>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm">{error.message}</p>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((r) => (
              <CityRestaurantCard key={r.id} restaurant={r} />
            ))}
            {restaurants.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <p className="text-lg">No restaurants indexed yet for {selected.name}.</p>
                <p className="text-sm mt-2">The weekly OSM crawler will populate this soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface RestaurantRow {
  id: string;
  name: string;
  cuisine?: string | null;
  address?: string | null;
  lat: number;
  lon: number;
  website?: string | null;
  phone?: string | null;
  opening_hours?: string | null;
}

function CityRestaurantCard({ restaurant: r }: { restaurant: RestaurantRow }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lon}`;
  const cuisines = r.cuisine?.split(';').slice(0, 2) ?? [];

  return (
    <article className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{r.name}</h3>
        {cuisines.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {cuisines.map((c) => (
              <span
                key={c}
                className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full"
              >
                {c.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
      {r.address && (
        <p className="text-xs text-muted-foreground line-clamp-2">{r.address}</p>
      )}
      {r.opening_hours && (
        <p className="text-xs text-muted-foreground">🕒 {r.opening_hours}</p>
      )}
      <div className="flex gap-3 mt-auto pt-1 text-xs">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline">Map</a>
        {r.website && (
          <a href={r.website} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline">Website</a>
        )}
        {r.phone && (
          <a href={`tel:${r.phone}`}
            className="text-blue-600 dark:text-blue-400 hover:underline">Call</a>
        )}
      </div>
    </article>
  );
}
