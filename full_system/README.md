
Storage: Persists raw and calculated data.

MongoDB (Mongoose)

Web Dashboard

web_cms/src/services/api.ts

Retrieval: Fetches active alerts (GET /api/v1/incidents?status=pending,acknowledged) every 5-10 seconds.

React / @tanstack/react-query



web_cms/src/components/GoogleMapComponent.tsx

Visualization: Displays real-time location and status for emergency dispatch.

Google Maps API

3. Technology Stack Summary
Low-Level / Device: C/C++ (STM32, ESP32), LoRa, CAN Bus.

V2X Communication: LoRa (for long-range V2I/V2V).

V2I Uplink: GSM/GPRS (via SIM800L for reliable, ubiquitous internet access).

Server / Backend: Node.js (Express.js) for higVANET Accident Detection System: Communication and Architecture

This project implements a complete, full-stack Intelligent Transportation System (ITS) focused on high-speed, reliable accident detection using a Vehicular Ad-Hoc Network (VANET) and an integrated Central Monitoring System (CMS).

The architecture is divided into three layers: Device (V2X Network), Gateway (V2I Uplink), and Monitoring (CMS Backend + Web).

1. Core Communication Protocols
The system relies on two primary message types transmitted over the localized LoRa V2X network:

A. Cooperative Awareness Message (CAM) - Beacon
Source: OBU (src/device_code/main.c)

Purpose: Periodic safety and presence broadcast (every 1 second) to nearby OBUs and RSUs. Used primarily for local collision avoidance and network health monitoring.

Payload (beacon_payload_t): device_id, lat, lon, speed, system_status.

B. Emergency Alert Message (EAM) - Crash Report
Source: OBU (src/device_code/main.c)

Trigger: Instantaneous detection of critical sensor readings (e.g., G-force > 15G, Airbag Deployment).

Payload (event_payload_t): Raw, comprehensive sensor data including acc_delta, airbag_deployed, wheel_speed_drop_pct, and exact location.

2. System Data Flow Pipeline
The flow guarantees message delivery from the vehicle to the human operator:

Layer 1: Device Network (OBU & V2X)
Component

Files

Action

Technology

OBU (VANET-Detect 1000)

src/device_code/

Detection: Reads MPU/CAN data (event_payload_t).

STM32F411, MPU-6050, CAN Bus



src/device_code/json_builder.h

Encoding: Converts C struct to EAM JSON payload.

C/C++ Utility



src/device_code/vanet_comm.h

Broadcast: Transmits EAM via LoRa V2X channel.

LoRa (SX1278)

Layer 2: Gateway and Uplink (RSU)
Component

Files

Action

Technology

RSU (VANET-Link 5000)

src/device_code/rsu_firmware/rsu_main.ino

Receive: Aggregates EAMs from nearby OBUs via LoRa.

ESP32, LoRa (SX1278)



data_logger.h

Redundancy: Logs EAM data locally (Store-and-Forward).

SD Card Module



rsu_main.ino

Uplink: Sends buffered logs via HTTP POST to the CMS API.

SIM800L (GSM/GPRS)

Layer 3: Central Monitoring System (CMS)
Component

Files

Action

Technology

CMS API Backend

src/server_code/routes/accidentRoutes.js

Processing: Receives OBU JSON payload (POST /api/v1/incidents/report).

Node.js / Express.js



models/Incident.js

Triage: Executes logic to calculate severity and confidenceScore.

Node.js Logic



models/Incident.jsh-performance API handling.

Database: MongoDB for flexible, scalable storage of incident logs.

Frontend / Dashboard: React (TypeScript) using @tanstack/react-query for real-time, high-rate data synchronization and Google Maps for visual dispatch coordination.
