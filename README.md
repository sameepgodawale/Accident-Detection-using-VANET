# VANET Accident Detection & Emergency Response System

## Executive Summary
This project implements an **intelligent accident detection and emergency response system** using **Vehicular Ad-Hoc Networks (VANETs)**.  

- **On-Board Unit (OBU):** Installed in vehicles, it detects accidents using sensors (IMU, GPS, CAN data, fire sensors). It creates a compact event packet and broadcasts it wirelessly.  
- **Roadside Unit (RSU):** Fixed infrastructure nodes that receive these event packets from OBUs, validate them, enrich with signal metadata, and forward them to the central system.  
- **Central Management System (CMS):** A cloud-based platform that stores, processes, and analyzes the events. It applies machine learning for severity classification, provides a live dashboard, and dispatches alerts to emergency services.

Unlike cellular-based systems, **OBUs do not have cellular connectivity**. Instead, OBUs rely solely on **VANET multi-hop communication** to reach RSUs. This design prioritizes reliability, low latency, and resilience without requiring SIM cards or mobile subscriptions in every vehicle.

---

## Architectural Flow (OBU → RSU → CMS)

### System Overview
```text
[OBU] <-V2V Multi-hop-> [OBU] <-LoRa/V2V-> [OBU]
   \                                       /
    \-------------> [RSU Gateway] --------/
                     |  (HTTPS/MQTT)
                     v
                [Central CMS]
                     |
        (Dashboard / ML / Emergency Alerts)
```

### Event Lifecycle
1. **Detection (OBU):** Sensors detect crash/fire. Event generated with severity hint.  
2. **Propagation (OBU mesh):** Event broadcast across VANET (multi-hop, TTL-controlled).  
3. **Reception (RSU):** RSU validates packet, adds metadata.  
4. **Forwarding (RSU → CMS):** RSU securely forwards to CMS, stores locally if offline.  
5. **Processing (CMS):** Event stored, deduplicated, ML severity classification.  
6. **Alerting (CMS):** Nearest emergency services notified. Dashboard updated in real time.  

---

## Visual Architecture Diagram
![VANET Architecture Diagram](vanet_architecture_diagram.png)

---

## Sequence Flow Diagram

```text
+-----------+         +-----------+         +-----------+         +-----------+
|   Vehicle |         |   Nearby  |         |    RSU    |         |    CMS    |
|   (OBU)   |         |   OBU(s)  |         | Gateway   |         |           |
+-----------+         +-----------+         +-----------+         +-----------+
      |                     |                     |                     |
      |--Crash Detected---->|                     |                     |
      | Generate Event      |                     |                     |
      | Packet (LoRa+V2V)   |                     |                     |
      |-------------------->|                     |                     |
      | Broadcast Event     |                     |                     |
      |                     |--Relay (multi-hop)->|                     |
      |                     |                     | Decode + Validate   |
      |                     |                     |-------------------->|
      |                     |                     | Forward JSON to CMS |
      |                     |                     |                     |
      |                     |                     |<--------------------|
      |                     |                     | ACK (optional)      |
      |<--------------------|                     |                     |
      | Mark Event Delivered|                     |                     |
      |                     |                     |                     |
```

---

## Detailed Component Breakdown

### 1. On-Board Unit (OBU)
... (content shortened here for brevity in code, but will be full in file)
