# 🚗 Om Sai Krupa – Vehicle Booking & Airport Transfer System

A complete, production-ready full-stack web application for vehicle booking and airport transfer management.

## 🌟 Features

### User Panel
- 🔐 Registration & Login with JWT authentication
- 🔍 Vehicle search by date, time, location, passengers
- 🚌 5 vehicle types: 5, 6, 14, 17, 20 seater
- 💺 **Flight-style visual seat selection** (the star feature!)
- 👤 Multi-passenger details form
- 📋 Booking review with price breakdown
- 💳 UPI QR Code payment (dynamic QR generation)
- 🔄 Manual payment verification workflow
- 📱 Partial payment support
- 📄 PDF booking receipt download
- 📅 My Bookings with status tracking
- 🔔 Real-time notifications

### Admin Panel
- 📊 Dashboard with live stats (bookings, revenue, users, vehicles)
- 📋 Complete booking management (create, edit, confirm, cancel)
- ✅ Payment verification (approve/reject)
- 🚗 Vehicle management (CRUD + status, assign driver)
- 👨‍✈️ Driver management
- 👥 User management (view, block/unblock)
- 📈 Reports (daily/weekly/monthly revenue, vehicle utilization)
- ⚙️ Settings (company info, UPI configuration)
- 🔔 Admin notifications

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| State | Zustand + React Router v7 |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcryptjs |
| PDF | jsPDF |
| QR Code | qrcode library |

## 🚀 Quick Start

### Option 1: Double-click START.bat
Simply double-click `START.bat` to launch both servers.

### Option 2: Manual Start

**Backend** (Terminal 1):
```bash
cd backend
npx tsx src/index.ts
```

**Frontend** (Terminal 2):
```bash
npm run dev
```

### Access URLs
| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| 🔌 Backend API | http://localhost:5000/api |
| ❤️ Health Check | http://localhost:5000/api/health |

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@omsaikrupa.com | Admin@123 |
| **User** | rahul@example.com | User@123 |
| **User 2** | priya@example.com | User@123 |

## 📁 Project Structure

```
omsaikrupa-web/
├── src/                        # React frontend
│   ├── components/
│   │   ├── Layout/             # Navbar, Footer, UserLayout, AdminLayout
│   │   ├── Logo.tsx            # Om Sai Krupa logo
│   │   ├── SeatSelector.tsx    # ⭐ Visual seat selection component
│   │   └── ProtectedRoute.tsx  # Auth guard
│   ├── pages/
│   │   ├── public/             # Home, Login, Register, Vehicles, About, Contact
│   │   ├── user/               # Dashboard, My Bookings, Booking Flow, Profile
│   │   └── admin/              # Admin Dashboard, Bookings, Vehicles, Payments, etc.
│   ├── services/
│   │   └── api.ts              # API service layer (all endpoints)
│   ├── store/
│   │   ├── authStore.ts        # Auth state (Zustand)
│   │   └── bookingStore.ts     # Booking flow state
│   └── utils/
│       ├── helpers.ts          # Date, currency, seat layout helpers
│       └── pdfReceipt.ts       # PDF receipt generator
├── backend/
│   └── src/
│       ├── database/
│       │   └── init.ts         # SQLite schema + demo data
│       ├── middleware/
│       │   ├── auth.ts         # JWT middleware
│       │   └── errorHandler.ts
│       └── routes/
│           ├── auth.ts         # Register, Login, Me
│           ├── bookings.ts     # Booking CRUD + seat validation
│           ├── vehicles.ts     # Vehicle search + seat availability
│           ├── drivers.ts      # Driver management
│           ├── payments.ts     # Payment submission + verification
│           ├── users.ts        # User management
│           ├── notifications.ts
│           ├── settings.ts     # Company + UPI settings
│           └── reports.ts      # Analytics & reports
├── START.bat                   # ⭐ One-click startup script
└── README.md
```

## 🎯 User Booking Flow

```
Home → Search Vehicles → Select Vehicle → Select Seats (visual) 
→ Passenger Details → Review Booking → UPI Payment → Confirmation
```

## 🔐 Security Features

- JWT token authentication
- bcrypt password hashing (salt rounds: 12)
- Role-based access control (USER / ADMIN)
- Protected API routes
- Input validation (frontend: Zod, backend: manual validation)
- No plain text passwords
- Environment variables for secrets

## 💳 Payment Flow

1. User selects seats & fills passenger details
2. Booking created with `PENDING` status
3. UPI QR Code displayed (dynamically generated)
4. User scans QR and pays
5. User enters UTR / Transaction ID
6. Payment submitted for verification
7. Admin verifies in Admin Panel → Payment
8. Booking automatically confirmed on full payment

## 🚌 Vehicle Seating Layouts

| Vehicle | Layout |
|---------|--------|
| 5-Seater | Sedan: Driver + 1 front + 2+2 rear |
| 6-Seater | SUV: Driver + 1 front + 2+2+1 rear |
| 14-Seater | Minivan: 2+2 minibus layout |
| 17-Seater | Tempo Traveller: 2+2 minibus layout |
| 20-Seater | Deluxe Coach: 2+2 minibus layout |

## 📊 Database

Uses SQLite for zero-configuration setup. The service architecture makes it easy to swap to PostgreSQL or MySQL later.

**Tables**: users, vehicles, drivers, bookings, booking_seats, passengers, payments, trips, notifications, settings

## 🌐 API Endpoints

```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login
GET  /api/auth/me          - Get current user

GET  /api/vehicles         - Search vehicles (with availability)
GET  /api/vehicles/:id/seats - Get seat availability for date

POST /api/bookings         - Create booking
GET  /api/bookings         - Get all bookings (user/admin)
PUT  /api/bookings/:id/status - Update booking status (admin)
PUT  /api/bookings/:id/cancel - Cancel booking

POST /api/payments         - Submit payment
PUT  /api/payments/:id/verify - Verify payment (admin)
PUT  /api/payments/:id/reject - Reject payment (admin)

GET  /api/reports/revenue  - Revenue reports
GET  /api/reports/bookings - Booking reports
GET  /api/settings         - Company settings
PUT  /api/settings         - Update settings (admin)
```

## ⚙️ Configuration

Edit `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_secret_key
DEFAULT_UPI_ID=yourupi@bank
DEFAULT_MERCHANT_NAME=Om Sai Krupa
CORS_ORIGIN=http://localhost:5173
```

Admin can update UPI settings from the **Admin Panel → Settings** page.

---

© 2026 Om Sai Krupa. All Rights Reserved.
