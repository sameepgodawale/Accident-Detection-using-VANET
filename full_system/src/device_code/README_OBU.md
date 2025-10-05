# VANET-Detect 1000 OBU (On-Board Unit)

The OBU is the primary detection unit. It uses a fusion of redundant sensors and vehicle data (via CAN bus) to reliably detect accidents and broadcast alerts over the LoRa V2X network.

## 1. Core Detection Strategy

The system uses a **redundancy and confidence-based approach**:

1.  **Primary Trigger:** High-frequency monitoring of the MPU-6050 for G-force spikes (`acc_delta`).
2.  **Confirmation/Enrichment:** On trigger, the system queries the MPU-9250 (roll/yaw), GPS (speed/location), and CAN bus (airbag status).
3.  **Severity Calculation:** The final `event_payload_t` is sent to the CMS, where the Node.js backend calculates the `severity` based on the weight of indicators (Airbag deployed > Extreme G-force > High speed drop).

## 2. Pinout and Schematics Overview

| Component | STM32 Bus | Purpose |
| :--- | :--- | :--- |
| **STM32F411CEU6** | Core | High-speed processing of sensor data. |
| **MPU-9250** | I2C1 | Primary (9-DOF) sensor for orientation and redundancy. |
| **MPU-6050** | I2C2 | Dedicated high-frequency crash detection polling. |
| **NEO-6M GPS** | UART1 | Location and speed data. |
| **MCP2515 CAN** | SPI1 | Official Airbag/Speed data from vehicle network. |
| **LoRa SX1278** | SPI2 | Emergency V2X broadcast. |
| **SD Module** | SPI1 (Shared) | Non-volatile local event logging. |

## 3. Deployment Guide

1.  **Toolchain:** Use **PlatformIO** or **STM32CubeIDE** for building and flashing the firmware.
2.  **Configuration:** Update the `DEVICE_ID` and the LoRa frequency settings in `main.c` and `vanet_comm.h`.
3.  **CAN Integration:** Before deployment, ensure the CAN bus driver is configured for the specific baud rate and message IDs used by the target vehicle's ECU to read speed and airbag status.
4.  **Testing:** Perform drop tests and simulated crash inputs to calibrate the `CRASH_G_THRESHOLD` in `main.c` for your specific mounting location within the vehicle.
