# VANET Accident Detection System

A complete end-to-end **Vehicular Ad-hoc Network (VANET)** accident detection and emergency response platform, built as a Final Year Engineering Project.

A vehicle involved in an accident is detected by an embedded on-board unit, which transmits sensor data wirelessly to a roadside unit. The roadside unit forwards the data to a cloud backend, which classifies severity using a machine learning model, reverse-geocodes the location, alerts the nearest emergency services, and pushes the event live to a web dashboard — all within seconds.

VANET deck :- https://canva.link/tvrwzqetznpve7a

---

## Repository Structure

```
vanet/
├── OBU/                    ← Vehicle firmware (STM32F411 Black Pill, C++)
├── RSU/                    ← Roadside unit firmware (ESP32, C++)
├── CMS-backend/            ← Cloud API server (Node.js + Express + MongoDB)
├── CMS-frontend/           ← Web dashboard (React + TypeScript + Vite)
└── ml/                     ← Severity classifier microservice (Python + FastAPI)
```

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Vehicle (OBU)                               │
│  STM32F411 · MPU6050/9250 · GPS · CAN bus · DS18B20 · LoRa TX      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  LoRa 433 MHz (EAM packet)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Roadside Unit (RSU)                           │
│  ESP32 · LoRa SX1278 RX · SIM800L GSM · WiFi fallback · SD queue   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTPS POST (GSM primary / WiFi fallback)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CMS Backend                                  │
│  Node.js · Express · MongoDB Atlas · WebSocket · JWT auth           │
│                               │                                     │
│                ┌──────────────┼──────────────┐                      │
│                ▼              ▼               ▼                      │
│          ML Service    Nominatim geo    Emergency alert              │
│          (severity)    (address)        + Telegram                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  WebSocket (live push)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       CMS Frontend                                  │
│  React · TypeScript · Tailwind · shadcn/ui · Live map · Incidents   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components

### OBU — On-Board Unit
**Platform:** STM32F411CEU6 (Black Pill)  
**Language:** C++ (Arduino / STM32duino)

Embedded firmware that runs inside a vehicle. Reads two IMUs (MPU6050 + MPU9250) on separate I2C buses, applies individual Kalman filters, fuses the readings, and detects accidents based on acceleration, gyroscope, and CAN bus airbag signals. On detection it persists the event to an SD card and transmits an Emergency Alert Message (EAM) over LoRa at 433 MHz to the nearest RSU. Unsent records are retried every 30 seconds.

**Sensors:** MPU6050 (primary accel), MPU9250 (secondary accel + gyro), NEO-6M GPS, DS3231 RTC, DS18B20 temperature, SW-420 vibration, MCP2515 CAN (airbag + wheel speed)

---

### RSU — Roadside Unit
**Platform:** ESP32 Dev Board  
**Language:** C++ (Arduino / PlatformIO)

Edge relay node mounted at the roadside. Listens for OBU LoRa packets (SF7, 125 kHz, sync word 0x34), injects its own `rsuId`, writes to an SD queue, then forwards to the CMS backend via SIM800L GSM (primary) or WiFi (fallback). Sends a heartbeat to the CMS every 60 seconds and rotates its API key every 5 minutes.

---

### CMS Backend
**Platform:** Node.js + Express  
**Database:** MongoDB Atlas

Cloud API server. Receives EAM packets from RSUs, calls the ML service for severity classification, reverse-geocodes the GPS coordinates via Nominatim, saves the full record to MongoDB, broadcasts live updates to dashboard clients via WebSocket, and alerts the nearest hospital/police/fire station via geo query.

See [`CMS-backend/README.md`](./CMS-backend/README.md) for full setup and API reference.

---

### CMS Frontend
**Platform:** React 18 + TypeScript + Vite  
**UI:** Tailwind CSS + shadcn/ui

Admin dashboard for operators. Features a live incident map, real-time alert triage panel, incident log with filtering, communications panel, user management, and audit logs. Connects to the backend via JWT-authenticated REST and a WebSocket for live updates.

See [`CMS-frontend/README.md`](./CMS-frontend/README.md) — or read the combined CMS guide at [`CMS-backend/README.md`](./CMS-backend/README.md).

---

### ML Service
**Platform:** Python + FastAPI  
**Model:** Random Forest Classifier (scikit-learn)

Microservice that classifies each accident as **MINOR**, **MAJOR**, or **CRITICAL** based on 10 sensor features from the OBU EAM. Trained with GridSearchCV (5-fold CV) on a 5,000-record synthetic dataset calibrated to Indian road conditions. F1-macro score of 0.903 on the held-out test set. Deployed on Render.

---

## Data Flow — Step by Step

1. OBU detects a crash event (fused acceleration > 12 m/s² **or** gyro > 250°/s **or** CAN airbag signal)
2. OBU builds an EAM JSON packet with GPS, IMU, CAN, temperature, and timestamp fields
3. OBU writes EAM to SD card, then transmits over LoRa 433 MHz
4. RSU receives the LoRa packet, injects `rsuId`, writes to its SD queue
5. RSU posts the packet to `POST /api/accidents` on the CMS backend (API-key auth)
6. CMS calls the ML service (`POST /predict`) → receives `severity` + `confidence`
7. CMS calls Nominatim reverse geocode → receives street address
8. CMS saves the full accident record to MongoDB
9. CMS broadcasts a `NEW_ACCIDENT` WebSocket event to all connected dashboard clients
10. CMS finds the nearest hospital, police, and fire station (MongoDB `$nearSphere`, 50 km radius) and sends alerts
11. CMS sends a Telegram notification
12. Dashboard receives the WebSocket event and updates live

