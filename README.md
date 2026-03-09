# 🍽️ Palate Guide

**The world's most trusted guide to authentic food.** Discover dishes, restaurants, and cuisines from every corner of the globe — curated by food lovers, for food lovers.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

---

## ✨ Features

- **🌍 Interactive World Map** — Explore cuisines by country with a beautiful SVG map
- **🍜 Dish Discovery** — Browse signature dishes from 28+ countries with ratings, tags, and spice levels
- **🏪 Restaurant Finder** — Curated restaurant listings + live OpenStreetMap discovery
- **🤖 AI Recommender** — Get personalized dish recommendations based on your preferences
- **🛂 Food Passport** — Track countries you've explored and dishes you've tried
- **🌙 Dark Mode** — Full light/dark theme support
- **📱 Responsive Design** — Optimized for mobile, tablet, and desktop
- **🔐 Authentication** — Email-based sign up/sign in with protected routes

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animations** | Framer Motion |
| **Routing** | React Router v6 |
| **State/Data** | TanStack React Query |
| **Backend** | Lovable Cloud (Supabase) |
| **Maps** | React Simple Maps |
| **Charts** | Recharts |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/palate-guide.git

# Navigate to the project
cd palate-guide

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📁 Project Structure

```
src/
├── assets/          # Food dish images
├── components/      # Reusable UI components
│   ├── ui/          # shadcn/ui primitives
│   ├── Header.tsx   # Navigation header
│   ├── Footer.tsx   # Site footer
│   ├── WorldMap.tsx  # Interactive globe map
│   └── ...
├── data/            # Static food data
├── hooks/           # Custom React hooks (auth, restaurants, passport)
├── integrations/    # Backend client configuration
├── lib/             # Utilities
├── pages/           # Route pages
│   ├── Index.tsx
│   ├── RestaurantsPage.tsx
│   ├── MapPage.tsx
│   ├── PassportPage.tsx
│   ├── RecommenderPage.tsx
│   └── ...
└── main.tsx         # App entry point
```

## 🌐 Deployment

This project is deployed via [Lovable](https://lovable.dev). To publish:

1. Open the project in the Lovable editor
2. Click **Share → Publish**
3. Optionally connect a custom domain in **Settings → Domains**

## 📄 License

This project is private. All rights reserved.

---

<p align="center">Made with ❤️ for food lovers everywhere</p>
