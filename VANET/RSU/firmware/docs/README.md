RSU with ML Integration (ESP32)

- Receives OBU events via LoRa
- Classifies severity locally (Minor/Major/Critical)
- Publishes enriched event JSON to MQTT via SIM800L
- Sends ACK with severity back to OBUs
- For Critical events: also publishes to alerts topic and sends SMS

Build:
- Open in PlatformIO, board = esp32dev
- Ensure SIM800L firmware supports AT+CMQTT commands
- Adjust pins in sim800_mqtt.h, lora_handler.cpp, storage_handler.cpp