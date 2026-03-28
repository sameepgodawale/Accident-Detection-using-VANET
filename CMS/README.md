# VANET CMS — Backend + Frontend

Central Management Server for the VANET Accident Detection System. This directory covers both the **Node.js API backend** (`CMS-backend/`) and the **React dashboard frontend** (`CMS-frontend/`) as a single deployable application.

---

## What the CMS Does

The CMS is the cloud hub of the VANET system. When an accident occurs:

1. The RSU (ESP32 roadside unit) posts an EAM packet to `POST /api/accidents`
2. The backend calls the ML service to classify severity (MINOR / MAJOR / CRITICAL)
3. It reverse-geocodes the GPS coordinates to a street address via Nominatim
4. It saves the full record to MongoDB
5. It finds the nearest hospital, police station, and fire station and sends alerts
6. It sends a Telegram notification
7. It broadcasts a `NEW_ACCIDENT` WebSocket event — the dashboard updates live

---

## Repository Structure

```
CMS-backend/
├── src/
│   ├── config/
│   │   └── db.js                    ← MongoDB connection
│   ├── middleware/
│   │   ├── auth.middleware.js        ← JWT verification
│   │   └── auth_middleware.js        ← API key verification (RSU)
│   ├── models/
│   │   ├── Accident.js              ← Accident schema (full EAM + ML results)
│   │   ├── EmergencyService.js      ← Hospital / police / fire with geo index
│   │   ├── RSU.js                   ← RSU device registry
│   │   └── User.js                  ← Admin user accounts
│   ├── routes/
│   │   ├── accident_routes.js       ← POST / GET / PATCH accidents
│   │   ├── alerts_routes.js         ← Alert management
│   │   ├── auth_routes.js           ← Login, register, /me
│   │   ├── admin_routes.js          ← User management (admin only)
│   │   ├── rsu_routes.js            ← RSU heartbeat + key rotation
│   │   ├── notifications_routes.js  ← Notification endpoints
│   │   └── extra_routes.js          ← Miscellaneous
│   ├── utils/
│   │   ├── findNearest.js           ← MongoDB $nearSphere + Haversine fallback
│   │   ├── sendAlert.js             ← Emergency service alert dispatcher
│   │   └── sendTelegramAlert.js     ← Telegram bot notification
│   └── server.js                    ← Express app, WebSocket server, entry point
├── .env.example
├── package.json
└── README.md  ← (this file)

CMS-frontend/
├── src/
│   ├── components/
│   │   ├── ActivityLog.tsx
│   │   ├── AlertTriagePanel.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── EmergencyMap.tsx
│   │   ├── EmergencyServicesPanel.tsx
│   │   ├── IncidentChat.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ui/                      ← shadcn/ui component library
│   ├── contexts/
│   │   └── AuthContext.tsx           ← JWT auth state, login/logout
│   ├── hooks/
│   │   └── useAlerts.ts             ← WebSocket + polling hook for live alerts
│   ├── lib/
│   │   ├── apiClient.ts             ← Axios instance with JWT interceptor
│   │   ├── adminApi.ts
│   │   ├── authApi.ts
│   │   ├── commsApi.ts
│   │   └── incidentApi.ts
│   ├── pages/
│   │   ├── Index.tsx                ← Main dashboard
│   │   ├── LiveMap.tsx              ← Real-time incident map
│   │   ├── IncidentLogs.tsx         ← Searchable incident history
│   │   ├── Communications.tsx       ← Comms panel
│   │   ├── UserManagement.tsx       ← Admin: create/manage users
│   │   ├── AuditLogs.tsx            ← Admin: audit trail
│   │   └── Login.tsx
│   ├── types/                        ← TypeScript interfaces
│   └── App.tsx                       ← Router + layout
├── .env.example
├── package.json
└── vite.config.ts
```

---

## Tech Stack

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| Backend      | Node.js 18+, Express 4                         |
| Database     | MongoDB Atlas (Mongoose ODM)                   |
| Auth         | JWT (dashboard users) + API key (RSU devices)  |
| Real-time    | WebSocket (`ws` library)                       |
| Geocoding    | Nominatim (OpenStreetMap) — no API key needed  |
| Notifications| Telegram Bot API                               |
| Frontend     | React 18, TypeScript, Vite                     |
| UI           | Tailwind CSS, shadcn/ui, Lucide icons          |
| State        | TanStack Query (server state), React Context   |

