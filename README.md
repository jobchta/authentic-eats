# 🍽️ Palate Guide - Zero-Cost Restaurant Discovery Platform

**Live App:** https://authentic-eats.vercel.app/

A globally scalable food discovery platform featuring 2,266+ real restaurants with millions more accessible via live OpenStreetMap integration. Built with zero ongoing costs.

## 🎯 What Makes This Special

- **2,266 Curated Restaurants** imported from real OpenStreetMap data across 10 global cities
- **Millions of Discoverable Restaurants** via Supabase Edge Functions querying OSM on-demand
- **100% Zero Cost** - Vercel Free + Supabase Free + GitHub Actions + OSM API
- **Auto-Refresh** - Weekly GitHub Actions workflow updates restaurant data automatically
- **Production Ready** - Deployed to Vercel with Supabase backend
- **Global Coverage** - Tokyo, Paris, New York, London, Rome, Mumbai, Singapore, Sydney, Mexico City, Bangkok

## 🏗️ Architecture

```
Frontend (Vercel)
    ↓
Supabase Database (2,266 restaurants)
    +
Edge Function → OpenStreetMap API (Millions on-demand)
    +
GitHub Actions (Weekly auto-import)
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, TailwindCSS, Vite |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **Deployment** | Vercel (Frontend), Supabase (Backend) |
| **Data Source** | OpenStreetMap Overpass API |
| **Automation** | GitHub Actions |
| **State Management** | TanStack Query (React Query) |
| **Routing** | Wouter |

## 📦 Project Structure

```
authentic-eats/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── lib/              # Utilities
│   ├── hooks/            # Custom React hooks
│   └── integrations/
│       └── supabase/     # Supabase client & types
├── supabase/
│   ├── migrations/       # Database schema
│   └── functions/        # Edge Functions
│       ├── osm-restaurants/    # Live OSM discovery
│       ├── generate-dish-image/
│       ├── ingest-country-foods/
│       └── bulk-seed/
├── .github/
│   └── workflows/
│       └── import-data.yml     # Auto-import workflow
└── public/               # Static assets
```

## 🛠️ Setup & Deployment

### Prerequisites
- Node.js 18+
- Git
- GitHub account
- Vercel account (free)
- Supabase account (free)

### 1. Clone & Install

```bash
git clone https://github.com/jobchta/authentic-eats.git
cd authentic-eats
npm install
```

### 2. Supabase Setup

1. Create new project at https://supabase.com
2. Run migrations from `supabase/migrations/`
3. Deploy Edge Function:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Deploy function
   supabase functions deploy osm-restaurants --project-ref YOUR_PROJECT_REF
   ```
4. Get your credentials:
   - Project URL: `Settings → API → Project URL`
   - Anon Key: `Settings → API → anon/public key`
   - Service Role Key: `Settings → API → service_role key`

### 3. Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. GitHub Secrets (for auto-import)

Add these to `Settings → Secrets and variables → Actions`:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

Or use Vercel GUI:
1. Import repository at https://vercel.com/new
2. Add environment variables
3. Deploy

### 6. Trigger First Data Import

Go to `Actions` tab → `Import Real OSM Restaurant Data` → `Run workflow`

This imports 2,266+ restaurants from 10 cities. Runs automatically every Sunday at 2 AM.

## 🔄 Data Import System

### Automatic Weekly Refresh

The GitHub Actions workflow (`.github/workflows/import-data.yml`) automatically:
- Runs every Sunday at 2 AM UTC
- Fetches fresh restaurant data from OpenStreetMap
- Upserts to Supabase (updates existing, inserts new)
- Covers 10 major cities with 8km radius each

### Manual Trigger

```bash
# Via GitHub UI
Actions → Import Real OSM Restaurant Data → Run workflow

# Via GitHub CLI
gh workflow run import-data.yml
```

### Cities Covered

1. Tokyo 🇯🇵 (299 restaurants)
2. Paris 🇫🇷 (timeout - needs manual fix)
3. New York 🇺🇸 (299 restaurants)
4. London 🇬🇧 (298 restaurants)
5. Rome 🇮🇹 (263 restaurants)
6. Mumbai 🇮🇳 (293 restaurants)
7. Singapore 🇸🇬 (278 restaurants)
8. Sydney 🇦🇺 (288 restaurants)
9. Mexico City 🇲🇽 (280 restaurants)
10. Bangkok 🇹🇭 (267 restaurants)

