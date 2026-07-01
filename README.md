# 🌊 HireWave — Modern Job Portal

A production-ready job portal that **aggregates jobs** from multiple platforms (Naukri, Indeed, Internshala) and displays them in a stunning, animated UI.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS v3, Framer Motion, Shadcn/UI, Aceternity UI |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas + Mongoose |
| **Scraping** | Puppeteer + Cheerio + Axios |
| **Auth** | JWT + bcrypt + Google OAuth (Passport.js) |
| **Cache** | Redis (Upstash) — with in-memory fallback |
| **State** | Zustand |

## ✨ Features & Enhancements

- **🏷️ Platform Origin Badges:** Every job card displays a custom branding pill badge corresponding to its source platform (LinkedIn, Naukri, Indeed, Internshala, or Glassdoor).
- **⚡ Zero-Delay Auth Persistence:** Instantly loads session tokens from storage before mounting. This avoids unauthenticated UI flashes on page refreshes during Vercel container recycles.
- **🎯 Interactive Categories:** Clicking category grid cards on the landing page triggers pre-filtered jobs feed searches and resets view scroll coordinates.
- **🔍 Relevance-Based Search:** Calculates keyword match weights (e.g., title matches get higher weights than descriptions) and sorts the most relevant roles to the top.

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- (Optional) Upstash Redis account
- (Optional) Google OAuth credentials

### Backend Setup
```bash
cd server
cp .env.example .env   # Edit with your credentials
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173) with API at [http://localhost:5000](http://localhost:5000).

## 🔧 Environment Variables

See `server/.env.example` for all required variables. Key ones:
- `MONGODB_URI` — MongoDB connection string (required)
- `JWT_SECRET` — JWT signing secret (required)
- `UPSTASH_REDIS_*` — Redis cache (optional, falls back to in-memory)
- `GOOGLE_CLIENT_*` — Google OAuth (optional)

## 🕷️ Scrapers

| Platform | Status | Method |
|----------|--------|--------|
| Naukri | ✅ Active | Puppeteer |
| Indeed | ✅ Active | Cheerio |
| Internshala | ✅ Active | Cheerio |
| LinkedIn | ⚠️ Stubbed | Blocked by ToS |
| Glassdoor | ⚠️ Stubbed | Requires auth |

Jobs are auto-scraped every 6 hours via node-cron, or can be triggered manually by authenticated users.

## 📁 Project Structure

```
job-portal/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI components (aceternity, jobs, layout, search, auth)
│   │   ├── pages/        # Route pages
│   │   ├── store/        # Zustand stores
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
│   └── ...
├── server/          # Express.js backend
│   ├── config/      # DB, Redis, Passport
│   ├── models/      # Mongoose schemas
│   ├── scrapers/    # Job scrapers
│   ├── controllers/ # Route handlers
│   ├── routes/      # API routes
│   ├── middleware/   # Auth, rate limit, error handler
│   └── utils/       # Normalize, deduplicate, scheduler
└── README.md
```

## 🌐 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/jobs` | Optional | List jobs with filters |
| GET | `/api/jobs/search?q=...` | No | Full-text search |
| GET | `/api/jobs/stats` | No | Job statistics |
| GET | `/api/jobs/:slug` | Optional | Job detail |
| POST | `/api/jobs/scrape` | Required | Trigger scrape |
| POST | `/api/jobs/:id/bookmark` | Required | Toggle bookmark |
| GET | `/api/jobs/bookmarks` | Required | Get user bookmarks |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Required | Get current user |

---

*Built with ❤️ by HireWave — Aggregate. Filter. Apply.*
