# RSU Hardware Notes — ESP32 + SX1278 + SIM800L + microSD

This document describes the hardware design, wiring, and considerations for the Road-Side Unit (RSU).

---

## 🧩 Components
- **ESP32 Dev Board** (ESP32-WROOM or ESP32-DevKitC)
- **SX1278 LoRa Module** + 433 MHz antenna
- **SIM800L GSM/GPRS Module** + GSM antenna
- **microSD Card Module** (SPI)
- **Power Regulation**
  - SIM800L requires **4.0V regulated supply**, capable of **2A bursts**
  - ESP32 and peripherals powered from 5V/USB or 3.3V LDO
  - Use large decoupling capacitors (≥1000 µF) near SIM800L
- Antennas must be **physically separated by ~10 cm** (LoRa ↔ GSM) to reduce interference.

---

## ⚡ Power Supply Considerations
- **SIM800L is sensitive** to power dips → always use a dedicated DC-DC buck regulator set to 4.0V, capable of at least 2A peak.
- Place a **1000 µF electrolytic capacitor** and a **100 nF ceramic capacitor** across VCC and GND near the SIM800L module.
- ESP32 can be powered via USB (5V) or a 3.3V LDO.
- Ensure common ground between all modules.

---

## 📡 Antenna Placement
- LoRa SX1278 antenna and SIM800L antenna should be kept **at least 10 cm apart**.
- Both should be placed outside of metal enclosures for optimal signal strength.

---

## 📋 Wiring Overview
- **ESP32 ↔ LoRa (SX1278)** (SPI bus)
- **ESP32 ↔ microSD** (SPI bus, shared with LoRa)
- **ESP32 ↔ SIM800L** (UART2, 115200 baud)
- **Shared SPI**: LoRa and SD each have their own CS pin.

Detailed pin mapping is given in `wiring_diagram.txt`.

---

## ✅ Assembly Notes
- Keep wiring short to minimize noise.
- Use shielded wires for GSM power if long.
- Mount ESP32 on a baseboard with headers to secure connections.
- Ensure SD card is FAT32 formatted before use.

