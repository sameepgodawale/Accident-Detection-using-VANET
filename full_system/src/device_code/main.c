// src/device_code/main.c

#include "main.h"
#include "event.h"
#include "json_builder.h"
#include "vanet_comm.h"
#include "sensors.h" // New header for sensor interfaces
#include "can_interface.h" // New header for CAN bus logic

#define DEVICE_ID "OBU-STM-1001"
#define CRASH_G_THRESHOLD 15.0f // Threshold for critical G-force

void main_loop(void) {
    event_payload_t event;
    sensors_init();
    can_init();
    
    strcpy(event.device_id, DEVICE_ID);

    while (1) {
        // 1. Polling: Read high-priority sensors (MPU-6050)
        float current_acc_delta = read_mpu6050_delta(); 

        // 2. Core Crash Detection
        if (current_acc_delta > CRASH_G_THRESHOLD) {
            
            // Log timestamp before any delays
            long event_timestamp = get_current_timestamp();
            
            // 3. Collect all secondary data
            read_all_sensors(&event);
            read_can_bus_data(&event); // Update speed and airbag status
            
            // 4. Finalize payload
            event.acc_delta = current_acc_delta;
            // The CMS Backend will use the speed drop, airbag, and acc_delta to calculate final severity.
            
            // 5. Build and Transmit
            char json_buffer[512];
            build_event_json(&event, json_buffer, 512);
            
            // 6. Broadcast via LoRa
            int status = transmit_payload_to_cms(json_buffer);
            
            // 7. Log to SD card regardless of transmission success
            log_to_sd_card(json_buffer);

            // Debounce/Cool-down period after crash detection
            HAL_Delay(5000); 
        }

        // 8. Low-priority housekeeping
        check_manual_override_button();
        HAL_Delay(100); 
    }
}
