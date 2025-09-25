# RSU (Cellular) Product Package — VANET Road-Side Unit (Production-ready)

Generated: 2025-09-25T14:34:34.122765Z

This package contains a production-focused Road-Side Unit (RSU) implementation that uses an ESP32 + LoRa radio to collect OBU messages and a SIM800L cellular modem for reliable HTTP uplink to the CMS.

Contents:
- firmware/: ESP32 (PlatformIO) code for LoRa receive, queue manager, SIM800L HTTP POST uplink with retry/backoff, SD card buffer support.
- hardware/: BOM, wiring/schematic text and power notes for SIM800L
- simulations/: OBU simulator & RSU emulator to test end-to-end without hardware
- docs/: step-by-step build, flash, test, deployment and provisioning docs

This package is intended for engineering teams to port to hardware and productionize. Read `docs/GETTING_STARTED.md` first.