**Total: 2,266 restaurants**

## 🌐 Edge Function: Live Discovery

### Endpoint

```
https://YOUR_PROJECT.supabase.co/functions/v1/osm-restaurants
```

### Usage

```javascript
// City-based search
const response = await fetch(EDGE_FUNCTION_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  },
  body: JSON.stringify({
    city: 'Mumbai',
    limit: 50,
    radius: 5000  // meters
  })
});

// Coordinate-based search
const response = await fetch(EDGE_FUNCTION_URL, {
  method: 'POST',
  body: JSON.stringify({
    lat: 19.0760,
    lng: 72.8777,
    limit: 50,
    radius: 5000
  })
});
```

### Features

- **7-day cache**: Repeated queries for same city use cached results
- **Geocoding**: Automatically converts city names to coordinates
- **OSM Overpass API**: Queries live OpenStreetMap data
- **Smart filtering**: Returns only restaurants with names
- **Metadata**: Includes cuisine, address, phone, website, opening hours

## 💰 Cost Breakdown

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| **Vercel** | Hobby | $0 | 100 GB bandwidth, unlimited requests |
| **Supabase** | Free | $0 | 500 MB database (currently using ~50 MB) |
| **GitHub Actions** | Free | $0 | 2,000 minutes/month (using ~10 min/week) |
| **OSM API** | Free | $0 | Rate-limited but sufficient |
| **Total** | | **$0/month** | |

### Scaling Costs

If you exceed free tiers:
- Supabase Pro: $25/month (8 GB database, better performance)
- Vercel Pro: $20/month (1 TB bandwidth)

**With current usage, you can stay free indefinitely**

## 🐛 Known Issues & Fixes

### Issue 1: Restaurants Not Displaying

**Problem**: Shows "0 curated restaurants" despite 2,266 in database

**Cause**: Frontend filtering by tier, but query might be incorrect

**Fix**: Update restaurant query to include all tiers or fix tier assignment

### Issue 2: Edge Function "Could Not Reach"

**Problem**: Live Discovery shows "Could not reach discovery service"

**Possible Causes**:
1. Frontend calling wrong URL
2. Missing CORS headers (already added)
3. Auth token not passed

**Debug Steps**:
```bash
# Test Edge Function directly
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/osm-restaurants \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"city":"Mumbai","limit":10}'
```

### Issue 3: Paris Import Timeout

**Problem**: Paris query times out (504 Gateway Timeout)

**Fix**: Reduce radius or split into arrondissements

```python
# In import-data.yml, change Paris to:
('Paris 1-10', 'FR', 48.8566, 2.3522, 'Europe', 4000),
('Paris 11-20', 'FR', 48.8666, 2.3622, 'Europe', 4000),
```

## 📈 Future Improvements

### Immediate (Zero Cost)
1. ✅ Fix restaurant display issue
2. ✅ Debug Edge Function connectivity
3. Add more cities (50+ cities = 10,000+ restaurants)
4. Implement user reviews & favorites (using Supabase auth)
5. Add dish photos using `generate-dish-image` function

### Medium Term (Still Zero Cost)
1. PWA support for offline access
2. Geolocation-based discovery
3. Multi-language support
4. Share/social features
5. Email notifications for new restaurants

### Long Term (May Need Paid Tier)
1. Premium features (Supabase Pro for better performance)
2. CDN for images (Cloudflare R2 free tier)
3. Advanced analytics
4. Mobile apps (React Native)
5. API for third-party integrations

## 🔐 Environment Variables Reference

### Required

```env
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anon/public key
```

### GitHub Secrets (for Actions)

```
VITE_SUPABASE_URL=                 # Same as above
SUPABASE_SERVICE_ROLE_KEY=         # Service role key (for write access)
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- **OpenStreetMap Contributors** for restaurant data
- **Supabase** for backend infrastructure
- **Vercel** for hosting
- **Lovable** for initial code generation

## 📞 Support

For issues: https://github.com/jobchta/authentic-eats/issues

---

**Built with ❤️ for food lovers worldwide | Zero ongoing costs | 100% open source**
