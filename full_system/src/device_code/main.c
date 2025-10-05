// src/device_code/main.c

#include "main.h"
#include "event.h"
#include "json_builder.h"
#include "vanet_comm.h"
#include "sensors.h" 
#include "can_interface.h" 
#include <string.h>

#define DEVICE_ID "OBU-STM-1001"
#define CRASH_G_THRESHOLD 15.0f // Threshold for critical G-force
#define BEACON_INTERVAL_MS 1000 // Send CAM every 1 second

// --- Function Prototypes (assumed elsewhere) ---
extern long HAL_GetTick(void);
extern void HAL_Delay(uint32_t Delay);

void main_loop(void) {
    event_payload_t event;
    sensors_init();
    can_init();
    
    strcpy(event.device_id, DEVICE_ID);
    long last_beacon_time = 0;

    while (1) {
        
        // --- 1. Periodic Beacon Broadcast (CAM) ---
        if (HAL_GetTick() - last_beacon_time >= BEACON_INTERVAL_MS) {
            beacon_payload_t beacon;
            strcpy(beacon.device_id, DEVICE_ID);
            read_gps_and_speed(&beacon); 
            broadcast_beacon(&beacon);
            last_beacon_time = HAL_GetTick();
        }
        
        // --- 2. Crash Detection Logic (EAM) ---
        float current_acc_delta = read_mpu6050_delta(); 
        
        if (current_acc_delta > CRASH_G_THRESHOLD) {
            
            // Full data acquisition (locks the loop briefly)
            read_all_sensors(&event);
            read_can_bus_data(&event); 
            
            // Finalize payload
            event.acc_delta = current_acc_delta;
            
            // Build and Transmit
            char json_buffer[512];
            build_event_json(&event, json_buffer, 512);
            
            transmit_emergency_alert(json_buffer); // Broadcast EAM
            
            // Log to SD card regardless of transmission success
            log_to_sd_card(json_buffer);

            // Debounce/Cool-down period after crash detection
            HAL_Delay(5000); 
        }

        // Low-priority housekeeping
        check_manual_override_button();
        HAL_Delay(100); 
    }
}
