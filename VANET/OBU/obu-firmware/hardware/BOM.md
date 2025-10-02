# Bill of Materials (BOM) - OBU (Prototype -> Production)

Reference: Hardware List for OBU Nodes (user-uploaded). fileciteturn3file0

1) MCU & Core
- STM32F405RG (MCU, ARM Cortex-M4) - 1
  * Reason: high performance for DSP/ML, abundant RAM/Flash, wide vendor support (ST HAL/CMSIS).

2) IMU
- ICM-20948 or MPU-9250 (9-DOF IMU) - 1
- MPU-6050 (redundant) - 1
  * Reason: 9-axis sensor provides accel+gyro+mag; redundancy reduces false positives.

3) GPS
- u-blox NEO-M8N module (with active antenna) - 1
  * High sensitivity and PPS support for accurate timestamps.

4) LoRa
- Semtech SX1276/78 or SX1262 module (region freq) - 1
  * Long-range, low-power, suitable for VANET broadcasting.

5) CAN interface
- MCP2515 CAN controller + TJA1050 transceiver - 1
  * For vehicle diagnostics, listen-only mode.

6) Storage
- FRAM MB85RC256 (I2C) - 1
- microSD slot (optional) - 1
  * FRAM for fast circular buffer; microSD for long logs.

7) Power
- Automotive buck converter 12V->5V
- LDO 5V->3.3V
- TVS diodes and resettable fuses
- Supercap (optional) for emergency transmit after crash

8) UI
- LEDs, Buzzer, SOS push button

9) Misc
- Antennas (GPS, LoRa), enclosure, connectors, mounting

Estimated prototype cost (per unit, no enclosure): ~₹5,800 – ₹7,000 (depending on GSM optionality). See original hardware list for cost breakdown. fileciteturn3file0
