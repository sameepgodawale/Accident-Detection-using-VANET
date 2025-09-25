# Firmware Overview

Firmware is organized for portability to STM32 HAL or CubeMX projects. A reference Makefile is provided for arm-none-eabi GCC. Key modules:
- drivers/: imu.c, gps.c, lora.c, canbus.c, power.c, storage.c
- core/: event_manager.c, comms.c, security.c, ota.c
- include/: header files
- tests/: host-mode unit tests

Event flow:
1. IMU samples via interrupt/DMA
2. Event detection engine evaluates thresholds + ROR
3. On trigger, event metadata persisted to FRAM (storage module)
4. Event queued for VANET broadcast (comms module)
5. Transmit engine sends via LoRa and participates in multi-hop relay
6. On ACK from RSU, event marked ACKED and payload removed

See individual modules for APIs and usage.
