# RSU (SIM800L) — Getting Started

Prerequisites
- PlatformIO (recommended) or Arduino CLI / ESP-IDF
- ESP32 WROOM dev board, SX127x LoRa module wired (SPI), SIM800L module wired to UART and powered with proper regulator
- microSD (optional) for buffering
- USB serial (for logs) and FTDI for flashing (or use built-in USB)

Quick demo flow (without hardware):
1. Use simulation tools in `simulations/` to exercise your CMS and test message formats.
2. To test firmware logic without SIM800L, see `firmware/tests/` which contains host-mode tests for the queue manager and packet parsing.

Building & flashing
1. Install PlatformIO: https://platformio.org
2. Open `firmware/` in VSCode with PlatformIO or run:
   ```bash
   cd firmware
   pio run -e esp32dev -t upload
   ```
3. Open Serial Monitor to view logs:
   ```bash
   pio device monitor -b 115200
   ```

Config
- Edit `firmware/src/config.h` to set APN, CMS URL, RSU_ID, and serial pins for SIM800L.

Operational summary
- The device receives LoRa packets and enqueues events on SD card or SPIFFS.
- The uplink task attempts to POST events to the CMS via SIM800L using AT HTTP commands.
- Failed sends are retried with exponential backoff; events are persisted until acked.
