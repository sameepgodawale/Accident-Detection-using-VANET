# RSU Product Package — VANET Road-Side Unit (Production-ready)

Generated: 2025-09-25T14:06:45.509927Z

This package contains a complete, product-focused Road-Side Unit (RSU) repository designed to be built, manufactured, and deployed off-the-shelf. It includes:

- Firmware for ESP32 (Arduino-style C) to interface with LoRa SX127x and SIM800L (GSM) for optional backhaul
- RSU gateway software (Python) to decode OBU packets and forward to CMS with reliable queueing
- Hardware Bill of Materials (BOM) and rationale, based on the provided Gateway Hardware List. fileciteturn4file0
- Text schematics and wiring diagrams
- Detailed README files, code explanations, and the RSU data flow
- VANET simulation tools (OBU simulator + RSU emulator) to test end-to-end flows

Folders:
- firmware/       -> ESP32 firmware (Arduino/C) and build instructions
- software/       -> Python gateway (decoder, forwarder, queue)
- hardware/       -> BOM, schematics, power notes
- simulations/    -> rsu_emulator.py, obu_simulator.py for testing
- docs/           -> detailed manuals, flow diagrams, QA and deployment

Read `docs/GETTING_STARTED.md` inside this package for step-by-step instructions.
