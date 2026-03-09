/**
 * NearbyRestaurants.tsx
 * Shows a tile-first list of restaurants near the user's current location.
 * Uses the useTileRestaurants hook from PR-1 to fetch via tile coordinates,
 * so only the relevant ~75km² tile is queried — never the full 2M row table.
 */

import { useEffect, useState } from 'react';
import { useTileRestaurants } from '@/hooks/use-tile-restaurants';
import { latLonToTile } from '@/lib/citySeeder';

interface NearbyRestaurantsProps {
  /** Override zoom level (default 7 for ~75km² tiles) */
  zoom?: number;
  /** Max results to display */
  limit?: number;
}

export function NearbyRestaurants({ zoom = 7, limit = 20 }: NearbyRestaurantsProps) {
  const [tile, setTile] = useState<{ x: number; y: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      // Default to Mumbai if geolocation unsupported
      setTile(latLonToTile(19.076, 72.8777, zoom));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTile(latLonToTile(pos.coords.latitude, pos.coords.longitude, zoom));
      },
      () => {
        setLocationError('Location access denied — showing Mumbai');
        setTile(latLonToTile(19.076, 72.8777, zoom));
      },
      { timeout: 5000 }
    );
  }, [zoom]);

  const { restaurants, isLoading, error } = useTileRestaurants(
    tile ? { zoom, x: tile.x, y: tile.y } : null
  );

  if (!tile || isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Could not load nearby restaurants.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  const displayed = restaurants.slice(0, limit);

  return (
    <section className="space-y-4">
      {locationError && (
        <p className="text-sm text-amber-600 dark:text-amber-400">{locationError}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
      {restaurants.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No restaurants indexed in this area yet.</p>
          <p className="text-sm mt-1">Check back after the next weekly crawl!</p>
        </div>
      )}
    </section>
  );
}

// ---- Inline card (no extra file needed for MVP) ----

interface Restaurant {
  id: string;
  name: string;
  cuisine?: string | null;
  address?: string | null;
  lat: number;
  lon: number;
  website?: string | null;
  phone?: string | null;
}

function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lon}`;

  return (
    <article className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{r.name}</h3>
        {r.cuisine && (
          <span className="shrink-0 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
            {r.cuisine.split(';')[0]}
          </span>
        )}
      </div>
      {r.address && (
        <p className="text-xs text-muted-foreground line-clamp-2">{r.address}</p>
      )}
      <div className="flex gap-2 mt-auto pt-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Directions
        </a>
        {r.website && (
          <a
            href={r.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Website
          </a>
        )}
        {r.phone && (
          <a
            href={`tel:${r.phone}`}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Call
          </a>
        )}
      </div>
    </article>
  );
}
