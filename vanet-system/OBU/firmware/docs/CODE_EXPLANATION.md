# OBU Firmware Code Explanation

## event_manager.c
Main loop. Reads IMU, GPS, CAN bus.
If crash detected → builds JSON event and sends via LoRa + logs to storage.

## imu.c
Handles two IMUs (MPU6050 and MPU9250).
- Acceleration fused by averaging
- Gyroscope fused by taking maximum
- Threshold check for crash detection
- Provides: acc_delta, gyro_delta, impact_time

## gps.c
Reads GPS position (lat/lon) from NEO-6M.
Adds geolocation to event payload.

## lora.c
Handles LoRa SX1278 SPI communication.
Transmits event JSON string.

## canbus.c
Reads data from MCP2515 CAN controller.
Provides wheel speeds and airbag signal.

## storage.c
Stub for FRAM/SD logging of events.

## json_builder.c
Formats event_payload_t into JSON string for transmission.
