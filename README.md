# 🚀 Level Up Your Logistics: The Ultimate Inventory & Warehouse Management System

Are you still tracking your valuable assets using clunky, outdated spreadsheets or rigid legacy software? **It's time for an upgrade.** Meet the lightning-fast, beautifully animated, and rock-solid platform built to modernize how you handle your stock. Engineered with cutting-edge web technologies, this isn't just an inventory tracker—it's your new warehouse command center.

---

## 🔥 Why Choose This System?

### 🐳 Containerized to Perfection (Docker Ready)
Zero dependency hell. No "it works on my machine" excuses. This entire architecture is fully Dockerized, meaning you can spin up the whole system—frontend, backend logic, and environment—with a single terminal command. 

### 📍 Never Lose Track Again
Stop guessing where your facilities are. Our **Interactive GPS Maps** (powered by Leaflet) let you pinpoint warehouse locations with absolute precision. Just click the map, drop a pin, and your coordinates are locked in.

### 🛠️ Your Data, Your Rules
Say goodbye to software that forces you to adapt to its limitations. With our **Dynamic Template Builder**, *you* dictate the data. Create custom, deeply nested fields for your items—whether it's serial numbers, expiration dates, or specification files—on the fly.

### ⚡ Edge-Optimized Speed & Security
Built on **Next.js 15**, this app doesn't just run fast; it flies. We utilize **Edge-runtime Middleware** to intercept requests and verify your Google OAuth session before the page even thinks about rendering. Fort Knox security, zero loading screens.

### 🎨 Dangerously Good Looks
Who said enterprise software has to be boring? Experience butter-smooth, custom **Framer Motion SVG animations** (yes, the trash can actually opens when you hover over it). It's a UI that feels incredibly satisfying to use.

---

## 💻 Under the Hood: The Tech Stack

Built for scale, type-safety, and maximum performance:

* **Core:** Next.js (App Router) & TypeScript
* **Deployment:** Docker & Docker Compose
* **Database:** PostgreSQL (via Vercel Postgres)
* **Authentication:** Auth.js / NextAuth v5 (Google OAuth Provider)
* **Mapping:** React-Leaflet
* **Styling & Motion:** CSS Modules + Framer Motion

---

## 🏁 Ready to Take Control? (Quick Start)

The preferred and fastest way to get this powerhouse running is using **Docker**.

### Method A: The Docker Way (Recommended) 🐳

1. **Clone the arsenal:**
```bash
git clone [https://github.com/Abstergo2003/Warehouse--.git](https://github.com/Abstergo2003/Warehouse--.git)
cd Warehouse--
```

2. **Fuel it up (Environment Variables):**
Create a `.env` file in the root directory and plug in your credentials:
```env
AUTH_SECRET="your_super_secret_key"
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="your_google_id"
AUTH_GOOGLE_SECRET="your_google_secret"
POSTGRES_URL="your_db_connection_string"
```


3. **Ignition:**
```bash
docker-compose up -d --build
```


*Your command center is now live at `http://localhost:3000`.*

---

### Method B: Manual Local Development

If you prefer to run things on the bare metal for development purposes:

1. Install dependencies: `npm install`
2. Ensure your `.env.local` is configured (same as step 2 above).
3. Start the dev server: `npm run dev`

---

<!-- ## 👨‍💻 Engineered By

Crafted with precision engineering straight out of the Warsaw University of Technology by **Radosław Korszla**.
Passionate about clean code, high-performance architecture, and gravel cycling.

🌐 [LinkedIn](https://www.google.com/search?q=https://linkedin.com/in/rados%C5%82aw-korszla-a78930256) | 💻 [GitHub](https://www.google.com/search?q=https://github.com/Abstergo2003) | 🚴‍♂️ [Strava](https://www.google.com/search?q=https://strava.com/athletes/rkorszla)

> **"Code should be as fast and reliable as a good gravel bike on a dirt road."**

--- -->

⭐ *If this project helped you modernize your workflow, don't forget to drop a star on the repo!* ⭐
