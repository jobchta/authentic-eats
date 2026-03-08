import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CACHE_TTL_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, lat, lng, radius = 5000, limit = 50 } = await req.json();

    if (!city && (!lat || !lng)) {
      return new Response(
        JSON.stringify({ error: "Provide either 'city' or 'lat'+'lng'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check cache first
    const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 86400000).toISOString();
    const searchCity = city?.trim().toLowerCase();

    if (searchCity) {
      const { data: cached } = await supabase
        .from("osm_restaurant_cache")
        .select("*")
        .ilike("city", `%${searchCity}%`)
        .gte("fetched_at", cutoff)
        .limit(limit);

      if (cached && cached.length > 0) {
        return new Response(
          JSON.stringify({ source: "cache", results: cached, count: cached.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Geocode city if needed
    let searchLat = lat;
    let searchLng = lng;

    if (city && (!searchLat || !searchLng)) {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
        { headers: { "User-Agent": "AuthenticPlateFinder/1.0" } }
      );
      const geoData = await geoRes.json();
      if (!geoData.length) {
        return new Response(
          JSON.stringify({ error: "City not found", results: [], count: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      searchLat = parseFloat(geoData[0].lat);
      searchLng = parseFloat(geoData[0].lon);
    }

    // Query Overpass API
    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["amenity"="restaurant"](around:${Math.min(radius, 15000)},${searchLat},${searchLng});
        way["amenity"="restaurant"](around:${Math.min(radius, 15000)},${searchLat},${searchLng});
      );
      out center ${Math.min(limit, 100)};
    `;

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!overpassRes.ok) {
      return new Response(
        JSON.stringify({ error: "Overpass API unavailable, try again later", results: [], count: 0 }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const overpassData = await overpassRes.json();
    const elements = overpassData.elements || [];

    const restaurants = elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        osm_id: el.id,
        name: el.tags.name,
        cuisine: el.tags.cuisine || el.tags["cuisine:en"] || null,
        city: city || "Unknown",
        country: el.tags["addr:country"] || null,
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        address: [el.tags["addr:housenumber"], el.tags["addr:street"], el.tags["addr:city"]]
          .filter(Boolean)
          .join(", ") || null,
        phone: el.tags.phone || el.tags["contact:phone"] || null,
        website: el.tags.website || el.tags["contact:website"] || null,
        opening_hours: el.tags.opening_hours || null,
      }));

    // Cache results (upsert, fire-and-forget)
    if (restaurants.length > 0) {
      const toCache = restaurants.map((r: any) => ({
        ...r,
        fetched_at: new Date().toISOString(),
      }));
      supabase
        .from("osm_restaurant_cache")
        .upsert(toCache, { onConflict: "osm_id" })
        .then(() => {});
    }

    return new Response(
      JSON.stringify({
        source: "osm",
        results: restaurants,
        count: restaurants.length,
        attribution: "© OpenStreetMap contributors",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message, results: [], count: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
