#pragma once

#define RSU_ID "RSU-CELL-001"
#define CMS_URL "http://your-cms.example/backend/public/ingest.php"
#define SIM_APN "your.apn.here"
#define SIM_USER ""
#define SIM_PASS ""

// UART pins for SIM800L (use UART2)
#define SIM_TX_PIN 17
#define SIM_RX_PIN 16
#define SIM_PWKEY_PIN 4

// LoRa pins (adjust for your board)
#define LORA_NSS 5
#define LORA_RST 14
#define LORA_DIO0 26

