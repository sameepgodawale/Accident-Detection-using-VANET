# VANET Accident Detection CMS Backend

Backend service for the **Vehicular Ad Hoc Network (VANET) Accident Detection System**.
This backend acts as the **Central Management Server (CMS)** responsible for receiving accident reports from Road Side Units (RSUs), storing them in a database, and providing APIs for the administrative dashboard.

The system enables **real-time accident reporting, monitoring, and management** for intelligent transportation systems.

---

# Project Overview

This backend is designed to support an **IoT-based accident detection architecture** using VANET communication.

Vehicles equipped with **On-Board Units (OBU)** communicate with **Road Side Units (RSU)** which detect potential accidents.
The RSU sends accident data to this CMS backend where it is processed, stored, and made available to the dashboard.

The backend provides:

* Secure REST APIs
* Accident data storage
* RSU monitoring
* Admin authentication
* Dashboard data services

---

# System Architecture

Vehicle OBU
↓
Road Side Unit (RSU – ESP32)
↓
CMS Backend (Node.js + Express)
↓
MongoDB Atlas (Cloud Database)
↓
Web Dashboard (Admin Panel)

---

# Technology Stack

Backend Framework
Node.js with Express.js

Database
MongoDB Atlas (Cloud NoSQL Database)

Authentication
JWT (JSON Web Tokens)

Password Security
bcrypt.js

Environment Configuration
dotenv

Cross-Origin Requests
cors

ODM (Database Modeling)
mongoose

Development Tool
nodemon

Deployment
Vercel / Render (optional)

---

# Project Structure

```
cms-backend
│
├── src
│   ├── config
│   │   └── db.js
│   │
│   ├── models
│   │   ├── User.js
│   │   ├── RSU.js
│   │   └── Accident.js
│   │
│   ├── routes
│   │   ├── auth.routes.js
│   │   ├── accident.routes.js
│   │   └── rsu.routes.js
│   │
│   ├── middleware
│   │   └── auth.middleware.js
│   │
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

# Features

Accident Data Collection
Stores accident reports sent from RSUs.

RSU Management
Tracks RSU devices and their status.

Admin Authentication
Secure login system using JWT.

RESTful API
Clean API endpoints for dashboard integration.

Scalable Database
MongoDB Atlas cloud storage.

IoT Integration
Compatible with ESP32-based RSUs.

---

# Installation Guide

## 1. Clone the Repository

```
git clone https://github.com/yourusername/vanet-cms-backend.git
cd vanet-cms-backend
```

---

## 2. Install Dependencies

```
npm install
```

---

## 3. Setup MongoDB Atlas

1. Create an account at
   [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)

2. Create a **Free Cluster**

3. Create a **Database User**

Example:

Username

```
cmsadmin
```

Password

```
cms12345
```

4. Add Network Access

Allow access from anywhere

```
0.0.0.0/0
```

5. Copy the **MongoDB Connection URI**

Example:

```
mongodb+srv://cmsadmin:password@cluster.mongodb.net/vanetcms
```

---

## 4. Configure Environment Variables

Create a `.env` file in the project root.

```
PORT=5000
MONGO_URI=mongodb+srv://cmsadmin:password@cluster.mongodb.net/vanetcms
JWT_SECRET=vanet_super_secret_key
```

---

## 5. Run the Backend Server

Development mode

```
npm run dev
```

or

```
node src/server.js
```

If successful, you will see:

```
MongoDB Connected Successfully
Server running on port 5000
```

---

# API Endpoints

## Authentication

Login

POST `/api/auth/login`

Example Request

```
{
  "username": "admin",
  "password": "admin123"
}
```

---

## Accident Management

Create Accident Record

POST `/api/accidents`

Example Request

```
{
  "rsuId": "RSU_01",
  "vehicleId": "CAR_12",
  "severity": "HIGH",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

---

Get All Accident Reports

GET `/api/accidents`

---

## RSU Management

Register RSU

POST `/api/rsu`

Get All RSUs

GET `/api/rsu`

---

# Example Accident Record

```
{
  "rsuId": "RSU_01",
  "vehicleId": "CAR_12",
  "severity": "HIGH",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "timestamp": "2026-02-04T10:20:00Z"
}
```

---

# Database Collections

users
Stores CMS admin accounts.

rsu
Stores Road Side Unit devices.

accidents
Stores accident reports received from RSUs.

vehicles
Stores registered vehicle OBUs.

alerts
Stores emergency alerts and notifications.

---

# Deployment (Optional)

The backend can be deployed on:

* Vercel
* Render
* Railway
* AWS

Example deployment command (Vercel):

```
vercel
```

---

# Testing APIs

You can test the APIs using:

Postman
Insomnia
REST Client (VS Code)

Example test URL:

```
http://localhost:5000/api/accidents
```

---

# Future Improvements

Real-time accident alerts using WebSockets
Vehicle tracking support
RSU health monitoring
Integration with emergency services
Live map dashboard visualization

---

# License

This project is developed for **academic and research purposes** as part of a **Final Year Engineering Project**.

---
