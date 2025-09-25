# RSU Product Overview

Purpose: collect VANET messages from OBUs (LoRa), enrich, and forward to central CMS reliably. Optionally provide cellular fallback via SIM800L if wired backhaul is unavailable.

Design goals:
- Reliable ingestion with on-device persistence
- Low-latency forwarding to CMS
- Simple maintenance and secure key provisioning

Key roles:
- ESP32: lightweight packet capture and pre-processing (optional)
- Python Gateway (on SBC): main decoder, queue, forwarder, and monitoring

Security:
- API key for CMS ingest
- Device identity (RSU_ID) and optional HMAC verification at RSU for OBU packets

