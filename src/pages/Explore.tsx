/**
 * Explore.tsx — /explore route
 * Entry point for city-based restaurant discovery.
 * Composes CitySearch (pick city, browse grid) and
 * NearbyRestaurants (geolocation-based suggestions).
 */

import { useState } from 'react';
import { CitySearch } from '@/components/CitySearch';
import { NearbyRestaurants } from '@/components/NearbyRestaurants';

type Tab = 'nearby' | 'cities';

export default function Explore() {
  const [tab, setTab] = useState<Tab>('nearby');

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Explore Restaurants
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover authentic places to eat, powered by OpenStreetMap data.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-8">
          <TabButton active={tab === 'nearby'} onClick={() => setTab('nearby')}>
            📍 Near Me
          </TabButton>
          <TabButton active={tab === 'cities'} onClick={() => setTab('cities')}>
            🌎 Browse Cities
          </TabButton>
        </div>

        {/* Content */}
        {tab === 'nearby' ? (
          <section>
            <p className="text-sm text-muted-foreground mb-6">
              Showing restaurants in your current tile area. Grant location
              access for best results.
            </p>
            <NearbyRestaurants zoom={7} limit={30} />
          </section>
        ) : (
          <CitySearch />
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
