# Firmware Code Explanation

This file explains key modules, data flows and important functions.

Modules:
- drivers/imu_sim.c: Host-mode IMU sample generator. In production replace with I2C/SPI read and ISR.
- drivers/gps_sim.c: Host-mode GPS. Replace with UART + NMEA/UBX parsing.
- drivers/lora_sim.c: In simulation it sends UDP to RSU emulator. In production replace with SX127x SPI driver.
- drivers/storage.c: Simulated FRAM using file system. Replace with I2C FRAM driver.
- core/event_manager.c: Event detection and transmit loop. Central FSM.

Event lifecycle:
1. IMU produces sample -> event_manager checks thresholds
2. On event, create event_meta_t and persist using storage_append_event
3. Comms: lora_send is used to send compact packet. Retries tracked in metadata.
4. RSU provides ACK -> storage_mark_acked clears stored meta and payload.

Security:
- Messages should be HMAC-signed using device key stored in secure element (ATECC608A). This is left as extension.

OTA:
- OTA mechanism is outlined in docs but not implemented in this skeleton. Use signed firmware images and dual-bank update.
