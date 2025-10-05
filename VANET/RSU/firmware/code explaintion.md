# 📡 RSU Firmware: LoRa Event Gateway for Smart Transportation

This repository contains the full firmware (`main.ino`) for the Roadside Unit (RSU), designed as a resilient event gateway in a connected vehicle infrastructure. The RSU receives event data (e.g., crash reports) from On-Board Units (OBUs) via LoRa, performs local classification, securely persists data to MicroSD, and reliably uploads the enriched, signed payloads to a central Content Management System (CMS) via the SIM800L cellular module.

## ✨ Features

* **LoRa Receiver:** Dedicated thread for receiving event packets from OBUs.

* **Local Event Enrichment:** Uses a lightweight Decision Tree (`decision_tree_rules.h`) to classify events into severity levels (Critical, Major, Minor) locally on the RSU.

* **Resilient Storage:** Persists all enriched events to MicroSD card, ensuring data is never lost, even during connectivity outages.

* **Secure Upload:** Implements **HMAC-SHA256 signing** of the entire payload using a key loaded from `/provision.cfg` for authentication and integrity checking.

* **Asynchronous Uploader Task:** Runs on a separate core (using FreeRTOS) to manage connectivity, retries, and uploads without blocking the main LoRa receiver loop.

* **Prioritized Upload Queue:** Events are sorted before upload based on:

    1.  Severity (Critical first).

    2.  Retry Count (Older, less-retried events first).

* **Exponential Backoff & Retries:** Implements an exponential backoff strategy for failed uploads and marks files as "failed" after `MAX_RETRIES` are reached.

* **Immediate Critical Alert:** Critical events trigger an instant, high-priority upload attempt for low-latency notifications.

## 📐 Architecture and Data Flow

The system operates on an asynchronous producer-consumer model:

1.  **Produce (LoRa Loop - Core 0):** OBU event (JSON) received via LoRa $\rightarrow$ Local Classification $\rightarrow$ Enrichment (Timestamp, `rsu_severity`) $\rightarrow$ Atomic Write to `/events` on SD.

2.  **Consume (Uploader Task - Core 1):** Scans `/events` periodically $\rightarrow$ Sorts by Priority $\rightarrow$ Reads $\rightarrow$ HMAC-SHA256 Signing $\rightarrow$ HTTP POST via SIM800L $\rightarrow$ Success: Delete File / Failure: Rename with retry count (`.rN.json`) + Backoff.

## 🛠️ Hardware & Dependencies

### Required Hardware (Inferred)

* **Microcontroller:** ESP32 (Recommended, for dual-core FreeRTOS support).

* **LoRa Module:** SX127x series (with corresponding pin connections).

* **Cellular Module:** SIM800L or compatible (controlled via `HardwareSerial`).

* **Storage:** MicroSD Card breakout and shield.

### Software Dependencies (Libraries)

This firmware relies on the following Arduino libraries:

| Library | Purpose |
| :--- | :--- |
| `Arduino.h` | Core Arduino framework. |
| `SPI.h` | SPI bus communication for LoRa/SD. |
| `LoRa.h` | Handling LoRa reception and transmission. |
| `SdFat.h` | Robust and fast SD card file system management. |
| `HardwareSerial.h` | Serial communication for the SIM800L module. |
| `ArduinoJson.h` | Efficient JSON parsing and serialization for events. |
| `mbedtls/md.h` | Cryptographic functions (HMAC-SHA256). |
| `decision_tree_rules.h` | Custom header containing the `classifySeverity` logic. |

## ⚙️ Configuration

Configuration variables (pins, URLs, timeouts) are assumed to be defined in `config.h`.

| Variable | Description | Location |
| :--- | :--- | :--- |
| `CMS_URL` | The HTTP endpoint for the central CMS upload. | `config.h` |
| `SIM_APN` | The Access Point Name for GPRS connection. | `config.h` |
| `SD_CS` | Chip Select pin for the MicroSD module. | `config.h` |
| `LORA_FREQUENCY` | Operating frequency for the LoRa module (e.g., 915E6, 433E6). | `config.h` |
| `UPLOADER_INTERVAL_MS` | Delay between uploader task scans. | `config.h` |
| `MAX_RETRIES` | Maximum number of upload attempts before an event is moved to `/events/failed`. | `config.h` |
| `/provision.cfg` | File on SD card containing the secret API key/HMAC key (first line). | MicroSD Root |

## 🚀 Setup and Installation

### 1. File Structure

Ensure your Arduino project directory (`RSU_Firmware/`) contains the following files:
