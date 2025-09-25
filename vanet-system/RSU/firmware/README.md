# ESP32 Firmware for RSU (Overview)

This firmware is intended for ESP32 dev boards using the Arduino framework or PlatformIO.
It interfaces to the SX127x LoRa module via SPI and forwards decoded packets to the Python gateway via UDP or serial.

Build options:
- Arduino CLI / PlatformIO: use the provided src/ and platformio.ini (PlatformIO recommended)
- ESP-IDF: adapt code to ESP-IDF SPI and UART APIs

Features implemented in this package:
- SX127x initialization and packet RX
- Simple packet parser that emits JSON over UDP to 127.0.0.1:17000 (for local RSU emulator testing)
- LED indicators for RX and network status

Security: add HMAC signing of OBU packets verification if ATECC secure element is provided (not implemented in this reference).
