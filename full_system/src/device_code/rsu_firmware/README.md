# VANET-Link 5000 RSU Firmware

This directory contains the product-ready C++ firmware for the Roadside Unit (RSU) Gateway, built on the ESP32 Dev Board. The RSU is responsible for aggregating incident reports from nearby OBUs (via LoRa) and uploading them to the Central Monitoring System (CMS) via GSM.

## 1. Hardware Required

| Component | MCU Pinout | Notes |
| :--- | :--- | :--- |
| **ESP32 Dev Board** | Core | Primary Microcontroller. |
| **SX1278 LoRa Module** | Dedicated SPI Pins | Primary V2X receiver. |
| **SIM800L GSM Module** | UART2 (GPIO 16/17) | Requires an external 4V power supply. |
| **SD Card Module** | Shared SPI + GPIO 2 (CS) | Used for Store-and-Forward logging. |

## 2. Setup and Installation

### 2.1. Wiring & Power
**CRITICAL:** The SIM800L module requires a constant 4V and high burst current (~2A). **DO NOT POWER THE SIM800L DIRECTLY FROM THE ESP32'S 3.3V PIN.** Use a dedicated, regulated 4V power supply and share the ground (GND) with the ESP32.

### 2.2. Software Prerequisites
1.  **Arduino IDE** or **VS Code with PlatformIO**.
2.  **ESP32 Board Support Package** installed.
3.  Libraries required:
    * `TinyGPSPlus` (for GPS data parsing, even if RSU location is fixed)
    * `RadioLib` (for SX1278 LoRa control)
    * `TinyGsmClient` (for SIM800L communication)
    * `SD` (for SD Card access)

### 2.3. Configuration
1.  In `rsu_main.ino`, set the correct CMS API endpoint:
    ```cpp
    const char* API_ENDPOINT = "http://[YOUR_CMS_API_IP]:5000/api/v1/incidents/report";
    ```
2.  Configure SIM card details (APN, User, Password) within `gsm_transmitter.h`.

## 3. Firmware Logic (Flow)

The RSU operates on a **Store-and-Forward** principle to guarantee message delivery:

| Step | Action | Technology Used | Reliability Feature |
| :--- | :--- | :--- | :--- |
| **1. Listen** | RSU monitors the LoRa frequency for V2X broadcasts. | LoRa (SX1278) | N/A |
| **2. Receive** | An OBU sends a JSON incident report. | LoRa | N/A |
| **3. Log** | RSU immediately writes the raw JSON message to the **SD Card log file**. | SD Card Module | **Guaranteed Data Integrity:** Prevents data loss if GSM is down. |
| **4. Check Uplink** | Every 30 seconds, RSU checks GSM connectivity. | SIM800L | **Connectivity Management:** Reconnects if necessary. |
| **5. Transmit** | RSU reads the **oldest log file** from the SD card. | SIM800L/HTTP POST | **FIFO Prioritization:** Ensures older, critical alerts are sent first. |
| **6. Confirm** | Only upon receiving a successful HTTP `201 Created` response from the CMS API. | CMS API | **Message Acknowledgement:** Guarantees delivery before deletion. |
| **7. Delete** | The RSU deletes the successfully transmitted log file entry. | SD Card Module | Frees up storage for new, incoming incidents. |
