# RSU — Getting Started (Quickstart)

Prerequisites
- ESP32 dev board (WROOM-32) and toolchain (Arduino CLI, PlatformIO or ESP-IDF)
- LoRa SX1278 module (matching region frequency)
- SIM800L module (optional for cellular uplink)
- Raspberry Pi or PC for running Python gateway (if you prefer SBC over ESP32 forwarding)
- Python 3.9+, pip

Quick demo (no cellular):
1. Build & flash ESP32 firmware (firmware/README.md has build steps for Arduino CLI / PlatformIO).
2. On a laptop/VM, run `python3 software/rsu_gateway.py --listen-udp 17000 --cms http://localhost:8080/backend/public/ingest.php`.
3. Start RSU simulator: `python3 simulations/rsu_emulator.py` (listens on 17000) and OBU simulator: `python3 simulations/obu_simulator.py`.

For production: connect ESP32 LoRa RX to the Python gateway via serial or run the gateway directly on an SBC with an attached LoRa concentrator.
