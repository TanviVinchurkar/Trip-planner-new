# Trip Planner — MERN Backend Setup Guide

## Project Structure

```
trip-planner/
├── index.html          ← Landing page + multi-step trip form
├── login.html          ← Login / Signup
├── plan.html           ← Trip detail page
├── dashBoard.html      ← User profile + saved trips
│
├── script/
│   ├── api.js          ← ✨ NEW: all backend API calls in one place
│   ├── main.js         ← Landing page buttons
│   ├── form.js         ← ✨ UPDATED: form steps + saves to backend
│   ├── login.js        ← ✨ UPDATED: real auth (JWT)
│   ├── plan.js         ← ✨ NEW: populates plan.html from backend
│   └── dashboard.js    ← ✨ NEW: populates dashBoard.html from backend
│
├── data/
│   ├── backend.js      ← Static spots (fallback if DB is empty)
│   └── addSpot.js      ← ✨ UPDATED: trip cart (spots selected by user)
│
└── server/             ← ✨ NEW: entire Express backend
    ├── server.js
    ├── seed.js
    ├── .env.example
    ├── package.json
    ├── config/db.js
    ├── models/
    │   ├── User.js
    │   ├── Trip.js
    │   └── Spot.js
    ├── middleware/authMiddleware.js
    ├── controllers/
    │   ├── authController.js
    │   ├── tripController.js
    │   └── planController.js
    └── routes/
        ├── authRoutes.js
        ├── tripRoutes.js
        └── planRoutes.js
```

---

## API Endpoints

| Method | Route | Auth | What it does |
|--------|-------|------|--------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login, get JWT |
| GET | /api/auth/me | Yes | Get logged-in user info |
| PUT | /api/auth/profile | Yes | Edit profile |
| POST | /api/trips | Yes | Save a completed trip |
| GET | /api/trips | Yes | Get all my trips |
| GET | /api/trips/:id | Yes | Get one trip |
| PUT | /api/trips/:id/itinerary | Yes | Save day-wise activities |
| DELETE | /api/trips/:id | Yes | Delete a trip |
| GET | /api/plan/weather?city= | No | Current weather |
| GET | /api/plan/image?query= | No | Destination photo |
| POST | /api/plan/budget | No | Budget breakdown |
| GET | /api/plan/spots?city= | No | Tourist spots for a city |

---

## Setup Steps

### Step 1 — Get Free API Keys

1. **MongoDB Atlas** (database) — https://cloud.mongodb.com
   - Create free account → New Project → Build a Database → Free tier (M0)
   - Click Connect → Drivers → copy the connection string
   - Replace `<password>` with your DB user password

2. **OpenWeatherMap** (weather) — https://openweathermap.org/api
   - Sign up free → API Keys tab → copy the key
   - Free tier: 1000 calls/day

3. **Unsplash** (destination photos) — https://unsplash.com/developers
   - Sign up → New Application → copy Access Key
   - Free tier: 50 calls/hour

---

### Step 2 — Configure Environment

```bash
cd server
cp .env.example .env
```

Open `.env` and fill in:
```
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/tripplanner
JWT_SECRET=any_long_random_string_here
OPENWEATHER_API_KEY=paste_your_key_here
UNSPLASH_ACCESS_KEY=paste_your_key_here
CLIENT_URL=http://127.0.0.1:5500
```

---

### Step 3 — Install & Start Backend

```bash
cd server
npm install
node seed.js        # seeds spots into MongoDB (run once)
npm run dev         # starts server on http://localhost:5000
```

You should see:
```
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
🚀 Server running on http://localhost:5000
```

---

### Step 4 — Open Frontend

Open `index.html` with **Live Server** (VS Code extension) or any static server.

> ⚠️ Must use Live Server (http://127.0.0.1:5500), not file:// — browsers block fetch from file:// URLs.

---

## User Flow (end to end)

```
index.html
  ↓ fill form (start, destination, dates, budget)
  ↓ Continue → renderSpot() → fetches spots from GET /api/plan/spots
  ↓ Continue → renderHotel() → pick a hotel
  ↓ Continue → finishAndSave()
       ↓ GET /api/plan/weather  (parallel)
       ↓ GET /api/plan/image    (parallel)
       ↓ POST /api/plan/budget  (parallel)
       ↓ POST /api/trips        (saves everything)
  ↓ redirect → plan.html
       ↓ GET /api/trips/:id     (loads trip)
       ↓ renders hero, weather, budget, hotels, itinerary, map
       ↓ PUT /api/trips/:id/itinerary (save activities)

login.html
  ↓ Sign Up → POST /api/auth/register → redirect dashBoard
  ↓ Login   → POST /api/auth/login    → redirect dashBoard

dashBoard.html
  ↓ GET /api/auth/me    → shows user name, email, phone
  ↓ GET /api/trips      → shows all saved trips
  ↓ View Trip           → sets currentTripId → plan.html
  ↓ Delete 🗑           → DELETE /api/trips/:id
  ↓ Click name/▾        → Logout (clears token)
```

---

## For College Viva

**Q: Why MERN?**
MongoDB (flexible JSON-like data for trips), Express (lightweight API), React-ready frontend, Node.js (JavaScript everywhere).

**Q: Why JWT over sessions?**
Stateless — server doesn't need to store sessions. Token travels with every request in the Authorization header.

**Q: What free APIs are used and why?**
- OpenWeatherMap: real weather for destination planning
- Unsplash: high-quality destination photos
- Google Maps embed: free, no key needed for embed

**Q: What if user isn't logged in?**
Guest mode — trip is saved to localStorage. On login, they see their saved DB trips in dashboard.

**Q: How is the budget split calculated?**
Server-side logic: 35% accommodation, 25% food, 20% transport, 15% activities, 5% emergency. Derived from common travel budgeting guidelines.
