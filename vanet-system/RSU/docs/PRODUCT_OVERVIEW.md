# RSU Product Overview (Cellular)

Goal: A stand-alone RSU that needs no wired backhaul and uses SIM800L GPRS for uplink.

Design decisions:
- ESP32 chosen for cost, dual UART, SPI and ease of development.
- SIM800L chosen for universal GSM/GPRS fallback in areas without wired backhaul.
- LoRa (SX127x) used for reliable low-power OBU -> RSU comms.
- microSD used for persistence to withstand outages.

Security & provisioning:
- Each RSU has unique RSU_ID and API key provisioned via `config.h` during manufacturing or via a provisioning tool.
- HMAC signing of OBU payloads is recommended (ATECC secure element) — not implemented in this reference but documented.
