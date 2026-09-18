# TurfX | Smart Cricket Turf Booking & Management System

## Technology stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Python 3.10+ with Django and Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (Simple JWT)

The React client continues to use the existing `/api` contract; its default API URL is now `http://localhost:8000/api`.

TurfX is a premium, full-stack, mobile-responsive web application designed to simplify sports booking, net practice sessions, and stadium slots rentals. Designed with a high-fidelity sports glassmorphism user interface, TurfX provides a seamless booking experience on both desktop and mobile viewports.

---

## ⚡ Key Features

1. **Book Turf Slots Instantly**: Check real-time hourly slot lists, pick booking dates, and reserve cricket nets.
2. **Dynamic Dashboard Panels**:
   - **Player**: Centralized match scheduler, spent metrics, and receipt invoice generation.
   - **Venue Owner**: Publishes new turf arenas, uploads pitch photos, views earnings charts, and manages booking approvals.
   - **Super Admin**: Exercises overriding authority to toggle user roles and monitor platform activity.
3. **Professional Razorpay Checkout**: Fully integrated with the live **Razorpay Checkout SDK** (modals) and strict cryptographic HMAC-SHA256 signature verification on the server.
4. **App-Like Navigation**: Features a gorgeous sticky header on desktop screens and a smooth navigation bottom dock on mobile screens, mimicking a native mobile app.

---

## ⚙️ Easy Installation Guide (Any Device)

Follow these simple steps to pull TurfX to any local device or cloud environment and get up and running in minutes.

### Prerequisites
Make sure you have the following installed on your device:
- [Node.js](https://nodejs.org) (v16 or higher, for the React frontend)
- [Python](https://www.python.org) (v3.10 or higher)
- A running PostgreSQL database (either running locally or a free cloud-hosted instance on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com))

---

### Step 1: Clone and Configure Environment Files

1. Clone or pull the repository to your local device.
2. Inside the **`backend`** folder, create a new file named **`.env`** and copy-paste the following template:

```env
# Django Configuration
DJANGO_SECRET_KEY="your_custom_django_secret_key"
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Database Configuration (PostgreSQL)
# For cloud databases (Neon/Supabase), ensure your connection string ends with ?sslmode=require
DATABASE_URL="postgresql://[username]:[password]@[host]:5432/[database_name]?sslmode=require"

# Authentication

# Razorpay Payment Gateway (Available in your Razorpay Dashboard)
RAZORPAY_KEY_ID="rzp_test_your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Cloudinary Image Hosting (Available in your free Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

---

### Step 2: Initialize the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment, then install Django dependencies:
   ```bash
   python -m venv .venv
   .venv\\Scripts\\activate  # Windows PowerShell
   pip install -r requirements.txt
   ```
3. Create and apply the Django migrations:
   ```bash
   python manage.py makemigrations api
   python manage.py migrate
   ```
4. Start the Django API development server:
   ```bash
   python manage.py runserver
   ```
   *The backend API server is now running on:* `http://localhost:8000`

---

### Step 3: Initialize the Frontend Client

1. Open a new terminal window/tab and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the frontend package dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend client is now running on:* `http://localhost:3000`

Now open `http://localhost:3000` in your web browser and start playing!

---

## 🔐 Default Seed Credentials

To explore all user role perspectives instantly without registering, log in with these pre-seeded accounts:

| Profile Role | Email Address | Password | Workspace Panel Access |
| :--- | :--- | :--- | :--- |
| **Cricket Player** | `user@example.com` | `password123` | Book slots, checkout cart, pay via Razorpay, print tickets. |
| **Venue Turf Owner** | `owner@example.com` | `password123` | Publish turf listings, configure slot rates, view earnings charts. |
| **System Admin** | `admin@example.com` | `password123` | Override bookings, toggle accounts roles, monitor platform metrics. |

---
