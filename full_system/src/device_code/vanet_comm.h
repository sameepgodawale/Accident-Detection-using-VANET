#pragma once
#include <stddef.h>
#include "event.h"

// Structure for the periodic status broadcast (CAM)
typedef struct {
    char device_id[16];
    float lat;
    float lon;
    float speed;
    int system_status; // 0=OK, 1=WARN (e.g., low oil)
} beacon_payload_t;


/**
 * @brief Sends the JSON incident report (EAM) to the CMS.
 */
int transmit_emergency_alert(const char *json_payload);

/**
 * @brief Broadcasts the periodic vehicle status beacon (CAM) via LoRa.
 */
int broadcast_beacon(beacon_payload_t *beacon);

/**
 * @brief Placeholder to read current GPS and Speed for the beacon.
 */
void read_gps_and_speed(beacon_payload_t *beacon);
