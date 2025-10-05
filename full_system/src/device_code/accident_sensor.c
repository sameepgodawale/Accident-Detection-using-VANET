// src/device_code/accident_sensor.c

#include "event.h"
#include "json_builder.h"
#include "vanet_comm.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define JSON_BUF_SIZE 512

// Global buffer to hold the generated JSON payload
static char json_payload_buffer[JSON_BUF_SIZE];

/**
 * @brief Simulates reading raw sensor data and detecting an accident.
 * @return 1 if an accident is detected, 0 otherwise.
 */
int read_and_detect_accident(event_payload_t *payload) {
    // --- SIMULATE SENSOR READINGS ---
    // In a real device, this would read from MPU-6050, GPS, etc.
    
    // Default low values
    payload->acc_delta = (float)(rand() % 100) / 10.0f; // 0.1 to 10.0 g
    payload->gyro_delta = (float)(rand() % 100) / 5.0f;
    payload->impact_time = 0.0f;
    payload->airbag_deployed = 0;
    
    // Simulate vehicle ID and speed
    strcpy(payload->device_id, "OBU-4045");
    payload->wheel_speed_before = 60.0f; // km/h
    payload->wheel_speed_after = 60.0f;
    payload->wheel_speed_drop_pct = 0.0f;

    // Simulate GPS
    payload->lat = 34.053f + ((float)rand() / RAND_MAX * 0.01f);
    payload->lon = -118.243f + ((float)rand() / RAND_MAX * 0.01f);
    payload->has_gps = 1;

    // --- ACCIDENT DETECTION LOGIC ---
    if (payload->acc_delta > 15.0f || (payload->wheel_speed_before > 20.0f && payload->wheel_speed_drop_pct > 70.0f)) {
        // High-G force detected or major speed drop 
        
        // Finalize accident data
        payload->acc_delta = 18.5f;
        payload->wheel_speed_after = 5.0f;
        payload->wheel_speed_drop_pct = 91.6f;
        payload->impact_time = 0.15f;
        payload->airbag_deployed = (rand() % 2 == 0) ? 1 : 0; // Randomly deployed

        printf("ACCIDENT DETECTED! Device: %s\n", payload->device_id);
        return 1; // Accident occurred
    }

    return 0; // No accident
}


/**
 * @brief Main loop to check for accidents and report to CMS.
 */
void event_manager_loop(void) {
    event_payload_t current_event;
    
    // Seed random number generator for simulation purposes
    srand(time(NULL)); 

    if (read_and_detect_accident(&current_event)) {
        printf("Building JSON payload...\n");
        
        // 1. Build the JSON string from the payload struct
        build_event_json(&current_event, json_payload_buffer, JSON_BUF_SIZE);
        
        printf("Payload ready: %s\n", json_payload_buffer);
        
        // 2. Transmit the JSON payload over VANET/V2I
        transmit_payload_to_cms(json_payload_buffer);
    }
}
