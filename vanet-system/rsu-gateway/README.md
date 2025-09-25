# RSU Gateway Emulator

This RSU emulator listens for UDP JSON packets from OBU simulators, enriches each event with RSU metadata, and forwards to CMS ingest endpoint (HTTP POST). It is suitable for local testing and demo.

Usage:
    python3 rsu_emulator.py --bind 0.0.0.0 --port 17000 --target http://localhost:8080/backend/public/ingest.php

