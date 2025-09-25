# Architecture Overview

Nodes:
- OBU: On-Board Unit firmware (sensor sampling, event detection, persistent store, transmit scheduler, VANET relay behavior). Simulated C code provided for development.
- RSU: Road-Side Unit / Gateway (Python emulator in this package) decodes LoRa-like packets and forwards to CMS.
- CMS: Central Monitoring System (PHP ingest, MySQL storage, SSE-based realtime feed, dashboard using Google Maps).
- ML: Pipeline stubs and training placeholders.

All interfaces, packet formats, and retry/backoff behavior are documented in docs/OBU-FIRMWARE-SPEC.md
