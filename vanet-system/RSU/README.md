# Road-Side Unit (RSU) — ESP32 + SX1278 + SIM800L + microSD

This repository contains the complete design and firmware for the **Road-Side Unit (RSU)** of the VANET accident detection and emergency response system.  

The RSU acts as the **bridge between OBUs (On-Board Units)** and the **Central Monitoring System (CMS)**.  
It receives accident/event data from OBUs over LoRa, stores events temporarily on a microSD card, and forwards them to the CMS over the cellular network using a SIM800L module.

---

## 🚦 System Role
- Listens for accident alerts from nearby OBUs via **LoRa SX1278**.
- Buffers incoming messages on **microSD** (for reliability if network is unavailable).
- Uploads messages to **CMS backend** over GSM/GPRS via **SIM800L**.
- Adds **HMAC-SHA256 signatures** to events for authentication.
- Supports **retry, prioritization (based on severity), and exponential backoff**.
- Provides a simple **OTA update hook** using files placed on SD.

---

## 🧩 Hardware Used
- **ESP32 Dev Board** (ESP32-WROOM / DevKitC)
- **LoRa SX1278 Module** + antenna
- **SIM800L GSM Module** + GSM antenna
- **microSD Card Module** (SPI-based)
- **4.0V regulator (≥2A)** for SIM800L
- **1000 µF capacitor** across SIM800L power lines

Detailed wiring is in [`hardware/wiring_diagram.txt`](hardware/wiring_diagram.txt).

---

## ⚙️ Firmware
- Framework: **Arduino on ESP32 (PlatformIO)**
- LoRa communication: `sandeepmistry/arduino-LoRa`
- SD card: `greiman/SdFat`
- HMAC signing: ESP32 **mbedTLS**
- Cellular communication: SIM800L AT commands

Source lives in [`firmware/src`](firmware/src/).

---

## 📋 Features
- **LoRa Receiver**: Collects OBU messages (JSON format).
- **Event Persistence**: Events stored under `/events/` on SD as JSON files.
- **Uploader Task**:
  - Reads events from SD.
  - Signs with HMAC key (from `provision.cfg` on SD or fallback in `config.h`).
  - Uploads to CMS with `HTTP POST` using SIM800L.
  - Retries failed uploads with **exponential backoff**.
  - Prioritizes high-severity events.
- **OTA Hook**: Place `ota.bin` on SD to trigger firmware update placeholder.

---

## 🚀 Getting Started
1. Clone this repo and open `firmware/` in [PlatformIO](https://platformio.org/).
2. Edit [`firmware/src/config.h`](firmware/src/config.h) to set:
   - `CMS_URL` → CMS endpoint
   - `SIM_APN` → your GSM provider APN
   - API key fallback
3. (Optional) Create `provision/provision.cfg` with your API key and copy to SD root.
4. Format SD card to FAT32, insert into RSU.
5. Insert SIM card (no PIN lock) into SIM800L.
6. Connect antennas (LoRa + GSM, keep separated ~10 cm).
7. Flash firmware:
   ```bash
   pio run -e esp32dev -t upload
   pio device monitor -b 115200
