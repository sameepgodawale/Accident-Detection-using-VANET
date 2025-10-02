# On-Board Unit (OBU) Firmware

This firmware runs on STM32F411CEU6 (BlackPill).
It detects accidents using dual IMUs, GPS, CAN bus, and transmits alerts via LoRa.

## Features
- Dual IMU (MPU6050 + MPU9250) fusion for reliable crash detection
- GPS (NEO-6M) location tagging
- CAN bus (MCP2515) vehicle signals (airbag, wheel speed)
- LoRa SX1278 wireless transmission
- JSON-formatted payloads
- Optional event storage (FRAM/SD)

## Build