---

## Prerequisites

- Node.js 18+ (or Bun for the frontend)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- (Optional) A Telegram bot token for alert notifications
- The ML service running — see `ml/README.md`

---

## Backend Setup

### 1. Install dependencies

```bash
cd CMS-backend
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=<random 64-character string>
RSU_API_KEY=<random hex string — must also be set in RSU firmware>
ML_SERVICE_URL=http://localhost:8000
TELEGRAM_BOT_TOKEN=<your bot token>
TELEGRAM_CHAT_ID=<your chat or group ID>
```

**JWT_SECRET** — generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**RSU_API_KEY** — generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
This key must match the `RSU_API_KEY` value flashed into the RSU firmware.

### 3. MongoDB Atlas setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Under **Network Access**, allow `0.0.0.0/0` (or restrict to your server IP)
4. Copy the connection URI into `MONGO_URI`

For the geo query on `EmergencyService` to work efficiently, create a 2dsphere index on the `location` field. The service falls back to an in-memory Haversine sort if the index is absent, so this is optional but recommended:

```javascript
// Run once in MongoDB shell or Atlas UI
db.emergencyservices.createIndex({ location: "2dsphere" })
```

### 4. Start the backend

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Expected output:

```
MongoDB Connected
✅ Default admin created (admin / admin123)
[CMS] Server running on port 5000
[CMS] WebSocket ready
```

> **Important:** Change the default admin password immediately after first login.

---

## Frontend Setup

### 1. Install dependencies

```bash
cd CMS-frontend
npm install
# or: bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

```
VITE_API_URL=http://localhost:5000
```

Point `VITE_API_URL` at your deployed backend URL when deploying to production.

### 3. Start the frontend

```bash
npm run dev
# Dashboard: http://localhost:5173
```

### 4. Build for production

```bash
npm run build
# Output in dist/
```

---

## Running Both Together

For local development, run each in a separate terminal:

```bash
# Terminal 1 — backend
cd CMS-backend && npm run dev

# Terminal 2 — frontend
cd CMS-frontend && npm run dev
```

The frontend dev server proxies API requests to `localhost:5000` via the `VITE_API_URL` env var. No additional proxy config is needed.

---

## API Reference

### Authentication

| Method | Path                | Auth   | Description                         |
|--------|---------------------|--------|-------------------------------------|
| POST   | `/api/auth/login`   | None   | Returns JWT token                   |
| POST   | `/api/auth/register`| None   | Create a new user account           |
| GET    | `/api/auth/me`      | JWT    | Returns current user details        |

**Login request:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Login response:**
```json
{
  "token": "eyJ...",
  "user": { "id": "...", "username": "admin", "role": "admin" }
}
```

---

### Accidents

| Method | Path                          | Auth      | Description                                      |
|--------|-------------------------------|-----------|--------------------------------------------------|
| POST   | `/api/accidents`              | API key   | Receive EAM from RSU, trigger ML + alerts        |
| GET    | `/api/accidents`              | JWT       | List accidents (filterable by status, search)    |
| PATCH  | `/api/accidents/:id/resolve`  | JWT       | Mark an accident as resolved                     |

**POST `/api/accidents` — RSU sends this (x-api-key header):**
```json
{
  "rsuId":  "RSU-001",
  "lat":    19.0760,
  "lon":    72.8777,
  "acc":    18.5,
  "gyro":   320.1,
  "a6050":  17.2,
  "a9250":  19.1,
  "cons":   1.9,
  "idur":   850,
  "vib":    1,
  "temp":   34.2,
  "abag":   1,
  "wdrop":  72.5,
  "spd":    65.0,
  "hh":     14,
  "mm":     32,
  "ss":     11
}
```

**Response:**
```json
{
  "message": "Accident processed successfully",
  "id": "66a1b2c3d4e5f6a7b8c9d0e1",
  "severity": "CRITICAL",
  "address": "Western Express Highway, Mumbai, Maharashtra",
  "notified": 3
}
```

**GET `/api/accidents` — query params:**

| Param    | Type   | Description                                  |
|----------|--------|----------------------------------------------|
| `status` | string | Filter by `open`, `dispatched`, `resolved`, etc. |
| `search` | string | Search by vehicleId, severity, or address    |
| `limit`  | number | Max records to return (default: 50)          |
| `offset` | number | Pagination offset (default: 0)               |

---

### RSU Management

| Method | Path                    | Auth    | Description                     |
|--------|-------------------------|---------|---------------------------------|
| POST   | `/api/rsu/heartbeat`    | API key | RSU health ping (every 60s)     |
| GET    | `/api/rsu/key`          | API key | OTA key rotation check (every 5 min) |

---

### Admin

| Method | Path                        | Auth       | Description                  |
|--------|-----------------------------|------------|------------------------------|
| GET    | `/api/admin/users`          | JWT admin  | List all users               |
| POST   | `/api/admin/users`          | JWT admin  | Create a user                |
| DELETE | `/api/admin/users/:id`      | JWT admin  | Delete a user                |

---

### WebSocket

Connect to `ws://<host>:5000` after the server starts. The server broadcasts the following events:

