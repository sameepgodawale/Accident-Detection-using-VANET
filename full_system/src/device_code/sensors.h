// src/device_code/sensors.h

#pragma once
#include "event.h"
#include <stdint.h>

void sensors_init(void);

/**
 * @brief Reads the latest accelerometer delta from the high-rate IMU (MPU6050).
 * @return The magnitude of the acceleration change in G's.
 */
float read_mpu6050_delta(void);

/**
 * @brief Collects all remaining, lower-priority sensor data into the payload.
 */
void read_all_sensors(event_payload_t *payload);

/**
 * @brief Logs the raw JSON payload to the SD card.
 */
void log_to_sd_card(const char *json_payload);
