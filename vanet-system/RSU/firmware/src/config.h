#pragma once

#define CMS_URL "http://your-cms.example:8080/ingest"
#define SIM_APN "your.apn.here"
#define SIM_USER ""
#define SIM_PASS ""

#define LORA_SCK 18
#define LORA_MISO 19
#define LORA_MOSI 23
#define LORA_NSS 5
#define LORA_RST 14
#define LORA_DIO0 26
#define LORA_FREQUENCY 433E6

#define SD_CS 15
#define SIM_RX_PIN 16
#define SIM_TX_PIN 17
#define SIM_PWRKEY_PIN 4

#define UPLOADER_INTERVAL_MS 10000
#define MAX_RETRIES 5

// Fallback API key (use SD provisioning to override)
#define API_KEY_FALLBACK "changeme_default_api_key"
