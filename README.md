# 🍔 SHIFT HAPPENS!
### A Comprehensive Restaurant Management Platform

A mobile-first, AI-powered restaurant operations system built with React + Vite. Runs entirely in the browser — no backend required.

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Real-time KPIs — revenue, guests, inventory alerts, hourly sales charts |
| **POS Terminal** | Full order flow with item notes, AI upsell suggestions, split bill (equal + by item) |
| **Inventory** | Ingredient tracking with live deduction on orders, quick restock, supplier management |
| **Reservations** | Interactive floor plan, reservation CRUD, VIP flagging, table assignment |
| **Kitchen Display (KDS)** | Live order board with bump-to-ready flow |
| **AI Manager (ShiftBot)** | Gemini-powered chat assistant with real-time inventory/menu context |
| **Admin Panel** | PIN-protected: menu management, analytics, AI personality config, factory reset |

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v3 (custom `shift-*` color palette)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router v6 (HashRouter)
- **AI:** Google Gemini 1.5 Flash via `@google/genai`
- **State:** React Context + useState (in-memory, resets on refresh)

---

## Local Development

### Prerequisites
- Node.js 18+

### Setup

```bash
git clone https://github.com/C-Jay69/SHIFT-HAPPENS-_211125.git
cd SHIFT-HAPPENS-_211125

# Install dependencies
npm install --legacy-peer-deps

# Copy env file and add your Gemini API key
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here

# Start dev server
npm run dev
# → http://localhost:3030
```

### Build for Production

```bash
npm run build
# Output in /dist folder
```

---

## Deployment

### Vercel (Recommended for static SPA)
1. Push repo to GitHub
2. Import project at vercel.com
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable: `GEMINI_API_KEY`

### Coolify (Self-hosted VPS)
1. New resource → Git repository
2. Build pack: **Nixpacks** or **Static**
3. Build command: `npm install --legacy-peer-deps && npm run build`
4. Publish directory: `dist`
5. Add `GEMINI_API_KEY` in Environment Variables

### Railway
1. New project → Deploy from GitHub
2. Add environment variable: `GEMINI_API_KEY`
3. Railway auto-detects Vite — build runs automatically

### Netlify
1. Connect repo, set build command: `npm run build`
2. Publish directory: `dist`
3. Add env var: `GEMINI_API_KEY`

---

## Admin Access

Navigate to **Admin Panel** in the sidebar.  
Default PIN: `1234` — change this in `pages/Admin.tsx` before production deployment.

---

## Notes

- All data is **in-memory only** — refreshing the page resets everything. For persistence, a backend + database would need to be added.
- AI features require a valid `GEMINI_API_KEY` — without it, ShiftBot responds with a connection error.
- The app uses `HashRouter` which means URLs look like `/#/pos` — compatible with all static hosting providers without server-side routing config.

---

## Design System

| Token | Value |
|-------|-------|
| `shift-blue` | `#0000FF` |
| `shift-amber` | `#FFBF00` |
| `shift-lime` | `#BEF754` |
| `shift-magenta` | `#FF00FF` |
| `shift-cyan` | `#00FFFF` |
| `shift-dark` | `#1a1a1a` |
| Font (sans) | Inter |
| Font (mono) | JetBrains Mono |
