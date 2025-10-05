// src/device_code/rsu_firmware/rsu_main.ino

#include "lora_receiver.h"
#include "gsm_transmitter.h"
#include "data_logger.h"

// --- Global Constants ---
const char* API_ENDPOINT = "http://YOUR_NODEJS_IP:5000/api/v1/incidents/report";

// --- State Variables ---
unsigned long last_upload_attempt = 0;
const unsigned long UPLOAD_INTERVAL = 30000; // Attempt upload every 30 seconds

void setup() {
    Serial.begin(115200);
    Serial.println("--- VANET-Link 5000 RSU Initializing ---");

    // Initialize subsystems
    if (!init_lora()) {
        Serial.println("FATAL: LoRa initialization failed.");
        while(1);
    }
    Serial.println("LoRa Receiver Active.");

    if (!init_gsm()) {
        Serial.println("WARN: GSM initialization failed. Operating in data logging mode.");
    }
    
    if (!init_sd_card()) {
        Serial.println("FATAL: SD Card failed. No logging available.");
        while(1);
    }
    Serial.println("SD Card Logger Active.");
}

void loop() {
    // 1. LoRa Receive: Check for new incident messages from OBUs
    String message = check_lora_message();
    if (message.length() > 0) {
        Serial.print("INCIDENT RX: ");
        Serial.println(message);
        
        // Log incident immediately to SD card for redundancy
        log_incident(message.c_str()); 
    }

    // 2. GSM Transmit: Attempt to upload pending logs
    if (millis() - last_upload_attempt > UPLOAD_INTERVAL) {
        last_upload_attempt = millis();
        
        if (is_gsm_connected()) {
            Serial.println("Attempting queued log upload...");
            
            // This function handles reading the oldest log and POSTing it.
            int uploaded_count = upload_pending_logs(API_ENDPOINT); 

            if (uploaded_count > 0) {
                Serial.printf("Successfully uploaded %d pending incidents.\n", uploaded_count);
            } else {
                Serial.println("No pending logs or upload failed.");
            }
        } else {
            // Attempt a reconnect if not connected
            reconnect_gsm(); 
        }
    }
}
