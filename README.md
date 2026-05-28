# TurfX | Smart Turf Cricket Booking & Management System

TurfX is a premium full-stack, mobile-responsive web application designed to simplify sports booking, net practice sessions, and stadium slots rentals. Players can discover local pitches, view real-time hourly slot lists, lock scheduling dates under high-concurrent traffic, and download printable receipt invoices. Turf owners and system administrators can oversee listings, manage user roles, and monitor gross platform earnings from dedicated workspaces.

---

## 🏗️ Architectural Overview & Folders

```
TurfX/
├── backend/
│   ├── config/              # Prisma Client export
│   ├── controllers/         # Decoupled REST controllers
│   ├── middleware/          # JWT, Role authorization, Validation, Error borders
│   ├── prisma/              # PostgreSQL schema definition and Seed script
│   ├── routes/              # Express Router mappings
│   ├── server.js            # Entry server wiring and AI stubs
│   ├── .env.example         # System variables configuration
│   └── package.json         # Backend dependencies list
│
└── frontend/
    ├── src/
    │   ├── components/      # Responsive Navbar/Footer, Protectors, Skeletons
    │   ├── context/         # AuthContext provider (Session cache)
    │   ├── pages/           # Landing, Catalog, Checkout, Payments, dashboards
    │   ├── services/        # Axios API client wrapper
    │   ├── App.jsx          # Routing configurations
    │   ├── index.css        # Tailwind style layers and neon custom utility
    │   └── main.jsx         # ReactDOM bootloader
    ├── index.html           # Main template with SEO metadata
    ├── postcss.config.js
    ├── tailwind.config.js   # Sports Green and Orange custom themes
    ├── vite.config.js       # Vite build setup with API proxy
    └── package.json         # Frontend packages
```

---

## ⚡ Key Features

1. **Anti-Race Condition Slots Locks**: Implements isolated database transactions (`prisma.$transaction`) ensuring two captains cannot double-book the same hour slot.
2. **Dynamic Multi-Role Dashboards**:
   - **Player Dashboard**: Displays scheduled matches, pending cart checkouts, spent metrics, invoice histories, and slot cancellations.
   - **Owner Dashboard**: Graphs dynamic earnings, listings lists, and approvals tables to confirm or cancel slot booking requests.
   - **Admin Dashboard**: Aggregates platform statistics, manages credentials privileges, toggles roles, and deletes profiles.
3. **Simulated Payment Sandbox**: Integrates fully with the Razorpay SDK API, but falls back gracefully to a fully functional sandboxed payment modal when test credentials are left blank, enabling developers to run and verify the system out-of-the-box.
4. **App-like Responsive Viewports**: Structures a floating glass header on desktops and an app navigation bottom dock on small screens mimicking native phone apps.
5. **AI Extended Stubs**: Structured backend routing endpoints ready to be equipped with machine learning models for chatbot replies, pricing spikes during peak slots, and personalized recommends.

---

## ⚙️ Installation & Database Setup (Local vs. Cloud)

### Prerequisites
- [Node.js](https://nodejs.org) (v16+)
- **Database Options**: Either a local PostgreSQL instance OR a hosted cloud-database provider like [Supabase](https://supabase.com), [Neon.tech](https://neon.tech), [Aiven](https://aiven.io), or [Railway](https://railway.app).

---

### Step 1: Connecting a Cloud PostgreSQL Database
If you prefer to host your database in the cloud (not on `localhost`):
1. **Provision Database**: Create a free PostgreSQL database on Neon.tech or Supabase.
2. **Retrieve Connection String**: Copy the external transaction/pooling URI connection string.
3. **Configure Environment SSL**: Ensure your connection string ends with `?sslmode=require` (or `?pgbouncer=true` if using Supabase pooling). This is mandatory for encrypted secure remote handshakes.
   *Example*: `DATABASE_URL="postgresql://neondb_owner:pass@ep-cool-subdomain.ap-southeast-1.aws.neon.tech/turfx_db?sslmode=require"`

---

### Step 2: Configuring Cloud Image Storage (Cloudinary)
To handle real image file uploads from turf owners instead of using mock placeholders:
1. Create a free account at [Cloudinary](https://cloudinary.com).
2. Go to your Dashboard and copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Add these credentials to your backend `.env` file (see `.env.example`). Once set, the app will automatically route raw image files to the Cloudinary CDN.

---

### Step 3: Backend Setup & Schema Push
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and set your `DATABASE_URL` to your hosted cloud PostgreSQL string and add your `CLOUDINARY_*` keys.*
4. **Deploy Schema to Cloud Database**:
   Instead of dev migrations which ask for interactive names, sync your database schema directly to your cloud DB:
   ```bash
   npx prisma db push
   ```
5. **Seed Default Accounts & Sports Data**:
   Populate users, turfs, slots, and reviews directly on your cloud database:
   ```bash
   npm run prisma:seed
   ```
6. Start the API server locally:
   ```bash
   npm run dev
   ```
   *Backend is active at:* `http://localhost:5000`

---

### Step 4: Frontend Client Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite developer server:
   ```bash
   npm run dev
   ```
   *Vite client is active at:* `http://localhost:3000` (automatically proxies requests to the active local or remote backend).

---

## 🔐 Default Seed Credentials

To log in and test all dashboard interfaces instantly, use the following seeded email accounts:

- **Standard Cricket Player**:
  - **Email**: `user@example.com`
  - **Password**: `password123`
- **Turf Pitch Owner**:
  - **Email**: `owner@example.com`
  - **Password**: `password123`
- **System Administrator**:
  - **Email**: `admin@example.com`
  - **Password**: `password123`

---

## 🚀 Deployed Hosting Guides

### Frontend (Vercel)
The Vite configuration compiles assets into a single static directory.
To host on Vercel:
1. Connect your GitHub repository to Vercel.
2. Select the `frontend` folder as the root directory.
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set environment variable: `VITE_API_URL` pointing to your hosted Express server URL (e.g. `https://api-turfx.render.com/api`).

### Backend (Render / Railway / Heroku)
To host the Node API:
1. Create a PostgreSQL service on your cloud provider (e.g., Supabase, Neon, or Render Postgres).
2. Create a Web Service pointing to the `backend` folder.
3. Set environment parameters:
   - `DATABASE_URL` (your cloud database string)
   - `JWT_SECRET` (long cryptographic key)
   - `PORT` (e.g. `5000`)
4. Set start commands:
   - **Build Command**: `npx prisma generate`
   - **Start Command**: `node server.js`
