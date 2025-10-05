// src/device_code/vanet_comm.h

#pragma once
#include <stddef.h>

/**
 * @brief Sends the JSON incident report to the Central Monitoring Server (CMS).
 * * In a real VANET implementation, this would involve DSRC/C-V2X transmission 
 * to an RSU, which then forwards the data via a standard internet connection 
 * (HTTP POST) to the Node.js API endpoint: /api/v1/incidents/report.
 * * @param json_payload The JSON string containing the accident telemetry.
 * @return 0 on success, non-zero on error.
 */
int transmit_payload_to_cms(const char *json_payload);