```json
{
  "type": "NEW_ACCIDENT",
  "data": { ...full accident object... }
}
```

The frontend `useAlerts` hook subscribes to this and updates the dashboard in real time.

---

## Accident Data Model

```
Accident {
  rsuId:       String          — which RSU forwarded this
  vehicleId:   String          — from EAM or "UNKNOWN"
  severity:    String          — MINOR / MAJOR / CRITICAL (from ML)
  confidence:  Number          — ML model confidence score (0–1)
  latitude:    Number
  longitude:   Number
  address:     String          — reverse-geocoded street address
  eam: {
    acc, gyro, a6050, a9250,   — raw IMU values
    cons, idur, vib, temp,     — consistency, impact duration, vibration, temperature
    abag, wdrop, spd,          — airbag, wheel drop, speed
    hh, mm, ss                 — timestamp
  }
  features:    Object          — ML input features (stored for audit)
  status:      Enum            — open | dispatched | acknowledged | resolved
  description: String          — optional operator note
  timestamp:   Date            — server receive time
  resolvedAt:  Date
}
```

---

## Dashboard Pages

| Route                 | Page              | Description                                           |
|-----------------------|-------------------|-------------------------------------------------------|
| `/`                   | Dashboard         | Summary stats, live alert triage, activity feed       |
| `/live-map`           | Live map          | Real-time incident locations on an interactive map    |
| `/incident-logs`      | Incident logs     | Searchable, filterable history of all accidents       |
| `/communications`     | Communications    | Comms panel for operator coordination                 |
| `/admin/users`        | User management   | Create and manage operator accounts (admin only)      |
| `/admin/audit-logs`   | Audit logs        | Full audit trail of system events (admin only)        |
| `/login`              | Login             | JWT-based login                                       |

All routes except `/login` require a valid JWT. Admin routes additionally require `role: "admin"`.

---

## Deployment

### Backend — Render / Railway

1. Push `CMS-backend/` to a GitHub repository
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the start command to `node src/server.js`
4. Add environment variables in the Render dashboard (do not commit `.env`)
5. Copy the deployed URL — you will need it for the frontend and RSU firmware

### Frontend — Vercel / Netlify

1. Push `CMS-frontend/` to a GitHub repository
2. Import in [Vercel](https://vercel.com)
3. Set the environment variable `VITE_API_URL` to your deployed backend URL
4. Deploy — Vercel detects Vite automatically

### CORS

The backend currently has `app.use(cors())` which allows all origins. Before production deployment, restrict this to your frontend domain:

```javascript
app.use(cors({ origin: "https://your-frontend.vercel.app" }));
```

---

## Default Admin Account

On first boot the backend creates a default admin account:

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

**Change this password immediately** via User Management in the dashboard or by updating the record directly in MongoDB.

---

## Security Checklist

Before going to production:

- [ ] Rotate all secrets — generate new `JWT_SECRET` and `RSU_API_KEY`
- [ ] Change the default admin password
- [ ] Restrict CORS to your frontend domain
- [ ] Add JWT middleware to `GET /api/accidents`
- [ ] Remove the fallback admin response from `GET /api/auth/me`
- [ ] Set MongoDB network access to your server IP only (not `0.0.0.0/0`)
- [ ] Place the ML service behind the CMS — do not expose it publicly

---

## License

Developed for academic and research purposes as a Final Year Engineering Project.
