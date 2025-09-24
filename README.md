# VANET-RSU Communication System

## Introduction
This project is a **final-year research and implementation prototype** for a Vehicular Ad Hoc Network (VANET) architecture that eliminates cellular dependency. It relies on **multi-hop V2V communication** and **RSU (Road Side Unit) gateways** to deliver vehicular alerts to a **Central Management System (CMS)**. The system supports robust local storage, retries, and authenticated message passing to ensure reliable, low-latency event delivery.

---

## Table of Contents
1. [System Architecture](#system-architecture)  
2. [Node Responsibilities](#node-responsibilities)  
3. [Packet & Payload Definitions](#packet--payload-definitions)  
4. [VANET Multi-Hop Rules](#vanet-multi-hop-rules)  
5. [Persistent Storage & Retry Policy](#persistent-storage--retry-policy)  
6. [RSU Behavior](#rsu-behavior)  
7. [CMS Processing](#cms-processing)  
8. [RSU Placement Guidelines](#rsu-placement-guidelines)  
9. [Latency & SLA](#latency--sla)  
10. [Testing Plan](#testing-plan)  
11. [Operational Considerations](#operational-considerations)  
12. [Configuration Parameters](#configuration-parameters)  
13. [Security](#security)  
14. [Next Steps](#next-steps)  

---

## System Architecture
- **OBU → VANET (V2V multi-hop / LoRa) → RSU → CMS** is the only communication path.  
- OBUs do **not** have cellular.  
- RSUs act as **bridges** between local mesh and CMS.  

**High-level flow:**

---

## Node Responsibilities
- **OBU (vehicle):**  
  - Sense and classify events locally.  
  - Store events durably until acknowledged.  
  - Broadcast compact alerts via VANET + LoRa.  
  - Relay other OBU packets with loop-avoidance.  
  - Retry transmissions until acknowledged or TTL expires.  

- **RSU (gateway):**  
  - Listen on VANET/LoRa, validate, enrich, and forward to CMS.  
  - Maintain a local queue during backhaul outages.  
  - Optionally send ACKs back into VANET.  

- **CMS:**  
  - Ingest events, deduplicate, and apply ML/rule-based processing.  
  - Store pre/post traces in cloud storage.  
  - Provide real-time dashboards and device management.  

---

## Packet & Payload Definitions
- **Compact OBU → RSU packet (~29 bytes):**  
  Includes device ID, event hash, type, timestamp, GPS coords, speed, severity, TTL, HMAC, CRC.  

- **RSU → CMS JSON (rich):**  
  Expands with metadata like RSSI, SNR, RSU ID, and reconstructs full event UUID.

---

## VANET Multi-Hop Rules
- Default TTL: **6 hops (urban)**, **8–10 (rural)**.  
- Relay jitter: **20–200 ms** to avoid broadcast storms.  
- Deduplication: **LRU cache (1024 entries, 300s lifetime)**.  
- Each OBU rebroadcasts **at most once per event**.  

---

## Persistent Storage & Retry Policy
- **Storage tiers:**  
  - Circular prebuffer (IMU samples).  
  - Event file (full trace).  
  - Transmission queue (pending metadata).  

- **Retry logic:**  
  - Initial broadcast → wait 10s for ACK.  
  - Exponential backoff: 10s → 20s → 40s → … → 160s.  
  - Max 6 attempts, then background retries every 10 minutes.  
  - Retain events up to **24 hours** (configurable).  

---

## RSU Behavior
- Validates packets (CRC + HMAC).  
- Deduplicates locally.  
- Forwards enriched JSON to CMS.  
- Persists queue in SQLite/LMDB during outages.  
- Supports redundancy: multiple RSUs reporting same event increases confidence.  

---

## CMS Processing
- Deduplication via `event_uuid` or `(device_id, timestamp, hash)`.  
- Confidence scoring based on RSU count + RSSI.  
- Escalates alerts only if confidence threshold met or severity = critical.  

---

## RSU Placement Guidelines
- **Urban:** 1–2 km spacing, overlapping coverage.  
- **Suburban:** 2–5 km.  
- **Highways:** 5–10 km (LoS achievable).  
- Place RSUs at choke points, intersections, elevated positions.  

---

## Latency & SLA
- **Direct OBU → RSU:** 0.5–2 s.  
- **Multi-hop:** ~0.2–0.5 s per hop.  
- **RSU → CMS:** 0.1–1 s.  
- **CMS Processing:** 0.5–3 s.  
- **Target end-to-end latency:** <10 s in dense networks.  

---

## Testing Plan
1. **Bench tests:** OBU emulator + RSU emulator.  
2. **Static field tests:** Measure coverage & loss.  
3. **Mobile density tests:** 10–20 vehicles in real routes.  
4. **Pilot:** 20–50 vehicles + 3–5 RSUs in live region.  

**Acceptance criteria:**  
- ≥95% packet delivery for critical events.  
- <10s latency for 90% of critical events.  
- RSU queue survives 24h backhaul outage.  

---

## Operational Considerations
- **Monitoring:** RSU heartbeats, OBU health beacons.  
- **Updates:** OTA via RSUs (firmware signed by CMS).  
- **Blackouts:** OBUs store events until relayed.  

---

## Configuration Parameters (Defaults)
| Parameter                  | Value     | Notes |
|-----------------------------|-----------|-------|
| Hop TTL                    | 6         | Urban; more in rural |
| Max retransmit attempts    | 6         | Before background retries |
| ACK timeout                | 10 s      | Wait for RSU ACK |
| Jitter window              | 20–200 ms | Prevent storms |
| Dedup cache size           | 1024      | Entries per node |
| Dedup entry lifetime       | 300 s     | Prevent loops |
| Event TTL                  | 24 h      | Storage retention |
| RSU queue persistence      | SQLite/LMDB | Journaling for outages |

---

## Security
- **HMAC-SHA256 (truncated) for every packet.**  
- RSUs validate all packets and blacklist misbehaving OBUs.  
- Cross-RSU correlation helps prevent spoofed alerts.  

---

## Next Steps
The project offers several extension tracks:  
- **OBU firmware changes:** Implement retry, storage, and relay logic.  
- **RSU software module:** Python decoder, validator, forwarder with queueing.  
- **RSU placement simulation:** Heatmap planning for deployment.  
- **Test scripts:** OBU & RSU emulators for reproducible pilots.  
