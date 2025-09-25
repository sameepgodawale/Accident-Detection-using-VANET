# OBU Firmware Specification (Persistent Store, Transmit Engine, Relay)

This document describes the firmware-level interfaces and data models for the OBU. It includes metadata record layout, retry/backoff policy, relay/dedupe logic, and safety rules. Use this as the authoritative firmware design.

Key points:
- No cellular fallback: OBU will rely on VANET and RSUs only.
- Persistent metadata stored in FRAM (simulated by files in host mode) and large payloads on microSD (simulated in data/payloads/).
- Event packet format, HMAC signing, ACK processing, exponential backoff parameters.

(Full spec included in project deliverables.)
