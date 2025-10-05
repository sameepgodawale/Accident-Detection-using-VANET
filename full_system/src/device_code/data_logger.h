// src/device_code/rsu_firmware/data_logger.h

#pragma once
#include <Arduino.h>

bool init_sd_card();
void log_incident(const char* json_payload);

/**
 * @brief Uploads logs stored on the SD card to the CMS API.
 * Uses the Store-and-Forward mechanism.
 * @return Number of incidents successfully uploaded and removed from log.
 */
int upload_pending_logs(const char* api_endpoint);
