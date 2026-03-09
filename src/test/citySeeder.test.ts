/**
 * citySeeder.test.ts
 * Unit tests for the pure utility functions in citySeeder.ts.
 * No network calls — all pure math.
 */

import { describe, it, expect } from 'vitest';
import {
  latLonToTile,
  bboxToTiles,
  SEED_CITIES,
} from '@/lib/citySeeder';

describe('latLonToTile', () => {
  it('converts (0, 0) at zoom 0 to tile (0, 0)', () => {
    const { x, y } = latLonToTile(0, 0, 0);
    expect(x).toBe(0);
    expect(y).toBe(0);
  });

  it('converts Mumbai center to expected zoom-7 tile', () => {
    // Mumbai approx 19.076°N, 72.877°E
    const { x, y } = latLonToTile(19.076, 72.877, 7);
    expect(x).toBe(93);
    expect(y).toBe(57);
  });

  it('converts London center to expected zoom-7 tile', () => {
    // London approx 51.5°N, -0.12°W
    const { x, y } = latLonToTile(51.5, -0.12, 7);
    expect(x).toBe(63);
    expect(y).toBe(42);
  });

  it('converts Sydney center to expected zoom-7 tile', () => {
    // Sydney approx -33.87°S, 151.21°E
    const { x, y } = latLonToTile(-33.87, 151.21, 7);
    expect(x).toBe(119);
    expect(y).toBe(78);
  });

  it('x tile increases as longitude increases', () => {
    const west = latLonToTile(0, -90, 5);
    const east = latLonToTile(0, 90, 5);
    expect(east.x).toBeGreaterThan(west.x);
  });

  it('y tile increases as latitude decreases (Mercator is inverted)', () => {
    const north = latLonToTile(60, 0, 5);
    const south = latLonToTile(-60, 0, 5);
    expect(south.y).toBeGreaterThan(north.y);
  });

  it('produces tile within valid range at zoom 5', () => {
    const zoom = 5;
    const maxTile = Math.pow(2, zoom) - 1;
    const { x, y } = latLonToTile(35.0, 135.0, zoom);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(maxTile);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(maxTile);
  });
});

describe('bboxToTiles', () => {
  it('returns at least one tile for any valid bbox', () => {
    const tiles = bboxToTiles(
      { minLat: 19.0, maxLat: 19.1, minLon: 72.8, maxLon: 72.9 },
      7
    );
    expect(tiles.length).toBeGreaterThan(0);
  });

  it('returns unique tiles (no duplicates)', () => {
    const bbox = { minLat: 18.85, maxLat: 19.35, minLon: 72.75, maxLon: 73.05 };
    const tiles = bboxToTiles(bbox, 7);
    const keys = tiles.map((t) => `${t.x},${t.y}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(tiles.length);
  });

  it('returns more tiles at higher zoom for same bbox', () => {
    const bbox = { minLat: 18.5, maxLat: 19.5, minLon: 72.5, maxLon: 73.5 };
    const tilesZ5 = bboxToTiles(bbox, 5);
    const tilesZ7 = bboxToTiles(bbox, 7);
    expect(tilesZ7.length).toBeGreaterThanOrEqual(tilesZ5.length);
  });

  it('returns tiles in valid x/y range for zoom level', () => {
    const zoom = 7;
    const maxTile = Math.pow(2, zoom) - 1;
    const bbox = { minLat: 10, maxLat: 30, minLon: 60, maxLon: 80 };
    const tiles = bboxToTiles(bbox, zoom);
    for (const { x, y } of tiles) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(maxTile);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(maxTile);
    }
  });
});

describe('SEED_CITIES', () => {
  it('has exactly 10 entries', () => {
    expect(SEED_CITIES).toHaveLength(10);
  });

  it('all cities have valid bounding boxes', () => {
    for (const city of SEED_CITIES) {
      expect(city.bbox.minLat).toBeLessThan(city.bbox.maxLat);
      expect(city.bbox.minLon).toBeLessThan(city.bbox.maxLon);
      expect(city.bbox.minLat).toBeGreaterThanOrEqual(-90);
      expect(city.bbox.maxLat).toBeLessThanOrEqual(90);
      expect(city.bbox.minLon).toBeGreaterThanOrEqual(-180);
      expect(city.bbox.maxLon).toBeLessThanOrEqual(180);
    }
  });

  it('all city names are non-empty strings', () => {
    for (const city of SEED_CITIES) {
      expect(city.name).toBeTruthy();
      expect(typeof city.name).toBe('string');
    }
  });

  it('Mumbai is the first city (home city priority)', () => {
    expect(SEED_CITIES[0].name).toBe('Mumbai');
  });

  it('bboxToTiles generates tiles for every seed city', () => {
    for (const city of SEED_CITIES) {
      const tiles = bboxToTiles(city.bbox, city.zoom);
      expect(tiles.length).toBeGreaterThan(0);
    }
  });
});