If GSM/WiFi is unavailable at step 5, the record stays in the RSU SD queue and is retried every 10 seconds. If LoRa transmission fails at step 3, the record stays on the OBU SD and is retried every 30 seconds.

---

## EAM Packet Reference

The OBU transmits a single-line JSON string over LoRa. These are the field names as received by the RSU and forwarded to the CMS:

| Field  | Type    | Unit    | Description                                      |
|--------|---------|---------|--------------------------------------------------|
| `lat`  | float   | °       | GPS latitude                                     |
| `lon`  | float   | °       | GPS longitude                                    |
| `spd`  | float   | km/h    | Vehicle speed at impact                          |
| `acc`  | float   | m/s²    | Kalman-fused acceleration (0.7×MPU6050 + 0.3×MPU9250) |
| `gyro` | float   | deg/s   | Angular velocity from MPU9250                    |
| `a6050`| float   | m/s²    | MPU6050 filtered reading                         |
| `a9250`| float   | m/s²    | MPU9250 filtered reading                         |
| `cons` | float   | m/s²    | IMU consistency score (\|MPU6050 − MPU9250\|)    |
| `idur` | float   | ms      | Impact duration above threshold                  |
| `vib`  | int     | 0/1     | Vibration sensor (SW-420)                        |
| `temp` | float   | °C      | Ambient temperature (DS18B20)                    |
| `abag` | int     | 0/1     | Airbag deployed (CAN bus)                        |
| `wdrop`| float   | %       | Wheel speed drop percentage (CAN bus)            |
| `hh`   | int     | —       | Hour (GPS primary, RTC fallback)                 |
| `mm`   | int     | —       | Minute                                           |
| `ss`   | int     | —       | Second                                           |

The RSU appends `rsuId` (string) before forwarding to the CMS.

---

## LoRa Radio Settings

Both OBU and RSU must have identical radio parameters or they will not communicate.

| Parameter        | Value     |
|------------------|-----------|
| Frequency        | 433 MHz   |
| Spreading Factor | SF7       |
| Bandwidth        | 125 kHz   |
| Coding Rate      | 4/5       |
| Sync Word        | `0x34`    |
| TX Power         | 17 dBm    |

Sync word `0x34` creates a private VANET channel that filters out unrelated public LoRa traffic.

---

## Severity Classification

The ML service classifies each event into one of three classes:

| Severity     | Typical conditions                                                          |
|--------------|-----------------------------------------------------------------------------|
| **CRITICAL** | Airbag deployed, or acceleration > 25 m/s², or high gyro + large wheel drop |
| **MAJOR**    | Acceleration > 12 m/s², or moderate gyro + wheel drop, or accel + vibration  |
| **MINOR**    | Event below MAJOR thresholds                                                 |

---

## Quick Start

### Prerequisites

| Component     | Requirement                                   |
|---------------|-----------------------------------------------|
| OBU / RSU     | Arduino IDE 2.x or PlatformIO                 |
| CMS Backend   | Node.js 18+, a MongoDB Atlas account          |
| CMS Frontend  | Node.js 18+ or Bun                            |
| ML Service    | Python 3.10+                                  |

### 1 — ML Service

```bash
cd ml
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
# Swagger UI: http://localhost:8000/docs
```

### 2 — CMS Backend

```bash
cd CMS-backend
npm install
cp .env.example .env      # fill in your values
npm run dev
# API: http://localhost:5000
```

### 3 — CMS Frontend

```bash
cd CMS-frontend
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev
# Dashboard: http://localhost:5173
```

### 4 — RSU Firmware

Edit `RSU/src/rsu_config.cpp` with your WiFi credentials, APN, RSU ID, and CMS URL, then:

```bash
cd RSU
pio run -t upload
pio device monitor
```

### 5 — OBU Firmware

Open `OBU/` in Arduino IDE. Verify `include/config.h` matches your hardware pin assignments, then flash to the STM32F411 via DFU.

---

## Environment Variables

### CMS Backend (`.env`)

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
JWT_SECRET=<random 64-char string>
RSU_API_KEY=<random hex string — must match RSU firmware>
ML_SERVICE_URL=http://localhost:8000
TELEGRAM_BOT_TOKEN=<optional>
TELEGRAM_CHAT_ID=<optional>
```

### CMS Frontend (`.env`)

```
VITE_API_URL=http://localhost:5000
```

> **Security:** Never commit a `.env` file with real credentials. Use `.env.example` as the template checked into the repository.

---

## Deployment

| Component    | Recommended platform | Notes                                    |
|--------------|----------------------|------------------------------------------|
| CMS Backend  | Render / Railway     | Set env vars in dashboard                |
| CMS Frontend | Vercel / Netlify     | Set `VITE_API_URL` to deployed backend   |
| ML Service   | Render               | Free tier; add `/health` ping to avoid cold starts |
| RSU          | Physical hardware    | Configure CMS URL in `rsu_config.cpp`    |
| OBU          | Physical hardware    | Flash via STM32 DFU                      |

---

## Security Notes

- `GET /api/accidents` should be protected with JWT middleware before production deployment.
- The default admin account (`admin` / `admin123`) is created automatically on first boot — change the password immediately.
- The `/api/auth/me` fallback response should be removed in production.
- LoRa packets are not signed. For production deployments, add HMAC verification to the EAM payload using the RSU API key.
- The ML service has no authentication. Restrict access by placing it behind the CMS backend and not exposing it publicly.

---

## License

Developed for academic and research purposes as a Final Year Engineering Project.
