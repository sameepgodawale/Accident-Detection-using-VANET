# Setup Guide (Local Development & Demo)

This guide runs a local demo environment using Docker for the CMS, and Python RSU/Simulator to push sample events.

Prerequisites
- Docker & Docker Compose
- Python 3.9+
- Git
- A Google Maps API key (optional) for the dashboard map view

Quick start (demo):
1. Unzip the package and `cd vanet-system/cms/infra`.
2. Copy `../backend/config/config.example.php` to `../backend/config/config.php` and edit DB credentials if needed.
3. Start CMS Docker stack:
   ```bash
   docker-compose up -d
   ```
4. Initialize the DB (optional):
   ```bash
   docker exec -it vanet_cms_db_1 bash
   mysql -u root -ppassword -e "source /var/www/html/migrations/001_init.sql" 
   ```
5. Start RSU emulator:
   ```bash
   cd vanet-system/rsu-gateway
   python3 rsu_emulator.py --target http://localhost:8080/backend/public/ingest.php
   ```
6. Start OBU simulator to send events:
   ```bash
   cd vanet-system/simulations
   python3 obu_simulator.py --rsu-host 127.0.0.1 --rsu-port 17000
   ```
7. Open dashboard at `http://localhost:8080/frontend/public/index.html` (set Google Maps API key in that file if required).

Notes:
- The OBU firmware inside `obu-firmware/` is a host-mode simulation to help firmware developers iterate before cross-compiling for STM32.
- The RSU emulator listens for UDP "LoRa-like" JSON packets and forwards them to the CMS ingest API.
